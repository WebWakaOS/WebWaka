import { describe, it, expect } from 'vitest';
import { isValidFashionBrandTransition, VERTICAL_SLUG } from './index.js';

describe('Fashion Brand / Clothing Label vertical', () => {
  it('exports correct slug', () => {
    expect(VERTICAL_SLUG).toBe('fashion-brand');
  });

  it('validates FSM transitions', () => {
    expect(isValidFashionBrandTransition('seeded', 'claimed')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(isValidFashionBrandTransition('active', 'seeded')).toBe(false);
  });
});
