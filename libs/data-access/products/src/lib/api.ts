import { DUMMY_JSON_BASE_URL } from '@dummy-lab/shared-utils';

import type { Product, ProductCategory, ProductsResponse } from './models';

export async function fetchProducts(
  abortSignal?: AbortSignal,
): Promise<Product[]> {
  const response = await fetch(`${DUMMY_JSON_BASE_URL}/products?limit=0`, {
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load products: ${response.status}`);
  }

  const data = (await response.json()) as ProductsResponse;
  return data.products;
}

export async function fetchAllProductCategories(): Promise<ProductCategory[]> {
  const response = await fetch(`${DUMMY_JSON_BASE_URL}/products/categories`);
  return (await response.json()) as ProductCategory[];
}
