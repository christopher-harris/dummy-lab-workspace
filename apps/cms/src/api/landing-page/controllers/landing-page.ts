/**
 * landing-page controller
 *
 * Same treatment as `page`, for the `heroSlides` dynamic zone. A single type,
 * so only `find` exists. See `src/utils/deep-populate.ts`.
 */

import { factories } from '@strapi/strapi';

import {
  applyDeepZonePopulate,
  type StrapiSchemaSource,
} from '../../../utils/deep-populate';

export default factories.createCoreController(
  'api::landing-page.landing-page',
  ({ strapi }) => {
    const source = strapi as unknown as StrapiSchemaSource;

    return {
      async find(ctx) {
        applyDeepZonePopulate(
          source,
          ctx,
          'api::landing-page.landing-page',
          'heroSlides',
        );
        return super.find(ctx);
      },
    };
  },
);
