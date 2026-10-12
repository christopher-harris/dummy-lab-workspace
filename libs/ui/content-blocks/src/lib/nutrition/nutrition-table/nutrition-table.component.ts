import { Component, computed, effect, inject, input } from '@angular/core';
import {
  DEFAULT_BLOCK_SETTINGS,
  NUTRITION_COLUMNS,
  type BlockSettings,
  type NutritionCategory,
  type NutritionItem,
  type NutritionTableContent,
} from '@dummy-lab/shared-models';
import {
  nutritionEvents,
  NutritionStore,
} from '@dummy-lab/data-access-nutrition';
import { injectDispatch } from '@ngrx/signals/events';

import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';

import { blockContainerClass } from '../../block-container';
import { CmsMediaUrl } from '../../cms-media-url';

/** One rendered section: the editor's label, and the rows under it. */
interface NutritionSection {
  readonly category: NutritionCategory;
  readonly label: string;
  /**
   * Mutable, against this file's grain, because PrimeNG's `p-table` declares
   * `[value]` as `any[]` and a `readonly` array is not assignable to it —
   * TS4104 at template-check time. `rows` here is always a fresh array out of
   * `filter`, never the store's frozen one, so nothing is actually shared for
   * the table to mutate.
   */
  readonly rows: NutritionItem[];
}

/**
 * The nutritional guide, as a real HTML table.
 *
 * ⚠️ **This block resolves its own data, which every other block in this
 * library does not.** Its `content` *names* six categories; the rows live in
 * the `nutrition-item` collection and no populate depth reaches them, so
 * something has to fetch them. PROVE-OUT P22 says that something should be a
 * `feature` component and that `ui` blocks never resolve. Putting it here was
 * a deliberate call (9 Oct 2026) to avoid a lib per data-bound block — the
 * alternative structure is written up in the session notes. Record it as a
 * P22 finding, not as an accident: the rule was chosen against, not forgotten.
 *
 * Rendered with PrimeNG's `p-table` — one per category rather than a single
 * `rowGroupMode="subheader"` table, because the section order belongs to the
 * block's content and six captioned tables read far better than one table
 * whose sections are `colspan` rows.
 *
 * Accessibility is most of the actual win over the PDF this replaces, so the
 * header cells keep `scope="col"` and each item name is a `th scope="row"`
 * inside the body template. `[scrollable]` owns the horizontal overflow —
 * seventeen columns never fit a phone and the page must not scroll sideways.
 */
@Component({
  selector: 'dl-nutrition-table',
  imports: [TableModule, MessageModule, ButtonModule],
  templateUrl: './nutrition-table.component.html',
})
export class NutritionTableComponent {
  private readonly nutrition = inject(NutritionStore);
  private readonly dispatch = injectDispatch(nutritionEvents);
  private readonly cmsMediaUrl = inject(CmsMediaUrl);

  readonly content = input.required<NutritionTableContent>();

  /**
   * Defaulted, so the block renders without settings being passed at all. The
   * host still coalesces `null` through `toBlockInputs` — an `input()` default
   * only applies when the key is absent, not when it arrives as `null`.
   */
  readonly settings = input<BlockSettings>(DEFAULT_BLOCK_SETTINGS);

  readonly columns = NUTRITION_COLUMNS;

  readonly containerClass = computed(() =>
    blockContainerClass(this.settings()),
  );

  readonly isLoading = this.nutrition.itemsIsLoading;
  readonly hasError = computed(() => this.nutrition.itemsError() !== undefined);

  /**
   * True when the collection returned fewer rows than it says exist.
   *
   * Strapi's default page size is 25 against 97 rows, and the configured
   * maximum is 100 — so this table is one menu expansion away from silently
   * rendering a partial guide. Nutrition information that is quietly
   * incomplete is worse than none, so the template refuses to present a
   * truncated table as authoritative.
   */
  readonly isTruncated = this.nutrition.rowsTruncated;

  /**
   * Sections in the order the editor arranged them, each holding its rows.
   *
   * The block's `categories` order is the render order — that is the whole
   * reason it is an ordered component list rather than a relation — so this
   * maps over the content, not over whatever order the API returned.
   */
  readonly sections = computed<readonly NutritionSection[]>(() => {
    const rows = this.nutrition.rows();

    return this.content().categories.map((section) => {
      const matching = rows.filter((row) => row.category === section.category);

      return {
        category: section.category,
        label: section.label,
        rows: matching,
      };
    });
  });

  readonly pdfHref = computed(() => {
    const pdf = this.content().pdf;

    return pdf ? this.cmsMediaUrl.resolve(pdf) : null;
  });

  constructor() {
    // Dispatched rather than calling a store method, per ADR-0004.
    //
    // In an `effect` rather than the constructor because a required signal
    // input is not readable during construction — it is set after the instance
    // exists, so reading it here is NG8118 at build time and an
    // `input.required()` throw at runtime. `CmsPage` can dispatch from its
    // constructor only because its source is an injected `ActivatedRoute`, not
    // an input.
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

  /** `null` nutrients are real — beverages carry nine of the seventeen columns. */
  protected format(value: number | null, unit: string): string {
    return value === null ? '—' : `${value}${unit}`;
  }
}
