import type { DrawerDesignTokens } from '@primeuix/themes/types/drawer';

 export default {
    root: {
        background: "{overlay.modal.background}",
        borderColor: "{overlay.modal.border.color}",
        color: "{overlay.modal.color}",
        shadow: "0 8px 10px -6px #0000001a, 0 20px 25px -5px #0000001a"
    },
    header: {
        padding: "{overlay.modal.padding}"
    },
    title: {
        fontSize: "1.5rem",
        fontWeight: "600"
    },
    content: {
        padding: "0 {overlay.modal.padding} {overlay.modal.padding}"
    },
    footer: {
        padding: "{overlay.modal.padding}"
    }
} satisfies DrawerDesignTokens;