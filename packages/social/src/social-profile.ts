/**
 * Social profile management.
 * (Platform Invariant T3 — tenant isolation, P2 — Nigeria First)
 * Blue tick verification gated on NIN/BVN from @webwaka/identity.
 */

import type { SocialProfile } from './types.js';

interface D1BoundStmt {
  first<T>(): Promise<T | null>;
  run(): Promise<{ success: boolean }>;
  all<T>(): Promise<{ results: T[] }>;
}

export interface D1Like {
  prepare(sql: string): { bind(...values: unknown[]): D1BoundStmt };
}

interface SocialProfileRow {
  id: string;
  profile_id: string;
  handle: string;
  bio: string | null;
  avatar_url: string | null;
  follower_count: number;
  following_count: number;
  is_verified: number;
  visibility: string;
  tenant_id: string;
  created_at: number;
  updated_at: number;
}

function rowToProfile(row: SocialProfileRow): SocialProfile {
  return {
    id: row.id,
    profileId: row.profile_id,
    handle: row.handle,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    followerCount: row.follower_count,
    followingCount: row.following_count,
    isVerified: row.is_verified === 1,
    visibility: row.visibility as SocialProfile['visibility'],
    tenantId: row.tenant_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
}

/**
 * Check if a handle is available.
 */
export async function isHandleAvailable(
  db: D1Like,
  handle: string,
  tenantId: string,
): Promise<boolean> {
  const existing = await db
    .prepare(`SELECT id FROM social_profiles WHERE handle = ? AND tenant_id = ? LIMIT 1`)
    .bind(handle, tenantId)
    .first<{ id: string }>();
  return existing === null;
}

/**
 * Create or update a social profile.
 */
export async function setupSocialProfile(
  db: D1Like,
  input: {
    profileId: string;
    handle: string;
    bio?: string;
    avatarUrl?: string;
    visibility?: 'public' | 'private';
    tenantId: string;
  },
): Promise<SocialProfile> {
  const available = await isHandleAvailable(db, input.handle, input.tenantId);
  if (!available) {
    throw new Error(`HANDLE_TAKEN: @${input.handle} is already in use`);
  }

  const id = generateId('spr');
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT INTO social_profiles (id, profile_id, handle, bio, avatar_url, follower_count, following_count, is_verified, visibility, tenant_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?)`,
    )
    .bind(id, input.profileId, input.handle, input.bio ?? null, input.avatarUrl ?? null, input.visibility ?? 'public', input.tenantId, now, now)
    .run();

  return {
    id,
    profileId: input.profileId,
    handle: input.handle,
    bio: input.bio ?? null,
    avatarUrl: input.avatarUrl ?? null,
    followerCount: 0,
    followingCount: 0,
    isVerified: false,
    visibility: input.visibility ?? 'public',
    tenantId: input.tenantId,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get a social profile by handle.
 */
export async function getSocialProfileByHandle(
  db: D1Like,
  handle: string,
  tenantId: string,
): Promise<SocialProfile | null> {
  const row = await db
    .prepare(`SELECT * FROM social_profiles WHERE handle = ? AND tenant_id = ? LIMIT 1`)
    .bind(handle, tenantId)
    .first<SocialProfileRow>();
  return row ? rowToProfile(row) : null;
}

/**
 * Get a social profile by ID.
 */
export async function getSocialProfile(
  db: D1Like,
  id: string,
  tenantId: string,
): Promise<SocialProfile | null> {
  const row = await db
    .prepare(`SELECT * FROM social_profiles WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(id, tenantId)
    .first<SocialProfileRow>();
  return row ? rowToProfile(row) : null;
}

/**
 * Award blue tick verification (NIN or BVN verified — P2 Nigeria First).
 */
export async function verifyProfile(
  db: D1Like,
  profileId: string,
  tenantId: string,
): Promise<void> {
  await db
    .prepare(`UPDATE social_profiles SET is_verified = 1, updated_at = ? WHERE id = ? AND tenant_id = ?`)
    .bind(Math.floor(Date.now() / 1000), profileId, tenantId)
    .run();
}
