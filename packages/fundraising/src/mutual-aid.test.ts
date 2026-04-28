/**
 * @webwaka/fundraising — Mutual Aid tests (Phase 2, T002)
 * 12 tests covering: create → vote → approve → disburse lifecycle.
 */

import { describe, it, expect } from 'vitest';
import {
  createMutualAidRequest,
  getMutualAidRequest,
  listMutualAidRequests,
  castVote,
  getRequestVotes,
  disburseMutualAid,
} from './mutual-aid-repository.js';

// ── In-memory mock DB ──────────────────────────────────────────────────────

type Row = Record<string, unknown>;

function makeMockDb() {
  const requests: Row[] = [];
  const votes: Row[] = [];

  return {
    prepare(sql: string) {
      const lsql = sql.trim().toLowerCase();

      return {
        bind(...args: unknown[]) {
          return {
            async run() {
              if (lsql.startsWith('insert into mutual_aid_requests')) {
                const row: Row = {
                  id: args[0], tenant_id: args[1], workspace_id: args[2], group_id: args[3],
                  requester_id: args[4], title: args[5], description: args[6], amount_kobo: args[7],
                  currency_code: args[8], ndpr_consented: args[9], status: args[10],
                  votes_required: args[11], votes_approve: args[12], votes_reject: args[13],
                  approved_by: null, approved_at: null, disbursed_at: null, disbursement_ref: null,
                  rejected_reason: null, created_at: args[14], updated_at: args[15],
                };
                requests.push(row);
              } else if (lsql.startsWith('insert into mutual_aid_votes')) {
                const row: Row = {
                  id: args[0], tenant_id: args[1], request_id: args[2], voter_id: args[3],
                  decision: args[4], note: args[5], created_at: args[6],
                };
                votes.push(row);
              } else if (lsql.includes('mutual_aid_requests') && (lsql.includes('votes_approve') || lsql.includes('votes_reject'))) {
                const newStatus = args[0] as string;
                const updatedAt = args[1] as number;
                const reqId = args[2] as string;
                const tenantId = args[3] as string;
                const r = requests.find(r => r.id === reqId && r.tenant_id === tenantId);
                if (r) {
                  if (lsql.includes('votes_approve')) r.votes_approve = (r.votes_approve as number) + 1;
                  else r.votes_reject = (r.votes_reject as number) + 1;
                  r.status = newStatus;
                  r.updated_at = updatedAt;
                }
              } else if (lsql.includes('mutual_aid_requests') && lsql.includes("status = 'disbursed'")) {
                const [approvedBy, disbursedAt, disbursementRef, updatedAt, reqId, tenantId] = args as [string, number, string | null, number, string, string];
                const r = requests.find(r => r.id === reqId && r.tenant_id === tenantId);
                if (r) {
                  r.status = 'disbursed';
                  r.approved_by = approvedBy;
                  r.disbursed_at = disbursedAt;
                  r.disbursement_ref = disbursementRef;
                  r.updated_at = updatedAt;
                }
              }
              return { success: true };
            },
            async first<T>(): Promise<T | null> {
              if (lsql.startsWith('select * from mutual_aid_requests')) {
                const [id, tenantId] = args as [string, string];
                return (requests.find(r => r.id === id && r.tenant_id === tenantId) ?? null) as T | null;
              }
              if (lsql.includes('select id from mutual_aid_votes')) {
                const [tenantId, requestId, voterId] = args as [string, string, string];
                return (votes.find(v => v.tenant_id === tenantId && v.request_id === requestId && v.voter_id === voterId) ?? null) as T | null;
              }
              if (lsql.includes('select votes_required')) {
                const [reqId, tenantId] = args as [string, string];
                const r = requests.find(r => r.id === reqId && r.tenant_id === tenantId);
                if (!r) return null as T | null;
                return { votes_required: r.votes_required, votes_approve: r.votes_approve, votes_reject: r.votes_reject } as T;
              }
              if (lsql.includes('select status')) {
                const [reqId, tenantId] = args as [string, string];
                const r = requests.find(r => r.id === reqId && r.tenant_id === tenantId);
                return (r ? { status: r.status } : null) as T | null;
              }
              return null as T | null;
            },
            async all<T>(): Promise<{ results: T[] }> {
              if (lsql.includes('from mutual_aid_requests') && lsql.includes('group_id')) {
                const [tenantId, groupId] = args as [string, string];
                return { results: requests.filter(r => r.tenant_id === tenantId && r.group_id === groupId) as T[] };
              }
              if (lsql.includes('from mutual_aid_votes') && lsql.includes('request_id')) {
                const [reqId, tenantId] = args as [string, string];
                return { results: votes.filter(v => v.request_id === reqId && v.tenant_id === tenantId) as T[] };
              }
              return { results: [] };
            },
          };
        },
        async first<T>(): Promise<T | null> { return null as T | null; },
        all<T>() { return Promise.resolve({ results: [] as T[] }); },
      };
    },
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

const TENANT = 'ten_aid';
const WS = 'ws_aid';
const GROUP = 'grp_aid';

describe('@webwaka/fundraising — Mutual Aid Requests', () => {

  describe('createMutualAidRequest', () => {
    it('MA01 — creates request with required fields', async () => {
      const db = makeMockDb();
      const req = await createMutualAidRequest(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        requesterId: 'user_req', title: 'Flood Aid', description: 'Need help',
        amountKobo: 500_000, ndprConsented: true,
      });
      expect(req.status).toBe('pending');
      expect(req.amountKobo).toBe(500_000);
      expect(req.ndprConsented).toBe(true);
      expect(req.votesApprove).toBe(0);
    });

    it('MA02 — rejects request without NDPR consent (P10)', async () => {
      const db = makeMockDb();
      await expect(createMutualAidRequest(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        requesterId: 'user_req', title: 'Bad', description: 'desc',
        amountKobo: 100_000, ndprConsented: false,
      })).rejects.toThrow('P10_VIOLATION');
    });

    it('MA03 — rejects float amount (P9)', async () => {
      const db = makeMockDb();
      await expect(createMutualAidRequest(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        requesterId: 'user_req', title: 'Float', description: 'desc',
        amountKobo: 500.5, ndprConsented: true,
      })).rejects.toThrow('P9_VIOLATION');
    });
  });

  describe('listMutualAidRequests', () => {
    it('MA04 — lists requests for group', async () => {
      const db = makeMockDb();
      await createMutualAidRequest(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        requesterId: 'user_a', title: 'Request A', description: 'Help',
        amountKobo: 200_000, ndprConsented: true,
      });
      const list = await listMutualAidRequests(db as any, TENANT, GROUP);
      expect(list).toHaveLength(1);
      expect(list[0]?.title).toBe('Request A');
    });
  });

  describe('castVote', () => {
    it('MA05 — casts approve vote and increments counter', async () => {
      const db = makeMockDb();
      const req = await createMutualAidRequest(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        requesterId: 'user_req', title: 'Aid Request', description: 'Help needed',
        amountKobo: 300_000, ndprConsented: true, votesRequired: 3,
      });
      const vote = await castVote(db as any, {
        tenantId: TENANT, requestId: req.id, voterId: 'user_v1', decision: 'approve',
      });
      expect(vote.decision).toBe('approve');
      expect(vote.requestId).toBe(req.id);
    });

    it('MA06 — rejects duplicate vote from same voter', async () => {
      const db = makeMockDb();
      const req = await createMutualAidRequest(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        requesterId: 'user_req', title: 'Aid', description: 'Help',
        amountKobo: 100_000, ndprConsented: true,
      });
      await castVote(db as any, { tenantId: TENANT, requestId: req.id, voterId: 'user_v2', decision: 'approve' });
      await expect(castVote(db as any, {
        tenantId: TENANT, requestId: req.id, voterId: 'user_v2', decision: 'approve',
      })).rejects.toThrow('DUPLICATE_VOTE');
    });

    it('MA07 — reject vote also recorded in votes table', async () => {
      const db = makeMockDb();
      const req = await createMutualAidRequest(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        requesterId: 'user_req', title: 'Rejection Test', description: 'test',
        amountKobo: 50_000, ndprConsented: true,
      });
      await castVote(db as any, { tenantId: TENANT, requestId: req.id, voterId: 'user_v3', decision: 'reject' });
      const voteList = await getRequestVotes(db as any, req.id, TENANT);
      expect(voteList).toHaveLength(1);
      expect(voteList[0]?.decision).toBe('reject');
    });

    it('MA08 — request reaches approved when votes_required met', async () => {
      const db = makeMockDb();
      const req = await createMutualAidRequest(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        requesterId: 'user_req', title: 'Will Be Approved', description: 'test',
        amountKobo: 500_000, ndprConsented: true, votesRequired: 2,
      });
      await castVote(db as any, { tenantId: TENANT, requestId: req.id, voterId: 'voter_a', decision: 'approve' });
      await castVote(db as any, { tenantId: TENANT, requestId: req.id, voterId: 'voter_b', decision: 'approve' });
      const updated = await getMutualAidRequest(db as any, req.id, TENANT);
      expect(updated?.status).toBe('approved');
    });
  });

  describe('disburseMutualAid', () => {
    it('MA09 — disburses an approved request', async () => {
      const db = makeMockDb();
      const req = await createMutualAidRequest(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        requesterId: 'user_req', title: 'Disburse Test', description: 'desc',
        amountKobo: 1_000_000, ndprConsented: true, votesRequired: 1,
      });
      await castVote(db as any, { tenantId: TENANT, requestId: req.id, voterId: 'voter_x', decision: 'approve' });
      const disbursed = await disburseMutualAid(db as any, {
        tenantId: TENANT, requestId: req.id, approvedBy: 'admin_user', disbursementRef: 'TRF-001',
      });
      expect(disbursed.status).toBe('disbursed');
      expect(disbursed.disbursementRef).toBe('TRF-001');
      expect(disbursed.approvedBy).toBe('admin_user');
    });

    it('MA10 — rejects disbursement of non-approved request', async () => {
      const db = makeMockDb();
      const req = await createMutualAidRequest(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        requesterId: 'user_req', title: 'Still Pending', description: 'desc',
        amountKobo: 200_000, ndprConsented: true,
      });
      await expect(disburseMutualAid(db as any, {
        tenantId: TENANT, requestId: req.id, approvedBy: 'admin',
      })).rejects.toThrow('INVALID_STATE');
    });

    it('MA11 — getMutualAidRequest returns null for wrong tenant (T3)', async () => {
      const db = makeMockDb();
      const req = await createMutualAidRequest(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        requesterId: 'user_req', title: 'T3 test', description: 'desc',
        amountKobo: 100_000, ndprConsented: true,
      });
      const result = await getMutualAidRequest(db as any, req.id, 'ten_other');
      expect(result).toBeNull();
    });

    it('MA12 — listMutualAidRequests returns empty for different group (T3)', async () => {
      const db = makeMockDb();
      await createMutualAidRequest(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        requesterId: 'user_req', title: 'Group A', description: 'desc',
        amountKobo: 100_000, ndprConsented: true,
      });
      const list = await listMutualAidRequests(db as any, TENANT, 'grp_different');
      expect(list).toHaveLength(0);
    });
  });

});
