import { TestBed } from '@angular/core/testing';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import type { StrapiMedia } from '@dummy-lab/shared-models';

import { cmsImageLoader, pickRendition } from './cms-image';
import { CmsMediaUrl } from './cms-media-url';
import { TEST_RUNTIME_CONFIG, testMedia } from './hero/_fixtures';

/** Shaped like the landing page's real hero uploads: a huge original plus Strapi's four formats. */
const withFormats = (name: string): StrapiMedia => ({
  ...testMedia(name),
  width: 6446,
  height: 4297,
  formats: {
    large: { url: `/uploads/large_${name}.jpg`, width: 1000, height: 667 },
    small: { url: `/uploads/small_${name}.jpg`, width: 500, height: 334 },
    medium: { url: `/uploads/medium_${name}.jpg`, width: 750, height: 500 },
    thumbnail: {
      url: `/uploads/thumbnail_${name}.jpg`,
      width: 234,
      height: 156,
    },
  },
});

describe('CmsMediaUrl.image', () => {
  let cmsMediaUrl: CmsMediaUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: RUNTIME_CONFIG, useValue: TEST_RUNTIME_CONFIG }],
    });
    cmsMediaUrl = TestBed.inject(CmsMediaUrl);
  });

  it('uses the stored formats, narrowest first, and never the original upload', () => {
    const image = cmsMediaUrl.image(withFormats('hero'));

    expect(image?.src).toBe('http://localhost:1337/uploads/large_hero.jpg');
    expect(image?.srcset).toBe('234w, 500w, 750w, 1000w');
    expect(image?.loaderParams.renditions.map((r) => r.url)).not.toContain(
      'http://localhost:1337/uploads/hero.jpg',
    );
  });

  it('falls back to the original when Strapi made no formats', () => {
    const image = cmsMediaUrl.image(testMedia('icon'));

    expect(image).toEqual({
      src: 'http://localhost:1337/uploads/icon.jpg',
      srcset: '100w',
      alt: 'icon alt',
      loaderParams: {
        renditions: [
          { url: 'http://localhost:1337/uploads/icon.jpg', width: 100 },
        ],
      },
    });
  });

  it('is null with no media', () => {
    expect(cmsMediaUrl.image(null)).toBeNull();
    expect(cmsMediaUrl.image(undefined)).toBeNull();
  });
});

describe('cmsImageLoader', () => {
  const renditions = [
    { url: 'https://cms.test/small.jpg', width: 500 },
    { url: 'https://cms.test/medium.jpg', width: 750 },
    { url: 'https://cms.test/large.jpg', width: 1000 },
  ];

  it('returns the rendition matching each ngSrcset width', () => {
    for (const { url, width } of renditions) {
      expect(
        cmsImageLoader({ src: 'x', width, loaderParams: { renditions } }),
      ).toBe(url);
    }
  });

  it('rounds a width between renditions up, and caps at the widest', () => {
    expect(pickRendition(renditions, 600)?.url).toBe(
      'https://cms.test/medium.jpg',
    );
    expect(pickRendition(renditions, 1920)?.url).toBe(
      'https://cms.test/large.jpg',
    );
  });

  it('gives the widest rendition for the plain src', () => {
    expect(cmsImageLoader({ src: 'x', loaderParams: { renditions } })).toBe(
      'https://cms.test/large.jpg',
    );
  });

  it('passes src through when it has no renditions', () => {
    expect(cmsImageLoader({ src: 'https://cms.test/raw.jpg' })).toBe(
      'https://cms.test/raw.jpg',
    );
  });
});
