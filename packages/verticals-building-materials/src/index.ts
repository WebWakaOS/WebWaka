/**
 * @webwaka/verticals-building-materials
 * M12 Commerce P3 — Task V-COMM-EXT-C3
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { BuildingMaterialsRepository } from './building-materials.js';

export const VERTICAL_SLUG = 'building-materials';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerBuildingMaterialsVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Building Materials Supplier',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'cac_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['DEMAND_PLANNING', 'SALES_FORECAST'] as const,
    ai_autonomy_level: 1 as const,
    milestone: 'M12' as const,
  };
}
