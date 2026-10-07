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
        Authorization: `Bearer 7374df3e82cc8146dbb5c3c728ed2e74d6ff838fa86a1c66007b498f6c330cfc6b1df23989e514fe9bb6076dce609e5c5a0e4c9d2754bf1756fe02083253e86c069a31684243d00bf0daa0b602ef03c49c26b4840d1e2060bc01d498a120ec0a715b2120786a768d7a78e82bf7942592ecd05af0853b12459fcbc4b8a90ba74d`,
      },
    }),
  );
};
