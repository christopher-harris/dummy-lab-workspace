import { Component, computed, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  DEFAULT_BLOCK_SETTINGS,
  type BlockSettings,
  type HeroRightAlignedImageContent,
} from '@dummy-lab/shared-models';

import { blockContainerClass } from '../../block-container';
import { CmsMediaUrl } from '../../cms-media-url';

@Component({
  selector: 'dl-hero-right-aligned-image',
  imports: [ButtonModule],
  templateUrl: './right-aligned-image.component.html',
  styleUrl: './right-aligned-image.component.css',
})
export class RightAlignedImageComponent {
  private readonly cmsMediaUrl = inject(CmsMediaUrl);

  readonly content = input.required<HeroRightAlignedImageContent>();

  /**
   * Defaulted, so the block renders without settings being passed at all. The
   * host still coalesces `null` through `toBlockInputs` — an `input()` default
   * only applies when the key is absent, not when it arrives as `null`.
   */
  readonly settings = input<BlockSettings>(DEFAULT_BLOCK_SETTINGS);

  /**
   * Applies to the copy column only, and only narrows it — this block's layout
   * is a two-column row whose right column must bleed to the viewport edge for
   * its clip-path to read, so the block itself can never be constrained. The
   * copy column is already about half the viewport, which means `full` and
   * `contained` land on the same rendering and only `content-contained` is
   * visible. Known limitation, not a bug.
   */
  readonly containerClass = computed(() => blockContainerClass(this.settings()));

  readonly image = computed(() => {
    const media = this.content().image;

    return {
      src: this.cmsMediaUrl.resolve(media),
      alt: media?.alternativeText ?? '',
    };
  });
}
