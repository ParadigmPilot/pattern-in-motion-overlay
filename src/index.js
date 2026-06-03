/**
 * @paradigmpilot/pattern-in-motion-overlay
 *
 * Public API entry. Subscribes to the substrate hook contract
 * (`./CONTRACT.md`) and renders the Restaurant Pattern's pattern-in-motion
 * overlay.
 *
 * Component lineup:
 *   Pin             — ephemeral per-state spotlight (scaffold WO-313.2.a; CSS+icons WO-313.3.a — shipped)
 *   Pill            — generic Service-step badge primitive (scaffold WO-313.4.a; CSS+icons WO-313.6.a)
 *   Trace           — Restaurant-Pattern-specific six-pill row (scaffold WO-313.4.a; persistence WO-313.5.a; CSS+icons WO-313.6.a)
 *   useStepStates   — generic step-state subscription hook (WO-313.4.a — shipped)
 *   STEP_ICONS      — Restaurant Service-step icon set (WO-313.6.a)
 *   SVG_PROPS       — SVG container convention for authored icons (WO-313.6.a)
 *   Toggle          — Manual / Automatic mode switch (WO-313.7)
 *   Cycle 314+      — manual-mode overlay, response-ready strip, capture
 *
 * Composition guide for third-party use cases (N != 6 steps, non-Restaurant-
 * Pattern domains): import { Pill, useStepStates } and compose a custom
 * container. See README §Composition and AGENTS.md for worked examples.
 */

export { Pin } from './pin/Pin.jsx';
export { Pill } from './pill/Pill.jsx';
export { Trace } from './trace/Trace.jsx';
export { useStepStates } from './hooks/useStepStates.js';
export { STEP_ICONS, CHECK_ICON, SVG_PROPS } from './icons/StepIcons.jsx';

export const VERSION = '0.0.0';
