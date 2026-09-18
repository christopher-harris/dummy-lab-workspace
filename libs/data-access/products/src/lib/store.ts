import {resource} from '@angular/core';
import {
    withCallState,
    withDevtools,
    withEntityResources,
} from '@angular-architects/ngrx-toolkit';
import {signalStore} from '@ngrx/signals';

import {fetchAllProductCategories, fetchProducts} from './api';
import type {Product} from './models';

export const ProductsStore = signalStore(
    {providedIn: 'root'},
    withDevtools('products'),
    withCallState({collection: 'productsRequest'}),
    withEntityResources(() => ({
        products: resource<Product[], void>({
            loader: ({abortSignal}) => fetchProducts(abortSignal),
            defaultValue: [],
        }),
    })),
    withEntityResources(() => ({
        productCategories: resource<any[], void>({
            loader: () => fetchAllProductCategories(),
            defaultValue: []
        })
    }))
);
