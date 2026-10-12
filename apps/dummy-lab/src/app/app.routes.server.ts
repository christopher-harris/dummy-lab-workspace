import { inject } from '@angular/core';
import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { CMS_API_TOKEN } from '@dummy-lab/data-access-content';
import {
  fetchPublishedPages,
  toCatchAllPrerenderParams,
} from '@dummy-lab/data-access-pages';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';

/**
 * Render mode per route family — the server-side companion to `app.routes.ts`.
 *
 * Read this as the deploy topology written down. Three modes are available
 * and only two are used here, because `outputMode` is `static`: the build
 * emits files and no Node server, so `RenderMode.Server` is not an option
 * this app can honour. That is a deliberate constraint, not an oversight —
 * it keeps the existing `wrangler pages deploy …/browser` pipeline unchanged.
 *
 * **Matching is first-wins and `**` swallows everything**, exactly like the
 * router's own table, which is why every application route is named before
 * the catch-all. A route omitted here does not fall back to client rendering;
 * it falls into the CMS wildcard and the build tries to prerender it as a
 * Strapi page. Adding a route to `app.routes.ts` means adding it here too —
 * the pair is unenforced today and is the obvious thing to put a test around.
 */
export const serverRoutes: ServerRoute[] = [
  /**
   * The landing page. Prerendered because it is the one marketing URL that
   * already exists outside the CMS collection.
   *
   * Worth flagging against PROVE-OUT P20: the moment this hero becomes
   * personalised by flag or location, a build-time artifact stops being
   * correct for it and this entry has to move to request-time rendering —
   * which this app's `static` output mode cannot express. That is the
   * decision P21 is actually about, and it is reachable from here.
   */
  { path: '', renderMode: RenderMode.Prerender },

  /**
   * Everything behind the application shell renders in the browser.
   *
   * Not a compromise — the correct answer. These routes are authenticated or
   * personalised, so there is no shared HTML to cache and nothing a crawler
   * is permitted to see. Rendering them on the server would mean putting
   * session tokens in the render path to produce output that must never be
   * cached, which is cost and risk in exchange for nothing.
   *
   * Under `static` output each of these emits a CSR shell, so the deploy is
   * still a plain file per route.
   */
  { path: 'dashboard', renderMode: RenderMode.Client },
  { path: 'products', renderMode: RenderMode.Client },
  { path: 'products/**', renderMode: RenderMode.Client },
  { path: 'users', renderMode: RenderMode.Client },
  { path: 'carts', renderMode: RenderMode.Client },
  { path: 'posts', renderMode: RenderMode.Client },
  { path: 'recipes', renderMode: RenderMode.Client },
  { path: 'todos', renderMode: RenderMode.Client },
  { path: 'quotes', renderMode: RenderMode.Client },
  { path: 'account/**', renderMode: RenderMode.Client },
  { path: 'auth/**', renderMode: RenderMode.Client },

  /**
   * CMS pages — the reason any of this exists.
   *
   * **Nothing here names a path.** The build asks Strapi which pages are
   * published and prerenders that list, so `/nutrition` is prerendered
   * because an editor published it, not because this file was edited. Adding
   * a page in the CMS and rebuilding is the entire workflow; the application
   * never learns the URL.
   *
   * The cost to name, and it is the real one: the HTML is now as fresh as the
   * last build. A published change is invisible until something rebuilds, so
   * this route only works paired with a Strapi webhook that triggers a
   * deploy — on `page` **and** on `nutrition-item`, because the nutrition
   * rows are a separate collection and a new flavour is not a page edit.
   * Wire only the first and new flavours never appear, on a site that looks
   * completely healthy.
   *
   * `PrerenderFallback.Client` covers the gap between publish and rebuild: a
   * page that did not exist at build time still resolves in the browser the
   * way it does today. It is not indexable until the next build — a crawler
   * gets the shell — but a human following a link is not met with a 404.
   */
  {
    path: '**',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      // `inject()` is only legal synchronously here — before the first
      // `await` — so both dependencies are resolved up front.
      const { cmsBaseUrl } = inject(RUNTIME_CONFIG);
      const token = inject(CMS_API_TOKEN);

      return toCatchAllPrerenderParams(
        await fetchPublishedPages({ cmsBaseUrl, token }),
      );
    },
  },
];
