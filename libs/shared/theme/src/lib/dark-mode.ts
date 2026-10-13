/**
 * Class toggled on `<html>` to put PrimeNG's design tokens into dark mode.
 *
 * Owned here, beside the PrimeNG configuration that consumes it, rather than in
 * `@dummy-lab/data-access-theme`: the theme store toggles the class, PrimeNG
 * reads the selector, and a `util` library cannot depend on a `data-access`
 * one. The store imports it from here instead, so the two cannot drift.
 */
export const DARK_MODE_CLASS = 'my-app-dark';

/**
 * The CSS selector form of {@link DARK_MODE_CLASS}, ready to hand to
 * `providePrimeNG({ theme: { options: { darkModeSelector } } })`.
 */
export const DARK_MODE_SELECTOR = `.${DARK_MODE_CLASS}`;
