import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingCtaBannerComponent } from './landing-cta-banner.component';

describe('LandingCtaBannerComponent', () => {
  let component: LandingCtaBannerComponent;
  let fixture: ComponentFixture<LandingCtaBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingCtaBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingCtaBannerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders its section markup', () => {
    expect(fixture.nativeElement.textContent?.trim()).not.toBe('');
  });
});
