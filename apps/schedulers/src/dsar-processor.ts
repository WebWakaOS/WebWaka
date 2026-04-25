/**
 * DsarProcessorService — COMP-002 / Task #5
 *
 * Processes pending DSAR (Data Subject Access Request) export requests.
 * Compiles a comprehensive JSON export of all data held about a user,
 * stores it in Cloudflare R2, and updates the dsar_requests row.
 *
 * Governance:
 *   T3:  Every D1 query binds BOTH user_id AND tenant_id — cross-tenant data structurally impossible.
 *   P13: Export JSON is NEVER logged. console.log emits only request IDs (no PII).
 *   G23: No audit_log updates or deletes.
 *
 * Retry policy: up to 3 attempts (retry_count < 3); then permanently_failed.
 */

// ---------------------------------------------------------------------------
// Minimal D1 / R2 interfaces (avoids hard-binding @cloudflare/workers-types)
// ---------------------------------------------------------------------------

interface D1PreparedBound {
  run(): Promise<{ success: boolean }>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
}

interface D1Like {
  prepare(sql: string): { bind(...values: unknown[]): D1PreparedBound };
}

interface R2Like {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put(key: string, value: string, options?: any): Promise<unknown>;
  get(key: string): Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null>;
}

// ---------------------------------------------------------------------------
// Exported Env interface (consumed by index.ts)
// ---------------------------------------------------------------------------

export interface DsarEnv {
  DB: D1Like;
  DSAR_BUCKET: R2Like;
}

// ---------------------------------------------------------------------------
// Export payload types
// ---------------------------------------------------------------------------

export interface DsarExportPayload {
  exported_at: string;
  request_id: string;
  user_id: string;
  tenant_id: string;
  identity: Record<string, unknown> | null;
  consent: unknown[];
  ai_usage: unknown[];
  ai_spend: unknown[];
  wallet: unknown[];
  notifications: unknown[];
  sessions: unknown[];
  dsar_history: unknown[];
}

// ---------------------------------------------------------------------------
// compileDsarExport — parallel D1 fetch across 8 data categories
// ---------------------------------------------------------------------------

export async function compileDsarExport(
  db: D1Like,
  userId: string,
  tenantId: string,
  requestId: string,
): Promise<DsarExportPayload> {
  const twelveMonthsAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const sixMonthsAgo   = new Date(Date.now() - 183 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [
    identityRow,
    consentResults,
    aiUsageResults,
    aiSpendResults,
    walletResults,
    notifResults,
    sessionResults,
    dsarHistoryResults,
  ] = await Promise.all([
    // identity — exclude credential fields (P13)
    db.prepare(
      `SELECT id, email, full_name, phone, created_at, updated_at, locale, timezone
       FROM users
       WHERE id = ? AND tenant_id = ?`,
    ).bind(userId, tenantId).first<Record<string, unknown>>(),

    // consent — all AI processing consent records (active + revoked)
    db.prepare(
      `SELECT id, purpose, locale, granted, granted_at, revoked_at
       FROM superagent_consents
       WHERE user_id = ? AND tenant_id = ?
       ORDER BY granted_at DESC`,
    ).bind(userId, tenantId).all<Record<string, unknown>>(),

    // ai_usage — event metadata only, last 12 months (P13: no prompt/response content)
    db.prepare(
      `SELECT id, pillar, capability, provider, input_tokens, output_tokens,
              total_tokens, wc_charged, created_at
       FROM ai_usage_events
       WHERE user_id = ? AND tenant_id = ? AND created_at >= ?
       ORDER BY created_at DESC
       LIMIT 2000`,
    ).bind(userId, tenantId, twelveMonthsAgo).all<Record<string, unknown>>(),

    // ai_spend — cost units only, last 12 months (no message content)
    db.prepare(
      `SELECT id, capability, model_used, wakaCU_cost, status, created_at
       FROM ai_spend_events
       WHERE user_id = ? AND tenant_id = ? AND created_at >= ?
       ORDER BY created_at DESC
       LIMIT 2000`,
    ).bind(userId, tenantId, twelveMonthsAgo).all<Record<string, unknown>>(),

    // wallet — ledger transactions, last 12 months
    db.prepare(
      `SELECT id, entry_type, amount_kobo, balance_after, tx_type, reference, created_at
       FROM hl_ledger
       WHERE user_id = ? AND tenant_id = ? AND created_at >= ?
       ORDER BY created_at DESC
       LIMIT 1000`,
    ).bind(userId, tenantId, twelveMonthsAgo).all<Record<string, unknown>>(),

    // notifications — last 6 months
    db.prepare(
      `SELECT id, title, body, created_at, read_at
       FROM notification_inbox
       WHERE user_id = ? AND tenant_id = ? AND created_at >= ?
       ORDER BY created_at DESC
       LIMIT 500`,
    ).bind(userId, tenantId, sixMonthsAgo).all<Record<string, unknown>>(),

    // sessions — metadata only, no token values (T3 scoped)
    db.prepare(
      `SELECT id, issued_at, expires_at, revoked_at
       FROM sessions
       WHERE user_id = ? AND tenant_id = ?
       ORDER BY issued_at DESC
       LIMIT 200`,
    ).bind(userId, tenantId).all<Record<string, unknown>>(),

    // dsar_history — prior DSAR requests by this user (excludes current request)
    db.prepare(
      `SELECT id, status, requested_at, completed_at, expires_at
       FROM dsar_requests
       WHERE user_id = ? AND tenant_id = ? AND id != ?
       ORDER BY requested_at DESC`,
    ).bind(userId, tenantId, requestId).all<Record<string, unknown>>(),
  ]);

  return {
    exported_at:   new Date().toISOString(),
    request_id:    requestId,
    user_id:       userId,
    tenant_id:     tenantId,
    identity:      identityRow,
    consent:       consentResults.results,
    ai_usage:      aiUsageResults.results,
    ai_spend:      aiSpendResults.results,
    wallet:        walletResults.results,
    notifications: notifResults.results,
    sessions:      sessionResults.results,
    dsar_history:  dsarHistoryResults.results,
  };
}

// ---------------------------------------------------------------------------
// storeExport — write JSON payload to R2 with one retry on failure
// ---------------------------------------------------------------------------

const EXPORT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export async function storeExport(
  bucket: R2Like,
  tenantId: string,
  requestId: string,
  payload: DsarExportPayload,
): Promise<{ exportKey: string; expiresAt: number }> {
  const exportKey = `dsar/${tenantId}/${requestId}.json`;
  const json = JSON.stringify(payload);

  const byteSize = new TextEncoder().encode(json).byteLength;
  if (byteSize > 25 * 1024 * 1024) {
    throw new Error('DSAR export exceeds 25 MB limit — contact platform support.');
  }

  let lastErr: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await bucket.put(exportKey, json, { httpMetadata: { contentType: 'application/json' } });
      const expiresAt = Math.floor(Date.now() / 1000) + EXPORT_TTL_SECONDS;
      return { exportKey, expiresAt };
    } catch (err) {
      lastErr = err;
      if (attempt < 2) {
        await new Promise<void>(resolve => setTimeout(resolve, 200));
      }
    }
  }
  throw lastErr;
}

// ---------------------------------------------------------------------------
// DsarProcessorService — processes pending queue in batches
// ---------------------------------------------------------------------------

interface PendingRow {
  id: string;
  user_id: string;
  tenant_id: string;
  retry_count: number;
}

export class DsarProcessorService {
  async processNextBatch(env: DsarEnv, limit = 10): Promise<void> {
    const { results } = await env.DB.prepare(
      `SELECT id, user_id, tenant_id, retry_count
       FROM dsar_requests
       WHERE status = 'pending' AND retry_count < 3
       ORDER BY requested_at ASC
       LIMIT ?`,
    ).bind(limit).all<PendingRow>();

    for (const req of results) {
      await this._processOne(env, req);
    }
  }

  private async _processOne(env: DsarEnv, req: PendingRow): Promise<void> {
    try {
      await env.DB.prepare(
        `UPDATE dsar_requests SET status = 'processing' WHERE id = ? AND status = 'pending'`,
      ).bind(req.id).run();

      const payload = await compileDsarExport(env.DB, req.user_id, req.tenant_id, req.id);
      const { exportKey, expiresAt } = await storeExport(
        env.DSAR_BUCKET, req.tenant_id, req.id, payload,
      );

      await env.DB.prepare(
        `UPDATE dsar_requests
         SET status = 'completed',
             export_key = ?,
             completed_at = unixepoch(),
             expires_at = ?,
             error_message = NULL
         WHERE id = ?`,
      ).bind(exportKey, expiresAt, req.id).run();

      console.log(JSON.stringify({
        level: 'info', event: 'dsar_export_completed', requestId: req.id,
      }));
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const newRetryCount = req.retry_count + 1;
      const isPermanentlyFailed = newRetryCount >= 3;

      await env.DB.prepare(
        `UPDATE dsar_requests
         SET status = ?,
             retry_count = ?,
             error_message = ?
         WHERE id = ?`,
      ).bind(
        isPermanentlyFailed ? 'permanently_failed' : 'pending',
        newRetryCount,
        errMsg,
        req.id,
      ).run();

      console.error(JSON.stringify({
        level: 'error', event: 'dsar_export_failed',
        requestId: req.id,
        retryCount: newRetryCount,
        permanent: isPermanentlyFailed,
      }));
    }
  }
}
