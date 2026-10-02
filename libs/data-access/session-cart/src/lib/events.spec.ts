import { describe, expect, it } from 'vitest';
import type { CartProduct } from '@dummy-lab/shared-models';

import { sessionCartEvents } from './events';

describe('sessionCartEvents', () => {
  it('creates typed cart-line events', () => {
    const product: CartProduct = {
      id: 1,
      title: 'Essential Oil',
      price: 9.99,
      quantity: 1,
      total: 9.99,
      discountPercentage: 0,
      discountedTotal: 9.99,
      thumbnail: 'essential-oil.jpg',
    };

    expect(sessionCartEvents.itemAdded(product)).toEqual({
      type: '[Session Cart] itemAdded',
      payload: product,
    });
  });

  it('creates a cart drawer toggle event', () => {
    expect(sessionCartEvents.toggleCartDrawer()).toEqual({
      type: '[Session Cart] toggleCartDrawer',
      payload: undefined,
    });
  });

  it('creates a cart drawer visibility event', () => {
    expect(sessionCartEvents.cartDrawerVisibilityChanged(false)).toEqual({
      type: '[Session Cart] cartDrawerVisibilityChanged',
      payload: false,
    });
  });
});
