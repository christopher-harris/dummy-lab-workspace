# 🤖 ADR-0003 — Load environment configuration at runtime; promote one build artifact

|                |                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**     | Proposed — **for discussion, not for approval**                                                                                              |
| **Date**       | 2026-10-05                                                                                                                                   |
| **Deciders**   | Wingstop internal development leadership; Release engineering                                                                                |
| **Applies to** | `ngfe-web`                                                                                                                                   |
| **Prototype**  | A prototype workspace — runtime config + promoted artifact, measured — _link TBD_                                                            |
| **Blocked on** | A hosting decision for the configuration document. See [Acceptance criteria](#acceptance-criteria).                                          |
| **Revised**    | 2026-10-13 — amendment by ADR-0005 recorded; server-side configuration path documented                                                       |
| **Amended by** | [ADR-0005](./ADR-0005-application-topology-and-render-modes.md) — "promote one artifact" **does not hold for the prerendered marketing app** |
| **Relates to** | [ADR-0001](./ADR-0001-nx-multi-project-workspace.md) — the build-configuration count is a stated input to that migration                     |

> **Amendment, 2026-10-13.** ADR-0005 proposes a prerendered `marketing` application. Prerendered
> HTML contains content and configuration resolved at build time, so that artifact is
> environment-specific and is **built per environment, not promoted**. Everything below continues
> to hold for `ordering` and for every non-prerendered asset. Read Decisions 7–8 with that scope.

> **Purpose.** This document exists to put a mechanism on the record, and to price it honestly.
> The benefit is large and structural. The cost is small, real, measured, and paid on every cold
> page load — it is stated in the Consequences rather than buried. Read it as a proposal to argue
> with.

---

## Context

`ngfe-web` varies its behaviour per environment by **building a different artifact for each
environment**. Angular's `fileReplacements` swaps an `environment.ts` module for an
environment-specific sibling at compile time, so the API base URL, feature toggles and related
values are baked into the JavaScript bundle.

The consequence is arithmetic. There are **more than twenty build configurations and nearly as
many serve configurations**, each carrying its own `fileReplacements` block. The exact count is
beside the point; what matters is that it is far beyond what anyone can keep in their head, and it
only grows. Reducing it is named as the single largest lever on the cost of the workspace
migration, and it is a hard prerequisite on the restructuring phase that follows.

### What the mechanism actually costs

The problem is not the configuration values. It is that **the environment is a property of the
build**, which produces four structural effects:

| Effect                                               | Why it matters                                                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| The artifact tested is never the artifact shipped    | Stage and prod run different bytes. Every promotion is an untested build, however small the delta |
| Configuration changes require a rebuild and redeploy | Changing one URL means a full CI cycle, not a configuration change                                |
| Build configurations multiply combinatorially        | Every new environment, region or toggle multiplies against every existing one                     |
| The count itself becomes migration scope             | 20+ configurations must be understood and mapped before the workspace can be restructured         |

The fourth is why this ADR exists now rather than later. The build-configuration count is an
input to ADR-0001's migration plan, and the cheapest way to shrink it is to stop encoding the
environment in the build at all.

### What the prototype demonstrates

The prototype loads a small public JSON document **before Angular bootstraps**, validates it,
freezes it, and exposes it through a typed injection token. The application is built **once**.
The host serves a different configuration document per environment; the JavaScript is byte-identical
across all of them.

Concretely, in the prototype:

- One build produces one artifact. Three environments serve it.
- The deployment pipeline builds on the dev branch, records a checksum manifest of the output,
  and **promotion re-deploys that exact artifact** after verifying the checksums. Promotion never
  rebuilds.
- Both environments were confirmed serving the identical entry bundle filename, so the published
  performance numbers describe the same bytes production serves.
- Eleven domain libraries and the application consume the configuration through one token. None
  of them know where it came from.
- There are no `fileReplacements` blocks and no environment-named source modules anywhere in the
  workspace.

The mechanism is roughly this shape — illustrative, not a file reference:

```ts
// A provider the application composes once, at the composition root.
export function provideRuntimeConfig(): EnvironmentProviders {
  return makeEnvironmentProviders([
    RuntimeConfigLoader,
    {
      provide: RUNTIME_CONFIG,
      useFactory: (loader: RuntimeConfigLoader) => loader.config,
      deps: [RuntimeConfigLoader],
    },
    // Bootstrap does not proceed until this resolves.
    provideAppInitializer(() => inject(RuntimeConfigLoader).load()),
  ]);
}
```

```ts
// A consumer. It injects a value, not a mechanism.
withProps(() => ({
  apiBaseUrl: inject(RUNTIME_CONFIG).apiBaseUrl,
}));
```

## Decision

**Environment configuration is loaded at application start-up from a host-served document, not
compiled into the bundle. One build artifact is promoted unchanged across every environment.**

1. **No `fileReplacements`, and no environment-named source modules.** The environment is a
   property of the deployment, not of the build.
2. **Configuration is fetched and validated before bootstrap**, via an app initializer. Code that
   runs after bootstrap may assume configuration exists.
3. **Consumers inject a typed token, never a loader, a URL, or a global.** This is what makes the
   delivery mechanism replaceable later without touching domain code.
4. **The configuration document is public.** It is delivered to every browser that loads the
   application. It carries URLs and public toggles; **it never carries credentials, tokens, or
   secrets**, and the type that describes it says so.
5. **Validation happens twice and fails closed.** The host validates before serving; the client
   validates before freezing. A malformed or missing document **fails bootstrap with an explicit
   error screen** rather than silently falling back to a default — a wrong API base URL that boots
   is worse than an application that refuses to.
6. **The document is served uncached** (`Cache-Control: no-store`), so a configuration change takes
   effect on next load without a deploy.
7. **Promotion re-deploys a verified artifact; it never rebuilds.** The pipeline records a checksum
   manifest at build time and verifies it before deploying to the next environment.
8. **Build configurations are capped.** The target is three or fewer — development, production,
   and whatever one genuinely differs in compilation rather than configuration.

## Alternatives considered

**A. Keep `fileReplacements`; one build per environment.** The status quo. Rejected. It is the
mechanism producing the 27-configuration count, and it guarantees that the artifact under test is
never the artifact in production. Every argument for it is an argument for fewer environments, not
for this mechanism.

**B. Build-time variable substitution** — `define`, `envsubst`, or a bundler plugin injecting
values at compile time. Rejected. Cleaner to write than `fileReplacements`, and identical in the
only property that matters: the environment is still baked into the bytes, so there is still one
artifact per environment and still no promotion.

**C. Inline the configuration into `index.html` at deploy time.** **Deferred, not rejected.** This
is the strongest alternative and it removes the entire runtime cost recorded below — no extra
request, no serialised round trip. What it costs is the clean version of the claim: `index.html`
becomes environment-specific, so "promote the identical artifact" becomes "promote the identical
artifact except one file." That is a smaller guarantee and a more complicated pipeline. Worth
taking if the measured cost proves unacceptable; not worth taking pre-emptively.

**D. Inject configuration at the edge** (a Worker rewriting the HTML response). Deferred. Same
benefit as C without the deploy-time step, at the cost of binding configuration delivery to a
specific CDN's programmable layer. ADR-0005's segment personalization likely puts an edge layer in
front of `marketing` regardless; if it does, this becomes much cheaper to adopt there and should be
reconsidered at that point.

**E. Ship every environment's configuration in the bundle; select by hostname.** Rejected. It
publishes non-production URLs to every visitor and couples the application to its own DNS. One
artifact, but for the wrong reason.

## Consequences

**Gained**

- **The artifact under test is the artifact in production.** Promotion stops being a rebuild and
  becomes a verified copy.
- **The build-configuration count collapses**, which is a direct, measurable reduction in
  ADR-0001's migration scope.
- **Configuration changes stop requiring a deploy.** Changing a URL or a public toggle is a host
  configuration change that takes effect on next load.
- **Adding an environment costs a configuration document, not a build configuration.**
- **Configuration becomes typed and validated** at a single seam, instead of being a module whose
  shape is whatever the last person needed.

**Accepted costs**

- **Roughly 130 ms of uncacheable, serialised time on every cold load.** This is the honest price
  and it should not be glossed. In the measured desktop waterfall the initial chunks finish at
  211 ms, the configuration request runs 228 → 332 ms, and the first lazy route chunk does not
  begin until 340 ms. Because the document is deliberately uncached, this is paid on every cold
  load, and because the behaviour lives in the artifact, it is **identical in dev, stage and
  production**. Alternatives C and D remove it; neither has been taken.
- **The application cannot render without its configuration.** That is Decision 5 working as
  intended, but it converts a configuration-delivery outage into a hard application outage. The
  failure screen is the entire user experience in that case, and it deserves design attention
  rather than a developer-authored paragraph.
- **The configuration document is a public, unauthenticated endpoint.** Decision 4 is a standing
  discipline, not a one-time check — the pressure to add "just one" secret to a convenient
  document that already reaches every client will recur.
- **Prerendering needs its configuration at build time, and that bakes it in.** The browser
  loader resolves `/runtime-config.json` against the page URL, which does not exist during a
  static build. The prototype's server configuration therefore reads the **same document, in the
  same shape**, from the `RUNTIME_CONFIG_JSON` environment variable that the host's function
  serves to browsers — one contract, two transports. It throws when the variable is unset rather
  than defaulting, because a default would prerender against the wrong CMS and deploy looking
  healthy. The consequence is the amendment above: configuration resolved at build time is part
  of the artifact, which is exactly why a prerendered app cannot be promoted.
- **One more moving part at start-up.** A request that must succeed before anything renders is a
  new failure mode that did not exist when the values were compiled in.

## Enforcement

A decision with no failing build behind it is a preference. This ADR is implemented when:

| Mechanism                                                                    | Notes                                                                                                                             |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| A check failing the build if any `fileReplacements` block exists             | This is Decision 1. Without it the mechanism regrows one configuration at a time                                                  |
| A check failing the build if an environment-named source module is added     | Blocks the same pattern under a different spelling                                                                                |
| An assertion that build configurations number three or fewer                 | Makes Decision 8 a gate rather than an aspiration                                                                                 |
| A test asserting bootstrap **fails** on a missing or malformed document      | Otherwise Decision 5's fail-closed behaviour is unverified, and a silent fallback will be added the first time it is inconvenient |
| Host-side validation returning an error status rather than a bad document    | Two independent validators; neither is permitted to pass through unvalidated input                                                |
| A type-level or review rule keeping secrets out of the configuration shape   | The document is public. This is the control that keeps it safe to be public                                                       |
| Promotion verifying a checksum manifest before deploying                     | Makes "the same artifact" checkable rather than asserted                                                                          |
| No direct consumption of the loader or the document URL outside the provider | Preserves Decision 3, which is what makes alternatives C and D cheap to adopt later                                               |

## Acceptance criteria

This ADR stays at **Proposed** until all of the following exist:

1. **A hosting decision for the configuration document in `ngfe-web`'s environment.** The
   prototype serves it from a Pages Function; `ngfe-web` is hosted differently, and this is the
   one genuinely unanswered question. The mechanism is portable; the delivery is not.
2. A decision on whether the ~130 ms cold-load cost is accepted as-is, or whether alternative C
   is adopted at the same time.
3. An owner for the configuration schema and a process for changing it — adding a field touches
   the host, the type, and every environment's document simultaneously.
4. Sign-off from Wingstop internal development leadership.

## Open questions

Deliberately unresolved; each is a follow-on decision:

- **Is this the feature-flag mechanism, or only a bootstrap carrier?** The prototype exposes public
  toggles through the same document. That is adequate for values that change at deploy cadence and
  wrong for anything needing per-user targeting or a retirement lifecycle. A real flag decision is
  separate and should not be assumed solved by this one.
- **What is the per-environment document's source of truth?** A host environment variable is
  sufficient for a prototype. It is not obviously sufficient for a product with a release process.
- **Does the failure screen belong to the design system?** It renders before Angular exists, so it
  cannot use any component. That constraint has not been designed around, only worked around.
- **Does configuration need a version or schema field** so a stale cached document is detectable
  rather than merely invalid?

## Evidence

Measured on the prototype, 2026-10-01, Lighthouse 13.5.0, production-equivalent promoted artifact,
single runs:

| Observation                                             | Value        |
| ------------------------------------------------------- | ------------ |
| Initial chunks complete                                 | 211 ms       |
| Configuration request                                   | 228 → 332 ms |
| First lazy route chunk begins                           | 340 ms       |
| Serialised cost attributable to the configuration fetch | **~130 ms**  |

Both the dev and production environments were confirmed serving the identical entry bundle
filename, so these figures describe the same bytes production serves. Lighthouse performance on
that artifact was 95 desktop / 86 mobile; mobile is better described as "mid-to-high 80s" — two
runs four minutes apart on the identical bundle scored 89 and 86.

The prototype's configuration library carries unit tests covering parsing and normalisation,
URL resolution and cache behaviour, and failure on a non-success response — the last of which is
the test that holds Decision 5 in place.

Current counts can be taken against `ngfe-web` at any time; both ADR-0001 and this ADR state
"more than twenty" deliberately, because the argument does not depend on the exact number.

```
# Build and serve configuration counts, against ngfe-web:
node -e "const p=require('./angular.json').projects; const t=Object.values(p)[0].architect||Object.values(p)[0].targets; console.log('build', Object.keys(t.build.configurations||{}).length, 'serve', Object.keys(t.serve.configurations||{}).length)"

# Every fileReplacements block currently declared:
node -e "console.log(JSON.stringify(require('./angular.json')).split('fileReplacements').length-1)"
```
