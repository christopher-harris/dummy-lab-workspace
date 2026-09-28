import type { EnvironmentProviders } from '@angular/core';
import { definePreset } from '@primeuix/themes';
import { providePrimeNG } from 'primeng/config';
import type { PrimeNGConfigType } from 'primeng/config';
import type { Preset } from '@primeuix/themes/types';

import {
  DEFAULT_PRIMENG_PRESET,
  PRIMENG_THEME_OPTIONS,
} from './primeng.config';
import {
  WINGSTOP_BRAND_PRIMITIVES,
  WINGSTOP_BUTTON_TOKENS,
} from './theme/buttons.tokens';
import { FIGMA_V21_PREVIEW_PRESET } from './figma-v21-preview.preset';

export type PrimeNgThemeSource = 'workspace' | 'figma-preview';

/** Options accepted by {@link providePrimeNgPlatform}. */
export interface PrimeNgPlatformOptions {
  /** Select the workspace theme or the temporary Figma-to-v21 preview. */
  themeSource?: PrimeNgThemeSource;
  /**
   * Base preset to theme PrimeNG with.
   *
   * Defaults to {@link DEFAULT_PRIMENG_PRESET}. Pass one of the other presets
   * from `@primeuix/themes` to swap it at bootstrap; swapping it at runtime is
   * `usePreset()`'s job, not this provider's.
   */
  preset?: Preset;
  /**
   * Any other PrimeNG configuration - `ripple`, `inputVariant`, `translation`
   * and friends - merged over the workspace defaults.
   *
   * `theme` is deliberately excluded: use {@link PrimeNgPlatformOptions.preset}
   * so the shared theme options survive.
   */
  config?: Omit<PrimeNGConfigType, 'theme'>;
}

/**
 * Provides PrimeNG with the workspace's shared theme configuration.
 *
 * Drop this into an `ApplicationConfig` in place of calling `providePrimeNG()`
 * directly, so every app picks up the same dark-mode selector, CSS layer order
 * and Wingstop component styling.
 *
 * The chosen preset is extended with the Wingstop brand primitives and the
 * workspace's component design tokens (currently just the button). Those
 * tokens carry their own `extend` and `css`, so the custom variants ship as
 * real CSS inside PrimeNG's own cascade layer - no global pass-through needed.
 *
 * Brand colours deliberately live in their own `{wingstop.*}` primitive
 * namespace rather than the `primary` semantic palette, so the theme store's
 * primary-colour picker cannot repaint them.
 *
 * @example
 * export const appConfig: ApplicationConfig = {
 *   providers: [providePrimeNgPlatform()],
 * };
 *
 * @example
 * // Lara instead of Aura, with ripple on.
 * providePrimeNgPlatform({ preset: Lara, config: { ripple: true } });
 *
 * @example
 * // Preview the generated Figma tokens on PrimeNG v21.
 * providePrimeNgPlatform({ themeSource: 'figma-preview' });
 */
export function providePrimeNgPlatform(
  options: PrimeNgPlatformOptions = {},
): EnvironmentProviders {
  const {
    preset = DEFAULT_PRIMENG_PRESET,
    config,
    themeSource = 'workspace',
  } = options;

  const themePreset =
    themeSource === 'figma-preview'
      ? FIGMA_V21_PREVIEW_PRESET
      : definePreset(preset, {
          primitive: WINGSTOP_BRAND_PRIMITIVES,
          components: { button: WINGSTOP_BUTTON_TOKENS },
        });

  return providePrimeNG({
    ...config,
    theme: {
      preset: themePreset,
      options: PRIMENG_THEME_OPTIONS,
    },
  });
}
