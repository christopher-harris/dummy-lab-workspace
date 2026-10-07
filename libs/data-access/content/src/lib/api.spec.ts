import type { ContentBlockKey } from '@dummy-lab/shared-models';

import { landingPageUrl } from './api';

const CMS = 'http://localhost:1337';

/**
 * Every block the frontend knows how to render.
 *
 * Declared here as a `Record<ContentBlockKey, true>` rather than read off the
 * populate map, so the two failure modes are separated: adding a block to the
 * union without listing it here fails the *compile*, and adding it here
 * without adding it to the populate map fails the *test*. Reading the map
 * would make the test tautological.
 */
const EVERY_BLOCK: Readonly<Record<ContentBlockKey, true>> = {
  'hero.centered-product-image': true,
  'hero.right-aligned-image': true,
  'hero.light-image-background': true,
  'hero.dark-image-background': true,
};

const query = (url: string) => decodeURIComponent(url.split('?')[1] ?? '');

describe('landingPageUrl', () => {
  it('targets the landing-page single type on the configured origin', () => {
    expect(landingPageUrl(CMS).startsWith(`${CMS}/api/landing-page?`)).toBe(
      true,
    );
  });

  it('populates `content` for every block the frontend can render', () => {
    const params = query(landingPageUrl(CMS));

    for (const uid of Object.keys(EVERY_BLOCK)) {
      // Since the content/settings split a block missing from the populate
      // map comes back as `{ __component, id }` — a blank slide, not a slide
      // missing its images.
      expect(params).toContain(
        `populate[heroSlides][on][${uid}][populate][content][populate][0]=`,
      );
    }
  });

  it('populates `settings` for every block', () => {
    const params = query(landingPageUrl(CMS));

    for (const uid of Object.keys(EVERY_BLOCK)) {
      expect(params).toContain(
        `populate[heroSlides][on][${uid}][populate][settings]=true`,
      );
    }
  });

  it('names each media and nested-component field explicitly', () => {
    const params = query(landingPageUrl(CMS));
    const base =
      'populate[heroSlides][on][hero.light-image-background][populate]';

    // Pinned verbatim. A populate URL is exactly the kind of thing that gets
    // "tidied up" into something that silently returns less data, and the
    // failure shows up as a missing image rather than as an error.
    expect(params).toContain(`${base}[settings]=true`);
    expect(params).toContain(`${base}[content][populate][0]=backgroundImage`);
    expect(params).toContain(`${base}[content][populate][1]=links`);
  });

  it('does not fall back to a wildcard populate', () => {
    // `populate=*` is accepted by Strapi but only reaches one level, which
    // since the split returns `content` without its media.
    expect(query(landingPageUrl(CMS))).not.toContain('=*');
  });
});

describe('landingPageUrl status', () => {
  it('omits `status` for a normal visit, so the published page is cached plainly', () => {
    expect(query(landingPageUrl(CMS))).not.toContain('status=');
  });

  it('asks for the draft version in preview', () => {
    expect(query(landingPageUrl(CMS, 'draft'))).toContain('status=draft');
  });

  it('keeps the full populate in preview, so the draft renders like the real page', () => {
    const params = query(landingPageUrl(CMS, 'draft'));

    for (const uid of Object.keys(EVERY_BLOCK)) {
      expect(params).toContain(
        `populate[heroSlides][on][${uid}][populate][content][populate][0]=`,
      );
    }
  });
});
