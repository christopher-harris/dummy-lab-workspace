import type { ButtonDesignTokens } from '@primeuix/themes/types/button';

 export default {
    root: {
        borderRadius: "{form.field.sm.padding.y}",
        roundedBorderRadius: "2.25rem",
        gap: "0.625rem",
        paddingX: "{form.field.padding.y}",
        paddingY: "{form.field.border.radius}",
        iconOnlyWidth: "2.75rem",
        sm: {
            fontSize: "{overlay.modal.border.radius}",
            paddingX: "{form.field.sm.padding.y}",
            paddingY: "{form.field.border.radius}",
            iconOnlyWidth: "2.25rem"
        },
        lg: {
            fontSize: "{form.field.sm.font.size}",
            paddingX: "{form.field.lg.padding.y}",
            paddingY: "{form.field.lg.padding.x}",
            iconOnlyWidth: "2.75rem"
        },
        label: {
            fontWeight: "600"
        },
        raisedShadow: "0 3px 1px -2px #00000033, 0 2px 2px 0 #00000024, 0 1px 5px 0 #0000001f",
        focusRing: {
            width: "{focus.ring.offset}",
            style: "{focus.ring.offset}",
            offset: "{focus.ring.width}"
        },
        badgeSize: "1rem",
        transitionDuration: "{form.field.transition.duration}",
        primary: {
            background: "{green.500}",
            hoverBackground: "{primary.active.color}",
            activeBackground: "{primary.hover.color}",
            borderColor: "{green.500}",
            hoverBorderColor: "{primary.active.color}",
            activeBorderColor: "{primary.hover.color}",
            color: "light-dark({form.field.filled.background}, {navigation.item.active.background})",
            hoverColor: "light-dark({form.field.filled.background}, {navigation.item.active.background})",
            activeColor: "light-dark({form.field.filled.background}, {navigation.item.active.background})",
            focusRing: {
                color: "{primary.hover.color}",
                shadow: "none"
            }
        },
        secondary: {
            background: "light-dark({surface.50}, {surface.900})",
            hoverBackground: "light-dark({surface.300}, {surface.800})",
            activeBackground: "light-dark({surface.200}, {surface.700})",
            borderColor: "light-dark({surface.50}, {surface.900})",
            hoverBorderColor: "light-dark({surface.300}, {surface.800})",
            activeBorderColor: "light-dark({surface.200}, {surface.700})",
            color: "light-dark({surface.700}, {surface.200})",
            hoverColor: "light-dark({surface.800}, {surface.300})",
            activeColor: "light-dark({surface.900}, {surface.50})",
            focusRing: {
                color: "light-dark({surface.700}, {surface.200})",
                shadow: "none"
            }
        },
        info: {
            background: "light-dark({sky.600}, {sky.500})",
            hoverBackground: "light-dark({sky.700}, {sky.400})",
            activeBackground: "light-dark({sky.800}, {sky.300})",
            borderColor: "light-dark({sky.600}, {sky.500})",
            hoverBorderColor: "light-dark({sky.700}, {sky.400})",
            activeBorderColor: "light-dark({sky.800}, {sky.300})",
            color: "light-dark(#fafafaff, {sky.900})",
            hoverColor: "light-dark(#fafafaff, {sky.900})",
            activeColor: "light-dark(#fafafaff, {sky.900})",
            focusRing: {
                color: "light-dark({sky.600}, {sky.500})",
                shadow: "none"
            }
        },
        success: {
            background: "light-dark({green.600}, {green.500})",
            hoverBackground: "light-dark({green.700}, {green.400})",
            activeBackground: "light-dark({green.800}, {green.300})",
            borderColor: "light-dark({green.600}, {green.500})",
            hoverBorderColor: "light-dark({green.700}, {green.400})",
            activeBorderColor: "light-dark({green.800}, {green.300})",
            color: "light-dark(#fafafaff, {green.900})",
            hoverColor: "light-dark(#fafafaff, {green.900})",
            activeColor: "light-dark(#fafafaff, {green.900})",
            focusRing: {
                color: "light-dark({green.600}, {green.500})",
                shadow: "none"
            }
        },
        warn: {
            background: "light-dark({orange.600}, {orange.500})",
            hoverBackground: "light-dark({orange.700}, {orange.400})",
            activeBackground: "light-dark({orange.800}, {orange.300})",
            borderColor: "light-dark({orange.600}, {orange.500})",
            hoverBorderColor: "light-dark({orange.700}, {orange.400})",
            activeBorderColor: "light-dark({orange.800}, {orange.300})",
            color: "light-dark(#fafafaff, {orange.900})",
            hoverColor: "light-dark(#fafafaff, {orange.900})",
            activeColor: "light-dark(#fafafaff, {orange.900})",
            focusRing: {
                color: "light-dark({orange.600}, {orange.500})",
                shadow: "none"
            }
        },
        help: {
            background: "light-dark({purple.600}, {purple.500})",
            hoverBackground: "light-dark({purple.700}, {purple.400})",
            activeBackground: "light-dark({purple.800}, {purple.300})",
            borderColor: "light-dark({purple.600}, {purple.500})",
            hoverBorderColor: "light-dark({purple.700}, {purple.400})",
            activeBorderColor: "light-dark({purple.800}, {purple.300})",
            color: "light-dark(#fafafaff, {purple.900})",
            hoverColor: "light-dark(#fafafaff, {purple.900})",
            activeColor: "light-dark(#fafafaff, {purple.900})",
            focusRing: {
                color: "light-dark({purple.600}, {purple.500})",
                shadow: "none"
            }
        },
        danger: {
            background: "light-dark({red.600}, {red.500})",
            hoverBackground: "light-dark({red.700}, {red.400})",
            activeBackground: "light-dark({red.800}, {red.300})",
            borderColor: "light-dark({red.600}, {red.500})",
            hoverBorderColor: "light-dark({red.700}, {red.400})",
            activeBorderColor: "light-dark({red.800}, {red.300})",
            color: "light-dark(#fafafaff, {red.900})",
            hoverColor: "light-dark(#fafafaff, {red.900})",
            activeColor: "light-dark(#fafafaff, {red.900})",
            focusRing: {
                color: "light-dark({red.600}, {red.500})",
                shadow: "none"
            }
        },
        contrast: {
            background: "light-dark({surface.900}, {surface.50})",
            hoverBackground: "light-dark({surface.950}, {surface.50})",
            activeBackground: "light-dark({surface.900}, {surface.300})",
            borderColor: "light-dark({surface.900}, {surface.50})",
            hoverBorderColor: "light-dark({surface.950}, {surface.50})",
            activeBorderColor: "light-dark({surface.900}, {surface.300})",
            color: "light-dark({surface.50}, {surface.900})",
            hoverColor: "light-dark({surface.50}, {surface.900})",
            activeColor: "light-dark({surface.50}, {surface.900})",
            focusRing: {
                color: "light-dark({surface.900}, {surface.50})",
                shadow: "none"
            }
        }
    },
    outlined: {
        primary: {
            hoverBackground: "light-dark({primary.100}, #37d6a10a)",
            activeBackground: "light-dark({primary.50}, #37d6a129)",
            borderColor: "light-dark({primary.300}, {primary.800})",
            color: "{primary.hover.color}"
        },
        secondary: {
            hoverBackground: "light-dark({surface.100}, #fafafa0a)",
            activeBackground: "light-dark({surface.50}, #fafafa29)",
            borderColor: "light-dark({surface.300}, {surface.800})",
            color: "light-dark({surface.600}, {surface.500})"
        },
        success: {
            hoverBackground: "light-dark({green.100}, #43df810a)",
            activeBackground: "light-dark({green.50}, #43df8129)",
            borderColor: "light-dark({green.300}, {button.primary.background})",
            color: "light-dark({green.600}, {green.500})"
        },
        info: {
            hoverBackground: "light-dark({sky.100}, #30b5f90a)",
            activeBackground: "light-dark({sky.50}, #30b5f929)",
            borderColor: "light-dark({sky.300}, {sky.800})",
            color: "light-dark({sky.600}, {sky.500})"
        },
        warn: {
            hoverBackground: "light-dark({orange.100}, #fc95340a)",
            activeBackground: "light-dark({orange.50}, #fc953429)",
            borderColor: "light-dark({orange.300}, {orange.800})",
            color: "light-dark({orange.600}, {orange.500})"
        },
        help: {
            hoverBackground: "light-dark({purple.100}, #c17dfd0a)",
            activeBackground: "light-dark({purple.50}, #c17dfd29)",
            borderColor: "light-dark({purple.300}, {purple.800})",
            color: "light-dark({purple.600}, {purple.500})"
        },
        danger: {
            hoverBackground: "light-dark({red.100}, #f96f6a0a)",
            activeBackground: "light-dark({red.50}, #f96f6a29)",
            borderColor: "light-dark({red.300}, {red.800})",
            color: "light-dark({red.600}, {red.500})"
        },
        contrast: {
            hoverBackground: "light-dark({surface.100}, {surface.900})",
            activeBackground: "light-dark({surface.50}, {surface.800})",
            borderColor: "light-dark({surface.800}, {surface.600})",
            color: "light-dark({surface.900}, {surface.50})"
        },
        plain: {
            hoverBackground: "light-dark({surface.100}, {surface.900})",
            activeBackground: "light-dark({surface.50}, {surface.800})",
            borderColor: "light-dark({surface.300}, {surface.700})",
            color: "light-dark({surface.800}, {surface.50})"
        }
    },
    text: {
        primary: {
            hoverBackground: "light-dark({primary.100}, #37d6a10a)",
            activeBackground: "light-dark({primary.50}, #37d6a129)",
            color: "{primary.hover.color}"
        },
        secondary: {
            hoverBackground: "light-dark({surface.100}, {surface.900})",
            activeBackground: "light-dark({surface.50}, {surface.800})",
            color: "light-dark({surface.600}, {surface.500})"
        },
        success: {
            hoverBackground: "light-dark({green.100}, #43df810a)",
            activeBackground: "light-dark({green.50}, #43df8129)",
            color: "light-dark({green.600}, {green.500})"
        },
        info: {
            hoverBackground: "light-dark({sky.100}, #30b5f90a)",
            activeBackground: "light-dark({sky.50}, #30b5f929)",
            color: "light-dark({sky.600}, {sky.500})"
        },
        warn: {
            hoverBackground: "light-dark({orange.100}, #fc95340a)",
            activeBackground: "light-dark({orange.50}, #fc953429)",
            color: "light-dark({orange.600}, {orange.500})"
        },
        help: {
            hoverBackground: "light-dark({purple.100}, #c17dfd0a)",
            activeBackground: "light-dark({purple.50}, #c17dfd29)",
            color: "light-dark({purple.600}, {purple.500})"
        },
        danger: {
            hoverBackground: "light-dark({red.100}, #f96f6a0a)",
            activeBackground: "light-dark({red.50}, #f96f6a29)",
            color: "light-dark({red.600}, {red.500})"
        },
        contrast: {
            hoverBackground: "light-dark({surface.100}, {surface.900})",
            activeBackground: "light-dark({surface.50}, {surface.800})",
            color: "light-dark({surface.900}, {surface.50})"
        },
        plain: {
            hoverBackground: "light-dark({surface.100}, {surface.900})",
            activeBackground: "light-dark({surface.50}, {surface.800})",
            color: "light-dark({surface.800}, {surface.50})"
        }
    },
    link: {
        color: "{primary.hover.color}",
        hoverColor: "{primary.hover.color}",
        activeColor: "{primary.hover.color}"
    }
} satisfies ButtonDesignTokens;