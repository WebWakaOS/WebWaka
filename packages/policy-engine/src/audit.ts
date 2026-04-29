/**
 * @webwaka/policy-engine — Audit log writer (Phase 1 MVP)
 *
 * Writes policy_audit_log rows to D1 for every evaluation.
 * NDPR compliance requires auditability of all data access decisions.
 *
 * Fires-and-forgets (non-blocking). Evaluation decisions are NOT
 * held pending audit write — this is intentional for latency.
 */

import type { PolicyEvalResult, PolicyContext, PolicyDecision } from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean }>;
    };
  };
}

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  userId: string | null;
  ruleKey: string;
  decision: PolicyDecision;
  hitlLevel: 1 | 2 | 3 | null;
  reason: string;
  contextSnapshot: string;
  evaluatedAt: number;
}

/**
 * Write a policy evaluation result to the audit log.
 * Non-blocking — does not throw on failure (logs silently).
 *
 * T3: tenantId is always included.
 * P10: contextSnapshot is redacted of PII before storage.
 */
export async function writeAuditLog(
  db: D1Like,
  ctx: PolicyContext,
  result: PolicyEvalResult,
): Promise<void> {
  try {
    const id = crypto.randomUUID();
    const redacted = redactContext(ctx);

    await db
      .prepare(`
        INSERT INTO policy_audit_log
          (id, tenant_id, user_id, rule_key, decision, hitl_level, reason, context_snapshot, evaluated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        ctx.tenantId,
        ctx.userId ?? null,
        result.ruleKey,
        result.decision,
        result.hitlLevel ?? null,
        result.reason,
        JSON.stringify(redacted),
        result.evaluatedAt,
      )
      .run();
  } catch {
    // Audit log write failures must not block policy evaluation
    // In Phase 5, this will forward to a dead-letter queue for retry
  }
}

/**
 * Redact sensitive fields from context before audit storage.
 * P10 / NDPR: phone, NIN, BVN, voter_ref must never appear in audit logs.
 */
function redactContext(ctx: PolicyContext): Record<string, unknown> {
  const PII_FIELDS = new Set([
    'donorPhone',
    'phoneNumber',
    'nin',
    'bvn',
    'voterRef',
    'voter_ref',
    'email',
  ]);

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(ctx)) {
    if (PII_FIELDS.has(k)) {
      out[k] = '[REDACTED]';
    } else {
      out[k] = v;
    }
  }
  return out;
}
