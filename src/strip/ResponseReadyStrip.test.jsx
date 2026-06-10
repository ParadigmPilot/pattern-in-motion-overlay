import { render, cleanup, act } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
import { ResponseReadyStrip } from './ResponseReadyStrip.jsx';

afterEach(cleanup);

/**
 * Minimal in-memory substrate satisfying ResponseReadyStrip's prop contract:
 *   subscribe(cb) -> unsubscribe()
 *   emit(event)   -> test-only event injection
 */
function createTestSubstrate() {
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
  };
}

const STRIP_COPY = 'Response ready · advance to Step 5 to see it served';

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

describe('ResponseReadyStrip lifecycle (Component #7)', () => {
  it('renders nothing before Step 03 ends', () => {
    const substrate = createTestSubstrate();
    const { container } = render(<ResponseReadyStrip substrate={substrate} />);

    // No events yet.
    expect(container.querySelector('.response-ready-strip')).toBeNull();

    // Steps 01–03 starting (but Step 03 not yet ended) keep it hidden.
    startStep(substrate, 'take_the_order');
    startStep(substrate, 'brief_the_chef');
    startStep(substrate, 'plate_the_dish');
    expect(container.querySelector('.response-ready-strip')).toBeNull();
  });

  it('appears when Step 03 (plate_the_dish) ends, as a polite status region', () => {
    const substrate = createTestSubstrate();
    const { container } = render(<ResponseReadyStrip substrate={substrate} />);

    endStep(substrate, 'plate_the_dish');

    const strip = container.querySelector('.response-ready-strip');
    expect(strip).not.toBeNull();
    expect(strip.textContent).toBe(STRIP_COPY);
    expect(strip.getAttribute('role')).toBe('status');
    expect(strip.getAttribute('aria-live')).toBe('polite');
  });

  it('persists through Step 04 (read_the_ticket)', () => {
    const substrate = createTestSubstrate();
    const { container } = render(<ResponseReadyStrip substrate={substrate} />);

    endStep(substrate, 'plate_the_dish');
    startStep(substrate, 'read_the_ticket');
    endStep(substrate, 'read_the_ticket');

    expect(container.querySelector('.response-ready-strip')).not.toBeNull();
  });

  it('disappears when Step 05 (serve_by_type) starts', () => {
    const substrate = createTestSubstrate();
    const { container } = render(<ResponseReadyStrip substrate={substrate} />);

    endStep(substrate, 'plate_the_dish');
    expect(container.querySelector('.response-ready-strip')).not.toBeNull();

    startStep(substrate, 'serve_by_type');
    expect(container.querySelector('.response-ready-strip')).toBeNull();
  });

  it('resets for a new turn when take_the_order starts', () => {
    const substrate = createTestSubstrate();
    const { container } = render(<ResponseReadyStrip substrate={substrate} />);

    // Drive to the visible state.
    endStep(substrate, 'plate_the_dish');
    expect(container.querySelector('.response-ready-strip')).not.toBeNull();

    // A fresh turn begins — the strip resets to hidden.
    startStep(substrate, 'take_the_order');
    expect(container.querySelector('.response-ready-strip')).toBeNull();
  });
});
