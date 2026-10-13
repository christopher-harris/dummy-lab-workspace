# shared-theme

The workspace's one PrimeNG configuration (ADR-0002 Decision 9). Every
application composes it; nothing else calls `providePrimeNG()`.

Import path: `@dummy-lab/shared-theme`

- `providePrimeNgPlatform()` — drop into an `ApplicationConfig` in place of
  calling `providePrimeNG()` directly, so every app consumes the same generated
  Figma theme from `theme/ts`.
- `PRIMENG_THEME_OPTIONS` — the dark-mode selector and CSS-layer order shared by
  every PrimeNG setup.
- `DARK_MODE_CLASS` / `DARK_MODE_SELECTOR` — owned here and re-exported by
  `@dummy-lab/data-access-theme`, whose store toggles the class. Owned here
  because this is a `type:util` library and may not depend on `data-access`.

Not to be confused with `@dummy-lab/data-access-theme`, which holds the
visitor's theme _preference_ (dark mode, palette) rather than the design system.

## Running unit tests

Run `nx test shared-theme`.
