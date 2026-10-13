/**
 * Request construction for `GET /api/pages`. No response handling — the store
 * exposes what Strapi returns.
 */
import type { CmsStatus } from '@dummy-lab/shared-cms';
import { strapiQuery } from '@dummy-lab/shared-utils';

/**
 * One page by its full URL path.
 *
 * A filtered list rather than a `findOne` — `path` is a unique attribute, not
 * Strapi's document id — so the response is an array that is empty for an
 * unknown path. See `PageListResponse`.
 *
 * `status` selects the draft or published version. Draft reads are rejected
 * for an anonymous caller, so `'draft'` only resolves while the request
 * carries the CMS token — see `cmsInterceptor` in `data-access/content`.
 *
 * **This file knows nothing about blocks, and that is the design.** It names
 * `blocks` to say *that* the zone is wanted; the `page` controller in
 * `apps/cms` reads the schema and decides *how deep*, expanding every
 * component, nested component and media field it finds. The populate map that
 * used to live here — one entry per block, hand-maintained, keyed by
 * `ContentBlockKey` — is gone, and with it the failure it produced: Strapi's
 * `on` syntax is a whitelist, so a block the map had not been told about was
 * dropped from the response with a 200, and the page rendered as though the
 * editor had left it empty.
 *
 * Omitting `blocks` here is meaningful rather than merely shorter: the
 * controller only deepens a zone the caller named, which is what keeps
 * `pagePathsUrl` — the prerender manifest query — from dragging every block of
 * every page back with it.
 */
export function pageByPathUrl(
  cmsBaseUrl: string,
  path: string,
  status: CmsStatus = 'published',
): string {
  const query = strapiQuery({
    filters: { path: { $eq: path } },
    // Omitted entirely for a normal visit, so the published page is cached
    // under a plain URL rather than one carrying a redundant `status`.
    status: status === 'draft' ? 'draft' : undefined,
    populate: {
      // `ogImage` is the only relation on `shared.seo`; its scalars come back
      // without being named. `seo` is a plain component rather than a dynamic
      // zone, so the controller leaves it alone and it is named in full here.
      seo: { populate: ['ogImage'] },
      blocks: true,
    },
  });

  return `${cmsBaseUrl}/api/pages?${query}`;
}
