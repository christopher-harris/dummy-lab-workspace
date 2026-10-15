import type {
  NutritionCategory,
  NutritionItem,
  NutritionTableContent,
} from '@dummy-lab/shared-models';

import { testMedia } from '../hero/_fixtures';

/**
 * Minimal nutrition fixtures for block specs. Not exported from the library
 * barrel, for the same reason as the hero fixtures.
 */
export const nutritionItem = (
  id: number,
  category: NutritionCategory,
  overrides: Partial<NutritionItem> = {},
): NutritionItem => ({
  id,
  documentId: `item-${id}`,
  name: `Item ${id}`,
  category,
  servingSize: '1 order',
  sortOrder: id,
  calories: 100,
  totalFat: 1,
  saturatedFat: null,
  transFat: null,
  cholesterol: null,
  sodium: 200,
  totalCarbohydrate: null,
  dietaryFiber: null,
  totalSugars: null,
  addedSugars: null,
  protein: null,
  vitaminD: null,
  calcium: null,
  iron: null,
  potassium: null,
  ...overrides,
});

export const nutritionContent = (
  overrides: Partial<NutritionTableContent> = {},
): NutritionTableContent => ({
  heading: 'Nutrition',
  intro: null,
  categories: [
    { id: 1, category: 'sides', label: 'Sides' },
    { id: 2, category: 'classic-wings', label: 'Classic Wings' },
  ],
  pdf: testMedia('guide'),
  pdfLabel: null,
  footnote: null,
  ...overrides,
});
