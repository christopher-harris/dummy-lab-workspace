import type { Cart } from '@dummy-lab/shared-models';

export type { Cart, CartProduct } from '@dummy-lab/shared-models';

export interface CartsResponse {
  carts: Cart[];
  total: number;
  skip: number;
  limit: number;
}
