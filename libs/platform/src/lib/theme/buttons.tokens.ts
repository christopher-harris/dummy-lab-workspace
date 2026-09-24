import type { ButtonDesignTokens } from '@primeuix/themes/types/button';

/**
 * The Wingstop brand palette, as a PrimeNG *primitive* token namespace.
 *
 * Source: NGFE Design System Figma variables (Actions page, node 1:4523).
 *
 * ## Why this is not the `primary` semantic palette
 *
 * PrimeNG's `primary` semantic colour is a *theme* choice - `@dummy-lab/data-access-theme`
 * exposes a picker over 17 palettes and calls `updatePrimaryPalette()` at
 * runtime. The Wingstop CTA green is not a theme choice; it is the brand.
 * Binding buttons to `{primary.*}` means the brand repaints itself whenever
 * somebody moves that picker.
 *
 * So the brand gets its own namespace, and everything below references
 * `{wingstop.*}` rather than `{primary.*}`. Each key is emitted as a CSS
 * variable: `wingstop.greenDark` becomes `--p-wingstop-green-dark`.
 */
export const WINGSTOP_BRAND_PRIMITIVES = {
  wingstop: {
    /** `action/color-action-base`, `background/default`, `text|border/default` */
    green: '#006938',
    /** `action/color-action-dark`, `background/active`, `text|border/active` */
    greenDark: '#004324',
    /** `background/active` at 10% - the outlined hover wash. */
    greenWash: 'rgba(0, 67, 36, 0.1)',
    /** `ink/color-ink-base` - Tertiary's pressed border and label. */
    inkBase: '#070707',
    /** `ink/color-ink-light` - Tertiary's resting border and label. */
    inkLight: '#4a4a4a',
    /** `text/disabled`, `border/disabled` */
    inkDisabled: '#a1a1a1',
    /** `bg/color-bg-base` - Tertiary's pressed fill. */
    surfacePressed: '#e0e0e0',
    /** `bg/color-bg-lighest` (sic - Figma's spelling), `ink/color-ink-reverse` */
    onBrand: '#ffffff',
    /** `Loyalty/Gold Gradient` stops, for the VIP type. */
    gold: '#caac33',
    goldLight: '#fff3a8',
    /** The brown wash laid over the gold gradient when VIP is pressed. */
    goldPressedWash: 'rgba(144, 96, 0, 0.3)',
  },
} as const;

/**
 * Classes that select the two Figma button types PrimeNG has no variant for.
 *
 * The other three map onto PrimeNG variants directly and need no class:
 * Primary is the default filled button, Secondary is `variant="outlined"`,
 * Text is `variant="text"`.
 *
 * Deliberately *not* mapped onto `severity`. PrimeNG's severity axis means
 * semantic intent (danger, warn, success); Figma's Primary/Secondary/Tertiary
 * is a single axis of visual emphasis. Spending `severity="secondary"` on
 * Figma's Tertiary reads badly at the call site and costs the semantic axis a
 * slot that a destructive button will eventually want.
 *
 * @example
 * <p-button variant="outlined" [styleClass]="WINGSTOP_BUTTON_CLASSES.tertiary" />
 * <p-button [styleClass]="WINGSTOP_BUTTON_CLASSES.vip" label="Redeem" />
 */
export const WINGSTOP_BUTTON_CLASSES = {
  /** Figma "Tertiary" - neutral-ink outline. Combine with `variant="outlined"`. */
  tertiary: 'ws-button-tertiary',
  /** Figma "VIP" - gold gradient fill. */
  vip: 'ws-button-vip',
} as const;

/**
 * Colour tokens, shared by both schemes.
 *
 * Figma specs these buttons in light only. Letting dark mode fall through to
 * Aura would put `{primary.color}` back in charge and reintroduce exactly the
 * palette coupling this file exists to remove, so dark reuses the same brand
 * values. Revisit when the design system publishes a dark CTA spec.
 *
 * `outlined.secondary` is intentionally absent: Figma's Tertiary is a class
 * now, so `severity="secondary"` is left alone to mean what PrimeNG says.
 */
const COLOR_SCHEME: Omit<ButtonDesignTokens, 'colorScheme' | 'extend' | 'css'> =
  {
    root: {
      // Figma "Primary": solid green, white label, darkening on press.
      primary: {
        // background: '{wingstop.green}',
        hoverBackground: '{wingstop.greenDark}',
        activeBackground: '{wingstop.greenDark}',
        borderColor: '{wingstop.green}',
        hoverBorderColor: '{wingstop.greenDark}',
        activeBorderColor: '{wingstop.greenDark}',
        color: '{wingstop.onBrand}',
        hoverColor: '{wingstop.onBrand}',
        activeColor: '{wingstop.onBrand}',
        // Aura points this at `{primary.color}`. Left alone it would be the
        // one part of the button still following the theme picker.
        focusRing: { color: '{wingstop.green}', shadow: 'none' },
      },
    },
    outlined: {
      // Figma "Secondary": green hairline, green label, green wash on press.
      primary: {
        borderColor: '{wingstop.green}',
        color: '{wingstop.green}',
        hoverBackground: '{wingstop.greenWash}',
        activeBackground: '{wingstop.greenWash}',
      },
    },
    text: {
      // Figma "Text": bare green label. Aura tints the background on hover;
      // the design does not, so both states are pinned transparent.
      primary: {
        color: '{wingstop.green}',
        hoverBackground: 'transparent',
        activeBackground: 'transparent',
      },
    },
  };

/**
 * Custom tokens for the parts of the design the standard `button.*` token API
 * has no key for.
 *
 * These are emitted exactly like built-in component tokens - `wingstop.vip.color`
 * becomes `--p-button-wingstop-vip-color` - and are consumed by {@link BUTTON_CSS}.
 * Adding them here rather than hard-coding values in the CSS keeps every value
 * in one place and overridable by a downstream preset.
 */
const EXTEND = {
  wingstop: {
    fontFamily: "var(--font-display, 'Roc Grotesk', 'Open Sans', sans-serif)",
    fontSize: '1.375rem',
    lineHeight: '1.5rem',
    letterSpacing: '0.0625rem',
    /** Figma draws the leading glyph at 20px. */
    iconSize: '1.25rem',

    // -- Figma "Text" follows the Title 4 style, not Button 1.
    text: {
      fontWeight: '500',
      letterSpacing: '0.025rem',
      pressedColor: '{wingstop.greenDark}',
    },

    // -- Outlined types thicken the stroke 1px -> 2px when pressed. Padding
    // sheds the pixel the border gains, so the button does not grow 2px under
    // the cursor.
    outlined: {
      pressedBorderWidth: '2px',
      pressedPaddingX: '1.4375rem',
      pressedPaddingY: '0.5625rem',
    },

    /** Figma "Secondary" - outlined, brand green. */
    secondary: {
      pressedBorderColor: '{wingstop.greenDark}',
      pressedColor: '{wingstop.greenDark}',
    },

    /** Figma "Tertiary" - outlined, neutral ink. */
    tertiary: {
      borderColor: '{wingstop.inkLight}',
      color: '{wingstop.inkLight}',
      pressedBackground: '{wingstop.surfacePressed}',
      pressedBorderColor: '{wingstop.inkBase}',
      pressedColor: '{wingstop.inkBase}',
    },

    /** Figma "VIP" - gold gradient, ink label. */
    vip: {
      background:
        'linear-gradient(84.05deg, {wingstop.gold} 7.66%, {wingstop.goldLight} 50.98%, {wingstop.gold} 92.67%)',
      pressedOverlay: '{wingstop.goldPressedWash}',
      color: '{wingstop.inkBase}',
    },

    // -- Figma renders disabled as opaque fills; PrimeNG dims with opacity.
    disabled: {
      background: '{wingstop.inkDisabled}',
      color: '{wingstop.onBrand}',
      mutedColor: '{wingstop.inkDisabled}',
    },
  },
};

/** Shorthand for a token reference inside {@link BUTTON_CSS}. */
type Dt = (key: string) => string | number | undefined;

const { tertiary: TERTIARY, vip: VIP } = WINGSTOP_BUTTON_CLASSES;

/**
 * Rules that consume {@link EXTEND}.
 *
 * PrimeNG injects this as the button's `-style` sheet and wraps it in
 * `@layer primeng` - the same layer as its own CSS - so Tailwind utilities
 * still win over it, matching the workspace's `cssLayer` order.
 *
 * Every selector is prefixed `.p-button.p-component` rather than `.p-button`.
 * Both classes are always present on the root, and the extra class lifts
 * specificity above PrimeNG's own single-class rules, so these win regardless
 * of the order the two sheets happen to load in.
 */
const BUTTON_CSS = ({ dt }: { dt: Dt }) => `
/* Shared CTA typography - Figma "Button 1". */
.p-button.p-component {
    font-family: ${dt('button.wingstop.fontFamily')};
    font-size: ${dt('button.wingstop.fontSize')};
    line-height: ${dt('button.wingstop.lineHeight')};
    letter-spacing: ${dt('button.wingstop.letterSpacing')};
    text-transform: uppercase;
}

.p-button.p-component .p-button-icon {
    font-size: ${dt('button.wingstop.iconSize')};
}

/* Figma "Text" follows Title 4: lighter weight, tighter tracking. */
.p-button.p-component.p-button-text {
    letter-spacing: ${dt('button.wingstop.text.letterSpacing')};
}
.p-button.p-component.p-button-text .p-button-label {
    font-weight: ${dt('button.wingstop.text.fontWeight')};
}
.p-button.p-component.p-button-text:enabled:hover,
.p-button.p-component.p-button-text:enabled:active {
    color: ${dt('button.wingstop.text.pressedColor')};
}

/* Both outlined types thicken the stroke when pressed, without resizing. */
.p-button.p-component.p-button-outlined:enabled:hover,
.p-button.p-component.p-button-outlined:enabled:active {
    border-width: ${dt('button.wingstop.outlined.pressedBorderWidth')};
    padding: ${dt('button.wingstop.outlined.pressedPaddingY')} ${dt('button.wingstop.outlined.pressedPaddingX')};
}

/* Figma "Secondary" - outlined, brand green. */
.p-button.p-component.p-button-outlined:not(.${TERTIARY}):enabled:hover,
.p-button.p-component.p-button-outlined:not(.${TERTIARY}):enabled:active {
    border-color: ${dt('button.wingstop.secondary.pressedBorderColor')};
    color: ${dt('button.wingstop.secondary.pressedColor')};
}

/* Figma "Tertiary" - outlined, neutral ink. */
.p-button.p-component.p-button-outlined.${TERTIARY} {
    border-color: ${dt('button.wingstop.tertiary.borderColor')};
    color: ${dt('button.wingstop.tertiary.color')};
}
.p-button.p-component.p-button-outlined.${TERTIARY}:enabled:hover,
.p-button.p-component.p-button-outlined.${TERTIARY}:enabled:active {
    background: ${dt('button.wingstop.tertiary.pressedBackground')};
    border-color: ${dt('button.wingstop.tertiary.pressedBorderColor')};
    color: ${dt('button.wingstop.tertiary.pressedColor')};
}

/* Figma "VIP" - gold gradient. Disabled falls through to the opaque grey
   fill below, which is what the design shows. */
.p-button.p-component.${VIP}:enabled {
    background: ${dt('button.wingstop.vip.background')};
    border-color: transparent;
    color: ${dt('button.wingstop.vip.color')};
}
.p-button.p-component.${VIP}:enabled:hover,
.p-button.p-component.${VIP}:enabled:active {
    background-image: linear-gradient(${dt('button.wingstop.vip.pressedOverlay')}, ${dt('button.wingstop.vip.pressedOverlay')}), ${dt('button.wingstop.vip.background')};
}

/* Disabled - opaque fills, not PrimeNG's opacity dimming. */
.p-button.p-component:disabled {
    opacity: 1;
}
.p-button.p-component:disabled:not(.p-button-outlined):not(.p-button-text):not(.p-button-link) {
    background: ${dt('button.wingstop.disabled.background')};
    border-color: ${dt('button.wingstop.disabled.background')};
    color: ${dt('button.wingstop.disabled.color')};
}
.p-button.p-component.p-button-outlined:disabled {
    border-color: ${dt('button.wingstop.disabled.mutedColor')};
    color: ${dt('button.wingstop.disabled.mutedColor')};
}
.p-button.p-component.p-button-text:disabled {
    color: ${dt('button.wingstop.disabled.mutedColor')};
}
`;

/**
 * Button design tokens for the Wingstop CTA buttons.
 *
 * Source: NGFE Design System -> Actions -> CTA Button (Figma node 1:4574).
 *
 * ## How the Figma types map onto PrimeNG
 *
 * | Figma `Type` | Call site                                | Styled by            |
 * | ------------ | ---------------------------------------- | -------------------- |
 * | Primary      | default                                  | `root.primary`       |
 * | Secondary    | `variant="outlined"`                     | `outlined.primary`   |
 * | Tertiary     | `variant="outlined"` + `.ws-button-tertiary` | `extend` + `css` |
 * | Text         | `variant="text"`                         | `text.primary`       |
 * | VIP          | `.ws-button-vip`                         | `extend` + `css`     |
 *
 * Figma's `State=Hover / Pressed` is one state; PrimeNG splits it into `hover`
 * and `active`, so both get the same value throughout.
 *
 * ## Three layers, in order of preference
 *
 * 1. **Standard component tokens** (`root`, `outlined`, `text`) carry
 *    everything PrimeNG already models - the three types above that line up
 *    with a real PrimeNG variant.
 * 2. **`extend`** mints custom tokens for what the standard API has no key
 *    for: typography, the pressed border width, per-state label and border
 *    colours, opaque disabled fills, the gold gradient.
 * 3. **`css`** writes the rules that consume them. This is PrimeNG's own
 *    sanctioned escape hatch (see the Extend section of the styled-mode
 *    guide, whose worked example adds exactly this kind of custom button).
 *
 * The call sites still need a `styleClass` for Tertiary and VIP. Wrapping that
 * in a directive so templates can speak Figma's vocabulary is a separate
 * decision, pending a naming conversation with the design team.
 *
 * ## Why the colours sit under `colorScheme` and the geometry does not
 *
 * Aura declares button geometry at `components.button.root` but every colour
 * under `components.button.colorScheme.light|dark`. Both levels emit the same
 * `--p-button-*` variables into `:root`, and the colour-scheme block is
 * written last - so a colour placed at the top level is emitted first and then
 * overwritten by Aura's `var(--p-primary-color)`. Geometry has no
 * colour-scheme counterpart in Aura, so it stays at the top level.
 *
 * ## Known gap
 *
 * Figma's Secondary and Tertiary sit on an opaque white fill; Aura leaves
 * outlined buttons transparent. Identical on the app's light surfaces, and
 * pinning it to white would mean taking over the hover wash too, so it is
 * left alone. Figma's `State=Hover / Pressed-Green` (Secondary on a green
 * promo background) is likewise a context-specific variant, not a global
 * default.
 *
 * @see {@link WINGSTOP_BRAND_PRIMITIVES}
 * @see {@link WINGSTOP_BUTTON_CLASSES}
 */
export const WINGSTOP_BUTTON_TOKENS: ButtonDesignTokens = {
  root: {
    /** `border-radius/border-radius-4` */
    borderRadius: '0.25rem',
    /** Gap between the icon and the label in the `Content` frame. */
    gap: '0.25rem',
    /** 24px horizontal, 10px vertical - uniform across every CTA variant. */
    paddingX: '1.5rem',
    paddingY: '0.625rem',
    label: {
      /** Roc Grotesk "Condensed Bold". */
      fontWeight: '700',
    },
  },
  colorScheme: {
    light: COLOR_SCHEME,
    dark: COLOR_SCHEME,
  },
  extend: EXTEND,
  css: BUTTON_CSS,
};
