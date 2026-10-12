import type { TagDesignTokens } from '@primeuix/themes/types/tag';

 export default {
    root: {
        fontSize: "0.875rem",
        fontWeight: "900",
        padding: "0.25rem 0.5rem",
        gap: "0.25rem",
        borderRadius: "{content.border.radius}",
        roundedBorderRadius: "{border.radius.xl}"
    },
    icon: {
        size: "0.75rem"
    },
    primary: {
        background: "light-dark({primary.100}, #10b98129)",
        color: "light-dark({primary.700}, {primary.300})"
    },
    secondary: {
        background: "light-dark({surface.100}, {surface.800})",
        color: "light-dark({surface.600}, {surface.300})"
    },
    success: {
        background: "light-dark({content.border.color}, #22c55e29)",
        color: "light-dark({content.color}, {form.field.disabled.color})"
    },
    info: {
        background: "light-dark({highlight.focus.background}, #0ea5e929)",
        color: "light-dark({primary.900}, {primary.300})"
    },
    warn: {
        background: "light-dark({primary.contrast.color}, #f9731629)",
        color: "light-dark({form.field.float.label.invalid.color}, {form.field.invalid.border.color})"
    },
    danger: {
        background: "light-dark({highlight.background}, #ef444429)",
        color: "light-dark({form.field.float.label.invalid.color}, {form.field.invalid.border.color})"
    },
    contrast: {
        background: "light-dark({surface.950}, {surface.0})",
        color: "light-dark({surface.0}, {surface.950})"
    }
} satisfies TagDesignTokens;