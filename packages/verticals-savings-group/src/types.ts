/**
 * @webwaka/verticals-savings-group — Domain types (M9 scaffolded)
 * Nigerian Ajo (rotating savings) and cooperative savings groups
 * FSM: seeded → claimed → cac_registered → active → suspended
 * AI: L2 — SAVINGS_TREND_ALERT, PAYOUT_FORECAST; no member PII (P13)
 * P9: all amounts in kobo integers; no float naira
 * P13: member_ref_id opaque — never to AI
 * T3: tenant_id always present
 * KYC: Tier 1 for informal ajo; Tier 2 for registered cooperative; Tier 3 for above ₦10M pool
 */

export type SavingsGroupFSMState = 'seeded' | 'claimed' | 'cac_registered' | 'active' | 'suspended';
export type ContributionFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type PayoutCycleStatus = 'pending' | 'in_progress' | 'completed' | 'disputed';

const FSM_TRANSITIONS: Record<SavingsGroupFSMState, SavingsGroupFSMState[]> = {
  seeded:         ['claimed'],
  claimed:        ['cac_registered'],
  cac_registered: ['active'],
  active:         ['suspended'],
  suspended:      ['active'],
};

export function isValidSavingsGroupTransition(from: SavingsGroupFSMState, to: SavingsGroupFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToCacRegistered(input: { cacRc: string | null }): GuardResult {
  if (!input.cacRc?.trim()) return { allowed: false, reason: 'CAC RC required for formal cooperative registration' };
  return { allowed: true };
}

export function guardContributionAmountIsInteger(input: { amountKobo: unknown }): GuardResult {
  if (typeof input.amountKobo !== 'number' || !Number.isInteger(input.amountKobo) || (input.amountKobo as number) <= 0)
    return { allowed: false, reason: 'Contribution amount must be positive integer kobo (P9)' };
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2)
    return { allowed: false, reason: 'Savings group AI capped at L2' };
  return { allowed: true };
}

export interface SavingsGroupProfile {
  id: string; workspaceId: string; tenantId: string; groupName: string;
  cacRc: string | null; groupType: 'ajo' | 'esusu' | 'cooperative' | 'thrift';
  contributionFrequency: ContributionFrequency;
  contributionAmountKobo: number;
  maxMembers: number; currentMembers: number;
  status: SavingsGroupFSMState; createdAt: number; updatedAt: number;
}

export interface CreateSavingsGroupInput {
  id?: string; workspaceId: string; tenantId: string; groupName: string;
  groupType?: SavingsGroupProfile['groupType'];
  contributionFrequency?: ContributionFrequency;
  contributionAmountKobo: number;
  maxMembers?: number; cacRc?: string;
}

export interface GroupMember {
  id: string; groupId: string; tenantId: string; memberRefId: string;
  role: 'owner' | 'secretary' | 'treasurer' | 'member';
  joinedAt: number; kycTier: number; payoutPosition: number | null;
  status: 'active' | 'suspended' | 'left';
  createdAt: number;
}

export interface Contribution {
  id: string; groupId: string; tenantId: string; memberRefId: string;
  amountKobo: number; contributionDate: number; cycleNumber: number;
  paymentMethod: 'cash' | 'transfer' | 'wallet';
  payStackRef: string | null; notes: string | null;
  verified: boolean; createdAt: number;
}

export interface PayoutCycle {
  id: string; groupId: string; tenantId: string; cycleNumber: number;
  recipientRefId: string; totalAmountKobo: number;
  payoutDate: number | null; status: PayoutCycleStatus;
  payStackRef: string | null; createdAt: number; updatedAt: number;
}
