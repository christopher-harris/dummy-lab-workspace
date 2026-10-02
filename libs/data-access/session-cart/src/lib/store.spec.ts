import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { injectDispatch } from '@ngrx/signals/events';
import type { Cart, CartProduct } from '@dummy-lab/shared-models';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import { beforeEach, describe, expect, it } from 'vitest';

import { SESSION_CART_STORAGE_KEY } from './config';
import { sessionCartEvents } from './events';
import { SessionCartStore } from './store';

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

const cart: Cart = {
  id: 1,
  products: [product],
  total: 9.99,
  discountedTotal: 9.99,
  userId: 1,
  totalProducts: 1,
  totalQuantity: 1,
};

const setup = () => {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      {
        provide: RUNTIME_CONFIG,
        useValue: {
          environment: 'local',
          apiBaseUrl: 'https://dummyjson.com',
          features: { experimentalCatalog: false },
        },
      },
    ],
  });

  return {
    dispatch: TestBed.runInInjectionContext(() =>
      injectDispatch(sessionCartEvents),
    ),
    http: TestBed.inject(HttpTestingController),
    store: TestBed.inject(SessionCartStore),
  };
};

describe('SessionCartStore', () => {
  beforeEach(() => {
    localStorage.removeItem('dummy-lab-auth');
    localStorage.removeItem(SESSION_CART_STORAGE_KEY);
    TestBed.resetTestingModule();
  });

  it('starts without a cart for the current session', () => {
    const { store } = setup();

    expect(store.cart()).toBeNull();
  });

  it('persists cart state to localStorage', () => {
    const { store } = setup();

    patchState(store, { cart });

    expect(JSON.parse(localStorage.getItem(SESSION_CART_STORAGE_KEY) ?? '{}'))
      .toEqual({ cart, cartDrawerVisible: false });
  });

  it('rehydrates a saved cart on initialization', () => {
    localStorage.setItem(SESSION_CART_STORAGE_KEY, JSON.stringify({ cart }));

    const { store } = setup();

    expect(store.cart()).toEqual(cart);
  });

  it('toggles the cart drawer when requested', () => {
    const { dispatch, store } = setup();

    expect(store.cartDrawerVisible()).toBe(false);

    dispatch.toggleCartDrawer();
    expect(store.cartDrawerVisible()).toBe(true);

    dispatch.toggleCartDrawer();
    expect(store.cartDrawerVisible()).toBe(false);
  });

  it('sets cart drawer visibility from the drawer model', () => {
    const { dispatch, store } = setup();

    dispatch.cartDrawerVisibilityChanged(true);
    expect(store.cartDrawerVisible()).toBe(true);

    dispatch.cartDrawerVisibilityChanged(false);
    expect(store.cartDrawerVisible()).toBe(false);
  });

  it('creates a cart from the first added item and keeps the returned ID', () => {
    const { dispatch, http, store } = setup();
    const createdCart = { ...cart, id: 51 };

    dispatch.itemAdded(product);

    const request = http.expectOne('https://dummyjson.com/carts/add');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      userId: 1,
      products: [{ id: product.id, quantity: product.quantity }],
    });

    request.flush(createdCart);

    expect(store.cart()).toEqual(createdCart);
    expect(store.cart()?.id).toBe(51);
    http.verify();
  });

  it('updates the existing cart instead of creating another one', () => {
    const { dispatch, http, store } = setup();
    patchState(store, { cart: { ...cart, id: 47 } });
    const updatedCart = { ...cart, totalQuantity: 2 };

    dispatch.itemAdded(product);

    http.expectNone('https://dummyjson.com/carts/add');
    const request = http.expectOne('https://dummyjson.com/carts/1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      merge: true,
      products: [{ id: product.id, quantity: product.quantity }],
    });

    request.flush(updatedCart);

    expect(store.cart()).toEqual(updatedCart);
    http.verify();
  });
});
