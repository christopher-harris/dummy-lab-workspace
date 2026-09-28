import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth.page').then((m) => m.AuthPage),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
      {
        path: 'login',
        title: 'Sign in | Dummy Lab',
        loadComponent: () => import('./login/login').then((m) => m.Login),
      },
    ],
  },
];
