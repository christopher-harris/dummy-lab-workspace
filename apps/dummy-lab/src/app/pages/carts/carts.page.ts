import { Component, inject, signal } from '@angular/core';
import { CartProduct, CartsStore } from '@dummy-lab/data-access-carts';
import {
  CommonModule,
  CurrencyPipe,
  JsonPipe,
  NgOptimizedImage,
} from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { TagModule } from 'primeng/tag';
import { injectDispatch } from '@ngrx/signals/events';
import { ProductsStore, productsEvents } from '@dummy-lab/data-access-products';

@Component({
  selector: 'dl-carts-page',
  imports: [
    JsonPipe,
    TableModule,
    CurrencyPipe,
    ButtonModule,
    DrawerModule,
    NgOptimizedImage,
    CommonModule,
    TagModule,
  ],
  templateUrl: './carts.page.html',
  styleUrl: './carts.page.css',
})
export class CartsPage {
  cartsStore = inject(CartsStore);
  productsStore = inject(ProductsStore);
  router = inject(Router);
  productsDispatch = injectDispatch(productsEvents);

  expandedRows: Record<string, boolean> = {};

  /** Which cart's inner table owns the current selection — keeps the highlight
   *  from leaking into other expanded carts that share a product id. */
  selectedCartId = signal<number | null>(null);
  selectedProduct = signal<CartProduct | null>(null);

  onProductSelectionChange(cartId: number, product: CartProduct | null) {
    if (product) {
      this.selectedCartId.set(cartId);
      this.selectedProduct.set(product);
      this.productsDispatch.productPreviewSelected(product.id);
    } else {
      this.clearPreview();
    }
  }

  onPreviewHide() {
    this.clearPreview();
  }

  stockSeverity(stock: number): 'success' | 'warn' | 'danger' {
    if (stock === 0) return 'danger';
    return stock < 10 ? 'warn' : 'success';
  }

  private clearPreview() {
    this.selectedCartId.set(null);
    this.selectedProduct.set(null);
    this.productsDispatch.productPreviewCleared();
  }
}
