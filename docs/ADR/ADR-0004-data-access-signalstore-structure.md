# 🤖 ADR-0004 — Structure `data-access` libraries around a SignalStore with an event-driven public API

|                |                                                                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**     | **Draft** — rough cut for refinement, not yet ready for discussion                                                                                  |
| **Date**       | 2026-10-05                                                                                                                                          |
| **Revised**    | 2026-10-13 — facades replace the "ambient" carve-out; server-state-only scope; `httpResource` first; working note folded in                         |
| **Deciders**   | Wingstop internal development leadership                                                                                                            |
| **Applies to** | `ngfe-web`                                                                                                                                          |
| **Prototype**  | A prototype workspace — 15 `data-access` libraries on SignalStore — _link TBD_                                                                      |
| **Blocked on** | An Nx generator, an event-granularity convention, and bringing the prototype in line. See [Acceptance criteria](#acceptance-criteria).              |
| **Relates to** | [ADR-0001](./ADR-0001-nx-multi-project-workspace.md) — which owns the dependency rules and decided that one `data-access` library per domain exists |

> **Purpose.** ADR-0001 decided that domain data and state live in one `data-access` library per
> domain, that peer domains do not depend on each other, and that cross-domain composition happens
> in a facade. This document is the inside of that box: what a `data-access` library contains,
> what it exposes, and how the rest of the application talks to it.
>
> It is written as a target, not as a critique. **This is a draft** — several decisions are
> coin-flips whose only real value is being made once. Argue with them.

---

## Context

ADR-0001 established the container and its edges. It left five questions about the inside open,
and they are the ones that decide whether a per-domain library is an improvement or just a nicer
folder:

1. **What lives inside the library?**
2. **What does it expose, and what stays private?**
3. **How does a consumer that needs two domains get them?**
4. **How does a component cause a state change?**
5. **Where does server state live, and who owns its shape?**

Answered badly, a domain library becomes the same tangle at a smaller scale: a store nobody trusts
because the repository is also reachable, server shapes leaking into state, domains quietly
reaching into each other, and components calling whichever surface was nearest.

**Scope boundary.** This records a destination. Coexistence with existing `@ngrx/store` state
during a migration is a separate mechanism and a separate decision, and nothing in a greenfield
prototype can de-risk it. Do not cite this ADR as having proven a migration path.

## Decision

**A `data-access` library is a reflection of one domain's server state and API-call state. It
exposes a SignalStore, an event group and its models. It never injects a peer domain's store.
Consumers read by injecting the store — or a facade, when they need more than one domain — and
write by dispatching events. Server access is private.**

### The shape

```
libs/data-access/<domain>/
  src/
    index.ts            # public API — store, events, models
    lib/
      models.ts         # domain types
      events.ts         # the event group — the domain's verb surface
      store.ts          # the SignalStore
      api.ts            # request builders, DTO mappers — PRIVATE   (optional)
      config.ts         # constants, storage keys                    (optional)
      route-params.ts   # route parameter names it owns              (optional)
```

```
                    dispatch events
   component  ───────────────────────────►  ┌──────────────────┐
       │                                     │   SignalStore    │
       └──────────◄──────────────────────────┤                  │
                    read signals             │  resources       │
                                             │  request state   │
                                             │  reducers        │  ──►  api.ts
                                             │  handlers        │       (private)
                                             │  mutations       │
                                             └──────────────────┘
```

### 1. The public API exports the store, the events and the models — never the server access

```ts
// index.ts
export * from './lib/events';
export * from './lib/models';
export * from './lib/store';
// api.ts is deliberately absent.
```

A request function reachable from the barrel is an invitation to bypass the store, and the second
call site that accepts it ends the store's claim to be the source of truth for that domain. The
library exports the store and its events; never the thing the store is built on.

### 2. A domain library never injects a peer domain's store; cross-domain reads go through a facade

`carts` does not inject `ProductsStore`. Two domains that each need the other — a products list
showing "in cart" badges, and a cart drawer showing product names and prices — would otherwise
inject each other, which fails at runtime (`NG0200`) and in lint. The rule is not stylistic: the
cyclic version does not run. It is stated canonically in ADR-0001's dependency table.

Three provisions make the rule workable rather than merely strict:

**(a) Composition happens in a facade.** When a page, component or feature needs two or more
domains, a facade injects them and derives what the consumer needs:

```ts
// Beside the page in the app, or in a feature library if a second surface needs it.
// Provided at the route, not root.
export const ProductCatalogFacade = signalStore(
  withProps(() => ({
    products: inject(ProductsStore),
    cart: inject(SessionCartStore),
  })),
  withComputed(({ products, cart }) => ({
    rows: computed(() => {
      const lines = new Map(
        (cart.cart()?.products ?? []).map((p) => [p.id, p.quantity]),
      );
      return (
        products.allProducts.value()?.products.map((product) => ({
          ...product,
          inCart: lines.has(product.id),
          quantity: lines.get(product.id) ?? 0,
        })) ?? []
      );
    }),
  })),
);
```

A facade is a `signalStore`, or a plain injectable wrapping `signalState` when it needs no store
features. **Facades compose reads; writes still dispatch the owning domain's events.** A facade
that grows mutation methods has become a domain store with a different label.

Where it lives follows its consumer count: one page → beside that page in the app; a second
surface → a `feature` library. **Never in `data-access`.**

> Put cross-domain logic in the page component itself, rather than a facade, and you have started
> the walk back toward a multi-thousand-line component with twenty-plus injected dependencies. A
> facade is independently testable and has a declared dependency list; a page component has
> neither.

**(b) `scope:shared` libraries are not peer domains.** Session identity is something a domain needs
to _build its own requests_, not something it composes. If a cart store cannot read the session,
the user id has to travel in every event payload — `itemAdded: { product, userId }` — and the
failure mode is silent: one page omits it and you get a guest cart with no error anywhere. A facade
cannot fix that, because the facade is not the thing making the request.

So a domain store may inject a `scope:shared` `data-access` library such as auth. The allowance is
granted by tag, which is why ADR-0001 requires an owner for `scope:shared`.

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
  // Read: inject and read signals — the domain store, or a facade over several.
  readonly store = inject(ProductsStore);
  // Write: dispatch. Never a method call that mutates.
  readonly actions = injectDispatch(productsEvents);
}
```

The asymmetry is deliberate. Reads are a direct dependency because they are cheap, typed and
synchronous — indirection there buys nothing, and signals are pull-based, so there is nothing to
dispatch. Writes go through one dispatch surface so that a state change has exactly one
vocabulary, appears in devtools under a name, and can be observed by more than one listener
without the dispatcher knowing any of them exist.

That last property is the whole point, and it is the one a method call cannot provide. A component
also does not take a dependency on an entire store just to invoke one behaviour.

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
  on(productsEvents.categorySelected, (event) => ({
    selectedCategory: event.payload,
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

### 6. Server state is a resource; `withState` holds only what parameterises the server

`httpResource`, `withResource` and `withEntityResources` own the loading, error and value of
server-owned data. Never mirror a resource into `withState` — two copies means one is stale, and
nothing tells you which.

`withState` in a `data-access` store holds **API-call state**: the values a request depends on —
the selected category, the current page, the id being previewed — plus request outcomes a resource
does not already carry.

```ts
withState({ selectedCategory: undefined }),
withResource(({ apiBaseUrl, selectedCategory }) => ({
  products: httpResource<ProductsResponse>(() => {
    const category = selectedCategory();
    return category
      ? `${apiBaseUrl}/products/category/${category.slug}`
      : `${apiBaseUrl}/products`;
  }),
})),
```

The selection is state because the request reads it. The products are a resource derived from it.

**UI state does not belong here.** Drawer visibility, a form draft, an expanded panel — none of
these parameterise a request, and they live in the facade, the `feature` library, or the component
that owns the surface. The test is the same as for the facade: _does the server care?_ If not, it
is not `data-access` state.

A `feature` library may hold its own state in a `+state` folder when that state has **exactly one
consuming surface** — a wizard's step state, a filter panel's draft selection. Use the consumer
count as the test. Cart state fails it twice: it has four consumers across three surfaces, and it
carries server mutations, persistence and a guest-id fallback. That is a domain.

### 7. `httpResource` first; `HttpClient` when a resource cannot express it; never raw `fetch()`

Reads are `httpResource` (through `withResource` / `withEntityResources`). Writes are
`httpMutation`. Plain `HttpClient` Observables are for the cases neither primitive expresses — a
stream, a cancellation pattern a resource cannot model. Raw `fetch()` is not used.

This is not stylistic. `fetch()` bypasses the interceptor chain, which makes auth headers,
correlation IDs, retry and timeout policy unenforceable — every one of them becomes something each
call site must remember instead of something the application guarantees.

**Named exception — build-time prerender enumeration.** `getPrerenderParams()` runs at build time,
where `inject()` is legal only before the first `await`, so a paginated walk of the CMS cannot hold
an injected client across its loop. That code uses `fetch()` deliberately and documents why. It is
build tooling, not runtime server access, and the interceptor chain is not wanted there. Any
further exception is added to this paragraph by name, or it is a violation.

### 8. Server responses are mapped to domain models before they reach state

Backend response shapes stop at the library boundary — in a resource's `parse`, or a private mapper
in `api.ts` — and the store's state is domain types. The cost is real and recurring and is priced
in Consequences rather than waved through.

### 9. One name: `events.ts`

Not `actions.ts`. `actions` carries classic-NgRx connotations this model does not match. A
coin-flip whose value is entirely in being settled.

### 10. `withMethods` only for stores with no server state

A store owning local user preference with no backend may expose methods — events would be pure
ceremony. Any store that talks to a server uses events. The exception stays narrow by definition:
_no server state at all_, not _only a little_. A store in this position is expected to gain server
state or move out of `data-access`; it is not a permanent category.

### Adding a new domain

1. Generate the library with an Nx generator (see Enforcement — this is a local workspace
   generator, not a copy-paste).
2. Write `models.ts` as domain types, not response shapes.
3. Write `events.ts` first. Naming the domain's verbs before its state tends to produce better
   state.
4. Assemble `store.ts`: resources for server-owned data, `withState` only for what requests read,
   reducers for transitions, mutations for writes, handlers for orchestration.
5. Put request builders and DTO mappers in `api.ts`, unexported.
6. Export store, events, models. Stop.

If a consumer needs this domain _and_ another, that is a facade beside the consumer — not a new
dependency in either domain.

## Alternatives considered

**A. SignalStore with `withMethods` as the public write surface.** The common default and the
closest honest alternative — fewer concepts, fewer files, faster to teach, and genuinely better
for a small domain. Rejected as the general rule because a method call couples caller to store
directly: only the store can react, the call site must know which store owns the behaviour, and
cross-domain reaction has nowhere to live. Decision 10 keeps it for exactly the case where none of
those matter.

**B. Allow domains to inject each other freely, relying on tags only to prevent cycles.** Rejected.
Tags do not prevent the cycle until it has been written, and an acyclic mesh is still a mesh — it
preserves the property that changing one domain can break another at a distance, and a store that
injects three others constructs all three and fires their requests on first use. Decision 2's
provisions cover the cases that actually motivated this.

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

**G. Events only between domains — each keeps a local projection of the other's data.** Rejected
for derived read state, retained for reactions. Products publishes `productsLoaded`, cart keeps
its own copy: fully decoupled, and the state is duplicated with nothing reconciling the copies. It
is the right answer for "cart clears on `sessionExpired`" (Decision 2c) and the wrong one for "the
drawer shows product names" (Decision 2a).

**H. A separate `type:composition` tag and library tier for facades.** Rejected for now. More
honest about what a facade is, but a new tag and rule set buys nothing the app and `feature` tiers
do not already express. Revisit if facades start being shared across unrelated features.

**I. `withConditional` to provision guest versus authenticated behaviour.** Rejected. It selects
between two store features once, at construction, and never re-reads the condition. Login happens
after the store exists, so it cannot express the case it looks designed for.

## Consequences

**Gained**

- A domain has one home, one vocabulary, one public surface.
- Cross-domain reaction without coupling: a second store listens to an event without the
  dispatcher knowing it exists.
- The dependency graph cannot cycle through `data-access`, by rule rather than by care.
- State changes appear in devtools as named domain events rather than anonymous patches.
- Server access is unreachable from outside the library, so "the store is the source of truth" is
  structural rather than cultural.
- Server state stops being hand-mirrored, removing a class of staleness bug outright.
- A new domain has an obvious shape, which is what makes it reviewable.

**Accepted costs**

- **More ceremony than a method call.** Three concepts where a method call is one. On a simple
  domain this is overhead with no return, and the team feels it before it feels the benefit.
- **"Where is this handled?" becomes a search.** The price of decoupling is indirection. A method
  call has one definition; an event may have zero, one, or several handlers, and nothing at the
  dispatch site says which.
- **Every cross-domain surface needs a facade.** That is the cost of not letting domains reach into
  each other, and on a one-off screen it will feel like pure overhead.
- **Facades cascade instantiation.** A `providedIn: 'root'` store constructs on first injection, so
  a facade over three stores constructs all three, runs their `onInit` hooks and storage reads, and
  starts any resource whose URL is already defined. Count the requests when the surface first
  renders, and check the facade does not pull a domain library into an eager chunk.
- **`scope:shared` needs an owner.** It is the only way around Decision 2, and the pressure to
  relabel an inconvenient domain as shared will arrive. Who grants the tag matters more than the
  rule itself.
- **UI state moves out of stores that hold it today.** Decision 6 relocates drawer visibility and
  similar flags from `data-access` into facades and features. That is a refactor of working code.
- **Event catalogues grow.** One prototype store already declares fourteen events. Without a
  granularity convention — which does not yet exist — the catalogue becomes its own maintenance
  surface.
- **Two mental models**, reducer versus handler, with a rule that is easy to state and easy to
  violate under delivery pressure.
- **DTO mapping is a permanent tax.** Every backend field change touches a mapper. The benefit is
  real but deferred; the cost is immediate and recurring.

## Enforcement

A decision with no failing build behind it is a preference. This ADR is implemented when:

| Mechanism                                                                                   | Notes                                                                                                                                |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **An Nx generator scaffolding the layout and the public API**                               | The highest-leverage item here by a wide margin. A shape that lives only in an example does not survive contact with a second author |
| `depConstraints` restricting `type:data-access` to `type:util` and `scope:shared`           | Decision 2, as stated in ADR-0001's dependency table                                                                                 |
| A negative test proving a peer-domain import fails the build                                | Otherwise the restriction is unverified                                                                                              |
| An owner for the `scope:shared` tag, and a short list of what currently carries it          | The carve-out is only as good as the discipline around who gets it                                                                   |
| A check rejecting any `api.ts` export from a `data-access` public API                       | Decision 1, the load-bearing one                                                                                                     |
| `@nx/enforce-module-boundaries` forbidding `type:ui` → `type:data-access`                   | ADR-0001 Decision 4. Makes "presentational components do not know where data comes from" mechanical                                  |
| A check rejecting raw `fetch()` inside `data-access`, with an allowlist matching Decision 7 | Without it the interceptor chain is decorative; without the allowlist the check gets disabled                                        |
| A check rejecting `patchState` from outside the owning library                              | Keeps the write surface to the store's own reducers, handlers and mutations                                                          |
| A naming check: `events.ts` exists, `actions.ts` does not                                   | A settled coin-flip is only worth settling if it is kept                                                                             |
| Store tests that dispatch events and assert state, rather than calling internals            | See Open questions — the shape of these tests is not yet settled                                                                     |

## Acceptance criteria

This ADR stays at **Draft** until:

1. An event-granularity convention exists — what deserves an event and what does not.
2. An Nx generator exists for the layout in Decision 1.
3. `scope:shared` has an owner and an initial membership list.
4. The prototype either follows its own decisions or records each deviation as a deliberate,
   named exception. Shipping an ADR that its own reference implementation violates is worse than
   shipping none.
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

A facade cannot own these — it exists only while its surface does. Each domain listening
independently works and scales poorly: the knowledge that "these five things happen on logout" is
then spread across five libraries with nothing naming the set. The alternative is an
application-level orchestration seam subscribed to the event bus. Neither is decided, and this is
the one genuine gap left in the model.

_(An earlier draft listed hydration here. It does not belong: a `providedIn: 'root'` store with a
resource loads on first injection, and `withStorageSync` restores at construction. Hydration is
already handled by the state model.)_

### When two surfaces need the same derived shape

If the products list and the cart drawer end up with near-identical facades, is that one shared
facade in a `feature` library — and at what point is a shared facade just a domain store with a
different label? Decide against a real second case, not in the abstract.

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

### The content library waits on the CMS decision

`data-access/content` exports its server access and declares no events — both violations. It is
left as-is deliberately: the CMS platform is not chosen, and a Strapi outcome may move content
fetching to GraphQL, which would reshape the library anyway. Bring it in line when the platform is
settled, not before.

### Deferred to their own ADRs

**Persistence.** Per-store, via `withStorageSync`, and the storage mechanism (local, session,
IndexedDB) is the easy part. The decision is policy:

- A version key plus migrate-or-discard, because a persisted shape is a wire format you ship to
  yourself
- Validation on read before the value is trusted, the same discipline ADR-0003 applies to config
- What must never persist — session tokens in `localStorage` are XSS-reachable, and that is a
  security decision rather than a storage preference
- Cross-tab coherence — the storage library has no `storage` listener, so a logout in one tab is
  undone by a write from another (ADR-0005)
- Behaviour under server-side rendering, where none of these APIs exist

**Typed analytics.** Emitting from the store rather than sprinkling `trackEvent()` through
components is the goal, and the event bus already supports a global listener. The trap is coupling
the analytics schema to internal event names — rename a domain event, and a dashboard silently
goes to zero. Candidate shapes, in preference order: a global listener with an explicit typed
mapping table (the mapping _is_ the contract, and a rename breaks it at compile time); stores
dual-emitting explicit analytics events; or direct subscription with no mapping.

## Evidence

Measured in the prototype, 2026-10-13. Fifteen `data-access` libraries exist, in two groups that
must be read separately.

**Eight are example libraries** — `carts`, `comments`, `posts`, `products`, `quotes`, `recipes`,
`todos`, `users` — wrapping DummyJSON to give the workspace realistic data. They were scaffolded
before this pattern existed, and their exported `api.ts` files and raw `fetch()` calls are
scaffolding, not design. They demonstrate nothing about whether the pattern holds and are expected
to be regenerated or retired, not cited.

**Seven were written against the pattern** — `auth`, `content`, `location`, `nutrition`, `pages`,
`session-cart`, `theme`:

| Library        | Server access private | `events.ts`          | Peer store injected | Notes                                                      |
| -------------- | --------------------- | -------------------- | ------------------- | ---------------------------------------------------------- |
| `nutrition`    | yes                   | yes                  | —                   | Full shape                                                 |
| `pages`        | yes                   | yes                  | —                   | Prerender `fetch()` is Decision 7's named exception        |
| `session-cart` | yes                   | yes                  | `AuthStore`         | Legal under 2(b) — auth is `scope:shared`                  |
| `auth`         | yes                   | yes                  | —                   | Renamed from `actions.ts` 2026-10-13                       |
| `location`     | yes                   | yes                  | —                   | Renamed from `actions.ts` 2026-10-13                       |
| `theme`        | n/a                   | none — `withMethods` | —                   | Decision 10 exception; HTTP-backed settings planned        |
| `content`      | **exported**          | none                 | —                   | Deliberately deferred to the CMS decision (Open questions) |

Among libraries written against it, the pattern mostly held. Before 2026-10-13 two of them used
`actions.ts` — a naming split with one author in a greenfield workspace, which is still the
clearest argument that this shape needs a generator and checks rather than a document.

Further findings, outside the table:

- **`users`** (an example library) also injects `AuthStore` — legal under 2(b), recorded so the
  count is honest.
- **Peer edges hid in a shared token.** `nutrition` and `pages` imported `CMS_PREVIEW` and
  `CmsStatus` from `content`: not a store, but still a `data-access` → `data-access` edge in the
  graph. The preview contract is request context, like auth, so it moved to a `util` library
  (`libs/shared/cms`). Worth expecting more of: the rule is per project, not per symbol, so a
  constant in the wrong library creates an edge just as a store does.
- **`libs/ui/content-blocks` injected `NutritionStore` and `ThemeStore`**, violating ADR-0001
  Decision 4, and passed lint only because `type:ui` could depend on anything. Resolved
  2026-10-13: the presentational blocks take data as inputs, and thin wrappers in
  `libs/feature/content-blocks` read the stores. The registry moved with them, since it maps keys
  to both kinds of block.
