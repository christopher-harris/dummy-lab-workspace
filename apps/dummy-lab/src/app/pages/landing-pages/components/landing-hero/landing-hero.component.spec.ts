import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentStore } from '@dummy-lab/data-access-content';
import type { LandingPageResponse } from '@dummy-lab/data-access-content';
import {
  DEFAULT_BLOCK_SETTINGS,
  type BlockSettings,
  type HeroSlideBlock,
  type StrapiMedia,
} from '@dummy-lab/shared-models';
import {
  CenteredProductImageComponent,
  DarkImageBackgroundComponent,
  LightImageBackgroundComponent,
  RightAlignedImageComponent,
} from '@dummy-lab/ui-content-blocks';

import { LandingHeroComponent } from './landing-hero.component';

const media = (name: string): StrapiMedia => ({
  id: 1,
  documentId: name,
  name,
  alternativeText: name,
  caption: null,
  width: 100,
  height: 100,
  mime: 'image/jpeg',
  url: `/uploads/${name}.jpg`,
  formats: null,
});

const settings = (
  containerWidth: BlockSettings['containerWidth'],
): BlockSettings => ({
  containerWidth,
});

const blocks = {
  centered: {
    __component: 'hero.centered-product-image',
    id: 1,
    content: {
      headline: 'Where Flavor',
      headlineAccent: 'Gets Its Wings',
      eyebrow: '🔥 12 signature flavors',
      ctaLabel: 'Order Now',
      imageLight: media('light'),
      imageDark: media('dark'),
    },
    settings: settings('contained'),
  },
  rightAligned: {
    __component: 'hero.right-aligned-image',
    id: 2,
    content: {
      headline: 'Hot wings, straight',
      headlineAccent: 'to your door',
      description: 'Carryout in minutes.',
      primaryCtaLabel: 'Order Delivery',
      secondaryCtaLabel: 'Find a Location',
      image: media('hero-1'),
    },
    settings: null,
  },
  light: {
    __component: 'hero.light-image-background',
    id: 3,
    content: {
      headline: 'Order Faster With',
      headlineAccent: 'The Wingstop App',
      description: 'Save your go-to flavors.',
      ctaLabel: 'Get the App',
      availabilityNote: 'Available on iOS and Android',
      links: [
        { id: 1, icon: 'apple', href: 'https://apple.com', label: 'App Store' },
      ],
      backgroundImage: media('light-bg'),
    },
    settings: settings('content-contained'),
  },
  dark: {
    __component: 'hero.dark-image-background',
    id: 4,
    content: {
      headline: 'Never Miss',
      headlineAccent: 'A Flavor Drop',
      description: 'Limited-run flavors.',
      emailPlaceholder: 'Enter your email',
      ctaLabel: 'Notify Me',
      backgroundImage: media('dark-bg'),
    },
    settings: null,
  },
} satisfies Record<string, HeroSlideBlock>;

describe('LandingHeroComponent', () => {
  let component: LandingHeroComponent;
  let fixture: ComponentFixture<LandingHeroComponent>;
  const landingPageValue = signal<LandingPageResponse | undefined>(undefined);

  const setHeroSlides = (
    heroSlides: HeroSlideBlock[],
    heroAutoplayInterval = 6000,
  ) =>
    landingPageValue.set({
      data: {
        id: 1,
        documentId: 'landing',
        heroSlides,
        heroAutoplayInterval,
        createdAt: '',
        updatedAt: '',
        publishedAt: null,
      },
      meta: {},
    });

  beforeEach(async () => {
    landingPageValue.set(undefined);

    await TestBed.configureTestingModule({
      imports: [LandingHeroComponent],
      providers: [{ provide: ContentStore, useValue: { landingPageValue } }],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingHeroComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders no slides before the CMS responds', () => {
    expect(component.slides()).toEqual([]);
  });

  it('resolves each block to its registered component, in dynamic-zone order', () => {
    setHeroSlides([
      blocks.centered,
      blocks.rightAligned,
      blocks.light,
      blocks.dark,
    ]);

    expect(component.slides().map((slide) => slide.component)).toEqual([
      CenteredProductImageComponent,
      RightAlignedImageComponent,
      LightImageBackgroundComponent,
      DarkImageBackgroundComponent,
    ]);
  });

  it('drops a block this build has no component for', () => {
    setHeroSlides([
      blocks.centered,
      // A block type added in Strapi after this bundle shipped.
      { ...blocks.dark, __component: 'hero.not-built-yet' } as never,
    ]);

    expect(component.slides().map((slide) => slide.component)).toEqual([
      CenteredProductImageComponent,
    ]);
  });

  it('drops a block whose content component did not come back', () => {
    // Strapi reports an unpopulated or orphaned component as `null` with a
    // 200. The block template reads `content().headline` directly, so
    // rendering it would throw and take every other slide down with it.
    setHeroSlides([
      { ...blocks.centered, content: null } as unknown as HeroSlideBlock,
      blocks.rightAligned,
    ]);

    expect(component.slides().map((slide) => slide.component)).toEqual([
      RightAlignedImageComponent,
    ]);
  });

  it('keeps slide ids unique so `track` stays stable', () => {
    setHeroSlides([blocks.centered, blocks.rightAligned, blocks.light]);
    const ids = component.slides().map((slide) => slide.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('splits the block into content and settings for the rendered component', () => {
    setHeroSlides([blocks.centered]);

    expect(component.slides()[0].inputs).toEqual({
      content: blocks.centered.content,
      settings: blocks.centered.settings,
    });
  });

  it('substitutes the default when the CMS has no settings for a block', () => {
    // `settings` is optional in Strapi, so a slide whose editor never opened
    // the section arrives as `null`. The component's own `input()` default
    // cannot cover this — it only applies when the key is absent, and the host
    // always passes it.
    setHeroSlides([blocks.dark]);

    expect(component.slides()[0].inputs).toEqual({
      content: blocks.dark.content,
      settings: DEFAULT_BLOCK_SETTINGS,
    });
  });

  describe('autoplay interval', () => {
    it('comes from the CMS', () => {
      setHeroSlides([blocks.centered], 9000);

      expect(component.autoplayInterval()).toBe(9000);
    });

    it('falls back when there is no page yet', () => {
      expect(component.autoplayInterval()).toBe(6000);
    });
  });

  describe('carousel passthrough', () => {
    // These classes are load-bearing, so assert them rather than leave the
    // next person to rediscover why they are there.
    it('makes items a flex column so every block fills the tallest slide', () => {
      expect(component.carouselPt.item).toContain('flex');
      expect(component.carouselPt.item).toContain('flex-col');
      expect(component.carouselPt.itemClone).toContain('flex-col');
    });

    it('keeps items visible to dodge the blank frame on the circular wrap', () => {
      expect(component.carouselPt.item).toContain('visible');
      expect(component.carouselPt.itemClone).toContain('visible');
    });
  });
});
