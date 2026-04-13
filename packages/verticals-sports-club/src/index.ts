/**
 * @webwaka/verticals-sports-club
 * M12 — Sports Club / Amateur League vertical
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { SportsClubRepository } from './sports-club.js';

export const VERTICAL_SLUG = 'sports-club';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerSportsClubVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Sports Club / Amateur League',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'nsf_registered', 'active', 'suspended'] as const,
    ai_capabilities: ['MEMBER_ENGAGEMENT_REPORT'] as const,
    ai_autonomy_level: 2 as const,
    hitl_required: false,
    milestone: 'M12' as const,
  };
}
