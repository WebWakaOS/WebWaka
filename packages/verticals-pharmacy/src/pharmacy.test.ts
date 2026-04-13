import { describe, it, expect } from 'vitest';
import { isValidPharmacyTransition, VERTICAL_SLUG } from './index.js';

describe('Pharmacy / Drug Store vertical', () => {
  it('exports correct slug', () => {
    expect(VERTICAL_SLUG).toBe('pharmacy');
  });

  it('validates FSM transitions', () => {
    expect(isValidPharmacyTransition('seeded', 'claimed')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(isValidPharmacyTransition('active', 'seeded')).toBe(false);
  });
});
