import { describe, it, expect, vi } from 'vitest';
import { createTurnDriver } from './createTurnDriver.js';

function fakeStream() {
  const calls = [];
  return {
    calls,
    startStep: vi.fn((id) => calls.push(['start', id])),
    endStep: vi.fn((id) => calls.push(['end', id])),
  };
}

describe('createTurnDriver', () => {
  it('throws without a stream exposing startStep + endStep', () => {
    expect(() => createTurnDriver()).toThrow();
    expect(() => createTurnDriver({})).toThrow();
    expect(() => createTurnDriver({ startStep() {} })).toThrow();
  });

  it('turnSubmitted fires take + brief fully, then opens plate', () => {
    const s = fakeStream();
    createTurnDriver(s).turnSubmitted();
    expect(s.calls).toEqual([
      ['start', 'take_the_order'], ['end', 'take_the_order'],
      ['start', 'brief_the_chef'], ['end', 'brief_the_chef'],
      ['start', 'plate_the_dish'],
    ]);
  });

  it('turnResponded ends plate, then fires read + serve + stock fully', () => {
    const s = fakeStream();
    const d = createTurnDriver(s);
    d.turnSubmitted();
    s.calls.length = 0; // isolate the responded sequence
    d.turnResponded();
    expect(s.calls).toEqual([
      ['end', 'plate_the_dish'],
      ['start', 'read_the_ticket'], ['end', 'read_the_ticket'],
      ['start', 'serve_by_type'], ['end', 'serve_by_type'],
      ['start', 'stock_the_pantry'], ['end', 'stock_the_pantry'],
    ]);
  });

  it('a full turn emits each of the six steps started then ended, in order', () => {
    const s = fakeStream();
    const d = createTurnDriver(s);
    d.turnSubmitted();
    d.turnResponded();
    const order = ['take_the_order', 'brief_the_chef', 'plate_the_dish',
      'read_the_ticket', 'serve_by_type', 'stock_the_pantry'];
    expect(s.calls.filter(([t]) => t === 'start').map(([, id]) => id)).toEqual(order);
    expect(s.calls.filter(([t]) => t === 'end').map(([, id]) => id)).toEqual(order);
  });

  it('plate_the_dish stays open between submit and respond', () => {
    const s = fakeStream();
    const d = createTurnDriver(s);
    d.turnSubmitted();
    // After submit: plate started but not yet ended.
    const plateStarts = s.calls.filter((c) => c[0] === 'start' && c[1] === 'plate_the_dish').length;
    const plateEnds = s.calls.filter((c) => c[0] === 'end' && c[1] === 'plate_the_dish').length;
    expect(plateStarts).toBe(1);
    expect(plateEnds).toBe(0);
  });
});
