/**
 * @webwaka/verticals-law-firm — public API
 * registerLawFirmVertical() wires this vertical into the WebWaka FSM registry
 * CRITICAL: L3 HITL mandatory for ALL AI calls — legal privilege absolute
 */

export * from './types.js';
export { LawFirmRepository } from './law-firm.js';

export function registerLawFirmVertical() {
  return {
    slug: 'law-firm',
    name: 'Law Firm / Legal Practice',
    milestone: 'M9',
    primary_pillars: ['ops', 'branding', 'marketplace'] as const,
    regulatory_gate: 'nba_verified',
    fsm_states: ['seeded', 'claimed', 'nba_verified', 'active', 'suspended'],
    ai_autonomy_max: 'L3_HITL',
    ai_hitl_mandatory: true,
    kyc_tier_required: 2,
    p13_absolute: true,
    p13_fields: ['matter_ref_id', 'client_identity', 'case_details'],
    ussd_excluded: true,
  };
}
