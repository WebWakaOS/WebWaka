/**
 * @webwaka/verticals-electrical-fittings
 * M12 Commerce P3 — Task V-COMM-EXT-C6
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { ElectricalFittingsRepository } from './electrical-fittings.js';

export const VERTICAL_SLUG = 'electrical-fittings';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerElectricalFittingsVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Electrical Fittings Dealer',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'cac_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['DEMAND_PLANNING'] as const,
    ai_autonomy_level: 1 as const,
    milestone: 'M12' as const,
  };
}
