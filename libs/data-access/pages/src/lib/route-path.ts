import type { UrlSegment } from '@angular/router';

/**
 * Normalises a URL path into the form `Page.path` is stored in.
 *
 * Strapi's `path` is validated against `^/$|^(/[a-z0-9]+(-[a-z0-9]+)*)+$`:
 * lowercase, single leading slash, no trailing slash. A visitor typing
 * `/Nutrition` or `/nutrition/` would otherwise 404 on a page that exists, so
 * the lookup normalises rather than the content model loosening.
 *
 * Note what this does **not** do: normalising here makes `/Nutrition` *work*,
 * it does not make it canonical. Both URLs now serve the same page, which is
 * duplicate content until the edge 301s one to the other. That redirect is a
 * hosting concern, not this function's.
 */
export function normalizePagePath(raw: string): string {
  const segments = raw
    .trim()
    .toLowerCase()
    .split('/')
    .filter((segment) => segment.length > 0);

  return segments.length === 0 ? '/' : `/${segments.join('/')}`;
}

/**
 * The full URL path a catch-all route matched.
 *
 * A `**` route puts every unmatched segment in `ActivatedRoute.url`, so this
 * is the whole path below the route's own prefix rather than a single param —
 * which is why `Page` is keyed by `path` and not by a `:slug`. Query and
 * matrix params are not part of `url` and are excluded for free, and
 * `UrlSegment.path` arrives percent-decoded.
 *
 * Takes segments rather than an `ActivatedRouteSnapshot` because the snapshot
 * is the wrong source for a catch-all route: `**` produces no params, and the
 * router's default `runGuardsAndResolvers` is `paramsChange`, so a snapshot
 * read in a resolver never re-runs when one CMS page navigates to another.
 * The `url` observable emits on every navigation.
 */
export function pagePathFromSegments(segments: readonly UrlSegment[]): string {
  return normalizePagePath(segments.map((segment) => segment.path).join('/'));
}
