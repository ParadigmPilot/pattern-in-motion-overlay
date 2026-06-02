import { useMemo } from 'react';
import { useStepStates } from '../hooks/useStepStates.js';
import { Pill } from '../pill/Pill.jsx';

/**
 * Trace renderer — six-pill row of Service-step progress per turn.
 *
 * Trace is Restaurant-Pattern-specific by design — hardcoded to the six
 * canonical Service steps in canonical order. For other step counts or
 * domains, use `useStepStates` + `Pill` directly to build a custom
 * container. See README §Composition for a worked third-party example.
 *
 * Specializes against Pin per D-WS2-8 + H3: Pin is ephemeral (single
 * active state, returns to inert between/after); Trace is persistent
 * across the turn (all six pills always rendered, state accumulates).
 *
 * Composes `useStepStates` for subscription + per-pill state tracking,
 * resolves manifests via `substrate.loadManifest` for each canonical step,
 * and renders six `<Pill>` primitives in canonical order inside an
 * `<ol class="trace">`.
 *
 * Persistence across turns / chat-history mount semantics land in WO-313.5
 * (OBJ-2 continuation). This scaffold carries per-turn render only.
 *
 * @param {Object} props
 * @param {{ subscribe: Function, loadManifest: Function }} props.substrate
 *   Host-bound substrate adapter. Must expose `subscribe(callback)` returning
 *   an unsubscribe function, and `loadManifest(stepId)` returning a frozen
 *   seven-field manifest per HOOK_CONTRACT.md.
 */

const SERVICE_STEPS = [
  'take_the_order',
  'brief_the_chef',
  'plate_the_dish',
  'read_the_ticket',
  'serve_by_type',
  'stock_the_pantry',
];

export function Trace({ substrate }) {
  const states = useStepStates(substrate, SERVICE_STEPS);

  const manifests = useMemo(() => {
    const m = {};
    for (const stepId of SERVICE_STEPS) {
      m[stepId] = substrate.loadManifest(stepId);
    }
    return m;
  }, [substrate]);

  return (
    <ol className="trace" aria-label="Service step progress">
      {SERVICE_STEPS.map((stepId) => (
        <Pill
          key={stepId}
          stepId={stepId}
          state={states.get(stepId)}
          manifest={manifests[stepId]}
        />
      ))}
    </ol>
  );
}
