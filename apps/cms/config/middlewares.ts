import type { Core } from '@strapi/strapi';

/**
 * Where the Preview feature is allowed to point, and therefore what the admin
 * is allowed to put in an iframe. Kept in one place so the CSP below and
 * `admin.ts`'s `allowedOrigins` cannot drift apart.
 */
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:4200';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          /**
           * Strapi's defaults set `default-src 'self'` and no `frame-src`, so
           * frames fall back to same-origin and the Preview pane renders
           * blank — the admin is on :1337 and the frontend on :4200. This is
           * the one change that makes Preview work at all; `allowedOrigins`
           * in `admin.ts` governs which URLs the handler may return, not what
           * the browser will agree to embed.
           */
          'frame-src': ["'self'", CLIENT_URL],
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
