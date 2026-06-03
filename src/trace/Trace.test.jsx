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

  it('controlled mode renders supplied states without subscribing', () => {
    const substrate = createTestSubstrate();
    const frozen = new Map(SERVICE_STEPS.map((s) => [s, 'complete']));
    const { container } = render(<Trace substrate={substrate} states={frozen} />);

    expect(substrate.hasListener()).toBe(false);

    const pills = container.querySelectorAll('.pill');
    expect(pills.length).toBe(6);
    pills.forEach((pill) => {
      expect(pill.classList.contains('pill-complete')).toBe(true);
    });
  });

  it('persists a finished turn — a controlled Trace is immune to later events', () => {
    const substrate = createTestSubstrate();
    const frozen = new Map(SERVICE_STEPS.map((s) => [s, 'complete']));
    const { container } = render(<Trace substrate={substrate} states={frozen} />);

    act(() => {
      substrate.emit({
        type: 'step_started',
        stepId: 'take_the_order',
        timestamp: Date.now(),
      });
    });

    const target = container.querySelector('[data-step-id="take_the_order"]');
    expect(target.classList.contains('pill-complete')).toBe(true);
    expect(target.classList.contains('pill-active')).toBe(false);
  });

  it('mounts finished and active turns inline in chat-history order (D-WS2-1)', () => {
    const substrate = createTestSubstrate();
    const finished = new Map(SERVICE_STEPS.map((s) => [s, 'complete']));
    const { container } = render(
      <div>
        <Trace substrate={substrate} states={finished} />
        <Trace substrate={substrate} />
      </div>,
    );

    const traces = container.querySelectorAll('.trace');
    expect(traces.length).toBe(2);

    // Document order is chat-history order: finished turn first, active second.
    expect(traces[0].querySelectorAll('.pill-complete').length).toBe(6);
    expect(traces[1].querySelectorAll('.pill-queued').length).toBe(6);

    // Only the active (uncontrolled) turn holds a live subscription.
    expect(substrate.hasListener()).toBe(true);
  });

  it('applies the matching pill-{state} class to each pill across all three states', () => {
    const substrate = createTestSubstrate();
    const mixed = new Map([
      ['take_the_order',  'complete'],
      ['brief_the_chef',  'complete'],
      ['plate_the_dish',  'active'],
      ['read_the_ticket', 'queued'],
      ['serve_by_type',   'queued'],
      ['stock_the_pantry','queued'],
    ]);
    const { container } = render(<Trace substrate={substrate} states={mixed} />);

    expect(
      container.querySelector('[data-step-id="take_the_order"]').classList.contains('pill-complete')
    ).toBe(true);
    expect(
      container.querySelector('[data-step-id="plate_the_dish"]').classList.contains('pill-active')
    ).toBe(true);
    expect(
      container.querySelector('[data-step-id="read_the_ticket"]').classList.contains('pill-queued')
    ).toBe(true);
  });

  it('renders STEP_ICONS in each pill icon slot', () => {
    const substrate = createTestSubstrate();
    const { container } = render(<Trace substrate={substrate} />);
    const slots = container.querySelectorAll('.pill-icon');
    expect(slots.length).toBe(6);
    slots.forEach((slot) => {
      expect(slot.querySelector('svg')).not.toBeNull();
    });
  });

  it('renders CHECK_ICON in complete-state pills and STEP_ICONS in non-complete pills', () => {
    const substrate = createTestSubstrate();
    const mixed = new Map([
      ['take_the_order',  'complete'],
      ['brief_the_chef',  'complete'],
      ['plate_the_dish',  'active'],
      ['read_the_ticket', 'queued'],
      ['serve_by_type',   'queued'],
      ['stock_the_pantry','queued'],
    ]);
    const { container } = render(<Trace substrate={substrate} states={mixed} />);

    // Each pill renders exactly one polyline (CHECK_ICON has one polyline; STEP_ICONS use other primitives).
    const completed = container.querySelector('[data-step-id="take_the_order"]');
    expect(completed.querySelector('.pill-icon svg polyline')).not.toBeNull();

    const active = container.querySelector('[data-step-id="plate_the_dish"]');
    expect(active.querySelector('.pill-icon svg polyline')).toBeNull();
    expect(active.querySelector('.pill-icon svg')).not.toBeNull();

    const queued = container.querySelector('[data-step-id="read_the_ticket"]');
    expect(queued.querySelector('.pill-icon svg polyline')).toBeNull();
    expect(queued.querySelector('.pill-icon svg')).not.toBeNull();
  });
});
