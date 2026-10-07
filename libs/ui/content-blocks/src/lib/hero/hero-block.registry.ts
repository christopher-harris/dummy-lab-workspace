import type { HeroSlideBlock } from '@dummy-lab/shared-models';

import type { ContentBlockRegistry } from '../content-block.types';
import { CenteredProductImageComponent } from './centered-product-image/centered-product-image.component';
import { DarkImageBackgroundComponent } from './dark-image-background/dark-image-background.component';
import { LightImageBackgroundComponent } from './light-image-background/light-image-background.component';
import { RightAlignedImageComponent } from './right-aligned-image/right-aligned-image.component';

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
    component: CenteredProductImageComponent,
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
