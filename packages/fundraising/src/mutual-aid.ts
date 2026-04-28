/**
 * @webwaka/fundraising — Mutual Aid Request types
 *
 * Phase 2: FR-VM-16 — Mutual aid request + group voting + disbursement tracking
 *
 * Platform Invariants:
 *   T3  — tenant_id on all records
 *   P9  — amount_kobo is INTEGER
 *   P10 — ndpr_consented required on request creation
 */

export type MutualAidStatus =
  | 'pending'
  | 'voting'
  | 'approved'
  | 'disbursed'
  | 'rejected'
  | 'cancelled';

export type MutualAidVoteDecision = 'approve' | 'reject';

// ---------------------------------------------------------------------------
// Mutual Aid Request
// DB table: mutual_aid_requests
// ---------------------------------------------------------------------------

export interface MutualAidRequest {
  id: string;
  tenantId: string;
  workspaceId: string;
  groupId: string;
  requesterId: string;
  title: string;
  description: string;
  amountKobo: number;
  currencyCode: string;
  ndprConsented: boolean;
  status: MutualAidStatus;
  votesRequired: number;
  votesApprove: number;
  votesReject: number;
  approvedBy: string | null;
  approvedAt: number | null;
  disbursedAt: number | null;
  disbursementRef: string | null;
  rejectedReason: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateMutualAidRequestInput {
  tenantId: string;
  workspaceId: string;
  groupId: string;
  requesterId: string;
  title: string;
  description: string;
  amountKobo: number;
  currencyCode?: string;
  ndprConsented: boolean;
  votesRequired?: number;
}

// ---------------------------------------------------------------------------
// Mutual Aid Vote
// DB table: mutual_aid_votes
// ---------------------------------------------------------------------------

export interface MutualAidVote {
  id: string;
  tenantId: string;
  requestId: string;
  voterId: string;
  decision: MutualAidVoteDecision;
  note: string | null;
  createdAt: number;
}

export interface CastVoteInput {
  tenantId: string;
  requestId: string;
  voterId: string;
  decision: MutualAidVoteDecision;
  note?: string;
}

export interface DisburseInput {
  tenantId: string;
  requestId: string;
  approvedBy: string;
  disbursementRef?: string;
}
