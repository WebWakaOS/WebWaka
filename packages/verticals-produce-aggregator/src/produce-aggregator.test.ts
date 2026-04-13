import { describe, it, expect } from 'vitest';
import { isValidProduceAggregatorTransition, VERTICAL_SLUG } from './index.js';

describe('Produce Storage / Market Aggregator vertical', () => {
  it('exports correct slug', () => {
    expect(VERTICAL_SLUG).toBe('produce-aggregator');
  });

  it('validates FSM transitions', () => {
    expect(isValidProduceAggregatorTransition('seeded', 'claimed')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(isValidProduceAggregatorTransition('active', 'seeded')).toBe(false);
  });
});
