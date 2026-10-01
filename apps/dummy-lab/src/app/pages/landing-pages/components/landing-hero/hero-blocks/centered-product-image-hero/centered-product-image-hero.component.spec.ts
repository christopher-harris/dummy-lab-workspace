import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CenteredProductImage } from './centered-product-image-hero.component';

describe('CenteredProductImage', () => {
  let component: CenteredProductImage;
  let fixture: ComponentFixture<CenteredProductImage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenteredProductImage],
    }).compileComponents();

    fixture = TestBed.createComponent(CenteredProductImage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the copy from the content signal', () => {
    const { eyebrow, headline, headlineAccent, ctaLabel } = component.content();
    const text = fixture.nativeElement.textContent ?? '';

    expect(text).toContain(eyebrow);
    expect(text).toContain(headline);
    expect(text).toContain(headlineAccent);
    expect(text).toContain(ctaLabel);
  });

  it('ships a single product shot, not a light/dark pair', () => {
    // A `display: none` twin is still fetched, and this is the page's LCP
    // element — so there must be exactly one, carrying the priority hint.
    const images = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLImageElement>(
        'img',
      ),
    );

    expect(images).toHaveLength(1);
    expect(images[0].getAttribute('src')).toBe(component.heroImage().src);
    expect(images[0].getAttribute('fetchpriority')).toBe('high');
  });

  it('resolves the product shot to the light variant by default', () => {
    expect(component.heroImage()).toEqual(component.content().image.light);
  });

  it('re-renders when the content signal changes', async () => {
    component.content.update((content) => ({
      ...content,
      headline: 'Wings On Demand',
    }));
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Wings On Demand');
  });
});
