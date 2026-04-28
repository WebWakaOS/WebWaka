/**
 * Moderation Appeal routes tests — Phase 5 (E32)
 *
 * 14 tests covering all 3 appeal routes:
 *   POST /appeals         — submit appeal
 *   GET  /admin/appeals   — list appeals (admin only)
 *   PATCH /admin/:id      — review appeal (admin only)
 */

import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { appealsRoutes } from './appeals.js';

// ---------------------------------------------------------------------------
// D1 mock infrastructure (same pattern as claim.test.ts)
// ---------------------------------------------------------------------------

interface D1Stmt {
  bind(...args: unknown[]): D1Stmt;
  run(): Promise<{ success: boolean }>;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
}

type SqlHandler = (sql: string, ...args: unknown[]) => unknown;

function makeDb(handlers: Record<string, SqlHandler> = {}): { prepare: (q: string) => D1Stmt } {
  const resolve = (sql: string): SqlHandler | null => {
    for (const [key, fn] of Object.entries(handlers)) {
      if (sql.includes(key)) return fn;
    }
    return null;
  };

  const stmtFor = (sql: string): D1Stmt => {
    const args: unknown[] = [];
    const stmt: D1Stmt = {
      bind: (...a: unknown[]) => { args.push(...a); return stmt; },
      run: async () => ({ success: true }),
      first: async <T>() => {
        const fn = resolve(sql);
        return fn ? (await fn(sql, ...args)) as T : null;
      },
      all: async <T>() => {
        const fn = resolve(sql);
        if (fn) {
          const result = await fn(sql, ...args);
          if (result && typeof result === 'object' && 'results' in (result as object)) {
            return result as { results: T[] };
          }
        }
        return { results: [] as T[] };
      },
    };
    return stmt;
  };

  return { prepare: (q: string) => stmtFor(q) };
}

function makeApp(db: ReturnType<typeof makeDb>, role = 'admin') {
  const app = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();

  app.use('*', async (c, next) => {
    c.set('auth' as never, {
      userId: 'usr_test',
      tenantId: 'tnt_test',
      role,
      workspaceId: 'wsp_test',
    } as never);
    c.env = { DB: db, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never;
    await next();
  });

  app.route('/appeals', appealsRoutes);
  return app;
}

// ---------------------------------------------------------------------------
// POST /appeals — Submit appeal
// ---------------------------------------------------------------------------

describe('POST /appeals', () => {
  it('returns 400 if broadcastId is missing', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/appeals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalAction: 'removed', appealReason: 'This is my valid reason that is long enough' }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('broadcastId');
  });

  it('returns 400 for invalid originalAction', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/appeals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ broadcastId: 'brd_1', originalAction: 'deleted', appealReason: 'This is my valid reason that is long enough' }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('originalAction');
  });

  it('returns 400 if appealReason is too short', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/appeals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ broadcastId: 'brd_1', originalAction: 'removed', appealReason: 'short' }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('appealReason');
  });

  it('returns 409 if a pending appeal already exists for this broadcast', async () => {
    const db = makeDb({
      "status = 'pending'": () => ({ id: 'apl_existing' }),
    });
    const app = makeApp(db);
    const res = await app.request('/appeals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        broadcastId: 'brd_1',
        originalAction: 'removed',
        appealReason: 'I believe this content was removed in error by the moderation system',
      }),
    });
    expect(res.status).toBe(409);
    const json = await res.json() as { error: string; appealId: string };
    expect(json.error).toContain('pending appeal');
    expect(json.appealId).toBe('apl_existing');
  });

  it('returns 201 with appealId on successful submission', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/appeals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        broadcastId: 'brd_123',
        originalAction: 'flagged',
        appealReason: 'My broadcast was incorrectly flagged as it did not violate any policies',
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json() as { appealId: string; status: string; broadcastId: string };
    expect(json.status).toBe('pending');
    expect(json.broadcastId).toBe('brd_123');
    expect(json.appealId).toMatch(/^apl_/);
  });
});

// ---------------------------------------------------------------------------
// GET /admin/appeals — List appeals (admin only)
// ---------------------------------------------------------------------------

describe('GET /admin/appeals', () => {
  it('returns 403 for non-admin role', async () => {
    const app = makeApp(makeDb(), 'member');
    const res = await app.request('/appeals/admin');
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid status filter', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/appeals/admin?status=invalid');
    expect(res.status).toBe(400);
  });

  it('returns empty list when no appeals exist', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/appeals/admin');
    expect(res.status).toBe(200);
    const json = await res.json() as { appeals: unknown[]; count: number };
    expect(Array.isArray(json.appeals)).toBe(true);
    expect(json.count).toBe(0);
  });

  it('returns appeals list with all status filter', async () => {
    const db = makeDb({
      'FROM broadcast_appeals': () => ({
        results: [
          { id: 'apl_1', status: 'pending', broadcast_id: 'brd_1', appellant_id: 'usr_1' },
          { id: 'apl_2', status: 'approved', broadcast_id: 'brd_2', appellant_id: 'usr_2' },
        ],
      }),
    });
    const app = makeApp(db);
    const res = await app.request('/appeals/admin?status=all');
    expect(res.status).toBe(200);
    const json = await res.json() as { appeals: unknown[]; count: number; status: string };
    expect(json.status).toBe('all');
  });
});

// ---------------------------------------------------------------------------
// PATCH /admin/appeals/:id — Review appeal
// ---------------------------------------------------------------------------

describe('PATCH /admin/appeals/:id', () => {
  it('returns 403 for non-admin role', async () => {
    const app = makeApp(makeDb(), 'member');
    const res = await app.request('/appeals/admin/apl_1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'reinstate' }),
    });
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid decision', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/appeals/admin/apl_1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'delete' }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('decision');
  });

  it('returns 404 for unknown appeal', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/appeals/admin/apl_none', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'reinstate' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 409 when appeal is already resolved', async () => {
    const db = makeDb({
      'FROM broadcast_appeals': () => ({
        id: 'apl_done',
        status: 'approved',
        broadcast_id: 'brd_1',
        appellant_id: 'usr_1',
        evidence_json: '{}',
      }),
    });
    const app = makeApp(db);
    const res = await app.request('/appeals/admin/apl_done', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'reinstate' }),
    });
    expect(res.status).toBe(409);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('approved');
  });

  it('returns 200 with approved status on reinstate decision', async () => {
    const db = makeDb({
      'FROM broadcast_appeals': () => ({
        id: 'apl_1',
        status: 'pending',
        broadcast_id: 'brd_1',
        appellant_id: 'usr_1',
        evidence_json: '{"original_mod_event":"removed_for_spam"}',
      }),
    });
    const app = makeApp(db);
    const res = await app.request('/appeals/admin/apl_1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'reinstate', reviewNotes: 'Content complies with policy' }),
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { status: string; decision: string; appealId: string };
    expect(json.status).toBe('approved');
    expect(json.decision).toBe('reinstate');
    expect(json.appealId).toBe('apl_1');
  });

  it('returns 200 with rejected status on uphold decision', async () => {
    const db = makeDb({
      'FROM broadcast_appeals': () => ({
        id: 'apl_2',
        status: 'pending',
        broadcast_id: 'brd_2',
        appellant_id: 'usr_2',
        evidence_json: '{}',
      }),
    });
    const app = makeApp(db);
    const res = await app.request('/appeals/admin/apl_2', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'uphold', reviewNotes: 'Content violates hate speech policy' }),
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { status: string; decision: string };
    expect(json.status).toBe('rejected');
    expect(json.decision).toBe('uphold');
  });
});
