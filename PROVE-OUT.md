# 🤖 Prove-Out Backlog — what's left before "this is the example"

**Drafted:** 22 Sept 2026 · **Audience:** Chris · **Status:** decision instrument, not a plan

Measured directly against this tree and against four sources in `ngfe-web`:
`docs/ANGULAR-MODERNIZATION-PLAN.md`, `initial-audit/`, `notebook/` (chiefly
`ideal-architecture.md` and `careers-spike.md`), and `work-book/` (chiefly `ROADMAP.md` and
epics `20`–`23`).

Every gap below is stated as: **what is true in this repo today** → **what proving it buys you
in `ngfe-web`** → **rough cost**. Status reflects the current implementation, not just a design
decision: partial work is deliberately not marked proven.

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

| Area                                                      | State      | Evidence                                                                                                                                                                                                                        |
| --------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nx graph + `affected`                                     | ✅ Proven  | 13 nodes; `dummy-lab` depends on 7 of 12 libs, not all                                                                                                                                                                          |
| SignalStore on the core `events` path                     | ✅ Proven  | `eventGroup` + `withReducer` + `on` + `injectDispatch` — `libs/data-access/products/`                                                                                                                                           |
| ngrx-toolkit peripherals                                  | ✅ Proven  | `withDevtools`, `withCallState`, `withResource`, `withEntityResources`, `withStorageSync`/`withLocalStorage`                                                                                                                    |
| Router state in a SignalStore                             | ✅ Proven  | `libs/shared/state/src/lib/signal-store/with-router-context.ts` — closes Plan §6 **gap 3**                                                                                                                                      |
| `httpResource`                                            | ✅ Proven  | all stores                                                                                                                                                                                                                      |
| Tailwind v4 `@theme` type ramp + self-hosted display face | ✅ Proven  | `styles/tailwind.css`                                                                                                                                                                                                           |
| PrimeNG with `cssLayer` ordering                          | ✅ Proven  | `libs/platform/src/lib/primeng.config.ts:16-20` — order `theme, base, primeng, utilities`, exactly as the PrimeNG Tailwind guide prescribes for v4                                                                              |
| Lib taxonomy — `data-access` + `util` axis                | 🟡 Partial | no `ui`, no `feature` libs exist                                                                                                                                                                                                |
| Vitest + coverage thresholds                              | 🟡 Partial | thresholds pass over placeholder specs                                                                                                                                                                                          |
| PrimeNG theming (generated Figma preset)                  | ✅ Proven  | 86-component preset in `theme/ts`, wired via `providePrimeNgPlatform()` — `libs/platform/src/lib/primeng.providers.ts`; `updatePrimaryPalette`, `light-dark()`, `extend` and `cssLayer` order all match the PrimeNG 22.1.1 docs |
| Figma → token pipeline                                    | 🟡 Partial | export is committed, not built: no in-repo regeneration step and no CI check that `theme/` matches Figma; `primary` still maps to Aura blue (`theme/ts/base.ts:309`); Tailwind `@theme` carries no colour tokens                |
| **Tags / module boundaries**                              | 🟡 Partial | all 13 projects tagged on `type:*`/`scope:*`; `depConstraints` only enforces `type:*` so far — no `scope:*` rules yet, and no negative test committed                                                                           |
| Deploy topology (marketing / ordering / account)          | ❌ Absent  | one app                                                                                                                                                                                                                         |
| SSR / SSG                                                 | ❌ Absent  | no `@angular/ssr`, no server entry, no prerender                                                                                                                                                                                |
| CI                                                        | ✅ Proven  | `.github/workflows/ci.yml` + `deploy-pages.yml`                                                                                                                                                                                 |
| Interceptors / HttpClient discipline                      | 🟡 Partial | functional auth interceptor registered with `provideHttpClient(withFetch(), withInterceptors(...))`; raw `fetch()` remains in every `api.ts`                                                                                    |
| DTO → domain mapping                                      | ❌ Absent  | DummyJSON shapes are the state                                                                                                                                                                                                  |
| Forms & validation                                        | 🟡 Partial | login uses a typed reactive form with required validation; no shared validators, cross-field/async validation, or server-error mapping                                                                                          |
| Guards / resolvers / error routes                         | 🟡 Partial | `accountGuard` redirects unauthenticated users; no resolver, unauthorized/404/error routes, or guard tests                                                                                                                      |
| Auth vs account boundary                                  | 🟡 Partial | persisted `AuthStore`, login mutation/events, auth interceptor, and authenticated `/auth/me` resource exist; no refresh/expiry policy and current-user data still lives in `UsersStore`                                         |
| Environment config                                        | ✅ Proven  | runtime config loads before bootstrap from `/runtime-config.json`; typed `RUNTIME_CONFIG` is consumed by app and data-access code; Cloudflare varies configuration, not the application artifact                                |
| MSW / test factories                                      | ❌ Absent  | 9 of 12 lib specs are `expect(true).toBe(true)`                                                                                                                                                                                 |
| Error taxonomy / `ErrorHandler` / fallback UI             | ❌ Absent  | `provideBrowserGlobalErrorListeners()` only                                                                                                                                                                                     |
| Accessibility                                             | 🟡 Partial | Lighthouse a11y **97** desktop on the promoted prod artifact (one failure: `color-contrast`); but still no axe, no a11y lint rules, no stated WCAG target                                                                       |
| Performance baseline                                      | 🟡 Partial | measured on prod 2026-10-01 — desktop **95**, mobile **86**; single runs, no budget assertions, no post-SSR comparison point — see P19                                                                                          |
| Observability / analytics / flags                         | ❌ Absent  | none                                                                                                                                                                                                                            |
| ADRs                                                      | ❌ Absent  | none                                                                                                                                                                                                                            |

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
plus `deploy-pages.yml`. Not part of the greenfield-lab charter (`PRD.md`'s non-goal list, see
open question 1), added anyway to prove the gate is executable.

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

**Cost:** ~0.5 day on one domain. The point is the price tag, not the code.

---

### ☐ P10 — Error taxonomy, `ErrorHandler`, per-route fallback

**Today:** `provideBrowserGlobalErrorListeners()` and nothing else. No normalized
network / validation / auth / server taxonomy, no retry / backoff policy, no per-route fallback UI,
no degraded or offline behavior.

`ideal-architecture.md` asks _"what does the user see when the menu API 500s?"_ — and Phase F
story 5 is entirely this. Currently unanswerable.

**Cost:** ~1–1.5 days.

---

## 4. Tier 3 — completes the picture

### ☐ P11 — SSR / SSG

No `@angular/ssr`, no server entry, no prerender. Epic `22` story 2 is "SSG/SSR decision per route
family," and `ideal-architecture.md` wants an incremental-hydration decision per route type. Natural
companion to P4 — marketing is the SSG app.

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

### ☐ P18 — ADRs

ROADMAP card `24`: ADRs for the ~8 decisions currently recorded only in untracked files. This lab is
where several of those decisions are actually being made — events-vs-`withRedux`, guards-vs-redirects,
DTO mapping, where custom styling is allowed, one-artifact-per-env. Recording them here costs
almost nothing and is the difference between a lab and a reference.

**Cost:** ~0.5 day.

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

**SSR-safety prerequisite for B.** Libs touching browser globals today:

- `libs/shared/runtime-config/src/lib/runtime-config.ts:124` — `document.baseURI`
- `libs/data-access/theme` — `withStorageSync` to `localStorage`
- `libs/data-access/auth` — same, persists `accessToken`/`refreshToken`
- `libs/data-access/location` — `navigator.permissions` / geolocation, inherently browser-only

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
