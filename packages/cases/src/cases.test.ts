/**
 * @webwaka/cases — Repository unit tests (Phase 1)
 * 24 tests covering: create → assign → note → resolve → close lifecycle.
 * Uses in-memory mock DB (same pattern as @webwaka/groups).
 */

import { describe, it, expect } from 'vitest';
import {
  createCase,
  getCase,
  listCases,
  assignCase,
  addNote,
  listNotes,
  resolveCase,
  closeCase,
  reopenCase,
  getCaseSummary,
} from './repository.js';

// ── In-memory mock DB ──────────────────────────────────────────────────────

type Row = Record<string, unknown>;

function makeMockDb() {
  const cases: Row[] = [];
  const caseNotes: Row[] = [];

  return {
    _cases: cases,
    _notes: caseNotes,

    prepare(sql: string) {
      const lsql = sql.trim().toLowerCase();

      return {
        bind(...args: unknown[]) {
          return {
            async first<T>(): Promise<T | null> {
              // SELECT COUNT(*) for getCaseSummary
              if (lsql.includes('count(*)')) {
                const [tenantId, workspaceId] = args as [string, string];
                let rows = cases.filter(r => r.tenant_id === tenantId && r.workspace_id === workspaceId);
                if (lsql.includes("status = 'open'")) rows = rows.filter(r => r.status === 'open');
                if (lsql.includes("status in ('assigned','in_progress')")) {
                  rows = rows.filter(r => r.status === 'assigned' || r.status === 'in_progress');
                }
                if (lsql.includes("status = 'resolved'")) rows = rows.filter(r => r.status === 'resolved');
                if (lsql.includes('sla_due_at <')) {
                  const now = args[2] as number;
                  rows = rows.filter(r =>
                    r.sla_due_at != null &&
                    (r.sla_due_at as number) < now &&
                    r.status !== 'resolved' &&
                    r.status !== 'closed',
                  );
                }
                return { c: rows.length } as unknown as T;
              }
              // AVG for getCaseSummary
              if (lsql.includes('avg(resolved_at')) {
                const [tenantId, workspaceId] = args as [string, string];
                const resolved = cases.filter(
                  r => r.tenant_id === tenantId && r.workspace_id === workspaceId && r.resolved_at != null,
                );
                const avg = resolved.length > 0
                  ? resolved.reduce((s, r) => s + ((r.resolved_at as number) - (r.created_at as number)), 0) / resolved.length
                  : null;
                return { avg } as unknown as T;
              }
              // SELECT * FROM case_notes WHERE id = ?
              if (lsql.includes('from case_notes where id = ?')) {
                const [id] = args as [string];
                const row = caseNotes.find(r => r.id === id);
                return (row as T) ?? null;
              }
              // SELECT * FROM cases WHERE id = ? AND tenant_id = ?
              if (lsql.includes('from cases where id = ?')) {
                const [id, tenantId] = args as [string, string];
                const row = cases.find(r => r.id === id && r.tenant_id === tenantId);
                return (row as T) ?? null;
              }
              return null;
            },

            async run() {
              // ── INSERT INTO cases ──────────────────────────────────────
              if (lsql.startsWith('insert into cases')) {
                const row: Row = {
                  id: args[0], tenant_id: args[1], workspace_id: args[2],
                  title: args[3], description: args[4], status: args[5],
                  priority: args[6], category: args[7], source_channel: args[8],
                  group_id: args[9], reported_by_user_id: args[10], sla_due_at: args[11],
                  ndpr_consented: args[12], tags: args[13], metadata_json: args[14],
                  created_at: args[15], updated_at: args[16],
                };
                cases.push(row);
                return { success: true, meta: { changes: 1 } };
              }
              // ── INSERT INTO case_notes ─────────────────────────────────
              if (lsql.startsWith('insert into case_notes')) {
                const row: Row = {
                  id: args[0], case_id: args[1], tenant_id: args[2], author_id: args[3],
                  note_type: args[4], body: args[5], is_internal: args[6],
                  metadata_json: args[7], created_at: args[8],
                };
                caseNotes.push(row);
                return { success: true, meta: { changes: 1 } };
              }
              // ── UPDATE cases SET assigned_to_user_id ───────────────────
              if (lsql.includes('update cases set') && lsql.includes('assigned_to_user_id')) {
                const caseId = args[args.length - 2] as string;
                const tenantId = args[args.length - 1] as string;
                const idx = cases.findIndex(r => r.id === caseId && r.tenant_id === tenantId);
                if (idx === -1) return { success: true, meta: { changes: 0 } };
                const row = cases[idx];
                row!.assigned_to_user_id = args[0];
                row!.assigned_at = args[1];
                row!.status = 'assigned';
                row!.updated_at = args[2];
                return { success: true, meta: { changes: 1 } };
              }
              // ── UPDATE cases SET status = 'resolved' ───────────────────
              if (lsql.includes("status = 'resolved'") && lsql.includes('update cases')) {
                const caseId = args[args.length - 2] as string;
                const tenantId = args[args.length - 1] as string;
                const idx = cases.findIndex(
                  r => r.id === caseId && r.tenant_id === tenantId &&
                       r.status !== 'resolved' && r.status !== 'closed',
                );
                if (idx === -1) return { success: true, meta: { changes: 0 } };
                cases[idx]!.status = 'resolved';
                cases[idx]!.resolved_at = args[0];
                cases[idx]!.updated_at = args[1];
                return { success: true, meta: { changes: 1 } };
              }
              // ── UPDATE cases SET status = 'closed' ─────────────────────
              if (lsql.includes("status = 'closed'") && lsql.includes('update cases')) {
                const caseId = args[args.length - 2] as string;
                const tenantId = args[args.length - 1] as string;
                const idx = cases.findIndex(r => r.id === caseId && r.tenant_id === tenantId);
                if (idx === -1) return { success: true, meta: { changes: 0 } };
                cases[idx]!.status = 'closed';
                cases[idx]!.closed_at = args[0];
                cases[idx]!.updated_at = args[1];
                return { success: true, meta: { changes: 1 } };
              }
              // ── UPDATE cases SET status = 'reopened' ───────────────────
              if (lsql.includes("status = 'reopened'") && lsql.includes('update cases')) {
                const caseId = args[args.length - 2] as string;
                const tenantId = args[args.length - 1] as string;
                const idx = cases.findIndex(
                  r => r.id === caseId && r.tenant_id === tenantId &&
                       (r.status === 'resolved' || r.status === 'closed'),
                );
                if (idx === -1) return { success: true, meta: { changes: 0 } };
                cases[idx]!.status = 'reopened';
                cases[idx]!.resolved_at = null;
                cases[idx]!.closed_at = null;
                cases[idx]!.updated_at = args[0];
                return { success: true, meta: { changes: 1 } };
              }
              // ── UPDATE cases SET updated_at (from addNote) ─────────────
              if (lsql.includes('update cases set updated_at')) {
                const [updatedAt, caseId, tenantId] = args as [number, string, string];
                const idx = cases.findIndex(r => r.id === caseId && r.tenant_id === tenantId);
                if (idx !== -1) cases[idx]!.updated_at = updatedAt;
                return { success: true, meta: { changes: 1 } };
              }
              return { success: true, meta: { changes: 0 } };
            },

            async all<T>(): Promise<{ results: T[] }> {
              // SELECT * FROM case_notes
              if (lsql.includes('from case_notes')) {
                const [caseId, tenantId] = args as [string, string];
                let rows = caseNotes.filter(r => r.case_id === caseId && r.tenant_id === tenantId);
                if (lsql.includes('is_internal = 0')) rows = rows.filter(r => r.is_internal === 0);
                rows.sort((a, b) => (a.created_at as number) - (b.created_at as number));
                return { results: rows as unknown as T[] };
              }
              // SELECT * FROM cases (list)
              if (lsql.includes('from cases')) {
                const [tenantId] = args as [string];
                const rows = cases.filter(r => r.tenant_id === tenantId);
                return { results: rows as unknown as T[] };
              }
              return { results: [] };
            },
          };
        },
      };
    },
  };
}

const TENANT = 'tenant-abc';
const WORKSPACE = 'ws-001';
const USER_A = 'user-alice';
const USER_B = 'user-bob';

describe('@webwaka/cases — repository', () => {
  // ── createCase ─────────────────────────────────────────────────────────────

  it('T01 — creates a case with status=open', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'Test case', ndprConsented: true });
    expect(c.status).toBe('open');
    expect(c.id).toBeTruthy();
    expect(c.tenantId).toBe(TENANT);
  });

  it('T02 — throws NDPR_REQUIRED if ndprConsented=false', async () => {
    const db = makeMockDb();
    await expect(
      createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: false }),
    ).rejects.toThrow('NDPR_REQUIRED');
  });

  it('T03 — default priority is normal', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true });
    expect(c.priority).toBe('normal');
  });

  it('T04 — default category is general', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true });
    expect(c.category).toBe('general');
  });

  it('T05 — custom priority and category are preserved', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true, priority: 'urgent', category: 'complaint' });
    expect(c.priority).toBe('urgent');
    expect(c.category).toBe('complaint');
  });

  it('T06 — tags default to empty array', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true });
    expect(c.tags).toEqual([]);
  });

  it('T07 — tags are persisted', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true, tags: ['urgent', 'pii'] });
    expect(c.tags).toEqual(['urgent', 'pii']);
  });

  // ── getCase ────────────────────────────────────────────────────────────────

  it('T08 — getCase returns null for unknown id', async () => {
    const db = makeMockDb();
    const result = await getCase(db as never, 'no-such-id', TENANT);
    expect(result).toBeNull();
  });

  it('T09 — getCase returns null if tenant_id mismatch (T3)', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true });
    const result = await getCase(db as never, c.id, 'other-tenant');
    expect(result).toBeNull();
  });

  // ── assignCase ─────────────────────────────────────────────────────────────

  it('T10 — assignCase sets status to assigned', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true });
    const assigned = await assignCase(db as never, { caseId: c.id, tenantId: TENANT, assignedToUserId: USER_B, assignedByUserId: USER_A });
    expect(assigned.status).toBe('assigned');
    expect(assigned.assignedToUserId).toBe(USER_B);
  });

  it('T11 — assignCase adds an assignment note', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true });
    await assignCase(db as never, { caseId: c.id, tenantId: TENANT, assignedToUserId: USER_B, assignedByUserId: USER_A });
    const notes = await listNotes(db as never, c.id, TENANT, true);
    const assignNote = notes.find(n => n.noteType === 'assignment');
    expect(assignNote).toBeDefined();
    expect(assignNote?.isInternal).toBe(true);
  });

  it('T12 — assignCase throws if case not found', async () => {
    const db = makeMockDb();
    await expect(
      assignCase(db as never, { caseId: 'ghost', tenantId: TENANT, assignedToUserId: USER_B, assignedByUserId: USER_A }),
    ).rejects.toThrow('CASE_NOT_FOUND');
  });

  // ── addNote ────────────────────────────────────────────────────────────────

  it('T13 — addNote creates a comment note', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true });
    const note = await addNote(db as never, { caseId: c.id, tenantId: TENANT, authorId: USER_A, body: 'Test note' });
    expect(note.body).toBe('Test note');
    expect(note.noteType).toBe('comment');
    expect(note.isInternal).toBe(false);
  });

  it('T14 — addNote: internal=true is persisted', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true });
    const note = await addNote(db as never, { caseId: c.id, tenantId: TENANT, authorId: USER_A, body: 'Internal note', isInternal: true });
    expect(note.isInternal).toBe(true);
  });

  it('T15 — listNotes excludes internal notes for external callers', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true });
    await addNote(db as never, { caseId: c.id, tenantId: TENANT, authorId: USER_A, body: 'Public', isInternal: false });
    await addNote(db as never, { caseId: c.id, tenantId: TENANT, authorId: USER_A, body: 'Secret', isInternal: true });
    const publicNotes = await listNotes(db as never, c.id, TENANT, false);
    expect(publicNotes.some(n => n.body === 'Secret')).toBe(false);
    expect(publicNotes.some(n => n.body === 'Public')).toBe(true);
  });

  it('T16 — listNotes includes internal when includeInternal=true', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true });
    await addNote(db as never, { caseId: c.id, tenantId: TENANT, authorId: USER_A, body: 'Public', isInternal: false });
    await addNote(db as never, { caseId: c.id, tenantId: TENANT, authorId: USER_A, body: 'Secret', isInternal: true });
    const allNotes = await listNotes(db as never, c.id, TENANT, true);
    expect(allNotes.length).toBe(2);
  });

  // ── resolveCase ────────────────────────────────────────────────────────────

  it('T17 — resolveCase sets status to resolved', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true });
    const resolved = await resolveCase(db as never, { caseId: c.id, tenantId: TENANT, resolvedByUserId: USER_A, resolutionNote: 'Fixed it.' });
    expect(resolved.status).toBe('resolved');
    expect(resolved.resolvedAt).not.toBeNull();
  });

  it('T18 — resolveCase adds a resolution note', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true });
    await resolveCase(db as never, { caseId: c.id, tenantId: TENANT, resolvedByUserId: USER_A, resolutionNote: 'Fixed it.' });
    const notes = await listNotes(db as never, c.id, TENANT);
    const resNote = notes.find(n => n.noteType === 'resolution');
    expect(resNote?.body).toBe('Fixed it.');
  });

  it('T19 — resolveCase throws if already resolved', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true });
    await resolveCase(db as never, { caseId: c.id, tenantId: TENANT, resolvedByUserId: USER_A, resolutionNote: 'Done.' });
    await expect(
      resolveCase(db as never, { caseId: c.id, tenantId: TENANT, resolvedByUserId: USER_A, resolutionNote: 'Again.' }),
    ).rejects.toThrow('CASE_NOT_FOUND');
  });

  // ── closeCase ──────────────────────────────────────────────────────────────

  it('T20 — closeCase sets status to closed', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true });
    await resolveCase(db as never, { caseId: c.id, tenantId: TENANT, resolvedByUserId: USER_A, resolutionNote: 'Resolved.' });
    const closed = await closeCase(db as never, { caseId: c.id, tenantId: TENANT, closedByUserId: USER_A });
    expect(closed.status).toBe('closed');
    expect(closed.closedAt).not.toBeNull();
  });

  // ── reopenCase ─────────────────────────────────────────────────────────────

  it('T21 — reopenCase sets status to reopened', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true });
    await resolveCase(db as never, { caseId: c.id, tenantId: TENANT, resolvedByUserId: USER_A, resolutionNote: 'Resolved.' });
    const reopened = await reopenCase(db as never, { caseId: c.id, tenantId: TENANT, reopenedByUserId: USER_B, reason: 'Issue recurred.' });
    expect(reopened.status).toBe('reopened');
  });

  it('T22 — reopenCase clears resolvedAt', async () => {
    const db = makeMockDb();
    const c = await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'x', ndprConsented: true });
    await resolveCase(db as never, { caseId: c.id, tenantId: TENANT, resolvedByUserId: USER_A, resolutionNote: 'Done.' });
    const reopened = await reopenCase(db as never, { caseId: c.id, tenantId: TENANT, reopenedByUserId: USER_B, reason: 'Back.' });
    expect(reopened.resolvedAt).toBeNull();
  });

  // ── getCaseSummary ─────────────────────────────────────────────────────────

  it('T23 — getCaseSummary counts open cases correctly', async () => {
    const db = makeMockDb();
    await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'Open 1', ndprConsented: true });
    await createCase(db as never, { tenantId: TENANT, workspaceId: WORKSPACE, title: 'Open 2', ndprConsented: true });
    const summary = await getCaseSummary(db as never, TENANT, WORKSPACE);
    expect(summary.totalOpen).toBe(2);
    expect(summary.totalResolved).toBe(0);
  });

  it('T24 — getCaseSummary reports zero for empty workspace', async () => {
    const db = makeMockDb();
    const summary = await getCaseSummary(db as never, TENANT, 'ws-empty');
    expect(summary.totalOpen).toBe(0);
    expect(summary.totalAssigned).toBe(0);
    expect(summary.totalResolved).toBe(0);
    expect(summary.breachingSla).toBe(0);
    expect(summary.avgResolutionSeconds).toBeNull();
  });
});
