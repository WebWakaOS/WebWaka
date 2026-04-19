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
import { initializePayment, verifyPayment } from '@webwaka/payments';
import { WebhookDispatcher } from '../lib/webhook-dispatcher.js';

type Auth = { userId: string; tenantId: string; role?: string; workspaceId?: string };

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
  return `tpl_${crypto.randomUUID().replace(/-/g, '')}`;
}

function generateInstallId(): string {
  return `inst_${crypto.randomUUID().replace(/-/g, '')}`;
}

const VALID_TEMPLATE_TYPES = ['dashboard', 'website', 'vertical-blueprint', 'workflow', 'email', 'module'] as const;
const _VALID_STATUSES = ['draft', 'pending_review', 'approved', 'deprecated'] as const;

function isValidSemver(v: string): boolean {
  return /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/.test(v);
}

function isValidSemverRange(r: string): boolean {
  if (!r || r.length === 0 || r.length > 100) return false;
  return /^[\^~]?\d+\.\d+\.\d+$/.test(r) || /^>=\d+\.\d+\.\d+$/.test(r);
}

function satisfiesSemverRange(version: string, range: string): boolean {
  const vParts = version.split('.').map(Number);
  const vMajor = vParts[0] ?? 0, vMinor = vParts[1] ?? 0, vPatch = vParts[2] ?? 0;
  if (range.startsWith('^')) {
    const rangeVersion = range.slice(1);
    const rParts = rangeVersion.split('.').map(Number);
    const rMajor = rParts[0] ?? 0, rMinor = rParts[1] ?? 0, rPatch = rParts[2] ?? 0;
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
    const rParts = rangeVersion.split('.').map(Number);
    const rMajor = rParts[0] ?? 0, rMinor = rParts[1] ?? 0, rPatch = rParts[2] ?? 0;
    if (vMajor !== rMajor || vMinor !== rMinor) return false;
    return vPatch >= rPatch;
  }
  if (range.startsWith('>=')) {
    const rangeVersion = range.slice(2);
    const rParts = rangeVersion.split('.').map(Number);
    const rMajor = rParts[0] ?? 0, rMinor = rParts[1] ?? 0, rPatch = rParts[2] ?? 0;
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
// PERF-03: Supports cursor-based pagination (preferred) and legacy page/offset
// Cursor format: base64(install_count:created_at:id) for stable ordering
// ---------------------------------------------------------------------------
templates.get('/', async (c) => {
  const db = c.env.DB;
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') ?? '20', 10)));
  const typeFilter = c.req.query('type');
  const verticalFilter = c.req.query('vertical');
  const cursor = c.req.query('cursor');

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

  if (cursor) {
    try {
      const decoded = atob(cursor);
      const parts = decoded.split(':');
      if (parts.length < 3) {
        return c.json({ error: 'Invalid cursor format.' }, 400);
      }
      const [cursorInstalls, cursorCreated, ...idParts] = parts;
      const cursorId = idParts.join(':');
      const installCount = parseInt(cursorInstalls ?? '', 10);
      if (isNaN(installCount) || !cursorCreated || !cursorId) {
        return c.json({ error: 'Invalid cursor format.' }, 400);
      }
      query += ` AND (install_count < ? OR (install_count = ? AND created_at < ?) OR (install_count = ? AND created_at = ? AND id > ?))`;
      params.push(
        installCount,
        installCount, cursorCreated,
        installCount, cursorCreated, cursorId,
      );
    } catch {
      return c.json({ error: 'Invalid cursor format.' }, 400);
    }

    query += ` ORDER BY install_count DESC, created_at DESC, id ASC LIMIT ?`;
    params.push(limit + 1);

    const results = await db.prepare(query).bind(...params).all();
    const items = (results.results ?? []).slice(0, limit);
    const hasMore = (results.results ?? []).length > limit;
    let nextCursor: string | null = null;
    if (hasMore && items.length > 0) {
      const last = items[items.length - 1] as Record<string, unknown>;
      nextCursor = btoa(`${last.install_count}:${last.created_at}:${last.id}`);
    }

    return c.json({ templates: items, nextCursor, hasMore });
  }

  const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10));
  const offset = (page - 1) * limit;

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
  if (slug === 'installed') {
    return c.json({ error: 'Use GET /templates/installed with auth' }, 400);
  }
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

  // SEC-14: Validate manifest_json against required schema fields
  const manifest = body.manifest_json as Record<string, unknown>;
  const requiredManifestFields = ['name', 'version', 'type'];
  const missingFields = requiredManifestFields.filter((f) => !manifest[f]);
  if (missingFields.length > 0) {
    return c.json({
      error: 'Invalid manifest_json: missing required fields',
      details: { missing: missingFields },
    }, 422);
  }
  if (typeof manifest['name'] !== 'string' || (manifest['name'] as string).length < 2) {
    return c.json({ error: 'Invalid manifest_json: name must be at least 2 characters' }, 422);
  }
  if (typeof manifest['version'] !== 'string' || !/^\d+\.\d+\.\d+$/.test(manifest['version'] as string)) {
    return c.json({ error: 'Invalid manifest_json: version must follow semver (e.g. 1.0.0)' }, 422);
  }
  const validTypes = ['dashboard', 'page', 'widget', 'workflow', 'integration'];
  if (!validTypes.includes(manifest['type'] as string)) {
    return c.json({
      error: `Invalid manifest_json: type must be one of: ${validTypes.join(', ')}`,
    }, 422);
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

  const body: { vertical?: string; config?: Record<string, unknown> } = await c.req.json<{ vertical?: string; config?: Record<string, unknown> }>().catch(() => ({}));

  const template = await db.prepare(
    `SELECT * FROM template_registry WHERE slug = ? AND status = 'approved'`
  ).bind(slug).first<{
    id: string;
    slug: string;
    version: string;
    platform_compat: string;
    compatible_verticals: string;
    manifest_json: string;
    is_free: number;
    price_kobo: number;
    author_tenant_id: string;
  }>();

  if (!template) {
    return c.json({ error: 'Template not found or not approved' }, 404);
  }

  // MON-01: paid templates require a verified purchase record
  if (!template.is_free && template.price_kobo > 0) {
    const purchase = await db.prepare(
      `SELECT id FROM template_purchases WHERE tenant_id = ? AND template_id = ? AND status = 'paid'`
    ).bind(tenantId, template.id).first<{ id: string }>();
    if (!purchase) {
      return c.json({
        error: `Template '${slug}' requires purchase first.`,
        payment_required: true,
        price_kobo: template.price_kobo,
        purchase_url: `/templates/${slug}/purchase`,
      }, 402);
    }
  }

  if (!satisfiesSemverRange(PLATFORM_VERSION, template.platform_compat)) {
    return c.json({
      error: `Platform version ${PLATFORM_VERSION} is not compatible with template requirement ${template.platform_compat}`,
    }, 422);
  }

  const compatVerticals: string[] = JSON.parse(template.compatible_verticals);
  if (compatVerticals.length > 0 && body.vertical && !compatVerticals.includes(body.vertical)) {
    return c.json({
      error: `Template '${slug}' is not compatible with vertical '${body.vertical}'. Compatible verticals: ${compatVerticals.join(', ')}`,
    }, 422);
  }

  const existingInstall = await db.prepare(
    `SELECT id, status FROM template_installations WHERE tenant_id = ? AND template_id = ?`
  ).bind(tenantId, template.id).first<{ id: string; status: string }>();

  if (existingInstall && existingInstall.status === 'active') {
    return c.json({ error: `Template '${slug}' is already installed for this tenant` }, 409);
  }

  const now = Date.now();
  const manifest = JSON.parse(template.manifest_json);

  if (existingInstall) {
    await db.batch([
      db.prepare(`
        UPDATE template_installations SET status = 'active', template_version = ?, installed_at = ?, installed_by = ?, config_json = ? WHERE id = ? AND tenant_id = ?
      `).bind(template.version, now, userId, JSON.stringify(body.config ?? {}), existingInstall.id, tenantId),
      db.prepare(`
        UPDATE template_registry SET install_count = install_count + 1, updated_at = ? WHERE id = ?
      `).bind(now, template.id),
    ]);

    // PROD-04: fire-and-forget webhook dispatch (best effort)
    const reinstallDispatcher = new WebhookDispatcher(c.env.DB, tenantId);
    void reinstallDispatcher.dispatch('template.installed', {
      template_slug: template.slug,
      template_id: template.id,
      installation_id: existingInstall.id,
      reinstalled: true,
    }).catch(() => {});

    return c.json({
      installed: true,
      reinstalled: true,
      installation_id: existingInstall.id,
      template_id: template.id,
      template_slug: template.slug,
      version: template.version,
      config_defaults: manifest.config_schema?.properties ?? {},
    }, 201);
  }

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

  // PROD-04: fire-and-forget webhook dispatch (best effort)
  const installDispatcher = new WebhookDispatcher(c.env.DB, tenantId);
  void installDispatcher.dispatch('template.installed', {
    template_slug: template.slug,
    template_id: template.id,
    installation_id: installId,
    reinstalled: false,
  }).catch(() => {});

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
// POST /templates/:slug/upgrade — upgrade installed template to latest version
// Sprint 7 / PROD-07: Template version upgrade path
// ---------------------------------------------------------------------------
templates.post('/:slug/upgrade', async (c) => {
  const { userId, tenantId } = auth(c);
  const slug = c.req.param('slug');
  const db = c.env.DB;

  const template = await db.prepare(
    `SELECT id, slug, version, platform_compat, manifest_json FROM template_registry WHERE slug = ? AND status = 'approved'`
  ).bind(slug).first<{
    id: string;
    slug: string;
    version: string;
    platform_compat: string;
    manifest_json: string;
  }>();

  if (!template) {
    return c.json({ error: 'Template not found or not approved' }, 404);
  }

  const installation = await db.prepare(
    `SELECT id, template_version, config_json FROM template_installations
     WHERE tenant_id = ? AND template_id = ? AND status = 'active'`
  ).bind(tenantId, template.id).first<{
    id: string;
    template_version: string;
    config_json: string;
  }>();

  if (!installation) {
    return c.json({ error: `Template '${slug}' is not installed for this tenant` }, 404);
  }

  if (installation.template_version === template.version) {
    return c.json({
      upgraded: false,
      current_version: installation.template_version,
      latest_version: template.version,
      message: 'Already on the latest version',
    });
  }

  const currentParts = installation.template_version.split('.').map(Number);
  const latestParts = template.version.split('.').map(Number);
  const isNewer =
    latestParts[0]! > currentParts[0]! ||
    (latestParts[0] === currentParts[0] && latestParts[1]! > currentParts[1]!) ||
    (latestParts[0] === currentParts[0] && latestParts[1] === currentParts[1] && latestParts[2]! > currentParts[2]!);

  if (!isNewer) {
    return c.json({
      upgraded: false,
      current_version: installation.template_version,
      latest_version: template.version,
      message: 'Installed version is newer than or equal to registry version',
    });
  }

  if (!satisfiesSemverRange(PLATFORM_VERSION, template.platform_compat)) {
    return c.json({
      error: `Platform version ${PLATFORM_VERSION} is not compatible with template version ${template.version} (requires ${template.platform_compat})`,
    }, 422);
  }

  const now = Math.floor(Date.now() / 1000);
  const upgradeLogId = `upg_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
  const configSnapshot = installation.config_json;

  await db.batch([
    db.prepare(
      `UPDATE template_installations SET template_version = ?, installed_at = ?, installed_by = ?
       WHERE id = ? AND tenant_id = ?`
    ).bind(template.version, now, userId, installation.id, tenantId),

    db.prepare(
      `INSERT INTO template_upgrade_log (id, installation_id, tenant_id, template_id, from_version, to_version, upgraded_by, upgraded_at, config_snapshot)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(upgradeLogId, installation.id, tenantId, template.id, installation.template_version, template.version, userId, now, configSnapshot),
  ]);

  return c.json({
    upgraded: true,
    installation_id: installation.id,
    template_slug: template.slug,
    from_version: installation.template_version,
    to_version: template.version,
    config_preserved: true,
    upgrade_log_id: upgradeLogId,
  });
});

// ---------------------------------------------------------------------------
// POST /templates/:slug/purchase — initiate Paystack payment for paid template
// MON-01: payment gateway for template marketplace
// ---------------------------------------------------------------------------
templates.post('/:slug/purchase', async (c) => {
  const { userId, tenantId } = auth(c);
  const slug = c.req.param('slug');
  const db = c.env.DB;

  const body = await c.req.json<{ email?: string }>().catch(() => ({ email: undefined }));
  if (!body.email) {
    return c.json({ error: 'email is required for payment' }, 400);
  }
  // B5 fix: validate email format before round-tripping to Paystack
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return c.json({ error: 'email must be a valid email address' }, 400);
  }

  const template = await db.prepare(
    `SELECT id, slug, display_name, price_kobo, is_free, author_tenant_id
     FROM template_registry WHERE slug = ? AND status = 'approved'`
  ).bind(slug).first<{
    id: string; slug: string; display_name: string;
    price_kobo: number; is_free: number; author_tenant_id: string;
  }>();

  if (!template) {
    return c.json({ error: 'Template not found or not approved' }, 404);
  }

  if (template.is_free || template.price_kobo === 0) {
    return c.json({ error: 'This template is free — use POST /templates/:slug/install directly' }, 400);
  }

  const existingPurchase = await db.prepare(
    `SELECT id FROM template_purchases WHERE tenant_id = ? AND template_id = ? AND status = 'paid'`
  ).bind(tenantId, template.id).first<{ id: string }>();

  if (existingPurchase) {
    return c.json({
      error: 'Template already purchased — use POST /templates/:slug/install to install',
      already_purchased: true,
    }, 409);
  }

  const secretKey = c.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return c.json({ error: 'Payment provider not configured' }, 503);
  }

  const payment = await initializePayment(
    { secretKey },
    {
      workspaceId: tenantId,
      amountKobo: template.price_kobo,
      email: body.email,
      callbackUrl: `${c.env.APP_BASE_URL ?? 'https://app.webwaka.com'}/templates/verify`,
      metadata: {
        template_slug: slug,
        template_id: template.id,
        tenant_id: tenantId,
        user_id: userId,
        purchase_type: 'template',
      },
    },
  );

  const purchaseId = `tpurch_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
  const now = Math.floor(Date.now() / 1000);

  await db.prepare(
    `INSERT INTO template_purchases (id, tenant_id, template_id, paystack_ref, amount_kobo, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`
  ).bind(purchaseId, tenantId, template.id, payment.reference, template.price_kobo, now).run();

  return c.json({
    purchase_id: purchaseId,
    template_slug: slug,
    amount_kobo: template.price_kobo,
    reference: payment.reference,
    authorization_url: payment.authorizationUrl,
    access_code: payment.accessCode,
  }, 201);
});

// ---------------------------------------------------------------------------
// POST /templates/:slug/purchase/verify — verify payment + record split + install
// MON-01: complete purchase, MON-02: record 70/30 revenue split
// ---------------------------------------------------------------------------
templates.post('/:slug/purchase/verify', async (c) => {
  const { userId, tenantId } = auth(c);
  const slug = c.req.param('slug');
  const db = c.env.DB;

  const body = await c.req.json<{ reference?: string }>().catch(() => ({ reference: undefined }));
  if (!body.reference) {
    return c.json({ error: 'reference is required' }, 400);
  }

  const template = await db.prepare(
    `SELECT id, slug, version, platform_compat, compatible_verticals, manifest_json,
            price_kobo, is_free, author_tenant_id
     FROM template_registry WHERE slug = ? AND status = 'approved'`
  ).bind(slug).first<{
    id: string; slug: string; version: string; platform_compat: string;
    compatible_verticals: string; manifest_json: string;
    price_kobo: number; is_free: number; author_tenant_id: string;
  }>();

  if (!template) {
    return c.json({ error: 'Template not found or not approved' }, 404);
  }

  const purchase = await db.prepare(
    `SELECT id, status, amount_kobo
     FROM template_purchases WHERE paystack_ref = ? AND tenant_id = ? AND template_id = ?`
  ).bind(body.reference, tenantId, template.id).first<{
    id: string; status: string; amount_kobo: number;
  }>();

  if (!purchase) {
    return c.json({ error: 'Purchase record not found — initiate payment first via POST /templates/:slug/purchase' }, 404);
  }

  if (purchase.status === 'paid') {
    return c.json({
      error: 'Payment already verified — use POST /templates/:slug/install to install',
      already_verified: true,
    }, 409);
  }

  const secretKey = c.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return c.json({ error: 'Payment provider not configured' }, 503);
  }

  let verified;
  try {
    verified = await verifyPayment({ secretKey }, body.reference);
  } catch {
    return c.json({ error: 'Payment verification failed — please contact support' }, 502);
  }

  if (verified.status !== 'success') {
    await db.prepare(
      `UPDATE template_purchases SET status = 'failed' WHERE id = ?`
    ).bind(purchase.id).run();
    return c.json({ error: `Payment ${verified.status} — purchase not completed`, status: verified.status }, 402);
  }

  // P9: verify amount integrity
  if (verified.amountKobo !== purchase.amount_kobo) {
    return c.json({ error: 'Amount mismatch — contact support' }, 422);
  }

  const now = Math.floor(Date.now() / 1000);
  const splitId = `rsplit_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;

  // MON-02: 70/30 revenue split (30% platform fee, 70% to template author)
  // T4/P9: integer-only arithmetic — no float multiplication on monetary values
  const platformFeeKobo = Math.floor((purchase.amount_kobo * 30) / 100);
  const authorShareKobo = purchase.amount_kobo - platformFeeKobo;

  const existingInstall = await db.prepare(
    `SELECT id, status FROM template_installations WHERE tenant_id = ? AND template_id = ?`
  ).bind(tenantId, template.id).first<{ id: string; status: string }>();

  const installId = existingInstall ? existingInstall.id : generateInstallId();
  const manifest: { config_schema?: { properties?: Record<string, unknown> } } = JSON.parse(template.manifest_json);

  const installStatement = existingInstall
    ? db.prepare(
        `UPDATE template_installations
         SET status = 'active', template_version = ?, installed_at = ?, installed_by = ?
         WHERE id = ? AND tenant_id = ?`,
      ).bind(template.version, now, userId, existingInstall.id, tenantId)
    : db.prepare(
        `INSERT INTO template_installations
         (id, tenant_id, template_id, template_version, installed_at, installed_by, status, config_json)
         VALUES (?, ?, ?, ?, ?, ?, 'active', '{}')`,
      ).bind(installId, tenantId, template.id, template.version, now, userId);

  await db.batch([
    db.prepare(`UPDATE template_purchases SET status = 'paid', paid_at = ? WHERE id = ?`)
      .bind(now, purchase.id),
    db.prepare(
      `INSERT INTO revenue_splits
       (id, purchase_id, template_id, author_tenant_id, gross_kobo, platform_fee_kobo, author_share_kobo, recorded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(splitId, purchase.id, template.id, template.author_tenant_id,
           purchase.amount_kobo, platformFeeKobo, authorShareKobo, now),
    installStatement,
    db.prepare(`UPDATE template_registry SET install_count = install_count + 1, updated_at = ? WHERE id = ?`)
      .bind(now, template.id),
  ]);

  // PROD-04: fire-and-forget webhook dispatch (best effort)
  const purchaseDispatcher = new WebhookDispatcher(c.env.DB, tenantId);
  void purchaseDispatcher.dispatch('template.purchased', {
    template_slug: slug,
    template_id: template.id,
    purchase_id: purchase.id,
    installation_id: installId,
    amount_kobo: purchase.amount_kobo,
    platform_fee_kobo: platformFeeKobo,
    author_share_kobo: authorShareKobo,
  }).catch(() => {});

  return c.json({
    verified: true,
    purchase_id: purchase.id,
    installation_id: installId,
    template_slug: slug,
    version: template.version,
    reinstalled: !!existingInstall,
    revenue_split: {
      gross_kobo: purchase.amount_kobo,
      platform_fee_kobo: platformFeeKobo,
      author_share_kobo: authorShareKobo,
    },
    config_defaults: manifest.config_schema?.properties ?? {},
  });
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

// ---------------------------------------------------------------------------
// P6-B: Template Ratings — POST /templates/:slug/rate
// T3: tenant_id + workspace_id from JWT; one rating per workspace per template
// T4: rating must be integer 1–5
// ---------------------------------------------------------------------------

templates.post('/:slug/rate', async (c) => {
  const a = await requireAuth(c);
  if (!a) return c.json({ error: 'Unauthorized' }, 401);
  const { tenantId, workspaceId } = a;

  // T3: workspaceId is required — one rating per workspace per template (UNIQUE constraint)
  if (!workspaceId) {
    return c.json({ error: 'workspaceId required in auth context to submit a rating' }, 422);
  }

  const slug = c.req.param('slug');
  const db = c.env.DB;

  const tmpl = await db
    .prepare('SELECT id FROM template_registry WHERE slug = ?')
    .bind(slug)
    .first<{ id: string }>();

  if (!tmpl) return c.json({ error: 'Template not found' }, 404);

  let body: { rating?: unknown; review_text?: string };
  try { body = await c.req.json<typeof body>(); }
  catch { return c.json({ error: 'Invalid JSON body' }, 400); }

  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return c.json({ error: 'rating must be an integer between 1 and 5 (T4 invariant)' }, 400);
  }

  const id = `tr_${crypto.randomUUID().replace(/-/g, '')}`;
  const reviewText = (body.review_text ?? null) as string | null;
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT INTO template_ratings (id, template_slug, workspace_id, tenant_id, rating, review_text, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(template_slug, workspace_id) DO UPDATE SET
         rating = excluded.rating,
         review_text = excluded.review_text,
         updated_at = excluded.updated_at`,
    )
    .bind(id, slug, workspaceId ?? '', tenantId, rating, reviewText, now, now)
    .run();

  // Return new average rating
  const agg = await db
    .prepare(
      `SELECT AVG(CAST(rating AS REAL)) AS avg_rating, COUNT(*) AS rating_count
       FROM template_ratings WHERE template_slug = ?`,
    )
    .bind(slug)
    .first<{ avg_rating: number | null; rating_count: number }>();

  return c.json(
    {
      templateSlug: slug,
      yourRating: rating,
      avgRating: agg?.avg_rating != null ? Math.round(agg.avg_rating * 100) / 100 : rating,
      ratingCount: agg?.rating_count ?? 1,
    },
    201,
  );
});

// ---------------------------------------------------------------------------
// P6-B: Template Ratings — GET /templates/:slug/ratings (paginated)
// ---------------------------------------------------------------------------

templates.get('/:slug/ratings', async (c) => {
  const slug = c.req.param('slug');
  const db = c.env.DB;

  const tmpl = await db
    .prepare('SELECT id FROM template_registry WHERE slug = ?')
    .bind(slug)
    .first<{ id: string }>();

  if (!tmpl) return c.json({ error: 'Template not found' }, 404);

  const rawPage = parseInt(c.req.query('page') ?? '1', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const perPage = 50;
  const offset = (page - 1) * perPage;

  const { results } = await db
    .prepare(
      `SELECT id, workspace_id, rating, review_text, created_at, updated_at
       FROM template_ratings
       WHERE template_slug = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(slug, perPage, offset)
    .all<Record<string, unknown>>();

  const agg = await db
    .prepare(
      `SELECT AVG(CAST(rating AS REAL)) AS avg_rating, COUNT(*) AS rating_count
       FROM template_ratings WHERE template_slug = ?`,
    )
    .bind(slug)
    .first<{ avg_rating: number | null; rating_count: number }>();

  return c.json({
    templateSlug: slug,
    avgRating: agg?.avg_rating != null ? Math.round(agg.avg_rating * 100) / 100 : null,
    ratingCount: agg?.rating_count ?? 0,
    ratings: results ?? [],
    page,
    perPage,
  });
});

export { templates as templateRoutes };
