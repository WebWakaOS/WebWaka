import { describe, it, expect } from 'vitest';
import { isValidTailoringFashionTransition, VERTICAL_SLUG } from './index.js';

describe('Tailor / Fashion Designer Atelier vertical', () => {
  it('exports correct slug', () => {
    expect(VERTICAL_SLUG).toBe('tailoring-fashion');
  });

  it('validates FSM transitions', () => {
    expect(isValidTailoringFashionTransition('seeded', 'claimed')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(isValidTailoringFashionTransition('active', 'seeded')).toBe(false);
  });
});
