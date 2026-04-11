/**
 * packages/verticals-cooperative — Domain types
 * (M8d — Platform Invariants T3, P9)
 *
 * Cooperative Society modeled as an Organization entity.
 * P9: All monetary amounts in integer kobo.
 *     Interest rate in basis points (500 = 5%).
 */

export type MemberStatus = 'active' | 'suspended' | 'exited';
export type ContributionStatus = 'pending' | 'paid' | 'missed';
export type LoanStatus = 'pending' | 'approved' | 'active' | 'repaid' | 'defaulted';

export interface CoopMember {
  id: string;
  workspaceId: string;
  tenantId: string;
  userId: string;
  memberNumber: string;
  sharesCount: number;
  status: MemberStatus;
  joinedAt: number;
}

export interface CoopContribution {
  id: string;
  workspaceId: string;
  tenantId: string;
  memberId: string;
  amountKobo: number;
  cycleMonth: string;  // YYYY-MM
  paystackRef: string | null;
  status: ContributionStatus;
  createdAt: number;
}

export interface CoopLoan {
  id: string;
  workspaceId: string;
  tenantId: string;
  memberId: string;
  amountKobo: number;
  interestRate: number;   // basis points (500 = 5%)
  durationMonths: number;
  guarantorId: string | null;
  status: LoanStatus;
  approvedAt: number | null;
  createdAt: number;
}

export interface CreateMemberInput {
  id?: string;
  workspaceId: string;
  tenantId: string;
  userId: string;
  memberNumber: string;
  sharesCount?: number;
}

export interface UpdateMemberInput {
  sharesCount?: number;
  status?: MemberStatus;
}

export interface CreateContributionInput {
  id?: string;
  workspaceId: string;
  tenantId: string;
  memberId: string;
  amountKobo: number;
  cycleMonth: string;
  paystackRef?: string;
}

export interface CreateLoanInput {
  id?: string;
  workspaceId: string;
  tenantId: string;
  memberId: string;
  amountKobo: number;
  interestRate: number;
  durationMonths: number;
  guarantorId?: string;
}

export interface UpdateLoanInput {
  status?: LoanStatus;
  approvedAt?: number | null;
}
