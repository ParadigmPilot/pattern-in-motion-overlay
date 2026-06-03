import './Toggle.css';

/**
 * Toggle — accessible Manual / Automatic ("Step") mode switch.
 *
 * Controlled component (the host owns persistence). `checked` true means
 * Step mode is ON (Manual: the visitor advances the Trace by hand); `checked`
 * false means Step mode is OFF (Automatic: the Trace advances itself per the
 * event stream). The host wires `onChange` to its mode gate + localStorage;
 * see example/main.jsx for the reference recipe.
 *
 * Accessibility (accessibility.md RULE-01/02/03; W3C APG Switch pattern):
 *   - role="switch" + aria-checked exposes on/off to assistive technology.
 *   - A native <button> provides keyboard operability (Enter / Space) and a
 *     focus target for free.
 *   - The visible text label is the accessible name, so state is never
 *     conveyed by color alone (RULE-01); the thumb position is a second,
 *     non-color cue.
 *   - The :focus-visible outline (Toggle.css) meets the >=2px requirement
 *     (RULE-02).
 *
 * @param {boolean} checked   Step mode on (true) / off (false).
 * @param {(next: boolean) => void} onChange  Called with the next value.
 * @param {string} [label='Step']  Visible + accessible label.
 */
export function Toggle({ checked, onChange, label = 'Step' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`pim-toggle ${checked ? 'is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="pim-toggle__track" aria-hidden="true">
        <span className="pim-toggle__thumb" />
      </span>
      <span className="pim-toggle__label">{label}</span>
    </button>
  );
}
