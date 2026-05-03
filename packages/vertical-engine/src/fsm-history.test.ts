/**
 * FSMHistoryService tests — Wave 3 B2-3
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FSMHistoryService } from './fsm-history.js';
import { FSMEngine, emitFSMTransitionEvent } from './fsm.js';
import type { FSMEventEmitter } from './fsm.js';

// ── In-memory DB stub ─────────────────────────────────────────────────────────
function makeDB() {
  const rows: Record<string, unknown>[] = [];
  return {
    rows,
    prepare: (sql: string) => ({
      bind: (...args: unknown[]) => ({
        run: vi.fn().mockImplementation(async () => {
          if (sql.includes('INSERT')) {
            rows.push({
              id: args[0], profile_id: args[1], slug: args[2],
              workspace_id: args[3], tenant_id: args[4],
              from_state: args[5], to_state: args[6],
              triggered_by: args[7], guard_name: args[8] ?? null,
              transitioned_at: Math.floor(Date.now() / 1000),
              metadata: args[9] ?? null,
            });
          }
          return { success: true };
        }),
        all: vi.fn().mockImplementation(async () => ({
          results: sql.includes('ORDER BY transitioned_at DESC')
            ? rows.filter(r => r['profile_id'] === args[0])
                  .sort((a, b) => (b['transitioned_at'] as number) - (a['transitioned_at'] as number))
                  .slice(0, (args[1] as number) ?? 20)
            : [],
        })),
      }),
    }),
  };
}

describe('FSMHistoryService (B2-3)', () => {
  let svc: FSMHistoryService;
  let db: ReturnType<typeof makeDB>;

  beforeEach(() => {
    db = makeDB();
    svc = new FSMHistoryService(db as never, 50);
  });

  it('record() inserts a row into the DB', async () => {
    await svc.record({
      profileId: 'p1', slug: 'restaurant', workspaceId: 'ws1',
      tenantId: 't1', fromState: 'seeded', toState: 'claimed', triggeredBy: 'u1',
    });
    expect(db.rows.length).toBe(1);
    expect(db.rows[0]!['from_state']).toBe('seeded');
    expect(db.rows[0]!['to_state']).toBe('claimed');
  });

  it('record() stores guardName when provided', async () => {
    await svc.record({
      profileId: 'p1', slug: 'pharmacy', workspaceId: 'ws1',
      tenantId: 't1', fromState: 'claimed', toState: 'active',
      triggeredBy: 'u2', guardName: 'requireNafdacLicence',
    });
    expect(db.rows[0]!['guard_name']).toBe('requireNafdacLicence');
  });

  it('record() stores metadata as JSON string', async () => {
    await svc.record({
      profileId: 'p2', slug: 'hotel', workspaceId: 'ws2',
      tenantId: 't2', fromState: 'active', toState: 'suspended',
      triggeredBy: 'admin', metadata: { reason: 'policy_violation', ticket: 'T-100' },
    });
    const meta = JSON.parse(db.rows[0]!['metadata'] as string) as Record<string, unknown>;
    expect(meta['reason']).toBe('policy_violation');
  });

  it('getHistory() returns rows newest first', async () => {
    // Seed rows
    db.rows.push(
      { id: '1', profile_id: 'p1', slug: 'restaurant', workspace_id: 'ws1', tenant_id: 't1', from_state: 'seeded', to_state: 'claimed', triggered_by: 'u1', guard_name: null, transitioned_at: 1000, metadata: null },
      { id: '2', profile_id: 'p1', slug: 'restaurant', workspace_id: 'ws1', tenant_id: 't1', from_state: 'claimed', to_state: 'active',  triggered_by: 'u1', guard_name: null, transitioned_at: 2000, metadata: null },
    );
    const history = await svc.getHistory('p1', 10);
    expect(history.length).toBe(2);
    // Most recent first (transitioned_at desc)
    expect(history[0]!.toState).toBe('active');
  });

  it('getHistory() maps snake_case columns to camelCase', async () => {
    db.rows.push({
      id: 'r1', profile_id: 'pX', slug: 'farm', workspace_id: 'wsX', tenant_id: 'tX',
      from_state: 'seeded', to_state: 'claimed', triggered_by: 'system',
      guard_name: null, transitioned_at: 9999, metadata: null,
    });
    const [entry] = await svc.getHistory('pX', 1);
    expect(entry!.profileId).toBe('pX');
    expect(entry!.fromState).toBe('seeded');
    expect(entry!.toState).toBe('claimed');
    expect(entry!.triggeredBy).toBe('system');
    expect(entry!.transitionedAt).toBe(9999);
  });
});

// ── B2-2: emitFSMTransitionEvent tests ────────────────────────────────────────
describe('emitFSMTransitionEvent (B2-2)', () => {
  it('calls emitter.emit with correct event name', async () => {
    const emitter: FSMEventEmitter = { emit: vi.fn().mockResolvedValue(undefined) };
    await emitFSMTransitionEvent(emitter, {
      slug: 'restaurant', profileId: 'p1', workspaceId: 'ws1',
      tenantId: 't1', fromState: 'seeded', toState: 'claimed', triggeredBy: 'u1',
    });
    expect(emitter.emit).toHaveBeenCalledWith(
      'vertical.state.transitioned',
      expect.objectContaining({ slug: 'restaurant', fromState: 'seeded', toState: 'claimed' }),
    );
  });

  it('is a no-op when emitter is undefined', async () => {
    // Should not throw
    await expect(
      emitFSMTransitionEvent(undefined, {
        slug: 'restaurant', profileId: 'p1', workspaceId: 'ws1',
        tenantId: 't1', fromState: 'seeded', toState: 'claimed', triggeredBy: 'u1',
      }),
    ).resolves.toBeUndefined();
  });

  it('does not throw when emitter.emit throws', async () => {
    const emitter: FSMEventEmitter = {
      emit: vi.fn().mockRejectedValue(new Error('Bus down')),
    };
    await expect(
      emitFSMTransitionEvent(emitter, {
        slug: 'restaurant', profileId: 'p1', workspaceId: 'ws1',
        tenantId: 't1', fromState: 'seeded', toState: 'claimed', triggeredBy: 'u1',
      }),
    ).resolves.toBeUndefined();
  });

  it('includes transitionedAt ISO timestamp in payload', async () => {
    const emitter: FSMEventEmitter = { emit: vi.fn().mockResolvedValue(undefined) };
    const before = Date.now();
    await emitFSMTransitionEvent(emitter, {
      slug: 'restaurant', profileId: 'p1', workspaceId: 'ws1',
      tenantId: 't1', fromState: 'seeded', toState: 'claimed', triggeredBy: 'u1',
    });
    const payload = (emitter.emit as ReturnType<typeof vi.fn>).mock.calls[0]![1] as { transitionedAt: string };
    expect(new Date(payload.transitionedAt).getTime()).toBeGreaterThanOrEqual(before);
  });
});

// ── B2-1: FSMEngine.validateConfig tests ──────────────────────────────────────
describe('FSMEngine.validateConfig (B2-1)', () => {
  it('passes valid config', () => {
    const result = FSMEngine.validateConfig({
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [{ from: 'seeded', to: 'claimed' }, { from: 'claimed', to: 'active' }],
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('fails when initialState not in states', () => {
    const result = FSMEngine.validateConfig({
      states: ['claimed', 'active'],
      initialState: 'seeded',
      transitions: [{ from: 'claimed', to: 'active' }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('initialState'))).toBe(true);
  });

  it('fails on orphan transition from state', () => {
    const result = FSMEngine.validateConfig({
      states: ['seeded', 'active'],
      initialState: 'seeded',
      transitions: [{ from: 'ghost', to: 'active' }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('ghost'))).toBe(true);
  });

  it('fails on orphan transition to state', () => {
    const result = FSMEngine.validateConfig({
      states: ['seeded', 'active'],
      initialState: 'seeded',
      transitions: [{ from: 'seeded', to: 'nowhere' }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('nowhere'))).toBe(true);
  });

  it('fails on undefined guard reference', () => {
    const result = FSMEngine.validateConfig({
      states: ['seeded', 'active'],
      initialState: 'seeded',
      transitions: [{ from: 'seeded', to: 'active', guard: 'missingGuard' }],
      guards: [],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('missingGuard'))).toBe(true);
  });

  it('flags unreachable states', () => {
    const result = FSMEngine.validateConfig({
      states: ['seeded', 'active', 'orphan'],
      initialState: 'seeded',
      transitions: [{ from: 'seeded', to: 'active' }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('orphan'))).toBe(true);
  });

  it('assertValidConfig throws on invalid config', () => {
    expect(() => FSMEngine.assertValidConfig({
      states: ['a'],
      initialState: 'missing',
      transitions: [],
    }, 'test-vertical')).toThrow('invalid');
  });

  it('assertValidConfig does not throw on valid config', () => {
    expect(() => FSMEngine.assertValidConfig({
      states: ['seeded', 'active'],
      initialState: 'seeded',
      transitions: [{ from: 'seeded', to: 'active' }],
    }, 'test-vertical')).not.toThrow();
  });
});
