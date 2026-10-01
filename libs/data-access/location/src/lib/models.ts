/**
 * What we have asked the platform for, and what came back.
 *
 * Purely the *activity* axis. Whether there is an API to call lives in
 * `supported`, and whether we are allowed to call it in
 * {@link LocationPermission} - all three are independent, and conflating
 * them is what makes location code read as if it were lying.
 *
 * - `idle` - nothing asked for yet. Also where an unsupported browser sits,
 *   because we have not asked there either.
 * - `prompting` - a request is in flight and we believe the browser's
 *   permission dialog is on screen.
 * - `locating` - a request is in flight with permission already held.
 * - `located` - we have a position.
 * - `failed` - the request came back empty; see {@link LocationFailure}.
 *
 * Note that `prompting` and `locating` are *our inference* from
 * {@link LocationPermission} at the moment of the call. The platform never
 * tells us whether its dialog is showing, and never tells us when it is
 * dismissed.
 */
export type LocationStatus =
  | 'idle'
  | 'prompting'
  | 'locating'
  | 'located'
  | 'failed';

/**
 * Whether this origin is allowed to read the user's position.
 *
 * The first three mirror the Permissions API's own `PermissionState`.
 *
 * - `granted` - we can read a position without a prompt.
 * - `denied` - we cannot, and **cannot ask again**: a denial is sticky, so
 *   the only way back is the user changing it in browser settings.
 * - `prompt` - we have not asked. Note this means exactly that, and is *not*
 *   a prediction that asking will succeed.
 * - `unknown` - we could not find out. Either there is no Permissions API,
 *   or it refused to answer for `geolocation` (Safari). Treat it as "ask and
 *   find out", not as a denial.
 */
export type LocationPermission = 'granted' | 'denied' | 'prompt' | 'unknown';

/**
 * Why a request came back without a position.
 *
 * A narrowing of the three `GeolocationPositionError` codes into the three
 * things a UI can actually do about them.
 *
 * - `denied` - the permission was refused. Actionable, but **not by us**:
 *   offer instructions, never a retry button, because a denial is sticky.
 * - `unavailable` - the platform could not produce a fix. This is code `2`,
 *   which covers *both* "the device's location services are switched off"
 *   and "there is simply no fix right now" - the API does not distinguish
 *   them, so neither can we. Copy has to stay vague: "something on your
 *   device is blocking this", plus a manual fallback.
 * - `timeout` - our own deadline expired. The likeliest cause is a prompt
 *   the user dismissed rather than answered, since that produces no callback
 *   at all. Retryable.
 */
export type LocationFailure = 'denied' | 'unavailable' | 'timeout';

/**
 * A position, flattened out of the platform's `GeolocationPosition`.
 *
 * Deliberately a plain serialisable object rather than the live platform
 * type: it reads properly in the devtools, it can be persisted as-is when
 * that lands, and it keeps `GeolocationPosition` from leaking into
 * consumers. Altitude, heading and speed are dropped - nothing needs them,
 * and they are `null` on most hardware anyway.
 */
export interface LocationFix {
  /** Decimal degrees. */
  latitude: number;
  /** Decimal degrees. */
  longitude: number;
  /**
   * Radius of uncertainty in metres, at 95% confidence.
   *
   * Worth checking before trusting a fix: a "position" accurate to 30km is
   * a wifi-triangulation guess, not a location.
   */
  accuracy: number;
  /** When the platform acquired the fix, as epoch milliseconds. */
  timestamp: number;
}
