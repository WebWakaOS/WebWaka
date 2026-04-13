# M8-AI Gap Analysis

**Status:** Complete  
**Date:** 2026-04-08  
**Inputs:** m8-ai-phase0-repo-audit.md, m8-ai-existing-context-map.md  

---

## Summary Table

| Component | Status | Gap Severity |
|---|---|---|
| AI type contracts (`packages/ai-abstraction`) | ✅ Exists (text only) | MEDIUM — missing media/embed types |
| AI governance policy (`docs/governance/ai-policy.md`) | ✅ Exists (M1) | LOW — needs M8-AI appendix |
| TDR-0009 (provider abstraction) | ✅ Accepted | LOW — needs capability expansion |
| `aiRights` entitlement flag | ✅ Exists (binary) | HIGH — needs granular capability matrix |
| `requireAIAccess()` guard | ✅ Exists | MEDIUM — needs capability-specific guards |
| Rate limiting infrastructure | ✅ Exists (KV-based) | MEDIUM — needs AI-specific config |
| Runtime AI adapters | ❌ Missing | CRITICAL |
| Multi-provider routing engine | ❌ Missing | CRITICAL |
| BYOK key vault (D1/KV) | ❌ Missing | CRITICAL |
| Multiple keys per provider | ❌ Missing | CRITICAL |
| AI usage metering table | ❌ Missing | CRITICAL |
| AI credit/quota system | ❌ Missing | HIGH |
| Granular capability type contracts | ❌ Missing | HIGH |
| Voice/TTS/STT types | ❌ Missing | HIGH |
| Image generation types | ❌ Missing | HIGH |
| Video generation types | ❌ Missing | MEDIUM |
| Embeddings type contract | ❌ Missing (TDR-0009 specifies it) | HIGH |
| AI env vars in `env.ts` | ❌ Missing | CRITICAL |
| Super-admin AI control API | ❌ Missing | HIGH |
| Workspace AI settings API | ❌ Missing | HIGH |
| AI audit log table | ❌ Missing | HIGH |
| Autonomous agent type contracts | ❌ Missing | MEDIUM |
| Human-in-the-loop workflow | ❌ Missing | HIGH |
| Provider health checks | ❌ Missing | MEDIUM |
| AI-specific rate limiting | ❌ Missing | HIGH |
| Vertical AI integration patterns | ❌ Missing | MEDIUM |

---

## What Exists (3 components)

### 1. `packages/ai-abstraction/` — Text-only type contracts (M3)
**What it has:** `AIProvider`, `AIProviderConfig`, `AIMessage`, `AIRequest`, `AIResponse`, `AIAdapter`  
**What it lacks:** `embed()`, `moderateContent()`, `transcribeAudio()`, `generateImage()`, `generateVideo()`, `AIUsageRecord`, capability checks

**Decision:** EXPAND this package. Do not replace it. Add new type families alongside the existing text contracts.

### 2. `packages/entitlements/` — Binary AI rights gate
**What it has:** `aiRights: boolean` in `PlanConfig`; `requireAIAccess(ctx)` guard  
**What it lacks:** Per-capability AI rights (text vs voice vs image vs video vs agents vs embeddings)

**Decision:** EXPAND `plan-config.ts` to add `aiCapabilities: AICapabilitySet` alongside `aiRights`. Keep `aiRights` as the master switch; capabilities are the fine-grained control.

### 3. `docs/governance/ai-policy.md` + TDR-0009 — Governance foundation
**What it has:** 6 core principles, 5 implementation rules, provider abstraction decision, BYOK decision, HITL requirement for sensitive sectors, audit requirement  
**What it lacks:** Billing/metering policy, credit pack policy, provider failover policy, autonomy levels policy, model routing policy, vertical AI policy  

**Decision:** EXTEND with appendices in M8-AI planning docs. Do not modify approved M1 document — add the M8-AI layer on top.

---

## What Is Partial (needs expansion, not replacement)

### `packages/payments/src/subscription-sync.ts`
Billing pattern exists for subscription sync. Pattern (insert billing_history → update subscription) must be REUSED for AI credit pack purchase. Does not need modification — just a new caller.

### `apps/api/src/middleware/rate-limit.ts`
KV-based rate limiter exists. Parameters (`keyPrefix`, `maxRequests`, `windowSeconds`) are generic. AI rate limits are a new caller, not a new middleware. Just configure it for AI endpoints.

### `apps/api/src/env.ts`
Env var pattern exists. AI API keys follow the same pattern. Just add `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY`, `AI_DEFAULT_PROVIDER`, `AI_FALLBACK_PROVIDER` — same JSDoc pattern.

---

## What Must Be Created (critical path — M8a-AI)

### Priority 0 — SuperAgent Blockers (added 2026-04-13)

- **`packages/superagent/`** — Vertical-facing SDK contract. Verticals call this, not `packages/ai-abstraction` directly. No implementation exists. P0.
- **`packages/wc-wallet/`** — WakaCreditUnit wallet service (balance query, debit, top-up). No implementation exists. P0.
- **SuperAgent key issuance and lifecycle management** — `superagent_keys` D1 table, auto-issue on workspace AI enable, key rotation. No implementation exists. P0.
- **WakaCU credit wallet (user-level + workspace-level + partner pool)** — `wc_wallets`, `wc_transactions`, `partner_credit_pools`, `partner_tenant_allocations` D1 tables + wallet service. No implementation exists. P0.

### Priority 1 — Blockers (nothing else works without these)

1. **AI env vars** — Add to `apps/api/src/env.ts`
   - `OPENAI_API_KEY?: string`
   - `ANTHROPIC_API_KEY?: string`  
   - `GOOGLE_AI_API_KEY?: string`
   - `AI_DEFAULT_PROVIDER?: string`
   - `AI_FALLBACK_PROVIDER?: string`
   - `AI_KEY_VAULT_KV` binding (KV namespace for BYOK keys)

2. **D1 migration: `0037_ai_provider_keys.sql`**
   - `ai_provider_keys` table — stores workspace/user BYOK keys (encrypted)
   - Columns: `id`, `tenant_id`, `workspace_id`, `user_id` (nullable for workspace-level), `provider`, `key_hash`, `key_encrypted`, `capabilities[]`, `is_active`, `created_at`

3. **D1 migration: `0038_ai_usage_logs.sql`**
   - `ai_usage_logs` table — usage metering + audit
   - Columns: `id`, `tenant_id`, `workspace_id`, `user_id`, `capability`, `provider`, `model`, `tokens_in`, `tokens_out`, `credits_consumed`, `latency_ms`, `status`, `vertical_slug`, `created_at`

4. **`packages/ai-abstraction/` expansion** — Add capability type contracts:
   - `AICapabilityType` enum (text, embed, image, audio_in, audio_out, video, moderation, agentic)
   - `EmbedRequest`/`EmbedResponse`
   - `TranscribeRequest`/`TranscribeResponse`
   - `TTSRequest`/`TTSResponse`
   - `ImageGenRequest`/`ImageGenResponse`
   - `AIUsageRecord` — metering type
   - `AIAdapter` expansion (add `embed()`, `transcribe?()`, `tts?()`, `imageGen?()`)

5. **Provider routing engine** — `packages/ai-abstraction/src/router.ts`
   - `resolveAdapter(ctx: AIRoutingContext): AIAdapter` — implements the 5-level chain
   - Uses D1 `ai_provider_keys` for BYOK lookups
   - Uses KV for health-check cache

### Priority 2 — Core Features (after blockers)

6. **Adapter implementations** — `packages/ai-adapters/`
   - `packages/ai-adapters/src/openai-compat.ts` — OpenAI-compatible adapter (handles OpenAI, OpenRouter, Together, Groq and all OpenAI-compatible endpoints; renamed from `openai.ts` per ADL-010)
   - `packages/ai-adapters/src/edenai.ts` — Eden AI adapter (TTS, STT, translation, vision; multimodal platform capabilities)
   - `packages/ai-adapters/src/anthropic.ts` — Anthropic adapter
   - `packages/ai-adapters/src/google.ts` — Google AI adapter

7. **D1 migration: `0039_ai_credits.sql`**
   - `ai_credit_balances` table — workspace credit balance
   - `ai_credit_transactions` table — debit/credit history

8. **Plan-config expansion** — Add `aiCapabilities: AICapabilitySet` to `PlanConfig`

9. **API routes** — `apps/api/src/routes/ai.ts`
   - `POST /ai/complete` — text generation
   - `POST /ai/embed` — embeddings
   - `GET /ai/usage` — usage summary
   - `GET /ai/credits` — credit balance
   - `POST /ai/keys` — register BYOK key (workspace admin)
   - `DELETE /ai/keys/:id` — revoke BYOK key

10. **Super-admin routes** — `apps/api/src/routes/admin-ai.ts`
    - `GET /admin/ai/providers` — provider health status
    - `POST /admin/ai/providers/:id/disable` — emergency disable
    - `GET /admin/ai/usage` — platform-wide AI usage
    - `PATCH /admin/ai/policy` — update global AI policy

### Priority 3 — Vertical Integration (after core features)

11. **Vertical AI integration hooks** — Per-vertical `ai-config.ts` using `vertical-ai-research-template.md`
12. **HITL approval workflow** — `packages/ai-abstraction/src/hitl.ts`
13. **Agent autonomy contracts** — `packages/ai-abstraction/src/autonomy.ts`

---

## What Can Wait (M9+)

- Video generation (infrastructure exists; provider support limited)
- AI-powered USSD responses (architecturally excluded by 140-char constraint; needs dedicated design)
- AI model fine-tuning per vertical (M11+)
- AI-powered KYC document OCR (M9 — after basic AI foundation stable)
- Autonomous agents with write permissions (M10+ — HITL must be stable first)
