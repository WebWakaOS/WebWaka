import { describe, it, expect } from 'vitest';
import { isValidWholesaleMarketTransition, VERTICAL_SLUG } from './index.js';

describe('Wholesale Market (Onitsha/Alaba/Ladipo) vertical', () => {
  it('exports correct slug', () => {
    expect(VERTICAL_SLUG).toBe('wholesale-market');
  });

  it('validates FSM transitions', () => {
    expect(isValidWholesaleMarketTransition('seeded', 'claimed')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(isValidWholesaleMarketTransition('active', 'seeded')).toBe(false);
  });
});
