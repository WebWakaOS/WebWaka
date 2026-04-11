/**
 * @webwaka/verticals-pr-firm — public API
 * registerPrFirmVertical() wires this vertical into the WebWaka FSM registry
 */

export * from './types.js';
export { PrFirmRepository } from './pr-firm.js';

export function registerPrFirmVertical() {
  return {
    slug: 'pr-firm',
    name: 'Public Relations Firm',
    milestone: 'M12',
    primary_pillars: ['ops', 'branding', 'marketplace'] as const,
    regulatory_gate: 'nipr_verified',
    fsm_states: ['seeded', 'claimed', 'nipr_verified', 'active', 'suspended'],
    ai_autonomy_max: 'L2',
    kyc_tier_required: 2,
    p13_fields: ['client_ref_id', 'campaign_strategy'],
    ussd_excluded: true,
  };
}
