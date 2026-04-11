/**
 * @webwaka/verticals-tax-consultant — public API
 * registerTaxConsultantVertical() wires this vertical into the WebWaka FSM registry
 * CRITICAL: L3 HITL mandatory for ALL AI calls — tax privilege P13
 */

export * from './types.js';
export { TaxConsultantRepository } from './tax-consultant.js';

export function registerTaxConsultantVertical() {
  return {
    slug: 'tax-consultant',
    name: 'Tax Consultant / Revenue Agent',
    milestone: 'M12',
    primary_pillars: ['ops', 'branding', 'marketplace'] as const,
    regulatory_gate: 'firs_verified',
    fsm_states: ['seeded', 'claimed', 'firs_verified', 'active', 'suspended'],
    ai_autonomy_max: 'L3_HITL',
    ai_hitl_mandatory: true,
    kyc_tier_required: 2,
    p13_absolute: true,
    p13_fields: ['client_ref_id', 'firs_tin', 'liability_kobo'],
    ussd_excluded: true,
  };
}
