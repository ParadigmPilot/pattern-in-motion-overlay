import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { createMockSubstrate, SPEED_PRESETS } from './mock-substrate.js';
import { Pin } from '../src/index.js';
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

  function selectSpeed(name) {
    setSpeedName(name);
    saveSpeed(name);
  }

  return (
    <div>
      <div className="controls">
        <button className="run-button" onClick={runTurn}>Run a scripted turn</button>
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
