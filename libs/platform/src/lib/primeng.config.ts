import type { Theme } from '@primeuix/themes/types';
import { DARK_MODE_SELECTOR } from '@dummy-lab/data-access-theme';

/**
 * Runtime options shared by every PrimeNG setup in the workspace.
 *
 * `darkModeSelector` is taken from `@dummy-lab/data-access-theme` rather than
 * spelled out here - the theme store toggles that same class on `<html>`, and
 * the two drifting apart silently breaks dark mode.
 *
 * The `cssLayer` order puts PrimeNG's component styles ahead of Tailwind's
 * utilities so that utility classes win when they collide. Design tokens live
 * exclusively in the generated Figma preset.
 */
export const PRIMENG_THEME_OPTIONS = {
  darkModeSelector: DARK_MODE_SELECTOR,
  cssLayer: {
    name: 'primeng',
    order: 'theme, base, primeng, utilities',
  },
} as const satisfies NonNullable<Theme['options']>;
