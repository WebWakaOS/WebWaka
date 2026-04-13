export * from './types.js';

export const VERTICAL_SLUG = 'pharmacy';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerPharmacyVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Pharmacy / Drug Store',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ["seeded", "claimed", "nafdac_verified", "active"] as const,
    entity_type: 'organization' as const,
    milestone: 'M9' as const,
  };
}
