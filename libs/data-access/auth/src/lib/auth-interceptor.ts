import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from "@angular/core";
import { AuthStore } from './store';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const accessToken = inject(AuthStore).credentials()?.accessToken;
  const apiBaseUrl = inject(RUNTIME_CONFIG).apiBaseUrl;

  const isConfiguredApiRequest = req.url.startsWith(apiBaseUrl);

  if (!accessToken || !isConfiguredApiRequest) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );
};
