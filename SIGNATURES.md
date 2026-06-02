# Pattern-in-Motion Substrate Signatures

> Per-export signatures for the four public exports of the pattern-in-motion substrate. Mirrors the JSDoc on the substrate source. For narrative description of the contract — public surface, subscription mechanism, state set, boundary rules — see [`CONTRACT.md`](./CONTRACT.md).
>
> **Source of truth:** JSDoc on the substrate package source. This document is a consumer-facing mirror; when this document and the JSDoc disagree, the JSDoc wins by convention.

---

## `createStateMachine()`

Constructs a new state machine instance tracking the set of currently active Service steps. Initial active set: only `'at_the_table'`. Concurrency model: set-of-active-steps (multiple Service steps may be active simultaneously).

**Parameters:** None.

**Returns:** `StateMachine` — A frozen facade exposing:

| Method | Signature | Description |
| --- | --- | --- |
| `startStep` | `(stepId: string) => void` | Begin a Service step. Adds `stepId` to the active set. Removes `'at_the_table'` if it was present. |
| `endStep` | `(stepId: string) => void` | End a Service step. Removes `stepId` from the active set. Restores `'at_the_table'` when no Service steps remain active. |
| `getActiveSteps` | `() => Set<string>` | Returns a frozen snapshot of the currently active step IDs. |
| `isActive` | `(stepId: string) => boolean` | True if the given `stepId` is in the active set. |
| `reset` | `() => void` | Returns the machine to the initial state (only `'at_the_table'` active). |

**Throws:**

- `Error` — if `startStep` is called for an unknown stepId, an already-active stepId, or `'at_the_table'` (implicit-idle, not startable).
- `Error` — if `endStep` is called for an unknown stepId, an inactive stepId, or `'at_the_table'`.

**Example:**

```js
import { createStateMachine } from '[substrate-package]';

const machine = createStateMachine();
machine.startStep('take_the_order');   // active: { take_the_order }
machine.endStep('take_the_order');     // active: { at_the_table }
```

---

## `createEventStream(stateMachine)`

Wraps a state machine with `step_started` / `step_ended` event emission and a subscription mechanism. Emission ordering: the underlying state machine updates first; the event emits second. If the state machine throws, no event is emitted and the error propagates.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `stateMachine` | `StateMachine` | A state machine instance from `createStateMachine`. |

**Returns:** `EventStream` — A frozen facade exposing:

| Method | Signature | Description |
| --- | --- | --- |
| `startStep` | `(stepId: string) => void` | Updates the underlying state machine; emits `step_started` on success. |
| `endStep` | `(stepId: string) => void` | Updates the underlying state machine; emits `step_ended` on success. |
| `subscribe` | `(callback: (event: StepEvent) => void) => () => void` | Register a callback for every emitted event. Returns an unsubscribe function. |

**Event shape (`StepEvent`):**

```js
{
  type: 'step_started' | 'step_ended',
  stepId: 'at_the_table' | 'take_the_order' | 'brief_the_chef'
        | 'plate_the_dish' | 'read_the_ticket' | 'serve_by_type'
        | 'stock_the_pantry',
  timestamp: number,   // milliseconds since the Unix epoch
}
```

**Throws:**

- `Error` — if `stateMachine` is missing or does not expose `startStep` and `endStep` methods.
- `Error` — if `subscribe` is called with a non-function callback.
- Any error from the underlying state machine's `startStep` / `endStep` propagates; no event is emitted on failure.

**Example:**

```js
import { createStateMachine, createEventStream } from '[substrate-package]';

const machine = createStateMachine();
const stream = createEventStream(machine);

const unsubscribe = stream.subscribe((event) => {
  console.log(event.type, event.stepId, event.timestamp);
});

stream.startStep('take_the_order');   // logs: step_started take_the_order [ms]
stream.endStep('take_the_order');     // logs: step_ended take_the_order [ms]

unsubscribe();                         // detach
```

---

## `loadManifest(stepId, manifests)`

Resolves the seven-field per-state manifest for a given `stepId` from a caller-provided manifests dictionary. Pure function — performs no I/O. Validation scope is structural only (all seven required fields present and `stepId` is a known key); content rules are enforced separately by `validateContent`.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `stepId` | `string` | The step identifier to resolve (one of the seven). |
| `manifests` | `Record<string, Manifest>` | Dictionary of manifests keyed by stepId. |

**Returns:** `Readonly<Manifest>` — A frozen copy of the resolved manifest.

**Manifest shape (seven required fields):**

```js
{
  restaurant_label: string,    // Restaurant-frame label for the step
  technology_label: string,    // Technology-frame label for the step
  animation_asset: string,     // Asset key for the pin-renderer animation
  plain_english:    string,    // Plain-English explanation of the step
  in_code:          string,    // Technology-frame operation name (operations, not frameworks)
  just_finished:    string,    // Restaurant-frame recap of the prior step
  up_next:          string,    // Restaurant-frame "Next: [Verb] ... — [why]" pointer to the next step
}
```

**Throws:**

- `Error` — if `stepId` is not a non-empty string.
- `Error` — if `manifests` is missing or not an object.
- `Error` — if `stepId` is not a key in `manifests` (lists available keys).
- `Error` — if the manifest at `stepId` is not a plain object.
- `Error` — if the manifest is missing one or more required fields (lists missing fields).

**Example:**

```js
import { loadManifest } from '[substrate-package]';

const manifests = {
  take_the_order: {
    restaurant_label: 'Take the Order',
    technology_label: 'Capture intent',
    animation_asset: 'pin-take-order',
    plain_english: 'Capture what the patron is asking for.',
    in_code: 'parseIntent',
    just_finished: 'Just seated at the table.',
    up_next: 'Next: Brief the Chef — translate intent into a recipe.',
  },
  // ... six more entries ...
};

const manifest = loadManifest('take_the_order', manifests);
console.log(manifest.up_next);
```

---

## `validateContent(manifest, stepId)`

Validates a manifest's content against the content rules defined in [`station-architecture-scoping-document.md`](https://github.com/ParadigmPilot/ServiceBridge/blob/main/products/hopper/project-management/cycles/311/station-architecture-scoping-document.md). Advisory — returns diagnostics; does NOT throw on content violations. Argument-shape errors (programmer errors) DO throw `TypeError`.

**Currently enforced rules:**

- **Order/Turn dual-frame** — Restaurant-frame fields forbid the word `"turn"`; Technology-frame fields forbid the word `"order"`.
- **up_next verb-shape** — `up_next` must start with `"Next: <Verb> "` where Verb is one of `Take | Brief | Plate | Read | Serve | Stock | Contemplating`, and must contain a space-flanked em-dash (`" — "`) separating the verb phrase from the "why" clause.

**Scaffolded pending vocabulary canon:**

- frame-sealing (Restaurant-frame + technology-frame allowlists)
- in_code operations-not-frameworks (framework denylist)

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `manifest` | `Manifest` | The manifest to validate. |
| `stepId` | `string` | The stepId the manifest belongs to (echoed into each diagnostic). |

**Returns:** `Diagnostic[]` — Empty array = clean; non-empty array = one or more content violations.

**Diagnostic shape:**

```js
{
  rule:    string,   // e.g. 'order-turn-dual-frame', 'up-next-verb-shape'
  stepId:  string,   // the manifest's stepId
  field:   string,   // the manifest field where the violation was found
  message: string,   // human-readable description
}
```

**Throws:**

- `TypeError` — if `manifest` is not a plain object (null, array, or non-object).
- `TypeError` — if `stepId` is not a non-empty string.

**Example:**

```js
import { validateContent } from '[substrate-package]';

const diagnostics = validateContent(manifest, 'take_the_order');
if (diagnostics.length > 0) {
  diagnostics.forEach((d) =>
    console.warn(`[${d.rule}] ${d.field}: ${d.message}`),
  );
}
```

---

## Source of truth & drift discipline

The authoritative signature source is the JSDoc on the substrate package source files. This document is a consumer-facing mirror authored at the time of overlay release. When this document and the JSDoc disagree, the JSDoc wins by convention; the appendix gets corrected in the next overlay release.

For the rationale behind the narrative-`CONTRACT.md` + signature-`SIGNATURES.md` split, see [`decision-memo-contract-signatures-location.md`](https://github.com/ParadigmPilot/ServiceBridge/blob/main/products/hopper/project-management/cycles/313/decision-memo-contract-signatures-location.md).

---

## Versioning

| Version | Date | Notes |
| --- | --- | --- |
| 1.0 | 2026-06-01 | Initial publication. Mirrors substrate JSDoc as of breakout 313.3.a (intake-triager `main` at the time the breakout opened). |
