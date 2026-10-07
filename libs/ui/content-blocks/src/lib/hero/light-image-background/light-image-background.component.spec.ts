import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import {
  DEFAULT_BLOCK_SETTINGS,
  type HeroLightImageBackgroundContent,
} from '@dummy-lab/shared-models';

import { BLOCK_CONTAINER_CLASS } from '../../block-container';
import { CONTAINER_WIDTHS, TEST_RUNTIME_CONFIG, testMedia } from '../_fixtures';
import { LightImageBackgroundComponent } from './light-image-background.component';

const content: HeroLightImageBackgroundContent = {
  headline: 'Order Faster With',
  headlineAccent: 'The Wingstop App',
  description: 'Save your go-to flavors.',
  ctaLabel: 'Get the App',
  availabilityNote: 'Available on iOS and Android',
  links: [{ id: 1, icon: 'apple', href: 'https://apple.com', label: 'App Store' }],
  backgroundImage: testMedia('light-bg'),
};

describe('LightImageBackgroundComponent', () => {
  let fixture: ComponentFixture<LightImageBackgroundComponent>;
  let component: LightImageBackgroundComponent;

  const root = (): HTMLElement =>
    fixture.nativeElement.querySelector(':scope > div');
  const copyColumn = (): HTMLElement =>
    fixture.nativeElement.querySelector('.text-center');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightImageBackgroundComponent],
      providers: [{ provide: RUNTIME_CONFIG, useValue: TEST_RUNTIME_CONFIG }],
    }).compileComponents();

    fixture = TestBed.createComponent(LightImageBackgroundComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('content', content);
    await fixture.whenStable();
  });

  it('renders without settings being passed at all', () => {
    expect(component.settings()).toBe(DEFAULT_BLOCK_SETTINGS);
    expect(copyColumn().textContent).toContain('Order Faster With');
  });

  it('maps each container width to its class', async () => {
    for (const containerWidth of CONTAINER_WIDTHS) {
      fixture.componentRef.setInput('settings', { containerWidth });
      await fixture.whenStable();

      expect(component.containerClass()).toBe(
        BLOCK_CONTAINER_CLASS[containerWidth],
      );
    }
  });

  it('constrains the copy column, not the block', async () => {
    fixture.componentRef.setInput('settings', { containerWidth: 'contained' });
    await fixture.whenStable();

    expect(copyColumn().className).toContain('max-w-7xl');
    // The photo and its scrim are composed as a background layer on the root.
    // A width class there would inset the photo, which is never the intent.
    expect(root().className).not.toMatch(/\bmax-w-/);
  });

  it('resolves the background photo against the CMS origin', () => {
    expect(component.backgroundStyle().background).toContain(
      'http://localhost:1337/uploads/light-bg.jpg',
    );
  });

  it('maps the icon vocabulary to PrimeIcons classes', () => {
    expect(component.links()[0].iconClass).toBe('pi pi-apple');
  });
});
