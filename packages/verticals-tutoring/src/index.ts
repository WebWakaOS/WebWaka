export * from './types.js';

export const VERTICAL_SLUG = 'tutoring';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerTutoringVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Tutoring / Lesson Teacher',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ["seeded", "claimed", "active"] as const,
    entity_type: 'individual' as const,
    milestone: 'M9' as const,
  };
}
