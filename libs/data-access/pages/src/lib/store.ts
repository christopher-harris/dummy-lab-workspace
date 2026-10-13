import { computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { withDevtools, withResource } from '@ngrx-toolkit/core';
import { signalStore, withComputed, withProps, withState } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import { CMS_PREVIEW } from '@dummy-lab/shared-cms';

import { pageByPathUrl } from './api';
import { pagesEvents } from './events';
import type { PageListResponse } from './models';

type PagesState = {
  /**
   * The path currently being resolved. `undefined` until something dispatches
   * `pageRequested`, which keeps `httpResource` idle rather than firing a
   * request for a path nobody asked for.
   */
  requestedPath: string | undefined;
};

const initialState: PagesState = {
  requestedPath: undefined,
};

/**
 * CMS pages addressed by URL path.
 *
 * Read-only, so no mutations to name — the event group exists to carry *which*
 * page, not to change one.
 *
 * Deliberately separate from `ContentStore` rather than folded into it.
 * `ContentStore` resolves one single type with no key; this resolves one row
 * out of a collection keyed by path, and the two have different idle states,
 * different empty states and different cache lifetimes. Sharing a store would
 * mean one resource that is sometimes keyed and sometimes not.
 *
 * Preview reuses `CMS_PREVIEW` from `data-access/content` unchanged, so a page
 * opened from the Strapi preview pane reads its draft the same way the landing
 * page does — including the same weakness: the status is decided in the
 * browser, which puts a draft-capable token there too. PROVE-OUT P23 wants
 * that decision made server-side off a signed, short-lived token.
 *
 * Resolution is client-time today, which is the weakest of PROVE-OUT P21's
 * three answers and the one this model exists to move off. Under SSR or
 * prerendering the same store runs on the server and the fetch leaves the
 * browser entirely; nothing here has to change for that, but the *metadata*
 * does — `seo` is only worth reading if it is written into the head before the
 * HTML is serialised.
 */
export const PagesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withDevtools('pages'),
  withProps(() => ({
    cmsBaseUrl: inject(RUNTIME_CONFIG).cmsBaseUrl,
    preview: inject(CMS_PREVIEW),
  })),
  withResource(({ cmsBaseUrl, preview, requestedPath }) => ({
    page: httpResource<PageListResponse>(() => {
      const path = requestedPath();
      return path ? pageByPathUrl(cmsBaseUrl, path, preview.status) : undefined;
    }),
  })),
  withComputed(({ pageValue, pageStatus, requestedPath }) => ({
    /**
     * The resolved page, or `undefined` when there is no row at this path.
     *
     * `path` is unique in Strapi, so more than one row cannot come back; the
     * `[0]` is unwrapping a filtered list, not picking a winner.
     *
     * Guarded on the path because a resource keeps its previous value while it
     * reloads. Without the comparison, navigating from `/nutrition` to
     * `/about` renders `/nutrition`'s blocks under `/about`'s URL until the
     * second response lands — the kind of bug that looks like a caching
     * problem and isn't.
     */
    currentPage: computed(() => {
      const path = requestedPath();
      const page = pageValue()?.data?.[0];

      return page !== undefined && page.path === path ? page : undefined;
    }),
    /**
     * True only once a response has arrived and contained no row.
     *
     * Distinct from `currentPage() === undefined`, which is also true while a
     * request is in flight, before any path is requested, and during the
     * reload guard above. This is the signal a catch-all route turns into a
     * 404 view.
     *
     * Under SSR it has to become a real 404 *status* as well, or crawlers
     * index a not-found page as a 200. That needs `RESPONSE_INIT`, which
     * Angular documents as `null` during static generation — so the status and
     * the view are two different problems with two different answers.
     */
    pageNotFound: computed(
      () =>
        requestedPath() !== undefined &&
        pageStatus() === 'resolved' &&
        (pageValue()?.data?.length ?? 0) === 0,
    ),
  })),
  withReducer(
    on(pagesEvents.pageRequested, (event) => ({
      requestedPath: event.payload,
    })),
    on(pagesEvents.pageCleared, () => ({
      requestedPath: undefined,
    })),
  ),
);
