export * from './types.js';

export const VERTICAL_SLUG = 'gym';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerGymVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Gym / Wellness Centre',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ["seeded", "claimed", "active"] as const,
    entity_type: 'organization' as const,
    milestone: 'M9' as const,
  };
}
