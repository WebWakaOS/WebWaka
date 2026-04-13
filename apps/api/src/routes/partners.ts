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

export { partnerRoutes };
