import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { createMockSubstrate, SPEED_PRESETS, SERVICE_STEPS } from './mock-substrate.js';
import { Pin, Trace } from '../src/index.js';
import '../src/tokens.css';

const SPEED_STORAGE_KEY = 'pim-overlay-speed';
const SPEED_NAMES = ['slow', 'default', 'fast'];

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

function ExampleHarness() {
  const [events, setEvents] = useState([]);
  const [substrate] = useState(() => createMockSubstrate());
  const [speedName, setSpeedName] = useState(loadSavedSpeed);
  const [hasRun, setHasRun] = useState(false);
  // Host-owned turn model: finished turns persist as frozen state Maps;
  // activeTurnKey remounts the live (uncontrolled) Trace on a turn boundary.
  const [finishedTurns, setFinishedTurns] = useState([]);
  const [activeTurnKey, setActiveTurnKey] = useState(0);

  useEffect(() => {
    const unsubscribe = substrate.subscribe((event) => {
      setEvents((prev) => [...prev, event]);
    });
    return unsubscribe;
  }, [substrate]);

  function runTurn() {
    setEvents([]);
    setHasRun(true);
    substrate.runScriptedTurn(SPEED_PRESETS[speedName]);
  }

  // Turn boundary (host-owned — the substrate emits no turn-end event).
  // Archive the just-finished turn as an all-complete frozen Map, then
  // remount a fresh active Trace.
  function newTurn() {
    setFinishedTurns((prev) => [
      ...prev,
      new Map(SERVICE_STEPS.map((s) => [s, 'complete'])),
    ]);
    setActiveTurnKey((key) => key + 1);
    setEvents([]);
  }

  function selectSpeed(name) {
    setSpeedName(name);
    saveSpeed(name);
  }

  return (
    <div>
      <div className="controls">
        <button className="run-button" onClick={runTurn}>Run a scripted turn</button>
        <button className="new-turn-button" onClick={newTurn}>New turn</button>
        <div className="speed-control" role="group" aria-label="Step speed">
          {SPEED_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              className={`speed-button ${speedName === name ? 'is-active' : ''}`}
              onClick={() => selectSpeed(name)}
              aria-pressed={speedName === name}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {!hasRun && (
        <div className="run-hint" role="note">
          Click <strong>Run a scripted turn</strong> to see the Pin react.
        </div>
      )}
      <section className="pin-mount">
        <h2>Pin renderer</h2>
        <Pin substrate={substrate} />
      </section>
      <section className="trace-mount">
        <h2>Trace renderer</h2>
        {/* Chat-history column (D-WS2-1): finished turns persist as controlled
            Traces, stacked oldest→newest; the active turn renders last as an
            uncontrolled Trace. Inline, co-located — no portal, no fixed panel. */}
        <div className="chat-history">
          {finishedTurns.map((frozen, i) => (
            <Trace key={`finished-${i}`} substrate={substrate} states={frozen} />
          ))}
          <Trace key={activeTurnKey} substrate={substrate} />
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
