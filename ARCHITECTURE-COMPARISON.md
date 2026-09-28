# 🤖 dummy-lab vs ngfe-web — architecture comparison

**Date:** 2026-09-28 · **Author:** Claude (Opus 5), at Chris's request · **Lens:** Staff UI engineer review
**Measured against:** `dummy-lab-workspace` @ `18dbb42`, `ngfe-web` @ `f37d8d7d1`, and `ngfe-web/initial-audit/` (2026-08-25, overall 4.3/10)

Everything below was executed or read against the trees, not taken from either repo's docs. Where a
doc and the tree disagree, the tree wins and the disagreement is itself a finding.

> **Revision, 2026-09-28.** Two changes since first issue:
>
> 1. **One finding retracted.** The claim that dummy-lab never lints templates was a measurement
>    error on my part — see §1. Templates _are_ linted and the 11 accessibility rules fire at
>    `error`. That row flips from a dummy-lab loss to a dummy-lab win.
> 2. **Five of the six §8 cleanup items are applied** to this tree: the change-detection regression
>    (§2), the credential logging and `window.event` bug (§3.2, §3.3), the dead code (§3.5), and the
>    lint and format gates. The PrimeNG license key (§3.1) is open and needs a decision. Findings
>    are left as written so the before/after stays legible.

---

## Verdict

**dummy-lab proves the destination and reproduces the disease.**

It wins decisively on the things the audit called _structural_ — runtime config, real code splitting,
enforced import boundaries, per-project strictness. It loses, or ties, on the one thing the audit
named as the actual root cause:

> _"The quality gates exist, are well-chosen, and are pointed at the wrong files or wired up inert."_
> — `AUDIT-00-SUMMARY.md`

That sentence is as true of dummy-lab today as it is of ngfe-web. Different files, same mechanism.

It is still the right basis for ADRs. But if the ADRs get written off the current tree, they will
encode **stack decisions** (SignalStore, Nx, runtime config) and omit **enforcement decisions** — and
enforcement is the only category that would have prevented the audit. The team would adopt Angular 22
and signals and be back at 4.3/10 in three years with a nicer package.json.

---

## 1. The gate-illusion finding, reproduced

### ~~dummy-lab lints 41 TypeScript files and zero templates~~ — RETRACTED

**This finding was wrong. Templates are linted, and the accessibility rules do fire.**

My original probe was `npx eslint apps/dummy-lab/src` from the workspace root, which resolves the
**root** `eslint.config.mjs` — and that file has no `**/*.html` config block, so HTML came back
"ignored because no matching configuration was supplied." `nx lint` does not run it that way: it uses
each project's own config, which spreads `nx.configs['flat/angular-template']`.

Re-measured correctly:

```
$ npx eslint --config apps/dummy-lab/eslint.config.mjs "apps/dummy-lab/src/**/*.html"
html files linted: 20 | messages: 0
```

And they genuinely bite — appending `<img src="x.png">`, a bare `(click)` handler and an `*ngIf` to
`app.html` produces:

```
19:1  error  <img/> element must have a text alternative            @angular-eslint/template/alt-text
20:1  error  click must be accompanied by either keyup, keydown...  @angular-eslint/template/click-events-have-key-events
20:1  error  Elements with interaction handlers must be focusable   @angular-eslint/template/interactive-supports-focus
21:7  error  Use built-in control flow instead of directive ngIf    @angular-eslint/template/prefer-control-flow
✖ 4 problems (4 errors, 0 warnings)
```

So dummy-lab has **11 working `@angular-eslint/template/*` accessibility rules at `error`, plus
`prefer-control-flow`, across 20 templates, currently clean.** On this dimension it is not behind
ngfe-web, it is well ahead: `AUDIT-00` found ngfe-web ships the a11y preset in `node_modules` and
extends only `template/recommended`, and that enabling it reports **214 violations across 70 of 224
templates**. ngfe-web also sets `template/prefer-control-flow` to `"off"`.

`PROVE-OUT.md`'s "❌ Absent | no axe, **no a11y lint rules**" undersells what is there. The a11y lint
rules exist and work. What is genuinely absent is axe/runtime auditing, a stated WCAG target, and any
component complex enough to violate the rules yet.

### The rules that do run are warnings

Resolved severity for `libs/data-access/auth/src/lib/store.ts`:

| Rule                                                        | Severity       |
| ----------------------------------------------------------- | -------------- |
| `@typescript-eslint/no-explicit-any`                        | `1` (warn)     |
| `@typescript-eslint/no-unused-vars`                         | `1` (warn)     |
| `@typescript-eslint/explicit-function-return-type`          | `0` (off)      |
| `no-console`                                                | absent         |
| `@angular-eslint/prefer-on-push-component-change-detection` | absent         |
| `@nx/enforce-module-boundaries`                             | `2` (error) ✅ |

No `--max-warnings 0` anywhere. `: any` ships green.

For contrast, ngfe-web sets `"maxWarnings": 0` (`angular.json:770`) — and then scopes
`lintFilePatterns` to `src/app/lib/ngfe-app/src/lib/**` only, so 142 files including `main.ts` are
never linted at all. **The two repos have opposite halves of one working gate.** dummy-lab has the
file coverage without the severity; ngfe-web has the severity without the file coverage.

### Coverage thresholds are measured over a self-selecting denominator

`apps/dummy-lab/project.json` sets `coverageThresholds: { statements: 75, branches: 80, ... }`.
Measured from `coverage/dummy-lab/lcov.info`:

```
files 24   lines 139/179 (77.7%)   branches 134/157 (85.4%)   fns 75/95 (78.9%)
```

24 files. The app has ~55 source files. `carts.page`, `posts.page`, `quotes.page`, `recipes.page`,
`todos.page`, `users.page`, `products.page`, `auth.page`, `register`, `forgot-password` and
`account.routes` **do not appear in the report at all** — `coverageInclude` is not forcing them in, so
they are neither covered nor counted. The 75% gate passes because the untested half is invisible.

Same species as `AUDIT-00`'s `testMatch`-is-an-allowlist finding. ngfe-web at least _documents_ its
version in `CLAUDE.md:27`.

### 9 of 11 lib specs are placeholders

```
libs/data-access/{posts,carts,users,todos,comments,quotes,recipes,products,auth}/src/lib.spec.ts
  → describe('placeholder', () => it('should pass', () => expect(true).toBe(true)))
```

Full suite: **55 tests, 15 projects, 7.4 s.** Subtract placeholders → ~46 real tests. Real coverage of
the state layer — the entire architectural thesis — is `theme` (10 tests) and `with-router-context`
(6 tests). `ProductsStore`, the flagship store composing `withResource` + `withEntityResources` +
`withReducer` + `withRouterContext`, has **zero tests**. `AuthStore` has zero.

ngfe-web: **406 suites / 6,810 tests in 52–60 s**, 22 NgRx slices the audit called textbook, zero
un-memoized selectors across 427 `select` sites. On test discipline ngfe-web is not close — it is in
a different category.

`PROVE-OUT.md` P7 already calls this out. I'm restating it because it is the single largest
credibility gap between "this is the example" and the tree.

---

## 2. The change-detection regression

**21 of 22 components explicitly set `ChangeDetectionStrategy.Eager`.**

In Angular 22, `OnPush` is the default and `Eager` is the old `Default`/`CheckAlways`:

```ts
// node_modules/@angular/core/types/_debug_node-chunk.d.ts:4867
declare enum ChangeDetectionStrategy {
  OnPush = 0, // NOTE: OnPush is enabled by default.
  Eager = 1, // checked eagerly when the CD traversal reaches it
  Default = 1, // @deprecated Use `Eager` instead.
}
```

Provenance, from git:

```
5889bcd chore: [nx migration] change-detection-eager
```

The v22 migration mechanically preserved the pre-v22 behaviour by annotating every component. Then
the migration enabled the lint rule that would have flagged it, and the rule was switched off:

```js
// apps/dummy-lab/eslint.config.mjs
// Newly enabled by angular-eslint's tsRecommended set (bumped alongside this migration);
// was not enforced before the upgrade and was not explicitly configured by the user.
'@angular-eslint/prefer-on-push-component-change-detection': 'off',
```

This is, line for line, the ngfe-web pattern the audit flagged: _"`prefer-standalone`, `prefer-inject`,
`template/prefer-control-flow` all explicitly `off` — the three rules that would enforce the repo's own
written style guide."_

**Scoreboard:** ngfe-web is **93% OnPush** (248/266 components, all 162 `@for` blocks carry a `track`).
dummy-lab is **1/22**. The repo built to demonstrate signal-first Angular runs every component in
CheckAlways and disabled the rule that says so.

Zoneless softens the runtime cost (no zone-triggered CD storm — dummy-lab has no `zone.js` dependency
at all, which is genuinely cleaner than ngfe-web). It does not make it correct, and it throws away the
precision that is the entire point of the signal graph.

**Fix: delete 21 lines, turn the rule to `error`.** Highest value-per-keystroke change in the repo.

---

## 3. Findings dummy-lab owns outright

These are not in `PROVE-OUT.md`.

### 3.1 A commercial PrimeNG license key is committed to source

`libs/platform/src/lib/primeng.providers.ts:58`

```ts
license: 'eyJpZCI6ImMyZTY5OTFmLThmMTQtNDIwNS1iMmI2LWRkYzk3ZjJhNzhmYiIsInByb2R1Y3Qi...';
```

A `tier: commercial`, `type: dev` JWT, in git, in a lib that every app imports, and it ships to the
browser in the initial bundle. `PRD.md` states: _"Secrets and private credentials must not be
committed."_ Rotate it and move it behind `RUNTIME_CONFIG` or a build-time define. Note this also
means the "runtime config, zero secrets" story has a hole in the lib that provides it.

### 3.2 Credentials are logged to the console

```ts
// apps/dummy-lab/src/app/pages/auth/login/login.ts:36
onSignInClicked() {
  console.log(this.loginForm.getRawValue());   // { username, password }
```

```ts
// libs/data-access/auth/src/lib/store.ts:77,83
loginRequested$: events.on(authEvents.loginSubmitted).pipe(
  tap((event: any) => { console.log('loginRequested$', event); ...   // payload = credentials
loginSucceeded$: events.on(authEvents.loginSucceeded).pipe(
  tap((event: any) => { console.log('loginSucceeded$', event); ...   // payload = accessToken/refreshToken
```

Username, password, and both tokens, to `console`, in a production build. There is no `no-console`
rule configured, so nothing catches it.

### 3.3 The DOM global `event` is silently bound

```ts
// libs/data-access/auth/src/lib/store.ts:88-89
logoutRequested$: events.on(authEvents.logoutRequested).pipe(
  tap(() => {
    console.log('logoutRequested$', event);   // ← no parameter named `event` in scope
```

That `event` resolves to the deprecated `window.event` global. `strict: true` does not catch it
because `lib.dom` declares it.

This is the _identical bug class_ to `AUDIT-02`'s highest-severity correctness finding in ngfe-web:
`job-location-search-list.component.ts:52` silently binding the DOM global `Location` after a dropped
type import. Two repos, 1,193 files vs 22 components, same trap, same reason: nothing in the toolchain
flags a reference that happens to resolve to a browser global.

### 3.4 Auth tokens are persisted with no schema and no version key

```ts
// libs/data-access/auth/src/lib/store.ts:38
withStorageSync('dummy-lab-auth'),
```

Whole-state sync to `localStorage`, including `accessToken` and `refreshToken`, read back on init with
no validation and no version key. `AUDIT-04` flagged exactly this in ngfe-web
(`feature-hydration.ts:270-281` — _"`deepMergeAll`s raw storage content with no schema check and no
version key; persisted payload includes oidc `auth.user` tokens"_) and paired it with a live
prototype-pollution CVE sink.

dummy-lab has `parseRuntimeConfig()` — a careful, hand-written, well-tested validator — for config
that comes from _your own origin over HTTPS_, and zero validation for state that comes from a surface
any XSS can write. The discipline exists in the repo. It is pointed at the lower-risk boundary.

### 3.5 The auth lib is three abandoned approaches in a trench coat

- `api.ts` exports `login()` → `POST ${apiBaseUrl}/auth/login`. Unreachable; nothing imports it.
- The live path is `httpMutation` → `POST ${apiBaseUrl}/user/login`. **Different endpoint.** DummyJSON's
  is `/auth/login`, so the dead code has the correct URL and the live code does not.
- Three commented-out blocks: a `withResource` login, a `withMethods` login/logout, a `withReducer`.
- `authEvents` declares `loginFailed`, `sessionRestored`, `sessionExpired`. None are dispatched or
  handled. `onError` is `console.error`; there is no user-facing failure state.
- `: any` twice.
- File is named `actions.ts`. The same concept in `products` is named `events.ts`.

That last one matters more than it looks. At 11 libs, naming has already drifted. `AUDIT-03` found
ngfe-web's `good-practices.md` §11 prescribing `*.api.ts` / `*.state.ts` — **zero files each** — while
the repo silently standardised on undocumented `*.repository.ts` / `*.store.ts`. dummy-lab is two
files into the same divergence, before an ADR exists to diverge from.

### 3.6 Smaller, verified

| Finding                                                                                                                | Evidence                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial bundle **69% over budget**, warning-only, ships green                                                          | `847.13 kB` raw / `195.84 kB` transfer vs `maximumWarning: 500kb`. Build prints `▲ WARNING` and exits 0                                      |
| `carts-page` lazy chunk (320 kB) is larger than `main` (310 kB)                                                        | build output                                                                                                                                 |
| `tsconfig.base.json` sets `strict: false`, `moduleResolution: "node"`, `target: "es2015"`, `ignoreDeprecations: "6.0"` | Every project overrides it, so it's inert — but the next generated project inherits the base, and `node` resolution is deprecated under TS 6 |
| `nx format:check` is not in CI                                                                                         | Prettier is installed and configured; `products/store.ts` and `auth/store.ts` are visibly unformatted                                        |
| `@nx/eslint:lint` executor is deprecated, removal in Nx 24                                                             | Workspace is on Nx 23.2.1; the executor prints the warning on every run                                                                      |
| `Register` and `ForgotPassword` components + specs exist and are unrouted                                              | `auth.routes.ts` routes only `login` — and does so **eagerly** (`component: Login`) while every other route uses `loadComponent`             |
| `accountGuard` is typed `ResolveFn<boolean \| UrlTree>` and used as `canActivate`                                      | Structurally compatible, so nothing errors. It is a `CanActivateFn`                                                                          |
| `DashboardPage.apps` is always `[]`                                                                                    | `computed()` filters `router.config` for `path !== ''`; the top level is a single `path: ''` shell route                                     |
| `PaginatedResponse<TKey, TItem>` in `shared-utils` is used only by its own spec                                        | `products/models.ts` hand-writes `ProductsResponse` instead. The DRY abstraction exists, is tested, and is unused                            |
| `libs/platform/README.md` says _"The library is empty for now"_                                                        | It has two files and provides PrimeNG for the workspace                                                                                      |
| `18dbb42 "Drop Wingstop-specific theme primitives"`                                                                    | `styles/tailwind.css` still carries the full Wingstop type ramp and self-hosted Roc Grotesk                                                  |
| Render-blocking `@import url('https://fonts.googleapis.com/...')` in the first stylesheet                              | `styles/tailwind.css:2`. Also `.otf` (not `.woff2`) for both display faces — roughly 2× the bytes                                            |
| NG8107 template diagnostic, warning-only                                                                               | `top-posts-card.component.html:4`                                                                                                            |

---

## 4. Where dummy-lab is genuinely, structurally better

Credit where it's earned. These are the ADR candidates.

### 4.1 Runtime configuration — the strongest single idea in either repo

`libs/shared/runtime-config/` loads `/runtime-config.json` in a `provideAppInitializer`, validates it
by hand (environment enum, URL parse, protocol allowlist, feature-flag types), `Object.freeze`s it, and
publishes it as a typed `RUNTIME_CONFIG` token. `main.ts` renders a `role="alert"` DOM fallback if it
fails. Documented with _"Never add credentials… this document is delivered to every browser."_

What this replaces in ngfe-web: 26 environment files, 27 `angular.json` build configurations,
`fileReplacements`, and a footgun documented in your own `CLAUDE.md` — _"⚠️ A bare `yarn build` writes
`apiBaseUrl: https://api.wingstop.com` into `dist/`."_ One artifact, promoted across environments,
configured at the edge. That whole class of problem stops existing.

**This is ADR-001. Write it as-is.**

### 4.2 Code splitting works, and it works because of structure

|                                      | ngfe-web    | dummy-lab |
| ------------------------------------ | ----------- | --------- |
| Initial, raw                         | 9.98 MB     | 847 kB    |
| Initial, transfer                    | 1.36 MB     | 196 kB    |
| Lazy chunks from the product library | **0 of 12** | 24        |

ngfe-web's `loadChildren` was defeated because 8 of 13 route imports and `main.ts` all name the same
`public-api` barrel. dummy-lab cannot have that bug: 11 libs, 11 import paths, one `src/index.ts` each,
and `@nx/enforce-module-boundaries` at severity **error** stops a deep import from re-creating it.

Caveat, and it's a real one: **dummy-lab has no test that this stays true.** See §5.1.

### 4.3 Import boundaries that exist

`eslint.config.mjs` `depConstraints` — verified at severity `2`:

```
type:app         → *
type:data-access → type:data-access, type:util, scope:shared
type:ui          → *
```

`AUDIT-09` found `good-practices.md:294` claiming an `eslint-plugin-import` boundary guard **that was
never installed**, and `AUDIT-03` found `public-api.ts` serving 8% of shell→lib imports while 81%
reached into internals and 20 went straight into component files. dummy-lab has the mechanism ngfe-web
documented and never had.

Two gaps: no `scope:*` rules yet (so `products` may import `carts`), and `type:ui → *` is pointing the
wrong way — UI should be a leaf, not depend on everything. `PROVE-OUT.md` P1 already owns the negative
test. Fix `type:ui` while you're in there.

### 4.4 Strictness, per project

Every project's `tsconfig.json`: `strict`, `noImplicitOverride`,
`noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`,
`isolatedModules`, and `angularCompilerOptions.strictTemplates` + `strictInjectionParameters` +
`strictInputAccessModifiers`.

ngfe-web has **none** of these: no `strict`, `noImplicitAny: false`, no `strictTemplates` — all 224
templates compile in Angular's weakest type-check mode. This is the cheapest high-leverage ADR after
runtime config, and `strictTemplates` is what makes the a11y and template-quality story enforceable at
all.

### 4.5 `withRouterContext`

`libs/shared/state/src/lib/signal-store/with-router-context.ts` is the best-written file in either
repo. Correct primary-outlet walk, explicit reasoning for skipping auxiliary outlets, `distinctUntilChanged`
with a real comparator, subscription cleanup in `onDestroy`, documented parent→child collision
semantics, a companion `PRODUCT_ID_PARAM` constant because _"the contract between a store and its route
is an untyped string,"_ six real tests, and a docstring that warns about `Number(null) === 0`.

This is what the rest of the repo should read like.

### 4.6 Modern platform, cleanly

Angular 22.1.8 / TS 6.0.3 / NgRx 22 + `@ngrx/signals` vs Angular 21.1.1 / TS 5.9.3 / NgRx 21. No
`zone.js` dependency at all. One store model, not two — ngfe-web still runs `@ngrx/store` **and** a
legacy `redux` + `redux-persist` store with a hand-rolled `hydrationMetaReducer`, with `AUDIT-04`
finding _"three live sources of truth for basket/auth/location; a second entire store built, hydrated,
and never read."_

---

## 5. Where ngfe-web is better, and what to port _into_ the lab

### 5.1 Architecture fitness functions — port these first

`src/app/architecture/` is the best engineering artifact in either repo:

- `eager-import-graph.ts` — builds the real static import graph from `main.ts`
- `eager-bundle-boundary.spec.ts` — asserts neither whole-app barrel is statically reachable, with a
  measured file ceiling (`EAGER_FILE_CEILING = 560`, _"measured at 522 on the WINGD-13582 branch, down
  from 772 on main, −32.4%… ~7% headroom so ordinary feature work doesn't trip it"_), and a failure
  message that prints the offending import chain and tells you to fix the newest edge rather than raise
  the number
- `lazy-chunk-boundary.spec.ts` — 11.7 kB of the same discipline

Its own docstring explains why it exists: _"Nothing about that is visible at runtime — every route
renders identically whether the split works or not — so without this spec the invariant can be silently
undone by a single convenience import."_

**That sentence is the answer to the audit.** It is the mechanism that converts an architectural
intention into something that fails a build. dummy-lab has **zero** architecture tests. Until it has
one, §4.2's splitting win is a property of its current size, not of its architecture — and the ADR
derived from it will be an aspiration.

Note also what this means about the audit's shelf life: ngfe-web has moved. `main.ts:37-43` now carries
a WINGD-13582 comment explaining the deep-import strategy, three lazy routes point at real paths
instead of `public-api`, bundle budgets exist (`initial` baseline 5650 kb ±1%/5%), and `maxWarnings: 0`
is set. The 4.3/10 is a 2026-08-25 snapshot, and re-quoting it in a presentation without that caveat
will get you corrected in the room.

### 5.2 Test discipline

6,810 tests vs ~46. Also `FeatureState<T,K>` giving an 8,066-line store zero cross-file clones, and
zero `@ts-ignore`/`@ts-expect-error` anywhere in 1,193 files. Whatever else is wrong there, nobody is
fighting the compiler and nobody is shipping placeholder specs.

### 5.3 One HTTP boundary that actually holds

ngfe-web: all HTTP behind 27 `*.repository.ts` files using `wri-http-client`; **1 of 264 components
touches `HttpClient`**; `io-ts`/`fp-ts` at the API boundary.

dummy-lab runs **three** HTTP mechanisms concurrently: raw `fetch()` in every `api.ts`, `httpResource`
inside stores, and `httpMutation` in `AuthStore`. In `ProductsStore` all three idioms coexist in one
file, and the `api.ts` functions are bypassed for three of the four resources. `PROVE-OUT.md` P6 owns
this; I'd raise its priority, because `fetch()` also bypasses `authInterceptor` entirely — every
`api.ts` call is unauthenticated, which is a behavioural bug, not a style preference.

### 5.4 Design tokens adopted at scale

794 `wri-typography()` calls, 1,280 `wri-color()`, a committed Style-Dictionary pipeline, 240/263
components scoped via `styleUrls`. dummy-lab has a type ramp and stock Aura — `PROVE-OUT.md` P13 owns it.

### 5.5 Real a11y work, where it was attempted

Tested skip link, focus restoration in `body-inert-blocker.service.ts`, roving-focus keyboard nav with
`LiveAnnouncer`, 96% image alt coverage with CMS-driven alt text. ngfe-web scores 4/10 on a11y and
still has more working accessibility than dummy-lab, which has an a11y ruleset that never executes.

---

## 6. One genuine architectural disagreement

**`withRouterContext` inside a `data-access` lib couples shared data to the router.**

`ProductsStore` is `{ providedIn: 'root' }`, composes `withRouterContext()`, derives `routeProductId`
from a URL segment, and fires a `selectedProduct` `httpResource` off it. Consequences:

1. `ProductsStore` cannot be used outside a routed context — including in a test, which is part of why
   it has none.
2. Two of its four resources (`productPreview`, `selectedProduct`) are page concerns living in a lib
   every consumer shares. A second product surface with a different URL shape has to either adopt
   `productId` as its segment name or fork the store.
3. The store's own comment concedes the seam: _"Not wired into `productPreview` yet — this only surfaces
   the value."_

This is how you get `choose-location.component.ts` — 2,061 lines, 81 methods, 25 injected dependencies
(`AUDIT-03`) — except one layer deeper, in a lib nobody can refactor independently. The router→state
binding is genuinely useful; it belongs in a `feature` lib or a page, above the shared data layer.
`PROVE-OUT.md` P2 ("at least one `ui` lib and one `feature` lib") is the fix, and this is the argument
for why P2 is Tier 1 rather than taxonomy tidiness.

Related, smaller: `Product` is DummyJSON's wire shape plus `[key: string]: unknown`. With
`noPropertyAccessFromIndexSignature` on, that's mostly contained — but it is why P9 (DTO → domain
mapping) matters more than its Tier-2 placement suggests. Right now the vendor's JSON _is_ the domain
model, in the libs every app depends on.

---

## 7. The same finding, both repos

| `initial-audit` finding (ngfe-web)                                                                        | dummy-lab equivalent                                                                                                                            |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| ESLint scoped away from most of the tree (`AUDIT-00`); a11y preset never extended (214 violations latent) | ~~Templates unlinted~~ — **retracted, see §1.** Templates _are_ linted, a11y rules fire at `error`, 20 templates clean. dummy-lab wins this row |
| `prefer-standalone` / `prefer-inject` / `prefer-control-flow` explicitly `off`                            | `prefer-on-push-component-change-detection` explicitly `off`                                                                                    |
| 93% OnPush                                                                                                | **1/22** OnPush; 21 `Eager` from an unreviewed migration                                                                                        |
| `testMatch` allowlist silently drops 15 specs                                                             | Coverage thresholds over a 24-file denominator; 9 of 11 lib specs are placeholders                                                              |
| Storage hydration merges auth tokens, no schema, no version (`AUDIT-04`)                                  | `withStorageSync('dummy-lab-auth')` — tokens, no schema, no version                                                                             |
| DOM global `Location` silently bound (`AUDIT-02`)                                                         | DOM global `event` silently bound (`auth/store.ts:89`)                                                                                          |
| `good-practices.md` §11 prescribes file suffixes with zero matching files (`AUDIT-03`)                    | `actions.ts` vs `events.ts` for one concept, at 11 libs                                                                                         |
| Bundle budgets that don't bite (±1% on a 5650 kb baseline)                                                | Initial 69% over budget, warning-only, green                                                                                                    |
| Docs claim state the tree contradicts                                                                     | `platform/README.md` "empty for now"; `18dbb42` claims removals that didn't happen                                                              |

Nine rows. dummy-lab has 22 components and 11 libs; ngfe-web has 1,193 TypeScript files. The disease is
not proportional to size — it's a property of how the gates are wired.

And your own `docs/zoneless-migration-checklist.md:367` is the same class of artifact:

> **Total Remaining:** 0 test files to fix — **ALL ZONELESS MIGRATION COMPLETE** ✅

Measured against the tree today: **246 `markForCheck()`** and **12 `detectChanges()`** calls outside
specs, **93 files** still injecting `ChangeDetectorRef`, `app.component.ts:102,161` still injecting
`NgZone` and calling `runOutsideAngular` (a no-op under zoneless), `zone.js@^0.15.0` still a production
dependency, and `src/test.ts:3` importing `zone.js/dist/zone-testing` — a path that does not exist in
zone.js 0.15, in a file nothing references. The plan's own inventory table says
_"markForCheck | 26 files (52 instances)"_; the tree has ~5× that. Two thousand lines of Phases 2–8
follow the "COMPLETE" banner, as do two sections of tests skipped pending investigation (28 skipped
tests total).

The runtime switch landed and is real. The migration it was supposed to enable did not. You were right.

---

## 8. Recommendation

### Before writing a single ADR — one day of work

1. ~~Delete the 21 `ChangeDetectionStrategy.Eager` lines; enable
   `prefer-on-push-component-change-detection`.~~ **Done.** Note the rule's v22 semantics: it flags
   components that _opt out_ of OnPush and permits omission — it does not demand an explicit
   `OnPush`. Set to `['error', { allowExplicitOnPush: false }]` so omission is the only spelling.
2. ~~Make lint bite.~~ **Done** — `maxWarnings: 0` on all 15 lint targets; `no-explicit-any`,
   `no-unused-vars` and `no-console` (allowing `warn`/`error`) raised to `error`. The `**/*.html`
   half was unnecessary; see the retraction in §1.
3. **Rotate the PrimeNG license key — open, and yours.** It is already in git history, so no edit
   un-commits it; it needs rotating at the vendor plus a decision on where the new one lives.
   Runtime config would contradict `runtime-config.ts`'s own "never add credentials" invariant,
   since that document is served to every browser. Left in place deliberately rather than moved
   from one committed file to another.
4. ~~Delete the credential `console.log`s; fix the `window.event` bug.~~ **Done.**
5. ~~Delete the dead code.~~ **Done** — `auth/api.ts`, three commented-out blocks in `auth/store.ts`,
   152 commented-out lines in `carts.page.ts`, `DashboardPage.apps`/`routeConfig`, five dead
   `imports:` entries in `auth.page.ts`, and the `Register`/`ForgotPassword` scaffolding (they were
   `<p>register works!</p>` — nothing to route). `auth.routes.ts` now lazy-loads `Login` instead of
   importing it eagerly, and redirects `/auth` → `/auth/login`.
6. ~~Add `nx format:check` to CI.~~ **Done**, with `nx format:write` run over the tree (43 files).

Six items. All mechanical. Without them, the first senior engineer who opens `auth/store.ts` sees
`console.log` of a password next to three abandoned approaches and discounts the entire thesis — and
they'd be making a reasonable inference. The credibility cost is wildly asymmetric to the effort.

### Then write the ADRs — enforcement first, stack second

The audit's conclusion was that ngfe-web's problem is **not** technology choice. If the ADR set leads
with SignalStore-vs-NgRx, it answers a question that wasn't asked.

**Tier 1 — enforcement. These are what the audit actually demands.**

| ADR | Decision                                                          | Backed by                                                                        |
| --- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 001 | Runtime configuration over build-time environments                | `libs/shared/runtime-config/` — proven                                           |
| 002 | Per-project `strict` + `strictTemplates`, no exceptions           | every `tsconfig.json` — proven                                                   |
| 003 | One import path per library; deep imports fail the build          | `enforce-module-boundaries` at `error` — proven, needs `scope:*` + fix `type:ui` |
| 004 | Every architectural invariant has a test that fails a build       | **Not proven.** Port `eager-bundle-boundary.spec.ts`                             |
| 005 | Lint gates are `error`, cover every file type, `--max-warnings 0` | **Not proven.** Item 2 above                                                     |

ADR-004 is the load-bearing one. It is the difference between a document describing an architecture and
an architecture. It is also the only Tier 1 ADR whose reference implementation lives in **ngfe-web**,
not dummy-lab — which is worth saying out loud when you present, because it costs you nothing and buys
you the room's trust.

**Tier 2 — stack. Defensible, and less urgent than they feel.**

SignalStore + `events` over classic NgRx; one HTTP client behind interceptors (kill `fetch()` — it
bypasses `authInterceptor` today); DTO → domain mapping; `data-access` / `util` / `ui` / `feature`
taxonomy; Nx `affected` CI.

**Not yet ADR-able:** SSR/SSG, multi-app deploy topology, error taxonomy, observability, a11y target,
design tokens. `PROVE-OUT.md` has these right as ❌ — an ADR on an unbuilt thing is a wish.

### On presenting this

`PRD.md` says, correctly, _"The workspace is not intended to become a production application. It is a
structured lab."_ `PROVE-OUT.md` §0 says, correctly, _"This workspace can prove the destination. It
structurally cannot prove the migration."_

You wrote both. You are not fooling yourself about the gaps — you've documented them more honestly than
most staff engineers would. The exposure is narrower than that: it's presenting a 22-component demo as
the target for a 1,193-file ordering platform without the enforcement layer wired, while the legacy
repo you're contrasting it against has the one enforcement mechanism the demo lacks. Fix the six
mechanical items, port the fitness function, lead with enforcement ADRs, and the argument is very hard
to attack.

---

_Analysis performed by executing `nx lint`, `nx run-many -t test`, `nx run dummy-lab:build`,
`eslint --print-config`, and lcov aggregation against `dummy-lab-workspace`, plus static verification
of `ngfe-web` @ `f37d8d7d1`. Every claim above is traceable to a file, a line, or a command's output._
