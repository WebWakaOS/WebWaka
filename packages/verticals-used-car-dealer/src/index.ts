/**
 * @webwaka/verticals-used-car-dealer
 * M11 Commerce P3 — Task V-COMM-EXT-C14
 * Primary pillars: Ops, Branding, Marketplace
 */

export * from './types.js';
export { UsedCarDealerRepository } from './used-car-dealer.js';

export const VERTICAL_SLUG = 'used-car-dealer' as const;
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerUsedCarDealerVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Used Car Dealership',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'frsc_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['PRICING_ADVISOR'] as const,
    ai_autonomy_level: 1 as const,
    milestone: 'M11' as const,
  };
}
