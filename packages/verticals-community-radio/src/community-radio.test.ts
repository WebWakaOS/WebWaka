import { describe, it, expect } from 'vitest';
import { isValidCommunityRadioTransition, VERTICAL_SLUG } from './index.js';

describe('Community Radio / TV Station vertical', () => {
  it('exports correct slug', () => {
    expect(VERTICAL_SLUG).toBe('community-radio');
  });

  it('validates FSM transitions', () => {
    expect(isValidCommunityRadioTransition('seeded', 'claimed')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(isValidCommunityRadioTransition('active', 'seeded')).toBe(false);
  });
});
