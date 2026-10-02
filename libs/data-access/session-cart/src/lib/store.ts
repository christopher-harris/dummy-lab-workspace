import { inject } from '@angular/core';
import {
  exhaustOp,
  httpMutation,
  withDevtools,
  withLocalStorage,
  withMutations,
  withStorageSync,
} from '@ngrx-toolkit/core';
import type { Cart, CartProduct } from '@dummy-lab/shared-models';
import { patchState, signalStore, withProps, withState } from '@ngrx/signals';
import {
  Events,
  injectDispatch,
  on,
  withEventHandlers,
  withReducer,
} from '@ngrx/signals/events';
import { AuthStore } from '@dummy-lab/data-access-auth';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import { tap } from 'rxjs';

import { SESSION_CART_STORAGE_KEY } from './config';
import { sessionCartEvents } from './events';

export interface SessionCartUpdate {
  product: CartProduct;
}

export interface SessionCartState {
  cart: Cart | null;
  cartDrawerVisible: boolean;
}

const initialState: SessionCartState = {
  cart: null,
  cartDrawerVisible: false,
};

const GUEST_USER_ID = 1;

/**
 * Source of truth for the current browser session's cart.
 *
 * The first added item creates a DummyJSON cart when this session has none;
 * subsequent items use DummyJSON's documented cart-update simulation. The API
 * simulates both mutations, so no cart changes are durable on its server.
 */
export const SessionCartStore = signalStore(
  { providedIn: 'root' },
  withDevtools('session-cart'),
  withState(initialState),
  withStorageSync({ key: SESSION_CART_STORAGE_KEY }, withLocalStorage()),
  withProps(() => ({
    apiBaseUrl: inject(RUNTIME_CONFIG).apiBaseUrl,
    authStore: inject(AuthStore),
    events: inject(Events),
    sessionCartActions: injectDispatch(sessionCartEvents),
  })),
  withReducer(
    on(sessionCartEvents.toggleCartDrawer, (_event, state) => ({
      cartDrawerVisible: !state.cartDrawerVisible,
    })),
    on(sessionCartEvents.cartDrawerVisibilityChanged, (event) => ({
      cartDrawerVisible: event.payload,
    })),
  ),
  withMutations(({ apiBaseUrl, authStore, sessionCartActions, ...store }) => ({
    createCart: httpMutation({
      // A second quick add while creation is pending must not create a second
      // session cart. It will be handled as an update once creation succeeds.
      operator: exhaustOp,
      request: (product: CartProduct) => ({
        url: `${apiBaseUrl}/carts/add`,
        method: 'POST',
        body: {
          userId: authStore.credentials()?.id ?? GUEST_USER_ID,
          products: [{ id: product.id, quantity: product.quantity }],
        },
      }),
      parse: (response) => response as Cart,
      onSuccess: (cart) => {
        patchState(store, { cart });
        sessionCartActions.cartCreated(cart);
      },
      onError: () =>
        sessionCartActions.cartCreationFailed('Unable to create a cart.'),
    }),
    updateCart: httpMutation({
      operator: exhaustOp,
      request: ({ product }: SessionCartUpdate) => ({
        // DummyJSON only simulates cart updates for its seeded carts. Its
        // documentation uses cart 1, rather than the simulated ID returned
        // by POST /carts/add.
        url: `${apiBaseUrl}/carts/1`,
        method: 'PUT',
        body: {
          // DummyJSON only retains the cart's existing products when this is
          // set. Without it, adding a line would replace the entire cart.
          merge: true,
          products: [{ id: product.id, quantity: product.quantity }],
        },
      }),
      parse: (response) => response as Cart,
      onSuccess: (cart) => {
        patchState(store, { cart });
        sessionCartActions.cartUpdated(cart);
      },
      onError: () =>
        sessionCartActions.cartUpdateFailed('Unable to update the cart.'),
    }),
  })),
  withEventHandlers(({ events, ...store }) => ({
    syncCartOnItemAdded$: events.on(sessionCartEvents.itemAdded).pipe(
      tap((event) => {
        const cart = store.cart();
        if (cart) {
          void store.updateCart({
            product: event.payload,
          });
          return;
        }

        void store.createCart(event.payload);
      }),
    ),
  })),
);
