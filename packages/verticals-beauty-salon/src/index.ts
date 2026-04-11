/**
 * @webwaka/verticals-beauty-salon
 * M9 Commerce P2 — Task V-COMM-EXT-A3
 * Primary pillars: Ops, Branding, Marketplace
 */

export * from './types.js';
export { BeautySalonRepository } from './beauty-salon.js';

export const VERTICAL_SLUG = 'beauty-salon';
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerBeautySalonVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Beauty Salon / Barber Shop',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'permit_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['APPOINTMENT_OPTIMISATION', 'DEMAND_PLANNING'] as const,
    ai_autonomy_level: 2 as const,
    milestone: 'M9' as const,
  };
}
