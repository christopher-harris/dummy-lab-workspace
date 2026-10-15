/**
 * Build-time queries over the page collection.
 *
 * Separate from `api.ts` because that file is the store's repository and
 * ADR-0004 keeps a repository private — it is deliberately absent from
 * `index.ts`. This is a different surface with a different consumer: a Node
 * script that runs at build time and never touches the store.
 */
import { strapiQuery } from '@dummy-lab/shared-utils';

/**
 * Every published path, for the prerender manifest and the sitemap.
 *
 * This is the query that makes one-row-per-URL worth modelling: Angular's
 * `getPrerenderParams()` needs the full route list at build time, and a
 * sitemap needs the same list minus the `noindex` ones — hence pulling
 * `seo.noindex` rather than paths alone. Blocks are not populated; nothing
 * here renders a page.
 *
 * Intended for a build-time Node script, not for the browser, which is why it
 * is exported as a URL builder and has no store behind it.
 *
 * Strapi caps `pageSize` at 100 by default (`apps/cms/config/api.ts`), so a
 * site with more pages than that must walk `meta.pagination.pageCount`. A
 * caller that ignores the pagination silently prerenders the first 100 routes
 * and nothing else.
 */
export function pagePathsUrl(
  cmsBaseUrl: string,
  page = 1,
  pageSize = 100,
): string {
  const query = strapiQuery({
    fields: ['path'],
    populate: { seo: { fields: ['noindex'] } },
    sort: ['path:asc'],
    pagination: { page, pageSize },
  });

  return `${cmsBaseUrl}/api/pages?${query}`;
}
