/**
 * M-9: Offline-Sync Conflict Resolution — End-to-End Lifecycle Tests
 *
 * Simulates the full offline-sync conflict cycle:
 *   1. Client edits an entity and queues the change offline
 *   2. Client goes offline (network unreachable)
 *   3. Server edits the same entity independently
 *   4. Client reconnects → SyncEngine calls POST /sync/apply
 *   5. Server returns 409 with authoritative server version
 *   6. ConflictStore records the conflict; SyncEngine resolves server-wins (P11)
 *   7. Final payload = server version; no data loss on server side
 *
 * All network calls are stubbed — no real HTTP needed.
 * Tests are deterministic and do not depend on timing or I/O.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncEngine } from './sync-engine.js';
import { ConflictStore } from './conflict-resolution.js';
import type { SyncAdapter, SyncQueueItem, ConflictResolution, SyncStatus } from './types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ts(offsetMs = 0): number {
  return 1_700_000_000_000 + offsetMs;
}

function makeItem(overrides: Partial<SyncQueueItem> = {}): SyncQueueItem {
  return {
    id: 'sq_e2e_001',
    entityType: 'individual',
    entityId: 'ind_shared_001',
    operation: 'update',
    payload: { name: 'Client Offline Edit', phone: '08011111111' },
    attemptCount: 0,
    status: 'pending',
    createdAt: ts(0),
    lastAttemptAt: null,
    error: null,
    ...overrides,
  };
}

/** In-memory SyncAdapter that records calls */
function makeAdapter(items: SyncQueueItem[] = []): SyncAdapter & {
  _store: Map<string, SyncQueueItem>;
  _resolutions: Array<{ id: string; resolution: ConflictResolution }>;
} {
  const store = new Map<string, SyncQueueItem>(items.map(i => [i.id, i]));
  const resolutions: Array<{ id: string; resolution: ConflictResolution }> = [];

  return {
    _store: store,
    _resolutions: resolutions,
    enqueue: vi.fn().mockImplementation(async (item) => {
      const id = `sq_${Date.now()}`;
      store.set(id, { ...item, id, attemptCount: 0, status: 'pending', createdAt: Date.now(), lastAttemptAt: null, error: null } as SyncQueueItem);
      return id;
    }),
    dequeue: vi.fn().mockImplementation(async (status: SyncStatus) => {
      return Array.from(store.values()).filter(i => i.status === status);
    }),
    updateStatus: vi.fn().mockImplementation(async (id: string, status: SyncStatus, error?: string) => {
      const item = store.get(id);
      if (item) store.set(id, { ...item, status, error: error ?? null });
    }),
    resolveConflict: vi.fn().mockImplementation(async (id: string, resolution: ConflictResolution) => {
      resolutions.push({ id, resolution });
      const item = store.get(id);
      if (item) store.set(id, { ...item, status: 'synced', error: `conflict:${resolution.strategy}` });
    }),
  };
}

beforeEach(() => vi.restoreAllMocks());
afterEach(() => vi.restoreAllMocks());

// ---------------------------------------------------------------------------
// Scenario 1: Basic conflict lifecycle — client offline, server wins
// ---------------------------------------------------------------------------

describe('M-9 | E2E: client-offline → server-edits → client-syncs → server-wins', () => {

  it('full lifecycle: 409 from server → conflict recorded → server-wins applied', async () => {
    // T=0: Client edits entity while online; goes offline before sync
    const clientItem = makeItem({ createdAt: ts(0) });
    const adapter = makeAdapter([clientItem]);

    // T=5s: Server edits same entity independently (server is authoritative)
    const serverAuthoritative = {
      id: 'ind_shared_001',
      name: 'Server Authoritative Version',
      phone: '09099999999',
      email: 'server@webwaka.io',
      updatedAt: ts(5_000),
    };

    // Stub fetch: server returns 409 conflict with its authoritative version
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        error: 'conflict',
        serverVersion: serverAuthoritative,
        message: 'Entity was modified server-side',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const conflictStore = new ConflictStore();
    const engine = new SyncEngine(adapter, 'https://api.staging.webwaka.io', async () => 'jwt_test_token');

    // T=10s: Client reconnects and triggers sync
    const result = await engine.processPendingQueue();

    // SyncEngine reports 1 conflict, 0 synced
    expect(result.conflicts).toBe(1);
    expect(result.synced).toBe(0);
    expect(result.errors).toBe(0);
    expect(result.total).toBe(1);

    // Adapter recorded the server-wins resolution
    expect(adapter._resolutions).toHaveLength(1);
    expect(adapter._resolutions[0].id).toBe(clientItem.id);
    expect(adapter._resolutions[0].resolution.strategy).toBe('server-wins');
    expect(adapter._resolutions[0].resolution.resolvedAt).toBeTypeOf('number');

    // Item is now marked synced (server-wins = accepted server version)
    const finalItem = adapter._store.get(clientItem.id);
    expect(finalItem?.status).toBe('synced');

    // Manually record in ConflictStore (simulates the UI layer calling conflictStore.recordConflict)
    const conflictRecord = conflictStore.recordConflict(
      clientItem.entityType,
      clientItem.entityId,
      clientItem.payload as Record<string, unknown>,
      serverAuthoritative,
    );

    // Conflict is recorded and pending
    expect(conflictRecord.resolvedStrategy).toBe('pending');
    expect(conflictRecord.entityType).toBe('individual');
    expect(conflictRecord.entityId).toBe('ind_shared_001');
    expect(conflictStore.getActiveConflicts()).toHaveLength(1);

    // Resolve the conflict (server-wins)
    const resolved = conflictStore.resolveServerWins(conflictRecord.id);
    expect(resolved.resolvedStrategy).toBe('server_wins');
    expect(resolved.resolvedAt).not.toBeNull();
    expect(conflictStore.getActiveConflicts()).toHaveLength(0);

    // Server version is the final truth — client payload is gone
    expect(resolved.serverVersion).toEqual(serverAuthoritative);
    expect(resolved.serverVersion.name).toBe('Server Authoritative Version');
  });

  it('server POST receives correct clientId, entity, operation, payload', async () => {
    const clientItem = makeItem({
      id: 'sq_payload_check',
      entityType: 'individual',
      entityId: 'ind_payload_entity',
      operation: 'update',
      payload: { name: 'Offline Edit', status: 'active' },
    });
    const adapter = makeAdapter([clientItem]);

    let capturedBody: Record<string, unknown> | null = null;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (_url: string, opts: RequestInit) => {
      capturedBody = JSON.parse(opts.body as string);
      return { ok: true, status: 200 };
    }));

    const engine = new SyncEngine(adapter, 'https://api.staging.webwaka.io', async () => 'jwt_test');
    await engine.processPendingQueue();

    expect(capturedBody).not.toBeNull();
    expect(capturedBody!.clientId).toBe('sq_payload_check');
    expect(capturedBody!.entity).toBe('individual');
    expect(capturedBody!.operation).toBe('update');
    expect(capturedBody!.payload).toEqual({ name: 'Offline Edit', status: 'active' });
  });

  it('Authorization header contains the JWT token', async () => {
    const item = makeItem();
    const adapter = makeAdapter([item]);
    let capturedAuth: string | null = null;

    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (_url: string, opts: RequestInit) => {
      capturedAuth = (opts.headers as Record<string, string>).Authorization ?? null;
      return { ok: true, status: 200 };
    }));

    const engine = new SyncEngine(adapter, 'https://api.staging.webwaka.io', async () => 'Bearer_e2e_token');
    await engine.processPendingQueue();

    expect(capturedAuth).toBe('Bearer Bearer_e2e_token');
  });
});

// ---------------------------------------------------------------------------
// Scenario 2: Multiple concurrent offline edits, mixed outcomes
// ---------------------------------------------------------------------------

describe('M-9 | E2E: multiple concurrent offline edits with mixed outcomes', () => {

  it('3 queued edits: 2 synced, 1 conflict → correct counts', async () => {
    const items: SyncQueueItem[] = [
      makeItem({ id: 'sq_a', entityId: 'ind_aaa', payload: { name: 'Edit A' }, createdAt: ts(0) }),
      makeItem({ id: 'sq_b', entityId: 'ind_bbb', payload: { name: 'Edit B' }, createdAt: ts(1_000) }),
      makeItem({ id: 'sq_c', entityId: 'ind_ccc', payload: { name: 'Edit C' }, createdAt: ts(2_000) }),
    ];
    const adapter = makeAdapter(items);

    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => {
      callCount++;
      // sq_b (2nd call) returns 409
      if (callCount === 2) return { ok: false, status: 409 };
      return { ok: true, status: 200 };
    }));

    const engine = new SyncEngine(adapter, 'https://api.staging.webwaka.io', async () => 'token');
    const result = await engine.processPendingQueue();

    expect(result.total).toBe(3);
    expect(result.synced).toBe(2);
    expect(result.conflicts).toBe(1);
    expect(result.errors).toBe(0);
    expect(adapter._resolutions[0].resolution.strategy).toBe('server-wins');
  });

  it('FIFO ordering is preserved across entity types (P11)', async () => {
    const items: SyncQueueItem[] = [
      makeItem({ id: 'fifo_1', entityType: 'workspace', createdAt: ts(3_000) }),
      makeItem({ id: 'fifo_2', entityType: 'individual', createdAt: ts(1_000) }),
      makeItem({ id: 'fifo_3', entityType: 'place', createdAt: ts(2_000) }),
    ];
    const adapter = makeAdapter(items);
    const order: string[] = [];

    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (_url: string, opts: RequestInit) => {
      const body = JSON.parse(opts.body as string) as { clientId: string };
      order.push(body.clientId);
      return { ok: true, status: 200 };
    }));

    const engine = new SyncEngine(adapter, 'https://api.staging.webwaka.io', async () => 'token');
    await engine.processPendingQueue();

    // Should process oldest first regardless of entityType
    expect(order).toEqual(['fifo_2', 'fifo_3', 'fifo_1']);
  });

  it('network error does not block subsequent items in queue', async () => {
    const items: SyncQueueItem[] = [
      makeItem({ id: 'err_1', createdAt: ts(0) }),
      makeItem({ id: 'ok_2', createdAt: ts(1_000) }),
    ];
    const adapter = makeAdapter(items);
    let calls = 0;

    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => {
      calls++;
      if (calls === 1) throw new Error('Network timeout');
      return { ok: true, status: 200 };
    }));

    const engine = new SyncEngine(adapter, 'https://api.staging.webwaka.io', async () => 'token');
    const result = await engine.processPendingQueue();

    expect(result.errors).toBe(1);
    expect(result.synced).toBe(1);
    // err_1 is failed, ok_2 is synced
    expect(adapter._store.get('err_1')?.status).toBe('failed');
    expect(adapter._store.get('ok_2')?.status).toBe('synced');
  });
});

// ---------------------------------------------------------------------------
// Scenario 3: Conflict notification text (PRD §11.7)
// ---------------------------------------------------------------------------

describe('M-9 | E2E: ConflictStore notification text (PRD §11.7)', () => {

  it('notification text is user-readable and contains entity type and truncated ID', () => {
    const store = new ConflictStore();
    const record = store.recordConflict(
      'individual',
      'ind_abcdef1234567890',
      { name: 'Old' },
      { name: 'New' },
    );
    expect(record.notificationText).toContain('individual');
    expect(record.notificationText).toContain('ind_abcd'); // first 8 chars
    expect(record.notificationText.length).toBeGreaterThan(20);
  });

  it('multiple conflicts are individually tracked and resolved independently', () => {
    const store = new ConflictStore();

    const r1 = store.recordConflict('individual', 'ind_111', { name: 'A' }, { name: 'A_srv' });
    const r2 = store.recordConflict('place', 'plc_222', { title: 'B' }, { title: 'B_srv' });

    expect(store.getActiveConflicts()).toHaveLength(2);

    // Resolve r1 only
    store.resolveServerWins(r1.id);
    const active = store.getActiveConflicts();
    expect(active).toHaveLength(1);
    expect(active[0].entityId).toBe('plc_222');
    expect(active[0].resolvedStrategy).toBe('pending');

    // Resolve r2
    store.resolveServerWins(r2.id);
    expect(store.getActiveConflicts()).toHaveLength(0);
    expect(store.getAllConflicts()).toHaveLength(2);
  });

  it('resolveServerWins throws for unknown conflict ID', () => {
    const store = new ConflictStore();
    expect(() => store.resolveServerWins('nonexistent_id')).toThrowError(
      "ConflictStore: conflict 'nonexistent_id' not found.",
    );
  });

  it('clear() removes all conflict records on logout', () => {
    const store = new ConflictStore();
    store.recordConflict('individual', 'ind_a', {}, {});
    store.recordConflict('individual', 'ind_b', {}, {});
    expect(store.getAllConflicts()).toHaveLength(2);
    store.clear();
    expect(store.getAllConflicts()).toHaveLength(0);
    expect(store.getActiveConflicts()).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Scenario 4: Idempotency — replaying a synced item does not create duplicate conflicts
// ---------------------------------------------------------------------------

describe('M-9 | E2E: idempotency — already-synced items are not reprocessed', () => {

  it('adapter returns 0 pending items after sync — second processPendingQueue is a no-op', async () => {
    const item = makeItem();
    const adapter = makeAdapter([item]);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));

    const engine = new SyncEngine(adapter, 'https://api.test', async () => 'token');

    const r1 = await engine.processPendingQueue();
    expect(r1.synced).toBe(1);

    // Item is now 'synced' — dequeue('pending') returns []
    const r2 = await engine.processPendingQueue();
    expect(r2.total).toBe(0);
    expect(r2.synced).toBe(0);
  });
});
