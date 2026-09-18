import { resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources,
} from '@angular-architects/ngrx-toolkit';
import { signalStore } from '@ngrx/signals';

import { fetchCarts } from './api';
import type { Cart } from './models';

export const CartsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('carts'),
  withCallState({ collection: 'cartsRequest' }),
  withEntityResources(() => ({
    carts: resource<Cart[], void>({
      loader: ({ abortSignal }) => fetchCarts(abortSignal),
      defaultValue: [],
    }),
  })),
);
