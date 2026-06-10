import { render, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
import { ResponseReadyStrip } from './ResponseReadyStrip.jsx';

afterEach(cleanup);

describe('ResponseReadyStrip scaffold (Component #7)', () => {
  it('renders the exact D-WS2-14 status copy', () => {
    const { container } = render(<ResponseReadyStrip />);

    const strip = container.querySelector('.response-ready-strip');
    expect(strip).not.toBeNull();
    expect(strip.textContent).toBe(
      'Response ready · advance to Step 5 to see it served'
    );
  });

  it('is a polite status live region', () => {
    const { container } = render(<ResponseReadyStrip />);

    const strip = container.querySelector('.response-ready-strip');
    expect(strip.getAttribute('role')).toBe('status');
    expect(strip.getAttribute('aria-live')).toBe('polite');
  });
});
