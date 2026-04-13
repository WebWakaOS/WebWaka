/**
 * @webwaka/verticals-warehouse
 * M10 Agricultural + Specialist Verticals
 * Primary pillars: Ops, Finance, Marketplace
 */

export * from './types.js';
export { WarehouseRepository } from './warehouse.js';

export const VERTICAL_SLUG = 'warehouse';
export const PRIMARY_PILLARS = ['ops', 'finance', 'marketplace'] as const;

export function registerWarehouseVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Warehouse Operator',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'cac_verified', 'son_certified', 'active', 'suspended'] as const,
    ai_capabilities: ['INVENTORY_OPTIMISATION', 'DEMAND_PLANNING'] as const,
    ai_autonomy_level: 2 as const,
    milestone: 'M10' as const,
    compliance_requirements: ['CAC', 'SON', 'NDPR'] as const,
  };
}
