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

  it('renders a light and a dark product shot', () => {
    const sources = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLImageElement>(
        'img',
      ),
    ).map((img) => img.getAttribute('src'));

    expect(sources).toContain(component.content().image.light.src);
    expect(sources).toContain(component.content().image.dark.src);
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
