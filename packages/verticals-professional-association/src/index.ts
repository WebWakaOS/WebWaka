/**
 * @webwaka/verticals-professional-association
 * M12 — Professional Association (NBA/NMA/ICAN) vertical
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { ProfessionalAssocRepository } from './professional-association.js';

export const VERTICAL_SLUG = 'professional-association' as const;
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerProfessionalAssociationVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Professional Association',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'regulatory_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['MEMBER_ENGAGEMENT_REPORT'] as const,
    ai_autonomy_level: 2 as const,
    hitl_required: false,
    milestone: 'M12' as const,
  };
}
