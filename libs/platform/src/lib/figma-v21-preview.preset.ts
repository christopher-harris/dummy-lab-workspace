import type { Preset } from '@primeuix/themes/types';

// The Figma export currently targets PrimeUI v22. Its JavaScript output is
// valid in v21, while its TypeScript output imports v22-only token types.
// @ts-expect-error Figma-generated JavaScript intentionally has no v21 declaration.
import figmaGeneratedPreset from '../../../../theme/js/index.js';

/**
 * Figma component token groups that do not exist in PrimeNG v21.
 *
 * This is intentionally a filter, not a translation. Mapping renamed v22
 * component schemas to v21 would create a second, hand-maintained theme.
 */
const V22_ONLY_COMPONENTS = new Set([
  'commandmenu',
  'compare',
  'gallery',
  'inputcolor',
  'inputtags',
  'label',
  'navigationmenu',
  'scrollarea',
  'sidebar',
]);

const v21Components = Object.fromEntries(
  Object.entries(figmaGeneratedPreset.components ?? {}).filter(
    ([component]) => !V22_ONLY_COMPONENTS.has(component),
  ),
);

/**
 * Preview-only bridge from the current Figma export to PrimeNG v21.
 *
 * Remove this when the workspace moves to the PrimeNG version targeted by
 * Figma. Token values remain generated; this file only omits unsupported
 * component groups.
 */
export const FIGMA_V21_PREVIEW_PRESET = {
  ...figmaGeneratedPreset,
  components: v21Components,
} as Preset;
