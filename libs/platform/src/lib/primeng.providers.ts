import type { EnvironmentProviders } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import type { PrimeNGConfigType } from 'primeng/config';
import figmaPreset from '../../../../theme/ts';

import { PRIMENG_THEME_OPTIONS } from './primeng.config';

/** Options accepted by {@link providePrimeNgPlatform}. */
export interface PrimeNgPlatformOptions {
  /**
   * Any other PrimeNG configuration - `ripple`, `inputVariant`, `translation`
   * and friends - merged over the workspace defaults.
   *
   * `theme` is deliberately excluded so generated Figma tokens remain the
   * single source of truth for PrimeNG's design tokens.
   */
  config?: Omit<PrimeNGConfigType, 'theme'>;
}

/**
 * Provides PrimeNG with the generated Figma theme.
 *
 * Drop this into an `ApplicationConfig` in place of calling `providePrimeNG()`
 * directly, so every app consumes the same Figma tokens. The generated preset
 * is imported from `theme/ts`, which is updated by the Figma export workflow.
 *
 * The dark-mode selector and CSS-layer order remain app integration settings,
 * rather than design tokens, so the theme store and Tailwind continue to
 * coordinate with PrimeNG.
 *
 * @example
 * export const appConfig: ApplicationConfig = {
 *   providers: [providePrimeNgPlatform()],
 * };
 *
 * @example
 * providePrimeNgPlatform({ config: { ripple: true } });
 */
export function providePrimeNgPlatform(
  options: PrimeNgPlatformOptions = {},
): EnvironmentProviders {
  const { config } = options;

  return providePrimeNG({
    ...config,
    theme: {
      preset: figmaPreset,
      options: PRIMENG_THEME_OPTIONS,
    },
    license: 'eyJpZCI6ImMyZTY5OTFmLThmMTQtNDIwNS1iMmI2LWRkYzk3ZjJhNzhmYiIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW1lcmNpYWwiLCJ0eXBlIjoiZGV2IiwiaWF0IjoxNzkwNDE4NjE3LCJleHAiOjE3OTgyMzI0MDB9.u5zQLDLU7hE7N4XXb40ngKyrAl_KLRS2pwsyOfqAz6jpNFzoQ_uQHIPWImnS0QvC1TdcPOtmhuaf6maZ-ETNBw'
  });
}
