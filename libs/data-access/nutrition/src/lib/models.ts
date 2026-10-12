/**
 * The `GET /api/nutrition-items` envelope.
 *
 * The row shape itself lives in `@dummy-lab/shared-models`: the table that
 * renders these takes them as a typed input, and `type:ui` may not import
 * `type:data-access`. Only the list wrapper is this library's business.
 */
import type { NutritionItem } from '@dummy-lab/shared-models';

export interface NutritionItemListResponse {
  data: NutritionItem[];
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      /** Rows matching the filter, which is not the same as rows returned. */
      total: number;
    };
  };
}
