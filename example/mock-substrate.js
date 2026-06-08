import { manifests as FIXTURE_MANIFESTS } from './manifests-fixture.js';

/**
 * Mock substrate for the /example harness.
 *
 * Acts as a host adapter: bundles the raw substrate exports declared by
 * intake-triager/src/substrate/HOOK_CONTRACT.md (subscribe, manifests-dict-
 * aware loadManifest) into a single object that overlay components consume.
 * Fires step_started / step_ended events on a scripted turn timeline.
 *
 * Manifest content is supplied by ./manifests-fixture.js — a labeled,
 * verbatim mirror of the intake-triager per-state canon (commit 3161c1a),
 * carried here only so Component #6 can render against real content.
 * Canonical manifest content lives with the host (intake-triager), not in
 * the overlay repo; the fixture is a read-only mirror, not a second source.
 *
 * The seven step IDs match HOOK_CONTRACT.md exactly. `at_the_table` is the
 * implicit-idle state and is not started/ended explicitly; the fixture
 * carries all seven states (including `at_the_table`) so #6 can render the
 * idle-state narrative.
 */

export const SERVICE_STEPS = [
  'take_the_order',
  'brief_the_chef',
  'plate_the_dish',
  'read_the_ticket',
  'serve_by_type',
  'stock_the_pantry'
];

/**
 * Speed presets surfaced via the harness UI. Consumers pick a preset name
 * and pass the corresponding milliseconds value into runScriptedTurn.
 */
export const SPEED_PRESETS = {
  slow: 2000,
  default: 1200,
  fast: 400,
};

const DEFAULT_STEP_DURATION_MS = SPEED_PRESETS.default;

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

  /**
   * Host-bound loadManifest — wraps HOOK_CONTRACT's two-argument
   * loadManifest(stepId, manifests) with this mock's manifests dict.
   * Overlay components consume this one-argument shape; they do not
   * carry the manifests dict themselves.
   */
  function loadManifest(stepId) {
    const manifest = FIXTURE_MANIFESTS[stepId];
    if (!manifest) {
      throw new Error(`mock-substrate.loadManifest: unknown stepId "${stepId}"`);
    }
    return manifest;
  }

  /**
   * Run a scripted turn at the given per-step duration. Defaults to
   * SPEED_PRESETS.default when no argument is passed. Each step emits
   * step_started immediately, then step_ended after stepDurationMs.
   */
  function runScriptedTurn(stepDurationMs = DEFAULT_STEP_DURATION_MS) {
    // Manual mode loads the whole turn at once (duration 0): emit
    // synchronously so the gate buffers every step before the first Advance,
    // and the harness can reveal step 1 on the same Send press.
    if (stepDurationMs === 0) {
      for (const stepId of SERVICE_STEPS) {
        emit({ type: 'step_started', stepId, timestamp: Date.now() });
        emit({ type: 'step_ended',   stepId, timestamp: Date.now() });
      }
      return;
    }
    let delay = 0;
    for (const stepId of SERVICE_STEPS) {
      setTimeout(() => emit({ type: 'step_started', stepId, timestamp: Date.now() }), delay);
      setTimeout(() => emit({ type: 'step_ended',   stepId, timestamp: Date.now() }), delay + stepDurationMs);
      delay += stepDurationMs;
    }
  }

  return { subscribe, loadManifest, runScriptedTurn };
}
