/**
 * @webwaka/control-plane — DelegationGuard
 *
 * Enforces hierarchical admin delegation boundaries.
 * Prevents privilege escalation — a lower-level admin cannot grant/configure
 * beyond what a higher-level admin has explicitly allowed.
 */

import type { D1Like, ActorContext, AdminLevel, DelegationPolicy } from './types.js';
import type { AuditService } from './audit-service.js';

export class DelegationError extends Error {
  readonly statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = 'DelegationError';
  }
}

const LEVEL_RANK: Record<string, number> = {
  super_admin: 0,
  platform_admin: 1,
  partner_admin: 2,
  tenant_admin: 3,
  workspace_admin: 4,
  system: -1,
};

export class DelegationGuard {
  constructor(
    private readonly db: D1Like,
    private readonly audit: AuditService,
  ) {}

  private rankOf(level: string): number {
    return LEVEL_RANK[level] ?? 99;
  }

  /** Returns true if actorLevel outranks or equals minimumLevel */
  outranks(actorLevel: string, minimumLevel: string): boolean {
    return this.rankOf(actorLevel) <= this.rankOf(minimumLevel);
  }

  /**
   * Assert that actor is allowed to perform a given capability.
   * Throws DelegationError if not.
   */
  async assertCanPerform(actor: ActorContext, capability: string): Promise<void> {
    // Super admin can do everything
    if (actor.actorLevel === 'super_admin' || actor.actorLevel === 'system') return;

    // Check delegation capability minimum level
    const cap = await this.db
      .prepare('SELECT min_grantor_level FROM delegation_capabilities WHERE code = ? LIMIT 1')
      .bind(capability)
      .first<{ min_grantor_level: string }>();

    if (!cap) {
      throw new DelegationError(`Unknown capability: ${capability}`);
    }

    if (!this.outranks(actor.actorLevel, cap.min_grantor_level)) {
      throw new DelegationError(
        `Access denied: capability '${capability}' requires ${cap.min_grantor_level} level or above. Your level: ${actor.actorLevel}`,
      );
    }

    // Check explicit delegation policies
    const policy = await this.resolvePolicy(actor, capability);
    if (policy && policy.effect === 'deny') {
      await this.audit.log(actor, {
        action: 'delegation.denied',
        resourceType: 'delegation_policy',
        resourceId: policy.id,
        afterJson: { capability, reason: 'explicit_deny' },
        status: 'failure',
        failureReason: `Capability '${capability}' explicitly denied by policy ${policy.id}`,
      });
      throw new DelegationError(`Capability '${capability}' is not permitted for your admin level.`);
    }
  }

  /**
   * Assert that actor can assign a role whose base_role does not exceed their own ceiling.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async assertCanAssignRole(actor: ActorContext, targetBaseRole: string): Promise<void> {
    if (actor.actorLevel === 'super_admin' || actor.actorLevel === 'system') return;

    const actorRoleRank = LEVEL_RANK[actor.actorRole as AdminLevel] ?? 99;
    const targetRank = LEVEL_RANK[targetBaseRole as AdminLevel] ?? 99;

    if (targetRank < actorRoleRank) {
      throw new DelegationError(
        `Access denied: you cannot assign a role (${targetBaseRole}) with higher privilege than your own (${actor.actorRole}).`,
      );
    }
  }

  private async resolvePolicy(actor: ActorContext, capability: string): Promise<DelegationPolicy | null> {
    return this.db
      .prepare(
        `SELECT * FROM admin_delegation_policies
         WHERE capability = ? AND grantee_level = ? AND is_active = 1
           AND (grantee_id = ? OR grantee_id IS NULL)
         ORDER BY grantee_id DESC
         LIMIT 1`,
      )
      .bind(capability, actor.actorLevel, actor.actorId)
      .first<DelegationPolicy>();
  }

  // ─── Policy Management ────────────────────────────────────────────────────

  async listPolicies(opts: { grantorLevel?: string; granteeLevel?: string; capability?: string } = {}): Promise<DelegationPolicy[]> {
    const conditions: string[] = ['is_active = 1'];
    const bindings: unknown[] = [];

    if (opts.grantorLevel) { conditions.push('grantor_level = ?'); bindings.push(opts.grantorLevel); }
    if (opts.granteeLevel) { conditions.push('grantee_level = ?'); bindings.push(opts.granteeLevel); }
    if (opts.capability) { conditions.push('capability = ?'); bindings.push(opts.capability); }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const rows = await this.db.prepare(`SELECT * FROM admin_delegation_policies ${where} ORDER BY grantor_level, grantee_level, capability`).bind(...bindings).all<DelegationPolicy>();
    return rows.results;
  }

  async createPolicy(input: Partial<DelegationPolicy>, actor: ActorContext): Promise<DelegationPolicy> {
    // Only super_admin can create delegation policies
    if (actor.actorLevel !== 'super_admin' && actor.actorLevel !== 'system') {
      throw new DelegationError('Only super_admin can create delegation policies.');
    }

    const id = `dp_${crypto.randomUUID()}`;
    const now = Math.floor(Date.now() / 1000);

    await this.db
      .prepare(
        `INSERT INTO admin_delegation_policies
           (id, grantor_level, grantor_id, grantee_level, grantee_id, capability, ceiling_json, effect, requires_approval, approver_level, is_active, notes, created_by, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,1,?,?,?,?)`,
      )
      .bind(
        id,
        input.grantor_level, input.grantor_id ?? null,
        input.grantee_level, input.grantee_id ?? null,
        input.capability, input.ceiling_json ?? '{}',
        input.effect ?? 'allow',
        input.requires_approval ? 1 : 0,
        input.approver_level ?? null,
        null, actor.actorId, now, now,
      )
      .run();

    const policy = await this.db.prepare('SELECT * FROM admin_delegation_policies WHERE id = ?').bind(id).first<DelegationPolicy>();
    if (!policy) throw new Error('Failed to create policy');

    await this.audit.log(actor, { action: 'delegation.policy.create', resourceType: 'admin_delegation_policy', resourceId: id, afterJson: policy });
    return policy;
  }

  async listCapabilities(): Promise<unknown[]> {
    const rows = await this.db.prepare('SELECT * FROM delegation_capabilities ORDER BY category, code').bind().all<unknown>();
    return rows.results;
  }
}
