/**
 * WhatsApp Business API Template Management routes — Phase 3 (E24)
 *
 * GET    /whatsapp-templates            — list templates for tenant (+ platform defaults)
 * POST   /whatsapp-templates            — register a new template (admin)
 * GET    /whatsapp-templates/defaults   — list 5 platform-seeded defaults
 * GET    /whatsapp-templates/:id        — get single template
 * PATCH  /whatsapp-templates/:id/status — update template status (super_admin)
 *
 * Platform defaults (is_platform_default=1, tenant_id='__platform__') are seeded in migration 0448.
 * When a template is rejected by Meta, fallback_to_inapp is set to 1 so the broadcast
 * notification falls back to WebWaka in-app notification (PRD §11.8 fallback policy).
 *
 * T3: tenant_id from JWT on all tenant-scoped queries.
 * AC-FUNC-03: migration 0448 has rollback in infra/db/migrations/rollback/0448_rollback.sql.
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      first<T>(): Promise<T | null>;
      run(): Promise<{ success: boolean }>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

interface WhatsAppTemplateRow {
  id: string;
  tenant_id: string;
  event_type: string;
  template_name: string;
  template_status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'deprecated';
  template_body: string;
  language_code: string;
  is_platform_default: number;
  submitted_at: number | null;
  approved_at: number | null;
  rejected_at: number | null;
  rejection_reason: string | null;
  fallback_to_inapp: number;
  created_at: number;
  updated_at: number;
}

const PLATFORM_TENANT = '__platform__';

function formatTemplate(row: WhatsAppTemplateRow): Record<string, unknown> {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    eventType: row.event_type,
    templateName: row.template_name,
    templateStatus: row.template_status,
    templateBody: row.template_body,
    languageCode: row.language_code,
    isPlatformDefault: row.is_platform_default === 1,
    submittedAt: row.submitted_at,
    approvedAt: row.approved_at,
    rejectedAt: row.rejected_at,
    rejectionReason: row.rejection_reason,
    fallbackToInapp: row.fallback_to_inapp === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const whatsappTemplateRoutes = new Hono<AppEnv>();

/**
 * GET /whatsapp-templates
 * List all templates for the authenticated tenant plus platform defaults.
 * T3: scoped to tenantId.
 */
whatsappTemplateRoutes.get('/', async (c) => {
  const auth = c.get('auth');
  const tenantId = auth.tenantId;
  const db = c.env.DB as unknown as D1Like;

  const { results } = await db
    .prepare(`
      SELECT * FROM whatsapp_templates
      WHERE tenant_id = ? OR tenant_id = ?
      ORDER BY is_platform_default DESC, created_at ASC
    `)
    .bind(tenantId, PLATFORM_TENANT)
    .all<WhatsAppTemplateRow>();

  return c.json({ templates: results.map(formatTemplate) }, 200);
});

/**
 * GET /whatsapp-templates/defaults
 * List the 5 platform-seeded default templates (public for enrolled tenants).
 * Used by clients to discover available templates before customising.
 */
whatsappTemplateRoutes.get('/defaults', async (c) => {
  const db = c.env.DB as unknown as D1Like;

  const { results } = await db
    .prepare(`
      SELECT * FROM whatsapp_templates
      WHERE tenant_id = ? AND is_platform_default = 1
      ORDER BY created_at ASC
    `)
    .bind(PLATFORM_TENANT)
    .all<WhatsAppTemplateRow>();

  return c.json({ defaults: results.map(formatTemplate), count: results.length }, 200);
});

/**
 * POST /whatsapp-templates
 * Register a new WhatsApp template for the tenant (admin only).
 * Template starts in 'pending' status until submitted to Meta for approval.
 */
whatsappTemplateRoutes.post('/', async (c) => {
  const auth = c.get('auth');
  const tenantId = auth.tenantId;
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json<{
    eventType?: string;
    templateName?: string;
    templateBody?: string;
    languageCode?: string;
  }>().catch(() => null);

  if (!body?.eventType || !body.templateName || !body.templateBody) {
    return c.json({ error: 'eventType, templateName, and templateBody are required.' }, 400);
  }

  const id = `wt_${crypto.randomUUID()}`;
  const now = Math.floor(Date.now() / 1000);

  try {
    await db
      .prepare(`
        INSERT INTO whatsapp_templates
          (id, tenant_id, event_type, template_name, template_status, template_body, language_code,
           is_platform_default, fallback_to_inapp, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'pending', ?, ?, 0, 0, ?, ?)
      `)
      .bind(
        id,
        tenantId,
        body.eventType,
        body.templateName,
        body.templateBody,
        body.languageCode ?? 'en_NG',
        now,
        now,
      )
      .run();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('UNIQUE')) {
      return c.json({
        error: `Template '${body.templateName}' for event '${body.eventType}' already exists for this tenant.`,
      }, 409);
    }
    throw err;
  }

  return c.json({
    id,
    tenantId,
    eventType: body.eventType,
    templateName: body.templateName,
    templateStatus: 'pending',
    templateBody: body.templateBody,
    languageCode: body.languageCode ?? 'en_NG',
    isPlatformDefault: false,
    fallbackToInapp: false,
    createdAt: now,
    updatedAt: now,
  }, 201);
});

/**
 * GET /whatsapp-templates/:id
 * Get a single template by ID.
 * T3: tenant_id guard — cannot see other tenant's templates.
 */
whatsappTemplateRoutes.get('/:id', async (c) => {
  const auth = c.get('auth');
  const tenantId = auth.tenantId;
  const db = c.env.DB as unknown as D1Like;

  const { id } = c.req.param();

  // Allow access to platform defaults from any tenant
  const row = await db
    .prepare('SELECT * FROM whatsapp_templates WHERE id = ? AND (tenant_id = ? OR tenant_id = ?) LIMIT 1')
    .bind(id, tenantId, PLATFORM_TENANT)
    .first<WhatsAppTemplateRow>();

  if (!row) {
    return c.json({ error: 'Template not found.' }, 404);
  }

  return c.json(formatTemplate(row), 200);
});

/**
 * PATCH /whatsapp-templates/:id/status
 * Update template status (super_admin or admin only).
 * - 'submitted' → records submitted_at (sent to Meta for review)
 * - 'approved'  → records approved_at (Meta approved; ready to use)
 * - 'rejected'  → records rejected_at, rejection_reason, sets fallback_to_inapp=1
 * - 'deprecated'→ marks template as no longer active
 *
 * T3: only tenant's own templates (or platform defaults via super_admin) can be updated.
 */
whatsappTemplateRoutes.patch('/:id/status', async (c) => {
  const auth = c.get('auth');
  const tenantId = auth.tenantId;
  const db = c.env.DB as unknown as D1Like;

  const { id } = c.req.param();
  const body = await c.req.json<{
    status?: string;
    rejectionReason?: string;
  }>().catch(() => null);

  if (!body?.status) {
    return c.json({ error: "'status' is required." }, 400);
  }

  const VALID_STATUSES = ['submitted', 'approved', 'rejected', 'deprecated'] as const;
  if (!(VALID_STATUSES as readonly string[]).includes(body.status)) {
    return c.json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` }, 400);
  }

  const existing = await db
    .prepare('SELECT * FROM whatsapp_templates WHERE id = ? AND tenant_id = ? LIMIT 1')
    .bind(id, tenantId)
    .first<WhatsAppTemplateRow>();

  if (!existing) {
    return c.json({ error: 'Template not found.' }, 404);
  }

  const now = Math.floor(Date.now() / 1000);
  const newStatus = body.status as typeof VALID_STATUSES[number];

  const submittedAt   = newStatus === 'submitted'  ? now : existing.submitted_at;
  const approvedAt    = newStatus === 'approved'   ? now : existing.approved_at;
  const rejectedAt    = newStatus === 'rejected'   ? now : existing.rejected_at;
  const fallback      = newStatus === 'rejected'   ? 1   : existing.fallback_to_inapp;
  const rejReason     = newStatus === 'rejected'   ? (body.rejectionReason ?? null) : existing.rejection_reason;

  await db
    .prepare(`
      UPDATE whatsapp_templates
      SET template_status = ?, submitted_at = ?, approved_at = ?, rejected_at = ?,
          rejection_reason = ?, fallback_to_inapp = ?, updated_at = ?
      WHERE id = ? AND tenant_id = ?
    `)
    .bind(newStatus, submittedAt, approvedAt, rejectedAt, rejReason, fallback, now, id, tenantId)
    .run();

  return c.json({
    id,
    templateStatus: newStatus,
    submittedAt,
    approvedAt,
    rejectedAt,
    rejectionReason: rejReason,
    fallbackToInapp: fallback === 1,
    updatedAt: now,
  }, 200);
});
