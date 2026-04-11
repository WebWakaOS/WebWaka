/**
 * @webwaka/verticals-cold-room
 * M10 — Cold Room / Storage Facility vertical
 * Primary pillars: Ops, Marketplace
 * ADL-010: AI at L2 maximum — temperature alerts are informational only
 * Temperature stored as integer millidegrees Celsius
 */

export * from './types.js';
export { ColdRoomRepository } from './cold-room.js';

export const VERTICAL_SLUG = 'cold-room';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerColdRoomVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Cold Room / Storage Facility',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'nafdac_verified', 'active', 'suspended'] as const,
    regulatory_gate: 'nafdac_verified' as const,
    ai_capabilities: ['COLD_CHAIN_ANOMALY'] as const,
    ai_autonomy_level: 2 as const,
    ai_autonomy_cap: 'L2_ADVISORY_ONLY' as const,
    hitl_required: false,
    kyc_tier_default: 2 as const,
    kyc_tier_bulk_collateral: 3 as const,
    temperature_unit: 'millidegrees_celsius' as const,
    p13_enforced: true,
    p12_ussd_ai_blocked: true,
    adl_010_agricultural_cap: true,
    milestone: 'M10' as const,
  };
}
