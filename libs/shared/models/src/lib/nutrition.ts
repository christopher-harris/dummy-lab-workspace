/**
 * The `nutrition-item` collection, exactly as Strapi returns it.
 *
 * A collection rather than rows nested in the page block, because the numbers
 * outlive the page that renders them: a menu surface wanting calories beside
 * an item needs the same rows, and typed rows are the only thing that can emit
 * real structured data. The cost of that separation is that nothing enforces
 * referential integrity — the block names categories as strings, and a
 * category with no rows renders an empty section with a 200.
 *
 * Here rather than in `data-access/nutrition` for the same reason the block
 * shapes are: the table that renders these takes them as a typed input, and
 * `type:ui` may not import `type:data-access`.
 */

/**
 * The six sections of the nutritional guide.
 *
 * Hyphenated because that is what Strapi's REST API stores and returns.
 * ⚠️ Strapi's **GraphQL** API renders the same values with underscores
 * (`classic_wings`) on the way out while still requiring hyphens on the way
 * in, so a value read from a GraphQL response and fed back into a GraphQL
 * filter matches nothing and returns `[]` with no error. If this content model
 * ever serves a second consumer over GraphQL, normalise the stored vocabulary
 * before that happens, not after.
 */
export type NutritionCategory =
  | 'classic-wings'
  | 'boneless-wings'
  | 'chicken-tenders'
  | 'chicken-sandwich'
  | 'sides'
  | 'beverages';

/**
 * One row of the nutritional guide.
 *
 * Every nutrient except `calories` is nullable because the beverages table in
 * the source guide carries a much smaller column set than the food tables —
 * nine columns against seventeen. Modelling that as two content types would
 * have duplicated everything to express one difference, so the absence is
 * carried in the data and the table renders a dash.
 *
 * `null` rather than optional: Strapi returns the key with a `null` value for
 * an unset decimal, it does not omit it. Typing these as `?` would let a
 * consumer write `item.sodium === undefined` and never be true.
 *
 * ⚠️ These values came from a positioned-glyph parse of the corporate PDF
 * (`tools/nutrition-seed/`) and are **not spot-checked**. Spike data.
 */
export interface NutritionItem {
  id: number;
  documentId: string;
  name: string;
  category: NutritionCategory;
  servingSize: string;
  /** Render order within a category. Ascending; not unique across categories. */
  sortOrder: number;
  calories: number;
  totalFat: number | null;
  saturatedFat: number | null;
  transFat: number | null;
  cholesterol: number | null;
  sodium: number | null;
  totalCarbohydrate: number | null;
  dietaryFiber: number | null;
  totalSugars: number | null;
  addedSugars: number | null;
  protein: number | null;
  vitaminD: number | null;
  calcium: number | null;
  iron: number | null;
  potassium: number | null;
}

/**
 * The keys on {@link NutritionItem} that carry a nutrient value.
 *
 * Derived rather than listed so it cannot drift from the interface. This is
 * what keeps `row[column.key]` typed as `number | null` in the table template
 * — widening it to `keyof NutritionItem` would pull `name`, `servingSize` and
 * `category` into the union and the cell formatter would stop type-checking.
 */
export type NutritionNutrientKey = {
  [K in keyof NutritionItem]-?: NutritionItem[K] extends number | null
    ? K
    : never;
}[keyof NutritionItem];

/**
 * The nutrient columns, in the order the guide prints them, paired with the
 * header each one renders under.
 *
 * Declared here rather than in the table component so the column vocabulary is
 * one list rather than a template, a header row and a cell loop that can
 * silently disagree. `satisfies` keeps every key a real `NutritionItem`
 * nutrient — a renamed field fails the build instead of rendering a blank
 * column.
 */
export const NUTRITION_COLUMNS = [
  { key: 'calories', label: 'Calories', unit: '' },
  { key: 'totalFat', label: 'Total Fat', unit: 'g' },
  { key: 'saturatedFat', label: 'Sat. Fat', unit: 'g' },
  { key: 'transFat', label: 'Trans Fat', unit: 'g' },
  { key: 'cholesterol', label: 'Cholesterol', unit: 'mg' },
  { key: 'sodium', label: 'Sodium', unit: 'mg' },
  { key: 'totalCarbohydrate', label: 'Total Carbs', unit: 'g' },
  { key: 'dietaryFiber', label: 'Fiber', unit: 'g' },
  { key: 'totalSugars', label: 'Total Sugars', unit: 'g' },
  { key: 'addedSugars', label: 'Added Sugars', unit: 'g' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'vitaminD', label: 'Vitamin D', unit: 'mcg' },
  { key: 'calcium', label: 'Calcium', unit: 'mg' },
  { key: 'iron', label: 'Iron', unit: 'mg' },
  { key: 'potassium', label: 'Potassium', unit: 'mg' },
] as const satisfies readonly {
  key: NutritionNutrientKey;
  label: string;
  unit: string;
}[];

export type NutritionColumn = (typeof NUTRITION_COLUMNS)[number];
