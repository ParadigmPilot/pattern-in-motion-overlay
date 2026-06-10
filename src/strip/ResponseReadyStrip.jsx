import { useEffect, useState } from 'react';
import './response-ready-strip.css';

/**
 * ResponseReadyStrip (Component #7) — assistant-area status strip.
 *
 * Subscribes to the host-provided substrate's event stream (register in
 * `useEffect`, return the unsubscribe for cleanup), exactly as the other
 * overlay components do.
 *
 * Lifecycle (D-WS2-14): the strip appears the moment Step 03
 * (`plate_the_dish`) ends in the background stream, persists through Step 04
 * (`read_the_ticket`), and disappears when Step 05 (`serve_by_type`) starts —
 * at which point the overlay (#6) swaps to the response prose and the strip's
 * job is done. Before Step 03 ends the strip renders nothing (`null`); there
 * is deliberately no "Chef is writing…" indicator.
 *
 * Visibility is derived directly from three named events rather than from a
 * reconstructed active-step set: `plate_the_dish` end shows it, `serve_by_type`
 * start hides it, and `take_the_order` start resets it for a fresh turn. This
 * is timing-independent — it does not depend on the active set transiting
 * empty between adjacent steps.
 *
 * Manual-mode scoping is host-owned: the host gates mounting (shown in
 * Manual, skipped in Automatic), so this component takes no mode prop.
 *
 * Mounts ADJACENT to the ManualOverlay (#6) in the assistant area — never
 * nested inside it (D-WS2-14; station-arch §6.1 row #7).
 *
 * @param {Object} props
 * @param {{ subscribe: Function }} props.substrate
 *   Host-bound substrate adapter. `subscribe(callback)` returns an
 *   unsubscribe function.
 */

const TAKE_STEP = 'take_the_order';   // Step 01 — new-turn reset
const PLATE_STEP = 'plate_the_dish';  // Step 03 — its end shows the strip
const SERVE_STEP = 'serve_by_type';   // Step 05 — its start hides the strip

const STRIP_COPY = 'Response ready · advance to Step 5 to see it served';

export function ResponseReadyStrip({ substrate }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = substrate.subscribe((event) => {
      if (event.type === 'step_started') {
        if (event.stepId === TAKE_STEP || event.stepId === SERVE_STEP) {
          setVisible(false);
        }
      } else if (event.type === 'step_ended' && event.stepId === PLATE_STEP) {
        setVisible(true);
      }
    });
    return unsubscribe;
  }, [substrate]);

  if (!visible) {
    return null;
  }

  return (
    <div className="response-ready-strip" role="status" aria-live="polite">
      {STRIP_COPY}
    </div>
  );
}
