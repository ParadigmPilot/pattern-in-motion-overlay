import { render, cleanup, act, fireEvent } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
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
      <ManualOverlay substrate={substrate} onAdvance={() => {}} />
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

    // The labeled advance button.
    expect(container.querySelector('.manual-overlay-advance')).not.toBeNull();
  });

  it('renders nothing at idle (no active Service step)', () => {
    const substrate = createTestSubstrate(BRIEF_MANIFEST);
    const { container } = render(
      <ManualOverlay substrate={substrate} onAdvance={() => {}} />
    );

    expect(container.querySelector('.manual-overlay')).toBeNull();
    expect(container.firstChild).toBeNull();
  });

  it('returns to idle (renders nothing) when the active step ends', () => {
    const substrate = createTestSubstrate(BRIEF_MANIFEST);
    const { container } = render(
      <ManualOverlay substrate={substrate} onAdvance={() => {}} />
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

  it('calls onAdvance exactly once when the advance button is clicked', () => {
    const substrate = createTestSubstrate(BRIEF_MANIFEST);
    const onAdvance = vi.fn();
    const { container } = render(
      <ManualOverlay substrate={substrate} onAdvance={onAdvance} />
    );

    act(() => {
      substrate.emit({
        type: 'step_started',
        stepId: 'brief_the_chef',
        timestamp: Date.now(),
      });
    });

    fireEvent.click(container.querySelector('.manual-overlay-advance'));
    expect(onAdvance).toHaveBeenCalledTimes(1);
  });
});
