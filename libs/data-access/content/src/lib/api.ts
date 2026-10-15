/**
 * Request construction for the CMS. No response handling — the store exposes
 * what Strapi returns.
 */
import { strapiQuery } from '@dummy-lab/shared-utils';

import type { CmsStatus } from '@dummy-lab/shared-cms';

/**
 * The landing page and its hero carousel.
 *
 * `status` selects the draft or published version of the document. Draft reads
 * are rejected for an anonymous caller, so this only resolves while the
 * request carries the CMS token — see `cms-interceptor.ts`.
 *
 * **No block vocabulary lives here any more.** Naming `heroSlides` says the
 * zone is wanted; the `landing-page` controller in `apps/cms` reads the schema
 * and expands every component, nested component and media field inside it. The
 * previous version carried a `Record<ContentBlockKey, readonly string[]>` of
 * which fields to populate per block, duplicated almost exactly in
 * `data-access/pages` — two copies of a list that the CMS already holds, and
 * that silently dropped any block neither copy had been told about.
 */
export function landingPageUrl(
  cmsBaseUrl: string,
  status: CmsStatus = 'published',
): string {
  const query = strapiQuery({
    status: status === 'draft' ? 'draft' : undefined,
    populate: { heroSlides: true },
  });

  return `${cmsBaseUrl}/api/landing-page?${query}`;
}
