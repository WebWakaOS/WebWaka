/**
 * @webwaka/verticals-bakery
 * M9 Commerce P2 — Task V-COMM-EXT-A2
 * Primary pillars: Ops, Branding, Marketplace
 */

export * from './types.js';
export { BakeryRepository } from './bakery.js';

export const VERTICAL_SLUG = 'bakery';
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerBakeryVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Bakery / Confectionery',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'nafdac_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['DEMAND_PLANNING', 'SALES_FORECAST'] as const,
    ai_autonomy_level: 2 as const,
    milestone: 'M9' as const,
  };
}
