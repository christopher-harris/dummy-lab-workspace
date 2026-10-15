# 🤖 Prove-Out Backlog — what's left before "this is the example"

**Drafted:** 22 Sept 2026 · **Updated:** 12 Oct 2026 · **Audience:** Chris · **Status:** decision
instrument, not a plan

Measured directly against this tree and against four sources in `ngfe-web`:
`docs/ANGULAR-MODERNIZATION-PLAN.md`, `initial-audit/`, `notebook/` (chiefly
`ideal-architecture.md` and `careers-spike.md`), and `work-book/` (chiefly `ROADMAP.md` and
epics `20`–`23`).

Every gap below is stated as: **what is true in this repo today** → **what proving it buys you
in `ngfe-web`** → **rough cost**. Status reflects the current implementation, not just a design
decision: partial work is deliberately not marked proven.

**Addendum, 5 Oct 2026 — P21–P24 and the CMS cross-references are forward-looking.** They are not
measured against the four `ngfe-web` sources above, because a headless CMS does not appear in any of
them. They came out of a live planning conversation and should be read as scoping, not as an audit
finding. Numbering is append-only so existing references stay stable — which is why Tier 2's items
are P5–P10 and P21–P26.

**Addendum, 9 Oct 2026 — the SSR/prerender spike.** P11, P20, P21 and P23 now carry measured
results rather than predictions, and two new items were appended: **P25** (the content-triggered
build pipeline) and **P26** (cross-tab auth state, which contains a live defect). The topology
question those raised is written up separately as
[ADR-0005](./docs/ADR/ADR-0005-application-topology-and-render-modes.md) — the first ADR here that
amends another. §5 carries a revised ordering. Session detail is in `HANDOFF-SEO-PRERENDER.md`
(untracked).

---

## 0. Read this first — the scope boundary

**This workspace can prove the _destination_. It structurally cannot prove the _migration_.**

Several of the riskiest items in the `ngfe-web` roadmap are migration proofs, and no amount of
work in a greenfield lab will close them:

| Migration proof                                                                               | Why it can't happen here                                         |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `redux-connector` coexistence (Plan 6a: _"no feature migrates until this lands"_)             | There is no legacy `@ngrx/store` slice here to coexist with      |
| Backward-compatible `persist:features` read path (Plan §5 upgrade check)                      | There is no legacy persisted shape to stay readable              |
| Story `21.1` — **prefixed** Tailwind, **Preflight off**, against globally-loaded Bootstrap 4  | This repo runs unprefixed Tailwind with Preflight on, greenfield |
| All 27 `angular.json` build configurations surviving `nx init` (Plan 0a acceptance criterion) | This workspace was generated, not migrated                       |

Those need a spike branch on `ngfe-web` itself. **Decide now whether you're willing to say that
out loud when you present this**, because the first person to ask "does this de-risk the
migration?" deserves an honest no.

What follows is everything that _is_ in reach here.

---

## 1. Status snapshot

Scored against `notebook/ideal-architecture.md`, section by section.

| Area                                                      | State      | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nx graph + `affected`                                     | ✅ Proven  | 13 nodes; `dummy-lab` depends on 7 of 12 libs, not all                                                                                                                                                                                                                                                                                                                                                                                       |
| SignalStore on the core `events` path                     | ✅ Proven  | `eventGroup` + `withReducer` + `on` + `injectDispatch` — `libs/data-access/products/`                                                                                                                                                                                                                                                                                                                                                        |
| ngrx-toolkit peripherals                                  | ✅ Proven  | `withDevtools`, `withCallState`, `withResource`, `withEntityResources`, `withStorageSync`/`withLocalStorage`                                                                                                                                                                                                                                                                                                                                 |
| Router state in a SignalStore                             | ✅ Proven  | `libs/shared/state/src/lib/signal-store/with-router-context.ts` — closes Plan §6 **gap 3**                                                                                                                                                                                                                                                                                                                                                   |
| `httpResource`                                            | ✅ Proven  | all stores                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Tailwind v4 `@theme` type ramp + self-hosted display face | ✅ Proven  | `styles/tailwind.css`                                                                                                                                                                                                                                                                                                                                                                                                                        |
| PrimeNG with `cssLayer` ordering                          | ✅ Proven  | `libs/shared/theme/src/lib/primeng.config.ts` — order `theme, base, primeng, utilities`, exactly as the PrimeNG Tailwind guide prescribes for v4                                                                                                                                                                                                                                                                                             |
| Lib taxonomy — `data-access` + `util` axis                | 🟡 Partial | no `ui`, no `feature` libs exist                                                                                                                                                                                                                                                                                                                                                                                                             |
| Vitest + coverage thresholds                              | 🟡 Partial | thresholds pass over placeholder specs                                                                                                                                                                                                                                                                                                                                                                                                       |
| PrimeNG theming (generated Figma preset)                  | ✅ Proven  | 86-component preset in `theme/ts`, wired via `providePrimeNgPlatform()` — `libs/shared/theme/src/lib/primeng.providers.ts`; `updatePrimaryPalette`, `light-dark()`, `extend` and `cssLayer` order all match the PrimeNG 22.1.1 docs                                                                                                                                                                                                          |
| Figma → token pipeline                                    | 🟡 Partial | export is committed, not built: no in-repo regeneration step and no CI check that `theme/` matches Figma; `primary` still maps to Aura blue (`theme/ts/base.ts:309`); Tailwind `@theme` carries no colour tokens                                                                                                                                                                                                                             |
| **Tags / module boundaries**                              | 🟡 Partial | all 13 projects tagged on `type:*`/`scope:*`; `depConstraints` only enforces `type:*` so far — no `scope:*` rules yet, and no negative test committed                                                                                                                                                                                                                                                                                        |
| Deploy topology (marketing / ordering / account)          | ❌ Absent  | one app                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| SSR / SSG                                                 | 🟡 Partial | **9 Oct 2026** — `@angular/ssr` 22.1.9, `outputMode: 'static'`, server entry, per-route `RenderMode` table. `/` and `/nutrition` prerender with Strapi-sourced `<title>`/`og:*` in the served HTML; CMS routes come from `getPrerenderParams()`, none hardcoded. Production configuration only — dev serve is unchanged CSR. No sitemap, no canonical, no redirects, no second app — see P11, P25, ADR-0005                                  |
| CI                                                        | ✅ Proven  | `.github/workflows/ci.yml`                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Interceptors / HttpClient discipline                      | 🟡 Partial | functional auth interceptor registered with `provideHttpClient(withFetch(), withInterceptors(...))`; raw `fetch()` remains in every `api.ts`                                                                                                                                                                                                                                                                                                 |
| DTO → domain mapping                                      | ❌ Absent  | DummyJSON shapes are the state                                                                                                                                                                                                                                                                                                                                                                                                               |
| Forms & validation                                        | 🟡 Partial | login uses a typed reactive form with required validation; no shared validators, cross-field/async validation, or server-error mapping                                                                                                                                                                                                                                                                                                       |
| Guards / resolvers / error routes                         | 🟡 Partial | `accountGuard` redirects unauthenticated users; no resolver, unauthorized/404/error routes, or guard tests                                                                                                                                                                                                                                                                                                                                   |
| Auth vs account boundary                                  | 🟡 Partial | persisted `AuthStore`, login mutation/events, auth interceptor, and authenticated `/auth/me` resource exist; no refresh/expiry policy and current-user data still lives in `UsersStore`                                                                                                                                                                                                                                                      |
| Environment config                                        | ✅ Proven  | runtime config loads before bootstrap from `/runtime-config.json`; typed `RUNTIME_CONFIG` is consumed by app and data-access code; Cloudflare varies configuration, not the application artifact                                                                                                                                                                                                                                             |
| MSW / test factories                                      | ❌ Absent  | 9 of 12 lib specs are `expect(true).toBe(true)`                                                                                                                                                                                                                                                                                                                                                                                              |
| Error taxonomy / `ErrorHandler` / fallback UI             | ❌ Absent  | `provideBrowserGlobalErrorListeners()` only                                                                                                                                                                                                                                                                                                                                                                                                  |
| Accessibility                                             | 🟡 Partial | Lighthouse a11y **97** desktop on the promoted prod artifact (one failure: `color-contrast`); but still no axe, no a11y lint rules, no stated WCAG target                                                                                                                                                                                                                                                                                    |
| Performance baseline                                      | 🟡 Partial | measured on prod 2026-10-01 — desktop **95**, mobile **86**; single runs, no budget assertions. First post-SSR bundle delta now exists (9 Oct): initial JS 217.64 → **224.63 kB gzip**, document 4.96 → **37.46 kB gzip**, two Strapi round trips removed, 397 lazy chunks unchanged. Budgets are **not** meaningful today — the 500 kB warning is exceeded by 483 kB, and the 1 MB error was raised to 1.1 mb to absorb hydration — see P19 |
| CMS / content layer                                       | 🟡 Partial | Strapi on `strapi-spike`: `Page` keyed by unique `path`, required `shared.seo`, `Redirect` collection, `nutrition-item` collection, deep dynamic-zone populate, `**` catch-all route, block registry, preview flag. Build-time resolution proven for one route family. Missing: sitemap, canonical emission, redirect execution, failure policy, scheduled publish — P21–P25                                                                 |
| Observability / analytics / flags                         | ❌ Absent  | none                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ADRs                                                      | 🟡 Partial | five drafted — ADR-0001 Nx workspace, 0002 PrimeNG+Tailwind, 0003 runtime config, 0004 SignalStore structure, **0005 application topology and render modes (9 Oct)**. All **Proposed**; none accepted, none enforced by a failing build — P18                                                                                                                                                                                                |

---

## 2. Tier 1 — without these, the claim doesn't hold

These four are what stand between the current state and being able to say "this is the example"
at all. Everything in Tier 2+ is enrichment.

### ☐ P1 — Tags and a boundary rule that actually fails a build

**In progress:** all 13 projects now carry `type:*`/`scope:*` tags. `eslint.config.mjs`
`depConstraints` enforces `type:data-access → type:data-access|type:util`, but `type:ui` still has
a no-op rule (`onlyDependOnLibsWithTags: ['*']`) and there are no `scope:*` constraints yet, so
cross-domain imports (`carts` → `products`) are still unenforced. Still no negative test — nothing
proves a violating import goes red.

**Why it's #1:** `ideal-architecture.md` says boundaries are _"enforced by Nx tags +
`@nx/enforce-module-boundaries`, not by convention."_ That sentence is the load-bearing claim of
the entire architecture, and this workspace currently demonstrates the opposite. ROADMAP **Phase D's
exit gate** is literally _"a deliberate `type:ui` → `type:data-access` import **fails the
build**."_ You cannot run that gate here.

**Proving it buys:** the Phase D gate, executable. Also settles Epic `20` story 1 (the taxonomy
that governs extracted libs, as distinct from Plan 0b which only sketches tags for _new_ libs and
grandfathers `scope:legacy` across 94% of the code).

**Shape:** tag all 13 projects on both axes (`type:*`, `scope:*`); write the real `depConstraints`;
commit a fixture that violates a constraint and a check that asserts lint fails on it.

**Cost:** ~0.5 day. Highest leverage item in this document by a wide margin.

**Second, independent argument — added 9 Oct 2026, and it is now blocking.** The SSR spike proved
that a browser global in one library kills the **entire** server build, not just the routes that
use it:

```
ReferenceError: localStorage is not defined
    at async extractRoutes (.../routes-extractor-worker.js)
```

Raised by `data-access/auth` during **route extraction** — before any route rendered, on a build
where no authenticated route was server-rendered at all. Narrow cause: `withStorageSync` is
SSR-safe at runtime but resolving its default strategy touches `localStorage` at module load.
Fixed by passing `withLocalStorage()` explicitly, as `theme` and `session-cart` already did.

This needs a **`platform:universal` / `platform:browser-only` tag axis** in addition to the
`type:*` and `scope:*` work above. ADR-0005 lists it as the load-bearing control for the
marketing/ordering split: without it nothing stops a browser-only lib entering the prerendered
graph, and the failure surfaces as an opaque build error months later. **ADR-0005 should not be
implemented before this lands.**

---

### ☐ P2 — At least one `ui` lib and one `feature` lib

**Today:** every page and every component lives in `apps/dummy-lab/src/app/`. You have the
`data-access` and `util` types; you have neither of the other two.

**Why it matters:** the rule that carries the most weight in the taxonomy is **`ui` may never
import `data-access`** — that is what makes _"pages and components do not talk to API services"_
mechanical rather than aspirational. With no `ui` lib in existence, it cannot be tested. It is
also the rule P1's negative test should target.

Secondary: `shared/ui` grouped by cohesion (`layout`, `forms`, `feedback`, `data-display`) is
untested, and `navbar` / `footer` / `shell` are sitting in the app as the obvious `shared/ui/layout`
candidates. Epic `22` open question 5 — _"shared nav/footer: does marketing get its own, or consume
a `shared/ui` lib? This is the first real test of the taxonomy"_ — is answered by doing this.

**Proving it buys:** the taxonomy stops being a diagram. Also gives P4 something to share.

**Shape:** extract `products` as the vertical slice — it's the richest domain here (route params,
events, three `httpResource`s, entity resources). `libs/products/feature` + `libs/shared/ui/layout`.

**Cost:** ~1–2 days.

---

### ☑ P3 — CI running `nx affected`

**Done:** `.github/workflows/ci.yml` — `nrwl/nx-set-shas` + `npx nx affected -t lint test build`,
plus the Cloudflare Pages deploy/promote workflows. Not part of the greenfield-lab charter
(`PRD.md`'s non-goal list, see open question 1), added anyway to prove the gate is executable.

**Why it matters:** the `ngfe-web` ROADMAP is built entirely on _mechanically checkable_ gates —
`nx affected -t lint test build` against the last successful main SHA via `nrwl/nx-set-shas`,
budgets that fail rather than warn, remote cache. None of it is demonstrated here. The single most
persuasive artifact you could put in front of the team is a PR where `affected` marks 2 projects
instead of 13, and right now you can't show one.

**Honest limit to carry over verbatim** (`ideal-architecture.md`, and ROADMAP Phase D): _an app
build always cache-misses when any transitive lib changes._ Caching wins on lint and test of
untouched projects, not on the app build. Say it before someone else does.

**Proving it buys:** ROADMAP Phase A's posture, and the credibility of every "gate" in the plan.

**Shape:** one workflow — `nx-set-shas` + `nx affected -t lint test build`; budgets already exist
in `apps/dummy-lab/project.json` and just need to be failing, not warning. Nx Cloud remote cache
optional but this is the cheap place to evaluate it.

**Cost:** ~0.5–1 day.

---

### ☐ P4 — A second app with a blast-radius rule

**Today:** one app.

**Why it matters:** the deploy topology is the headline **RESOLVED** decision at the top of
`ideal-architecture.md`, and nothing here exercises it. Epic `22`'s exit gate is _"careers served
from the marketing app in production, **and** a `scope:marketing` → cart / checkout / auth import
fails the build."_ The second half of that is fully reachable in this repo.

`ideal-architecture.md` also says _"scaffold the `account` app + pipeline day one, no features in
it — drawing a deploy boundary early is cheap, retrofitting one is not."_ Worth proving that's
true by doing it.

**Proving it buys:** two apps sharing `shared/ui`; a lib change marking both affected; the
blast-radius guarantee as a lint rule instead of a hope. Depends on P1 and P2.

**Cost:** ~1–2 days. Add SSG here or defer to T2 (see P11).

---

## 3. Tier 2 — the items that actually kill migrations

Tier 1 makes the architecture claim true. Tier 2 covers the things that, in my experience, are what
a real `ngfe-web` domain migration will run aground on. Ranked by risk-to-`ngfe-web`, not by cost.

P21–P24 are the CMS block, added 5 Oct 2026. They sit in Tier 2 rather than Tier 3 because the
content model is being designed **now**, and several of the rules below are unwinnable arguments
once it ships.

### ◐ P5 — Forms & validation pattern

**Today:** the login page now has a typed reactive form with required username and password
controls. That proves the basic Angular reactive-forms wiring, but not a reusable form pattern:
there is still no shared validators lib, cross-field or async validation, server-error mapping, or
design-system-owned error rendering.

`ideal-architecture.md`: _"checkout is the hardest UI we own — it deserves an explicit pattern."_
This is the **highest-risk unproven area relative to what `ngfe-web` actually has to migrate**, and
it's the one this lab is least equipped for today because there's no hard form in it.

**Shape:** build a genuinely hard form — multi-step, cross-field validation, async validation,
server errors mapped back onto controls. `libs/shared/ui/forms` + `libs/shared/util/validators`.
Carts + auth are the only realistic hosts here; a synthetic checkout is fine and probably better.

**Cost:** ~2–3 days. Do not skip this one because it's unglamorous.

---

### ◐ P6 — HttpClient + interceptors; kill the raw `fetch()`

**Today:** `app.config.ts` registers a functional `authInterceptor` with
`provideHttpClient(withFetch(), withInterceptors(...))`. It reads the persisted `AuthStore`
credentials and adds a Bearer token to DummyJSON requests; the authenticated `/auth/me`
`httpResource` consumes that policy without setting its own header. This proves the interceptor
seam, but not the discipline: every `api.ts` still uses raw `fetch()` (products, posts, users,
carts, recipes, todos, quotes, comments, and auth), while stores also use `httpResource`.
Two HTTP stacks remain.

**Why it matters:** `fetch()` bypasses Angular's `HttpInterceptor` chain outright, so the
interceptors `ideal-architecture.md` names — auth, retry, correlation ID, timeout — are unprovable.
More pointedly: **this reproduces the exact anti-pattern the ROADMAP flags in Phase F story 5** —
`cart.repository.ts` finalising checkout over a WebSocket with a 75-second timeout, bypassing
`HttpInterceptor` entirely. Hard to argue that's a defect in `ngfe-web` while the reference
implementation does the same thing.

**Remaining shape:** migrate each `api.ts` to `HttpClient` so there is one HTTP stack; add tests
that assert the auth header is attached only to the intended origin and omitted without a session;
then prove a correlation-ID interceptor end to end. Add retry/timeout only after their policy is
explicit—middleware is not a substitute for a failure policy.

**Cost:** ~1 day. Fix on principle even if you prove nothing else with it.

---

### ☐ P7 — MSW + real tests + test data factories

**Today:** 9 of 12 lib spec files are `describe('placeholder', () => it('should pass'))`. Coverage
thresholds in `apps/dummy-lab/project.json` are passing _over_ those placeholders, which is worse
than having no thresholds — it's a green check that means nothing.

**Why it matters:** `ideal-architecture.md` calls out MSW specifically so _"feature libs are
testable with no backend and no VPN."_ The VPN point is a real, named organizational pain. Also
Phase F story 7 (testing pyramid + MSW) and Plan 6a's `@ngrx/signals/testing` patterns.

**Shape:** MSW handlers over the DummyJSON shapes; real store tests (state + events, not
implementation); shared factories usable from unit and e2e.

**Note:** `[[analog-plugin-breaks-coverage]]` — the Analog plugin zeroes out uncovered-file
reporting. Keep it off for libs without real templates or the coverage numbers lie.

**Cost:** ~2 days.

---

### ☑ P8 — Runtime vs build-time environment config

**Done:** `@dummy-lab/shared-runtime-config` fetches, validates, and freezes
`/runtime-config.json` through an app initializer before Angular bootstraps. Its typed
`RUNTIME_CONFIG` token supplies `apiBaseUrl` and public feature flags to the app and every
data-access store; `DUMMY_JSON_BASE_URL` and build-time `fileReplacements` are gone.

The Cloudflare Pages function serves environment-specific `RUNTIME_CONFIG_JSON` with
`Cache-Control: no-store`, while the deployment workflows build the static application once and
promote that immutable artifact. `runtime-config` has seven passing unit tests covering parsing,
normalization, loading, and failure handling.

**Why it matters:** this is disproportionate leverage. `ngfe-web` has **27 build configurations and
25 serve configurations**, each with its own `fileReplacements`. The **27 → 3 reduction is named as
the single biggest lever on Epic `20`'s cost** and is a hard prerequisite on ROADMAP Phase D. And
`ideal-architecture.md` wants _"one artifact promoted across envs, ideally"_ — which is a
fundamentally different mechanism from `fileReplacements`, not a smaller version of it.

Cheapest high-leverage item in the document after P1.

**Shape:** runtime config fetched or injected at boot; one build artifact, three environments;
typed accessor; no `fileReplacements`.

**Cost:** ~1 day.

---

### ☐ P9 — DTO → domain mapping

**Today:** `models.ts` _is_ the DummyJSON response shape, straight into store state — note
`Post` even carries an `[key: string]: unknown` index signature.

`ideal-architecture.md`: _"DTO → domain model mapping so backend shapes never leak into SignalStore
state."_ That decision has real ongoing cost in `ngfe-web` and you haven't priced it. Proving it on
one domain tells you whether you actually believe in it.

**What the CMS changes: this stops being optional.** A CMS response is an envelope — nested
attributes, media objects with format variants, localization, draft state, pagination meta — and the
vendor is not decided. Mapping that envelope straight into store state marries you to one vendor's
response shape permanently, which is precisely the mistake this document criticises elsewhere.
**Prove the seam, not the vendor:** with a real DTO → domain boundary a vendor change is a mapper
rewrite; without one it is a rewrite of every component that ever touched content.

Pin the major version before writing any shape into the record — Strapi 4 and 5 differ materially in
envelope structure and identifiers. Verify against a running instance; do not assert from memory.
See P21, P22.

**Cost:** ~0.5 day on one domain. The point was the price tag; with a CMS in play it is also the
exit cost.

---

### ☐ P10 — Error taxonomy, `ErrorHandler`, per-route fallback

**Today:** `provideBrowserGlobalErrorListeners()` and nothing else. No normalized
network / validation / auth / server taxonomy, no retry / backoff policy, no per-route fallback UI,
no degraded or offline behavior.

`ideal-architecture.md` asks _"what does the user see when the menu API 500s?"_ — and Phase F
story 5 is entirely this. Currently unanswerable.

**The CMS raises the stakes on this exact question** — see P24. A failed product fetch costs a list.
A failed content fetch costs the homepage.

**Cost:** ~1–1.5 days.

---

### ◐ P21 — Content/render + cache boundary

**Answered for one route family, 9 Oct 2026 — build time.** `/nutrition` resolves its content
during the build and ships as static HTML. The remaining two answers (edge, client) are untaken,
and the hero (P20) is the case that may still force one. See ADR-0005 for the topology this
implies and P25 for the pipeline it requires.

**What choosing build time actually costs, now that it has been chosen once:**

- **It voids ADR-0003 for the marketing app.** Prerendered HTML carries content from the CMS the
  build pointed at, so the artifact is environment-specific and cannot be promoted stage → prod.
  ADR-0005 amends ADR-0003 rather than pretending both hold.
- **CMS availability becomes _build_ availability.** Better than the request-time coupling this
  item warns about — Strapi can be down and the site still serves — but a CMS outage now blocks
  deploys, including unrelated code deploys.
- **Content freshness becomes deploy cadence.** No ISR equivalent exists in Angular.

**Today:** no CMS, no content layer. Every landing surface in
`apps/dummy-lab/src/app/pages/landing-pages/components/` — hero, announcement bar, articles,
pricing, stats, CTA banner, features, trusted-by — carries hardcoded content. That is a block
library with nothing behind it, which makes it the cheapest realistic CMS test bed in this repo.

**The decision this forces.** Where content resolves is not a CMS question, it is a rendering
question, and it has exactly three answers per route family: build time (SSG + webhook rebuild),
request time at the edge (Worker + cache), or client time (fetch after boot). Each has a different
failure mode and a different LCP profile. This is P11's decision with a second axis bolted on, and
the two cannot be settled independently.

**The self-host hypothesis — measure it, do not assume it.** Self-hosting Strapi means owning the
cache and the throughput instead of inheriting a vendor CDN's defaults. That is a genuine lever and
it is also an unproven claim. Stated precisely enough to be falsified:

> With a self-hosted CMS behind an edge cache we control, the content fetch can be removed from the
> LCP critical path for cacheable content, and held under _[budget]_ for the uncacheable remainder.

Note where the lever actually applies. If content caches as a single object at the edge, the origin
leaves the request path and it stops mattering much whose origin it is — the cache is doing the work
either way. **Self-hosting pays in the cache-miss window**, and the cache-miss window is where
personalization lives. That is the same window P20's cardinality question is about; answer that
first, because it sizes this one.

State the other half plainly too: Strapi's read path is a Node application over an ORM over
Postgres. It is not a CDN and was not built to serve a retail homepage at traffic. "We own the
throughput" means "we own the work of making it fast," and in practice that work is a cache in front
of it.

**Shape:** local Strapi plus a Cloudflare Worker cache in front, modelled on the existing
`apps/dummy-lab/functions/runtime-config.json.ts` adapter. Drive the landing hero from it. Measure
cold and warm, origin-hit and edge-hit, under P19's methodology — same Lighthouse version, same
preset, **median of 3–5**. Report the LCP phase table, not the overall score. Describe the
mechanism; do not assert the outcome.

**Cost:** ~2 days. P20's cardinality answer scopes it but is not needed to start.

---

### ☐ P22 — Block registry and the taxonomy rule for content

**Today:** nothing. The landing components are imported directly by their page.

**Why it matters:** a CMS introduces an import direction the current taxonomy has no opinion about.
Marketing composes a page as an ordered list of blocks, and something has to map a block
discriminator to an Angular component. That registry is where the taxonomy goes wrong in a brand-new
way — **if `ui` blocks fetch their own content, you have reproduced the exact `ui` → `data-access`
violation P1 exists to prevent**, only now it arrives disguised as a content concern.

The rule worth writing before the content model exists: **`ui` blocks receive content as typed
inputs and never resolve it.** A `feature` or route-level component resolves the page, maps blocks,
and projects. This puts P2's `ui`/`feature` split under its first real load, and it is a better
negative test for P1 than a synthetic fixture would be.

**The escape hatch to close now.** A rich-text or raw-HTML field is a hole straight through every
boundary rule in P1 and every token in P13. If marketing can ship arbitrary markup, the design
system is advisory and the taxonomy is decoration. Decide the allowed surface area — which blocks
exist, which fields are constrained vocabularies, whether rich text renders through a sanitizer with
a component allowlist — **before** the content model is built, because that argument is unwinnable
afterward. `ideal-architecture.md:46` already asks where custom styling is allowed; this is the same
question with a CMS behind it.

**Shape:** `libs/data-access/content` owns resolution; `libs/shared/ui/blocks` owns presentation; a
typed discriminated union for blocks; a `depConstraints` rule that makes the wrong direction fail
the build. Extract the existing landing components as the block library.

**Cost:** ~2 days. Depends on P1 and P2.

---

### ☐ P23 — Preview, draft, and the one-artifact promise

**Update, 9 Oct 2026 — the pressure this item predicted has arrived, from the other direction.**
It is not preview that broke the one-artifact promise first; it is prerendering. Build-time
content resolution makes the marketing artifact environment-specific on its own, before draft
state enters the picture (P21, ADR-0005). The preview concern below is unchanged and still
unaddressed — `?preview=true` is still decided in the browser with a draft-capable token in the
bundle — but it is no longer the thing holding P8's claim together.

The scheduled-publish problem named later in this item is now concrete rather than hypothetical:
with build-time resolution, a Strapi scheduled publish goes live **when a build runs**, not at the
scheduled time. That needs a cron-triggered build or a server fallback, and it will land the first
time marketing schedules a 9am campaign.

**Today:** P8 proved "vary configuration, not the artifact" and it is the cleanest win in this
document. A CMS with draft/publish is the first thing that will pressure it.

**Why it matters:** marketing will ask for preview on day one, and preview is a second render path,
not a flag. Draft content is uncacheable, reviewer-scoped, and must never reach a crawler. When
preview gets retrofitted it tends to arrive as a separate build, a separate environment, or a
long-lived `?preview=true` branch in application code — all three of which quietly undo P8.

A compatible shape does exist: preview as a signed, short-lived token that selects a content source
at request time, served `no-store` and `noindex`, **from the same artifact**. That is P8's mechanism
extended rather than abandoned — but only if it is designed now.

**Secondary:** scheduled publishes and webhook-triggered rebuilds are the same problem wearing a
hat. If P21's answer is build-time, a scheduled publish is a deploy, and "this goes live at 9am"
becomes a CI concern rather than a content one.

**Shape:** a preview token path through the existing Pages Function; draft-versus-published source
selected at request time; assertions that `noindex` and `no-store` are set and that the production
artifact hash is unchanged by any of it.

**Cost:** ~1 day on top of P21.

---

### ☐ P24 — CMS failure policy, and who owns the origin

**Today:** P10 asks _"what does the user see when the menu API 500s?"_ and is unanswerable. The CMS
asks the same question with more at stake: when DummyJSON is down you lose a product list; when the
content source is down **you lose the homepage**.

**The coupling to name.** If content resolution sits inside TTFB — P21's request-time answer, or
P20's option B — then **CMS availability becomes site availability**, a dependency this architecture
does not currently have anywhere. The mitigations are known and none are free: stale-while-revalidate
with a long stale window, a last-known-good snapshot baked into the artifact as a floor, or a static
fallback block set. Pick one deliberately instead of discovering later which one you happen to have.

**The part that is not a technical question.** Self-hosting is a clear-eyed choice if someone is
named for it. When the content origin is slow at 7pm on a Friday, who gets paged? If the answer is
the frontend team, that is a real cost belonging in the comparison against a hosted vendor, and it is
routinely left out of that comparison. If nobody has been named yet, **that is the risk — not the
technology.**

**Shape:** extend P10's taxonomy with a content-unavailable class; implement one fallback strategy
and prove it by killing the origin; record the on-call answer in P18's ADR.

**Cost:** ~1 day on top of P10.

---

### ☐ P25 — The content-triggered build pipeline

**Added 9 Oct 2026.** Prerendering is only half a content system. The other half is what turns a
publish into a deploy, and none of it exists.

**The blocker nobody would guess.** A CMS publish changes **no input Nx can observe**, so a
webhook-triggered `nx build` is a **cache hit** and redeploys the previous HTML. Every correct
result in the SSR spike required `--skip-nx-cache`. Left unhandled, the symptom is "the webhook
doesn't work" while the webhook is firing perfectly. This is the same root cause as the known
"cache hides new spec files" behaviour, in a far more damaging place.

**Five things, none optional:**

| Piece                                       | Failure if skipped                                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Cache bypass on content builds              | Stale HTML deployed, build green                                                                         |
| Webhooks on **every** rendered content type | `page` alone is the trap — new `nutrition-item` rows never appear, site looks healthy                    |
| Debounce / concurrency                      | An editor publishing twelve items fires twelve builds                                                    |
| Build-per-environment                       | Promotion ships stage content to prod (P21, ADR-0005)                                                    |
| A published latency figure                  | "How long until my change is live?" is the first question marketing asks, and it has a measurable answer |

**Also missing, and cheap:** `<link rel="canonical">` is never emitted although `shared.seo`
stores `canonicalPath`; there is no `sitemap.xml` despite `pagePathsUrl()` already fetching
`seo.noindex` precisely so it could filter one; and the `Redirect` collection has no consumer, so
renaming a page still 404s every inbound link.

**Proving it buys:** the difference between "prerendering works" and "marketing can publish." The
spike proved the former. Product will assume it proved the latter.

**Cost:** ~1–2 days. Canonical and sitemap are hours; the pipeline is the rest.

---

### ☐ P26 — Cross-tab auth state, and the persisted shape as a contract

**Added 9 Oct 2026. Contains a live defect, not a design gap.**

`withStorageSync` reads storage **once** at init, writes the **whole state of its own store** on every
change to that store, and the library contains zero `storage` listeners and zero `BroadcastChannel`
usage — across every strategy, IndexedDB included. Verified against the installed source.

Every tab is its own bootstrap and its own `AuthStore` instance (`providedIn: 'root'` is per
application, not per origin). A new tab _looks_ shared because it reads the same `localStorage` key
at init — same data, separate instance.

**The bug, reachable today with one app and two tabs — a stale session:**

1. Tab A and Tab B both logged in.
2. User logs out in Tab B → credentials cleared → written to storage.
3. Tab A never hears about it. Without a reload it still renders as logged in, its devtools still
   hold the credentials, and the interceptor keeps attaching a token for a session the user ended.
4. Reloading Tab A re-reads storage and it is logged out.

**Corrected 12 Oct 2026 — not a resurrection, yet.** An earlier draft claimed _any_ state change in
Tab A would rewrite storage and restore the logged-out session. It cannot today: `AuthStore` only
writes when its own state changes, and its only state is `credentials`, which changes only on login
and logout. The resurrection case arrives with the first auth write that is neither — token refresh
(P12) is the obvious one — at which point a stale tab writes the ended session back.

**Why it escalates under ADR-0005.** A split makes full page loads routine rather than occasional,
and cross-app links are exactly what people open in a new tab. Worse, the persisted shape becomes
a contract between two **independently deployed** artifacts: marketing can run the old
serialisation while ordering runs the new one, for an interval nobody controls.
`data-access/auth/src/lib/store.ts` persists with no schema check and no version key, and its own
comment says so. That note graduates from cleanup to blocker.

**Shape:** a `storage`/`BroadcastChannel` listener that rehydrates or clears (fixes the live bug);
a version key with a rejecting read path (makes the contract safe to share); then decide
`localStorage` versus an httpOnly cookie — the cookie is what removes the class of problem, since
a stale client stops being authoritative and simply gets 401s.

**Cost:** ~0.5 day for the listener and version key. The cookie move is a backend conversation.

**Recommended direction — noted 12 Oct 2026, deliberately deferred.** Not spike work; settle the
details when the re-architecture starts. Recorded so it is not lost:

- **Principle.** The server is the source of truth; every client store is a cache. The cross-tab
  listener is an interim fix — the parts worth investing in are the ones that survive the cookie
  move.
- **Order.**
  1. **401 → one auth event.** The interceptor dispatches `authEvents.sessionEnded`; `AuthStore`
     clears and redirects off guarded routes. Also catches plain expiry (`expiresInMins` is
     carried on the session and enforced nowhere). The only step unchanged under httpOnly cookies.
  2. **`storage` listener dispatching the same event.** `PLATFORM_ID`-guarded `onInit`, filtered to
     the `dummy-lab-auth` key. One event, one handler — another tab's logout and a server 401
     cannot diverge.
  3. **Version envelope** `{ v: 1, credentials }` via `withStorageSync`'s existing
     `parse`/`stringify` options; unknown version reads as logged out.
  4. **Lint:** `AuthStore` is injected, never re-provided; only `data-access/auth` touches the key.
     Folds into P1.
  5. **httpOnly cookie** — backend conversation and an ADR. DummyJSON is bearer-only, so the lab
     cannot prove this end to end; say so rather than fake it.
- **Not `BroadcastChannel`.** Storage already holds the record; a second channel is a second thing
  that can disagree with it.
- **Trap.** Logout sets `credentials: undefined`, and `JSON.stringify` drops `undefined`, so storage
  holds `{}`. A listener that just calls `readFromStorage()` patches `{}`, changes nothing, and the
  stale tab stays logged in — a fix that looks done and isn't. Persist logout as `null` or let the
  envelope make it explicit, and test exactly that case.
- **Why it matters beyond the lab.** The `ngfe-web` "multiple sources of truth" bug is the same
  class. Diagnose which kind it is before porting a fix: a second owner (lint, step 4), a
  re-provided store shadowing root (lint, step 4), or separate runtimes disagreeing (steps 1–3, 5).

---

## 4. Tier 3 — completes the picture

### ◐ P11 — SSR / SSG

**Partly proven, 9 Oct 2026.** `@angular/ssr` 22.1.9 with `outputMode: 'static'`, a server entry,
and a per-route `RenderMode` table in `apps/dummy-lab/src/app/app.routes.server.ts`. `/` and
`/nutrition` prerender; every authenticated route is `RenderMode.Client`; the CMS route list comes
from `getPrerenderParams()` querying Strapi, so no path is hardcoded. Scoped to the production
configuration, so `nx serve` is unchanged CSR and needs no CMS.

**What that settles:** Epic `22` story 2's "SSG/SSR decision per route family" is now expressible
and executable in this repo, and the content-resolution half of it (P21) is answered for one route
family. Metadata written in a component `effect` **does** reach the serialised `<head>`, and a
two-hop fetch waterfall completes before serialisation.

**What it does not settle:** no sitemap, no `<link rel="canonical">` despite the field existing in
`shared.seo`, no redirect execution, no second app, no incremental-hydration decision, and no
route-specific `modulepreload` — so paint improves and time-to-interactive does not. Topology is
now ADR-0005; the remaining mechanics are P25.

Epic `22` story 2 is "SSG/SSR decision per route family," and `ideal-architecture.md` wants an
incremental-hydration decision per route type. Natural companion to P4 — marketing is the SSG app.

**The CMS adds the second axis.** "SSG/SSR per route family" cannot be decided without also deciding
where content resolves — build time, edge, or client. P21 is that decision. They are one decision
with two names, and answering either alone produces a commitment you will reopen.

**Carry the caution verbatim** from `notebook/architecture-review-seo-notes.md`: there is **no
measured SEO evidence** in hand — no Search Console, no organic traffic, no crawl stats. Describe
the mechanism. Do not assert an SEO outcome.

**The performance evidence is a different matter — that one is measured.** Lighthouse 13.5.0 against
production `www.wingstop.com`, 2026-10-01, decomposes LCP into four phases:

| Phase                   | Mobile      | Desktop     |
| ----------------------- | ----------- | ----------- |
| Time to first byte      | 133 ms      | 378 ms      |
| **Resource load delay** | **6865 ms** | **7068 ms** |
| Resource load duration  | 353 ms      | 5176 ms     |
| Element render delay    | 45 ms       | 23 ms       |

The server responds quickly and the hero image downloads quickly. Roughly **seven seconds pass
before the browser requests it at all** — on both form factors. The LCP element already carries the
right hints:

```html
<img
  fetchpriority="high"
  loading="eager"
  data-testid="hero-lcp-img"
  class="hero-bg-image"
  src="…"
/>
```

They do nothing, because the element is not in the server response. `curl https://www.wingstop.com`
returns 41 KB of HTML containing an empty `<app-component>` shell — no `ng-server-context`, no
`<wri-*>` elements, and **zero occurrences of `hero-lcp-img`**. The site is client-rendered, so the
image does not exist until Angular boots and renders the hero, and the preload scanner never sees
it. `fetchpriority="high"` cannot prioritise an element the parser has not met.

This is the mechanism, measured in production, and SSR is what addresses it: server-render the hero
and the `<img>` is in the initial HTML, discovered at TTFB instead of at ~7000 ms, at which point
the existing hints start working. Pair it with `<link rel="preload" as="image">` for the hero URL.

Two honest boundaries. This describes a **mechanism and a measurement**, not a predicted score —
third-party load (245 of 286 requests, ~11 MB) contends for bandwidth in the same window, so SSR
alone does not land the full seven seconds. And the related levers are not SSR's job: deferring
vendors past the LCP window belongs to P16's single evaluation point, the render-blocking Typekit
CSS (2445 ms) is a self-hosting fix, and a third-party weight budget in CI is what stops it
regressing.

**Tier note:** this sits in Tier 3, and the measurement argues it belongs in Tier 1. Seven seconds of
LCP on the live site traced to a rendering-architecture decision is the strongest evidence in this
document, and it is the one item here that is about the production site rather than about this lab.

**Cost:** ~1–2 days on top of P4.

---

### ◐ P12 — Auth vs account boundary, guards, resolvers, error routes

**Today:** `AuthStore` persists the login response, handles login/logout events, and exposes
`isLoggedIn`; `accountGuard` redirects unauthenticated navigation to `/auth/login`. The account
page renders an authenticated `/auth/me` resource, and a functional interceptor supplies its
Bearer token. This establishes a guest-versus-authenticated path and a basic guard.

It is not yet a clean auth/account boundary: the current-user resource is attached to
`UsersStore`, not an account/profile owner; there is no refresh or expiry policy; and there are no
resolver, 401/403, 404, or error routes. The guard and interceptor tests also need behavioral
assertions, not just construction coverage.

`ideal-architecture.md` calls the auth/account conflation _"the most common way this taxonomy goes
wrong"_ — ordering needs session + token refresh without pulling in profile UI. The doc also asks
you to **pick one default** — guards vs. store-driven redirects, resolvers vs. load-in-store — and
not mix them arbitrarily. The current implementation indicates guards plus load-in-store; record
that as the default only after the account/profile ownership is moved out of `UsersStore`.

**Cost:** ~2 days.

---

### ☐ P13 — Finish the design token pipeline

The type ramp in `styles/tailwind.css` is real work and it's good. But it's hand-written, it's
type-only, and PrimeNG is still stock Aura with a runtime `updatePrimaryPalette` — no brand preset,
no color tokens.

Epic `21` story 4 wants **Figma → Style Dictionary → PrimeNG preset**, and its open question 8 is
unanswered: _"Does Style Dictionary run in this repo's build, or publish a package? WINGD-8341
retired `ngfe-design-tokens` as a repo — so where does the pipeline live now?"_ That's precisely
the kind of question this lab exists to settle.

Note the deck claims this is already solved in `ws-ui-playground`. **Check that before rebuilding
it** — if the proof exists there, porting beats inventing.

Also unrecorded: `ideal-architecture.md:46` asks you to define _where custom styling is allowed_
(brand/marketing surfaces is the working answer) rather than pretend it won't exist. Write the rule.

**Cost:** ~2 days, less if `ws-ui-playground` ports.

---

### ☐ P14 — Lib public APIs stop exporting the repository

`libs/data-access/products/src/index.ts` line 1 is `export * from './lib/api'` — the raw fetch
functions are public. ROADMAP Phase F story 4: _"the lib exports the store and its events, never
the repository."_

Tiny diff. But this is exactly the discipline that decides whether the mega-barrel problem regrows,
and `ideal-architecture.md` is emphatic: _"do not port the `public-api.ts` mega-barrel… this single
decision determines whether any of the above actually works."_

**Cost:** ~1 hour. Do it while you're in P1.

---

### ☐ P15 — Accessibility

No axe, no `@angular-eslint` a11y rules enabled, no stated WCAG target.
`ideal-architecture.md` wants the target _"stated up front and owned by the design system"_ and
_"automated axe checks in CI on every PR"_ — with keyboard and screen-reader flows as acceptance
criteria, not remediation cards. `ngfe-web` has a whole epic (`19-accessibility/`) proving this is
a live concern.

**Cost:** ~1 day once P3 exists.

---

### ☐ P16 — Observability, typed analytics, feature flags

None of the three. `ideal-architecture.md` is specific: _"typed analytics event schema emitted from
the store — not `trackEvent()` sprinkled through components"_ (ROADMAP card `25`, which the ROADMAP
itself notes is _"almost certainly the same effort as `23.1`"_ — the event catalog, called **the
long pole** of Phase F). Plus RUM + error tracking at bootstrap, and flags with a single evaluation
point, typed accessors, and a retirement lifecycle.

Given card `23.1` is described as _"90% of that work and nobody has written it yet"_ — proving the
_shape_ of a typed event catalog here may be worth more than anything else in Tier 3.

**Cost:** ~2 days for the analytics schema shape; RUM/flags are mostly plumbing.

---

### ☐ P17 — Cross-slice effects

Plan §6 **gap 4** is still open: `HydrationEffects` and `StaticSeoMetadataEffects` have no obvious
landing spot in a SignalStore world — `createEffects` covers per-store async, cross-cutting
orchestration doesn't have a home. Everything here is single-store.

You already closed gap 3 with `withRouterContext`. Closing gap 4 would be the second real
contribution this lab makes back to the plan.

**Cost:** unknown — it's a design question, not an implementation. Spike it.

---

### ◐ P18 — ADRs

**Five drafted, none accepted.** ADR-0001 (Nx workspace), ADR-0002 (PrimeNG + Tailwind),
ADR-0003 (runtime config), ADR-0004 (SignalStore structure), and **ADR-0005 (application topology
and render modes, 9 Oct 2026)**. All carry **Proposed — for discussion, not for approval**.

**ADR-0005 is the first one that amends another.** It reduces ADR-0003's "promote one artifact"
guarantee for the marketing app, because prerendered HTML carries build-time content and cannot be
environment-neutral. That cross-reference is the thing that makes a decision record worth keeping:
without it, two documents make contradictory claims and the newer one wins by accident.

ROADMAP card `24`: ADRs for the ~8 decisions currently recorded only in untracked files. This lab is
where several of those decisions are actually being made — events-vs-`withRedux`, guards-vs-redirects,
DTO mapping, where custom styling is allowed, one-artifact-per-env. Recording them here costs
almost nothing and is the difference between a lab and a reference.

**Still missing:** an acceptance process. Five Proposed ADRs with no path to Accepted is a filing
cabinet, not a decision record. Also note the numbering hazard — ADR numbers are claimed on
unmerged branches in the separate documentation repo, so `0005` should be confirmed unclaimed
before this leaves `strapi-spike`.

**Cost:** ~0.5 day for the remainder.

---

### ◐ P19 — Performance baseline

**Today:** measured, not guarded. Lighthouse 13.5.0, `dummy-lab-prod.pages.dev/dashboard`,
2026-10-01, default clear-storage, **single runs**. The artifact is the promoted one —
`promote-cloudflare.yml` deploys the dev build after a `SHA256SUMS` check, and both environments
served `main-SCLTYCNS.js`, so these numbers describe the same bytes prod serves.

| Form factor | Perf | FCP   | LCP   | TBT    | CLS   | A11y |
| ----------- | ---- | ----- | ----- | ------ | ----- | ---- |
| desktop     | 95   | 0.7 s | 1.4 s | 0 ms   | 0.021 | 97   |
| mobile      | 86   | 2.6 s | 3.5 s | 120 ms | 0.056 | 100  |

Two caveats that matter more than the scores. **Quote the desktop 97, not the mobile 100** — the
toolbar's `end` slot is `hidden lg:flex`, so at mobile width the one real failure (`color-contrast`,
1.3:1 on the status badge) is not rendered and not audited. And these are single runs: two mobile
runs four minutes apart on the identical bundle scored 89 and 86, with TBT at 40 ms and 120 ms.
Mobile is "mid-to-high 80s", not 86.

**The structural cost this surfaced.** `runtime-config.json` is fetched before bootstrap with
`cache: 'no-store'` (`libs/shared/runtime-config/src/lib/runtime-config.ts:128`) and the Pages
Function returns `Cache-Control: no-store`. In the desktop waterfall the initial chunks finish at
211 ms, the config request runs 228→332 ms, and the first lazy route chunk does not start until
340 ms — roughly **130 ms of uncacheable, serialised time on every cold load**. That is the price of
P8's "vary configuration, not the artifact." It lives in the artifact, so it is identical in dev,
stage and prod. Mitigations exist — inline the config into `index.html` at deploy time, or allow a
short `s-maxage` at the edge. Neither has been taken, deliberately.

**No comparative claim.** There is no measured Lighthouse data for `ngfe-web` or `wingstop.com` in
hand. Same discipline as P11's SEO note: describe the mechanism, do not assert the outcome. If a
comparison belongs in the record, it is one `PERF_URL=… npm run perf:desktop` away.

**What's missing:** nothing is guarded. Bundle budgets exist (`initial` 500kb warn / 1mb error) but
there are no Lighthouse assertions, no per-PR preview deploy to measure against, and no second data
point — the before/after across P11 is the only comparison here that would prove anything.

**Cost:** ~0.5 day for an `lhci` target with assertions against a PR preview. The baseline above is
already paid: `npm run perf`, `perf:desktop`, `perf:mobile` write timestamped reports to the
gitignored `analytics/`.

---

### ☐ P20 — Experiment: make the hero image discoverable without prerendering

**Status: unproven. This is the experiment to run, not a conclusion.**

**What is established.** Measured 2026-10-01, Lighthouse 13.5.0, production `www.wingstop.com`,
single runs. LCP decomposes as:

| Phase                   | Mobile      | Desktop     |
| ----------------------- | ----------- | ----------- |
| Time to first byte      | 133 ms      | 378 ms      |
| **Resource load delay** | **6865 ms** | **7068 ms** |
| Resource load duration  | 353 ms      | 5176 ms     |
| Element render delay    | 45 ms       | 23 ms       |

The server answers fast and the image downloads fast. ~7 seconds pass before the browser requests it.
The element already carries `fetchpriority="high"` and `loading="eager"`, and they do nothing:
`curl https://www.wingstop.com` returns ~41 KB of HTML with an empty `<app-component>` shell — no
`ng-server-context`, no `<wri-*>` elements, **zero occurrences of `hero-lcp-img`**. Client-rendered,
so the preload scanner never meets the image. The asset is served from `cdn.bfldr.com` (Brandfolder).

**The constraint that rules out prerendering.** The hero is marketing-controlled, can change weekly
or hourly, and is influenced by feature flags and location. Build-time prerender would need a deploy
per change and has no single correct output under personalization.

**Two candidates to test.**

**A — Edge preload injection.** A Cloudflare Worker (`HTMLRewriter`) resolves CMS + flags +
`request.cf` geo at the edge, CMS response cached, and injects
`<link rel="preload" as="image" href="…">` into the existing shell. No Angular server runtime. Takes
the image fetch off the critical path; does **not** remove the boot-then-discover sequence. Same
shape as the existing `apps/dummy-lab/functions/runtime-config.json.ts` adapter.

**B — Per-route SSR.** `RenderMode.Server` on `/` via `provideServerRouting`; other route families
`Prerender` or `Client`. The server resolves personalization and emits the `<img>` in the HTML,
removing the sequence entirely. Costs a server runtime, puts the CMS call inside TTFB (needs edge
cache + stale-while-revalidate), and requires the SSR-safety work below first.

**Blocking question — get this before scoping either.** The real cardinality of hero
personalization. A handful of region x flag variants caches well at the edge and both options work.
Genuinely per-user collapses edge caching and changes the answer.

**The CMS turns that from a guess into a scoping input.** A headless CMS is what makes the hero
marketing-controlled in the first place, so the content model _is_ the cardinality answer — how many
hero variants the model can express is something you read off a schema rather than estimate. Get it
while that schema is still negotiable. Note too that both candidates now carry a content fetch:
A resolves the CMS at the edge before it can inject the preload, and B puts the CMS call inside
TTFB. See P21 for the cache boundary and P24 for what happens when that fetch fails.

**SSR-safety prerequisite for B.** Libs touching browser globals today:

- `libs/shared/runtime-config/src/lib/runtime-config.ts:124` — `document.baseURI`
- `libs/data-access/theme` — `withStorageSync` to `localStorage`
- `libs/data-access/auth` — same, persists `accessToken`/`refreshToken`
- `libs/data-access/location` — `navigator.permissions` / geolocation, inherently browser-only

**Two of these are now resolved, and the list was right to exist — 9 Oct 2026.** The SSR spike hit
both predicted failures on the first build:

- `runtime-config.ts` — fixed with a `RUNTIME_CONFIG_SEED` token the loader checks **before**
  reaching for `document`, seeded on the server from the same `RUNTIME_CONFIG_JSON` shape the Pages
  Function serves. ADR-0003 flagged exactly this ("the loader reads a browser global… if
  server-side rendering is adopted, this loader needs a server path") and was correct.
- `data-access/auth` — fixed by passing `withLocalStorage()` explicitly. The subtlety worth
  recording: `withStorageSync` **is** SSR-safe at runtime, but resolving its _default_ strategy
  evaluates `config.storage() === localStorage` at module load, so merely importing the file threw
  during route extraction. `theme` and `session-cart` already passed the strategy and were fine.

`data-access/location` is untouched and remains inherently browser-only. The tag axis this item
asks for is now **blocking** rather than advisable — see P1 and ADR-0005.

SSR is per-**application**, never per-library — but a lib can break it. Enforce with a
`platform:universal` / `platform:browser-only` tag axis plus a `depConstraints` rule so anything in
the server-rendered graph cannot import a browser-only lib. That is a second, independent argument
for P1, and this class of bug does not surface until someone enables SSR months later.

**How to prove it.** Measure `www.wingstop.com` before, implement one approach on a preview URL,
re-measure under identical conditions — same Lighthouse version, same preset, **median of 3-5**,
because production third-party variance is wide. The success metric is a drop in **LCP resource load
delay**, not the overall score: third-party load (245 of 286 requests, ~11 MB) dominates the score
and neither approach touches it.

**Do not predict a post-fix LCP.** The phase breakdown above sums to ~7.4 s while the reported mobile
LCP was 39.2 s — Lighthouse scales observed timings under simulated throttling while the insight
panel reports the observed trace. The mechanism and the `curl` evidence are solid; a specific
predicted number is not.

**Related:** P11 (SSR/SSG), P16 (deferring vendors past the LCP window), P18 — the A-vs-B choice is
ADR-shaped and would be the first real decision record.

**Cost:** ~1 day to test A on a preview. B is P11-sized.

---

## 5. If you only do one pass

A defensible "this is the example" is **P1 + P2 + P3 + P4 + P14**, roughly a week. That gets you:
the taxonomy enforced with a failing negative test, both missing lib types in existence, CI proving
`affected` narrows, two apps with a real blast-radius rule, and no repository leaking out of a lib
barrel.

Then **P6 + P9** (~1.5 days) because they're cheap and they stop the reference implementation
from modelling things you're calling defects in `ngfe-web`.

Then **P5 + P7 + P10** as the block that decides whether a real domain migration survives contact.

If the CMS lands this quarter, **P22 jumps the queue** — not because it outranks P5/P7/P10 on risk,
but because its rules are unwinnable arguments once a content model ships. P21 and P24 can follow
the normal order.

### Revision, 9 Oct 2026 — the SSR spike reordered the front of this list

**P1 is now a hard prerequisite, not merely the highest-leverage item.** ADR-0005 proposes
splitting marketing from ordering, and the control that makes that split safe is a
`platform:browser-only` tag rule. The spike proved the failure it prevents is real and total: one
library's module-level `localStorage` reference killed the entire server build during route
extraction. **Do P1 before implementing ADR-0005**, not alongside it.

**P26 contains a live defect** — a stale session in other tabs after logout, reachable today with
one app and two tabs. It becomes session resurrection the moment auth gains a non-login/logout write
such as token refresh. It is ~0.5 day and it is a bug in shipping code, so it does not belong in a
tier discussion at all. Fix it before P12 adds refresh.

**P25 is what product thinks already exists.** The spike proved prerendering works; it did not
prove marketing can publish. The gap is a webhook pipeline with a cache bypass, plus canonical and
sitemap, which are hours of work each.

Revised single pass: **P26 (bug) → P1 (blocker) → P25 (the half product assumes) → P2 + P4
(the split ADR-0005 describes) → P3 + P14.** The CMS work has jumped the Tier 1 queue twice now;
this is the point to stop letting it.

---

## 6. Open questions for you

1. **Is the PRD still true?** `PRD.md` calls this a learning lab and lists "optimize for deployment"
   as a non-goal. "This is the example" is a different charter. Pick one and rewrite the other —
   right now they contradict.
2. **Does `ws-ui-playground` already hold the token-pipeline proof?** (Deck slide 11 says yes.) If
   so, P13 is a port, and the interesting question becomes whether that repo or this one is the
   reference.
3. **Do you want the migration proofs at all?** If yes, they need a spike branch on `ngfe-web`, and
   that's a separate decision with a separate cost. If no, say so explicitly in whatever you present.
4. **Who is the audience?** A reference _you_ build from is a different artifact from one a team
   reads. The second needs P18 and a README; the first doesn't.
5. **What is the real cardinality of hero and landing personalization?** P20's blocking question is
   now also P21's scoping input, and it is answerable from the content model — but only while that
   model is still being designed.
6. **Who operates the content origin?** Self-hosting buys cache and throughput control and sells
   operational ownership. Both halves are real. Name the on-call owner, or treat the hosted vendors
   as the honest comparison rather than the expensive one.
7. **How much custom markup is marketing allowed to ship?** Settle it before the content model
   exists, not after — P22. Related to `ideal-architecture.md:46` and P13.
8. **Is the lab proving Strapi, or proving the seam?** If the vendor is not final, every item here
   should be written against "the CMS" and the only Strapi-specific work should be the measurement
   in P21. If it is final, say so and the mapper in P9 gets cheaper.
