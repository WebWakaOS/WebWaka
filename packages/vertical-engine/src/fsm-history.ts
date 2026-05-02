/**
 * FSM History Service — Wave 3 B2-3
 * Stores and retrieves the last N state transitions per profile.
 *
 * Writes to profile_state_history (migration 0108_profile_state_history.sql).
 * Used by the vertical engine route handler after every successful transition.
 *
 * Retention: 90 days. Cleanup cron in apps/schedulers clears old rows.
 */

export interface FSMHistoryEntry {
  id: string;
  profileId: string;
  slug: string;
  workspaceId: string;
  tenantId: string;
  fromState: string;
  toState: string;
  triggeredBy: string;
  guardName?: string;
  transitionedAt: number;  // unix epoch seconds
  metadata?: Record<string, unknown>;
}

export interface FSMHistoryWriteParams {
  profileId: string;
  slug: string;
  workspaceId: string;
  tenantId: string;
  fromState: string;
  toState: string;
  triggeredBy: string;
  guardName?: string;
  metadata?: Record<string, unknown>;
}

// D1-compatible minimal DB interface
interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      run(): Promise<unknown>;
      all<T = unknown>(): Promise<{ results: T[] }>;
    };
  };
}

export class FSMHistoryService {
  private readonly db: D1Like;
  private readonly maxEntriesPerProfile: number;

  constructor(db: D1Like, maxEntriesPerProfile = 50) {
    this.db = db;
    this.maxEntriesPerProfile = maxEntriesPerProfile;
  }

  /**
   * Record a new state transition.
   * After writing, prunes old entries to keep only maxEntriesPerProfile.
   */
  async record(params: FSMHistoryWriteParams): Promise<void> {
    const {
      profileId, slug, workspaceId, tenantId,
      fromState, toState, triggeredBy, guardName, metadata,
    } = params;

    const id = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

    await this.db
      .prepare(
        `INSERT INTO profile_state_history
          (id, profile_id, slug, workspace_id, tenant_id, from_state, to_state,
           triggered_by, guard_name, transitioned_at, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), ?)`,
      )
      .bind(
        id, profileId, slug, workspaceId, tenantId,
        fromState, toState, triggeredBy,
        guardName ?? null,
        metadata ? JSON.stringify(metadata) : null,
      )
      .run();

    // Prune old entries — keep only last N per profile
    await this.pruneOldEntries(profileId);
  }

  /**
   * Retrieve the last N transitions for a profile (newest first).
   */
  async getHistory(profileId: string, limit = 20): Promise<FSMHistoryEntry[]> {
    const rows = await this.db
      .prepare(
        `SELECT id, profile_id, slug, workspace_id, tenant_id,
                from_state, to_state, triggered_by, guard_name,
                transitioned_at, metadata
         FROM profile_state_history
         WHERE profile_id = ?
         ORDER BY transitioned_at DESC
         LIMIT ?`,
      )
      .bind(profileId, limit)
      .all<Record<string, unknown>>();

    return (rows.results ?? []).map((r) => ({
      id: r['id'] as string,
      profileId: r['profile_id'] as string,
      slug: r['slug'] as string,
      workspaceId: r['workspace_id'] as string,
      tenantId: r['tenant_id'] as string,
      fromState: r['from_state'] as string,
      toState: r['to_state'] as string,
      triggeredBy: r['triggered_by'] as string,
      guardName: r['guard_name'] as string | undefined,
      transitionedAt: r['transitioned_at'] as number,
      metadata: r['metadata'] ? JSON.parse(r['metadata'] as string) as Record<string, unknown> : undefined,
    }));
  }

  private async pruneOldEntries(profileId: string): Promise<void> {
    // Keep only the N most recent rows for this profile
    await this.db
      .prepare(
        `DELETE FROM profile_state_history
         WHERE profile_id = ?
           AND id NOT IN (
             SELECT id FROM profile_state_history
             WHERE profile_id = ?
             ORDER BY transitioned_at DESC
             LIMIT ?
           )`,
      )
      .bind(profileId, profileId, this.maxEntriesPerProfile)
      .run();
  }
}
