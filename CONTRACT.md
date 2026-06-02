# Pattern-in-Motion Substrate Contract

> The canonical public contract for the pattern-in-motion substrate. The substrate exposes a small surface; the overlay (and any other consumer) subscribes to it; no other access is supported.

---

## What is this?

The pattern-in-motion substrate is the underlying machinery — state tracker, event emitter, manifest loader, content validator — that the visible overlay plugs into. The reference implementation lives in [`ParadigmPilot/intake-triager`](https://github.com/ParadigmPilot/intake-triager); consumers (the pin renderer, the manual-mode UI, third-party overlay packages) subscribe to its event stream and read its per-state manifests.

This document is narrative: it names the public surface, describes the subscription mechanism, lists the state set, and states the boundary rules. For per-export signatures (parameter types, return shapes, `@throws` conditions, examples), see [`SIGNATURES.md`](./SIGNATURES.md).

---

## What you can call

The substrate's public surface consists of four exports:

| Export | Kind | Purpose |
| --- | --- | --- |
| `createStateMachine` | Constructor | Construct a state machine that tracks the set of active Service steps. |
| `createEventStream` | Constructor | Wrap a state machine with `step_started` / `step_ended` event emission and a subscription mechanism. |
| `loadManifest` | Function | Resolve the seven-field per-state manifest for a given stepId. Structural validation only. |
| `validateContent` | Function | Advisory content-rule validation. Returns diagnostics; does not throw on content violations. |

For per-export parameter types, return shapes, and `@throws` conditions, see [`SIGNATURES.md`](./SIGNATURES.md). For an executable minimal substrate, see [`example/mock-substrate.js`](./example/mock-substrate.js).

---

## How subscribing works

Construct a state machine, wrap it in an event stream, and subscribe a callback:

- Every successful state transition emits exactly one event.
- Events carry `type` (`'step_started'` or `'step_ended'`), `stepId` (one of the seven), and `timestamp` (milliseconds since the Unix epoch).
- `subscribe()` returns an **unsubscribe function**. Call it to detach. The shape is intentionally compatible with React's `useEffect` cleanup convention.
- Emission ordering: the state machine updates first; the event emits second. If the state machine throws (e.g., starting an already-active step), no event is emitted.

For exact signatures and error conditions, see [`SIGNATURES.md`](./SIGNATURES.md).

---

## State set

The substrate tracks seven step IDs as plain strings. Consumers reference them as string literals:

- `'at_the_table'` — idle / initial state. Returned to when no Service steps are active.
- `'take_the_order'` — Step 01.
- `'brief_the_chef'` — Step 02.
- `'plate_the_dish'` — Step 03.
- `'read_the_ticket'` — Step 04.
- `'serve_by_type'` — Step 05.
- `'stock_the_pantry'` — Step 06.

`at_the_table` is implicit-idle. It cannot be started or ended via `startStep` / `endStep`; it is added to and removed from the active set automatically as Service steps begin and end.

---

## Boundary rules

Consumers **MUST NOT** reach into substrate-implementer internals. The four exports listed under [What you can call](#what-you-can-call) are the entire public surface. Anything else — internal modules, side-effect imports, implementation-specific directories — is unsupported and may break without notice.

This boundary is enforced by convention, not by tooling. The convention exists so that:

- Substrate implementations remain substitutable behind the public surface.
- Overlay packages remain genuinely detachable from any single substrate implementation.
- Third-party consumers have a stable contract to build against without coordinating on implementer-internal details.

For the separation posture between the reference implementation and the overlay, see [`reference-implementation-vs-overlay-scoping-document.md`](https://github.com/ParadigmPilot/ServiceBridge/blob/main/products/hopper/project-management/cycles/312/reference-implementation-vs-overlay-scoping-document.md) §Scope.

If you find yourself wanting to import something outside this contract, open a discussion before doing it. The contract can evolve; introspection cannot.

---

## Versioning & Change Notes

| Version | Date | Notes |
| --- | --- | --- |
| 1.0 | 2026-06-01 | Initial overlay-canonical publication (A2 surface). Relocated from `intake-triager/src/substrate/HOOK_CONTRACT.md` per breakout 313.3.a; per-export signatures moved to companion [`SIGNATURES.md`](./SIGNATURES.md). Versioning policy (SemVer discipline, release mechanism, compatibility coupling, registry choice) deferred — see [`reference-implementation-vs-overlay-scoping-document.md`](https://github.com/ParadigmPilot/ServiceBridge/blob/main/products/hopper/project-management/cycles/312/reference-implementation-vs-overlay-scoping-document.md) §Open Items. Absence of a versioning policy here is intentional, not an oversight. |
