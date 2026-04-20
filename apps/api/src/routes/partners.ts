/**
 * Partner management routes — M11 Partner & White-Label.
 *
 * All routes require super_admin role. Partners are platform-level entities
 * managed exclusively by WebWaka platform operators.
 *
 * Route map:
 *   GET    /partners                                — list all partners
 *   POST   /partners                                — register a new partner
 *   GET    /partners/:id                            — get partner detail
 *   PATCH  /partners/:id/status                     — update partner status
 *   GET    /partners/:id/sub-partners               — list sub-partners for a partner
 *   POST   /partners/:id/sub-partners               — create sub-partner under a partner
 *   PATCH  /partners/:id/sub-partners/:subId/status — update sub-partner status
 *   GET    /partners/:id/entitlements               — list partner entitlement grants
 *   POST   /partners/:id/entitlements               — grant an entitlement to partner
 *
 * Platform Invariants:
 *   T3 — partner_id isolation on all queries (partner scoping replaces tenant scoping here
 *        because partners are cross-tenant platform-level entities; super_admin context only)
 *   T5 — entitlement dimension validates against approved dimensions list
 *   SEC — audit log written for all mutating operations
 *   Governance: partner-and-subpartner-model.md Phase 1 + Phase 2
 *
 * Milestone 11 — Partner & White-Label
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import { publishEvent } from '../lib/publish-event.js';
import { PartnerEventType } from '@webwaka/events';

const partnerRoutes = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// Shared D1Like type (consistent with other route files)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Valid entitlement dimensions (entitlement-model.md)
// ---------------------------------------------------------------------------

const VALID_ENTITLEMENT_DIMENSIONS = [
  'white_label_depth',
  'delegation_rights',
  'max_sub_partners',
  'max_tenants',
  'max_workspaces',
  'ai_access',
  'visibility_featured',
] as const;

type EntitlementDimension = (typeof VALID_ENTITLEMENT_DIMENSIONS)[number];

// ---------------------------------------------------------------------------
// Partner status values
// ---------------------------------------------------------------------------

const VALID_PARTNER_STATUSES = ['pending', 'active', 'suspended', 'deactivated'] as const;

// ---------------------------------------------------------------------------
// Audit log helper — append-only, never throws (non-blocking)
// ---------------------------------------------------------------------------

async function writePartnerAuditLog(
  db: D1Like,
  partnerId: string,
  actorId: string,
  action: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const id = `pal_${crypto.randomUUID().replace(/-/g, '')}`;
  try {
    await db
      .prepare(
        `INSERT INTO partner_audit_log (id, partner_id, actor_id, action, payload)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(id, partnerId, actorId, action, JSON.stringify(payload))
      .run();
  } catch {
    // Audit log failure must never block the primary operation (security-baseline.md §6)
  }
}

// ---------------------------------------------------------------------------
// GET /partners — list all partners (super_admin only)
// ---------------------------------------------------------------------------

partnerRoutes.get('/', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'super_admin') {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;

  const { results } = await db
    .prepare(
      `SELECT id, tenant_id, workspace_id, company_name, contact_email,
              status, max_sub_partners, onboarded_at, created_at, updated_at
       FROM partners
       ORDER BY created_at DESC
       LIMIT 100`,
    )
    .all<{
      id: string;
      tenant_id: string;
      workspace_id: string;
      company_name: string;
      contact_email: string;
      status: string;
      max_sub_partners: number;
      onboarded_at: string | null;
      created_at: string;
      updated_at: string;
    }>();

  return c.json({ partners: results ?? [], total: results?.length ?? 0 });
});

// ---------------------------------------------------------------------------
// POST /partners — register a new partner (super_admin only)
// ---------------------------------------------------------------------------

partnerRoutes.post('/', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'super_admin') {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  let body: {
    tenantId?: string;
    workspaceId?: string;
    companyName?: string;
    contactEmail?: string;
    maxSubPartners?: number;
  };

  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.tenantId || !body.workspaceId || !body.companyName || !body.contactEmail) {
    return c.json(
      { error: 'tenantId, workspaceId, companyName, and contactEmail are required' },
      400,
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.contactEmail)) {
    return c.json({ error: 'contactEmail must be a valid email address' }, 400);
  }

  const maxSubPartners = body.maxSubPartners ?? 10;
  if (!Number.isInteger(maxSubPartners) || maxSubPartners < 0 || maxSubPartners > 1000) {
    return c.json({ error: 'maxSubPartners must be an integer between 0 and 1000' }, 400);
  }

  const db = c.env.DB as unknown as D1Like;

  // Rule 4: tenant isolation — verify workspace belongs to the stated tenant
  const workspace = await db
    .prepare('SELECT id FROM workspaces WHERE id = ? AND tenant_id = ?')
    .bind(body.workspaceId, body.tenantId)
    .first<{ id: string }>();

  if (!workspace) {
    return c.json({ error: 'Workspace not found or does not belong to the stated tenant' }, 404);
  }

  const id = `prt_${crypto.randomUUID().replace(/-/g, '')}`;

  await db
    .prepare(
      `INSERT INTO partners (id, tenant_id, workspace_id, company_name, contact_email, max_sub_partners)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, body.tenantId, body.workspaceId, body.companyName, body.contactEmail, maxSubPartners)
    .run();

  await writePartnerAuditLog(db, id, auth.userId as string, 'partner_registered', {
    companyName: body.companyName,
    contactEmail: body.contactEmail,
    tenantId: body.tenantId,
    workspaceId: body.workspaceId,
  });

  const partner = await db
    .prepare('SELECT * FROM partners WHERE id = ?')
    .bind(id)
    .first<Record<string, unknown>>();

  // N-091: partner.application_submitted event (partner record created, status=pending)
  void publishEvent(c.env, {
    eventId: id,
    eventKey: PartnerEventType.PartnerApplicationSubmitted,
    tenantId: body.tenantId,
    actorId: auth.userId as string,
    actorType: 'user',
    workspaceId: body.workspaceId,
    payload: { partner_id: id, company_name: body.companyName, category: 'partner' },
    source: 'api',
    severity: 'info',
  });
  // N-091: partner.onboarded event (category='partner' for inbox filtering)
  void publishEvent(c.env, {
    eventId: `${id}_onboarded`,
    eventKey: PartnerEventType.PartnerOnboarded,
    tenantId: body.tenantId,
    actorId: auth.userId as string,
    actorType: 'user',
    workspaceId: body.workspaceId,
    payload: { partner_id: id, company_name: body.companyName, category: 'partner' },
    source: 'api',
    severity: 'info',
  });

  return c.json({ partner }, 201);
});

// ---------------------------------------------------------------------------
// GET /partners/:id — get partner detail (super_admin only)
// ---------------------------------------------------------------------------

partnerRoutes.get('/:id', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'super_admin') {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const partnerId = c.req.param('id');

  const partner = await db
    .prepare('SELECT * FROM partners WHERE id = ?')
    .bind(partnerId)
    .first<Record<string, unknown>>();

  if (!partner) {
    return c.json({ error: 'Partner not found' }, 404);
  }

  return c.json({ partner });
});

// ---------------------------------------------------------------------------
// PATCH /partners/:id/status — update partner status (super_admin only)
// ---------------------------------------------------------------------------

partnerRoutes.patch('/:id/status', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'super_admin') {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const partnerId = c.req.param('id');

  const partner = await db
    .prepare('SELECT id, status FROM partners WHERE id = ?')
    .bind(partnerId)
    .first<{ id: string; status: string }>();

  if (!partner) {
    return c.json({ error: 'Partner not found' }, 404);
  }

  let body: { status?: string };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.status || !VALID_PARTNER_STATUSES.includes(body.status as (typeof VALID_PARTNER_STATUSES)[number])) {
    return c.json(
      { error: `status must be one of: ${VALID_PARTNER_STATUSES.join(', ')}` },
      400,
    );
  }

  // Cannot reactivate a deactivated partner — requires a new registration
  if (partner.status === 'deactivated' && body.status !== 'deactivated') {
    return c.json({ error: 'Deactivated partners cannot be reactivated. Register a new partner.' }, 409);
  }

  const onboardedAt = body.status === 'active' && partner.status === 'pending'
    ? new Date().toISOString()
    : null;

  if (onboardedAt) {
    await db
      .prepare(
        `UPDATE partners SET status = ?, onboarded_at = ?, updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(body.status, onboardedAt, partnerId)
      .run();
  } else {
    await db
      .prepare(`UPDATE partners SET status = ?, updated_at = datetime('now') WHERE id = ?`)
      .bind(body.status, partnerId)
      .run();
  }

  await writePartnerAuditLog(db, partnerId, auth.userId as string, 'partner_status_changed', {
    from: partner.status,
    to: body.status,
  });

  const updated = await db
    .prepare('SELECT * FROM partners WHERE id = ?')
    .bind(partnerId)
    .first<Record<string, unknown>>();

  // N-091: partner.application_approved or rejected based on new status
  if (body.status === 'active' && partner.status === 'pending') {
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: PartnerEventType.PartnerApplicationApproved,
      tenantId: auth.tenantId ?? 'platform',
      actorId: auth.userId as string,
      actorType: 'user',
      payload: { partner_id: partnerId, category: 'partner' },
      source: 'api',
      severity: 'info',
    });
  } else if (body.status === 'suspended') {
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: PartnerEventType.PartnerApplicationRejected,
      tenantId: auth.tenantId ?? 'platform',
      actorId: auth.userId as string,
      actorType: 'user',
      payload: { partner_id: partnerId, reason: 'suspended', category: 'partner' },
      source: 'api',
      severity: 'warning',
    });
  }

  return c.json({ partner: updated });
});

// ---------------------------------------------------------------------------
// GET /partners/:id/sub-partners — list sub-partners (super_admin only)
// ---------------------------------------------------------------------------

partnerRoutes.get('/:id/sub-partners', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'super_admin') {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const partnerId = c.req.param('id');

  const partner = await db
    .prepare('SELECT id FROM partners WHERE id = ?')
    .bind(partnerId)
    .first<{ id: string }>();

  if (!partner) {
    return c.json({ error: 'Partner not found' }, 404);
  }

  const { results } = await db
    .prepare(
      `SELECT id, partner_id, tenant_id, workspace_id, delegation_agreement_ref,
              status, created_by, created_at, updated_at
       FROM sub_partners
       WHERE partner_id = ?
       ORDER BY created_at DESC`,
    )
    .bind(partnerId)
    .all<Record<string, unknown>>();

  return c.json({ subPartners: results ?? [], total: results?.length ?? 0 });
});

// ---------------------------------------------------------------------------
// POST /partners/:id/sub-partners — create sub-partner (super_admin only)
// Governance: rule 1 — delegation is entitlement-controlled (partner's max_sub_partners)
//             rule 3 — sub-partner creation must be auditable with a clear parent record
// ---------------------------------------------------------------------------

partnerRoutes.post('/:id/sub-partners', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'super_admin') {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const partnerId = c.req.param('id');

  // Load parent partner — must be active to spawn sub-partners
  const partner = await db
    .prepare('SELECT id, status, max_sub_partners FROM partners WHERE id = ?')
    .bind(partnerId)
    .first<{ id: string; status: string; max_sub_partners: number }>();

  if (!partner) {
    return c.json({ error: 'Partner not found' }, 404);
  }

  if (partner.status !== 'active') {
    return c.json({ error: 'Only active partners can create sub-partners' }, 409);
  }

  // Check delegation rights entitlement (rule 1 — delegation is entitlement-controlled)
  const delegationRight = await db
    .prepare(
      `SELECT value FROM partner_entitlements
       WHERE partner_id = ? AND dimension = 'delegation_rights'`,
    )
    .bind(partnerId)
    .first<{ value: string }>();

  if (!delegationRight || delegationRight.value !== '1') {
    return c.json(
      { error: 'Partner does not have delegation_rights entitlement. Grant it first.' },
      403,
    );
  }

  // Check sub-partner limit — entitlement value overrides the partners table default
  const maxSubPartnersEntitlement = await db
    .prepare(
      `SELECT value FROM partner_entitlements
       WHERE partner_id = ? AND dimension = 'max_sub_partners'`,
    )
    .bind(partnerId)
    .first<{ value: string }>();

  const parsedEntitlementLimit = maxSubPartnersEntitlement
    ? parseInt(maxSubPartnersEntitlement.value, 10)
    : NaN;
  const effectiveMaxSubPartners =
    !isNaN(parsedEntitlementLimit) && Number.isInteger(parsedEntitlementLimit) && parsedEntitlementLimit >= 0
      ? parsedEntitlementLimit
      : partner.max_sub_partners;

  const existingCount = await db
    .prepare(`SELECT COUNT(*) AS cnt FROM sub_partners WHERE partner_id = ? AND status != 'deactivated'`)
    .bind(partnerId)
    .first<{ cnt: number }>();

  if ((existingCount?.cnt ?? 0) >= effectiveMaxSubPartners) {
    return c.json(
      {
        error: `Partner has reached the maximum sub-partner limit (${effectiveMaxSubPartners})`,
        current: existingCount?.cnt ?? 0,
        limit: effectiveMaxSubPartners,
      },
      409,
    );
  }

  let body: {
    tenantId?: string;
    workspaceId?: string;
    delegationAgreementRef?: string;
  };

  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.tenantId || !body.workspaceId) {
    return c.json({ error: 'tenantId and workspaceId are required' }, 400);
  }

  // Verify workspace belongs to the stated tenant (T3)
  const workspace = await db
    .prepare('SELECT id FROM workspaces WHERE id = ? AND tenant_id = ?')
    .bind(body.workspaceId, body.tenantId)
    .first<{ id: string }>();

  if (!workspace) {
    return c.json({ error: 'Workspace not found or does not belong to the stated tenant' }, 404);
  }

  const id = `sp_${crypto.randomUUID().replace(/-/g, '')}`;

  await db
    .prepare(
      `INSERT INTO sub_partners
         (id, partner_id, tenant_id, workspace_id, delegation_agreement_ref, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      partnerId,
      body.tenantId,
      body.workspaceId,
      body.delegationAgreementRef ?? null,
      auth.userId as string,
    )
    .run();

  await writePartnerAuditLog(db, partnerId, auth.userId as string, 'sub_partner_created', {
    subPartnerId: id,
    tenantId: body.tenantId,
    workspaceId: body.workspaceId,
    delegationAgreementRef: body.delegationAgreementRef ?? null,
  });

  const subPartner = await db
    .prepare('SELECT * FROM sub_partners WHERE id = ?')
    .bind(id)
    .first<Record<string, unknown>>();

  // N-091: partner.sub_partner_created event (category='partner' for inbox filtering)
  void publishEvent(c.env, {
    eventId: id,
    eventKey: PartnerEventType.PartnerSubPartnerCreated,
    tenantId: body.tenantId,
    actorId: auth.userId as string,
    actorType: 'user',
    workspaceId: body.workspaceId,
    payload: { sub_partner_id: id, parent_partner_id: partnerId, tenant_id: body.tenantId, category: 'partner' },
    source: 'api',
    severity: 'info',
  });

  return c.json({ subPartner }, 201);
});

// ---------------------------------------------------------------------------
// PATCH /partners/:id/sub-partners/:subId/status — update sub-partner status
// Governance: rule 4 — downstream management must preserve tenant isolation
// ---------------------------------------------------------------------------

partnerRoutes.patch('/:id/sub-partners/:subId/status', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'super_admin') {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const partnerId = c.req.param('id');
  const subPartnerId = c.req.param('subId');

  const subPartner = await db
    .prepare('SELECT id, partner_id, status FROM sub_partners WHERE id = ? AND partner_id = ?')
    .bind(subPartnerId, partnerId)
    .first<{ id: string; partner_id: string; status: string }>();

  if (!subPartner) {
    return c.json({ error: 'Sub-partner not found under this partner' }, 404);
  }

  let body: { status?: string };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const VALID_SUB_PARTNER_STATUSES = ['active', 'suspended', 'deactivated'] as const;
  if (!body.status || !VALID_SUB_PARTNER_STATUSES.includes(body.status as (typeof VALID_SUB_PARTNER_STATUSES)[number])) {
    return c.json(
      { error: `status must be one of: ${VALID_SUB_PARTNER_STATUSES.join(', ')}` },
      400,
    );
  }

  if (subPartner.status === 'deactivated' && body.status !== 'deactivated') {
    return c.json({ error: 'Deactivated sub-partners cannot be reactivated.' }, 409);
  }

  await db
    .prepare(`UPDATE sub_partners SET status = ?, updated_at = datetime('now') WHERE id = ? AND partner_id = ?`)
    .bind(body.status, subPartnerId, partnerId)
    .run();

  await writePartnerAuditLog(db, partnerId, auth.userId as string, 'sub_partner_status_changed', {
    subPartnerId,
    from: subPartner.status,
    to: body.status,
  });

  const updated = await db
    .prepare('SELECT * FROM sub_partners WHERE id = ? AND partner_id = ?')
    .bind(subPartnerId, partnerId)
    .first<Record<string, unknown>>();

  return c.json({ subPartner: updated });
});

// ---------------------------------------------------------------------------
// GET /partners/:id/entitlements — list partner entitlements (super_admin only)
// ---------------------------------------------------------------------------

partnerRoutes.get('/:id/entitlements', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'super_admin') {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const partnerId = c.req.param('id');

  const partner = await db
    .prepare('SELECT id FROM partners WHERE id = ?')
    .bind(partnerId)
    .first<{ id: string }>();

  if (!partner) {
    return c.json({ error: 'Partner not found' }, 404);
  }

  const { results } = await db
    .prepare(
      `SELECT id, partner_id, dimension, value, granted_by, granted_at, expires_at
       FROM partner_entitlements
       WHERE partner_id = ?
       ORDER BY dimension`,
    )
    .bind(partnerId)
    .all<Record<string, unknown>>();

  return c.json({ entitlements: results ?? [] });
});

// ---------------------------------------------------------------------------
// POST /partners/:id/entitlements — grant entitlement to partner (super_admin only)
// Governance: entitlement-model.md — "delegation is entitlement-controlled"
//             white-label-policy.md — "rights are subscription-controlled"
// ---------------------------------------------------------------------------

partnerRoutes.post('/:id/entitlements', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'super_admin') {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const partnerId = c.req.param('id');

  const partner = await db
    .prepare('SELECT id, status FROM partners WHERE id = ?')
    .bind(partnerId)
    .first<{ id: string; status: string }>();

  if (!partner) {
    return c.json({ error: 'Partner not found' }, 404);
  }

  let body: { dimension?: string; value?: string; expiresAt?: string };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.dimension || !body.value) {
    return c.json({ error: 'dimension and value are required' }, 400);
  }

  if (!VALID_ENTITLEMENT_DIMENSIONS.includes(body.dimension as EntitlementDimension)) {
    return c.json(
      {
        error: `dimension must be one of: ${VALID_ENTITLEMENT_DIMENSIONS.join(', ')}`,
      },
      400,
    );
  }

  // Validate white_label_depth: 0, 1, or 2 (white-label-policy.md)
  if (body.dimension === 'white_label_depth') {
    const depth = parseInt(body.value, 10);
    if (isNaN(depth) || depth < 0 || depth > 2) {
      return c.json({ error: 'white_label_depth value must be 0, 1, or 2' }, 400);
    }
  }

  // Validate delegation_rights: 0 or 1
  if (body.dimension === 'delegation_rights') {
    if (body.value !== '0' && body.value !== '1') {
      return c.json({ error: 'delegation_rights value must be 0 or 1' }, 400);
    }
  }

  // Validate ai_access values
  if (body.dimension === 'ai_access') {
    const validAiAccess = ['none', 'basic', 'advanced', 'byok'];
    if (!validAiAccess.includes(body.value)) {
      return c.json({ error: `ai_access value must be one of: ${validAiAccess.join(', ')}` }, 400);
    }
  }

  const id = `pe_${crypto.randomUUID().replace(/-/g, '')}`;

  // UPSERT — one row per dimension per partner (UNIQUE(partner_id, dimension))
  await db
    .prepare(
      `INSERT INTO partner_entitlements (id, partner_id, dimension, value, granted_by, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(partner_id, dimension) DO UPDATE SET
         value = excluded.value,
         granted_by = excluded.granted_by,
         granted_at = datetime('now'),
         expires_at = excluded.expires_at`,
    )
    .bind(id, partnerId, body.dimension, body.value, auth.userId as string, body.expiresAt ?? null)
    .run();

  await writePartnerAuditLog(db, partnerId, auth.userId as string, 'entitlement_granted', {
    dimension: body.dimension,
    value: body.value,
    expiresAt: body.expiresAt ?? null,
  });

  const entitlement = await db
    .prepare('SELECT * FROM partner_entitlements WHERE partner_id = ? AND dimension = ?')
    .bind(partnerId, body.dimension)
    .first<Record<string, unknown>>();

  return c.json({ entitlement }, 201);
});

// ---------------------------------------------------------------------------
// GET /partners/:id/credits — WakaCU pool balance for a partner (P5)
// ---------------------------------------------------------------------------

partnerRoutes.get('/:id/credits', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'super_admin') {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const partnerId = c.req.param('id');

  const partner = await db
    .prepare('SELECT id, tenant_id FROM partners WHERE id = ?')
    .bind(partnerId)
    .first<{ id: string; tenant_id: string }>();

  if (!partner) {
    return c.json({ error: 'Partner not found' }, 404);
  }

  const wallet = await db
    .prepare(
      `SELECT balance_wc, lifetime_purchased_wc, lifetime_spent_wc,
              spend_cap_monthly_wc, current_month_spent_wc
       FROM wc_wallets WHERE tenant_id = ?`,
    )
    .bind(partner.tenant_id)
    .first<{
      balance_wc: number;
      lifetime_purchased_wc: number;
      lifetime_spent_wc: number;
      spend_cap_monthly_wc: number;
      current_month_spent_wc: number;
    }>();

  // Sum of all allocations made from this partner to sub-tenants
  const allocations = await db
    .prepare(
      `SELECT COALESCE(SUM(amount_wc), 0) AS total_allocated
       FROM partner_credit_allocations WHERE partner_id = ?`,
    )
    .bind(partnerId)
    .first<{ total_allocated: number }>();

  return c.json({
    partnerId,
    tenantId: partner.tenant_id,
    wallet: wallet
      ? {
          balanceWc: wallet.balance_wc,
          lifetimePurchasedWc: wallet.lifetime_purchased_wc,
          lifetimeSpentWc: wallet.lifetime_spent_wc,
          spendCapMonthlyWc: wallet.spend_cap_monthly_wc,
          currentMonthSpentWc: wallet.current_month_spent_wc,
        }
      : null,
    totalAllocatedWc: allocations?.total_allocated ?? 0,
  });
});

// ---------------------------------------------------------------------------
// POST /partners/:id/credits/allocate — allocate WakaCU credits to sub-tenant (P5)
// ---------------------------------------------------------------------------

partnerRoutes.post('/:id/credits/allocate', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'super_admin') {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const partnerId = c.req.param('id');

  const partner = await db
    .prepare('SELECT id, tenant_id, status FROM partners WHERE id = ?')
    .bind(partnerId)
    .first<{ id: string; tenant_id: string; status: string }>();

  if (!partner) {
    return c.json({ error: 'Partner not found' }, 404);
  }

  if (partner.status !== 'active') {
    return c.json({ error: 'Partner must be active to allocate credits' }, 422);
  }

  let body: { recipientTenant?: string; amountWc?: number; note?: string };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.recipientTenant || !body.amountWc) {
    return c.json({ error: 'recipientTenant and amountWc are required' }, 400);
  }

  if (!Number.isInteger(body.amountWc) || body.amountWc <= 0) {
    return c.json({ error: 'amountWc must be a positive integer (P9 invariant)' }, 400);
  }

  // Verify recipient is a valid sub-tenant of this partner
  const subPartner = await db
    .prepare(
      `SELECT id FROM sub_partners
       WHERE partner_id = ? AND tenant_id = ? AND status = 'active'`,
    )
    .bind(partnerId, body.recipientTenant)
    .first<{ id: string }>();

  if (!subPartner) {
    return c.json(
      { error: 'recipientTenant is not an active sub-tenant of this partner' },
      422,
    );
  }

  // Check partner wallet balance
  const wallet = await db
    .prepare('SELECT balance_wc FROM wc_wallets WHERE tenant_id = ?')
    .bind(partner.tenant_id)
    .first<{ balance_wc: number }>();

  if (!wallet) {
    return c.json({ error: 'Partner wallet not found' }, 422);
  }

  if (wallet.balance_wc < body.amountWc) {
    return c.json(
      {
        error: 'Insufficient WakaCU balance',
        available: wallet.balance_wc,
        requested: body.amountWc,
      },
      422,
    );
  }

  // Debit partner wallet
  const partnerBalanceAfter = wallet.balance_wc - body.amountWc;
  await db
    .prepare(
      `UPDATE wc_wallets
       SET balance_wc = ?, lifetime_spent_wc = lifetime_spent_wc + ?,
           current_month_spent_wc = current_month_spent_wc + ?,
           updated_at = datetime('now')
       WHERE tenant_id = ?`,
    )
    .bind(partnerBalanceAfter, body.amountWc, body.amountWc, partner.tenant_id)
    .run();

  const partnerTxId = `wct_${crypto.randomUUID().replace(/-/g, '')}`;
  await db
    .prepare(
      `INSERT INTO wc_transactions
         (id, tenant_id, type, amount_wc, balance_after_wc, description, reference_id)
       VALUES (?, ?, 'debit', ?, ?, ?, ?)`,
    )
    .bind(
      partnerTxId,
      partner.tenant_id,
      -body.amountWc,
      partnerBalanceAfter,
      `Partner credit allocation to sub-tenant ${body.recipientTenant}`,
      null,
    )
    .run();

  // Credit sub-tenant wallet — UPSERT in case no wallet yet
  const recipientWallet = await db
    .prepare('SELECT balance_wc FROM wc_wallets WHERE tenant_id = ?')
    .bind(body.recipientTenant)
    .first<{ balance_wc: number }>();

  const recipientCurrentBalance = recipientWallet?.balance_wc ?? 0;
  const recipientBalanceAfter = recipientCurrentBalance + body.amountWc;

  if (recipientWallet) {
    await db
      .prepare(
        `UPDATE wc_wallets
         SET balance_wc = ?, lifetime_purchased_wc = lifetime_purchased_wc + ?,
             updated_at = datetime('now')
         WHERE tenant_id = ?`,
      )
      .bind(recipientBalanceAfter, body.amountWc, body.recipientTenant)
      .run();
  } else {
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    const resetAt = resetDate.toISOString().slice(0, 10);
    await db
      .prepare(
        `INSERT INTO wc_wallets
           (tenant_id, balance_wc, lifetime_purchased_wc, lifetime_spent_wc,
            spend_cap_monthly_wc, current_month_spent_wc, spend_cap_reset_at, updated_at)
         VALUES (?, ?, ?, 0, 1000, 0, ?, datetime('now'))`,
      )
      .bind(body.recipientTenant, body.amountWc, body.amountWc, resetAt)
      .run();
  }

  const recipientTxId = `wct_${crypto.randomUUID().replace(/-/g, '')}`;
  await db
    .prepare(
      `INSERT INTO wc_transactions
         (id, tenant_id, type, amount_wc, balance_after_wc, description, reference_id)
       VALUES (?, ?, 'credit', ?, ?, ?, ?)`,
    )
    .bind(
      recipientTxId,
      body.recipientTenant,
      body.amountWc,
      recipientBalanceAfter,
      `Partner credit allocation from partner ${partnerId}`,
      null,
    )
    .run();

  // Record the allocation
  const allocationId = `pca_${crypto.randomUUID().replace(/-/g, '')}`;
  await db
    .prepare(
      `INSERT INTO partner_credit_allocations
         (id, partner_id, recipient_tenant, amount_wc, note, allocated_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      allocationId,
      partnerId,
      body.recipientTenant,
      body.amountWc,
      body.note ?? null,
      auth.userId as string,
    )
    .run();

  await writePartnerAuditLog(db, partnerId, auth.userId as string, 'credits_allocated', {
    recipientTenant: body.recipientTenant,
    amountWc: body.amountWc,
    partnerBalanceAfter,
    allocationId,
  });

  return c.json(
    {
      allocationId,
      partnerId,
      recipientTenant: body.recipientTenant,
      amountWc: body.amountWc,
      partnerBalanceAfter,
      recipientBalanceAfter,
    },
    201,
  );
});

// ---------------------------------------------------------------------------
// GET /partners/:id/credits/history — paginated allocation history (P5)
// ---------------------------------------------------------------------------

partnerRoutes.get('/:id/credits/history', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'super_admin') {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const partnerId = c.req.param('id');

  const partner = await db
    .prepare('SELECT id FROM partners WHERE id = ?')
    .bind(partnerId)
    .first<{ id: string }>();

  if (!partner) {
    return c.json({ error: 'Partner not found' }, 404);
  }

  const rawPage = parseInt(c.req.query('page') ?? '1', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const perPage = 50;
  const offset = (page - 1) * perPage;

  const { results } = await db
    .prepare(
      `SELECT id, recipient_tenant, amount_wc, note, allocated_by, created_at
       FROM partner_credit_allocations
       WHERE partner_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(partnerId, perPage, offset)
    .all<{
      id: string;
      recipient_tenant: string;
      amount_wc: number;
      note: string | null;
      allocated_by: string;
      created_at: string;
    }>();

  return c.json({ allocations: results ?? [], page, perPage });
});

// ---------------------------------------------------------------------------
// POST /partners/:id/settlements/calculate — calculate revenue share (P5)
// P9 Invariant: all amounts INTEGER kobo, share rate INTEGER basis points
// ---------------------------------------------------------------------------

partnerRoutes.post('/:id/settlements/calculate', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'super_admin') {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const partnerId = c.req.param('id');

  const partner = await db
    .prepare('SELECT id, status FROM partners WHERE id = ?')
    .bind(partnerId)
    .first<{ id: string; status: string }>();

  if (!partner) {
    return c.json({ error: 'Partner not found' }, 404);
  }

  let body: {
    periodStart?: string;
    periodEnd?: string;
    grossGmvKobo?: number;
    shareBasisPoints?: number;
    notes?: string;
  };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.periodStart || !body.periodEnd || body.grossGmvKobo === undefined || body.shareBasisPoints === undefined) {
    return c.json(
      { error: 'periodStart, periodEnd, grossGmvKobo, and shareBasisPoints are required' },
      400,
    );
  }

  // P9: all amounts must be integers
  if (!Number.isInteger(body.grossGmvKobo) || body.grossGmvKobo < 0) {
    return c.json({ error: 'grossGmvKobo must be a non-negative integer (kobo, P9 invariant)' }, 400);
  }

  if (!Number.isInteger(body.shareBasisPoints) || body.shareBasisPoints < 0 || body.shareBasisPoints > 10000) {
    return c.json(
      { error: 'shareBasisPoints must be an integer between 0 and 10000 (P9 invariant)' },
      400,
    );
  }

  // P9: integer arithmetic — Math.round to stay in integer domain
  const platformFeeKobo = Math.round(body.grossGmvKobo * (10000 - body.shareBasisPoints) / 10000);
  const partnerShareKobo = body.grossGmvKobo - platformFeeKobo;

  const settlementId = `ps_${crypto.randomUUID().replace(/-/g, '')}`;

  await db
    .prepare(
      `INSERT INTO partner_settlements
         (id, partner_id, period_start, period_end, gross_gmv_kobo,
          platform_fee_kobo, partner_share_kobo, share_basis_points,
          status, calculated_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    )
    .bind(
      settlementId,
      partnerId,
      body.periodStart,
      body.periodEnd,
      body.grossGmvKobo,
      platformFeeKobo,
      partnerShareKobo,
      body.shareBasisPoints,
      auth.userId as string,
      body.notes ?? null,
    )
    .run();

  await writePartnerAuditLog(db, partnerId, auth.userId as string, 'settlement_calculated', {
    settlementId,
    periodStart: body.periodStart,
    periodEnd: body.periodEnd,
    grossGmvKobo: body.grossGmvKobo,
    shareBasisPoints: body.shareBasisPoints,
    partnerShareKobo,
  });

  // N-091: partner.commission_earned event (settlement calculated — pending disbursement)
  void publishEvent(c.env, {
    eventId: settlementId,
    eventKey: PartnerEventType.PartnerCommissionEarned,
    tenantId: auth.tenantId ?? 'platform',
    actorId: auth.userId as string,
    actorType: 'user',
    payload: {
      partner_id: partnerId,
      settlement_id: settlementId,
      period_start: body.periodStart,
      period_end: body.periodEnd,
      partner_share_kobo: partnerShareKobo,
      share_basis_points: body.shareBasisPoints,
      category: 'partner',
    },
    source: 'api',
    severity: 'info',
  });

  return c.json(
    {
      settlementId,
      partnerId,
      periodStart: body.periodStart,
      periodEnd: body.periodEnd,
      grossGmvKobo: body.grossGmvKobo,
      platformFeeKobo,
      partnerShareKobo,
      shareBasisPoints: body.shareBasisPoints,
      status: 'pending',
    },
    201,
  );
});

// ---------------------------------------------------------------------------
// GET /partners/:id/settlements — list settlements for a partner (P5)
// ---------------------------------------------------------------------------

partnerRoutes.get('/:id/settlements', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'super_admin') {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const partnerId = c.req.param('id');

  const partner = await db
    .prepare('SELECT id FROM partners WHERE id = ?')
    .bind(partnerId)
    .first<{ id: string }>();

  if (!partner) {
    return c.json({ error: 'Partner not found' }, 404);
  }

  const rawPage = parseInt(c.req.query('page') ?? '1', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const perPage = 50;
  const offset = (page - 1) * perPage;

  const { results } = await db
    .prepare(
      `SELECT id, period_start, period_end, gross_gmv_kobo, platform_fee_kobo,
              partner_share_kobo, share_basis_points, status,
              calculated_by, calculated_at, approved_by, approved_at, paid_at, notes
       FROM partner_settlements
       WHERE partner_id = ?
       ORDER BY period_start DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(partnerId, perPage, offset)
    .all<Record<string, unknown>>();

  return c.json({ settlements: results ?? [], page, perPage });
});

export { partnerRoutes };
