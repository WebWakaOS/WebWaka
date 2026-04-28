/**
 * Groups routes — Phase 0 rename of /support-groups → /groups
 * Uses @webwaka/groups (renamed from @webwaka/support-groups).
 *
 * Operations (auth required, T3 tenant from JWT):
 *   POST   /groups                              — create group
 *   PATCH  /groups/:id                         — update group
 *   GET    /groups/:idOrSlug                   — get group (auth or public)
 *   GET    /groups                             — list workspace groups
 *   POST   /groups/:id/join                    — join group
 *   POST   /groups/:id/members/:memberId/approve — approve pending member
 *   PATCH  /groups/:id/members/:memberId/role  — change member role
 *   GET    /groups/:id/members                 — list members
 *   POST   /groups/:id/meetings                — schedule meeting
 *   GET    /groups/:id/meetings                — list meetings
 *   POST   /groups/:id/broadcasts              — send broadcast
 *   GET    /groups/:id/broadcasts              — list broadcasts
 *   POST   /groups/:id/events                  — create event
 *   GET    /groups/:id/events                  — list events
 *   POST   /groups/:id/petitions               — open petition
 *   POST   /groups/petitions/:id/sign          — sign petition
 *   GET    /groups/:id/analytics               — analytics (entitlement-gated)
 *
 * Discovery (public, header-based tenant):
 *   GET    /groups/public                      — public group list
 *   GET    /groups/public/:idOrSlug            — public group profile
 *   GET    /groups/:id/events/public           — public events for group
 *
 * T3  — tenant_id from JWT on auth routes; X-Tenant-Id header on public routes.
 * P9  — no kobo assertions (no monetary values in this module).
 * P13 — voter_ref is in @webwaka/groups-electoral; not accessible via this route.
 *        GOTV routes are on /electoral/* (separate, sensitiveSectorRights-gated).
 */

import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import { publishEvent } from '../lib/publish-event.js';
import { GroupEventType } from '@webwaka/events';
import {
  createGroup,
  getGroup,
  listGroups,
  listPublicGroups,
  updateGroup,
  joinGroup,
  getMember,
  listGroupMembers,
  approveMember,
  updateMemberRole,
  createMeeting,
  listMeetings,
  createBroadcast,
  listBroadcasts,
  createGroupEvent,
  listGroupEvents,
  createPetition,
  signPetition,
  getGroupAnalytics,
  assertMaxGroups,
  assertBroadcastEnabled,
  assertBroadcastChannel,
  assertHierarchyEnabled,
  assertAnalyticsEnabled,
  FREE_GROUP_ENTITLEMENTS,
  STARTER_GROUP_ENTITLEMENTS,
  GROWTH_GROUP_ENTITLEMENTS,
  PRO_GROUP_ENTITLEMENTS,
  ENTERPRISE_GROUP_ENTITLEMENTS,
  PARTNER_GROUP_ENTITLEMENTS,
  SUB_PARTNER_GROUP_ENTITLEMENTS,
  type GroupEntitlements,
} from '@webwaka/groups';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };
type D1Like = Env['DB'];

function getTenantIdFromHeader(c: { req: { header(name: string): string | undefined } }): string | null {
  return c.req.header('X-Tenant-Id') ?? null;
}

function getEntitlements(plan: string): GroupEntitlements {
  switch (plan) {
    case 'starter':      return STARTER_GROUP_ENTITLEMENTS;
    case 'growth':       return GROWTH_GROUP_ENTITLEMENTS;
    case 'pro':          return PRO_GROUP_ENTITLEMENTS;
    case 'enterprise':   return ENTERPRISE_GROUP_ENTITLEMENTS;
    case 'partner':      return PARTNER_GROUP_ENTITLEMENTS;
    case 'sub_partner':  return SUB_PARTNER_GROUP_ENTITLEMENTS;
    default:             return FREE_GROUP_ENTITLEMENTS;
  }
}

export const groupRoutes = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// Public (discovery) — must be registered BEFORE /:id catch-all
// ---------------------------------------------------------------------------

groupRoutes.get('/public', async (c) => {
  const tenantId = getTenantIdFromHeader(c);
  if (!tenantId) return c.json({ error: 'X-Tenant-Id header required' }, 400);

  const db = c.env.DB as unknown as D1Like;
  const q = c.req.query;
  const groups = await listPublicGroups(db as never, {
    tenantId,
    stateCode:      q('state_code') ?? undefined,
    lgaCode:        q('lga_code') ?? undefined,
    wardCode:       q('ward_code') ?? undefined,
    category:       q('category') ?? undefined,
    hierarchyLevel: q('hierarchy_level') ?? undefined,
    limit:  parseInt(q('limit')  ?? '50', 10),
    offset: parseInt(q('offset') ?? '0',  10),
  });
  return c.json({ groups });
});

groupRoutes.get('/public/:idOrSlug', async (c) => {
  const tenantId = getTenantIdFromHeader(c);
  if (!tenantId) return c.json({ error: 'X-Tenant-Id header required' }, 400);

  const db = c.env.DB as unknown as D1Like;
  const group = await getGroup(db as never, c.req.param('idOrSlug'), tenantId);
  if (!group || group.visibility === 'private') {
    return c.json({ error: 'NOT_FOUND' }, 404);
  }
  const { constitutionUrl: _, ...publicProfile } = group;
  return c.json({ group: publicProfile });
});

// ---------------------------------------------------------------------------
// Authenticated operations
// ---------------------------------------------------------------------------

const createGroupSchema = z.object({
  name:            z.string().min(2).max(120),
  slug:            z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  description:     z.string().max(1000).optional(),
  category:        z.enum(['general','election','political','civic','professional','church','ngo','community']).optional(),
  hierarchyLevel:  z.enum(['national','state','lga','ward','polling_unit']).optional(),
  parentGroupId:   z.string().optional(),
  placeId:         z.string().optional(),
  stateCode:       z.string().length(2).optional(),
  lgaCode:         z.string().optional(),
  wardCode:        z.string().optional(),
  pollingUnitCode: z.string().optional(),
  visibility:      z.enum(['public','private','invite_only']).optional(),
  joinPolicy:      z.enum(['open','approval','invite_only']).optional(),
  ndprConsentRequired: z.boolean().optional(),
});

groupRoutes.post('/', async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId, plan = 'free' } = auth as AuthContext & { plan?: string };
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json().catch(() => null);
  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  const ents = getEntitlements(plan);
  const existingCount = await (db as unknown as {
    prepare: (q: string) => { bind: (...a: unknown[]) => { first: <T>() => Promise<T | null> } }
  })
    .prepare(`SELECT COUNT(*) as cnt FROM groups WHERE workspace_id = ? AND tenant_id = ? AND status = 'active'`)
    .bind(workspaceId, tenantId)
    .first<{ cnt: number }>();
  assertMaxGroups(existingCount?.cnt ?? 0, ents);

  if (parsed.data.hierarchyLevel && parsed.data.parentGroupId) {
    assertHierarchyEnabled(ents);
  }

  try {
    const group = await createGroup(db as never, {
      workspaceId,
      tenantId,
      ...parsed.data,
    });

    await publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: GroupEventType.GroupCreated,
      tenantId,
      payload: { groupId: group.id, name: group.name },
    });

    return c.json({ group }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create group';
    if (msg.includes('UNIQUE')) return c.json({ error: 'SLUG_CONFLICT', message: 'Slug already in use' }, 409);
    return c.json({ error: msg }, 400);
  }
});

groupRoutes.get('/', async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const groups = await listGroups(db as never, {
    workspaceId, tenantId,
    status: c.req.query('status') ?? 'active',
    limit:  parseInt(c.req.query('limit')  ?? '50', 10),
    offset: parseInt(c.req.query('offset') ?? '0',  10),
  });
  return c.json({ groups });
});

groupRoutes.get('/:idOrSlug', async (c) => {
  const auth = c.get('auth');
  const { tenantId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const group = await getGroup(db as never, c.req.param('idOrSlug'), tenantId);
  if (!group) return c.json({ error: 'NOT_FOUND' }, 404);
  return c.json({ group });
});

const updateGroupSchema = z.object({
  name:             z.string().min(2).max(120).optional(),
  description:      z.string().max(1000).optional(),
  visibility:       z.enum(['public','private','invite_only']).optional(),
  joinPolicy:       z.enum(['open','approval','invite_only']).optional(),
  status:           z.enum(['active','suspended','archived']).optional(),
  logoUrl:          z.string().url().optional(),
  coverUrl:         z.string().url().optional(),
  constitutionUrl:  z.string().url().optional(),
  websiteUrl:       z.string().url().optional(),
});

groupRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth');
  const { tenantId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json().catch(() => null);
  const parsed = updateGroupSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  await updateGroup(db as never, c.req.param('id'), tenantId, parsed.data);

  const updated = await getGroup(db as never, c.req.param('id'), tenantId);
  if (!updated) return c.json({ error: 'NOT_FOUND' }, 404);

  await publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: GroupEventType.GroupUpdated,
    tenantId,
    payload: { groupId: updated.id },
  });

  return c.json({ group: updated });
});

// --- Membership ---

groupRoutes.post('/:id/join', async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId, userId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json().catch(() => ({}));
  const schema = z.object({
    role:            z.enum(['member','volunteer','mobilizer','coordinator']).optional(),
    wardCode:        z.string().optional(),
    pollingUnitCode: z.string().optional(),
    ndprConsented:   z.boolean(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  if (!parsed.data.ndprConsented) {
    return c.json({ error: 'NDPR_CONSENT_REQUIRED', message: 'NDPR consent is required to join this group' }, 400);
  }

  const member = await joinGroup(db as never, {
    groupId: c.req.param('id'),
    workspaceId, tenantId, userId,
    role: parsed.data.role,
    wardCode: parsed.data.wardCode,
    pollingUnitCode: parsed.data.pollingUnitCode,
    ndprConsented: true,
  });

  await publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: GroupEventType.GroupMemberJoined,
    tenantId,
    payload: { memberId: member.id, userId },
  });

  return c.json({ member }, 201);
});

groupRoutes.get('/:id/members', async (c) => {
  const auth = c.get('auth');
  const { tenantId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const members = await listGroupMembers(db as never, c.req.param('id'), tenantId, {
    role:   c.req.query('role') ?? undefined,
    status: c.req.query('status') ?? 'active',
    limit:  parseInt(c.req.query('limit')  ?? '100', 10),
    offset: parseInt(c.req.query('offset') ?? '0',   10),
  });
  return c.json({ members });
});

groupRoutes.post('/:id/members/:memberId/approve', async (c) => {
  const auth = c.get('auth');
  const { tenantId, userId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  await approveMember(db as never, c.req.param('memberId'), userId, tenantId);

  await publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: GroupEventType.GroupMemberApproved,
    tenantId,
    payload: { memberId: c.req.param('memberId'), approvedBy: userId },
  });

  return c.json({ success: true });
});

groupRoutes.patch('/:id/members/:memberId/role', async (c) => {
  const auth = c.get('auth');
  const { tenantId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json().catch(() => null);
  const schema = z.object({
    role: z.enum(['chair','secretary','treasurer','executive','coordinator','mobilizer','member','volunteer']),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  await updateMemberRole(db as never, c.req.param('memberId'), parsed.data.role, tenantId);
  const member = await getMember(db as never, c.req.param('memberId'), tenantId);
  return c.json({ member });
});

// --- Meetings ---

groupRoutes.post('/:id/meetings', async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId, userId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json().catch(() => null);
  const schema = z.object({
    title:       z.string().min(1).max(200),
    agenda:      z.string().optional(),
    meetingType: z.enum(['general','executive','emergency','agm','rally','townhall','training','mobilization']).optional(),
    venue:       z.string().optional(),
    placeId:     z.string().optional(),
    startsAt:    z.number().int(),
    endsAt:      z.number().int().optional(),
    isVirtual:   z.boolean().optional(),
    joinUrl:     z.string().url().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  const meeting = await createMeeting(db as never, {
    groupId: c.req.param('id'), workspaceId, tenantId,
    createdBy: userId, ...parsed.data,
  });

  await publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: GroupEventType.GroupMeetingScheduled,
    tenantId,
    payload: { meetingId: meeting.id },
  });

  return c.json({ meeting }, 201);
});

groupRoutes.get('/:id/meetings', async (c) => {
  const auth = c.get('auth');
  const { tenantId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const meetings = await listMeetings(db as never, c.req.param('id'), tenantId, {
    limit:  parseInt(c.req.query('limit')  ?? '20', 10),
    offset: parseInt(c.req.query('offset') ?? '0',  10),
  });
  return c.json({ meetings });
});

// --- Broadcasts ---

groupRoutes.post('/:id/broadcasts', async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId, userId, plan = 'free' } = auth as AuthContext & { plan?: string };
  const db = c.env.DB as unknown as D1Like;

  const ents = getEntitlements(plan);
  assertBroadcastEnabled(ents);

  const body = await c.req.json().catch(() => null);
  const schema = z.object({
    title:       z.string().min(1).max(200),
    body:        z.string().min(1).max(1600),
    channel:     z.enum(['in_app','sms','whatsapp','email','ussd_push']).optional(),
    audience:    z.enum(['all','executive','volunteers','members_only','coordinators']).optional(),
    scheduledAt: z.number().int().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  if (parsed.data.channel) {
    assertBroadcastChannel(parsed.data.channel, ents);
  }

  const broadcast = await createBroadcast(db as never, {
    groupId: c.req.param('id'), workspaceId, tenantId, senderId: userId, ...parsed.data,
  });

  await publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: GroupEventType.GroupBroadcastSent,
    tenantId,
    payload: { broadcastId: broadcast.id, channel: broadcast.channel },
  });

  return c.json({ broadcast }, 201);
});

groupRoutes.get('/:id/broadcasts', async (c) => {
  const auth = c.get('auth');
  const { tenantId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const broadcasts = await listBroadcasts(db as never, c.req.param('id'), tenantId, {
    limit:  parseInt(c.req.query('limit')  ?? '20', 10),
    offset: parseInt(c.req.query('offset') ?? '0',  10),
  });
  return c.json({ broadcasts });
});

// --- Events ---

groupRoutes.post('/:id/events', async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId, userId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json().catch(() => null);
  const schema = z.object({
    title:         z.string().min(1).max(200),
    description:   z.string().optional(),
    eventType:     z.enum(['rally','townhall','workshop','training','mobilization',
                           'press_conference','fundraiser','service','outreach','worship','meeting','general']).optional(),
    venue:         z.string().optional(),
    placeId:       z.string().optional(),
    stateCode:     z.string().length(2).optional(),
    lgaCode:       z.string().optional(),
    wardCode:      z.string().optional(),
    startsAt:      z.number().int(),
    endsAt:        z.number().int().optional(),
    expectedCount: z.number().int().optional(),
    isPublic:      z.boolean().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  const event = await createGroupEvent(db as never, {
    groupId: c.req.param('id'), workspaceId, tenantId, createdBy: userId, ...parsed.data,
  });

  await publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: GroupEventType.GroupEventCreated,
    tenantId,
    payload: { eventId: event.id },
  });

  return c.json({ event }, 201);
});

groupRoutes.get('/:id/events', async (c) => {
  const auth = c.get('auth');
  const { tenantId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const events = await listGroupEvents(db as never, c.req.param('id'), tenantId, {
    limit:  parseInt(c.req.query('limit')  ?? '20', 10),
    offset: parseInt(c.req.query('offset') ?? '0',  10),
  });
  return c.json({ events });
});

groupRoutes.get('/:id/events/public', async (c) => {
  const tenantId = getTenantIdFromHeader(c);
  if (!tenantId) return c.json({ error: 'X-Tenant-Id header required' }, 400);
  const db = c.env.DB as unknown as D1Like;

  const events = await listGroupEvents(db as never, c.req.param('id'), tenantId, {
    publicOnly: true,
    limit:  parseInt(c.req.query('limit')  ?? '20', 10),
    offset: parseInt(c.req.query('offset') ?? '0',  10),
  });
  return c.json({ events });
});

// --- Petitions ---

groupRoutes.post('/:id/petitions', async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId, userId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json().catch(() => null);
  const schema = z.object({
    title:  z.string().min(1).max(200),
    body:   z.string().min(1).max(5000),
    target: z.string().max(200).optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  const petition = await createPetition(db as never, {
    groupId: c.req.param('id'), workspaceId, tenantId,
    createdBy: userId, ...parsed.data,
  });

  await publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: GroupEventType.GroupPetitionOpened,
    tenantId,
    payload: { petitionId: petition.id },
  });

  return c.json({ petition }, 201);
});

groupRoutes.post('/petitions/:petitionId/sign', async (c) => {
  const auth = c.get('auth');
  const { tenantId, userId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const petitionId = c.req.param('petitionId');
  const petitionRow = await (db as unknown as {
    prepare: (q: string) => { bind: (...a: unknown[]) => { first: <T>() => Promise<T | null> } }
  })
    .prepare(`SELECT group_id, workspace_id FROM group_petitions WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(petitionId, tenantId)
    .first<{ group_id: string; workspace_id: string }>();

  if (!petitionRow) return c.json({ error: 'NOT_FOUND' }, 404);

  await signPetition(db as never, petitionId, petitionRow.group_id, petitionRow.workspace_id, tenantId, userId);

  await publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: GroupEventType.GroupPetitionSigned,
    tenantId,
    payload: { petitionId, userId },
  });

  return c.json({ success: true });
});

// --- Analytics (entitlement-gated) ---

groupRoutes.get('/:id/analytics', async (c) => {
  const auth = c.get('auth');
  const { tenantId, plan = 'free' } = auth as AuthContext & { plan?: string };
  const db = c.env.DB as unknown as D1Like;

  assertAnalyticsEnabled(getEntitlements(plan));

  const periodDate = c.req.query('period_date') ?? new Date().toISOString().slice(0, 7);
  const analytics = await getGroupAnalytics(db as never, c.req.param('id'), tenantId, periodDate);
  if (!analytics) return c.json({ error: 'NO_ANALYTICS_DATA', periodDate }, 404);
  return c.json({ analytics });
});
