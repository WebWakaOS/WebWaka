/**
 * @webwaka/verticals-photography-studio — public API
 * registerPhotographyStudioVertical() wires this vertical into the WebWaka FSM registry
 */

export * from './types.js';
export { PhotographyStudioRepository } from './photography-studio.js';

export function registerPhotographyStudioVertical() {
  return {
    slug: 'photography-studio',
    name: 'Photography Studio / Videography',
    milestone: 'M10',
    primary_pillars: ['ops', 'branding', 'marketplace'] as const,
    regulatory_gate: 'cac_verified',
    fsm_states: ['seeded', 'claimed', 'cac_verified', 'active', 'suspended'],
    ai_autonomy_max: 'L2',
    kyc_tier_required: 1,
    p13_fields: ['client_ref_id'],
    ussd_excluded: true,
  };
}
