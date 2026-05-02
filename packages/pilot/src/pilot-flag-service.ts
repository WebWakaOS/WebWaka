/**
 * @webwaka/pilot — PilotFlagService
 *
 * Per-tenant feature flag overrides for pilot operators.
 * Complements the global KV wallet flags with DB-backed, per-tenant pilot gates.
 *
 * Resolution order:
 *   1. pilot_feature_flags table (per-tenant override, highest priority)
 *   2. Global KV flags (platform-wide default)
 *   3. Hardcoded default = false (safest fallback)
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

export class PilotFlagService {
  constructor(private readonly db: D1Like) {}

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
    const row = await this.db
      .prepare(
        `SELECT enabled, expires_at
         FROM pilot_feature_flags
         WHERE tenant_id = ? AND flag_name = ?
           AND (expires_at IS NULL OR expires_at > ?)`,
      )
      .bind(tenantId, flagName, now)
      .first<{ enabled: number; expires_at: string | null }>();

    return row?.enabled === 1;
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
