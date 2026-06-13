// src/compose/createTurnDriver.js
//
// Universal turn-driver for the pattern-in-motion overlay (WO-315.3c1).
//
// Maps a host's generic turn lifecycle onto the six Service-step events of
// the substrate event stream. Host-agnostic: it keys off two lifecycle
// moments (turn submitted, turn responded), not off any host internals, so
// ANY host that announces those moments can drive the overlay.
//
// THE SCHEDULE — honesty note (full version lands as the 3c framing note):
//   Only TWO of the six steps map to real, client-observable signals:
//     • turnSubmitted → take_the_order   (real: the patron's message is sent)
//     • turnResponded → plate_the_dish ENDS (real: the reply has arrived)
//   The other four steps are the MNEMONIC NARRATION of the turn, not
//   telemetry of server-side pipeline stages. The browser cannot observe
//   "brief the chef" or "read the ticket" happening inside one non-streaming
//   POST; the overlay teaches the SHAPE of the pipeline, it does not measure
//   it (Restaurant Pattern = a mnemonic system — station-arch D-WS1-12).
//
// Emission across the latency window:
//   turnSubmitted(): take + brief fire fully; plate_the_dish STARTS and stays
//     open — the open step IS the latency dwell (the chef is cooking).
//   turnResponded(): plate_the_dish ENDS (→ response-ready strip, D-WS2-14),
//     then read + serve + stock fire fully (→ Step-05 prose swap, D-WS2-13).
//
// Boundaries:
//   • Reveal pacing + early/late response ordering are the gate's job
//     (createModeGate); this driver only emits in causal order.
//   • Failure handling (abort + reset) is the composition's job (it owns the
//     state machine + gate). This driver assumes a CLEAN machine at each
//     turnSubmitted — guaranteed on the happy path (which returns to idle
//     after stock_the_pantry) and by the composition's reset on failure.
//   • The stream is sealed to events-only (A2 contract); the reply PROSE is
//     NOT carried here — the composition holds it for the overlay.

const SUBMIT_STEPS = ['take_the_order', 'brief_the_chef'];
const LATENCY_STEP = 'plate_the_dish';
const RESPOND_STEPS = ['read_the_ticket', 'serve_by_type', 'stock_the_pantry'];

/**
 * @param {{ startStep: (id: string) => void, endStep: (id: string) => void }} stream
 *   The substrate event stream (CONTRACT.md EventStream facade).
 * @returns {{ turnSubmitted: () => void, turnResponded: () => void }}
 * @throws {Error} If `stream` does not expose startStep and endStep.
 */
export function createTurnDriver(stream) {
  if (
    !stream ||
    typeof stream.startStep !== 'function' ||
    typeof stream.endStep !== 'function'
  ) {
    throw new Error(
      'createTurnDriver: requires a stream with startStep and endStep methods',
    );
  }

  function fire(stepId) {
    stream.startStep(stepId);
    stream.endStep(stepId);
  }

  return Object.freeze({
    turnSubmitted() {
      for (const id of SUBMIT_STEPS) fire(id);
      stream.startStep(LATENCY_STEP); // stays open across the latency window
    },
    turnResponded() {
      stream.endStep(LATENCY_STEP);
      for (const id of RESPOND_STEPS) fire(id);
    },
  });
}
