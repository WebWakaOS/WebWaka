/**
 * @webwaka/verticals-book-club
 * M12 — Book Club / Reading Circle vertical
 * Primary pillars: Ops, Marketplace
 */

export * from './types.js';
export { BookClubRepository } from './book-club.js';

export const VERTICAL_SLUG = 'book-club';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerBookClubVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Book Club / Reading Circle',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'active'] as const,
    ai_capabilities: ['MEMBER_ENGAGEMENT_REPORT'] as const,
    ai_autonomy_level: 1 as const,
    hitl_required: false,
    milestone: 'M12' as const,
  };
}
