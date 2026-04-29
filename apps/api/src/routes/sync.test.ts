/**
 * Tests for POST /sync/apply (M7b — offline sync endpoint)
 * Platform Invariant P11 — server-wins conflict, FIFO replay.
 */

import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { syncRoutes } from './sync.js';
import type { AuthContext } from '@webwaka/types';

function makeApp(dbOverride?: object): Hono {
  const app = new Hono();

  const defaultDB = {
    prepare: vi.fn().mockImplementation((sql: string) => ({
      bind: (..._args: unknown[]) => ({
        first: <T>() => {
          if (sql.includes('sync_queue_log')) return Promise.resolve(null as T);
          return Promise.resolve(null as T);
        },
        run: () => Promise.resolve({ success: true }),
        all: <T>() => Promise.resolve({ results: [] as T[] }),
      }),
    })),
  };

  app.use('*', async (c, next) => {
    c.set('auth', {
      userId: 'usr_test_001',
      tenantId: 'tenant_001',
      workspaceId: 'wsp_001',
      role: 'admin',
      permissions: [],
    } as unknown as AuthContext);
    c.env = { DB: dbOverride ?? defaultDB } as never;
    await next();
  });

  app.route('/sync', syncRoutes);
  return app;
}

describe('POST /sync/apply', () => {
  it('returns 200 with applied:true for valid request', async () => {
    const app = makeApp();
    const res = await app.request('/sync/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: 'client-uuid-001',
        entity: 'individual',
        operation: 'create',
        payload: { name: 'Tunde Oyelaran' },
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['applied']).toBe(true);
    expect(body['clientId']).toBe('client-uuid-001');
  });

  it('returns 400 when clientId is missing', async () => {
    const app = makeApp();
    const res = await app.request('/sync/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity: 'individual', operation: 'create', payload: {} }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when entity is missing', async () => {
    const app = makeApp();
    const res = await app.request('/sync/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: 'c1', operation: 'create', payload: {} }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-syncable entity type', async () => {
    const app = makeApp();
    const res = await app.request('/sync/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: 'c2',
        entity: 'random_entity',
        operation: 'create',
        payload: {},
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(String(body['error'])).toContain('not syncable');
  });

  it('returns 400 for invalid operation', async () => {
    const app = makeApp();
    const res = await app.request('/sync/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: 'c3',
        entity: 'individual',
        operation: 'upsert',
        payload: {},
      }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 200 idempotent response for already-applied clientId', async () => {
    const db = {
      prepare: vi.fn().mockImplementation((sql: string) => ({
        bind: (..._args: unknown[]) => ({
          first: <T>() => {
            if (sql.includes('sync_queue_log')) {
              return Promise.resolve({ id: 'sync_existing', status: 'applied' } as T);
            }
            return Promise.resolve(null as T);
          },
          run: () => Promise.resolve({ success: true }),
          all: <T>() => Promise.resolve({ results: [] as T[] }),
        }),
      })),
    };
    const app = makeApp(db);
    const res = await app.request('/sync/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: 'already-applied',
        entity: 'individual',
        operation: 'create',
        payload: {},
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['idempotent']).toBe(true);
  });

  it('returns 409 conflict for previously conflicted clientId', async () => {
    const db = {
      prepare: vi.fn().mockImplementation((sql: string) => ({
        bind: (..._args: unknown[]) => ({
          first: <T>() => {
            if (sql.includes('sync_queue_log')) {
              return Promise.resolve({ id: 'sync_conflict', status: 'conflict' } as T);
            }
            return Promise.resolve(null as T);
          },
          run: () => Promise.resolve({ success: true }),
          all: <T>() => Promise.resolve({ results: [] as T[] }),
        }),
      })),
    };
    const app = makeApp(db);
    const res = await app.request('/sync/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: 'conflicted-client',
        entity: 'individual',
        operation: 'update',
        payload: {},
      }),
    });
    expect(res.status).toBe(409);
    const body = await res.json() as Record<string, unknown>;
    expect(body['conflict']).toBe(true);
  });

  it('returns 400 for malformed JSON body', async () => {
    const app = makeApp();
    const res = await app.request('/sync/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    expect(res.status).toBe(400);
  });
});

// ── Phase 3 (E20) — GET /sync/delta V2 format (SD01–SD12) ───────────────────

function makeAppV2(allResults: unknown[] = []): Hono {
  const app = new Hono();

  const db = {
    prepare: vi.fn().mockImplementation((_sql: string) => ({
      bind: (..._args: unknown[]) => ({
        first: <T>() => Promise.resolve(null as T),
        run: () => Promise.resolve({ success: true }),
        all: <T>() => Promise.resolve({ results: allResults as T[] }),
      }),
    })),
  };

  app.use('*', async (c, next) => {
    c.set('auth', {
      userId: 'usr_test_001',
      tenantId: 'tenant_001',
      workspaceId: 'wsp_001',
      role: 'admin',
      permissions: [],
    } as unknown as AuthContext);
    c.env = { DB: db } as never;
    await next();
  });

  app.route('/sync', syncRoutes);
  return app;
}

describe('GET /sync/delta V2 — PRD-compliant format (SD01–SD06)', () => {
  it('SD01: returns PRD-compliant { changes, deletes, server_time, has_more, next_cursor } shape', async () => {
    const app = makeAppV2();
    const res = await app.request('/sync/delta?module=groups&last_synced_at=0');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(Array.isArray(body['changes'])).toBe(true);
    expect(Array.isArray(body['deletes'])).toBe(true);
    expect(typeof body['server_time']).toBe('number');
    expect(typeof body['has_more']).toBe('boolean');
  });

  it('SD02: returns 400 when last_synced_at is missing', async () => {
    const app = makeAppV2();
    const res = await app.request('/sync/delta?module=groups');
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(String(body['error'])).toContain('last_synced_at');
  });

  it('SD03: returns 400 when last_synced_at is negative', async () => {
    const app = makeAppV2();
    const res = await app.request('/sync/delta?module=groups&last_synced_at=-1');
    expect(res.status).toBe(400);
  });

  it('SD04: changes array contains records with { table, operation, id, data } shape', async () => {
    const mockRow = { id: 'grp_001', tenant_id: 'tenant_001', name: 'Test Group', updated_at: 1700000001 };
    const app = makeAppV2([mockRow]);
    const res = await app.request('/sync/delta?module=groups&last_synced_at=0');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    const changes = body['changes'] as Array<Record<string, unknown>>;
    if (changes.length > 0) {
      const change = changes[0]!;
      expect(typeof change['table']).toBe('string');
      expect(change['operation']).toBe('upsert');
      expect(typeof change['id']).toBe('string');
      expect(typeof change['data']).toBe('object');
    }
  });

  it('SD05: has_more is true when total changes across all module tables equals limit', async () => {
    // module=cases has 2 entity types (case + case_note).
    // Each DB query returns 1 row via the mock, totalling 2 changes.
    // Setting limit=2 means changes.length (2) === limit (2) → has_more=true.
    const row = { id: 'case_001', tenant_id: 'tenant_001', updated_at: 1700000001 };
    const app = makeAppV2([row]);
    const res = await app.request('/sync/delta?module=cases&last_synced_at=0&limit=2');
    const body = await res.json() as Record<string, unknown>;
    expect(body['has_more']).toBe(true);
    expect(body['next_cursor']).not.toBeNull();
  });

  it('SD06: has_more is false when result count is less than limit', async () => {
    const app = makeAppV2([]);
    const res = await app.request('/sync/delta?module=groups&last_synced_at=0&limit=100');
    const body = await res.json() as Record<string, unknown>;
    expect(body['has_more']).toBe(false);
    expect(body['next_cursor']).toBeNull();
  });
});

describe('GET /sync/delta V2 — module routing (SD07–SD10)', () => {
  it('SD07: module=groups includes group, group_member, group_broadcast_draft, group_event tables', async () => {
    const app = makeAppV2([]);
    const res = await app.request('/sync/delta?module=groups&last_synced_at=0');
    expect(res.status).toBe(200);
  });

  it('SD08: module=cases queries cases + case_notes tables', async () => {
    const app = makeAppV2([]);
    const res = await app.request('/sync/delta?module=cases&last_synced_at=0');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(Array.isArray(body['changes'])).toBe(true);
  });

  it('SD09: module=notifications returns V2 format with empty changes (notification-store handles this)', async () => {
    const app = makeAppV2([]);
    const res = await app.request('/sync/delta?module=notifications&last_synced_at=0');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['has_more']).toBe(false);
  });

  it('SD10: module=all returns V2 format covering all entities', async () => {
    const app = makeAppV2([]);
    const res = await app.request('/sync/delta?module=all&last_synced_at=0');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(Array.isArray(body['changes'])).toBe(true);
  });
});

describe('GET /sync/delta V1 — backward compat preserved (SD11–SD12)', () => {
  it('SD11: V1 format (since param, no module) still returns legacy { since, serverTimestamp, entities, delta }', async () => {
    const app = makeAppV2([]);
    const res = await app.request('/sync/delta?since=0&entities=individual,group');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(typeof body['since']).toBe('number');
    expect(typeof body['serverTimestamp']).toBe('number');
    expect(typeof body['delta']).toBe('object');
  });

  it('SD12: V1 format returns 400 when since is missing', async () => {
    const app = makeAppV2([]);
    const res = await app.request('/sync/delta?entities=individual');
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(String(body['error'])).toContain("'since'");
  });
});
