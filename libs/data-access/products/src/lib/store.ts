import { computed, resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources, withResource,
} from '@angular-architects/ngrx-toolkit';
import {signalStore, withComputed, withState} from '@ngrx/signals';

import { fetchAllProductCategories, fetchProducts } from './api';
import {Product, ProductCategory, ProductsResponse} from './models';
import {httpResource} from "@angular/common/http";
import {DUMMY_JSON_BASE_URL} from "@dummy-lab/shared-utils";
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
  withResource(({previewProductId, routeProductId, selectedCategory}) => ({
    allProducts: httpResource<ProductsResponse>(() => {
      const category = selectedCategory();
      return category
        ? `${DUMMY_JSON_BASE_URL}/products/category/${category.slug}`
        : `${DUMMY_JSON_BASE_URL}/products`;
    }),
    productPreview: httpResource<Product>(() => {
      const id = previewProductId();
      return id ? `${DUMMY_JSON_BASE_URL}/products/${id}` : undefined;
    }),
    selectedProduct: httpResource<Product>(() => {
      const id = routeProductId();
      return id ? `${DUMMY_JSON_BASE_URL}/products/${id}` : undefined;
    }),
  })),
  withEntityResources(() => ({
    products: resource<Product[], void>({
      loader: ({ abortSignal }) => fetchProducts(abortSignal),
      defaultValue: [],
    }),
  })),
  // Categories carry no `id` (DummyJSON keys them by `slug`), so they are not
  // entities — `withEntityResources` only accepted them while they were `any[]`.
  withResource(() => ({
    productCategories: resource<ProductCategory[], void>({
      loader: () => fetchAllProductCategories(),
      defaultValue: [],
    }),
  })),
  withReducer(
    on(productsEvents.productPreviewSelected, (event) => ({previewProductId: event.payload})),
    on(productsEvents.productPreviewCleared, () => ({previewProductId: undefined})),
    on(productsEvents.productCategorySelected, (event, state) => ({selectedCategory:event.payload }))
  )
);
