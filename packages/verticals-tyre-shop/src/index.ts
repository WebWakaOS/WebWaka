/**
 * @webwaka/verticals-tyre-shop
 * M10 Commerce P3 — Task V-COMM-EXT-C13
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { TyreShopRepository } from './tyre-shop.js';

export const VERTICAL_SLUG = 'tyre-shop';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerTyreShopVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Tyre Shop / Alignment Centre',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'active'] as const,
    ai_capabilities: ['DEMAND_PLANNING'] as const,
    ai_autonomy_level: 1 as const,
    milestone: 'M10' as const,
  };
}
