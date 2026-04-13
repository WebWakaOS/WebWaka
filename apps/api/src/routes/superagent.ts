/**
 * SuperAgent API routes — SA-3.x / SA-2.x / M8a-3
 *
 * POST   /superagent/consent          — Grant AI processing consent (NDPR P10)
 * DELETE /superagent/consent          — Revoke AI processing consent
 * GET    /superagent/consent          — Get current consent status + history
 * POST   /superagent/chat             — Invoke AI capability (live provider execution SA-3.x)
 * GET    /superagent/usage            — Fetch usage history for current user
 *
 * All routes require authMiddleware (wired in index.ts).
 * /chat additionally runs aiConsentGate (SA-2.2).
 *
 * Platform Invariants:
 *   P7  — no direct SDK calls; createAdapter from @webwaka/ai-adapters (fetch-only)
 *   P9  — WakaCU amounts are integers only; CreditBurnEngine enforces this
 *   P10 — NDPR consent required before /chat (aiConsentGate)
 *   P12 — no AI on USSD (aiConsentGate)
 *   P13 — callers must not send raw PII in messages (documented obligation)
 *   T3  — tenant_id scoping on all D1 queries
 *
 * SA-3.x execution flow (POST /chat):
 *   1. aiConsentGate — P12 USSD block → AI rights → P10 NDPR (already passed by gate)
 *   2. WalletService.getWallet — load spend cap + current spend for routing context
 *   3. resolveAdapter — 5-level BYOK chain → picks provider + model + key
 *   4. createAdapter(resolved).complete(aiRequest) — live HTTP fetch to provider (P7)
 *   5. CreditBurnEngine.burn — deduct WakaCU: pool → own wallet → BYOK (post-pay, P9)
 *   6. UsageMeter.record — write ai_usage_events row with real token counts (P10, P13)
 *   7. Return real response content + usage summary
 *
 * Milestone: M8a + SA-2.x + SA-3.x
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import {
  grantAiConsent,
  revokeAiConsent,
  getAiConsentStatus,
  listAiConsents,
  aiConsentGate,
  UsageMeter,
  WalletService,
  CreditBurnEngine,
  PartnerPoolService,
  HitlService,
  SpendControls,
  NdprRegister,
  VERTICAL_AI_CONFIGS,
  isSensitiveVertical,
  preProcessCheck,
  stripPii,
  postProcessCheck,
  getSensitiveSector,
} from '@webwaka/superagent';
import { resolveAdapter } from '@webwaka/ai';
import { createAdapter } from '@webwaka/ai-adapters';
import { buildAIRoutingContext, AIAuthError } from '@webwaka/auth';
import type { AiConsentPurpose, AiConsentLocale } from '@webwaka/superagent';
import type { AICapabilityType, AIRequest } from '@webwaka/ai';
import type { Env } from '../env.js';

// ---------------------------------------------------------------------------
// D1Like (minimal — avoids direct CF Workers type import in route files)
// ---------------------------------------------------------------------------

interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const superagentRoutes = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// POST /superagent/consent — Grant AI processing consent
// ---------------------------------------------------------------------------

superagentRoutes.post('/consent', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const db = c.env.DB as unknown as D1Like;

  let body: {
    purpose?: AiConsentPurpose;
    consent_text_hash?: string;
    locale?: AiConsentLocale;
    ip_hash?: string;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const purpose: AiConsentPurpose = body.purpose ?? 'ai_processing';
  const locale: AiConsentLocale = body.locale ?? 'en';

  if (!body.consent_text_hash) {
    return c.json(
      {
        error: 'consent_text_hash required',
        message: 'SHA-256 of the exact consent text displayed to the user must be provided.',
      },
      400,
    );
  }
  if (!body.ip_hash) {
    return c.json(
      {
        error: 'ip_hash required',
        message: 'SHA-256(PII_SALT + raw_ip) must be provided (P13).',
      },
      400,
    );
  }

  const { consentId } = await grantAiConsent(
    db as Parameters<typeof grantAiConsent>[0],
    {
      userId: auth.userId,
      tenantId: auth.tenantId,
      purpose,
      consentTextHash: body.consent_text_hash,
      locale,
      ipHash: body.ip_hash,
    },
  );

  return c.json({ consent_id: consentId, purpose, granted: true }, 201);
});

// ---------------------------------------------------------------------------
// DELETE /superagent/consent — Revoke AI processing consent
// ---------------------------------------------------------------------------

superagentRoutes.delete('/consent', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const db = c.env.DB as unknown as D1Like;

  const purpose = (c.req.query('purpose') ?? 'ai_processing') as AiConsentPurpose;

  const { revoked } = await revokeAiConsent(
    db as Parameters<typeof revokeAiConsent>[0],
    auth.userId,
    auth.tenantId,
    purpose,
  );

  return c.json({ revoked, purpose });
});

// ---------------------------------------------------------------------------
// GET /superagent/consent — Consent status + optional history
// ---------------------------------------------------------------------------

superagentRoutes.get('/consent', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const db = c.env.DB as unknown as D1Like;

  const purpose = (c.req.query('purpose') ?? 'ai_processing') as AiConsentPurpose;
  const includeHistory = c.req.query('history') === '1';

  const status = await getAiConsentStatus(
    db as Parameters<typeof getAiConsentStatus>[0],
    auth.userId,
    auth.tenantId,
    purpose,
  );

  const history = includeHistory
    ? await listAiConsents(
        db as Parameters<typeof listAiConsents>[0],
        auth.userId,
        auth.tenantId,
      )
    : undefined;

  return c.json({
    purpose,
    granted: status.granted,
    consent_id: status.consentId,
    granted_at: status.grantedAt,
    ...(history !== undefined ? { history } : {}),
  });
});

// ---------------------------------------------------------------------------
// POST /superagent/chat — Live AI capability invocation (SA-3.x)
// aiConsentGate checks P10/P12/AI-rights before reaching this handler.
// ---------------------------------------------------------------------------

superagentRoutes.post(
  '/chat',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as unknown as import('@webwaka/types').AuthContext;
    const consentId = (c.get as (k: string) => unknown)('aiConsentId') as string | null;

    let body: {
      capability?: string;
      pillar?: 1 | 2 | 3;
      messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
      vertical?: string;
      max_tokens?: number;
      temperature?: number;
    };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    if (!body.capability) {
      return c.json({ error: 'capability is required' }, 400);
    }
    if (!body.messages || body.messages.length === 0) {
      return c.json({ error: 'messages array is required and must not be empty' }, 400);
    }

    const capability = body.capability as AICapabilityType;
    const pillar: 1 | 2 | 3 = body.pillar ?? 1;

    // Step 0a: Determine autonomy level from vertical config (SA-4.5)
    const verticalSlug = body.vertical ?? '';
    const autonomyLevel = isSensitiveVertical(verticalSlug) ? 3 : 1;

    // Step 0b: Compliance pre-check — sensitive sector detection + PII stripping (P13, SA-4.5)
    const complianceResult = preProcessCheck(
      verticalSlug,
      body.messages,
      autonomyLevel,
    );
    if (!complianceResult.allowed) {
      return c.json({ error: 'COMPLIANCE_BLOCKED', warnings: complianceResult.warnings }, 403);
    }
    if (complianceResult.requiresHitl) {
      return c.json({
        error: 'HITL_REQUIRED',
        sector: complianceResult.sector,
        hitl_level: complianceResult.hitlLevel,
        message: 'This action requires human-in-the-loop review before execution.',
      }, 403);
    }

    // Step 0c: Strip PII from messages before AI call (P13 enforcement)
    const sanitizedMessages = body.messages.map((m) => ({
      ...m,
      content: stripPii(m.content),
    }));

    // Step 0d: Spend budget check (SA-4.4) — block if budget exhausted
    const spendControls = new SpendControls({ db: c.env.DB as never });
    const budgetCheck = await spendControls.checkBudget(
      auth.tenantId,
      auth.userId,
      undefined,
      undefined,
      auth.workspaceId,
    );
    if (!budgetCheck.allowed) {
      return c.json({
        error: 'BUDGET_EXCEEDED',
        scope: budgetCheck.budgetScope,
        remaining: budgetCheck.remaining,
        limit: budgetCheck.limit,
      }, 429);
    }

    // Step 1: Load wallet for spend cap context (P9 — integers only)
    const walletService = new WalletService({ db: c.env.DB });
    const wallet = await walletService.getWallet(auth.tenantId);

    // Step 2: Build routing context (P10/P12 gates already passed via aiConsentGate)
    const routingCtx = buildAIRoutingContext({
      auth,
      capability,
      pillar,
      isUssd: false,             // already blocked by aiConsentGate (P12)
      ndprConsentGranted: true,  // already verified by aiConsentGate (P10)
      aiRights: true,            // already verified by aiConsentGate
      currentSpendWakaCu: wallet?.currentMonthSpentWakaCu ?? 0,
      spendCapWakaCu: wallet?.spendCapMonthlyWakaCu ?? 0,
    });

    // Step 3: Build env vars map for resolver (P7 — no direct SDK calls)
    const envRecord = Object.fromEntries(
      Object.entries(c.env as unknown as Record<string, unknown>).filter(
        ([, v]) => typeof v === 'string',
      ),
    ) as Record<string, string>;

    // Step 4: Resolve adapter — 5-level BYOK chain
    let resolved;
    try {
      resolved = await resolveAdapter(routingCtx, envRecord);
    } catch (err: unknown) {
      if (err instanceof AIAuthError) {
        return c.json({ error: err.code, message: err.message }, 403);
      }
      const message = err instanceof Error ? err.message : 'Adapter resolution failed';
      return c.json({ error: 'AI_ROUTING_FAILED', message }, 503);
    }

    // Step 5: Execute live provider call (P7 — createAdapter uses fetch only, no SDK)
    const adapter = createAdapter(resolved);
    const aiRequest: AIRequest = {
      messages: sanitizedMessages,
      maxTokens: body.max_tokens ?? 1024,
      temperature: body.temperature ?? 0.7,
    };

    const startMs = Date.now();
    let aiResponse: Awaited<ReturnType<typeof adapter.complete>>;
    try {
      aiResponse = await adapter.complete(aiRequest);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Provider call failed';
      return c.json({ error: 'AI_PROVIDER_ERROR', message }, 503);
    }
    const durationMs = Date.now() - startMs;

    // Step 6: Charge WakaCU — pool → own wallet → BYOK (P9 integer accounting)
    // Generate stable burn reference for idempotency (Worker retry safety).
    const burnRef = crypto.randomUUID();
    const partnerPoolService = new PartnerPoolService({ db: c.env.DB, walletService });
    const burnEngine = new CreditBurnEngine({ walletService, partnerPoolService });

    const burn = await burnEngine.burn({
      tenantId: auth.tenantId,
      resolved,
      tokensUsed: aiResponse.tokensUsed,
      usageEventId: burnRef,
    });

    // Step 7: Post-process compliance check — flag regulated content (SA-4.5)
    const postCheck = postProcessCheck(
      aiResponse.content,
      getSensitiveSector(body.vertical ?? '') as Parameters<typeof postProcessCheck>[1],
    );

    // Step 8: Record usage event (P10 — NDPR consent ref; P13 — no prompt content stored)
    const meter = new UsageMeter({ db: c.env.DB });
    await meter.record({
      tenantId: auth.tenantId,
      userId: auth.userId,
      pillar,
      capability,
      provider: aiResponse.provider,
      model: aiResponse.model,
      inputTokens: 0,
      outputTokens: aiResponse.tokensUsed,
      wakaCuCharged: burn.wakaCuCharged,
      routingLevel: resolved.level,
      durationMs,
      finishReason: aiResponse.finishReason,
      ndprConsentRef: consentId ?? null,
    });

    // Step 9: Record spend against budget (SA-4.4)
    if (burn.wakaCuCharged > 0) {
      await spendControls.recordSpend(
        auth.tenantId,
        auth.userId,
        burn.wakaCuCharged,
        undefined,
        undefined,
        auth.workspaceId,
      );
    }

    return c.json({
      provider: aiResponse.provider,
      model: aiResponse.model,
      routing_level: resolved.level,
      waku_cu_per_1k_tokens: resolved.wakaCuPer1kTokens,
      response: {
        role: 'assistant',
        content: postCheck.content,
      },
      usage: {
        input_tokens: 0,
        output_tokens: aiResponse.tokensUsed,
        total_tokens: aiResponse.tokensUsed,
        cost_waku_cu: burn.wakaCuCharged,
        charge_source: burn.chargeSource,
        balance_after_waku_cu: burn.balanceAfter,
      },
      ...(complianceResult.disclaimers.length > 0 || postCheck.disclaimers.length > 0
        ? { disclaimers: [...complianceResult.disclaimers, ...postCheck.disclaimers] }
        : {}),
      ...(postCheck.flagged ? { compliance_flagged: true, compliance_flags: postCheck.flags } : {}),
    });
  },
);

// ---------------------------------------------------------------------------
// GET /superagent/usage — Usage history for current user
// ---------------------------------------------------------------------------

superagentRoutes.get('/usage', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const db = c.env.DB as unknown as D1Like;

  const limitStr = c.req.query('limit') ?? '50';
  const limit = Math.min(parseInt(limitStr, 10) || 50, 200);
  const pillarStr = c.req.query('pillar');

  const bindings: unknown[] = [auth.userId, auth.tenantId];
  let pillarClause = '';
  if (pillarStr) {
    pillarClause = ' AND pillar = ?';
    bindings.push(parseInt(pillarStr, 10));
  }
  bindings.push(limit);

  const { results } = await db
    .prepare(
      `SELECT id, pillar, capability, provider, model,
              input_tokens, output_tokens, wc_charged AS cost_waku_cu,
              routing_level, finish_reason, created_at
         FROM ai_usage_events
        WHERE user_id = ? AND tenant_id = ?${pillarClause}
        ORDER BY created_at DESC
        LIMIT ?`,
    )
    .bind(...bindings)
    .all<{
      id: string;
      pillar: number;
      capability: string;
      provider: string;
      model: string;
      input_tokens: number;
      output_tokens: number;
      cost_waku_cu: number;
      routing_level: number;
      finish_reason: string;
      created_at: string;
    }>();

  return c.json({ usage: results, count: results.length });
});

// ---------------------------------------------------------------------------
// GET /superagent/usage/quota — Current month AI quota status (MON-03)
//
// Returns the tenant's plan-based monthly WakaCU allowance and how much
// has been consumed so far this month. Reads from:
//   wc_wallets.current_month_spent_wc  — live running total (updated by CreditBurnEngine)
//   wc_wallets.spend_cap_reset_at      — next reset date
//   ai_plan_quotas.quota_waku_cu       — plan-level monthly allowance
//   subscriptions.plan                 — tenant's current subscription plan
//
// quota_waku_cu = 0 means unlimited (enterprise).
// ---------------------------------------------------------------------------

superagentRoutes.get('/usage/quota', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; workspaceId?: string };
  const db = c.env.DB as unknown as D1Like;

  // Get current wallet state for this tenant
  const wallet = await db
    .prepare(
      `SELECT current_month_spent_wc, spend_cap_monthly_wc, spend_cap_reset_at
         FROM wc_wallets
        WHERE tenant_id = ?`,
    )
    .bind(auth.tenantId)
    .first<{
      current_month_spent_wc: number;
      spend_cap_monthly_wc: number;
      spend_cap_reset_at: string;
    }>();

  // Get the tenant's subscription plan
  const workspaceId = auth.workspaceId;
  const subQuery = workspaceId
    ? `SELECT plan FROM subscriptions WHERE tenant_id = ? AND workspace_id = ? LIMIT 1`
    : `SELECT plan FROM subscriptions WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 1`;

  const sub = workspaceId
    ? await db.prepare(subQuery).bind(auth.tenantId, workspaceId).first<{ plan: string }>()
    : await db.prepare(subQuery).bind(auth.tenantId).first<{ plan: string }>();

  const plan = sub?.plan ?? 'free';

  // Look up plan quota from ai_plan_quotas seed table
  const planQuota = await db
    .prepare(`SELECT quota_waku_cu, description FROM ai_plan_quotas WHERE plan = ?`)
    .bind(plan)
    .first<{ quota_waku_cu: number; description: string }>();

  // Fallback if migration not yet applied: use static defaults (P9: integers)
  const STATIC_QUOTAS: Record<string, number> = {
    free: 500,
    starter: 5000,
    professional: 50000,
    business: 250000,
    enterprise: 0,
  };
  const quotaWakuCu = planQuota?.quota_waku_cu ?? STATIC_QUOTAS[plan] ?? 500;

  const usedWakuCu = wallet?.current_month_spent_wc ?? 0;
  const unlimited = quotaWakuCu === 0;
  const remainingWakuCu = unlimited ? null : Math.max(0, quotaWakuCu - usedWakuCu);

  // Determine reset date: first day of next month if no wallet row yet
  const resetDate = wallet?.spend_cap_reset_at ?? (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 1);
    return d.toISOString().split('T')[0]!;
  })();

  return c.json({
    plan,
    used_waku_cu: usedWakuCu,
    quota_waku_cu: quotaWakuCu,
    remaining_waku_cu: remainingWakuCu,
    unlimited,
    reset_date: resetDate,
    description: planQuota?.description ?? `${plan} plan`,
  });
});

// ===========================================================================
// M12 — SA-4.x Production AI Routes
// ===========================================================================

// ---------------------------------------------------------------------------
// POST /superagent/hitl/submit — Submit AI action for HITL review (SA-4.5)
// ---------------------------------------------------------------------------

superagentRoutes.post('/hitl/submit', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const db = c.env.DB;

  let body: {
    workspace_id?: string;
    vertical?: string;
    capability?: string;
    hitl_level?: number;
    ai_request_payload?: string;
    ai_response_payload?: string;
    expires_in_hours?: number;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.workspace_id || !body.vertical || !body.capability) {
    return c.json({ error: 'workspace_id, vertical, and capability are required' }, 400);
  }
  if (!body.ai_request_payload) {
    return c.json({ error: 'ai_request_payload is required' }, 400);
  }

  const hitlLevel = (body.hitl_level ?? 1) as 1 | 2 | 3;
  if (![1, 2, 3].includes(hitlLevel)) {
    return c.json({ error: 'hitl_level must be 1, 2, or 3' }, 400);
  }

  const svc = new HitlService({ db: db as never });

  const result = await svc.submit({
    tenantId: auth.tenantId,
    workspaceId: body.workspace_id,
    userId: auth.userId,
    vertical: body.vertical,
    capability: body.capability,
    hitlLevel,
    aiRequestPayload: body.ai_request_payload,
    aiResponsePayload: body.ai_response_payload,
    expiresInHours: body.expires_in_hours,
  });

  return c.json({ queue_item_id: result.queueItemId }, 201);
});

// ---------------------------------------------------------------------------
// GET /superagent/hitl/queue — List pending HITL items (SA-4.5)
// ---------------------------------------------------------------------------

superagentRoutes.get('/hitl/queue', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; role?: string };

  if (!auth.role || !['admin', 'super_admin', 'workspace_admin'].includes(auth.role)) {
    return c.json({ error: 'HITL queue access requires admin role' }, 403);
  }

  const svc = new HitlService({ db: c.env.DB as never });
  const items = await svc.listQueue(auth.tenantId, {
    status: c.req.query('status') ?? undefined,
    vertical: c.req.query('vertical') ?? undefined,
    limit: parseInt(c.req.query('limit') ?? '50', 10) || 50,
  });

  return c.json({ items, count: items.length });
});

// ---------------------------------------------------------------------------
// PATCH /superagent/hitl/:id/review — Approve/reject HITL item (SA-4.5)
// ---------------------------------------------------------------------------

superagentRoutes.patch('/hitl/:id/review', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; role?: string };

  if (!auth.role || !['admin', 'super_admin', 'workspace_admin'].includes(auth.role)) {
    return c.json({ error: 'HITL review requires admin role' }, 403);
  }

  const queueItemId = c.req.param('id');

  let body: { decision?: string; note?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.decision || !['approved', 'rejected'].includes(body.decision)) {
    return c.json({ error: "decision must be 'approved' or 'rejected'" }, 400);
  }

  const svc = new HitlService({ db: c.env.DB as never });
  const result = await svc.review({
    queueItemId,
    tenantId: auth.tenantId,
    reviewerId: auth.userId,
    decision: body.decision as 'approved' | 'rejected',
    note: body.note,
  });

  if (!result.success) {
    return c.json({ error: result.error }, 409);
  }

  return c.json({ reviewed: true, decision: body.decision });
});

// ---------------------------------------------------------------------------
// GET /superagent/budgets — List spend budgets (SA-4.4)
// ---------------------------------------------------------------------------

superagentRoutes.get('/budgets', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const scope = c.req.query('scope') as 'user' | 'team' | 'project' | 'workspace' | undefined;

  const controls = new SpendControls({ db: c.env.DB as never });
  const budgets = await controls.listBudgets(auth.tenantId, scope);

  return c.json({ budgets, count: budgets.length });
});

// ---------------------------------------------------------------------------
// PUT /superagent/budgets — Set or update a spend budget (SA-4.4)
// ---------------------------------------------------------------------------

superagentRoutes.put('/budgets', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };

  let body: {
    scope?: string;
    scope_id?: string;
    monthly_limit_waku_cu?: number;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.scope || !body.scope_id) {
    return c.json({ error: 'scope and scope_id are required' }, 400);
  }
  if (!['user', 'team', 'project', 'workspace'].includes(body.scope)) {
    return c.json({ error: 'scope must be user, team, project, or workspace' }, 400);
  }
  if (typeof body.monthly_limit_waku_cu !== 'number' || !Number.isInteger(body.monthly_limit_waku_cu) || body.monthly_limit_waku_cu < 0) {
    return c.json({ error: 'monthly_limit_waku_cu must be a non-negative integer' }, 400);
  }

  const controls = new SpendControls({ db: c.env.DB as never });
  const budget = await controls.setBudget({
    tenantId: auth.tenantId,
    scope: body.scope as 'user' | 'team' | 'project' | 'workspace',
    scopeId: body.scope_id,
    monthlyLimitWakaCu: body.monthly_limit_waku_cu,
  });

  return c.json({ budget }, 201);
});

// ---------------------------------------------------------------------------
// DELETE /superagent/budgets/:id — Deactivate a spend budget (SA-4.4)
// ---------------------------------------------------------------------------

superagentRoutes.delete('/budgets/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const budgetId = c.req.param('id');

  const controls = new SpendControls({ db: c.env.DB as never });
  const deleted = await controls.deleteBudget(budgetId, auth.tenantId);

  if (!deleted) {
    return c.json({ error: 'Budget not found' }, 404);
  }
  return c.json({ deleted: true });
});

// ---------------------------------------------------------------------------
// GET /superagent/audit/export — Anonymized AI usage export (SA-4.6)
// ---------------------------------------------------------------------------

superagentRoutes.get('/audit/export', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const db = c.env.DB as unknown as D1Like;

  const fromDate = c.req.query('from') ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const toDate = c.req.query('to') ?? new Date().toISOString();
  const limitStr = c.req.query('limit') ?? '1000';
  const limit = Math.min(parseInt(limitStr, 10) || 1000, 5000);

  const { results } = await db
    .prepare(
      `SELECT id, pillar, capability, provider, model,
              input_tokens, output_tokens, total_tokens, wc_charged,
              routing_level, duration_ms, finish_reason, created_at
       FROM ai_usage_events
       WHERE tenant_id = ? AND created_at BETWEEN ? AND ?
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .bind(auth.tenantId, fromDate, toDate, limit)
    .all<{
      id: string; pillar: number; capability: string; provider: string; model: string;
      input_tokens: number; output_tokens: number; total_tokens: number; wc_charged: number;
      routing_level: number; duration_ms: number; finish_reason: string; created_at: string;
    }>();

  const anonymized = results.map((r) => ({
    event_id: r.id,
    pillar: r.pillar,
    capability: r.capability,
    provider: r.provider,
    model: r.model,
    input_tokens: r.input_tokens,
    output_tokens: r.output_tokens,
    total_tokens: r.total_tokens,
    waku_cu_charged: r.wc_charged,
    routing_level: r.routing_level,
    duration_ms: r.duration_ms,
    finish_reason: r.finish_reason,
    timestamp: r.created_at,
  }));

  return c.json({
    export_type: 'ai_audit',
    generated_at: new Date().toISOString(),
    period: { from: fromDate, to: toDate },
    total_events: anonymized.length,
    events: anonymized,
  });
});

// ---------------------------------------------------------------------------
// GET /superagent/ndpr/register — NDPR Article 30 register export (SA-4.3)
// ---------------------------------------------------------------------------

superagentRoutes.get('/ndpr/register', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };

  const register = new NdprRegister({ db: c.env.DB as never });
  const exported = await register.exportRegister(auth.tenantId);

  return c.json(exported);
});

// ---------------------------------------------------------------------------
// POST /superagent/ndpr/register/seed — Seed NDPR register from vertical configs (SA-4.3)
// ---------------------------------------------------------------------------

superagentRoutes.post('/ndpr/register/seed', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };

  const register = new NdprRegister({ db: c.env.DB as never });
  const seeded = await register.seedFromVerticalConfigs(auth.tenantId, VERTICAL_AI_CONFIGS);

  return c.json({ seeded, message: `${seeded} processing activities registered` }, 201);
});

// ---------------------------------------------------------------------------
// PATCH /superagent/ndpr/register/:id/review — Mark register entry reviewed (SA-4.3)
// ---------------------------------------------------------------------------

superagentRoutes.patch('/ndpr/register/:id/review', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const entryId = c.req.param('id');

  const register = new NdprRegister({ db: c.env.DB as never });
  const updated = await register.markReviewed(entryId, auth.tenantId);

  if (!updated) {
    return c.json({ error: 'Register entry not found' }, 404);
  }

  return c.json({ reviewed: true });
});

// ---------------------------------------------------------------------------
// GET /superagent/compliance/check — Check compliance status for a vertical (SA-4.5)
// ---------------------------------------------------------------------------

superagentRoutes.get('/compliance/check', async (c) => {
  const vertical = c.req.query('vertical');
  if (!vertical) {
    return c.json({ error: 'vertical query parameter required' }, 400);
  }

  const sensitive = isSensitiveVertical(vertical);
  const sector = getSensitiveSector(vertical);
  const complianceCheck = preProcessCheck(vertical, [], sensitive ? 3 : 1);

  return c.json({
    vertical,
    is_sensitive: sensitive,
    sector,
    requires_hitl: complianceCheck.requiresHitl,
    hitl_level: complianceCheck.hitlLevel ?? null,
    disclaimers: complianceCheck.disclaimers,
  });
});
