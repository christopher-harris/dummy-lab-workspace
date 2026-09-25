import { inject, resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources,
  withResource,
} from '@angular-architects/ngrx-toolkit';
import { signalStore, withProps } from '@ngrx/signals';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';

import { fetchCarts } from './api';
import type { Cart, CartsResponse } from './models';
import { httpResource } from '@angular/common/http';

export const CartsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('carts'),
  withCallState({ collection: 'cartsRequest' }),
  withProps(() => ({
    apiBaseUrl: inject(RUNTIME_CONFIG).apiBaseUrl,
  })),
  withResource(({ apiBaseUrl }) => ({
    allCarts: httpResource<CartsResponse>(() => `${apiBaseUrl}/carts`),
  })),
  withEntityResources(({ apiBaseUrl }) => ({
    carts: resource<Cart[], void>({
      loader: ({ abortSignal }) => fetchCarts(apiBaseUrl, abortSignal),
      defaultValue: [],
    }),
  })),
);
