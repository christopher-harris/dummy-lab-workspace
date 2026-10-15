import type { Core } from '@strapi/strapi';

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET')!,
  },
  apiToken: {
    salt: env('API_TOKEN_SALT')!,
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT')!,
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY')!,
  },
  /**
   * Preview — the admin renders the frontend in an iframe against draft
   * content. Full-screen preview is a free-tier feature; Live Preview
   * (side-by-side, click-to-edit) is Growth/Enterprise and, per Strapi's own
   * limitations, does not support dynamic-zone fields — which is all of
   * `heroSlides`. So the free tier is not a downgrade for this content model.
   *
   * `allowedOrigins` restricts the URLs this handler may return. It does not
   * make the browser embed them: that is the `frame-src` CSP entry in
   * `middlewares.ts`.
   */
  preview: {
    enabled: env.bool('PREVIEW_ENABLED', false),
    config: {
      allowedOrigins: [env('CLIENT_URL', 'http://localhost:4200')],
      handler(uid, { status }) {
        // Only the landing page has a frontend route. Returning null hides
        // the preview button rather than opening a broken pane.
        if (uid !== 'api::landing-page.landing-page') {
          return null;
        }

        const params = new URLSearchParams({
          preview: 'true',
          status: status ?? 'draft',
        });

        return `${env('CLIENT_URL', 'http://localhost:4200')}/?${params}`;
      },
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    docLinks: env.bool('FLAG_DOC_LINKS', true),
  },
});

export default config;
