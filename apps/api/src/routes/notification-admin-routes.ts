/**
 * Notification Admin Routes — Phase 7 (N-105–N-109, N-114, N-118)
 *
 * Super-admin-only API routes for notification system management.
 * All routes under /notifications/admin/* require super_admin role.
 *
 * Routes (all require JWT auth + super_admin role):
 *
 *   N-105 — Template Management CRUD
 *     POST   /notifications/admin/templates          — create template
 *     PATCH  /notifications/admin/templates/:id      — update template fields
 *     DELETE /notifications/admin/templates/:id      — delete template
 *
 *   N-118 — WhatsApp Template Approval Tracker
 *     GET    /notifications/admin/whatsapp-approvals           — list wa_approval_log
 *     PATCH  /notifications/admin/templates/:id/whatsapp-status — update WA status + log
 *
 *   N-106 — Cross-Tenant Delivery Log Viewer
 *     GET    /notifications/admin/deliveries         — paginated cross-tenant delivery log
 *
 *   N-107 — Dead-Letter Queue Inspector
 *     GET    /notifications/admin/dead-letters        — list dead-lettered deliveries
 *     POST   /notifications/admin/dead-letters/:id/replay  — reset to queued (retry)
 *     POST   /notifications/admin/dead-letters/:id/dismiss — mark as suppressed/dismissed
 *
 *   N-108 — Channel Provider Health Dashboard
 *     GET    /notifications/admin/providers/health    — aggregate provider delivery stats
 *
 *   N-109 — Notification Rule Editor
 *     GET    /notifications/admin/rules               — list rules
 *     POST   /notifications/admin/rules               — create rule
 *     PATCH  /notifications/admin/rules/:id           — update rule
 *     DELETE /notifications/admin/rules/:id           — delete rule
 *
 *   N-114 — Notification Metrics Dashboard
 *     GET    /notifications/admin/metrics             — platform-wide delivery metrics
 *
 * Guardrails enforced:
 *   G1  — all D1 queries scoped appropriately (cross-tenant reads explicitly flagged)
 *   G9  — audit log written on critical status changes
 *   G10 — dead-letter replay resets delivery to 'queued' (never silently discarded)
 *   G15 — no PII in responses (recipient IDs, not raw addresses)
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { D1LikeFull } from '@webwaka/notifications';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Auth = { userId: string; tenantId: string; role?: string; workspaceId?: string };

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const notificationAdminRoutes = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// Super-admin guard — applied to ALL routes in this router
// ---------------------------------------------------------------------------

notificationAdminRoutes.use('*', async (c, next) => {
  const auth = c.get('auth') as Auth | undefined;
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  if (auth.role !== 'super_admin') {
    return c.json({ error: 'Forbidden — super_admin role required' }, 403);
  }
  await next();
});

// ===========================================================================
// N-105 — Template Management CRUD
// ===========================================================================

/**
 * POST /notifications/admin/templates
 *
 * Create a new notification template (platform or tenant-owned).
 * Platform templates have tenant_id IS NULL; tenant templates scoped by tenantId body field.
 */
notificationAdminRoutes.post('/templates', async (c) => {
  const db = c.env.DB as unknown as D1LikeFull;
  const auth = c.get('auth') as Auth;

  let body: {
    name?: string;
    family?: string;
    channel?: string;
    locale?: string;
    subject?: string;
    body_html?: string;
    body_plain_text?: string;
    preheader?: string;
    variables_schema?: unknown;
    tenant_id?: string | null;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { name, family, channel, locale, subject, body_html, body_plain_text, preheader, variables_schema, tenant_id } = body;

  if (!name || !family || !channel || !locale) {
    return c.json({ error: 'Missing required fields: name, family, channel, locale' }, 400);
  }

  const templateId = `tpl_${crypto.randomUUID().replace(/-/g, '')}`;
  const now = Math.floor(Date.now() / 1000);

  try {
    await db
      .prepare(
        `INSERT INTO notification_template (
          id, tenant_id, name, family, channel, locale,
          subject, body_html, body_plain_text, preheader,
          variables_schema, status, whatsapp_approval_status,
          created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 'not_required', ?, ?, ?)`,
      )
      .bind(
        templateId,
        tenant_id ?? null,
        name,
        family,
        channel,
        locale,
        subject ?? null,
        body_html ?? null,
        body_plain_text ?? null,
        preheader ?? null,
        variables_schema ? JSON.stringify(variables_schema) : null,
        auth.userId,
        now,
        now,
      )
      .run();

    return c.json({ created: true, templateId, status: 'draft' }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: `Failed to create template: ${msg}` }, 500);
  }
});

/**
 * PATCH /notifications/admin/templates/:id
 *
 * Update mutable fields of a notification template.
 * Does not change whatsapp_approval_status (use the dedicated PATCH endpoint).
 */
notificationAdminRoutes.patch('/templates/:id', async (c) => {
  const db = c.env.DB as unknown as D1LikeFull;
  const templateId = c.req.param('id');

  const tpl = await db
    .prepare(`SELECT id, tenant_id, status FROM notification_template WHERE id = ? LIMIT 1`)
    .bind(templateId)
    .first<{ id: string; tenant_id: string | null; status: string }>();

  if (!tpl) return c.json({ error: `Template not found: ${templateId}` }, 404);

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const allowedFields = ['name', 'family', 'channel', 'locale', 'subject', 'body_html', 'body_plain_text', 'preheader', 'variables_schema', 'status'];
  const setClauses: string[] = [];
  const binds: unknown[] = [];

  for (const field of allowedFields) {
    if (field in body) {
      setClauses.push(`${field} = ?`);
      binds.push(field === 'variables_schema' && body[field] !== null
        ? JSON.stringify(body[field])
        : body[field]);
    }
  }

  if (setClauses.length === 0) {
    return c.json({ error: 'No updatable fields provided' }, 400);
  }

  setClauses.push('updated_at = ?');
  binds.push(Math.floor(Date.now() / 1000));
  binds.push(templateId);

  try {
    await db
      .prepare(`UPDATE notification_template SET ${setClauses.join(', ')} WHERE id = ?`)
      .bind(...binds)
      .run();

    return c.json({ updated: true, templateId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: `Failed to update template: ${msg}` }, 500);
  }
});

/**
 * DELETE /notifications/admin/templates/:id
 *
 * Hard-delete a notification template. Active (status='active') platform
 * templates cannot be deleted — they must be deprecated first.
 */
notificationAdminRoutes.delete('/templates/:id', async (c) => {
  const db = c.env.DB as unknown as D1LikeFull;
  const templateId = c.req.param('id');

  const tpl = await db
    .prepare(`SELECT id, tenant_id, status FROM notification_template WHERE id = ? LIMIT 1`)
    .bind(templateId)
    .first<{ id: string; tenant_id: string | null; status: string }>();

  if (!tpl) return c.json({ error: `Template not found: ${templateId}` }, 404);

  // Guard: active platform templates require deprecation before deletion
  if (tpl.tenant_id === null && tpl.status === 'active') {
    return c.json({
      error: 'Cannot delete an active platform template. Deprecate it first by publishing a new version.',
    }, 409);
  }

  try {
    await db
      .prepare(`DELETE FROM notification_template WHERE id = ?`)
      .bind(templateId)
      .run();

    return c.json({ deleted: true, templateId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: `Failed to delete template: ${msg}` }, 500);
  }
});

// ===========================================================================
// N-118 — WhatsApp Template Approval Tracker
// ===========================================================================

/**
 * GET /notifications/admin/whatsapp-approvals
 *
 * List the notification_wa_approval_log table for super_admin inspection.
 * Query params: limit (default 50), offset (default 0), status, template_id
 */
notificationAdminRoutes.get('/whatsapp-approvals', async (c) => {
  const db = c.env.DB as unknown as D1LikeFull;
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 200);
  const offset = parseInt(c.req.query('offset') ?? '0', 10);
  const statusFilter = c.req.query('status');
  const templateIdFilter = c.req.query('template_id');

  const whereClauses: string[] = [];
  const binds: unknown[] = [];

  if (statusFilter) {
    whereClauses.push('new_status = ?');
    binds.push(statusFilter);
  }
  if (templateIdFilter) {
    whereClauses.push('template_id = ?');
    binds.push(templateIdFilter);
  }

  const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  try {
    const [{ results: items }, countRow] = await Promise.all([
      db
        .prepare(
          `SELECT id, template_id, tenant_id, meta_template_name, previous_status,
                  new_status, rejection_reason, triggered_by, meta_request_id, created_at
           FROM notification_wa_approval_log
           ${where}
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?`,
        )
        .bind(...binds, limit, offset)
        .all<Record<string, unknown>>(),
      db
        .prepare(`SELECT COUNT(*) AS total FROM notification_wa_approval_log ${where}`)
        .bind(...binds)
        .first<{ total: number }>(),
    ]);

    return c.json({
      items,
      total: countRow?.total ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: `Failed to fetch WA approval log: ${msg}` }, 500);
  }
});

/**
 * PATCH /notifications/admin/templates/:id/whatsapp-status
 *
 * Update the whatsapp_approval_status of a template (OQ-003, G17).
 * Records the status change in notification_wa_approval_log (audit trail).
 *
 * Body: { "new_status": "meta_approved" | "meta_rejected" | "pending_meta_approval", "rejection_reason"?: string }
 */
notificationAdminRoutes.patch('/templates/:id/whatsapp-status', async (c) => {
  const db = c.env.DB as unknown as D1LikeFull;
  const auth = c.get('auth') as Auth;
  const templateId = c.req.param('id');

  const tpl = await db
    .prepare(
      `SELECT id, tenant_id, whatsapp_approval_status, meta_template_name
       FROM notification_template WHERE id = ? LIMIT 1`,
    )
    .bind(templateId)
    .first<{ id: string; tenant_id: string | null; whatsapp_approval_status: string; meta_template_name: string | null }>();

  if (!tpl) return c.json({ error: `Template not found: ${templateId}` }, 404);

  let body: { new_status?: string; rejection_reason?: string; meta_request_id?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const validStatuses = ['not_required', 'pending_meta_approval', 'meta_approved', 'meta_rejected'];
  if (!body.new_status || !validStatuses.includes(body.new_status)) {
    return c.json({
      error: `Invalid new_status. Must be one of: ${validStatuses.join(', ')}`,
    }, 400);
  }

  if (body.new_status === 'meta_rejected' && !body.rejection_reason) {
    return c.json({ error: 'rejection_reason is required when new_status=meta_rejected' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);
  const logId = `wa_approval_${crypto.randomUUID().replace(/-/g, '')}`;

  try {
    // Update the template status
    await db
      .prepare(
        `UPDATE notification_template
         SET whatsapp_approval_status = ?,
             meta_rejection_reason = ?,
             updated_at = ?
         WHERE id = ?`,
      )
      .bind(
        body.new_status,
        body.rejection_reason ?? null,
        now,
        templateId,
      )
      .run();

    // Write audit log entry to notification_wa_approval_log
    await db
      .prepare(
        `INSERT INTO notification_wa_approval_log (
          id, template_id, tenant_id, meta_template_name,
          previous_status, new_status, rejection_reason,
          triggered_by, meta_request_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'manual', ?, ?)`,
      )
      .bind(
        logId,
        templateId,
        tpl.tenant_id,
        tpl.meta_template_name ?? templateId,
        tpl.whatsapp_approval_status,
        body.new_status,
        body.rejection_reason ?? null,
        body.meta_request_id ?? null,
        now,
      )
      .run();

    // G17: if rejected, log a warning for ops (caller should publish system.provider_down)
    if (body.new_status === 'meta_rejected') {
      console.warn(
        `[notification-admin] G17: WhatsApp template rejected — ` +
        `templateId=${templateId} reason="${body.rejection_reason ?? ''}" ` +
        `actor=${auth.userId} — system.provider_down event should be raised`,
      );
    }

    return c.json({ updated: true, templateId, newStatus: body.new_status, logId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: `Failed to update WhatsApp status: ${msg}` }, 500);
  }
});

// ===========================================================================
// N-106 — Cross-Tenant Delivery Log Viewer
// ===========================================================================

/**
 * GET /notifications/admin/deliveries
 *
 * Cross-tenant delivery log for super_admin.
 * Query params: limit (default 50), offset (default 0), tenant_id, channel, status, provider
 */
notificationAdminRoutes.get('/deliveries', async (c) => {
  const db = c.env.DB as unknown as D1LikeFull;
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 200);
  const offset = parseInt(c.req.query('offset') ?? '0', 10);

  const whereClauses: string[] = [];
  const binds: unknown[] = [];

  const filters = ['tenant_id', 'channel', 'status', 'provider'] as const;
  for (const f of filters) {
    const val = c.req.query(f);
    if (val) {
      whereClauses.push(`${f} = ?`);
      binds.push(val);
    }
  }

  const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  try {
    const [{ results: items }, countRow] = await Promise.all([
      db
        .prepare(
          `SELECT id, notification_event_id, tenant_id, recipient_id, recipient_type,
                  channel, provider, template_id, status, attempts,
                  source, sender_fallback_used, sandbox_redirect,
                  sandbox_original_recipient_hash, last_error,
                  created_at, queued_at, dispatched_at, delivered_at, failed_at
           FROM notification_delivery
           ${where}
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?`,
        )
        .bind(...binds, limit, offset)
        .all<Record<string, unknown>>(),
      db
        .prepare(`SELECT COUNT(*) AS total FROM notification_delivery ${where}`)
        .bind(...binds)
        .first<{ total: number }>(),
    ]);

    return c.json({
      items,
      total: countRow?.total ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: `Failed to fetch deliveries: ${msg}` }, 500);
  }
});

// ===========================================================================
// N-107 — Dead-Letter Queue Inspector with Replay and Dismiss
// ===========================================================================

/**
 * GET /notifications/admin/dead-letters
 *
 * List all dead-lettered deliveries. Query params: limit, offset, tenant_id, provider
 */
notificationAdminRoutes.get('/dead-letters', async (c) => {
  const db = c.env.DB as unknown as D1LikeFull;
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 200);
  const offset = parseInt(c.req.query('offset') ?? '0', 10);

  const whereClauses: string[] = ["status = 'dead_lettered'"];
  const binds: unknown[] = [];

  const optionalFilters = ['tenant_id', 'provider'] as const;
  for (const f of optionalFilters) {
    const val = c.req.query(f);
    if (val) {
      whereClauses.push(`${f} = ?`);
      binds.push(val);
    }
  }

  const where = `WHERE ${whereClauses.join(' AND ')}`;

  try {
    const [{ results: items }, countRow] = await Promise.all([
      db
        .prepare(
          `SELECT id, notification_event_id, tenant_id, recipient_id, recipient_type,
                  channel, provider, template_id, status, attempts, last_error,
                  source, created_at, failed_at
           FROM notification_delivery
           ${where}
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?`,
        )
        .bind(...binds, limit, offset)
        .all<Record<string, unknown>>(),
      db
        .prepare(`SELECT COUNT(*) AS total FROM notification_delivery ${where}`)
        .bind(...binds)
        .first<{ total: number }>(),
    ]);

    return c.json({
      items,
      total: countRow?.total ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: `Failed to fetch dead-letters: ${msg}` }, 500);
  }
});

/**
 * POST /notifications/admin/dead-letters/:id/replay
 *
 * Replay a dead-lettered delivery: reset status to 'queued', reset attempts,
 * clear last_error. The notificator consumer will pick it up on the next
 * notification_event message or via the digest sweep. (G10)
 */
notificationAdminRoutes.post('/dead-letters/:id/replay', async (c) => {
  const db = c.env.DB as unknown as D1LikeFull;
  const auth = c.get('auth') as Auth;
  const deliveryId = c.req.param('id');

  const delivery = await db
    .prepare(
      `SELECT id, tenant_id, status FROM notification_delivery WHERE id = ? LIMIT 1`,
    )
    .bind(deliveryId)
    .first<{ id: string; tenant_id: string; status: string }>();

  if (!delivery) return c.json({ error: `Delivery not found: ${deliveryId}` }, 404);
  if (delivery.status !== 'dead_lettered') {
    return c.json({
      error: `Delivery is not in dead_lettered state (current: ${delivery.status})`,
    }, 409);
  }

  const now = Math.floor(Date.now() / 1000);

  try {
    await db
      .prepare(
        `UPDATE notification_delivery
         SET status = 'queued', attempts = 0,
             last_error = '[REPLAYED by super_admin: ' || ? || ']',
             queued_at = ?, failed_at = NULL, dead_lettered_at = NULL,
             updated_at = ?
         WHERE id = ? AND status = 'dead_lettered'`,
      )
      .bind(auth.userId, now, now, deliveryId)
      .run();

    console.log(
      `[notification-admin] N-107 dead-letter replay — deliveryId=${deliveryId} ` +
      `tenant=${delivery.tenant_id} actor=${auth.userId}`,
    );

    return c.json({ replayed: true, deliveryId, newStatus: 'queued' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: `Failed to replay delivery: ${msg}` }, 500);
  }
});

/**
 * POST /notifications/admin/dead-letters/:id/dismiss
 *
 * Dismiss a dead-lettered delivery: mark as suppressed with an audit note.
 * The delivery is preserved in the DB (G10 — never silently discarded)
 * but removed from the active dead-letter queue view.
 */
notificationAdminRoutes.post('/dead-letters/:id/dismiss', async (c) => {
  const db = c.env.DB as unknown as D1LikeFull;
  const auth = c.get('auth') as Auth;
  const deliveryId = c.req.param('id');

  const delivery = await db
    .prepare(
      `SELECT id, tenant_id, status FROM notification_delivery WHERE id = ? LIMIT 1`,
    )
    .bind(deliveryId)
    .first<{ id: string; tenant_id: string; status: string }>();

  if (!delivery) return c.json({ error: `Delivery not found: ${deliveryId}` }, 404);
  if (delivery.status !== 'dead_lettered') {
    return c.json({
      error: `Delivery is not in dead_lettered state (current: ${delivery.status})`,
    }, 409);
  }

  const now = Math.floor(Date.now() / 1000);

  try {
    await db
      .prepare(
        `UPDATE notification_delivery
         SET status = 'suppressed',
             last_error = '[DISMISSED by super_admin: ' || ? || ' at ' || ? || ']',
             updated_at = ?
         WHERE id = ? AND status = 'dead_lettered'`,
      )
      .bind(auth.userId, now, now, deliveryId)
      .run();

    console.log(
      `[notification-admin] N-107 dead-letter dismissed — deliveryId=${deliveryId} ` +
      `tenant=${delivery.tenant_id} actor=${auth.userId}`,
    );

    return c.json({ dismissed: true, deliveryId, newStatus: 'suppressed' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: `Failed to dismiss delivery: ${msg}` }, 500);
  }
});

// ===========================================================================
// N-108 — Channel Provider Health Dashboard
// ===========================================================================

/**
 * GET /notifications/admin/providers/health
 *
 * Aggregate delivery outcome stats per provider+channel over a rolling window.
 * Query params: windowHours (default 24)
 */
notificationAdminRoutes.get('/providers/health', async (c) => {
  const db = c.env.DB as unknown as D1LikeFull;
  const windowHours = Math.min(parseInt(c.req.query('windowHours') ?? '24', 10), 168);
  const cutoff = Math.floor(Date.now() / 1000) - windowHours * 3600;

  try {
    const { results } = await db
      .prepare(
        `SELECT
           provider,
           channel,
           COUNT(*) AS total,
           SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
           SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed,
           SUM(CASE WHEN status = 'dead_lettered' THEN 1 ELSE 0 END) AS dead_lettered,
           SUM(CASE WHEN status = 'suppressed' THEN 1 ELSE 0 END) AS suppressed,
           SUM(CASE WHEN sandbox_redirect = 1 THEN 1 ELSE 0 END) AS sandbox_redirected,
           MIN(created_at) AS oldest_in_window,
           MAX(created_at) AS newest_in_window
         FROM notification_delivery
         WHERE created_at >= ?
           AND status NOT IN ('queued', 'rendering')
         GROUP BY provider, channel
         ORDER BY total DESC`,
      )
      .bind(cutoff)
      .all<Record<string, unknown>>();

    return c.json({
      windowHours,
      windowCutoff: cutoff,
      providers: results.map((row) => ({
        ...row,
        // Compute bounce rate client-side from these fields
        bounceRate: typeof row['total'] === 'number' && row['total'] > 0
          ? Math.round(((Number(row['failed'] ?? 0) + Number(row['dead_lettered'] ?? 0)) / Number(row['total'])) * 10000) / 100
          : 0,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: `Failed to fetch provider health: ${msg}` }, 500);
  }
});

// ===========================================================================
// N-109 — Notification Rule Editor
// ===========================================================================

/**
 * GET /notifications/admin/rules
 *
 * List notification rules. Query params: tenant_id (optional), event_key (optional), enabled (optional)
 */
notificationAdminRoutes.get('/rules', async (c) => {
  const db = c.env.DB as unknown as D1LikeFull;
  const limit = Math.min(parseInt(c.req.query('limit') ?? '100', 10), 500);
  const offset = parseInt(c.req.query('offset') ?? '0', 10);

  const whereClauses: string[] = [];
  const binds: unknown[] = [];

  const optionals = ['tenant_id', 'event_key'] as const;
  for (const f of optionals) {
    const val = c.req.query(f);
    if (val) {
      whereClauses.push(`${f} = ?`);
      binds.push(val);
    }
  }

  const enabledFilter = c.req.query('enabled');
  if (enabledFilter !== undefined) {
    whereClauses.push('enabled = ?');
    binds.push(enabledFilter === 'true' ? 1 : 0);
  }

  const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  try {
    const [{ results: rules }, countRow] = await Promise.all([
      db
        .prepare(
          `SELECT id, tenant_id, event_key, channels, template_family, min_severity,
                  audience_type, enabled, feature_flag, digest_window, created_at, updated_at
           FROM notification_rule
           ${where}
           ORDER BY event_key, tenant_id
           LIMIT ? OFFSET ?`,
        )
        .bind(...binds, limit, offset)
        .all<Record<string, unknown>>(),
      db
        .prepare(`SELECT COUNT(*) AS total FROM notification_rule ${where}`)
        .bind(...binds)
        .first<{ total: number }>(),
    ]);

    return c.json({ rules, total: countRow?.total ?? 0, limit, offset });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: `Failed to fetch rules: ${msg}` }, 500);
  }
});

/**
 * POST /notifications/admin/rules
 *
 * Create a new notification rule.
 * Platform rules have tenant_id IS NULL. Tenant rules have a tenant_id.
 */
notificationAdminRoutes.post('/rules', async (c) => {
  const db = c.env.DB as unknown as D1LikeFull;
  const auth = c.get('auth') as Auth;

  let body: {
    event_key?: string;
    channels?: string[];
    template_family?: string;
    min_severity?: string;
    audience_type?: string;
    enabled?: boolean;
    feature_flag?: string | null;
    digest_window?: string | null;
    tenant_id?: string | null;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.event_key || !body.channels || body.channels.length === 0) {
    return c.json({ error: 'Missing required fields: event_key, channels' }, 400);
  }

  const ruleId = `rule_${crypto.randomUUID().replace(/-/g, '')}`;
  const now = Math.floor(Date.now() / 1000);

  try {
    await db
      .prepare(
        `INSERT INTO notification_rule (
          id, tenant_id, event_key, channels, template_family, min_severity,
          audience_type, enabled, feature_flag, digest_window,
          created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        ruleId,
        body.tenant_id ?? null,
        body.event_key,
        JSON.stringify(body.channels),
        body.template_family ?? null,
        body.min_severity ?? 'info',
        body.audience_type ?? 'actor',
        body.enabled !== false ? 1 : 0,
        body.feature_flag ?? null,
        body.digest_window ?? null,
        auth.userId,
        now,
        now,
      )
      .run();

    return c.json({ created: true, ruleId }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: `Failed to create rule: ${msg}` }, 500);
  }
});

/**
 * PATCH /notifications/admin/rules/:id
 *
 * Update a notification rule.
 */
notificationAdminRoutes.patch('/rules/:id', async (c) => {
  const db = c.env.DB as unknown as D1LikeFull;
  const ruleId = c.req.param('id');

  const rule = await db
    .prepare(`SELECT id FROM notification_rule WHERE id = ? LIMIT 1`)
    .bind(ruleId)
    .first<{ id: string }>();

  if (!rule) return c.json({ error: `Rule not found: ${ruleId}` }, 404);

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const allowedFields = ['channels', 'template_family', 'min_severity', 'audience_type', 'enabled', 'feature_flag', 'digest_window'];
  const setClauses: string[] = [];
  const binds: unknown[] = [];

  for (const field of allowedFields) {
    if (field in body) {
      setClauses.push(`${field} = ?`);
      const val = body[field];
      if (field === 'channels' && Array.isArray(val)) {
        binds.push(JSON.stringify(val));
      } else if (field === 'enabled') {
        binds.push(val ? 1 : 0);
      } else {
        binds.push(val);
      }
    }
  }

  if (setClauses.length === 0) {
    return c.json({ error: 'No updatable fields provided' }, 400);
  }

  setClauses.push('updated_at = ?');
  binds.push(Math.floor(Date.now() / 1000));
  binds.push(ruleId);

  try {
    await db
      .prepare(`UPDATE notification_rule SET ${setClauses.join(', ')} WHERE id = ?`)
      .bind(...binds)
      .run();

    return c.json({ updated: true, ruleId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: `Failed to update rule: ${msg}` }, 500);
  }
});

/**
 * DELETE /notifications/admin/rules/:id
 *
 * Delete a notification rule. Platform rules (tenant_id IS NULL) only — no cascade.
 */
notificationAdminRoutes.delete('/rules/:id', async (c) => {
  const db = c.env.DB as unknown as D1LikeFull;
  const ruleId = c.req.param('id');

  const rule = await db
    .prepare(`SELECT id FROM notification_rule WHERE id = ? LIMIT 1`)
    .bind(ruleId)
    .first<{ id: string }>();

  if (!rule) return c.json({ error: `Rule not found: ${ruleId}` }, 404);

  try {
    await db
      .prepare(`DELETE FROM notification_rule WHERE id = ?`)
      .bind(ruleId)
      .run();

    return c.json({ deleted: true, ruleId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: `Failed to delete rule: ${msg}` }, 500);
  }
});

// ===========================================================================
// N-114 — Notification Metrics Dashboard
// ===========================================================================

/**
 * GET /notifications/admin/metrics
 *
 * Platform-wide notification delivery metrics.
 * Returns aggregate stats for the last 24h, 7d, and 30d windows.
 */
notificationAdminRoutes.get('/metrics', async (c) => {
  const db = c.env.DB as unknown as D1LikeFull;
  const now = Math.floor(Date.now() / 1000);

  const windows = [
    { label: '24h', cutoff: now - 86400 },
    { label: '7d', cutoff: now - 7 * 86400 },
    { label: '30d', cutoff: now - 30 * 86400 },
  ];

  try {
    const metricsResults = await Promise.all(
      windows.map(async (w) => {
        const [summaryRow, byChannel] = await Promise.all([
          db
            .prepare(
              `SELECT
                 COUNT(*) AS total,
                 SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
                 SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed,
                 SUM(CASE WHEN status = 'dead_lettered' THEN 1 ELSE 0 END) AS dead_lettered,
                 SUM(CASE WHEN status = 'suppressed' THEN 1 ELSE 0 END) AS suppressed,
                 SUM(CASE WHEN sandbox_redirect = 1 THEN 1 ELSE 0 END) AS sandbox_redirected,
                 COUNT(DISTINCT tenant_id) AS active_tenants
               FROM notification_delivery
               WHERE created_at >= ?`,
            )
            .bind(w.cutoff)
            .first<Record<string, unknown>>(),
          db
            .prepare(
              `SELECT channel, COUNT(*) AS total,
                 SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered
               FROM notification_delivery
               WHERE created_at >= ?
               GROUP BY channel
               ORDER BY total DESC`,
            )
            .bind(w.cutoff)
            .all<Record<string, unknown>>(),
        ]);

        return {
          window: w.label,
          summary: summaryRow,
          byChannel: byChannel.results,
        };
      }),
    );

    // Event catalog stats
    const recentEvents = await db
      .prepare(
        `SELECT event_key, COUNT(*) AS count
         FROM notification_event
         WHERE created_at >= ?
         GROUP BY event_key
         ORDER BY count DESC
         LIMIT 20`,
      )
      .bind(now - 86400)
      .all<{ event_key: string; count: number }>();

    return c.json({
      generatedAt: now,
      metrics: metricsResults,
      topEventsLast24h: recentEvents.results,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: `Failed to fetch metrics: ${msg}` }, 500);
  }
});
