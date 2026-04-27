/**
 * WakaPage management routes — Phase 1 (ADR-0041)
 *
 * Route map:
 *   POST   /wakapages                        — create a WakaPage for the workspace
 *   GET    /wakapages/:id                    — fetch a WakaPage (workspace-scoped)
 *   PATCH  /wakapages/:id                    — update page metadata / settings
 *   POST   /wakapages/:id/blocks             — add a block to a page
 *   PATCH  /wakapages/:id/blocks/:blockId    — update a block config / sort order
 *   DELETE /wakapages/:id/blocks/:blockId    — remove a block from a page
 *   POST   /wakapages/:id/publish            — publish page (updates search_entries + emits event)
 *
 * Platform Invariants:
 *   T3  — tenant_id from JWT auth on every query; never from request body or headers
 *   P9  — no monetary fields
 *   ADR-0041 D2 — WakaPage slugs live in wakapage_pages.slug (not profiles.slug)
 *   ADR-0041 D4 — entitlement gating via requireWakaPageAccess from @webwaka/entitlements
 *
 * Auth: all routes require auth (applied at app level in router.ts).
 * Write roles: admin and super_admin only (no owner role — not in platform Role enum).
 *
 * Phase 1 scope: page CRUD, block CRUD, publish flow.
 * NOT in scope: public renderer, builder UI, analytics dashboard (Phase 2+).
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import { SubscriptionStatus } from '@webwaka/types';
import { PLAN_CONFIGS, EntitlementError } from '@webwaka/entitlements';
import { WakaPageEventType } from '@webwaka/events';
import { BLOCK_TYPES } from '@webwaka/wakapage-blocks';
import type { BlockType } from '@webwaka/wakapage-blocks';
import { publishEvent } from '../lib/publish-event.js';
import { indexWakaPage, removeWakaPageFromIndex } from '../lib/search-index.js';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

// ---------------------------------------------------------------------------
// D1Like duck-typed interface (project-wide pattern — no @cloudflare/workers-types)
// Must be compatible with search-index.ts D1Like (no top-level .run() on prepared stmt).
// ---------------------------------------------------------------------------

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      run(): Promise<unknown>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    run(): Promise<unknown>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

// ---------------------------------------------------------------------------
// Row shapes
// ---------------------------------------------------------------------------

interface WakaPageRow {
  id: string;
  tenant_id: string;
  workspace_id: string;
  profile_id: string;
  slug: string;
  slug_source: string;
  publication_state: string;
  title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  analytics_enabled: number;
  template_installation_id: string | null;
  custom_theme_json: string | null;
  published_at: number | null;
  scheduled_publish_at: number | null;
  created_at: number;
  updated_at: number;
}

interface BlockRow {
  id: string;
  page_id: string;
  tenant_id: string;
  block_type: string;
  sort_order: number;
  is_visible: number;
  config_json: string;
  created_at: number;
  updated_at: number;
}

// Shape returned when joining wakapage_pages + profiles for publish
interface PublishPageRow extends WakaPageRow {
  subject_type: string | null;
  subject_id: string | null;
  display_name: string | null;
  primary_place_id: string | null;
}

// ---------------------------------------------------------------------------
// Workspace row (from D1)
// ---------------------------------------------------------------------------

interface WorkspaceDbRow {
  subscription_status: string;
  subscription_plan: string;
}

// ---------------------------------------------------------------------------
// Entitlement helpers — check WakaPage access from workspace DB row
// ---------------------------------------------------------------------------

async function loadWorkspace(
  db: D1Like,
  tenantId: string,
  workspaceId: string,
): Promise<WorkspaceDbRow | null> {
  return db
    .prepare(
      `SELECT subscription_status, subscription_plan
       FROM workspaces WHERE id = ? AND tenant_id = ? LIMIT 1`,
    )
    .bind(workspaceId, tenantId)
    .first<WorkspaceDbRow>();
}

function assertWakaPageEntitlement(ws: WorkspaceDbRow): void {
  const isActive =
    ws.subscription_status === SubscriptionStatus.Active ||
    ws.subscription_status === SubscriptionStatus.Trialing;
  if (!isActive) {
    throw new EntitlementError(
      `WakaPage access denied: subscription is ${ws.subscription_status}. Renew to continue.`,
    );
  }
  const plan = ws.subscription_plan as import('@webwaka/types').SubscriptionPlan;
  if (!PLAN_CONFIGS[plan]?.wakaPagePublicPage) {
    throw new EntitlementError(
      `WakaPage access denied: plan '${ws.subscription_plan}' does not include WakaPage. Upgrade to Starter or above.`,
    );
  }
}

// ---------------------------------------------------------------------------
// Slug helpers
// ---------------------------------------------------------------------------

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-|-$/g, '');
}

// ---------------------------------------------------------------------------
// ID generators — follow the `prefix_${uuid_hex_slice}` pattern in the codebase
// ---------------------------------------------------------------------------

function genPageId(): string {
  return `wp_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

function genBlockId(): string {
  return `blk_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

// ---------------------------------------------------------------------------
// Role guard — write operations require admin or super_admin
// ---------------------------------------------------------------------------

function requireWriteRole(auth: AuthContext): boolean {
  return auth.role === 'admin' || auth.role === 'super_admin';
}

// BLOCK_TYPES is the canonical runtime set of valid block type strings.
// It is imported from @webwaka/wakapage-blocks (the single source of truth)
// and mirrors the wakapage_blocks.block_type CHECK constraint in migration 0420.
// To add a block type: extend BlockType + BLOCK_TYPES in the package, then add a migration.

// ---------------------------------------------------------------------------
// Route registration
// ---------------------------------------------------------------------------

export const wakaPageRoutes = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// POST /wakapages — create a WakaPage for the authenticated workspace
// ---------------------------------------------------------------------------

wakaPageRoutes.post('/', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId || !auth.workspaceId) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  if (!requireWriteRole(auth)) {
    return c.json({ error: 'admin or super_admin role required to create a WakaPage' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;

  // Entitlement check
  const ws = await loadWorkspace(db, String(auth.tenantId), String(auth.workspaceId));
  if (!ws) return c.json({ error: 'Workspace not found' }, 404);
  try {
    assertWakaPageEntitlement(ws);
  } catch (err) {
    if (err instanceof EntitlementError) return c.json({ error: err.message }, 403);
    throw err;
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await c.req.json() as Record<string, unknown>;
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const profileId = typeof body.profile_id === 'string' ? body.profile_id.trim() : '';
  if (!profileId) {
    return c.json({ error: 'profile_id is required' }, 400);
  }

  // Verify profile belongs to this tenant (T3)
  const profile = await db
    .prepare(
      `SELECT id, subject_type, subject_id, display_name, primary_place_id
       FROM profiles WHERE id = ? AND tenant_id = ? LIMIT 1`,
    )
    .bind(profileId, String(auth.tenantId))
    .first<{ id: string; subject_type: string | null; display_name: string | null; primary_place_id: string | null }>();
  if (!profile) {
    return c.json({ error: 'profile_id not found or not accessible' }, 404);
  }

  // MVP: one page per workspace — check for existing
  const existing = await db
    .prepare(
      `SELECT id FROM wakapage_pages
       WHERE tenant_id = ? AND workspace_id = ? LIMIT 1`,
    )
    .bind(String(auth.tenantId), String(auth.workspaceId))
    .first<{ id: string }>();
  if (existing) {
    return c.json({
      error: 'A WakaPage already exists for this workspace',
      existingPageId: existing.id,
    }, 409);
  }

  // Build slug
  const rawSlug = typeof body.slug === 'string' && body.slug.trim()
    ? slugify(body.slug.trim())
    : slugify(profile.display_name ?? profileId);

  if (!rawSlug) {
    return c.json({ error: 'Could not derive a valid slug — provide slug explicitly' }, 400);
  }

  // Check slug uniqueness within tenant namespace
  const slugConflict = await db
    .prepare(`SELECT id FROM wakapage_pages WHERE tenant_id = ? AND slug = ? LIMIT 1`)
    .bind(String(auth.tenantId), rawSlug)
    .first<{ id: string }>();
  if (slugConflict) {
    return c.json({ error: `Slug '${rawSlug}' is already taken. Provide a different slug.` }, 409);
  }

  const title = typeof body.title === 'string' ? body.title.trim() || null : null;
  const metaDescription = typeof body.meta_description === 'string'
    ? body.meta_description.trim().slice(0, 160) || null
    : null;
  const slugSource = typeof body.slug === 'string' && body.slug.trim()
    ? 'custom'
    : 'derived_from_display_name';

  const pageId = genPageId();
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT INTO wakapage_pages
         (id, tenant_id, workspace_id, profile_id, slug, slug_source,
          publication_state, title, meta_description,
          analytics_enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?, 1, unixepoch(), unixepoch())`,
    )
    .bind(
      pageId, String(auth.tenantId), String(auth.workspaceId), profileId,
      rawSlug, slugSource, title, metaDescription,
    )
    .run();

  // Emit event (fire-and-forget; non-fatal if queue not bound)
  try {
    await publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: WakaPageEventType.WakaPageCreated,
      tenantId: String(auth.tenantId),
      workspaceId: String(auth.workspaceId),
      actorId: String(auth.userId),
      actorType: 'user',
      subjectId: pageId,
      subjectType: 'wakapage',
      payload: { pageId, profileId, slug: rawSlug },
    });
  } catch {
    // Non-fatal
  }

  return c.json({
    page: {
      id: pageId,
      tenantId: String(auth.tenantId),
      workspaceId: String(auth.workspaceId),
      profileId,
      slug: rawSlug,
      slugSource,
      publicationState: 'draft',
      title,
      metaDescription,
      analyticsEnabled: true,
      createdAt: now,
    },
  }, 201);
});

// ---------------------------------------------------------------------------
// GET /wakapages/:id — fetch a WakaPage and its blocks
// ---------------------------------------------------------------------------

wakaPageRoutes.get('/:id', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId || !auth.workspaceId) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const { id } = c.req.param();
  const db = c.env.DB as unknown as D1Like;

  // T3: scope by tenant_id AND workspace_id
  const page = await db
    .prepare(
      `SELECT wp.* FROM wakapage_pages wp
       WHERE wp.id = ? AND wp.tenant_id = ? AND wp.workspace_id = ? LIMIT 1`,
    )
    .bind(id, String(auth.tenantId), String(auth.workspaceId))
    .first<WakaPageRow>();

  if (!page) {
    return c.json({ error: 'WakaPage not found' }, 404);
  }

  // Load blocks ordered by sort_order
  const { results: blocks } = await db
    .prepare(
      `SELECT id, block_type, sort_order, is_visible, config_json, created_at, updated_at
       FROM wakapage_blocks
       WHERE page_id = ? AND tenant_id = ?
       ORDER BY sort_order ASC, created_at ASC`,
    )
    .bind(id, String(auth.tenantId))
    .all<Pick<BlockRow, 'id' | 'block_type' | 'sort_order' | 'is_visible' | 'config_json' | 'created_at' | 'updated_at'>>();

  return c.json({
    page: {
      id: page.id,
      tenantId: page.tenant_id,
      workspaceId: page.workspace_id,
      profileId: page.profile_id,
      slug: page.slug,
      slugSource: page.slug_source,
      publicationState: page.publication_state,
      title: page.title,
      metaDescription: page.meta_description,
      ogImageUrl: page.og_image_url,
      analyticsEnabled: page.analytics_enabled === 1,
      templateInstallationId: page.template_installation_id,
      publishedAt: page.published_at,
      scheduledPublishAt: page.scheduled_publish_at,
      createdAt: page.created_at,
      updatedAt: page.updated_at,
    },
    blocks: blocks.map(b => ({
      id: b.id,
      blockType: b.block_type,
      sortOrder: b.sort_order,
      isVisible: b.is_visible === 1,
      configJson: b.config_json,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    })),
  });
});

// ---------------------------------------------------------------------------
// PATCH /wakapages/:id — update page metadata
// ---------------------------------------------------------------------------

wakaPageRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId || !auth.workspaceId) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  if (!requireWriteRole(auth)) {
    return c.json({ error: 'admin or super_admin role required' }, 403);
  }

  const { id } = c.req.param();
  const db = c.env.DB as unknown as D1Like;

  // T3 + ownership check
  const page = await db
    .prepare(
      `SELECT id, slug, publication_state FROM wakapage_pages
       WHERE id = ? AND tenant_id = ? AND workspace_id = ? LIMIT 1`,
    )
    .bind(id, String(auth.tenantId), String(auth.workspaceId))
    .first<Pick<WakaPageRow, 'id' | 'slug' | 'publication_state'>>();
  if (!page) return c.json({ error: 'WakaPage not found' }, 404);

  let body: Record<string, unknown>;
  try {
    body = await c.req.json() as Record<string, unknown>;
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  // Build update set
  const setClauses: string[] = [];
  const values: unknown[] = [];

  if (typeof body.title === 'string') {
    setClauses.push('title = ?');
    values.push(body.title.trim() || null);
  }
  if (typeof body.meta_description === 'string') {
    setClauses.push('meta_description = ?');
    values.push(body.meta_description.trim().slice(0, 160) || null);
  }
  if (typeof body.og_image_url === 'string') {
    setClauses.push('og_image_url = ?');
    values.push(body.og_image_url.trim() || null);
  }
  if (typeof body.analytics_enabled === 'boolean') {
    setClauses.push('analytics_enabled = ?');
    values.push(body.analytics_enabled ? 1 : 0);
  }
  if (typeof body.custom_theme_json === 'string') {
    setClauses.push('custom_theme_json = ?');
    values.push(body.custom_theme_json || null);
  }
  if (typeof body.template_installation_id === 'string') {
    setClauses.push('template_installation_id = ?');
    values.push(body.template_installation_id.trim() || null);
  }
  if (typeof body.slug === 'string' && body.slug.trim()) {
    const newSlug = slugify(body.slug.trim());
    if (!newSlug) return c.json({ error: 'Invalid slug' }, 400);
    if (newSlug !== page.slug) {
      const conflict = await db
        .prepare(`SELECT id FROM wakapage_pages WHERE tenant_id = ? AND slug = ? AND id != ? LIMIT 1`)
        .bind(String(auth.tenantId), newSlug, id)
        .first<{ id: string }>();
      if (conflict) return c.json({ error: `Slug '${newSlug}' is already taken` }, 409);
      setClauses.push('slug = ?');
      values.push(newSlug);
      setClauses.push("slug_source = 'custom'");
    }
  }

  if (setClauses.length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }

  setClauses.push('updated_at = unixepoch()');
  // Include workspace_id in UPDATE predicate for defence-in-depth (T3 hardening).
  // The preceding SELECT already verified ownership; this is a belt-and-suspenders guard.
  values.push(id, String(auth.tenantId), String(auth.workspaceId));

  await db
    .prepare(`UPDATE wakapage_pages SET ${setClauses.join(', ')} WHERE id = ? AND tenant_id = ? AND workspace_id = ?`)
    .bind(...values)
    .run();

  return c.json({ success: true, pageId: id });
});

// ---------------------------------------------------------------------------
// POST /wakapages/:id/blocks — add a block to a page
// ---------------------------------------------------------------------------

wakaPageRoutes.post('/:id/blocks', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId || !auth.workspaceId) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  if (!requireWriteRole(auth)) {
    return c.json({ error: 'admin or super_admin role required' }, 403);
  }

  const { id: pageId } = c.req.param();
  const db = c.env.DB as unknown as D1Like;

  // T3: verify page belongs to tenant + workspace
  const page = await db
    .prepare(
      `SELECT id FROM wakapage_pages
       WHERE id = ? AND tenant_id = ? AND workspace_id = ? LIMIT 1`,
    )
    .bind(pageId, String(auth.tenantId), String(auth.workspaceId))
    .first<{ id: string }>();
  if (!page) return c.json({ error: 'WakaPage not found' }, 404);

  let body: Record<string, unknown>;
  try {
    body = await c.req.json() as Record<string, unknown>;
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const blockType = typeof body.block_type === 'string' ? body.block_type.trim() : '';
  if (!blockType) return c.json({ error: 'block_type is required' }, 400);
  if (!BLOCK_TYPES.has(blockType as BlockType)) {
    return c.json({ error: `Invalid block_type '${blockType}'. Must be one of the MVP block types.` }, 400);
  }

  // Config JSON: accept as object or pre-serialised string
  let configJson = '{}';
  if (typeof body.config_json === 'string') {
    try { JSON.parse(body.config_json); configJson = body.config_json; } catch {
      return c.json({ error: 'config_json must be valid JSON' }, 400);
    }
  } else if (body.config_json !== null && body.config_json !== undefined && typeof body.config_json === 'object') {
    configJson = JSON.stringify(body.config_json);
  }

  const isVisible = typeof body.is_visible === 'boolean' ? body.is_visible : true;
  const blockId = genBlockId();

  // Sort order: explicit value or append to end
  let finalSortOrder: number;
  if (typeof body.sort_order === 'number') {
    finalSortOrder = Math.floor(body.sort_order);
  } else {
    const maxRow = await db
      .prepare(
        `SELECT COALESCE(MAX(sort_order), -1) AS max_order
         FROM wakapage_blocks WHERE page_id = ? AND tenant_id = ?`,
      )
      .bind(pageId, String(auth.tenantId))
      .first<{ max_order: number }>();
    finalSortOrder = (maxRow?.max_order ?? -1) + 1;
  }

  await db
    .prepare(
      `INSERT INTO wakapage_blocks
         (id, page_id, tenant_id, block_type, sort_order, is_visible, config_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(blockId, pageId, String(auth.tenantId), blockType, finalSortOrder, isVisible ? 1 : 0, configJson)
    .run();

  // Emit event (fire-and-forget)
  try {
    await publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: WakaPageEventType.WakaPageBlockAdded,
      tenantId: String(auth.tenantId),
      workspaceId: String(auth.workspaceId),
      actorId: String(auth.userId),
      actorType: 'user',
      subjectId: pageId,
      subjectType: 'wakapage',
      payload: { blockId, blockType, pageId },
    });
  } catch {
    // Non-fatal
  }

  return c.json({
    block: {
      id: blockId,
      pageId,
      blockType,
      sortOrder: finalSortOrder,
      isVisible,
      configJson,
      createdAt: Math.floor(Date.now() / 1000),
    },
  }, 201);
});

// ---------------------------------------------------------------------------
// PATCH /wakapages/:id/blocks/:blockId — update a block
// ---------------------------------------------------------------------------

wakaPageRoutes.patch('/:id/blocks/:blockId', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId || !auth.workspaceId) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  if (!requireWriteRole(auth)) {
    return c.json({ error: 'admin or super_admin role required' }, 403);
  }

  const { id: pageId, blockId } = c.req.param();
  const db = c.env.DB as unknown as D1Like;

  // T3: verify block belongs to page → page belongs to tenant + workspace
  const block = await db
    .prepare(
      `SELECT wb.id, wb.block_type
       FROM wakapage_blocks wb
       JOIN wakapage_pages wp ON wp.id = wb.page_id
       WHERE wb.id = ? AND wb.page_id = ? AND wb.tenant_id = ? AND wp.workspace_id = ?
       LIMIT 1`,
    )
    .bind(blockId, pageId, String(auth.tenantId), String(auth.workspaceId))
    .first<{ id: string; block_type: string }>();
  if (!block) return c.json({ error: 'Block not found' }, 404);

  let body: Record<string, unknown>;
  try {
    body = await c.req.json() as Record<string, unknown>;
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const setClauses: string[] = [];
  const values: unknown[] = [];

  if (typeof body.sort_order === 'number') {
    setClauses.push('sort_order = ?');
    values.push(Math.floor(body.sort_order));
  }
  if (typeof body.is_visible === 'boolean') {
    setClauses.push('is_visible = ?');
    values.push(body.is_visible ? 1 : 0);
  }
  if (body.config_json !== undefined) {
    let configJson: string;
    if (typeof body.config_json === 'string') {
      try { JSON.parse(body.config_json); configJson = body.config_json; } catch {
        return c.json({ error: 'config_json must be valid JSON' }, 400);
      }
    } else if (typeof body.config_json === 'object' && body.config_json !== null) {
      configJson = JSON.stringify(body.config_json);
    } else {
      return c.json({ error: 'config_json must be an object or JSON string' }, 400);
    }
    setClauses.push('config_json = ?');
    values.push(configJson);
  }

  if (setClauses.length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }

  setClauses.push('updated_at = unixepoch()');
  values.push(blockId, String(auth.tenantId));

  await db
    .prepare(`UPDATE wakapage_blocks SET ${setClauses.join(', ')} WHERE id = ? AND tenant_id = ?`)
    .bind(...values)
    .run();

  // Emit event (fire-and-forget)
  try {
    await publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: WakaPageEventType.WakaPageBlockUpdated,
      tenantId: String(auth.tenantId),
      workspaceId: String(auth.workspaceId),
      actorId: String(auth.userId),
      actorType: 'user',
      subjectId: pageId,
      subjectType: 'wakapage',
      payload: { blockId, pageId },
    });
  } catch {
    // Non-fatal
  }

  return c.json({ success: true, blockId });
});

// ---------------------------------------------------------------------------
// DELETE /wakapages/:id/blocks/:blockId — remove a block
// ---------------------------------------------------------------------------

wakaPageRoutes.delete('/:id/blocks/:blockId', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId || !auth.workspaceId) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  if (!requireWriteRole(auth)) {
    return c.json({ error: 'admin or super_admin role required' }, 403);
  }

  const { id: pageId, blockId } = c.req.param();
  const db = c.env.DB as unknown as D1Like;

  // T3: verify block → page → tenant + workspace ownership
  const found = await db
    .prepare(
      `SELECT wb.id
       FROM wakapage_blocks wb
       JOIN wakapage_pages wp ON wp.id = wb.page_id
       WHERE wb.id = ? AND wb.page_id = ? AND wb.tenant_id = ? AND wp.workspace_id = ?
       LIMIT 1`,
    )
    .bind(blockId, pageId, String(auth.tenantId), String(auth.workspaceId))
    .first<{ id: string }>();
  if (!found) return c.json({ error: 'Block not found' }, 404);

  await db
    .prepare(`DELETE FROM wakapage_blocks WHERE id = ? AND tenant_id = ?`)
    .bind(blockId, String(auth.tenantId))
    .run();

  // Emit event (fire-and-forget)
  try {
    await publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: WakaPageEventType.WakaPageBlockRemoved,
      tenantId: String(auth.tenantId),
      workspaceId: String(auth.workspaceId),
      actorId: String(auth.userId),
      actorType: 'user',
      subjectId: pageId,
      subjectType: 'wakapage',
      payload: { blockId, pageId },
    });
  } catch {
    // Non-fatal
  }

  return c.json({ success: true });
});

// ---------------------------------------------------------------------------
// POST /wakapages/:id/publish — publish the page
// ---------------------------------------------------------------------------

wakaPageRoutes.post('/:id/publish', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId || !auth.workspaceId) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  if (!requireWriteRole(auth)) {
    return c.json({ error: 'admin or super_admin role required' }, 403);
  }

  const { id: pageId } = c.req.param();
  const db = c.env.DB as unknown as D1Like;

  // T3 + ownership — join profiles to get display_name + place_id for search indexing
  const page = await db
    .prepare(
      `SELECT wp.id, wp.tenant_id, wp.workspace_id, wp.profile_id, wp.slug,
              wp.slug_source, wp.publication_state, wp.title, wp.meta_description,
              wp.og_image_url, wp.analytics_enabled, wp.template_installation_id,
              wp.custom_theme_json, wp.published_at, wp.scheduled_publish_at,
              wp.created_at, wp.updated_at,
              p.subject_type, p.subject_id, p.display_name, p.primary_place_id
       FROM wakapage_pages wp
       JOIN profiles p ON p.id = wp.profile_id
       WHERE wp.id = ? AND wp.tenant_id = ? AND wp.workspace_id = ?
       LIMIT 1`,
    )
    .bind(pageId, String(auth.tenantId), String(auth.workspaceId))
    .first<PublishPageRow>();
  if (!page) return c.json({ error: 'WakaPage not found' }, 404);

  if (page.publication_state === 'archived') {
    return c.json({ error: 'Archived pages cannot be published. Create a new page.' }, 409);
  }

  // Re-check entitlement on publish (plan could have changed since page was created)
  const ws = await loadWorkspace(db, String(auth.tenantId), String(auth.workspaceId));
  if (!ws) return c.json({ error: 'Workspace not found' }, 404);
  try {
    assertWakaPageEntitlement(ws);
  } catch (err) {
    if (err instanceof EntitlementError) return c.json({ error: err.message }, 403);
    throw err;
  }

  const publishedAt = Math.floor(Date.now() / 1000);

  // Update publication state
  await db
    .prepare(
      `UPDATE wakapage_pages
       SET publication_state = 'published',
           published_at = ?,
           updated_at = unixepoch()
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(publishedAt, pageId, String(auth.tenantId))
    .run();

  // Update search_entries — non-fatal; must never break the publish response
  try {
    const entityType: 'individual' | 'organization' =
      page.subject_type === 'individual' ? 'individual' : 'organization';
    await indexWakaPage(db, {
      pageId,
      entityId: page.subject_id ?? page.profile_id,
      entityType,
      displayName: page.display_name ?? page.slug,
      slug: page.slug,
      tenantId: String(auth.tenantId) as import('@webwaka/types').TenantId,
      placeId: page.primary_place_id,
      publishedAt,
    });
  } catch (err) {
    console.error('[wakapage] indexWakaPage failed (non-fatal):', err);
  }

  // Emit WakaPagePublished event (fire-and-forget)
  try {
    await publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: WakaPageEventType.WakaPagePublished,
      tenantId: String(auth.tenantId),
      workspaceId: String(auth.workspaceId),
      actorId: String(auth.userId),
      actorType: 'user',
      subjectId: pageId,
      subjectType: 'wakapage',
      payload: {
        pageId,
        slug: page.slug,
        profileId: page.profile_id,
        publishedAt,
      },
    });
  } catch {
    // Non-fatal
  }

  return c.json({
    success: true,
    pageId,
    slug: page.slug,
    publicationState: 'published',
    publishedAt,
  });
});

// removeWakaPageFromIndex is exported from apps/api/src/lib/search-index.ts.
// Import it from there directly; do not re-export it from this route module.
