import { Component, computed, inject } from '@angular/core';
import { CartsStore } from '@dummy-lab/data-access-carts';
import { UsersStore } from '@dummy-lab/data-access-users';
import {SkeletonModule} from "primeng/skeleton";
import {ProductsStore} from "@dummy-lab/data-access-products";
import {PostsStore} from "@dummy-lab/data-access-posts";

export interface BaseStat {
  label: string;
  value: string | number;
  /** PrimeIcons class, e.g. `pi-envelope` */
  icon: string;
  /** Tailwind gradient classes for the icon tile */
  iconGradient: string;
  /** Emphasized leading text in the footer, e.g. `24 new` */
  highlight?: string;
  /** Muted footer text */
  footnote: string;
  /**
   * Whether this stat's underlying request is in flight. Wire to a store's
   * `withCallState` loading signal (e.g. `cartsStore.cartsRequestLoading()`)
   * or a `withResource` one (e.g. `cartsStore.allCartsIsLoading()`).
   * Omitted / falsy renders the value as normal.
   */
  loading?: boolean;
}

@Component({
  selector: 'dl-base-stats',
  imports: [SkeletonModule],
  templateUrl: './base-stats.component.html',
  styleUrl: './base-stats.component.css',
})
export class BaseStatsComponent {
  cartsStore = inject(CartsStore);
  usersStore = inject(UsersStore);
  productsStore = inject(ProductsStore);
  postsStore = inject(PostsStore);

  readonly stats = computed<BaseStat[]>(() => [
    {
      label: 'Carts',
      value: this.cartsStore.allCartsValue()?.total ?? '',
      icon: 'pi-shopping-cart',
      iconGradient:
        'from-cyan-400 dark:from-cyan-300 to-cyan-600 dark:to-cyan-500',
      highlight: '24 new',
      footnote: 'since last visit',
      loading: this.cartsStore.allCartsIsLoading(),
    },
    {
      label: 'Posts',
      value: this.postsStore.allPostsValue()?.total ?? '',
      icon: 'pi-map-marker',
      iconGradient:
        'from-orange-400 dark:from-orange-300 to-orange-600 dark:to-orange-500',
      highlight: '48 new',
      footnote: 'since last visit',
      loading: this.postsStore.allPostsIsLoading(),
    },
    {
      label: 'Products',
      value: this.productsStore.allProductsValue()?.total ?? '',
      icon: 'pi-file',
      iconGradient:
        'from-slate-400 dark:from-slate-300 to-slate-600 dark:to-slate-500',
      footnote: '32,56 / 250 GB',
      loading: this.productsStore.allProductsIsLoading(),
    },
    {
      label: 'Users',
      value: this.usersStore.allUsersValue()?.total ?? '',
      icon: 'pi-users',
      iconGradient:
        'from-violet-400 dark:from-violet-300 to-violet-600 dark:to-violet-500',
      highlight: '72 new',
      footnote: 'user this week',
      loading: this.usersStore.allUsersIsLoading(),
    },
  ]);
}
