import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RightAlignedImage } from './right-aligned-image-hero.component';

describe('RightAlignedImage', () => {
  let component: RightAlignedImage;
  let fixture: ComponentFixture<RightAlignedImage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightAlignedImage],
    }).compileComponents();

    fixture = TestBed.createComponent(RightAlignedImage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders both headline lines and the description', () => {
    const { headline, headlineAccent, description } = component.content();
    const text = fixture.nativeElement.textContent ?? '';

    expect(text).toContain(headline);
    expect(text).toContain(headlineAccent);
    expect(text).toContain(description);
  });

  it('renders both calls to action', () => {
    const text = fixture.nativeElement.textContent ?? '';

    expect(text).toContain(component.content().primaryCtaLabel);
    expect(text).toContain(component.content().secondaryCtaLabel);
  });

  it('renders the hero image with its alt text', () => {
    const img = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLImageElement>('img');

    expect(img?.getAttribute('src')).toBe(component.content().image.src);
    expect(img?.getAttribute('alt')).toBe(component.content().image.alt);
  });
});
