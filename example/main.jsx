import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { createMockSubstrate, SPEED_PRESETS, SERVICE_STEPS } from './mock-substrate.js';
import { Pin, Trace, Toggle, createModeGate } from '../src/index.js';
import '../src/tokens.css';

const SPEED_STORAGE_KEY = 'pim-overlay-speed';
const SPEED_NAMES = ['slow', 'default', 'fast'];

const MODE_STORAGE_KEY = 'pim-overlay-mode';
const MODE_NAMES = ['manual', 'automatic'];

// Each Service step fires step_started + step_ended, so a full turn delivers
// exactly 2 x SERVICE_STEPS.length events. Used to detect turn completion in
// the harness (the substrate emits no turn-end event).
const TOTAL_TURN_EVENTS = SERVICE_STEPS.length * 2;

function loadSavedSpeed() {
  try {
    const saved = localStorage.getItem(SPEED_STORAGE_KEY);
    if (saved && SPEED_NAMES.includes(saved)) return saved;
  } catch {
    // localStorage unavailable (private mode, sandbox); fall through.
  }
  return 'default';
}

function saveSpeed(name) {
  try {
    localStorage.setItem(SPEED_STORAGE_KEY, name);
  } catch {
    // localStorage unavailable; silently skip.
  }
}

// Mode persistence mirrors the speed-preset recipe above. Absent / invalid
// entry -> 'manual' (D-WS2-12: Manual is the first-time-visitor default).
function loadSavedMode() {
  try {
    const saved = localStorage.getItem(MODE_STORAGE_KEY);
    if (saved && MODE_NAMES.includes(saved)) return saved;
  } catch {
    // localStorage unavailable; fall through.
  }
  return 'manual';
}

function saveMode(name) {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, name);
  } catch {
    // localStorage unavailable; silently skip.
  }
}

function ExampleHarness() {
  const [events, setEvents] = useState([]);
  // Wrap the mock substrate in a mode gate. Pin, Trace, and the event log all
  // subscribe to the gate, so Manual buffering applies uniformly.
  const [gate] = useState(() => createModeGate(createMockSubstrate(), loadSavedMode()));
  const [speedName, setSpeedName] = useState(loadSavedSpeed);
  const [stepOn, setStepOn] = useState(() => gate.getMode() === 'manual');
  const [hasRun, setHasRun] = useState(false);
  // Host-owned turn model: finished turns persist as frozen state Maps;
  // activeTurnKey remounts the live (uncontrolled) Trace on a turn boundary.
  const [finishedTurns, setFinishedTurns] = useState([]);
  const [activeTurnKey, setActiveTurnKey] = useState(0);

  useEffect(() => {
    const unsubscribe = gate.subscribe((event) => {
      setEvents((prev) => [...prev, event]);
    });
    return unsubscribe;
  }, [gate]);

  // Send = run a turn. Automatic plays on the speed-preset timeline; Manual
  // loads the whole turn into the gate buffer (duration 0) so the visitor
  // reveals it step-by-step via Advance.
  function runTurn() {
    gate.reset();
    setEvents([]);
    setHasRun(true);
    gate.runScriptedTurn(stepOn ? 0 : SPEED_PRESETS[speedName]);
  }

  // Manual advance: release one buffered event to all subscribers.
  function advanceStep() {
    gate.advance();
  }

  // Turn boundary (host-owned — the substrate emits no turn-end event).
  // Drop any unrevealed buffered events, archive the just-finished turn as an
  // all-complete frozen Map, then remount a fresh active Trace.
  function newTurn() {
    gate.reset();
    setFinishedTurns((prev) => [
      ...prev,
      new Map(SERVICE_STEPS.map((s) => [s, 'complete'])),
    ]);
    setActiveTurnKey((key) => key + 1);
    setEvents([]);
    setHasRun(false);
  }

  function selectSpeed(name) {
    setSpeedName(name);
    saveSpeed(name);
  }

  function toggleStep(next) {
    setStepOn(next);
    const mode = next ? 'manual' : 'automatic';
    gate.setMode(mode);
    saveMode(mode);
  }

  const turnComplete = events.length >= TOTAL_TURN_EVENTS;
  const showAdvance = stepOn && hasRun && !turnComplete;

  return (
    <div>
      <div className="controls">
        <button className="run-button" onClick={runTurn} disabled={hasRun && !turnComplete}>Send</button>
        {showAdvance && (
          <button className="advance-button" onClick={advanceStep}>Advance step</button>
        )}
        <button className="new-turn-button" onClick={newTurn} disabled={!hasRun}>New turn</button>
        <Toggle checked={stepOn} onChange={toggleStep} label="Step" />
        <div className="speed-control" role="group" aria-label="Step speed">
          {SPEED_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              className={`speed-button ${speedName === name ? 'is-active' : ''}`}
              onClick={() => selectSpeed(name)}
              aria-pressed={speedName === name}
              disabled={stepOn}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="mode-status" role="status" aria-live="polite">
        {stepOn
          ? 'Step mode on — Send loads the turn; Advance reveals each step.'
          : 'Step mode off — Send plays the turn automatically.'}
      </div>
      {!hasRun && (
        <div className="run-hint" role="note">
          Click <strong>Send</strong> to {stepOn ? 'load a turn, then Advance through it.' : 'play a scripted turn.'}
        </div>
      )}
      <section className="pin-mount">
        <h2>Pin renderer</h2>
        <Pin substrate={gate} />
      </section>
      <section className="trace-mount">
        <h2>Trace renderer</h2>
        {/* Chat-history column (D-WS2-1): finished turns persist as controlled
            Traces, stacked oldest->newest; the active turn renders last as an
            uncontrolled Trace. Inline, co-located — no portal, no fixed panel. */}
        <div className="chat-history">
          {finishedTurns.map((frozen, i) => (
            <Trace key={`finished-${i}`} substrate={gate} states={frozen} />
          ))}
          <Trace key={activeTurnKey} substrate={gate} />
        </div>
      </section>
      <section className="event-log-mount">
        <h2>Event log</h2>
        <div id="event-log">
          {events.length === 0 ? (
            <div className="event-row">
              <em>Events will appear here once a turn runs.</em>
            </div>
          ) : (
            events.map((e, i) => (
              <div key={i} className={`event-row ${e.type}`}>
                <strong>{e.type}</strong> &nbsp; {e.stepId} &nbsp; <code>{new Date(e.timestamp).toISOString().slice(11, 23)}</code>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<ExampleHarness />);
