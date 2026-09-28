import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'dl-products-page',
  imports: [RouterOutlet],
  templateUrl: './products.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './products.page.css',
})
export class ProductsPage {}
