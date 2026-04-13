# M8-AI Phase 0: Exhaustive Repository Audit

**Status:** Complete  
**Date:** 2026-04-08  
**Scope:** All packages, apps, docs, migrations, routes, tests, configs  
**Audit method:** grep-based search across AI, billing, entitlement, provider, voice, media, agent, automation keyword families  

---

## 1. Existing AI Surfaces (CONFIRMED — with file paths)

### 1.1 `packages/ai-abstraction/` (`@webwaka/ai`)

**Files:**
- `packages/ai-abstraction/src/types.ts` — Full type contract (M3)
- `packages/ai-abstraction/src/index.ts` — Re-exports all types
- `packages/ai-abstraction/package.json` — Package name: `@webwaka/ai`, v0.1.0

**What exists:**
```typescript
// packages/ai-abstraction/src/types.ts
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'byok';
// Note (2026-04-13): M8a-AI-1 expansion adds 15 values — see ADL-009, ADL-010.
// Current M3 state: 4 values. Aggregator providers (openrouter, together, groq, edenai)
// and Chinese providers (deepseek, qwen, etc.) will be added in M8a-AI-1.

export interface AIProviderConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;      // NEVER hardcoded — from BYOK config or platform secret
  baseUrl?: string;    // For BYOK or self-hosted
}

export interface AIMessage { role: 'system' | 'user' | 'assistant'; content: string; }
export interface AIRequest { messages: AIMessage[]; maxTokens?: number; temperature?: number; stream?: boolean; }
export interface AIResponse { content: string; provider: AIProvider; model: string; tokensUsed: number; finishReason: 'stop' | 'length' | 'error'; }

export interface AIAdapter {
  complete(request: AIRequest): Promise<AIResponse>;
  stream?(request: AIRequest): AsyncIterable<string>;
}
```

**What is MISSING from this package:**
- No `embed()` method in `AIAdapter` (TDR-0009 specifies it: `embed(text: string, options: AIOptions): Promise<number[]>`)
- No `moderateContent()`, `transcribeAudio()`, `generateImage()`, `generateVideo()` type contracts
- No `AIUsageRecord` type for metering
- No runtime adapter implementations — comment says "Milestone 5+"
- No provider health-check interface
- No capability-check interface (e.g., `supportsVision()`, `supportsStreaming()`)

### 1.2 `docs/governance/ai-policy.md` (M1 Governance Baseline)

Core policy principles established:
1. No single-provider lock-in
2. Provider abstraction layer mandatory
3. BYOK support where permitted
4. Controlled governance (prompts/outputs subject to platform rules)
5. Auditable AI usage (logged and attributable)
6. Entitlement-governed features (plan-aware and module-aware)

**Implementation rules** (5 rules, all binding):
1. AI providers accessed through platform abstraction layer only
2. BYOK must not weaken tenancy or security — key isolation mandatory
3. AI rights are plan-aware and module-aware
4. Sensitive workflows (legal, political, medical, financial) require human-in-the-loop
5. AI usage logs must be retained for audit and compliance

**Gap:** These rules are policies only — no enforcement code exists yet.

### 1.3 `docs/architecture/decisions/0009-ai-provider-abstraction.md` (TDR-0009)

Decision accepted, founder approved 2026-04-07.

Key decisions:
- No app or package may call AI provider API directly
- All AI calls route through `packages/ai` (provider-neutral interface)
- Provider resolution order: **Tenant BYOK → Platform default → Fallback**
- Provider-specific features (function calling, vision) exposed as optional capability checks

**M7 Extension of TDR-0009:** The provider-abstraction pattern was extended to:
- Payments (`packages/payments` — Paystack primary, Flutterwave failover)
- OTP (`packages/otp` — Termii primary, Africa's Talking failover, WhatsApp optional)
- Identity (`packages/identity` — Prembly primary, Paystack Identity secondary)

This is the architectural blueprint to follow for AI provider expansion.

### 1.4 Entitlements — AI Rights (`packages/entitlements/`)

**`packages/entitlements/src/plan-config.ts`** — Plan capability matrix:

| Plan | `aiRights` |
|---|---|
| `free` | `false` |
| `starter` | `false` |
| `growth` | `true` |
| `pro` | `true` |
| `enterprise` | `true` |
| `partner` | `true` |
| `sub_partner` | `true` |

**`packages/entitlements/src/guards.ts`** — `requireAIAccess(ctx: EntitlementContext): void` exists and throws `EntitlementError` if plan lacks `aiRights`.

**`packages/types/src/subscription.ts`** — `EntitlementDimensions.aiRights: boolean` defined in the entitlement dimensions interface.

**Gap:** `aiRights` is a single binary flag. No granular AI capability control exists (text vs image vs voice vs video vs agents — all governed by the same boolean).

### 1.5 Rate Limiting (`apps/api/src/middleware/rate-limit.ts`)

KV-backed sliding-window rate limiter exists (M7a):
```typescript
export function rateLimitMiddleware(opts: { keyPrefix: string; maxRequests: number; windowSeconds: number })
```
Currently wired for:
- Identity verification: 2/hour (R5)
- OTP sends: 5/hour (R9)

**Gap:** No AI-specific rate limiting middleware exists.

### 1.6 Agent Infrastructure (`infra/db/migrations/0022_agents.sql`)

Field agent registry table exists:
```sql
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  individual_id TEXT REFERENCES individuals(id),
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'suspended', 'decommissioned')),
  kyc_tier INTEGER DEFAULT 0,
  ...
);
```

**Note:** These are **POS field agents** (human agents operating terminals), NOT AI agents. The naming is a collision risk to manage.

### 1.7 Payments / Billing Infrastructure (`packages/payments/`)

**`packages/payments/src/types.ts`:**
- `BillingRecord` interface — tracks payment history per workspace
- Plan threshold detection in `subscription-sync.ts` (amount kobo → plan name)

**`packages/payments/src/subscription-sync.ts`:**
- `syncPaymentToSubscription()` — updates workspace plan after Paystack success
- Plan thresholds: Starter ₦5,000, Growth ₦20,000, Enterprise ₦100,000

**Gap:** No AI credit pack billing exists. No AI usage billing separate from subscription. No metering table in any migration.

### 1.8 Env Variables (`apps/api/src/env.ts`)

AI-relevant env vars currently defined:
- `TELEGRAM_BOT_TOKEN` — Telegram OTP (not AI)
- `LOG_PII_SALT` — PII hashing (not AI)
- `DM_MASTER_KEY` — DM encryption (not AI)
- `WHATSAPP_PROVIDER` — OTP channel selector (not AI)
- `DIALOG360_API_KEY` — 360dialog WA API (not AI)

**Missing AI env vars:**
// Note (2026-04-13, ADL-009 + ADL-010): OPENAI_API_KEY_1/2, ANTHROPIC_API_KEY_1, GOOGLE_AI_API_KEY_1
// are NOT platform keys — they are user/workspace BYOK only. Platform keys are aggregator keys:
// OPENROUTER_API_KEY_1/2, TOGETHER_API_KEY_1, GROQ_API_KEY_1, EDEN_AI_KEY_1.
// Additionally: SA_KEY_KV (KV namespace), SA_KEY_ENCRYPTION_KEY (AES-GCM secret for SuperAgent keys).
// ADL-009 added: OPENROUTER_API_KEY_1, DEEPSEEK_API_KEY_1, QWEN_API_KEY_1, GROQ_API_KEY_1, MINIMAX_API_KEY_1.
// ADL-010 adds: EDEN_AI_KEY_1, SA_KEY_KV, SA_KEY_ENCRYPTION_KEY.
- `OPENROUTER_API_KEY_1` (primary platform aggregator key — ADL-010)
- `ANTHROPIC_API_KEY` (platform key)
- `GOOGLE_AI_API_KEY` (platform key)
- `AI_DEFAULT_PROVIDER` (routing)
- `AI_FALLBACK_PROVIDER` (failover)
- `AI_KV_NAMESPACE` (BYOK key vault prefix)

### 1.9 USSD Gateway (`apps/ussd-gateway/src/index.ts`)

USSD gateway exists. Relevant because:
- AI responses must be USSD-safe (140 char chunks) for low-data users
- AI text generation cannot be used on USSD paths — constraint to document

### 1.10 Platform Invariants Directly Governing AI

From `docs/governance/platform-invariants.md`:
- **P7 — Vendor Neutral AI**: All AI through abstraction layer. No direct provider SDK calls.
- **P8 — BYOK Capable**: Every AI-consuming feature supports tenant-supplied API keys.
- **T3 — Tenant Isolation**: AI usage logs and BYOK keys must be tenant-scoped.
- **T5 — Subscription-Gated Features**: AI features gated via `@webwaka/entitlements`.

From `docs/governance/security-baseline.md`:
- **R5 — Rate Limiting**: All public endpoints must have rate limiting — extends to AI.
- **Audit Logging**: All destructive/financial operations must emit audit logs — AI generations qualify.

---

## 2. Indirect AI Surfaces (Adjacent, Not Yet AI-Connected)

| Surface | Location | AI Opportunity |
|---|---|---|
| Community content creation | `packages/community/` | AI-assisted post/course draft |
| Social posts/stories | `packages/social/` | AI caption, hashtag, translation |
| Contact service | `packages/contact/` | AI-powered support chat routing |
| Offerings (products/services) | `packages/offerings/` | AI product description generation |
| Search indexing | `packages/search-indexing/` | AI embedding-based semantic search |
| Discovery routes | `apps/api/src/routes/discovery.ts` | AI-powered ranking/recommendations |
| Workspaces analytics | `apps/api/src/routes/workspaces.ts` | AI insights on workspace metrics |
| Identity verification | `packages/identity/` | AI-assisted document OCR |
| OTP channel routing | `packages/otp/` | AI channel selection optimization |
| POS float ledger | `packages/pos/` | AI anomaly detection on float balances |

---

## 3. Missing AI Infrastructure (Not Partial — Completely Absent)

| Missing | Required By |
|---|---|
| Runtime AI adapter implementations | TDR-0009 "Milestone 5+" |
| Multi-provider routing engine | P7, TDR-0009 |
| Multiple keys per provider | P8, M8-AI brief |
| BYOK key vault (D1/KV storage) | P8 |
| AI usage metering (`ai_usage_logs` table) | ai-policy.md rule 5 |
| AI credit/quota system | M8-AI brief |
| AI provider health checks | TDR-0009 |
| Granular AI capability flags (per-capability, not binary) | M8-AI brief |
| Voice/TTS/STT type contracts | M8-AI brief |
| Image/video generation type contracts | M8-AI brief |
| Embeddings adapter | TDR-0009 |
| Super-admin AI control panel routes | M8-AI brief |
| Workspace-level AI settings API | M8-AI brief |
| AI-specific rate limiting | R5 + M8-AI brief |
| AI audit log table (`ai_audit_logs`) | ai-policy.md rule 5 |
| BYOK key encryption at rest | P8 |
| Autonomous agent type contracts | M8-AI brief |
| Human-in-the-loop approval workflow | ai-policy.md rule 4 |
| AI env vars in `env.ts` | Implementation prerequisite |

---

## 4. Dependency Map (What M8-AI Builds On)

```
M8-AI Foundation depends on:
├── packages/ai-abstraction/     ← EXPAND (add capability types, metering)
├── packages/entitlements/       ← EXPAND (add granular AI caps to plan-config)
├── packages/payments/           ← REUSE (billing patterns for AI credits)
├── apps/api/src/middleware/     ← EXPAND (add AI rate-limit middleware)
├── infra/db/migrations/         ← ADD (0037 ai_provider_keys, 0038 ai_usage_logs)
└── apps/api/src/env.ts          ← EXPAND (add AI provider API keys)
```

---

## 5. Compliance and Risk Findings

| Risk | Evidence | Mitigation Required |
|---|---|---|
| NDPR — AI processing of personal data | ai-policy.md rule 3, consent_records table | AI features must check consent before processing PII |
| CBN — AI in financial workflows | entitlement-model.md KYC tiers | AI financial advice must be KYC-gated T2+ |
| NCC — AI in voice/USSD | USSD gateway exists | AI voice/STT restricted to non-USSD paths |
| NITDA — Data residency | security-baseline.md | AI providers must offer Nigeria/Africa data processing |
| Sensitive sectors (medical, political, legal) | ai-policy.md rule 4, entitlement-model.md sensitiveSectorRights | HITL required; sensitiveSectorRights must gate these AI modes |
