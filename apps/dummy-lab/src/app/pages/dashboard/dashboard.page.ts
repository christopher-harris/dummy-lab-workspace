import { Component, computed, inject } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { Router, RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { BaseStatsComponent } from './components/base-stats/base-stats.component';
import {TopPostsCardComponent} from "./components/top-posts-card/top-posts-card.component";

/** Placeholder row in the "top products" panel — static mock data for now. */
interface TopProduct {
  name: string;
  percentage: number;
  category: string;
  icon: string;
}

@Component({
  selector: 'dl-dashboard',
  imports: [
    DividerModule,
    RouterLink,
    ButtonModule,
    MenuModule,
    BaseStatsComponent,
    TopPostsCardComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css',
})
export class DashboardPage {
  router = inject(Router);
  routeConfig = this.router.config;

  apps = computed(() =>
    this.routeConfig.filter(
      (route) => route.path !== '' && route.path !== 'dashboard',
    ),
  );

  breadcrumbs: MenuItem[] = [{ label: 'Dashboard', url: '#' }];

  items: MenuItem[] = [
    { label: 'View Details', icon: 'pi pi-fw pi-eye' },
    { label: 'Export as CSV', icon: 'pi pi-fw pi-file-export' },
    { label: 'Update Data', icon: 'pi pi-fw pi-refresh' },
    { separator: true },
    { label: 'Add New Product', icon: 'pi pi-fw pi-plus' },
    {
      label: 'Remove Product',
      icon: 'pi pi-fw pi-trash',
      className: 'text-red-500',
    },
  ];

  products: TopProduct[] = [
    {
      name: 'Bitcoin Mining Tool',
      percentage: 91,
      category: 'Mining',
      icon: 'pi pi-cog',
    },
    {
      name: 'Ethereum Smart Contract Kit',
      percentage: 82,
      category: 'Smart Contracts',
      icon: 'pi pi-file',
    },
    {
      name: 'Stellar Payment Gateway',
      percentage: 75,
      category: 'Payments',
      icon: 'pi pi-credit-card',
    },
    {
      name: 'Ripple Cross-Border Solution',
      percentage: 63,
      category: 'Cross-Border',
      icon: 'pi pi-globe',
    },
    {
      name: 'Crypto Analytics Dashboard',
      percentage: 48,
      category: 'Analytics',
      icon: 'pi pi-chart-bar',
    },
    {
      name: 'Cardano Stacking Platform',
      percentage: 39,
      category: 'Stacking',
      icon: 'pi pi-database',
    },
  ];

  constructor() {
    // effect(() => {
    //     console.log(this.routeConfig);
    // });
  }
}
