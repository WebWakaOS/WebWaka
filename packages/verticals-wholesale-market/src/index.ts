export * from './types.js';

export const VERTICAL_SLUG = 'wholesale-market';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerWholesaleMarketVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Wholesale Market (Onitsha/Alaba/Ladipo)',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ["seeded", "claimed", "active"] as const,
    entity_type: 'place' as const,
    milestone: 'M9' as const,
  };
}
