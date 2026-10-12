/**
 * Serialises a plain object into Strapi's bracket-notation query string.
 *
 * Strapi's REST API takes deeply nested parameters encoded as
 * `populate[blocks][on][hero.right-aligned-image][populate][content][populate][0]=image`.
 * Building those by hand with `URLSearchParams.set` means writing the brackets
 * as string concatenation, which is how a populate ends up subtly wrong and
 * returns less data than the caller thinks — a failure that surfaces as a
 * missing image rather than as an error.
 *
 * The Strapi docs write the same queries as JSON and run them through `qs`
 * (https://docs.strapi.io/cms/api/rest/populate-select). This produces output
 * identical to `qs.stringify(params, { encodeValuesOnly: true })` for the
 * subset of shapes a Strapi query actually uses, which is all of: nested plain
 * objects, arrays, strings, numbers and booleans. `strapi-query.spec.ts` pins
 * that equivalence case by case.
 *
 * It exists instead of the dependency because `qs` is 13.8 KB gzipped, is
 * CommonJS-only so none of it tree-shakes, and would be shipped to the browser
 * to serialise three fixed-shape objects. `@strapi/client` is worse for this
 * job: it is `qs` plus its own `fetch`, which would route around `HttpClient`,
 * the CMS interceptor and `httpResource`.
 *
 * What it deliberately does not do, because no Strapi query here needs it and
 * guessing at the semantics would be worse than not supporting them:
 *
 * - **No parsing.** One direction only.
 * - **No `null`.** `qs` renders `null` as an empty value (`a=`); here it is
 *   skipped exactly like `undefined`, so an optional parameter can be left off
 *   by evaluating to either one.
 * - **No bracket encoding.** Keys are emitted literally, which is what makes
 *   the URL readable in devtools and the Strapi logs. Values are always
 *   encoded. This is `encodeValuesOnly: true`, and it matters: `$` in `$eq`,
 *   `.` in a component UID and `[]` around a key must all reach Strapi intact.
 */

/** The leaves a Strapi query can carry. */
type StrapiQueryPrimitive = string | number | boolean;

/**
 * Anything that can appear as a value in a Strapi query object.
 *
 * `undefined` is included so a conditional parameter can be written inline as
 * `status: isDraft ? 'draft' : undefined` rather than spread in.
 */
export type StrapiQueryValue =
  | StrapiQueryPrimitive
  | readonly StrapiQueryValue[]
  | StrapiQueryParams
  | null
  | undefined;

/** A Strapi query, as the JSON object the docs write it as. */
export interface StrapiQueryParams {
  readonly [key: string]: StrapiQueryValue;
}

/**
 * Builds the bracketed key for one leaf: `['populate','seo','fields','0']`
 * becomes `populate[seo][fields][0]`.
 *
 * The first segment is bare and every later one is bracketed, which is the
 * whole of Strapi's notation.
 */
function bracketKey(path: readonly string[]): string {
  const [root, ...rest] = path;

  return rest.reduce((key, segment) => `${key}[${segment}]`, root);
}

/**
 * Walks one value, returning the `key=value` pairs beneath it.
 *
 * Recursion order is the emitted order, and for an object that is JavaScript's
 * own property order. One sharp edge comes with it: an integer-like key
 * (`'0'`, `'42'`) is hoisted ahead of its siblings by the language, not by
 * this function. No Strapi parameter name is integer-like — component UIDs,
 * field names and operators never are — so this stays theoretical, but a map
 * keyed by numeric ids would serialise in an order the author did not write.
 */
function pairs(value: StrapiQueryValue, path: readonly string[]): string[] {
  // Skipped rather than emitted as an empty value, so an absent parameter is
  // absent from the URL. Strapi treats `status=` as a malformed status, not as
  // "no status".
  if (value === undefined || value === null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => pairs(item, [...path, String(index)]));
  }

  if (typeof value === 'object') {
    return Object.entries(value as StrapiQueryParams).flatMap(([key, nested]) =>
      pairs(nested, [...path, key]),
    );
  }

  return [`${bracketKey(path)}=${encodeURIComponent(String(value))}`];
}

/**
 * The query string for a Strapi REST request, without a leading `?`.
 *
 * Returns `''` for an object with nothing in it — including one whose every
 * value is `undefined` — so a caller that always appends `?` should check
 * before doing so.
 *
 * @example
 * strapiQuery({
 *   filters: { path: { $eq: '/nutrition' } },
 *   populate: { seo: { populate: ['ogImage'] } },
 * });
 * // 'filters[path][$eq]=%2Fnutrition&populate[seo][populate][0]=ogImage'
 */
export function strapiQuery(params: StrapiQueryParams): string {
  return pairs(params, []).join('&');
}
