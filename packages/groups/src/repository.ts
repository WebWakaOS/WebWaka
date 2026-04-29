/**
 * @webwaka/groups — D1 repository layer.
 *
 * Phase 0 rename: references new table names (groups_* not support_groups_*)
 * DB table names updated by migration 0432_rename_support_groups_to_groups.sql
 *
 * Platform Invariants:
 *   T3 — every query includes tenant_id predicate
 *   T4 — asset value_kobo is always a non-negative integer
 *   P4 — no electoral-specific fields; those are in group_electoral_extensions
 *   P13 — voter_ref is in groups-electoral package; excluded at this layer
 */

import type {
  Group,
  CreateGroupInput,
  GroupMember,
  JoinGroupInput,
  ExecutiveRole,
  ExecutiveRoleTitle,
  GroupMeeting,
  CreateMeetingInput,
  GroupResolution,
  GroupCommittee,
  CommitteeType,
  GroupBroadcast,
  CreateBroadcastInput,
  GroupEvent,
  CreateEventInput,
  GroupPetition,
  GroupAsset,
  GroupAnalytics,
  GroupPublicProfile,
  GroupCategory,
  GroupVisibility,
  GroupJoinPolicy,
  GroupEventType,
  GroupEventStatus,
} from './types.js';

export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

function now(): number {
  return Math.floor(Date.now() / 1000);
}

// ---------------------------------------------------------------------------
// Row mappers
// ---------------------------------------------------------------------------

interface GroupRow {
  id: string;
  workspace_id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  hierarchy_level: string | null;
  parent_group_id: string | null;
  place_id: string | null;
  state_code: string | null;
  lga_code: string | null;
  ward_code: string | null;
  polling_unit_code: string | null;
  member_count: number;
  volunteer_count: number;
  visibility: string;
  join_policy: string;
  status: string;
  logo_url: string | null;
  cover_url: string | null;
  constitution_url: string | null;
  website_url: string | null;
  ndpr_consent_required: number;
  created_at: number;
  updated_at: number;
}

function rowToGroup(r: GroupRow): Group {
  return {
    id: r.id,
    workspaceId: r.workspace_id,
    tenantId: r.tenant_id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    category: r.category as GroupCategory,
    hierarchyLevel: r.hierarchy_level as Group['hierarchyLevel'],
    parentGroupId: r.parent_group_id,
    placeId: r.place_id,
    stateCode: r.state_code,
    lgaCode: r.lga_code,
    wardCode: r.ward_code,
    pollingUnitCode: r.polling_unit_code,
    memberCount: r.member_count,
    volunteerCount: r.volunteer_count,
    visibility: r.visibility as GroupVisibility,
    joinPolicy: r.join_policy as GroupJoinPolicy,
    status: r.status as Group['status'],
    logoUrl: r.logo_url,
    coverUrl: r.cover_url,
    constitutionUrl: r.constitution_url,
    websiteUrl: r.website_url,
    ndprConsentRequired: r.ndpr_consent_required === 1,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Group CRUD — DB table: groups
// ---------------------------------------------------------------------------

export async function createGroup(
  db: D1Like,
  input: CreateGroupInput,
): Promise<Group> {
  const id = generateId('grp');
  const ts = now();
  await db
    .prepare(
      `INSERT INTO groups (
         id, workspace_id, tenant_id, name, slug, description, category,
         hierarchy_level, parent_group_id, place_id, state_code, lga_code,
         ward_code, polling_unit_code, visibility, join_policy,
         logo_url, cover_url, constitution_url, website_url,
         ndpr_consent_required, created_at, updated_at
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      id,
      input.workspaceId,
      input.tenantId,
      input.name,
      input.slug,
      input.description ?? null,
      input.category ?? 'general',
      input.hierarchyLevel ?? null,
      input.parentGroupId ?? null,
      input.placeId ?? null,
      input.stateCode ?? null,
      input.lgaCode ?? null,
      input.wardCode ?? null,
      input.pollingUnitCode ?? null,
      input.visibility ?? 'public',
      input.joinPolicy ?? 'open',
      input.logoUrl ?? null,
      input.coverUrl ?? null,
      input.constitutionUrl ?? null,
      input.websiteUrl ?? null,
      input.ndprConsentRequired ? 1 : 0,
      ts,
      ts,
    )
    .run();

  return (await getGroup(db, id, input.tenantId))!;
}

export async function getGroup(
  db: D1Like,
  idOrSlug: string,
  tenantId: string,
): Promise<Group | null> {
  const row = await db
    .prepare(
      `SELECT * FROM groups WHERE (id = ? OR slug = ?) AND tenant_id = ? LIMIT 1`,
    )
    .bind(idOrSlug, idOrSlug, tenantId)
    .first<GroupRow>();
  return row ? rowToGroup(row) : null;
}

export async function listGroups(
  db: D1Like,
  opts: {
    workspaceId: string;
    tenantId: string;
    status?: string;
    limit?: number;
    offset?: number;
  },
): Promise<Group[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM groups
       WHERE workspace_id = ? AND tenant_id = ? AND status = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    )
    .bind(opts.workspaceId, opts.tenantId, opts.status ?? 'active', opts.limit ?? 50, opts.offset ?? 0)
    .all<GroupRow>();
  return results.map(rowToGroup);
}

export async function listPublicGroups(
  db: D1Like,
  opts: {
    tenantId: string;
    stateCode?: string;
    lgaCode?: string;
    wardCode?: string;
    category?: string;
    hierarchyLevel?: string;
    limit?: number;
    offset?: number;
  },
): Promise<GroupPublicProfile[]> {
  const parts: string[] = [
    `tenant_id = ?`,
    `visibility = 'public'`,
    `status = 'active'`,
  ];
  const binds: unknown[] = [opts.tenantId];

  if (opts.stateCode)      { parts.push(`state_code = ?`);      binds.push(opts.stateCode); }
  if (opts.lgaCode)        { parts.push(`lga_code = ?`);         binds.push(opts.lgaCode); }
  if (opts.wardCode)       { parts.push(`ward_code = ?`);        binds.push(opts.wardCode); }
  if (opts.category)       { parts.push(`category = ?`);         binds.push(opts.category); }
  if (opts.hierarchyLevel) { parts.push(`hierarchy_level = ?`);  binds.push(opts.hierarchyLevel); }

  binds.push(opts.limit ?? 50, opts.offset ?? 0);

  const { results } = await db
    .prepare(
      `SELECT id, name, slug, description, category, hierarchy_level,
              member_count, volunteer_count, logo_url, cover_url, website_url,
              visibility, join_policy, state_code, lga_code, ward_code, created_at
       FROM groups WHERE ${parts.join(' AND ')}
       ORDER BY member_count DESC LIMIT ? OFFSET ?`,
    )
    .bind(...binds)
    .all<{
      id: string; name: string; slug: string; description: string | null;
      category: string; hierarchy_level: string | null;
      member_count: number; volunteer_count: number;
      logo_url: string | null; cover_url: string | null; website_url: string | null;
      visibility: string; join_policy: string;
      state_code: string | null; lga_code: string | null; ward_code: string | null;
      created_at: number;
    }>();

  return results.map((r) => ({
    id: r.id, name: r.name, slug: r.slug, description: r.description,
    category: r.category as GroupCategory,
    hierarchyLevel: r.hierarchy_level as Group['hierarchyLevel'],
    memberCount: r.member_count, volunteerCount: r.volunteer_count,
    logoUrl: r.logo_url, coverUrl: r.cover_url, websiteUrl: r.website_url,
    visibility: r.visibility as GroupVisibility,
    joinPolicy: r.join_policy as GroupJoinPolicy,
    stateCode: r.state_code, lgaCode: r.lga_code, wardCode: r.ward_code,
    createdAt: r.created_at,
  }));
}

export async function listChildGroups(
  db: D1Like,
  parentGroupId: string,
  tenantId: string,
): Promise<Group[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM groups
       WHERE parent_group_id = ? AND tenant_id = ? AND status = 'active'
       ORDER BY hierarchy_level, name`,
    )
    .bind(parentGroupId, tenantId)
    .all<GroupRow>();
  return results.map(rowToGroup);
}

export async function updateGroup(
  db: D1Like,
  id: string,
  tenantId: string,
  fields: Partial<{
    name: string; description: string; visibility: string; joinPolicy: string;
    status: string; logoUrl: string; coverUrl: string; constitutionUrl: string;
    websiteUrl: string;
  }>,
): Promise<void> {
  const sets: string[] = ['updated_at = ?'];
  const vals: unknown[] = [now()];

  if (fields.name !== undefined)            { sets.push('name = ?');             vals.push(fields.name); }
  if (fields.description !== undefined)     { sets.push('description = ?');      vals.push(fields.description); }
  if (fields.visibility !== undefined)      { sets.push('visibility = ?');       vals.push(fields.visibility); }
  if (fields.joinPolicy !== undefined)      { sets.push('join_policy = ?');      vals.push(fields.joinPolicy); }
  if (fields.status !== undefined)          { sets.push('status = ?');           vals.push(fields.status); }
  if (fields.logoUrl !== undefined)         { sets.push('logo_url = ?');         vals.push(fields.logoUrl); }
  if (fields.coverUrl !== undefined)        { sets.push('cover_url = ?');        vals.push(fields.coverUrl); }
  if (fields.constitutionUrl !== undefined) { sets.push('constitution_url = ?'); vals.push(fields.constitutionUrl); }
  if (fields.websiteUrl !== undefined)      { sets.push('website_url = ?');      vals.push(fields.websiteUrl); }

  vals.push(id, tenantId);
  await db
    .prepare(`UPDATE groups SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`)
    .bind(...vals)
    .run();
}

// ---------------------------------------------------------------------------
// Membership — DB table: group_members
// ---------------------------------------------------------------------------

export async function joinGroup(
  db: D1Like,
  input: JoinGroupInput,
): Promise<GroupMember> {
  const id = generateId('gmbr');
  const ts = now();

  await db
    .prepare(
      `INSERT INTO group_members
         (id, group_id, workspace_id, tenant_id, user_id, role, status,
          ward_code, polling_unit_code, joined_at, ndpr_consented)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      id,
      input.groupId,
      input.workspaceId,
      input.tenantId,
      input.userId,
      input.role ?? 'member',
      'active',
      input.wardCode ?? null,
      input.pollingUnitCode ?? null,
      ts,
      input.ndprConsented ? 1 : 0,
    )
    .run();

  await db
    .prepare(`UPDATE groups SET member_count = member_count + 1, updated_at = ? WHERE id = ? AND tenant_id = ?`)
    .bind(ts, input.groupId, input.tenantId)
    .run();

  return (await getMember(db, id, input.tenantId))!;
}

export async function getMember(
  db: D1Like,
  memberId: string,
  tenantId: string,
): Promise<GroupMember | null> {
  const row = await db
    .prepare(`SELECT * FROM group_members WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(memberId, tenantId)
    .first<{
      id: string; group_id: string; workspace_id: string; tenant_id: string;
      user_id: string; role: string; status: string;
      ward_code: string | null; polling_unit_code: string | null;
      joined_at: number; approved_by: string | null; approved_at: number | null;
      ndpr_consented: number;
    }>();
  if (!row) return null;
  return {
    id: row.id, groupId: row.group_id, workspaceId: row.workspace_id,
    tenantId: row.tenant_id, userId: row.user_id,
    role: row.role as GroupMember['role'],
    status: row.status as GroupMember['status'],
    wardCode: row.ward_code, pollingUnitCode: row.polling_unit_code,
    joinedAt: row.joined_at, approvedBy: row.approved_by, approvedAt: row.approved_at,
    ndprConsented: row.ndpr_consented === 1,
  };
}

export async function listGroupMembers(
  db: D1Like,
  groupId: string,
  tenantId: string,
  opts: { role?: string; status?: string; limit?: number; offset?: number } = {},
): Promise<GroupMember[]> {
  const where = [`group_id = ?`, `tenant_id = ?`];
  const vals: unknown[] = [groupId, tenantId];
  if (opts.role)   { where.push(`role = ?`);   vals.push(opts.role); }
  if (opts.status) { where.push(`status = ?`); vals.push(opts.status ?? 'active'); }
  vals.push(opts.limit ?? 100, opts.offset ?? 0);

  const { results } = await db
    .prepare(
      `SELECT * FROM group_members WHERE ${where.join(' AND ')}
       ORDER BY joined_at ASC LIMIT ? OFFSET ?`,
    )
    .bind(...vals)
    .all<{
      id: string; group_id: string; workspace_id: string; tenant_id: string;
      user_id: string; role: string; status: string;
      ward_code: string | null; polling_unit_code: string | null;
      joined_at: number; approved_by: string | null; approved_at: number | null;
      ndpr_consented: number;
    }>();

  return results.map((r) => ({
    id: r.id, groupId: r.group_id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    userId: r.user_id, role: r.role as GroupMember['role'],
    status: r.status as GroupMember['status'],
    wardCode: r.ward_code, pollingUnitCode: r.polling_unit_code,
    joinedAt: r.joined_at, approvedBy: r.approved_by, approvedAt: r.approved_at,
    ndprConsented: r.ndpr_consented === 1,
  }));
}

export async function approveMember(
  db: D1Like,
  memberId: string,
  approvedBy: string,
  tenantId: string,
): Promise<void> {
  await db
    .prepare(
      `UPDATE group_members SET status = 'active', approved_by = ?, approved_at = ?
       WHERE id = ? AND tenant_id = ? AND status = 'pending'`,
    )
    .bind(approvedBy, now(), memberId, tenantId)
    .run();
}

export async function updateMemberRole(
  db: D1Like,
  memberId: string,
  role: string,
  tenantId: string,
): Promise<void> {
  await db
    .prepare(`UPDATE group_members SET role = ? WHERE id = ? AND tenant_id = ?`)
    .bind(role, memberId, tenantId)
    .run();
}

// ---------------------------------------------------------------------------
// Meetings — DB table: group_meetings
// ---------------------------------------------------------------------------

export async function createMeeting(
  db: D1Like,
  input: CreateMeetingInput,
): Promise<GroupMeeting> {
  const id = generateId('gmt');
  const ts = now();
  await db
    .prepare(
      `INSERT INTO group_meetings
         (id, group_id, workspace_id, tenant_id, title, agenda, meeting_type,
          venue, place_id, starts_at, ends_at, is_virtual, join_url, status, created_by, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'scheduled',?,?)`,
    )
    .bind(
      id, input.groupId, input.workspaceId, input.tenantId,
      input.title, input.agenda ?? null, input.meetingType ?? 'general',
      input.venue ?? null, input.placeId ?? null,
      input.startsAt, input.endsAt ?? null,
      input.isVirtual ? 1 : 0, input.joinUrl ?? null,
      input.createdBy, ts,
    )
    .run();

  const row = await db
    .prepare(`SELECT * FROM group_meetings WHERE id = ? LIMIT 1`)
    .bind(id)
    .first<{
      id: string; group_id: string; workspace_id: string; tenant_id: string;
      title: string; agenda: string | null; meeting_type: string;
      venue: string | null; place_id: string | null;
      starts_at: number; ends_at: number | null;
      is_virtual: number; join_url: string | null;
      status: string; minutes_url: string | null;
      quorum_met: number | null; attendance: number;
      created_by: string; created_at: number;
    }>();

  return {
    id: row!.id, groupId: row!.group_id, workspaceId: row!.workspace_id,
    tenantId: row!.tenant_id, title: row!.title, agenda: row!.agenda,
    meetingType: row!.meeting_type as GroupMeeting['meetingType'],
    venue: row!.venue, placeId: row!.place_id,
    startsAt: row!.starts_at, endsAt: row!.ends_at,
    isVirtual: row!.is_virtual === 1, joinUrl: row!.join_url,
    status: row!.status as GroupMeeting['status'],
    minutesUrl: row!.minutes_url,
    quorumMet: row!.quorum_met === null ? null : row!.quorum_met === 1,
    attendance: row!.attendance,
    createdBy: row!.created_by, createdAt: row!.created_at,
  };
}

export async function listMeetings(
  db: D1Like,
  groupId: string,
  tenantId: string,
  opts: { status?: string; limit?: number; offset?: number } = {},
): Promise<GroupMeeting[]> {
  const where = [`group_id = ?`, `tenant_id = ?`];
  const vals: unknown[] = [groupId, tenantId];
  if (opts.status) { where.push(`status = ?`); vals.push(opts.status); }
  vals.push(opts.limit ?? 20, opts.offset ?? 0);

  const { results } = await db
    .prepare(
      `SELECT * FROM group_meetings WHERE ${where.join(' AND ')}
       ORDER BY starts_at DESC LIMIT ? OFFSET ?`,
    )
    .bind(...vals)
    .all<{
      id: string; group_id: string; workspace_id: string; tenant_id: string;
      title: string; agenda: string | null; meeting_type: string;
      venue: string | null; place_id: string | null;
      starts_at: number; ends_at: number | null;
      is_virtual: number; join_url: string | null;
      status: string; minutes_url: string | null;
      quorum_met: number | null; attendance: number;
      created_by: string; created_at: number;
    }>();

  return results.map((r) => ({
    id: r.id, groupId: r.group_id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    title: r.title, agenda: r.agenda,
    meetingType: r.meeting_type as GroupMeeting['meetingType'],
    venue: r.venue, placeId: r.place_id,
    startsAt: r.starts_at, endsAt: r.ends_at,
    isVirtual: r.is_virtual === 1, joinUrl: r.join_url,
    status: r.status as GroupMeeting['status'],
    minutesUrl: r.minutes_url,
    quorumMet: r.quorum_met === null ? null : r.quorum_met === 1,
    attendance: r.attendance,
    createdBy: r.created_by, createdAt: r.created_at,
  }));
}

export async function recordResolution(
  db: D1Like,
  opts: {
    groupId: string; meetingId?: string; workspaceId: string; tenantId: string;
    title: string; body: string; resolutionRef?: string;
    status: GroupResolution['status']; passedBy: GroupResolution['passedBy'];
    recordedBy: string;
  },
): Promise<GroupResolution> {
  const id = generateId('gres');
  const ts = now();
  await db
    .prepare(
      `INSERT INTO group_resolutions
         (id, group_id, meeting_id, workspace_id, tenant_id, title, body,
          resolution_ref, status, passed_by, recorded_at, recorded_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      id, opts.groupId, opts.meetingId ?? null,
      opts.workspaceId, opts.tenantId,
      opts.title, opts.body, opts.resolutionRef ?? null,
      opts.status, opts.passedBy, ts, opts.recordedBy,
    )
    .run();

  return {
    id, groupId: opts.groupId, meetingId: opts.meetingId ?? null,
    workspaceId: opts.workspaceId, tenantId: opts.tenantId,
    title: opts.title, body: opts.body, resolutionRef: opts.resolutionRef ?? null,
    status: opts.status, passedBy: opts.passedBy, recordedAt: ts, recordedBy: opts.recordedBy,
  };
}

// ---------------------------------------------------------------------------
// Broadcasts — DB table: group_broadcasts
// ---------------------------------------------------------------------------

export async function createBroadcast(
  db: D1Like,
  input: CreateBroadcastInput,
): Promise<GroupBroadcast> {
  const id = generateId('gbrd');
  const ts = now();
  await db
    .prepare(
      `INSERT INTO group_broadcasts
         (id, group_id, workspace_id, tenant_id, sender_id, title, body,
          channel, audience, status, sent_count, failed_count, scheduled_at, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,'queued',0,0,?,?)`,
    )
    .bind(
      id, input.groupId, input.workspaceId, input.tenantId,
      input.senderId, input.title, input.body,
      input.channel ?? 'in_app', input.audience ?? 'all',
      input.scheduledAt ?? null, ts,
    )
    .run();

  return {
    id, groupId: input.groupId, workspaceId: input.workspaceId, tenantId: input.tenantId,
    senderId: input.senderId, title: input.title, body: input.body,
    channel: input.channel ?? 'in_app', audience: input.audience ?? 'all',
    status: 'queued', sentCount: 0, failedCount: 0,
    scheduledAt: input.scheduledAt ?? null, sentAt: null, createdAt: ts,
  };
}

export async function listBroadcasts(
  db: D1Like,
  groupId: string,
  tenantId: string,
  opts: { limit?: number; offset?: number } = {},
): Promise<GroupBroadcast[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM group_broadcasts WHERE group_id = ? AND tenant_id = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    )
    .bind(groupId, tenantId, opts.limit ?? 20, opts.offset ?? 0)
    .all<{
      id: string; group_id: string; workspace_id: string; tenant_id: string;
      sender_id: string; title: string; body: string;
      channel: string; audience: string; status: string;
      sent_count: number; failed_count: number;
      scheduled_at: number | null; sent_at: number | null; created_at: number;
    }>();

  return results.map((r) => ({
    id: r.id, groupId: r.group_id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    senderId: r.sender_id, title: r.title, body: r.body,
    channel: r.channel as GroupBroadcast['channel'],
    audience: r.audience as GroupBroadcast['audience'],
    status: r.status as GroupBroadcast['status'],
    sentCount: r.sent_count, failedCount: r.failed_count,
    scheduledAt: r.scheduled_at, sentAt: r.sent_at, createdAt: r.created_at,
  }));
}

// ---------------------------------------------------------------------------
// Events — DB table: group_events
// ---------------------------------------------------------------------------

export async function createGroupEvent(
  db: D1Like,
  input: CreateEventInput,
): Promise<GroupEvent> {
  const id = generateId('gevt');
  const ts = now();
  await db
    .prepare(
      `INSERT INTO group_events
         (id, group_id, workspace_id, tenant_id, title, description, event_type,
          venue, place_id, state_code, lga_code, ward_code,
          starts_at, ends_at, expected_count, status, is_public, rsvp_count, created_by, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'scheduled',?,0,?,?)`,
    )
    .bind(
      id, input.groupId, input.workspaceId, input.tenantId,
      input.title, input.description ?? null, input.eventType ?? 'general',
      input.venue ?? null, input.placeId ?? null,
      input.stateCode ?? null, input.lgaCode ?? null, input.wardCode ?? null,
      input.startsAt, input.endsAt ?? null, input.expectedCount ?? null,
      input.isPublic ? 1 : 0, input.createdBy, ts,
    )
    .run();

  return {
    id, groupId: input.groupId, workspaceId: input.workspaceId, tenantId: input.tenantId,
    title: input.title, description: input.description ?? null,
    eventType: input.eventType ?? 'meeting',
    venue: input.venue ?? null, placeId: input.placeId ?? null,
    stateCode: input.stateCode ?? null, lgaCode: input.lgaCode ?? null, wardCode: input.wardCode ?? null,
    startsAt: input.startsAt, endsAt: input.endsAt ?? null,
    expectedCount: input.expectedCount ?? null, actualCount: null,
    status: 'scheduled', isPublic: input.isPublic ?? false, rsvpCount: 0,
    createdBy: input.createdBy, createdAt: ts,
  };
}

export async function listGroupEvents(
  db: D1Like,
  groupId: string,
  tenantId: string,
  opts: { status?: string; publicOnly?: boolean; limit?: number; offset?: number } = {},
): Promise<GroupEvent[]> {
  const where = [`group_id = ?`, `tenant_id = ?`];
  const vals: unknown[] = [groupId, tenantId];
  if (opts.status)    { where.push(`status = ?`);    vals.push(opts.status); }
  if (opts.publicOnly){ where.push(`is_public = 1`); }
  vals.push(opts.limit ?? 20, opts.offset ?? 0);

  const { results } = await db
    .prepare(
      `SELECT * FROM group_events WHERE ${where.join(' AND ')}
       ORDER BY starts_at DESC LIMIT ? OFFSET ?`,
    )
    .bind(...vals)
    .all<{
      id: string; group_id: string; workspace_id: string; tenant_id: string;
      title: string; description: string | null; event_type: string;
      venue: string | null; place_id: string | null;
      state_code: string | null; lga_code: string | null; ward_code: string | null;
      starts_at: number; ends_at: number | null;
      expected_count: number | null; actual_count: number | null;
      status: string; is_public: number; rsvp_count: number;
      created_by: string; created_at: number;
    }>();

  return results.map((r) => ({
    id: r.id, groupId: r.group_id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    title: r.title, description: r.description,
    eventType: r.event_type as GroupEventType,
    venue: r.venue, placeId: r.place_id,
    stateCode: r.state_code, lgaCode: r.lga_code, wardCode: r.ward_code,
    startsAt: r.starts_at, endsAt: r.ends_at,
    expectedCount: r.expected_count, actualCount: r.actual_count,
    status: r.status as GroupEventStatus,
    isPublic: r.is_public === 1, rsvpCount: r.rsvp_count,
    createdBy: r.created_by, createdAt: r.created_at,
  }));
}

// ---------------------------------------------------------------------------
// Petitions — DB table: group_petitions
// ---------------------------------------------------------------------------

export async function createPetition(
  db: D1Like,
  opts: {
    groupId: string; workspaceId: string; tenantId: string;
    title: string; body: string; target?: string; createdBy: string;
  },
): Promise<GroupPetition> {
  const id = generateId('gpt');
  const ts = now();
  await db
    .prepare(
      `INSERT INTO group_petitions
         (id, group_id, workspace_id, tenant_id, title, body, target, created_by, created_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
    )
    .bind(id, opts.groupId, opts.workspaceId, opts.tenantId, opts.title, opts.body, opts.target ?? null, opts.createdBy, ts)
    .run();

  return {
    id, groupId: opts.groupId, workspaceId: opts.workspaceId, tenantId: opts.tenantId,
    title: opts.title, body: opts.body, target: opts.target ?? null,
    signatureCount: 0, status: 'open', createdBy: opts.createdBy, createdAt: ts, closedAt: null,
  };
}

export async function signPetition(
  db: D1Like,
  petitionId: string,
  groupId: string,
  workspaceId: string,
  tenantId: string,
  userId: string,
): Promise<void> {
  const id = generateId('gps');
  await db
    .prepare(
      `INSERT OR IGNORE INTO group_petition_signatures
         (id, petition_id, group_id, workspace_id, tenant_id, user_id, signed_at)
       VALUES (?,?,?,?,?,?,?)`,
    )
    .bind(id, petitionId, groupId, workspaceId, tenantId, userId, now())
    .run();

  await db
    .prepare(
      `UPDATE group_petitions SET signature_count = (
         SELECT COUNT(*) FROM group_petition_signatures WHERE petition_id = ? AND tenant_id = ?
       ) WHERE id = ? AND tenant_id = ?`,
    )
    .bind(petitionId, tenantId, petitionId, tenantId)
    .run();
}

// ---------------------------------------------------------------------------
// Analytics — DB table: group_analytics
// ---------------------------------------------------------------------------

export async function getGroupAnalytics(
  db: D1Like,
  groupId: string,
  tenantId: string,
  periodDate: string,
): Promise<GroupAnalytics | null> {
  const row = await db
    .prepare(
      `SELECT * FROM group_analytics
       WHERE group_id = ? AND tenant_id = ? AND period_date = ? LIMIT 1`,
    )
    .bind(groupId, tenantId, periodDate)
    .first<{
      group_id: string; period_date: string;
      new_members: number; active_members: number;
      broadcasts_sent: number; events_held: number;
      gotv_mobilized: number; gotv_voted: number;
      signatures_collected: number; computed_at: number;
    }>();

  if (!row) return null;
  return {
    groupId: row.group_id, periodDate: row.period_date,
    newMembers: row.new_members, activeMembers: row.active_members,
    broadcastsSent: row.broadcasts_sent, eventsHeld: row.events_held,
    gotvMobilized: row.gotv_mobilized, gotvVoted: row.gotv_voted,
    signaturesCollected: row.signatures_collected, computedAt: row.computed_at,
  };
}
