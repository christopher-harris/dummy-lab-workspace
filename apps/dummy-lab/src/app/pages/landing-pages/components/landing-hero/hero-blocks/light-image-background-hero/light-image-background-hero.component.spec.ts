import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LightImageBackground } from './light-image-background-hero.component';

describe('LightImageBackground', () => {
  let component: LightImageBackground;
  let fixture: ComponentFixture<LightImageBackground>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightImageBackground],
    }).compileComponents();

    fixture = TestBed.createComponent(LightImageBackground);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the copy from the content signal', () => {
    const { headline, headlineAccent, ctaLabel, availabilityNote } =
      component.content();
    const text = fixture.nativeElement.textContent ?? '';

    expect(text).toContain(headline);
    expect(text).toContain(headlineAccent);
    expect(text).toContain(ctaLabel);
    expect(text).toContain(availabilityNote);
  });

  it('renders a store link per entry in the content signal', () => {
    const anchors = Array.from(
      (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLAnchorElement>('a'),
    );

    expect(anchors).toHaveLength(component.content().links.length);
    expect(anchors.map((a) => a.getAttribute('href'))).toEqual(
      component.content().links.map((link) => link.href),
    );
  });

  it('builds a background layer from the content image', () => {
    expect(component.backgroundStyle().background).toContain(
      component.content().backgroundImage,
    );
  });
});
