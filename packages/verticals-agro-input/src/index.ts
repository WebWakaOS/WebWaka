/**
 * @webwaka/verticals-agro-input
 * M10 — Agro-Input Dealer vertical
 * Primary pillars: Ops, Marketplace
 * ADL-010: AI at L2 maximum — no automated procurement decisions
 */

export * from './types.js';
export { AgroInputRepository } from './agro-input.js';

export const VERTICAL_SLUG = 'agro-input';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerAgroInputVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Agro-Input Dealer',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'nasc_verified', 'active', 'suspended'] as const,
    regulatory_gate: 'nasc_verified' as const,
    ai_capabilities: ['COMMODITY_PRICE_ALERT', 'YIELD_FORECAST'] as const,
    ai_autonomy_level: 2 as const,
    ai_autonomy_cap: 'L2_ADVISORY_ONLY' as const,
    hitl_required: false,
    kyc_tier_default: 2 as const,
    kyc_tier_abp: 3 as const,
    p13_enforced: true,
    p12_ussd_ai_blocked: true,
    adl_010_agricultural_cap: true,
    milestone: 'M10' as const,
  };
}
