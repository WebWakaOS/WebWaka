import { describe, it, expect } from 'vitest';
import { isValidStartupTransition, VERTICAL_SLUG } from './index.js';

describe('Startup / Early-Stage Company vertical', () => {
  it('exports correct slug', () => {
    expect(VERTICAL_SLUG).toBe('startup');
  });

  it('validates FSM transitions', () => {
    expect(isValidStartupTransition('seeded', 'claimed')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(isValidStartupTransition('active', 'seeded')).toBe(false);
  });
});
