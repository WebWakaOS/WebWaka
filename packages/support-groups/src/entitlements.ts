/**
 * @webwaka/support-groups — Entitlement guards.
 *
 * Follows the established @webwaka/community entitlements pattern
 * (separate interface, named constants per plan tier).
 *
 * These entitlements are evaluated at the API layer by reading the workspace
 * subscription plan and calling the appropriate guard.
 */

export interface SupportGroupEntitlements {
  maxSupportGroups: number;
  broadcastEnabled: boolean;
  broadcastChannels: readonly ('in_app' | 'sms' | 'whatsapp' | 'email' | 'ussd_push')[];
  gotvEnabled: boolean;
  hierarchyEnabled: boolean;
  analyticsEnabled: boolean;
  committeeEnabled: boolean;
  petitionsEnabled: boolean;
  aiAssistEnabled: boolean;
}

export const FREE_SUPPORT_GROUP_ENTITLEMENTS: SupportGroupEntitlements = {
  maxSupportGroups: 1,
  broadcastEnabled: false,
  broadcastChannels: ['in_app'],
  gotvEnabled: false,
  hierarchyEnabled: false,
  analyticsEnabled: false,
  committeeEnabled: false,
  petitionsEnabled: false,
  aiAssistEnabled: false,
};

export const STARTER_SUPPORT_GROUP_ENTITLEMENTS: SupportGroupEntitlements = {
  maxSupportGroups: 3,
  broadcastEnabled: true,
  broadcastChannels: ['in_app', 'sms'],
  gotvEnabled: true,
  hierarchyEnabled: false,
  analyticsEnabled: false,
  committeeEnabled: false,
  petitionsEnabled: true,
  aiAssistEnabled: false,
};

export const GROWTH_SUPPORT_GROUP_ENTITLEMENTS: SupportGroupEntitlements = {
  maxSupportGroups: 10,
  broadcastEnabled: true,
  broadcastChannels: ['in_app', 'sms', 'email'],
  gotvEnabled: true,
  hierarchyEnabled: true,
  analyticsEnabled: true,
  committeeEnabled: true,
  petitionsEnabled: true,
  aiAssistEnabled: false,
};

export const PRO_SUPPORT_GROUP_ENTITLEMENTS: SupportGroupEntitlements = {
  maxSupportGroups: 50,
  broadcastEnabled: true,
  broadcastChannels: ['in_app', 'sms', 'whatsapp', 'email'],
  gotvEnabled: true,
  hierarchyEnabled: true,
  analyticsEnabled: true,
  committeeEnabled: true,
  petitionsEnabled: true,
  aiAssistEnabled: true,
};

export const ENTERPRISE_SUPPORT_GROUP_ENTITLEMENTS: SupportGroupEntitlements = {
  maxSupportGroups: -1,
  broadcastEnabled: true,
  broadcastChannels: ['in_app', 'sms', 'whatsapp', 'email', 'ussd_push'],
  gotvEnabled: true,
  hierarchyEnabled: true,
  analyticsEnabled: true,
  committeeEnabled: true,
  petitionsEnabled: true,
  aiAssistEnabled: true,
};

export const PARTNER_SUPPORT_GROUP_ENTITLEMENTS: SupportGroupEntitlements = {
  ...ENTERPRISE_SUPPORT_GROUP_ENTITLEMENTS,
};

export const SUB_PARTNER_SUPPORT_GROUP_ENTITLEMENTS: SupportGroupEntitlements = {
  ...ENTERPRISE_SUPPORT_GROUP_ENTITLEMENTS,
};

export function assertMaxGroups(currentCount: number, ents: SupportGroupEntitlements): void {
  if (ents.maxSupportGroups !== -1 && currentCount >= ents.maxSupportGroups) {
    throw new Error(
      `ENTITLEMENT_DENIED: Maximum of ${ents.maxSupportGroups} support group(s) allowed on your current plan`,
    );
  }
}

export function assertBroadcastEnabled(ents: SupportGroupEntitlements): void {
  if (!ents.broadcastEnabled) {
    throw new Error('ENTITLEMENT_DENIED: Broadcasts require Starter plan or above');
  }
}

export function assertBroadcastChannel(
  channel: string,
  ents: SupportGroupEntitlements,
): void {
  if (!(ents.broadcastChannels as readonly string[]).includes(channel)) {
    throw new Error(
      `ENTITLEMENT_DENIED: Broadcast channel '${channel}' is not included in your current plan`,
    );
  }
}

export function assertGotvEnabled(ents: SupportGroupEntitlements): void {
  if (!ents.gotvEnabled) {
    throw new Error('ENTITLEMENT_DENIED: GOTV tracking requires Starter plan or above');
  }
}

export function assertHierarchyEnabled(ents: SupportGroupEntitlements): void {
  if (!ents.hierarchyEnabled) {
    throw new Error('ENTITLEMENT_DENIED: Multi-level hierarchy requires Growth plan or above');
  }
}

export function assertAnalyticsEnabled(ents: SupportGroupEntitlements): void {
  if (!ents.analyticsEnabled) {
    throw new Error('ENTITLEMENT_DENIED: Analytics requires Growth plan or above');
  }
}

export function assertAiAssistEnabled(ents: SupportGroupEntitlements): void {
  if (!ents.aiAssistEnabled) {
    throw new Error('ENTITLEMENT_DENIED: AI assistance requires Pro plan or above');
  }
}
