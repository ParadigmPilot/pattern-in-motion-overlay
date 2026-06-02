/**
 * @paradigmpilot/pattern-in-motion-overlay
 *
 * Public API entry. Subscribes to the substrate hook contract
 * (intake-triager/src/substrate/HOOK_CONTRACT.md) and renders the
 * Restaurant Pattern's pattern-in-motion overlay.
 *
 * Component lineup:
 *   Pin            — ephemeral per-state spotlight (WO-313.2.a — shipped)
 *   Pill           — generic Service-step badge primitive (WO-313.4.a — this scaffold)
 *   Trace          — Restaurant-Pattern-specific six-pill row (WO-313.4.a — this scaffold)
 *   useStepStates  — generic step-state subscription hook (WO-313.4.a — this scaffold)
 *   Toggle         — Manual / Automatic mode switch (WO-313.7)
 *   Cycle 314+     — manual-mode overlay, response-ready strip, capture
 *
 * Composition guide for third-party use cases (N != 6 steps, non-Restaurant-
 * Pattern domains): import { Pill, useStepStates } and compose a custom
 * container. See README §Composition and AGENTS.md for worked examples.
 */

export { Pin } from './pin/Pin.jsx';
export { Pill } from './pill/Pill.jsx';
export { Trace } from './trace/Trace.jsx';
export { useStepStates } from './hooks/useStepStates.js';

export const VERSION = '0.0.0';
