/**
 * Usage metering + audit log.
 * (SA-1.9 — TDR-0009, Platform Invariants P9, P10, P13)
 *
 * Records every AI call to ai_usage_events (migration 0045).
 * This table is the authoritative audit trail for:
 *   - Billing reconciliation
 *   - NDPR compliance (P10 — consent reference stored per event)
 *   - Security/anomaly detection
 *   - Pillar attribution analytics
 *
 * P9:  All token counts and WakaCU values are integers.
 * P10: ndprConsentRef is required — callers must pass the consent record ID.
 * P13: No PII is stored in this table. The prompt/response content is NOT logged.
 */

import type { AiUsageEvent } from './types.js';
import type { AIProvider } from '@webwaka/ai';
import type { AICapabilityType } from '@webwaka/ai';

export interface UsageMeterDeps {
  db: D1Database;
}

export interface RecordUsageInput {
  tenantId: string;
  userId: string | null;
  /** 1 = Ops (Pillar 1), 2 = Branding (Pillar 2), 3 = Marketplace (Pillar 3) */
  pillar: 1 | 2 | 3;
  capability: AICapabilityType;
  provider: AIProvider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  wakaCuCharged: number;
  routingLevel: 1 | 2 | 3 | 4 | 5;
  durationMs: number;
  finishReason: string;
  /** P10 — NDPR consent record ID. Required — do not pass null for paid plans. */
  ndprConsentRef: string | null;
}

export class UsageMeter {
  private readonly db: D1Database;

  constructor(deps: UsageMeterDeps) {
    this.db = deps.db;
  }

  /**
   * Record an AI usage event.
   * This should be called AFTER the AI call completes (success or error).
   * On error, tokensUsed = 0 and wakaCuCharged = 0.
   *
   * Returns the generated event ID for cross-referencing in wc_transactions.
   */
  async record(input: RecordUsageInput): Promise<string> {
    const id = crypto.randomUUID();
    const totalTokens = input.inputTokens + input.outputTokens;

    await this.db
      .prepare(
        `INSERT INTO ai_usage_events
           (id, tenant_id, user_id, pillar, capability, provider, model,
            input_tokens, output_tokens, total_tokens, wc_charged,
            routing_level, duration_ms, finish_reason, ndpr_consent_ref, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      )
      .bind(
        id,
        input.tenantId,
        input.userId,
        input.pillar,
        input.capability,
        input.provider,
        input.model,
        input.inputTokens,
        input.outputTokens,
        totalTokens,
        input.wakaCuCharged,
        input.routingLevel,
        input.durationMs,
        input.finishReason,
        input.ndprConsentRef,
      )
      .run();

    return id;
  }

  /**
   * Aggregate usage for a tenant in a given period.
   * Returns totals by pillar and capability for dashboard analytics.
   */
  async aggregate(
    tenantId: string,
    fromDate: string,
    toDate: string,
  ): Promise<{
    totalEvents: number;
    totalTokens: number;
    totalWakaCuCharged: number;
    byPillar: Record<1 | 2 | 3, { events: number; tokens: number; wakaCu: number }>;
  }> {
    const rows = await this.db
      .prepare(
        `SELECT pillar,
                COUNT(*)            AS events,
                SUM(total_tokens)   AS tokens,
                SUM(wc_charged)     AS waku_cu
         FROM ai_usage_events
         WHERE tenant_id = ?
           AND created_at BETWEEN ? AND ?
         GROUP BY pillar`,
      )
      .bind(tenantId, fromDate, toDate)
      .all<{ pillar: number; events: number; tokens: number; waku_cu: number }>();

    const byPillar: Record<1 | 2 | 3, { events: number; tokens: number; wakaCu: number }> = {
      1: { events: 0, tokens: 0, wakaCu: 0 },
      2: { events: 0, tokens: 0, wakaCu: 0 },
      3: { events: 0, tokens: 0, wakaCu: 0 },
    };

    let totalEvents = 0;
    let totalTokens = 0;
    let totalWakaCuCharged = 0;

    for (const r of rows.results ?? []) {
      const p = r.pillar as 1 | 2 | 3;
      byPillar[p] = { events: r.events, tokens: r.tokens, wakaCu: r.waku_cu };
      totalEvents += r.events;
      totalTokens += r.tokens;
      totalWakaCuCharged += r.waku_cu;
    }

    return { totalEvents, totalTokens, totalWakaCuCharged, byPillar };
  }

  /**
   * List recent usage events for a tenant (no prompt/response content — P13).
   */
  async list(
    tenantId: string,
    limit = 25,
    before?: string,
  ): Promise<AiUsageEvent[]> {
    const rows = await this.db
      .prepare(
        `SELECT id, tenant_id, user_id, pillar, capability, provider, model,
                input_tokens, output_tokens, total_tokens, wc_charged,
                routing_level, duration_ms, finish_reason, ndpr_consent_ref, created_at
         FROM ai_usage_events
         WHERE tenant_id = ? ${before ? 'AND created_at < ?' : ''}
         ORDER BY created_at DESC
         LIMIT ?`,
      )
      .bind(...(before ? [tenantId, before, limit] : [tenantId, limit]))
      .all<{
        id: string; tenant_id: string; user_id: string | null;
        pillar: number; capability: string; provider: string; model: string;
        input_tokens: number; output_tokens: number; total_tokens: number;
        wc_charged: number; routing_level: number; duration_ms: number;
        finish_reason: string; ndpr_consent_ref: string | null; created_at: string;
      }>();

    return (rows.results ?? []).map((r) => ({
      id: r.id,
      tenantId: r.tenant_id,
      userId: r.user_id,
      pillar: r.pillar as 1 | 2 | 3,
      capability: r.capability,
      provider: r.provider as AIProvider,
      model: r.model,
      inputTokens: r.input_tokens,
      outputTokens: r.output_tokens,
      totalTokens: r.total_tokens,
      wakaCuCharged: r.wc_charged,
      routingLevel: r.routing_level as 1 | 2 | 3 | 4 | 5,
      durationMs: r.duration_ms,
      finishReason: r.finish_reason,
      ndprConsentRef: r.ndpr_consent_ref,
      createdAt: r.created_at,
    }));
  }
}
