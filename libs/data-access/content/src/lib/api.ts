/**
 * Request construction for the CMS. No response handling — the store exposes
 * what Strapi returns.
 */
import type { ContentBlockKey } from '@dummy-lab/shared-models';

import type { CmsStatus } from './preview';

/**
 * Which fields inside each block's `content` component need their own populate.
 *
 * Only relational fields belong here. Scalars of a populated component — enums
 * included — come back by default; `fields` narrows a response, it never
 * widens one. Media, relations and nested components are the exception, and
 * each needs naming.
 *
 * The reason this cannot collapse to `populate=*` is depth, not strictness.
 * (`strictParams: true` in `apps/cms/config/api.ts` only validates root-level
 * query keys, and `populate` is allowed.) `populate=*` reaches one level, and
 * `populate[heroSlides][populate]=*` reaches one level into each block — which
 * since the content/settings split returns `content` with its scalars but
 * without its media. Hence the `on` fragment API, one entry per component.
 *
 * Keyed by `ContentBlockKey` rather than `string`: a block added to
 * `HeroSlideBlock` without an entry here is now a compile error, and so is a
 * stale entry for a block that no longer exists. That matters far more since
 * the split than it did before — every field now lives under `content`, so an
 * unpopulated block arrives as `{ __component, id }` and renders as a blank
 * slide rather than as a slide missing its images.
 *
 * Not closed: the field-name strings are still plain `string`, and Strapi
 * discards an attribute name it does not recognise without complaint. A typo
 * here is still a runtime-only failure.
 */
const HERO_BLOCK_CONTENT_POPULATE: Readonly<
  Record<ContentBlockKey, readonly string[]>
> = {
  'hero.centered-product-image': ['imageLight', 'imageDark'],
  'hero.right-aligned-image': ['image'],
  'hero.light-image-background': ['backgroundImage', 'links'],
  'hero.dark-image-background': ['backgroundImage'],
};

/**
 * `status` selects the draft or published version of the document. Draft reads
 * are rejected for an anonymous caller, so this only resolves while the
 * request carries the CMS token — see `cms-interceptor.ts`.
 */
export function landingPageUrl(
  cmsBaseUrl: string,
  status: CmsStatus = 'published',
): string {
  const params = new URLSearchParams();

  if (status === 'draft') {
    params.set('status', 'draft');
  }

  const keys = Object.keys(
    HERO_BLOCK_CONTENT_POPULATE,
  ) as readonly ContentBlockKey[];

  for (const uid of keys) {
    const fragment = `populate[heroSlides][on][${uid}][populate]`;

    // `settings` is the same `shared.block-settings` component on every block,
    // but the fragment API has no "apply to all components" form, so each
    // block repeats it. `=true` is enough: the component holds only scalars.
    params.set(`${fragment}[settings]`, 'true');

    HERO_BLOCK_CONTENT_POPULATE[uid].forEach((field, index) => {
      params.set(`${fragment}[content][populate][${index}]`, field);
    });
  }

  return `${cmsBaseUrl}/api/landing-page?${params.toString()}`;
}
