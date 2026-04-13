import { describe, it, expect } from 'vitest';
import { isValidLgaOfficeTransition, VERTICAL_SLUG } from './index.js';

describe('Local Government Council / Ward Office vertical', () => {
  it('exports correct slug', () => {
    expect(VERTICAL_SLUG).toBe('lga-office');
  });

  it('validates FSM transitions', () => {
    expect(isValidLgaOfficeTransition('seeded', 'claimed')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(isValidLgaOfficeTransition('active', 'seeded')).toBe(false);
  });
});
