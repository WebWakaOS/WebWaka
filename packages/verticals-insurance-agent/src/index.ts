export * from './types.js';

export const VERTICAL_SLUG = 'insurance-agent';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerInsuranceAgentVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Insurance Agent / Broker',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ["seeded", "claimed", "naicom_verified", "active"] as const,
    entity_type: 'individual' as const,
    milestone: 'M9' as const,
  };
}
