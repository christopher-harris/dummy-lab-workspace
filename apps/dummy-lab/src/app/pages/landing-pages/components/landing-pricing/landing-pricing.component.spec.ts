import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPricingComponent } from './landing-pricing.component';

describe('LandingPricingComponent', () => {
  let component: LandingPricingComponent;
  let fixture: ComponentFixture<LandingPricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPricingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPricingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to yearly billing', () => {
    expect(component.checked()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('$100');
    expect(fixture.nativeElement.textContent).toContain('/year');
  });

  it('swaps to monthly pricing when the toggle flips', async () => {
    component.checked.set(false);
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent ?? '';

    expect(text).toContain('$10');
    expect(text).toContain('/month');
    expect(text).not.toContain('/year');
  });

  it('lists every feature on each plan', () => {
    const text = fixture.nativeElement.textContent ?? '';

    for (const feature of component.features) {
      expect(text).toContain(feature);
    }
  });
});
