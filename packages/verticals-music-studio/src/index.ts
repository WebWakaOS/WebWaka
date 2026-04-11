/**
 * @webwaka/verticals-music-studio — public API
 * registerMusicStudioVertical() wires this vertical into the WebWaka FSM registry
 */

export * from './types.js';
export { MusicStudioRepository } from './music-studio.js';

export function registerMusicStudioVertical() {
  return {
    slug: 'music-studio',
    name: 'Music Studio / Recording Studio',
    milestone: 'M10',
    primary_pillars: ['ops', 'branding', 'marketplace'] as const,
    regulatory_gate: 'coson_registered',
    fsm_states: ['seeded', 'claimed', 'coson_registered', 'active', 'suspended'],
    ai_autonomy_max: 'L2',
    kyc_tier_required: 2,
    p13_fields: ['artiste_ref_id', 'royalty_splits', 'deal_terms'],
    ussd_excluded: true,
  };
}
