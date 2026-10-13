import type { HeroSlideBlock } from '@dummy-lab/shared-models';

import {
  DarkImageBackgroundComponent,
  LightImageBackgroundComponent,
  RightAlignedImageComponent,
  type ContentBlockRegistry,
} from '@dummy-lab/ui-content-blocks';

import { CenteredProductImageBlockComponent } from './centered-product-image-block.component';

export type HeroBlockKey = HeroSlideBlock['__component'];

/**
 * Registry entries for the hero family.
 *
 * Family-local so adding a block type means touching the family it belongs to
 * rather than one global file.
 */
export const HERO_BLOCK_REGISTRY: Pick<ContentBlockRegistry, HeroBlockKey> = {
  'hero.centered-product-image': {
    key: 'hero.centered-product-image',
    family: 'hero',
    label: 'Centered Product Image',
    // The one hero that reads the theme store, so it registers its
    // data-bound wrapper rather than the presentational component.
    component: CenteredProductImageBlockComponent,
  },
  'hero.right-aligned-image': {
    key: 'hero.right-aligned-image',
    family: 'hero',
    label: 'Right Aligned Image',
    component: RightAlignedImageComponent,
  },
  'hero.light-image-background': {
    key: 'hero.light-image-background',
    family: 'hero',
    label: 'Light Image Background',
    component: LightImageBackgroundComponent,
  },
  'hero.dark-image-background': {
    key: 'hero.dark-image-background',
    family: 'hero',
    label: 'Dark Image Background',
    component: DarkImageBackgroundComponent,
  },
};
