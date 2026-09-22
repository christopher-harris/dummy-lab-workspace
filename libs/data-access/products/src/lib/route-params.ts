/**
 * Name of the dynamic route segment that carries a product id.
 *
 * The contract between `ProductsStore` and the router is an untyped string, so
 * both the route definition and the store should read it from here — renaming
 * the segment without this would leave the store silently idle, with no
 * compile error to catch it.
 */
export const PRODUCT_ID_PARAM = 'productId';
