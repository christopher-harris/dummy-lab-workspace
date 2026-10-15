import type { Core } from '@strapi/strapi';

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  /**
   * Both unset locally. Behind compose.prod.yaml's Caddy, `url` makes media
   * and admin URLs absolute to the public host, and `proxy.koa` trusts
   * X-Forwarded-Proto so Strapi knows the request arrived over HTTPS.
   */
  url: env('PUBLIC_URL'),
  proxy: {
    koa: env.bool('IS_PROXIED', false),
  },
  app: {
    keys: env.array('APP_KEYS')!,
  },
  mcp: {
    enabled: true,
    connectTimeoutMs: 5000,
    requestTimeoutMs: 10000,
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});

export default config;
