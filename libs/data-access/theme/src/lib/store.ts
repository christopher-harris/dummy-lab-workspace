import { computed, DOCUMENT, effect, inject } from '@angular/core';
import {
  withDevtools,
  withLocalStorage,
  withStorageSync,
} from '@angular-architects/ngrx-toolkit';
import { updatePrimaryPalette } from '@primeuix/themes';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

import {
  DARK_MODE_CLASS,
  DEFAULT_MODE,
  DEFAULT_PRESET,
  DEFAULT_PRIMARY_COLOR,
  PALETTE_SHADES,
  THEME_STORAGE_KEY,
} from './config';
import {
  PRIMARY_COLORS,
  THEME_PRESETS,
  type PrimaryColor,
  type ThemeMode,
  type ThemePreset,
  type ThemeState,
} from './models';

/**
 * Expands a palette name into the `primary` design token, e.g. `'indigo'`
 * becomes `{ 50: '{indigo.50}', ..., 950: '{indigo.950}' }`.
 */
const toPrimaryPalette = (color: PrimaryColor) =>
  Object.fromEntries(
    PALETTE_SHADES.map((shade) => [shade, `{${color}.${shade}}`]),
  );

const initialState: ThemeState = {
  mode: DEFAULT_MODE,
  preset: DEFAULT_PRESET,
  primaryColor: DEFAULT_PRIMARY_COLOR,
};

/**
 * Owns the application's theme selections: colour scheme, PrimeNG base preset
 * and primary palette.
 *
 * The whole state is persisted to `localStorage` via `withStorageSync`, so it
 * survives a refresh.
 *
 * `mode` and `primaryColor` are applied for you: effects keep
 * {@link DARK_MODE_CLASS} on `<html>` in sync with `isDark()` (the selector
 * PrimeNG watches via `darkModeSelector`) and push the selected palette into
 * PrimeNG's `primary` semantic colour. `preset` is *not* applied - feeding
 * that into `usePreset()` is still the consumer's job.
 *
 * @example
 * const theme = inject(ThemeStore);
 * theme.toggleDarkMode();
 * theme.setPrimaryColor('indigo');
 * theme.setPreset('lara');
 */
export const ThemeStore = signalStore(
  { providedIn: 'root' },
  withDevtools('theme'),
  withState(initialState),
  withStorageSync({ key: THEME_STORAGE_KEY }, withLocalStorage()),
  withComputed(({ mode }) => ({
    isDark: computed(() => mode() === 'dark'),
  })),
  withMethods((store) => ({
    /** Select a colour scheme explicitly. */
    setMode(mode: ThemeMode): void {
      patchState(store, { mode });
    },
    /** Flip between light and dark. */
    toggleDarkMode(): void {
      patchState(store, { mode: store.mode() === 'dark' ? 'light' : 'dark' });
    },
    /** Select the PrimeNG base preset. */
    setPreset(preset: ThemePreset): void {
      patchState(store, { preset });
    },
    /** Step to the next preset in {@link THEME_PRESETS}, wrapping around. */
    cyclePreset(): void {
      const next =
        (THEME_PRESETS.indexOf(store.preset()) + 1) % THEME_PRESETS.length;
      patchState(store, { preset: THEME_PRESETS[next] });
    },
    /** Select the palette used for the `primary` semantic colour. */
    setPrimaryColor(primaryColor: PrimaryColor): void {
      patchState(store, { primaryColor });
    },
    /** Step to the next palette in {@link PRIMARY_COLORS}, wrapping around. */
    cyclePrimaryColor(): void {
      const next =
        (PRIMARY_COLORS.indexOf(store.primaryColor()) + 1) %
        PRIMARY_COLORS.length;
      patchState(store, { primaryColor: PRIMARY_COLORS[next] });
    },
    /** Return every selection to its default. */
    reset(): void {
      patchState(store, initialState);
    },
  })),
  withHooks({
    onInit(store) {
      const documentRef = inject(DOCUMENT);

      effect(() => {
        documentRef.documentElement.classList.toggle(
          DARK_MODE_CLASS,
          store.isDark(),
        );
      });

      effect(() => {
        updatePrimaryPalette(toPrimaryPalette(store.primaryColor()));
      });
    },
  }),
);
