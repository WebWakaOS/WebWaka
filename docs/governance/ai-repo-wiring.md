# AI Repo Wiring Plan

**Status:** M8-AI Planning Baseline  
**Date:** 2026-04-08  
**Purpose:** Every package, app, route, config, migration, and test that must be created or expanded for the AI platform

> **3-in-1 Position:** AI is a cross-cutting intelligence layer that enhances all three pillars (Pillar 1 — Operations-Management, Pillar 2 — Branding, Pillar 3 — Marketplace). It is NOT a fourth pillar. All AI features must be accessed through the `@webwaka/ai-abstraction` and `@webwaka/ai-adapters` packages. See `docs/governance/3in1-platform-architecture.md` for authoritative pillar assignments.

---

## Packages to Create

### `packages/ai-adapters/` (NEW — `@webwaka/ai-adapters`)

Provider adapter implementations. Two adapter classes serve the entire provider ecosystem. Depends on `@webwaka/ai` (existing).

```
packages/ai-adapters/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .eslintrc.json
└── src/
    ├── openai-compat.ts    OpenAI-compatible adapter — serves: OpenAI, OpenRouter, Groq,
    │                       Together AI, Fireworks, Portkey, AI/ML API, DeepSeek, Qwen
    │                       (Alibaba), Zhipu (GLM), Moonshot (Kimi), MiniMax, Yi (01.AI),
    │                       and any future provider using OAI-compatible format.
    │                       Constructor accepts { baseUrl, apiKey, defaultModel,
    │                       capabilities[], extraHeaders? }
    ├── openai-compat.test.ts  ≥10 tests: each capability; baseUrl override; OpenRouter
    │                          model string format; Groq path; 429/5xx fallover; Qwen baseUrl
    ├── anthropic.ts        Anthropic-native adapter (Claude only — /v1/messages format)
    ├── anthropic.test.ts   ≥5 tests
    ├── google.ts           Google-native adapter (Gemini REST, Imagen, Chirp, Cloud TTS, Veo)
    ├── google.test.ts      ≥5 tests
    └── index.ts
```

**Why one adapter serves all OpenAI-compatible providers:**
All of the following use `POST {baseUrl}/v1/chat/completions` with identical request/response JSON:
- Aggregators: OpenRouter, Portkey, Together AI, Groq, Fireworks, AI/ML API
- Chinese providers: DeepSeek, Qwen (DashScope), Zhipu AI, Moonshot AI, MiniMax, Yi/01.AI
- Open-source hosts: Ollama (self-hosted future), vLLM, LocalAI

This means **zero adapter code change** is required to add any new OpenAI-compatible provider — only KV configuration and a key entry in `ai_provider_keys`.

**Dependencies:** `@webwaka/ai`, `typescript`, `vitest`  
**No runtime HTTP libraries** — Cloudflare Workers uses native `fetch()`

---

## Packages to Expand

### `packages/ai-abstraction/` (EXPAND — `@webwaka/ai`)

| File | Change |
|---|---|
| `src/types.ts` | Add `embed?()`, `transcribe?()`, `tts?()`, `imageGen?()`, `supportsCapability()` to `AIAdapter`; add `AIUsageRecord` type |
| `src/capabilities.ts` | NEW — `AICapabilityType`, `AICapabilitySet`, all non-text request/response types |
| `src/router.ts` | NEW — `resolveAdapter()`, `AIRoutingContext`, 5-level resolution chain |
| `src/router.test.ts` | NEW — ≥10 tests (each resolution level, failover, quota exhaustion) |
| `src/autonomy.ts` | NEW — `AIWriteBoundary`, `AutoonomyLevel`, `AIAgentConfig` types |
| `src/billing.ts` | NEW — `deductCredits()`, `checkCreditBalance()`, `CREDIT_UNIT_RATES` map |
| `src/billing.test.ts` | NEW — ≥5 tests |
| `src/audit.ts` | NEW — `logAIUsage()` (fire-and-forget, ctx.waitUntil compatible) |
| `src/index.ts` | EXPAND — re-export new types |

### `packages/entitlements/` (EXPAND — `@webwaka/entitlements`)

| File | Change |
|---|---|
| `src/plan-config.ts` | Add `aiCapabilities: AICapabilitySet`, `monthlyFreeCU: number`, `byokAllowed: boolean` to `PlanConfig`; fill in values per plan |
| `src/evaluate.ts` | Add `evaluateAICapability(subscription, capability): EntitlementDecision` |
| `src/guards.ts` | Add `requireAICapability(ctx, capability): void` |
| `src/evaluate.test.ts` | ADD tests for `evaluateAICapability()` — ≥5 tests |
| `src/guards.test.ts` | ADD tests for `requireAICapability()` — ≥5 tests |

### `apps/api/src/env.ts` (EXPAND)

Add AI provider key bindings and KV namespace for BYOK vault + health cache.

---

## New Migrations

| Migration | Table(s) | Purpose |
|---|---|---|
| `0037_ai_provider_keys.sql` | `ai_provider_keys` | BYOK + platform key vault |
| `0038_ai_usage_logs.sql` | `ai_usage_logs` | Metering + audit (append-only) |
| `0039_ai_credits.sql` | `ai_credit_balances`, `ai_credit_transactions` | Credit system |
| `0040_ai_hitl.sql` | `ai_hitl_events` | Human-in-the-loop queue |
| `0041_workspace_ai_settings.sql` | `workspace_ai_settings` | Per-workspace AI config |

Full SQL schemas in `docs/governance/ai-billing-and-entitlements.md` and `docs/implementation/m8-ai-phase-plan.md`.

---

## New API Routes

### `apps/api/src/routes/ai.ts` (NEW)

| Method | Route | Auth | Entitlement | Description |
|---|---|---|---|---|
| POST | `/ai/complete` | JWT | `requireAICapability(ctx, 'text')` | Text generation |
| POST | `/ai/embed` | JWT | `requireAICapability(ctx, 'embed')` | Embeddings |
| POST | `/ai/transcribe` | JWT | `requireAICapability(ctx, 'stt')` | Speech-to-text |
| POST | `/ai/tts` | JWT | `requireAICapability(ctx, 'tts')` | Text-to-speech |
| POST | `/ai/image` | JWT | `requireAICapability(ctx, 'image_gen')` | Image generation |
| GET | `/ai/usage` | JWT | `requireAIAccess(ctx)` | Usage summary |
| GET | `/ai/credits` | JWT | `requireAIAccess(ctx)` | Credit balance |
| POST | `/ai/credits/topup` | JWT (admin) | `requireRole(admin)` | Initiate credit purchase |
| POST | `/ai/keys` | JWT (admin) | `requireRole(admin)` | Register BYOK key |
| GET | `/ai/keys` | JWT (admin) | `requireRole(admin)` | List keys (masked) |
| DELETE | `/ai/keys/:id` | JWT | Owns key | Revoke BYOK key |

### `apps/api/src/routes/admin-ai.ts` (NEW)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/admin/ai/providers` | super_admin | Provider health status |
| POST | `/admin/ai/providers/:id/disable` | super_admin | Emergency disable |
| GET | `/admin/ai/usage` | super_admin | Platform-wide usage |
| PATCH | `/admin/ai/policy` | super_admin | Update global AI policy |
| POST | `/admin/ai/credits/grant` | super_admin | Emergency CU grant |
| GET | `/admin/ai/hitl` | super_admin | HITL pending queue |
| POST | `/admin/ai/hitl/:id/approve` | super_admin | Approve HITL action |
| POST | `/admin/ai/hitl/:id/reject` | super_admin | Reject + rollback |

### `apps/api/src/routes/workspaces.ts` (EXPAND existing)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/workspaces/:id/ai` | JWT (admin) | Get AI settings |
| PATCH | `/workspaces/:id/ai` | JWT (admin) | Update AI settings |
| GET | `/workspaces/:id/ai/usage` | JWT (admin) | Workspace AI usage |

### `apps/api/src/index.ts` (EXPAND)

Wire `ai.ts` and `admin-ai.ts` routes. Apply AI-specific rate limiting middleware.

---

## Admin Control Surfaces

### `apps/admin-dashboard/` (EXPAND — super-admin UI stubs)

- Super-admin AI dashboard: provider health, platform-wide usage, policy controls
- Route: `GET /admin/ai` — rendered server-side or via API calls to admin-ai routes

### `apps/platform-admin/` (EXPAND — workspace admin UI stubs)

- Workspace AI settings panel
- BYOK key management
- Credit balance and top-up

---

## Logs and Audit Tables

| Table | Migration | Retention | Notes |
|---|---|---|---|
| `ai_usage_logs` | 0038 | 2 years (NDPR) | Append-only, fire-and-forget write |
| `ai_credit_transactions` | 0039 | 7 years (financial) | Append-only |
| `ai_hitl_events` | 0040 | 2 years | Append-only, status updated |
| `ai_provider_keys` | 0037 | Soft-delete only | `is_active = 0` instead of DELETE |

---

## Tests and Mocks

| Package/App | New Test File | Min Tests | Test Focus |
|---|---|---|---|
| `packages/ai-adapters` | `openai.test.ts` | 8 | HTTP mock, each capability, 429 handling |
| `packages/ai-adapters` | `anthropic.test.ts` | 5 | Text, vision, 401 handling |
| `packages/ai-adapters` | `google.test.ts` | 3 | Stub behavior |
| `packages/ai-abstraction` | `router.test.ts` | 10 | 5-level resolution, failover, quota |
| `packages/ai-abstraction` | `billing.test.ts` | 5 | CU calculation, credit deduction, atomic |
| `packages/entitlements` | `evaluate.test.ts` (expand) | +5 | `evaluateAICapability()` |
| `packages/entitlements` | `guards.test.ts` (expand) | +5 | `requireAICapability()` |
| `apps/api` | `ai.test.ts` | 15 | Route auth, entitlement, rate limit, credit deduction, BYOK |
| `apps/api` | `admin-ai.test.ts` | 10 | Admin routes, HITL, policy |
| **Total new tests** | | **≥66** | All M8a-AI deliverables covered |

**Test approach** (consistent with M7 pattern):
- Mock D1 with in-memory `prepare().bind().first/all/run()` pattern (D1Like)
- Mock AI provider HTTP with `vi.fn()` intercepting `fetch`
- Never call live AI providers in unit tests
- Integration tests (wrangler) deferred to staging hardening (M10)

---

## Wrangler Configuration Changes (`wrangler.toml`)

Add to API worker:
```toml
[[kv_namespaces]]
binding = "AI_KEY_VAULT_KV"
id = "[staging KV namespace id]"
preview_id = "[preview KV namespace id]"

[vars]
AI_DEFAULT_PROVIDER = "openai"
AI_FALLBACK_PROVIDER = "anthropic"

# Secrets (set via: wrangler secret put OPENAI_API_KEY_1)
# OPENAI_API_KEY_1
# OPENAI_API_KEY_2
# ANTHROPIC_API_KEY_1
# GOOGLE_AI_API_KEY_1
# AI_ENCRYPTION_KEY
```

---

## Platform Invariant Compliance Checklist

| Invariant | How M8-AI Complies |
|---|---|
| P1 — Build Once Use Infinitely | All AI routes through shared `resolveAdapter()` + `deductCredits()` + `logAIUsage()` |
| P7 — Vendor Neutral AI | `packages/ai-adapters/` isolated; no provider SDK in business code |
| P8 — BYOK Capable | `ai_provider_keys` table + 5-level resolution chain |
| T1 — Cloudflare-First | `fetch()` only; no Node.js HTTP client |
| T2 — TypeScript-First | Strict mode; all AI types in `@webwaka/ai` |
| T3 — Tenant Isolation | Every `ai_usage_logs`, `ai_provider_keys`, `ai_credit_balances` row has `tenant_id` |
| T5 — Subscription-Gated | `requireAICapability()` on every route |
| R5 — Rate Limiting | AI-specific rate limits in `apps/api/src/middleware/rate-limit.ts` |
| Audit Logging | `ai_usage_logs` + `ai_credit_transactions` + `ai_hitl_events` append-only |
