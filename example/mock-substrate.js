/**
 * Mock substrate for the /example harness.
 *
 * Acts as a host adapter: bundles the raw substrate exports declared by
 * intake-triager/src/substrate/HOOK_CONTRACT.md (subscribe, manifests-dict-
 * aware loadManifest) into a single object that overlay components consume.
 * Fires step_started / step_ended events on a scripted turn timeline.
 *
 * Manifest content here is intentionally synthetic — the seven-field shape
 * per D-WS1-6 is honored, but `technology_label` and the four narrative
 * fields carry placeholder strings rather than canonical methodology copy.
 * Canonical manifest content lives with the host (e.g., intake-triager),
 * not in the overlay repo. The mock illustrates the contract, not the canon.
 *
 * The seven step IDs match HOOK_CONTRACT.md exactly. `at_the_table` is the
 * implicit-idle state and is not started/ended explicitly.
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

/**
 * Derive a Title-Case Restaurant-frame label from a stepId.
 *   'take_the_order' -> 'Take the Order'
 * Short articles ('the', 'a', 'an', 'of', 'in', 'on', 'to', 'by') stay
 * lowercased except as the first word.
 */
function titleCaseRestaurantLabel(stepId) {
  const minorWords = new Set(['the', 'a', 'an', 'of', 'in', 'on', 'to', 'by']);
  return stepId
    .split('_')
    .map((word, idx) => {
      if (idx > 0 && minorWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Build the synthetic seven-field manifests dictionary for the mock.
 * Restaurant labels derived from stepId; remaining fields placeholder.
 */
function buildMockManifests() {
  const manifests = {};
  for (const stepId of SERVICE_STEPS) {
    manifests[stepId] = Object.freeze({
      restaurant_label: titleCaseRestaurantLabel(stepId),
      technology_label: `(tech label for ${stepId})`,
      animation_asset: `(asset for ${stepId})`,
      plain_english: `(plain-English explanation for ${stepId})`,
      in_code: `(operation name for ${stepId})`,
      just_finished: `(just-finished recap for ${stepId})`,
      up_next: `(up-next pointer for ${stepId})`,
    });
  }
  return Object.freeze(manifests);
}

const MOCK_MANIFESTS = buildMockManifests();

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
    const manifest = MOCK_MANIFESTS[stepId];
    if (!manifest) {
      throw new Error(`mock-substrate.loadManifest: unknown stepId "${stepId}"`);
    }
    return manifest;
  }

  function runScriptedTurn() {
    let delay = 0;
    for (const stepId of SERVICE_STEPS) {
      setTimeout(() => emit({ type: 'step_started', stepId, timestamp: Date.now() }), delay);
      setTimeout(() => emit({ type: 'step_ended',   stepId, timestamp: Date.now() }), delay + STEP_DURATION_MS);
      delay += STEP_DURATION_MS;
    }
  }

  return { subscribe, loadManifest, runScriptedTurn };
}
