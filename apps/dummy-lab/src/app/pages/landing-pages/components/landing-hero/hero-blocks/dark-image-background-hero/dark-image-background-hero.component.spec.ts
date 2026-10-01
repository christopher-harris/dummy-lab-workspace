import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DarkImageBackground } from './dark-image-background-hero.component';

describe('DarkImageBackground', () => {
  let component: DarkImageBackground;
  let fixture: ComponentFixture<DarkImageBackground>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DarkImageBackground],
    }).compileComponents();

    fixture = TestBed.createComponent(DarkImageBackground);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the copy from the content signal', () => {
    const { headline, headlineAccent, description, ctaLabel } =
      component.content();
    const text = fixture.nativeElement.textContent ?? '';

    expect(text).toContain(headline);
    expect(text).toContain(headlineAccent);
    expect(text).toContain(description);
    expect(text).toContain(ctaLabel);
  });

  it('starts with an empty email and an email capture input', () => {
    const input = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLInputElement>('input');

    expect(component.email).toBe('');
    expect(input?.getAttribute('placeholder')).toBe(
      component.content().emailPlaceholder,
    );
  });

  it('builds a background layer from the content image', () => {
    const { background, backgroundBlendMode } = component.backgroundStyle();

    expect(background).toContain(component.content().backgroundImage);
    expect(backgroundBlendMode).toBe('normal, multiply, lighten, normal');
  });
});
