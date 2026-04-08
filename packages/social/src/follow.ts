/**
 * Follow graph management — follow, unfollow, block, mutuals.
 * (Platform Invariant T3 — tenant isolation)
 */

import type { SocialFollow, SocialBlock } from './types.js';
import type { D1Like } from './social-profile.js';

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
}

/**
 * Follow a social profile.
 * Private profiles create a 'pending' follow request.
 */
export async function followProfile(
  db: D1Like,
  input: {
    followerId: string;
    followeeId: string;
    tenantId: string;
  },
): Promise<SocialFollow> {
  if (input.followerId === input.followeeId) {
    throw new Error('SELF_FOLLOW: Cannot follow yourself');
  }

  // Check if target is private
  const target = await db
    .prepare(`SELECT visibility FROM social_profiles WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(input.followeeId, input.tenantId)
    .first<{ visibility: string }>();

  if (!target) throw new Error(`Profile not found: ${input.followeeId}`);

  const status = target.visibility === 'private' ? 'pending' : 'active';
  const id = generateId('flw');
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT OR IGNORE INTO social_follows (id, follower_id, followee_id, status, tenant_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, input.followerId, input.followeeId, status, input.tenantId, now)
    .run();

  // Update counters if active follow
  if (status === 'active') {
    await db
      .prepare(`UPDATE social_profiles SET following_count = following_count + 1 WHERE id = ? AND tenant_id = ?`)
      .bind(input.followerId, input.tenantId)
      .run();
    await db
      .prepare(`UPDATE social_profiles SET follower_count = follower_count + 1 WHERE id = ? AND tenant_id = ?`)
      .bind(input.followeeId, input.tenantId)
      .run();
  }

  return { id, followerId: input.followerId, followeeId: input.followeeId, status, tenantId: input.tenantId, createdAt: now };
}

/**
 * Unfollow a social profile.
 */
export async function unfollowProfile(
  db: D1Like,
  followerId: string,
  followeeId: string,
  tenantId: string,
): Promise<void> {
  const existing = await db
    .prepare(`SELECT status FROM social_follows WHERE follower_id = ? AND followee_id = ? AND tenant_id = ? LIMIT 1`)
    .bind(followerId, followeeId, tenantId)
    .first<{ status: string }>();

  if (!existing) return;

  await db
    .prepare(`DELETE FROM social_follows WHERE follower_id = ? AND followee_id = ? AND tenant_id = ?`)
    .bind(followerId, followeeId, tenantId)
    .run();

  if (existing.status === 'active') {
    await db
      .prepare(`UPDATE social_profiles SET following_count = MAX(0, following_count - 1) WHERE id = ? AND tenant_id = ?`)
      .bind(followerId, tenantId)
      .run();
    await db
      .prepare(`UPDATE social_profiles SET follower_count = MAX(0, follower_count - 1) WHERE id = ? AND tenant_id = ?`)
      .bind(followeeId, tenantId)
      .run();
  }
}

/**
 * Block a profile.
 */
export async function blockProfile(
  db: D1Like,
  input: {
    blockerId: string;
    blockedId: string;
    tenantId: string;
  },
): Promise<SocialBlock> {
  const id = generateId('blk');
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(`INSERT OR IGNORE INTO social_blocks (id, blocker_id, blocked_id, tenant_id, created_at) VALUES (?, ?, ?, ?, ?)`)
    .bind(id, input.blockerId, input.blockedId, input.tenantId, now)
    .run();

  // Remove any existing follow in both directions
  await db
    .prepare(`DELETE FROM social_follows WHERE ((follower_id = ? AND followee_id = ?) OR (follower_id = ? AND followee_id = ?)) AND tenant_id = ?`)
    .bind(input.blockerId, input.blockedId, input.blockedId, input.blockerId, input.tenantId)
    .run();

  return { id, blockerId: input.blockerId, blockedId: input.blockedId, tenantId: input.tenantId, createdAt: now };
}

/**
 * Get list of profile IDs that a user follows (active follows only).
 */
export async function getFollowingIds(
  db: D1Like,
  profileId: string,
  tenantId: string,
): Promise<string[]> {
  const { results } = await db
    .prepare(
      `SELECT followee_id FROM social_follows WHERE follower_id = ? AND tenant_id = ? AND status = 'active'`,
    )
    .bind(profileId, tenantId)
    .all<{ followee_id: string }>();
  return results.map((r) => r.followee_id);
}

/**
 * Check if two profiles are mutual followers.
 */
export async function getMutuals(
  db: D1Like,
  profileA: string,
  profileB: string,
  tenantId: string,
): Promise<boolean> {
  const aFollowsB = await db
    .prepare(`SELECT id FROM social_follows WHERE follower_id = ? AND followee_id = ? AND tenant_id = ? AND status = 'active' LIMIT 1`)
    .bind(profileA, profileB, tenantId)
    .first<{ id: string }>();
  if (!aFollowsB) return false;
  const bFollowsA = await db
    .prepare(`SELECT id FROM social_follows WHERE follower_id = ? AND followee_id = ? AND tenant_id = ? AND status = 'active' LIMIT 1`)
    .bind(profileB, profileA, tenantId)
    .first<{ id: string }>();
  return bFollowsA !== null;
}
