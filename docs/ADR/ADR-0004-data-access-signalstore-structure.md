# 🤖 ADR-0004 — Structure `data-access` libraries around a SignalStore with an event-driven public API

|                |                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Status**     | **Draft** — rough cut for refinement, not yet ready for discussion                                                                               |
| **Date**       | 2026-10-05                                                                                                                                       |
| **Deciders**   | Wingstop internal development leadership                                                                                                         |
| **Applies to** | `ngfe-web`                                                                                                                                       |
| **Prototype**  | A prototype workspace — 12 `data-access` libraries on SignalStore — _link TBD_                                                                   |
| **Blocked on** | A generator, an event-granularity convention, and bringing the prototype in line. See [Acceptance criteria](#acceptance-criteria).               |
| **Relates to** | [ADR-0001](./ADR-0001-nx-multi-project-workspace.md) — which decided that one `data-access` library per domain exists, but not what is inside it |

> **Purpose.** ADR-0001 decided that domain data and state live in one `data-access` library per
> domain, and deliberately deferred everything about that library's internals. This document is
> the answer to the deferred part: what a `data-access` library contains, what it exposes, what it
> may depend on, and how the rest of the application talks to it.
>
> It is written as a target, not as a critique. **This is a draft** — several decisions are
> coin-flips whose only real value is being made once. Argue with them.

---

## Context

ADR-0001 established the container: one `data-access` library per domain, owning that domain's API
surface, models and state, behind a controlled public API. It left five questions open, and they
are the ones that decide whether a per-domain library is an improvement or just a nicer folder:

1. **What lives inside the library?**
2. **What does it expose, and what stays private?**
3. **What may it depend on?**
4. **How does a component cause a state change?**
5. **Where does server state live, and who owns its shape?**

Answered badly, a domain library becomes the same tangle at a smaller scale: a store nobody trusts
because the repository is also reachable, server shapes leaking into state, domains quietly
reaching into each other, and components calling whichever surface was nearest.

**Scope boundary.** This records a destination. Coexistence with existing `@ngrx/store` state
during a migration is a separate mechanism and a separate decision, and nothing in a greenfield
prototype can de-risk it. Do not cite this ADR as having proven a migration path.

## Decision

**A `data-access` library owns one domain's models, server access and state. It exposes a
SignalStore and an event group. It does not depend on another domain's store. Consumers read by
injecting the store and write by dispatching events. The repository is private.**

### The shape

```
libs/data-access/<domain>/
  src/
    index.ts            # public API — store, events, models
    lib/
      models.ts         # domain types
      events.ts         # the event group — the domain's verb surface
      store.ts          # the SignalStore
      api.ts            # repository / server access — PRIVATE
      config.ts         # constants, storage keys          (optional)
      route-params.ts   # route parameter names it owns    (optional)
```

```
                    dispatch events
   component  ───────────────────────────►  ┌──────────────────┐
       │                                     │   SignalStore    │
       └──────────◄──────────────────────────┤                  │
                    read signals             │  state           │
                                             │  resources       │
                                             │  reducers        │  ──►  api.ts
                                             │  handlers        │       (private)
                                             │  mutations       │
                                             └──────────────────┘
```

### 1. The public API exports the store, the events and the models — never the repository

```ts
// index.ts
export * from './lib/events';
export * from './lib/models';
export * from './lib/store';
// api.ts is deliberately absent.
```

A repository reachable from the barrel is an invitation to bypass the store, and the second call
site that accepts it ends the store's claim to be the source of truth for that domain. The library
exports the store and its events; never the thing the store is built on.

### 2. A domain library does not depend on another domain's store

Peer domains do not inject each other. `carts` does not inject `ProductsStore`. That edge is what
turns a dependency graph into a mesh, and it is the one ADR-0001 named as the most consequential
open question.

Three carve-outs make the rule workable rather than merely strict:

**(a) Composition happens in a `feature` library.** When a surface genuinely needs two domains, the
facade that combines them is a `feature` library — which ADR-0001 already defines as domain-bound
UI that may depend on multiple `data-access` libraries.

> Put the facade in a page component instead and you have started the walk back toward a
> multi-thousand-line component with twenty-plus injected dependencies. A `feature` library is
> independently testable and has a declared, enforceable dependency list; a page component has
> neither.

**(b) Ambient state is not a peer domain.** Session, locale, feature flags and device location are
cross-cutting facts, not domains. A domain store may read them.

The practical consequence of getting this wrong: if a cart store cannot read the session, the user
id has to travel in the event payload — `itemAdded: { product, userId }` — so every call site must
now know to supply identity, and the failure mode is silent. One page omits it and you get a guest
cart with no error anywhere.

Ambient libraries are marked by tag, not by convention, so the allowance is enforceable:

```
type:data-access  →  type:util, scope:ambient
```

Note that this is a **tightening**, not a new restriction. The rule as written today permits
`type:data-access → type:data-access`, which allows every domain to import every other.

**(c) Importing another library's _events_ is not the same as injecting its _store_.** An event
group is a set of types and a dispatch token. A store is state and behaviour. A domain may listen
for another domain's event — `sessionExpired`, `checkoutCompleted` — without depending on how that
domain works, which is what lets domains react to each other without coupling to each other.

```ts
// Permitted: reacting to another domain's fact.
withEventHandlers(({ events, ...store }) => ({
  clearOnSessionExpiry$: events
    .on(authEvents.sessionExpired)
    .pipe(tap(() => patchState(store, initialState))),
}));
```

This still creates a graph edge. If event-group imports prove to be a mesh of their own, the
fallback is a shared event catalogue library — which buys decoupling at the cost of domains no
longer owning their own vocabulary. Try (c) first; keep the catalogue in reserve.

### 3. Reads inject the store; writes dispatch events

```ts
export class ProductsListPage {
  // Read: inject and read signals.
  readonly store = inject(ProductsStore);
  // Write: dispatch. Never a method call that mutates.
  readonly actions = injectDispatch(productsEvents);
}
```

The asymmetry is deliberate. Reads are a direct dependency because they are cheap, typed and
synchronous — indirection there buys nothing. Writes go through one dispatch surface so that a
state change has exactly one vocabulary, appears in devtools under a name, and can be observed by
more than one listener without the dispatcher knowing any of them exist.

That last property is the whole point, and it is the one a method call cannot provide.

### 4. Events name domain facts and user intent

`itemAdded`, `checkoutRequested`, `sessionExpired` — not `setCart`, `updateQuantity`,
`setDrawerVisible`.

An event named after a state field is a setter in costume. It reads fine until a second part of
the system needs to react to the same occurrence, at which point the name describes the mechanism
instead of what happened.

```ts
export const sessionCartEvents = eventGroup({
  source: 'Session Cart',
  events: {
    itemAdded: type<CartProduct>(),
    itemRemoved: type<CartProduct['id']>(),
    checkoutRequested: type<void>(),
    checkoutCompleted: type<Cart>(),
    checkoutFailed: type<string>(),
  },
});
```

Note the success and failure events. A mutation reports its outcome **as events**, so reacting to
a completed checkout never requires a reference to the thing that performed it.

### 5. Three mechanisms, three jobs — and they do not overlap

| Mechanism                        | Owns                                 | Rule                                                        |
| -------------------------------- | ------------------------------------ | ----------------------------------------------------------- |
| `withReducer(on(...))`           | Synchronous state transitions        | Pure. No I/O, no navigation, no injection                   |
| `withEventHandlers`              | Async orchestration and side effects | An event triggers a request, a navigation, or another event |
| `withMutations` / `httpMutation` | Writes to the server                 | Declares the request; reports success and failure as events |

A useful test: if removing the line would change _what the state is_, it belongs in a reducer. If
it would change _what else happens_, it belongs in a handler.

```ts
withReducer(
  on(sessionCartEvents.cartDrawerVisibilityChanged, (event) => ({
    cartDrawerVisible: event.payload,
  })),
),
withMutations(({ apiBaseUrl, cartActions, ...store }) => ({
  addItem: httpMutation({
    operator: exhaustOp,
    request: (product: CartProduct) => ({ /* … */ }),
    parse: (response) => response as Cart,
    onSuccess: (cart) => {
      patchState(store, { cart });
      cartActions.cartUpdated(cart);   // outcome announced as an event
    },
    onError: () => cartActions.cartUpdateFailed('Unable to update the cart.'),
  }),
})),
withEventHandlers(({ events, ...store }) => ({
  syncOnItemAdded$: events
    .on(sessionCartEvents.itemAdded)
    .pipe(tap((event) => void store.addItem(event.payload))),
})),
```

### 6. Server state is a resource; `withState` is for what the client owns

`httpResource`, `withResource` and `withEntityResources` own the loading, error and value of
server-owned data. Never mirror a resource into `withState` — two copies means one is stale, and
nothing tells you which.

`withState` holds client-owned facts: the current selection, drawer visibility, a preview id.

```ts
withState({ previewProductId: undefined, selectedCategory: undefined }),
withResource(({ apiBaseUrl, selectedCategory }) => ({
  products: httpResource<ProductsResponse>(() => {
    const category = selectedCategory();
    return category
      ? `${apiBaseUrl}/products/category/${category.slug}`
      : `${apiBaseUrl}/products`;
  }),
})),
```

The selection is state. The products are a resource derived from it.

### 7. One HTTP stack

Server access goes through `HttpClient`, or the `httpResource` / `httpMutation` primitives built
on it. Never raw `fetch()`.

This is not stylistic. `fetch()` bypasses the interceptor chain, which makes auth headers,
correlation IDs, retry and timeout policy unenforceable — every one of them becomes something each
call site must remember instead of something the application guarantees.

### 8. The repository maps DTOs to domain models

Backend response shapes stop at the repository boundary; the store's state is domain types. The
cost is real and recurring and is priced in Consequences rather than waved through.

### 9. One name: `events.ts`

Not `actions.ts`. `actions` carries classic-NgRx connotations this model does not match. A
coin-flip whose value is entirely in being settled.

### 10. `withMethods` only for stores with no server state

A store owning local user preference with no backend may expose methods — events would be pure
ceremony. Any store that talks to a server uses events. The exception stays narrow by definition:
_no server state at all_, not _only a little_.

### Adding a new domain

1. Generate the library with the layout above (see Enforcement — this should be a generator, not a
   copy-paste).
2. Write `models.ts` as domain types, not response shapes.
3. Write `events.ts` first. Naming the domain's verbs before its state tends to produce better
   state.
4. Write `api.ts` returning domain models.
5. Assemble `store.ts`: `withState` for client-owned facts, resources for server-owned data,
   reducers for transitions, mutations for writes, handlers for orchestration.
6. Export store, events, models. Stop.

## Alternatives considered

**A. SignalStore with `withMethods` as the public write surface.** The common default and the
closest honest alternative — fewer concepts, fewer files, faster to teach, and genuinely better
for a small domain. Rejected as the general rule because a method call couples caller to store
directly: only the store can react, the call site must know which store owns the behaviour, and
cross-domain reaction has nowhere to live. Decision 10 keeps it for exactly the case where none of
those matter.

**B. Allow domains to inject each other freely, relying on tags only to prevent cycles.** Rejected.
An acyclic mesh is still a mesh — it preserves the property that changing one domain can break
another at a distance, which is the thing the per-domain library was meant to end. Decision 2's
carve-outs cover the cases that actually motivated this.

**C. Classic NgRx — actions, reducers, effects, selectors, feature state.** Rejected on fit, not
quality. The per-domain library is the unit that makes a lighter model viable; a global feature
store is not naturally splittable across libraries with enforced boundaries. Its coexistence story
during migration is a separate decision and a real one.

**D. A redux-connector bridge as the long-term shape.** Deferred as an architecture, likely
essential as a migration mechanism. Keeping those two uses distinct is the point.

**E. Component-level state with plain services.** Rejected. This is the pattern that produces
multi-thousand-line components with twenty-plus injected dependencies.

**F. One global store rather than one per domain.** Rejected by ADR-0001's structure — a global
store cannot be split across libraries with enforced boundaries, which is the mechanism the whole
architecture rests on.

## Consequences

**Gained**

- A domain has one home, one vocabulary, one public surface.
- Cross-domain reaction without coupling: a second store listens to an event without the
  dispatcher knowing it exists.
- The dependency graph stays a graph. A domain's blast radius is its own library plus whatever
  listens to its events, and both are visible.
- State changes appear in devtools as named domain events rather than anonymous patches.
- The repository is unreachable, so "the store is the source of truth" is structural rather than
  cultural.
- Server state stops being hand-mirrored, removing a class of staleness bug outright.
- A new domain has an obvious shape, which is what makes it reviewable.

**Accepted costs**

- **More ceremony than a method call.** Three concepts where a method call is one. On a simple
  domain this is overhead with no return, and the team feels it before it feels the benefit.
- **"Where is this handled?" becomes a search.** The price of decoupling is indirection. A method
  call has one definition; an event may have zero, one, or several handlers, and nothing at the
  dispatch site says which.
- **Decision 2 adds a library.** Any genuine two-domain surface now needs a `feature` library that
  would not otherwise exist. That is the cost of not letting domains reach into each other, and on
  a one-off screen it will feel like pure overhead.
- **The ambient carve-out needs an owner.** `scope:ambient` is a judgement call, and the pressure
  to relabel an inconvenient domain as ambient will arrive. Who approves that tag matters more than
  the rule itself.
- **Event catalogues grow.** One prototype store already declares fourteen events. Without a
  granularity convention — which does not yet exist — the catalogue becomes its own maintenance
  surface.
- **Two mental models**, reducer versus handler, with a rule that is easy to state and easy to
  violate under delivery pressure.
- **DTO mapping is a permanent tax.** Every backend field change touches a mapper. The benefit is
  real but deferred; the cost is immediate and recurring.
- **The pattern does not propagate by example.** See Evidence. This is why Enforcement leads with
  a generator rather than a lint rule.

## Enforcement

A decision with no failing build behind it is a preference. This ADR is implemented when:

| Mechanism                                                                                          | Notes                                                                                                                                |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **A generator scaffolding the layout and the public API**                                          | The highest-leverage item here by a wide margin. A shape that lives only in an example does not survive contact with a second author |
| `depConstraints` narrowed so `type:data-access` may depend only on `type:util` and `scope:ambient` | Decision 2. The current rule permits any domain to import any other                                                                  |
| A negative test proving a peer-domain import fails the build                                       | Otherwise the tightening is unverified                                                                                               |
| An owner for the `scope:ambient` tag, and a short list of what currently carries it                | The carve-out is only as good as the discipline around who gets it                                                                   |
| A check rejecting any repository export from a `data-access` public API                            | Decision 1, the load-bearing one                                                                                                     |
| `@nx/enforce-module-boundaries` forbidding `type:ui` → `type:data-access`                          | Makes "components do not talk to API services" mechanical rather than aspirational                                                   |
| A check rejecting raw `fetch()` inside `data-access`                                               | Decision 7. Without it the interceptor chain is decorative                                                                           |
| A check rejecting `patchState` from outside the owning library                                     | Keeps the write surface to the store's own reducers, handlers and mutations                                                          |
| A naming check: `events.ts` exists, `actions.ts` does not                                          | A settled coin-flip is only worth settling if it is kept                                                                             |
| Store tests that dispatch events and assert state, rather than calling internals                   | See Open questions — the shape of these tests is not yet settled                                                                     |

## Acceptance criteria

This ADR stays at **Draft** until:

1. An event-granularity convention exists — what deserves an event and what does not.
2. A generator exists for the layout in Decision 1.
3. `scope:ambient` has an owner and an initial membership list.
4. The prototype either follows its own decisions or records each deviation as a deliberate,
   named exception. Shipping an ADR that most libraries violate is worse than shipping none.
5. The store-testing pattern is chosen (see Open questions) and one library demonstrates it.
6. A coexistence mechanism with legacy state is proven on `ngfe-web` itself, on a spike branch —
   separately from this ADR, which must not be cited as having done it.

## Open questions

### Where do fan-out reactions live?

Decision 2(c) lets one domain react to another's event. It does not cover the case where **one
fact requires several domains to react**:

- Session expiry or logout → carts, orders and account all drop state
- Checkout completes → offers, rewards and menu resources are now stale
- Route change → page metadata derived from the router plus one or more domain stores

Each domain listening independently works and scales poorly — the knowledge that "these five
things happen on logout" is then spread across five libraries with nothing naming the set. The
alternative is an application-level orchestration seam subscribed to the event bus. Neither is
decided, and this is the one genuine gap left in the model.

_(An earlier draft listed hydration here. It does not belong: a `providedIn: 'root'` store with a
resource loads on first injection, and `withStorageSync` restores at construction. Hydration is
already handled by the state model.)_

### What is the unit under test, and what replaces the network?

Not whether to write tests — anything doing meaningful work gets them. Three narrower choices,
none settled:

1. **What does a store test assert against?** A test that calls a method or `patchState` directly
   passes while the event contract is broken. Dispatching an event and asserting the resulting
   state is what keeps Decision 3's promise honest.
2. **Reducers as pure functions, or through the real `Events` bus?** The first is faster to write
   and misses wiring bugs; the second catches wiring and costs more setup.
3. **MSW handlers, or mocking the resource primitives?** This decides whether a `feature` library
   is testable with no backend and no VPN, which is a stated goal and reaches well past unit tests.

Related and uncomfortable: most prototype libraries currently carry placeholder specs, and the
coverage thresholds pass over them. A green check that means nothing is worse than no check.

### Deferred to their own ADRs

**Persistence.** Per-store, via `withStorageSync`, and the storage mechanism (local, session,
IndexedDB) is the easy part. The decision is policy:

- A version key plus migrate-or-discard, because a persisted shape is a wire format you ship to
  yourself
- Validation on read before the value is trusted, the same discipline ADR-0003 applies to config
- What must never persist — session tokens in `localStorage` are XSS-reachable, and that is a
  security decision rather than a storage preference
- Behaviour under server-side rendering, where none of these APIs exist

**Typed analytics.** Emitting from the store rather than sprinkling `trackEvent()` through
components is the goal, and the event bus already supports a global listener. The trap is coupling
the analytics schema to internal event names — rename a domain event, and a dashboard silently
goes to zero. Candidate shapes, in preference order: a global listener with an explicit typed
mapping table (the mapping _is_ the contract, and a rename breaks it at compile time); stores
dual-emitting explicit analytics events; or direct subscription with no mapping.

## Evidence

**On propagation — the finding that shaped the Enforcement section.** Twelve `data-access`
libraries exist in the prototype. Measured October 2026:

| Property                                               | Count |
| ------------------------------------------------------ | ----- |
| `data-access` libraries                                | 12    |
| Public APIs exporting the repository                   | 8     |
| Libraries declaring an event group                     | 4     |
| `events.ts` / `actions.ts` split                       | 2 / 2 |
| Libraries still using raw `fetch()`                    | 8     |
| Libraries with events + reducer + handlers + mutations | 1     |

One library in twelve demonstrates the full shape — the most recently written one. The pattern
improved as it was discovered and did not travel backwards to the libraries written before it.
That happened in a greenfield workspace, with one author, under no delivery pressure. It is the
clearest available evidence that this shape needs a generator and a set of checks rather than a
document, and it is why Acceptance criterion 4 exists.

Two of those deviations are deliberate and should survive as named exceptions: a theme store with
no server state using `withMethods` (Decision 10), and one library re-exporting domain types from
a shared models library because two domains genuinely share them.

One current violation of Decision 2 is known: a cart store injects the auth store to read session
identity. Under Decision 2(b) this becomes legal by tagging the session library `scope:ambient` —
but that tag does not exist yet, so today it is permitted only because the dependency rule is too
loose.
