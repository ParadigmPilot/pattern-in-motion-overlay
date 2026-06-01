import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { createMockSubstrate } from './mock-substrate.js';
import { Pin } from '../src/index.js';
import '../src/tokens.css';

function ExampleHarness() {
  const [events, setEvents] = useState([]);
  const [substrate] = useState(() => createMockSubstrate());

  useEffect(() => {
    const unsubscribe = substrate.subscribe((event) => {
      setEvents((prev) => [...prev, event]);
    });
    return unsubscribe;
  }, [substrate]);

  function runTurn() {
    setEvents([]);
    substrate.runScriptedTurn();
  }

  return (
    <div>
      <div className="controls">
        <button onClick={runTurn}>Run a scripted turn</button>
      </div>
      <section className="pin-mount">
        <h2>Pin renderer</h2>
        <Pin substrate={substrate} />
      </section>
      <section className="event-log-mount">
        <h2>Event log</h2>
        <div id="event-log">
          {events.length === 0 ? (
            <div className="event-row">
              <em>Click &quot;Run a scripted turn&quot; to begin. Events will appear here.</em>
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
