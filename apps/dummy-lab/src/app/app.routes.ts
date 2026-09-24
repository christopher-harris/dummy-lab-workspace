import {Route} from '@angular/router';
import {ShellComponent} from './components/layout/shell/shell.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        title: 'Dashboard | Dummy Lab',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then(
            (m) => m.DashboardPage,
          ),
        data: {
          icon: 'pi pi-home',
          topLevelNavigation: false,
        },
      },
      {
        path: 'products',
        title: 'Products | Dummy Lab',
        loadComponent: () =>
          import('./pages/products/products.page').then((m) => m.ProductsPage),
        data: {
          icon: 'pi pi-shopping-bag',
          topLevelNavigation: true,
        },
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () =>
              import('./pages/products/products-list/products-list.page').then(
                (m) => m.ProductsListPage,
              ),
          },
          {
            path: ':productId',
            title: 'Product Details',
            loadComponent: () =>
              import(
                './pages/products/product-detail/product-detail.page'
                ).then((m) => m.ProductDetailPage),
          },
        ],
      },
      {
        path: 'users',
        title: 'Users | Dummy Lab',
        loadComponent: () =>
          import('./pages/users/users.page').then((m) => m.UsersPage),
        data: {
          icon: 'pi pi-users',
          topLevelNavigation: true,
        },
      },
      {
        path: 'carts',
        title: 'Carts | Dummy Lab',
        loadComponent: () =>
          import('./pages/carts/carts.page').then((m) => m.CartsPage),
        data: {
          icon: 'pi pi-shopping-cart',
          topLevelNavigation: true,
        },
      },
      {
        path: 'posts',
        title: 'Posts | Dummy Lab',
        loadComponent: () =>
          import('./pages/posts/posts.page').then((m) => m.PostsPage),
        data: {
          icon: 'pi pi-comment',
          topLevelNavigation: true,
        },
      },
      {
        path: 'recipes',
        title: 'Recipes | Dummy Lab',
        loadComponent: () =>
          import('./pages/recipes/recipes.page').then((m) => m.RecipesPage),
        data: {
          icon: 'pi pi-book',
          topLevelNavigation: true,
        },
      },
      {
        path: 'todos',
        title: 'Todos | Dummy Lab',
        loadComponent: () =>
          import('./pages/todos/todos.page').then((m) => m.TodosPage),
        data: {
          icon: 'pi pi-check',
          topLevelNavigation: true,
        },
      },
      {
        path: 'quotes',
        title: 'Quotes | Dummy Lab',
        loadComponent: () =>
          import('./pages/quotes/quotes.page').then((m) => m.QuotesPage),
        data: {
          icon: 'pi pi-quote',
          topLevelNavigation: true,
        },
      },
      {
        path: 'account',
        title: 'Account | Dummy Lab',
        loadChildren: () => import('./pages/account/account.routes').then((m) => m.ACCOUNT_ROUTES),
        data: {
          icon: 'pi pi-user',
          topLevelNavigation: false,
        },
      },
      {
        path: 'auth',
        title: 'Auth | Dummy Lab',
        loadChildren: () => import('./pages/auth/auth.routes').then((m) => m.AUTH_ROUTES),
        // loadComponent: () =>
        //   import('./pages/auth/auth.page').then((m) => m.AuthPage),
        data: {
          topLevelNavigation: false,
        },
      },
    ],
  },
];
