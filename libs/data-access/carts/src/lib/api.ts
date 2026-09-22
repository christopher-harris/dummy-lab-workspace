import { DUMMY_JSON_BASE_URL } from '@dummy-lab/shared-utils';

import type { Cart, CartsResponse } from './models';

export async function fetchCarts(abortSignal?: AbortSignal): Promise<Cart[]> {
  const response = await fetch(`${DUMMY_JSON_BASE_URL}/carts?limit=0`, {
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load carts: ${response.status}`);
  }

  const data = (await response.json()) as CartsResponse;
  return data.carts;
}
