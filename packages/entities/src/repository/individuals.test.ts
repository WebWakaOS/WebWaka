/**
 * Tests for the individuals repository with in-memory D1 mock.
 *
 * The mock reflects the *actual* D1 schema:
 *   id, first_name, last_name, display_name, tenant_id,
 *   created_at, updated_at
 *
 * No place_id, no metadata, no entity_type columns.
 */

import { describe, it, expect, vi } from 'vitest';
import type { TenantId, IndividualId } from '@webwaka/types';
import { createIndividual, getIndividualById, listIndividualsByTenant, updateIndividual } from './individuals.js';

const TENANT_ID = 'tenant_test_001' as TenantId;

// ---------------------------------------------------------------------------
// In-memory D1 mock
// ---------------------------------------------------------------------------

interface D1Stmt {
  bind(...args: unknown[]): D1Stmt;
  run(): Promise<unknown>;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
}

function makeMockDb() {
  // Stored rows mirror the actual D1 schema columns used by SELECT_COLS:
  // id, display_name AS name, tenant_id, created_at, updated_at
  const store: Record<string, unknown>[] = [];

  return {
    _store: store,
    prepare: (sql: string): D1Stmt => {
      let boundArgs: unknown[] = [];
      const stmt: D1Stmt = {
        bind: (...args: unknown[]) => { boundArgs = args; return stmt; },
        run: vi.fn(() => {
          if (sql.includes('INSERT INTO individuals')) {
            // Actual INSERT: .bind(id, firstName, lastName, displayName, tenantId)
            const [id, , , displayName, tenantId] = boundArgs;
            store.push({
              id,
              name: displayName,           // SELECT_COLS aliases display_name AS name
              tenant_id: tenantId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
          if (sql.includes('UPDATE individuals')) {
            const id = boundArgs[boundArgs.length - 2];
            const tenantId = boundArgs[boundArgs.length - 1];
            const idx = store.findIndex((r) => r['id'] === id && r['tenant_id'] === tenantId);
            if (idx !== -1 && boundArgs[0]) {
              (store[idx] as Record<string, unknown>)['name'] = boundArgs[0];
            }
          }
          return Promise.resolve({});
        }),
        first: <T>(): Promise<T | null> => {
          // SELECT ... WHERE id = ? AND tenant_id = ?
          const [id, tenantId] = boundArgs;
          const found = store.find((r) => r['id'] === id && r['tenant_id'] === tenantId) ?? null;
          return Promise.resolve(found as T | null);
        },
        all: <T>(): Promise<{ results: T[] }> => {
          // SELECT ... WHERE tenant_id = ? ... LIMIT ?
          const tenantId = boundArgs[0];
          const limit = boundArgs[boundArgs.length - 1] as number;
          const results = store.filter((r) => r['tenant_id'] === tenantId).slice(0, limit);
          return Promise.resolve({ results: results as unknown as T[] });
        },
      };
      return stmt;
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('createIndividual', () => {
  it('creates an individual and returns it with correct fields', async () => {
    const db = makeMockDb();
    const result = await createIndividual(db, TENANT_ID, { name: 'Amaka Obi' });

    expect(result.id).toMatch(/^ind_/);
    expect((result as unknown as Record<string, unknown>)['name']).toBe('Amaka Obi');
    expect((result as unknown as Record<string, unknown>)['tenantId']).toBe(TENANT_ID);
  });

  it('accepts optional metadata (not persisted — no column in schema)', async () => {
    const db = makeMockDb();
    // metadata is accepted in the input type for API compat but not stored in D1.
    // The returned Individual will not carry metadata — this is by design.
    const result = await createIndividual(db, TENANT_ID, {
      name: 'Chidi Okeke',
      metadata: { nin: '12345678901' },
    });
    // id and name should still be correct
    expect(result.id).toMatch(/^ind_/);
    expect((result as unknown as Record<string, unknown>)['name']).toBe('Chidi Okeke');
  });
});

describe('getIndividualById', () => {
  it('returns null when not found', async () => {
    const db = makeMockDb();
    const result = await getIndividualById(db, TENANT_ID, 'ind_nonexistent' as IndividualId);
    expect(result).toBeNull();
  });

  it('returns the individual when found', async () => {
    const db = makeMockDb();
    const created = await createIndividual(db, TENANT_ID, { name: 'Fatima Bello' });
    const found = await getIndividualById(db, TENANT_ID, created.id);
    expect(found).not.toBeNull();
  });
});

describe('listIndividualsByTenant', () => {
  it('returns paginated results for a tenant', async () => {
    const db = makeMockDb();
    await createIndividual(db, TENANT_ID, { name: 'Person A' });
    await createIndividual(db, TENANT_ID, { name: 'Person B' });

    const result = await listIndividualsByTenant(db, TENANT_ID, { limit: 10 });
    expect(result.items.length).toBeGreaterThanOrEqual(1);
    expect(result.nextCursor).toBeNull();
  });
});

describe('updateIndividual', () => {
  it('returns null when individual not found', async () => {
    const db = makeMockDb();
    const result = await updateIndividual(db, TENANT_ID, 'ind_ghost' as IndividualId, { name: 'Ghost' });
    expect(result).toBeNull();
  });
});
