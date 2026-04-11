/**
 * @webwaka/verticals-florist
 * M9 Commerce P2 — Task V-COMM-EXT-A8
 * Primary pillars: Ops, Branding, Marketplace
 */

export * from './types.js';
export { FloristRepository } from './florist.js';

export const VERTICAL_SLUG = 'florist';
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerFloristVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Florist / Garden Centre',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'cac_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['DEMAND_PLANNING', 'SALES_FORECAST'] as const,
    ai_autonomy_level: 2 as const,
    milestone: 'M9' as const,
  };
}
