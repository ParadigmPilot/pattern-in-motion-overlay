import { useEffect, useState } from 'react';
import './manual-overlay.css';

/**
 * ManualOverlay renderer (Component #6) — the assistant-area teaching panel.
 *
 * Subscribes to the host-provided substrate's event stream (register in
 * `useEffect`, return the unsubscribe for cleanup). Reconstructs the active
 * step set from `step_started` / `step_ended` events so it can detect
 * return-to-idle under the set-of-active-steps model (Steps 05/06 may overlap).
 * When the active set is empty (idle — implicit `at_the_table`), the component
 * renders nothing (`null`).
 *
 * Steps 01–04: renders the six per-state teaching elements in reading order,
 * then a labeled advance button.
 *
 * Step 05 swap (D-WS2-13): on `serve_by_type` the overlay is REPLACED by the
 * host-supplied LLM response prose (`responseProse`). The prose persists
 * through Step 06 (`stock_the_pantry`, background) until the turn returns to
 * idle. Prose mode carries no advance button — the teaching overlay, button
 * included, is gone; the prose is the content.
 *
 * `just_finished` first-entry conditional — MOOT (recorded, no code): the
 * manifest canon populates `just_finished` for all seven states including the
 * idle `at_the_table` state, and #6 never renders at idle, so the
 * "blank on first entry, populated thereafter" rule has no render site at
 * which to bite. The pre-05 overlay always shows the canon value as-is.
 *
 * `animation_asset` is not consumed here (pin renderer's). The #7
 * response-ready strip mounts adjacent to #6, never nested inside it.
 *
 * @param {Object} props
 * @param {{ subscribe: Function, loadManifest: Function }} props.substrate
 *   Host-bound substrate adapter. `subscribe(callback)` returns an unsubscribe
 *   function; `loadManifest(stepId)` returns a frozen seven-field manifest.
 * @param {string} props.responseProse
 *   The LLM response prose shown when the visitor reaches Step 05. Host-supplied
 *   because the substrate is sealed to events-only (A2 contract).
 * @param {() => void} props.onAdvance
 *   Called when the advance button is clicked (Steps 01–04 only). The host
 *   decides what advancing means (e.g. `gate.advance()`).
 */

const SERVICE_STEPS = [
  'take_the_order',
  'brief_the_chef',
  'plate_the_dish',
  'read_the_ticket',
  'serve_by_type',
  'stock_the_pantry',
];

const SERVE_STEP = 'serve_by_type';

export function ManualOverlay({ substrate, responseProse, onAdvance }) {
  const [activeSteps, setActiveSteps] = useState(() => new Set());
  const [currentStepId, setCurrentStepId] = useState(null);
  const [reachedServe, setReachedServe] = useState(false);

  useEffect(() => {
    const unsubscribe = substrate.subscribe((event) => {
      if (event.type === 'step_started') {
        setActiveSteps((prev) => new Set(prev).add(event.stepId));
        setCurrentStepId(event.stepId);
        if (event.stepId === SERVE_STEP) {
          setReachedServe(true);
        }
      } else if (event.type === 'step_ended') {
        setActiveSteps((prev) => {
          const next = new Set(prev);
          next.delete(event.stepId);
          return next;
        });
      }
    });
    return unsubscribe;
  }, [substrate]);

  // Return-to-idle: when the active set empties, reset turn-scoped state.
  useEffect(() => {
    if (activeSteps.size === 0) {
      setReachedServe(false);
      setCurrentStepId(null);
    }
  }, [activeSteps]);

  // Idle (implicit at_the_table): render nothing.
  if (activeSteps.size === 0) {
    return null;
  }

  // Step 05 onward (D-WS2-13): overlay swaps to the LLM response prose and
  // persists through Step 06 until return-to-idle. No advance button.
  if (reachedServe) {
    return (
      <section
        className="manual-overlay manual-overlay--prose"
        aria-live="polite"
        data-step-id={SERVE_STEP}
      >
        <p className="manual-overlay-response">{responseProse}</p>
      </section>
    );
  }

  // Defensive: no current step resolved yet.
  if (currentStepId === null) {
    return null;
  }

  // Steps 01–04: the six-element teaching overlay + advance button.
  const manifest = substrate.loadManifest(currentStepId);
  const stepNumber = String(SERVICE_STEPS.indexOf(currentStepId) + 1).padStart(2, '0');

  return (
    <section
      className="manual-overlay"
      aria-live="polite"
      data-step-id={currentStepId}
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
