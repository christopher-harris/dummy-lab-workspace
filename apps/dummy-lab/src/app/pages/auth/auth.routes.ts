import {Routes} from "@angular/router";
import {Login} from "./login/login";

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth.page').then(m => m.AuthPage),
    children: [
      {
        path: 'login',
        component: Login
      }
    ],
  }
];
