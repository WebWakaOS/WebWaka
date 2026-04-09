/**
 * @webwaka/verticals-borehole-driller
 * M12 Commerce P3 — Task V-COMM-EXT-C2
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { BoreholeDrillerRepository } from './borehole-driller.js';

export const VERTICAL_SLUG = 'borehole-driller' as const;
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerBoreholeDrillerVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Borehole Drilling Company',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'coren_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['SALES_FORECAST'] as const,
    ai_autonomy_level: 1 as const,
    milestone: 'M12' as const,
  };
}
