import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';

import { CMS_API_TOKEN } from './config';

/**
 * Attaches the Strapi API token to CMS requests, and only to CMS requests.
 *
 * Scoped by `cmsBaseUrl` prefix for the same reason `authInterceptor` is
 * scoped by `apiBaseUrl`: an interceptor that matched everything would send
 * this token to DummyJSON, and the DummyJSON access token to Strapi. The two
 * prefixes are disjoint, so the pair never both fire on one request.
 */
export const cmsInterceptor: HttpInterceptorFn = (req, next) => {
  const cmsBaseUrl = inject(RUNTIME_CONFIG).cmsBaseUrl;
  const token = inject(CMS_API_TOKEN);

  const isCmsRequest = req.url.startsWith(cmsBaseUrl);

  if (!token || !isCmsRequest) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
