import { Component, computed, inject, input } from '@angular/core';
import {
  DEFAULT_BLOCK_SETTINGS,
  NUTRITION_COLUMNS,
  type BlockSettings,
  type NutritionCategory,
  type NutritionItem,
  type NutritionTableContent,
} from '@dummy-lab/shared-models';

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
 * **Presentational.** The rows and their load state are inputs. The block that
 * fetches them — dispatching `categoriesRequested` and reading the nutrition
 * store — is `NutritionTableBlockComponent` in
 * `@dummy-lab/feature-content-blocks`, because a `ui` library never knows where
 * its data comes from (ADR-0001 Decision 4, PROVE-OUT P22). One `feature`
 * library holds every data-bound block, so the rule does not cost a library
 * per block.
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

  /** Every row the block's categories resolved to, in any order. */
  readonly rows = input<readonly NutritionItem[]>([]);

  readonly isLoading = input(false);
  readonly hasError = input(false);

  /**
   * True when the collection returned fewer rows than it says exist.
   *
   * Nutrition information that is quietly incomplete is worse than none, so
   * the template refuses to present a truncated table as authoritative.
   */
  readonly isTruncated = input(false);

  /**
   * Sections in the order the editor arranged them, each holding its rows.
   *
   * The block's `categories` order is the render order — that is the whole
   * reason it is an ordered component list rather than a relation — so this
   * maps over the content, not over whatever order the API returned.
   */
  readonly sections = computed<readonly NutritionSection[]>(() => {
    const rows = this.rows();

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

  /** `null` nutrients are real — beverages carry nine of the seventeen columns. */
  protected format(value: number | null, unit: string): string {
    return value === null ? '—' : `${value}${unit}`;
  }
}
