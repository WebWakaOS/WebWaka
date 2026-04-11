/**
 * @webwaka/verticals-waste-management
 * M11 — Waste Management / Recycler vertical
 * Primary pillars: Ops, Branding, Marketplace
 */

export * from './types.js';
export { WasteManagementRepository } from './waste-management.js';

export const VERTICAL_SLUG = 'waste-management' as const;
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerWasteManagementVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Waste Management / Recycler',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'fmenv_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['DEMAND_PLANNING', 'SALES_FORECAST'] as const,
    ai_autonomy_level: 2 as const,
    hitl_required: false,
    milestone: 'M11' as const,
  };
}
