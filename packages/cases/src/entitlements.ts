/**
 * @webwaka/cases — Entitlement gates (Phase 1)
 *
 * Cases are available from starter plan.
 * Electoral / compliance categories require pro+.
 * SLA management requires growth+.
 */

export type CasePlan = 'free' | 'starter' | 'growth' | 'pro' | 'enterprise' | 'partner' | 'sub_partner';

const PLAN_ORDER: Record<CasePlan, number> = {
  free: 0,
  starter: 1,
  growth: 2,
  pro: 3,
  enterprise: 4,
  partner: 5,
  sub_partner: 3,
};

export interface CasePlanEntitlements {
  casesEnabled: boolean;
  maxOpenCases: number | null;          // null = unlimited
  slaManagementEnabled: boolean;
  electoralCasesEnabled: boolean;
  complianceCasesEnabled: boolean;
  bulkAssignEnabled: boolean;
  internalNotesEnabled: boolean;
  exportEnabled: boolean;
}

const ENTITLEMENTS: Record<CasePlan, CasePlanEntitlements> = {
  free: {
    casesEnabled: false,
    maxOpenCases: 0,
    slaManagementEnabled: false,
    electoralCasesEnabled: false,
    complianceCasesEnabled: false,
    bulkAssignEnabled: false,
    internalNotesEnabled: false,
    exportEnabled: false,
  },
  starter: {
    casesEnabled: true,
    maxOpenCases: 50,
    slaManagementEnabled: false,
    electoralCasesEnabled: false,
    complianceCasesEnabled: false,
    bulkAssignEnabled: false,
    internalNotesEnabled: true,
    exportEnabled: false,
  },
  growth: {
    casesEnabled: true,
    maxOpenCases: 500,
    slaManagementEnabled: true,
    electoralCasesEnabled: false,
    complianceCasesEnabled: false,
    bulkAssignEnabled: true,
    internalNotesEnabled: true,
    exportEnabled: true,
  },
  pro: {
    casesEnabled: true,
    maxOpenCases: null,
    slaManagementEnabled: true,
    electoralCasesEnabled: true,
    complianceCasesEnabled: true,
    bulkAssignEnabled: true,
    internalNotesEnabled: true,
    exportEnabled: true,
  },
  enterprise: {
    casesEnabled: true,
    maxOpenCases: null,
    slaManagementEnabled: true,
    electoralCasesEnabled: true,
    complianceCasesEnabled: true,
    bulkAssignEnabled: true,
    internalNotesEnabled: true,
    exportEnabled: true,
  },
  partner: {
    casesEnabled: true,
    maxOpenCases: null,
    slaManagementEnabled: true,
    electoralCasesEnabled: true,
    complianceCasesEnabled: true,
    bulkAssignEnabled: true,
    internalNotesEnabled: true,
    exportEnabled: true,
  },
  sub_partner: {
    casesEnabled: true,
    maxOpenCases: null,
    slaManagementEnabled: true,
    electoralCasesEnabled: true,
    complianceCasesEnabled: true,
    bulkAssignEnabled: true,
    internalNotesEnabled: true,
    exportEnabled: true,
  },
};

export function getCaseEntitlements(plan: string): CasePlanEntitlements {
  const key = plan as CasePlan;
  return ENTITLEMENTS[key] ?? ENTITLEMENTS.free;
}

export function assertCasesEnabled(plan: string): void {
  const ent = getCaseEntitlements(plan);
  if (!ent.casesEnabled) {
    throw new Error(`ENTITLEMENT_DENIED: Cases module not available on '${plan}' plan. Upgrade to starter or above.`);
  }
}

export function assertSlaEnabled(plan: string): void {
  const ent = getCaseEntitlements(plan);
  if (!ent.slaManagementEnabled) {
    throw new Error(`ENTITLEMENT_DENIED: SLA management not available on '${plan}' plan. Upgrade to growth or above.`);
  }
}

export function assertElectoralCasesEnabled(plan: string): void {
  const ent = getCaseEntitlements(plan);
  if (!ent.electoralCasesEnabled) {
    throw new Error(`ENTITLEMENT_DENIED: Electoral cases not available on '${plan}' plan. Upgrade to pro or above.`);
  }
}
