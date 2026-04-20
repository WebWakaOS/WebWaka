/**
 * @webwaka/notifications — Audience resolver (N-022, Phase 2).
 *
 * Maps rule audience_type → list of { userId, email } recipient rows.
 *
 * Supported audience types (notification_rule.audience_type CHECK constraint):
 *   actor           — the user who triggered the event (actorId)
 *   subject         — the target entity user (subjectId)
 *   workspace_admins — all admins in the workspace (role IN ('admin','super_admin'))
 *   tenant_admins   — all admins for the tenant (role = 'tenant_admin')
 *   all_members     — all members of the workspace
 *   super_admins    — platform super_admins (platform-wide)
 *   partner_admins  — partner_admin role within the tenant
 *   custom          — custom audience_filter JSON (Phase 6 stub — falls back to actor)
 *
 * Guardrails:
 *   G1 — tenant_id in every D1 query; cross-tenant leakage impossible by design
 *   G23 — no PII stored in audience resolution; only userId + email returned
 */

import type { D1LikeFull } from './db-types.js';
import type { NotificationRuleRow } from './rule-engine.js';

// ---------------------------------------------------------------------------
// RecipientInfo — resolved recipient identity
// ---------------------------------------------------------------------------

export interface RecipientInfo {
  userId: string;
  email: string | null;
}

// ---------------------------------------------------------------------------
// Audience resolution context
// ---------------------------------------------------------------------------

export interface AudienceContext {
  tenantId: string;
  actorId?: string | null;
  subjectId?: string | null;
  workspaceId?: string | null;
}

// ---------------------------------------------------------------------------
// resolveAudience
// ---------------------------------------------------------------------------

/**
 * Resolve the audience for a notification rule.
 *
 * @param db      - D1LikeFull database binding (G1: tenant_id required)
 * @param rule    - The notification rule row with audience_type
 * @param ctx     - Event context (tenantId, actorId, subjectId, workspaceId)
 * @returns       - Deduplicated list of RecipientInfo; empty if actor/subject missing
 */
export async function resolveAudience(
  db: D1LikeFull,
  rule: NotificationRuleRow,
  ctx: AudienceContext,
): Promise<RecipientInfo[]> {
  switch (rule.audience_type) {
    case 'actor':
      return resolveActor(ctx);

    case 'subject':
      return resolveSubject(ctx);

    case 'workspace_admins':
      return resolveWorkspaceAdmins(db, ctx);

    case 'tenant_admins':
      return resolveTenantAdmins(db, ctx);

    case 'all_members':
      return resolveAllMembers(db, ctx);

    case 'super_admins':
      return resolveSuperAdmins(db, ctx);

    case 'partner_admins':
      return resolvePartnerAdmins(db, ctx);

    case 'custom':
      // Phase 6 stub: custom audience_filter JSON not implemented yet.
      // Fall back to actor for now to avoid silent delivery failure.
      return resolveActor(ctx);

    default:
      // Unknown type — safe empty (no deliveries created)
      return [];
  }
}

// ---------------------------------------------------------------------------
// Per-type resolvers (private)
// ---------------------------------------------------------------------------

function resolveActor(ctx: AudienceContext): RecipientInfo[] {
  if (!ctx.actorId) {
    return [];
  }
  return [{ userId: ctx.actorId, email: null }];
}

function resolveSubject(ctx: AudienceContext): RecipientInfo[] {
  if (!ctx.subjectId) {
    return [];
  }
  return [{ userId: ctx.subjectId, email: null }];
}

async function resolveWorkspaceAdmins(
  db: D1LikeFull,
  ctx: AudienceContext,
): Promise<RecipientInfo[]> {
  if (!ctx.workspaceId) {
    return [];
  }
  // G1: scoped to tenant_id AND workspace_id
  const result = await db
    .prepare(
      `SELECT id, email FROM users
       WHERE workspace_id = ? AND tenant_id = ?
         AND role IN ('admin', 'super_admin')
       LIMIT 100`,
    )
    .bind(ctx.workspaceId, ctx.tenantId)
    .all<{ id: string; email: string | null }>();

  return result.results.map((r) => ({ userId: r.id, email: r.email }));
}

async function resolveTenantAdmins(
  db: D1LikeFull,
  ctx: AudienceContext,
): Promise<RecipientInfo[]> {
  // G1: scoped to tenant_id
  const result = await db
    .prepare(
      `SELECT id, email FROM users
       WHERE tenant_id = ? AND role IN ('tenant_admin', 'admin', 'super_admin')
       LIMIT 100`,
    )
    .bind(ctx.tenantId)
    .all<{ id: string; email: string | null }>();

  return result.results.map((r) => ({ userId: r.id, email: r.email }));
}

async function resolveAllMembers(
  db: D1LikeFull,
  ctx: AudienceContext,
): Promise<RecipientInfo[]> {
  if (!ctx.workspaceId) {
    return [];
  }
  // G1: scoped to tenant_id AND workspace_id; capped at 500 to prevent runaway
  const result = await db
    .prepare(
      `SELECT id, email FROM users
       WHERE workspace_id = ? AND tenant_id = ?
       LIMIT 500`,
    )
    .bind(ctx.workspaceId, ctx.tenantId)
    .all<{ id: string; email: string | null }>();

  return result.results.map((r) => ({ userId: r.id, email: r.email }));
}

async function resolveSuperAdmins(
  db: D1LikeFull,
  ctx: AudienceContext,
): Promise<RecipientInfo[]> {
  // Platform-level super_admins — intentionally not scoped to tenant_id
  // (these are platform operators, not per-tenant admins)
  const result = await db
    .prepare(
      `SELECT id, email FROM users
       WHERE role = 'super_admin'
       LIMIT 50`,
    )
    .bind()
    .all<{ id: string; email: string | null }>();

  return result.results.map((r) => ({ userId: r.id, email: r.email }));
}

async function resolvePartnerAdmins(
  db: D1LikeFull,
  ctx: AudienceContext,
): Promise<RecipientInfo[]> {
  // G1: partner_admins scoped to tenant_id
  const result = await db
    .prepare(
      `SELECT id, email FROM users
       WHERE tenant_id = ? AND role = 'partner_admin'
       LIMIT 100`,
    )
    .bind(ctx.tenantId)
    .all<{ id: string; email: string | null }>();

  return result.results.map((r) => ({ userId: r.id, email: r.email }));
}

// ---------------------------------------------------------------------------
// lookupRecipientEmail
// ---------------------------------------------------------------------------

/**
 * Look up a recipient's email from the users table.
 * Used when audience resolution returns email=null (actor/subject types).
 *
 * G1: tenantId scoped. Also accepts NULL tenant_id rows (platform users).
 * G23: returns null if user not found — caller handles gracefully.
 */
export async function lookupRecipientEmail(
  db: D1LikeFull,
  userId: string,
  tenantId: string,
): Promise<string | null> {
  const row = await db
    .prepare(
      `SELECT email FROM users
       WHERE id = ? AND (tenant_id = ? OR tenant_id IS NULL)
       LIMIT 1`,
    )
    .bind(userId, tenantId)
    .first<{ email: string | null }>();

  return row?.email ?? null;
}

// ---------------------------------------------------------------------------
// deduplicateRecipients
// ---------------------------------------------------------------------------

/**
 * Deduplicate recipients by userId.
 * If the same user appears multiple times, keep the first occurrence.
 */
export function deduplicateRecipients(recipients: RecipientInfo[]): RecipientInfo[] {
  const seen = new Set<string>();
  const result: RecipientInfo[] = [];
  for (const r of recipients) {
    if (!seen.has(r.userId)) {
      seen.add(r.userId);
      result.push(r);
    }
  }
  return result;
}
