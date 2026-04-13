/**
 * @webwaka/verticals-driving-school
 * M9 — Driving School (FRSC-Licensed) vertical
 * Primary pillars: Ops, Branding, Marketplace
 */

export * from './types.js';
export { DrivingSchoolRepository } from './driving-school.js';

export const VERTICAL_SLUG = 'driving-school';
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerDrivingSchoolVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Driving School (FRSC-Licensed)',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'frsc_verified', 'active', 'suspended'] as const,
    regulatory_gate: 'frsc_verified' as const,
    ai_capabilities: ['STUDENT_PROGRESS_REPORT'] as const,
    ai_autonomy_level: 2 as const,
    hitl_required: false,
    hitl_required_for_student_adjacent: true,
    kyc_tier_default: 1 as const,
    kyc_tier_fleet_financing: 2 as const,
    p13_enforced: true,
    p12_ussd_ai_blocked: true,
    milestone: 'M9' as const,
  };
}
