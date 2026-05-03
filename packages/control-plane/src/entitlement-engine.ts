/**
 * @webwaka/control-plane — EntitlementEngine
 *
 * DB-first entitlement evaluation with fallback to hardcoded PLAN_CONFIGS.
 * Implements Layer 2: Dynamic Entitlements.
 *
 * Resolution order:
 *   1. workspace_entitlement_overrides (highest priority — per-workspace custom)
 *   2. package_entitlement_bindings (from subscription_packages)
 *   3. PLAN_CONFIGS static fallback (compatibility bridge)
 *   4. entitlement_definitions.default_value (absolute fallback)
 */

import type { D1Like, ActorContext, EntitlementDefinition, ResolvedEntitlements, PaginatedResult } from './types.js';
import type { AuditService } from './audit-service.js';

function parseValue(raw: string, valueType: string): string | number | boolean {
  switch (valueType) {
    case 'boolean': return raw === 'true' || raw === '1';
    case 'integer': return parseInt(raw, 10);
    case 'float': return parseFloat(raw);
    default: return raw;
  }
}

export class EntitlementEngine {
  constructor(
    private readonly db: D1Like,
    private readonly audit: AuditService,
  ) {}

  // ─── Entitlement Definitions ──────────────────────────────────────────────

  async listDefinitions(opts: { category?: string; isActive?: boolean; limit?: number; offset?: number } = {}): Promise<PaginatedResult<EntitlementDefinition>> {
    const conditions: string[] = [];
    const bindings: unknown[] = [];

    if (opts.category) { conditions.push('category = ?'); bindings.push(opts.category); }
    if (opts.isActive !== undefined) { conditions.push('is_active = ?'); bindings.push(opts.isActive ? 1 : 0); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(opts.limit ?? 100, 200);
    const offset = opts.offset ?? 0;

    const [rows, countRow] = await Promise.all([
      this.db.prepare(`SELECT * FROM entitlement_definitions ${where} ORDER BY sort_order ASC LIMIT ? OFFSET ?`).bind(...bindings, limit, offset).all<EntitlementDefinition>(),
      this.db.prepare(`SELECT COUNT(*) as total FROM entitlement_definitions ${where}`).bind(...bindings).first<{ total: number }>(),
    ]);

    return { results: rows.results, ...(countRow?.total !== undefined ? { total: countRow.total } : {}), limit, offset };
  }

  async getDefinition(idOrCode: string): Promise<EntitlementDefinition | null> {
    return this.db
      .prepare('SELECT * FROM entitlement_definitions WHERE id = ? OR code = ? LIMIT 1')
      .bind(idOrCode, idOrCode)
      .first<EntitlementDefinition>();
  }

  async createDefinition(input: Partial<EntitlementDefinition>, actor: ActorContext): Promise<EntitlementDefinition> {
    const id = `ent_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const now = Math.floor(Date.now() / 1000);

    await this.db
      .prepare(
        `INSERT INTO entitlement_definitions (id, code, name, description, category, value_type, default_value, unit, is_active, sort_order, metadata, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,1,?,?,?,?)`,
      )
      .bind(
        id, input.code, input.name, input.description ?? null,
        input.category ?? 'feature', input.value_type ?? 'boolean',
        input.default_value ?? 'false', input.unit ?? null,
        input.sort_order ?? 0, '{}', now, now,
      )
      .run();

    const def = await this.getDefinition(id);
    if (!def) throw new Error('Failed to create entitlement definition');

    await this.audit.log(actor, { action: 'entitlement.definition.create', resourceType: 'entitlement_definition', resourceId: id, afterJson: def });
    return def;
  }

  async updateDefinition(id: string, input: Partial<EntitlementDefinition>, actor: ActorContext): Promise<EntitlementDefinition> {
    const existing = await this.getDefinition(id);
    if (!existing) throw new Error(`Entitlement definition not found: ${id}`);

    const now = Math.floor(Date.now() / 1000);
    const sets: string[] = ['updated_at = ?'];
    const bindings: unknown[] = [now];

    if (input.name !== undefined) { sets.push('name = ?'); bindings.push(input.name); }
    if (input.description !== undefined) { sets.push('description = ?'); bindings.push(input.description); }
    if (input.default_value !== undefined) { sets.push('default_value = ?'); bindings.push(input.default_value); }
    if (input.is_active !== undefined) { sets.push('is_active = ?'); bindings.push(input.is_active); }
    if (input.sort_order !== undefined) { sets.push('sort_order = ?'); bindings.push(input.sort_order); }

    bindings.push(id);
    await this.db.prepare(`UPDATE entitlement_definitions SET ${sets.join(', ')} WHERE id = ?`).bind(...bindings).run();

    const updated = await this.getDefinition(id);
    await this.audit.log(actor, { action: 'entitlement.definition.update', resourceType: 'entitlement_definition', resourceId: id, beforeJson: existing, afterJson: updated });
    return updated!;
  }

  // ─── Package–Entitlement Bindings ─────────────────────────────────────────

  async getPackageEntitlements(packageId: string): Promise<Array<EntitlementDefinition & { binding_value: string }>> {
    const rows = await this.db
      .prepare(
        `SELECT ed.*, peb.value as binding_value
         FROM package_entitlement_bindings peb
         JOIN entitlement_definitions ed ON peb.entitlement_id = ed.id
         WHERE peb.package_id = ? AND peb.billing_interval_id IS NULL
         ORDER BY ed.sort_order ASC`,
      )
      .bind(packageId)
      .all<EntitlementDefinition & { binding_value: string }>();
    return rows.results;
  }

  async setPackageEntitlement(packageId: string, entitlementId: string, value: string, actor: ActorContext): Promise<void> {
    const id = `peb_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const now = Math.floor(Date.now() / 1000);

    await this.db
      .prepare(
        `INSERT INTO package_entitlement_bindings (id, package_id, entitlement_id, value, created_at, updated_at)
         VALUES (?,?,?,?,?,?)
         ON CONFLICT (package_id, entitlement_id, billing_interval_id) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`,
      )
      .bind(id, packageId, entitlementId, value, now, now)
      .run();

    await this.audit.log(actor, {
      action: 'entitlement.binding.set',
      resourceType: 'package_entitlement_binding',
      resourceId: packageId,
      afterJson: { packageId, entitlementId, value },
    });
  }

  async removePackageEntitlement(packageId: string, entitlementId: string, actor: ActorContext): Promise<void> {
    await this.db
      .prepare('DELETE FROM package_entitlement_bindings WHERE package_id = ? AND entitlement_id = ? AND billing_interval_id IS NULL')
      .bind(packageId, entitlementId)
      .run();

    await this.audit.log(actor, {
      action: 'entitlement.binding.remove',
      resourceType: 'package_entitlement_binding',
      resourceId: packageId,
      afterJson: { packageId, entitlementId },
    });
  }

  // ─── Workspace Overrides ──────────────────────────────────────────────────

  async setWorkspaceOverride(
    workspaceId: string,
    tenantId: string,
    entitlementId: string,
    value: string,
    grantedBy: string,
    opts: { reason?: string; expiresAt?: number } = {},
    actor: ActorContext,
  ): Promise<void> {
    const id = `weo_${crypto.randomUUID()}`;
    const now = Math.floor(Date.now() / 1000);

    await this.db
      .prepare(
        `INSERT INTO workspace_entitlement_overrides
           (id, workspace_id, tenant_id, entitlement_id, value, reason, granted_by, expires_at, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT (workspace_id, entitlement_id)
         DO UPDATE SET value=excluded.value, reason=excluded.reason, granted_by=excluded.granted_by, expires_at=excluded.expires_at, updated_at=excluded.updated_at`,
      )
      .bind(id, workspaceId, tenantId, entitlementId, value, opts.reason ?? null, grantedBy, opts.expiresAt ?? null, now, now)
      .run();

    await this.audit.log(actor, {
      action: 'entitlement.workspace_override.set',
      resourceType: 'workspace_entitlement_override',
      resourceId: workspaceId,
      afterJson: { workspaceId, entitlementId, value },
    });
  }

  // ─── Resolution ───────────────────────────────────────────────────────────

  async resolveForWorkspace(workspaceId: string, planSlug: string): Promise<ResolvedEntitlements> {
    const resolved: ResolvedEntitlements = {};

    // 1. Load all entitlement definitions with their default values
    const defs = await this.db
      .prepare('SELECT * FROM entitlement_definitions WHERE is_active = 1 ORDER BY sort_order ASC')
      .bind()
      .all<EntitlementDefinition>();

    for (const def of defs.results) {
      resolved[def.code] = parseValue(def.default_value, def.value_type);
    }

    // 2. Apply package bindings (via plan slug → package id)
    const pkg = await this.db
      .prepare('SELECT id FROM subscription_packages WHERE slug = ? AND status = ? LIMIT 1')
      .bind(planSlug, 'active')
      .first<{ id: string }>();

    if (pkg) {
      const bindings = await this.db
        .prepare(
          `SELECT ed.code, ed.value_type, peb.value
           FROM package_entitlement_bindings peb
           JOIN entitlement_definitions ed ON peb.entitlement_id = ed.id
           WHERE peb.package_id = ? AND peb.billing_interval_id IS NULL`,
        )
        .bind(pkg.id)
        .all<{ code: string; value_type: string; value: string }>();

      for (const b of bindings.results) {
        resolved[b.code] = parseValue(b.value, b.value_type);
      }
    }

    // 3. Apply workspace-level overrides (highest priority, may have expiry)
    const now = Math.floor(Date.now() / 1000);
    const overrides = await this.db
      .prepare(
        `SELECT ed.code, ed.value_type, weo.value
         FROM workspace_entitlement_overrides weo
         JOIN entitlement_definitions ed ON weo.entitlement_id = ed.id
         WHERE weo.workspace_id = ?
           AND (weo.expires_at IS NULL OR weo.expires_at > ?)`,
      )
      .bind(workspaceId, now)
      .all<{ code: string; value_type: string; value: string }>();

    for (const o of overrides.results) {
      resolved[o.code] = parseValue(o.value, o.value_type);
    }

    return resolved;
  }
}
