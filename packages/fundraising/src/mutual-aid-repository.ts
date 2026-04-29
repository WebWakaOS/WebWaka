/**
 * @webwaka/fundraising — Mutual Aid repository
 *
 * Phase 2: D1 data layer for mutual_aid_requests and mutual_aid_votes.
 *
 * Platform Invariants:
 *   T3  — every query includes tenant_id predicate
 *   P9  — assertIntegerKobo() before every INSERT
 *   P10 — ndpr_consented=true required on createMutualAidRequest
 */

import type {
  MutualAidRequest,
  MutualAidVote,
  CreateMutualAidRequestInput,
  CastVoteInput,
  DisburseInput,
} from './mutual-aid.js';

export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

function now(): number {
  return Math.floor(Date.now() / 1000);
}

function assertIntegerKobo(amount: number, field = 'amount_kobo'): void {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(`P9_VIOLATION: ${field} must be a positive integer (got ${amount})`);
  }
}

interface MutualAidRow {
  id: string;
  tenant_id: string;
  workspace_id: string;
  group_id: string;
  requester_id: string;
  title: string;
  description: string;
  amount_kobo: number;
  currency_code: string;
  ndpr_consented: number;
  status: string;
  votes_required: number;
  votes_approve: number;
  votes_reject: number;
  approved_by: string | null;
  approved_at: number | null;
  disbursed_at: number | null;
  disbursement_ref: string | null;
  rejected_reason: string | null;
  created_at: number;
  updated_at: number;
}

interface VoteRow {
  id: string;
  tenant_id: string;
  request_id: string;
  voter_id: string;
  decision: string;
  note: string | null;
  created_at: number;
}

function mapRequest(r: MutualAidRow): MutualAidRequest {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    workspaceId: r.workspace_id,
    groupId: r.group_id,
    requesterId: r.requester_id,
    title: r.title,
    description: r.description,
    amountKobo: r.amount_kobo,
    currencyCode: r.currency_code,
    ndprConsented: r.ndpr_consented === 1,
    status: r.status as MutualAidRequest['status'],
    votesRequired: r.votes_required,
    votesApprove: r.votes_approve,
    votesReject: r.votes_reject,
    approvedBy: r.approved_by,
    approvedAt: r.approved_at,
    disbursedAt: r.disbursed_at,
    disbursementRef: r.disbursement_ref,
    rejectedReason: r.rejected_reason,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapVote(r: VoteRow): MutualAidVote {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    requestId: r.request_id,
    voterId: r.voter_id,
    decision: r.decision as MutualAidVote['decision'],
    note: r.note,
    createdAt: r.created_at,
  };
}

// ---------------------------------------------------------------------------
// Mutual Aid Requests
// ---------------------------------------------------------------------------

export async function createMutualAidRequest(
  db: D1Like,
  input: CreateMutualAidRequestInput,
): Promise<MutualAidRequest> {
  assertIntegerKobo(input.amountKobo, 'amountKobo');
  if (!input.ndprConsented) {
    throw new Error('P10_VIOLATION: ndprConsented must be true for mutual aid request');
  }
  const id = generateId('maid_req');
  const ts = now();
  await db
    .prepare(
      `INSERT INTO mutual_aid_requests
         (id, tenant_id, workspace_id, group_id, requester_id, title, description,
          amount_kobo, currency_code, ndpr_consented, status, votes_required,
          votes_approve, votes_reject, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      id,
      input.tenantId,
      input.workspaceId,
      input.groupId,
      input.requesterId,
      input.title,
      input.description,
      input.amountKobo,
      input.currencyCode ?? 'NGN',
      1,
      'pending',
      input.votesRequired ?? 3,
      0,
      0,
      ts,
      ts,
    )
    .run();

  const row = await db
    .prepare('SELECT * FROM mutual_aid_requests WHERE id = ? AND tenant_id = ?')
    .bind(id, input.tenantId)
    .first<MutualAidRow>();
  if (!row) throw new Error('mutual aid request creation failed');
  return mapRequest(row);
}

export async function getMutualAidRequest(
  db: D1Like,
  id: string,
  tenantId: string,
): Promise<MutualAidRequest | null> {
  const row = await db
    .prepare('SELECT * FROM mutual_aid_requests WHERE id = ? AND tenant_id = ?')
    .bind(id, tenantId)
    .first<MutualAidRow>();
  return row ? mapRequest(row) : null;
}

export async function listMutualAidRequests(
  db: D1Like,
  tenantId: string,
  groupId: string,
  limit = 50,
): Promise<MutualAidRequest[]> {
  const { results } = await db
    .prepare(
      'SELECT * FROM mutual_aid_requests WHERE tenant_id = ? AND group_id = ? ORDER BY created_at DESC LIMIT ?',
    )
    .bind(tenantId, groupId, limit)
    .all<MutualAidRow>();
  return results.map(mapRequest);
}

export async function castVote(
  db: D1Like,
  input: CastVoteInput,
): Promise<MutualAidVote> {
  const id = generateId('maid_vote');
  const ts = now();

  const existing = await db
    .prepare(
      'SELECT id FROM mutual_aid_votes WHERE tenant_id = ? AND request_id = ? AND voter_id = ?',
    )
    .bind(input.tenantId, input.requestId, input.voterId)
    .first<{ id: string }>();
  if (existing) {
    throw new Error('DUPLICATE_VOTE: This member has already voted on this request');
  }

  await db
    .prepare(
      `INSERT INTO mutual_aid_votes (id, tenant_id, request_id, voter_id, decision, note, created_at)
       VALUES (?,?,?,?,?,?,?)`,
    )
    .bind(id, input.tenantId, input.requestId, input.voterId, input.decision, input.note ?? null, ts)
    .run();

  const countField = input.decision === 'approve' ? 'votes_approve' : 'votes_reject';
  const updatedAt = ts;

  const req = await db
    .prepare('SELECT votes_required, votes_approve, votes_reject FROM mutual_aid_requests WHERE id = ? AND tenant_id = ?')
    .bind(input.requestId, input.tenantId)
    .first<{ votes_required: number; votes_approve: number; votes_reject: number }>();

  if (req) {
    const newApprove = req.votes_approve + (input.decision === 'approve' ? 1 : 0);
    const newReject  = req.votes_reject  + (input.decision === 'reject'  ? 1 : 0);
    let newStatus: string = 'voting';
    if (newApprove >= req.votes_required) newStatus = 'approved';
    else if (newReject > (req.votes_required)) newStatus = 'rejected';

    await db
      .prepare(
        `UPDATE mutual_aid_requests
         SET ${countField} = ${countField} + 1, status = ?, updated_at = ?
         WHERE id = ? AND tenant_id = ?`,
      )
      .bind(newStatus, updatedAt, input.requestId, input.tenantId)
      .run();
  }

  return {
    id,
    tenantId: input.tenantId,
    requestId: input.requestId,
    voterId: input.voterId,
    decision: input.decision,
    note: input.note ?? null,
    createdAt: ts,
  };
}

export async function getRequestVotes(
  db: D1Like,
  requestId: string,
  tenantId: string,
): Promise<MutualAidVote[]> {
  const { results } = await db
    .prepare('SELECT * FROM mutual_aid_votes WHERE request_id = ? AND tenant_id = ? ORDER BY created_at ASC')
    .bind(requestId, tenantId)
    .all<VoteRow>();
  return results.map(mapVote);
}

export async function disburseMutualAid(
  db: D1Like,
  input: DisburseInput,
): Promise<MutualAidRequest> {
  const ts = now();
  const req = await db
    .prepare('SELECT status FROM mutual_aid_requests WHERE id = ? AND tenant_id = ?')
    .bind(input.requestId, input.tenantId)
    .first<{ status: string }>();
  if (!req) throw new Error('NOT_FOUND: mutual aid request not found');
  if (req.status !== 'approved') {
    throw new Error(`INVALID_STATE: can only disburse approved requests (current: ${req.status})`);
  }

  await db
    .prepare(
      `UPDATE mutual_aid_requests
       SET status = 'disbursed', approved_by = ?, disbursed_at = ?,
           disbursement_ref = ?, updated_at = ?
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(
      input.approvedBy,
      ts,
      input.disbursementRef ?? null,
      ts,
      input.requestId,
      input.tenantId,
    )
    .run();

  const row = await db
    .prepare('SELECT * FROM mutual_aid_requests WHERE id = ? AND tenant_id = ?')
    .bind(input.requestId, input.tenantId)
    .first<MutualAidRow>();
  if (!row) throw new Error('disburse update failed');
  return mapRequest(row);
}
