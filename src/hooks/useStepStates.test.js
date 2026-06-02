import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useStepStates } from './useStepStates.js';

const STEPS = ['alpha', 'beta', 'gamma'];

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
    hasListener() {
      return listener !== null;
    },
  };
}

describe('useStepStates', () => {
  it('subscribes on mount and unsubscribes on unmount', () => {
    const substrate = createTestSubstrate();
    const { unmount } = renderHook(() => useStepStates(substrate, STEPS));
    expect(substrate.hasListener()).toBe(true);
    unmount();
    expect(substrate.hasListener()).toBe(false);
  });

  it('initializes all provided steps in queued state', () => {
    const substrate = createTestSubstrate();
    const { result } = renderHook(() => useStepStates(substrate, STEPS));
    expect(result.current.get('alpha')).toBe('queued');
    expect(result.current.get('beta')).toBe('queued');
    expect(result.current.get('gamma')).toBe('queued');
  });

  it('transitions matching step to active on step_started', () => {
    const substrate = createTestSubstrate();
    const { result } = renderHook(() => useStepStates(substrate, STEPS));
    act(() => {
      substrate.emit({ type: 'step_started', stepId: 'beta', timestamp: Date.now() });
    });
    expect(result.current.get('beta')).toBe('active');
    expect(result.current.get('alpha')).toBe('queued');
    expect(result.current.get('gamma')).toBe('queued');
  });

  it('transitions matching step to complete on step_ended', () => {
    const substrate = createTestSubstrate();
    const { result } = renderHook(() => useStepStates(substrate, STEPS));
    act(() => {
      substrate.emit({ type: 'step_started', stepId: 'gamma', timestamp: Date.now() });
      substrate.emit({ type: 'step_ended', stepId: 'gamma', timestamp: Date.now() });
    });
    expect(result.current.get('gamma')).toBe('complete');
  });

  it('ignores events whose stepId is not in the provided steps array', () => {
    const substrate = createTestSubstrate();
    const { result } = renderHook(() => useStepStates(substrate, STEPS));
    act(() => {
      substrate.emit({ type: 'step_started', stepId: 'unknown', timestamp: Date.now() });
    });
    expect(result.current.get('alpha')).toBe('queued');
    expect(result.current.get('beta')).toBe('queued');
    expect(result.current.get('gamma')).toBe('queued');
  });

  it('ignores events whose type is neither step_started nor step_ended', () => {
    const substrate = createTestSubstrate();
    const { result } = renderHook(() => useStepStates(substrate, STEPS));
    act(() => {
      substrate.emit({ type: 'other_event', stepId: 'beta', timestamp: Date.now() });
    });
    expect(result.current.get('beta')).toBe('queued');
  });
});
