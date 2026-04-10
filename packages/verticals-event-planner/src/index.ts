/**
 * @webwaka/verticals-event-planner — public API
 * registerEventPlannerVertical() wires this vertical into the WebWaka FSM registry
 */

export * from './types.js';
export { EventPlannerRepository } from './event-planner.js';

export function registerEventPlannerVertical() {
  return {
    slug: 'event-planner',
    name: 'Event Planner / MC',
    milestone: 'M9',
    primary_pillars: ['ops', 'branding', 'marketplace'] as const,
    regulatory_gate: 'licence_verified',
    fsm_states: ['seeded', 'claimed', 'licence_verified', 'active', 'suspended'],
    ai_autonomy_max: 'L2',
    kyc_tier_required: 2,
    p13_fields: ['client_phone'],
    ussd_excluded: true,
  };
}
