/**
 * @webwaka/verticals-hair-salon
 * M10 Commerce P3 — Task V-COMM-EXT-C8
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { HairSalonRepository } from './hair-salon.js';

export const VERTICAL_SLUG = 'hair-salon' as const;
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerHairSalonVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Hair Salon / Barbing Salon',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'active'] as const,
    ai_capabilities: ['SALES_FORECAST'] as const,
    ai_autonomy_level: 1 as const,
    milestone: 'M10' as const,
  };
}
