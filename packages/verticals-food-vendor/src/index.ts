/**
 * @webwaka/verticals-food-vendor
 * M9 Commerce P2 — Task V-COMM-EXT-A9
 * 3-state informal FSM: seeded → claimed → active
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { FoodVendorRepository } from './food-vendor.js';

export const VERTICAL_SLUG = 'food-vendor';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerFoodVendorVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Food Vendor / Street Food',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'active'] as const,
    ai_capabilities: ['DEMAND_PLANNING'] as const,
    ai_autonomy_level: 1 as const,
    milestone: 'M9' as const,
  };
}
