/**
 * @webwaka/verticals-generator-dealer
 * M11 Commerce P3 — Task V-COMM-EXT-C7
 * Primary pillars: Ops, Branding, Marketplace
 */

export * from './types.js';
export { GeneratorDealerRepository } from './generator-dealer.js';

export const VERTICAL_SLUG = 'generator-dealer';
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerGeneratorDealerVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Generator Sales & Service Centre',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'son_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['DEMAND_PLANNING', 'SALES_FORECAST'] as const,
    ai_autonomy_level: 2 as const,
    milestone: 'M11' as const,
  };
}
