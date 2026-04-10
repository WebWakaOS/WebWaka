/**
 * @webwaka/verticals-talent-agency — public API
 * registerTalentAgencyVertical() wires this vertical into the WebWaka FSM registry
 * commission_bps: INTEGER basis points — no floats
 * Fee arithmetic: commission_kobo + talent_payout_kobo = brand_fee_kobo
 */

export * from './types.js';
export { TalentAgencyRepository } from './talent-agency.js';

export function registerTalentAgencyVertical() {
  return {
    slug: 'talent-agency',
    name: 'Talent Agency / Model Agency',
    milestone: 'M12',
    primary_pillars: ['ops', 'branding', 'marketplace'] as const,
    regulatory_gate: 'nmma_verified',
    fsm_states: ['seeded', 'claimed', 'nmma_verified', 'active', 'suspended'],
    ai_autonomy_max: 'L2',
    kyc_tier_required: 2,
    p13_fields: ['talent_ref_id', 'deal_terms', 'commission_bps'],
    ussd_excluded: true,
  };
}
