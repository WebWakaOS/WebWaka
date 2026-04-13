export * from './types.js';

export const VERTICAL_SLUG = 'lga-office';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerLgaOfficeVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Local Government Council / Ward Office',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ["seeded", "claimed", "active"] as const,
    entity_type: 'place' as const,
    milestone: 'M9' as const,
  };
}
