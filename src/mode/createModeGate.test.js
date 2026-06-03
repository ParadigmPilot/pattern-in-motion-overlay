import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createModeGate } from './createModeGate.js';

function createFakeSubstrate() {
  const listeners = new Set();
  return {
    emit(event) {
      for (const listener of listeners) listener(event);
    },
    emitTurn(steps) {
      for (const stepId of steps) {
        this.emit({ type: 'step_started', stepId, timestamp: 0 });
        this.emit({ type: 'step_ended', stepId, timestamp: 0 });
      }
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

const STEPS = ['s1', 's2', 's3'];
const label = (e) => `${e.stepId}:${e.type}`;

describe('createModeGate', () => {
  it('defaults to manual mode', () => {
    expect(createModeGate(createFakeSubstrate()).getMode()).toBe('manual');
  });

  it('honors an explicit automatic initial mode', () => {
    expect(createModeGate(createFakeSubstrate(), 'automatic').getMode()).toBe('automatic');
  });

  it('coerces an unknown initial mode to manual', () => {
    expect(createModeGate(createFakeSubstrate(), 'sideways').getMode()).toBe('manual');
  });

  it('forwards events immediately in automatic mode', () => {
    const sub = createFakeSubstrate();
    const gate = createModeGate(sub, 'automatic');
    const seen = [];
    gate.subscribe((e) => seen.push(e));
    sub.emit({ type: 'step_started', stepId: 's1', timestamp: 0 });
    expect(seen).toHaveLength(1);
    expect(gate.pendingCount()).toBe(0);
  });

  it('buffers events in manual mode until advance', () => {
    const sub = createFakeSubstrate();
    const gate = createModeGate(sub, 'manual');
    const seen = [];
    gate.subscribe((e) => seen.push(e));
    sub.emitTurn(STEPS);
    expect(seen).toHaveLength(0);
    expect(gate.pendingCount()).toBe(6);
  });

  describe('setMode (mode only — never delivers)', () => {
    it('switching manual to automatic does not deliver the backlog', () => {
      const sub = createFakeSubstrate();
      const gate = createModeGate(sub, 'manual');
      const seen = [];
      gate.subscribe((e) => seen.push(e));
      sub.emitTurn(STEPS);
      gate.setMode('automatic');
      expect(seen).toHaveLength(0);
      expect(gate.pendingCount()).toBe(6);
      expect(gate.getMode()).toBe('automatic');
    });

    it('after switching to automatic, new upstream events forward live', () => {
      const sub = createFakeSubstrate();
      const gate = createModeGate(sub, 'manual');
      const seen = [];
      gate.subscribe((e) => seen.push(e));
      sub.emit({ type: 'step_started', stepId: 's1', timestamp: 0 }); // buffered
      gate.setMode('automatic');
      sub.emit({ type: 'step_started', stepId: 's2', timestamp: 0 }); // live
      expect(seen.map(label)).toEqual(['s2:step_started']);
      expect(gate.pendingCount()).toBe(1); // s1 still buffered
    });

    it('ignores an invalid setMode value', () => {
      const gate = createModeGate(createFakeSubstrate(), 'manual');
      gate.setMode('nonsense');
      expect(gate.getMode()).toBe('manual');
    });
  });

  describe('step-level advance', () => {
    it('first advance reveals only the first step_started', () => {
      const sub = createFakeSubstrate();
      const gate = createModeGate(sub, 'manual');
      const seen = [];
      gate.subscribe((e) => seen.push(e));
      sub.emitTurn(STEPS);
      expect(gate.advance()).toBe(true);
      expect(seen.map(label)).toEqual(['s1:step_started']);
    });

    it('each subsequent advance completes the current step and starts the next', () => {
      const sub = createFakeSubstrate();
      const gate = createModeGate(sub, 'manual');
      const seen = [];
      gate.subscribe((e) => seen.push(e));
      sub.emitTurn(STEPS);
      gate.advance();
      gate.advance();
      expect(seen.map(label)).toEqual(['s1:step_started', 's1:step_ended', 's2:step_started']);
    });

    it('the final advance drains the trailing step_ended', () => {
      const sub = createFakeSubstrate();
      const gate = createModeGate(sub, 'manual');
      const seen = [];
      gate.subscribe((e) => seen.push(e));
      sub.emitTurn(STEPS);
      gate.advance();
      gate.advance();
      gate.advance();
      expect(gate.advance()).toBe(true);
      expect(gate.pendingCount()).toBe(0);
      expect(seen).toHaveLength(6);
      expect(label(seen[5])).toBe('s3:step_ended');
    });

    it('advance returns false when the queue is empty', () => {
      expect(createModeGate(createFakeSubstrate(), 'manual').advance()).toBe(false);
    });

    it('advance is a no-op in automatic mode', () => {
      const sub = createFakeSubstrate();
      const gate = createModeGate(sub, 'automatic');
      sub.emit({ type: 'step_started', stepId: 's1', timestamp: 0 });
      expect(gate.advance()).toBe(false);
    });
  });

  describe('playRemaining (Send-driven auto playback)', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('plays the remaining backlog one step per interval after a partial step', () => {
      const sub = createFakeSubstrate();
      const gate = createModeGate(sub, 'manual');
      const seen = [];
      gate.subscribe((e) => seen.push(e));
      sub.emitTurn(STEPS);
      gate.advance(); // reveal s1
      gate.setMode('automatic'); // arm — moves nothing
      expect(seen).toHaveLength(1);
      gate.playRemaining(100); // Send drives playback
      expect(seen).toHaveLength(1); // paced
      vi.advanceTimersByTime(100);
      expect(seen.map(label)).toEqual(['s1:step_started', 's1:step_ended', 's2:step_started']);
      vi.advanceTimersByTime(100);
      expect(seen).toHaveLength(5);
      vi.advanceTimersByTime(100);
      expect(seen).toHaveLength(6);
      expect(gate.pendingCount()).toBe(0);
    });

    it('drains synchronously when the interval is non-positive', () => {
      const sub = createFakeSubstrate();
      const gate = createModeGate(sub, 'manual');
      const seen = [];
      gate.subscribe((e) => seen.push(e));
      sub.emitTurn(STEPS);
      gate.setMode('automatic');
      gate.playRemaining(0);
      expect(seen).toHaveLength(6);
      expect(gate.pendingCount()).toBe(0);
    });

    it('is a no-op in manual mode', () => {
      const sub = createFakeSubstrate();
      const gate = createModeGate(sub, 'manual');
      const seen = [];
      gate.subscribe((e) => seen.push(e));
      sub.emitTurn(STEPS);
      gate.playRemaining(100);
      vi.advanceTimersByTime(1000);
      expect(seen).toHaveLength(0);
      expect(gate.pendingCount()).toBe(6);
    });

    it('is a no-op when the queue is empty', () => {
      const sub = createFakeSubstrate();
      const gate = createModeGate(sub, 'automatic');
      const seen = [];
      gate.subscribe((e) => seen.push(e));
      gate.playRemaining(100);
      vi.advanceTimersByTime(1000);
      expect(seen).toHaveLength(0);
    });

    it('aborts the playback if mode flips back to manual', () => {
      const sub = createFakeSubstrate();
      const gate = createModeGate(sub, 'manual');
      const seen = [];
      gate.subscribe((e) => seen.push(e));
      sub.emitTurn(STEPS);
      gate.advance(); // s1
      gate.setMode('automatic');
      gate.playRemaining(100);
      vi.advanceTimersByTime(100); // one step group
      const afterOne = seen.length;
      gate.setMode('manual'); // flip back -> halt
      vi.advanceTimersByTime(1000);
      expect(seen.length).toBe(afterOne);
      expect(gate.pendingCount()).toBeGreaterThan(0);
    });
  });

  it('passes loadManifest and runScriptedTurn through to the substrate', () => {
    const gate = createModeGate(createFakeSubstrate());
    expect(gate.loadManifest('s1')).toEqual({ stepId: 's1' });
    expect(gate.runScriptedTurn()).toBe('ran');
  });

  it('reset clears the buffer without delivering', () => {
    const sub = createFakeSubstrate();
    const gate = createModeGate(sub, 'manual');
    const seen = [];
    gate.subscribe((e) => seen.push(e));
    sub.emitTurn(STEPS);
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
    sub.emit({ type: 'step_started', stepId: 's1', timestamp: 0 });
    expect(seen).toHaveLength(0);
  });

  it('teardown detaches and clears the queue', () => {
    const sub = createFakeSubstrate();
    const gate = createModeGate(sub, 'manual');
    gate.subscribe(() => {});
    sub.emitTurn(STEPS);
    gate.teardown();
    expect(gate.pendingCount()).toBe(0);
  });
});
