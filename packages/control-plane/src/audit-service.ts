/**
 * @webwaka/control-plane — AuditService
 *
 * Append-only governance audit log writer.
 * Every configuration change across all 5 control layers must call this service.
 * Platform Invariant: audit records are NEVER deleted or updated.
 */

import type { D1Like, ActorContext } from './types.js';

export interface AuditEntry {
  action: string;
  resourceType: string;
  resourceId?: string;
  beforeJson?: unknown;
  afterJson?: unknown;
  status?: 'success' | 'failure' | 'pending_approval';
  failureReason?: string;
  approvalId?: string;
}

export class AuditService {
  constructor(private readonly db: D1Like) {}

  async log(actor: ActorContext, entry: AuditEntry): Promise<void> {
    const id = `gal_${crypto.randomUUID()}`;
    const now = Math.floor(Date.now() / 1000);

    await this.db
      .prepare(
        `INSERT INTO governance_audit_log
           (id, actor_id, actor_role, actor_level,
            tenant_id, partner_id, workspace_id,
            action, resource_type, resource_id,
            before_json, after_json,
            ip_address, request_id, approval_id,
            status, failure_reason, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .bind(
        id,
        actor.actorId,
        actor.actorRole,
        actor.actorLevel,
        actor.tenantId ?? null,
        actor.partnerId ?? null,
        actor.workspaceId ?? null,
        entry.action,
        entry.resourceType,
        entry.resourceId ?? null,
        entry.beforeJson != null ? JSON.stringify(entry.beforeJson) : null,
        entry.afterJson != null ? JSON.stringify(entry.afterJson) : null,
        actor.ipAddress ?? null,
        actor.requestId ?? null,
        entry.approvalId ?? null,
        entry.status ?? 'success',
        entry.failureReason ?? null,
        now,
      )
      .run();
  }

  async query(opts: {
    tenantId?: string;
    resourceType?: string;
    action?: string;
    actorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ results: unknown[]; total: number }> {
    const conditions: string[] = [];
    const bindings: unknown[] = [];

    if (opts.tenantId) { conditions.push('tenant_id = ?'); bindings.push(opts.tenantId); }
    if (opts.resourceType) { conditions.push('resource_type = ?'); bindings.push(opts.resourceType); }
    if (opts.action) { conditions.push('action = ?'); bindings.push(opts.action); }
    if (opts.actorId) { conditions.push('actor_id = ?'); bindings.push(opts.actorId); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(opts.limit ?? 50, 200);
    const offset = opts.offset ?? 0;

    const [rows, countRow] = await Promise.all([
      this.db
        .prepare(`SELECT * FROM governance_audit_log ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
        .bind(...bindings, limit, offset)
        .all<unknown>(),
      this.db
        .prepare(`SELECT COUNT(*) as total FROM governance_audit_log ${where}`)
        .bind(...bindings)
        .first<{ total: number }>(),
    ]);

    return {
      results: rows.results,
      total: countRow?.total ?? 0,
    };
  }
}
