/**
 * @webwaka/verticals-creche
 * M12 — Crèche / Day Care Centre vertical
 * Primary pillars: Ops, Branding, Marketplace
 * L3 HITL MANDATORY for ALL AI — child data is most sensitive data type
 */

export * from './types.js';
export { CrecheRepository } from './creche.js';

export const VERTICAL_SLUG = 'creche' as const;
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerCrecheVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Crèche / Day Care Centre',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'subeb_verified', 'active', 'suspended'] as const,
    regulatory_gate: 'subeb_verified' as const,
    ai_capabilities: ['ATTENDANCE_REPORT'] as const,
    ai_autonomy_level: 3 as const,
    hitl_required: true,
    hitl_required_all_ai: true,
    kyc_tier_default: 2 as const,
    p13_enforced: true,
    p13_child_data_critical: true,
    p12_ussd_ai_blocked: true,
    milestone: 'M12' as const,
  };
}
