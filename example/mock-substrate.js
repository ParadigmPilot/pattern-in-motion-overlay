/**
 * Mock substrate for the /example harness.
 *
 * Satisfies the public surface declared by
 * intake-triager/src/substrate/HOOK_CONTRACT.md without depending on
 * the reference implementation. Fires step_started / step_ended events
 * on a scripted turn timeline.
 *
 * The seven step IDs match HOOK_CONTRACT.md exactly. at_the_table is
 * the implicit-idle state and is not started/ended explicitly.
 */

const SERVICE_STEPS = [
  'take_the_order',
  'brief_the_chef',
  'plate_the_dish',
  'read_the_ticket',
  'serve_by_type',
  'stock_the_pantry'
];

const STEP_DURATION_MS = 600;

export function createMockSubstrate() {
  const listeners = new Set();

  function emit(event) {
    for (const listener of listeners) {
      listener(event);
    }
  }

  function subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  }

  function runScriptedTurn() {
    let delay = 0;
    for (const stepId of SERVICE_STEPS) {
      setTimeout(() => emit({ type: 'step_started', stepId, timestamp: Date.now() }), delay);
      setTimeout(() => emit({ type: 'step_ended',   stepId, timestamp: Date.now() }), delay + STEP_DURATION_MS);
      delay += STEP_DURATION_MS;
    }
  }

  return { subscribe, runScriptedTurn };
}
