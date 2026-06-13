import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { createMockSubstrate, SPEED_PRESETS, SERVICE_STEPS } from './mock-substrate.js';
import { Pin, Trace, Toggle, ManualOverlay, ResponseReadyStrip, createModeGate } from '../src/index.js';
import '../src/tokens.css';

const SPEED_STORAGE_KEY = 'pim-overlay-speed';
const SPEED_NAMES = ['slow', 'default', 'fast'];

const MODE_STORAGE_KEY = 'pim-overlay-mode';
const MODE_NAMES = ['manual', 'automatic'];

// Demo LLM response prose surfaced by the Step-05 overlay->prose swap, and
// shown as the assistant bubble once a turn completes. Supplied by the host
// because the substrate is sealed to events-only (A2 contract).
const DEMO_RESPONSE_PROSE =
  "Thanks — I've reviewed the intake. This looks like a priority orientation & mobility referral: low-vision student, new cane-travel goals, IEP timeline active. I've drafted an evaluation request routed to the COMS queue. Review it below before you send.";

// Seed text so the mock preview always opens with something to send. In the
// real composed app the host's input supplies this.
const DEMO_PATRON_SEED =
  'New referral: low-vision student, IEP active, needs cane-travel goals.';

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

// Composed preview: the Intake Triager chat with the Pattern-in-Motion overlay
// inline. Reuses the harness wiring (mode gate, single Send control, mode /
// speed persistence, finished-turn model); the layout is the assembled
// composed view (D-WS2-1/8/13/24/25). Mock-driven — the real driver, real
// strip timing, and the host slot are successor WOs.
function ComposedView() {
  const [events, setEvents] = useState([]);
  const [gate] = useState(() => createModeGate(createMockSubstrate(), loadSavedMode()));
  const [speedName, setSpeedName] = useState(loadSavedSpeed);
  const [stepOn, setStepOn] = useState(() => gate.getMode() === 'manual');
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Composed chat model: completed turns carry patron text + assistant prose +
  // a frozen Trace map (the collapsed summary row, D-WS2-24). The live turn
  // carries the frozen patron text (D-WS2-16).
  const [history, setHistory] = useState([]);
  const [livePatron, setLivePatron] = useState(null);
  const [activeTurnKey, setActiveTurnKey] = useState(0);
  const [pendingFirstStep, setPendingFirstStep] = useState(false);
  const [inputValue, setInputValue] = useState(DEMO_PATRON_SEED);

  useEffect(() => {
    const unsubscribe = gate.subscribe((event) => {
      setEvents((prev) => [...prev, event]);
    });
    return unsubscribe;
  }, [gate]);

  const completedCount = events.filter((e) => e.type === 'step_ended').length;
  const turnComplete = started && completedCount >= SERVICE_STEPS.length;

  useEffect(() => {
    if (turnComplete) setPlaying(false);
  }, [turnComplete]);

  // On completion the overlay hands the reply off to the transcript: archive
  // the live turn (patron + prose + frozen Trace), remount a clean live Trace,
  // return the substrate to idle, and re-enable the input (D-WS2-19 re-enables
  // at Step 06; D-WS1-5 returns to at_the_table).
  useEffect(() => {
    if (!turnComplete || livePatron === null) return;
    setHistory((prev) => [
      ...prev,
      {
        patron: livePatron,
        assistant: DEMO_RESPONSE_PROSE,
        frozen: new Map(SERVICE_STEPS.map((s) => [s, 'complete'])),
      },
    ]);
    setLivePatron(null);
    setActiveTurnKey((k) => k + 1);
    setStarted(false);
    gate.reset();
    setEvents([]);
  }, [turnComplete, livePatron, gate]);

  // First-step release (mount-before-advance). The live block (Trace + overlay)
  // must be mounted and subscribed before the gate releases step 01, per
  // station-arch §5 ("trace renders all six pills the moment the Patron hits
  // send"). startFreshTurn arms pendingFirstStep; this post-commit effect runs
  // after the live block has subscribed, then releases the first step once.
  // One-shot per turn (flag-gated) so turn 2+ does not double-advance.
  useEffect(() => {
    if (!pendingFirstStep) return;
    gate.advance();
    setPendingFirstStep(false);
  }, [pendingFirstStep, gate]);

  // Start a fresh turn per the current mode (unchanged harness wiring). The mock
  // buffers the whole turn synchronously at duration 0; in Step mode the first
  // step's reveal is deferred to the post-commit effect above so the live block
  // is subscribed before step 01 is released.
  function startFreshTurn() {
    gate.reset();
    setEvents([]);
    setStarted(true);
    if (stepOn) {
      gate.runScriptedTurn(0);
      setPendingFirstStep(true);
    } else {
      setPlaying(true);
      gate.runScriptedTurn(SPEED_PRESETS[speedName]);
    }
  }

  // Single Send control (D-WS2-23). Idle: submit a new turn (freeze the patron
  // text, start the walk). Manual mid-turn: advance one step. Automatic armed:
  // play the remaining buffer at the chosen speed.
  function send() {
    if (!started) {
      const text = inputValue.trim();
      if (!text) return;
      setLivePatron(text);
      setInputValue('');
      startFreshTurn();
      return;
    }
    if (stepOn) {
      gate.advance();
      return;
    }
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

  const locked = started; // field frozen while a turn is in progress (D-WS2-16/19)
  const sendDisabled = !started ? inputValue.trim().length === 0 : playing;

  return (
    <div className="composed">
      <div className="composed-head">
        <h1>Intake Triager</h1>
        <span className="composed-tag">Pattern in Motion · composed preview</span>
      </div>

      <div className="chat">
        {history.map((turn, i) => (
          <div key={`turn-${i}`} className="turn">
            <div className="msg msg-patron">{turn.patron}</div>
            <div className="msg msg-assistant">{turn.assistant}</div>
            <div className="turn-meta-row" data-turn={i + 1}>
              <span>Turn {i + 1} · {turn.frozen.size} steps · complete</span>
              <span className="replay-seam" aria-hidden="true">⟳</span>
            </div>
          </div>
        ))}

        {livePatron !== null && (
          <div className="turn turn-live">
            <div className="msg msg-patron msg-frozen">{livePatron}</div>
            <div className="live-block">
              <div className="trace--compact">
                <Trace key={activeTurnKey} substrate={gate} />
              </div>
              <div className="assistant-area">
                {stepOn && <ResponseReadyStrip substrate={gate} />}
                <ManualOverlay substrate={gate} responseProse={DEMO_RESPONSE_PROSE} />
              </div>
            </div>
          </div>
        )}

        {history.length === 0 && livePatron === null && (
          <div className="chat-empty" role="note">
            Describe an intake below and press <strong>Send</strong> to walk the turn.
          </div>
        )}
      </div>

      <div className="control-bar">
        <input
          className="intake-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={locked ? 'Input locked — walking the turn…' : 'Describe the intake…'}
          disabled={locked}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          aria-label="Intake message"
        />
        <button className="run-button" onClick={send} disabled={sendDisabled}>Send</button>
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
          ? 'Manual — each Send reveals the next step. Toggle Step off, then Send, to play automatically.'
          : 'Automatic — Send plays the whole turn at the chosen speed.'}
      </div>

      {/* Pin is redundant in this layout (the compact Trace + overlay header
          already spotlight the active step). Mounted for harness parity and
          flagged as the BL-4 fold-vs-remove case (Cycle 315.5), alongside the
          event log, in a collapsed debug panel. */}
      <details className="debug-panel">
        <summary>Debug · Pin renderer + event log</summary>
        <section className="pin-mount">
          <Pin substrate={gate} />
        </section>
        <div id="event-log">
          {events.length === 0 ? (
            <div className="event-row"><em>Events will appear here once a turn runs.</em></div>
          ) : (
            events.map((e, i) => (
              <div key={i} className={`event-row ${e.type}`}>
                <strong>{e.type}</strong> &nbsp; {e.stepId} &nbsp; <code>{new Date(e.timestamp).toISOString().slice(11, 23)}</code>
              </div>
            ))
          )}
        </div>
      </details>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<ComposedView />);
