/**
 * TypeScript structural correctness tests for @webwaka/offline-sync.
 * Uses `satisfies` to verify interface shapes compile correctly.
 *
 * Milestone 3: type-only — no runtime logic to exercise yet.
 */

import { describe, it, expect } from 'vitest';
import type {
  SyncQueueItem,
  SyncStatus,
  ConflictResolution,
  SyncAdapter,
} from './types.js';

describe('@webwaka/offline-sync — type contract correctness', () => {
  it('SyncStatus accepts all valid values', () => {
    const statuses: SyncStatus[] = ['pending', 'syncing', 'synced', 'conflict', 'failed'];
    expect(statuses).toHaveLength(5);
  });

  it('SyncQueueItem shape is structurally correct', () => {
    const item: SyncQueueItem = {
      id: 'sq_001',
      entityType: 'individual',
      entityId: 'ind_abc123',
      operation: 'create',
      payload: { name: 'Test' },
      attemptCount: 0,
      status: 'pending',
      createdAt: Date.now(),
      lastAttemptAt: null,
      error: null,
    };
    expect(item.status).toBe('pending');
    expect(item.lastAttemptAt).toBeNull();
  });

  it('ConflictResolution accepts all strategies', () => {
    const resolutions: ConflictResolution[] = [
      { strategy: 'client-wins', resolvedAt: Date.now() },
      { strategy: 'server-wins', resolvedAt: Date.now() },
      { strategy: 'last-write-wins', resolvedAt: Date.now() },
      { strategy: 'manual', resolvedAt: Date.now(), resolvedBy: 'admin' },
    ];
    expect(resolutions).toHaveLength(4);
  });

  it('SyncAdapter interface shape compiles (mock implementation)', () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const mockAdapter = {
      enqueue: (): Promise<string> => Promise.resolve('sq_001'),
      dequeue: (): Promise<SyncQueueItem[]> => Promise.resolve([]),
      updateStatus: (): Promise<void> => Promise.resolve(),
      resolveConflict: (): Promise<void> => Promise.resolve(),
    } satisfies SyncAdapter;

    expect(typeof mockAdapter.enqueue).toBe('function');
    expect(typeof mockAdapter.dequeue).toBe('function');
  });
});

