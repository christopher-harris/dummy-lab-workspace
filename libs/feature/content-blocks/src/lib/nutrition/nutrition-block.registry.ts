import type { NutritionTableBlock } from '@dummy-lab/shared-models';

import type { ContentBlockRegistry } from '@dummy-lab/ui-content-blocks';

import { NutritionTableBlockComponent } from './nutrition-table-block.component';

export type NutritionBlockKey = NutritionTableBlock['__component'];

/**
 * Registry entries for the nutrition family.
 *
 * Family-local for the same reason the hero registry is: adding a block type
 * means touching the family it belongs to rather than one global file.
 */
export const NUTRITION_BLOCK_REGISTRY: Pick<
  ContentBlockRegistry,
  NutritionBlockKey
> = {
  'nutrition.nutrition-table': {
    key: 'nutrition.nutrition-table',
    family: 'nutrition',
    label: 'Nutrition Table',
    component: NutritionTableBlockComponent,
  },
};
