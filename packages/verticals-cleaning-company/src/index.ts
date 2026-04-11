/**
 * @webwaka/verticals-cleaning-company
 * M11 Commerce P3 — Task V-COMM-EXT-C5
 * Primary pillars: Ops, Branding, Marketplace
 */

export * from './types.js';
export { CleaningCompanyRepository } from './cleaning-company.js';

export const VERTICAL_SLUG = 'cleaning-company' as const;
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerCleaningCompanyVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Cleaning & Facility Management Company',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'cac_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['SALES_FORECAST'] as const,
    ai_autonomy_level: 2 as const,
    milestone: 'M11' as const,
  };
}
