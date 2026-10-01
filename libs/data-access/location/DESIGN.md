# Design note — order proximity guardrail

|                |                                                                       |
| -------------- | --------------------------------------------------------------------- |
| **Status**     | Draft — for discussion, not for approval                              |
| **Date**       | 2026-10-01                                                            |
| **Applies to** | `@dummy-lab/data-access-location`, and the ordering flow that uses it |
| **Prototype**  | `libs/data-access/location` in this workspace                         |
| **Not an ADR** | If this becomes one, claim the number in the documentation repo first |

> **Purpose.** Product wants to warn a customer when the store selected for a pickup order is
> implausibly far from where they are. This records the split between client and server, what the
> client can and cannot determine, and which questions are product's rather than engineering's.
> It is deliberately not implementation-ready: one open question may remove the need for precise
> location — and therefore the permission prompt — altogether.
>
> **Revised** to put the decision server-side. An earlier draft had the client comparing
> distances; that is now the server's job.

---

## The problem

Customers are placing pickup orders at a store they are not near — typically the store from their
last order — then driving to it rather than to one nearby.

The worked example: an order for a Dallas store placed today; a week later the same customer is in
New York, the Dallas store is still selected, and nothing says anything.

Product's framing is a radius: if the selected store is more than roughly 10 miles from the
customer, show them something. The radius is configured in the admin portal and varies by whether
we have precise or fuzzy location.

## Where the work goes

The decision belongs **server-side**. Only the parts that physically require a browser stay on the
client.

| Client                                 | Server                                       |
| -------------------------------------- | -------------------------------------------- |
| Permission probe and the prompt        | Threshold configuration                      |
| Acquiring the fix                      | Store coordinates                            |
| Reading `accuracy` and the source tier | The distance comparison                      |
| Discarding an obviously stale fix      | Re-checking staleness (do not trust clients) |
| Rendering whatever the server decided  | Fuzzy fallback from the request IP           |
|                                        | The decision, and the telemetry for it       |

Reasons: thresholds change without a deploy, the rule stays identical across web, iOS and Android,
a client cannot tamper with it, and the measurement lands in one place.

**It also makes the fuzzy tier free.** The client cannot get an IP-derived position — this app is a
static SPA with no server or edge to read headers at. But the server handling this request already
sees the source IP. So the client sends coordinates only when it genuinely has a precise fix; with
no fix at all, the server falls back to IP on its own. No vendor, no extra call.

## The client contract

What the client sends, once it knows what it has:

```jsonc
{
  "cartId": "…",
  "storeId": "…", // the store currently selected
  "latitude": 32.7767, // omitted entirely when we have no fix
  "longitude": -96.797,
  "accuracyMeters": 48,
  "source": "precise", // "precise" | "manual"
  "fixTimestamp": 1759276800000,
}
```

Two notes:

- **Send `accuracyMeters`, not just the tier.** The server's comparison needs the radius. A
  "precise" fix can be 20m or 400m; a fuzzy one 5km or 50km. The tier alone is too lossy to
  compare honestly.
- **Send `fixTimestamp`** so the server enforces staleness rather than trusting the client to.

What comes back — a decision, not data to interpret:

```jsonc
{
  "cartId": "…",
  "storeId": "…", // echoed, so the client can discard stale answers
  "outcome": "too-far", // "ok" | "too-far" | "not-checked"
  "reason": null, // when not-checked: "no-location" | "stale" | "accuracy-too-poor"
  "distanceMeters": 2203000,
  "thresholdMeters": 16093,
  "tier": "precise",
}
```

`not-checked` carries a reason so we can measure how often the guardrail does nothing, and why.
A feature that silently skips most sessions looks fine in code review and achieves nothing.

## Transport: not a webhook

A webhook is a server-to-server callback to a public URL. **A browser has no address to be called
back at**, so there is nothing to register. Server-to-client push on the web means WebSocket,
Server-Sent Events, polling, or the Push API via a service worker.

**None of those are needed here.** The check is haversine plus a threshold lookup — microseconds of
compute and one round trip, on the order of 50–200ms. Standing up a socket or an SSE channel to
deliver an answer that fast is permanent machinery for no latency gain.

Push would earn its place only if the server-side check becomes genuinely slow: reverse geocoding,
a routing API for drive time, or a model. While it stays distance-and-threshold, plain
request/response is the right shape.

## Non-blocking is a property of the call site, not the transport

**"Must not hold up the UI" and "request/response" are not in conflict.** A UI blocks because
something is awaited before paint or before a button is enabled — not because the transport is
synchronous.

So: fire the POST without awaiting it in the critical path, let the response patch a signal, and
render the warning if and when that signal fills in. The order flow never waits on it. No socket,
no correlation infrastructure, no webhook.

## Timing, and the race it creates

**Fire the check when the store is selected, or when the cart or checkout page renders.** Not at
submit.

If the answer arrives after the order is placed it is worthless — telling someone their Dallas
pickup looks wrong when it is already in the kitchen helps nobody. Firing early also makes the
latency question moot: there are seconds of human time available, not milliseconds.

That introduces a race. The customer selects store A, the request goes out, they switch to store B,
and the response describing A arrives. The client **must discard a response whose `storeId` no
longer matches the current selection** — which is why the response echoes it. Straightforward, and
silently wrong if missed.

## The comparison, server-side

A fix is not a point. It is a circle: a centre, and `accuracy` as a radius in metres at 95%
confidence. Comparing the centre against a threshold discards that and produces confident wrong
answers.

The honest comparison uses the **near edge** of the circle:

```
distanceToStore - accuracyMeters > threshold(tier)   →   confidently too far
otherwise                                            →   inconclusive, say nothing
```

Worked through:

- 48m accuracy, store 60km away, 10-mile threshold. `60000 - 48 > 16093` → warn. Correct.
- 25km accuracy, store 35km away, 10-mile threshold. `35000 - 25000` is 10km → no warning. Also
  correct: the customer could be standing in the car park.
- Dallas fix, New York store. ~2,200km, dwarfing any accuracy radius → warn. This is the case
  product asked for, and it fires at any precision.

**Only ever warn on the confident side.** A needless warning aimed at someone already in the car
park costs more trust than a missed warning costs, because the missed warning is simply today's
behaviour.

### A consequence product needs to know about the 10-mile figure

Because accuracy is added to the threshold in effect, **a 10-mile radius is only meaningful with a
precise fix.** For a fuzzy fix with 25km (≈15.5 mile) accuracy, warning requires the store to be
more than ~41km (≈25 miles) away. The configured number is not the number that applies.

That is not a bug — it is the uncertainty being handled honestly — but whoever sets "10 miles" in
the admin portal should know it behaves as roughly 25 for IP-located customers. It is also the
strongest argument for the per-tier thresholds product already wants: each tier's number should be
chosen knowing its own accuracy radius sits on top.

## Server-side decision table

| Condition                                          | Outcome                             |
| -------------------------------------------------- | ----------------------------------- |
| No coordinates sent and IP fallback yields nothing | `not-checked` / `no-location`       |
| `fixTimestamp` older than `maxFixAgeSeconds`       | `not-checked` / `stale`             |
| `accuracyMeters > maxUsableAccuracyMeters`         | `not-checked` / `accuracy-too-poor` |
| `distance - accuracy > threshold(tier)`            | `too-far`                           |
| Anything else                                      | `ok`                                |
| Config unavailable, or the check errors            | `not-checked`                       |

Every unknown resolves to **no warning**. The guardrail fails open. We must never discourage an
order because we could not locate someone — that is revenue, and they may simply be indoors.

## Precision tiers

Named by trust rather than technology, because the technology is not what people assume — a
browser "precise" fix is usually a wifi-BSSID lookup, not GPS.

| Tier      | Source                        | Typical accuracy         | Determined by |
| --------- | ----------------------------- | ------------------------ | ------------- |
| `precise` | Browser geolocation           | 20m – few hundred m      | Client        |
| `manual`  | A zip code the customer typed | Zip centroid, a few km   | Client        |
| `fuzzy`   | IP of the inbound request     | 5km – 50km, worse on VPN | Server        |

**IP is the weakest tier and is actively misleading for this use case.** A customer on a VPN or
corporate proxy can resolve to another state, producing exactly the false positive this feature
most needs to avoid. Treat `fuzzy` results as a last resort, and consider whether a `fuzzy`
mismatch should warn at all or merely be recorded.

A typed zip code is _more_ accurate than IP, needs no vendor and no permission. If the warning ever
needs to prompt for anything, asking for a zip is the cheaper ask.

## The stale-fix trap

**The most important trap here, and the worked example is the trap itself.**

Caching the device's last known position is right for pre-filling a store list. It is dangerous
here. Take the Dallas → New York case with a persisted fix and no fresh grant:

- Persisted fix: Dallas, from last week.
- Selected store: Dallas.
- Distance: ~0. Conclusion: "looks fine."

The guardrail would confidently clear the exact scenario it was built to catch. A stale fix is
worse than no fix: no fix fails open and silent, a stale fix fails **closed and confident**.

Hence:

- A persisted fix must not be sent unless it is within `maxFixAgeSeconds`, and the server re-checks
  regardless.
- That window is short — minutes. It is a different number from how long a fix stays useful for
  pre-filling a store list, and the two should not share a constant.
- Outside the window, either request a fresh fix (needs a user gesture, so it has to hang off the
  customer's own action) or send no coordinates and let the server fall back to IP.

## Does v1 need precise location at all?

The failures product described are **cross-metro** — Dallas versus New York, not one Dallas store
versus another three miles away. Cross-metro mismatches fire at any precision tier, including IP.

So it is worth answering, from order data, before building much: **how far apart are the real
mistakes?** If the tail is mostly hundreds of miles, the server-side IP check alone solves the
problem — no permission prompt, no sticky denials, no OS-layer support burden, and no coordinates
leaving the browser. If there is a meaningful same-metro tail, precise earns its place.

This is the single question that most changes the size of the work.

## Threshold configuration

Lives with the admin portal, read server-side. Rough shape:

```jsonc
{
  "version": 1,
  "thresholds": {
    "precise": { "maxDistanceMeters": 16093 }, // ~10 miles
    "manual": { "maxDistanceMeters": 24140 }, // ~15 miles
    "fuzzy": { "maxDistanceMeters": 40234 }, // ~25 miles
  },
  "maxUsableAccuracyMeters": 50000,
  "maxFixAgeSeconds": 600,
}
```

- **Fail open if it cannot be read.** No config means no check, not a default threshold. A wrong
  threshold applied confidently is worse than no guardrail.
- Validated and versioned on read.
- Thresholds are **straight-line** distances. Whoever sets 10 miles should know it means 10 as the
  crow flies, which can be a 25-minute drive. A routing API would be more accurate and is not worth
  it for a guardrail.
- Worth deciding whether thresholds vary by market; dense urban and rural markets will not want the
  same number.

## What this library would need

Modest, because the decision left.

1. **`source` on `LocationFix`** — `'precise' | 'manual'` from the client's side. Flagged as a TODO
   in `store.ts` already.
2. **A persisted slice**, versioned and validated on read, holding the fix, its `source` and its
   `timestamp`. The timestamp is what makes the freshness rule enforceable. Round the persisted
   coordinates (3 decimal places, ~100m) and set a retention window.
3. **Per-device capability memory.** We cannot ask whether OS location services are on. But if this
   device has previously returned a `precise` fix, all three permission layers were working at that
   moment. Persisting "has ever gone precise" is a legitimate prior — not a guarantee — and lets the
   UI lead with "Use my location" on a device that has done it before.
4. **Freshness cannot be a plain `computed`.** `Date.now()` is not reactive, so a computed over it
   reports "fresh" forever after one read. Evaluate it as a function call at the moment of sending,
   or feed a clock signal. Better decided than discovered as a bug.

Nothing about stores, distances or thresholds. This library's job stays "where is this device, how
sure are we, and how did we find out".

## What is no longer in scope for the client

Removed from the earlier draft now that the decision is server-side:

- Haversine distance in `shared-utils` — the server owns the maths.
- A client-side fetch of the threshold config — the server reads it.
- The client-side decision table — replaced by the server one above.

What the client gains instead: posting the payload, discarding mismatched responses, and rendering
the outcome.

## Open questions — product's to answer

1. **How far apart are the real mistakes?** Decides whether precise location is needed at all, and
   therefore whether this feature involves a permission prompt. Pull from order data first.
2. **Warn or block?** This note assumes warn. A block would be wrong: ordering pickup from home 30
   miles away and driving there is legitimate, as is ordering for a store near where you are about
   to land. A block needs its own conversation with numbers attached.
3. **Should a `fuzzy` mismatch warn**, or only be recorded? IP is wrong often enough on VPNs that
   warning on it may cost more than it saves.
4. **Does the warning ever ask for location**, or only use what we already have? Checkout is the
   highest-intent moment and the worst one to interrupt.
5. **What does the customer see when we have no location?** This note says nothing at all,
   silently. Confirm that over a "we could not verify" message.
6. **Is a dismissed warning remembered**, so it does not reappear for the same store on the same
   device?

## Measuring it

Thresholds are guesses until measured, so instrumentation ships with the feature, not after:

- How often `too-far` fires, split by tier.
- What the customer does next: change store, continue anyway, or abandon. **Abandonment is the
  number that says the threshold is too tight.**
- How often the outcome is `not-checked`, by reason. If most sessions skip, the feature is not doing
  anything however well the logic reads.

Without the second of those there is no way to tell a working guardrail from an annoying one.

## Privacy

Using location to validate an order selection is a **new purpose** for that data, distinct from
finding a nearby store. Worth confirming the existing disclosure covers it before shipping.

Moving the decision server-side raises the stakes: coordinates now reach request logs, APM traces
and potentially the warehouse, rather than staying in the browser. Decide up front that
**coordinates are rounded or scrubbed in observability payloads specifically** — Datadog will
otherwise retain a precise customer location for weeks, which is far harder to unwind than to
prevent. The rounding and retention in point 2 above are the engineering half of this; the
disclosure is not.
