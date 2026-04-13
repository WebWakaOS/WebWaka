/**
 * @webwaka/verticals-bookshop
 * M9 Commerce P2 — Task V-COMM-EXT-A4
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { BookshopRepository } from './bookshop.js';

export const VERTICAL_SLUG = 'bookshop';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerBookshopVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Bookshop / Stationery Store',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'cac_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['DEMAND_PLANNING', 'SALES_FORECAST'] as const,
    ai_autonomy_level: 2 as const,
    milestone: 'M9' as const,
  };
}
