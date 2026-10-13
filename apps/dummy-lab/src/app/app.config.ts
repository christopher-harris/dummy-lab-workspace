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
import { CMS_API_TOKEN, cmsInterceptor } from '@dummy-lab/data-access-content';
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
    // Strapi read-only API token. Compiled into the browser bundle and visible
    // in devtools — never put an admin or full-access token here.
    {
      provide: CMS_API_TOKEN,
      useValue:
        '7374df3e82cc8146dbb5c3c728ed2e74d6ff838fa86a1c66007b498f6c330cfc6b1df23989e514fe9bb6076dce609e5c5a0e4c9d2754bf1756fe02083253e86c069a31684243d00bf0daa0b602ef03c49c26b4840d1e2060bc01d498a120ec0a715b2120786a768d7a78e82bf7942592ecd05af0853b12459fcbc4b8a90ba74d',
    },
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
