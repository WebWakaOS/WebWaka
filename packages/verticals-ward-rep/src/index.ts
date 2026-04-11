/**
 * @webwaka/verticals-ward-rep
 * M12 — Ward Representative / Polling Unit vertical
 * Primary pillars: Ops, Marketplace
 * AI: L3 HITL MANDATORY — political content; no constituent data to AI
 */

export * from './types.js';
export { WardRepRepository } from './ward-rep.js';

export const VERTICAL_SLUG = 'ward-rep';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerWardRepVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Ward Representative / Polling Unit',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'active'] as const,
    ai_capabilities: ['CAMPAIGN_INSIGHT'] as const,
    ai_autonomy_level: 3 as const,
    hitl_required: true,
    milestone: 'M12' as const,
  };
}
