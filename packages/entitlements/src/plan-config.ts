/**
 * Plan capability matrix for WebWaka OS.
 * (entitlement-model.md, TDR-0005)
 *
 * Every plan's capabilities are defined here — the single source of truth
 * for what each subscription tier can access.
 */

import type { SubscriptionPlan } from '@webwaka/types';
import { PlatformLayer } from '@webwaka/types';

// ---------------------------------------------------------------------------
// Plan config shape
// ---------------------------------------------------------------------------

export interface PlanConfig {
  /** Maximum team members in a workspace. -1 = unlimited */
  maxUsers: number;
  /** Maximum managed Place nodes. -1 = unlimited */
  maxPlaces: number;
  /** Maximum active Offerings. -1 = unlimited */
  maxOfferings: number;
  /** Platform layers accessible on this plan */
  layers: PlatformLayer[];
  /** Whether custom branding (logo, colours) is permitted */
  brandingRights: boolean;
  /** 0=none, 1=partner branding, 2=sub-partner white-label */
  whiteLabelDepth: 0 | 1 | 2;
  /** Whether the workspace can create partner sub-workspaces */
  delegationRights: boolean;
  /** Whether AI-powered features are accessible */
  aiRights: boolean;
  /** Whether regulated/sensitive-sector modules are accessible (political, medical, etc.) */
  sensitiveSectorRights: boolean;
  /**
   * WakaPage — Phase 0 entitlement decision (ADR-0041):
   * Extend PlanConfig with boolean rights (consistent with existing pattern).
   * Whether the workspace can activate a WakaPage public smart profile page.
   * Available from: starter and above.
   */
  wakaPagePublicPage: boolean;
  /**
   * WakaPage — Whether the workspace can access WakaPage analytics dashboard.
   * Available from: growth and above.
   */
  wakaPageAnalytics: boolean;
  /**
   * Groups — whether the workspace can create groups.
   * Phase 0 rename: supportGroupsEnabled → groupsEnabled.
   * Maximum group count and feature gates are in @webwaka/groups entitlements.
   * Available from: starter and above (free = read-only discovery).
   */
  groupsEnabled: boolean;
  /** @deprecated Use groupsEnabled */
  supportGroupsEnabled?: boolean;
  /**
   * Value Movement — whether the workspace can create fundraising campaigns.
   * Phase 0 rename: fundraisingEnabled → valueMovementEnabled.
   * Maximum campaign count and feature gates are in @webwaka/fundraising entitlements.
   * Available from: starter and above.
   */
  valueMovementEnabled: boolean;
  /** @deprecated Use valueMovementEnabled */
  fundraisingEnabled?: boolean;
}

// ---------------------------------------------------------------------------
// Plan configuration matrix
// Single source of truth — all entitlement decisions derive from here.
// ---------------------------------------------------------------------------

export const PLAN_CONFIGS: Readonly<Record<SubscriptionPlan, PlanConfig>> = {
  free: {
    maxUsers: 3,
    maxPlaces: 1,
    maxOfferings: 5,
    // Phase 0: Discovery only. No Civic/Political layers — no sensitive sector access.
    layers: [PlatformLayer.Discovery],
    brandingRights: false,
    whiteLabelDepth: 0,
    delegationRights: false,
    aiRights: false,
    sensitiveSectorRights: false,
    wakaPagePublicPage: false,
    wakaPageAnalytics: false,
    groupsEnabled: false,
    valueMovementEnabled: false,
  },
  starter: {
    maxUsers: 10,
    maxPlaces: 3,
    maxOfferings: 25,
    // Phase 0: Civic layer added at starter. Groups + NGO use cases unlock.
    // Political/Institutional require sensitiveSectorRights (enterprise+).
    layers: [
      PlatformLayer.Discovery,
      PlatformLayer.Operational,
      PlatformLayer.Civic,
    ],
    brandingRights: true,
    whiteLabelDepth: 0,
    delegationRights: false,
    aiRights: false,
    sensitiveSectorRights: false,
    wakaPagePublicPage: true,
    wakaPageAnalytics: false,
    groupsEnabled: true,
    valueMovementEnabled: true,
  },
  growth: {
    maxUsers: 50,
    maxPlaces: 10,
    maxOfferings: 100,
    // Phase 0: Commerce + Civic. AI layer added at growth for AI-assisted features.
    layers: [
      PlatformLayer.Discovery,
      PlatformLayer.Operational,
      PlatformLayer.Commerce,
      PlatformLayer.Civic,
      PlatformLayer.AI,
    ],
    brandingRights: true,
    whiteLabelDepth: 0,
    delegationRights: false,
    aiRights: true,
    sensitiveSectorRights: false,
    wakaPagePublicPage: true,
    wakaPageAnalytics: true,
    groupsEnabled: true,
    valueMovementEnabled: true,
  },
  pro: {
    maxUsers: 200,
    maxPlaces: 50,
    maxOfferings: -1,
    // Phase 0: Professional + Creator + AI. Still no Political/Institutional
    // (those require sensitiveSectorRights on enterprise+).
    layers: [
      PlatformLayer.Discovery,
      PlatformLayer.Operational,
      PlatformLayer.Commerce,
      PlatformLayer.Transport,
      PlatformLayer.Civic,
      PlatformLayer.Professional,
      PlatformLayer.Creator,
      PlatformLayer.AI,
    ],
    brandingRights: true,
    whiteLabelDepth: 1,
    delegationRights: false,
    aiRights: true,
    sensitiveSectorRights: false,
    wakaPagePublicPage: true,
    wakaPageAnalytics: true,
    groupsEnabled: true,
    valueMovementEnabled: true,
  },
  enterprise: {
    maxUsers: -1,
    maxPlaces: -1,
    maxOfferings: -1,
    // Phase 0: All layers including Political and Institutional.
    // Only plan with sensitiveSectorRights = true.
    layers: Object.values(PlatformLayer),
    brandingRights: true,
    whiteLabelDepth: 2,
    delegationRights: true,
    aiRights: true,
    sensitiveSectorRights: true,
    wakaPagePublicPage: true,
    wakaPageAnalytics: true,
    groupsEnabled: true,
    valueMovementEnabled: true,
  },
  partner: {
    maxUsers: -1,
    maxPlaces: -1,
    maxOfferings: -1,
    // Partner has all layers — they white-label the full platform.
    layers: Object.values(PlatformLayer),
    brandingRights: true,
    whiteLabelDepth: 2,
    delegationRights: true,
    aiRights: true,
    sensitiveSectorRights: true,
    wakaPagePublicPage: true,
    wakaPageAnalytics: true,
    groupsEnabled: true,
    valueMovementEnabled: true,
  },
  sub_partner: {
    maxUsers: -1,
    maxPlaces: 100,
    maxOfferings: -1,
    // Sub-partner: WhiteLabel layer included; Political/Institutional excluded
    // (sub-partners cannot offer sensitive-sector products without enterprise upgrade).
    layers: [
      PlatformLayer.Discovery,
      PlatformLayer.Operational,
      PlatformLayer.Commerce,
      PlatformLayer.Civic,
      PlatformLayer.AI,
      PlatformLayer.WhiteLabel,
    ],
    brandingRights: true,
    whiteLabelDepth: 1,
    delegationRights: false,
    aiRights: true,
    sensitiveSectorRights: false,
    wakaPagePublicPage: true,
    wakaPageAnalytics: true,
    groupsEnabled: true,
    valueMovementEnabled: true,
  },
} as const;
