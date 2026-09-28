# platform

Holds the PrimeNG providers and configuration for the workspace.

Import path: `@dummy-lab/platform`

- `providePrimeNgPlatform()` — drop into an `ApplicationConfig` in place of
  calling `providePrimeNG()` directly, so every app consumes the same generated
  Figma theme from `theme/ts`.
- `PRIMENG_THEME_OPTIONS` — the dark-mode selector and CSS-layer order shared by
  every PrimeNG setup. The selector is re-exported from
  `@dummy-lab/data-access-theme` so the theme store and PrimeNG cannot drift.

## Running unit tests

Run `nx test platform`. The `test` target still sets `passWithNoTests`; drop that
option once the first spec lands.
