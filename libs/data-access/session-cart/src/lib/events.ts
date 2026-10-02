import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';
import type { Cart, CartProduct } from '@dummy-lab/shared-models';

export interface CartItemQuantityChange {
  productId: CartProduct['id'];
  quantity: number;
}

/**
 * Domain events for the cart associated with the current browser session.
 *
 * The group intentionally describes cart facts and user intent only. The
 * store currently handles `itemAdded` by creating or updating a cart; later
 * reducers or handlers will define the remaining state transitions.
 */
export const sessionCartEvents = eventGroup({
  source: 'Session Cart',
  events: {
    /** A new cart is ready to become the session cart. */
    cartCreated: type<Cart>(),
    /** A new cart could not be created. */
    cartCreationFailed: type<string>(),
    /** An existing cart was updated. */
    cartUpdated: type<Cart>(),
    /** An existing cart could not be updated. */
    cartUpdateFailed: type<string>(),
    /** A previously persisted cart was restored into this session. */
    cartRestored: type<Cart>(),
    /** The session cart drawer visibility was toggled. */
    toggleCartDrawer: type<void>(),
    /** The session cart drawer requested a specific visibility state. */
    cartDrawerVisibilityChanged: type<boolean>(),
    /** A product line was added to the current session cart. */
    itemAdded: type<CartProduct>(),
    /** The requested quantity for a product line changed. */
    itemQuantityChanged: type<CartItemQuantityChange>(),
    /** A product line was removed from the cart. */
    itemRemoved: type<CartProduct['id']>(),
    /** Every product line was removed from the cart. */
    cartCleared: type<void>(),
    /** Checkout was initiated for the current cart. */
    checkoutRequested: type<void>(),
    /** Checkout completed with the finalized cart. */
    checkoutCompleted: type<Cart>(),
    /** Checkout could not complete. */
    checkoutFailed: type<string>(),
  },
});
