import type {
  BlockContainerWidth,
  BlockSettings,
} from '@dummy-lab/shared-models';

/**
 * What each container width actually measures.
 *
 * Strapi stores a semantic width, not a CSS class — the same contract as
 * `LINK_ICON_CLASS` in `light-image-background.component.ts`. The enum is
 * closed on both sides, so this map is exhaustive by construction, and
 * retuning `contained` is a change here rather than a content migration.
 *
 * Plain Tailwind utilities rather than `@theme` tokens: a token would still
 * need this enum-to-class map, so it adds a file without removing the
 * indirection, and there is exactly one consumer. (If that changes, note that
 * `@theme` only works in `styles/tailwind.css` — declared anywhere else it is
 * silently dropped.)
 *
 * These must stay whole literal strings. Tailwind v4 scans source text and
 * `styles/tailwind.css` declares `@import 'tailwindcss' source('../')`, so
 * `libs/**` is in scope — but only for classes that appear verbatim. Never
 * build one by concatenation.
 */
export const BLOCK_CONTAINER_CLASS: Readonly<
  Record<BlockContainerWidth, string>
> = {
  full: 'max-w-none',
  contained: 'max-w-7xl mx-auto',
  'content-contained': 'max-w-3xl mx-auto',
};

/** The container class for a block's settings. */
export function blockContainerClass(settings: BlockSettings): string {
  return BLOCK_CONTAINER_CLASS[settings.containerWidth];
}
