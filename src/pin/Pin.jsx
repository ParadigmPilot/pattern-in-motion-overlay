import { useEffect, useState } from 'react';

/**
 * Pin renderer — ephemeral per-state spotlight that animates during a turn.
 *
 * Subscribes to the host-provided substrate's event stream. On `step_started`,
 * tracks the active step and resolves its manifest via `substrate.loadManifest`.
 * On `step_ended`, clears active state when the ending step matches the active
 * one. Returns to inert idle render when no Service step is active (the
 * implicit `at_the_table` state per HOOK_CONTRACT).
 *
 * Mnemonic hierarchy per D-WS1-7: Restaurant frame is the anchor (`<strong>`
 * semantic weight, `pin-anchor` class); technology frame is the supporting peg
 * (`<span>`, `pin-peg` class).
 *
 * State-class CSS for motion lands in WO-313.3 (OBJ-1 close). This scaffold
 * carries semantic structure and lifecycle wiring only.
 *
 * @param {Object} props
 * @param {{ subscribe: Function, loadManifest: Function }} props.substrate
 *   Host-bound substrate adapter. Must expose `subscribe(callback)` returning
 *   an unsubscribe function, and `loadManifest(stepId)` returning a frozen
 *   seven-field manifest per HOOK_CONTRACT.md.
 */
export function Pin({ substrate }) {
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

  if (activeStepId === null) {
    return (
      <div className="pin pin-idle" aria-live="polite" aria-atomic="true">
        <strong className="pin-anchor">&nbsp;</strong>
        <span className="pin-peg">&nbsp;</span>
      </div>
    );
  }

  const manifest = substrate.loadManifest(activeStepId);

  return (
    <div
      className="pin pin-active"
      aria-live="polite"
      aria-atomic="true"
      data-step-id={activeStepId}
    >
      <strong className="pin-anchor">{manifest.restaurant_label}</strong>
      <span className="pin-peg">{manifest.technology_label}</span>
    </div>
  );
}
