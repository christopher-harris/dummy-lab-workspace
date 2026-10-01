import { DestroyRef, inject } from '@angular/core';
import { withDevtools } from '@ngrx-toolkit/core';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  Events,
  injectDispatch,
  withEventHandlers,
} from '@ngrx/signals/events';
import { tap } from 'rxjs';

import { locationEvents } from './actions';
import { DEFAULT_POSITION_OPTIONS, POSITION_ERROR } from './config';
import type {
  LocationFailure,
  LocationFix,
  LocationPermission,
  LocationStatus,
} from './models';
import { GEOLOCATION, PERMISSIONS } from './platform';

/**
 * State held by the location store.
 *
 * The first three are independent axes - capability, authorization,
 * activity. A supported browser with a denied permission sitting at `idle`
 * is a perfectly ordinary combination, and each field has to be readable
 * without reference to the others.
 */
interface LocationState {
  /**
   * Whether there is a `Geolocation` API to talk to at all.
   *
   * Fixed at construction and never changes: a browser does not grow the API
   * mid-session. `false` is a dead end, so never offer a retry against it.
   */
  supported: boolean;
  /** Whether this origin is allowed to read the user's position. */
  permission: LocationPermission;
  /** What we have asked the platform for, and what came back. */
  status: LocationStatus;
  /** The most recent fix, or `null` if we have never had one. */
  position: LocationFix | null;
  /** Why the most recent request failed, or `null` if it did not. */
  failure: LocationFailure | null;
}

/** Flatten the platform's position into our own serialisable shape. */
const toFix = ({ coords, timestamp }: GeolocationPosition): LocationFix => ({
  latitude: coords.latitude,
  longitude: coords.longitude,
  accuracy: coords.accuracy,
  timestamp,
});

/** Narrow the platform's three error codes to the three things a UI can do. */
const toFailure = ({ code }: GeolocationPositionError): LocationFailure => {
  switch (code) {
    case POSITION_ERROR.PERMISSION_DENIED:
      return 'denied';
    case POSITION_ERROR.TIMEOUT:
      return 'timeout';
    // `POSITION_UNAVAILABLE`, and anything the platform invents later: we
    // could not get a fix and cannot say why.
    default:
      return 'unavailable';
  }
};

/** Whether a request is already outstanding. */
const isPending = (status: LocationStatus) =>
  status === 'prompting' || status === 'locating';

/**
 * Owns the app's knowledge of where the user is.
 *
 * Three questions, kept deliberately separate:
 *
 * - **Could we ask?** `supported` resolves {@link GEOLOCATION} in the
 *   `withState` factory, so it is correct from the first read rather than
 *   after a tick.
 * - **Are we allowed?** {@link PERMISSIONS} is queried on init, and the
 *   result is kept current via `PermissionStatus.onchange` - the user may
 *   flip the site setting at any time, including from another tab.
 * - **Where are we?** Dispatching `locationRequested` asks. See `request()`
 *   for why there is no way to ask for permission without also asking for a
 *   position.
 *
 * The permission probe is asynchronous, so `permission` is `'unknown'` for
 * the first microtask or two of the store's life. It also *stays*
 * `'unknown'` on browsers that will not answer the query, which is why
 * consumers must treat `'unknown'` as "ask and find out" rather than as a
 * refusal.
 *
 * ## Getting at it
 *
 * Actions go in as events, not method calls - see {@link locationEvents}. A
 * component that only needs to trigger a lookup injects nothing but the
 * dispatcher:
 *
 * @example
 * private readonly locationActions = injectDispatch(locationEvents);
 *
 * protected findNearMe(): void {
 *   this.locationActions.locationRequested();
 * }
 *
 * Reading state is the other direction and does need the store, because
 * signals are pulled rather than pushed:
 *
 * @example
 * private readonly location = inject(LocationStore);
 *
 * protected readonly canAsk = computed(
 *   () => this.location.supported() && this.location.permission() !== 'denied',
 * );
 *
 * `request()` stays public because the event handler has to call something,
 * and because an options override has nowhere else to go. Prefer the event:
 * it keeps the component from knowing that a position comes from this store
 * at all.
 *
 * ---
 *
 * # Still to cover
 *
 * ## An accuracy threshold
 *
 * {@link LocationFix.accuracy} is recorded but never judged. A fix accurate
 * to 30km is a wifi guess, not a location, and at some point the store or
 * its consumers need a line past which a position is not worth using.
 * Picking that number needs real readings from real devices first.
 *
 * ## Live tracking
 *
 * `watchPosition` is the reactive case (tracking a delivery, say). One
 * watcher at a time, and `clearWatch` on destroy or the handle leaks.
 *
 * ## The fallback ladder
 *
 * Precise geolocation is the *third* thing to reach for, not the first:
 * 1. Coarse position from edge headers at SSR time (Cloudflare
 *    `CF-IPCountry`, Vercel `x-vercel-ip-city`/`-latitude`, CloudFront
 *    `CloudFront-Viewer-City`). City-level, no permission, no prompt,
 *    available before first paint - enough to pre-fill a list.
 * 2. Browser geolocation, behind a button, to refine it.
 * 3. Manual entry (zip/postcode). Always present, never fails. This is the
 *    one that has to work when everything above is blocked.
 *
 * {@link LocationFix} will need a `source` discriminator when that lands,
 * since precision and trust differ wildly between the three.
 *
 * ## Persistence
 *
 * Caching the last known position avoids re-prompting every visit. If that
 * goes through `withStorageSync`, it needs a versioned, validated read path
 * from day one - see the note on `AuthStore` and ARCHITECTURE-COMPARISON.md
 * §3.4 for the trap. Precise coordinates are also personal data: decide a
 * retention window and whether coarse-only is enough to persist.
 *
 * ## Out of scope
 *
 * Turning coordinates into a place name is reverse geocoding - a separate
 * concern, and one that genuinely needs HTTP. It does not belong in here.
 */
export const LocationStore = signalStore(
  { providedIn: 'root' },
  withDevtools('location'),
  withState<LocationState>(() => ({
    supported: !!inject(GEOLOCATION),
    permission: 'unknown',
    status: 'idle',
    position: null,
    failure: null,
  })),
  withProps(() => ({
    locationEvents: injectDispatch(locationEvents),
    events: inject(Events),
  })),
  withMethods(({ locationEvents: dispatch, ...store }) => {
    const geolocation = inject(GEOLOCATION);

    return {
      /**
       * Ask for the user's position, prompting for permission if needed.
       *
       * **This is also how permission is requested.** There is no
       * `requestPermission()` on `Geolocation` - unlike `Notification` - so
       * the prompt is a side effect of asking for data. One call, both jobs,
       * and no way to do either alone.
       *
       * Consequences for callers:
       *
       * - **Call this from a user gesture.** Not a spec requirement, but
       *   Chrome and Safari penalise unprompted prompts, and a refusal is
       *   sticky, so an unprompted prompt can cost the capability for good.
       * - **The outcome is in the state, not the promise.** It resolves
       *   rather than rejecting on failure; read `status` and `failure`
       *   afterwards. This keeps consumers from needing a try/catch around
       *   what is a perfectly ordinary flow.
       * - Calling while a request is already outstanding is a no-op, as is
       *   calling when {@link LocationState.supported} is `false`.
       *
       * A previous `failure` is cleared as the request starts, but a
       * previous `position` is kept - a stale fix usually beats no fix, and
       * the caller can compare timestamps if it disagrees.
       *
       * @param options Overrides for {@link DEFAULT_POSITION_OPTIONS}. Think
       *   hard before dropping `timeout`: a dismissed prompt fires no
       *   callback at all, and the deadline is the only thing that ends the
       *   wait.
       */
      request(options: PositionOptions = DEFAULT_POSITION_OPTIONS) {
        if (!geolocation || isPending(store.status())) {
          return Promise.resolve();
        }

        // We cannot see the browser's dialog, so infer it: a held permission
        // means no prompt, anything else means we are probably showing one.
        patchState(store, {
          status: store.permission() === 'granted' ? 'locating' : 'prompting',
          failure: null,
        });

        return new Promise<void>((resolve) => {
          geolocation.getCurrentPosition(
            (position) => {
              const fix = toFix(position);

              patchState(store, {
                status: 'located',
                position: fix,
                failure: null,
              });
              dispatch.locationResolved(fix);
              resolve();
            },
            (error) => {
              const failure = toFailure(error);

              patchState(store, { status: 'failed', failure });
              dispatch.locationFailed(failure);
              resolve();
            },
            options,
          );
        });
      },
    };
  }),
  withEventHandlers(({ events, ...store }) => ({
    // The store's own entry point. Components dispatch; only this knows that
    // "find me" means `getCurrentPosition` with our default options.
    locationRequested$: events
      .on(locationEvents.locationRequested)
      .pipe(tap(() => void store.request())),
  })),
  withHooks({
    onInit(store) {
      const permissions = inject(PERMISSIONS);
      const destroyRef = inject(DestroyRef);

      // Nothing to report on if we could not ask anyway, and nothing to ask
      // with if the browser has no Permissions API. Either way `permission`
      // stays `'unknown'`.
      if (!store.supported() || !permissions) {
        return;
      }

      let subscription: PermissionStatus | undefined;
      let destroyed = false;

      destroyRef.onDestroy(() => {
        destroyed = true;
        if (subscription) {
          subscription.onchange = null;
        }
      });

      permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          // The query can outlive the store - bail rather than patching a
          // destroyed state source.
          if (destroyed) {
            return;
          }

          const learned = (permission: LocationPermission) => {
            patchState(store, { permission });
            store.locationEvents.permissionChanged(permission);
          };

          subscription = result;
          learned(result.state);

          // The user can flip the site setting at any time, including from
          // another tab. Without this the field silently goes stale, which is
          // worse than not having it.
          result.onchange = () => learned(result.state);
        })
        .catch(() => {
          // Safari has historically rejected with a `TypeError` for the
          // `geolocation` name even though `navigator.permissions` exists.
          // Leave `permission` as `'unknown'`: we genuinely do not know, and
          // claiming `'prompt'` here would be a guess.
        });
    },
  }),
);
