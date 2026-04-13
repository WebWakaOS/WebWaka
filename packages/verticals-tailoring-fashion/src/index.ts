export * from './types.js';

export const VERTICAL_SLUG = 'tailoring-fashion';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerTailoringFashionVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Tailor / Fashion Designer Atelier',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ["seeded", "claimed", "active"] as const,
    entity_type: 'individual' as const,
    milestone: 'M9' as const,
  };
}
