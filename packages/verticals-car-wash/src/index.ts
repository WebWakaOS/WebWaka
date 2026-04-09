/**
 * @webwaka/verticals-car-wash
 * M12 Commerce P3 — Task V-COMM-EXT-C4
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { CarWashRepository } from './car-wash.js';

export const VERTICAL_SLUG = 'car-wash' as const;
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerCarWashVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Car Wash / Detailing',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'active'] as const,
    ai_capabilities: ['SALES_FORECAST'] as const,
    ai_autonomy_level: 1 as const,
    milestone: 'M12' as const,
  };
}
