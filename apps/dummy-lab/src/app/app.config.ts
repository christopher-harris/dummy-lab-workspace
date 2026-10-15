import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  Meta,
  provideClientHydration,
  withHttpTransferCacheOptions,
} from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { appRoutes } from './app.routes';
import { providePrimeNgPlatform } from '@dummy-lab/shared-theme';
import { authInterceptor } from '@dummy-lab/data-access-auth';
import { cmsInterceptor } from '@dummy-lab/data-access-content';
import { CMS_PREVIEW } from '@dummy-lab/shared-cms';
import { provideRuntimeConfig } from '@dummy-lab/shared-runtime-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRuntimeConfig(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    /**
     * Picks up the prerendered DOM instead of discarding and re-rendering it.
     * A no-op for a page served as a CSR shell, so this is safe on every
     * route regardless of its render mode.
     *
     * `includeRequestsWithAuthHeaders` is the one non-default here, and it is
     * load-bearing. The transfer cache excludes requests carrying an
     * `Authorization` header by default — a sensible rule for per-user data,
     * and exactly wrong for this app, where `cmsInterceptor` attaches a
     * read-only Strapi token to every CMS read. Left at the default, a
     * prerendered page ships the content in its HTML and then the browser
     * fetches it a second time on hydration: the network cost CSR had, plus
     * a flash as the resource reloads.
     *
     * What this serialises into the HTML is CMS responses — public marketing
     * content already visible in the markup. The token itself is never part
     * of the cached payload.
     */
    provideClientHydration(
      withHttpTransferCacheOptions({ includeRequestsWithAuthHeaders: true }),
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, cmsInterceptor]),
    ),
    // No CMS_API_TOKEN: content is read through Strapi's Public role
    // (find/findOne on landing-page, page, nutrition-item). A token bought
    // nothing — it was compiled into the bundle, so it was public anyway —
    // and Strapi only accepts tokens minted by the same instance, so a
    // hardcoded one tied every build to a single CMS. The interceptor stays
    // and is a no-op while the token is empty.
    providePrimeNgPlatform(),
    /**
     * Preview renders unpublished copy at a real, reachable URL
     * (`/?preview=true`). Nothing stops a crawler following that link out of
     * the admin or a shared screenshot, so tag the document the moment the
     * flag is present — including when previewing the published version,
     * because the query string is still a distinct indexable URL.
     *
     * This is the client-side half only. The durable answer is `no-store` and
     * `X-Robots-Tag` from a server that decides the status (PROVE-OUT P23);
     * a meta tag in a CSR bundle is a floor, not a guarantee.
     */
    provideAppInitializer(() => {
      if (inject(CMS_PREVIEW).active) {
        inject(Meta).addTag({ name: 'robots', content: 'noindex, nofollow' });
      }
    }),
  ],
};
