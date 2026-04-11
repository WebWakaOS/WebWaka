/**
 * @webwaka/verticals-recording-label — public API
 * registerRecordingLabelVertical() wires this vertical into the WebWaka FSM registry
 * royalty_split_bps: INTEGER basis points — no floats
 */

export * from './types.js';
export { RecordingLabelRepository } from './recording-label.js';

export function registerRecordingLabelVertical() {
  return {
    slug: 'recording-label',
    name: 'Record Label / Music Publisher',
    milestone: 'M12',
    primary_pillars: ['ops', 'branding', 'marketplace'] as const,
    regulatory_gate: 'coson_registered',
    fsm_states: ['seeded', 'claimed', 'coson_registered', 'active', 'suspended'],
    ai_autonomy_max: 'L2',
    kyc_tier_required: 2,
    p13_fields: ['artiste_ref_id', 'royalty_split_bps', 'contract_terms'],
    ussd_excluded: true,
  };
}
