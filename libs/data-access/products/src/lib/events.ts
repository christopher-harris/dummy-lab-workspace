import {eventGroup} from "@ngrx/signals/events";
import {type} from "@ngrx/signals";
import {ProductCategory} from "./models";

export const productsEvents = eventGroup({
  source: 'Products',
  events: {
    productPreviewSelected: type<number>(),
    productPreviewCleared: type<void>(),
    productCategorySelected: type<ProductCategory>(),
  }
});
