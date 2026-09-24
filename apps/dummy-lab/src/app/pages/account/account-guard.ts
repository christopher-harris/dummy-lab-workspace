import { inject } from '@angular/core';
import { ResolveFn, Router, UrlTree } from '@angular/router';
import { AuthStore } from '@dummy-lab/data-access-auth';

export const accountGuard: ResolveFn<boolean | UrlTree> = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return authStore.isLoggedIn() ? true : router.createUrlTree(['/auth/login']);
};
