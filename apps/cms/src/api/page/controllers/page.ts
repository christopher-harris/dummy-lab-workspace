/**
 * page controller
 *
 * Overrides `find` and `findOne` to expand the `blocks` dynamic zone to full
 * depth from the schema, so a client asking for `populate[blocks]` gets every
 * block complete without naming a single component. See
 * `src/utils/deep-populate.ts` for why Strapi's own `populate=*` and `on`
 * fragments both fall short.
 */

import { factories } from '@strapi/strapi';

import {
  applyDeepZonePopulate,
  type StrapiSchemaSource,
} from '../../../utils/deep-populate';

export default factories.createCoreController(
  'api::page.page',
  ({ strapi }) => {
    const source = strapi as unknown as StrapiSchemaSource;

    return {
      async find(ctx) {
        applyDeepZonePopulate(source, ctx, 'api::page.page', 'blocks');
        return super.find(ctx);
      },
      async findOne(ctx) {
        applyDeepZonePopulate(source, ctx, 'api::page.page', 'blocks');
        return super.findOne(ctx);
      },
    };
  },
);
