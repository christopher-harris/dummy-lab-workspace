import {Component, computed, effect, inject, signal} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {InputText} from 'primeng/inputtext';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Router, RouterLink, Routes} from '@angular/router';
import {MenuItem} from 'primeng/api';
import {MenubarModule, MenubarPassThrough} from 'primeng/menubar';
import {ToolbarModule, ToolbarPassThrough} from 'primeng/toolbar';
import {AvatarModule} from 'primeng/avatar';
import {MenuModule} from 'primeng/menu';
import {PRIMARY_COLORS, ThemeStore} from "@dummy-lab/data-access-theme";
import {authEvents, AuthStore} from "@dummy-lab/data-access-auth";
import {injectDispatch} from "@ngrx/signals/events";
import {UsersStore} from "@dummy-lab/data-access-users";

@Component({
  selector: 'dl-navbar',
  imports: [
    CommonModule,
    MenubarModule,
    ToolbarModule,
    AvatarModule,
    ButtonModule,
    IconField,
    InputIcon,
    InputText,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    MenuModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  authStore = inject(AuthStore);
  authActions = injectDispatch(authEvents);
  usersStore = inject(UsersStore);
  search = '';
  themeStore = inject(ThemeStore);

  readonly colors = PRIMARY_COLORS;

  router = inject(Router);
  routeConfig = computed<Routes>(() => this.router.config);

  apps = computed(
    () =>
      this.routeConfig()[0].children?.filter(
        (route) => route.data?.['topLevelNavigation'] === true,
      ) ?? [],
  );

  colorMenuItems = computed<MenuItem[]>(() => [
    {
      label: 'Primary Color',
      items: PRIMARY_COLORS.map((color) => ({
        label: color,
        color,
        selected: this.themeStore.primaryColor() === color,
        command: () => this.themeStore.setPrimaryColor(color),
      })),
    },
  ]);

  menuItems = computed<MenuItem[]>(() => {
    return this.apps().map((appRoute) => {
      const menuItem: MenuItem = {
        routerLink: appRoute.path,
        icon: appRoute.data?.['icon'],
        label: (appRoute.title ?? appRoute.path) as string,
      };
      return menuItem;
    });
  });

  accountMenuItems = computed<MenuItem[]>(() => [
    {
      label: 'Account',
      routerLink: '/account',
    },
    {
      label: 'Logout',
      command: () => this.onLogoutClicked(),
    }
  ]);

  toolbarPassThrough: ToolbarPassThrough = {
    root: {
      class:
        'relative bg-surface-0 dark:bg-surface-900 gap-4 md:gap-8 px-6 md:px-12 lg:px-20 py-4',
    },
    start: {},
    center: {},
    end: {
      class: 'hidden lg:flex items-center gap-4',
    },
  };

  menuPassThrough: MenubarPassThrough = {
    root: {
      class: 'border-0',
    },
    itemLabel: {
      class: 'lg:hidden',
    },
  };

  constructor() {
    // console.log(this.themeStore.isDark());
    // console.log(this.router.config);
    effect(() => {
      console.log(this.menuItems());
      console.log(this.authStore.isLoggedIn());
    });
  }

  onLogoutClicked() {
    console.log('logout clicked');
    this.authActions.logoutRequested();
  }

}
