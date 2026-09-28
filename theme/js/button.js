export default {
    root: {
        borderRadius: "{form.field.border.radius}",
        roundedBorderRadius: "2rem",
        gap: "0.5rem",
        paddingX: "{form.field.padding.x}",
        paddingY: "{form.field.padding.y}",
        iconOnlyWidth: "2.5rem",
        sm: {
            fontSize: "{form.field.sm.font.size}",
            paddingX: "{form.field.sm.padding.x}",
            paddingY: "{form.field.sm.padding.y}",
            iconOnlyWidth: "2rem"
        },
        lg: {
            fontSize: "{form.field.lg.font.size}",
            paddingX: "{form.field.lg.padding.x}",
            paddingY: "{form.field.lg.padding.y}",
            iconOnlyWidth: "3rem"
        },
        label: {
            fontWeight: "500"
        },
        raisedShadow: "0 1px 5px 0 #0000001f, 0 2px 2px 0 #00000024, 0 3px 1px -2px #00000033",
        focusRing: {
            width: "{focus.ring.width}",
            style: "{focus.ring.style}",
            offset: "{focus.ring.offset}"
        },
        badgeSize: "1rem",
        transitionDuration: "{form.field.transition.duration}",
        primary: {
            background: "{wingstopGreen}",
            hoverBackground: "{primary.hover.color}",
            activeBackground: "{primary.active.color}",
            borderColor: "{primary.color}",
            hoverBorderColor: "{primary.hover.color}",
            activeBorderColor: "{primary.active.color}",
            color: "{primary.contrast.color}",
            hoverColor: "{primary.contrast.color}",
            activeColor: "{primary.contrast.color}",
            focusRing: {
                color: "{primary.color}",
                shadow: "none"
            }
        },
        secondary: {
            background: "light-dark({surface.100}, {surface.800})",
            hoverBackground: "light-dark({surface.200}, {surface.700})",
            activeBackground: "light-dark({surface.300}, {surface.600})",
            borderColor: "light-dark({surface.100}, {surface.800})",
            hoverBorderColor: "light-dark({surface.200}, {surface.700})",
            activeBorderColor: "light-dark({surface.300}, {surface.600})",
            color: "light-dark({surface.600}, {surface.300})",
            hoverColor: "light-dark({surface.700}, {surface.200})",
            activeColor: "light-dark({surface.800}, {surface.100})",
            focusRing: {
                color: "light-dark({surface.600}, {surface.300})",
                shadow: "none"
            }
        },
        info: {
            background: "light-dark({sky.500}, {sky.400})",
            hoverBackground: "light-dark({sky.600}, {sky.300})",
            activeBackground: "light-dark({sky.700}, {sky.200})",
            borderColor: "light-dark({sky.500}, {sky.400})",
            hoverBorderColor: "light-dark({sky.600}, {sky.300})",
            activeBorderColor: "light-dark({sky.700}, {sky.200})",
            color: "light-dark(#ffffffff, {sky.950})",
            hoverColor: "light-dark(#ffffffff, {sky.950})",
            activeColor: "light-dark(#ffffffff, {sky.950})",
            focusRing: {
                color: "light-dark({sky.500}, {sky.400})",
                shadow: "none"
            }
        },
        success: {
            background: "light-dark({green.500}, {green.400})",
            hoverBackground: "light-dark({green.600}, {green.300})",
            activeBackground: "light-dark({green.700}, {green.200})",
            borderColor: "light-dark({green.500}, {green.400})",
            hoverBorderColor: "light-dark({green.600}, {green.300})",
            activeBorderColor: "light-dark({green.700}, {green.200})",
            color: "light-dark(#ffffffff, {green.950})",
            hoverColor: "light-dark(#ffffffff, {green.950})",
            activeColor: "light-dark(#ffffffff, {green.950})",
            focusRing: {
                color: "light-dark({green.500}, {green.400})",
                shadow: "none"
            }
        },
        warn: {
            background: "light-dark({orange.500}, {orange.400})",
            hoverBackground: "light-dark({orange.600}, {orange.300})",
            activeBackground: "light-dark({orange.700}, {orange.200})",
            borderColor: "light-dark({orange.500}, {orange.400})",
            hoverBorderColor: "light-dark({orange.600}, {orange.300})",
            activeBorderColor: "light-dark({orange.700}, {orange.200})",
            color: "light-dark(#ffffffff, {orange.950})",
            hoverColor: "light-dark(#ffffffff, {orange.950})",
            activeColor: "light-dark(#ffffffff, {orange.950})",
            focusRing: {
                color: "light-dark({orange.500}, {orange.400})",
                shadow: "none"
            }
        },
        help: {
            background: "light-dark({purple.500}, {purple.400})",
            hoverBackground: "light-dark({purple.600}, {purple.300})",
            activeBackground: "light-dark({purple.700}, {purple.200})",
            borderColor: "light-dark({purple.500}, {purple.400})",
            hoverBorderColor: "light-dark({purple.600}, {purple.300})",
            activeBorderColor: "light-dark({purple.700}, {purple.200})",
            color: "light-dark(#ffffffff, {purple.950})",
            hoverColor: "light-dark(#ffffffff, {purple.950})",
            activeColor: "light-dark(#ffffffff, {purple.950})",
            focusRing: {
                color: "light-dark({purple.500}, {purple.400})",
                shadow: "none"
            }
        },
        danger: {
            background: "light-dark({red.500}, {red.400})",
            hoverBackground: "light-dark({red.600}, {red.300})",
            activeBackground: "light-dark({red.700}, {red.200})",
            borderColor: "light-dark({red.500}, {red.400})",
            hoverBorderColor: "light-dark({red.600}, {red.300})",
            activeBorderColor: "light-dark({red.700}, {red.200})",
            color: "light-dark(#ffffffff, {red.950})",
            hoverColor: "light-dark(#ffffffff, {red.950})",
            activeColor: "light-dark(#ffffffff, {red.950})",
            focusRing: {
                color: "light-dark({red.500}, {red.400})",
                shadow: "none"
            }
        },
        contrast: {
            background: "light-dark({surface.950}, {surface.0})",
            hoverBackground: "light-dark({surface.900}, {surface.100})",
            activeBackground: "light-dark({surface.800}, {surface.200})",
            borderColor: "light-dark({surface.950}, {surface.0})",
            hoverBorderColor: "light-dark({surface.900}, {surface.100})",
            activeBorderColor: "light-dark({surface.800}, {surface.200})",
            color: "light-dark({surface.0}, {surface.950})",
            hoverColor: "light-dark({surface.0}, {surface.950})",
            activeColor: "light-dark({surface.0}, {surface.950})",
            focusRing: {
                color: "light-dark({surface.950}, {surface.0})",
                shadow: "none"
            }
        }
    },
    outlined: {
        primary: {
            hoverBackground: "light-dark({primary.50}, #34d3990a)",
            activeBackground: "light-dark({primary.100}, #34d39929)",
            borderColor: "light-dark({primary.200}, {primary.700})",
            color: "{primary.color}"
        },
        secondary: {
            hoverBackground: "light-dark({surface.50}, #ffffff0a)",
            activeBackground: "light-dark({surface.100}, #ffffff29)",
            borderColor: "light-dark({surface.200}, {surface.700})",
            color: "light-dark({surface.500}, {surface.400})"
        },
        success: {
            hoverBackground: "light-dark({green.50}, #4ade800a)",
            activeBackground: "light-dark({green.100}, #4ade8029)",
            borderColor: "light-dark({green.200}, {green.700})",
            color: "light-dark({green.500}, {green.400})"
        },
        info: {
            hoverBackground: "light-dark({sky.50}, #38bdf80a)",
            activeBackground: "light-dark({sky.100}, #38bdf829)",
            borderColor: "light-dark({sky.200}, {sky.700})",
            color: "light-dark({sky.500}, {sky.400})"
        },
        warn: {
            hoverBackground: "light-dark({orange.50}, #fb923c0a)",
            activeBackground: "light-dark({orange.100}, #fb923c29)",
            borderColor: "light-dark({orange.200}, {orange.700})",
            color: "light-dark({orange.500}, {orange.400})"
        },
        help: {
            hoverBackground: "light-dark({purple.50}, #c084fc0a)",
            activeBackground: "light-dark({purple.100}, #c084fc29)",
            borderColor: "light-dark({purple.200}, {purple.700})",
            color: "light-dark({purple.500}, {purple.400})"
        },
        danger: {
            hoverBackground: "light-dark({red.50}, #f871710a)",
            activeBackground: "light-dark({red.100}, #f8717129)",
            borderColor: "light-dark({red.200}, {red.700})",
            color: "light-dark({red.500}, {red.400})"
        },
        contrast: {
            hoverBackground: "light-dark({surface.50}, {surface.800})",
            activeBackground: "light-dark({surface.100}, {surface.700})",
            borderColor: "light-dark({surface.700}, {surface.500})",
            color: "light-dark({surface.950}, {surface.0})"
        },
        plain: {
            hoverBackground: "light-dark({surface.50}, {surface.800})",
            activeBackground: "light-dark({surface.100}, {surface.700})",
            borderColor: "light-dark({surface.200}, {surface.600})",
            color: "light-dark({surface.700}, {surface.0})"
        }
    },
    text: {
        primary: {
            hoverBackground: "light-dark({primary.50}, #34d3990a)",
            activeBackground: "light-dark({primary.100}, #34d39929)",
            color: "{primary.color}"
        },
        secondary: {
            hoverBackground: "light-dark({surface.50}, {surface.800})",
            activeBackground: "light-dark({surface.100}, {surface.700})",
            color: "light-dark({surface.500}, {surface.400})"
        },
        success: {
            hoverBackground: "light-dark({green.50}, #4ade800a)",
            activeBackground: "light-dark({green.100}, #4ade8029)",
            color: "light-dark({green.500}, {green.400})"
        },
        info: {
            hoverBackground: "light-dark({sky.50}, #38bdf80a)",
            activeBackground: "light-dark({sky.100}, #38bdf829)",
            color: "light-dark({sky.500}, {sky.400})"
        },
        warn: {
            hoverBackground: "light-dark({orange.50}, #fb923c0a)",
            activeBackground: "light-dark({orange.100}, #fb923c29)",
            color: "light-dark({orange.500}, {orange.400})"
        },
        help: {
            hoverBackground: "light-dark({purple.50}, #c084fc0a)",
            activeBackground: "light-dark({purple.100}, #c084fc29)",
            color: "light-dark({purple.500}, {purple.400})"
        },
        danger: {
            hoverBackground: "light-dark({red.50}, #f871710a)",
            activeBackground: "light-dark({red.100}, #f8717129)",
            color: "light-dark({red.500}, {red.400})"
        },
        contrast: {
            hoverBackground: "light-dark({surface.50}, {surface.800})",
            activeBackground: "light-dark({surface.100}, {surface.700})",
            color: "light-dark({surface.950}, {surface.0})"
        },
        plain: {
            hoverBackground: "light-dark({surface.50}, {surface.800})",
            activeBackground: "light-dark({surface.100}, {surface.700})",
            color: "light-dark({surface.700}, {surface.0})"
        }
    },
    link: {
        color: "{primary.color}",
        hoverColor: "{primary.color}",
        activeColor: "{primary.color}"
    }
}