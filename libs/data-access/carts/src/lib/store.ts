import { DUMMY_JSON_BASE_URL } from '@dummy-lab/shared-utils';

import { resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources,
  withResource,
} from '@angular-architects/ngrx-toolkit';
import { signalStore } from '@ngrx/signals';

import { fetchCarts } from './api';
import type { Cart, CartsResponse } from './models';
import { httpResource } from '@angular/common/http';

export const CartsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('carts'),
  withCallState({ collection: 'cartsRequest' }),
  withResource(() => ({
    allCarts: httpResource<CartsResponse>(() => `${DUMMY_JSON_BASE_URL}/carts`),
  })),
  withEntityResources(() => ({
    carts: resource<Cart[], void>({
      loader: ({ abortSignal }) => fetchCarts(abortSignal),
      defaultValue: [],
    }),
  })),
);
