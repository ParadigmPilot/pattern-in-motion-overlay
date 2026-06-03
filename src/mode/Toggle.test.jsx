import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from './Toggle.jsx';

describe('Toggle', () => {
  it('renders as a switch with the given accessible label', () => {
    render(<Toggle checked={false} onChange={() => {}} label="Step" />);
    expect(screen.getByRole('switch', { name: 'Step' })).toBeTruthy();
  });

  it('defaults the label to "Step"', () => {
    render(<Toggle checked={false} onChange={() => {}} />);
    expect(screen.getByRole('switch', { name: 'Step' })).toBeTruthy();
  });

  it('reflects the off state with aria-checked=false', () => {
    render(<Toggle checked={false} onChange={() => {}} />);
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false');
  });

  it('reflects the on state with aria-checked=true', () => {
    render(<Toggle checked onChange={() => {}} />);
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
  });

  it('calls onChange with the negated value when clicked from off', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when clicked from on', () => {
    const onChange = vi.fn();
    render(<Toggle checked onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('applies the is-on class only when checked', () => {
    const { rerender } = render(<Toggle checked={false} onChange={() => {}} />);
    expect(screen.getByRole('switch').className).not.toContain('is-on');
    rerender(<Toggle checked onChange={() => {}} />);
    expect(screen.getByRole('switch').className).toContain('is-on');
  });
});
