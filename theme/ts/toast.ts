import type { ToastDesignTokens } from '@primeuix/themes/types/toast';

 export default {
    root: {
        width: "25rem",
        borderRadius: "{content.border.radius}",
        borderWidth: "1px",
        transitionDuration: "{transition.duration}",
        blur: "light-dark(1.5px, 10px)",
        focusRing: {
            style: "solid"
        }
    },
    icon: {
        size: "1.125rem"
    },
    content: {
        padding: "{overlay.popover.padding}",
        gap: "0.5rem"
    },
    text: {
        gap: "0.5rem"
    },
    summary: {
        fontWeight: "700",
        fontSize: "1rem"
    },
    detail: {
        fontWeight: "700",
        fontSize: "0.875rem"
    },
    closeButton: {
        width: "1.75rem",
        height: "1.75rem",
        borderRadius: "1.75rem",
        focusRing: {
            width: "{focus.ring.width}",
            style: "{focus.ring.style}",
            offset: "{focus.ring.offset}"
        }
    },
    closeIcon: {
        size: "1rem"
    },
    info: {
        background: "light-dark(#eff6fff2, #3b82f629)",
        borderColor: "light-dark({primary.200}, #1d4ed85c)",
        color: "light-dark({primary.600}, {primary.500})",
        detailColor: "light-dark({surface.700}, {surface.0})",
        shadow: "0 4px 8px 0 #02050a0a",
        closeButton: {
            hoverBackground: "light-dark({highlight.focus.background}, #ffffff0d)",
            focusRing: {
                color: "light-dark({primary.600}, {primary.500})",
                shadow: "none"
            }
        }
    },
    success: {
        background: "light-dark(#f0fdf4f2, #22c55e29)",
        borderColor: "light-dark({form.field.border.color}, #15803d5c)",
        color: "light-dark({surface.600}, {primary.hover.color})",
        detailColor: "light-dark({surface.700}, {surface.0})",
        shadow: "0 4px 8px 0 #0108040a",
        closeButton: {
            hoverBackground: "light-dark({content.border.color}, #ffffff0d)",
            focusRing: {
                color: "light-dark({surface.600}, {primary.hover.color})",
                shadow: "none"
            }
        }
    },
    warn: {
        background: "light-dark(#fefce8f2, #eab30829)",
        borderColor: "light-dark({form.field.invalid.border.color}, #a162075c)",
        color: "{form.field.float.label.invalid.color}",
        detailColor: "light-dark({surface.700}, {surface.0})",
        shadow: "0 4px 8px 0 #0907000a",
        closeButton: {
            hoverBackground: "light-dark({content.border.color}, #ffffff0d)",
            focusRing: {
                color: "{form.field.float.label.invalid.color}",
                shadow: "none"
            }
        }
    },
    error: {
        background: "light-dark(#fef2f2f2, #ef444429)",
        borderColor: "light-dark({highlight.background}, #b91c1c5c)",
        color: "{form.field.float.label.invalid.color}",
        detailColor: "light-dark({surface.700}, {surface.0})",
        shadow: "0 4px 8px 0 #0a03030a",
        closeButton: {
            hoverBackground: "light-dark({highlight.background}, #ffffff0d)",
            focusRing: {
                color: "{form.field.float.label.invalid.color}",
                shadow: "none"
            }
        }
    },
    secondary: {
        background: "light-dark({surface.100}, {surface.800})",
        borderColor: "light-dark({surface.200}, {surface.700})",
        color: "light-dark({surface.600}, {surface.300})",
        detailColor: "light-dark({surface.700}, {surface.0})",
        shadow: "0 4px 8px 0 #0405060a",
        closeButton: {
            hoverBackground: "light-dark({surface.200}, {surface.700})",
            focusRing: {
                color: "light-dark({surface.600}, {surface.300})",
                shadow: "none"
            }
        }
    },
    contrast: {
        background: "light-dark({surface.900}, {surface.0})",
        borderColor: "light-dark({surface.950}, {surface.100})",
        color: "light-dark({surface.50}, {surface.950})",
        detailColor: "light-dark({surface.0}, {surface.950})",
        shadow: "0 4px 8px 0 #0000010a",
        closeButton: {
            hoverBackground: "light-dark({surface.800}, {surface.100})",
            focusRing: {
                color: "light-dark({surface.50}, {surface.950})",
                shadow: "none"
            }
        }
    }
} satisfies ToastDesignTokens;