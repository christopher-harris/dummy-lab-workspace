# 🤖 ADR-0002 — Adopt PrimeNG + Tailwind as the UI platform, retire Bootstrap

|                |                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------- |
| **Status**     | Proposed — **for discussion, not for approval**                                               |
| **Date**       | 2026-09-28                                                                                    |
| **Revised**    | 2026-10-13 — PrimeNG 22 decided; tokens move to a published package; one theme library        |
| **Deciders**   | Wingstop internal development leadership; Design; Product                                     |
| **Applies to** | `ngfe-web`                                                                                    |
| **Prototype**  | A prototype workspace — PrimeNG 22 + Tailwind v4, Figma-generated preset — _link TBD_         |
| **Blocked on** | A migration plan. See [Acceptance criteria](#acceptance-criteria).                            |
| **Relates to** | [ADR-0001](./ADR-0001-nx-multi-project-workspace.md) — which listed this as an unproven spike |

> **Purpose.** This document exists to start a conversation about the UI platform, and to put the
> current styling situation on the record in numbers rather than impressions. It is deliberately
> not approval-ready: the effort estimate depends on a spike that has not been run, and the
> three-styling-systems transition has no owner yet. Read it as a proposal to argue with.

---

## Context

`ngfe-web` styles itself with Bootstrap 4, a set of single-purpose widget libraries, and a large
volume of hand-written SCSS. All three have drifted from the reason they were chosen.

### Bootstrap is loaded in full and almost entirely unused

`src/scss/styles.scss:6` imports the whole framework — `@import 'bootstrap/scss/bootstrap'`. That
ships **162 kB raw / 24 kB gzip** of CSS declaring **1,553 class selectors**. A generous
upper-bound scan — any Bootstrap class name appearing as a token anywhere in `src`, including
false positives like `row`, `card`, `active` and `container` that the codebase defines itself —
matches **152 of them, 10%**.

Counting only real Bootstrap classes inside `class="…"` attributes across 224 templates:

| Family                                            | Occurrences |
| ------------------------------------------------- | ----------- |
| Grid (`row`, `col-*`)                             | 56          |
| Buttons (`btn`, `btn-*`)                          | 21          |
| Display utilities (`d-flex`, `d-none`, `d-block`) | 10          |
| Forms (`form-control`, `form-group`, `custom-*`)  | 9           |
| `container-fluid`                                 | 2           |
| Modals (`modal-*`)                                | 0           |

The real coupling is not in templates. It is in SCSS: **161 `@include media-breakpoint-*` calls**,
one `make-container`, and roughly a dozen references to Bootstrap variables (`$spacer`,
`$theme-colors`, `$primary`, `$font-family-base`). Bootstrap is being used as a Sass mixin library
that happens to also inject 24 kB of dead CSS.

### The Bootstrap pairing is already broken, not merely dated

Bootstrap `4.6.2` is installed. 4.6.2 is the final Bootstrap 4 release; Bootstrap 5 shipped in
2021 and Bootstrap 4 no longer receives fixes.

Alongside it sits `@ng-bootstrap/ng-bootstrap@20.0.0`, which targets Bootstrap 5 CSS. Its bundled
output emits class names that **do not exist in Bootstrap 4.6.2**:

| Class emitted by ng-bootstrap | Occurrences in its dist | Defined in Bootstrap 4.6.2? | Bootstrap 4 equivalent |
| ----------------------------- | ----------------------- | --------------------------- | ---------------------- |
| `visually-hidden`             | 25                      | **No** (0)                  | `sr-only`              |
| `form-select`                 | 10                      | **No** (0)                  | `custom-select`        |
| `btn-close`                   | 4                       | **No** (0)                  | `.close`               |
| `data-bs-*`                   | 4                       | **No**                      | `data-*`               |

This is a present defect with an accessibility component — `visually-hidden` content that should
be screen-reader-only is not being hidden — not a future risk. It is also unfalsifiable by the
build: every one of these produces a green compile.

### Seven libraries, one widget each

Non-spec files importing each UI dependency:

| Library                      | Files | What it provides | PrimeNG equivalent       |
| ---------------------------- | ----- | ---------------- | ------------------------ |
| `@ng-bootstrap/ng-bootstrap` | 82    | modal, typeahead | `Dialog`, `AutoComplete` |
| `ngx-slick-carousel`         | 34    | carousel         | `Carousel`               |
| `ngx-lottie`                 | 14    | Lottie animation | — (keep)                 |
| `ng-busy`                    | 12    | busy indicator   | `ProgressSpinner`        |
| `ngx-toastr`                 | 10    | toasts           | `Toast`                  |
| `@angular-slider/ngx-slider` | 9     | range slider     | `Slider`                 |
| `@fortawesome/*` (4 pkgs)    | 7     | icons            | `primeicons`             |
| `ngx-skeleton-loader`        | 3     | skeletons        | `Skeleton`               |
| `@ng-select/ng-select`       | **0** | select           | `Select`                 |
| `snazzy-info-window`         | **0** | map info window  | —                        |

The last two have **zero TypeScript or template usage** and are still loaded as global
stylesheets in `angular.json`. Each library carries its own theming model, its own upgrade
cadence, and its own Angular-version risk. None of them share a design token.

Within `@ng-bootstrap`, the dependency is overwhelmingly one service: **`NgbModal` appears 360
times** across 82 non-spec files, against 12 uses of `NgbTypeahead` and 2 of `NgbDropdownConfig`.
"Removing Bootstrap" is, in practice, replacing a modal service.

### There is no shared token vocabulary

272 SCSS files totalling **44,747 lines**, of which **240 are per-component stylesheets** against
266 components. Design decisions — the Wingstop type ramp, the palette, spacing — exist in Figma
and are re-implemented by hand in each of those 240 files. Nothing connects the two, and nothing
detects when they diverge. ADR-0001 measured the structural version of this problem; this is its
styling counterpart.

### What the prototype demonstrates

The prototype runs PrimeNG 22.1.1 with Tailwind v4 and a token preset **generated from a Figma
variables export** — a 409 kB variables file producing 86 component token files. A single shared
platform library exposes one `providePrimeNgPlatform()` provider so every application consumes
the same preset, and one Tailwind entrypoint carries the Wingstop type ramp as `@theme` tokens
with a `@layer base` that styles bare HTML correctly without utility classes.

|                         | `ngfe-web` today                       | Prototype                             |
| ----------------------- | -------------------------------------- | ------------------------------------- |
| Global CSS, gzip        | 24 kB Bootstrap alone, before app CSS  | **11 kB total**                       |
| Source of design values | 240 hand-written component stylesheets | One Figma export, generated           |
| Component libraries     | 7 (+2 dead)                            | 1                                     |
| Unused CSS shipped      | ~90% of Bootstrap                      | none — Tailwind is compiled per-usage |
| Dark mode               | not supported                          | token-level, one class on `<html>`    |

The number that matters is not 24 kB → 11 kB. It is that a colour changing in Figma becomes a
regenerated token file rather than a search across 240 stylesheets.

## Licensing

**Settled: PrimeNG 22 under a commercial PrimeUI licence. Procurement is underway.** Recorded here
for the reader who finds the licence change on their own and wonders whether it was considered.

PrimeNG changed licence at v22 — ≤ 21.1.10 is MIT; ≥ 22.0.0 is the PrimeUI dual licence, and
Wingstop is outside the Community tier's limits, so v22 is a per-developer commercial licence. Staying
on 21 was considered and rejected (Alternative E).

The licence key sits beside the `providePrimeNG` call in the shared theme library, which is where
the PrimeNG configuration guide puts it — a PrimeUI key is client-side by design. The prototype's
key is `dev`-tier; production needs a production tier with a named renewal owner.

## Decision

**Adopt PrimeNG as the component library and Tailwind as the utility and token layer. Retire
Bootstrap, ng-bootstrap, and the single-purpose widget libraries. Generate design tokens from
Figma rather than hand-authoring them.**

1. **PrimeNG 22.** The version the prototype runs and the generated preset targets
   (`@primeuix/styled` 1.x). Reopened only if Design or Product reject the component library
   itself.
2. **PrimeNG owns components; Tailwind owns layout, spacing and typography.** A component
   stylesheet is the exception, justified by something neither layer expresses, not the default.
3. **Design tokens are generated, never hand-edited, and published as a versioned package.** The
   Figma export is the source of truth. A separate design-token repository generates the preset and
   Tailwind tokens from it and publishes an npm package; applications consume a version. A token
   change is a package release, reviewed in the token repository — not a diff of generated files
   in the application repository.
4. **One `@theme` entrypoint.** Tailwind tokens live in `styles/tailwind.css` and nowhere else —
   `@theme` blocks in any other file are silently discarded by Tailwind v4.
5. **PrimeNG component overrides go through the preset**, under `colorScheme.light` /
   `colorScheme.dark`, not `root.*`, and not through `::ng-deep`.
6. **CSS layer order is declared explicitly** so Tailwind utilities beat PrimeNG component styles
   without `!important`.
7. **A ratchet from day one: no new code against Bootstrap.** New and touched templates use
   Tailwind utilities and PrimeNG components. Bootstrap's removal is the end state; its
   _containment_ starts immediately and is enforceable straight away.
8. **Delete the two dead global stylesheets now.** `@ng-select` and `snazzy-info-window` have zero
   usage and are unrelated to the rest of this decision.
9. **One theme library owns PrimeNG configuration.** A single `providePrimeNgPlatform()` provider,
   consuming the token package, is the only place `providePrimeNG` is called; every application
   composes it. In the prototype this is `libs/shared/theme` (`type:util`), renamed from
   `libs/platform` because "platform" collided with ADR-0005's `platform:*` tag axis. It owns the
   dark-mode class too, so the store depends on it rather than the reverse. It is distinct from `libs/data-access/theme`, which holds the visitor's theme
   _preference_ (dark mode, palette), not the design system.
10. **Dark mode is supported at the token level.** It costs nothing structurally. Whether and where
    it ships is a product decision (Open questions).

### Migration shape

Sequenced by risk, not by visual impact:

| Phase | Work                                                                        | Unblocks                           |
| ----- | --------------------------------------------------------------------------- | ---------------------------------- |
| 0     | Delete dead globals; introduce Tailwind alongside Bootstrap; declare layers | Everything below                   |
| 1     | Replace 161 `media-breakpoint-*` calls with Tailwind breakpoints            | Dropping the Bootstrap Sass import |
| 2     | Replace `NgbModal` (360 uses) with PrimeNG `Dialog`                         | Dropping `@ng-bootstrap`           |
| 3     | Replace the ~90 Bootstrap template classes; drop `bootstrap`                | Bootstrap gone                     |
| 4     | Consolidate toastr / skeleton / slider / carousel / busy into PrimeNG       | 5 dependencies gone                |
| 5     | Collapse the 240 component stylesheets against generated tokens             | Ongoing, never "done"              |

Phase 2 is the bulk of the effort and the only phase with real behavioural risk. Phase 5 has no
natural end and must not be allowed to block the earlier phases.

## Alternatives considered

**A. Stay on Bootstrap 4.** Rejected. It is end-of-life, the ng-bootstrap pairing already
produces incorrect markup, and it does nothing about the seven-library sprawl or the Figma gap.

**B. Upgrade to Bootstrap 5, keep ng-bootstrap.** The closest honest alternative, and the
cheapest. It fixes the `visually-hidden` / `form-select` / `btn-close` defect directly, and
ng-bootstrap 20 is already the version that wants it. Rejected — but the rejection is on strategy,
not cost. It leaves the design system unaddressed: Bootstrap 5 has no token model Figma can
generate into, no dark mode worth the name at this codebase's structure, and buys another
framework generation of class-string coupling. If leadership wants the defect fixed this quarter
and the platform decision deferred, **this is the right answer and should be taken as a stopgap**,
not as a substitute for this ADR.

**C. Tailwind only; build components in-house.** Rejected. 266 components and no dedicated
design-system team. This trades a licence cost for an unbounded maintenance cost, paid in
accessibility bugs the team will find one at a time.

**D. Angular Material + CDK.** A genuine alternative: MIT, maintained by the Angular team, and `@angular/cdk ^21.1.1` is _already
installed_. Rejected on fit rather than quality. Material Design is an opinionated visual
language, and Wingstop's brand is not it; theming Material away from Material is well-known to be
expensive, and doing so undercuts the reason for adopting a component library. The fallback if
Design or Product reject PrimeNG.

**E. Start on PrimeNG 21.1.10 (MIT); move to 22 later.** Rejected. It avoids a licence, and buys
two migrations instead of one: the generated preset targets v22's `@primeuix/styled` 1.x runtime
and has never been run against v21's 0.7.x, so it would need its own spike, then a second upgrade
once the team moved to 22 anyway.

**F. Commit generated token files to the application repository.** What the prototype does today.
Rejected as the destination: 86 generated files per export make application diffs unreadable, and
design changes ride the application's release cadence rather than their own. A package moves the
review to where the change originates.

## Consequences

**Gained**

- The design system becomes generated rather than transcribed. A Figma change propagates instead
  of being re-typed into 240 stylesheets.
- Seven UI dependencies become one, each with its own Angular-upgrade risk today.
- An existing accessibility defect is fixed as a side effect rather than left in place.
- Dark mode becomes a token-level concern instead of a rewrite.
- ~24 kB gzip of mostly dead CSS leaves the initial payload. Minor next to ADR-0001's bundle
  numbers, but it is a strict subtraction.
- Styling gains a review vocabulary. "Use the token" is checkable; "match the Figma" is not.

**Accepted costs**

- **The transition runs three styling systems at once** — Bootstrap, 44,747 lines of bespoke SCSS,
  and Tailwind. This is the single biggest risk in this ADR. Done carelessly, Tailwind becomes the
  third system rather than the replacement for the first two, and the codebase ends up worse than
  it started. Decision 7's ratchet and a defined stopping point are the mitigations, and neither
  is sufficient without someone owning the outcome.
- **Phase 2 is 360 call sites of behavioural change.** `NgbModal` and PrimeNG `Dialog` differ in
  lifecycle, result handling and focus management. This is not a find-and-replace, and it touches
  checkout.
- **Tailwind v4 and Bootstrap 4 collide on class names** during Phases 0–3 — `container` most
  visibly, and the `m-*` / `p-*` spacing scales diverge above step 2. Current usage of the
  colliding spacing utilities is close to zero (measured: 4 occurrences total), so the exposure is
  small, but layer order must be declared before the first Tailwind class ships, not after.
- **A per-developer licence with an annual renewal**, which needs a named owner.
- **The prototype proves the destination, not the migration** — same caveat ADR-0001 records.
  It is greenfield: it has never had Bootstrap removed from underneath it. **This ADR records a
  destination. It is not a migration plan.**
- **A second repository and a release step for design changes.** A token change is now a package
  release plus a version bump in each consuming application. Two applications (ADR-0005) can pin
  different versions — which is a feature during a rollout and a source of drift if nobody watches
  it. This is the same publish overhead ADR-0001 Alternative C rejects for product code; it is
  accepted here because tokens change on Design's cadence, not the product's, and have a different
  owner.

## Enforcement

A decision with no failing build behind it is a preference. This ADR is implemented when:

| Mechanism                                                                             | Notes                                                                                |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| A lint rule rejecting Bootstrap class names in new or modified templates              | This is Decision 7. Without it the ratchet is a hope                                 |
| A lint rule rejecting `@import 'bootstrap/...'` in new SCSS                           | Blocks the mixin dependency from regrowing                                           |
| The token repository's CI regenerating from the Figma export and failing on drift     | Otherwise "generated" degrades to "generated once"                                   |
| `providePrimeNG` called only inside the theme library                                 | Decision 9. A second call site is a second, silently diverging design system         |
| `@theme` permitted only in `styles/tailwind.css`, enforced by lint                    | Tailwind v4 silently discards `@theme` elsewhere — a failure with no error message   |
| Declared CSS layer order, asserted by a test                                          | Layer order is load-bearing and invisible                                            |
| A rule rejecting `::ng-deep` into PrimeNG internals                                   | Preset overrides are the supported seam; `::ng-deep` breaks on every PrimeNG upgrade |
| A production PrimeNG licence tier, with its expiry tracked                            | Placement in `providePrimeNG` is vendor-prescribed; an expired key is the risk       |
| A dependency check failing the build if `bootstrap` reappears, once Phase 3 completes | Makes removal permanent rather than temporary                                        |

## Acceptance criteria

This ADR stays at **Proposed** until all of the following exist:

1. A spike introducing Tailwind alongside globally-loaded Bootstrap 4 in `ngfe-web` itself,
   including layer order and the `container` collision. This is the spike ADR-0001 flagged.
2. A migration plan covering Phase 2's 360 call sites, a first target area, and **a defined
   stopping point** if the three-systems period proves unmanageable.
3. The design-token repository exists and publishes a package the prototype consumes in place of
   its committed `theme/` files.
4. Design sign-off that the Figma variables export is a maintained artefact, not a one-off.
5. Design and Product confirmation of PrimeNG as the component library, and a production licence
   with a renewal owner.
6. Sign-off from Wingstop internal development leadership.

## Open questions

Deliberately unresolved; each is a follow-on decision:

- ~~**Where does the component library configuration live?**~~ **Resolved** — one theme library
  (Decision 9). Presentational wrappers around PrimeNG components, where needed, are `ui`
  libraries under ADR-0001.
- **What happens to the custom icon font?** `fantasticon` generates an icon font from SVGs, and
  four FontAwesome packages sit alongside it. `primeicons` replaces some of this and none of the
  brand marks. Unresolved.
- **How much of the 44,747 SCSS lines is actually deletable?** Phase 5 is open-ended by
  construction. Nobody has measured what fraction is design-token work versus genuine
  component-specific layout.
- **Does Tailwind's utility-first model survive contact with this team's review culture?** It
  moves styling into templates. That is a working-agreement change, not a tooling change, and
  this ADR does not address it.
- **Dark mode: where does it ship?** Kept (Decision 10). The use case — whole site, ordering
  only, user preference or system preference — is a conversation with Product that has not
  happened.
- **Scheduled theme changes.** A seasonal or campaign theme switching on a date. Not needed now.
  The constraint to remember: a theme shipped as a package cannot change without a release, so
  scheduling means several themes ship in one build and something at runtime selects one — the
  CMS (if it is Strapi) or runtime configuration (ADR-0003). How many themes ship per build is the
  real question.

## Evidence

Reproducible against `ngfe-web` at `f37d8d7d1`:

```
node -e "console.log(require('./node_modules/bootstrap/package.json').version)"          # 4.6.2
node -e "console.log(require('./node_modules/@ng-bootstrap/ng-bootstrap/package.json').version)"  # 20.0.0
gzip -c node_modules/bootstrap/dist/css/bootstrap.min.css | wc -c                        # 24199
grep -c 'visually-hidden' node_modules/@ng-bootstrap/ng-bootstrap/fesm2022/*.mjs         # 25
grep -c '\.visually-hidden' node_modules/bootstrap/dist/css/bootstrap.css                # 0
grep -c '\.custom-select'   node_modules/bootstrap/dist/css/bootstrap.css                # 33
grep -rhoE 'Ngb[A-Za-z]+' --include='*.ts' src | grep -v spec | sort | uniq -c           # NgbModal 360
grep -rl '@ng-bootstrap' --include='*.ts' src | grep -vc spec                            # 82
grep -rhoE '@include media-breakpoint[a-z-]*' src --include='*.scss' | wc -l             # 161
find src -name '*.scss' | wc -l                                                          # 272
find src -name '*.scss' -exec cat {} + | wc -l                                           # 44747
find src -name '*.component.scss' | wc -l                                                # 240
find src -name '*.component.ts' | grep -vc spec                                          # 266
grep -rl '@ng-select' --include='*.ts' --include='*.html' src | wc -l                    # 0
grep -rl 'snazzy'     --include='*.ts' --include='*.html' src | wc -l                    # 0
```

Bootstrap coverage (1,553 selectors, 152 matched, 10%) was measured by extracting every class
selector from `bootstrap.css` and testing for its appearance as a token anywhere under `src` —
an upper bound, since it counts unrelated identifiers such as `row`, `card` and `active`.

Licence history verified by unpacking published tarballs:

```
npm pack primeng@21.1.10 && tar -xzOf primeng-21.1.10.tgz package/LICENSE.md | head -5   # MIT
npm pack primeng@22.0.0  && tar -xzOf primeng-22.0.0.tgz  package/LICENSE.md | head -5   # PrimeUI
npm view primeng@21.1.10 peerDependencies                                                # @angular/core ^21.0.7
```

Prototype figures measured in September 2026 (PrimeNG 22.1.1, Tailwind 4.3.1): the built
application's single global stylesheet is 63,430 B raw / 11,327 B gzip, and the generated theme
output carries 86 component token files in each of its JavaScript and TypeScript forms, all
derived from one Figma variables export.
