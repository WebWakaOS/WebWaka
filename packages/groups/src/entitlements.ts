/**
 * @webwaka/groups — Entitlement guards.
 *
 * Phase 0 rename: SupportGroupEntitlements → GroupEntitlements
 * Backward-compat aliases exported at bottom for any consumer still using old names.
 *
 * These entitlements are evaluated at the API layer by reading the workspace
 * subscription plan and calling the appropriate guard.
 */

export interface GroupEntitlements {
  maxGroups: number;
  broadcastEnabled: boolean;
  broadcastChannels: readonly ('in_app' | 'sms' | 'whatsapp' | 'email' | 'ussd_push')[];
  gotvEnabled: boolean;
  hierarchyEnabled: boolean;
  analyticsEnabled: boolean;
  committeeEnabled: boolean;
  petitionsEnabled: boolean;
  aiAssistEnabled: boolean;
}

export const FREE_GROUP_ENTITLEMENTS: GroupEntitlements = {
  maxGroups: 1,
  broadcastEnabled: false,
  broadcastChannels: ['in_app'],
  gotvEnabled: false,
  hierarchyEnabled: false,
  analyticsEnabled: false,
  committeeEnabled: false,
  petitionsEnabled: false,
  aiAssistEnabled: false,
};

export const STARTER_GROUP_ENTITLEMENTS: GroupEntitlements = {
  maxGroups: 3,
  broadcastEnabled: true,
  broadcastChannels: ['in_app', 'sms'],
  gotvEnabled: true,
  hierarchyEnabled: false,
  analyticsEnabled: false,
  committeeEnabled: false,
  petitionsEnabled: true,
  aiAssistEnabled: false,
};

export const GROWTH_GROUP_ENTITLEMENTS: GroupEntitlements = {
  maxGroups: 10,
  broadcastEnabled: true,
  broadcastChannels: ['in_app', 'sms', 'email'],
  gotvEnabled: true,
  hierarchyEnabled: true,
  analyticsEnabled: true,
  committeeEnabled: true,
  petitionsEnabled: true,
  aiAssistEnabled: false,
};

export const PRO_GROUP_ENTITLEMENTS: GroupEntitlements = {
  maxGroups: 50,
  broadcastEnabled: true,
  broadcastChannels: ['in_app', 'sms', 'whatsapp', 'email'],
  gotvEnabled: true,
  hierarchyEnabled: true,
  analyticsEnabled: true,
  committeeEnabled: true,
  petitionsEnabled: true,
  aiAssistEnabled: true,
};

export const ENTERPRISE_GROUP_ENTITLEMENTS: GroupEntitlements = {
  maxGroups: -1,
  broadcastEnabled: true,
  broadcastChannels: ['in_app', 'sms', 'whatsapp', 'email', 'ussd_push'],
  gotvEnabled: true,
  hierarchyEnabled: true,
  analyticsEnabled: true,
  committeeEnabled: true,
  petitionsEnabled: true,
  aiAssistEnabled: true,
};

export const PARTNER_GROUP_ENTITLEMENTS: GroupEntitlements = {
  ...ENTERPRISE_GROUP_ENTITLEMENTS,
};

export const SUB_PARTNER_GROUP_ENTITLEMENTS: GroupEntitlements = {
  ...ENTERPRISE_GROUP_ENTITLEMENTS,
};

export function assertMaxGroups(currentCount: number, ents: GroupEntitlements): void {
  if (ents.maxGroups !== -1 && currentCount >= ents.maxGroups) {
    throw new Error(
      `ENTITLEMENT_DENIED: Maximum of ${ents.maxGroups} group(s) allowed on your current plan`,
    );
  }
}

export function assertBroadcastEnabled(ents: GroupEntitlements): void {
  if (!ents.broadcastEnabled) {
    throw new Error('ENTITLEMENT_DENIED: Broadcasts require Starter plan or above');
  }
}

export function assertBroadcastChannel(
  channel: string,
  ents: GroupEntitlements,
): void {
  if (!(ents.broadcastChannels as readonly string[]).includes(channel)) {
    throw new Error(
      `ENTITLEMENT_DENIED: Broadcast channel '${channel}' is not included in your current plan`,
    );
  }
}

export function assertGotvEnabled(ents: GroupEntitlements): void {
  if (!ents.gotvEnabled) {
    throw new Error('ENTITLEMENT_DENIED: GOTV tracking requires Starter plan or above');
  }
}

export function assertHierarchyEnabled(ents: GroupEntitlements): void {
  if (!ents.hierarchyEnabled) {
    throw new Error('ENTITLEMENT_DENIED: Multi-level hierarchy requires Growth plan or above');
  }
}

export function assertAnalyticsEnabled(ents: GroupEntitlements): void {
  if (!ents.analyticsEnabled) {
    throw new Error('ENTITLEMENT_DENIED: Analytics requires Growth plan or above');
  }
}

export function assertAiAssistEnabled(ents: GroupEntitlements): void {
  if (!ents.aiAssistEnabled) {
    throw new Error('ENTITLEMENT_DENIED: AI assistance requires Pro plan or above');
  }
}

// ---------------------------------------------------------------------------
// Backward-compat aliases — deprecated; use GroupEntitlements
// ---------------------------------------------------------------------------

/** @deprecated Use GroupEntitlements */
export type SupportGroupEntitlements = GroupEntitlements;
/** @deprecated Use FREE_GROUP_ENTITLEMENTS */
export const FREE_SUPPORT_GROUP_ENTITLEMENTS = FREE_GROUP_ENTITLEMENTS;
/** @deprecated Use STARTER_GROUP_ENTITLEMENTS */
export const STARTER_SUPPORT_GROUP_ENTITLEMENTS = STARTER_GROUP_ENTITLEMENTS;
/** @deprecated Use GROWTH_GROUP_ENTITLEMENTS */
export const GROWTH_SUPPORT_GROUP_ENTITLEMENTS = GROWTH_GROUP_ENTITLEMENTS;
/** @deprecated Use PRO_GROUP_ENTITLEMENTS */
export const PRO_SUPPORT_GROUP_ENTITLEMENTS = PRO_GROUP_ENTITLEMENTS;
/** @deprecated Use ENTERPRISE_GROUP_ENTITLEMENTS */
export const ENTERPRISE_SUPPORT_GROUP_ENTITLEMENTS = ENTERPRISE_GROUP_ENTITLEMENTS;
/** @deprecated Use PARTNER_GROUP_ENTITLEMENTS */
export const PARTNER_SUPPORT_GROUP_ENTITLEMENTS = PARTNER_GROUP_ENTITLEMENTS;
/** @deprecated Use SUB_PARTNER_GROUP_ENTITLEMENTS */
export const SUB_PARTNER_SUPPORT_GROUP_ENTITLEMENTS = SUB_PARTNER_GROUP_ENTITLEMENTS;
