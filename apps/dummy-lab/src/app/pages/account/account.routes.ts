import {Routes} from "@angular/router";
import {accountGuard} from "./account-guard";


export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./account.page').then(m => m.AccountPage),
    canActivate: [accountGuard]
  }
];
