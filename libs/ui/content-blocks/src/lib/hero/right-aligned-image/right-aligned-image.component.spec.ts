import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import {
  DEFAULT_BLOCK_SETTINGS,
  type HeroRightAlignedImageContent,
} from '@dummy-lab/shared-models';

import { BLOCK_CONTAINER_CLASS } from '../../block-container';
import { CONTAINER_WIDTHS, TEST_RUNTIME_CONFIG, testMedia } from '../_fixtures';
import { RightAlignedImageComponent } from './right-aligned-image.component';

const content: HeroRightAlignedImageContent = {
  headline: 'Hot wings, straight',
  headlineAccent: 'to your door',
  description: 'Carryout in minutes.',
  primaryCtaLabel: 'Order Delivery',
  secondaryCtaLabel: 'Find a Location',
  image: testMedia('hero-1'),
};

describe('RightAlignedImageComponent', () => {
  let fixture: ComponentFixture<RightAlignedImageComponent>;
  let component: RightAlignedImageComponent;

  const root = (): HTMLElement =>
    fixture.nativeElement.querySelector(':scope > div');
  const copyColumn = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('h1')?.parentElement ?? null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightAlignedImageComponent],
      providers: [{ provide: RUNTIME_CONFIG, useValue: TEST_RUNTIME_CONFIG }],
    }).compileComponents();

    fixture = TestBed.createComponent(RightAlignedImageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('content', content);
    await fixture.whenStable();
  });

  it('renders without settings being passed at all', () => {
    expect(component.settings()).toBe(DEFAULT_BLOCK_SETTINGS);
    expect(fixture.nativeElement.textContent).toContain('Hot wings, straight');
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

  /**
   * This block's behaviour is surprising, so pin it rather than let the next
   * person rediscover it.
   *
   * The layout is a two-column row whose right column must bleed to the
   * viewport edge for its `clip-path` to read, and below `lg` the photo *is*
   * the background. So the setting can only reach the copy column — which is
   * already about half the viewport, meaning `full` and `contained` render
   * identically and only `content-contained` is visible. `containerWidth` is
   * close to a no-op on this block, by design rather than by omission.
   */
  it('applies the width to the copy column only, never the photo column', async () => {
    fixture.componentRef.setInput('settings', { containerWidth: 'contained' });
    await fixture.whenStable();

    expect(copyColumn()?.className).toContain('max-w-7xl');
    expect(root().className).not.toMatch(/\bmax-w-/);
    expect(fixture.nativeElement.querySelector('img')?.className).not.toMatch(
      /\bmax-w-/,
    );
  });

  it('resolves the artwork against the CMS origin and takes alt text off the asset', () => {
    expect(component.image()).toMatchObject({
      src: 'http://localhost:1337/uploads/hero-1.jpg',
      alt: 'hero-1 alt',
    });
  });
});
