import type { Cart, CartsResponse } from './models';

export async function fetchCarts(
  apiBaseUrl: string,
  abortSignal?: AbortSignal,
): Promise<Cart[]> {
  const response = await fetch(`${apiBaseUrl}/carts?limit=0`, {
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load carts: ${response.status}`);
  }

  const data = (await response.json()) as CartsResponse;
  return data.carts;
}
