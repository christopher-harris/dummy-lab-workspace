import Aura from '@primeuix/themes/aura';
import type { Preset, Theme } from '@primeuix/themes/types';
import { DARK_MODE_SELECTOR } from '@dummy-lab/data-access-theme';

/**
 * Base preset used when a caller does not pass one of their own.
 *
 * Matches `DEFAULT_PRESET` in `@dummy-lab/data-access-theme`, which is the
 * name the theme store starts on.
 */
export const DEFAULT_PRIMENG_PRESET: Preset = Aura;

/**
 * Theme options shared by every PrimeNG setup in the workspace.
 *
 * `darkModeSelector` is taken from `@dummy-lab/data-access-theme` rather than
 * spelled out here - the theme store toggles that same class on `<html>`, and
 * the two drifting apart silently breaks dark mode.
 *
 * The `cssLayer` order puts PrimeNG's component styles ahead of Tailwind's
 * utilities so that utility classes win when they collide.
 */
export const PRIMENG_THEME_OPTIONS = {
  darkModeSelector: DARK_MODE_SELECTOR,
  cssLayer: {
    name: 'primeng',
    order: 'theme, base, primeng, utilities',
  },
} as const satisfies NonNullable<Theme['options']>;
