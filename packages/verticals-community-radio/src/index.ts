export * from './types.js';

export const VERTICAL_SLUG = 'community-radio';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerCommunityRadioVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Community Radio / TV Station',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ["seeded", "claimed", "nbc_licensed", "active"] as const,
    entity_type: 'organization' as const,
    milestone: 'M9' as const,
  };
}
