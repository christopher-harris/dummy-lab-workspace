import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import {
  DEFAULT_BLOCK_SETTINGS,
  type HeroDarkImageBackgroundContent,
} from '@dummy-lab/shared-models';

import { BLOCK_CONTAINER_CLASS } from '../../block-container';
import { CONTAINER_WIDTHS, TEST_RUNTIME_CONFIG, testMedia } from '../_fixtures';
import { DarkImageBackgroundComponent } from './dark-image-background.component';

const content: HeroDarkImageBackgroundContent = {
  headline: 'Never Miss',
  headlineAccent: 'A Flavor Drop',
  description: 'Limited-run flavors.',
  emailPlaceholder: 'Enter your email',
  ctaLabel: 'Notify Me',
  backgroundImage: testMedia('dark-bg'),
};

describe('DarkImageBackgroundComponent', () => {
  let fixture: ComponentFixture<DarkImageBackgroundComponent>;
  let component: DarkImageBackgroundComponent;

  const root = (): HTMLElement =>
    fixture.nativeElement.querySelector(':scope > div');
  const copyColumn = (): HTMLElement =>
    fixture.nativeElement.querySelector('.text-center');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DarkImageBackgroundComponent],
      providers: [{ provide: RUNTIME_CONFIG, useValue: TEST_RUNTIME_CONFIG }],
    }).compileComponents();

    fixture = TestBed.createComponent(DarkImageBackgroundComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('content', content);
    await fixture.whenStable();
  });

  it('renders without settings being passed at all', () => {
    expect(component.settings()).toBe(DEFAULT_BLOCK_SETTINGS);
    expect(copyColumn().textContent).toContain('Never Miss');
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
    fixture.componentRef.setInput('settings', {
      containerWidth: 'content-contained',
    });
    await fixture.whenStable();

    expect(copyColumn().className).toContain('max-w-3xl');
    // The four-layer gradient stack is composed on the root. Constraining it
    // would inset the artwork, which is never the intent.
    expect(root().className).not.toMatch(/\bmax-w-/);
  });

  it('keeps the typed address as local state and sends nothing', () => {
    // A `ui` block must not resolve or submit anything (PROVE-OUT P22); the
    // signup belongs to whatever feature owns it.
    expect(component.email).toBe('');
  });

  it('resolves the background photo against the CMS origin', () => {
    expect(component.backgroundStyle().background).toContain(
      'http://localhost:1337/uploads/dark-bg.jpg',
    );
  });
});
