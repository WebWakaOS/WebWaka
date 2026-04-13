/**
 * CRUD for CommunitySpace.
 * (Platform Invariant T3 — every query includes tenant_id predicate)
 */

import type { CommunitySpace, MembershipTier } from './types.js';

interface D1BoundStmt {
  first<T>(): Promise<T | null>;
  run(): Promise<{ success: boolean }>;
  all<T>(): Promise<{ results: T[] }>;
}

export interface D1Like {
  prepare(sql: string): { bind(...values: unknown[]): D1BoundStmt };
}

interface KVLike {
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}

interface CommunitySpaceRow {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: string;
  tenant_id: string;
  created_at: number;
  updated_at: number;
}

function rowToSpace(row: CommunitySpaceRow): CommunitySpace {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    visibility: row.visibility as CommunitySpace['visibility'],
    tenantId: row.tenant_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

/**
 * Create a new community space.
 */
export async function createCommunitySpace(
  db: D1Like,
  kv: KVLike,
  input: {
    workspaceId: string;
    name: string;
    slug: string;
    visibility: string;
    description?: string;
    tenantId: string;
  },
): Promise<CommunitySpace> {
  const id = generateId('csp');
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `INSERT INTO community_spaces (id, workspace_id, name, slug, description, visibility, tenant_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, input.workspaceId, input.name, input.slug, input.description ?? null, input.visibility, input.tenantId, now, now)
    .run();

  const space: CommunitySpace = {
    id,
    workspaceId: input.workspaceId,
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    visibility: input.visibility as CommunitySpace['visibility'],
    tenantId: input.tenantId,
    createdAt: now,
    updatedAt: now,
  };

  // Cache in KV (T3 — key prefixed with tenant)
  await kv.put(`tenant:${input.tenantId}:community:${id}`, JSON.stringify(space), { expirationTtl: 3600 });
  return space;
}

/**
 * Get a community space by slug or ID.
 * (T3 — tenant_id predicate enforced)
 */
export async function getCommunitySpace(
  db: D1Like,
  slugOrId: string,
  tenantId: string,
): Promise<CommunitySpace | null> {
  const row = await db
    .prepare(
      `SELECT * FROM community_spaces WHERE (slug = ? OR id = ?) AND tenant_id = ? LIMIT 1`,
    )
    .bind(slugOrId, slugOrId, tenantId)
    .first<CommunitySpaceRow>();
  return row ? rowToSpace(row) : null;
}

/**
 * List community spaces for a workspace.
 */
export async function listCommunitySpaces(
  db: D1Like,
  workspaceId: string,
  tenantId: string,
): Promise<CommunitySpace[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM community_spaces WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`,
    )
    .bind(workspaceId, tenantId)
    .all<CommunitySpaceRow>();
  return results.map(rowToSpace);
}

/**
 * List membership tiers for a community.
 */
export async function listMembershipTiers(
  db: D1Like,
  communityId: string,
  tenantId: string,
): Promise<MembershipTier[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM membership_tiers WHERE community_id = ? AND tenant_id = ? ORDER BY price_kobo ASC`,
    )
    .bind(communityId, tenantId)
    .all<{
      id: string;
      community_id: string;
      name: string;
      price_kobo: number;
      billing_cycle: string;
      kyc_tier_min: number;
      access_channels: string;
      access_courses: string;
      is_default: number;
      tenant_id: string;
      created_at: number;
    }>();

  return results.map((r) => ({
    id: r.id,
    communityId: r.community_id,
    name: r.name,
    priceKobo: r.price_kobo,
    billingCycle: r.billing_cycle as MembershipTier['billingCycle'],
    kycTierMin: r.kyc_tier_min as MembershipTier['kycTierMin'],
    accessChannels: JSON.parse(r.access_channels) as string[],
    accessCourses: JSON.parse(r.access_courses) as string[],
    isDefault: r.is_default === 1,
    tenantId: r.tenant_id,
    createdAt: r.created_at,
  }));
}

/**
 * Create a membership tier.
 * (T4 — priceKobo must be a non-negative integer)
 */
export async function createMembershipTier(
  db: D1Like,
  input: {
    communityId: string;
    name: string;
    priceKobo: number;
    billingCycle: 'monthly' | 'annual' | 'one_time';
    kycTierMin?: 0 | 1 | 2 | 3;
    isDefault?: boolean;
    tenantId: string;
  },
): Promise<MembershipTier> {
  if (!Number.isInteger(input.priceKobo) || input.priceKobo < 0) {
    throw new TypeError('priceKobo must be a non-negative integer (kobo)');
  }
  const id = generateId('tier');
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `INSERT INTO membership_tiers (id, community_id, name, price_kobo, billing_cycle, kyc_tier_min, is_default, access_channels, access_courses, tenant_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, '[]', '[]', ?, ?)`,
    )
    .bind(id, input.communityId, input.name, input.priceKobo, input.billingCycle, input.kycTierMin ?? 0, input.isDefault ? 1 : 0, input.tenantId, now)
    .run();

  return {
    id,
    communityId: input.communityId,
    name: input.name,
    priceKobo: input.priceKobo,
    billingCycle: input.billingCycle,
    kycTierMin: (input.kycTierMin ?? 0) as MembershipTier['kycTierMin'],
    accessChannels: [],
    accessCourses: [],
    isDefault: input.isDefault ?? false,
    tenantId: input.tenantId,
    createdAt: now,
  };
}
