import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingAnnouncementBarComponent } from './landing-announcement-bar.component';

describe('LandingAnnouncementBarComponent', () => {
  let component: LandingAnnouncementBarComponent;
  let fixture: ComponentFixture<LandingAnnouncementBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingAnnouncementBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingAnnouncementBarComponent);
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
