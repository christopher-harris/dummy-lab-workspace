import { eventGroup } from '@ngrx/signals/events';
import { type } from '@ngrx/signals';
import type { NutritionCategory } from '@dummy-lab/shared-models';

/**
 * Components dispatch these; they never call store methods (ADR-0004).
 *
 * `categoriesRequested` carries the whole ordered list rather than one
 * category at a time, because the block that dispatches it knows all six up
 * front and one `$in` query answers them together. Dispatching per category
 * would turn one request into six for no gain.
 */
export const nutritionEvents = eventGroup({
  source: 'Nutrition',
  events: {
    categoriesRequested: type<readonly NutritionCategory[]>(),
    categoriesCleared: type<void>(),
  },
});
