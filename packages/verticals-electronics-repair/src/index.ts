/**
 * @webwaka/verticals-electronics-repair
 * M9 Commerce P2 — Task V-COMM-EXT-A7
 * Primary pillars: Ops, Branding, Marketplace
 */

export * from './types.js';
export { ElectronicsRepairRepository } from './electronics-repair.js';

export const VERTICAL_SLUG = 'electronics-repair';
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerElectronicsRepairVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Electronics Repair Shop',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'cac_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['DEMAND_PLANNING', 'SALES_FORECAST'] as const,
    ai_autonomy_level: 2 as const,
    milestone: 'M9' as const,
  };
}
