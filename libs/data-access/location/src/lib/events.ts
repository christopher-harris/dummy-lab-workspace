import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

import type {
  LocationFailure,
  LocationFix,
  LocationPermission,
} from './models';

/**
 * The location store's event surface.
 *
 * This is the intended way in and out of the store. A component that only
 * needs to *do* something dispatches an event and stops there - it does not
 * have to inject `LocationStore` at all:
 *
 * @example
 * private readonly locationActions = injectDispatch(locationEvents);
 *
 * protected findNearMe(): void {
 *   this.locationActions.locationRequested();
 * }
 *
 * One event in, three out. The outbound three exist so that anything else
 * interested in the answer - another store, an analytics handler - can react
 * without taking a dependency on this store either.
 */
export const locationEvents = eventGroup({
  source: 'Location',
  events: {
    /**
     * Someone wants to know where the user is.
     *
     * **Dispatch this from a user gesture.** It ends in
     * `getCurrentPosition`, which may raise the browser's permission dialog,
     * and an unprompted prompt can lose the capability permanently.
     *
     * Carries no payload: the request runs with
     * `DEFAULT_POSITION_OPTIONS`. A caller that genuinely needs different
     * options is doing something unusual enough to justify injecting the
     * store and calling `request(options)` directly.
     *
     * Dispatching while a request is already outstanding is a no-op, as is
     * dispatching on a browser with no `Geolocation` API.
     */
    locationRequested: type<void>(),
    /** A request came back with a position. */
    locationResolved: type<LocationFix>(),
    /** A request came back without one. */
    locationFailed: type<LocationFailure>(),
    /**
     * We learned the origin's permission state.
     *
     * Fires once for the initial probe and again whenever the user changes
     * the site setting - which they can do at any time, from any tab, with
     * no request in flight. Not every occurrence is a *change* from the
     * user's point of view; the first one is simply us finding out.
     */
    permissionChanged: type<LocationPermission>(),
  },
});
