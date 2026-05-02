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
  MAX_TOOL_ROUNDS,
  createDefaultToolRegistry,
  SessionService,
  getVerticalAiConfig,
  isCapabilityAllowed,
  isCapabilityProhibited,
  CAPABILITY_METADATA,
} from '@webwaka/superagent';
import type { ToolExecutionContext } from '@webwaka/superagent';
import { resolveAdapter } from '@webwaka/ai';
import { createAdapter } from '@webwaka/ai-adapters';
import { buildAIRoutingContext, AIAuthError } from '@webwaka/auth';
import type { AiConsentPurpose, AiConsentLocale } from '@webwaka/superagent';
import type { AICapabilityType, AIRequest, AIMessage, ToolCall } from '@webwaka/ai';
import type { Env } from '../env.js';
import { publishEvent } from '../lib/publish-event.js';
import { AiEventType } from '@webwaka/events';

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

  // N-087: ai.consent_granted event (NDPR P10 audit trail)
  void publishEvent(c.env, {
    eventId: consentId,
    eventKey: AiEventType.AiConsentGranted,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    payload: { consent_id: consentId, purpose },
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });

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
// GET /superagent/vertical/:slug/capabilities — Per-vertical AI config (SA-2.3)
// Auth required. Returns full VerticalAiConfig for slug (never 404 — falls back
// to DEFAULT_VERTICAL_AI_CONFIG). Includes prohibitedCapabilities.
// ---------------------------------------------------------------------------

superagentRoutes.get('/vertical/:slug/capabilities', async (c) => {
  const slug = c.req.param('slug');
  const config = getVerticalAiConfig(slug);

  return c.json({
    slug: config.slug,
    primaryPillar: config.primaryPillar,
    allowedCapabilities: config.allowedCapabilities,
    prohibitedCapabilities: config.prohibitedCapabilities ?? [],
    aiUseCases: config.aiUseCases,
    contextWindowTokens: config.contextWindowTokens ?? 8192,
    // Enrich each allowed capability with display metadata from CAPABILITY_METADATA
    capabilities: (config.allowedCapabilities as string[]).map((cap) => {
      const meta = CAPABILITY_METADATA[cap as keyof typeof CAPABILITY_METADATA];
      return meta
        ? { capability: cap, displayName: meta.displayName, description: meta.description, pillar: meta.pillar, planTier: meta.planTier }
        : { capability: cap, displayName: cap, description: '', pillar: config.primaryPillar, planTier: 'growth' };
    }),
  });
});

// ---------------------------------------------------------------------------
// GET /superagent/vertical/:slug/capabilities/check — O(1) capability gate (SA-2.3)
// Auth required. Accepts ?capability=X. Returns { allowed, prohibited, reason }.
// Hot path used by workspace-app feature toggles before enabling/disabling UI.
// ---------------------------------------------------------------------------

superagentRoutes.get('/vertical/:slug/capabilities/check', async (c) => {
  const slug = c.req.param('slug');
  const capability = c.req.query('capability') as import('@webwaka/ai').AICapabilityType | undefined;

  if (!capability) {
    return c.json({ error: 'capability query parameter required' }, 400);
  }

  // Validate that the capability key is a known AICapabilityType.
  // CAPABILITY_METADATA is a Record<AICapabilityType, ...> so Object.keys() gives
  // the canonical set of valid keys — no separate import needed.
  if (!(capability in CAPABILITY_METADATA)) {
    return c.json({
      error: 'UNKNOWN_CAPABILITY',
      capability,
      message: `'${capability}' is not a recognised AICapabilityType. Valid values: ${Object.keys(CAPABILITY_METADATA).join(', ')}`,
    }, 400);
  }

  const allowed = isCapabilityAllowed(slug, capability);
  const prohibited = isCapabilityProhibited(slug, capability);

  let reason: string;
  if (prohibited) {
    reason = 'explicitly_prohibited';
  } else if (!allowed) {
    reason = 'not_in_allowed_list';
  } else {
    reason = 'capability_allowed';
  }

  return c.json({ allowed, prohibited, reason });
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
      session_id?: string | null;
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

    // Step 0a-capability: Vertical capability allow/prohibit guards (SA-2.3)
    // These run before the full compliance pre-check so O(1) set lookups short-circuit early.
    //
    // Guard 1 — allowedCapabilities: reject if the capability is not on the vertical's allow-list.
    //   Falls back to DEFAULT_VERTICAL_AI_CONFIG for unknown slugs (never blocks unlisted verticals).
    if (verticalSlug && !isCapabilityAllowed(verticalSlug, capability)) {
      return c.json({
        error: 'CAPABILITY_NOT_ALLOWED_FOR_VERTICAL',
        capability,
        vertical: verticalSlug,
        message: `The '${capability}' capability is not available for the '${verticalSlug}' vertical.`,
      }, 403);
    }
    //
    // Guard 2 — prohibitedCapabilities: reject if the capability is explicitly prohibited.
    //   Prohibition is an affirmative compliance declaration — stronger than mere absence from
    //   the allow-list (e.g. function_call is prohibited for health/legal even if the plan grants it).
    if (verticalSlug && isCapabilityProhibited(verticalSlug, capability)) {
      return c.json({
        error: 'CAPABILITY_PROHIBITED_FOR_VERTICAL',
        capability,
        vertical: verticalSlug,
        message: `The '${capability}' capability is explicitly prohibited for the '${verticalSlug}' vertical and requires human-in-the-loop review before use.`,
      }, 403);
    }

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
      // N-087: ai.hitl_required event
      void publishEvent(c.env, {
        eventId: crypto.randomUUID(),
        eventKey: AiEventType.AiHitlRequired,
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorType: 'user',
        workspaceId: auth.workspaceId,
        payload: { capability, vertical: verticalSlug, sector: complianceResult.sector, hitl_level: complianceResult.hitlLevel },
        source: 'api',
        severity: 'warning',
        correlationId: c.get('requestId') ?? undefined,
      });
      return c.json({
        error: 'HITL_REQUIRED',
        sector: complianceResult.sector,
        hitl_level: complianceResult.hitlLevel,
        message: 'This action requires human-in-the-loop review before execution.',
      }, 403);
    }

    // N-087: ai.request_submitted event (request passed compliance + HITL gate)
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: AiEventType.AiRequestSubmitted,
      tenantId: auth.tenantId,
      actorId: auth.userId,
      actorType: 'user',
      workspaceId: auth.workspaceId,
      payload: { capability, vertical: verticalSlug || null },
      source: 'api',
      severity: 'info',
      correlationId: c.get('requestId') ?? undefined,
    });

    // Step 0c: Strip PII from messages before AI call (P13 enforcement)
    const sanitizedMessages = body.messages.map((m) => ({
      ...m,
      content: stripPii(m.content),
    }));

    // Step 0d-pre: Agent Session — load or create, prepend stored history (SA-6.x)
    // session_id is optional. If omitted, a new session is auto-created and returned.
    // All history is loaded before the new user turn; expired sessions return 404.
    const sessionSvc = new SessionService({ db: c.env.DB as never });
    let sessionId: string;
    let sessionIsNew = false;

    // Compute TTL from vertical config — used for both createSession and appendMessages
    // to preserve the per-vertical TTL policy across the entire session lifetime.
    const verticalCfgForWindow = getVerticalAiConfig(verticalSlug);
    const contextWindowTokens = verticalCfgForWindow.contextWindowTokens ?? 8192;
    const sessionTtlDays = contextWindowTokens > 8192 ? 14 : 7;

    if (body.session_id) {
      const existingSession = await sessionSvc.getSession(body.session_id, auth.tenantId);
      if (!existingSession) {
        return c.json({ error: 'SESSION_NOT_FOUND', message: 'Session not found or has expired.' }, 404);
      }
      if (existingSession.userId !== auth.userId) {
        return c.json({ error: 'SESSION_FORBIDDEN', message: 'Session belongs to another user.' }, 403);
      }
      sessionId = existingSession.id;
    } else {
      const newSession = await sessionSvc.createSession({
        tenantId: auth.tenantId,
        userId: auth.userId,
        workspaceId: auth.workspaceId ?? null,
        vertical: verticalSlug || null,
        title: null,
        ttlDays: sessionTtlDays,
      });
      sessionId = newSession.id;
      sessionIsNew = true;
    }

    // Load prior history
    const storedHistory = await sessionSvc.loadHistory(sessionId, auth.tenantId, contextWindowTokens);

    // Build the full message list with correct prompt ordering:
    //   1. Current-turn system prompt(s) — highest instruction priority
    //   2. Stored conversation history — ordered chronologically
    //   3. New user turn(s) — the current request
    //
    // EXPECTED CLIENT MESSAGE SHAPE IN SESSION MODE (SA-6.x):
    //   session mode:   { session_id, messages: [{ role:'user', content:'...' }] }
    //   optional:       one role:'system' message may be included to set/override
    //                   the system prompt for this turn only
    //   NOT sent:       prior assistant or tool messages — the server owns the history
    //
    // LEGACY STATELESS CLIENTS:
    //   Legacy callers that omit session_id continue to work exactly as before —
    //   the full messages[] array is passed to the AI unchanged, and a new session
    //   is auto-created for them transparently.
    //
    //   Clients migrating from stateless to session mode must stop re-sending prior
    //   assistant turns; those are loaded from D1 automatically. Sending historical
    //   assistant/system turns in messages[] with a session_id has no effect —
    //   they are silently filtered here to prevent duplicate transcript storage.
    //
    // System messages must come first so they are never deprioritised by history.
    // Stored history already excludes duplicate system prompts (loadHistory preserves
    // them only once via context-window trimming). Client-provided assistant/system
    // history is intentionally filtered out — only the new user turn(s) are accepted.
    const currentSystemMsgs = sanitizedMessages
      .filter((m) => m.role === 'system')
      .map((m): AIMessage => ({ role: 'system', content: m.content }));

    const currentUserMsgs = sanitizedMessages
      .filter((m) => m.role === 'user')
      .map((m): AIMessage => ({ role: 'user', content: m.content }));

    const messagesWithHistory: AIMessage[] = [
      ...currentSystemMsgs,
      ...storedHistory.map((h): AIMessage => ({
        role: h.role,
        content: h.content,
        ...(h.tool_calls ? { tool_calls: h.tool_calls as ToolCall[] } : {}),
        ...(h.tool_call_id ? { tool_call_id: h.tool_call_id } : {}),
      })),
      ...currentUserMsgs,
    ];

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
      // N-087: ai.budget_exhausted event
      void publishEvent(c.env, {
        eventId: crypto.randomUUID(),
        eventKey: AiEventType.AiBudgetExhausted,
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorType: 'user',
        workspaceId: auth.workspaceId,
        payload: { capability, scope: budgetCheck.budgetScope, remaining: budgetCheck.remaining, limit: budgetCheck.limit },
        source: 'api',
        severity: 'critical',
        correlationId: c.get('requestId') ?? undefined,
      });
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
    // For 'function_call' capability, the tool registry is injected and a multi-turn
    // execution loop runs until the model returns a final answer or MAX_TOOL_ROUNDS
    // is reached. For all other capabilities, this is a single-round call.
    const adapter = createAdapter(resolved);

    // SA-5.x: build tool registry for function_call requests
    const toolRegistry = capability === 'function_call' ? createDefaultToolRegistry() : null;

    const toolCtx: ToolExecutionContext = {
      tenantId: auth.tenantId,
      workspaceId: auth.workspaceId ?? '',
      userId: auth.userId,
      db: c.env.DB,
      // SA-5.x: write-capable tool context fields
      vertical: verticalSlug,
      hitlService: new HitlService({ db: c.env.DB as never }),
      autonomyLevel,
    };

    const buildAiRequest = (
      messages: AIRequest['messages'],
      includeTools: boolean,
    ): AIRequest => ({
      messages,
      maxTokens: body.max_tokens ?? 1024,
      temperature: body.temperature ?? 0.7,
      ...(includeTools && toolRegistry && toolRegistry.size > 0
        ? { tools: toolRegistry.getDefinitions(), tool_choice: 'auto' as const }
        : {}),
    });

    const startMs = Date.now();
    let aiResponse: Awaited<ReturnType<typeof adapter.complete>>;
    let currentMessages: AIRequest['messages'] = messagesWithHistory;
    let toolRound = 0;
    let totalToolCallsExecuted = 0;

    try {
      // Initial provider call — include tools when function_call capability
      aiResponse = await adapter.complete(buildAiRequest(currentMessages, true));

      // Multi-turn tool execution loop (SA-5.x — capped at MAX_TOOL_ROUNDS)
      while (
        toolRegistry &&
        aiResponse.finishReason === 'tool_calls' &&
        aiResponse.toolCalls &&
        aiResponse.toolCalls.length > 0 &&
        toolRound < MAX_TOOL_ROUNDS
      ) {
        toolRound++;

        // Execute all requested tool calls in parallel (T3 — tenant-scoped via toolCtx)
        const toolResults = await toolRegistry.executeAll(aiResponse.toolCalls, toolCtx);
        totalToolCallsExecuted += aiResponse.toolCalls.length;

        // Publish tool call execution event (SA-5.x telemetry)
        void publishEvent(c.env, {
          eventId: crypto.randomUUID(),
          eventKey: AiEventType.AiToolCallExecuted,
          tenantId: auth.tenantId,
          actorId: auth.userId,
          actorType: 'user',
          workspaceId: auth.workspaceId,
          payload: {
            capability,
            tool_names: aiResponse.toolCalls.map((tc) => tc.function.name),
            round: toolRound,
          },
          source: 'api',
          severity: 'info',
          correlationId: c.get('requestId') ?? undefined,
        });

        // Append assistant message (with tool_calls) + tool result messages
        currentMessages = [
          ...currentMessages,
          {
            role: 'assistant' as const,
            content: aiResponse.content ?? '',
            tool_calls: aiResponse.toolCalls,
          },
          ...toolResults.map((r) => ({
            role: 'tool' as const,
            content: r.content,
            tool_call_id: r.tool_call_id,
          })),
        ];

        // Continue conversation — no tools on continuation rounds (model gives final answer)
        aiResponse = await adapter.complete(buildAiRequest(currentMessages, false));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Provider call failed';
      // N-087: ai.response_failed event
      void publishEvent(c.env, {
        eventId: crypto.randomUUID(),
        eventKey: AiEventType.AiResponseFailed,
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorType: 'user',
        workspaceId: auth.workspaceId,
        payload: { capability, vertical: verticalSlug, provider: resolved.config.provider ?? 'unknown', error: message },
        source: 'api',
        severity: 'critical',
        correlationId: c.get('requestId') ?? undefined,
      });
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

    // Step 9b: Write fine-grained spend event to ai_spend_events (P22 — SA-4.4+)
    // Retries up to 3 times on transient D1 failures (exponential backoff: 50ms, 100ms).
    // Best-effort only — failures are structured-logged but never block the AI response.
    {
      const spendEventId = crypto.randomUUID();
      const spendDb = c.env.DB as unknown as D1Like;
      const spendWriteBindings = [
        spendEventId,
        auth.tenantId,
        auth.workspaceId ?? '',
        auth.userId,
        verticalSlug || null,
        capability,
        aiResponse.model ?? null,
        burn.wakaCuCharged,
        null,
        complianceResult.hitlLevel ?? autonomyLevel,
      ];
      const spendWriteSql = `INSERT INTO ai_spend_events
         (id, tenant_id, workspace_id, user_id, vertical, capability, model_used,
          wakaCU_cost, request_id, hitl_level, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed',
                 strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;

      void (async () => {
        const MAX_SPEND_WRITE_ATTEMPTS = 3;
        for (let attempt = 1; attempt <= MAX_SPEND_WRITE_ATTEMPTS; attempt++) {
          try {
            await spendDb.prepare(spendWriteSql).bind(...spendWriteBindings).run();
            return;
          } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : String(err);
            if (attempt < MAX_SPEND_WRITE_ATTEMPTS) {
              await new Promise<void>((r) => setTimeout(r, 50 * attempt));
            } else {
              console.error(
                `[superagent] ai_spend_events permanently failed after ${MAX_SPEND_WRITE_ATTEMPTS} attempts: ${errMsg}`,
                { tenantId: auth.tenantId, capability, spendEventId, model: aiResponse.model },
              );
            }
          }
        }
      })();

      // Step 9c: Queue budget warning notification if spend just crossed 80% threshold (P22)
      const budgetLimit = budgetCheck.limit ?? 0;
      const budgetRemaining = budgetCheck.remaining ?? 0;
      if (budgetLimit > 0 && budgetRemaining > 0 && burn.wakaCuCharged > 0) {
        const newRemaining = budgetRemaining - burn.wakaCuCharged;
        const threshold80pct = Math.floor(budgetLimit * 0.2);
        if (newRemaining <= threshold80pct && budgetRemaining > threshold80pct) {
          // N-087: ai.budget_warning event (notification engine picks this up)
          void publishEvent(c.env, {
            eventId: burnRef,
            eventKey: AiEventType.AiBudgetWarning,
            tenantId: auth.tenantId,
            actorId: auth.userId,
            actorType: 'user',
            workspaceId: auth.workspaceId,
            payload: {
              budget_scope: budgetCheck.budgetScope,
              limit_waku_cu: budgetLimit,
              remaining_waku_cu: newRemaining,
              used_pct: Math.round(((budgetLimit - newRemaining) / budgetLimit) * 100),
            },
            source: 'api',
            severity: 'warning',
            correlationId: c.get('requestId') ?? undefined,
          });
          const notifId = crypto.randomUUID();
          spendDb
            .prepare(
              `INSERT INTO ai_notification_queue
               (id, tenant_id, user_id, notification_type, payload, channel, created_at)
               VALUES (?, ?, ?, 'budget_warning_80pct', ?, 'both',
                       strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
            )
            .bind(
              notifId,
              auth.tenantId,
              auth.userId,
              JSON.stringify({
                budget_scope: budgetCheck.budgetScope,
                limit_waku_cu: budgetLimit,
                remaining_waku_cu: newRemaining,
                used_pct: Math.round(((budgetLimit - newRemaining) / budgetLimit) * 100),
              }),
            )
            .run()
            .catch((err: unknown) => {
              console.error('[superagent] budget warning notification queue failed (non-fatal):', err);
            });
        }
      }
    }

    // N-087: ai.response_generated event (fire-and-forget; no PII — only metrics)
    void publishEvent(c.env, {
      eventId: burnRef,
      eventKey: AiEventType.AiResponseGenerated,
      tenantId: auth.tenantId,
      actorId: auth.userId,
      actorType: 'user',
      workspaceId: auth.workspaceId,
      payload: {
        capability,
        vertical: verticalSlug || null,
        provider: aiResponse.provider,
        model: aiResponse.model,
        tokens_used: aiResponse.tokensUsed,
        waku_cu_charged: burn.wakaCuCharged,
        duration_ms: durationMs,
        routing_level: resolved.level,
      },
      source: 'api',
      severity: 'info',
      correlationId: c.get('requestId') ?? undefined,
    });

    // Step 10: Persist session messages (SA-6.x)
    // Append: new user-role turn(s) from this request, intermediate tool turns,
    // and the final assistant turn. Session writes are AWAITED for durability —
    // Cloudflare Workers drop un-awaited promises when the response is sent.
    // Failures are logged but do not block the AI response.
    //
    // Only user-role messages from sanitizedMessages are appended. Client-provided
    // assistant/system turns are historical context and must not be re-stored
    // (they would already exist in the session from prior turns, causing duplication
    // and corrupting context-window trimming over time).
    try {
      const newUserMsgs = sanitizedMessages
        .filter((m) => m.role === 'user')
        .map((m) => ({
          role: 'user' as const,
          content: m.content,
        }));

      // Tool interchange messages appended during the multi-turn loop
      // (currentMessages grew beyond messagesWithHistory during tool rounds)
      const toolInterchangeMsgs = currentMessages
        .slice(messagesWithHistory.length)
        .map((m) => ({
          role: m.role as 'system' | 'user' | 'assistant' | 'tool',
          content: m.content ?? '',
          toolCallsJson:
            'tool_calls' in m && Array.isArray(m.tool_calls)
              ? JSON.stringify(m.tool_calls)
              : null,
          toolCallId:
            'tool_call_id' in m && typeof m.tool_call_id === 'string'
              ? m.tool_call_id
              : null,
        }));

      // Final assistant response
      const assistantMsg = {
        role: 'assistant' as const,
        content: postCheck.content ?? '',
        toolCallsJson: null as string | null,
        toolCallId: null as string | null,
      };

      // Pass sessionTtlDays so appendMessages() extends expires_at using the
      // same TTL policy that was set at session creation — not the global default.
      await sessionSvc.appendMessages(
        sessionId,
        auth.tenantId,
        [...newUserMsgs, ...toolInterchangeMsgs, assistantMsg],
        sessionTtlDays,
      );
    } catch (err: unknown) {
      console.error(
        `[superagent] session append failed (non-fatal, session continuity may be degraded): ${err instanceof Error ? err.message : String(err)}`,
        { sessionId, tenantId: auth.tenantId, capability },
      );
    }

    return c.json({
      session_id: sessionId,
      session_is_new: sessionIsNew,
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
      ...(capability === 'function_call'
        ? { tool_rounds: toolRound, tool_calls_executed: totalToolCallsExecuted }
        : {}),
    });
  },
);

// ---------------------------------------------------------------------------
// POST /superagent/chat/stream — SSE streaming AI response (SA-3.x)
//
// Same guardrails as /chat (consent gate, budget, HITL, compliance, PII strip).
// All pre-flight checks run synchronously before the stream opens; any gate
// failure returns a normal JSON error response (not an SSE stream).
//
// SSE event format per chunk:
//   data: {"delta":"<text>","done":false}\n\n
// Terminal event:
//   data: {"done":true,"session_id":"...","waku_cu_charged":N,"usage":{...}}\n\n
// Error event (if adapter throws mid-stream):
//   event: error\ndata: {"code":"AI_STREAM_ERROR","message":"..."}\n\n
//
// WakaCU is charged after the stream closes using actual accumulated token count.
// Session append and spend event write happen fire-and-forget after the stream.
//
// Capability guard: function_call is NOT supported (multi-turn tool loop requires
// synchronous round-trips). Returns 400 STREAMING_NOT_SUPPORTED_FOR_TOOL_CALLS.
//
// CORS buffering: Cache-Control: no-cache + X-Accel-Buffering: no prevent
// nginx/CDN proxy buffering of the SSE stream.
// ---------------------------------------------------------------------------

superagentRoutes.post(
  '/chat/stream',
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
      session_id?: string | null;
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

    // Step 1: Capability guard — tool calls require synchronous multi-turn round-trips
    if (capability === 'function_call') {
      return c.json({
        error: 'STREAMING_NOT_SUPPORTED_FOR_TOOL_CALLS',
        message: 'The function_call capability uses a multi-turn tool loop that is incompatible with SSE streaming. Use POST /superagent/chat instead.',
      }, 400);
    }

    const pillar: 1 | 2 | 3 = body.pillar ?? 1;
    const verticalSlug = body.vertical ?? '';
    const autonomyLevel = isSensitiveVertical(verticalSlug) ? 3 : 1;

    // Step 2: Pre-flight compliance check (must pass before stream opens)
    const complianceResult = preProcessCheck(verticalSlug, body.messages, autonomyLevel);
    if (!complianceResult.allowed) {
      return c.json({ error: 'COMPLIANCE_BLOCKED', warnings: complianceResult.warnings }, 403);
    }
    if (complianceResult.requiresHitl) {
      void publishEvent(c.env, {
        eventId: crypto.randomUUID(),
        eventKey: AiEventType.AiHitlRequired,
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorType: 'user',
        workspaceId: auth.workspaceId,
        payload: { capability, vertical: verticalSlug, sector: complianceResult.sector, hitl_level: complianceResult.hitlLevel },
        source: 'api',
        severity: 'warning',
        correlationId: c.get('requestId') ?? undefined,
      });
      return c.json({
        error: 'HITL_REQUIRED',
        sector: complianceResult.sector,
        hitl_level: complianceResult.hitlLevel,
        message: 'This action requires human-in-the-loop review before execution.',
      }, 403);
    }

    // Step 3: PII strip (P13)
    const sanitizedMessages = body.messages.map((m) => ({
      ...m,
      content: stripPii(m.content),
    }));

    // Step 4: Session setup (SA-6.x) — same logic as /chat
    const sessionSvc = new SessionService({ db: c.env.DB as never });
    const verticalCfgForWindow = getVerticalAiConfig(verticalSlug);
    const contextWindowTokens = verticalCfgForWindow.contextWindowTokens ?? 8192;
    const sessionTtlDays = contextWindowTokens > 8192 ? 14 : 7;

    let sessionId: string;
    let sessionIsNew = false;
    if (body.session_id) {
      const existingSession = await sessionSvc.getSession(body.session_id, auth.tenantId);
      if (!existingSession) {
        return c.json({ error: 'SESSION_NOT_FOUND', message: 'Session not found or has expired.' }, 404);
      }
      if (existingSession.userId !== auth.userId) {
        return c.json({ error: 'SESSION_FORBIDDEN', message: 'Session belongs to another user.' }, 403);
      }
      sessionId = existingSession.id;
    } else {
      const newSession = await sessionSvc.createSession({
        tenantId: auth.tenantId,
        userId: auth.userId,
        workspaceId: auth.workspaceId ?? null,
        vertical: verticalSlug || null,
        title: null,
        ttlDays: sessionTtlDays,
      });
      sessionId = newSession.id;
      sessionIsNew = true;
    }

    const storedHistory = await sessionSvc.loadHistory(sessionId, auth.tenantId, contextWindowTokens);
    const currentSystemMsgs = sanitizedMessages
      .filter((m) => m.role === 'system')
      .map((m): AIMessage => ({ role: 'system', content: m.content }));
    const currentUserMsgs = sanitizedMessages
      .filter((m) => m.role === 'user')
      .map((m): AIMessage => ({ role: 'user', content: m.content }));
    const messagesForStream: AIMessage[] = [
      ...currentSystemMsgs,
      ...storedHistory.map((h): AIMessage => ({
        role: h.role,
        content: h.content,
        ...(h.tool_calls ? { tool_calls: h.tool_calls as ToolCall[] } : {}),
        ...(h.tool_call_id ? { tool_call_id: h.tool_call_id } : {}),
      })),
      ...currentUserMsgs,
    ];

    // Step 5: Budget check (SA-4.4)
    const spendControls = new SpendControls({ db: c.env.DB as never });
    const budgetCheck = await spendControls.checkBudget(
      auth.tenantId, auth.userId, undefined, undefined, auth.workspaceId,
    );
    if (!budgetCheck.allowed) {
      void publishEvent(c.env, {
        eventId: crypto.randomUUID(),
        eventKey: AiEventType.AiBudgetExhausted,
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorType: 'user',
        workspaceId: auth.workspaceId,
        payload: { capability, scope: budgetCheck.budgetScope, remaining: budgetCheck.remaining, limit: budgetCheck.limit },
        source: 'api',
        severity: 'critical',
        correlationId: c.get('requestId') ?? undefined,
      });
      return c.json({ error: 'BUDGET_EXCEEDED', scope: budgetCheck.budgetScope, remaining: budgetCheck.remaining, limit: budgetCheck.limit }, 429);
    }

    // Step 6: Wallet + adapter resolution
    const walletService = new WalletService({ db: c.env.DB });
    const wallet = await walletService.getWallet(auth.tenantId);
    const routingCtx = buildAIRoutingContext({
      auth,
      capability,
      pillar,
      isUssd: false,
      ndprConsentGranted: true,
      aiRights: true,
      currentSpendWakaCu: wallet?.currentMonthSpentWakaCu ?? 0,
      spendCapWakaCu: wallet?.spendCapMonthlyWakaCu ?? 0,
    });
    const envRecord = Object.fromEntries(
      Object.entries(c.env as unknown as Record<string, unknown>).filter(([, v]) => typeof v === 'string'),
    ) as Record<string, string>;

    let resolved;
    try {
      resolved = await resolveAdapter(routingCtx, envRecord);
    } catch (err: unknown) {
      if (err instanceof AIAuthError) return c.json({ error: err.code, message: err.message }, 403);
      const message = err instanceof Error ? err.message : 'Adapter resolution failed';
      return c.json({ error: 'AI_ROUTING_FAILED', message }, 503);
    }

    // Step 7: Adapter stream capability check
    const adapter = createAdapter(resolved);
    if (typeof adapter.stream !== 'function') {
      return c.json({
        error: 'STREAMING_NOT_SUPPORTED_BY_PROVIDER',
        message: `The resolved provider (${resolved.config.provider ?? 'unknown'}) does not support streaming. Use POST /superagent/chat instead.`,
      }, 501);
    }

    // Step 8: Build AI request (no tools on stream route)
    const aiRequest: AIRequest = {
      messages: messagesForStream,
      maxTokens: body.max_tokens ?? 1024,
      temperature: body.temperature ?? 0.7,
    };

    // Estimate input tokens before stream (4 chars ≈ 1 token — same heuristic as SessionService)
    const inputTokensEstimate = messagesForStream.reduce(
      (sum, m) => sum + Math.ceil((m.content?.length ?? 0) / 4),
      0,
    );

    const burnRef = crypto.randomUUID();

    // Step 8b: Phase-1 optimistic burn — charge for input tokens before stream opens.
    // This ensures the tenant's wallet/budget is debited before any tokens are consumed,
    // preventing a race where the stream completes but the charge never lands.
    // Phase-2 correction (output tokens) runs inside start() after all chunks arrive.
    // Note: walletService is already created in Step 6 (wallet + adapter resolution).
    const partnerPoolService = new PartnerPoolService({ db: c.env.DB, walletService });
    const burnEngine = new CreditBurnEngine({ walletService, partnerPoolService });

    let optimisticBurn: Awaited<ReturnType<typeof burnEngine.burn>> = {
      wakaCuCharged: 0, chargeSource: 'none', balanceAfter: 0,
    };
    try {
      optimisticBurn = await burnEngine.burn({
        tenantId: auth.tenantId,
        resolved,
        tokensUsed: inputTokensEstimate,
        usageEventId: `${burnRef}_opt`,
      });
    } catch (err: unknown) {
      // Non-blocking — stream opens even if optimistic burn fails (correction handles reconciliation).
      // Emit structured telemetry so infra alerting can detect recurring billing infra failures.
      console.error('[billing] optimistic burn failed — uncharged usage may occur', {
        event: 'optimistic_burn_failed',
        burnRef,
        tenantId: auth.tenantId,
        level: resolved.level,
        inputTokensEstimate,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: AiEventType.AiRequestSubmitted,
      tenantId: auth.tenantId,
      actorId: auth.userId,
      actorType: 'user',
      workspaceId: auth.workspaceId,
      payload: { capability, vertical: verticalSlug || null, streaming: true },
      source: 'api',
      severity: 'info',
      correlationId: c.get('requestId') ?? undefined,
    });

    // Step 9: Build SSE ReadableStream bridging the adapter's AsyncIterable
    const encoder = new TextEncoder();

    // Capture env bindings for post-stream accounting (closures inside ReadableStream start)
    const streamEnv = c.env;
    const streamAuth = auth;

    const sseStream = new ReadableStream({
      async start(controller) {
        let accumulatedContent = '';

        const enqueue = (data: string) => controller.enqueue(encoder.encode(data));

        try {
          const iterable = adapter.stream!(aiRequest);

          for await (const chunk of iterable) {
            // P13: do not log chunk content; only write to stream
            accumulatedContent += chunk;
            enqueue(`data: ${JSON.stringify({ delta: chunk, done: false })}\n\n`);
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Stream error';
          enqueue(`event: error\ndata: ${JSON.stringify({ code: 'AI_STREAM_ERROR', message })}\n\n`);
          controller.close();

          void publishEvent(streamEnv, {
            eventId: crypto.randomUUID(),
            eventKey: AiEventType.AiResponseFailed,
            tenantId: streamAuth.tenantId,
            actorId: streamAuth.userId,
            actorType: 'user',
            workspaceId: streamAuth.workspaceId,
            payload: { capability, vertical: verticalSlug, streaming: true, error: message },
            source: 'api',
            severity: 'critical',
          });
          return;
        }

        // Step 10: Post-stream compliance check on accumulated content
        const postCheck = postProcessCheck(
          accumulatedContent,
          getSensitiveSector(verticalSlug) as Parameters<typeof postProcessCheck>[1],
        );
        const finalContent = postCheck.content ?? accumulatedContent;

        // Step 11: Phase-2 correction burn — charge for output tokens only.
        // Phase-1 (optimistic) already charged input tokens before the stream opened.
        // Combined total = optimistic + correction, reported in the terminal event.
        const outputTokens = Math.ceil(accumulatedContent.length / 4);
        const totalTokens = inputTokensEstimate + outputTokens;

        let correctionBurn: Awaited<ReturnType<typeof burnEngine.burn>> = {
          wakaCuCharged: 0, chargeSource: optimisticBurn.chargeSource, balanceAfter: 0,
        };
        try {
          correctionBurn = await burnEngine.burn({
            tenantId: streamAuth.tenantId,
            resolved,
            tokensUsed: outputTokens,
            usageEventId: `${burnRef}_cor`,
          });
        } catch (corrErr: unknown) {
          // Correction failure is non-fatal — optimistic charge already landed.
          // Emit structured telemetry so infra alerting can detect under-billing.
          console.error('[billing] correction burn failed — optimistic charge stands uncorrected', {
            event: 'correction_burn_failed',
            burnRef,
            tenantId: streamAuth.tenantId,
            level: resolved.level,
            outputTokens,
            optimisticWakaCuCharged: optimisticBurn.wakaCuCharged,
            error: corrErr instanceof Error ? corrErr.message : String(corrErr),
          });
        }

        const totalCuCharged = optimisticBurn.wakaCuCharged + correctionBurn.wakaCuCharged;
        const chargeSource =
          correctionBurn.chargeSource !== 'none'
            ? correctionBurn.chargeSource
            : optimisticBurn.chargeSource;

        // Step 12: Terminal SSE event — emit BEFORE fire-and-forget accounting
        enqueue(
          `data: ${JSON.stringify({
            done: true,
            session_id: sessionId,
            session_is_new: sessionIsNew,
            waku_cu_charged: totalCuCharged,
            ...(postCheck.flagged ? { compliance_flagged: true, compliance_flags: postCheck.flags } : {}),
            usage: {
              input_tokens: inputTokensEstimate,
              output_tokens: outputTokens,
              total_tokens: totalTokens,
              cost_waku_cu: totalCuCharged,
              charge_source: chargeSource,
            },
          })}\n\n`,
        );

        // Step 13: Close stream — all subsequent work is fire-and-forget after close
        controller.close();

        // Step 14: Usage meter (fire-and-forget — post-stream)
        const meter = new UsageMeter({ db: streamEnv.DB });
        void meter.record({
          tenantId: streamAuth.tenantId,
          userId: streamAuth.userId,
          pillar,
          capability,
          provider: resolved.config.provider ?? 'unknown',
          model: resolved.config.model ?? 'unknown',
          inputTokens: inputTokensEstimate,
          outputTokens,
          wakaCuCharged: totalCuCharged,
          routingLevel: resolved.level,
          durationMs: 0,
          finishReason: 'stop',
          ndprConsentRef: consentId ?? null,
        });

        // Step 15: Record corrected spend against budget (fire-and-forget)
        if (totalCuCharged > 0) {
          void spendControls.recordSpend(
            streamAuth.tenantId, streamAuth.userId, totalCuCharged,
            undefined, undefined, streamAuth.workspaceId,
          );
        }

        // Step 16: Write corrected spend event to ai_spend_events (retry — post-stream)
        const spendEventId = crypto.randomUUID();
        const spendDb = streamEnv.DB as unknown as D1Like;
        void (async () => {
          const MAX_ATTEMPTS = 3;
          for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
              await spendDb
                .prepare(
                  `INSERT INTO ai_spend_events
                   (id, tenant_id, workspace_id, user_id, vertical, capability, model_used,
                    wakaCU_cost, request_id, hitl_level, status, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed',
                           strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
                )
                .bind(
                  spendEventId,
                  streamAuth.tenantId,
                  streamAuth.workspaceId ?? '',
                  streamAuth.userId,
                  verticalSlug || null,
                  capability,
                  resolved.config.model ?? null,
                  totalCuCharged,          // corrected total (Phase 1 + Phase 2)
                  burnRef,
                  complianceResult.hitlLevel ?? autonomyLevel,
                )
                .run();
              return;
            } catch (err: unknown) {
              if (attempt < MAX_ATTEMPTS) {
                await new Promise<void>((r) => setTimeout(r, 50 * attempt));
              } else {
                console.error(
                  `[superagent/stream] ai_spend_events permanently failed after ${MAX_ATTEMPTS} attempts`,
                  { tenantId: streamAuth.tenantId, capability, spendEventId },
                );
              }
            }
          }
        })();

        // Step 17: Append assistant message to session (fire-and-forget — post-stream)
        void (async () => {
          try {
            const newUserMsgs = sanitizedMessages
              .filter((m) => m.role === 'user')
              .map((m) => ({ role: 'user' as const, content: m.content }));
            await sessionSvc.appendMessages(
              sessionId,
              streamAuth.tenantId,
              [
                ...newUserMsgs,
                { role: 'assistant' as const, content: finalContent },
              ],
              sessionTtlDays,
            );
          } catch (err: unknown) {
            console.error(
              `[superagent/stream] session append failed: ${err instanceof Error ? err.message : String(err)}`,
              { sessionId, tenantId: streamAuth.tenantId },
            );
          }
        })();

        // Step 18: Publish corrected response generated event (fire-and-forget — post-stream)
        void publishEvent(streamEnv, {
          eventId: burnRef,
          eventKey: AiEventType.AiResponseGenerated,
          tenantId: streamAuth.tenantId,
          actorId: streamAuth.userId,
          actorType: 'user',
          workspaceId: streamAuth.workspaceId,
          payload: {
            capability,
            vertical: verticalSlug || null,
            provider: resolved.config.provider ?? 'unknown',
            model: resolved.config.model ?? 'unknown',
            input_tokens: inputTokensEstimate,
            output_tokens: outputTokens,
            total_tokens: totalTokens,
            waku_cu_charged: totalCuCharged,
            charge_source: chargeSource,
            streaming: true,
          },
          source: 'api',
          severity: 'info',
        });
      },
    });

    return new Response(sseStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
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
  const auth = c.get('auth') as { userId: string; tenantId: string; workspaceId?: string; role?: string };

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

  // SA-4.6: Publish AiHitlApproved event so downstream systems (notificator, webhooks)
  // can inform the original requester that their action is ready to resume.
  if (body.decision === 'approved') {
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: AiEventType.AiHitlApproved,
      tenantId: auth.tenantId,
      actorId: auth.userId,
      actorType: 'user',
      workspaceId: auth.workspaceId ?? '',
      payload: { queue_item_id: queueItemId, reviewer_id: auth.userId, note: body.note ?? null },
      source: 'api',
      severity: 'info',
      correlationId: c.get('requestId') ?? undefined,
    });
  }

  return c.json({ reviewed: true, decision: body.decision });
});

// ---------------------------------------------------------------------------
// POST /superagent/hitl/:id/resume — Re-execute approved HITL action (F-020 fix)
//
// After an admin approves a HITL item (PATCH /hitl/:id/review), the original
// requester or an admin calls this endpoint to re-run the stored AI request.
// The ai_request_payload stored at submit time must be JSON with the same
// shape as the /superagent/chat body: { capability, messages, pillar?, vertical?,
// max_tokens?, temperature? }.
//
// On success the item transitions 'approved' → 'executed' to prevent double-fire.
// ---------------------------------------------------------------------------

superagentRoutes.post('/hitl/:id/resume', async (c) => {
  const auth = c.get('auth') as unknown as import('@webwaka/types').AuthContext;
  const queueItemId = c.req.param('id');

  const svc = new HitlService({ db: c.env.DB as never });
  const item = await svc.getItem(queueItemId, auth.tenantId);

  if (!item) {
    return c.json({ error: 'HITL item not found' }, 404);
  }

  const isAdmin = auth.role && ['admin', 'super_admin', 'workspace_admin'].includes(auth.role as string);
  if (item.userId !== auth.userId && !isAdmin) {
    return c.json({ error: 'Only the original requester or an admin may resume this HITL item' }, 403);
  }

  if (item.status !== 'approved') {
    return c.json({
      error: `Cannot resume: item status is '${item.status}'. Only 'approved' items can be resumed.`,
    }, 409);
  }

  // Parse the stored request payload
  let payload: {
    capability?: string;
    pillar?: 1 | 2 | 3;
    messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    vertical?: string;
    max_tokens?: number;
    temperature?: number;
  };
  try {
    payload = JSON.parse(item.aiRequestPayload);
  } catch {
    return c.json({ error: 'Stored ai_request_payload is not valid JSON — cannot resume' }, 422);
  }

  if (!payload.capability || !payload.messages || payload.messages.length === 0) {
    return c.json({ error: 'Stored payload is missing capability or messages — cannot resume' }, 422);
  }

  const capability = payload.capability as AICapabilityType;
  const pillar: 1 | 2 | 3 = payload.pillar ?? 1;
  const verticalSlug = payload.vertical ?? item.vertical;

  // Strip PII (P13)
  const sanitizedMessages = payload.messages.map((m) => ({
    ...m,
    content: stripPii(m.content),
  }));

  // Spend budget check (SA-4.4)
  const spendControls = new SpendControls({ db: c.env.DB as never });
  const budgetCheck = await spendControls.checkBudget(auth.tenantId, auth.userId, undefined, undefined, auth.workspaceId);
  if (!budgetCheck.allowed) {
    return c.json({ error: 'BUDGET_EXCEEDED', scope: budgetCheck.budgetScope, remaining: budgetCheck.remaining, limit: budgetCheck.limit }, 429);
  }

  // Load wallet + routing context
  const walletService = new WalletService({ db: c.env.DB });
  const wallet = await walletService.getWallet(auth.tenantId);
  const routingCtx = buildAIRoutingContext({
    auth,
    capability,
    pillar,
    isUssd: false,
    ndprConsentGranted: true,
    aiRights: true,
    currentSpendWakaCu: wallet?.currentMonthSpentWakaCu ?? 0,
    spendCapWakaCu: wallet?.spendCapMonthlyWakaCu ?? 0,
  });

  const envRecord = Object.fromEntries(
    Object.entries(c.env as unknown as Record<string, unknown>).filter(([, v]) => typeof v === 'string'),
  ) as Record<string, string>;

  let resolved;
  try {
    resolved = await resolveAdapter(routingCtx, envRecord);
  } catch (err: unknown) {
    if (err instanceof AIAuthError) return c.json({ error: err.code, message: err.message }, 403);
    return c.json({ error: 'AI_ROUTING_FAILED', message: err instanceof Error ? err.message : 'Adapter resolution failed' }, 503);
  }

  const adapter = createAdapter(resolved);
  const aiRequest: AIRequest = {
    messages: sanitizedMessages,
    maxTokens: payload.max_tokens ?? 1024,
    temperature: payload.temperature ?? 0.7,
  };

  const startMs = Date.now();
  let aiResponse: Awaited<ReturnType<typeof adapter.complete>>;
  try {
    aiResponse = await adapter.complete(aiRequest);
  } catch (err: unknown) {
    return c.json({ error: 'AI_PROVIDER_ERROR', message: err instanceof Error ? err.message : 'Provider call failed' }, 503);
  }
  const durationMs = Date.now() - startMs;

  // Charge WakaCU
  const burnRef = crypto.randomUUID();
  const partnerPoolService = new PartnerPoolService({ db: c.env.DB, walletService });
  const burnEngine = new CreditBurnEngine({ walletService, partnerPoolService });
  const burn = await burnEngine.burn({ tenantId: auth.tenantId, resolved, tokensUsed: aiResponse.tokensUsed, usageEventId: burnRef });

  // Post-process compliance
  const postCheck = postProcessCheck(
    aiResponse.content,
    getSensitiveSector(verticalSlug) as Parameters<typeof postProcessCheck>[1],
  );

  // Record usage (P10/P13)
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
    ndprConsentRef: null,
  });

  // Record spend (SA-4.4)
  if (burn.wakaCuCharged > 0) {
    await spendControls.recordSpend(auth.tenantId, auth.userId, burn.wakaCuCharged, undefined, undefined, auth.workspaceId);
  }

  // Transition approved → executed (idempotent — F-020 fix)
  await svc.markExecuted(queueItemId, auth.tenantId);

  // Publish event
  void publishEvent(c.env, {
    eventId: burnRef,
    eventKey: AiEventType.AiResponseGenerated,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    workspaceId: auth.workspaceId,
    payload: {
      capability,
      vertical: verticalSlug || null,
      provider: aiResponse.provider,
      model: aiResponse.model,
      tokens_used: aiResponse.tokensUsed,
      waku_cu_charged: burn.wakaCuCharged,
      duration_ms: durationMs,
      routing_level: resolved.level,
      hitl_item_id: queueItemId,
    },
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });

  return c.json({
    hitl_item_id: queueItemId,
    provider: aiResponse.provider,
    model: aiResponse.model,
    routing_level: resolved.level,
    response: {
      role: 'assistant',
      content: postCheck.content,
    },
    usage: {
      output_tokens: aiResponse.tokensUsed,
      cost_waku_cu: burn.wakaCuCharged,
      charge_source: burn.chargeSource,
      balance_after_waku_cu: burn.balanceAfter,
    },
    ...(postCheck.flagged ? { compliance_flagged: true, compliance_flags: postCheck.flags } : {}),
    ...(postCheck.disclaimers.length > 0 ? { disclaimers: postCheck.disclaimers } : {}),
  });
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

// ---------------------------------------------------------------------------
// GET /superagent/partner-pool/report — Partner credit pool analytics (SA-1.6)
// Admin/platform view of partner credit pool allocations and utilisation.
// Scoped to the requesting tenant as partner (grantor perspective).
// ---------------------------------------------------------------------------

// ===========================================================================
// SA-6.x — Agent Session CRUD Routes
// ===========================================================================

// ---------------------------------------------------------------------------
// GET /superagent/sessions — List active sessions for the current user
// Paginated, cursor-based. Expired sessions are excluded.
// ---------------------------------------------------------------------------

superagentRoutes.get('/sessions', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };

  const limitStr = c.req.query('limit') ?? '20';
  const limit = Math.min(parseInt(limitStr, 10) || 20, 100);
  const cursor = c.req.query('cursor') ?? null;

  const svc = new SessionService({ db: c.env.DB as never });
  const { sessions, nextCursor } = await svc.listSessions({
    tenantId: auth.tenantId,
    userId: auth.userId,
    limit,
    cursor,
  });

  return c.json({
    sessions,
    count: sessions.length,
    next_cursor: nextCursor,
  });
});

// ---------------------------------------------------------------------------
// GET /superagent/sessions/:id — Full session detail + ordered message history
// Returns 404 for expired or non-existent sessions.
// ---------------------------------------------------------------------------

superagentRoutes.get('/sessions/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const sessionId = c.req.param('id');

  const svc = new SessionService({ db: c.env.DB as never });
  const session = await svc.getSession(sessionId, auth.tenantId);

  if (!session) {
    return c.json({ error: 'Session not found or has expired.' }, 404);
  }

  if (session.userId !== auth.userId) {
    return c.json({ error: 'Forbidden: session belongs to another user.' }, 403);
  }

  const rawMessages = await svc.getMessages(sessionId, auth.tenantId);

  // Shape messages for API response: parse tool_calls_json into structured array.
  // Consumers receive tool_calls as an object array, not a raw JSON string.
  const messages = rawMessages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    tool_calls: m.toolCallsJson ? (JSON.parse(m.toolCallsJson) as unknown[]) : undefined,
    tool_call_id: m.toolCallId ?? undefined,
    token_estimate: m.tokenEstimate,
    created_at: m.createdAt,
  }));

  return c.json({ session, messages });
});

// ---------------------------------------------------------------------------
// DELETE /superagent/sessions/:id — Hard-delete session + all messages (GDPR)
// Returns 204 on success; 404 if not found.
// ---------------------------------------------------------------------------

superagentRoutes.delete('/sessions/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const sessionId = c.req.param('id');

  const svc = new SessionService({ db: c.env.DB as never });

  // Validate ownership before delete
  const session = await svc.getSession(sessionId, auth.tenantId);
  if (!session) {
    return c.json({ error: 'Session not found.' }, 404);
  }
  if (session.userId !== auth.userId) {
    return c.json({ error: 'Forbidden: session belongs to another user.' }, 403);
  }

  await svc.deleteSession(sessionId, auth.tenantId);
  return new Response(null, { status: 204 });
});

// ---------------------------------------------------------------------------
// GET /superagent/partner-pool/report — Partner credit pool analytics (SA-1.6)
// Admin/platform view of partner credit pool allocations and utilisation.
// Scoped to the requesting tenant as partner (grantor perspective).
// ---------------------------------------------------------------------------

superagentRoutes.get('/partner-pool/report', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; role?: string };

  const isAdmin = auth.role && ['admin', 'super_admin', 'workspace_admin'].includes(auth.role as string);
  if (!isAdmin) {
    return c.json({ error: 'Partner pool report requires admin role' }, 403);
  }

  const walletService = new WalletService({ db: c.env.DB });
  const partnerPoolService = new PartnerPoolService({ db: c.env.DB, walletService });
  const pools = await partnerPoolService.listGrantedPools(auth.tenantId);

  const now = new Date().toISOString();
  const totalAllocated = pools.reduce((s, p) => s + p.allocatedWakaCu, 0);
  const totalUsed = pools.reduce((s, p) => s + p.usedWakaCu, 0);
  const totalRemaining = totalAllocated - totalUsed;
  const activeCount = pools.filter(
    (p) => !p.expiresAt || p.expiresAt > now,
  ).length;

  return c.json({
    partner_tenant_id: auth.tenantId,
    generated_at: now,
    summary: {
      total_pools: pools.length,
      active_pools: activeCount,
      total_allocated_waku_cu: totalAllocated,
      total_used_waku_cu: totalUsed,
      total_remaining_waku_cu: totalRemaining,
      utilisation_pct:
        totalAllocated > 0
          ? Math.round((totalUsed / totalAllocated) * 100)
          : 0,
    },
    pools: pools.map((p) => ({
      id: p.id,
      beneficiary_tenant_id: p.beneficiaryTenantId,
      allocated_waku_cu: p.allocatedWakaCu,
      used_waku_cu: p.usedWakaCu,
      remaining_waku_cu: p.allocatedWakaCu - p.usedWakaCu,
      utilisation_pct:
        p.allocatedWakaCu > 0
          ? Math.round((p.usedWakaCu / p.allocatedWakaCu) * 100)
          : 0,
      expires_at: p.expiresAt,
      is_expired: p.expiresAt ? p.expiresAt <= now : false,
      created_at: p.createdAt,
    })),
  });
});

// ---------------------------------------------------------------------------
// BYOK Key Management — Wave 3 (A3-6, A3-7)
// POST   /superagent/byok          — Add/replace a BYOK key
// GET    /superagent/byok          — List active BYOK keys (hints only, no plaintext)
// DELETE /superagent/byok/:id      — Revoke a BYOK key
// PUT    /superagent/byok/:id/rotate — Rotate (replace) a BYOK key
// ---------------------------------------------------------------------------

import { KeyService } from '@webwaka/superagent';

superagentRoutes.post('/byok', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const db = c.env.DB as unknown as D1Like;

  let body: { provider?: string; scope?: string; raw_key?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }

  const { provider, scope = 'workspace', raw_key } = body;
  if (!provider || !raw_key) return c.json({ error: 'provider and raw_key are required' }, 400);
  if (!['openai','anthropic','google','byok_custom'].includes(provider)) {
    return c.json({ error: `Unsupported provider: ${provider}` }, 400);
  }
  if (!['user','workspace'].includes(scope)) {
    return c.json({ error: `Invalid scope: ${scope}` }, 400);
  }

  const ks = new KeyService({ db: db as unknown as D1Database, encryptionSecret: c.env.ENCRYPTION_SECRET ?? '' });
  const result = await ks.upsert({
    tenantId: auth.tenantId,
    scope: scope as 'user' | 'workspace',
    userId: scope === 'user' ? auth.userId : null,
    provider: provider as 'openai' | 'anthropic' | 'google' | 'byok_custom',
    rawKey: raw_key,
  });

  return c.json({ id: result.id, provider, scope, key_hint: result.keyHint, created_at: result.createdAt });
});

superagentRoutes.get('/byok', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const db = c.env.DB as unknown as D1Like;
  const ks = new KeyService({ db: db as unknown as D1Database, encryptionSecret: c.env.ENCRYPTION_SECRET ?? '' });
  const keys = await ks.listActive(auth.tenantId);
  return c.json({ keys: keys.map((k) => ({ id: k.id, provider: k.provider, scope: k.scope, key_hint: k.keyHint, created_at: k.createdAt })) });
});

superagentRoutes.delete('/byok/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const db = c.env.DB as unknown as D1Like;
  const { id } = c.req.param();
  const ks = new KeyService({ db: db as unknown as D1Database, encryptionSecret: c.env.ENCRYPTION_SECRET ?? '' });
  const ok = await ks.revoke(id, auth.tenantId);
  if (!ok) return c.json({ error: 'Key not found or already revoked' }, 404);
  return c.json({ revoked: true, id });
});

superagentRoutes.put('/byok/:id/rotate', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const db = c.env.DB as unknown as D1Like;
  const { id } = c.req.param();

  let body: { raw_key?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }
  if (!body.raw_key) return c.json({ error: 'raw_key is required' }, 400);

  const ks = new KeyService({ db: db as unknown as D1Database, encryptionSecret: c.env.ENCRYPTION_SECRET ?? '' });
  const result = await ks.rotate(id, auth.tenantId, body.raw_key);
  if (!result) return c.json({ error: 'Key not found' }, 404);

  return c.json({ id: result.id, provider: result.provider, key_hint: result.keyHint, rotated_at: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Tool Catalogue — Wave 3 (A2-7)
// GET /superagent/tools — returns all registered tool definitions (non-sensitive)
// ---------------------------------------------------------------------------

superagentRoutes.get('/tools', async (c) => {
  const { createDefaultToolRegistry } = await import('@webwaka/superagent');
  const registry = createDefaultToolRegistry();
  return c.json({
    tools: registry.getCatalogue(),
    count: registry.size,
  });
});

// ---------------------------------------------------------------------------
// Session management — Wave 3 (A5-2)
// GET    /superagent/sessions       — list sessions for current user
// DELETE /superagent/sessions/:id   — delete a session (GDPR)
// ---------------------------------------------------------------------------

superagentRoutes.get('/sessions', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const db = c.env.DB as unknown as D1Like;
  const cursor = c.req.query('cursor') ?? undefined;
  const limitStr = c.req.query('limit') ?? '20';
  const limit = Math.min(parseInt(limitStr, 10) || 20, 100);

  const ss = new SessionService({ db });
  const result = await ss.listSessions(auth.tenantId, auth.userId, { cursor, limit });
  return c.json(result);
});

superagentRoutes.delete('/sessions/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const db = c.env.DB as unknown as D1Like;
  const { id } = c.req.param();
  const ss = new SessionService({ db });
  const deleted = await ss.deleteSession(id, auth.tenantId);
  if (!deleted) return c.json({ error: 'Session not found' }, 404);
  return c.json({ deleted: true, id });
});
