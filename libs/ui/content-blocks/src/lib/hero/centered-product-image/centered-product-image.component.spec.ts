import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import {
  DEFAULT_BLOCK_SETTINGS,
  type HeroCenteredProductImageContent,
} from '@dummy-lab/shared-models';

import { BLOCK_CONTAINER_CLASS } from '../../block-container';
import { CONTAINER_WIDTHS, TEST_RUNTIME_CONFIG, testMedia } from '../_fixtures';
import { CenteredProductImageComponent } from './centered-product-image.component';

const content: HeroCenteredProductImageContent = {
  headline: 'Where Flavor',
  headlineAccent: 'Gets Its Wings',
  eyebrow: '12 signature flavors',
  ctaLabel: 'Order Now',
  imageLight: testMedia('light'),
  imageDark: testMedia('dark'),
};

describe('CenteredProductImageComponent', () => {
  let fixture: ComponentFixture<CenteredProductImageComponent>;
  let component: CenteredProductImageComponent;

  const root = (): HTMLElement =>
    fixture.nativeElement.querySelector(':scope > div');
  const copyColumn = (): HTMLElement => root().firstElementChild as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenteredProductImageComponent],
      providers: [{ provide: RUNTIME_CONFIG, useValue: TEST_RUNTIME_CONFIG }],
    }).compileComponents();

    fixture = TestBed.createComponent(CenteredProductImageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('content', content);
    await fixture.whenStable();
  });

  it('renders without settings being passed at all', () => {
    expect(component.settings()).toBe(DEFAULT_BLOCK_SETTINGS);
    expect(component.dark()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Where Flavor');
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
    // The gradient wash is on the root and is meant to run full-bleed.
    expect(root().className).not.toMatch(/\bmax-w-/);
  });

  it('leaves the image frame at its own art-directed width', async () => {
    fixture.componentRef.setInput('settings', {
      containerWidth: 'content-contained',
    });
    await fixture.whenStable();

    const frame = fixture.nativeElement.querySelector('img')
      ?.parentElement as HTMLElement;

    expect(frame.className).toContain('max-w-[720px]');
  });

  it('ships one image rather than a light/dark pair, picked by the dark input', async () => {
    // A `display: none` image is still fetched, so the pair cost ~162 KiB to
    // show ~81 KiB of it. This is the page's LCP element.
    expect(fixture.nativeElement.querySelectorAll('img').length).toBe(1);
    expect(component.heroImage().src).toContain('/uploads/light.jpg');

    fixture.componentRef.setInput('dark', true);
    await fixture.whenStable();

    expect(component.heroImage().src).toContain('/uploads/dark.jpg');
  });
});
