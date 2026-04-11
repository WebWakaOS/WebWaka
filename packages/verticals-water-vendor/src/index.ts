/**
 * @webwaka/verticals-water-vendor
 * M10 Commerce P3 — Task V-COMM-EXT-C15
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { WaterVendorRepository } from './water-vendor.js';

export const VERTICAL_SLUG = 'water-vendor' as const;
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerWaterVendorVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Sachet/Bottled Water Vendor',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'nafdac_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['DEMAND_FORECAST'] as const,
    ai_autonomy_level: 1 as const,
    milestone: 'M10' as const,
  };
}
