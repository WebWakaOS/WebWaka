/**
 * @webwaka/verticals-accounting-firm — public API
 * registerAccountingFirmVertical() wires this vertical into the WebWaka FSM registry
 */

export * from './types.js';
export { AccountingFirmRepository } from './accounting-firm.js';

export function registerAccountingFirmVertical() {
  return {
    slug: 'accounting-firm',
    name: 'Accounting Firm / Audit Practice',
    milestone: 'M9',
    primary_pillars: ['ops', 'branding', 'marketplace'] as const,
    regulatory_gate: 'ican_verified',
    fsm_states: ['seeded', 'claimed', 'ican_verified', 'active', 'suspended'],
    ai_autonomy_max: 'L2',
    kyc_tier_required: 2,
    p13_fields: ['client_ref_id', 'engagement_id'],
    ussd_excluded: true,
  };
}
