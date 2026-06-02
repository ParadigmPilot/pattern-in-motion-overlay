# Pattern in Motion overlay

Animated mnemonic overlay for the Restaurant Pattern. Renders inside the Intake Triager hosted demo (and any other consumer) by subscribing to the substrate hook contract published in [`CONTRACT.md`](./CONTRACT.md).

## What this is

The Pattern in Motion overlay is the visible half of the Restaurant Pattern's pattern-in-motion feature. The other half — the substrate — lives in `intake-triager` and emits `step_started` / `step_ended` events as the seven-state machine advances through a turn. This package contains React components that subscribe to those events and render them as motion (pin renderer, trace renderer, mode toggle, manual-mode overlay, and downstream components per `station-architecture-scoping-document.md` v1.3).

This package is genuinely detachable from `intake-triager`. It depends only on the public hook contract surface. The `/example` harness in this repo ships a self-contained mock substrate so the overlay runs without the reference implementation present.

**Shipped today:** `<Pin>` · `<Trace>` · `<Pill>` · `useStepStates`. **Coming:** `<Toggle>` (Manual / Automatic mode switch), manual-mode overlay, response-ready strip, capture.

## Install

```bash
npm install @paradigmpilot/pattern-in-motion-overlay
```

Peer dependency: `react ^18`.

## Quick start

Drop `<Pin>` and `<Trace>` into a host application that exposes a substrate matching the hook contract:

```jsx
import { Pin, Trace } from '@paradigmpilot/pattern-in-motion-overlay';

function ChatView({ substrate }) {
  return (
    <>
      <Pin substrate={substrate} />
      {/* user message */}
      <Trace substrate={substrate} />
      {/* assistant response */}
    </>
  );
}
```

Both components subscribe automatically. As the substrate fires `step_started` / `step_ended` events, Pin spotlights the active step and Trace marks the corresponding pill `active`, then `complete`.

## Composition — your own steps (N != 6, or non-Restaurant-Pattern domain)

For apps that don't model the Restaurant Pattern's six Service steps, compose a custom container around `<Pill>` and `useStepStates`:

```jsx
import { Pill, useStepStates } from '@paradigmpilot/pattern-in-motion-overlay';

// Stable reference required — define at module scope or wrap in useMemo.
const MY_STEPS = ['intake', 'triage', 'diagnose', 'treat', 'discharge'];

export function MyWorkflowTrace({ substrate }) {
  const states = useStepStates(substrate, MY_STEPS);

  return (
    <ol className="my-trace" aria-label="Workflow progress">
      {MY_STEPS.map((stepId) => (
        <Pill key={stepId} stepId={stepId} state={states.get(stepId)} />
      ))}
    </ol>
  );
}
```

The hook handles subscription lifecycle and state-map mechanics; `<Pill>` handles rendering. Your substrate fires `step_started` / `step_ended` events with your `stepId` values; the hook ignores events whose `stepId` is not in `MY_STEPS`.

To render labels on Pills, pass a `manifest` prop. The seven-field manifest shape is the hook contract's (see [`CONTRACT.md`](./CONTRACT.md)), but `<Pill>` only reads `restaurant_label` and `technology_label` — you can pass any object with those two fields.

## API reference

### `<Pin substrate />`

Ephemeral per-state spotlight. Renders a single active step at a time; returns to inert when no step is active. State-class CSS and inline-SVG icons included. Restaurant-Pattern-specific (hardcoded to the six canonical Service steps).

| Prop | Type | Required |
| --- | --- | --- |
| `substrate` | `{ subscribe, loadManifest }` | yes |

### `<Trace substrate />`

Restaurant-Pattern-specific six-pill row. Hardcoded to the canonical Service steps in canonical order. Subscribes to substrate events and resolves manifests automatically.

| Prop | Type | Required |
| --- | --- | --- |
| `substrate` | `{ subscribe, loadManifest }` | yes |

### `<Pill stepId state manifest? />`

Pure presentational step-badge primitive. No substrate subscription. Renders as `<li>` for use inside `<ol>` / `<ul>`.

| Prop | Type | Required | Notes |
| --- | --- | --- | --- |
| `stepId` | `string` | yes | Any string; opaque to Pill |
| `state` | `'queued' \| 'active' \| 'complete'` | yes | Drives the state class |
| `manifest` | `{ restaurant_label, technology_label, ... }` | no | When present, renders both labels; when absent, falls back to stepId text |

### `useStepStates(substrate, steps)`

Subscribes to substrate events and maintains a `Map<stepId, state>` for the provided steps.

| Argument | Type | Notes |
| --- | --- | --- |
| `substrate` | `{ subscribe }` | Host-bound substrate adapter |
| `steps` | `string[]` | Step IDs in render order; MUST have stable reference across renders |

Returns `Map<string, 'queued' \| 'active' \| 'complete'>`. All steps initialized to `'queued'`. Updates on matching `step_started` (→ `'active'`) and `step_ended` (→ `'complete'`); unmatched events ignored.

## AI coding agents

For AI coding agents (Claude Code, Cursor, Copilot) integrating this package, see [`AGENTS.md`](./AGENTS.md) for structured task recipes.

## Develop locally

```bash
npm install
npm run dev     # starts Vite; open the URL it prints to see the /example harness
npm test        # runs Vitest (24 passing, 6 it.todo on main)
npm run lint    # runs ESLint
```

## Structure

```
pattern-in-motion-overlay/
├── src/                 # overlay components and hooks
│   ├── pin/             # <Pin> renderer
│   ├── trace/           # <Trace> renderer (Restaurant-Pattern-specific)
│   ├── pill/            # <Pill> primitive (generic, composable)
│   ├── hooks/           # useStepStates and other shared hooks
│   └── index.js         # public API entry
├── example/             # /example harness
│   ├── index.html
│   ├── main.jsx
│   └── mock-substrate.js
├── test/
│   └── setup.js         # Vitest + Testing Library setup
├── package.json
├── vite.config.js
├── eslint.config.js
└── LICENSE
```

## License

This repository is currently published under an "All Rights Reserved" placeholder. The terminal license posture is governed by RP-BL-11 (brand-positioning ADR, scheduled Cycle 317 in [`restaurant-pattern-portfolio-scoping-document.md`](https://github.com/ParadigmPilot/ServiceBridge/blob/main/products/hopper/project-management/cycles/313/restaurant-pattern-portfolio-scoping-document.md) §6.3 step 2). Until then, this repo is public for transparency but not yet open-source-licensed.

## Related governance

- [`CONTRACT.md`](./CONTRACT.md) — substrate consumer contract
- [`SIGNATURES.md`](./SIGNATURES.md) — per-export signatures (consumer-facing JSDoc mirror)
- [`AGENTS.md`](./AGENTS.md) — AI-coding-agent integration guide
- [`station-architecture-scoping-document.md`](https://github.com/ParadigmPilot/ServiceBridge/blob/main/products/hopper/project-management/cycles/311/station-architecture-scoping-document.md) — overlay architecture (state machine, manifest schema, component roadmap)
- [`reference-implementation-vs-overlay-scoping-document.md`](https://github.com/ParadigmPilot/ServiceBridge/blob/main/products/hopper/project-management/cycles/312/reference-implementation-vs-overlay-scoping-document.md) — separation contract (Option C Fully Detached)
- [`restaurant-pattern-portfolio-scoping-document.md`](https://github.com/ParadigmPilot/ServiceBridge/blob/main/products/hopper/project-management/cycles/313/restaurant-pattern-portfolio-scoping-document.md) — portfolio contract
