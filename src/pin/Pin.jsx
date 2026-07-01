import { useEffect, useState } from 'react';
import { STEP_ICONS } from '../icons/StepIcons.jsx';
import './Pin.css';

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
 * State-class CSS in `./Pin.css`; per-step SVG iconography via STEP_ICONS map.
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
        <span className="pin-icon" aria-hidden="true" />
        <div className="pin-text">
          <strong className="pin-anchor">&nbsp;</strong>
          <span className="pin-peg">&nbsp;</span>
        </div>
      </div>
    );
  }

  const manifest = substrate.loadManifest(activeStepId);

  return (
    <div
      className="pin pin-active"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-step-id={activeStepId}
    >
      <span className="pin-icon" aria-hidden="true">
        {STEP_ICONS[activeStepId]}
      </span>
      <div className="pin-text">
        <strong className="pin-anchor">{manifest.restaurant_label}</strong>
        <span className="pin-peg">{manifest.technology_label}</span>
      </div>
    </div>
  );
}
