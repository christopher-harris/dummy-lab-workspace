import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingNavComponent } from './landing-nav.component';

describe('LandingNavComponent', () => {
  let component: LandingNavComponent;
  let fixture: ComponentFixture<LandingNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingNavComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingNavComponent);
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
