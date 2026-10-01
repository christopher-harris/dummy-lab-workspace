# 🤖 ADR-0001 — Adopt Nx as a multi-project workspace

|                |                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------- |
| **Status**     | Proposed — **for discussion, not for approval**                                           |
| **Date**       | 2026-09-28                                                                                |
| **Deciders**   | Wingstop internal development leadership                                                  |
| **Applies to** | `ngfe-web`                                                                                |
| **Prototype**  | A working multi-project workspace of this shape — _link TBD_                              |
| **Blocked on** | A separate migration plan (in progress). See [Acceptance criteria](#acceptance-criteria). |
| **Supersedes** | Nothing. This is the first recorded architectural decision for `ngfe-web`.                |

> **Purpose.** This document exists to start a conversation about the target architecture, and to
> put the current structural problems on the record in numbers rather than impressions. It is
> deliberately not approval-ready: the migration sequencing, the final domain list, and several
> boundary questions are open by design and are listed at the end. Read it as a proposal to argue
> with.

---

## Context

`ngfe-web` is a single-project Angular CLI workspace. `angular.json` declares exactly one
project, `factories` (the Angular project name for the web app), carrying **28 build
configurations**, and that one project contains **1,457 TypeScript files** — 1,230 of them under
`src/app/lib/ngfe-app`.

The codebase has a real, deliberate architecture in mind. `src/app/lib/ngfe-app` is meant to be
the product library, internally split into `ecomm/` (ordering, accounts, rewards business logic)
and `ui/` (the shared design system). `src/app` is meant to be a thin shell that lazy-loads
features. `public-api.ts` is meant to be the single seam between them. Fifteen `tsconfig` `paths`
aliases exist to express it.

**None of that intent is represented anywhere a tool can check, and much of it has eroded.**

| Intent                              | Measured reality                                                                                                                                                                                                                                                            |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ngfe-app` is a library             | Not one: no `ng-package.json`, absent from `angular.json` `projects`, and a `tsconfig.lib.json` nothing reads                                                                                                                                                               |
| `public-api.ts` is the seam         | Serves **8%** of shell→lib imports. **81%** reach into internals; 20 go straight into component files                                                                                                                                                                       |
| `ui` is a leaf the features consume | `ui` ↔ `ecomm` is bidirectional — 19 wrong-way imports, plus one true lib→shell cycle                                                                                                                                                                                      |
| Features are lazy-loaded            | **8 of 21** `loadChildren` imports name the same `public-api` barrel. One static import of that barrel from `main.ts` pulled every feature area into the initial download: **0 lazy chunks emitted from the product library**, `main.js` 9.98 MB raw / **1.36 MB transfer** |
| Code is linted                      | ESLint is scoped to `src/app/lib/ngfe-app/src/lib/**`. **192 non-spec files are outside that scope**, including `main.ts`                                                                                                                                                   |
| Components stay small               | `choose-location.component.ts` is **2,061 lines**, 81 methods, 25 injected dependencies                                                                                                                                                                                     |

### The same domains are sliced three different ways

Inside the product library, one domain concept has no single home. It is split across three
parallel trees, each organised on a different axis:

| Tree                    | Organised by | Count |
| ----------------------- | ------------ | ----- |
| `ecomm/repositories/`   | API resource | 27    |
| `ecomm/store/features/` | state slice  | 23    |
| `ui/`                   | screen area  | 12    |

`order`, `cart`, `customer`, `rewards`, `challenges` and `flavors` each appear in all three. So
"the ordering domain" is a repository here, a state feature there, and a screen folder somewhere
else, with nothing declaring that the three belong together and nothing noticing when they drift
apart. Business logic is layer-sliced, UI is feature-sliced, and neither is domain-sliced.

### Why convention has not held

Two properties of a single-project workspace work against the intended architecture:

1. **There is no unit of code smaller than the whole repo.** No boundary can be declared, so no
   boundary can be enforced mechanically. A path alias is a convenience, not a constraint — this
   repo has had 15 of them the entire time and 81% of its cross-boundary imports bypass the seam
   anyway. The only thing standing between the intended architecture and any given import is a
   reviewer noticing, on every pull request, indefinitely.
2. **Nothing can compute what a change affects.** Every change lints, tests and builds
   everything, because the toolchain holds no dependency information to narrow with.

Discipline _can_ enforce boundaries. The argument here is narrower: in this repo, over this
timeframe, it has proven unreliable and expensive, and the numbers above are the cost. The 2026-08
audit scored the repo 4.3/10 across ten dimensions and named one cross-cutting cause — _"the
quality gates exist, are well-chosen, and are pointed at the wrong files or wired up inert."_ That
is a symptom. Gates get pointed at the wrong files because there is no structure to point them at,
and a hand-maintained list of globs is the only alternative on offer.

### What a multi-project shape changes

A prototype workspace was built on the same Angular major and a comparable feature surface — an
application plus one library per domain, each with a controlled public API and declared dependency
rules — specifically to test whether the structure changes these outcomes rather than relocating
them. Measured:

|                                       | Single-project workspace    | Multi-project workspace |
| ------------------------------------- | --------------------------- | ----------------------- |
| Units of code the toolchain can see   | 1                           | 15                      |
| Declarable dependency rules           | none possible               | enforced at `error`     |
| Change-scoped CI                      | no — everything, every time | yes                     |
| Public API surfaces per domain        | one barrel for all of them  | one per library         |
| Lazy chunks emitted from product code | 0                           | 24                      |
| Initial bundle, transfer              | 1.36 MB                     | 196 kB                  |

The outcomes that matter are not the better numbers; they are the different _kind_ of guarantee. A
forbidden import fails a build instead of a review, and no single convenience import can
re-collapse the lazy routes, because there is no whole-app barrel available to import.

## Decision

**Adopt Nx as a multi-project workspace, and make the dependency graph the source of truth for
architecture.**

1. **Every unit of code is an Nx project** with its own `project.json` and `tags`.
2. **Each library exposes a controlled public API.** `src/index.ts` is the default and expected
   form; Nx secondary entry points are permitted where a library genuinely needs more than one
   surface. The invariant is that consumers import only from a declared entry point — deep imports
   into a library's internals are blocked.
3. **Applications are composition roots.** An app owns routing, layout, pages, and components used
   by exactly one page. Domain behaviour does not live in an app.
4. **Shared UI lives in libraries, not in an app.** A presentational component reused across pages
   belongs in a `ui-*` library with no domain dependencies. A reusable domain-bound unit — a smart
   component a second surface needs — belongs in a `feature-*` library.
5. **Domain data and state live in one `data-access` library per domain**, each owning that
   domain's API surface, models and state. This is the only library tier being decided now; see
   Open questions.
6. **Dependency direction is declared, not assumed.** Every project carries `type:*` and `scope:*`
   tags, and `@nx/enforce-module-boundaries` enforces the allowed edges at `error`.
7. **CI runs `nx affected`.** A change to one domain lints, tests and builds that domain and its
   dependents, not the world.
8. **Nx and Angular migrations are reviewed, not accepted.** Generated migration output is a
   proposal, not a result. See Consequences.

### Target structure

Illustrative, using domain names already visible in the codebase. The final domain list is an
output of the migration plan, not of this ADR.

```
apps/
  ngfe-web/                          # the composition root — tags: type:app
    src/app/
      app.routes.ts                  # lazy routes into pages
      layout/                        # navbar, footer, shell
      pages/
        ordering/                    # page components + page-local children
        accounts/
        rewards/
        locations/
        menu/

libs/
  data-access/                       # tags: type:data-access, scope:<domain>
    ordering/                        # @wingstop/data-access-ordering
    accounts/
    rewards/
    locations/
    menu/
    offers/
  ui/                                # tags: type:ui, scope:shared — leaf, no domain deps
    components/                      # @wingstop/ui-components
    forms/
  feature/                           # tags: type:feature — shared domain-bound UI, as needed
    location-picker/                 # @wingstop/feature-location-picker
  shared/                            # tags: type:util, scope:shared — ambient concerns only
    runtime-config/
    utils/
```

**Where does a new feature go?** A screen goes in `apps/ngfe-web/src/app/pages/<domain>/`. The
data and state it needs go in `libs/data-access/<domain>/`. If a component it needs is
presentational and a second page will want it, it goes in `libs/ui/`. If it is domain-bound and a
second page will want it, it goes in `libs/feature/`. If only one page will ever use it, it stays
next to that page.

Allowed dependency edges:

```
app         → data-access, feature, ui, util
feature     → data-access, ui, util
data-access → data-access (see Open questions), util
ui          → util
util        → util
```

## Alternatives considered

**A. Stay on a single-project workspace; enforce the architecture by convention and code review.**
This is the current approach, and the Context table is its scorecard: a documented barrel
convention, 15 path aliases, and 81% of cross-boundary imports bypassing the seam. Rejected
because there is no reason to expect a different result from the same mechanism on the same team
under the same delivery pressure.

**B. An Angular CLI multi-project workspace** — several entries under `angular.json` `projects`,
wired together with `tsconfig` `paths`.
Rejected, and this is the closest honest alternative. It does give separate build targets and real
module separation. What it does not give is a dependency **graph**: no tag constraints, no
change-scoped CI, no task caching, and no generator story for adding the next domain consistently.
The decisive gap is enforcement — Angular CLI has no equivalent of `enforce-module-boundaries`, so
boundary violations remain review comments rather than build failures, which is the failure mode
being replaced.

**C. Extract `ngfe-app` as a real published library** (`ng-packagr`, versioned, consumed from a
registry).
Rejected. This was clearly the original intent — the dead `tsconfig.lib.json` is the fossil. But
it buys the wrong thing: publish and version overhead plus cross-repo pull requests for code that
ships as one product on one cadence, and it does nothing about the internal `ui` ↔ `ecomm` cycle,
which is where the real coupling lives. Library boundaries inside one repo, enforced at build
time, give the isolation without the release ceremony.

**D. One Nx application per domain behind a shell.**
Rejected. Nx applications are not composable — an app has no path entry and importing one is
blocked by `enforce-module-boundaries` — so this resolves to micro-frontends: all of the cost,
none of the benefit, absent independently deploying teams. (An app split that _would_ pay for this
product is by delivery characteristic — marketing pages versus the ordering SPA — but that is a
separate decision and is out of scope here.)

**E. A `feature` library per domain, with all UI in libraries and the app reduced to a router**
(the domain-driven layout popularised by Manfred Steyer's Angular architecture work).
**Deferred, not rejected.** It wins on team ownership and long-term erosion resistance, and costs
ceremony plus indirection for cross-domain screens, of which this product has several — a
dashboard, search, settings. At current team size, Decision 3's composition-root shape is the
better trade, with Decision 4 taking the genuinely shared UI out of the app anyway. Revisit if
domain teams become independently staffed. The cost of this choice is recorded below.

## Consequences

**Gained**

- Import boundaries become build failures instead of review comments. The `ui` ↔ `ecomm` cycle and
  the 81% barrel bypass become expressible, and therefore fixable and then permanent.
- A domain gets one home. The three parallel slicings collapse into one library per domain.
- Code splitting becomes a property of the structure rather than of reviewer vigilance.
- CI time scales with change size instead of repo size.
- Lint and test coverage stop being a hand-maintained glob. Each project carries its own targets,
  so a project that is _missing_ one is visible in the graph, rather than files being invisible
  inside a path list. (This makes omissions detectable, not impossible — see Open questions.)
- One import path per domain, so "where does this come from" has exactly one answer.
- Task caching, local and remote.

**Accepted costs**

- **The destination is proven; the migration is not.** A greenfield prototype is generated, not
  migrated, so it cannot demonstrate that all 28 build configurations survive `nx init`, that the
  legacy persisted-state read path stays backward-compatible, that the legacy `redux` store can
  coexist during the transition, or that a utility-CSS layer can be introduced alongside
  globally-loaded Bootstrap 4. Each needs a spike on this repo. **This ADR records a destination.
  It is not a migration plan and must not be cited as de-risking one.**
- **Slicing 1,230 files into domain libraries is the bulk of the work**, and the seams are
  currently wrong in known ways — a bidirectional `ui` ↔ `ecomm` edge, a lib→shell cycle, and
  cross-feature barrel imports inside `lib/`. Expect the first extractions to surface more.
- **Migrations become a standing review obligation.** Three failure modes to guard against, each
  of which produces a green build:
  - Angular's v22 `ng update` adds an explicit `ChangeDetectionStrategy.Eager` to every existing
    component to preserve the pre-v22 implicit default. Accepted unreviewed, this opts an entire
    codebase out of the framework's new OnPush default while appearing to change nothing.
  - A generated migration can disable the very lint rule that would have flagged its own change,
    on the reasonable-sounding grounds that the rule "was not previously enforced."
  - Tooling migrations update declared versions in configuration while leaving a separately
    installed copy, or a base `tsconfig`, behind — and the drift surfaces only on a code path CI
    does not exercise.
- **Decision 3 has a known, structural gap.** With pages in the application, the app is a single
  node in the graph, so Nx tags cannot express "the ordering page may not import the rewards
  domain's state." Any cross-domain screen will reach into several domains directly and nothing in
  Nx will object. Nx is the wrong tool for intra-app rules; folder-level enforcement scoped inside
  the application project is the intended mitigation, and adopting it is a follow-on decision.

## Enforcement

A decision with no failing build behind it is a preference. This ADR is implemented when all of
the following hold:

| Mechanism                                                                                                      | Notes                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `project.json` with `type:*` / `scope:*` tags on every project                                                 | The tags are the architecture; nothing else declares it                                                                                                                                                                                                                                                                                                                            |
| `@nx/enforce-module-boundaries` at severity `error`, with the edge table above as `depConstraints`             | Warnings do not change behaviour. This is the rule that makes the barrel bypass impossible                                                                                                                                                                                                                                                                                         |
| A controlled public API per library; deep imports rejected                                                     | Removes the whole-app barrel that defeated lazy loading                                                                                                                                                                                                                                                                                                                            |
| `nx affected -t lint test build` in CI, with explicit base/head selection, plus a scheduled full-workspace run | `affected` is only as trustworthy as its base commit; the periodic full run catches projects that drop out of the graph                                                                                                                                                                                                                                                            |
| Lint findings are errors with `maxWarnings: 0`, per project                                                    | Replaces one repo-wide glob with per-project targets                                                                                                                                                                                                                                                                                                                               |
| An architecture fitness test asserting no whole-app barrel is statically reachable from the entry point        | **Carry the existing one forward.** `src/app/architecture/eager-bundle-boundary.spec.ts` and `eager-import-graph.ts` (from ticket WINGD-13582) are a static import-graph walker with a measured ceiling and an explanatory failure message. They exist precisely because a single-project workspace cannot state the invariant in config. Do not discard them during the migration |
| A negative test proving a forbidden import fails a build                                                       | Otherwise the enforcement itself is unverified                                                                                                                                                                                                                                                                                                                                     |

## Acceptance criteria

This ADR stays at **Proposed** until all of the following exist:

1. A migration plan covering extraction order, the first domain to extract, how the 28 build
   configurations map onto the new projects, how temporary boundary violations are handled and
   tracked, and a defined stopping point if early extraction reveals worse coupling than expected.
   _(In progress.)_
2. An owner for the dependency taxonomy — who decides what `type:*` and `scope:*` values exist and
   approves new ones.
3. Resolution of the Open questions below, or an explicit decision to defer each.
4. Sign-off from Wingstop internal development leadership.

## Open questions

Deliberately unresolved; each is a follow-on decision:

- **Domain-to-domain rules.** May a `data-access` library import another, or must cross-domain
  composition happen in the app or a `feature` library? This determines whether the graph is
  layered or flat, and it is the single most consequential remaining question.
- **The domain list.** The target structure above is illustrative. The real list comes out of the
  migration plan.
- **Library granularity beyond `data-access`.** When a `ui-*` or `feature-*` library is warranted
  versus keeping a component next to its page.
- **Intra-app enforcement.** Which tool polices import rules _inside_ the application project,
  given Nx cannot.
- **Guarding against silent coverage loss.** Per-project targets make a missing target visible in
  the graph, but do not by themselves prevent a project from being generated without one. Whether
  a graph-level check is warranted.

## Evidence

Reproducible against `ngfe-web` at `f37d8d7d1`:

```
node -e "console.log(Object.keys(require('./angular.json').projects))"     # ["factories"]
find src -name '*.ts' | wc -l                                             # 1457
find src/app/lib/ngfe-app -name '*.ts' | wc -l                            # 1230
find src/app/lib -name 'ng-package.json' | wc -l                          # 0
grep -c 'loadChildren' src/app/app.routes.ts                              # 21
grep -c 'src/public-api' src/app/app.routes.ts                            # 8
find src -name '*.ts' | grep -v 'lib/ngfe-app/src/lib/' | grep -cv spec   # 192
wc -l < "$(find src -name choose-location.component.ts)"                  # 2061
ls src/app/lib/ngfe-app/src/lib/ecomm/repositories | wc -l                # 27
ls src/app/lib/ngfe-app/src/lib/ecomm/store/features | wc -l              # 23
ls src/app/lib/ngfe-app/src/lib/ui | grep -v index.ts | wc -l             # 12
```

Import-graph percentages, the `ui` ↔ `ecomm` edge count and the bundle figures are the measured
numbers in `initial-audit/` (2026-08-25). That audit predates WINGD-13582, which has since reduced
the eager import graph; the structural cause it identified is unchanged. Multi-project figures were
measured on the prototype workspace in September 2026.

> **Note on current tooling.** `nx`, `@nx/angular` and `@nx/workspace` are already installed at
> `23.2.1`, with an `nx.json` configuring `targetDefaults` and `namedInputs`. That plumbing
> provides local task caching over the single project and nothing else — no graph, no tags, no
> change-scoped CI, and `"neverConnectToCloud": true`. It neither pre-decides this ADR nor reduces
> its scope, but adoption starts from installed dependencies rather than from zero.
