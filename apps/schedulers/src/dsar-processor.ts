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
 * Retry policy:
 *   Failure sets status = 'failed' and increments retry_count.
 *   After 3 failures (retry_count >= 3) the request is marked 'permanently_failed'.
 *   processNextBatch() selects status IN ('pending', 'failed') AND retry_count < 3.
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
  /** options typed as unknown to remain compatible with R2Bucket (bivariant methods) */
  put(key: string, value: string, options?: unknown): Promise<unknown>;
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
  consent_history: unknown[];
  audit_log: unknown[];
  ai_usage: unknown[];
  ai_spend: unknown[];
  wallet: unknown[];
  notifications: unknown[];
  sessions: unknown[];
  dsar_history: unknown[];
}

// ---------------------------------------------------------------------------
// compileDsarExport — parallel D1 fetch across 10 data categories
//
// Column notes (schema-verified):
//   users                 — email, phone, full_name, kyc_status, kyc_tier, role,
//                           workspace_id, created_at, updated_at, email_verified_at
//                           (NOT locale/timezone — not in schema)
//   superagent_consents   — purpose, locale, granted, granted_at, revoked_at
//   consent_history       — consent_version, consent_text_hash, consented_at,
//                           ip_address, user_agent (migration 0385; INTEGER consented_at)
//   audit_logs            — action, method, path, resource_type, resource_id,
//                           ip_masked, status_code, created_at (TEXT ISO 8601)
//   ai_usage_events       — pillar, capability, provider, token counts (TEXT created_at)
//   ai_spend_events       — capability, model_used, wakaCU_cost, status (TEXT created_at)
//   hl_ledger             — entry_type, amount_kobo, balance_after, tx_type (TEXT created_at)
//   notification_inbox_item — title, body, is_read, read_at (INTEGER created_at)
//   sessions              — issued_at, expires_at, revoked_at (INTEGER timestamps, no tokens)
//   dsar_requests         — id, status, requested_at, completed_at, expires_at
// ---------------------------------------------------------------------------

export async function compileDsarExport(
  db: D1Like,
  userId: string,
  tenantId: string,
  requestId: string,
): Promise<DsarExportPayload> {
  const nowSec            = Math.floor(Date.now() / 1000);
  const twelveMonthsAgo   = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10);                            // TEXT date for ISO-timestamped tables
  const sixMonthsAgoSec   = nowSec - 183 * 24 * 60 * 60;  // unix sec for INTEGER-timestamped tables
  const twelveMonthsAgoSec = nowSec - 365 * 24 * 60 * 60; // unix sec for consent_history

  const [
    identityRow,
    consentResults,
    consentHistoryResults,
    auditLogResults,
    aiUsageResults,
    aiSpendResults,
    walletResults,
    notifResults,
    sessionResults,
    dsarHistoryResults,
  ] = await Promise.all([

    // ── identity ─────────────────────────────────────────────────────────────
    // Exclude: password_hash, password_hash_version, totp_secret (credentials/MFA)
    // Columns available in schema (verified against 0013 + ALTER migrations):
    //   id, email, phone, full_name, kyc_status, kyc_tier, workspace_id, tenant_id,
    //   role, email_verified_at, consent_version, consented_at, created_at, updated_at
    db.prepare(
      `SELECT id, email, phone, full_name, kyc_status, kyc_tier,
              workspace_id, tenant_id, role,
              email_verified_at, consent_version, consented_at,
              created_at, updated_at
       FROM users
       WHERE id = ? AND tenant_id = ?`,
    ).bind(userId, tenantId).first<Record<string, unknown>>(),

    // ── consent ──────────────────────────────────────────────────────────────
    // All AI processing consent records (active + revoked) for audit trail
    db.prepare(
      `SELECT id, purpose, locale, granted, granted_at, revoked_at
       FROM superagent_consents
       WHERE user_id = ? AND tenant_id = ?
       ORDER BY granted_at DESC`,
    ).bind(userId, tenantId).all<Record<string, unknown>>(),

    // ── consent_history ───────────────────────────────────────────────────────
    // Platform-level consent acceptance history (migration 0385).
    // consent_history.consented_at is INTEGER (unixepoch) — last 12 months.
    // ip_address included per NDPR right of access (user's own data).
    db.prepare(
      `SELECT id, consent_version, consent_text_hash, consented_at, ip_address, user_agent
       FROM consent_history
       WHERE user_id = ? AND tenant_id = ? AND consented_at >= ?
       ORDER BY consented_at DESC
       LIMIT 200`,
    ).bind(userId, tenantId, twelveMonthsAgoSec).all<Record<string, unknown>>(),

    // ── audit_log ────────────────────────────────────────────────────────────
    // User-attributed audit events from audit_logs (migration 0193, G23 read-only).
    // ip_masked is already PII-safe (IP anonymised at write time).
    // audit_logs.created_at is TEXT (ISO 8601) — last 12 months.
    db.prepare(
      `SELECT id, action, method, path, resource_type, resource_id,
              ip_masked, status_code, created_at
       FROM audit_logs
       WHERE user_id = ? AND tenant_id = ? AND created_at >= ?
       ORDER BY created_at DESC
       LIMIT 2000`,
    ).bind(userId, tenantId, twelveMonthsAgo).all<Record<string, unknown>>(),

    // ── ai_usage ─────────────────────────────────────────────────────────────
    // Event metadata only — last 12 months (P13: no prompt/response content stored)
    // ai_usage_events.created_at is TEXT (ISO 8601)
    db.prepare(
      `SELECT id, pillar, capability, provider,
              input_tokens, output_tokens, total_tokens, wc_charged,
              created_at
       FROM ai_usage_events
       WHERE user_id = ? AND tenant_id = ? AND created_at >= ?
       ORDER BY created_at DESC
       LIMIT 2000`,
    ).bind(userId, tenantId, twelveMonthsAgo).all<Record<string, unknown>>(),

    // ── ai_spend ─────────────────────────────────────────────────────────────
    // Cost units only — last 12 months (no message content)
    // ai_spend_events.created_at is TEXT (ISO 8601)
    db.prepare(
      `SELECT id, capability, model_used, wakaCU_cost, status, created_at
       FROM ai_spend_events
       WHERE user_id = ? AND tenant_id = ? AND created_at >= ?
       ORDER BY created_at DESC
       LIMIT 2000`,
    ).bind(userId, tenantId, twelveMonthsAgo).all<Record<string, unknown>>(),

    // ── wallet ───────────────────────────────────────────────────────────────
    // Ledger transactions — last 12 months
    // hl_ledger.created_at is TEXT (ISO 8601)
    db.prepare(
      `SELECT id, entry_type, amount_kobo, balance_after, tx_type, reference, created_at
       FROM hl_ledger
       WHERE user_id = ? AND tenant_id = ? AND created_at >= ?
       ORDER BY created_at DESC
       LIMIT 1000`,
    ).bind(userId, tenantId, twelveMonthsAgo).all<Record<string, unknown>>(),

    // ── notifications ─────────────────────────────────────────────────────────
    // In-app notification inbox — last 6 months
    // notification_inbox_item.created_at is INTEGER (unixepoch), filter with unix timestamp
    db.prepare(
      `SELECT id, title, body, is_read, read_at, created_at
       FROM notification_inbox_item
       WHERE user_id = ? AND tenant_id = ? AND created_at >= ?
       ORDER BY created_at DESC
       LIMIT 500`,
    ).bind(userId, tenantId, sixMonthsAgoSec).all<Record<string, unknown>>(),

    // ── sessions ─────────────────────────────────────────────────────────────
    // Auth session metadata only — no token values (they are never stored here)
    db.prepare(
      `SELECT id, issued_at, expires_at, revoked_at
       FROM sessions
       WHERE user_id = ? AND tenant_id = ?
       ORDER BY issued_at DESC
       LIMIT 200`,
    ).bind(userId, tenantId).all<Record<string, unknown>>(),

    // ── dsar_history ──────────────────────────────────────────────────────────
    // Prior DSAR requests by this user — excludes the current request
    db.prepare(
      `SELECT id, status, requested_at, completed_at, expires_at
       FROM dsar_requests
       WHERE user_id = ? AND tenant_id = ? AND id != ?
       ORDER BY requested_at DESC`,
    ).bind(userId, tenantId, requestId).all<Record<string, unknown>>(),
  ]);

  return {
    exported_at:      new Date().toISOString(),
    request_id:       requestId,
    user_id:          userId,
    tenant_id:        tenantId,
    identity:         identityRow,
    consent:          consentResults.results,
    consent_history:  consentHistoryResults.results,
    audit_log:        auditLogResults.results,
    ai_usage:         aiUsageResults.results,
    ai_spend:         aiSpendResults.results,
    wallet:           walletResults.results,
    notifications:    notifResults.results,
    sessions:         sessionResults.results,
    dsar_history:     dsarHistoryResults.results,
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
// DsarProcessorService — processes pending and failed queue in batches
// ---------------------------------------------------------------------------

interface PendingRow {
  id: string;
  user_id: string;
  tenant_id: string;
  retry_count: number;
}

export class DsarProcessorService {
  private readonly _env?: DsarEnv;

  /** env can be injected at construction time OR passed per-call (legacy) */
  constructor(env?: DsarEnv) {
    this._env = env;
  }

  async processNextBatch(envOrLimit?: DsarEnv | number, limit = 10): Promise<void> {
    // Resolve env: per-call arg takes priority, then constructor-injected
    const env: DsarEnv = (typeof envOrLimit === 'object' ? envOrLimit : this._env)!;
    const resolvedLimit = typeof envOrLimit === 'number' ? envOrLimit : limit;
    const { results } = await env.DB.prepare(
      `SELECT id, user_id, tenant_id, retry_count
       FROM dsar_requests
       WHERE status IN ('pending', 'failed') AND retry_count < 3
       ORDER BY requested_at ASC
       LIMIT ?`,
    ).bind(resolvedLimit).all<PendingRow>();

    for (const req of results) {
      await this._processOne(env, req);
    }
  }

  private async _processOne(env: DsarEnv, req: PendingRow): Promise<void> {
    try {
      await env.DB.prepare(
        `UPDATE dsar_requests SET status = 'processing' WHERE id = ? AND status IN ('pending', 'failed')`,
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
        isPermanentlyFailed ? 'permanently_failed' : 'failed',
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
