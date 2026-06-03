import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { createMockSubstrate, SPEED_PRESETS, SERVICE_STEPS } from './mock-substrate.js';
import { Pin, Trace, Toggle, createModeGate } from '../src/index.js';
import '../src/tokens.css';

const SPEED_STORAGE_KEY = 'pim-overlay-speed';
const SPEED_NAMES = ['slow', 'default', 'fast'];

const MODE_STORAGE_KEY = 'pim-overlay-mode';
const MODE_NAMES = ['manual', 'automatic'];

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

// Mode persistence mirrors the speed-preset recipe. Absent / invalid entry ->
// 'manual' (D-WS2-12: Manual is the first-time-visitor default).
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
  const [started, setStarted] = useState(false);
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

  const completedCount = events.filter((e) => e.type === 'step_ended').length;
  const turnComplete = started && completedCount >= SERVICE_STEPS.length;
  // Send is only inert while a turn plays itself automatically.
  const autoPlaying = started && !stepOn && !turnComplete;

  // Start a fresh turn per the current mode. The mock emits synchronously at
  // duration 0, so in Step mode the whole turn is buffered immediately and we
  // reveal step 1 on this same press (no dead first Send).
  function startFreshTurn() {
    gate.reset();
    setEvents([]);
    setStarted(true);
    gate.runScriptedTurn(stepOn ? 0 : SPEED_PRESETS[speedName]);
    if (stepOn) {
      gate.advance();
    }
  }

  // Single action. Send = start / advance / next-turn, by phase.
  function send() {
    if (turnComplete) {
      // Fold "New turn" into Send: archive the finished turn to chat history,
      // then start the next one.
      setFinishedTurns((prev) => [
        ...prev,
        new Map(SERVICE_STEPS.map((s) => [s, 'complete'])),
      ]);
      setActiveTurnKey((key) => key + 1);
      startFreshTurn();
      return;
    }
    if (!started) {
      startFreshTurn();
      return;
    }
    if (stepOn) {
      gate.advance();
    }
    // Auto-playing: Send is disabled, so there is no path here.
  }

  function selectSpeed(name) {
    setSpeedName(name);
    saveSpeed(name);
  }

  // Flipping Step OFF mid-turn replays the buffer on the speed timeline
  // (finish-in-auto). Flipping ON halts any auto-drain (the gate aborts its
  // replay when mode is manual).
  function toggleStep(next) {
    setStepOn(next);
    const mode = next ? 'manual' : 'automatic';
    gate.setMode(mode, next ? 0 : SPEED_PRESETS[speedName]);
    saveMode(mode);
  }

  return (
    <div>
      <div className="controls">
        <button className="run-button" onClick={send} disabled={autoPlaying}>Send</button>
        <Toggle checked={stepOn} onChange={toggleStep} label="Step" />
        {!stepOn && (
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
        )}
      </div>
      <div className="mode-status" role="status" aria-live="polite">
        {stepOn
          ? 'Step mode on — each Send reveals the next step. Switch off to finish automatically.'
          : 'Step mode off — Send plays the whole turn.'}
      </div>
      {!started && (
        <div className="run-hint" role="note">
          Click <strong>Send</strong> to {stepOn ? 'walk the turn step by step.' : 'play a scripted turn.'}
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
