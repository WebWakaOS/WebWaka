/**
 * @webwaka/verticals-abattoir
 * M12 — Abattoir / Meat Processing vertical
 * Primary pillars: Ops, Marketplace
 * ADL-010: AI at L2 maximum — yield forecasts are advisory only
 */

export * from './types.js';
export { AbattoirRepository } from './abattoir.js';

export const VERTICAL_SLUG = 'abattoir';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerAbattoirVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Abattoir / Meat Processing',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'nafdac_verified', 'active', 'suspended'] as const,
    regulatory_gate: 'nafdac_verified' as const,
    ai_capabilities: ['YIELD_FORECAST'] as const,
    ai_autonomy_level: 2 as const,
    ai_autonomy_cap: 'L2_ADVISORY_ONLY' as const,
    hitl_required: false,
    kyc_tier_default: 2 as const,
    kyc_tier_export: 3 as const,
    p13_enforced: true,
    p12_ussd_ai_blocked: true,
    adl_010_agricultural_cap: true,
    milestone: 'M12' as const,
  };
}
