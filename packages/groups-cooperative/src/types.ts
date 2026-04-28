/**
 * @webwaka/groups-cooperative — Cooperative group extension types
 *
 * Phase 2: savings fund, loan fund, share value integration.
 *
 * Platform Invariants:
 *   T3 — tenant_id on all records
 *   P4 — cooperative fields in group_cooperative_extensions; core groups table UNTOUCHED
 *   P9 — all kobo fields are INTEGER
 */

export type CoopType = 'savings' | 'credit' | 'multipurpose' | 'producer' | 'consumer';

export interface GroupCooperativeExtension {
  groupId: string;
  tenantId: string;
  workspaceId: string;
  coopType: CoopType;
  cacRegNumber: string | null;
  savingsGoalKobo: number;
  loanFundKobo: number;
  sharesPerMemberKobo: number;
  dividendRateBps: number;
  stateCode: string | null;
  lgaCode: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface UpsertCooperativeExtensionInput {
  groupId: string;
  tenantId: string;
  workspaceId: string;
  coopType?: CoopType;
  cacRegNumber?: string;
  savingsGoalKobo?: number;
  loanFundKobo?: number;
  sharesPerMemberKobo?: number;
  dividendRateBps?: number;
  stateCode?: string;
  lgaCode?: string;
}

export interface UpdateFundBalanceInput {
  groupId: string;
  tenantId: string;
  savingsGoalKobo?: number;
  loanFundKobo?: number;
}
