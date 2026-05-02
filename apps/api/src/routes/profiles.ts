/**
 * Workspace profile management routes.
 *
 *   GET  /profiles                         — list profiles belonging to this workspace
 *   PATCH /profiles/:profileId/visibility  — set visibility (public / semi / private)
 *   PATCH /profiles/:profileId/claim-state — advance claim_state to managed (workspace owner)
 *
 * All routes require auth. Workspace admins manage their own profiles; super_admin
 * can manage any profile across any tenant (with ?tenantId= override).
 *
 * Platform Invariants:
 *   T3 — tenant_id scoping on all D1 queries
 *   T5 — role guards (admin or super_admin)
 *
 * Discovery marketplace visibility:
 *   public  — visible in global discovery + tenant marketplace
 *   semi    — visible only in tenant-scoped marketplace (GET /public/:tenantSlug)
 *   private — hidden from all discovery indexes; accessible by workspace only
 *
 * Changing visibility also updates search_entries.visibility to keep indexes in sync.
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import { publishEvent } from '../lib/publish-event.js';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

export const profileRoutes = new Hono<AppEnv>();

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean; changes?: number }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

// ---------------------------------------------------------------------------
// GET /profiles — list profiles belonging to the authenticated workspace
// ---------------------------------------------------------------------------

profileRoutes.get('/', async (c) => {
  const auth = c.get('auth');
  const db = c.env.DB as unknown as D1Like;
  const { cursor, limit: rawLimit } = c.req.query() as { cursor?: string; limit?: string };
  const limit = Math.min(parseInt(rawLimit ?? '50', 10) || 50, 100);

  const scopedWorkspaceId = auth.role === 'super_admin'
    ? (c.req.query('workspaceId') ?? auth.workspaceId)
    : auth.workspaceId;

  const rows = await db
    .prepare(
      `SELECT id, entity_type, entity_id, display_name, visibility, claim_state, place_id,
              profile_type, claim_status, avatar_url, created_at, updated_at
       FROM profiles
       WHERE workspace_id = ? AND tenant_id = ?
       ${cursor ? 'AND id > ?' : ''}
       ORDER BY id ASC
       LIMIT ?`,
    )
    .bind(...(cursor ? [scopedWorkspaceId, auth.tenantId, cursor, limit] : [scopedWorkspaceId, auth.tenantId, limit]))
    .all<{
      id: string;
      entity_type: string;
      entity_id: string;
      display_name: string;
      visibility: string;
      claim_state: string;
      place_id: string | null;
      profile_type: string | null;
      claim_status: string | null;
      avatar_url: string | null;
      created_at: number;
      updated_at: number;
    }>();

  return c.json({
    profiles:   rows.results,
    total:      rows.results.length,
    next_cursor: rows.results.length === limit ? (rows.results.at(-1)?.id ?? null) : null,
  });
});

// ---------------------------------------------------------------------------
// PATCH /profiles/:profileId/visibility
// Allows workspace admins (or super_admin) to control discovery marketplace
// visibility of their profiles.
// ---------------------------------------------------------------------------

profileRoutes.patch('/:profileId/visibility', async (c) => {
  const auth = c.get('auth');
  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'admin or super_admin role required' }, 403);
  }

  const profileId = c.req.param('profileId');
  const db = c.env.DB as unknown as D1Like;

  let body: { visibility?: string } = {};
  try {
    body = await c.req.json<{ visibility?: string }>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const VALID_VISIBILITY = ['public', 'semi', 'private'];
  if (!body.visibility || !VALID_VISIBILITY.includes(body.visibility)) {
    return c.json({ error: `visibility must be one of: ${VALID_VISIBILITY.join(' | ')}` }, 400);
  }

  // T3: scope to tenant; super_admin can act on profiles in any workspace
  // owned by this tenant.
  const profile = auth.role === 'super_admin'
    ? await db
        .prepare('SELECT id, workspace_id, visibility FROM profiles WHERE id = ?')
        .bind(profileId)
        .first<{ id: string; workspace_id: string; visibility: string }>()
    : await db
        .prepare('SELECT id, workspace_id, visibility FROM profiles WHERE id = ? AND tenant_id = ? AND workspace_id = ?')
        .bind(profileId, auth.tenantId, auth.workspaceId)
        .first<{ id: string; workspace_id: string; visibility: string }>();

  if (!profile) {
    return c.json({ error: 'Profile not found or not accessible' }, 404);
  }

  if (profile.visibility === body.visibility) {
    return c.json({ message: 'No change — visibility already set.', profileId, visibility: body.visibility });
  }

  await db
    .prepare('UPDATE profiles SET visibility = ?, updated_at = unixepoch() WHERE id = ?')
    .bind(body.visibility, profileId)
    .run();

  // Keep search_entries.visibility in sync so discovery queries reflect the change.
  await db
    .prepare('UPDATE search_entries SET visibility = ?, updated_at = unixepoch() WHERE profile_id = ?')
    .bind(body.visibility, profileId)
    .run();

  void publishEvent(c.env, {
    eventId:   crypto.randomUUID(),
    eventKey:  'profile.visibility_changed' as never,
    tenantId:  auth.tenantId,
    actorId:   auth.userId as string,
    actorType: 'user',
    payload:   { profile_id: profileId, visibility: body.visibility, previous_visibility: profile.visibility },
    source:    'api',
    severity:  'info',
    correlationId: c.get('requestId') ?? undefined,
  });

  return c.json({
    profileId,
    visibility:          body.visibility,
    previous_visibility: profile.visibility,
    note: body.visibility === 'public'
      ? 'Profile is now visible in global discovery. DNS and search index changes may take a few minutes to propagate.'
      : body.visibility === 'semi'
        ? 'Profile is visible only in your tenant marketplace (/public/:tenantSlug), not in global discovery.'
        : 'Profile is now hidden from all discovery indexes.',
  });
});

// ---------------------------------------------------------------------------
// PATCH /profiles/:profileId/claim-state — advance to managed (workspace owner)
//
// After a claim is approved (profile state = verified) and the workspace owner
// has activated their workspace (paid plan), they can call this endpoint to
// explicitly take full management control of the profile, transitioning it to
// the `managed` state.
//
// Preconditions:
//   - Profile must be in `verified` state
//   - Profile must be linked to the caller's workspace (workspace_id = auth.workspaceId)
//   - Workspace must have an active paid plan (not free)
// ---------------------------------------------------------------------------

profileRoutes.patch('/:profileId/claim-state', async (c) => {
  const auth = c.get('auth');
  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'admin or super_admin role required' }, 403);
  }

  const profileId = c.req.param('profileId');
  const db = c.env.DB as unknown as D1Like;

  let body: { targetState?: string } = {};
  try {
    body = await c.req.json<{ targetState?: string }>();
  } catch {
    body = {};
  }

  const targetState = body.targetState ?? 'managed';
  if (targetState !== 'managed') {
    return c.json({ error: 'Only targetState=managed is currently supported via this endpoint.' }, 400);
  }

  // Look up profile — must be linked to this workspace and in verified state
  const profile = await db
    .prepare(
      `SELECT id, claim_state, workspace_id FROM profiles
       WHERE id = ? AND tenant_id = ? AND workspace_id = ?`,
    )
    .bind(profileId, auth.tenantId, auth.workspaceId)
    .first<{ id: string; claim_state: string; workspace_id: string }>();

  if (!profile) {
    return c.json({ error: 'Profile not found or not linked to your workspace.' }, 404);
  }

  if (profile.claim_state === 'managed') {
    return c.json({ message: 'Profile is already in managed state.', profileId });
  }

  if (profile.claim_state !== 'verified') {
    return c.json({
      error:         `Cannot transition to managed from state '${profile.claim_state}'.`,
      current_state: profile.claim_state,
      required_state: 'verified',
      hint: 'The claim must be approved by a platform admin first (claim_state=verified).',
    }, 409);
  }

  // Verify workspace is on a paid plan
  const sub = await db
    .prepare(`SELECT plan FROM subscriptions WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`)
    .bind(auth.workspaceId, auth.tenantId)
    .first<{ plan: string }>();

  if (!sub || sub.plan === 'free') {
    return c.json({
      error:    'Workspace must be on a paid plan to take full management control of a profile.',
      plan:     sub?.plan ?? 'none',
      hint:     'Upgrade your workspace plan at POST /workspaces/:id/activate, then try again.',
    }, 402);
  }

  await db
    .prepare('UPDATE profiles SET claim_state = ?, updated_at = unixepoch() WHERE id = ?')
    .bind('managed', profileId)
    .run();

  void publishEvent(c.env, {
    eventId:   crypto.randomUUID(),
    eventKey:  'profile.claim_state_changed' as never,
    tenantId:  auth.tenantId,
    actorId:   auth.userId as string,
    actorType: 'user',
    payload:   { profile_id: profileId, from_state: 'verified', to_state: 'managed', workspace_id: auth.workspaceId },
    source:    'api',
    severity:  'info',
    correlationId: c.get('requestId') ?? undefined,
  });

  return c.json({
    profileId,
    claim_state: 'managed',
    previous_state: 'verified',
    message: 'Profile is now fully managed by your workspace. You have complete operational control.',
  });
});
