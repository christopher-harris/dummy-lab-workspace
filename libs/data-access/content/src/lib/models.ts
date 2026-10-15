/**
 * The `GET /api/landing-page` envelope.
 *
 * The block shapes themselves live in `@dummy-lab/shared-models` so the
 * rendering side can reach them without importing `data-access` — see the note
 * there. Only the response wrapper is this library's business.
 */
import type { HeroSlideBlock } from '@dummy-lab/shared-models';

export interface LandingPage {
  id: number;
  documentId: string;
  heroSlides: HeroSlideBlock[];
  heroAutoplayInterval: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

/**
 * `data` is `null` — with a 200, not a 404 — when the single type has never
 * been filled in, which is also what an unpublished page looks like to an
 * anonymous reader.
 */
export interface LandingPageResponse {
  data: LandingPage | null;
  meta: Record<string, unknown>;
}
