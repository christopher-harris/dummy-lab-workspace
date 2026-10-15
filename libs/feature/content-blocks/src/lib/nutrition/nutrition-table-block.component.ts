import { Component, effect, inject, input } from '@angular/core';
import {
  nutritionEvents,
  NutritionStore,
} from '@dummy-lab/data-access-nutrition';
import {
  DEFAULT_BLOCK_SETTINGS,
  type BlockSettings,
  type NutritionTableContent,
} from '@dummy-lab/shared-models';
import { NutritionTableComponent } from '@dummy-lab/ui-content-blocks';
import { injectDispatch } from '@ngrx/signals/events';

/**
 * The nutrition-table block, bound to the nutrition store.
 *
 * The block's `content` only *names* its categories; the rows live in the
 * `nutrition-item` collection, which no populate depth reaches, so something
 * has to fetch them. That something is this wrapper — it requests the rows and
 * hands them, with their load state, to the presentational table in
 * `@dummy-lab/ui-content-blocks`.
 *
 * `display: contents` keeps the wrapper's host element out of the layout.
 */
@Component({
  selector: 'dl-nutrition-table-block',
  imports: [NutritionTableComponent],
  host: { style: 'display: contents' },
  template: `
    <dl-nutrition-table
      [content]="content()"
      [settings]="settings()"
      [rows]="nutrition.rows()"
      [isLoading]="nutrition.itemsIsLoading()"
      [hasError]="nutrition.itemsError() !== undefined"
      [isTruncated]="nutrition.rowsTruncated()"
    />
  `,
})
export class NutritionTableBlockComponent {
  protected readonly nutrition = inject(NutritionStore);
  private readonly dispatch = injectDispatch(nutritionEvents);

  readonly content = input.required<NutritionTableContent>();
  readonly settings = input<BlockSettings>(DEFAULT_BLOCK_SETTINGS);

  constructor() {
    // Dispatched rather than calling a store method, per ADR-0004.
    //
    // In an `effect` rather than the constructor because a required signal
    // input is not readable during construction — reading it here is NG8118 at
    // build time and an `input.required()` throw at runtime.
    //
    // An effect rather than `ngOnInit` because `NgComponentOutlet` sets
    // `ngComponentOutletInputs` on a live instance: a page whose block content
    // changes under the same component would never re-request its rows from a
    // lifecycle hook that fires once.
    effect(() => {
      this.dispatch.categoriesRequested(
        this.content().categories.map((section) => section.category),
      );
    });
  }
}
