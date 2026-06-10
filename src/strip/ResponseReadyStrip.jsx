import './response-ready-strip.css';

/**
 * ResponseReadyStrip (Component #7) — assistant-area status strip.
 *
 * SCAFFOLD (WO-314.5a): structural skeleton only. Renders the locked
 * D-WS2-14 status line as a polite live region. The show/hide lifecycle
 * (appear at Step 03 end, persist through Steps 03–04, disappear at Step 05,
 * reset at idle) lands in the build WO (WO-314.5b).
 *
 * Manual-mode scoping is host-owned: the host gates mounting (shown in
 * Manual, skipped in Automatic), so this component takes no mode prop and
 * carries no mode logic.
 *
 * Mounts ADJACENT to the ManualOverlay (#6) in the assistant area — never
 * nested inside it (D-WS2-14; station-arch §6.1 row #7).
 */

const STRIP_COPY = 'Response ready · advance to Step 5 to see it served';

export function ResponseReadyStrip() {
  return (
    <div className="response-ready-strip" role="status" aria-live="polite">
      {STRIP_COPY}
    </div>
  );
}
