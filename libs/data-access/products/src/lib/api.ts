import type { Product, ProductCategory, ProductsResponse } from './models';

export async function fetchProducts(
  apiBaseUrl: string,
  abortSignal?: AbortSignal,
): Promise<Product[]> {
  const response = await fetch(`${apiBaseUrl}/products?limit=0`, {
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load products: ${response.status}`);
  }

  const data = (await response.json()) as ProductsResponse;
  return data.products;
}

export async function fetchAllProductCategories(
  apiBaseUrl: string,
): Promise<ProductCategory[]> {
  const response = await fetch(`${apiBaseUrl}/products/categories`);
  return (await response.json()) as ProductCategory[];
}
