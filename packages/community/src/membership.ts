/**
 * Community membership management.
 *
 * Enforces:
 *   P10 — NDPR consent record must exist before joining
 *   T3  — every query includes tenant_id
 *   T5  — entitlement guard via @webwaka/entitlements
 */

import type { CommunityMembership } from './types.js';
import type { D1Like } from './community-space.js';

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
}

interface ConsentRow {
  id: string;
}

interface MembershipRow {
  id: string;
  community_id: string;
  user_id: string;
  tier_id: string;
  role: string;
  kyc_tier: number;
  status: string;
  joined_at: number;
  expires_at: number | null;
  tenant_id: string;
}

function rowToMembership(row: MembershipRow): CommunityMembership {
  return {
    id: row.id,
    communityId: row.community_id,
    userId: row.user_id,
    tierId: row.tier_id,
    role: row.role as CommunityMembership['role'],
    kycTier: row.kyc_tier,
    status: row.status as CommunityMembership['status'],
    joinedAt: row.joined_at,
    expiresAt: row.expires_at,
    tenantId: row.tenant_id,
  };
}

/**
 * Join a community.
 *
 * Steps:
 *   1. Verify NDPR consent record exists (P10)
 *   2. Enforce KYC tier minimum for the requested tier
 *   3. Insert membership row
 */
export async function joinCommunity(
  db: D1Like,
  input: {
    communityId: string;
    userId: string;
    tierId: string;
    kycTier: number;
    tenantId: string;
  },
): Promise<CommunityMembership> {
  // P10 — verify NDPR consent exists
  const consent = await db
    .prepare(
      `SELECT id FROM consent_records WHERE user_id = ? AND tenant_id = ? AND status = 'granted' LIMIT 1`,
    )
    .bind(input.userId, input.tenantId)
    .first<ConsentRow>();

  if (!consent) {
    throw new Error('NDPR_CONSENT_REQUIRED: User has not granted NDPR consent for this tenant (P10)');
  }

  // Verify KYC tier minimum
  const tier = await db
    .prepare(`SELECT kyc_tier_min FROM membership_tiers WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(input.tierId, input.tenantId)
    .first<{ kyc_tier_min: number }>();

  if (!tier) {
    throw new Error(`Membership tier not found: ${input.tierId}`);
  }

  if (input.kycTier < tier.kyc_tier_min) {
    throw new Error(
      `KYC_TIER_INSUFFICIENT: Tier requires KYC level ${tier.kyc_tier_min}, user has ${input.kycTier}`,
    );
  }

  const id = generateId('mbr');
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT INTO community_memberships (id, community_id, user_id, tier_id, role, kyc_tier, status, joined_at, tenant_id)
       VALUES (?, ?, ?, ?, 'member', ?, 'active', ?, ?)`,
    )
    .bind(id, input.communityId, input.userId, input.tierId, input.kycTier, now, input.tenantId)
    .run();

  return {
    id,
    communityId: input.communityId,
    userId: input.userId,
    tierId: input.tierId,
    role: 'member',
    kycTier: input.kycTier,
    status: 'active',
    joinedAt: now,
    expiresAt: null,
    tenantId: input.tenantId,
  };
}

/**
 * Leave a community — sets status to 'expired'.
 */
export async function leaveCommunity(
  db: D1Like,
  communityId: string,
  userId: string,
  tenantId: string,
): Promise<void> {
  await db
    .prepare(
      `UPDATE community_memberships SET status = 'expired' WHERE community_id = ? AND user_id = ? AND tenant_id = ?`,
    )
    .bind(communityId, userId, tenantId)
    .run();
}

/**
 * Upgrade a member's tier.
 */
export async function upgradeMemberTier(
  db: D1Like,
  communityId: string,
  userId: string,
  newTierId: string,
  tenantId: string,
): Promise<void> {
  await db
    .prepare(
      `UPDATE community_memberships SET tier_id = ? WHERE community_id = ? AND user_id = ? AND tenant_id = ?`,
    )
    .bind(newTierId, communityId, userId, tenantId)
    .run();
}

/**
 * Get membership for a user in a community.
 */
export async function getMembership(
  db: D1Like,
  communityId: string,
  userId: string,
  tenantId: string,
): Promise<CommunityMembership | null> {
  const row = await db
    .prepare(
      `SELECT * FROM community_memberships WHERE community_id = ? AND user_id = ? AND tenant_id = ? LIMIT 1`,
    )
    .bind(communityId, userId, tenantId)
    .first<MembershipRow>();
  return row ? rowToMembership(row) : null;
}

/**
 * List memberships for a user (all communities they belong to).
 */
export async function getUserMemberships(
  db: D1Like,
  userId: string,
  tenantId: string,
): Promise<CommunityMembership[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM community_memberships WHERE user_id = ? AND tenant_id = ? AND status = 'active'`,
    )
    .bind(userId, tenantId)
    .all<MembershipRow>();
  return results.map(rowToMembership);
}
