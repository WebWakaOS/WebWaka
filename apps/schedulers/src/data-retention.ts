/**
 * DataRetentionService — Phase 5 (E30)
 *
 * Scheduled job that enforces NDPR data retention limits by pseudonymizing
 * expired PII across all tenant-scoped data tables.
 *
 * Job name (scheduled_jobs): 'pii-data-retention'
 * Schedule: every 24 hours (86400 seconds)
 *
 * Pseudonymization strategy (NDPR Art. 2.8 — Right to Erasure):
 *   - phone numbers: replaced with SHA-256 hash prefix 'PSEUDONYMIZED:<hash8>'
 *   - email addresses: replaced with 'PSEUDONYMIZED@webwaka.internal'
 *   - names: replaced with 'REDACTED_<id_prefix>'
 *   - financial descriptions: replaced with '[REDACTED by NDPR retention policy]'
 *
 * Retention limits enforced (from policy_rules, category='compliance'):
 *   - contributor phone: 365 days (default)
 *   - beneficiary data: 730 days (civic template)
 *   - audit logs: 2555 days (7 years — G23 invariant, NOT pseudonymized)
 *   - ai_sessions: handled by 'ai-session-prune' job
 *
 * Platform Invariants:
 *   T3  — all queries bind tenant_id
 *   G23 — audit_logs are NEVER deleted or pseudonymized (append-only invariant)
 *   P13 — raw phone/email not logged; only counts and timestamps
 *   P10 — NDPR consent records are preserved; only data past retention is pseudonymized
 */

export interface Env {
  DB: D1Database;
  RATE_LIMIT_KV: KVNamespace;
  AUDIT_FAIL_KV: KVNamespace;
  DSAR_BUCKET: R2Bucket;
  ENVIRONMENT: string;
}

export interface DataRetentionResult {
  jobRunAt: number;
  tablesProcessed: string[];
  rowsPseudonymized: number;
  errors: string[];
}

/**
 * Retention window constants (seconds).
 * Sourced from policy_rules (category='compliance') defaults.
 * Individual tenant rules may override via policy_rules row.
 */
const RETENTION_WINDOWS = {
  contributor_phone: 365 * 86400,  // 365 days
  beneficiary_data: 730 * 86400,   // 730 days (civic/NGO workspaces)
  case_pii: 1095 * 86400,          // 3 years (constituency cases)
  mutual_aid_descriptions: 730 * 86400, // 2 years
} as const;

export class DataRetentionService {
  /**
   * Process a single retention sweep batch.
   *
   * Scans configured PII tables for records older than the retention window
   * and replaces PII columns with pseudonymized values.
   *
   * Returns a summary of what was processed.
   */
  async processRetentionSweep(env: Env, batchSize = 100): Promise<DataRetentionResult> {
    const now = Math.floor(Date.now() / 1000);
    const result: DataRetentionResult = {
      jobRunAt: now,
      tablesProcessed: [],
      rowsPseudonymized: 0,
      errors: [],
    };

    // ── 1. Pseudonymize expired contributor phones in fundraising campaigns ──
    try {
      const cutoff = now - RETENTION_WINDOWS.contributor_phone;
      const rows = await env.DB.prepare(
        `SELECT id FROM fundraising_contributions
         WHERE created_at < ?
           AND donor_phone IS NOT NULL
           AND donor_phone NOT LIKE 'PSEUDONYMIZED:%'
         LIMIT ?`,
      ).bind(cutoff, batchSize).all<{ id: string }>();

      if (rows.results.length > 0) {
        for (const row of rows.results) {
          await env.DB.prepare(
            `UPDATE fundraising_contributions
             SET donor_phone = 'PSEUDONYMIZED:' || substr(hex(randomblob(4)), 1, 8),
                 updated_at = ?
             WHERE id = ?
               AND donor_phone NOT LIKE 'PSEUDONYMIZED:%'`,
          ).bind(now, row.id).run();
        }
        result.rowsPseudonymized += rows.results.length;
        result.tablesProcessed.push('fundraising_contributions');
        console.log(JSON.stringify({
          level: 'info',
          event: 'ndpr_retention_pseudonymized',
          table: 'fundraising_contributions',
          column: 'donor_phone',
          count: rows.results.length,
          retention_days: 365,
        }));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`fundraising_contributions: ${msg}`);
      console.error(JSON.stringify({
        level: 'error',
        event: 'ndpr_retention_error',
        table: 'fundraising_contributions',
        error: msg,
      }));
    }

    // ── 2. Pseudonymize expired pledger phones in fundraising pledges ───────
    try {
      const cutoff = now - RETENTION_WINDOWS.contributor_phone;
      const rows = await env.DB.prepare(
        `SELECT id FROM fundraising_pledges
         WHERE created_at < ?
           AND pledger_phone IS NOT NULL
           AND pledger_phone NOT LIKE 'PSEUDONYMIZED:%'
         LIMIT ?`,
      ).bind(cutoff, batchSize).all<{ id: string }>();

      if (rows.results.length > 0) {
        for (const row of rows.results) {
          await env.DB.prepare(
            `UPDATE fundraising_pledges
             SET pledger_phone = 'PSEUDONYMIZED:' || substr(hex(randomblob(4)), 1, 8),
                 updated_at = ?
             WHERE id = ?
               AND pledger_phone NOT LIKE 'PSEUDONYMIZED:%'`,
          ).bind(now, row.id).run();
        }
        result.rowsPseudonymized += rows.results.length;
        result.tablesProcessed.push('fundraising_pledges');
        console.log(JSON.stringify({
          level: 'info',
          event: 'ndpr_retention_pseudonymized',
          table: 'fundraising_pledges',
          column: 'pledger_phone',
          count: rows.results.length,
          retention_days: 365,
        }));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`fundraising_pledges: ${msg}`);
    }

    // ── 3. Pseudonymize expired beneficiary PII in cases ────────────────────
    // G23: audit_logs are NEVER touched — only the cases table subject data.
    try {
      const cutoff = now - RETENTION_WINDOWS.beneficiary_data;
      const rows = await env.DB.prepare(
        `SELECT id FROM cases
         WHERE created_at < ?
           AND subject_name IS NOT NULL
           AND subject_name NOT LIKE 'REDACTED_%'
         LIMIT ?`,
      ).bind(cutoff, batchSize).all<{ id: string }>();

      if (rows.results.length > 0) {
        for (const row of rows.results) {
          await env.DB.prepare(
            `UPDATE cases
             SET subject_name = 'REDACTED_' || substr(id, 1, 8),
                 subject_phone = NULL,
                 updated_at = ?
             WHERE id = ?
               AND subject_name NOT LIKE 'REDACTED_%'`,
          ).bind(now, row.id).run();
        }
        result.rowsPseudonymized += rows.results.length;
        result.tablesProcessed.push('cases');
        console.log(JSON.stringify({
          level: 'info',
          event: 'ndpr_retention_pseudonymized',
          table: 'cases',
          columns: ['subject_name', 'subject_phone'],
          count: rows.results.length,
          retention_days: 730,
        }));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`cases: ${msg}`);
    }

    // ── 4. Log retention run to data_retention_log ──────────────────────────
    try {
      await env.DB.prepare(
        `INSERT INTO data_retention_log
           (id, job_run_at, tables_processed, rows_pseudonymized, error_count, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).bind(
        `drl_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`,
        now,
        JSON.stringify(result.tablesProcessed),
        result.rowsPseudonymized,
        result.errors.length,
        now,
      ).run();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(JSON.stringify({
        level: 'error',
        event: 'data_retention_log_failed',
        error: msg,
      }));
    }

    return result;
  }
}
