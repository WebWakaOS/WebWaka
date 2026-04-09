/**
 * @webwaka/verticals-catering
 * M9 Commerce P2 — Task V-COMM-EXT-A5
 * Primary pillars: Ops, Branding, Marketplace
 */

export * from './types.js';
export { CateringRepository } from './catering.js';

export const VERTICAL_SLUG = 'catering' as const;
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerCateringVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Catering Service',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'nafdac_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['DEMAND_PLANNING', 'SALES_FORECAST'] as const,
    ai_autonomy_level: 2 as const,
    milestone: 'M9' as const,
  };
}
