export * from './types.js';

export const VERTICAL_SLUG = 'produce-aggregator';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerProduceAggregatorVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Produce Storage / Market Aggregator',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ["seeded", "claimed", "active"] as const,
    entity_type: 'organization' as const,
    milestone: 'M9' as const,
  };
}
