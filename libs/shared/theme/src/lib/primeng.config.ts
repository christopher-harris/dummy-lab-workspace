import type { Theme } from '@primeuix/themes/types';
import { DARK_MODE_SELECTOR } from './dark-mode';

/**
 * Runtime options shared by every PrimeNG setup in the workspace.
 *
 * `darkModeSelector` comes from {@link DARK_MODE_SELECTOR} rather than being
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
