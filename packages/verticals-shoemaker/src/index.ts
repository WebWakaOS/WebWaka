/**
 * @webwaka/verticals-shoemaker
 * M10 Commerce P3 — Task V-COMM-EXT-C11
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { ShoemakerRepository } from './shoemaker.js';

export const VERTICAL_SLUG = 'shoemaker' as const;
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerShoemakerVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Shoemaker / Cobbler',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'active'] as const,
    ai_capabilities: ['SALES_FORECAST'] as const,
    ai_autonomy_level: 1 as const,
    milestone: 'M10' as const,
  };
}
