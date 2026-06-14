import { createRoot } from 'react-dom/client';
import { useEffect, useRef, useState } from 'react';
import { createMockSubstrate, SERVICE_STEPS } from './mock-substrate.js';
import { Pin, Trace, ManualOverlay, createModeGate } from '../src/index.js';
import '../src/tokens.css';

// Demo LLM response prose surfaced by the Step-05 overlay->prose swap, and
// shown as the assistant bubble once a turn completes. Supplied by the host
// because the substrate is sealed to events-only (A2 contract).
const DEMO_RESPONSE_PROSE =
  "Thanks — I've reviewed the intake. This looks like a priority orientation & mobility referral: low-vision student, new cane-travel goals, IEP timeline active. I've drafted an evaluation request routed to the COMS queue. Review it below before you send.";

// Seed text so the mock preview always opens with something to send. In the
// real composed app the host's input supplies this.
const DEMO_PATRON_SEED =
  'New referral: low-vision student, IEP active, needs cane-travel goals.';

// Composed preview: the Intake Triager chat with the Pattern-in-Motion overlay
// inline, Manual-only (D-WS2-1/8/13/24/25). Three zones (WO-315.5b): an
// anchored Title band, a scrolling middle whose active live step snaps
// top-aligned on each press, and a right slide-out Event log drawer. The
// control surface is split into one swapping primary button: Send (idle ->
// submit intake + reveal step 01) and Next Step (mid-turn -> advance 02-06).
function ComposedView() {
  const [events, setEvents] = useState([]);
  // The mode gate is constructed Manual and stays Manual — no Automatic path,
  // no mode/speed persistence.
  const [gate] = useState(() => createModeGate(createMockSubstrate(), 'manual'));
  const [started, setStarted] = useState(false);

  // Composed chat model: completed turns carry patron text + assistant prose +
  // a frozen Trace map (the collapsed summary row, D-WS2-24). The live turn
  // carries the frozen patron text (D-WS2-16).
  const [history, setHistory] = useState([]);
  const [livePatron, setLivePatron] = useState(null);
  const [activeTurnKey, setActiveTurnKey] = useState(0);
  const [pendingFirstStep, setPendingFirstStep] = useState(false);
  const [inputValue, setInputValue] = useState(DEMO_PATRON_SEED);

  // Event log drawer open/closed (Zone 3). Opened from the Title band.
  const [logOpen, setLogOpen] = useState(false);

  // Scroll target: the live step block snaps top-aligned under the Title band
  // on each Send / Next Step press (Zone 2).
  const liveBlockRef = useRef(null);

  useEffect(() => {
    const unsubscribe = gate.subscribe((event) => {
      setEvents((prev) => [...prev, event]);
    });
    return unsubscribe;
  }, [gate]);

  const completedCount = events.filter((e) => e.type === 'step_ended').length;
  const turnComplete = started && completedCount >= SERVICE_STEPS.length;

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

  // First-step release (mount-before-advance, WO-315.4a). The live block (Trace
  // + overlay) must be mounted and subscribed before the gate releases step 01.
  // startFreshTurn arms pendingFirstStep; this post-commit effect runs after the
  // live block has subscribed, then releases the first step once. One-shot per
  // turn (flag-gated) so turn 2+ does not double-advance.
  useEffect(() => {
    if (!pendingFirstStep) return;
    gate.advance();
    setPendingFirstStep(false);
  }, [pendingFirstStep, gate]);

  // Snap-to-top (Zone 2): whenever the live step advances (events grow) the
  // active live block scrolls top-aligned beneath the Title band, so the
  // current step leads and finished turns stack above. scrollIntoView is
  // guarded for non-DOM environments.
  useEffect(() => {
    if (livePatron === null) return;
    liveBlockRef.current?.scrollIntoView?.({ block: 'start' });
  }, [events.length, livePatron]);

  // Esc closes the Event log drawer (Zone 3).
  useEffect(() => {
    if (!logOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setLogOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [logOpen]);

  // Start a fresh Manual turn. The mock buffers the whole turn synchronously at
  // duration 0; the first step's reveal is deferred to the post-commit effect
  // above so the live block is subscribed before step 01 is released.
  function startFreshTurn() {
    gate.reset();
    setEvents([]);
    setStarted(true);
    gate.runScriptedTurn(0);
    setPendingFirstStep(true);
  }

  // Idle action — Send: freeze the patron text, clear the input, start the walk.
  function submit() {
    const text = inputValue.trim();
    if (!text) return;
    setLivePatron(text);
    setInputValue('');
    startFreshTurn();
  }

  // Mid-turn action — Next Step: release the next step (02-06).
  function nextStep() {
    gate.advance();
  }

  return (
    <div className="composed">
      {/* Zone 1 — Title band (anchored; hosts the Event log trigger). */}
      <div className="composed-head">
        <h1>Intake Triager</h1>
        <span className="composed-tag">Pattern in Motion · composed preview</span>
        <button
          className="log-trigger"
          onClick={() => setLogOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={logOpen}
        >
          Event log
        </button>
      </div>

      {/* Zone 2 — Scroll region: finished turns stack above; the live turn and
          the control are the last things; nothing renders below the control. */}
      <div className="composed-scroll">
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
              <div className="live-block" ref={liveBlockRef}>
                {/* Pin surfaced icon-only (host CSS hides .pin-text); the
                    labeled Trace pill is the accessible step name. */}
                <div className="live-wayfinding">
                  <Pin substrate={gate} />
                  <div className="trace--compact">
                    <Trace key={activeTurnKey} substrate={gate} />
                  </div>
                </div>
                <div className="assistant-area">
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

        {/* Split control surface (D-WS2-23): one swapping primary button. Idle =
            Send (submit intake + reveal step 01); mid-turn = Next Step (advance
            steps 02-06). Last element in the scroll region. */}
        <div className="control-bar">
          {!started ? (
            <>
              <input
                className="intake-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Describe the intake…"
                onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                aria-label="Intake message"
              />
              <button
                className="run-button"
                onClick={submit}
                disabled={inputValue.trim().length === 0}
              >
                Send
              </button>
            </>
          ) : (
            <button
              className="run-button"
              onClick={nextStep}
              disabled={turnComplete}
            >
              Next Step
            </button>
          )}
        </div>
      </div>

      {/* Zone 3 — Event log drawer (slide-out from the right; closes on Esc and
          on backdrop click). Replaces the retired in-flow debug panel. */}
      {logOpen && (
        <div className="drawer-backdrop" onClick={() => setLogOpen(false)}>
          <aside
            className="log-drawer"
            role="dialog"
            aria-label="Event log"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="log-drawer-head">
              <h2>Event log</h2>
              <button
                className="drawer-close"
                onClick={() => setLogOpen(false)}
                aria-label="Close event log"
              >
                ×
              </button>
            </div>
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
          </aside>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<ComposedView />);
