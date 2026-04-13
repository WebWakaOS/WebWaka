/**
 * @webwaka/verticals-spare-parts
 * M11 Commerce P3 — Task V-COMM-EXT-C12
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { SparePartsRepository } from './spare-parts.js';

export const VERTICAL_SLUG = 'spare-parts';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerSparePartsVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Auto Spare Parts Dealer',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'cac_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['DEMAND_PLANNING'] as const,
    ai_autonomy_level: 1 as const,
    milestone: 'M11' as const,
  };
}
