import { Component, computed, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  DEFAULT_BLOCK_SETTINGS,
  type BlockSettings,
  type HeroLightImageBackgroundContent,
  type HeroLinkIcon,
} from '@dummy-lab/shared-models';

import { blockContainerClass } from '../../block-container';
import { CmsMediaUrl } from '../../cms-media-url';

/**
 * Strapi stores a semantic icon name, not a CSS class, so the icon set stays a
 * frontend concern — swapping PrimeIcons for something else is a change here
 * rather than a content migration. The enum is closed on both sides, so this
 * map is exhaustive by construction.
 */
const LINK_ICON_CLASS: Readonly<Record<HeroLinkIcon, string>> = {
  apple: 'pi pi-apple',
  android: 'pi pi-android',
  facebook: 'pi pi-facebook',
  instagram: 'pi pi-instagram',
  tiktok: 'pi pi-tiktok',
  youtube: 'pi pi-youtube',
  x: 'pi pi-twitter',
};

@Component({
  selector: 'dl-hero-light-image-background',
  imports: [ButtonModule],
  templateUrl: './light-image-background.component.html',
  styleUrl: './light-image-background.component.css',
})
export class LightImageBackgroundComponent {
  private readonly cmsMediaUrl = inject(CmsMediaUrl);

  readonly content = input.required<HeroLightImageBackgroundContent>();

  /**
   * Defaulted, so the block renders without settings being passed at all. The
   * host still coalesces `null` through `toBlockInputs` — an `input()` default
   * only applies when the key is absent, not when it arrives as `null`.
   */
  readonly settings = input<BlockSettings>(DEFAULT_BLOCK_SETTINGS);

  /** Constrains the copy column only; the photo layer below stays full-bleed. */
  readonly containerClass = computed(() =>
    blockContainerClass(this.settings()),
  );

  readonly links = computed(() =>
    this.content().links.map((link) => ({
      ...link,
      iconClass: LINK_ICON_CLASS[link.icon],
    })),
  );

  /** Radial scrim over the photo, so the white headline stays readable. */
  readonly backgroundStyle = computed(() => ({
    background: `radial-gradient(67.46% 67.46% at 50% 50%, color-mix(in srgb, var(--p-surface-950) 60%, transparent) 0%, rgba(0, 0, 0, 0) 100%),
                    url('${this.cmsMediaUrl.resolve(this.content().backgroundImage)}') lightgray 50% / cover no-repeat`,
  }));
}
