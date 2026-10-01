import { DOCUMENT, InjectionToken, inject } from '@angular/core';

/**
 * The browser APIs this library talks to, behind injection tokens.
 *
 * Nothing here reaches for the global `navigator` directly, for two reasons:
 *
 * 1. **Server rendering.** Resolving via {@link DOCUMENT} means a server
 *    render gets `null` instead of a `ReferenceError`, so a store that
 *    injects these is safe to instantiate anywhere.
 * 2. **Testing.** Specs override the tokens with fakes or with `null`. No
 *    monkeypatching of globals, no leaking state between tests.
 */

/**
 * The browser's `Geolocation` API, or `null` where there isn't one.
 *
 * A `null` value is permanent for the lifetime of the page - it means the
 * API is absent, not that it is unavailable right now. Callers should treat
 * it as a dead end and never offer a retry.
 *
 * A non-`null` value is *not* a promise that anything will work: the API is
 * secure-context only (HTTPS or `localhost`), and an embedding page's
 * `Permissions-Policy` can still veto every call.
 */
export const GEOLOCATION = new InjectionToken<Geolocation | null>(
  'GEOLOCATION',
  {
    providedIn: 'root',
    factory: () => inject(DOCUMENT).defaultView?.navigator?.geolocation ?? null,
  },
);

/**
 * The browser's `Permissions` API, or `null` where there isn't one.
 *
 * Separate from {@link GEOLOCATION} because the two are independently
 * available: a browser can expose geolocation while refusing to report its
 * permission state. Safari has historically done exactly that - see the
 * probe in `LocationStore` for how that is handled.
 */
export const PERMISSIONS = new InjectionToken<Permissions | null>(
  'PERMISSIONS',
  {
    providedIn: 'root',
    factory: () => inject(DOCUMENT).defaultView?.navigator?.permissions ?? null,
  },
);
