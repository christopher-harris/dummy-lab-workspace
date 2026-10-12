/**
 * Resolving the prerender manifest at build time.
 *
 * Sits beside `prerender.ts` and consumes it: that file builds the URL, this
 * one walks it. Separate because the URL builder is pure and trivially
 * testable, while this is I/O with a pagination contract and a failure policy.
 *
 * Plain `fetch` rather than `HttpClient` on purpose. This runs from
 * `getPrerenderParams()`, where `inject()` is only legal synchronously —
 * before the first `await` — so a paginated walk cannot hold an injected
 * client across its loop without tripping that rule. `fetch` also keeps the
 * build off Angular's interceptor chain, which is the right call given
 * `cmsInterceptor` is scoped by a runtime config this code resolves itself.
 */
import { pagePathsUrl } from './prerender';
import type { PagePathEntry, PagePathsResponse } from './models';

/** Raised when the manifest cannot be resolved. Never swallowed — see below. */
export class PublishedPathsError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'PublishedPathsError';
  }
}

/** Options for `fetchPublishedPages`. */
export interface PublishedPathsOptions {
  /** Origin of the CMS, no trailing slash — as `RuntimeConfig.cmsBaseUrl` supplies it. */
  readonly cmsBaseUrl: string;
  /** Strapi read-only token. Omitted or empty sends no `Authorization` header. */
  readonly token?: string;
  /**
   * Guard against an unbounded walk. A runaway `pageCount` would otherwise
   * loop until the build times out with no indication why.
   */
  readonly maxPages?: number;
}

const DEFAULT_MAX_PAGES = 50;

async function fetchPage(
  url: string,
  token: string | undefined,
): Promise<PagePathsResponse> {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch (cause) {
    throw new PublishedPathsError(
      `Could not reach the CMS at ${url}. Prerendering needs it to enumerate pages.`,
      cause,
    );
  }

  if (!response.ok) {
    throw new PublishedPathsError(
      `The CMS returned ${response.status} for the page manifest. ` +
        (response.status === 401 || response.status === 403
          ? 'Check that the CMS API token is set and has read access to Page.'
          : `Request: ${url}`),
    );
  }

  try {
    return (await response.json()) as PagePathsResponse;
  } catch (cause) {
    throw new PublishedPathsError(
      'The CMS page manifest was not valid JSON.',
      cause,
    );
  }
}

/**
 * Every published page, walked across Strapi's pagination.
 *
 * **Walks `pageCount` rather than trusting one response**, which is the whole
 * reason this is not a one-liner. `pagePathsUrl()` asks for 100 rows and
 * Strapi caps the page size at 100, so a site with 101 pages silently returns
 * the first 100 — and a prerender driven by that list would deploy a site
 * missing pages, with a successful build and no warning anywhere. That failure
 * is invisible until someone notices a URL 404ing in production.
 *
 * **Throws rather than returning an empty list** on any failure. A soft
 * failure here is the worst outcome available: the build succeeds, every CMS
 * route is dropped, and the deploy replaces a working site with one that has
 * no marketing pages at all. A red build is recoverable; a green build that
 * silently un-published the site is not.
 */
export async function fetchPublishedPages(
  options: PublishedPathsOptions,
): Promise<PagePathEntry[]> {
  const { cmsBaseUrl, token, maxPages = DEFAULT_MAX_PAGES } = options;

  const first = await fetchPage(pagePathsUrl(cmsBaseUrl), token);
  const entries = [...(first.data ?? [])];
  const pageCount = first.meta?.pagination?.pageCount ?? 1;

  if (pageCount > maxPages) {
    throw new PublishedPathsError(
      `The CMS reports ${pageCount} pages of results, above the ${maxPages}-page ceiling. ` +
        'Raise maxPages deliberately rather than prerendering a partial site.',
    );
  }

  for (let page = 2; page <= pageCount; page++) {
    const next = await fetchPage(pagePathsUrl(cmsBaseUrl, page), token);
    entries.push(...(next.data ?? []));
  }

  return entries;
}

/**
 * Published paths as `getPrerenderParams()` wants them.
 *
 * A `**` route takes its segments under the literal key `'**'`, **without a
 * leading slash** — Angular joins it onto the route's own prefix, so passing
 * `/nutrition` would generate `//nutrition`. `Page.path` is stored with the
 * slash (and is `/` for the home page), so stripping it is a format
 * conversion, not a normalisation.
 *
 * The home page is excluded: `/` is served by the explicit `''` route in
 * `app.routes.ts`, not by the catch-all, so emitting `{ '**': '' }` would ask
 * Angular to prerender a path the wildcard never matches.
 *
 * `noindex` pages **are** prerendered. `noindex` keeps a page out of search
 * results; it does not stop a visitor reaching the URL, and a page that exists
 * should still be served as HTML. The sitemap is where that flag filters —
 * which is why `pagePathsUrl()` fetches it.
 */
export function toCatchAllPrerenderParams(
  entries: readonly PagePathEntry[],
): { '**': string }[] {
  return entries
    .map((entry) => entry.path)
    .filter((path) => path !== '/')
    .map((path) => ({ '**': path.replace(/^\//, '') }));
}
