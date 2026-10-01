import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingFeaturesComponent } from './landing-features.component';

describe('LandingFeaturesComponent', () => {
  let component: LandingFeaturesComponent;
  let fixture: ComponentFixture<LandingFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingFeaturesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingFeaturesComponent);
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
