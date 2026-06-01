import { render, cleanup, act } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
import { Pin } from './Pin.jsx';

afterEach(cleanup);

/**
 * Minimal in-memory substrate satisfying Pin's prop contract:
 *   subscribe(cb)  -> unsubscribe()
 *   loadManifest(stepId) -> seven-field manifest
 *   emit(event)    -> test-only event injection
 *   hasListener()  -> test-only lifecycle assertion
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
    hasListener() {
      return listener !== null;
    },
  };
}

describe('Pin renderer scaffold', () => {
  it('subscribes on mount and unsubscribes on unmount', () => {
    const substrate = createTestSubstrate({});
    const { unmount } = render(<Pin substrate={substrate} />);

    expect(substrate.hasListener()).toBe(true);

    unmount();

    expect(substrate.hasListener()).toBe(false);
  });

  it('renders inert in the implicit at_the_table state (no active step)', () => {
    const substrate = createTestSubstrate({});
    const { container } = render(<Pin substrate={substrate} />);

    const pin = container.querySelector('.pin');
    expect(pin).not.toBeNull();
    expect(pin.classList.contains('pin-idle')).toBe(true);
    expect(pin.hasAttribute('data-step-id')).toBe(false);
  });

  it('renders restaurant_label and technology_label when a Service step is active', () => {
    const manifest = {
      restaurant_label: 'Take the Order',
      technology_label: 'Capture intent',
      animation_asset: '',
      plain_english: '',
      in_code: '',
      just_finished: '',
      up_next: '',
    };
    const substrate = createTestSubstrate(manifest);
    const { container } = render(<Pin substrate={substrate} />);

    act(() => {
      substrate.emit({
        type: 'step_started',
        stepId: 'take_the_order',
        timestamp: Date.now(),
      });
    });

    const anchor = container.querySelector('.pin-anchor');
    const peg = container.querySelector('.pin-peg');

    expect(anchor).not.toBeNull();
    expect(peg).not.toBeNull();
    expect(anchor.tagName).toBe('STRONG');
    expect(peg.tagName).toBe('SPAN');
    expect(anchor.textContent).toBe('Take the Order');
    expect(peg.textContent).toBe('Capture intent');
  });

  it('preserves fixed reserved height across all state transitions', () => {
    const manifest = {
      restaurant_label: 'Take the Order',
      technology_label: 'Capture intent',
      animation_asset: '',
      plain_english: '',
      in_code: '',
      just_finished: '',
      up_next: '',
    };
    const substrate = createTestSubstrate(manifest);
    const { container } = render(<Pin substrate={substrate} />);

    // The .pin base class drives `height: var(--pin-reserved-height)`.
    // Verify .pin is always applied across all state transitions.

    let pin = container.querySelector('.pin');
    expect(pin).not.toBeNull();
    expect(pin.classList.contains('pin')).toBe(true);

    act(() => {
      substrate.emit({
        type: 'step_started',
        stepId: 'take_the_order',
        timestamp: Date.now(),
      });
    });
    pin = container.querySelector('.pin');
    expect(pin).not.toBeNull();
    expect(pin.classList.contains('pin')).toBe(true);

    act(() => {
      substrate.emit({
        type: 'step_ended',
        stepId: 'take_the_order',
        timestamp: Date.now(),
      });
    });
    pin = container.querySelector('.pin');
    expect(pin).not.toBeNull();
    expect(pin.classList.contains('pin')).toBe(true);
  });

  it('renders inline SVG iconography using currentColor', () => {
    const manifest = {
      restaurant_label: 'Take the Order',
      technology_label: 'Capture intent',
      animation_asset: '',
      plain_english: '',
      in_code: '',
      just_finished: '',
      up_next: '',
    };
    const substrate = createTestSubstrate(manifest);
    const { container } = render(<Pin substrate={substrate} />);

    act(() => {
      substrate.emit({
        type: 'step_started',
        stepId: 'take_the_order',
        timestamp: Date.now(),
      });
    });

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg.getAttribute('stroke')).toBe('currentColor');

    // Per D-WS2-5: inline SVG only; no <img> elements.
    const img = container.querySelector('img');
    expect(img).toBeNull();
  });

  it('applies pin-active state-class on step_started and clears on step_ended', () => {
    const manifest = {
      restaurant_label: 'Take the Order',
      technology_label: 'Capture intent',
      animation_asset: '',
      plain_english: '',
      in_code: '',
      just_finished: '',
      up_next: '',
    };
    const substrate = createTestSubstrate(manifest);
    const { container } = render(<Pin substrate={substrate} />);

    let pin = container.querySelector('.pin');
    expect(pin.classList.contains('pin-idle')).toBe(true);
    expect(pin.classList.contains('pin-active')).toBe(false);

    act(() => {
      substrate.emit({
        type: 'step_started',
        stepId: 'take_the_order',
        timestamp: Date.now(),
      });
    });
    pin = container.querySelector('.pin');
    expect(pin.classList.contains('pin-active')).toBe(true);
    expect(pin.classList.contains('pin-idle')).toBe(false);

    act(() => {
      substrate.emit({
        type: 'step_ended',
        stepId: 'take_the_order',
        timestamp: Date.now(),
      });
    });
    pin = container.querySelector('.pin');
    expect(pin.classList.contains('pin-active')).toBe(false);
    expect(pin.classList.contains('pin-idle')).toBe(true);
  });
});
