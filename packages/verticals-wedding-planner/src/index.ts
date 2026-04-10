/**
 * @webwaka/verticals-wedding-planner — public API
 * registerWeddingPlannerVertical() wires this vertical into the WebWaka FSM registry
 */

export * from './types.js';
export { WeddingPlannerRepository } from './wedding-planner.js';

export function registerWeddingPlannerVertical() {
  return {
    slug: 'wedding-planner',
    name: 'Wedding Planner / Celebrant',
    milestone: 'M12',
    primary_pillars: ['ops', 'branding', 'marketplace'] as const,
    regulatory_gate: 'cac_verified',
    fsm_states: ['seeded', 'claimed', 'cac_verified', 'active', 'suspended'],
    ai_autonomy_max: 'L2',
    kyc_tier_required: 2,
    p13_fields: ['couple_identity'],
    ussd_excluded: true,
  };
}
