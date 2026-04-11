/**
 * @webwaka/verticals-mosque
 * M8d — Mosque / Islamic Centre vertical
 * Primary pillars: Ops, Branding, Marketplace
 */

export * from './types.js';
export { MosqueRepository } from './mosque.js';

export const VERTICAL_SLUG = 'mosque';
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerMosqueVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Mosque / Islamic Centre',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'it_registered', 'active', 'suspended'] as const,
    ai_capabilities: ['MEMBER_ENGAGEMENT_REPORT', 'DONATION_TREND'] as const,
    ai_autonomy_level: 2 as const,
    hitl_required: false,
    milestone: 'M8d' as const,
  };
}
