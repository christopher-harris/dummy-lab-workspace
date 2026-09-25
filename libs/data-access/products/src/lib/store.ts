import { computed, inject, resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources, withResource,
} from '@angular-architects/ngrx-toolkit';
import {signalStore, withComputed, withProps, withState} from '@ngrx/signals';

import { fetchAllProductCategories, fetchProducts } from './api';
import {Product, ProductCategory, ProductsResponse} from './models';
import {httpResource} from "@angular/common/http";
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import {on, withReducer} from "@ngrx/signals/events";
import {productsEvents} from "./events";
import {withRouterContext} from "@dummy-lab/shared-state";
import {PRODUCT_ID_PARAM} from "./route-params";

type ProductsState = {
  previewProductId: number | undefined,
  selectedCategory: ProductCategory | undefined,
};

const initialState: ProductsState = {
  previewProductId: undefined,
  selectedCategory: undefined,
};

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withDevtools('products'),
  withRouterContext(),
  withProps(() => ({
    apiBaseUrl: inject(RUNTIME_CONFIG).apiBaseUrl,
  })),
  withComputed(({ routeParamMap }) => ({
    /**
     * Product id from the active `products/:productId` route, or `undefined`
     * when the route carries no usable id. Not wired into `productPreview`
     * yet — this only surfaces the value.
     */
    routeProductId: computed(() => {
      const raw = routeParamMap().get(PRODUCT_ID_PARAM);
      const id = raw === null ? Number.NaN : Number(raw);
      return Number.isInteger(id) && id > 0 ? id : undefined;
    }),
  })),
  withCallState({ collection: 'productsRequest' }),
  withResource(({apiBaseUrl, previewProductId, routeProductId, selectedCategory}) => ({
    allProducts: httpResource<ProductsResponse>(() => {
      const category = selectedCategory();
      return category
        ? `${apiBaseUrl}/products/category/${category.slug}`
        : `${apiBaseUrl}/products`;
    }),
    productPreview: httpResource<Product>(() => {
      const id = previewProductId();
      return id ? `${apiBaseUrl}/products/${id}` : undefined;
    }),
    selectedProduct: httpResource<Product>(() => {
      const id = routeProductId();
      return id ? `${apiBaseUrl}/products/${id}` : undefined;
    }),
  })),
  withEntityResources(({ apiBaseUrl }) => ({
    products: resource<Product[], void>({
      loader: ({ abortSignal }) => fetchProducts(apiBaseUrl, abortSignal),
      defaultValue: [],
    }),
  })),
  // Categories carry no `id` (DummyJSON keys them by `slug`), so they are not
  // entities — `withEntityResources` only accepted them while they were `any[]`.
  withResource(({ apiBaseUrl }) => ({
    productCategories: resource<ProductCategory[], void>({
      loader: () => fetchAllProductCategories(apiBaseUrl),
      defaultValue: [],
    }),
  })),
  withReducer(
    on(productsEvents.productPreviewSelected, (event) => ({previewProductId: event.payload})),
    on(productsEvents.productPreviewCleared, () => ({previewProductId: undefined})),
    on(productsEvents.productCategorySelected, (event, state) => ({selectedCategory:event.payload }))
  )
);
