/**
 * @webwaka/verticals-cocoa-exporter
 * M12 — Cocoa / Export Commodities Trader vertical
 * Primary pillars: Ops, Marketplace
 * KYC Tier 3 MANDATORY — export FX transactions; CBN forex requirements
 * ADL-010: AI at L2 maximum — commodity alerts advisory only
 */

export * from './types.js';
export { CocoaExporterRepository } from './cocoa-exporter.js';

export const VERTICAL_SLUG = 'cocoa-exporter';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerCocoaExporterVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Cocoa / Export Commodities Trader',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'nepc_verified', 'active', 'suspended'] as const,
    regulatory_gate: 'nepc_verified' as const,
    ai_capabilities: ['COMMODITY_PRICE_ALERT'] as const,
    ai_autonomy_level: 2 as const,
    ai_autonomy_cap: 'L2_ADVISORY_ONLY' as const,
    hitl_required: false,
    kyc_tier_default: 3 as const,
    kyc_tier_mandatory: true as const,
    p13_enforced: true,
    p12_ussd_ai_blocked: true,
    adl_010_agricultural_cap: true,
    milestone: 'M12' as const,
  };
}
