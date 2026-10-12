/**
 * The `GET /api/pages` envelope.
 *
 * Block shapes come from `@dummy-lab/shared-models` for the same reason the
 * landing page's do: `ui/content-blocks` renders them and may not import
 * `type:data-access` (PROVE-OUT P22). Only the page wrapper and its SEO
 * component are this library's business.
 */
import type { ContentBlock, StrapiMedia } from '@dummy-lab/shared-models';

/**
 * Mirrors Strapi's `shared.seo`.
 *
 * Every field here exists to be written into the document head *before* the
 * HTML is serialised. Resolving a page client-side and patching these in
 * afterwards produces markup no social scraper ever sees — they do not run JS
 * — so this shape is only as useful as the render mode that consumes it.
 */
export interface PageSeo {
  metaTitle: string;
  metaDescription: string;
  /** `null` when never set; the consumer decides the fallback. */
  ogImage: StrapiMedia | null;
  /**
   * Set only when this page should concede ranking to another URL. `null` —
   * the common case — means the canonical URL is the page's own `path`, which
   * the consumer builds from the deployed origin. Strapi does not know the
   * origin and deliberately does not store it.
   */
  canonicalPath: string | null;
  noindex: boolean;
}

/**
 * `Page.blocks` accepts every block this build knows about, which is now a
 * superset of `landing-page.heroSlides` — the nutrition table is on this zone
 * and not on that one. Kept as an alias rather than used directly so that the
 * next divergence between the two zones is one edit here and not a rename
 * across every consumer.
 */
export type PageBlock = ContentBlock;

export interface Page {
  id: number;
  documentId: string;
  title: string;
  /** Full URL path, leading slash, no trailing slash. `/` for the home page. */
  path: string;
  seo: PageSeo;
  /**
   * Empty is a valid page, not a failure: `blocks` is optional in Strapi so a
   * route can be registered and published before its content exists. Consumers
   * must render an empty shell rather than treating this as a missed fetch —
   * the distinction between "no page at this path" and "a page with nothing on
   * it yet" is a 404 versus a 200, and it is `data.length` that tells them
   * apart.
   */
  blocks: PageBlock[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

/**
 * `Page` is a collection type, so a path lookup is a filtered list and not a
 * `findOne`. An unknown path returns `{ data: [] }` with a **200**, never a
 * 404 — the only signal that a route does not exist is an empty array, and the
 * consumer owns turning that into a real 404 status.
 */
export interface PageListResponse {
  data: Page[];
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/** One row of the prerender manifest / sitemap query. */
export interface PagePathEntry {
  id: number;
  documentId: string;
  path: string;
  seo: Pick<PageSeo, 'noindex'>;
}

export interface PagePathsResponse {
  data: PagePathEntry[];
  meta: PageListResponse['meta'];
}
