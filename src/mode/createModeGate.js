/**
 * createModeGate — buffer-and-release mode gate for the pattern-in-motion
 * overlay (Manual / Automatic).
 *
 * Wraps a substrate adapter (CONTRACT.md surface) and returns the same shape,
 * so overlay components (Pin, Trace, useStepStates) subscribe to the gate
 * exactly as they would subscribe to the substrate — they never know a gate
 * is present.
 *
 * Why a gate (Session 313.7 decision, Option B): the substrate emits on its
 * own timeline and cannot be paused. In Manual mode the events have already
 * happened — pacing their *reveal* is a renderer-side concern. The gate
 * buffers events in Manual and releases them one *step* at a time via
 * `advance()`; in Automatic it forwards them immediately.
 *
 * Release granularity is one Service step ("up to and including the next
 * step_started"). `setMode` only sets the mode — it never delivers buffered
 * events. Playing a buffered backlog out automatically is an explicit action:
 * the host calls `playRemaining(intervalMs)` (typically from a Send press),
 * which replays the backlog one step per interval and aborts if the mode
 * returns to Manual. Switching Manual -> Automatic alone moves nothing; new
 * upstream events forward live and the existing backlog waits for a play.
 *
 * Mode is NOT persisted here. Persistence (localStorage) is the host's
 * concern; see example/main.jsx for the reference recipe.
 *
 * @param {{ subscribe: Function, loadManifest?: Function, runScriptedTurn?: Function }} substrate
 *   Host-bound substrate adapter (CONTRACT.md surface).
 * @param {'manual' | 'automatic'} [initialMode='manual']
 *   Starting mode. Manual is the first-time-visitor default (D-WS2-12). Any
 *   value other than 'automatic' is coerced to 'manual'.
 *
 * @returns {{
 *   subscribe: (cb: Function) => () => void,
 *   loadManifest: Function,
 *   runScriptedTurn: Function,
 *   setMode: (mode: 'manual' | 'automatic') => void,
 *   getMode: () => 'manual' | 'automatic',
 *   advance: () => boolean,
 *   playRemaining: (intervalMs?: number) => void,
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

  // Release one Service step's worth of buffered events: events up to and
  // including the next step_started. If no further step_started remains
  // (the trailing step_ended of the last step), drain everything left.
  function releaseStep() {
    if (queue.length === 0) return false;
    const hasFutureStart = queue.some((event) => event.type === 'step_started');
    if (!hasFutureStart) {
      while (queue.length > 0) deliver(queue.shift());
      return true;
    }
    while (queue.length > 0) {
      const event = queue.shift();
      deliver(event);
      if (event.type === 'step_started') break;
    }
    return true;
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
    mode = next;
  }

  function getMode() {
    return mode;
  }

  function advance() {
    if (mode !== 'manual') return false;
    return releaseStep();
  }

  // Play the buffered backlog out automatically, one step per interval, on the
  // speed timeline. No-op unless in automatic mode with a backlog. With a
  // non-positive interval the backlog drains synchronously. A timed playback
  // aborts if the mode returns to manual (visitor flips Step back on).
  function playRemaining(intervalMs = 0) {
    if (mode !== 'automatic') return;
    if (queue.length === 0) return;
    if (!(intervalMs > 0)) {
      while (queue.length > 0) deliver(queue.shift());
      return;
    }
    const tick = () => {
      if (mode !== 'automatic') return;
      if (queue.length === 0) return;
      releaseStep();
      if (queue.length > 0) setTimeout(tick, intervalMs);
    };
    setTimeout(tick, intervalMs);
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
    playRemaining,
    pendingCount,
    reset,
    teardown,
  };
}
