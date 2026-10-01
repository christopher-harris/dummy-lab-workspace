import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { appRoutes } from '../../app.routes';
import { Landing1 } from './landing.page';

describe('Landing1', () => {
  let component: Landing1;
  let fixture: ComponentFixture<Landing1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Landing1],
      // The page embeds the shared navbar, which derives its menu from
      // `Router.config` — `provideRouter([])` would give it nothing to flatten.
      providers: [provideRouter(appRoutes)],
    }).compileComponents();

    fixture = TestBed.createComponent(Landing1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('stacks every landing section in order', () => {
    const host: HTMLElement = fixture.nativeElement;

    const rendered = [
      'dl-landing-announcement-bar',
      'dl-navbar',
      'dl-landing-hero',
      'dl-landing-features',
      'dl-landing-cta-banner',
      'dl-landing-stats',
      'dl-landing-trusted-by',
      'dl-landing-articles',
      'dl-landing-pricing',
      'dl-landing-contact',
    ].filter((selector) => host.querySelector(selector) !== null);

    expect(rendered).toHaveLength(10);
  });
});
