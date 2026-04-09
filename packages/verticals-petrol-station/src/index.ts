/**
 * @webwaka/verticals-petrol-station
 * M11 Commerce P3 — Task V-COMM-EXT-C9
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { PetrolStationRepository } from './petrol-station.js';

export const VERTICAL_SLUG = 'petrol-station' as const;
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerPetrolStationVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Petrol Filling Station',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'nuprc_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['DEMAND_FORECAST'] as const,
    ai_autonomy_level: 1 as const,
    milestone: 'M11' as const,
  };
}
