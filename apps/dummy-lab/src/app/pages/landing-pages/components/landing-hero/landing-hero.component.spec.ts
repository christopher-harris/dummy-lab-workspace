import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingHeroComponent } from './landing-hero.component';
import { CenteredProductImage } from './hero-blocks/centered-product-image-hero/centered-product-image-hero.component';
import { DarkImageBackground } from './hero-blocks/dark-image-background-hero/dark-image-background-hero.component';
import { LightImageBackground } from './hero-blocks/light-image-background-hero/light-image-background-hero.component';
import { RightAlignedImage } from './hero-blocks/right-aligned-image-hero/right-aligned-image-hero.component';

describe('LandingHeroComponent', () => {
  let component: LandingHeroComponent;
  let fixture: ComponentFixture<LandingHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingHeroComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingHeroComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carries one slide per hero block', () => {
    expect(component.slides().map((slide) => slide.component)).toEqual([
      CenteredProductImage,
      RightAlignedImage,
      LightImageBackground,
      DarkImageBackground,
    ]);
  });

  it('keeps slide ids unique so `track` stays stable', () => {
    const ids = component.slides().map((slide) => slide.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('renders the first block inside the carousel', () => {
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('p-carousel'),
    ).toBeTruthy();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector(
        'centered-product-image',
      ),
    ).toBeTruthy();
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
