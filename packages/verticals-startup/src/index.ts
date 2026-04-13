export * from './types.js';

export const VERTICAL_SLUG = 'startup';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerStartupVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Startup / Early-Stage Company',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ["seeded", "claimed", "cac_verified", "active"] as const,
    entity_type: 'organization' as const,
    milestone: 'M9' as const,
  };
}
