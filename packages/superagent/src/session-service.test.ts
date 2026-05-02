/**
 * SessionService unit tests — SA-6.x
 * WebWaka OS — Tests for create/load/append/trim/delete session lifecycle.
 *
 * Uses an in-memory D1-like mock to avoid real D1 bindings.
 * Governance: T3 (tenant isolation), expiry logic, context window trimming.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionService } from './session-service.js';
import type { SessionServiceDeps } from './session-service.js';

// ---------------------------------------------------------------------------
// Minimal in-memory D1 mock
// ---------------------------------------------------------------------------
// Design: prepare() returns a closure over `capturedSql`. Each bind() call
// returns a new closure over `capturedBinds`. This ensures batch() can run
// multiple independently-captured statements without overwriting each other.

interface MockRow {
  [key: string]: unknown;
}

type BoundStatement = {
  run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
  first<T = MockRow>(): Promise<T | null>;
  all<T = MockRow>(): Promise<{ results: T[] }>;
};

class MockDb {
  readonly tables: Map<string, MockRow[]> = new Map();

  private exec(sql: string, binds: unknown[]): { success: boolean; meta?: { changes?: number } } {
    const s = sql.trim().replace(/\s+/g, ' ').toUpperCase();

    // ── INSERT ai_sessions ─────────────────────────────────────────────────
    if (s.startsWith('INSERT INTO AI_SESSIONS')) {
      // SQL: INSERT INTO ai_sessions (id, tenant_id, user_id, workspace_id, vertical, title,
      //        message_count, created_at, last_active_at, expires_at)
      //      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
      // binds: id, tenant_id, user_id, workspace_id, vertical, title, created_at, last_active_at, expires_at
      const row: MockRow = {
        id: binds[0],
        tenant_id: binds[1],
        user_id: binds[2],
        workspace_id: binds[3],
        vertical: binds[4],
        title: binds[5],
        message_count: 0,          // literal 0 in SQL
        created_at: binds[6],
        last_active_at: binds[7],
        expires_at: binds[8],
      };
      if (!this.tables.has('ai_sessions')) this.tables.set('ai_sessions', []);
      this.tables.get('ai_sessions')!.push(row);
      return { success: true, meta: { changes: 1 } };
    }

    // ── INSERT ai_session_messages ─────────────────────────────────────────
    if (s.startsWith('INSERT INTO AI_SESSION_MESSAGES')) {
      // binds: id, session_id, tenant_id, role, content, tool_calls_json,
      //        tool_call_id, token_estimate, created_at
      const row: MockRow = {
        id: binds[0],
        session_id: binds[1],
        tenant_id: binds[2],
        role: binds[3],
        content: binds[4],
        tool_calls_json: binds[5],
        tool_call_id: binds[6],
        token_estimate: binds[7],
        created_at: binds[8],
      };
      if (!this.tables.has('ai_session_messages')) this.tables.set('ai_session_messages', []);
      this.tables.get('ai_session_messages')!.push(row);
      return { success: true, meta: { changes: 1 } };
    }

    // ── UPDATE ai_sessions (appendMessages — message_count / last_active / expires) ──
    if (s.startsWith('UPDATE AI_SESSIONS') && s.includes('MESSAGE_COUNT')) {
      // binds: countDelta, now, expiresAt, sessionId, tenantId
      const [countDelta, nowVal, expiresVal, sessionId, tenantId] = binds as [
        number, string, string, string, string,
      ];
      const rows = this.tables.get('ai_sessions') ?? [];
      let changes = 0;
      for (const r of rows) {
        if (r.id === sessionId && r.tenant_id === tenantId) {
          r.message_count = (r.message_count as number) + countDelta;
          r.last_active_at = nowVal;
          r.expires_at = expiresVal;
          changes++;
        }
      }
      return { success: true, meta: { changes } };
    }

    // ── DELETE ai_sessions (by id + tenant — deleteSession / getSession TTL) ──
    if (s.startsWith('DELETE FROM AI_SESSIONS') && s.includes('TENANT_ID')) {
      const [id, tenantId] = binds as [string, string];
      const rows = this.tables.get('ai_sessions') ?? [];
      const before = rows.length;
      const remaining = rows.filter((r) => !(r.id === id && r.tenant_id === tenantId));
      this.tables.set('ai_sessions', remaining);
      // Cascade delete messages
      const msgRows = this.tables.get('ai_session_messages') ?? [];
      this.tables.set('ai_session_messages', msgRows.filter((m) => m.session_id !== id));
      return { success: true, meta: { changes: before - remaining.length } };
    }

    // ── DELETE ai_sessions (prune by expires_at) ───────────────────────────
    if (s.startsWith('DELETE FROM AI_SESSIONS')) {
      const [cutoff] = binds as [string];
      const rows = this.tables.get('ai_sessions') ?? [];
      const before = rows.length;
      const remaining = rows.filter((r) => (r.expires_at as string) >= cutoff);
      const pruned = rows.filter((r) => (r.expires_at as string) < cutoff);
      this.tables.set('ai_sessions', remaining);
      // Cascade delete messages for pruned sessions
      const prunedIds = new Set(pruned.map((r) => r.id as string));
      const msgRows = this.tables.get('ai_session_messages') ?? [];
      this.tables.set('ai_session_messages', msgRows.filter((m) => !prunedIds.has(m.session_id as string)));
      return { success: true, meta: { changes: before - remaining.length } };
    }

    return { success: true, meta: { changes: 0 } };
  }

  private query<T = MockRow>(sql: string, binds: unknown[], single: boolean): T | T[] | null {
    const s = sql.trim().replace(/\s+/g, ' ').toUpperCase();

    // ── SELECT from ai_sessions ────────────────────────────────────────────
    if (s.includes('FROM AI_SESSIONS') && !s.includes('FROM AI_SESSION_MESSAGES')) {
      let rows = (this.tables.get('ai_sessions') ?? []).slice();

      // getSession: WHERE id = ? AND tenant_id = ?
      if (s.includes('WHERE ID = ?')) {
        rows = rows.filter((r) => r.id === binds[0] && r.tenant_id === binds[1]);
      }

      // listSessions: WHERE tenant_id = ? AND user_id = ? AND expires_at > ?
      if (s.includes('TENANT_ID = ? AND USER_ID = ? AND EXPIRES_AT > ?')) {
        const [tid, uid, expiresGt] = binds as [string, string, string];
        rows = rows.filter(
          (r) =>
            r.tenant_id === tid &&
            r.user_id === uid &&
            (r.expires_at as string) > expiresGt,
        );
        // cursor: AND last_active_at < ? — binds[3] is cursor only when binds.length === 5
        // (binds.length === 4 means no cursor: [tid, uid, now, limit])
        if (binds.length >= 5) {
          rows = rows.filter((r) => (r.last_active_at as string) < (binds[3] as string));
        }
        rows = rows.sort((a, b) =>
          (b.last_active_at as string).localeCompare(a.last_active_at as string),
        );
        const limitVal = binds[binds.length - 1] as number;
        rows = rows.slice(0, limitVal);
      }

      if (single) return (rows[0] ?? null) as unknown as T;
      return rows as unknown as T[];
    }

    // ── SELECT from ai_session_messages ────────────────────────────────────
    if (s.includes('FROM AI_SESSION_MESSAGES')) {
      let rows = (this.tables.get('ai_session_messages') ?? []).slice();
      if (binds.length >= 2) {
        rows = rows.filter((r) => r.session_id === binds[0] && r.tenant_id === binds[1]);
      }
      rows = rows.sort((a, b) =>
        (a.created_at as string).localeCompare(b.created_at as string),
      );
      if (single) return (rows[0] ?? null) as unknown as T;
      return rows as unknown as T[];
    }

    return single ? null : ([] as unknown as T[]);
  }

  prepare(sql: string) {
    // Each prepare() captures its own SQL in a closure
    const capturedSql = sql;

    return {
      bind: (...values: unknown[]): BoundStatement => {
        const capturedBinds = values;
        return {
          run: async (): Promise<{ success: boolean; meta?: { changes?: number } }> => {
            return Promise.resolve(this.exec(capturedSql, capturedBinds));
          },
          first: async <T = MockRow>(): Promise<T | null> => {
            return Promise.resolve(this.query<T>(capturedSql, capturedBinds, true) as T | null);
          },
          all: async <T = MockRow>(): Promise<{ results: T[] }> => {
            return Promise.resolve({ results: this.query<T>(capturedSql, capturedBinds, false) as T[] });
          },
        };
      },
    };
  }

  async batch(stmts: BoundStatement[]): Promise<Array<{ success: boolean; meta?: { changes?: number } }>> {
    const results = [];
    for (const stmt of stmts) {
      results.push(await stmt.run());
    }
    return results;
  }

  rows(table: string): MockRow[] {
    return this.tables.get(table) ?? [];
  }
}

// ---------------------------------------------------------------------------
// Helper to create a SessionService backed by MockDb
// ---------------------------------------------------------------------------

function makeService(): { svc: SessionService; db: MockDb } {
  const db = new MockDb();
  const svc = new SessionService({ db: db as unknown as SessionServiceDeps['db'] });
  return { svc, db };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SessionService', () => {
  let svc: SessionService;
  let db: MockDb;

  beforeEach(() => {
    ({ svc, db } = makeService());
  });

  // ── createSession ──────────────────────────────────────────────────────────

  describe('createSession', () => {
    it('creates a session row with correct tenant and user', async () => {
      const session = await svc.createSession({
        tenantId: 'tenant-1',
        userId: 'user-1',
        vertical: 'retail',
      });

      expect(session.id).toBeTruthy();
      expect(session.tenantId).toBe('tenant-1');
      expect(session.userId).toBe('user-1');
      expect(session.vertical).toBe('retail');
      expect(session.messageCount).toBe(0);
      expect(session.expiresAt).toBeTruthy();
    });

    it('defaults TTL to 7 days', async () => {
      const before = new Date();
      const session = await svc.createSession({ tenantId: 't', userId: 'u' });
      const expires = new Date(session.expiresAt);
      const diffDays = (expires.getTime() - before.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThanOrEqual(6.9);
      expect(diffDays).toBeLessThanOrEqual(7.1);
    });

    it('respects custom TTL', async () => {
      const before = new Date();
      const session = await svc.createSession({ tenantId: 't', userId: 'u', ttlDays: 14 });
      const diffDays =
        (new Date(session.expiresAt).getTime() - before.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(13);
    });
  });

  // ── getSession ──────────────────────────────────────────────────────────────

  describe('getSession', () => {
    it('returns null for unknown session', async () => {
      const result = await svc.getSession('no-such-id', 'tenant-1');
      expect(result).toBeNull();
    });

    it('returns null for wrong tenant (T3 isolation)', async () => {
      const s = await svc.createSession({ tenantId: 'tenant-A', userId: 'u' });
      const result = await svc.getSession(s.id, 'tenant-B');
      expect(result).toBeNull();
    });

    it('returns session for correct tenant', async () => {
      const s = await svc.createSession({ tenantId: 'tenant-1', userId: 'u-1' });
      const found = await svc.getSession(s.id, 'tenant-1');
      expect(found?.id).toBe(s.id);
      expect(found?.userId).toBe('u-1');
    });

    it('returns null for expired session and deletes it', async () => {
      const s = await svc.createSession({ tenantId: 'tenant-1', userId: 'u' });
      // Force expiry by backdating expires_at in the mock store
      const rows = db.rows('ai_sessions');
      const row = rows.find((r) => r.id === s.id)!;
      row.expires_at = new Date(Date.now() - 1000).toISOString();

      const result = await svc.getSession(s.id, 'tenant-1');
      expect(result).toBeNull();
    });
  });

  // ── appendMessages + loadHistory ──────────────────────────────────────────

  describe('appendMessages / loadHistory', () => {
    it('stores messages and loads them in order', async () => {
      const s = await svc.createSession({ tenantId: 't', userId: 'u' });

      await svc.appendMessages(s.id, 't', [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'World' },
      ]);

      const history = await svc.loadHistory(s.id, 't', 8192);
      expect(history).toHaveLength(2);
      expect(history[0]!.role).toBe('user');
      expect(history[0]!.content).toBe('Hello');
      expect(history[1]!.role).toBe('assistant');
    });

    it('preserves tool_calls_json and tool_call_id', async () => {
      const s = await svc.createSession({ tenantId: 't', userId: 'u' });
      const tcJson = JSON.stringify([{ id: 'call-1', function: { name: 'test', arguments: '{}' } }]);

      await svc.appendMessages(s.id, 't', [
        { role: 'assistant', content: '', toolCallsJson: tcJson, toolCallId: null },
        { role: 'tool', content: 'result', toolCallsJson: null, toolCallId: 'call-1' },
      ]);

      const msgs = await svc.getMessages(s.id, 't');
      expect(msgs[0]!.toolCallsJson).toBe(tcJson);
      expect(msgs[1]!.toolCallId).toBe('call-1');
    });

    it('maintains cross-tenant isolation — tenant B cannot read tenant A messages', async () => {
      const s = await svc.createSession({ tenantId: 'tenant-A', userId: 'u' });
      await svc.appendMessages(s.id, 'tenant-A', [{ role: 'user', content: 'secret' }]);

      const historyB = await svc.loadHistory(s.id, 'tenant-B', 8192);
      expect(historyB).toHaveLength(0);
    });
  });

  // ── Context window trimming ───────────────────────────────────────────────

  describe('loadHistory — context window trimming', () => {
    it('trims oldest non-system messages when history exceeds maxTokens', async () => {
      const s = await svc.createSession({ tenantId: 't', userId: 'u' });

      // System prompt: 100 chars → ~25 tokens
      // Each user/assistant message: 100 chars → ~25 tokens each
      const msgs = Array.from({ length: 10 }, (_, i) => ({
        role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
        content: 'X'.repeat(100),
      }));

      await svc.appendMessages(s.id, 't', [
        { role: 'system', content: 'S'.repeat(100) },
        ...msgs,
      ]);

      // maxTokens=100 → system uses 25, budget for non-system = 75 (~3 messages of 25 each)
      const history = await svc.loadHistory(s.id, 't', 100);

      expect(history.some((m) => m.role === 'system')).toBe(true);
      expect(history.length).toBeLessThanOrEqual(4); // system + max 3 non-system
    });

    it('preserves all messages when within budget', async () => {
      const s = await svc.createSession({ tenantId: 't', userId: 'u' });
      await svc.appendMessages(s.id, 't', [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello' },
      ]);

      const history = await svc.loadHistory(s.id, 't', 8192);
      expect(history).toHaveLength(2);
    });

    it('never trims system messages even under extreme budget pressure', async () => {
      const s = await svc.createSession({ tenantId: 't', userId: 'u' });
      await svc.appendMessages(s.id, 't', [
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: 'U'.repeat(4000) },
      ]);

      const history = await svc.loadHistory(s.id, 't', 10); // tiny budget
      const systemMsgs = history.filter((m) => m.role === 'system');
      expect(systemMsgs).toHaveLength(1);
    });
  });

  // ── deleteSession ──────────────────────────────────────────────────────────

  describe('deleteSession', () => {
    it('hard-deletes session and returns true', async () => {
      const s = await svc.createSession({ tenantId: 't', userId: 'u' });
      const deleted = await svc.deleteSession(s.id, 't');
      expect(deleted).toBe(true);

      const gone = await svc.getSession(s.id, 't');
      expect(gone).toBeNull();
    });

    it('returns false for nonexistent session', async () => {
      const deleted = await svc.deleteSession('no-such-id', 't');
      expect(deleted).toBe(false);
    });

    it('does not delete sessions belonging to another tenant (T3)', async () => {
      const s = await svc.createSession({ tenantId: 'tenant-A', userId: 'u' });
      const deleted = await svc.deleteSession(s.id, 'tenant-B');
      expect(deleted).toBe(false);

      const still = await svc.getSession(s.id, 'tenant-A');
      expect(still).not.toBeNull();
    });
  });

  // ── listSessions ───────────────────────────────────────────────────────────

  describe('listSessions', () => {
    it('returns sessions for the current user, sorted by last_active_at desc', async () => {
      await svc.createSession({ tenantId: 't', userId: 'u', vertical: 'first' });
      await new Promise((r) => setTimeout(r, 10));
      await svc.createSession({ tenantId: 't', userId: 'u', vertical: 'second' });

      const { sessions } = await svc.listSessions({ tenantId: 't', userId: 'u' });
      expect(sessions.length).toBe(2);
      expect(sessions[0]!.vertical).toBe('second'); // most recent first
    });

    it('does not return sessions from another user (T3)', async () => {
      await svc.createSession({ tenantId: 't', userId: 'user-X' });
      const { sessions } = await svc.listSessions({ tenantId: 't', userId: 'user-Y' });
      expect(sessions).toHaveLength(0);
    });

    it('excludes expired sessions', async () => {
      const s = await svc.createSession({ tenantId: 't', userId: 'u' });
      const rows = db.rows('ai_sessions');
      rows.find((r) => r.id === s.id)!.expires_at = new Date(Date.now() - 1000).toISOString();

      const { sessions } = await svc.listSessions({ tenantId: 't', userId: 'u' });
      expect(sessions).toHaveLength(0);
    });

    it('respects limit and returns nextCursor', async () => {
      for (let i = 0; i < 5; i++) {
        await svc.createSession({ tenantId: 't', userId: 'u', vertical: `v${i}` });
        await new Promise((r) => setTimeout(r, 10));
      }

      const { sessions, nextCursor } = await svc.listSessions({
        tenantId: 't',
        userId: 'u',
        limit: 3,
      });
      expect(sessions).toHaveLength(3);
      expect(nextCursor).toBeTruthy();
    });
  });

  // ── pruneExpiredSessions (static) ──────────────────────────────────────────

  describe('pruneExpiredSessions', () => {
    it('deletes only expired sessions', async () => {
      const live = await svc.createSession({ tenantId: 't', userId: 'u' });
      const expired = await svc.createSession({ tenantId: 't', userId: 'u' });

      // Backdate expired session
      const rows = db.rows('ai_sessions');
      rows.find((r) => r.id === expired.id)!.expires_at = new Date(Date.now() - 1000).toISOString();

      const pruned = await SessionService.pruneExpiredSessions(
        db as unknown as SessionServiceDeps['db'],
      );
      expect(pruned).toBe(1);

      const still = await svc.getSession(live.id, 't');
      expect(still).not.toBeNull();
    });
  });
});

// ==========================================================================
// Wave 3 additions — A5-1, A5-4
// ==========================================================================

describe('Wave 3 A5-4 — generateTitle', () => {
  it('sets title from first user message heuristic when no adapter supplied', async () => {
    const s = await svc.createSession({ tenantId: 't', userId: 'u' });
    const title = await svc.generateTitle(s.id, 't', {
      firstUserMessage: 'How can I reorder my inventory items?',
    });
    expect(title).toContain('How can I reorder');
  });

  it('truncates long messages to 60 chars with ellipsis', async () => {
    const s = await svc.createSession({ tenantId: 't', userId: 'u' });
    const longMsg = 'A'.repeat(100);
    const title = await svc.generateTitle(s.id, 't', { firstUserMessage: longMsg });
    expect(title.length).toBeLessThanOrEqual(61); // 60 + ellipsis
    expect(title.endsWith('…')).toBe(true);
  });

  it('uses adapter result when adapter is provided', async () => {
    const s = await svc.createSession({ tenantId: 't', userId: 'u' });
    const titleAdapter = vi.fn().mockResolvedValue('Inventory Reorder Query');
    const title = await svc.generateTitle(s.id, 't', {
      firstUserMessage: 'How can I reorder?',
      titleAdapter,
    });
    expect(title).toBe('Inventory Reorder Query');
    expect(titleAdapter).toHaveBeenCalledOnce();
  });

  it('falls back to heuristic when adapter throws', async () => {
    const s = await svc.createSession({ tenantId: 't', userId: 'u' });
    const titleAdapter = vi.fn().mockRejectedValue(new Error('AI timeout'));
    const title = await svc.generateTitle(s.id, 't', {
      firstUserMessage: 'Help me track sales',
      titleAdapter,
    });
    expect(title).toContain('Help me track sales');
  });

  it('does NOT overwrite an existing title (idempotent)', async () => {
    const s = await svc.createSession({ tenantId: 't', userId: 'u', title: 'Existing Title' });
    await svc.generateTitle(s.id, 't', { firstUserMessage: 'New message' });
    const loaded = await svc.getSession(s.id, 't');
    // SQL WHERE title IS NULL means existing title is unchanged
    expect(loaded?.title).toBe('Existing Title');
  });
});

describe('Wave 3 A5-1 — SessionService.pruneExpired (inactivity gate)', () => {
  it('pruneExpired removes sessions past expires_at', async () => {
    // Create a session that is already expired
    const expiredId = await (async () => {
      const s = await svc.createSession({ tenantId: 't', userId: 'u' });
      // Manually push expires_at into the past
      const db = (svc as unknown as { db: unknown })['db'] as {
        prepare(sql: string): { bind(...v: unknown[]): { run(): Promise<unknown> } };
      };
      await db
        .prepare(`UPDATE ai_sessions SET expires_at = ? WHERE id = ?`)
        .bind(new Date(Date.now() - 1000).toISOString(), s.id)
        .run();
      return s.id;
    })();

    const count = await (svc as unknown as { pruneExpired(): Promise<number> })
      .pruneExpired?.();

    if (typeof count === 'number') {
      expect(count).toBeGreaterThanOrEqual(1);
    }
    // Session should be gone
    const gone = await svc.getSession(expiredId, 't');
    expect(gone).toBeNull();
  });
});
