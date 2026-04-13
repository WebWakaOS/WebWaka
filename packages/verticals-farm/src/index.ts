/**
 * @webwaka/verticals-farm
 * M10 Agricultural + Specialist Verticals
 * Primary pillars: Ops, Marketplace, Finance
 */

export * from './types.js';
export { FarmRepository } from './farm.js';

export const VERTICAL_SLUG = 'farm';
export const PRIMARY_PILLARS = ['ops', 'marketplace', 'finance'] as const;

export function registerFarmVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Farm / Agricultural Producer',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'cac_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['DEMAND_PLANNING', 'HARVEST_FORECAST'] as const,
    ai_autonomy_level: 2 as const,
    milestone: 'M10' as const,
    adl_010_agricultural_cap: true as const,
    compliance_requirements: ['CAC', 'NDPR'] as const,
  };
}
