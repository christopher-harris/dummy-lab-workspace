/**
 * Options passed to `getCurrentPosition` unless a caller overrides them.
 *
 * Every one of the three is a deliberate choice:
 *
 * - `enableHighAccuracy: false` keeps the GPS radio off. High accuracy is
 *   slower to acquire and materially worse for battery, and buys nothing for
 *   anything store-locator shaped - a few hundred metres is plenty to sort a
 *   list of stores by distance.
 * - `timeout` is **not optional in practice.** A permission prompt the user
 *   dismisses - Escape, or the X - fires neither the success nor the error
 *   callback, so without a deadline the request hangs forever and the store
 *   sits in `locating` for the life of the page. This is the single most
 *   common geolocation bug.
 * - `maximumAge` lets the platform hand back a recently cached fix instead
 *   of acquiring a new one. Five minutes is well within the window where a
 *   user has not meaningfully moved for the purpose of finding a store.
 */
export const DEFAULT_POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 300_000,
};

/**
 * The `GeolocationPositionError` codes, as plain numbers.
 *
 * The platform exposes these as constants on the error instance and on the
 * `GeolocationPositionError` global, but neither is reachable in jsdom -
 * which has no geolocation at all - so matching on the numeric values keeps
 * the mapping testable with a plain object literal as the error.
 */
export const POSITION_ERROR = {
  /** The permission was refused, or the origin's policy forbids it. */
  PERMISSION_DENIED: 1,
  /** No fix available - *or* the device's location services are off. */
  POSITION_UNAVAILABLE: 2,
  /** Our own `timeout` elapsed. */
  TIMEOUT: 3,
} as const;
