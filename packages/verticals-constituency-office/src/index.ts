/**
 * @webwaka/verticals-constituency-office
 * M12 — Constituency Development Office vertical
 * Primary pillars: Ops, Branding, Marketplace
 * AI: L3 HITL MANDATORY — no constituency data published without human review
 */

export * from './types.js';
export { ConstituencyOfficeRepository } from './constituency-office.js';

export const VERTICAL_SLUG = 'constituency-office' as const;
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerConstituencyOfficeVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Constituency Development Office',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'inec_verified', 'active', 'suspended'] as const,
    ai_capabilities: ['CAMPAIGN_INSIGHT'] as const,
    ai_autonomy_level: 3 as const,
    hitl_required: true,
    milestone: 'M12' as const,
  };
}
