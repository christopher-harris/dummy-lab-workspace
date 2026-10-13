import { TestBed } from '@angular/core/testing';
import { PRIME_NG_CONFIG } from 'primeng/config';
import type { PrimeNGConfigType } from 'primeng/config';
import { beforeEach, describe, expect, it } from 'vitest';

import figmaPreset from '../../../../../theme/ts';
import { DARK_MODE_CLASS, DARK_MODE_SELECTOR } from './dark-mode';
import { PRIMENG_THEME_OPTIONS } from './primeng.config';
import { providePrimeNgPlatform } from './primeng.providers';

const providedConfig = (): PrimeNGConfigType =>
  TestBed.inject(PRIME_NG_CONFIG) as PrimeNGConfigType;

describe('dark mode', () => {
  it('derives the selector from the class the theme store toggles', () => {
    expect(DARK_MODE_SELECTOR).toBe(`.${DARK_MODE_CLASS}`);
  });
});

describe('PRIMENG_THEME_OPTIONS', () => {
  it('points PrimeNG at the shared dark-mode selector', () => {
    expect(PRIMENG_THEME_OPTIONS.darkModeSelector).toBe(DARK_MODE_SELECTOR);
  });

  // Load-bearing and invisible: if `primeng` ever sorts after `utilities`,
  // PrimeNG component styles start beating Tailwind classes with no error.
  it('orders the PrimeNG layer ahead of Tailwind utilities', () => {
    const order = PRIMENG_THEME_OPTIONS.cssLayer.order
      .split(',')
      .map((layer) => layer.trim());

    expect(order).toEqual(['theme', 'base', 'primeng', 'utilities']);
  });
});

describe('providePrimeNgPlatform', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('provides the generated Figma preset with the shared options', () => {
    TestBed.configureTestingModule({ providers: [providePrimeNgPlatform()] });

    const theme = providedConfig().theme as {
      preset: unknown;
      options: unknown;
    };

    expect(theme.preset).toBe(figmaPreset);
    expect(theme.options).toBe(PRIMENG_THEME_OPTIONS);
  });

  it('merges caller configuration over the workspace defaults', () => {
    TestBed.configureTestingModule({
      providers: [providePrimeNgPlatform({ config: { ripple: true } })],
    });

    expect(providedConfig().ripple).toBe(true);
  });

  it('registers a licence key', () => {
    TestBed.configureTestingModule({ providers: [providePrimeNgPlatform()] });

    expect(providedConfig().license).toEqual(expect.any(String));
  });
});
