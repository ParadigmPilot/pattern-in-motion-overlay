/**
 * Pill primitive — a single Service-step badge.
 *
 * Pure presentational. No substrate subscription. State and manifest are
 * passed as props by the parent. `Trace` composes six Pills for the
 * Restaurant Pattern's canonical Service steps; third-party developers
 * compose their own containers around `Pill` + `useStepStates` for any
 * step-progress UI with any step count or domain.
 *
 * See README §Composition and AGENTS.md for worked third-party examples.
 *
 * Mnemonic hierarchy per D-WS1-7: Restaurant frame is the anchor
 * (`<strong>`, `pill-anchor` class); technology frame is the supporting
 * peg (`<span>`, `pill-peg` class).
 *
 * Renders as `<li>` for use within an `<ol>` / `<ul>` parent (Trace renders
 * `<ol class="trace">`). Non-list contexts are an owed future extension via
 * a polymorphic `as` prop; not implemented in this scaffold.
 *
 * State-class CSS for visual treatment and inline-SVG iconography land in
 * subsequent OBJ-2 WOs (313.5 / 313.6). This scaffold carries semantic
 * structure only.
 *
 * @param {Object} props
 * @param {string} props.stepId — step identifier (any string; opaque to Pill)
 * @param {'queued' | 'active' | 'complete'} props.state — pill render state
 * @param {Object} [props.manifest] — optional seven-field manifest per
 *   D-WS1-6; when present, `restaurant_label` and `technology_label` are
 *   rendered. When absent, Pill falls back to rendering the stepId.
 */
export function Pill({ stepId, state, manifest }) {
  return (
    <li
      className={`pill pill-${state}`}
      data-step-id={stepId}
      aria-current={state === 'active' ? 'step' : undefined}
    >
      {manifest ? (
        <>
          <strong className="pill-anchor">{manifest.restaurant_label}</strong>
          <span className="pill-peg">{manifest.technology_label}</span>
        </>
      ) : (
        <span className="pill-fallback">{stepId}</span>
      )}
    </li>
  );
}
