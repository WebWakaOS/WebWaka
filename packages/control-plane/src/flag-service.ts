/**
 * @webwaka/control-plane — FlagService
 *
 * Platform-wide runtime configuration flags with KV caching.
 *
 * Resolution order (highest wins):
 *   1. workspace-scope override
 *   2. tenant-scope override
 *   3. partner-scope override
 *   4. plan-scope override
 *   5. environment-scope override
 *   6. flag default_value
 *
 * KV cache key scheme (all writes are non-fatal — DB is always the source of truth):
 *   cp:flag:def:v1:{idOrCode}          — flag definition JSON        TTL 120s
 *   cp:flag:res:v1:{flagCode}:{ctxKey} — resolved value string        TTL 60s
 *   cp:flag:ks:v1                      — kill-switch active boolean   TTL 5s
 *
 * Kill-switch flags are never stored in the resolved-value cache so activation
 * propagates within KILL_SWITCH_TTL seconds (5s) rather than waiting for the
 * resolved-value TTL to expire.
 */

import type { D1Like, KVLike, ActorContext, ConfigurationFlag, FlagResolutionContext, PaginatedResult } from './types.js';
import type { AuditService } from './audit-service.js';

const FLAG_DEF_TTL = 120;
const FLAG_RES_TTL = 60;
const KILL_SWITCH_TTL = 5;

export class FlagService {
  constructor(
    private readonly db: D1Like,
    private readonly audit: AuditService,
    private readonly kv?: KVLike,
    private readonly cacheTtlSeconds: number = FLAG_RES_TTL,
  ) {}

  // ─── Cache helpers ────────────────────────────────────────────────────────

  private _defKey(idOrCode: string): string {
    return `cp:flag:def:v1:${idOrCode}`;
  }

  private _resKey(flagCode: string, ctx: FlagResolutionContext): string {
    const ctxKey = [
      ctx.workspaceId ?? '_',
      ctx.tenantId ?? '_',
      ctx.partnerId ?? '_',
      ctx.planSlug ?? '_',
      ctx.environment ?? '_',
    ].join(':');
    return `cp:flag:res:v1:${flagCode}:${ctxKey}`;
  }

  private async _bust(keys: string[]): Promise<void> {
    if (!this.kv) return;
    try {
      await Promise.all(keys.map((k) => this.kv!.delete(k)));
    } catch {
      // KV unavailable — non-fatal, values will expire via TTL
    }
  }

  private async _kvGet(key: string): Promise<string | null> {
    if (!this.kv) return null;
    try {
      return await this.kv.get(key);
    } catch {
      return null;
    }
  }

  private async _kvPut(key: string, value: string, ttl: number): Promise<void> {
    if (!this.kv) return;
    try {
      await this.kv.put(key, value, { expirationTtl: ttl });
    } catch {
      // KV write failure is non-fatal
    }
  }

  // ─── Flag CRUD ────────────────────────────────────────────────────────────

  async listFlags(opts: {
    category?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResult<ConfigurationFlag>> {
    const conditions: string[] = [];
    const bindings: unknown[] = [];

    if (opts.category) { conditions.push('category = ?'); bindings.push(opts.category); }
    if (opts.isActive !== undefined) { conditions.push('is_active = ?'); bindings.push(opts.isActive ? 1 : 0); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(opts.limit ?? 100, 200);
    const offset = opts.offset ?? 0;

    const [rows, countRow] = await Promise.all([
      this.db
        .prepare(`SELECT * FROM configuration_flags ${where} ORDER BY category, code LIMIT ? OFFSET ?`)
        .bind(...bindings, limit, offset)
        .all<ConfigurationFlag>(),
      this.db
        .prepare(`SELECT COUNT(*) as total FROM configuration_flags ${where}`)
        .bind(...bindings)
        .first<{ total: number }>(),
    ]);
    return { results: rows.results, ...(countRow?.total !== undefined ? { total: countRow.total } : {}), limit, offset };
  }

  async getFlag(idOrCode: string): Promise<ConfigurationFlag | null> {
    const cacheKey = this._defKey(idOrCode);
    const cached = await this._kvGet(cacheKey);
    if (cached !== null) {
      return JSON.parse(cached) as ConfigurationFlag | null;
    }

    const flag = await this.db
      .prepare('SELECT * FROM configuration_flags WHERE id = ? OR code = ? LIMIT 1')
      .bind(idOrCode, idOrCode)
      .first<ConfigurationFlag>();

    await this._kvPut(cacheKey, JSON.stringify(flag), FLAG_DEF_TTL);
    return flag;
  }

  async createFlag(input: Partial<ConfigurationFlag>, actor: ActorContext): Promise<ConfigurationFlag> {
    const id = `flag_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const now = Math.floor(Date.now() / 1000);

    await this.db
      .prepare(
        `INSERT INTO configuration_flags
           (id, code, name, description, category, value_type, default_value, min_scope,
            inheritable, is_kill_switch, rollout_pct, is_active, notes, created_by, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,1,?,?,?,?)`,
      )
      .bind(
        id, input.code, input.name, input.description ?? null,
        input.category ?? 'feature', input.value_type ?? 'boolean',
        input.default_value ?? 'false', input.min_scope ?? 'platform',
        input.inheritable !== undefined ? (input.inheritable ? 1 : 0) : 1,
        input.is_kill_switch !== undefined ? (input.is_kill_switch ? 1 : 0) : 0,
        input.rollout_pct ?? 100,
        input.notes ?? null, actor.actorId, now, now,
      )
      .run();

    const flag = await this.db
      .prepare('SELECT * FROM configuration_flags WHERE id = ? LIMIT 1')
      .bind(id)
      .first<ConfigurationFlag>();
    if (!flag) throw new Error('Failed to create flag');

    await Promise.all([
      this._kvPut(this._defKey(flag.id), JSON.stringify(flag), FLAG_DEF_TTL),
      this._kvPut(this._defKey(flag.code), JSON.stringify(flag), FLAG_DEF_TTL),
    ]);

    await this.audit.log(actor, {
      action: 'flag.create',
      resourceType: 'configuration_flag',
      resourceId: id,
      afterJson: flag,
    });
    return flag;
  }

  async updateFlag(
    id: string,
    input: Partial<ConfigurationFlag>,
    actor: ActorContext,
  ): Promise<ConfigurationFlag> {
    const existing = await this.getFlag(id);
    if (!existing) throw new Error(`Flag not found: ${id}`);

    const now = Math.floor(Date.now() / 1000);
    const sets: string[] = ['updated_at = ?'];
    const bindings: unknown[] = [now];

    if (input.name !== undefined)          { sets.push('name = ?');          bindings.push(input.name); }
    if (input.description !== undefined)   { sets.push('description = ?');   bindings.push(input.description); }
    if (input.default_value !== undefined) { sets.push('default_value = ?'); bindings.push(input.default_value); }
    if (input.is_active !== undefined)     { sets.push('is_active = ?');     bindings.push(input.is_active ? 1 : 0); }
    if (input.rollout_pct !== undefined)   { sets.push('rollout_pct = ?');   bindings.push(input.rollout_pct); }
    if (input.notes !== undefined)         { sets.push('notes = ?');         bindings.push(input.notes); }

    bindings.push(id);
    await this.db
      .prepare(`UPDATE configuration_flags SET ${sets.join(', ')} WHERE id = ?`)
      .bind(...bindings)
      .run();

    const updated = await this.db
      .prepare('SELECT * FROM configuration_flags WHERE id = ? LIMIT 1')
      .bind(id)
      .first<ConfigurationFlag>();

    // Bust stale entries; re-warm with fresh data
    await this._bust([this._defKey(existing.id), this._defKey(existing.code), 'cp:flag:ks:v1']);
    if (updated) {
      await Promise.all([
        this._kvPut(this._defKey(updated.id), JSON.stringify(updated), FLAG_DEF_TTL),
        this._kvPut(this._defKey(updated.code), JSON.stringify(updated), FLAG_DEF_TTL),
      ]);
    }

    await this.audit.log(actor, {
      action: 'flag.update',
      resourceType: 'configuration_flag',
      resourceId: id,
      beforeJson: existing,
      afterJson: updated,
    });
    return updated!;
  }

  // ─── Overrides ────────────────────────────────────────────────────────────

  async setOverride(
    flagIdOrCode: string,
    scope: string,
    scopeId: string,
    value: string,
    actor: ActorContext,
    opts: { reason?: string; expiresAt?: number } = {},
  ): Promise<void> {
    const flag = await this.getFlag(flagIdOrCode);
    if (!flag) throw new Error(`Flag not found: ${flagIdOrCode}`);

    const id = `cfo_${crypto.randomUUID()}`;
    const now = Math.floor(Date.now() / 1000);

    await this.db
      .prepare(
        `INSERT INTO configuration_overrides
           (id, flag_id, scope, scope_id, value, reason, set_by, expires_at, is_active, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,1,?,?)
         ON CONFLICT (flag_id, scope, scope_id)
         DO UPDATE SET value=excluded.value, reason=excluded.reason, set_by=excluded.set_by,
                       expires_at=excluded.expires_at, updated_at=excluded.updated_at`,
      )
      .bind(
        id, flag.id, scope, scopeId, value,
        opts.reason ?? null, actor.actorId, opts.expiresAt ?? null, now, now,
      )
      .run();

    // Bust definition cache (scope overrides affect resolution) + kill-switch check
    await this._bust([this._defKey(flag.id), this._defKey(flag.code), 'cp:flag:ks:v1']);

    await this.audit.log(actor, {
      action: 'flag.override.set',
      resourceType: 'configuration_override',
      resourceId: flag.id,
      afterJson: { flagCode: flag.code, scope, scopeId, value },
    });
  }

  async removeOverride(
    flagIdOrCode: string,
    scope: string,
    scopeId: string,
    actor: ActorContext,
  ): Promise<void> {
    const flag = await this.getFlag(flagIdOrCode);
    if (!flag) throw new Error(`Flag not found: ${flagIdOrCode}`);

    await this.db
      .prepare(
        'UPDATE configuration_overrides SET is_active = 0 WHERE flag_id = ? AND scope = ? AND scope_id = ?',
      )
      .bind(flag.id, scope, scopeId)
      .run();

    await this._bust([this._defKey(flag.id), this._defKey(flag.code), 'cp:flag:ks:v1']);

    await this.audit.log(actor, {
      action: 'flag.override.remove',
      resourceType: 'configuration_flag',
      resourceId: flag.id,
      afterJson: { scope, scopeId },
    });
  }

  // ─── Resolution ───────────────────────────────────────────────────────────

  private async _isKillSwitchActive(): Promise<boolean> {
    const cached = await this._kvGet('cp:flag:ks:v1');
    if (cached !== null) return cached === 'true';

    const row = await this.db
      .prepare(
        'SELECT default_value FROM configuration_flags WHERE is_kill_switch = 1 AND is_active = 1 AND default_value = ? LIMIT 1',
      )
      .bind('true')
      .first<{ default_value: string }>();

    const active = !!row;
    await this._kvPut('cp:flag:ks:v1', active ? 'true' : 'false', KILL_SWITCH_TTL);
    return active;
  }

  private async _resolveCore(
    flag: ConfigurationFlag,
    ctx: FlagResolutionContext,
  ): Promise<boolean | string> {
    if (!flag.is_kill_switch && (await this._isKillSwitchActive())) return false;

    const now = Math.floor(Date.now() / 1000);
    const scopeChecks: Array<[string, string | undefined]> = [
      ['workspace', ctx.workspaceId],
      ['tenant',    ctx.tenantId],
      ['partner',   ctx.partnerId],
      ['plan',      ctx.planSlug],
      ['environment', ctx.environment],
    ];

    for (const [scope, scopeId] of scopeChecks) {
      if (!scopeId) continue;
      const override = await this.db
        .prepare(
          `SELECT value FROM configuration_overrides
           WHERE flag_id = ? AND scope = ? AND scope_id = ? AND is_active = 1
             AND (expires_at IS NULL OR expires_at > ?)
           LIMIT 1`,
        )
        .bind(flag.id, scope, scopeId, now)
        .first<{ value: string }>();

      if (override) {
        return flag.value_type === 'boolean' ? override.value === 'true' : override.value;
      }
    }

    if (flag.rollout_pct < 100 && ctx.tenantId) {
      const hash = Array.from(ctx.tenantId).reduce((acc, c) => acc + c.charCodeAt(0), 0) % 100;
      if (hash >= flag.rollout_pct) {
        return flag.value_type === 'boolean' ? false : flag.default_value;
      }
    }

    return flag.value_type === 'boolean'
      ? flag.default_value === 'true'
      : flag.default_value;
  }

  async resolve(flagCode: string, ctx: FlagResolutionContext): Promise<boolean | string> {
    const flag = await this.getFlag(flagCode);
    if (!flag || !flag.is_active) return false;

    // Kill-switch flags bypass the resolved-value cache so activation propagates
    // within KILL_SWITCH_TTL seconds rather than waiting for FLAG_RES_TTL.
    if (flag.is_kill_switch || !this.kv) {
      return this._resolveCore(flag, ctx);
    }

    const cacheKey = this._resKey(flagCode, ctx);
    const cached = await this._kvGet(cacheKey);
    if (cached !== null) {
      return flag.value_type === 'boolean' ? cached === 'true' : cached;
    }

    const result = await this._resolveCore(flag, ctx);
    await this._kvPut(cacheKey, String(result), this.cacheTtlSeconds);
    return result;
  }

  async resolveAll(ctx: FlagResolutionContext): Promise<Record<string, boolean | string>> {
    const flags = await this.db
      .prepare('SELECT * FROM configuration_flags WHERE is_active = 1 ORDER BY code ASC')
      .bind()
      .all<ConfigurationFlag>();

    const results: Record<string, boolean | string> = {};
    for (const flag of flags.results) {
      results[flag.code] = await this.resolve(flag.code, ctx);
    }
    return results;
  }
}
