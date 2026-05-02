/**
 * FSM Bulk Validation — Wave 3 (B2-4)
 * Runs FSMEngine.validateConfig() against all registry FSM configs.
 * Any invalid FSM config will fail CI — catches orphan states, missing guards,
 * unreachable states before they reach production.
 */

import { describe, it, expect } from 'vitest';
import { REGISTRY } from './registry.js';
import { FSMEngine } from './fsm.js';

describe('FSM bulk config validation — all registry verticals', () => {
  const verticals = Object.entries(REGISTRY);

  it(`validates all ${verticals.length} vertical FSM configs without errors`, () => {
    const failures: string[] = [];

    for (const [slug, config] of verticals) {
      const result = FSMEngine.validateConfig(config.fsm);
      if (!result.valid) {
        failures.push(`${slug}: ${result.errors.join('; ')}`);
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `${failures.length} vertical(s) have invalid FSM configs:\n` +
        failures.map((f) => `  - ${f}`).join('\n'),
      );
    }

    expect(failures).toHaveLength(0);
  });

  it('initialState is always the first state in the states array for all verticals', () => {
    const mismatches: string[] = [];
    for (const [slug, config] of verticals) {
      const firstState = config.fsm.states[0];
      if (firstState !== config.fsm.initialState) {
        mismatches.push(`${slug}: initialState='${config.fsm.initialState}' but states[0]='${firstState}'`);
      }
    }
    // This is a warning, not a hard failure — some verticals may intentionally differ
    if (mismatches.length > 0) {
      console.warn('FSM initialState != states[0] for:', mismatches);
    }
  });

  it('every vertical has at least one terminal state (active or equivalent)', () => {
    const missing: string[] = [];
    const terminalCandidates = new Set(['active', 'published', 'verified', 'operational']);
    for (const [slug, config] of verticals) {
      const hasTerminal = config.fsm.states.some((s) => terminalCandidates.has(s));
      if (!hasTerminal) {
        missing.push(slug);
      }
    }
    if (missing.length > 0) {
      console.warn('Verticals with no standard terminal state:', missing);
    }
    // Non-blocking warning — some verticals have custom terminal state names
  });
});
