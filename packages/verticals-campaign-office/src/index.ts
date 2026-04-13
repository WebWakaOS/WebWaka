/**
 * @webwaka/verticals-campaign-office
 * M8b — Campaign Office vertical
 * Primary pillars: Ops, Branding, Marketplace
 * AI: L3 HITL MANDATORY — no campaign insight published without human review
 */

export * from './types.js';
export { CampaignOfficeRepository } from './campaign-office.js';

export const VERTICAL_SLUG = 'campaign-office';
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerCampaignOfficeVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Campaign Office',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'inec_filed', 'active', 'campaign_closed'] as const,
    ai_capabilities: ['CAMPAIGN_INSIGHT'] as const,
    ai_autonomy_level: 3 as const,
    hitl_required: true,
    milestone: 'M8b' as const,
  };
}
