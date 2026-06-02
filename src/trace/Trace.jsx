import { useMemo } from 'react';
import { useStepStates } from '../hooks/useStepStates.js';
import { Pill } from '../pill/Pill.jsx';
import { STEP_ICONS } from '../icons/StepIcons.jsx';
import './Trace.css';

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
 * Controlled / uncontrolled (WO-313.5a):
 *   - Uncontrolled (no `states` prop): Trace owns a live `useStepStates`
 *     subscription for the current turn. This is the default and the
 *     third-party recipe.
 *   - Controlled (`states` prop provided): Trace renders presentationally
 *     from the supplied Map and does NOT subscribe. A controlled Trace is
 *     therefore immune to later substrate events — the basis for persisting
 *     a finished turn in chat history while later turns animate on the same
 *     shared event stream.
 *
 * The host owns turn boundaries (per CONTRACT.md — the substrate tracks
 * steps, not turns; no turn-end event is emitted). A chat-history container
 * stacks finished turns as controlled `<Trace>` rows and renders the active
 * turn as an uncontrolled `<Trace>`, inline and co-located with chat per
 * D-WS2-1. See example/main.jsx for the worked harness.
 *
 * @param {Object} props
 * @param {{ subscribe: Function, loadManifest: Function }} props.substrate
 *   Host-bound substrate adapter. Must expose `subscribe(callback)` returning
 *   an unsubscribe function, and `loadManifest(stepId)` returning a frozen
 *   seven-field manifest per HOOK_CONTRACT.md.
 * @param {Map<string, 'queued'|'active'|'complete'>} [props.states]
 *   Optional frozen per-step state Map. When provided, Trace renders from it
 *   and does not subscribe (controlled mode). When omitted, Trace subscribes
 *   live (uncontrolled mode).
 */

const SERVICE_STEPS = [
  'take_the_order',
  'brief_the_chef',
  'plate_the_dish',
  'read_the_ticket',
  'serve_by_type',
  'stock_the_pantry',
];

export function Trace({ substrate, states }) {
  const manifests = useMemo(() => {
    const m = {};
    for (const stepId of SERVICE_STEPS) {
      m[stepId] = substrate.loadManifest(stepId);
    }
    return m;
  }, [substrate]);

  // Controlled: render from supplied states; do not subscribe.
  if (states) {
    return <TraceRow states={states} manifests={manifests} />;
  }

  // Uncontrolled: own a live subscription for the current turn.
  return <LiveTrace substrate={substrate} manifests={manifests} />;
}

/**
 * Uncontrolled subscriber. Isolated as its own component so the
 * `useStepStates` hook is mounted only in uncontrolled mode — a controlled
 * Trace never instantiates it, and therefore never subscribes.
 */
function LiveTrace({ substrate, manifests }) {
  const states = useStepStates(substrate, SERVICE_STEPS);
  return <TraceRow states={states} manifests={manifests} />;
}

/** Pure presentational six-pill row. */
function TraceRow({ states, manifests }) {
  return (
    <ol className="trace" aria-label="Service step progress">
      {SERVICE_STEPS.map((stepId) => (
        <Pill
          key={stepId}
          stepId={stepId}
          state={states.get(stepId)}
          manifest={manifests[stepId]}
          icon={STEP_ICONS[stepId]}
        />
      ))}
    </ol>
  );
}
