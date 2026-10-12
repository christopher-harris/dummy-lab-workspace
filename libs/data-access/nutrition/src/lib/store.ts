import { computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { withDevtools, withResource } from '@ngrx-toolkit/core';
import { signalStore, withComputed, withProps, withState } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import { CMS_PREVIEW } from '@dummy-lab/data-access-content';
import type { NutritionCategory, NutritionItem } from '@dummy-lab/shared-models';

import { nutritionItemsUrl } from './api';
import { nutritionEvents } from './events';
import type { NutritionItemListResponse } from './models';

const NO_ROWS: readonly NutritionItem[] = Object.freeze([]);
const NO_CATEGORIES: readonly NutritionCategory[] = Object.freeze([]);

type NutritionState = {
  /**
   * Categories currently being resolved. Empty until something dispatches
   * `categoriesRequested`, which keeps `httpResource` idle rather than firing
   * a request for a guide nobody asked for.
   */
  requestedCategories: readonly NutritionCategory[];
};

const initialState: NutritionState = {
  requestedCategories: NO_CATEGORIES,
};

/**
 * Nutrition rows, addressed by the categories a block asked for.
 *
 * Separate from `PagesStore` because this is the first content that is *not*
 * part of a page document. A page carries its own blocks; these rows are a
 * collection those blocks only name, and the two have different cache
 * lifetimes — a corrected calorie value should not require republishing the
 * page, which is the whole reason the rows are a collection in the first
 * place.
 *
 * Deliberately a single shared store rather than one instance per block.
 * Nothing stops two blocks on one page naming overlapping categories, and a
 * per-instance store would fetch the same rows twice; one keyed resource
 * fetches the union once. The cost to name: two blocks with *different*
 * category lists on one page would fight over `requestedCategories`, each
 * overwriting the other. No page does that today — a second data-bound block
 * is the moment to key this by category set instead of replacing it.
 */
export const NutritionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withDevtools('nutrition'),
  withProps(() => ({
    cmsBaseUrl: inject(RUNTIME_CONFIG).cmsBaseUrl,
    preview: inject(CMS_PREVIEW),
  })),
  withResource(({ cmsBaseUrl, preview, requestedCategories }) => ({
    items: httpResource<NutritionItemListResponse>(() => {
      const categories = requestedCategories();

      return categories.length
        ? nutritionItemsUrl(cmsBaseUrl, categories, preview.status)
        : undefined;
    }),
  })),
  withComputed(({ itemsValue }) => ({
    /**
     * The rows, flattened out of the Strapi envelope.
     *
     * Named `rows` rather than `items` because `withResource({ items })`
     * already owns that key — the resource and its unwrapped value must not
     * collide.
     *
     * A frozen shared empty array rather than a fresh `[]`, so a consumer
     * computing over this does not re-run on every read while the resource is
     * idle or in flight.
     */
    rows: computed<readonly NutritionItem[]>(
      () => itemsValue()?.data ?? NO_ROWS,
    ),
    /**
     * True when Strapi says more rows match than it returned.
     *
     * This is the guard against the failure this collection is most likely to
     * produce: the default page size is 25 against 97 rows, and the server cap
     * is 100. A nutrition table that silently renders two thirds of the guide
     * is worse than one that renders none, because nothing about it looks
     * wrong. Consumers are expected to refuse to present a truncated table as
     * authoritative.
     */
    rowsTruncated: computed(() => {
      const value = itemsValue();
      const total = value?.meta?.pagination?.total;

      return total !== undefined && total > (value?.data?.length ?? 0);
    }),
  })),
  withReducer(
    on(nutritionEvents.categoriesRequested, (event) => ({
      requestedCategories: event.payload,
    })),
    on(nutritionEvents.categoriesCleared, () => ({
      requestedCategories: NO_CATEGORIES,
    })),
  ),
);
