import { Component, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import {
  DEFAULT_BLOCK_SETTINGS,
  type BlockSettings,
  type HeroDarkImageBackgroundContent,
} from '@dummy-lab/shared-models';

import { blockContainerClass } from '../../block-container';
import { CmsMediaUrl } from '../../cms-media-url';

@Component({
  selector: 'dl-hero-dark-image-background',
  imports: [FormsModule, InputTextModule, ButtonModule],
  templateUrl: './dark-image-background.component.html',
  styleUrl: './dark-image-background.component.css',
})
export class DarkImageBackgroundComponent {
  private readonly cmsMediaUrl = inject(CmsMediaUrl);

  readonly content = input.required<HeroDarkImageBackgroundContent>();

  /**
   * Defaulted, so the block renders without settings being passed at all. The
   * host still coalesces `null` through `toBlockInputs` — an `input()` default
   * only applies when the key is absent, not when it arrives as `null`.
   */
  readonly settings = input<BlockSettings>(DEFAULT_BLOCK_SETTINGS);

  /** Constrains the copy column only; the gradient stack stays full-bleed. */
  readonly containerClass = computed(() => blockContainerClass(this.settings()));

  /**
   * The typed address is this block's own state, not content. Where it gets
   * submitted is deliberately still unwired — a `ui` block must not resolve or
   * send anything (PROVE-OUT P22); that belongs to whatever feature owns the
   * signup.
   */
  email = '';

  /** Four stacked layers; `backgroundBlendMode` below pairs with them in order. */
  readonly backgroundStyle = computed(() => ({
    background: `linear-gradient(0deg, color-mix(in srgb, var(--p-surface-950) 50%, transparent) 0%, transparent 100%),
                    linear-gradient(0deg, var(--p-primary-500) 0%, var(--p-primary-500) 100%),
                    linear-gradient(0deg, color-mix(in srgb, var(--p-primary-800) 60%, transparent) 0%, color-mix(in srgb, var(--p-primary-800) 60%, transparent) 100%),
                    url('${this.cmsMediaUrl.resolve(this.content().backgroundImage)}') center/cover no-repeat`,
    backgroundBlendMode: 'normal, multiply, lighten, normal',
  }));
}
