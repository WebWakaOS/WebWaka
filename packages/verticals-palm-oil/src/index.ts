/**
 * @webwaka/verticals-palm-oil
 * M12 — Palm Oil / Vegetable Oil Producer vertical
 * Primary pillars: Ops, Marketplace
 * ADL-010: AI at L2 maximum — yield forecasts and price alerts advisory only
 * FFB weight as integer kg; oil output as integer ml (avoids float litres)
 */

export * from './types.js';
export { PalmOilRepository } from './palm-oil.js';

export const VERTICAL_SLUG = 'palm-oil' as const;
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerPalmOilVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Palm Oil / Vegetable Oil Producer',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'nafdac_verified', 'active', 'suspended'] as const,
    regulatory_gate: 'nafdac_verified' as const,
    ai_capabilities: ['YIELD_FORECAST', 'COMMODITY_PRICE_ALERT'] as const,
    ai_autonomy_level: 2 as const,
    ai_autonomy_cap: 'L2_ADVISORY_ONLY' as const,
    hitl_required: false,
    kyc_tier_default: 2 as const,
    kyc_tier_export: 3 as const,
    p13_enforced: true,
    p12_ussd_ai_blocked: true,
    adl_010_agricultural_cap: true,
    oil_volume_unit: 'integer_ml' as const,
    milestone: 'M12' as const,
  };
}
