import { InjectionToken } from '@angular/core';

/**
 * Strapi API token sent as `Authorization: Bearer …` on CMS requests.
 *
 * Empty by default, which makes `cmsInterceptor` a no-op — an unconfigured app
 * sends no header rather than an invalid one, so the failure stays a clean
 * 403 from Strapi instead of a confusing 401.
 *
 * **This value reaches the browser.** Angular compiles it into the bundle and
 * the header is visible in devtools to anyone who opens the page, so it is not
 * a secret and must never be an admin or full-access token. Use a Strapi
 * token of type **Read-only**, and treat it as a throttle, not a permission
 * boundary.
 */
export const CMS_API_TOKEN = new InjectionToken<string>('CMS_API_TOKEN', {
  providedIn: 'root',
  factory: () => '',
});
