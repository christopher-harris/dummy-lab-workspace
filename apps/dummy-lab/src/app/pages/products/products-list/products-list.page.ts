import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ProductsStore, Product, productsEvents} from '@dummy-lab/data-access-products';
import { DataViewModule } from 'primeng/dataview';
import {SelectChangeEvent, SelectModule} from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { SelectItem } from 'primeng/api';
import { RouterLink } from '@angular/router';
import {injectDispatch} from "@ngrx/signals/events";

type Layout = 'list' | 'grid';

@Component({
  selector: 'dl-products-list-page',
  imports: [
    CurrencyPipe,
    DecimalPipe,
    FormsModule,
    DataViewModule,
    SelectModule,
    SelectButtonModule,
    TagModule,
    RatingModule,
    ButtonModule,
    SkeletonModule,
    MessageModule,
    RouterLink,
  ],
  templateUrl: './products-list.page.html',
  styleUrl: './products-list.page.css',
})
export class ProductsListPage {
  readonly productsStore = inject(ProductsStore);
  productsActions = injectDispatch(productsEvents);

  /** The grid is driven off the `allProducts` httpResource in ProductsStore. */
  readonly products = computed<Product[]>(
    () => this.productsStore.allProductsValue()?.products ?? [],
  );

  readonly layout = signal<Layout>('grid');
  readonly layoutOptions: Layout[] = ['grid', 'list'];

  readonly sortOptions: SelectItem[] = [
    { label: 'Price: High to Low', value: '!price' },
    { label: 'Price: Low to High', value: 'price' },
    { label: 'Top Rated', value: '!rating' },
    { label: 'Name: A to Z', value: 'title' },
  ];

  readonly sortKey = signal<string | null>(null);
  readonly sortField = computed(() => this.sortKey()?.replace('!', '') ?? '');
  readonly sortOrder = computed(() => (this.sortKey()?.startsWith('!') ? -1 : 1));

  /** Placeholder rows for the skeleton templates. */
  readonly skeletons = Array.from({ length: 8 });

  stockLabel(product: Product): string {
    if (product.stock === 0) return 'Out of Stock';
    return product.stock < 10 ? `Low Stock (${product.stock})` : 'In Stock';
  }

  stockSeverity(product: Product): 'success' | 'warn' | 'danger' {
    if (product.stock === 0) return 'danger';
    return product.stock < 10 ? 'warn' : 'success';
  }

  onCategoryChange(event: SelectChangeEvent) {
    console.log(event);
    this.productsActions.productCategorySelected(event.value);
  }

}
