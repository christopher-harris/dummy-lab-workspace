import { computed, inject, Signal } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  NavigationEnd,
  ParamMap,
  Params,
  PRIMARY_OUTLET,
  Router,
} from '@angular/router';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  distinctUntilChanged,
  filter,
  map,
  startWith,
  Subscription,
} from 'rxjs';

/**
 * Dynamic route parameters merged from the active Angular router snapshot tree.
 *
 * Angular route params are strings by default, but the router uses the broader
 * `Params` shape, so this type preserves Angular's native value contract.
 */
export type RouterContextParams = Readonly<Params>;

/**
 * The router state this feature mirrors into the store.
 */
interface RouterContext {
  routeParams: RouterContextParams;
  routeQueryParams: RouterContextParams;
}

/**
 * Public API added to a SignalStore by `withRouterContext`.
 */
export interface RouterContextFeatureResult {
  state: {
    /**
     * Dynamic route params from every active route segment on the primary
     * outlet.
     *
     * Params are merged from parent to child route snapshots. When the same
     * param name appears at multiple levels, the child route value wins — so
     * prefer qualified names (`productId`) over bare `id` to avoid silent
     * collisions between levels.
     */
    routeParams: RouterContextParams;
    /**
     * Query params for the current URL. These are global to the URL rather
     * than per-segment, so there is nothing to merge.
     */
    routeQueryParams: RouterContextParams;
  };
  props: {
    /**
     * Angular `ParamMap` view over `routeParams`, useful for `get` and `getAll`.
     */
    routeParamMap: Signal<ParamMap>;
    /**
     * Angular `ParamMap` view over `routeQueryParams`.
     */
    routeQueryParamMap: Signal<ParamMap>;
  };
  methods: {
    /**
     * Reads one route param from the current `routeParamMap`.
     *
     * @param paramName Dynamic route parameter name.
     * @returns The current param value, or `null` when it is absent.
     */
    routeParam(paramName: string): string | null;
    /**
     * Reads one query param from the current `routeQueryParamMap`.
     *
     * @param paramName Query parameter name.
     * @returns The current param value, or `null` when it is absent.
     */
    routeQueryParam(paramName: string): string | null;
  };
}

/**
 * Adds Angular router context to a SignalStore.
 *
 * The feature stores the active primary-outlet route params in `routeParams`
 * and the current query params in `routeQueryParams`, refreshes both after each
 * successful navigation, and exposes derived `ParamMap` signals plus
 * `routeParam(name)` / `routeQueryParam(name)` convenience readers.
 *
 * Because both are store state, they are visible to state tooling such as the
 * SignalStore devtools integration. The `ParamMap` signals and the reader
 * methods are derived and are not devtools state entries.
 *
 * Note that the contract between a store and its route is an untyped string:
 * rename the route segment and the store goes quietly idle with no compile
 * error. Prefer exporting a shared param-name constant and using it in both the
 * route definition and the store.
 *
 * @example
 * ```ts
 * export const ProductsStore = signalStore(
 *   { providedIn: 'root' },
 *   withRouterContext(),
 *   withComputed(({ routeParamMap }) => ({
 *     productId: computed(() => {
 *       // `Number(null)` is 0, so guard the absent case explicitly rather
 *       // than letting a missing param resolve to a real-looking id.
 *       const raw = routeParamMap().get('productId');
 *       const id = raw === null ? Number.NaN : Number(raw);
 *       return Number.isInteger(id) ? id : undefined;
 *     }),
 *   })),
 * );
 * ```
 */
export function withRouterContext<
  Input extends SignalStoreFeatureResult,
>(): SignalStoreFeature<Input, RouterContextFeatureResult> {
  return signalStoreFeature(
    withState(() => readRouterContext(inject(Router))),
    withProps(() => ({
      _router: inject(Router),
    })),
    withComputed(({ routeParams, routeQueryParams }) => ({
      routeParamMap: computed(() => convertToParamMap(routeParams())),
      routeQueryParamMap: computed(() => convertToParamMap(routeQueryParams())),
    })),
    withHooks((store) => {
      let routerContextSubscription: Subscription | undefined;
      const routerContext$ = store._router.events.pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        startWith(null),
        map(() => readRouterContext(store._router)),
        distinctUntilChanged(areRouterContextsEqual),
      );

      return {
        onInit(): void {
          routerContextSubscription = routerContext$.subscribe(
            (routerContext) => {
              patchState(store, routerContext);
            },
          );
        },
        onDestroy(): void {
          routerContextSubscription?.unsubscribe();
        },
      };
    }),
    withMethods(({ routeParamMap, routeQueryParamMap }) => ({
      routeParam(paramName: string): string | null {
        return routeParamMap().get(paramName);
      },
      routeQueryParam(paramName: string): string | null {
        return routeQueryParamMap().get(paramName);
      },
    })),
  );
}

function readRouterContext(router: Router): RouterContext {
  const root = router.routerState.snapshot.root;

  return {
    routeParams: collectRouteParams(root),
    routeQueryParams: { ...root.queryParams },
  };
}

/**
 * Walks the primary outlet from the root snapshot down, merging params as it
 * goes. Sibling (named/auxiliary) outlets are deliberately skipped: merging
 * them would make the result depend on `children` ordering.
 */
function collectRouteParams(root: ActivatedRouteSnapshot): RouterContextParams {
  let params: Params = {};

  for (
    let route: ActivatedRouteSnapshot | undefined = root;
    route !== undefined;
    route = primaryChildOf(route)
  ) {
    params = { ...params, ...route.params };
  }

  return params;
}

function primaryChildOf(
  route: ActivatedRouteSnapshot,
): ActivatedRouteSnapshot | undefined {
  return route.children.find((child) => child.outlet === PRIMARY_OUTLET);
}

function areRouterContextsEqual(
  previous: RouterContext,
  next: RouterContext,
): boolean {
  return (
    areParamsEqual(previous.routeParams, next.routeParams) &&
    areParamsEqual(previous.routeQueryParams, next.routeQueryParams)
  );
}

function areParamsEqual(
  previousParams: RouterContextParams,
  nextParams: RouterContextParams,
): boolean {
  const previousKeys = Object.keys(previousParams);
  const nextKeys = Object.keys(nextParams);

  return (
    previousKeys.length === nextKeys.length &&
    previousKeys.every((key) => previousParams[key] === nextParams[key])
  );
}
