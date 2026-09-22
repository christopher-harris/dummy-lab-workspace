import {Component, inject, signal} from '@angular/core';
import {CartProduct, CartsStore} from "@dummy-lab/data-access-carts";
import {CommonModule, CurrencyPipe, JsonPipe, NgOptimizedImage} from "@angular/common";
import {TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {Router} from "@angular/router";
import {DrawerModule} from "primeng/drawer";
import {TagModule} from "primeng/tag";
import {injectDispatch} from "@ngrx/signals/events";
import {ProductsStore, productsEvents} from "@dummy-lab/data-access-products";

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
    TagModule
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




// import { Component, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ButtonModule } from 'primeng/button';
// import { DialogModule } from 'primeng/dialog';
//
// @Component({
//   selector: 'single-picture-with-selectors',
//   standalone: true,
//   imports: [CommonModule, ButtonModule, DialogModule],
//   template: `
//         <div class="bg-surface-0 dark:bg-surface-950 px-6 py-20 md:px-12 lg:px-20 flex justify-center">
//             <div class="shadow rounded-2xl bg-surface-0 dark:bg-surface-900 p-2" (mouseenter)="hovered.set(true)" (mouseleave)="hovered.set(false)">
//                 <div class="relative">
//                     <img src="https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/productquickview/single-picture-1.jpg" class="w-60 h-auto object-cover rounded-xl" />
//                     @if (hovered()) {
//                         <button
//                             class="bottom-4 left-4 animate-fadein absolute border-0 bg-black/40 hover:bg-black/50 text-white font-medium text-base rounded-xl cursor-pointer transition-colors duration-300 w-52 px-4 py-2"
//                             (click)="visibleDialog.set(true)"
//                         >
//                             View Details
//                         </button>
//                     }
//                 </div>
//                 <div class="flex items-center justify-between text-xl font-medium mt-4 text-surface-900 dark:text-surface-0 px-4 py-2">
//                     <span class="text-lg font-normal leading-tight">Hover Image</span>
//                     <span class="font-normal leading-tight">$90.00</span>
//                 </div>
//             </div>
//
//             <p-dialog
//                 [(visible)]="visibleDialog"
//                 [modal]="true"
//                 [breakpoints]="{ '1024px': '90vw', '768px': '95vw', '640px': '90vw' }"
//                 [style]="{ width: '65vw', minWidth: '320px', maxWidth: '900px' }"
//                 styleClass="border-0! bg-transparent!"
//                 maskStyleClass="backdrop-blur-sm"
//                 [showHeader]="false"
//             >
//                 <ng-template #headless>
//                     <div class="h-auto lg:h-auto p-6 bg-surface-0 dark:bg-surface-900 rounded-2xl shadow-xl flex flex-col lg:flex-row justify-start items-start gap-6 lg:gap-8">
//                         <img
//                             class="w-full lg:flex-1 h-full max-h-132 lg:h-full object-cover rounded-lg object-top lg:object-center"
//                             src="https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/ecommerce/productquickview/single-picture-1.jpg"
//                         />
//
//                         <div class="flex-1 w-full lg:w-auto flex flex-col justify-start items-start gap-6 lg:gap-8 h-full lg:min-h-132">
//                             <div class="w-full flex justify-between items-start gap-4">
//                                 <div class="flex-1 flex flex-col justify-center items-start gap-3 lg:gap-4">
//                                     <div class="w-full text-surface-900 dark:text-surface-0 text-xl lg:text-2xl font-semibold leading-tight">Flame Tie-Dye Dress</div>
//                                     <div class="w-full flex justify-start items-center gap-3 lg:gap-4">
//                                         <div class="text-surface-900 dark:text-surface-0 text-lg lg:text-xl font-normal leading-normal">$89</div>
//                                         <div class="w-px h-6 bg-surface-200 dark:bg-surface-700 rounded-lg"></div>
//                                         <div class="flex justify-start items-center gap-2">
//                                             <i class="pi pi-star-fill text-yellow-500 text-sm! leading-none!"></i>
//                                             <div class="text-surface-900 dark:text-surface-0 text-base font-semibold leading-tight">4.9</div>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <button pButton [text]="true" [rounded]="true" severity="secondary" (click)="visibleDialog.set(false)" class="w-10 h-10">
//                                     <i pButtonIcon class="pi pi-times"></i>
//                                 </button>
//                             </div>
//
//                             <div class="self-stretch flex-1 flex flex-col justify-between items-start">
//                                 <div class="self-stretch flex flex-col justify-start items-start gap-6 xl:gap-8">
//                                     <div class="self-stretch text-surface-500 dark:text-surface-400 text-sm xl:text-base font-normal leading-normal">
//                                         Make a statement in this stunning tie-dye wrap dress featuring rich flame-inspired hues. The long sleeves and fitted silhouette create an elegant look.
//                                     </div>
//
//                                     <div class="self-stretch flex flex-col justify-start items-start gap-3 xl:gap-4">
//                                         <div class="self-stretch text-surface-900 dark:text-surface-0 text-sm xl:text-base font-semibold leading-tight">Color</div>
//                                         <div class="flex justify-start items-start gap-3 xl:gap-4">
//                                             <div
//                                                 class="rounded-full cursor-pointer transition-all duration-150 outline outline-2 outline-surface-0 dark:outline-surface-900"
//                                                 [ngClass]="color === 'flame' ? 'ring-2 ring-[#f06f37] ring-offset-1 ring-offset-surface-0 dark:ring-offset-surface-900' : ''"
//                                                 (click)="color = 'flame'"
//                                             >
//                                                 <div class="w-7 h-7 bg-[#f06f37] rounded-full"></div>
//                                             </div>
//                                             <div
//                                                 class="rounded-full cursor-pointer transition-all duration-150 outline outline-2 outline-surface-0 dark:outline-surface-900"
//                                                 [ngClass]="color === 'amber' ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-surface-0 dark:ring-offset-surface-900' : ''"
//                                                 (click)="color = 'amber'"
//                                             >
//                                                 <div class="w-7 h-7 bg-amber-400 rounded-full"></div>
//                                             </div>
//                                             <div
//                                                 class="rounded-full cursor-pointer transition-all duration-150 outline outline-2 outline-surface-0 dark:outline-surface-900"
//                                                 [ngClass]="color === 'gray' ? 'ring-2 ring-surface-300 dark:ring-surface-600 ring-offset-1 ring-offset-surface-0 dark:ring-offset-surface-900' : ''"
//                                                 (click)="color = 'gray'"
//                                             >
//                                                 <div class="w-7 h-7 bg-[#d5d3d1] rounded-full"></div>
//                                             </div>
//                                         </div>
//                                     </div>
//
//                                     <div class="flex-1 self-stretch flex flex-col justify-start items-start gap-3 xl:gap-4">
//                                         <div class="self-stretch text-surface-900 dark:text-surface-0 text-sm xl:text-base font-semibold leading-tight">Size</div>
//                                         <div class="self-stretch flex flex-wrap justify-start items-start gap-2 xl:gap-3">
//                                             <div
//                                                 class="px-3 py-2 xl:px-4 xl:py-2 rounded flex flex-col justify-center items-center gap-2 cursor-pointer transition-all duration-300 min-w-10 xl:min-w-12"
//                                                 [ngClass]="size === 'XS' ? 'bg-primary-50 dark:bg-primary-400/30 outline outline-2 outline-primary-500' : 'outline outline-1 outline-surface-200 dark:outline-surface-700'"
//                                                 (click)="size = 'XS'"
//                                             >
//                                                 <div class="text-sm xl:text-base font-normal leading-normal" [ngClass]="size === 'XS' ? 'text-primary-500' : 'text-surface-900 dark:text-surface-0'">XS</div>
//                                             </div>
//                                             <div
//                                                 class="px-3 py-2 xl:px-4 xl:py-2 rounded flex flex-col justify-center items-center gap-2 cursor-pointer transition-all duration-300 min-w-10 xl:min-w-12"
//                                                 [ngClass]="size === 'S' ? 'bg-primary-50 dark:bg-primary-400/30 outline outline-2 outline-primary-500' : 'outline outline-1 outline-surface-200 dark:outline-surface-700'"
//                                                 (click)="size = 'S'"
//                                             >
//                                                 <div class="text-sm xl:text-base font-normal leading-normal" [ngClass]="size === 'S' ? 'text-primary-500' : 'text-surface-900 dark:text-surface-0'">S</div>
//                                             </div>
//                                             <div
//                                                 class="px-3 py-2 xl:px-4 xl:py-2 rounded flex flex-col justify-center items-center gap-2 cursor-pointer transition-all duration-300 min-w-10 xl:min-w-12"
//                                                 [ngClass]="size === 'M' ? 'bg-primary-50 dark:bg-primary-400/30 outline outline-2 outline-primary-500' : 'outline outline-1 outline-surface-200 dark:outline-surface-700'"
//                                                 (click)="size = 'M'"
//                                             >
//                                                 <div class="text-sm xl:text-base font-normal leading-normal" [ngClass]="size === 'M' ? 'text-primary-500' : 'text-surface-900 dark:text-surface-0'">M</div>
//                                             </div>
//                                             <div
//                                                 class="px-3 py-2 xl:px-4 xl:py-2 opacity-20 rounded outline outline-1 outline-surface-200 dark:outline-surface-700 flex flex-col justify-center items-center gap-2 cursor-not-allowed min-w-10 xl:min-w-12"
//                                             >
//                                                 <div class="text-sm xl:text-base font-normal leading-normal text-surface-900 dark:text-surface-0">L</div>
//                                             </div>
//                                             <div
//                                                 class="px-3 py-2 xl:px-4 xl:py-2 opacity-20 rounded outline outline-1 outline-surface-200 dark:outline-surface-700 flex flex-col justify-center items-center gap-2 cursor-not-allowed min-w-10 xl:min-w-12"
//                                             >
//                                                 <div class="text-sm xl:text-base font-normal leading-normal text-surface-900 dark:text-surface-0">XL</div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//
//                                 <button pButton class="self-stretch mt-8" severity="contrast">
//                                     <span pButtonLabel>Add to Cart</span>
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </ng-template>
//             </p-dialog>
//         </div>
//     `
// })
// export class SinglePictureWithSelectors {
//   hovered = signal(false);
//   visibleDialog = signal(false);
//   color: string = 'flame';
//   size: string = 'M';
// }

