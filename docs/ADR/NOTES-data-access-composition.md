# 🤖 Working note — composing across `data-access` libraries

**Not an ADR.** Scratch space for working through a concrete example before rewriting
[ADR-0004](./ADR-0004-data-access-signalstore-structure.md) Decision 2. Nothing here is decided.

---

## The question

ADR-0004 currently says "a domain library does not depend on another domain's store." That
framing breaks down as soon as the facade is itself a SignalStore, because a composition store
injecting two domain stores _is_ a `data-access` → `data-access` edge in the Nx graph.

The likely correct framing is **directional layering** rather than prohibition:

| Layer                                          | May depend on         | Depended on by               |
| ---------------------------------------------- | --------------------- | ---------------------------- |
| **ambient** — session, locale, flags, location | util                  | anything                     |
| **domain** — products, carts, orders           | util, ambient         | composition, feature, app    |
| **composition** — surface-scoped read models   | util, ambient, domain | the one surface that owns it |

Acyclic by construction: edges only ever point down the table, so the cycle ceiling never arrives.

**What to work through:** whether that holds up against a real screen, and what the composition
layer costs in practice.

---

## The example to work through

Two requirements that point at each other — the pair that forces the issue:

1. **Products list** shows an "in cart" badge and a quantity stepper per product.
2. **Cart drawer** shows product name, image and price per line item, which the cart API doesn't
   return in full.

So the products surface needs cart state, and the cart surface needs product state.

### Option A — domains inject each other

```ts
// products/store.ts
withProps(() => ({ cart: inject(CartStore) }));

// carts/store.ts
withProps(() => ({ products: inject(ProductsStore) }));
```

**Outcome:** `NG0200` at runtime, and `@nx/enforce-module-boundaries` fails the build on the
circular library dependency. Not a style objection — it does not run.

Worth confirming by actually building it once, so the failure mode is documented rather than
asserted.

### Option B — a composition store per surface

```ts
// libs/<surface>/… — tagged composition, provided at the route, not root
export const ProductCatalogViewStore = signalStore(
  withProps(() => ({
    products: inject(ProductsStore),
    cart: inject(SessionCartStore),
    actions: injectDispatch(sessionCartEvents),
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

Neither domain learns about the other. A second composition store does the mirror job for the
drawer. No cycle is possible because nothing points back up.

**Open:** does the cart drawer's composition store duplicate most of this one? If the two end up
near-identical, that is an argument for a shared read model and against per-surface scoping.

### Option C — events only, no cross-store reads

Products publishes `productsLoaded`; cart keeps a local projection of what it needs, fed by
handlers.

Decouples completely, and duplicates state. Probably wrong for derived read state, probably right
for _reactions_ (cart clears on `sessionExpired`). Worth writing out once to confirm it feels as
bad as it sounds.

---

## What each option costs in config

```jsonc
// Option B shape — tags carried per project
// ambient:     ["type:data-access", "scope:ambient"]
// domain:      ["type:data-access", "scope:products"]
// composition: ["type:composition", "scope:catalog"]
```

```js
// eslint.config.mjs — depConstraints sketch
{ sourceTag: 'type:data-access', onlyDependOnLibsWithTags: ['type:util', 'scope:ambient'] },
{ sourceTag: 'type:composition', onlyDependOnLibsWithTags: ['type:data-access', 'type:util'] },
{ sourceTag: 'type:feature',     onlyDependOnLibsWithTags: ['type:composition', 'type:data-access', 'type:ui', 'type:util'] },
```

Note the current rule is `type:data-access → ['type:data-access', 'type:util', 'scope:shared']`,
which permits every domain to import every other. Any option here is a tightening.

**Open:** is `type:composition` worth a new tag, or does the headless store just live in the
`type:feature` library next to its components? The latter needs no new machinery and no new rules;
the former is more honest about what the thing is. Decide this against the example, not in the
abstract.

---

## Check the chosen option against these

Each of these bit someone in a real codebase. Run the example past all five.

- [ ] **Cycles.** Can any third domain close a loop later? Draw the graph with one more domain added.
- [ ] **Instantiation cascade.** `providedIn: 'root'` constructs on first inject — so a store
      injecting three others constructs all three, runs their `onInit` effects, their storage
      reads, and starts any resource with an already-defined URL. How many requests fire when the
      surface first renders? Count them in the network tab.
- [ ] **Chunking.** Does the composition store pull a domain lib into an eager chunk it was not in
      before? Check the build output, not the intent.
- [ ] **Test setup.** What does it take to test the composition store — how many stores need
      standing up, and how much HTTP has to be faked?
- [ ] **`affected` width.** Touch the products lib. How many projects are now affected?

---

## Still unresolved

- Where do **fan-out reactions** live — one fact, several domains react (logout clears carts +
  orders + account)? A composition store can't do it: it only exists while its surface does.
- Does **writes-through-the-facade** stay forbidden? Current position is yes — compositions compose
  reads, mutations still dispatch events. Confirm against the quantity stepper in the example.
- If two surfaces need the same derived shape, does the composition store get shared — and at what
  point is it just a domain store with a different label?

---

## Settled since drafting

**Session/auth is ambient, not a domain.** No business rules of its own, no server resource other
domains consume, and nothing will ever read a cart to decide something about the session. So
`SessionCartStore` injecting `AuthStore` becomes legal by tagging, with no files moved:

```js
{ sourceTag: 'type:data-access', onlyDependOnLibsWithTags: ['type:util', 'scope:ambient'] },
```

**Cart state does not move into the feature lib as `+state`.** It has four consumers across three
surfaces, three of them outside the cart feature:

| Consumer                   | Imports                                  | Where                  |
| -------------------------- | ---------------------------------------- | ---------------------- |
| `navbar.component.ts`      | `SessionCartStore` + `sessionCartEvents` | app layout — **eager** |
| `products-list.page.ts`    | `sessionCartEvents`                      | app, products route    |
| `product-detail.page.ts`   | `sessionCartEvents`                      | app, products route    |
| `cart-drawer.component.ts` | both                                     | the cart feature lib   |

`+state` is for state with exactly one consuming surface. Keep it as a sanctioned option for state
that genuinely is — a wizard's step state, a filter panel's draft selections — and use the consumer
count as the test. Cart also fails the test on content: server mutations, persistence, guest-id
fallback, create-vs-update branching. That is a domain.

**`withConditional` is not a provisioning tool.** It selects between two store features at store
construction, both branches must expose an identical shape, and the condition is evaluated once and
never re-read. It cannot express guest-vs-authenticated cart, because login happens after the store
exists. With SSR scoped out of auth and cart, there is currently no use for it in this workspace.

---

## Constraint — the SSR exemption depends on deploy topology

Intent: auth and cart are never server-rendered, so their `localStorage` persistence is safe and
needs no platform guard.

The mechanism does not currently enforce that intent. **The navbar injects `SessionCartStore`** for
the badge count and the drawer toggle, and the navbar is in the eager layout shell, so it renders on
every route. If a marketing route is server-rendered _in the same application_, the shared shell
renders, the navbar constructs the cart store, `withStorageSync` reaches for `localStorage`, and it
throws on the server. The persisted auth session has the same shape.

Whether that matters depends on a decision not yet made:

| Topology                            | Consequence                                                                                                                                                                                                     |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Marketing as a **separate Nx app**  | Structurally safe. Different shell, and the cart/auth libs are not in that graph. Nothing to enforce                                                                                                            |
| **One app**, per-route render modes | Shared shell. Needs a `platform:universal` / `platform:browser-only` tag axis plus a `depConstraints` rule stopping the server-rendered graph from reaching a browser-only lib — and a cart-free navbar variant |

This is the failure class that stays invisible until someone enables SSR months later and the stack
trace names a library nobody was thinking about.

**Cross-ADR dependency to record:** state (ADR-0004) → rendering → deploy topology. The cart/auth
SSR exemption is free under one topology and needs enforcement machinery under the other, so the
rendering ADR cannot be finished before the topology one.
