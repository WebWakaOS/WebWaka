/**
 * Platform-admin vertical FSM control routes — M8b
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ROUTES
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   GET  /platform-admin/verticals
 *     — Cross-workspace list of all workspace_verticals rows.
 *       Filterable by: state, slug, workspaceId.
 *
 *   GET  /platform-admin/verticals/:workspaceId
 *     — All verticals for a specific workspace (admin view; includes
 *       the workspace's verification flags so the admin can see exactly
 *       why a vertical is at a given state).
 *
 *   POST /platform-admin/verticals/:workspaceId/:slug/claim
 *     — Insert a workspace_vertical row in 'claimed' state.
 *       Used when a workspace's verifications are still pending admin review
 *       but the workspace owner has initiated the process.
 *       Idempotent: if already claimed, returns 200 with current state.
 *
 *   POST /platform-admin/verticals/:workspaceId/:slug/activate
 *     — Advance a vertical from 'claimed' → 'active'.
 *       Re-checks all entitlement requirements against the workspace's
 *       current flags before advancing. Returns 422 if any are unmet.
 *       Used when the platform team has completed verification and the
 *       workspace has not yet self-activated.
 *
 *   POST /platform-admin/verticals/:workspaceId/:slug/suspend
 *     — Suspend an 'active' or 'claimed' vertical (compliance or payment).
 *       Requires a reason. Fires workspace.vertical_suspended event.
 *
 *   POST /platform-admin/verticals/:workspaceId/:slug/reinstate
 *     — Reinstate a 'suspended' vertical back to 'active'.
 *       Re-validates entitlements before reinstating.
 *       Fires workspace.vertical_reinstated event.
 *
 *   POST /platform-admin/verticals/:workspaceId/:slug/deprecate
 *     — Permanently deprecate a vertical (active|suspended|claimed → deprecated).
 *       Irreversible. Requires reason. Fires workspace.vertical_deprecated event.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FSM TRANSITIONS (BASE_VERTICAL_FSM)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   seeded    → claimed      (workspace owner: basic KYC + phone)
 *   claimed   → active       (admin confirms all requirements / workspace self-activates)
 *   active    → suspended    (admin: compliance or billing issue)
 *   suspended → active       (admin: issue resolved)
 *   claimed   → suspended    (admin: pre-activation compliance hold)
 *   active    → deprecated   (admin: permanent removal)
 *   suspended → deprecated   (admin: suspended entity permanently removed)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Platform Invariants:
 *   T3 — tenant_id scoping on all D1 queries
 *   T5 — super_admin role required (enforced at route registration in router.ts)
 *   P2 — FSM engine: assertValidTransition validates every state change
 *   P9 — All FSM transitions are audit-logged
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import {
  getVerticalBySlug,
  extractEntitlements,
  checkActivationRequirements,
  assertValidTransition,
  VerticalFSMError,
  BASE_VERTICAL_FSM,
} from '@webwaka/verticals';
import type { BaseVerticalState } from '@webwaka/verticals';
import { publishEvent } from '../lib/publish-event.js';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

export const platformAdminVerticalsRoutes = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// D1Like
// ---------------------------------------------------------------------------

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      run():   Promise<{ success: boolean; changes?: number }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

interface WorkspaceVerticalRow {
  id:            string;
  workspace_id:  string;
  tenant_id:     string;
  vertical_slug: string;
  state:         string;
  activated_at:  number | null;
  suspended_at:  number | null;
  created_at:    number;
  updated_at:    number;
}

interface WorkspaceVerificationRow {
  id:            string;
  tenant_id:     string;
  owner_id:      string;
  kyc_tier:      number;
  frsc_verified: 0 | 1;
  cac_verified:  0 | 1;
  it_verified:   0 | 1;
  name:          string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getWorkspaceVerification(
  db: D1Like,
  workspaceId: string,
): Promise<WorkspaceVerificationRow | null> {
  return db
    .prepare(
      `SELECT id, tenant_id, owner_id, kyc_tier, frsc_verified, cac_verified, it_verified, name
         FROM workspaces WHERE id = ? LIMIT 1`,
    )
    .bind(workspaceId)
    .first<WorkspaceVerificationRow>();
}

async function getVerticalRow(
  db: D1Like,
  workspaceId: string,
  slug: string,
): Promise<WorkspaceVerticalRow | null> {
  return db
    .prepare(
      `SELECT * FROM workspace_verticals
        WHERE workspace_id = ? AND vertical_slug = ? LIMIT 1`,
    )
    .bind(workspaceId, slug)
    .first<WorkspaceVerticalRow>();
}

async function updateVerticalState(
  db: D1Like,
  rowId: string,
  newState: BaseVerticalState,
  extraFields: Record<string, unknown> = {},
): Promise<void> {
  const setMap: Record<string, unknown> = {
    state:      newState,
    updated_at: Math.floor(Date.now() / 1000),
    ...extraFields,
  };
  const keys   = Object.keys(setMap);
  const setCls = keys.map((k) => `${k} = ?`).join(', ');
  const vals   = [...Object.values(setMap), rowId];

  await db
    .prepare(`UPDATE workspace_verticals SET ${setCls} WHERE id = ?`)
    .bind(...vals)
    .run();
}

// ---------------------------------------------------------------------------
// GET /platform-admin/verticals
//
// Cross-workspace list (super_admin — not tenant-scoped).
// Query params: state, slug, workspaceId, tenantId, limit, cursor
// ---------------------------------------------------------------------------

platformAdminVerticalsRoutes.get('/', async (c) => {
  const db = c.env.DB as unknown as D1Like;
  const {
    state, slug, workspaceId, tenantId,
    limit: rawLimit, cursor,
  } = c.req.query() as Record<string, string | undefined>;

  const limit = Math.min(parseInt(rawLimit ?? '50', 10) || 50, 200);

  const validStates = ['seeded', 'claimed', 'active', 'suspended', 'deprecated'];
  const parts: string[]   = [];
  const params: unknown[] = [];

  if (state && validStates.includes(state)) {
    parts.push('wv.state = ?');
    params.push(state);
  }
  if (slug) {
    parts.push('wv.vertical_slug = ?');
    params.push(slug);
  }
  if (workspaceId) {
    parts.push('wv.workspace_id = ?');
    params.push(workspaceId);
  }
  if (tenantId) {
    parts.push('wv.tenant_id = ?');
    params.push(tenantId);
  }
  if (cursor) {
    parts.push('wv.id > ?');
    params.push(cursor);
  }

  const where = parts.length > 0 ? `WHERE ${parts.join(' AND ')}` : '';
  params.push(limit);

  const { results } = await db
    .prepare(
      `SELECT wv.*, v.display_name, v.category, v.priority,
              w.name as workspace_name, w.kyc_tier, w.frsc_verified, w.cac_verified, w.it_verified
         FROM workspace_verticals wv
         JOIN verticals v ON v.slug = wv.vertical_slug
         JOIN workspaces w ON w.id = wv.workspace_id
         ${where}
        ORDER BY wv.updated_at DESC LIMIT ?`,
    )
    .bind(...params)
    .all<WorkspaceVerticalRow & {
      display_name: string; category: string; priority: number;
      workspace_name: string; kyc_tier: number;
      frsc_verified: 0|1; cac_verified: 0|1; it_verified: 0|1;
    }>();

  return c.json({
    verticals:   results,
    count:       results.length,
    next_cursor: results.length === limit ? (results.at(-1)?.id ?? null) : null,
    filter: { state: state ?? 'all', slug: slug ?? null, workspaceId: workspaceId ?? null },
  });
});

// ---------------------------------------------------------------------------
// GET /platform-admin/verticals/:workspaceId
//
// All verticals for a specific workspace with verification context.
// ---------------------------------------------------------------------------

platformAdminVerticalsRoutes.get('/:workspaceId', async (c) => {
  const db = c.env.DB as unknown as D1Like;
  const workspaceId = c.req.param('workspaceId');

  const ws = await getWorkspaceVerification(db, workspaceId);
  if (!ws) return c.json({ error: 'Workspace not found' }, 404);

  const { results } = await db
    .prepare(
      `SELECT wv.*, v.display_name, v.category, v.priority,
              v.required_kyc_tier, v.requires_frsc, v.requires_cac, v.requires_it
         FROM workspace_verticals wv
         JOIN verticals v ON v.slug = wv.vertical_slug
        WHERE wv.workspace_id = ?
        ORDER BY wv.state ASC, wv.created_at DESC`,
    )
    .bind(workspaceId)
    .all<WorkspaceVerticalRow & {
      display_name: string; category: string; priority: number;
      required_kyc_tier: number; requires_frsc: 0|1; requires_cac: 0|1; requires_it: 0|1;
    }>();

  const ctxBase = {
    workspaceId,
    tenantId:    ws.tenant_id,
    userId:      '',
    kycTier:     (Math.min(3, ws.kyc_tier ?? 0)) as 0|1|2|3,
    frscVerified: ws.frsc_verified === 1,
    cacVerified:  ws.cac_verified === 1,
    itVerified:   ws.it_verified === 1,
  };

  const annotated = results.map((r) => {
    const out: Record<string, unknown> = { ...r };
    const ents = {
      slug: r.vertical_slug,
      required_kyc_tier: r.required_kyc_tier as 0|1|2|3,
      requires_frsc: r.requires_frsc === 1,
      requires_cac:  r.requires_cac === 1,
      requires_it:   r.requires_it === 1,
      requires_community: false,
      requires_social: false,
    };
    out['unmet_for_active'] = checkActivationRequirements(ents, ctxBase);
    return out;
  });

  return c.json({
    workspace: {
      id:            ws.id,
      name:          ws.name,
      tenant_id:     ws.tenant_id,
      kyc_tier:      ws.kyc_tier,
      frsc_verified: ws.frsc_verified === 1,
      cac_verified:  ws.cac_verified === 1,
      it_verified:   ws.it_verified === 1,
    },
    verticals: annotated,
    count:     results.length,
  });
});

// ---------------------------------------------------------------------------
// POST /platform-admin/verticals/:workspaceId/:slug/claim
//
// Insert a workspace_vertical in 'claimed' state (admin-initiated).
// Idempotent: returns 200 if already at claimed/active/suspended.
// ---------------------------------------------------------------------------

platformAdminVerticalsRoutes.post('/:workspaceId/:slug/claim', async (c) => {
  const db          = c.env.DB as unknown as D1Like;
  const auth        = c.get('auth');
  const workspaceId = c.req.param('workspaceId');
  const slug        = c.req.param('slug');

  let body: { notes?: string } = {};
  try { body = await c.req.json<typeof body>(); } catch { body = {}; }

  const ws = await getWorkspaceVerification(db, workspaceId);
  if (!ws) return c.json({ error: 'Workspace not found' }, 404);

  const verticalResult = await getVerticalBySlug(db, slug);
  if (!verticalResult.found) return c.json({ error: `Vertical '${slug}' not found` }, 404);

  const existing = await getVerticalRow(db, workspaceId, slug);
  if (existing) {
    return c.json({
      message:       'Vertical is already registered for this workspace.',
      current_state: existing.state,
      id:            existing.id,
    }, 200);
  }

  const id  = crypto.randomUUID().replace(/-/g, '');
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT INTO workspace_verticals
         (id, workspace_id, tenant_id, vertical_slug, state, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'claimed', ?, ?)`,
    )
    .bind(id, workspaceId, ws.tenant_id, slug, now, now)
    .run();

  void publishEvent(c.env, {
    eventId:   crypto.randomUUID(),
    eventKey:  'workspace.vertical_claimed',
    tenantId:  ws.tenant_id,
    actorId:   auth.userId,
    actorType: 'admin',
    payload:   { workspace_id: workspaceId, slug, notes: body.notes ?? null, initiated_by: 'platform_admin' },
    source:    'api',
    severity:  'info',
  });

  return c.json({ id, workspace_id: workspaceId, vertical: slug, state: 'claimed', created_at: now }, 201);
});

// ---------------------------------------------------------------------------
// POST /platform-admin/verticals/:workspaceId/:slug/activate
//
// Advance claimed → active.
// Re-validates all entitlement requirements first.
// ---------------------------------------------------------------------------

platformAdminVerticalsRoutes.post('/:workspaceId/:slug/activate', async (c) => {
  const db          = c.env.DB as unknown as D1Like;
  const auth        = c.get('auth');
  const workspaceId = c.req.param('workspaceId');
  const slug        = c.req.param('slug');

  let body: { notes?: string; force?: boolean } = {};
  try { body = await c.req.json<typeof body>(); } catch { body = {}; }

  const ws = await getWorkspaceVerification(db, workspaceId);
  if (!ws) return c.json({ error: 'Workspace not found' }, 404);

  const verticalResult = await getVerticalBySlug(db, slug);
  if (!verticalResult.found) return c.json({ error: `Vertical '${slug}' not found` }, 404);
  const vertical = verticalResult.vertical!;

  const row = await getVerticalRow(db, workspaceId, slug);

  // Validate FSM transition
  const fromState: BaseVerticalState = (row?.state as BaseVerticalState) ?? 'claimed';
  const toState:   BaseVerticalState = 'active';

  if (row && row.state === 'active') {
    return c.json({ message: 'Vertical is already active.', state: 'active', id: row.id }, 200);
  }

  try {
    assertValidTransition(
      { ...BASE_VERTICAL_FSM, slug },
      fromState,
      toState,
    );
  } catch (err) {
    if (err instanceof VerticalFSMError) {
      return c.json({ error: err.message, code: err.code, from: fromState, to: toState }, 422);
    }
    throw err;
  }

  // Re-check entitlement requirements (unless admin explicitly forces with ?force=true)
  const entitlements = extractEntitlements(vertical);
  const ctx = {
    workspaceId,
    tenantId:     ws.tenant_id,
    userId:       auth.userId,
    kycTier:     (Math.min(3, ws.kyc_tier ?? 0)) as 0|1|2|3,
    frscVerified: ws.frsc_verified === 1,
    cacVerified:  ws.cac_verified === 1,
    itVerified:   ws.it_verified === 1,
  };

  const unmet = checkActivationRequirements(entitlements, ctx);
  if (unmet.length > 0 && !body.force) {
    return c.json({
      error:              'ENTITLEMENT_REQUIREMENTS_UNMET',
      vertical:           slug,
      unmet_requirements: unmet,
      hint:               'Update the workspace verification flags first, or pass { "force": true } to override.',
    }, 422);
  }

  const now = Math.floor(Date.now() / 1000);

  if (row) {
    await updateVerticalState(db, row.id, 'active', { activated_at: now });
  } else {
    const id = crypto.randomUUID().replace(/-/g, '');
    await db
      .prepare(
        `INSERT INTO workspace_verticals
           (id, workspace_id, tenant_id, vertical_slug, state, activated_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'active', ?, ?, ?)`,
      )
      .bind(id, workspaceId, ws.tenant_id, slug, now, now, now)
      .run();
  }

  void publishEvent(c.env, {
    eventId:   crypto.randomUUID(),
    eventKey:  'workspace.vertical_activated',
    tenantId:  ws.tenant_id,
    actorId:   auth.userId,
    actorType: 'admin',
    payload: {
      workspace_id:  workspaceId,
      slug,
      display_name:  vertical.display_name,
      notes:         body.notes ?? null,
      forced:        !!body.force,
      activated_by:  'platform_admin',
    },
    source:   'api',
    severity: 'info',
  });

  return c.json({
    message:      `Vertical '${vertical.display_name}' activated for workspace.`,
    workspace_id: workspaceId,
    vertical:     slug,
    state:        'active',
    activated_at: now,
    forced:       !!body.force,
  });
});

// ---------------------------------------------------------------------------
// POST /platform-admin/verticals/:workspaceId/:slug/suspend
//
// Suspend an active or claimed vertical.
// ---------------------------------------------------------------------------

platformAdminVerticalsRoutes.post('/:workspaceId/:slug/suspend', async (c) => {
  const db          = c.env.DB as unknown as D1Like;
  const auth        = c.get('auth');
  const workspaceId = c.req.param('workspaceId');
  const slug        = c.req.param('slug');

  let body: { reason?: string; notes?: string } = {};
  try { body = await c.req.json<typeof body>(); } catch { body = {}; }

  if (!body.reason || body.reason.trim().length < 5) {
    return c.json({ error: 'reason is required (minimum 5 characters).' }, 400);
  }

  const ws = await getWorkspaceVerification(db, workspaceId);
  if (!ws) return c.json({ error: 'Workspace not found' }, 404);

  const row = await getVerticalRow(db, workspaceId, slug);
  if (!row) return c.json({ error: `Vertical '${slug}' is not registered for this workspace.` }, 404);

  if (row.state === 'suspended') {
    return c.json({ message: 'Vertical is already suspended.', state: 'suspended' }, 200);
  }
  if (row.state === 'deprecated') {
    return c.json({ error: 'Cannot suspend a deprecated vertical.' }, 409);
  }

  try {
    assertValidTransition({ ...BASE_VERTICAL_FSM, slug }, row.state as BaseVerticalState, 'suspended');
  } catch (err) {
    if (err instanceof VerticalFSMError) {
      return c.json({ error: err.message, code: err.code }, 422);
    }
    throw err;
  }

  const now = Math.floor(Date.now() / 1000);
  await updateVerticalState(db, row.id, 'suspended', { suspended_at: now });

  void publishEvent(c.env, {
    eventId:   crypto.randomUUID(),
    eventKey:  'workspace.vertical_suspended',
    tenantId:  ws.tenant_id,
    actorId:   auth.userId,
    actorType: 'admin',
    payload: {
      workspace_id:  workspaceId,
      slug,
      reason:        body.reason.trim(),
      notes:         body.notes ?? null,
      previous_state: row.state,
    },
    source:   'api',
    severity: 'warning',
  });

  return c.json({
    message:        `Vertical '${slug}' suspended.`,
    workspace_id:   workspaceId,
    vertical:       slug,
    state:          'suspended',
    suspended_at:   now,
    reason:         body.reason.trim(),
  });
});

// ---------------------------------------------------------------------------
// POST /platform-admin/verticals/:workspaceId/:slug/reinstate
//
// Reinstate a suspended vertical back to active.
// Re-validates entitlement requirements before reinstating.
// ---------------------------------------------------------------------------

platformAdminVerticalsRoutes.post('/:workspaceId/:slug/reinstate', async (c) => {
  const db          = c.env.DB as unknown as D1Like;
  const auth        = c.get('auth');
  const workspaceId = c.req.param('workspaceId');
  const slug        = c.req.param('slug');

  let body: { notes?: string; force?: boolean } = {};
  try { body = await c.req.json<typeof body>(); } catch { body = {}; }

  const ws = await getWorkspaceVerification(db, workspaceId);
  if (!ws) return c.json({ error: 'Workspace not found' }, 404);

  const verticalResult = await getVerticalBySlug(db, slug);
  if (!verticalResult.found) return c.json({ error: `Vertical '${slug}' not found` }, 404);
  const vertical = verticalResult.vertical!;

  const row = await getVerticalRow(db, workspaceId, slug);
  if (!row) return c.json({ error: `Vertical '${slug}' is not registered for this workspace.` }, 404);

  if (row.state !== 'suspended') {
    return c.json({ error: `Can only reinstate a suspended vertical. Current state: '${row.state}'.` }, 409);
  }

  try {
    assertValidTransition({ ...BASE_VERTICAL_FSM, slug }, 'suspended', 'active');
  } catch (err) {
    if (err instanceof VerticalFSMError) {
      return c.json({ error: err.message, code: err.code }, 422);
    }
    throw err;
  }

  // Re-validate requirements unless forced
  const entitlements = extractEntitlements(vertical);
  const ctx = {
    workspaceId,
    tenantId:     ws.tenant_id,
    userId:       auth.userId,
    kycTier:     (Math.min(3, ws.kyc_tier ?? 0)) as 0|1|2|3,
    frscVerified: ws.frsc_verified === 1,
    cacVerified:  ws.cac_verified === 1,
    itVerified:   ws.it_verified === 1,
  };

  const unmet = checkActivationRequirements(entitlements, ctx);
  if (unmet.length > 0 && !body.force) {
    return c.json({
      error:              'ENTITLEMENT_REQUIREMENTS_UNMET',
      vertical:           slug,
      unmet_requirements: unmet,
      hint:               'Update the workspace verification flags first, or pass { "force": true } to override.',
    }, 422);
  }

  const now = Math.floor(Date.now() / 1000);
  await updateVerticalState(db, row.id, 'active', { activated_at: now, suspended_at: null });

  void publishEvent(c.env, {
    eventId:   crypto.randomUUID(),
    eventKey:  'workspace.vertical_reinstated',
    tenantId:  ws.tenant_id,
    actorId:   auth.userId,
    actorType: 'admin',
    payload: {
      workspace_id: workspaceId,
      slug,
      display_name: vertical.display_name,
      notes:        body.notes ?? null,
      forced:       !!body.force,
    },
    source:   'api',
    severity: 'info',
  });

  return c.json({
    message:        `Vertical '${vertical.display_name}' reinstated.`,
    workspace_id:   workspaceId,
    vertical:       slug,
    state:          'active',
    activated_at:   now,
  });
});

// ---------------------------------------------------------------------------
// POST /platform-admin/verticals/:workspaceId/:slug/deprecate
//
// Permanently deprecate a vertical — IRREVERSIBLE.
// ---------------------------------------------------------------------------

platformAdminVerticalsRoutes.post('/:workspaceId/:slug/deprecate', async (c) => {
  const db          = c.env.DB as unknown as D1Like;
  const auth        = c.get('auth');
  const workspaceId = c.req.param('workspaceId');
  const slug        = c.req.param('slug');

  let body: { reason?: string; notes?: string } = {};
  try { body = await c.req.json<typeof body>(); } catch { body = {}; }

  if (!body.reason || body.reason.trim().length < 5) {
    return c.json({ error: 'reason is required (minimum 5 characters). This action is irreversible.' }, 400);
  }

  const ws = await getWorkspaceVerification(db, workspaceId);
  if (!ws) return c.json({ error: 'Workspace not found' }, 404);

  const row = await getVerticalRow(db, workspaceId, slug);
  if (!row) return c.json({ error: `Vertical '${slug}' is not registered for this workspace.` }, 404);

  if (row.state === 'deprecated') {
    return c.json({ message: 'Vertical is already deprecated.', state: 'deprecated' }, 200);
  }

  try {
    assertValidTransition({ ...BASE_VERTICAL_FSM, slug }, row.state as BaseVerticalState, 'deprecated');
  } catch (err) {
    if (err instanceof VerticalFSMError) {
      return c.json({ error: err.message, code: err.code }, 422);
    }
    throw err;
  }

  const now = Math.floor(Date.now() / 1000);
  await updateVerticalState(db, row.id, 'deprecated', {});

  void publishEvent(c.env, {
    eventId:   crypto.randomUUID(),
    eventKey:  'workspace.vertical_deprecated',
    tenantId:  ws.tenant_id,
    actorId:   auth.userId,
    actorType: 'admin',
    payload: {
      workspace_id:   workspaceId,
      slug,
      reason:         body.reason.trim(),
      notes:          body.notes ?? null,
      previous_state: row.state,
    },
    source:   'api',
    severity: 'critical',
  });

  return c.json({
    message:      `Vertical '${slug}' has been permanently deprecated. This action cannot be reversed.`,
    workspace_id: workspaceId,
    vertical:     slug,
    state:        'deprecated',
    deprecated_at: now,
    reason:       body.reason.trim(),
  });
});
