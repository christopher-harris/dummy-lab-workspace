import {
  bootstrapApplication,
  type BootstrapContext,
} from '@angular/platform-browser';

import { App } from './app/app';
import { config } from './app/app.config.server';

/**
 * Server entry point.
 *
 * Deliberately without `main.ts`'s startup-error handling: that handler
 * rewrites the DOM to show a configuration failure, which is the right
 * behaviour for a visitor and the wrong one for a build. A prerender that
 * cannot resolve its configuration must fail the build loudly rather than
 * emit a page politely explaining that it could not.
 *
 * `context` is optional in the signature and mandatory in practice —
 * rendering without it fails with `NG0401 — Missing Platform`, because the
 * platform is created per render and passed in rather than existing globally
 * the way it does in a browser.
 */
export default function bootstrap(context: BootstrapContext) {
  return bootstrapApplication(App, config, context);
}
