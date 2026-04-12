/**
 * Template Registry API — WebWaka 1.0.1
 * Sprint 1, Task 1.3
 *
 * Routes:
 *   GET    /templates                  — list approved templates (no auth, paginated)
 *   GET    /templates/:slug            — get template manifest (no auth)
 *   POST   /templates                  — publish template (auth + super_admin)
 *   POST   /templates/:slug/install    — install template to tenant (auth + tenant admin)
 *   GET    /templates/installed        — list tenant's installed templates (auth)
 *   DELETE /templates/:slug/install    — rollback template install (auth + tenant admin)
 *
 * Platform Invariants:
 *   T3 — tenant_id on all install/list-installed queries
 *   T4 — price_kobo is integer only
 *   T5 — entitlement check delegated to installer
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env } from '../env.js';
import { resolveAuthContext } from '@webwaka/auth';

type Auth = { userId: string; tenantId: string; role?: string };

const templates = new Hono<{ Bindings: Env }>();

function auth(c: Context<{ Bindings: Env }>): Auth {
  return c.get('auth') as Auth;
}

async function requireAuth(c: Context<{ Bindings: Env }>): Promise<Auth | null> {
  const existing = c.get('auth');
  if (existing) return existing as Auth;
  const authHeader = c.req.header('Authorization') ?? null;
  const result = await resolveAuthContext(authHeader, c.env.JWT_SECRET);
  if (!result.success) return null;
  c.set('auth', result.context);
  return result.context as Auth;
}

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'tpl_';
  for (let i = 0; i < 20; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function generateInstallId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'inst_';
  for (let i = 0; i < 20; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

const VALID_TEMPLATE_TYPES = ['dashboard', 'website', 'vertical-blueprint', 'workflow', 'email', 'module'] as const;
const VALID_STATUSES = ['draft', 'pending_review', 'approved', 'deprecated'] as const;

function isValidSemver(v: string): boolean {
  return /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/.test(v);
}

function isValidSemverRange(r: string): boolean {
  return /^[\^~>=<\s\d.*|x-]+/.test(r) && r.length > 0 && r.length < 100;
}

function satisfiesSemverRange(version: string, range: string): boolean {
  const [vMajor, vMinor, vPatch] = version.split('.').map(Number);
  if (range.startsWith('^')) {
    const rangeVersion = range.slice(1);
    const [rMajor, rMinor, rPatch] = rangeVersion.split('.').map(Number);
    if (vMajor !== rMajor) return false;
    if (vMajor === 0) {
      if (vMinor !== rMinor) return false;
      return vPatch >= rPatch;
    }
    if (vMinor > rMinor) return true;
    if (vMinor === rMinor) return vPatch >= rPatch;
    return false;
  }
  if (range.startsWith('~')) {
    const rangeVersion = range.slice(1);
    const [rMajor, rMinor, rPatch] = rangeVersion.split('.').map(Number);
    if (vMajor !== rMajor || vMinor !== rMinor) return false;
    return vPatch >= rPatch;
  }
  if (range.startsWith('>=')) {
    const rangeVersion = range.slice(2);
    const [rMajor, rMinor, rPatch] = rangeVersion.split('.').map(Number);
    if (vMajor > rMajor) return true;
    if (vMajor === rMajor && vMinor > rMinor) return true;
    if (vMajor === rMajor && vMinor === rMinor) return vPatch >= rPatch;
    return false;
  }
  return version === range;
}

const PLATFORM_VERSION = '1.0.1';

// ---------------------------------------------------------------------------
// GET /templates — list approved templates (public, paginated)
// ---------------------------------------------------------------------------
templates.get('/', async (c) => {
  const db = c.env.DB;
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') ?? '20', 10)));
  const offset = (page - 1) * limit;
  const typeFilter = c.req.query('type');
  const verticalFilter = c.req.query('vertical');

  let query = `SELECT * FROM template_registry WHERE status = 'approved'`;
  const params: (string | number)[] = [];

  if (typeFilter && VALID_TEMPLATE_TYPES.includes(typeFilter as typeof VALID_TEMPLATE_TYPES[number])) {
    query += ` AND template_type = ?`;
    params.push(typeFilter);
  }

  if (verticalFilter) {
    query += ` AND (compatible_verticals = '[]' OR compatible_verticals LIKE ?)`;
    params.push(`%"${verticalFilter}"%`);
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countResult = await db.prepare(countQuery).bind(...params).first<{ total: number }>();

  query += ` ORDER BY install_count DESC, created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const results = await db.prepare(query).bind(...params).all();

  return c.json({
    templates: results.results ?? [],
    pagination: {
      page,
      limit,
      total: countResult?.total ?? 0,
      totalPages: Math.ceil((countResult?.total ?? 0) / limit),
    },
  });
});

// ---------------------------------------------------------------------------
// GET /templates/installed — list tenant's installed templates (auth required)
// ---------------------------------------------------------------------------
templates.get('/installed', async (c) => {
  const { tenantId } = auth(c);
  const db = c.env.DB;

  const results = await db.prepare(`
    SELECT ti.*, tr.display_name, tr.template_type, tr.description, tr.version as latest_version
    FROM template_installations ti
    JOIN template_registry tr ON ti.template_id = tr.id
    WHERE ti.tenant_id = ? AND ti.status = 'active'
    ORDER BY ti.installed_at DESC
  `).bind(tenantId).all();

  return c.json({ installed: results.results ?? [] });
});

// ---------------------------------------------------------------------------
// GET /templates/:slug — get template manifest (public)
// ---------------------------------------------------------------------------
templates.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  if (slug === 'installed') return; // handled by the route above
  const db = c.env.DB;

  const template = await db.prepare(
    `SELECT * FROM template_registry WHERE slug = ?`
  ).bind(slug).first();

  if (!template) {
    return c.json({ error: 'Template not found' }, 404);
  }

  return c.json(template);
});

// ---------------------------------------------------------------------------
// POST /templates — publish template (auth + super_admin required)
// ---------------------------------------------------------------------------
templates.post('/', async (c) => {
  const authCtx = await requireAuth(c);
  if (!authCtx) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  const { userId, role } = authCtx;

  if (role !== 'super_admin') {
    return c.json({ error: 'Forbidden: super_admin role required' }, 403);
  }

  const body = await c.req.json<{
    slug: string;
    display_name: string;
    description: string;
    template_type: string;
    version: string;
    platform_compat: string;
    compatible_verticals?: string[];
    manifest_json: Record<string, unknown>;
    author_tenant_id?: string;
    is_free?: boolean;
    price_kobo?: number;
  }>();

  if (!body.slug || typeof body.slug !== 'string' || body.slug.length < 2 || body.slug.length > 100) {
    return c.json({ error: 'Invalid slug: must be 2-100 characters' }, 422);
  }
  if (!/^[a-z0-9-]+$/.test(body.slug)) {
    return c.json({ error: 'Invalid slug: must be lowercase alphanumeric with hyphens only' }, 422);
  }
  if (!body.display_name || typeof body.display_name !== 'string' || body.display_name.length < 2) {
    return c.json({ error: 'Invalid display_name: must be at least 2 characters' }, 422);
  }
  if (!body.description || typeof body.description !== 'string' || body.description.length < 10) {
    return c.json({ error: 'Invalid description: must be at least 10 characters' }, 422);
  }
  if (!body.template_type || !VALID_TEMPLATE_TYPES.includes(body.template_type as typeof VALID_TEMPLATE_TYPES[number])) {
    return c.json({ error: `Invalid template_type: must be one of ${VALID_TEMPLATE_TYPES.join(', ')}` }, 422);
  }
  if (!body.version || !isValidSemver(body.version)) {
    return c.json({ error: 'Invalid version: must be valid semver (e.g. 1.0.0)' }, 422);
  }
  if (!body.platform_compat || !isValidSemverRange(body.platform_compat)) {
    return c.json({ error: 'Invalid platform_compat: must be a valid semver range (e.g. ^1.0.0)' }, 422);
  }
  if (body.price_kobo !== undefined) {
    if (!Number.isInteger(body.price_kobo) || body.price_kobo < 0) {
      return c.json({ error: 'Invalid price_kobo: must be a non-negative integer (T4)' }, 422);
    }
  }
  if (!body.manifest_json || typeof body.manifest_json !== 'object') {
    return c.json({ error: 'Invalid manifest_json: must be a JSON object' }, 422);
  }

  const db = c.env.DB;
  const existing = await db.prepare('SELECT id FROM template_registry WHERE slug = ?').bind(body.slug).first();
  if (existing) {
    return c.json({ error: `Template with slug '${body.slug}' already exists` }, 409);
  }

  const now = Date.now();
  const id = generateId();
  const isFree = body.is_free !== false && (!body.price_kobo || body.price_kobo === 0);

  await db.prepare(`
    INSERT INTO template_registry (id, slug, display_name, description, template_type, version, platform_compat, compatible_verticals, manifest_json, author_tenant_id, status, is_free, price_kobo, install_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', ?, ?, 0, ?, ?)
  `).bind(
    id,
    body.slug,
    body.display_name,
    body.description,
    body.template_type,
    body.version,
    body.platform_compat,
    JSON.stringify(body.compatible_verticals ?? []),
    JSON.stringify(body.manifest_json),
    body.author_tenant_id ?? null,
    isFree ? 1 : 0,
    body.price_kobo ?? 0,
    now,
    now,
  ).run();

  return c.json({ id, slug: body.slug, status: 'pending_review', created_by: userId }, 201);
});

// ---------------------------------------------------------------------------
// POST /templates/:slug/install — install template to tenant (auth required)
// ---------------------------------------------------------------------------
templates.post('/:slug/install', async (c) => {
  const { userId, tenantId } = auth(c);
  const slug = c.req.param('slug');
  const db = c.env.DB;

  const template = await db.prepare(
    `SELECT * FROM template_registry WHERE slug = ? AND status = 'approved'`
  ).bind(slug).first<{
    id: string;
    slug: string;
    version: string;
    platform_compat: string;
    compatible_verticals: string;
    manifest_json: string;
  }>();

  if (!template) {
    return c.json({ error: 'Template not found or not approved' }, 404);
  }

  if (!satisfiesSemverRange(PLATFORM_VERSION, template.platform_compat)) {
    return c.json({
      error: `Platform version ${PLATFORM_VERSION} is not compatible with template requirement ${template.platform_compat}`,
    }, 422);
  }

  const compatVerticals: string[] = JSON.parse(template.compatible_verticals);
  if (compatVerticals.length > 0) {
    const body = await c.req.json<{ vertical?: string; config?: Record<string, unknown> }>().catch(() => ({}));
    if (body.vertical && !compatVerticals.includes(body.vertical)) {
      return c.json({
        error: `Template '${slug}' is not compatible with vertical '${body.vertical}'. Compatible verticals: ${compatVerticals.join(', ')}`,
      }, 422);
    }
  }

  const existingInstall = await db.prepare(
    `SELECT id FROM template_installations WHERE tenant_id = ? AND template_id = ? AND status = 'active'`
  ).bind(tenantId, template.id).first();

  if (existingInstall) {
    return c.json({ error: `Template '${slug}' is already installed for this tenant` }, 409);
  }

  const body = await c.req.json<{ config?: Record<string, unknown> }>().catch(() => ({}));
  const now = Date.now();
  const installId = generateInstallId();

  await db.batch([
    db.prepare(`
      INSERT INTO template_installations (id, tenant_id, template_id, template_version, installed_at, installed_by, status, config_json)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
    `).bind(installId, tenantId, template.id, template.version, now, userId, JSON.stringify(body.config ?? {})),
    db.prepare(`
      UPDATE template_registry SET install_count = install_count + 1, updated_at = ? WHERE id = ?
    `).bind(now, template.id),
  ]);

  const manifest = JSON.parse(template.manifest_json);

  return c.json({
    installed: true,
    installation_id: installId,
    template_id: template.id,
    template_slug: template.slug,
    version: template.version,
    config_defaults: manifest.config_schema?.properties ?? {},
  }, 201);
});

// ---------------------------------------------------------------------------
// DELETE /templates/:slug/install — rollback template install (auth required)
// ---------------------------------------------------------------------------
templates.delete('/:slug/install', async (c) => {
  const { tenantId } = auth(c);
  const slug = c.req.param('slug');
  const db = c.env.DB;

  const template = await db.prepare(
    `SELECT id FROM template_registry WHERE slug = ?`
  ).bind(slug).first<{ id: string }>();

  if (!template) {
    return c.json({ error: 'Template not found' }, 404);
  }

  const installation = await db.prepare(
    `SELECT id FROM template_installations WHERE tenant_id = ? AND template_id = ? AND status = 'active'`
  ).bind(tenantId, template.id).first<{ id: string }>();

  if (!installation) {
    return c.json({ error: `Template '${slug}' is not installed for this tenant` }, 404);
  }

  const now = Date.now();

  await db.batch([
    db.prepare(`
      UPDATE template_installations SET status = 'rolled_back' WHERE id = ? AND tenant_id = ?
    `).bind(installation.id, tenantId),
    db.prepare(`
      UPDATE template_registry SET install_count = MAX(0, install_count - 1), updated_at = ? WHERE id = ?
    `).bind(now, template.id),
  ]);

  return c.json({ rolled_back: true, template_slug: slug, installation_id: installation.id });
});

export { templates as templateRoutes };
