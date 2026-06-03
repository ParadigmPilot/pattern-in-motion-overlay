import { describe, it, expect } from 'vitest';
import { createModeGate } from './createModeGate.js';

function createFakeSubstrate() {
  const listeners = new Set();
  return {
    emit(event) {
      for (const listener of listeners) listener(event);
    },
    subscribe(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    loadManifest(stepId) {
      return { stepId };
    },
    runScriptedTurn() {
      return 'ran';
    },
  };
}

const evt = (stepId, type = 'step_started') => ({ type, stepId, timestamp: 0 });

describe('createModeGate', () => {
  it('defaults to manual mode', () => {
    const gate = createModeGate(createFakeSubstrate());
    expect(gate.getMode()).toBe('manual');
  });

  it('honors an explicit automatic initial mode', () => {
    const gate = createModeGate(createFakeSubstrate(), 'automatic');
    expect(gate.getMode()).toBe('automatic');
  });

  it('coerces an unknown initial mode to manual', () => {
    const gate = createModeGate(createFakeSubstrate(), 'sideways');
    expect(gate.getMode()).toBe('manual');
  });

  it('forwards events immediately in automatic mode', () => {
    const sub = createFakeSubstrate();
    const gate = createModeGate(sub, 'automatic');
    const seen = [];
    gate.subscribe((e) => seen.push(e));
    sub.emit(evt('take_the_order'));
    expect(seen).toHaveLength(1);
    expect(gate.pendingCount()).toBe(0);
  });

  it('buffers events in manual mode until advance', () => {
    const sub = createFakeSubstrate();
    const gate = createModeGate(sub, 'manual');
    const seen = [];
    gate.subscribe((e) => seen.push(e));
    sub.emit(evt('take_the_order', 'step_started'));
    sub.emit(evt('take_the_order', 'step_ended'));
    expect(seen).toHaveLength(0);
    expect(gate.pendingCount()).toBe(2);
  });

  it('releases one buffered event per advance, in order', () => {
    const sub = createFakeSubstrate();
    const gate = createModeGate(sub, 'manual');
    const seen = [];
    gate.subscribe((e) => seen.push(e));
    sub.emit(evt('a'));
    sub.emit(evt('b'));
    expect(gate.advance()).toBe(true);
    expect(seen.map((e) => e.stepId)).toEqual(['a']);
    expect(gate.advance()).toBe(true);
    expect(seen.map((e) => e.stepId)).toEqual(['a', 'b']);
  });

  it('advance returns false when the queue is empty', () => {
    const gate = createModeGate(createFakeSubstrate(), 'manual');
    expect(gate.advance()).toBe(false);
  });

  it('advance is a no-op in automatic mode', () => {
    const sub = createFakeSubstrate();
    const gate = createModeGate(sub, 'automatic');
    sub.emit(evt('a'));
    expect(gate.advance()).toBe(false);
  });

  it('flushes the buffer when switching manual to automatic', () => {
    const sub = createFakeSubstrate();
    const gate = createModeGate(sub, 'manual');
    const seen = [];
    gate.subscribe((e) => seen.push(e));
    sub.emit(evt('a'));
    sub.emit(evt('b'));
    expect(seen).toHaveLength(0);
    gate.setMode('automatic');
    expect(seen.map((e) => e.stepId)).toEqual(['a', 'b']);
    expect(gate.pendingCount()).toBe(0);
  });

  it('ignores an invalid setMode value', () => {
    const gate = createModeGate(createFakeSubstrate(), 'manual');
    gate.setMode('nonsense');
    expect(gate.getMode()).toBe('manual');
  });

  it('passes loadManifest and runScriptedTurn through to the substrate', () => {
    const sub = createFakeSubstrate();
    const gate = createModeGate(sub);
    expect(gate.loadManifest('take_the_order')).toEqual({ stepId: 'take_the_order' });
    expect(gate.runScriptedTurn()).toBe('ran');
  });

  it('reset clears the buffer without delivering', () => {
    const sub = createFakeSubstrate();
    const gate = createModeGate(sub, 'manual');
    const seen = [];
    gate.subscribe((e) => seen.push(e));
    sub.emit(evt('a'));
    gate.reset();
    expect(gate.pendingCount()).toBe(0);
    expect(seen).toHaveLength(0);
  });

  it('stops delivering after unsubscribe', () => {
    const sub = createFakeSubstrate();
    const gate = createModeGate(sub, 'automatic');
    const seen = [];
    const unsub = gate.subscribe((e) => seen.push(e));
    unsub();
    sub.emit(evt('a'));
    expect(seen).toHaveLength(0);
  });

  it('teardown detaches from the substrate and clears the queue', () => {
    const sub = createFakeSubstrate();
    const gate = createModeGate(sub, 'manual');
    const seen = [];
    gate.subscribe((e) => seen.push(e));
    sub.emit(evt('a'));
    gate.teardown();
    sub.emit(evt('b'));
    expect(seen).toHaveLength(0);
    expect(gate.pendingCount()).toBe(0);
  });
});
