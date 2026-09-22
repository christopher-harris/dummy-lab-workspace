/**
 * Every selectable colour scheme, in the order a picker should render them.
 *
 * The array is the source of truth; {@link ThemeMode} is derived from it, so
 * adding an entry here widens the type automatically.
 */
export const THEME_MODES = ['light', 'dark'] as const;

/** The colour scheme in effect. */
export type ThemeMode = (typeof THEME_MODES)[number];

/**
 * Every selectable PrimeNG base preset, in the order a picker should render
 * them.
 *
 * Names rather than the imported preset objects, so the value stays
 * serialisable for storage sync. Mapping a name back to the object from
 * `@primeuix/themes` is the consumer's job.
 */
export const THEME_PRESETS = ['aura', 'lara', 'material', 'nora'] as const;

/** The PrimeNG base preset, by name. */
export type ThemePreset = (typeof THEME_PRESETS)[number];

/**
 * Every selectable primary palette, in the order a picker should render them.
 *
 * Mirrors the chromatic palettes shipped in `@primeuix/themes`; the neutral
 * ramps (slate, gray, zinc, neutral, stone) are surface colours and are
 * intentionally excluded.
 */
export const PRIMARY_COLORS = [
  'emerald',
  'green',
  'lime',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'red',
  'orange',
  'amber',
  'yellow',
] as const;

/** A PrimeNG primitive palette usable as the `primary` semantic colour. */
export type PrimaryColor = (typeof PRIMARY_COLORS)[number];

/**
 * State held by the theme store. Every field is persisted.
 */
export interface ThemeState {
  /** The colour scheme in effect. */
  mode: ThemeMode;
  /** The selected PrimeNG base preset. */
  preset: ThemePreset;
  /** The selected `primary` palette. */
  primaryColor: PrimaryColor;
}
