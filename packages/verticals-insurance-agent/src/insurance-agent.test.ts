import { describe, it, expect } from 'vitest';
import { isValidInsuranceAgentTransition, VERTICAL_SLUG } from './index.js';

describe('Insurance Agent / Broker vertical', () => {
  it('exports correct slug', () => {
    expect(VERTICAL_SLUG).toBe('insurance-agent');
  });

  it('validates FSM transitions', () => {
    expect(isValidInsuranceAgentTransition('seeded', 'claimed')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(isValidInsuranceAgentTransition('active', 'seeded')).toBe(false);
  });
});
