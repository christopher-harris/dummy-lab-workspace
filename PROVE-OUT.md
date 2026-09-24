# 🤖 Prove-Out Backlog — what's left before "this is the example"

**Drafted:** 22 Sept 2026 · **Audience:** Chris · **Status:** decision instrument, not a plan

Measured directly against this tree and against four sources in `ngfe-web`:
`docs/ANGULAR-MODERNIZATION-PLAN.md`, `initial-audit/`, `notebook/` (chiefly
`ideal-architecture.md` and `careers-spike.md`), and `work-book/` (chiefly `ROADMAP.md` and
epics `20`–`23`).

Every gap below is stated as: **what is true in this repo today** → **what proving it buys you
in `ngfe-web`** → **rough cost**. Tick the ones you want. Nothing here is started.

---

## 0. Read this first — the scope boundary

**This workspace can prove the *destination*. It structurally cannot prove the *migration*.**

Several of the riskiest items in the `ngfe-web` roadmap are migration proofs, and no amount of
work in a greenfield lab will close them:

| Migration proof | Why it can't happen here |
|---|---|
| `redux-connector` coexistence (Plan 6a: *"no feature migrates until this lands"*) | There is no legacy `@ngrx/store` slice here to coexist with |
| Backward-compatible `persist:features` read path (Plan §5 upgrade check) | There is no legacy persisted shape to stay readable |
| Story `21.1` — **prefixed** Tailwind, **Preflight off**, against globally-loaded Bootstrap 4 | This repo runs unprefixed Tailwind with Preflight on, greenfield |
| All 27 `angular.json` build configurations surviving `nx init` (Plan 0a acceptance criterion) | This workspace was generated, not migrated |

Those need a spike branch on `ngfe-web` itself. **Decide now whether you're willing to say that
out loud when you present this**, because the first person to ask "does this de-risk the
migration?" deserves an honest no.

What follows is everything that *is* in reach here.

---

## 1. Status snapshot

Scored against `notebook/ideal-architecture.md`, section by section.

| Area | State | Evidence |
|---|---|---|
| Nx graph + `affected` | ✅ Proven | 13 nodes; `dummy-lab` depends on 7 of 12 libs, not all |
| SignalStore on the core `events` path | ✅ Proven | `eventGroup` + `withReducer` + `on` + `injectDispatch` — `libs/data-access/products/` |
| ngrx-toolkit peripherals | ✅ Proven | `withDevtools`, `withCallState`, `withResource`, `withEntityResources`, `withStorageSync`/`withLocalStorage` |
| Router state in a SignalStore | ✅ Proven | `libs/shared/state/src/lib/signal-store/with-router-context.ts` — closes Plan §6 **gap 3** |
| `httpResource` | ✅ Proven | all stores |
| Tailwind v4 `@theme` type ramp + self-hosted display face | ✅ Proven | `styles/tailwind.css` |
| PrimeNG with `cssLayer` ordering | ✅ Proven | `apps/dummy-lab/src/app/app.config.ts` |
| Lib taxonomy — `data-access` + `util` axis | 🟡 Partial | no `ui`, no `feature` libs exist |
| Vitest + coverage thresholds | 🟡 Partial | thresholds pass over placeholder specs |
| Design tokens | 🟡 Partial | type ramp only; PrimeNG is stock Aura, no brand preset, no color tokens |
| **Tags / module boundaries** | 🟡 Partial | all 13 projects tagged on `type:*`/`scope:*`; `depConstraints` only enforces `type:*` so far — no `scope:*` rules yet, and no negative test committed |
| Deploy topology (marketing / ordering / account) | ❌ Absent | one app |
| SSR / SSG | ❌ Absent | no `@angular/ssr`, no server entry, no prerender |
| CI | ✅ Proven | `.github/workflows/ci.yml` + `deploy-pages.yml` |
| Interceptors / HttpClient discipline | ❌ Absent | raw `fetch()` in every `api.ts` |
| DTO → domain mapping | ❌ Absent | DummyJSON shapes are the state |
| Forms & validation | ❌ Absent | `ngModel` only |
| Guards / resolvers / error routes | ❌ Absent | zero matches repo-wide |
| Auth vs account boundary | ❌ Absent | `auth` lib exists; no account domain, no session, no guest path |
| Environment config | ❌ Absent | `DUMMY_JSON_BASE_URL` is a hardcoded const |
| MSW / test factories | ❌ Absent | 9 of 12 lib specs are `expect(true).toBe(true)` |
| Error taxonomy / `ErrorHandler` / fallback UI | ❌ Absent | `provideBrowserGlobalErrorListeners()` only |
| Accessibility | ❌ Absent | no axe, no a11y lint rules, no stated WCAG target |
| Observability / analytics / flags | ❌ Absent | none |
| ADRs | ❌ Absent | none |

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

**Why it's #1:** `ideal-architecture.md` says boundaries are *"enforced by Nx tags +
`@nx/enforce-module-boundaries`, not by convention."* That sentence is the load-bearing claim of
the entire architecture, and this workspace currently demonstrates the opposite. ROADMAP **Phase D's
exit gate** is literally *"a deliberate `type:ui` → `type:data-access` import **fails the
build**."* You cannot run that gate here.

**Proving it buys:** the Phase D gate, executable. Also settles Epic `20` story 1 (the taxonomy
that governs extracted libs, as distinct from Plan 0b which only sketches tags for *new* libs and
grandfathers `scope:legacy` across 94% of the code).

**Shape:** tag all 13 projects on both axes (`type:*`, `scope:*`); write the real `depConstraints`;
commit a fixture that violates a constraint and a check that asserts lint fails on it.

**Cost:** ~0.5 day. Highest leverage item in this document by a wide margin.

---

### ☐ P2 — At least one `ui` lib and one `feature` lib

**Today:** every page and every component lives in `apps/dummy-lab/src/app/`. You have the
`data-access` and `util` types; you have neither of the other two.

**Why it matters:** the rule that carries the most weight in the taxonomy is **`ui` may never
import `data-access`** — that is what makes *"pages and components do not talk to API services"*
mechanical rather than aspirational. With no `ui` lib in existence, it cannot be tested. It is
also the rule P1's negative test should target.

Secondary: `shared/ui` grouped by cohesion (`layout`, `forms`, `feedback`, `data-display`) is
untested, and `navbar` / `footer` / `shell` are sitting in the app as the obvious `shared/ui/layout`
candidates. Epic `22` open question 5 — *"shared nav/footer: does marketing get its own, or consume
a `shared/ui` lib? This is the first real test of the taxonomy"* — is answered by doing this.

**Proving it buys:** the taxonomy stops being a diagram. Also gives P4 something to share.

**Shape:** extract `products` as the vertical slice — it's the richest domain here (route params,
events, three `httpResource`s, entity resources). `libs/products/feature` + `libs/shared/ui/layout`.

**Cost:** ~1–2 days.

---

### ☑ P3 — CI running `nx affected`

**Done:** `.github/workflows/ci.yml` — `nrwl/nx-set-shas` + `npx nx affected -t lint test build`,
plus `deploy-pages.yml`. Not part of the greenfield-lab charter (`PRD.md`'s non-goal list, see
open question 1), added anyway to prove the gate is executable.

**Why it matters:** the `ngfe-web` ROADMAP is built entirely on *mechanically checkable* gates —
`nx affected -t lint test build` against the last successful main SHA via `nrwl/nx-set-shas`,
budgets that fail rather than warn, remote cache. None of it is demonstrated here. The single most
persuasive artifact you could put in front of the team is a PR where `affected` marks 2 projects
instead of 13, and right now you can't show one.

**Honest limit to carry over verbatim** (`ideal-architecture.md`, and ROADMAP Phase D): *an app
build always cache-misses when any transitive lib changes.* Caching wins on lint and test of
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
`ideal-architecture.md`, and nothing here exercises it. Epic `22`'s exit gate is *"careers served
from the marketing app in production, **and** a `scope:marketing` → cart / checkout / auth import
fails the build."* The second half of that is fully reachable in this repo.

`ideal-architecture.md` also says *"scaffold the `account` app + pipeline day one, no features in
it — drawing a deploy boundary early is cheap, retrofitting one is not."* Worth proving that's
true by doing it.

**Proving it buys:** two apps sharing `shared/ui`; a lib change marking both affected; the
blast-radius guarantee as a lint rule instead of a hope. Depends on P1 and P2.

**Cost:** ~1–2 days. Add SSG here or defer to T2 (see P11).

---

## 3. Tier 2 — the items that actually kill migrations

Tier 1 makes the architecture claim true. Tier 2 covers the things that, in my experience, are what
a real `ngfe-web` domain migration will run aground on. Ranked by risk-to-`ngfe-web`, not by cost.

### ☐ P5 — Forms & validation pattern

**Today:** `FormsModule` / `ngModel` only. No typed reactive forms anywhere, no shared validators
lib, no path for server-side validation errors back into a form, no design-system-owned error
rendering.

`ideal-architecture.md`: *"checkout is the hardest UI we own — it deserves an explicit pattern."*
This is the **highest-risk unproven area relative to what `ngfe-web` actually has to migrate**, and
it's the one this lab is least equipped for today because there's no hard form in it.

**Shape:** build a genuinely hard form — multi-step, cross-field validation, async validation,
server errors mapped back onto controls. `libs/shared/ui/forms` + `libs/shared/util/validators`.
Carts + auth are the only realistic hosts here; a synthetic checkout is fine and probably better.

**Cost:** ~2–3 days. Do not skip this one because it's unglamorous.

---

### ☐ P6 — HttpClient + interceptors; kill the raw `fetch()`

**Today:** every `api.ts` uses raw `fetch()` (`libs/data-access/products/src/lib/api.ts`,
and the same in posts, users, carts, recipes, todos, quotes, comments, auth) while the stores
simultaneously use `httpResource`. Two HTTP stacks per lib.

**Why it matters:** `fetch()` bypasses Angular's `HttpInterceptor` chain outright, so the
interceptors `ideal-architecture.md` names — auth, retry, correlation ID, timeout — are unprovable.
More pointedly: **this reproduces the exact anti-pattern the ROADMAP flags in Phase F story 5** —
`cart.repository.ts` finalising checkout over a WebSocket with a 75-second timeout, bypassing
`HttpInterceptor` entirely. Hard to argue that's a defect in `ngfe-web` while the reference
implementation does the same thing.

**Shape:** one HTTP stack. `provideHttpClient(withFetch(), withInterceptors([...]))`, and prove a
correlation-ID interceptor end to end.

**Cost:** ~1 day. Fix on principle even if you prove nothing else with it.

---

### ☐ P7 — MSW + real tests + test data factories

**Today:** 9 of 12 lib spec files are `describe('placeholder', () => it('should pass'))`. Coverage
thresholds in `apps/dummy-lab/project.json` are passing *over* those placeholders, which is worse
than having no thresholds — it's a green check that means nothing.

**Why it matters:** `ideal-architecture.md` calls out MSW specifically so *"feature libs are
testable with no backend and no VPN."* The VPN point is a real, named organizational pain. Also
Phase F story 7 (testing pyramid + MSW) and Plan 6a's `@ngrx/signals/testing` patterns.

**Shape:** MSW handlers over the DummyJSON shapes; real store tests (state + events, not
implementation); shared factories usable from unit and e2e.

**Note:** `[[analog-plugin-breaks-coverage]]` — the Analog plugin zeroes out uncovered-file
reporting. Keep it off for libs without real templates or the coverage numbers lie.

**Cost:** ~2 days.

---

### ☐ P8 — Runtime vs build-time environment config

**Today:** `DUMMY_JSON_BASE_URL` is a hardcoded `const` in `libs/shared/utils/src/lib/config.ts`.
There is no environment story at all.

**Why it matters:** this is disproportionate leverage. `ngfe-web` has **27 build configurations and
25 serve configurations**, each with its own `fileReplacements`. The **27 → 3 reduction is named as
the single biggest lever on Epic `20`'s cost** and is a hard prerequisite on ROADMAP Phase D. And
`ideal-architecture.md` wants *"one artifact promoted across envs, ideally"* — which is a
fundamentally different mechanism from `fileReplacements`, not a smaller version of it.

Cheapest high-leverage item in the document after P1.

**Shape:** runtime config fetched or injected at boot; one build artifact, three environments;
typed accessor; no `fileReplacements`.

**Cost:** ~1 day.

---

### ☐ P9 — DTO → domain mapping

**Today:** `models.ts` *is* the DummyJSON response shape, straight into store state — note
`Post` even carries an `[key: string]: unknown` index signature.

`ideal-architecture.md`: *"DTO → domain model mapping so backend shapes never leak into SignalStore
state."* That decision has real ongoing cost in `ngfe-web` and you haven't priced it. Proving it on
one domain tells you whether you actually believe in it.

**Cost:** ~0.5 day on one domain. The point is the price tag, not the code.

---

### ☐ P10 — Error taxonomy, `ErrorHandler`, per-route fallback

**Today:** `provideBrowserGlobalErrorListeners()` and nothing else. No normalized
network / validation / auth / server taxonomy, no retry / backoff policy, no per-route fallback UI,
no degraded or offline behavior.

`ideal-architecture.md` asks *"what does the user see when the menu API 500s?"* — and Phase F
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

**Cost:** ~1–2 days on top of P4.

---

### ☐ P12 — Auth vs account boundary, guards, resolvers, error routes

Zero matches for `canActivate` / `ResolveFn` / `canMatch` repo-wide. No 404, error, or unauthorized
routes. No token storage or refresh strategy. No guest-vs-authenticated path.

`ideal-architecture.md` calls the auth/account conflation *"the most common way this taxonomy goes
wrong"* — ordering needs session + token refresh without pulling in profile UI. You have an `auth`
data-access lib and no account domain, so the boundary is untested in either direction. The doc also
asks you to **pick one default** — guards vs. store-driven redirects, resolvers vs. load-in-store —
and not mix them arbitrarily. Neither choice is recorded.

**Cost:** ~2 days.

---

### ☐ P13 — Finish the design token pipeline

The type ramp in `styles/tailwind.css` is real work and it's good. But it's hand-written, it's
type-only, and PrimeNG is still stock Aura with a runtime `updatePrimaryPalette` — no brand preset,
no color tokens.

Epic `21` story 4 wants **Figma → Style Dictionary → PrimeNG preset**, and its open question 8 is
unanswered: *"Does Style Dictionary run in this repo's build, or publish a package? WINGD-8341
retired `ngfe-design-tokens` as a repo — so where does the pipeline live now?"* That's precisely
the kind of question this lab exists to settle.

Note the deck claims this is already solved in `ws-ui-playground`. **Check that before rebuilding
it** — if the proof exists there, porting beats inventing.

Also unrecorded: `ideal-architecture.md:46` asks you to define *where custom styling is allowed*
(brand/marketing surfaces is the working answer) rather than pretend it won't exist. Write the rule.

**Cost:** ~2 days, less if `ws-ui-playground` ports.

---

### ☐ P14 — Lib public APIs stop exporting the repository

`libs/data-access/products/src/index.ts` line 1 is `export * from './lib/api'` — the raw fetch
functions are public. ROADMAP Phase F story 4: *"the lib exports the store and its events, never
the repository."*

Tiny diff. But this is exactly the discipline that decides whether the mega-barrel problem regrows,
and `ideal-architecture.md` is emphatic: *"do not port the `public-api.ts` mega-barrel… this single
decision determines whether any of the above actually works."*

**Cost:** ~1 hour. Do it while you're in P1.

---

### ☐ P15 — Accessibility

No axe, no `@angular-eslint` a11y rules enabled, no stated WCAG target.
`ideal-architecture.md` wants the target *"stated up front and owned by the design system"* and
*"automated axe checks in CI on every PR"* — with keyboard and screen-reader flows as acceptance
criteria, not remediation cards. `ngfe-web` has a whole epic (`19-accessibility/`) proving this is
a live concern.

**Cost:** ~1 day once P3 exists.

---

### ☐ P16 — Observability, typed analytics, feature flags

None of the three. `ideal-architecture.md` is specific: *"typed analytics event schema emitted from
the store — not `trackEvent()` sprinkled through components"* (ROADMAP card `25`, which the ROADMAP
itself notes is *"almost certainly the same effort as `23.1`"* — the event catalog, called **the
long pole** of Phase F). Plus RUM + error tracking at bootstrap, and flags with a single evaluation
point, typed accessors, and a retirement lifecycle.

Given card `23.1` is described as *"90% of that work and nobody has written it yet"* — proving the
*shape* of a typed event catalog here may be worth more than anything else in Tier 3.

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

## 5. If you only do one pass

A defensible "this is the example" is **P1 + P2 + P3 + P4 + P14**, roughly a week. That gets you:
the taxonomy enforced with a failing negative test, both missing lib types in existence, CI proving
`affected` narrows, two apps with a real blast-radius rule, and no repository leaking out of a lib
barrel.

Then **P6 + P8 + P9** (~2.5 days) because they're cheap and they stop the reference implementation
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
4. **Who is the audience?** A reference *you* build from is a different artifact from one a team
   reads. The second needs P18 and a README; the first doesn't.
