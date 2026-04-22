/**
 * Notification Template Routes — Phase 3 (N-036, N-037)
 *
 * Routes:
 *   POST /notifications/templates/:id/preview    — render template with variables (N-036)
 *   POST /notifications/templates/:id/test-send  — render + dispatch to caller (N-037)
 *
 * Authentication:
 *   Both routes require JWT auth (mounted with authMiddleware in router.ts).
 *   Access restricted to workspace admins and platform admins (role check inside handlers).
 *
 * Platform Invariants:
 *   G1  — tenantId always from JWT (never user input)
 *   G14 — variable schema validated by TemplateRenderer.preview() (fail-loud)
 *   G17 — WhatsApp gate enforced by TemplateRenderer
 *   G20 — test-send bypasses suppression list (test recipient always receives)
 *   G24 — test-send always uses sandbox mode (never sends to real recipients)
 *   T3  — tenant isolation: template access validated against caller's tenant
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import {
  TemplateRenderer,

  publishTemplate,
  TemplateNotFoundError,
  TemplateVariableError,
  WhatsAppNotApprovedError,
} from '@webwaka/notifications';
import type { D1LikeFull } from '@webwaka/notifications';
import type { NotificationChannel, TemplateLocale } from '@webwaka/notifications';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Auth = { userId: string; tenantId: string; role?: string; workspaceId?: string };

// ---------------------------------------------------------------------------
// Route definitions
// ---------------------------------------------------------------------------

export const notificationRoutes = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// POST /notifications/templates/:id/preview — N-036
//
// Renders a template with caller-supplied variables without dispatching.
// Returns the fully rendered HTML, plain-text, subject, and preheader.
//
// Request body:
//   {
//     "variables": { "user_name": "Test User", ... },
//     "locale":    "en",       // optional; default="en"
//     "channel":   "email"     // optional; default derived from template
//   }
//
// Response 200:
//   { "templateId": "...", "subject": "...", "body": "...", "bodyPlainText": "...", "preheader": "..." }
//
// Response 400: TemplateVariableError (missing required vars)
// Response 403: WhatsAppNotApprovedError (G17)
// Response 404: TemplateNotFoundError
// ---------------------------------------------------------------------------

notificationRoutes.post('/templates/:id/preview', async (c) => {
  const auth = c.get('auth') as Auth | undefined;
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  // Only workspace_admin or super_admin may preview templates
  if (auth.role !== 'workspace_admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'Forbidden — workspace_admin or super_admin required' }, 403);
  }

  const templateId = c.req.param('id');
  const db = c.env.DB as unknown as D1LikeFull;

  // Verify template exists and belongs to caller's tenant (G1, T3)
  const tpl = await db
    .prepare(
      `SELECT id, tenant_id, template_family, channel, locale, status,
              whatsapp_approval_status, subject_template, body_template,
              preheader_template, cta_label, cta_url_template, variables_schema
       FROM notification_template
       WHERE id = ?
         AND (tenant_id = ? OR tenant_id IS NULL)
       LIMIT 1`,
    )
    .bind(templateId, auth.tenantId)
    .first<{
      id: string;
      tenant_id: string | null;
      template_family: string;
      channel: string;
      locale: string;
      status: string;
      whatsapp_approval_status: string;
      subject_template: string | null;
      body_template: string;
      variables_schema: string | null;
    }>();

  if (!tpl) {
    return c.json({ error: `Template not found: ${templateId}` }, 404);
  }

  let body: { variables?: Record<string, unknown>; locale?: string; channel?: string };
  try {
    body = await c.req.json() as typeof body;
  } catch {
    body = {};
  }

  const variables = body.variables ?? {};
  const locale = (body.locale ?? tpl.locale ?? 'en') as TemplateLocale;
  const channel = (body.channel ?? tpl.channel) as NotificationChannel;

  // Build TemplateRenderer (preview mode — no unsubscribe URL signing needed)
  const renderer = new TemplateRenderer({
    db,
    ...(c.env.UNSUBSCRIBE_HMAC_SECRET !== undefined
      ? { unsubscribeSecret: c.env.UNSUBSCRIBE_HMAC_SECRET }
      : {}),
    ...(c.env.PLATFORM_BASE_URL !== undefined
      ? { platformBaseUrl: c.env.PLATFORM_BASE_URL }
      : {}),
    platformName: 'WebWaka',
  });

  try {
    const rendered = await renderer.preview({
      templateFamily: tpl.template_family,
      channel,
      locale,
      tenantId: auth.tenantId,
      ...(auth.workspaceId !== undefined ? { workspaceId: auth.workspaceId } : {}),
      variables,
    });

    return c.json({
      templateId: rendered.templateId,
      templateVersion: rendered.templateVersion,
      channel,
      locale: rendered.locale,
      ...(rendered.subject !== undefined ? { subject: rendered.subject } : {}),
      body: rendered.body,
      ...(rendered.bodyPlainText !== undefined ? { bodyPlainText: rendered.bodyPlainText } : {}),
      ...(rendered.preheader !== undefined ? { preheader: rendered.preheader } : {}),
      ...(rendered.ctaLabel !== undefined ? { ctaLabel: rendered.ctaLabel } : {}),
      ...(rendered.ctaUrl !== undefined ? { ctaUrl: rendered.ctaUrl } : {}),
    });
  } catch (err) {
    if (err instanceof TemplateNotFoundError) {
      return c.json({ error: err.message }, 404);
    }
    if (err instanceof TemplateVariableError) {
      return c.json({
        error: err.message,
        missingVariables: err.missingVars,
      }, 400);
    }
    if (err instanceof WhatsAppNotApprovedError) {
      return c.json({ error: err.message }, 403);
    }
    console.error('[notification-routes] preview error:', err);
    return c.json({ error: 'Internal server error during template preview' }, 500);
  }
});

// ---------------------------------------------------------------------------
// POST /notifications/templates/:id/test-send — N-037
//
// Renders a template and dispatches to the calling user's email address.
// Always operates in sandbox mode — no real delivery to third parties.
// The caller's email address is the sole test recipient (G24).
//
// Request body:
//   {
//     "variables": { "user_name": "Test User", ... },
//     "locale":    "en",       // optional; default="en"
//     "channel":   "email"     // optional; must be a supported channel
//   }
//
// Response 200:
//   { "sent": true, "channel": "email", "recipientEmail": "caller@example.com" }
//
// Response 400: variable validation failure
// Response 403: WhatsApp not approved or insufficient role
// Response 404: Template not found
// ---------------------------------------------------------------------------

notificationRoutes.post('/templates/:id/test-send', async (c) => {
  const auth = c.get('auth') as Auth | undefined;
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  if (auth.role !== 'workspace_admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'Forbidden — workspace_admin or super_admin required' }, 403);
  }

  const templateId = c.req.param('id');
  const db = c.env.DB as unknown as D1LikeFull;

  // Fetch template with tenant isolation (G1)
  const tpl = await db
    .prepare(
      `SELECT id, tenant_id, template_family, channel, locale, status
       FROM notification_template
       WHERE id = ?
         AND (tenant_id = ? OR tenant_id IS NULL)
       LIMIT 1`,
    )
    .bind(templateId, auth.tenantId)
    .first<{
      id: string;
      tenant_id: string | null;
      template_family: string;
      channel: string;
      locale: string;
      status: string;
    }>();

  if (!tpl) {
    return c.json({ error: `Template not found: ${templateId}` }, 404);
  }

  // Fetch caller's email address for test delivery
  const userRow = await db
    .prepare(
      `SELECT email FROM users WHERE id = ? AND tenant_id = ? LIMIT 1`,
    )
    .bind(auth.userId, auth.tenantId)
    .first<{ email: string }>();

  if (!userRow?.email) {
    return c.json({ error: 'Could not resolve caller email address for test-send' }, 400);
  }

  let body: { variables?: Record<string, unknown>; locale?: string; channel?: string };
  try {
    body = await c.req.json() as typeof body;
  } catch {
    body = {};
  }

  const variables = body.variables ?? {};
  const locale = (body.locale ?? tpl.locale ?? 'en') as TemplateLocale;
  const channel = (body.channel ?? tpl.channel) as NotificationChannel;

  const renderer = new TemplateRenderer({
    db,
    ...(c.env.UNSUBSCRIBE_HMAC_SECRET !== undefined
      ? { unsubscribeSecret: c.env.UNSUBSCRIBE_HMAC_SECRET }
      : {}),
    ...(c.env.PLATFORM_BASE_URL !== undefined
      ? { platformBaseUrl: c.env.PLATFORM_BASE_URL }
      : {}),
    platformName: 'WebWaka',
  });

  let rendered;
  try {
    rendered = await renderer.render({
      templateFamily: tpl.template_family,
      channel,
      locale,
      tenantId: auth.tenantId,
      ...(auth.workspaceId !== undefined ? { workspaceId: auth.workspaceId } : {}),
      variables: { ...variables, user_id: auth.userId },
    });
  } catch (err) {
    if (err instanceof TemplateNotFoundError) {
      return c.json({ error: err.message }, 404);
    }
    if (err instanceof TemplateVariableError) {
      return c.json({ error: err.message, missingVariables: err.missingVars }, 400);
    }
    if (err instanceof WhatsAppNotApprovedError) {
      return c.json({ error: err.message }, 403);
    }
    console.error('[notification-routes] test-send render error:', err);
    return c.json({ error: 'Template render failed' }, 500);
  }

  // Only email test-send is supported in Phase 3 (SMS/WhatsApp/push in Phase 6)
  if (channel === 'email') {
    if (!c.env.RESEND_API_KEY) {
      // Dev mode: log and return success stub
      console.log(
        `[notification-routes] test-send DEV mode — ` +
        `RESEND_API_KEY not set; template rendered OK, email not dispatched. ` +
        `recipient=${userRow.email} templateId=${templateId}`,
      );
      return c.json({
        sent: false,
        devMode: true,
        channel,
        recipientEmail: userRow.email,
        subject: rendered.subject ?? '',
        message: 'RESEND_API_KEY not set — email not dispatched (dev mode)',
      });
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'WebWaka Test <noreply@webwaka.com>',
          to: [userRow.email],
          subject: `[TEST] ${rendered.subject ?? tpl.template_family}`,
          html: rendered.body,
          ...(rendered.bodyPlainText !== undefined ? { text: rendered.bodyPlainText } : {}),
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        return c.json({
          sent: false,
          channel,
          recipientEmail: userRow.email,
          error: `Resend API error ${res.status}: ${errBody.slice(0, 300)}`,
        }, 502);
      }

      const json = await res.json() as { id?: string };
      return c.json({
        sent: true,
        channel,
        recipientEmail: userRow.email,
        subject: rendered.subject ?? '',
        templateId: rendered.templateId,
        templateVersion: rendered.templateVersion,
        ...(json.id !== undefined ? { providerMessageId: json.id } : {}),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return c.json({ sent: false, channel, error: `Email dispatch failed: ${msg}` }, 502);
    }
  }

  // Non-email channels: return the rendered output (dispatch not yet wired in Phase 3)
  return c.json({
    sent: false,
    channel,
    message: `Test dispatch for channel '${channel}' will be wired in Phase 6 (N-101).`,
    preview: {
      body: rendered.body.slice(0, 500),
      locale: rendered.locale,
      templateId: rendered.templateId,
    },
  });
});

// ---------------------------------------------------------------------------
// POST /notifications/templates/:id/publish — N-035 (template lifecycle)
//
// Publish a draft template: draft → active (deprecates old active version).
// Only workspace_admin or super_admin for tenant-owned templates.
// Platform templates (tenant_id IS NULL) require super_admin.
// ---------------------------------------------------------------------------

notificationRoutes.post('/templates/:id/publish', async (c) => {
  const auth = c.get('auth') as Auth | undefined;
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const templateId = c.req.param('id');
  const db = c.env.DB as unknown as D1LikeFull;

  // Check template exists and determine ownership
  const tpl = await db
    .prepare(
      `SELECT id, tenant_id, status FROM notification_template WHERE id = ? LIMIT 1`,
    )
    .bind(templateId)
    .first<{ id: string; tenant_id: string | null; status: string }>();

  if (!tpl) {
    return c.json({ error: `Template not found: ${templateId}` }, 404);
  }

  // Platform templates (tenant_id IS NULL) require super_admin
  if (tpl.tenant_id === null && auth.role !== 'super_admin') {
    return c.json({ error: 'Forbidden — super_admin required for platform templates' }, 403);
  }

  // Tenant templates: must belong to caller's tenant and caller must be workspace_admin+
  if (tpl.tenant_id !== null) {
    if (tpl.tenant_id !== auth.tenantId) {
      return c.json({ error: 'Forbidden — template does not belong to your tenant' }, 403);
    }
    if (auth.role !== 'workspace_admin' && auth.role !== 'super_admin') {
      return c.json({ error: 'Forbidden — workspace_admin or super_admin required' }, 403);
    }
  }

  try {
    const { deprecatedCount } = await publishTemplate(templateId, tpl.tenant_id, db);
    return c.json({ published: true, templateId, deprecatedCount });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 400);
  }
});

// ---------------------------------------------------------------------------
// GET /notifications/templates — list templates accessible to the caller
// ---------------------------------------------------------------------------

notificationRoutes.get('/templates', async (c) => {
  const auth = c.get('auth') as Auth | undefined;
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const db = c.env.DB as unknown as D1LikeFull;
  const channel = c.req.query('channel');
  const family = c.req.query('family');
  const status = c.req.query('status') ?? 'active';

  // Build query dynamically based on optional filter params
  const whereClauses = ['(tenant_id = ? OR tenant_id IS NULL)', 'status = ?'];
  const binds: unknown[] = [auth.tenantId, status];

  if (channel) {
    whereClauses.push('channel = ?');
    binds.push(channel);
  }
  if (family) {
    whereClauses.push('template_family = ?');
    binds.push(family);
  }

  const sql =
    `SELECT id, tenant_id, template_family, channel, locale, version, status,` +
    ` whatsapp_approval_status, cta_label, created_at, updated_at` +
    ` FROM notification_template` +
    ` WHERE ${whereClauses.join(' AND ')}` +
    ` ORDER BY template_family, channel, locale, version DESC LIMIT 200`;

  const result = await db
    .prepare(sql)
    .bind(...binds)
    .all<{
      id: string;
      tenant_id: string | null;
      template_family: string;
      channel: string;
      locale: string;
      version: number;
      status: string;
      whatsapp_approval_status: string;
    }>();

  return c.json({ templates: result.results, count: result.results.length });
});

// ---------------------------------------------------------------------------
// GET /notifications/templates/:id — get template details
// ---------------------------------------------------------------------------

notificationRoutes.get('/templates/:id', async (c) => {
  const auth = c.get('auth') as Auth | undefined;
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const templateId = c.req.param('id');
  const db = c.env.DB as unknown as D1LikeFull;

  const tpl = await db
    .prepare(
      `SELECT * FROM notification_template
       WHERE id = ?
         AND (tenant_id = ? OR tenant_id IS NULL)
       LIMIT 1`,
    )
    .bind(templateId, auth.tenantId)
    .first<Record<string, unknown>>();

  if (!tpl) {
    return c.json({ error: `Template not found: ${templateId}` }, 404);
  }

  return c.json({ template: tpl });
});
