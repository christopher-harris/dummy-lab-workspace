export default {
    root: {
        borderRadius: "12px",
        roundedBorderRadius: "4rem",
        gap: "0.625rem",
        paddingX: "36px",
        paddingY: "15px",
        iconOnlyWidth: "2.75rem",
        sm: {
            fontSize: "{border.radius.md}",
            paddingX: "{form.field.sm.padding.y}",
            paddingY: "0.375rem",
            iconOnlyWidth: "2.25rem"
        },
        lg: {
            fontSize: "{form.field.sm.font.size}",
            paddingX: "{form.field.lg.padding.y}",
            paddingY: "{form.field.lg.padding.x}",
            iconOnlyWidth: "2.75rem"
        },
        label: {
            fontWeight: "800"
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
            background: "{primary.color}",
            hoverBackground: "{primary.hover.color}",
            activeBackground: "{primary.active.color}",
            borderColor: "{primary.color}",
            hoverBorderColor: "{primary.color}",
            activeBorderColor: "{primary.active.color}",
            color: "{surface.0}",
            hoverColor: "{surface.0}",
            activeColor: "{surface.0}",
            focusRing: {
                color: "{primary.hover.color}",
                shadow: "none"
            }
        },
        secondary: {
            background: "{form.field.float.label.invalid.color}",
            hoverBackground: "{form.field.float.label.invalid.color}",
            activeBackground: "{form.field.float.label.invalid.color}",
            borderColor: "{form.field.float.label.invalid.color}",
            hoverBorderColor: "{form.field.float.label.invalid.color}",
            activeBorderColor: "{form.field.float.label.invalid.color}",
            color: "{surface.950}",
            hoverColor: "{surface.950}",
            activeColor: "{surface.950}",
            focusRing: {
                color: "light-dark({surface.700}, {surface.200})",
                shadow: "none"
            }
        },
        info: {
            background: "light-dark({highlight.focus.color}, {primary.600})",
            hoverBackground: "light-dark({primary.900}, {primary.500})",
            activeBackground: "light-dark({primary.900}, {primary.300})",
            borderColor: "light-dark({highlight.focus.color}, {primary.600})",
            hoverBorderColor: "light-dark({primary.900}, {primary.500})",
            activeBorderColor: "light-dark({primary.900}, {primary.300})",
            color: "light-dark(#fafafaff, {primary.950})",
            hoverColor: "light-dark(#fafafaff, {primary.950})",
            activeColor: "light-dark(#fafafaff, {primary.950})",
            focusRing: {
                color: "light-dark({highlight.focus.color}, {primary.600})",
                shadow: "none"
            }
        },
        success: {
            background: "light-dark({surface.600}, {primary.hover.color})",
            hoverBackground: "light-dark({content.color}, {form.field.hover.border.color})",
            activeBackground: "light-dark({content.color}, {form.field.disabled.color})",
            borderColor: "light-dark({surface.600}, {primary.hover.color})",
            hoverBorderColor: "light-dark({content.color}, {form.field.hover.border.color})",
            activeBorderColor: "light-dark({content.color}, {form.field.disabled.color})",
            color: "light-dark(#fafafaff, {content.hover.background})",
            hoverColor: "light-dark(#fafafaff, {content.hover.background})",
            activeColor: "light-dark(#fafafaff, {content.hover.background})",
            focusRing: {
                color: "light-dark({surface.600}, {primary.hover.color})",
                shadow: "none"
            }
        },
        warn: {
            background: "{form.field.float.label.invalid.color}",
            hoverBackground: "{form.field.float.label.invalid.color}",
            activeBackground: "light-dark({form.field.float.label.invalid.color}, {form.field.invalid.border.color})",
            borderColor: "{form.field.float.label.invalid.color}",
            hoverBorderColor: "{form.field.float.label.invalid.color}",
            activeBorderColor: "light-dark({form.field.float.label.invalid.color}, {form.field.invalid.border.color})",
            color: "light-dark(#fafafaff, {primary.950})",
            hoverColor: "light-dark(#fafafaff, {primary.950})",
            activeColor: "light-dark(#fafafaff, {primary.950})",
            focusRing: {
                color: "{form.field.float.label.invalid.color}",
                shadow: "none"
            }
        },
        help: {
            background: "{primary.300}",
            hoverBackground: "light-dark({primary.400}, {primary.200})",
            activeBackground: "light-dark({highlight.focus.color}, {primary.100})",
            borderColor: "{primary.300}",
            hoverBorderColor: "light-dark({primary.400}, {primary.200})",
            activeBorderColor: "light-dark({highlight.focus.color}, {primary.100})",
            color: "light-dark(#fafafaff, {primary.900})",
            hoverColor: "light-dark(#fafafaff, {primary.900})",
            activeColor: "light-dark(#fafafaff, {primary.900})",
            focusRing: {
                color: "{primary.300}",
                shadow: "none"
            }
        },
        danger: {
            background: "{form.field.float.label.invalid.color}",
            hoverBackground: "{form.field.float.label.invalid.color}",
            activeBackground: "light-dark({form.field.float.label.invalid.color}, {form.field.invalid.border.color})",
            borderColor: "{form.field.float.label.invalid.color}",
            hoverBorderColor: "{form.field.float.label.invalid.color}",
            activeBorderColor: "light-dark({form.field.float.label.invalid.color}, {form.field.invalid.border.color})",
            color: "light-dark(#fafafaff, {primary.950})",
            hoverColor: "light-dark(#fafafaff, {primary.950})",
            activeColor: "light-dark(#fafafaff, {primary.950})",
            focusRing: {
                color: "{form.field.float.label.invalid.color}",
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
            hoverBackground: "{primary.hover.color}",
            activeBackground: "{primary.active.color}",
            borderColor: "{primary.color}",
            color: "{primary.color}"
        },
        secondary: {
            hoverBackground: "light-dark({surface.100}, #fafafa0a)",
            activeBackground: "light-dark({surface.50}, #fafafa29)",
            borderColor: "light-dark({surface.300}, {surface.800})",
            color: "light-dark({surface.600}, {surface.500})"
        },
        success: {
            hoverBackground: "light-dark({content.border.color}, #43df810a)",
            activeBackground: "light-dark({content.hover.background}, #43df8129)",
            borderColor: "light-dark({form.field.hover.border.color}, {button.primary.background})",
            color: "light-dark({surface.600}, {primary.hover.color})"
        },
        info: {
            hoverBackground: "light-dark({highlight.focus.background}, #30b5f90a)",
            activeBackground: "light-dark({highlight.background}, #30b5f929)",
            borderColor: "light-dark({primary.300}, {primary.900})",
            color: "light-dark({highlight.focus.color}, {primary.600})"
        },
        warn: {
            hoverBackground: "light-dark({primary.contrast.color}, #fc95340a)",
            activeBackground: "light-dark({primary.contrast.color}, #fc953429)",
            borderColor: "light-dark({form.field.invalid.border.color}, {form.field.float.label.invalid.color})",
            color: "{form.field.float.label.invalid.color}"
        },
        help: {
            hoverBackground: "light-dark({highlight.background}, #c17dfd0a)",
            activeBackground: "light-dark({primary.contrast.color}, #c17dfd29)",
            borderColor: "light-dark({highlight.focus.background}, {primary.800})",
            color: "{primary.300}"
        },
        danger: {
            hoverBackground: "light-dark({highlight.background}, #f96f6a0a)",
            activeBackground: "light-dark({primary.contrast.color}, #f96f6a29)",
            borderColor: "light-dark({form.field.invalid.border.color}, {primary.950})",
            color: "{form.field.float.label.invalid.color}"
        },
        contrast: {
            hoverBackground: "light-dark({surface.100}, {surface.900})",
            activeBackground: "light-dark({surface.50}, {surface.800})",
            borderColor: "light-dark({surface.800}, {surface.600})",
            color: "light-dark({surface.900}, {surface.50})"
        },
        plain: {
            hoverBackground: "{surface.200}",
            activeBackground: "{surface.200}",
            borderColor: "{surface.700}",
            color: "{surface.700}"
        }
    },
    text: {
        primary: {
            hoverBackground: "#00000000",
            activeBackground: "#00000000",
            color: "{primary.color}"
        },
        secondary: {
            hoverBackground: "light-dark({surface.100}, {surface.900})",
            activeBackground: "light-dark({surface.50}, {surface.800})",
            color: "light-dark({surface.600}, {surface.500})"
        },
        success: {
            hoverBackground: "light-dark({content.border.color}, #43df810a)",
            activeBackground: "light-dark({content.hover.background}, #43df8129)",
            color: "light-dark({surface.600}, {primary.hover.color})"
        },
        info: {
            hoverBackground: "light-dark({highlight.focus.background}, #30b5f90a)",
            activeBackground: "light-dark({highlight.background}, #30b5f929)",
            color: "light-dark({highlight.focus.color}, {primary.600})"
        },
        warn: {
            hoverBackground: "light-dark({primary.contrast.color}, #fc95340a)",
            activeBackground: "light-dark({primary.contrast.color}, #fc953429)",
            color: "{form.field.float.label.invalid.color}"
        },
        help: {
            hoverBackground: "light-dark({highlight.background}, #c17dfd0a)",
            activeBackground: "light-dark({primary.contrast.color}, #c17dfd29)",
            color: "{primary.300}"
        },
        danger: {
            hoverBackground: "light-dark({highlight.background}, #f96f6a0a)",
            activeBackground: "light-dark({primary.contrast.color}, #f96f6a29)",
            color: "{form.field.float.label.invalid.color}"
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
}