import { useEffect, useState } from 'react';

/**
 * useStepStates — subscribe to substrate events and maintain per-step state.
 *
 * Reactively returns a Map<stepId, 'queued' | 'active' | 'complete'> that
 * updates as the substrate fires `step_started` / `step_ended` events.
 * Events whose `stepId` is not a member of the provided `steps` array are
 * ignored.
 *
 * This hook powers `<Trace>` internally and is exported so third-party
 * developers can build custom multi-step containers using `<Pill>`. The
 * 3rd-party recipe — useStepStates + N × Pill — is the same recipe Trace
 * dogfoods for the Restaurant Pattern's six canonical Service steps.
 *
 * See README §Composition and AGENTS.md for worked examples.
 *
 * @param {{ subscribe: Function }} substrate
 *   Host-bound substrate adapter. Must expose `subscribe(callback)`
 *   returning an unsubscribe function. Events delivered to the callback
 *   must carry `type` (`'step_started'` | `'step_ended'`) and `stepId`.
 *
 * @param {string[]} steps
 *   Step IDs in render order. MUST have stable reference identity across
 *   renders — define at module scope or wrap in `useMemo`. A fresh array
 *   literal on every render will cause the hook to re-subscribe on every
 *   render. The initial states map is computed once at mount; if the
 *   `steps` reference changes after mount, existing state entries are
 *   preserved and new step IDs are not auto-initialized.
 *
 * @returns {Map<string, 'queued' | 'active' | 'complete'>}
 *   Map keyed by stepId. All steps initialized to `'queued'` at mount.
 */
export function useStepStates(substrate, steps) {
  const [states, setStates] = useState(() => {
    const map = new Map();
    for (const stepId of steps) {
      map.set(stepId, 'queued');
    }
    return map;
  });

  useEffect(() => {
    const unsubscribe = substrate.subscribe((event) => {
      if (event.type !== 'step_started' && event.type !== 'step_ended') return;
      if (!steps.includes(event.stepId)) return;
      setStates((current) => {
        const next = new Map(current);
        next.set(event.stepId, event.type === 'step_started' ? 'active' : 'complete');
        return next;
      });
    });
    return unsubscribe;
  }, [substrate, steps]);

  return states;
}
