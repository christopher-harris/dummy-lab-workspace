import type { BadgeDesignTokens } from '@primeuix/themes/types/badge';

 export default {
    root: {
        borderRadius: "{border.radius.md}",
        padding: "0 0.5rem",
        fontSize: "0.75rem",
        fontWeight: "900",
        minWidth: "1.5rem",
        height: "1.5rem"
    },
    dot: {
        size: "0.5rem"
    },
    sm: {
        fontSize: "0.625rem",
        minWidth: "1.25rem",
        height: "1.25rem"
    },
    lg: {
        fontSize: "0.875rem",
        minWidth: "1.75rem",
        height: "1.75rem"
    },
    xl: {
        fontSize: "1rem",
        minWidth: "2rem",
        height: "2rem"
    },
    primary: {
        background: "{primary.color}",
        color: "{primary.contrast.color}"
    },
    secondary: {
        background: "light-dark({surface.100}, {surface.800})",
        color: "light-dark({surface.600}, {surface.300})"
    },
    success: {
        background: "light-dark({primary.hover.color}, {form.field.hover.border.color})",
        color: "light-dark({surface.0}, {content.background})"
    },
    info: {
        background: "light-dark({primary.600}, {primary.500})",
        color: "light-dark({surface.0}, {primary.950})"
    },
    warn: {
        background: "light-dark({form.field.invalid.border.color}, {form.field.float.label.invalid.color})",
        color: "light-dark({surface.0}, {surface.950})"
    },
    danger: {
        background: "{form.field.float.label.invalid.color}",
        color: "light-dark({surface.0}, {content.background})"
    },
    contrast: {
        background: "light-dark({surface.950}, {surface.0})",
        color: "light-dark({surface.0}, {surface.950})"
    }
} satisfies BadgeDesignTokens;