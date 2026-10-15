import {
  IMAGE_LOADER,
  type ImageLoader,
  type ImageLoaderConfig,
} from '@angular/common';
import type { Provider } from '@angular/core';

/** One stored size of a CMS image, resolved to an absolute URL. */
export interface CmsImageRendition {
  readonly url: string;
  readonly width: number;
}

/**
 * What an `<img ngSrc>` needs to show a CMS image at the right size.
 *
 * Built by `CmsMediaUrl.image()`; bind `src`, `srcset` and `loaderParams` to
 * `ngSrc`, `ngSrcset` and `loaderParams` on an element whose component
 * provides `provideCmsImageLoader()`.
 */
export interface CmsImage {
  /**
   * The widest rendition. What `src` falls back to, and what a CSS
   * `background` should use, since it has no `srcset` to choose from.
   */
  readonly src: string;
  /** One width descriptor per rendition, e.g. `500w, 750w, 1000w`. */
  readonly srcset: string;
  readonly alt: string;
  readonly loaderParams: { readonly renditions: readonly CmsImageRendition[] };
}

/**
 * The narrowest rendition at least `width` wide, or the widest there is.
 * With no `width` — the plain `src` — the widest.
 *
 * `renditions` must be sorted narrowest first, as `CmsMediaUrl.image()`
 * returns them.
 */
export function pickRendition(
  renditions: readonly CmsImageRendition[],
  width?: number,
): CmsImageRendition | undefined {
  const widest = renditions[renditions.length - 1];

  if (width === undefined) {
    return widest;
  }

  return renditions.find((rendition) => rendition.width >= width) ?? widest;
}

/**
 * Maps the widths `NgOptimizedImage` asks for onto the sizes Strapi stored.
 *
 * Strapi's local upload provider can't resize on request the way an image CDN
 * can: it writes a fixed set of formats at upload (by default 1000, 750, 500
 * and a thumbnail) and serves files. So instead of building a URL from the
 * requested width, this looks the width up in the renditions passed through
 * `loaderParams`. `CmsMediaUrl.image()` builds `ngSrcset` from those same
 * widths, so every lookup lands on an exact match.
 */
export const cmsImageLoader: ImageLoader = (config: ImageLoaderConfig) => {
  const renditions: readonly CmsImageRendition[] =
    config.loaderParams?.['renditions'] ?? [];

  return pickRendition(renditions, config.width)?.url ?? config.src;
};

/**
 * Component-level, not app-wide: other `ngSrc` images in the app (the
 * dummyjson product thumbnails) aren't CMS media and keep the default loader.
 */
export function provideCmsImageLoader(): Provider {
  return { provide: IMAGE_LOADER, useValue: cmsImageLoader };
}
