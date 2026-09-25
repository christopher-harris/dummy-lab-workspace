import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import { App } from './app';

const runtimeConfig = {
  environment: 'local' as const,
  apiBaseUrl: 'https://dummyjson.com',
  features: { experimentalCatalog: true },
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: RUNTIME_CONFIG, useValue: runtimeConfig },
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the route outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('shows the runtime-configured experimental catalog status', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector(
        '[data-testid="experimental-catalog-status"]',
      ),
    ).toBeTruthy();
  });
});
