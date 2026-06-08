import { useEffect, useState } from 'react';
import './manual-overlay.css';

/**
 * ManualOverlay renderer (Component #6) — the assistant-area teaching panel.
 *
 * Subscribes to the host-provided substrate's event stream (the same approach
 * Pin / Trace use; register in `useEffect`, return the unsubscribe for
 * cleanup). On `step_started`, tracks the active step and resolves its manifest
 * via `substrate.loadManifest`; on `step_ended`, clears active state when the
 * ending step matches the active one. When no Service step is active (idle —
 * the implicit `at_the_table` state per HOOK_CONTRACT), the component renders
 * nothing (`null`).
 *
 * For the active step it renders the six per-state teaching elements in reading
 * order, then a labeled advance button:
 *   1. Step indicator + `restaurant_label` (the anchor)  — "Step 02 · Brief the Chef"
 *   2. `technology_label` (the pegged term)
 *   3. `plain_english` (the explanation)
 *   4. `in_code`, visibly prefixed `IN CODE:`
 *   5. `just_finished` (continuity line — rendered as-is)
 *   6. `up_next` (what's-next preview)
 *   + an "Advance →" button that calls `onAdvance` on click.
 *
 * Scaffold scope (WO-314.3b): `animation_asset` is not consumed here. The
 * Step-05 overlay→prose swap, the `just_finished` first-entry blank, the #7
 * response-ready strip, and animation treatment are deferred to later WOs.
 *
 * @param {Object} props
 * @param {{ subscribe: Function, loadManifest: Function }} props.substrate
 *   Host-bound substrate adapter. Must expose `subscribe(callback)` returning
 *   an unsubscribe function, and `loadManifest(stepId)` returning a frozen
 *   seven-field manifest per HOOK_CONTRACT.md.
 * @param {() => void} props.onAdvance
 *   Called when the advance button is clicked. The host decides what advancing
 *   means (e.g. `gate.advance()`); the overlay only signals intent.
 */

const SERVICE_STEPS = [
  'take_the_order',
  'brief_the_chef',
  'plate_the_dish',
  'read_the_ticket',
  'serve_by_type',
  'stock_the_pantry',
];

export function ManualOverlay({ substrate, onAdvance }) {
  const [activeStepId, setActiveStepId] = useState(null);

  useEffect(() => {
    const unsubscribe = substrate.subscribe((event) => {
      if (event.type === 'step_started') {
        setActiveStepId(event.stepId);
      } else if (event.type === 'step_ended') {
        setActiveStepId((current) => (current === event.stepId ? null : current));
      }
    });
    return unsubscribe;
  }, [substrate]);

  // Idle (implicit at_the_table): render nothing.
  if (activeStepId === null) {
    return null;
  }

  const manifest = substrate.loadManifest(activeStepId);
  const stepNumber = String(SERVICE_STEPS.indexOf(activeStepId) + 1).padStart(2, '0');

  return (
    <section
      className="manual-overlay"
      aria-live="polite"
      data-step-id={activeStepId}
    >
      <header className="manual-overlay-step">
        <span className="manual-overlay-step-index">Step {stepNumber} ·</span>{' '}
        <strong className="manual-overlay-anchor">{manifest.restaurant_label}</strong>
      </header>
      <p className="manual-overlay-peg">{manifest.technology_label}</p>
      <p className="manual-overlay-plain">{manifest.plain_english}</p>
      <p className="manual-overlay-in-code">
        <span className="manual-overlay-in-code-label">IN CODE:</span>{' '}
        {manifest.in_code}
      </p>
      <p className="manual-overlay-just-finished">{manifest.just_finished}</p>
      <p className="manual-overlay-up-next">{manifest.up_next}</p>
      <button
        type="button"
        className="manual-overlay-advance"
        onClick={onAdvance}
      >
        Advance →
      </button>
    </section>
  );
}
