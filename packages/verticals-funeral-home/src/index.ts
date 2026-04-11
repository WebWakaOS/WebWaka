/**
 * @webwaka/verticals-funeral-home — public API
 * registerFuneralHomeVertical() wires this vertical into the WebWaka FSM registry
 * CRITICAL: L3 HITL mandatory for ALL AI calls — deceased data P13 absolute
 */

export * from './types.js';
export { FuneralHomeRepository } from './funeral-home.js';

export function registerFuneralHomeVertical() {
  return {
    slug: 'funeral-home',
    name: 'Funeral Home / Mortuary',
    milestone: 'M12',
    primary_pillars: ['ops', 'branding', 'marketplace'] as const,
    regulatory_gate: 'mortuary_verified',
    fsm_states: ['seeded', 'claimed', 'mortuary_verified', 'active', 'suspended'],
    ai_autonomy_max: 'L3_HITL',
    ai_hitl_mandatory: true,
    kyc_tier_required: 2,
    p13_absolute: true,
    p13_fields: ['case_ref_id', 'deceased_identity', 'family_contact_phone'],
    ussd_excluded: true,
  };
}
