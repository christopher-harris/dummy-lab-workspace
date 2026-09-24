import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import { Theme } from '@primeuix/styled';

import { PRIMENG_THEME_OPTIONS } from '../primeng.config';
import {
  WINGSTOP_BRAND_PRIMITIVES,
  WINGSTOP_BUTTON_CLASSES,
  WINGSTOP_BUTTON_TOKENS,
} from './buttons.tokens';

/** Renders the button theme exactly the way `providePrimeNgPlatform` does. */
const renderButtonTheme = (): { css: string; style: string } => {
  Theme.setTheme({
    preset: definePreset(Aura, {
      primitive: WINGSTOP_BRAND_PRIMITIVES,
      components: { button: WINGSTOP_BUTTON_TOKENS },
    }),
    options: PRIMENG_THEME_OPTIONS,
  } as Parameters<typeof Theme.setTheme>[0]);

  const { css, style } = Theme.getComponent('button', {}) as {
    css: string;
    style: string;
  };
  return { css: css ?? '', style: style ?? '' };
};

const matchAll = (source: string, pattern: RegExp): string[] => [
  ...new Set([...source.matchAll(pattern)].map((match) => match[1])),
];

describe('WINGSTOP_BUTTON_TOKENS', () => {
  it('references only custom tokens it actually declares', () => {
    // `dt()` does not validate: a mistyped key silently becomes
    // `var(--p-button-wingstop-tpyo)`, which resolves to nothing at paint time
    // and produces no error anywhere. This is the guard for that.
    const { css, style } = renderButtonTheme();

    const declared = matchAll(css, /(--p-button-wingstop-[a-z0-9-]+)\s*:/g);
    const referenced = matchAll(style, /var\((--p-button-wingstop-[a-z0-9-]+)\)/g);

    expect(declared.length).toBeGreaterThan(0);
    expect(referenced.length).toBeGreaterThan(0);
    expect(referenced.filter((token) => !declared.includes(token))).toEqual([]);
  });

  it('keeps the brand off the theme primary palette', () => {
    // The whole point of the `{wingstop.*}` namespace: moving the theme's
    // primary-colour picker must not repaint a CTA button.
    const { css } = renderButtonTheme();

    const brandBound = [
      '--p-button-primary-background',
      '--p-button-primary-hover-background',
      '--p-button-primary-color',
      '--p-button-primary-focus-ring-color',
      '--p-button-outlined-primary-color',
      '--p-button-text-primary-color',
    ];

    for (const token of brandBound) {
      const values = matchAll(css, new RegExp(`${token}:([^;]*);`, 'g'));
      expect(values.length).toBeGreaterThan(0);
      for (const value of values) {
        expect(value).toContain('--p-wingstop-');
        expect(value).not.toContain('--p-primary');
      }
    }
  });

  it('emits rules for the two Figma types PrimeNG has no variant for', () => {
    const { style } = renderButtonTheme();

    expect(style).toContain(`.${WINGSTOP_BUTTON_CLASSES.tertiary}`);
    expect(style).toContain(`.${WINGSTOP_BUTTON_CLASSES.vip}`);
  });
});
