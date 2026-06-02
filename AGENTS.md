# Agent Integration Guide — pattern-in-motion-overlay

This file is written for AI coding agents (Claude Code, Cursor, Copilot, etc.) integrating this package into a host application. Human developers should refer to the [README](./README.md).

## Package identity

`@paradigmpilot/pattern-in-motion-overlay` is a React component library that renders an LLM application's request-response lifecycle in motion. It is the visible half of the Restaurant Pattern's pattern-in-motion feature; the substrate half lives in `intake-triager`. The package is also a generic step-progress UI kit via its `<Pill>` + `useStepStates` primitives.

## Decision tree — which primitive to use

```
Is the host app a Restaurant Pattern implementation
with the six canonical Service steps?
│
├── Yes → import { Trace, Pin } from package;
│         mount with substrate prop. Done.
│
└── No  → import { Pill, useStepStates } from package;
          write a thin custom container (~15 lines)
          using your own stable steps array.
```

Do not attempt to use `<Trace>` or `<Pin>` for non-Restaurant-Pattern domains — both hardcode the six canonical Service steps and their iconography. Use `<Pill>` + `useStepStates` instead.

## Required substrate shape

The host application must provide a substrate object with this minimum interface:

```js
const substrate = {
  // Required for all primitives.
  subscribe(callback) {
    // Register `callback` to receive events of shape:
    //   { type: 'step_started' | 'step_ended', stepId: string, timestamp: number }
    // Return a function that unregisters the callback when invoked.
  },

  // Required for  and  only.
  loadManifest(stepId) {
    return {
      restaurant_label: '...',
      technology_label: '...',
      animation_asset: '...',
      plain_english: '...',
      in_code: '...',
      just_finished: '...',
      up_next: '...',
    };
  },
};
```

Events whose `type` is neither `'step_started'` nor `'step_ended'` are ignored. Events whose `stepId` is not in the consuming primitive's steps array are ignored.

The substrate consumer contract is published locally in [`CONTRACT.md`](./CONTRACT.md) with per-export JSDoc in [`SIGNATURES.md`](./SIGNATURES.md).

## Task: integrate `<Trace>` + `<Pin>` (Restaurant Pattern host)

1. Verify the host substrate exposes both `subscribe` and `loadManifest`.
2. Install: `npm install @paradigmpilot/pattern-in-motion-overlay`.
3. Mount Pin and Trace in the chat / response UI:

```jsx
import { Pin, Trace } from '@paradigmpilot/pattern-in-motion-overlay';

function ChatView({ substrate }) {
  return (
    <>
      
      {/* user message */}
      
      {/* assistant response */}
    </>
  );
}
```

4. Verify by triggering a turn. Expected behavior:
   - All six Trace pills transition queued → active → complete in canonical order.
   - Pin spotlights the currently-active step and returns to inert between steps.

## Task: integrate `<Pill>` + `useStepStates` (custom step count or non-Restaurant-Pattern domain)

1. Define your steps array at module scope (stable reference is required):

```js
const MY_STEPS = ['step_a', 'step_b', 'step_c']; // any count, any names
```

2. Implement a substrate matching the required shape. Your substrate fires `step_started` / `step_ended` events whose `stepId` values are members of `MY_STEPS`.

3. Write a thin container:

```jsx
import { Pill, useStepStates } from '@paradigmpilot/pattern-in-motion-overlay';

const MY_STEPS = ['step_a', 'step_b', 'step_c'];

export function MyTrace({ substrate }) {
  const states = useStepStates(substrate, MY_STEPS);
  return (
    
      {MY_STEPS.map((stepId) => (
        
      ))}
    
  );
}
```

4. (Optional) Pass `manifest` props if you have label data. Pill renders `manifest.restaurant_label` and `manifest.technology_label` when both are present; otherwise it falls back to rendering the `stepId` text.

## Common pitfalls

1. **Unstable steps array.** Passing a fresh array literal to `useStepStates` on every render causes the hook to re-subscribe on every render. Define `steps` at module scope or wrap in `useMemo`.
2. **subscribe must return an unsubscribe function.** A substrate whose `subscribe` returns `void` (or anything non-callable) leaks listeners on unmount.
3. **`<Pill>` renders `<li>`.** It must sit inside `<ol>` or `<ul>` for valid HTML. Non-list contexts are an owed future extension (polymorphic `as` prop, not yet implemented).
4. **`<Pin>` and `<Trace>` are Restaurant-Pattern-specific.** Both hardcode the six canonical Service steps and their iconography. For other domains, use `<Pill>` + `useStepStates`, not `<Pin>` or `<Trace>`.
5. **The substrate is not in this package.** The substrate lives in the host application (`intake-triager` for the reference Restaurant Pattern implementation). This package only consumes the substrate's public surface.

## Canonical references

- Substrate consumer contract: [`CONTRACT.md`](./CONTRACT.md) (local)
- Per-export JSDoc signatures: [`SIGNATURES.md`](./SIGNATURES.md) (local)
- Architecture: [`station-architecture-scoping-document.md`](https://github.com/ParadigmPilot/ServiceBridge/blob/main/products/hopper/project-management/cycles/311/station-architecture-scoping-document.md) (in `ParadigmPilot/ServiceBridge`)
- Methodology: `therestaurantpattern.com` (public methodology site)
