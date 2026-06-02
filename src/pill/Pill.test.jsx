import { render, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
import { Pill } from './Pill.jsx';

afterEach(cleanup);

const SAMPLE_MANIFEST = {
  restaurant_label: 'Take the Order',
  technology_label: 'Capture intent',
  animation_asset: '',
  plain_english: '',
  in_code: '',
  just_finished: '',
  up_next: '',
};

describe('Pill primitive', () => {
  it('renders with canonical class set for its state', () => {
    const { container } = render(
      <ol><Pill stepId="take_the_order" state="queued" /></ol>
    );
    const pill = container.querySelector('.pill');
    expect(pill).not.toBeNull();
    expect(pill.tagName).toBe('LI');
    expect(pill.classList.contains('pill')).toBe(true);
    expect(pill.classList.contains('pill-queued')).toBe(true);
  });

  it('exposes data-step-id for test and CSS selection', () => {
    const { container } = render(
      <ol><Pill stepId="brief_the_chef" state="active" /></ol>
    );
    const pill = container.querySelector('[data-step-id="brief_the_chef"]');
    expect(pill).not.toBeNull();
  });

  it('sets aria-current="step" only on active state', () => {
    const { container, rerender } = render(
      <ol><Pill stepId="plate_the_dish" state="queued" /></ol>
    );
    expect(container.querySelector('.pill').getAttribute('aria-current')).toBeNull();

    rerender(<ol><Pill stepId="plate_the_dish" state="active" /></ol>);
    expect(container.querySelector('.pill').getAttribute('aria-current')).toBe('step');

    rerender(<ol><Pill stepId="plate_the_dish" state="complete" /></ol>);
    expect(container.querySelector('.pill').getAttribute('aria-current')).toBeNull();
  });

  it('renders restaurant_label and technology_label when manifest provided', () => {
    const { container } = render(
      <ol><Pill stepId="take_the_order" state="active" manifest={SAMPLE_MANIFEST} /></ol>
    );
    const anchor = container.querySelector('.pill-anchor');
    const peg = container.querySelector('.pill-peg');
    expect(anchor).not.toBeNull();
    expect(peg).not.toBeNull();
    expect(anchor.tagName).toBe('STRONG');
    expect(peg.tagName).toBe('SPAN');
    expect(anchor.textContent).toBe('Take the Order');
    expect(peg.textContent).toBe('Capture intent');
  });

  it('falls back to stepId text when no manifest provided', () => {
    const { container } = render(
      <ol><Pill stepId="serve_by_type" state="queued" /></ol>
    );
    const fallback = container.querySelector('.pill-fallback');
    expect(fallback).not.toBeNull();
    expect(fallback.textContent).toBe('serve_by_type');
  });

  it('renders inline SVG iconography using currentColor when icon prop provided', () => {
    const TestIcon = () => (
      <svg data-testid="test-icon" stroke="currentColor" fill="none">
        <circle cx="12" cy="12" r="6" />
      </svg>
    );
    const { container, getByTestId } = render(
      <ol><Pill stepId="take_the_order" state="active" icon={<TestIcon />} /></ol>
    );
    const slot = container.querySelector('.pill-icon');
    expect(slot).not.toBeNull();
    const svg = getByTestId('test-icon');
    expect(svg).not.toBeNull();
    expect(svg.getAttribute('stroke')).toBe('currentColor');
  });

  it('omits the icon slot when no icon prop is provided', () => {
    const { container } = render(
      <ol><Pill stepId="take_the_order" state="active" /></ol>
    );
    expect(container.querySelector('.pill-icon')).toBeNull();
  });

  it('applies the matching pill-{state} class for each render state', () => {
    const { container, rerender } = render(
      <ol><Pill stepId="x" state="queued" /></ol>
    );
    let pill = container.querySelector('.pill');
    expect(pill.classList.contains('pill-queued')).toBe(true);
    expect(pill.classList.contains('pill-active')).toBe(false);
    expect(pill.classList.contains('pill-complete')).toBe(false);

    rerender(<ol><Pill stepId="x" state="active" /></ol>);
    pill = container.querySelector('.pill');
    expect(pill.classList.contains('pill-active')).toBe(true);
    expect(pill.classList.contains('pill-queued')).toBe(false);

    rerender(<ol><Pill stepId="x" state="complete" /></ol>);
    pill = container.querySelector('.pill');
    expect(pill.classList.contains('pill-complete')).toBe(true);
    expect(pill.classList.contains('pill-active')).toBe(false);
  });

  it('preserves the .pill base class across all state transitions (reserved geometry rule applies)', () => {
    const { container, rerender } = render(
      <ol><Pill stepId="x" state="queued" /></ol>
    );
    expect(container.querySelector('.pill').classList.contains('pill')).toBe(true);

    rerender(<ol><Pill stepId="x" state="active" /></ol>);
    expect(container.querySelector('.pill').classList.contains('pill')).toBe(true);

    rerender(<ol><Pill stepId="x" state="complete" /></ol>);
    expect(container.querySelector('.pill').classList.contains('pill')).toBe(true);
  });
});
