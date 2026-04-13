/**
 * @webwaka/verticals-private-school
 * M12 — Private School Operator vertical
 * Primary pillars: Ops, Branding, Marketplace
 */

export * from './types.js';
export { PrivateSchoolRepository } from './private-school.js';

export const VERTICAL_SLUG = 'private-school';
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerPrivateSchoolVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Private School Operator',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'subeb_verified', 'active', 'suspended'] as const,
    regulatory_gate: 'subeb_verified' as const,
    ai_capabilities: ['STUDENT_PROGRESS_REPORT'] as const,
    ai_autonomy_level: 2 as const,
    hitl_required: false,
    kyc_tier_default: 2 as const,
    kyc_tier_payroll: 3 as const,
    p13_enforced: true,
    p12_ussd_ai_blocked: true,
    milestone: 'M12' as const,
  };
}
