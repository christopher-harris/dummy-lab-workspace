import type { CardDesignTokens } from '@primeuix/themes/types/card';

 export default {
    root: {
        background: "{content.background}",
        borderRadius: "{border.radius.xl}",
        color: "{content.color}",
        shadow: "0 1px 2px -1px #0000001a, 0 1px 3px 0 #0000001a"
    },
    body: {
        padding: "1.25rem",
        gap: "0.5rem"
    },
    caption: {
        gap: "0.5rem"
    },
    title: {
        fontSize: "1.25rem",
        fontWeight: "500"
    },
    subtitle: {
        color: "{text.muted.color}"
    }
} satisfies CardDesignTokens;