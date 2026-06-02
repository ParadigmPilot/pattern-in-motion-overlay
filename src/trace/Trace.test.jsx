import { render, cleanup, act } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
import { Trace } from './Trace.jsx';

afterEach(cleanup);

const SERVICE_STEPS = [
  'take_the_order',
  'brief_the_chef',
  'plate_the_dish',
  'read_the_ticket',
  'serve_by_type',
  'stock_the_pantry',
];

const SAMPLE_MANIFEST = {
  restaurant_label: 'Test Label',
  technology_label: 'Test Tech',
  animation_asset: '',
  plain_english: '',
  in_code: '',
  just_finished: '',
  up_next: '',
};

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
    loadManifest() {
      return SAMPLE_MANIFEST;
    },
    hasListener() {
      return listener !== null;
    },
  };
}

describe('Trace renderer scaffold', () => {
  it('subscribes on mount and unsubscribes on unmount', () => {
    const substrate = createTestSubstrate();
    const { unmount } = render(<Trace substrate={substrate} />);
    expect(substrate.hasListener()).toBe(true);
    unmount();
    expect(substrate.hasListener()).toBe(false);
  });

  it('renders six pills at mount in canonical Service-step order', () => {
    const substrate = createTestSubstrate();
    const { container } = render(<Trace substrate={substrate} />);
    const pills = container.querySelectorAll('.pill');
    expect(pills.length).toBe(6);
    pills.forEach((pill, idx) => {
      expect(pill.getAttribute('data-step-id')).toBe(SERVICE_STEPS[idx]);
    });
  });

  it('renders all pills in queued state initially', () => {
    const substrate = createTestSubstrate();
    const { container } = render(<Trace substrate={substrate} />);
    const pills = container.querySelectorAll('.pill');
    pills.forEach((pill) => {
      expect(pill.classList.contains('pill-queued')).toBe(true);
    });
  });

  it('transitions matching pill to active on step_started', () => {
    const substrate = createTestSubstrate();
    const { container } = render(<Trace substrate={substrate} />);

    act(() => {
      substrate.emit({
        type: 'step_started',
        stepId: 'brief_the_chef',
        timestamp: Date.now(),
      });
    });

    const target = container.querySelector('[data-step-id="brief_the_chef"]');
    expect(target.classList.contains('pill-active')).toBe(true);
    expect(target.classList.contains('pill-queued')).toBe(false);
  });

  it('transitions matching pill to complete on step_ended', () => {
    const substrate = createTestSubstrate();
    const { container } = render(<Trace substrate={substrate} />);

    act(() => {
      substrate.emit({
        type: 'step_started',
        stepId: 'plate_the_dish',
        timestamp: Date.now(),
      });
      substrate.emit({
        type: 'step_ended',
        stepId: 'plate_the_dish',
        timestamp: Date.now(),
      });
    });

    const target = container.querySelector('[data-step-id="plate_the_dish"]');
    expect(target.classList.contains('pill-complete')).toBe(true);
    expect(target.classList.contains('pill-active')).toBe(false);
  });

  it('leaves non-matching pills unaffected by an event', () => {
    const substrate = createTestSubstrate();
    const { container } = render(<Trace substrate={substrate} />);

    act(() => {
      substrate.emit({
        type: 'step_started',
        stepId: 'serve_by_type',
        timestamp: Date.now(),
      });
    });

    const other = container.querySelector('[data-step-id="take_the_order"]');
    expect(other.classList.contains('pill-queued')).toBe(true);
    expect(other.classList.contains('pill-active')).toBe(false);
  });

  it('resolves manifests via substrate.loadManifest and renders labels', () => {
    const substrate = createTestSubstrate();
    const { container } = render(<Trace substrate={substrate} />);
    const anchors = container.querySelectorAll('.pill-anchor');
    expect(anchors.length).toBe(6);
    anchors.forEach((anchor) => {
      expect(anchor.textContent).toBe('Test Label');
    });
  });

  // Deferred to subsequent OBJ-2 WOs:
  it.todo('persists pill states across turns within a chat-history slot (313.5)');
  it.todo('applies state-class CSS visual treatment to pills (313.6)');
  it.todo('mounts at the canonical chat-history placement per D-WS2-1 (313.5)');
});
