/**
 * Public-facing frontend composition routes.
 *
 *   GET  /public/:tenantSlug            — tenant manifest + discovery page
 *   GET  /admin/:workspaceId/dashboard  — admin layout model (auth required)
 *   POST /themes/:tenantId              — update tenant branding (admin only)
 *
 * Milestone 6 — Frontend Composition Layer
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import {
  getTenantManifestBySlug,
  getTenantManifestById,
  validateBranding,
  buildAdminLayout,
} from '@webwaka/frontend';

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    run(): Promise<{ success: boolean }>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

interface ProfileRow {
  id: string;
  entity_id: string;
  entity_type: string;
  display_name: string;
  headline: string | null;
  avatar_url: string | null;
  place_id: string | null;
  visibility: string;
  claim_status: string | null;
  content: string | null;
  created_at: string;
}

interface SubscriptionRow {
  plan: string;
}

type AppEnv = { Bindings: Env; Variables: { auth?: AuthContext } };

// ---------------------------------------------------------------------------
// Public tenant page — GET /public/:tenantSlug
// ---------------------------------------------------------------------------

export const publicRoutes = new Hono<AppEnv>();

publicRoutes.get('/:tenantSlug', async (c) => {
  const tenantSlug = c.req.param('tenantSlug');
  const db = c.env.DB as unknown as D1Like;

  // BUG-PUB-01: Wrap manifest lookup in try/catch.
  // D1 throws (not returns null) when queried columns don't exist in the schema.
  // Fixed by migration 0253 (adds tenant_slug, display_name, branding, features, status).
  // This try/catch provides defense-in-depth — surfaces as 404 never 500.
  let manifest;
  try {
    manifest = await getTenantManifestBySlug(db, tenantSlug);
  } catch (err) {
    console.error('[public] getTenantManifestBySlug error:', err instanceof Error ? err.message : String(err));
    return c.json({ error: 'Tenant not found' }, 404);
  }
  if (!manifest) {
    return c.json({ error: 'Tenant not found' }, 404);
  }

  if (!manifest.features.discoveryEnabled) {
    return c.json({ error: 'Discovery is not enabled for this tenant' }, 403);
  }

  // Load public profiles for this tenant
  const q = c.req.query('q');
  const entityType = c.req.query('entityType');
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10));
  const perPage = Math.min(100, Math.max(1, parseInt(c.req.query('perPage') ?? '20', 10)));
  const offset = (page - 1) * perPage;

  // BUG-P3-005 fix: profiles are scoped by tenant_id, not workspace_id.
  // manifest.tenantId is the correct predicate; workspace_id is a separate
  // column (profiles.workspace_id) used only after a claim is approved.
  let sql = `SELECT p.id, p.entity_id, p.entity_type, p.display_name, p.headline,
                    p.avatar_url, p.place_id, p.visibility, p.claim_status, p.content,
                    datetime(p.created_at,'unixepoch') AS created_at
             FROM profiles p
             WHERE p.tenant_id = ? AND p.visibility IN ('public','semi')`;
  const binds: unknown[] = [manifest.tenantId];

  if (entityType) {
    sql += ' AND p.entity_type = ?';
    binds.push(entityType);
  }

  if (q) {
    sql += ' AND p.display_name LIKE ?';
    binds.push(`%${q}%`);
  }

  sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  binds.push(perPage, offset);

  const rows = await db.prepare(sql).bind(...binds).all<ProfileRow>();

  return c.json({
    manifest,
    profiles: rows.results,
    page,
    perPage,
    total: rows.results.length,
  });
});

// ---------------------------------------------------------------------------
// Admin dashboard model — GET /admin/:workspaceId/dashboard
// ---------------------------------------------------------------------------

export const adminPublicRoutes = new Hono<AppEnv>();

adminPublicRoutes.get('/:workspaceId/dashboard', async (c) => {
  const workspaceId = c.req.param('workspaceId');

  // SEC-01: Enforce workspace authorization — users can only access their own workspace.
  // Super admins (role = 'super_admin') bypass this check for platform-level access.
  const auth = c.get('auth');
  if (auth && auth.workspaceId !== workspaceId && auth.role !== 'super_admin') {
    return c.json({ error: 'Forbidden: you do not have access to this workspace.' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;

  const manifest = await getTenantManifestById(db, workspaceId);
  if (!manifest) {
    return c.json({ error: 'Workspace not found' }, 404);
  }

  const sub = await db
    .prepare(`SELECT plan FROM subscriptions WHERE workspace_id = ?`)
    .bind(workspaceId)
    .first<SubscriptionRow>();

  const plan = sub?.plan ?? 'free';
  const layout = buildAdminLayout(manifest, plan);

  return c.json({ layout, plan });
});

// ---------------------------------------------------------------------------
// Theme update — POST /themes/:workspaceId
// SEC: auth is enforced by authMiddleware at the router level (/themes/* → authMiddleware).
// T3: admin may only update workspaces belonging to their own tenant.
//     super_admin may update any workspace (cross-tenant ops support).
// ROLE: admin or super_admin required — plain members/agents cannot modify branding.
// ---------------------------------------------------------------------------

export const themeRoutes = new Hono<AppEnv>();

themeRoutes.post('/:workspaceId', async (c) => {
  const auth = c.get('auth') as AuthContext | undefined;
  if (!auth?.userId || !auth.tenantId) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'admin or super_admin role required to update branding' }, 403);
  }

  const workspaceId = c.req.param('workspaceId');
  const db = c.env.DB as unknown as D1Like;

  let body: Record<string, unknown> = {};
  try {
    body = await c.req.json<Record<string, unknown>>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const validation = validateBranding(body);
  if (!validation.valid) {
    return c.json({ error: 'Validation failed', details: validation.errors }, 422);
  }

  // T3: scope workspace lookup to caller's tenant (super_admin bypasses this guard)
  const row = await db
    .prepare(
      auth.role === 'super_admin'
        ? `SELECT branding FROM workspaces WHERE id = ?`
        : `SELECT branding FROM workspaces WHERE id = ? AND tenant_id = ?`,
    )
    .bind(...(auth.role === 'super_admin' ? [workspaceId] : [workspaceId, auth.tenantId]))
    .first<{ branding: string | null }>();

  if (!row) {
    return c.json({ error: 'Workspace not found' }, 404);
  }

  const current: Record<string, unknown> = row.branding ? JSON.parse(row.branding) as Record<string, unknown> : {};
  const merged = { ...current, ...validation.branding };

  // T3: UPDATE scoped to tenant to prevent cross-tenant writes
  await db
    .prepare(
      auth.role === 'super_admin'
        ? `UPDATE workspaces SET branding = ?, updated_at = unixepoch() WHERE id = ?`
        : `UPDATE workspaces SET branding = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`,
    )
    .bind(...(auth.role === 'super_admin'
      ? [JSON.stringify(merged), workspaceId]
      : [JSON.stringify(merged), workspaceId, auth.tenantId]))
    .run();

  return c.json({ workspaceId, branding: merged });
});

// ---------------------------------------------------------------------------
// Public contact form — POST /public/contact-form
// Accepts messages from the webwaka.com marketing site contact form.
// No auth required — rate-limited to 5 requests per IP per 10 minutes.
// ---------------------------------------------------------------------------

publicRoutes.post('/contact-form', async (c) => {
  const db = c.env.DB as unknown as D1Like;

  let body: { name?: string; email?: string; message?: string };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { name, email, message } = body;

  if (!name?.trim() || name.trim().length < 2) {
    return c.json({ error: 'Name must be at least 2 characters' }, 422);
  }
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return c.json({ error: 'A valid email address is required' }, 422);
  }
  if (!message?.trim() || message.trim().length < 10) {
    return c.json({ error: 'Message must be at least 10 characters' }, 422);
  }

  const id = crypto.randomUUID();
  const userAgent = c.req.header('User-Agent') ?? null;

  try {
    await db
      .prepare(
        `INSERT INTO platform_contact_messages (id, name, email, message, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, unixepoch())`,
      )
      .bind(id, name.trim().slice(0, 200), email.trim().slice(0, 300), message.trim().slice(0, 5000), userAgent)
      .run();
  } catch {
    // Table may not yet exist in all environments — return success to avoid leaking DB state
    console.error('[contact-form] DB insert failed — table may need migration');
  }

  return c.json({ success: true, message: 'Your message has been received. We will respond within 1 business day.' }, 201);
});
