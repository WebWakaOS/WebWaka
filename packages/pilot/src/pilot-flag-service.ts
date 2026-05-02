/**
 * @webwaka/pilot — PilotFlagService
 *
 * Per-tenant feature flag overrides for pilot operators.
 * Bridges with the control-plane FlagService for a unified resolution chain.
 *
 * Resolution order for isEnabled():
 *   1. pilot_feature_flags table (per-tenant explicit override — highest priority)
 *      • enabled = 1 and not expired → true
 *      • enabled = 0 (or expired)    → false  (explicit disable; no fall-through)
 *   2. Control-plane FlagService (platform configuration; resolves via DB + KV cache)
 *      • resolve(flagCode, { tenantId }) returns 'true' / true  → true
 *      • resolve(flagCode, { tenantId }) returns anything else  → false
 *   3. Hardcoded default = false (safest fallback)
 *
 * Write operations (grant / revoke) always target pilot_feature_flags directly.
 *
 * To grant a flag:   flagService.grant({ tenant_id, flag_name, reason, granted_by })
 * To check a flag:   flagService.isEnabled(tenant_id, 'ai_chat_beta')
 * To revoke a flag:  flagService.revoke(tenant_id, 'ai_chat_beta')
 */

import type { PilotFeatureFlag, EnrollPilotFlagInput } from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

/**
 * Minimal structural interface satisfied by control-plane FlagService.
 * No import from @webwaka/control-plane required — structural compatibility only.
 */
export interface FlagServiceLike {
  resolve(
    flagCode: string,
    ctx: { tenantId?: string; partnerId?: string; workspaceId?: string; planSlug?: string; environment?: string },
  ): Promise<boolean | string>;
}

export class PilotFlagService {
  constructor(
    private readonly db: D1Like,
    private readonly flagService?: FlagServiceLike,
  ) {}

  async grant(input: EnrollPilotFlagInput): Promise<void> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const enabled = input.enabled !== false ? 1 : 0;

    await this.db
      .prepare(
        `INSERT INTO pilot_feature_flags
           (id, tenant_id, flag_name, enabled, expires_at, reason, granted_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (tenant_id, flag_name) DO UPDATE
           SET enabled    = excluded.enabled,
               expires_at = excluded.expires_at,
               reason     = excluded.reason,
               granted_by = excluded.granted_by`,
      )
      .bind(
        id,
        input.tenant_id,
        input.flag_name,
        enabled,
        input.expires_at ?? null,
        input.reason ?? null,
        input.granted_by ?? null,
        now,
      )
      .run();
  }

  async revoke(tenantId: string, flagName: string): Promise<void> {
    await this.db
      .prepare(
        `UPDATE pilot_feature_flags
         SET enabled = 0
         WHERE tenant_id = ? AND flag_name = ?`,
      )
      .bind(tenantId, flagName)
      .run();
  }

  async isEnabled(tenantId: string, flagName: string): Promise<boolean> {
    const now = new Date().toISOString();

    // ── Step 1: per-tenant explicit override ──────────────────────────────
    // Query without the enabled filter so we can distinguish "no row" from
    // "row exists but explicitly disabled".
    const row = await this.db
      .prepare(
        `SELECT enabled, expires_at
         FROM pilot_feature_flags
         WHERE tenant_id = ? AND flag_name = ?`,
      )
      .bind(tenantId, flagName)
      .first<{ enabled: number; expires_at: string | null }>();

    if (row !== null) {
      // Row exists — respect it regardless of enabled value.
      // An expired grant is treated the same as enabled = 0.
      const notExpired = row.expires_at === null || row.expires_at > now;
      return row.enabled === 1 && notExpired;
    }

    // ── Step 2: control-plane FlagService (platform-wide configuration) ───
    if (this.flagService) {
      try {
        const val = await this.flagService.resolve(flagName, { tenantId });
        return val === true || val === 'true';
      } catch {
        // FlagService unavailable — fall through to default
      }
    }

    // ── Step 3: safe default ──────────────────────────────────────────────
    return false;
  }

  /**
   * Returns the raw pilot_feature_flags row for a tenant+flag, or null if
   * no row exists. Does not apply bridge resolution — use isEnabled() for
   * gate checks.
   */
  async getFlag(tenantId: string, flagName: string): Promise<PilotFeatureFlag | null> {
    return this.db
      .prepare(
        `SELECT * FROM pilot_feature_flags
         WHERE tenant_id = ? AND flag_name = ?`,
      )
      .bind(tenantId, flagName)
      .first<PilotFeatureFlag>();
  }

  async listForTenant(tenantId: string): Promise<PilotFeatureFlag[]> {
    const result = await this.db
      .prepare(
        `SELECT * FROM pilot_feature_flags
         WHERE tenant_id = ?
         ORDER BY flag_name ASC`,
      )
      .bind(tenantId)
      .all<PilotFeatureFlag>();
    return result.results;
  }

  async listByFlag(flagName: string): Promise<PilotFeatureFlag[]> {
    const now = new Date().toISOString();
    const result = await this.db
      .prepare(
        `SELECT * FROM pilot_feature_flags
         WHERE flag_name = ? AND enabled = 1
           AND (expires_at IS NULL OR expires_at > ?)
         ORDER BY created_at ASC`,
      )
      .bind(flagName, now)
      .all<PilotFeatureFlag>();
    return result.results;
  }

  async pruneExpired(): Promise<number> {
    const now = new Date().toISOString();
    const result = await this.db
      .prepare(
        `DELETE FROM pilot_feature_flags
         WHERE expires_at IS NOT NULL AND expires_at <= ?`,
      )
      .bind(now)
      .run();
    return result.meta?.changes ?? 0;
  }
}
