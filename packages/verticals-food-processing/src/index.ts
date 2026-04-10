/**
 * @webwaka/verticals-food-processing
 * M12 — Food Processing Factory vertical
 * Primary pillars: Ops, Branding, Marketplace
 * ADL-010: AI at L2 maximum — demand planning advisory only
 * NAFDAC batch traceability via nafdac_product_number + batch_number
 */

export * from './types.js';
export { FoodProcessingRepository } from './food-processing.js';

export const VERTICAL_SLUG = 'food-processing' as const;
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerFoodProcessingVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Food Processing Factory',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'nafdac_verified', 'active', 'suspended'] as const,
    regulatory_gate: 'nafdac_verified' as const,
    ai_capabilities: ['DEMAND_PLANNING', 'YIELD_FORECAST'] as const,
    ai_autonomy_level: 2 as const,
    ai_autonomy_cap: 'L2_ADVISORY_ONLY' as const,
    hitl_required: false,
    kyc_tier_default: 2 as const,
    kyc_tier_wholesale: 3 as const,
    p13_enforced: true,
    p12_ussd_ai_blocked: true,
    adl_010_agricultural_cap: true,
    nafdac_batch_traceability: true,
    milestone: 'M12' as const,
  };
}
