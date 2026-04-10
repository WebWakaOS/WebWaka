/**
 * @webwaka/verticals-training-institute
 * M9 — Training Institute / Vocational School vertical
 * Primary pillars: Ops, Branding, Marketplace
 */

export * from './types.js';
export { TrainingInstituteRepository } from './training-institute.js';

export const VERTICAL_SLUG = 'training-institute' as const;
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerTrainingInstituteVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Training Institute / Vocational School',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'nbte_verified', 'active', 'suspended'] as const,
    regulatory_gate: 'nbte_verified' as const,
    ai_capabilities: ['STUDENT_PROGRESS_REPORT', 'DEMAND_PLANNING'] as const,
    ai_autonomy_level: 2 as const,
    hitl_required: false,
    kyc_tier_default: 1 as const,
    kyc_tier_siwes: 2 as const,
    p13_enforced: true,
    p12_ussd_ai_blocked: true,
    milestone: 'M9' as const,
  };
}
