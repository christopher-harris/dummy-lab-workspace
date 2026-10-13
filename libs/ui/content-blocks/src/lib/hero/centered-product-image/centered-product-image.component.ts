import { Component, computed, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  DEFAULT_BLOCK_SETTINGS,
  type BlockSettings,
  type HeroCenteredProductImageContent,
} from '@dummy-lab/shared-models';

import { blockContainerClass } from '../../block-container';
import { CmsMediaUrl } from '../../cms-media-url';

/**
 * Presentational. Which image to show is an input, not a store read — the
 * theme-aware binding lives in `@dummy-lab/feature-content-blocks`, because a
 * `ui` library never knows where its data comes from (ADR-0001 Decision 4).
 */
@Component({
  selector: 'dl-hero-centered-product-image',
  imports: [ButtonModule],
  templateUrl: './centered-product-image.component.html',
  styleUrl: './centered-product-image.component.css',
})
export class CenteredProductImageComponent {
  private readonly cmsMediaUrl = inject(CmsMediaUrl);

  readonly content = input.required<HeroCenteredProductImageContent>();

  /**
   * Defaulted, so the block renders without settings being passed at all. The
   * host still coalesces `null` through `toBlockInputs` — an `input()` default
   * only applies when the key is absent, not when it arrives as `null`.
   */
  readonly settings = input<BlockSettings>(DEFAULT_BLOCK_SETTINGS);

  /**
   * Whether to show the dark-scheme image. Defaulted so the block still
   * satisfies the content/settings contract when rendered on its own.
   */
  readonly dark = input(false);

  readonly containerClass = computed(() =>
    blockContainerClass(this.settings()),
  );

  /**
   * This is the page's LCP element, so it renders as a single `<img>` rather
   * than a light/dark pair toggled with `dark:hidden`. A `display: none` image
   * is still fetched, so the pair cost ~162 KiB to show ~81 KiB of it. Taking
   * `dark` as an input — bound to the theme store one layer up — also keeps
   * the swap tied to the in-app theme toggle; a `<picture>` with
   * `prefers-color-scheme` would desync from it, because the theme store
   * drives a class on `<html>`, not the OS setting.
   */
  readonly heroImage = computed(() => {
    const content = this.content();
    const media = this.dark() ? content.imageDark : content.imageLight;

    return {
      src: this.cmsMediaUrl.resolve(media),
      alt: media?.alternativeText ?? '',
    };
  });
}
