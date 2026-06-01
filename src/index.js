/**
 * @paradigmpilot/pattern-in-motion-overlay
 *
 * Public API entry. Subscribes to the substrate hook contract
 * (intake-triager/src/substrate/HOOK_CONTRACT.md) and renders the
 * Restaurant Pattern's pattern-in-motion overlay.
 *
 * Component lineup:
 *   Pin        — ephemeral per-state spotlight (WO-313.2.a — this scaffold)
 *   Trace      — six-pill row, chat-history persistent (WO-313.4)
 *   Toggle     — Manual / Automatic mode switch (WO-313.7)
 *   Cycle 314+ — manual-mode overlay, response-ready strip, capture
 */

export { Pin } from './pin/Pin.jsx';

export const VERSION = '0.0.0';
