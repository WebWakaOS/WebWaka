/**
 * @webwaka/verticals-poultry-farm
 * M10 Agricultural + Specialist Verticals
 * Primary pillars: Ops, Marketplace, Finance
 */

export * from './types.js';
export { PoultryFarmRepository } from './poultry-farm.js';

export const VERTICAL_SLUG = 'poultry-farm';
export const PRIMARY_PILLARS = ['ops', 'marketplace', 'finance'] as const;

export function registerPoultryFarmVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Poultry Farm',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'napri_registered', 'active', 'suspended'] as const,
    ai_capabilities: ['DEMAND_PLANNING', 'FLOCK_HEALTH_FORECAST'] as const,
    ai_autonomy_level: 2 as const,
    milestone: 'M10' as const,
    adl_010_agricultural_cap: true as const,
    compliance_requirements: ['NAPRI', 'CAC', 'NDPR'] as const,
  };
}
