/**
 * A cart returned from or represented within the application. API-specific
 * response envelopes remain in their respective data-access libraries.
 */
export interface Cart {
  id: number;
  products: CartProduct[];
  total: number;
  discountedTotal: number;
  userId: number;
  totalProducts: number;
  totalQuantity: number;
  [key: string]: unknown;
}

export interface CartProduct {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedTotal: number;
  thumbnail: string;
  [key: string]: unknown;
}
