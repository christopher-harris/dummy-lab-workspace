import { TestBed } from '@angular/core/testing';
import { PrimeNG } from 'primeng/config';
import Lara from '@primeuix/themes/lara';
import { definePreset } from '@primeuix/themes';

import { providePrimeNgPlatform } from './primeng.providers';
import {
  DEFAULT_PRIMENG_PRESET,
  PRIMENG_THEME_OPTIONS,
} from './primeng.config';
import {
  WINGSTOP_BRAND_PRIMITIVES,
  WINGSTOP_BUTTON_TOKENS,
} from './theme/buttons.tokens';

const withButtonTokens = (preset: Parameters<typeof definePreset>[0]) =>
  definePreset(preset, {
    primitive: WINGSTOP_BRAND_PRIMITIVES,
    components: { button: WINGSTOP_BUTTON_TOKENS },
  });

describe('providePrimeNgPlatform', () => {
  it('applies the default preset and shared theme options', () => {
    TestBed.configureTestingModule({ providers: [providePrimeNgPlatform()] });
    const config = TestBed.inject(PrimeNG);
    expect(config.theme()).toEqual({
      preset: withButtonTokens(DEFAULT_PRIMENG_PRESET),
      options: PRIMENG_THEME_OPTIONS,
    });
  });

  it('honours a preset override while keeping the shared options', () => {
    TestBed.configureTestingModule({
      providers: [providePrimeNgPlatform({ preset: Lara })],
    });
    const config = TestBed.inject(PrimeNG);
    expect(config.theme()).toEqual({
      preset: withButtonTokens(Lara),
      options: PRIMENG_THEME_OPTIONS,
    });
  });

  it('merges extra config over the defaults', () => {
    TestBed.configureTestingModule({
      providers: [providePrimeNgPlatform({ config: { ripple: true } })],
    });
    const config = TestBed.inject(PrimeNG);
    expect(config.ripple()).toBe(true);
  });
});
