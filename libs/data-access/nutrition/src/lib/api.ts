/**
 * Request construction for `GET /api/nutrition-items`. No response handling —
 * the store exposes what Strapi returns.
 */
import type { NutritionCategory } from '@dummy-lab/shared-models';
import type { CmsStatus } from '@dummy-lab/shared-cms';
import { strapiQuery } from '@dummy-lab/shared-utils';

/**
 * Strapi's configured ceiling (`apps/cms/config/api.ts`), and the reason this
 * function takes no `page`.
 *
 * The guide is 97 rows today, so one request covers it — but the default page
 * size is 25, which would have returned four sections and silently stopped.
 * Asking for the maximum turns that silent truncation into a visible one:
 * `meta.pagination.total` still reports the real count, and `NutritionStore`
 * compares the two so a table that outgrew a single page refuses to present
 * itself as the complete guide rather than quietly dropping Beverages.
 *
 * When the menu does outgrow 100, the fix is paging through `pageCount` — not
 * raising this number past what the server will honour.
 */
export const NUTRITION_PAGE_SIZE = 100;

/**
 * Every published row in the named categories, ordered for rendering.
 *
 * One `$in` query rather than one request per category: the block knows all
 * six categories before it asks, and six round trips would buy nothing. The
 * response is *not* grouped — the caller slices it by category, because the
 * section order belongs to the block's content, not to the collection.
 *
 * `sortOrder` is per category and not unique across them, so this sort is only
 * meaningful once the rows are grouped. That is the consumer's job.
 *
 * `status` exists because nutrition items publish independently of the page
 * that renders them — which is the point, since limited-time flavours come and
 * go — so a preview of an unpublished flavour has to read drafts here too, not
 * only on the page.
 */
export function nutritionItemsUrl(
  cmsBaseUrl: string,
  categories: readonly NutritionCategory[],
  status: CmsStatus = 'published',
): string {
  const query = strapiQuery({
    filters: { category: { $in: categories } },
    status: status === 'draft' ? 'draft' : undefined,
    sort: ['sortOrder:asc'],
    pagination: { pageSize: NUTRITION_PAGE_SIZE },
  });

  return `${cmsBaseUrl}/api/nutrition-items?${query}`;
}
