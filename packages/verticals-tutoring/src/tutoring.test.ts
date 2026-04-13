import { describe, it, expect } from 'vitest';
import { isValidTutoringTransition, VERTICAL_SLUG } from './index.js';

describe('Tutoring / Lesson Teacher vertical', () => {
  it('exports correct slug', () => {
    expect(VERTICAL_SLUG).toBe('tutoring');
  });

  it('validates FSM transitions', () => {
    expect(isValidTutoringTransition('seeded', 'claimed')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(isValidTutoringTransition('active', 'seeded')).toBe(false);
  });
});
