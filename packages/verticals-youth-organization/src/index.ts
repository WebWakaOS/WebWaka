/**
 * @webwaka/verticals-youth-organization
 * M8d — Youth Organization / Student Union vertical
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { YouthOrgRepository } from './youth-org.js';

export const VERTICAL_SLUG = 'youth-organization';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerYouthOrganizationVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Youth Organization / Student Union',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'cac_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['MEMBER_ENGAGEMENT_REPORT'] as const,
    ai_autonomy_level: 2 as const,
    hitl_required: false,
    milestone: 'M8d' as const,
  };
}
