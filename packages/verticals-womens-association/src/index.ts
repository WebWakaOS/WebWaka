/**
 * @webwaka/verticals-womens-association
 * M8d — Women's Association / Forum vertical
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { WomensAssocRepository } from './womens-assoc.js';

export const VERTICAL_SLUG = 'womens-association' as const;
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerWomensAssociationVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: "Women's Association / Forum",
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'cac_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['MEMBER_ENGAGEMENT_REPORT'] as const,
    ai_autonomy_level: 2 as const,
    hitl_required: false,
    milestone: 'M8d' as const,
  };
}
