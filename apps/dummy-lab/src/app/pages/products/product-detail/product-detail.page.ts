import {Component, inject} from '@angular/core';
import {ProductsStore} from "@dummy-lab/data-access-products";
import {JsonPipe} from "@angular/common";

@Component({
  selector: 'dl-product-detail',
  imports: [
    JsonPipe
  ],
  templateUrl: './product-detail.page.html',
  styleUrl: './product-detail.page.css',
})
export class ProductDetailPage {
  productsStore = inject(ProductsStore);

}
