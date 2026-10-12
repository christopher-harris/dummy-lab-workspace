# 🤖 ADR-0005 — Split the frontend into a prerendered marketing app and a client-rendered ordering app

|                |                                                                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**     | Proposed — **for discussion, not for approval**                                                                                                       |
| **Date**       | 2026-10-09                                                                                                                                            |
| **Deciders**   | Wingstop internal development leadership; Marketing; Release engineering                                                                              |
| **Applies to** | `ngfe-web`                                                                                                                                            |
| **Prototype**  | `dummy-lab` on `strapi-spike` — one app, prerendering proven end to end against Strapi. The split itself is **not** prototyped                       |
| **Blocked on** | PROVE-OUT **P1** (tags + `depConstraints` that fail a build). This ADR is unsafe to implement without it — see [Enforcement](#enforcement)             |
| **Amends**     | [ADR-0003](./ADR-0003-runtime-environment-configuration.md) — "promote one build artifact" **ceases to hold for the marketing app**. See Decision 4   |
| **Relates to** | [ADR-0001](./ADR-0001-nx-multi-project-workspace.md) (deploy topology), [ADR-0004](./ADR-0004-data-access-signalstore-structure.md) (store boundaries) |

> **Purpose.** Marketing needs server-rendered HTML for SEO. Ordering does not, and must not have
> it. Those two requirements pull the same build configuration in opposite directions on at least
> five separate knobs. This document proposes drawing a deploy boundary between them, and prices
> that honestly — including the ADR-0003 guarantee it gives up and the live defects it surfaces.
> Read it as a proposal to argue with.

---

## Context

### What forced this

A spike on 2026-10-09 added prerendering to `dummy-lab` to answer a question from product: how
does SEO work with Strapi. The mechanism works — details in [Evidence](#evidence). But making it
work surfaced a structural problem that is not about SEO at all.

**Prerendered HTML contains content fetched at build time.** The artifact is therefore specific to
the CMS it was built against. ADR-0003's central guarantee — build once, promote the identical
bytes through every environment — cannot survive that. Promoting a prerendered marketing page from
stage to prod ships stage's content to production.

Meanwhile the ordering app has the opposite requirement: it is behind authentication, nothing in it
is crawlable, and build-once-promote is exactly right for it.

### The knobs the two apps want set differently

Not a list of preferences. Each row is a single setting that cannot hold two values in one
`project.json`:

| Knob                      | Marketing                              | Ordering                          |
| ------------------------- | -------------------------------------- | --------------------------------- |
| `outputMode`              | `static` or `server`                   | unset — plain CSR                 |
| Artifact identity         | environment-specific (content baked in) | environment-neutral               |
| Promotion                 | impossible — rebuild per environment   | verified copy (ADR-0003)          |
| Build trigger             | code push **and** CMS webhook          | code push                         |
| Nx cache                  | must be bypassed on content change      | normal                            |
| Service worker            | harmful — caches past a content deploy  | valuable — offline, install       |
| CMS availability          | build-time dependency                   | none                              |

The service-worker row is worth reading twice. A PWA shell cache sits in front of the CDN and
serves a returning visitor yesterday's prerendered HTML *after* a webhook rebuild has already
deployed today's. The content is correct at the origin, correct in `curl`, and wrong in the
browser — for returning visitors only. That is a hard failure to diagnose and a direct conflict
with the freshness mechanism marketing exists to have.

### What is not forcing this

**Rendering is not the reason to split.** Angular expresses render mode per route family within a
single application, and the spike proved it: `''` and `**` prerender, every authenticated route is
`RenderMode.Client`, in one app. A blog does not need its own app either — freshness is a
per-route concern (`RenderMode.Server` on an index, `Prerender` on posts), and splitting it off
would duplicate the SEO head logic, block registry, sitemap, redirect table and CMS client.

The reason to split is **deploy mechanics**. If the two apps shared those, one app with a
render-mode table would be the better answer.

---

## Decision

**Two applications. `marketing` renders on the server; `ordering` renders in the browser. They
share libraries, an origin, and a session — and nothing else.**

1. **Two apps, not three or four.** `marketing` and `ordering`. A blog is a route family inside
   `marketing`, not a third app. Revisit only if a route family needs a different *availability
   guarantee*, which is a different argument from a different cadence.

2. **Render mode is declared per route family** in an `app.routes.server.ts` table, not inferred.
   Authenticated and personalised routes are `RenderMode.Client` — this is the correct answer, not
   a concession. Server-rendering them would put session tokens in the render path to produce
   output that must never be cached.

3. **`marketing` resolves CMS content at build time, driven by the CMS.** No route list is
   hardcoded; `getPrerenderParams()` asks Strapi which pages are published. Publishing a page and
   rebuilding is the entire workflow for adding a URL.

4. **ADR-0003 is amended, not revoked.** "Promote one artifact" continues to hold for `ordering`
   and for every non-prerendered asset. It **does not hold for `marketing`**, which builds per
   environment. This is a real reduction in that ADR's guarantee and must be recorded as one
   rather than quietly dropped.

5. **A content change is a build.** The pipeline is a Strapi webhook per relevant content type —
   `page`, `nutrition-item`, `redirect`, and any future content collection — triggering a deploy.
   Wiring only `page` is a silent failure mode: new nutrition rows never appear on a site that
   looks healthy.

6. **Content-triggered builds bypass the Nx cache.** A CMS publish changes no input Nx can observe,
   so a cached build redeploys stale HTML. See [Enforcement](#enforcement).

7. **One origin, path-based routing.** Everything under `wingstop.com`. Not subdomains —
   `localStorage` is keyed by origin, and a split across subdomains converts session sharing from
   free into a cookie-domain problem.

8. **Auth is a library pair, not an app.** `data-access/auth` owns state and the API;
   `auth/feature` owns components and guards and is the only thing both apps import. There is no
   shell application. An Angular application is a deployable bundle, not a service: a third app
   could not be asked anything at runtime without runtime composition, which is explicitly out of
   scope (Alternative D).

9. **Shared chrome is `shared/ui/layout`** — navbar, footer, shell layout. It never imports
   `data-access`. Auth-aware chrome is composed in `auth/feature`, not pushed down into `ui`.

10. **`marketing` renders logged-out and hydrates to logged-in.** Prerendered HTML is shared by
    every visitor and cached at a CDN, so no user state may be baked into it. Auth-dependent markup
    renders after hydration, never on the server.

11. **A service worker ships in `ordering` only.** Offline order composition and install-to-home
    are real value there. In `marketing` a shell cache contradicts Decision 5.

12. **Browser-only libraries are tagged and fenced out of the server graph.** A `platform:*` axis
    with a `depConstraints` rule. This is Decision 12 because it is what makes Decisions 1–11 safe;
    see [Enforcement](#enforcement).

---

## Alternatives considered

**A. One app, per-route render modes.** What the spike actually built, and the strongest
alternative. Rejected **only** because it cannot express two deploy mechanics: one `project.json`
has one `outputMode`, one cache policy, one promotion story and one service-worker decision. If
marketing's artifact were environment-neutral this would be the right answer and this ADR would
not exist.

**B. Three or more apps — `marketing`, `blog`, `ordering`.** Rejected. Blog and marketing differ in
content freshness, which is a per-route setting, not in deploy mechanics. Splitting duplicates the
SEO head logic, block registry, sitemap generation, redirect handling and CMS client, and then
requires keeping two copies aligned. Reconsider if blog needs a different availability guarantee
than marketing — not merely a faster cadence.

**C. A "shell" app that owns auth and is asked by the others.** Rejected because it does not
resolve to anything buildable. An Nx Angular app is a bundle that boots in a browser; it has no
API surface for another app to call. The idea collapses into a backend service (already exists), a
shared library (Decision 8), or runtime composition (Alternative D).

**D. Module Federation / micro-frontends.** Rejected. Federation plus SSR plus prerendering in
Angular is a genuinely difficult combination, and the team is small. Two apps on one origin need a
consistent URL space, which edge routing provides; they do not need runtime composition.
Cross-app navigation as a full page load is acceptable because marketing → ordering is a mode
switch users already expect.

**E. Separate subdomains** (`www.` / `order.`). Rejected. Breaks `localStorage` session sharing for
no benefit, and converts Decision 7 from free into cookie-domain configuration.

**F. Keep everything CSR; use a third-party prerender/dynamic-rendering service.** Rejected. Adds a
vendor in the request path, serves crawlers different bytes than users, carries its own staleness
problem, and leaves social unfurl bots — which never execute JS — dependent on that vendor's
coverage. Angular renders this itself at build time for no marginal cost.

**G. Prerender `marketing` into the same artifact as `ordering`** and route at the edge. Rejected.
It makes the combined artifact environment-specific, so ADR-0003's guarantee is lost for
`ordering` too — paying the cost twice to avoid drawing the boundary once.

---

## Consequences

**Gained**

- **Crawlers and unfurl bots receive complete HTML.** Title, description and Open Graph tags come
  from Strapi and are present in the served document. Measured: see Evidence.
- **Marketing and product control SEO metadata without a developer.** `shared.seo` is required on
  every `Page`, so a page cannot ship without it.
- **Adding a URL is a publish, not a deploy of new code.** The route list is a CMS query.
- **`ordering` keeps ADR-0003 intact** — build once, promote verified bytes.
- **Blast radius becomes a lint rule.** A `scope:marketing` → cart/checkout import can fail the
  build, which is Epic 22's exit gate, currently unreachable.
- **The two apps can have opposite answers** on service workers, budgets, cache policy and CMS
  coupling without arguing about a shared file.

**Accepted costs**

- **ADR-0003's guarantee is reduced.** Marketing builds per environment. The artifact under test is
  no longer bit-identical to the artifact in production for that app. This is the single largest
  cost in this document and it is a deliberate trade, not an oversight.
- **CMS availability becomes build availability.** A Strapi outage does not take the site down —
  prerendered HTML keeps serving, which is the posture PROVE-OUT P24 wants — but it does block
  deploys, including unrelated code deploys. That coupling is new.
- **Content latency equals build time.** "Published" and "live" are different moments. No ISR
  escape hatch exists in Angular; a scheduled publish needs a scheduled build (P23).
- **Two CI pipelines, two budget sets, two PrimeNG configurations** unless `shared/ui` genuinely
  owns the latter. Design drift between the apps is now possible and must be actively prevented.
- **The persisted auth shape becomes a versioned contract between independently deployed
  artifacts.** Today one deploy means one reader and one writer. After the split, `marketing` can
  run the old serialisation while `ordering` runs the new one, for as long as sits between two
  deploys — an interval nobody controls. `libs/data-access/auth/src/lib/store.ts` currently
  persists with no schema check and no version key, and its own comment says so.
- **Cross-tab session divergence becomes routine.** Covered below; it is a live defect today, and
  the split raises its frequency rather than creating it.
- **Hydration costs ~7 kB gzipped** on the initial bundle, and tripped an existing budget.
- **Interactivity does not improve, only paint.** Angular emits no route-specific `modulepreload`
  for prerendered pages, so hydration still discovers and fetches the route chunk at runtime.
- **Cross-app navigation is a full page load**, losing in-memory state. Acceptable between modes;
  it would not be acceptable within one.

**Surfaced, pre-existing, and not caused by this decision**

- **Cross-tab session resurrection.** `withStorageSync` reads storage once at init, writes the
  whole state on every change, and the library contains zero `storage` listeners and zero
  `BroadcastChannel` usage. A tab that was logged in when another tab logged out will, on its next
  state change, write its stale state back and restore the session. This is a defect in shipping
  code today with a single app and two tabs.
- **A browser global in a library kills the entire server build.** Proven, not theorised: see
  Evidence.

---

## Enforcement

A decision with no failing build behind it is a preference.

| Mechanism                                                                                         | Notes                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`platform:browser-only` / `platform:universal` tags with a `depConstraints` rule**              | **The load-bearing control.** Without it, any import of a `localStorage`/`navigator` lib into marketing's graph breaks the build with no obvious cause. PROVE-OUT P1 |
| A `scope:marketing` → cart / checkout / auth-state import failing lint                            | Epic 22's exit gate, made executable                                                                                                                           |
| A test asserting `app.routes.ts` and `app.routes.server.ts` describe the same route set           | An omitted route silently falls into the CMS wildcard and the build tries to prerender it as a Strapi page                                                     |
| The build failing when the prerender manifest is empty or the CMS is unreachable                  | Implemented. A soft failure deploys a site with no marketing pages, green, with no warning                                                                     |
| Content-triggered builds running with the Nx cache bypassed                                       | A CMS publish changes no Nx-visible input. Without this, the webhook appears not to work                                                                       |
| Webhooks registered on **every** content type the site renders, asserted in review               | `page` alone is the trap: new `nutrition-item` rows never appear                                                                                               |
| A schema version key on the persisted auth shape, with a rejecting read path                      | Decision 8's contract. Required **before** the split, not after                                                                                                |
| A cross-tab listener (`storage` event or `BroadcastChannel`) in `data-access/auth`                | Fixes the live defect; the split makes it load-bearing                                                                                                         |
| A check that no service worker is registered in `marketing`                                       | Decision 11. A PWA added "for consistency" silently breaks Decision 5                                                                                          |
| A test asserting prerendered HTML contains no user-specific content                               | Decision 10. The failure mode is one visitor's state served to everyone from a CDN                                                                             |

---

## Acceptance criteria

This ADR stays at **Proposed** until all of the following exist:

1. **PROVE-OUT P1 is complete** — `platform:*` tags and a `depConstraints` rule, with a committed
   negative test proving a violating import fails the build. This ADR should not be implemented
   first; the tags are what make the split safe.
2. **A decision on the session carrier** — `localStorage` on a shared origin, or an httpOnly cookie
   issued by the backend. Decision 7 works with either; the security properties differ materially.
3. **A version key and validated read path on the persisted auth shape**, landed before the split.
4. **A content-triggered build pipeline** demonstrated end to end: publish in Strapi → webhook →
   cache-bypassed build → deploy → changed content served. With a measured latency figure, because
   that number is what product will ask for.
5. **A blog content model decision** — `Post` as its own content type versus `Page` rows — since it
   determines whether Decision 1's "blog is a route family" holds.
6. **An owner for `shared/ui/layout`** and a rule preventing per-app design divergence.
7. Sign-off from Wingstop internal development leadership and Marketing.

---

## Open questions

Deliberately unresolved; each is a follow-on decision:

- **Does `marketing` need a runtime at all?** `outputMode: 'static'` needs none, which is a real
  availability win (P24). A blog index or a personalised hero needs `'server'`. That choice
  determines whether marketing is pure CDN or an edge application, and it is not made here.
- **Where do redirects execute?** The `Redirect` content type exists and nothing consumes it. A
  client-side router redirect passes no link equity and is invisible to a crawler. Build-time
  `_redirects` generation and an edge function are both viable; neither is chosen.
- **What is the real cardinality of hero personalisation?** Still P20's blocking question, now also
  the input that decides whether `/` can prerender at all.
- **Does `marketing` ever need to know who the user is?** Decision 10 permits it post-hydration. If
  the answer is no, the auth dependency disappears from marketing's graph entirely and Decision 12
  gets considerably easier to enforce.
- **Who owns the Strapi webhook configuration?** It is deploy-pipeline behaviour configured in a
  CMS admin UI, by people who do not think of themselves as owning deploys.
- **At what page count does full-site rebuild-per-publish stop being acceptable?** Linear today and
  trivially fast at current scale. The answer determines when `RenderMode.Server` with an edge
  cache becomes necessary.

---

## Evidence

Measured in `dummy-lab` on `strapi-spike`, 2026-10-09, Angular 22.1.8 / `@angular/ssr` 22.1.9,
`outputMode: 'static'`, against a local Strapi with one published page.

**Prerendering produces crawler-visible metadata from the CMS:**

| Observation                                | Value                                                    |
| ------------------------------------------ | -------------------------------------------------------- |
| Routes prerendered                         | 2 (`/`, `/nutrition`) — neither named in application code |
| `<title>` in `nutrition/index.html`        | `Nutrition`, from Strapi `seo.metaTitle`                  |
| `description`, `og:title`, `og:description` | present, from Strapi                                      |
| `og:image`                                 | absent — correct; `seo.ogImage` is null                   |
| `robots`                                   | `noindex` — correct; `seo.noindex` is `true` in content   |
| Table rows in served HTML                  | 103 `<tr>`, real `<table>` markup                         |
| Transfer cache (`ng-state`)                | 54.7 kB, so hydration does not re-fetch                   |

The nutrition rows resolve through a two-hop waterfall — page fetch, then an `effect`-dispatched
second fetch for the `nutrition-item` collection — and **both complete before serialisation**.
This was the open question going in; Angular's stability wait covers it.

**Cost, measured both ways:**

| Metric                     | Before   | After     | Delta         |
| -------------------------- | -------- | --------- | ------------- |
| Initial JS, raw            | 983.45 kB | 1.01 MB   | +~23 kB       |
| Initial JS, gzip           | 217.64 kB | 224.63 kB | **+7 kB**     |
| Document, gzip (`/nutrition`) | 4.96 kB (CSR shell) | 37.46 kB | **+32.5 kB** |
| Strapi round trips before content | 2 serial | 0   | −2            |
| Lazy chunks                | 397      | 397       | unchanged     |
| `modulepreload` hints      | 9        | 9         | **unchanged** |

The budget consequence is concrete: the existing `initial` error budget of 1 MB passed at 983 kB
and failed at 1.01 MB. It was raised to 1.1 mb in the spike — that is a decision to confirm, not a
settled fact. Separately the 500 kB *warning* threshold is exceeded by 483 kB and was before this
work, so budget warnings currently carry no signal.

The identical `modulepreload` count is the honest disappointment: Angular emits the same nine
initial-bundle hints for a prerendered route as for the CSR shell, and none for the route's own
lazy chunks. Content paints from HTML immediately; **time to interactive is not improved.**

**A browser global in one library breaks the whole server build:**

```
✘ [ERROR] An error occurred while extracting routes.
ReferenceError: localStorage is not defined
    at async extractRoutes (.../routes-extractor-worker.js)
```

Raised by `libs/data-access/auth`, during **route extraction** — before any route rendered, and
on an application where no authenticated route was server-rendered at all. The cause is narrow and
non-obvious: `withStorageSync` is SSR-safe at runtime (it stubs via `PLATFORM_ID`), but resolving
its default strategy evaluates `config.storage() === localStorage` at **module load**. Passing
`withLocalStorage()` explicitly — as `theme` and `session-cart` already did — avoids it entirely.

This is the concrete argument for Decision 12. One library, no related route, entire build dead.

**Cross-tab synchronisation is absent from the storage library**, across every strategy including
IndexedDB:

```
BroadcastChannel    0
addEventListener    0
onversionchange     0
setInterval         0
```

Reproduce the prerender result:

```bash
export RUNTIME_CONFIG_JSON="$(cat apps/dummy-lab/public/runtime-config.json)"
npm exec nx -- build dummy-lab --skip-nx-cache
grep -oE "<title>[^<]*</title>" dist/apps/dummy-lab/browser/nutrition/index.html
grep -c "<tr" dist/apps/dummy-lab/browser/nutrition/index.html
```

> **Scope limit, stated deliberately.** This evidence proves that crawlers receive correct HTML
> containing marketing-controlled metadata. It does **not** prove an SEO outcome. There is no
> Search Console data, no organic baseline and no crawl statistics behind any claim here, and none
> is obtainable from a sandbox. Describe the mechanism; do not assert the ranking.
>
> **The split itself is unprototyped.** Every measurement above comes from a single application
> with a render-mode table. Two apps, the shared-library boundary, the auth contract across
> deploys and the webhook pipeline are all designed and none are built.
