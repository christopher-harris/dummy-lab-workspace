import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingTrustedByComponent } from './landing-trusted-by.component';

describe('LandingTrustedByComponent', () => {
  let component: LandingTrustedByComponent;
  let fixture: ComponentFixture<LandingTrustedByComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingTrustedByComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingTrustedByComponent);
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
