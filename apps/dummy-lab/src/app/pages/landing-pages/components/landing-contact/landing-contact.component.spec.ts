import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingContactComponent } from './landing-contact.component';

describe('LandingContactComponent', () => {
  let component: LandingContactComponent;
  let fixture: ComponentFixture<LandingContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingContactComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingContactComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts with an empty contact model', () => {
    expect(component.contact).toEqual({
      name: '',
      company: '',
      email: '',
      budget: '',
      message: '',
    });
  });

  it('renders the form controls', () => {
    const host: HTMLElement = fixture.nativeElement;

    expect(host.querySelectorAll('input').length).toBeGreaterThan(0);
    expect(host.querySelector('textarea')).toBeTruthy();
  });
});
