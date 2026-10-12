import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideServerRuntimeConfig } from '@dummy-lab/shared-runtime-config';

import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/**
 * Declared locally rather than by adding `"node"` to `tsconfig.app.json`.
 *
 * That `"types": []` is deliberate — it is what stops browser code reaching
 * for Node APIs by accident. Widening it for the one file that legitimately
 * needs `process` would remove the guard everywhere to serve a single call
 * site, so the narrow declaration stays here with the code that uses it.
 */
declare const process: {
  readonly env: Readonly<Record<string, string | undefined>>;
};

/**
 * Where the server gets its configuration, given it cannot fetch its own.
 *
 * The browser reads `/runtime-config.json`, which Cloudflare serves from
 * `RUNTIME_CONFIG_JSON` via `functions/runtime-config.json.ts`. There is no
 * server during a static build and no document to resolve the URL against, so
 * the build reads **the same environment variable in the same shape** the
 * Pages Function does. One contract, two transports — not a second config
 * format.
 *
 * **Throws when unset, deliberately.** The alternatives are worse: a default
 * would prerender the site against the wrong CMS and deploy it looking
 * healthy, and skipping the CMS routes would replace a working marketing site
 * with one that has no pages. A build that stops with this message costs
 * minutes; either silent failure costs a production incident.
 */
function serverRuntimeConfig(): unknown {
  const raw = process.env['RUNTIME_CONFIG_JSON'];

  if (!raw) {
    throw new Error(
      'RUNTIME_CONFIG_JSON is not set. Prerendering resolves content at build ' +
        'time, so the build needs the same configuration the browser is served ' +
        'at runtime. Set it to the contents of a runtime-config.json document.',
    );
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('RUNTIME_CONFIG_JSON is not valid JSON.');
  }
}

/**
 * Server-side additions to `appConfig`.
 *
 * Merged rather than replacing it, so the application renders on the server
 * with the providers it has in the browser — the same stores, the same
 * interceptors, the same `CMS_API_TOKEN`. Only the two things that genuinely
 * differ by platform are added here: how configuration arrives, and the
 * render-mode table.
 */
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideServerRuntimeConfig(serverRuntimeConfig()),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
