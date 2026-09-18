import { Route } from '@angular/router';
import {ShellComponent} from "./components/layout/shell/shell.component";

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
            import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
        data: {
          icon: 'pi pi-home'
        }
      },
      {
        path: 'products',
        title: 'Products | Dummy Lab',
        loadComponent: () =>
            import('./pages/products/products.page').then((m) => m.ProductsPage),
      },
      {
        path: 'users',
        title: 'Users | Dummy Lab',
        loadComponent: () =>
            import('./pages/users/users.page').then((m) => m.UsersPage),
      },
      {
        path: 'carts',
        title: 'Carts | Dummy Lab',
        loadComponent: () =>
            import('./pages/carts/carts.page').then((m) => m.CartsPage),
      },
      {
        path: 'posts',
        title: 'Posts | Dummy Lab',
        loadComponent: () =>
            import('./pages/posts/posts.page').then((m) => m.PostsPage),
      },
      {
        path: 'recipes',
        title: 'Recipes | Dummy Lab',
        loadComponent: () =>
            import('./pages/recipes/recipes.page').then((m) => m.RecipesPage),
      },
      {
        path: 'todos',
        title: 'Todos | Dummy Lab',
        loadComponent: () =>
            import('./pages/todos/todos.page').then((m) => m.TodosPage),
      },
      {
        path: 'quotes',
        title: 'Quotes | Dummy Lab',
        loadComponent: () =>
            import('./pages/quotes/quotes.page').then((m) => m.QuotesPage),
      },
      {
        path: 'auth',
        title: 'Auth | Dummy Lab',
        loadComponent: () =>
            import('./pages/auth/auth.page').then((m) => m.AuthPage),
      },
    ]
  },
];
