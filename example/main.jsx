import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { createMockSubstrate, SPEED_PRESETS, SERVICE_STEPS } from './mock-substrate.js';
import { Pin, Trace, Toggle, ManualOverlay, ResponseReadyStrip, createModeGate } from '../src/index.js';
import '../src/tokens.css';

const SPEED_STORAGE_KEY = 'pim-overlay-speed';
const SPEED_NAMES = ['slow', 'default', 'fast'];

const MODE_STORAGE_KEY = 'pim-overlay-mode';
const MODE_NAMES = ['manual', 'automatic'];

// Demo LLM response prose surfaced by the Step-05 overlay→prose swap. Supplied
// by the host because the substrate is sealed to events-only (A2 contract).
const DEMO_RESPONSE_PROSE =
  "Thanks — I've reviewed the intake. This looks like a priority orientation & mobility referral: low-vision student, new cane-travel goals, IEP timeline active. I've drafted an evaluation request routed to the COMS queue. Review it below before you send.";

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
  // `playing` is true only while an automatic playback is actively running
  // (a fresh auto turn, or a Send-driven drain of a partly-stepped turn).
  // Send is disabled only then — never while automatic is merely armed.
  const [playing, setPlaying] = useState(false);
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

  // A finished turn (or an aborted playback) is no longer playing.
  useEffect(() => {
    if (turnComplete) setPlaying(false);
  }, [turnComplete]);

  // Start a fresh turn per the current mode. The mock emits synchronously at
  // duration 0, so in Step mode the whole turn is buffered immediately and we
  // reveal step 1 on this same press (no dead first Send). In auto, the
  // substrate timer plays the turn live.
  function startFreshTurn() {
    gate.reset();
    setEvents([]);
    setStarted(true);
    if (stepOn) {
      gate.runScriptedTurn(0);
      gate.advance();
    } else {
      setPlaying(true);
      gate.runScriptedTurn(SPEED_PRESETS[speedName]);
    }
  }

  // Single action. Send = start / advance / play-remaining / next-turn, by phase.
  function send() {
    if (turnComplete) {
      // Fold "New turn" into Send: archive the finished turn, then start fresh.
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
      return;
    }
    // Step off, mid-turn: automatic is armed and waiting — Send plays the
    // remaining buffer out on the speed timeline.
    setPlaying(true);
    gate.playRemaining(SPEED_PRESETS[speedName]);
  }

  function selectSpeed(name) {
    setSpeedName(name);
    saveSpeed(name);
  }

  // The toggle sets the mode and nothing else. Flipping ON halts any running
  // playback (the gate aborts on manual) and re-enables Send for stepping.
  function toggleStep(next) {
    setStepOn(next);
    gate.setMode(next ? 'manual' : 'automatic');
    saveMode(next ? 'manual' : 'automatic');
    if (next) setPlaying(false);
  }

  return (
    <div>
      <div className="controls">
        <button className="run-button" onClick={send} disabled={playing}>Send</button>
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
          ? 'Step mode on — each Send reveals the next step. Switch off, then Send, to finish automatically.'
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
      <section className="overlay-mount">
        <h2>Manual-mode overlay</h2>
        <ManualOverlay
          substrate={gate}
          responseProse={DEMO_RESPONSE_PROSE}
        />
        {stepOn && <ResponseReadyStrip substrate={gate} />}
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
