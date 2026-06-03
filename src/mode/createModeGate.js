/**
 * createModeGate — buffer-and-release mode gate for the pattern-in-motion
 * overlay (Manual / Automatic).
 *
 * Wraps a substrate adapter (CONTRACT.md surface) and returns the same
 * shape, so overlay components (Pin, Trace, useStepStates) subscribe to the
 * gate exactly as they would subscribe to the substrate — they never know a
 * gate is present.
 *
 * Why a gate (Session 313.7 decision, Option B): the substrate emits on its
 * own timeline and cannot be paused (a production substrate fires when real
 * work happens; the mock fires on setTimeout). In Manual mode the events have
 * already happened — pacing their *reveal* is a renderer-side concern, not a
 * substrate pause. The gate buffers events in Manual and releases them one
 * per `advance()` call; in Automatic it forwards them immediately. Switching
 * Manual -> Automatic flushes the buffer (delivers the backlog).
 *
 * Mode is NOT persisted here. Persistence (localStorage) is the host's
 * concern; see example/main.jsx for the reference recipe.
 *
 * @param {{ subscribe: Function, loadManifest?: Function, runScriptedTurn?: Function }} substrate
 *   Host-bound substrate adapter (CONTRACT.md surface).
 * @param {'manual' | 'automatic'} [initialMode='manual']
 *   Starting mode. Manual is the first-time-visitor default (D-WS2-12).
 *   Any value other than 'automatic' is coerced to 'manual'.
 *
 * @returns {{
 *   subscribe: (cb: Function) => () => void,
 *   loadManifest: Function,
 *   runScriptedTurn: Function,
 *   setMode: (mode: 'manual' | 'automatic') => void,
 *   getMode: () => 'manual' | 'automatic',
 *   advance: () => boolean,
 *   pendingCount: () => number,
 *   reset: () => void,
 *   teardown: () => void
 * }}
 */
export function createModeGate(substrate, initialMode = 'manual') {
  let mode = initialMode === 'automatic' ? 'automatic' : 'manual';
  const downstream = new Set();
  const queue = [];

  function deliver(event) {
    for (const listener of downstream) {
      listener(event);
    }
  }

  const unsubscribeUpstream = substrate.subscribe((event) => {
    if (mode === 'automatic') {
      deliver(event);
    } else {
      queue.push(event);
    }
  });

  function subscribe(callback) {
    downstream.add(callback);
    return () => downstream.delete(callback);
  }

  function setMode(next) {
    if (next !== 'manual' && next !== 'automatic') return;
    const previous = mode;
    mode = next;
    if (previous === 'manual' && next === 'automatic') {
      while (queue.length > 0) {
        deliver(queue.shift());
      }
    }
  }

  function getMode() {
    return mode;
  }

  function advance() {
    if (mode !== 'manual') return false;
    if (queue.length === 0) return false;
    deliver(queue.shift());
    return true;
  }

  function pendingCount() {
    return queue.length;
  }

  function reset() {
    queue.length = 0;
  }

  function teardown() {
    unsubscribeUpstream();
    downstream.clear();
    queue.length = 0;
  }

  return {
    subscribe,
    loadManifest: (...args) => substrate.loadManifest(...args),
    runScriptedTurn: (...args) => substrate.runScriptedTurn(...args),
    setMode,
    getMode,
    advance,
    pendingCount,
    reset,
    teardown,
  };
}
