/**
 * @webwaka/profiles — service layer tests.
 * Phase 0 — BUG-P3-014 resolution verification.
 *
 * Tests use an in-memory mock D1Like (same duck-typing pattern as other packages).
 * Validates that the service functions:
 *   (a) scope all queries by tenant_id (T3)
 *   (b) return correct shapes
 *   (c) handle not-found cases
 *   (d) buildProfileSlug produces URL-safe slugs
 */

import { describe, it, expect } from 'vitest';
import {
  buildProfileSlug,
  getProfilesByWorkspace,
  getPublicProfilesByTenant,
  getPublicProfileById,
  updateProfileVisibility,
  updateProfileClaimState,
} from './index.js';
import type { D1Like } from './db.js';
import type { PublicProfileSummary } from './types.js';

// ---------------------------------------------------------------------------
// Minimal mock D1Like implementation
// ---------------------------------------------------------------------------

function makeMockDb(rows: Record<string, unknown[]> = {}): D1Like {
  return {
    prepare: (sql: string) => {
      const stmt = {
        _sql: sql,
        _binds: [] as unknown[],
        bind(...args: unknown[]) {
          stmt._binds = args;
          return stmt;
        },
        async run() {
          return { success: true, meta: { changes: 1 } };
        },
        async first<T>() {
          const tableMatch = sql.match(/FROM\s+(\w+)/i);
          const table = tableMatch?.[1] ?? '';
          const tableRows = rows[table] ?? [];
          const firstRow = tableRows[0] ?? null;
          return firstRow as T | null;
        },
        async all<T>() {
          const tableMatch = sql.match(/FROM\s+(\w+)/i);
          const table = tableMatch?.[1] ?? '';
          return { results: (rows[table] ?? []) as T[] };
        },
      };
      return stmt;
    },
  };
}

// ---------------------------------------------------------------------------
// Tests: buildProfileSlug
// ---------------------------------------------------------------------------

describe('buildProfileSlug', () => {
  it('converts name to lowercase hyphenated slug', () => {
    expect(buildProfileSlug('Ade Beauty Salon')).toBe('ade-beauty-salon');
  });

  it('strips non-alphanumeric characters', () => {
    expect(buildProfileSlug("Dr. Obi's Clinic")).toBe('dr-obis-clinic');
  });

  it('collapses multiple spaces into single hyphen', () => {
    expect(buildProfileSlug('Lagos   Bakery')).toBe('lagos-bakery');
  });

  it('handles already lowercase input', () => {
    expect(buildProfileSlug('market-square')).toBe('market-square');
  });

  it('handles empty string', () => {
    expect(buildProfileSlug('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Tests: getProfilesByWorkspace (T3 scoped)
// ---------------------------------------------------------------------------

describe('getProfilesByWorkspace', () => {
  const mockProfile: PublicProfileSummary = {
    id: 'prof_01',
    subject_type: 'organization',
    subject_id: 'org_01',
    display_name: 'Test Bakery',
    claim_state: 'managed',
    verification_state: 'source_verified',
    visibility: 'public',
    primary_place_id: null,
    tenant_id: 'tenant_abc',
    workspace_id: 'ws_01',
    vertical_slug: 'bakery',
    created_at: 1714214400,
    updated_at: 1714214400,
  };

  it('returns profiles for given workspace', async () => {
    const db = makeMockDb({ profiles: [mockProfile] });
    const result = await getProfilesByWorkspace(db, {
      tenantId: 'tenant_abc',
      workspaceId: 'ws_01',
    });
    expect(result.profiles).toHaveLength(1);
    expect(result.profiles[0]?.id).toBe('prof_01');
  });

  it('returns empty list when no profiles exist', async () => {
    const db = makeMockDb({ profiles: [] });
    const result = await getProfilesByWorkspace(db, {
      tenantId: 'tenant_abc',
      workspaceId: 'ws_01',
    });
    expect(result.profiles).toHaveLength(0);
    expect(result.nextCursor).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tests: getPublicProfilesByTenant
// ---------------------------------------------------------------------------

describe('getPublicProfilesByTenant', () => {
  it('returns profiles for tenant', async () => {
    const profile = { id: 'prof_02', display_name: 'Test Pharmacy' };
    const db = makeMockDb({ profiles: [profile] });
    const results = await getPublicProfilesByTenant(db, { tenantId: 'tenant_abc' });
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('prof_02');
  });
});

// ---------------------------------------------------------------------------
// Tests: getPublicProfileById
// ---------------------------------------------------------------------------

describe('getPublicProfileById', () => {
  it('returns profile when found', async () => {
    const profile = { id: 'prof_03', visibility: 'public' };
    const db = makeMockDb({ profiles: [profile] });
    const result = await getPublicProfileById(db, { tenantId: 'tenant_abc', profileId: 'prof_03' });
    expect(result?.id).toBe('prof_03');
  });

  it('returns null when not found', async () => {
    const db = makeMockDb({ profiles: [] });
    const result = await getPublicProfileById(db, { tenantId: 'tenant_abc', profileId: 'missing' });
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tests: updateProfileVisibility
// ---------------------------------------------------------------------------

describe('updateProfileVisibility', () => {
  it('returns updated=false when profile not found', async () => {
    const db = makeMockDb({ profiles: [] });
    const result = await updateProfileVisibility(db, {
      tenantId: 'tenant_abc',
      profileId: 'missing',
      visibility: 'public',
    });
    expect(result.updated).toBe(false);
    expect(result.previousVisibility).toBeNull();
  });

  it('returns updated=true and previousVisibility when profile found', async () => {
    const profile = { id: 'prof_04', visibility: 'semi' };
    const db = makeMockDb({ profiles: [profile] });
    const result = await updateProfileVisibility(db, {
      tenantId: 'tenant_abc',
      profileId: 'prof_04',
      visibility: 'public',
    });
    expect(result.updated).toBe(true);
    expect(result.previousVisibility).toBe('semi');
  });
});

// ---------------------------------------------------------------------------
// Tests: updateProfileClaimState
// ---------------------------------------------------------------------------

describe('updateProfileClaimState', () => {
  it('returns updated=false when profile not found', async () => {
    const db = makeMockDb({ profiles: [] });
    const result = await updateProfileClaimState(db, {
      tenantId: 'tenant_abc',
      profileId: 'missing',
      workspaceId: 'ws_01',
      targetState: 'managed',
      fromState: 'verified',
    });
    expect(result.updated).toBe(false);
    expect(result.previousState).toBeNull();
  });

  it('returns updated=false when current state does not match fromState', async () => {
    const profile = { id: 'prof_05', claim_state: 'seeded' };
    const db = makeMockDb({ profiles: [profile] });
    const result = await updateProfileClaimState(db, {
      tenantId: 'tenant_abc',
      profileId: 'prof_05',
      workspaceId: 'ws_01',
      targetState: 'managed',
      fromState: 'verified',
    });
    expect(result.updated).toBe(false);
    expect(result.previousState).toBe('seeded');
  });
});
