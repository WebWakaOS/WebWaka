/**
 * @webwaka/profiles — D1-backed profile repository.
 *
 * Uses duck-typed D1Like interface (same pattern as packages/events/src/publisher.ts)
 * to avoid @cloudflare/workers-types dependency. Vendor-neutral by design (P1).
 *
 * All functions are scoped by tenant_id (Platform Invariant T3).
 *
 * Schema note: only confirmed migration columns are used here.
 * See packages/profiles/src/types.ts for schema drift documentation.
 */

import type {
  ProfileRow,
  PublicProfileSummary,
  ProfileListResult,
  ProfileClaimState,
  ProfileVisibility,
} from './types.js';

// ---------------------------------------------------------------------------
// D1Like — duck-typed D1 binding interface for zero vendor lock-in
// ---------------------------------------------------------------------------

export interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SELECT_SUMMARY_COLUMNS = `
  id, subject_type, subject_id, display_name, claim_state,
  verification_state, visibility, primary_place_id,
  tenant_id, workspace_id, vertical_slug, created_at, updated_at
`.trim();

// ---------------------------------------------------------------------------
// Query functions
// ---------------------------------------------------------------------------

/**
 * List profiles belonging to a workspace, scoped by tenant_id (T3).
 * Results are paginated via cursor (id > cursor).
 */
export async function getProfilesByWorkspace(
  db: D1Like,
  params: {
    tenantId: string;
    workspaceId: string;
    cursor?: string;
    limit?: number;
  },
): Promise<ProfileListResult> {
  const limit = Math.min(params.limit ?? 50, 100);

  const rows = await db
    .prepare(
      `SELECT ${SELECT_SUMMARY_COLUMNS}
       FROM profiles
       WHERE tenant_id = ? AND workspace_id = ?
       ${params.cursor ? 'AND id > ?' : ''}
       ORDER BY id ASC
       LIMIT ?`,
    )
    .bind(
      ...(params.cursor
        ? [params.tenantId, params.workspaceId, params.cursor, limit]
        : [params.tenantId, params.workspaceId, limit]),
    )
    .all<PublicProfileSummary>();

  return {
    profiles: rows.results,
    total: rows.results.length,
    nextCursor:
      rows.results.length === limit
        ? (rows.results.at(-1)?.id ?? null)
        : null,
  };
}

/**
 * Get a single profile by id, scoped by tenant_id (T3).
 * Returns null if not found or not in the specified tenant.
 */
export async function getProfileById(
  db: D1Like,
  params: { tenantId: string; profileId: string },
): Promise<PublicProfileSummary | null> {
  return db
    .prepare(
      `SELECT ${SELECT_SUMMARY_COLUMNS}
       FROM profiles
       WHERE id = ? AND tenant_id = ?
       LIMIT 1`,
    )
    .bind(params.profileId, params.tenantId)
    .first<PublicProfileSummary>();
}

/**
 * List publicly visible profiles for a tenant (visibility IN public/semi).
 * Used by public discovery surfaces.
 */
export async function getPublicProfilesByTenant(
  db: D1Like,
  params: {
    tenantId: string;
    searchTerm?: string;
    limit?: number;
    offset?: number;
  },
): Promise<PublicProfileSummary[]> {
  const limit = Math.min(params.limit ?? 20, 50);
  const offset = params.offset ?? 0;

  if (params.searchTerm) {
    const rows = await db
      .prepare(
        `SELECT ${SELECT_SUMMARY_COLUMNS}
         FROM profiles
         WHERE tenant_id = ? AND visibility IN ('public','semi')
           AND display_name LIKE ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
      )
      .bind(params.tenantId, `%${params.searchTerm}%`, limit, offset)
      .all<PublicProfileSummary>();
    return rows.results;
  }

  const rows = await db
    .prepare(
      `SELECT ${SELECT_SUMMARY_COLUMNS}
       FROM profiles
       WHERE tenant_id = ? AND visibility IN ('public','semi')
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(params.tenantId, limit, offset)
    .all<PublicProfileSummary>();
  return rows.results;
}

/**
 * Get a single public profile by id (not private), scoped by tenant_id (T3).
 */
export async function getPublicProfileById(
  db: D1Like,
  params: { tenantId: string; profileId: string },
): Promise<PublicProfileSummary | null> {
  return db
    .prepare(
      `SELECT ${SELECT_SUMMARY_COLUMNS}
       FROM profiles
       WHERE id = ? AND tenant_id = ? AND visibility != 'private'
       LIMIT 1`,
    )
    .bind(params.profileId, params.tenantId)
    .first<PublicProfileSummary>();
}

/**
 * Full profile row by id (all confirmed columns).
 * For internal admin and management routes only.
 */
export async function getFullProfileById(
  db: D1Like,
  params: { tenantId: string; profileId: string },
): Promise<ProfileRow | null> {
  return db
    .prepare(
      `SELECT id, subject_type, subject_id, claim_state,
              verification_state, publication_state, primary_place_id,
              kyc_tier, bvn_verified_at, nin_verified_at,
              tenant_id, workspace_id, vertical_slug, display_name, visibility,
              created_at, updated_at
       FROM profiles
       WHERE id = ? AND tenant_id = ?
       LIMIT 1`,
    )
    .bind(params.profileId, params.tenantId)
    .first<ProfileRow>();
}

/**
 * Update profile visibility. Also updates search_entries.visibility (T3-sync).
 * Returns true if a row was updated, false if the profile was not found.
 */
export async function updateProfileVisibility(
  db: D1Like,
  params: {
    tenantId: string;
    profileId: string;
    visibility: ProfileVisibility;
  },
): Promise<{ updated: boolean; previousVisibility: string | null }> {
  const existing = await db
    .prepare(
      `SELECT id, visibility FROM profiles
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(params.profileId, params.tenantId)
    .first<{ id: string; visibility: string }>();

  if (!existing) return { updated: false, previousVisibility: null };

  if (existing.visibility === params.visibility) {
    return { updated: true, previousVisibility: existing.visibility };
  }

  await db
    .prepare(
      `UPDATE profiles SET visibility = ?, updated_at = unixepoch()
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(params.visibility, params.profileId, params.tenantId)
    .run();

  await db
    .prepare(
      `UPDATE search_entries SET visibility = ?, updated_at = unixepoch()
       WHERE profile_id = ?`,
    )
    .bind(params.visibility, params.profileId)
    .run();

  return { updated: true, previousVisibility: existing.visibility };
}

/**
 * Update profile claim_state.
 * Returns the updated state or null if not found.
 */
export async function updateProfileClaimState(
  db: D1Like,
  params: {
    tenantId: string;
    profileId: string;
    workspaceId: string;
    targetState: ProfileClaimState;
    fromState: ProfileClaimState;
  },
): Promise<{ updated: boolean; previousState: string | null }> {
  const existing = await db
    .prepare(
      `SELECT id, claim_state FROM profiles
       WHERE id = ? AND tenant_id = ? AND workspace_id = ?`,
    )
    .bind(params.profileId, params.tenantId, params.workspaceId)
    .first<{ id: string; claim_state: string }>();

  if (!existing) return { updated: false, previousState: null };

  if (existing.claim_state !== params.fromState) {
    return { updated: false, previousState: existing.claim_state };
  }

  const result = await db
    .prepare(
      `UPDATE profiles SET claim_state = ?, updated_at = unixepoch()
       WHERE id = ? AND tenant_id = ? AND claim_state = ?`,
    )
    .bind(params.targetState, params.profileId, params.tenantId, params.fromState)
    .run();

  const changed = result.meta?.changes ?? 1;
  return {
    updated: changed > 0,
    previousState: existing.claim_state,
  };
}
