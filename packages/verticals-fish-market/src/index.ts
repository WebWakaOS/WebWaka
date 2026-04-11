/**
 * @webwaka/verticals-fish-market
 * M12 — Fish Market / Fishmonger vertical
 * Primary pillars: Ops, Marketplace
 * ADL-010: AI at L2 maximum — demand planning advisory only
 * Weights as integer grams; expiry as integer unix timestamp
 */

export * from './types.js';
export { FishMarketRepository } from './fish-market.js';

export const VERTICAL_SLUG = 'fish-market' as const;
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerFishMarketVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Fish Market / Fishmonger',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'nafdac_verified', 'active', 'suspended'] as const,
    regulatory_gate: 'nafdac_verified' as const,
    ai_capabilities: ['DEMAND_PLANNING', 'COMMODITY_PRICE_ALERT'] as const,
    ai_autonomy_level: 2 as const,
    ai_autonomy_cap: 'L2_ADVISORY_ONLY' as const,
    hitl_required: false,
    kyc_tier_default: 1 as const,
    kyc_tier_wholesale: 2 as const,
    p13_enforced: true,
    p12_ussd_ai_blocked: true,
    adl_010_agricultural_cap: true,
    weight_unit: 'integer_grams' as const,
    milestone: 'M12' as const,
  };
}
