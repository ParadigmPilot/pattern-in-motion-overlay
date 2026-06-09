import { render, cleanup, act } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
import { ManualOverlay } from './ManualOverlay.jsx';

afterEach(cleanup);

/**
 * Minimal in-memory substrate satisfying ManualOverlay's prop contract:
 *   subscribe(cb)        -> unsubscribe()
 *   loadManifest(stepId) -> seven-field manifest
 *   emit(event)          -> test-only event injection
 */
function createTestSubstrate(manifest) {
  let listener = null;
  return {
    subscribe(cb) {
      listener = cb;
      return () => {
        listener = null;
      };
    },
    emit(event) {
      if (listener) listener(event);
    },
    loadManifest() {
      return manifest;
    },
  };
}

// brief_the_chef is index 1 in canonical order -> "Step 02".
const BRIEF_MANIFEST = {
  restaurant_label: 'Brief the Chef',
  technology_label: 'Assemble the prompt',
  animation_asset: null,
  plain_english: 'The Expediter loads the history and hands it to the Chef.',
  in_code: 'Load history; assemble system + history + user; POST to LLM messages endpoint',
  just_finished: '← Just finished: Take the order',
  up_next: 'Next: Plate the dish — the Chef composes one plated output.',
};

describe('ManualOverlay scaffold (Component #6)', () => {
  it('renders all six elements with the manifest values for the active step', () => {
    const substrate = createTestSubstrate(BRIEF_MANIFEST);
    const { container } = render(
      <ManualOverlay substrate={substrate} />
    );

    act(() => {
      substrate.emit({
        type: 'step_started',
        stepId: 'brief_the_chef',
        timestamp: Date.now(),
      });
    });

    // 1. Step indicator + restaurant_label (the anchor).
    const step = container.querySelector('.manual-overlay-step');
    expect(step).not.toBeNull();
    expect(step.textContent).toContain('Step 02');
    const anchor = container.querySelector('.manual-overlay-anchor');
    expect(anchor.tagName).toBe('STRONG');
    expect(anchor.textContent).toBe('Brief the Chef');

    // 2. technology_label (the pegged term).
    expect(container.querySelector('.manual-overlay-peg').textContent).toBe(
      'Assemble the prompt'
    );

    // 3. plain_english.
    expect(container.querySelector('.manual-overlay-plain').textContent).toBe(
      BRIEF_MANIFEST.plain_english
    );

    // 4. in_code, visibly prefixed IN CODE:.
    const inCode = container.querySelector('.manual-overlay-in-code');
    expect(inCode.textContent).toContain('IN CODE:');
    expect(inCode.textContent).toContain(BRIEF_MANIFEST.in_code);

    // 5. just_finished (rendered as-is).
    expect(
      container.querySelector('.manual-overlay-just-finished').textContent
    ).toBe(BRIEF_MANIFEST.just_finished);

    // 6. up_next.
    expect(container.querySelector('.manual-overlay-up-next').textContent).toBe(
      BRIEF_MANIFEST.up_next
    );

    // The overlay owns no advance affordance (D-WS2-23).
    expect(container.querySelector('.manual-overlay-advance')).toBeNull();
  });

  it('renders nothing at idle (no active Service step)', () => {
    const substrate = createTestSubstrate(BRIEF_MANIFEST);
    const { container } = render(
      <ManualOverlay substrate={substrate} />
    );

    expect(container.querySelector('.manual-overlay')).toBeNull();
    expect(container.firstChild).toBeNull();
  });

  it('returns to idle (renders nothing) when the active step ends', () => {
    const substrate = createTestSubstrate(BRIEF_MANIFEST);
    const { container } = render(
      <ManualOverlay substrate={substrate} />
    );

    act(() => {
      substrate.emit({
        type: 'step_started',
        stepId: 'brief_the_chef',
        timestamp: Date.now(),
      });
    });
    expect(container.querySelector('.manual-overlay')).not.toBeNull();

    act(() => {
      substrate.emit({
        type: 'step_ended',
        stepId: 'brief_the_chef',
        timestamp: Date.now(),
      });
    });
    expect(container.querySelector('.manual-overlay')).toBeNull();
  });

});

const DEMO_PROSE =
  "Thanks — I've drafted the evaluation request. Review it below before you send.";

describe('ManualOverlay Step-05 prose swap (WO-314.4a)', () => {
  function startStep(substrate, stepId) {
    act(() => {
      substrate.emit({ type: 'step_started', stepId, timestamp: Date.now() });
    });
  }

  function endStep(substrate, stepId) {
    act(() => {
      substrate.emit({ type: 'step_ended', stepId, timestamp: Date.now() });
    });
  }

  it('renders the six teaching elements (no advance button) before Step 05', () => {
    const substrate = createTestSubstrate(BRIEF_MANIFEST);
    const { container } = render(
      <ManualOverlay substrate={substrate} responseProse={DEMO_PROSE} />
    );

    startStep(substrate, 'brief_the_chef');

    expect(container.querySelector('.manual-overlay-step')).not.toBeNull();
    expect(container.querySelector('.manual-overlay-peg')).not.toBeNull();
    expect(container.querySelector('.manual-overlay-plain')).not.toBeNull();
    expect(container.querySelector('.manual-overlay-in-code')).not.toBeNull();
    expect(container.querySelector('.manual-overlay-just-finished')).not.toBeNull();
    expect(container.querySelector('.manual-overlay-up-next')).not.toBeNull();
    // The overlay owns no advance affordance (D-WS2-23).
    expect(container.querySelector('.manual-overlay-advance')).toBeNull();
    // Pre-05: not yet in prose mode.
    expect(container.querySelector('.manual-overlay-response')).toBeNull();
  });

  it('swaps the overlay for the response prose at serve_by_type', () => {
    const substrate = createTestSubstrate(BRIEF_MANIFEST);
    const { container } = render(
      <ManualOverlay substrate={substrate} responseProse={DEMO_PROSE} />
    );

    startStep(substrate, 'serve_by_type');

    const prose = container.querySelector('.manual-overlay-response');
    expect(prose).not.toBeNull();
    expect(prose.textContent).toBe(DEMO_PROSE);
    expect(container.querySelector('.manual-overlay--prose')).not.toBeNull();
    // The six teaching elements are gone (prose only).
    expect(container.querySelector('.manual-overlay-step')).toBeNull();
  });

  it('persists the prose through stock_the_pantry when serve_by_type ends (overlap)', () => {
    const substrate = createTestSubstrate(BRIEF_MANIFEST);
    const { container } = render(
      <ManualOverlay substrate={substrate} responseProse={DEMO_PROSE} />
    );

    startStep(substrate, 'serve_by_type');
    startStep(substrate, 'stock_the_pantry');
    endStep(substrate, 'serve_by_type');

    const prose = container.querySelector('.manual-overlay-response');
    expect(prose).not.toBeNull();
    expect(prose.textContent).toBe(DEMO_PROSE);
  });

  it('returns to null at idle after the prose turn completes', () => {
    const substrate = createTestSubstrate(BRIEF_MANIFEST);
    const { container } = render(
      <ManualOverlay substrate={substrate} responseProse={DEMO_PROSE} />
    );

    startStep(substrate, 'serve_by_type');
    startStep(substrate, 'stock_the_pantry');
    endStep(substrate, 'serve_by_type');
    endStep(substrate, 'stock_the_pantry');

    expect(container.querySelector('.manual-overlay')).toBeNull();
    expect(container.firstChild).toBeNull();
  });
});
