# 🤖 Architecture decision records — the target for `ngfe-web`

These ADRs describe **where `ngfe-web` is going**, proven in this prototype workspace. They are
all **Proposed**: they stay that way until discussed with the team and ported to the Wingstop
documentation repository. They record a destination; none of them is a migration plan.

| ADR                                                         | Decides                                                                      | Status   |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- | -------- |
| [0001](./ADR-0001-nx-multi-project-workspace.md)            | Nx multi-project workspace; library types; **the dependency rules**          | Proposed |
| [0002](./ADR-0002-primeng-tailwind-ui-platform.md)          | PrimeNG 22 + Tailwind v4; tokens generated from Figma as a package           | Proposed |
| [0003](./ADR-0003-runtime-environment-configuration.md)     | Runtime configuration; one artifact promoted (amended by 0005)               | Proposed |
| [0004](./ADR-0004-data-access-signalstore-structure.md)     | Inside a `data-access` library: SignalStore, events, facades                 | Draft    |
| [0005](./ADR-0005-application-topology-and-render-modes.md) | Two apps — prerendered, personalised `marketing`; client-rendered `ordering` | Proposed |

## The end state in one picture

```
                    wingstop.com  (one origin, path-routed at the edge)
                ┌──────────────────────────┴──────────────────────────┐
        marketing  (0005)                                     ordering  (0005)
        prerendered per locale; segment variants              client-rendered; service worker;
        chosen at the edge; built per environment             one artifact promoted (0003)
                └──────────────┬──────────────────────────────┬───────┘
                               │ both compose                  │
        ┌──────────────────────▼───────────┐   ┌───────────────▼────────────────┐
        │ feature   domain-bound UI,       │   │ ui        presentational only, │
        │           facades, guards        │──►│           no data-access       │
        └──────────────┬───────────────────┘   └────────────────────────────────┘
                       │ reads stores, dispatches events
        ┌──────────────▼───────────────────────────────────────────┐
        │ data-access   one per domain — server + API-call state   │
        │               no peer domain; scope:shared (auth) only   │
        └──────────────┬───────────────────────────────────────────┘
                       ▼
        util   runtime-config (0003) · theme + token package (0002) · models · utils
```

## Rules that cut across documents

- **Dependency rules live in exactly one place:** ADR-0001,
  [Allowed dependency edges](./ADR-0001-nx-multi-project-workspace.md#allowed-dependency-edges).
  Other ADRs refine what lives inside a tier and do not restate the edges.
- **Libraries are `libs/<type>/<domain>`** — type first, then domain.
- **Two domains → a facade**, beside the page or in a `feature` library. Never in `data-access`.
- **`ui` never knows where its data comes from.** If a component injects a store, it is a `feature`.
- **Server access is `httpResource` first**, `httpMutation` for writes, raw `fetch()` only by
  named exception.
- **Event groups live in `events.ts`.**

## Known gaps between these documents and the prototype

The prototype does not yet follow all of this. Each item below is a code change, not an argument
to weaken an ADR:

- **No negative test** proves a forbidden import fails the build. The `depConstraints` now match
  ADR-0001's table, but nothing demonstrates they bite. (PROVE-OUT P1)
- `cartDrawerVisible` is UI state held in `data-access/session-cart` (ADR-0004 Decision 6).
- `data-access/content` exports its server access and has no events — parked until the CMS
  decision.
- The eight DummyJSON example libraries predate ADR-0004 and export their server access.
- No `platform:*` tags exist; no second application exists. (ADR-0005)

Closed 2026-10-13: `depConstraints` tightened to the ADR-0001 table; `content-blocks` split into a
presentational `ui` lib and a `feature` lib holding the registry and data-bound blocks; `auth` and
`location` renamed to `events.ts`; `libs/platform` became `libs/shared/theme`; the CMS preview
contract moved to `libs/shared/cms`, removing the last peer `data-access` edges.

## Not yet recorded

- **The CMS and the content layer.** Platform selection is still being spiked. When it lands, it
  gets its own ADR covering the vendor-neutral content layer (block registry, required SEO,
  preview contract, failure policy) with the vendor as a parameter.
- **Persistence policy** and **typed analytics** — deferred from ADR-0004.
