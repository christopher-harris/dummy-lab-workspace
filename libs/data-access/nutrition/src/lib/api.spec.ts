import type { NutritionCategory } from '@dummy-lab/shared-models';

import { nutritionItemsUrl, NUTRITION_PAGE_SIZE } from './api';

const CMS = 'http://localhost:1337';

const ALL: readonly NutritionCategory[] = [
  'classic-wings',
  'boneless-wings',
  'chicken-tenders',
  'chicken-sandwich',
  'sides',
  'beverages',
];

const query = (url: string) => decodeURIComponent(url.split('?')[1] ?? '');

describe('nutritionItemsUrl', () => {
  it('targets the nutrition-items collection on the configured origin', () => {
    expect(
      nutritionItemsUrl(CMS, ALL).startsWith(`${CMS}/api/nutrition-items?`),
    ).toBe(true);
  });

  it('asks for every category in one request', () => {
    // `$in`, not one request per category. The block knows all six before it
    // asks, so six round trips would buy nothing.
    const params = query(nutritionItemsUrl(CMS, ALL));

    ALL.forEach((category, index) => {
      expect(params).toContain(`filters[category][$in][${index}]=${category}`);
    });
  });

  it('keeps the hyphenated category vocabulary Strapi actually stores', () => {
    // Strapi's GraphQL API returns these with underscores while still
    // requiring hyphens as filter input, so a value round-tripped through
    // GraphQL matches nothing. REST is hyphens on both sides; pinned so a
    // future "normalisation" has to be a deliberate migration.
    expect(query(nutritionItemsUrl(CMS, ['classic-wings']))).toContain(
      'filters[category][$in][0]=classic-wings',
    );
  });

  it('sorts by the render order the editor controls', () => {
    expect(query(nutritionItemsUrl(CMS, ALL))).toContain(
      'sort[0]=sortOrder:asc',
    );
  });

  it('asks for the server maximum rather than accepting the default page', () => {
    // The default is 25 against 97 rows — four sections rendered and the rest
    // silently gone. This is the single most likely way this table ships
    // wrong, so the page size is explicit and asserted.
    expect(query(nutritionItemsUrl(CMS, ALL))).toContain(
      `pagination[pageSize]=${NUTRITION_PAGE_SIZE}`,
    );
    expect(NUTRITION_PAGE_SIZE).toBe(100);
  });

  it('omits `status` for a normal visit', () => {
    expect(query(nutritionItemsUrl(CMS, ALL))).not.toContain('status=');
  });

  it('asks for drafts in preview, so an unpublished flavour is visible', () => {
    // Items publish independently of the page that renders them — which is the
    // point, since limited-time flavours come and go — so preview has to read
    // drafts here too, not only on the page.
    expect(query(nutritionItemsUrl(CMS, ALL, 'draft'))).toContain(
      'status=draft',
    );
  });

  it('sends no request shape when the category list is empty', () => {
    // Not a guard against a bad URL — the store keeps the resource idle — but
    // the filter must not silently become "every category".
    expect(query(nutritionItemsUrl(CMS, []))).not.toContain(
      'filters[category]',
    );
  });
});
