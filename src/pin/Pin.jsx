import { useEffect, useState } from 'react';
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

const SVG_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.5',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
};

const STEP_ICONS = {
  take_the_order: (
    <svg {...SVG_PROPS}>
      <rect x="6" y="4" width="12" height="16" rx="1.5" />
      <rect x="9.5" y="3" width="5" height="3" rx="0.5" />
      <line x1="9" y1="10" x2="15" y2="10" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  ),
  brief_the_chef: (
    <svg {...SVG_PROPS}>
      <path d="M7 14 C 7 9, 10 8, 10 8 C 10 5, 14 5, 14 8 C 14 8, 17 9, 17 14 L 17 17 L 7 17 Z" />
      <rect x="7" y="17" width="10" height="3" />
    </svg>
  ),
  plate_the_dish: (
    <svg {...SVG_PROPS}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="10" cy="11" r="1.3" />
      <circle cx="14" cy="11" r="1.3" />
      <circle cx="12" cy="14" r="1.3" />
    </svg>
  ),
  read_the_ticket: (
    <svg {...SVG_PROPS}>
      <path d="M6 4 L 18 4 L 18 19 L 16 21 L 14 19 L 12 21 L 10 19 L 8 21 L 6 19 Z" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="15" x2="13" y2="15" />
    </svg>
  ),
  serve_by_type: (
    <svg {...SVG_PROPS}>
      <rect x="4" y="10" width="16" height="6" rx="1" />
      <line x1="2" y1="13" x2="4" y2="13" />
      <line x1="20" y1="13" x2="22" y2="13" />
      <circle cx="9" cy="13" r="1.5" />
      <circle cx="15" cy="13" r="1.5" />
    </svg>
  ),
  stock_the_pantry: (
    <svg {...SVG_PROPS}>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <line x1="4" y1="11" x2="20" y2="11" />
      <line x1="4" y1="17" x2="20" y2="17" />
      <circle cx="8" cy="8.5" r="1.4" />
      <circle cx="14" cy="8.5" r="1.4" />
      <rect x="6" y="13" width="3" height="3" rx="0.3" />
      <rect x="13" y="13" width="3.5" height="3" rx="0.3" />
    </svg>
  ),
};

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
