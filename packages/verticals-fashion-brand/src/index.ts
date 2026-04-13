export * from './types.js';

export const VERTICAL_SLUG = 'fashion-brand';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerFashionBrandVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Fashion Brand / Clothing Label',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ["seeded", "claimed", "active"] as const,
    entity_type: 'organization' as const,
    milestone: 'M9' as const,
  };
}
