import type { PrimaryColor, ThemeMode, ThemePreset } from './models';

/**
 * The dark-mode class and selector are owned by `@dummy-lab/shared-theme`, next
 * to the PrimeNG configuration that reads them, and re-exported here so the
 * store and its consumers keep one import.
 */
export { DARK_MODE_CLASS, DARK_MODE_SELECTOR } from '@dummy-lab/shared-theme';

/** `localStorage` key the theme store persists its selections under. */
export const THEME_STORAGE_KEY = 'dummy-lab-theme';

/**
 * Shades of a PrimeNG primitive palette, used to map a palette name onto the
 * `primary` semantic colour.
 */
export const PALETTE_SHADES = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

/** Scheme used until the user picks one (or one is restored from storage). */
export const DEFAULT_MODE: ThemeMode = 'light';

/** Matches the preset the app is currently hardcoded to use. */
export const DEFAULT_PRESET: ThemePreset = 'aura';

/** Aura's own out-of-the-box primary palette. */
export const DEFAULT_PRIMARY_COLOR: PrimaryColor = 'emerald';
