import { Component, inject, input } from '@angular/core';
import { ThemeStore } from '@dummy-lab/data-access-theme';
import {
  DEFAULT_BLOCK_SETTINGS,
  type BlockSettings,
  type HeroCenteredProductImageContent,
} from '@dummy-lab/shared-models';
import { CenteredProductImageComponent } from '@dummy-lab/ui-content-blocks';

/**
 * The centered-product-image hero, bound to the theme store.
 *
 * The presentational block takes `dark` as an input; this wrapper is the one
 * place that knows the answer comes from `ThemeStore`. It satisfies the same
 * content/settings contract, so the registry cannot tell the two apart.
 *
 * `display: contents` keeps the wrapper's host element out of the layout, so
 * the hero renders exactly as it would unwrapped.
 */
@Component({
  selector: 'dl-centered-product-image-block',
  imports: [CenteredProductImageComponent],
  host: { style: 'display: contents' },
  template: `
    <dl-hero-centered-product-image
      [content]="content()"
      [settings]="settings()"
      [dark]="theme.isDark()"
    />
  `,
})
export class CenteredProductImageBlockComponent {
  protected readonly theme = inject(ThemeStore);

  readonly content = input.required<HeroCenteredProductImageContent>();
  readonly settings = input<BlockSettings>(DEFAULT_BLOCK_SETTINGS);
}
