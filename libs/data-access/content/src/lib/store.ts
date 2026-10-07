import { inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { withDevtools, withResource } from '@ngrx-toolkit/core';
import { signalStore, withProps } from '@ngrx/signals';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';

import { landingPageUrl } from './api';
import { CMS_PREVIEW } from './preview';
import type { LandingPageResponse } from './models';

/**
 * Landing-page content from the CMS.
 *
 * Read-only, so there is no `events.ts`: no user intent to name and nothing to
 * mutate (ADR-0004 Decisions 3 and 4). Consumers inject the store and read
 * `landingPageValue()`, the same way the products list reads
 * `allProductsValue()`.
 *
 * The resource is typed as Strapi's response and exposed unchanged. Reading
 * `landingPageValue()?.data?.heroSlides` means the component sees
 * `__component`, so the Strapi shape reaches the block registry — the cost of
 * having no mapper, and the thing to revisit if the CMS is ever swapped
 * (PROVE-OUT P9).
 *
 * Opened from the CMS preview pane (`/?preview=true`), the same store reads
 * the draft version instead. That is the whole of the preview mechanism on
 * this side, and it is deliberately the cheap version: the status is decided
 * in the browser, which means the draft-capable token has to be in the
 * browser too. PROVE-OUT P23 wants that decision made server-side off a
 * signed, short-lived token; this proves the editing loop, not the security
 * model.
 *
 * Resolution is client-time: the request starts when this store is first
 * injected. That is the cheapest of PROVE-OUT P21's three answers and the
 * weakest for LCP — the hero is the largest element on the page and currently
 * waits on a round trip to Strapi.
 */
export const ContentStore = signalStore(
  { providedIn: 'root' },
  withDevtools('content'),
  withProps(() => ({
    cmsBaseUrl: inject(RUNTIME_CONFIG).cmsBaseUrl,
    preview: inject(CMS_PREVIEW),
  })),
  withResource(({ cmsBaseUrl, preview }) => ({
    landingPage: httpResource<LandingPageResponse>(() =>
      landingPageUrl(cmsBaseUrl, preview.status),
    ),
  })),
);
