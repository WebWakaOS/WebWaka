/**
 * HITL (Human-In-The-Loop) Service — SA-4.5 / M12
 * WebWaka OS — Queue management for AI actions requiring human review.
 *
 * D1 tables: ai_hitl_queue, ai_hitl_events (migration 0194).
 *
 * HITL levels:
 *   1 — Standard review (workspace admin can approve)
 *   2 — Elevated review (requires designated reviewer role)
 *   3 — Regulatory review (72h mandatory window, L5 sensitive autonomous)
 *
 * Sensitive verticals (politician, clinic/hospital, legal) require HITL
 * for any write-capable AI action (L2+).
 *
 * Platform Invariants:
 *   T3 — All queries tenant-scoped
 *   P10 — Consent ref tracked on approval
 *   P13 — No raw PII stored in payloads
 */

interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
  batch(stmts: unknown[]): Promise<Array<{ success: boolean }>>;
}

export interface HitlSubmission {
  tenantId: string;
  workspaceId: string;
  userId: string;
  vertical: string;
  capability: string;
  hitlLevel: 1 | 2 | 3;
  aiRequestPayload: string;
  aiResponsePayload?: string;
  expiresInHours?: number;
}

export interface HitlReview {
  queueItemId: string;
  tenantId: string;
  reviewerId: string;
  decision: 'approved' | 'rejected';
  note?: string;
}

export interface HitlQueueItem {
  id: string;
  tenantId: string;
  workspaceId: string;
  userId: string;
  vertical: string;
  capability: string;
  hitlLevel: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'executed';
  aiRequestPayload: string;
  aiResponsePayload: string | null;
  reviewerId: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface HitlServiceDeps {
  db: D1Like;
}

const DEFAULT_EXPIRY_HOURS = 24;
const L5_MINIMUM_REVIEW_HOURS = 72;

export class HitlService {
  private readonly db: D1Like;

  constructor(deps: HitlServiceDeps) {
    this.db = deps.db;
  }

  async submit(input: HitlSubmission): Promise<{ queueItemId: string }> {
    const id = crypto.randomUUID();

    let expiryHours = input.expiresInHours ?? DEFAULT_EXPIRY_HOURS;
    if (input.hitlLevel === 3) {
      expiryHours = Math.max(expiryHours, L5_MINIMUM_REVIEW_HOURS);
    }

    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

    // BUG-022: INSERT OR IGNORE ensures idempotent submission — duplicate IDs are silently
    // dropped rather than raising a UNIQUE constraint violation.
    await this.db.batch([
      this.db
        .prepare(
          `INSERT OR IGNORE INTO ai_hitl_queue
             (id, tenant_id, workspace_id, user_id, vertical, capability,
              hitl_level, status, ai_request_payload, ai_response_payload, expires_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
        )
        .bind(
          id,
          input.tenantId,
          input.workspaceId,
          input.userId,
          input.vertical,
          input.capability,
          input.hitlLevel,
          input.aiRequestPayload,
          input.aiResponsePayload ?? null,
          expiresAt,
        ),
      this.db
        .prepare(
          // BUG-022: ai_hitl_events is append-only; INSERT OR IGNORE prevents duplicate events.
          `INSERT OR IGNORE INTO ai_hitl_events
             (id, tenant_id, queue_item_id, event_type, actor_id, note)
           VALUES (?, ?, ?, 'created', ?, 'Submitted for HITL review')`,
        )
        .bind(crypto.randomUUID(), input.tenantId, id, input.userId),
    ]);

    return { queueItemId: id };
  }

  async review(input: HitlReview): Promise<{ success: boolean; error?: string }> {
    const item = await this.db
      .prepare(
        `SELECT id, status, hitl_level, expires_at, tenant_id, created_at
         FROM ai_hitl_queue
         WHERE id = ? AND tenant_id = ?`,
      )
      .bind(input.queueItemId, input.tenantId)
      .first<{
        id: string;
        status: string;
        hitl_level: number;
        expires_at: string;
        tenant_id: string;
        created_at: string;
      }>();

    if (!item) {
      return { success: false, error: 'HITL item not found' };
    }

    if (item.status !== 'pending') {
      return { success: false, error: `Item already ${item.status}` };
    }

    if (new Date(item.expires_at) < new Date()) {
      await this.markExpired(item.id, input.tenantId);
      return { success: false, error: 'Item has expired' };
    }

    if (item.hitl_level === 3) {
      const ageMs = Date.now() - new Date(item.created_at).getTime();
      const ageHours = ageMs / (1000 * 60 * 60);
      if (ageHours < L5_MINIMUM_REVIEW_HOURS) {
        return {
          success: false,
          error: `L5 regulatory items require ${L5_MINIMUM_REVIEW_HOURS}h review window. ${Math.ceil(L5_MINIMUM_REVIEW_HOURS - ageHours)}h remaining.`,
        };
      }
    }

    await this.db.batch([
      this.db
        .prepare(
          `UPDATE ai_hitl_queue
           SET status = ?, reviewer_id = ?, reviewed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), review_note = ?
           WHERE id = ? AND tenant_id = ? AND status = 'pending'`,
        )
        .bind(input.decision, input.reviewerId, input.note ?? null, input.queueItemId, input.tenantId),
      this.db
        .prepare(
          `INSERT INTO ai_hitl_events
             (id, tenant_id, queue_item_id, event_type, actor_id, note)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          input.tenantId,
          input.queueItemId,
          input.decision,
          input.reviewerId,
          input.note ?? null,
        ),
    ]);

    return { success: true };
  }

  async listQueue(
    tenantId: string,
    opts: { status?: string; vertical?: string; limit?: number } = {},
  ): Promise<HitlQueueItem[]> {
    const { status, vertical, limit = 50 } = opts;

    let sql = `SELECT id, tenant_id, workspace_id, user_id, vertical, capability,
                      hitl_level, status, ai_request_payload, ai_response_payload,
                      reviewer_id, reviewed_at, review_note, expires_at, created_at
               FROM ai_hitl_queue
               WHERE tenant_id = ?`;
    const bindings: unknown[] = [tenantId];

    if (status) {
      sql += ' AND status = ?';
      bindings.push(status);
    }
    if (vertical) {
      sql += ' AND vertical = ?';
      bindings.push(vertical);
    }
    sql += ' ORDER BY created_at DESC LIMIT ?';
    bindings.push(Math.min(limit, 200));

    const { results } = await this.db
      .prepare(sql)
      .bind(...bindings)
      .all<{
        id: string; tenant_id: string; workspace_id: string; user_id: string;
        vertical: string; capability: string; hitl_level: number;
        status: string; ai_request_payload: string; ai_response_payload: string | null;
        reviewer_id: string | null; reviewed_at: string | null; review_note: string | null;
        expires_at: string; created_at: string;
      }>();

    return results.map((r) => ({
      id: r.id,
      tenantId: r.tenant_id,
      workspaceId: r.workspace_id,
      userId: r.user_id,
      vertical: r.vertical,
      capability: r.capability,
      hitlLevel: r.hitl_level,
      status: r.status as HitlQueueItem['status'],
      aiRequestPayload: r.ai_request_payload,
      aiResponsePayload: r.ai_response_payload,
      reviewerId: r.reviewer_id,
      reviewedAt: r.reviewed_at,
      reviewNote: r.review_note,
      expiresAt: r.expires_at,
      createdAt: r.created_at,
    }));
  }

  async getItem(id: string, tenantId: string): Promise<HitlQueueItem | null> {
    const r = await this.db
      .prepare(
        `SELECT id, tenant_id, workspace_id, user_id, vertical, capability,
                hitl_level, status, ai_request_payload, ai_response_payload,
                reviewer_id, reviewed_at, review_note, expires_at, created_at
         FROM ai_hitl_queue
         WHERE id = ? AND tenant_id = ?`,
      )
      .bind(id, tenantId)
      .first<{
        id: string; tenant_id: string; workspace_id: string; user_id: string;
        vertical: string; capability: string; hitl_level: number;
        status: string; ai_request_payload: string; ai_response_payload: string | null;
        reviewer_id: string | null; reviewed_at: string | null; review_note: string | null;
        expires_at: string; created_at: string;
      }>();

    if (!r) return null;

    return {
      id: r.id,
      tenantId: r.tenant_id,
      workspaceId: r.workspace_id,
      userId: r.user_id,
      vertical: r.vertical,
      capability: r.capability,
      hitlLevel: r.hitl_level,
      status: r.status as HitlQueueItem['status'],
      aiRequestPayload: r.ai_request_payload,
      aiResponsePayload: r.ai_response_payload,
      reviewerId: r.reviewer_id,
      reviewedAt: r.reviewed_at,
      reviewNote: r.review_note,
      expiresAt: r.expires_at,
      createdAt: r.created_at,
    };
  }

  async expireStale(tenantId: string): Promise<number> {
    const now = new Date().toISOString();

    const result = await this.db
      .prepare(
        `UPDATE ai_hitl_queue SET status = 'expired'
         WHERE status = 'pending' AND expires_at < ? AND tenant_id = ?`,
      )
      .bind(now, tenantId)
      .run();
    return result.meta?.changes ?? 0;
  }

  /**
   * Cross-tenant HITL expiry — for use by the projections CRON only.
   * Expires ALL stale pending items across every tenant in a single sweep.
   * For hitl_level = 3 (regulatory) items that expire, writes an escalation
   * row to hitl_escalations so tenant admins are notified.
   *
   * T3 note: This is intentionally cross-tenant — only the CRON system
   * (authenticated via INTER_SERVICE_SECRET) may call this path.
   *
   * @returns { expired: number; escalated: number }
   */
  static async expireAllStale(
    db: D1Like,
  ): Promise<{ expired: number; escalated: number }> {
    const now = new Date().toISOString();

    // Step 1: Find all pending stale items (cross-tenant)
    const stale = await db
      .prepare(
        `SELECT id, tenant_id, workspace_id, hitl_level
         FROM ai_hitl_queue
         WHERE status = 'pending' AND expires_at < ?`,
      )
      .bind(now)
      .all<{ id: string; tenant_id: string; workspace_id: string; hitl_level: number }>();

    if (!stale.results.length) return { expired: 0, escalated: 0 };

    // Step 2: Bulk-expire all stale items
    const expireResult = await db
      .prepare(
        `UPDATE ai_hitl_queue SET status = 'expired'
         WHERE status = 'pending' AND expires_at < ?`,
      )
      .bind(now)
      .run();

    const expired = expireResult.meta?.changes ?? 0;

    // Step 3: Write escalation rows for level-3 regulatory items
    const l3Items = stale.results.filter((r) => r.hitl_level === 3);
    let escalated = 0;

    for (const item of l3Items) {
      await db
        .prepare(
          `INSERT OR IGNORE INTO hitl_escalations
           (id, queue_item_id, tenant_id, workspace_id, escalation_type, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'expired_regulatory', ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          item.id,
          item.tenant_id,
          item.workspace_id ?? '',
          now,
          now,
        )
        .run();

      // Also write an event record on the HITL queue item
      await db
        .prepare(
          `INSERT INTO ai_hitl_events
           (id, tenant_id, queue_item_id, event_type, actor_id, note)
           VALUES (?, ?, ?, 'expired', 'system', 'L3 regulatory item auto-expired — escalation raised')`,
        )
        .bind(crypto.randomUUID(), item.tenant_id, item.id)
        .run();

      escalated++;
    }

    return { expired, escalated };
  }

  /**
   * markExecuted — F-020 fix.
   * Transitions an 'approved' HITL item to 'executed' after the client has
   * successfully re-run the AI action via POST /superagent/hitl/:id/resume.
   * Idempotent: if already 'executed', no rows are updated (no error raised).
   */
  async markExecuted(id: string, tenantId: string): Promise<void> {
    await this.db.batch([
      this.db
        .prepare(
          `UPDATE ai_hitl_queue SET status = 'executed'
           WHERE id = ? AND tenant_id = ? AND status = 'approved'`,
        )
        .bind(id, tenantId),
      this.db
        .prepare(
          `INSERT INTO ai_hitl_events
             (id, tenant_id, queue_item_id, event_type, actor_id, note)
           VALUES (?, ?, ?, 'executed', 'system', 'AI action re-executed after HITL approval')`,
        )
        .bind(crypto.randomUUID(), tenantId, id),
    ]);
  }

  async countPending(tenantId: string): Promise<number> {
    const row = await this.db
      .prepare(`SELECT COUNT(*) as cnt FROM ai_hitl_queue WHERE tenant_id = ? AND status = 'pending'`)
      .bind(tenantId)
      .first<{ cnt: number }>();
    return row?.cnt ?? 0;
  }

  private async markExpired(id: string, tenantId: string): Promise<void> {
    await this.db.batch([
      this.db
        .prepare(`UPDATE ai_hitl_queue SET status = 'expired' WHERE id = ? AND tenant_id = ?`)
        .bind(id, tenantId),
      this.db
        .prepare(
          `INSERT INTO ai_hitl_events (id, tenant_id, queue_item_id, event_type, actor_id, note)
           VALUES (?, ?, ?, 'expired', 'system', 'Auto-expired: review window elapsed')`,
        )
        .bind(crypto.randomUUID(), tenantId, id),
    ]);
  }
}
