/**
 * @webwaka/verticals-cleaning-service
 * M9 Commerce P2 — Task V-COMM-EXT-A6
 * Primary pillars: Ops, Branding, Marketplace
 */

export * from './types.js';
export { CleaningServiceRepository } from './cleaning-service.js';

export const VERTICAL_SLUG = 'cleaning-service' as const;
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerCleaningServiceVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Cleaning Service',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'cac_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['DEMAND_PLANNING', 'SALES_FORECAST'] as const,
    ai_autonomy_level: 2 as const,
    milestone: 'M9' as const,
  };
}
