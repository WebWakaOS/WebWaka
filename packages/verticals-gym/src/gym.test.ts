import { describe, it, expect } from 'vitest';
import { isValidGymTransition, VERTICAL_SLUG } from './index.js';

describe('Gym / Wellness Centre vertical', () => {
  it('exports correct slug', () => {
    expect(VERTICAL_SLUG).toBe('gym');
  });

  it('validates FSM transitions', () => {
    expect(isValidGymTransition('seeded', 'claimed')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(isValidGymTransition('active', 'seeded')).toBe(false);
  });
});
