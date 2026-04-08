/**
 * Social group management.
 * (Platform Invariant T3 — tenant isolation, T5 — subscription gated)
 */

import type { SocialGroup, SocialGroupMember } from './types.js';
import type { D1Like } from './social-profile.js';

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
}

interface GroupRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: string;
  member_count: number;
  tenant_id: string;
  created_at: number;
}

interface MemberRow {
  id: string;
  group_id: string;
  member_id: string;
  role: string;
  joined_at: number;
  tenant_id: string;
}

function rowToGroup(row: GroupRow): SocialGroup {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    visibility: row.visibility as SocialGroup['visibility'],
    memberCount: row.member_count,
    tenantId: row.tenant_id,
    createdAt: row.created_at,
  };
}

function rowToMember(row: MemberRow): SocialGroupMember {
  return {
    id: row.id,
    groupId: row.group_id,
    memberId: row.member_id,
    role: row.role as SocialGroupMember['role'],
    joinedAt: row.joined_at,
    tenantId: row.tenant_id,
  };
}

/**
 * Create a social group.
 */
export async function createGroup(
  db: D1Like,
  input: {
    ownerId: string;
    name: string;
    slug: string;
    description?: string;
    visibility?: 'public' | 'private' | 'secret';
    tenantId: string;
  },
): Promise<SocialGroup> {
  const id = generateId('grp');
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT INTO social_groups (id, owner_id, name, slug, description, visibility, member_count, tenant_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    )
    .bind(id, input.ownerId, input.name, input.slug, input.description ?? null, input.visibility ?? 'public', input.tenantId, now)
    .run();

  // Add owner as member
  const memberId = generateId('gm');
  await db
    .prepare(
      `INSERT INTO social_group_members (id, group_id, member_id, role, joined_at, tenant_id)
       VALUES (?, ?, ?, 'owner', ?, ?)`,
    )
    .bind(memberId, id, input.ownerId, now, input.tenantId)
    .run();

  return {
    id,
    ownerId: input.ownerId,
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    visibility: input.visibility ?? 'public',
    memberCount: 1,
    tenantId: input.tenantId,
    createdAt: now,
  };
}

/**
 * Get a group by slug or ID.
 */
export async function getGroup(
  db: D1Like,
  slugOrId: string,
  tenantId: string,
): Promise<SocialGroup | null> {
  const row = await db
    .prepare(`SELECT * FROM social_groups WHERE (slug = ? OR id = ?) AND tenant_id = ? LIMIT 1`)
    .bind(slugOrId, slugOrId, tenantId)
    .first<GroupRow>();
  return row ? rowToGroup(row) : null;
}

/**
 * Join a group.
 */
export async function joinGroup(
  db: D1Like,
  input: {
    groupId: string;
    memberId: string;
    tenantId: string;
  },
): Promise<SocialGroupMember> {
  const group = await db
    .prepare(`SELECT visibility FROM social_groups WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(input.groupId, input.tenantId)
    .first<{ visibility: string }>();

  if (!group) throw new Error(`Group not found: ${input.groupId}`);
  if (group.visibility === 'secret') throw new Error('INVITE_ONLY: Secret groups require an invitation');

  const id = generateId('gm');
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT OR IGNORE INTO social_group_members (id, group_id, member_id, role, joined_at, tenant_id)
       VALUES (?, ?, ?, 'member', ?, ?)`,
    )
    .bind(id, input.groupId, input.memberId, now, input.tenantId)
    .run();

  await db
    .prepare(`UPDATE social_groups SET member_count = member_count + 1 WHERE id = ? AND tenant_id = ?`)
    .bind(input.groupId, input.tenantId)
    .run();

  return {
    id,
    groupId: input.groupId,
    memberId: input.memberId,
    role: 'member',
    joinedAt: now,
    tenantId: input.tenantId,
  };
}

/**
 * List groups visible to the public within a tenant.
 */
export async function listPublicGroups(
  db: D1Like,
  tenantId: string,
  limit = 20,
  offset = 0,
): Promise<SocialGroup[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM social_groups WHERE tenant_id = ? AND visibility = 'public' ORDER BY member_count DESC LIMIT ? OFFSET ?`,
    )
    .bind(tenantId, limit, offset)
    .all<GroupRow>();
  return results.map(rowToGroup);
}

/**
 * List members of a group.
 */
export async function listGroupMembers(
  db: D1Like,
  groupId: string,
  tenantId: string,
  limit = 50,
): Promise<SocialGroupMember[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM social_group_members WHERE group_id = ? AND tenant_id = ? ORDER BY joined_at ASC LIMIT ?`,
    )
    .bind(groupId, tenantId, limit)
    .all<MemberRow>();
  return results.map(rowToMember);
}
