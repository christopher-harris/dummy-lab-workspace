import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingStatsComponent } from './landing-stats.component';

describe('LandingStatsComponent', () => {
  let component: LandingStatsComponent;
  let fixture: ComponentFixture<LandingStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingStatsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingStatsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a tile per stat', () => {
    const text = fixture.nativeElement.textContent ?? '';

    for (const stat of component.stats) {
      expect(text).toContain(stat.title);
    }
  });

  it('renders each stat icon', () => {
    const icons: HTMLElement[] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('i.pi'),
    );

    expect(icons.length).toBeGreaterThanOrEqual(component.stats.length);
  });
});
