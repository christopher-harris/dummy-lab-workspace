/**
 * Pagination metadata returned alongside every DummyJSON list response.
 *
 * @see https://dummyjson.com/docs
 */
export interface PaginationMeta {
  total: number;
  skip: number;
  limit: number;
}

/**
 * The shape every DummyJSON list endpoint returns: the items under a
 * resource-named key, plus the pagination metadata.
 *
 * `TKey` is the resource key (`'products'`, `'carts'`, ...) and `TItem` is the
 * entity type in that array.
 *
 * @example
 * // As a type alias
 * export type ProductsResponse = PaginatedResponse<'products', Product>;
 *
 * @example
 * // Or extended, when a resource adds fields of its own
 * export interface ProductsResponse
 *   extends PaginatedResponse<'products', Product> {
 *   categories: string[];
 * }
 */
export type PaginatedResponse<TKey extends string, TItem> = PaginationMeta & {
  [K in TKey]: TItem[];
};

/**
 * Narrows a {@link PaginatedResponse} to just its items, without each caller
 * having to repeat the resource key.
 *
 * @example
 * type Products = PaginatedItems<ProductsResponse, 'products'>; // Product[]
 */
export type PaginatedItems<
  TResponse extends PaginationMeta,
  TKey extends Exclude<keyof TResponse, keyof PaginationMeta>,
> = TResponse[TKey];
