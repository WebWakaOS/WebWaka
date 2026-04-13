/**
 * @webwaka/verticals-vegetable-garden
 * M12 — Vegetable Garden / Horticulture vertical
 * Primary pillars: Ops, Marketplace
 * ADL-010: AI at L2 maximum — harvest forecasts and price alerts advisory only
 * 3-state FSM: seeded → claimed → active (FMARD extension code optional)
 * Weights as integer grams; area as integer sqm
 */

export * from './types.js';
export { VegetableGardenRepository } from './vegetable-garden.js';

export const VERTICAL_SLUG = 'vegetable-garden';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerVegetableGardenVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Vegetable Garden / Horticulture',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'active'] as const,
    regulatory_gate: null,
    ai_capabilities: ['YIELD_FORECAST', 'COMMODITY_PRICE_ALERT'] as const,
    ai_autonomy_level: 2 as const,
    ai_autonomy_cap: 'L2_ADVISORY_ONLY' as const,
    hitl_required: false,
    kyc_tier_default: 1 as const,
    kyc_tier_bulk_contract: 2 as const,
    p13_enforced: true,
    p12_ussd_ai_blocked: true,
    adl_010_agricultural_cap: true,
    fsm_informal_3state: true,
    weight_unit: 'integer_grams' as const,
    milestone: 'M12' as const,
  };
}
