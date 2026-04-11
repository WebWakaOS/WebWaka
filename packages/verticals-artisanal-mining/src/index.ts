/**
 * @webwaka/verticals-artisanal-mining
 * M12 Commerce P3 — Task V-COMM-EXT-C1
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { ArtisanalMiningRepository } from './artisanal-mining.js';

export const VERTICAL_SLUG = 'artisanal-mining' as const;
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerArtisanalMiningVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Artisanal Mining Operator',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'mmsd_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['DEMAND_FORECAST'] as const,
    ai_autonomy_level: 1 as const,
    milestone: 'M12' as const,
  };
}
