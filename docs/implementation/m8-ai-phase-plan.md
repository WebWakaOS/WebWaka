# M8-AI Implementation Phase Plan

**Status:** SUPERSEDED FOR ORDERING BY `docs/governance/superagent/04-execution-roadmap.md`. This document remains as Phase 1 technical detail reference.  
**Date:** 2026-04-08 (updated 2026-04-13 for SuperAgent alignment)  
**Constraint:** DO NOT IMPLEMENT FEATURE CODE YET — this is the plan for when implementation begins  
**Design principle:** Platform foundation first; vertical AI features parallel after foundation complete

---

## Dependency Order

```
M8a-AI-0 (Audit + Docs) ← COMPLETE (this document)
    ↓
M8a-AI-1 (Type Expansion + Migrations + Env)
    ↓
M8a-AI-2 (Provider Adapters + Router)
    ↓
M8a-AI-3 (API Routes + Credit Deduction + BYOK Registration)
    ↓
M8a-AI-4 (Super-Admin Controls + HITL Infrastructure + Workspace Settings)
    ↓
[M8b-AI ‖ M8c-AI ‖ M8d-AI ‖ M8e-AI] ← PARALLEL after M8a-AI-4
    ↓
M9-AI (Advanced: agents, background workflows, agentic write boundaries)
```

---

## M8a-AI-1: Type Expansion + Migrations + Env (Days 1–2)

**Goal:** All infrastructure types, database tables, and environment bindings in place. No runtime code yet.

**Files to create/expand:**

### `packages/ai-abstraction/src/capabilities.ts` (NEW)
```typescript
export type AICapabilityType =
  | 'text'
  | 'summarize'
  | 'classify'
  | 'embed'
  | 'stt'           // speech-to-text
  | 'tts'           // text-to-speech
  | 'image_gen'
  | 'image_understand'
  | 'video_gen'
  | 'video_understand'
  | 'research'
  | 'agentic'
  | 'moderation';

export type AICapabilitySet = ReadonlyArray<AICapabilityType>;

export interface EmbedRequest { texts: string[]; model?: string; }
export interface EmbedResponse { embeddings: number[][]; model: string; tokensUsed: number; }

export interface TranscribeRequest { audioBase64: string; mimeType: string; language?: string; }
export interface TranscribeResponse { transcript: string; confidence: number; durationSeconds: number; }

export interface TTSRequest { text: string; voice?: string; speed?: number; }
export interface TTSResponse { audioBase64: string; mimeType: string; durationSeconds: number; }

export interface ImageGenRequest { prompt: string; size?: '256x256' | '512x512' | '1024x1024'; quality?: 'standard' | 'hd'; }
export interface ImageGenResponse { imageBase64: string; mimeType: string; revisedPrompt?: string; }

export interface AIUsageRecord {
  capability: AICapabilityType;
  provider: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  creditsConsumed: number;
  latencyMs: number;
  fundedBy: 'trial' | 'subscription' | 'credit_pack' | 'user_byok' | 'workspace_byok' | 'admin_grant';
}
```

### `packages/ai-abstraction/src/types.ts` (EXPAND — do not break existing types)

Expand `AIProvider` union type to include aggregators and Chinese providers (all OpenAI-compatible):
```typescript
export type AIProvider =
  // First-party
  | 'openai' | 'anthropic' | 'google'
  // Aggregators
  | 'openrouter' | 'portkey' | 'together' | 'groq' | 'fireworks' | 'aimlapi'
  // Chinese providers
  | 'deepseek' | 'qwen' | 'zhipu' | 'moonshot' | 'minimax' | 'yi'
  // Custom BYOK endpoint
  | 'byok_custom';
```

Add to `AIAdapter` interface:
```typescript
embed?(request: EmbedRequest): Promise<EmbedResponse>;
transcribe?(request: TranscribeRequest): Promise<TranscribeResponse>;
tts?(request: TTSRequest): Promise<TTSResponse>;
imageGen?(request: ImageGenRequest): Promise<ImageGenResponse>;
supportsCapability(capability: AICapabilityType): boolean;
```

### `packages/entitlements/src/plan-config.ts` (EXPAND)
Add to `PlanConfig`:
```typescript
aiCapabilities: AICapabilitySet;
monthlyFreeCU: number;
byokAllowed: boolean;
```

Update each plan entry with appropriate `aiCapabilities` arrays and `monthlyFreeCU` values.

### `apps/api/src/env.ts` (EXPAND)
Add:
```typescript
// First-party provider keys
OPENAI_API_KEY_1?: string;
OPENAI_API_KEY_2?: string;
ANTHROPIC_API_KEY_1?: string;
GOOGLE_AI_API_KEY_1?: string;

// Aggregator keys (one key = access to all upstream providers)
OPENROUTER_API_KEY_1?: string;   // recommended platform-level aggregator + fallback
GROQ_API_KEY_1?: string;         // latency-critical paths (whisper-large-v3, Llama)

// Chinese provider keys (cost tier + multilingual tier)
DEEPSEEK_API_KEY_1?: string;     // default cost-tier text generation
QWEN_API_KEY_1?: string;         // default multilingual-tier text generation
MINIMAX_API_KEY_1?: string;      // TTS (speech-01-turbo) for voice-forward verticals

// Routing configuration
AI_DEFAULT_PROVIDER?: string;    // 'deepseek' for cost, 'openai' for best
AI_FALLBACK_PROVIDER?: string;   // 'openrouter' recommended — single key covers all
AI_KEY_VAULT_KV: KVNamespace;   // KV binding for health check cache + BYOK key metadata
AI_ENCRYPTION_KEY?: string;      // AES-GCM key for BYOK key encryption at rest
```

Not all keys are required at launch. Minimum viable set: `OPENAI_API_KEY_1` + `OPENROUTER_API_KEY_1` (platform-level fallback). DeepSeek and Qwen keys are added once cost-tier routing is activated.

### Migrations (NEW)
- `infra/db/migrations/0037_ai_provider_keys.sql` — BYOK key vault
- `infra/db/migrations/0038_ai_usage_logs.sql` — metering + audit
- `infra/db/migrations/0039_ai_credits.sql` — credit balances + transactions

**Tests required:** TypeScript compilation only (no runtime at this phase). `pnpm -r typecheck` must pass.

---

## M8a-AI-2: Provider Adapters + Routing Engine (Days 3–5)

**Goal:** Working adapter implementations for OpenAI + Anthropic. Google adapter scaffolded. Routing engine resolves correct adapter per request.

### `packages/ai-adapters/` (NEW PACKAGE)

Architecture: **two adapter classes serve all providers**. The OpenAI-compatible adapter handles the majority of the provider ecosystem.

```
packages/ai-adapters/
├── package.json              (@webwaka/ai-adapters)
├── tsconfig.json
├── vitest.config.ts
└── src/
    ├── openai-compat.ts      OpenAI-compatible adapter (serves: OpenAI, OpenRouter, Groq,
    │                         Together, Fireworks, Portkey, AI/ML API, DeepSeek, Qwen,
    │                         Zhipu, Moonshot, MiniMax, Yi, and any future OAI-compat provider)
    ├── openai-compat.test.ts ≥10 tests (mocked HTTP for each capability; baseUrl override;
    │                         aggregator model string format; failover on 429/5xx)
    ├── anthropic.ts          Anthropic-native adapter (Claude only)
    ├── anthropic.test.ts     ≥5 tests
    ├── google.ts             Google-native adapter (Gemini, Imagen, Chirp, TTS, Veo)
    ├── google.test.ts        ≥5 tests
    └── index.ts
```

**OpenAI-compatible adapter (`openai-compat.ts`) must implement:**
- `complete()` — any model at configured `baseUrl/v1/chat/completions`
- `stream()` — streaming SSE
- `embed()` — `baseUrl/v1/embeddings` (where provider supports it; `supportsCapability('embed')` returns false for Groq, DeepSeek)
- `transcribe()` — `baseUrl/v1/audio/transcriptions` (OpenAI, Groq whisper-large-v3)
- `tts()` — `baseUrl/v1/audio/speech` (OpenAI, MiniMax speech-01-turbo)
- `imageGen()` — `baseUrl/v1/images/generations` (OpenAI, OpenRouter via Flux models)
- `supportsCapability(capability)` — determined by `AIProviderConfig.capabilities[]` field (stored in D1 or set at construction time)

**Key constructor signature:**
```typescript
new OpenAICompatAdapter(config: {
  apiKey: string;
  baseUrl: string;           // e.g. 'https://openrouter.ai/api/v1'
  defaultModel: string;      // e.g. 'deepseek/deepseek-chat' for OpenRouter, 'deepseek-chat' for DeepSeek direct
  capabilities: AICapabilityType[];
  extraHeaders?: Record<string, string>;  // e.g. OpenRouter requires 'HTTP-Referer' header
})
```

**Provider-specific constructor examples (no code change needed — only config):**
```typescript
// OpenRouter (aggregator — recommended workspace BYOK)
new OpenAICompatAdapter({ baseUrl: 'https://openrouter.ai/api/v1', defaultModel: 'deepseek/deepseek-chat', extraHeaders: { 'HTTP-Referer': 'https://webwaka.com' } })

// DeepSeek (direct — cheapest cost tier)
new OpenAICompatAdapter({ baseUrl: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat' })

// Qwen (multilingual tier — best African language coverage)
new OpenAICompatAdapter({ baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', defaultModel: 'qwen-max' })

// Groq (latency-critical paths)
new OpenAICompatAdapter({ baseUrl: 'https://api.groq.com/openai/v1', defaultModel: 'llama-3.3-70b-versatile' })

// Zhipu GLM-4-Flash (cheap classification)
new OpenAICompatAdapter({ baseUrl: 'https://open.bigmodel.cn/api/paas/v4', defaultModel: 'glm-4-flash' })

// Moonshot Kimi (long-context document analysis)
new OpenAICompatAdapter({ baseUrl: 'https://api.moonshot.cn/v1', defaultModel: 'moonshot-v1-128k' })
```

**Anthropic adapter must implement:**
- `complete()` — claude-3-5-sonnet / claude-3-haiku (calls `/v1/messages` — NOT OAI-compatible)
- `stream()` — streaming
- `supportsCapability()` — text + vision only

**Google adapter must implement:**
- `complete()` — Gemini (calls Google AI REST API)
- `embed()` — text-embedding-004
- `transcribe()` — Chirp
- `tts()` — Cloud TTS (en-NG-Wavenet-A for Nigerian English)
- `imageGen()` — Imagen 3
- `supportsCapability()` — all capabilities except audio transcription for some models

### `packages/ai-abstraction/src/router.ts` (NEW)
```typescript
export async function resolveAdapter(
  ctx: AIRoutingContext,
  db: D1Like,
  kv: KVNamespace,
  env: Env,
): Promise<{ adapter: AIAdapter; fundedBy: FundedBy }>
```

Implements 5-level resolution chain. Uses `kv` for health check cache and provider order config. Uses `db` for BYOK lookups. Provider order for each tier loaded from `KV key: ai:provider:order:{capability}:{tier}`.

**Tests required:** ≥20 tests for adapter + router. Mock all HTTP calls with vitest. Include tests for:
- OpenRouter model string format (`provider/model-id`)
- DeepSeek direct vs via OpenRouter (same adapter, different baseUrl)
- Groq latency-path selection
- Qwen multilingual tier selection
- Chinese provider health-check TTL behavior (429 handling)

---

## M8a-AI-3: API Routes + Credit Deduction + BYOK Registration (Days 6–7)

**Goal:** Working AI API endpoints. Credits deducted. BYOK keys registerable.

### `apps/api/src/routes/ai.ts` (NEW)

```
POST   /ai/complete          Text generation (auth required, entitlement checked)
POST   /ai/embed             Embeddings (Pro+ only)
POST   /ai/transcribe        STT (Pro+ only)
POST   /ai/tts               TTS (Pro+ only)
POST   /ai/image             Image generation (Enterprise only)
GET    /ai/usage             Usage summary for workspace
GET    /ai/credits           Credit balance
POST   /ai/credits/topup     Initiate Paystack credit pack purchase
POST   /ai/keys              Register BYOK key
GET    /ai/keys              List registered keys (masked)
DELETE /ai/keys/:id          Revoke BYOK key
```

Every route must:
1. Validate JWT (existing `jwtAuthMiddleware`)
2. Check `requireAIAccess()` (existing guard)
3. Check `requireAICapability(ctx, capability)` (new guard)
4. Check credit balance or BYOK key availability
5. Resolve adapter via `resolveAdapter()`
6. Execute AI call
7. Write to `ai_usage_logs` via `ctx.waitUntil()` (non-blocking)
8. Deduct credits atomically (D1 transaction)
9. Return response

**Tests required:** ≥15 tests. Mock AI adapters — test entitlement logic, credit deduction, BYOK resolution.

---

## M8a-AI-4: Super-Admin Controls + HITL Infrastructure + Workspace Settings (Days 8–10)

**Goal:** Super-admin can control AI globally and per-capability. Workspace admins can configure their AI settings. HITL queue exists for sensitive workflows.

### `apps/api/src/routes/admin-ai.ts` (NEW)

```
GET    /admin/ai/providers              List provider health
POST   /admin/ai/providers/:id/disable  Emergency disable provider
GET    /admin/ai/usage                  Platform-wide AI usage aggregate
GET    /admin/ai/credits                Platform credit revenue summary
PATCH  /admin/ai/policy                 Update global AI policy (KV)
POST   /admin/ai/credits/grant          Emergency CU grant to workspace
GET    /admin/ai/hitl                   HITL queue (pending approvals)
POST   /admin/ai/hitl/:id/approve       Approve HITL action
POST   /admin/ai/hitl/:id/reject        Reject + rollback HITL action
```

### `apps/api/src/routes/workspaces.ts` (EXPAND)

```
GET    /workspaces/:id/ai               Get workspace AI settings
PATCH  /workspaces/:id/ai               Update workspace AI settings
GET    /workspaces/:id/ai/usage         Workspace AI usage report
```

### D1 migration: `0040_ai_hitl.sql`
```sql
CREATE TABLE ai_hitl_events (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL,
  workspace_id    TEXT NOT NULL,
  user_id         TEXT,
  action_type     TEXT NOT NULL,
  action_payload  TEXT NOT NULL,   -- JSON
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired')),
  reviewer_id     TEXT,
  reviewed_at     INTEGER,
  expires_at      INTEGER NOT NULL,
  created_at      INTEGER DEFAULT (unixepoch())
);
```

### D1 migration: `0041_workspace_ai_settings.sql`
```sql
CREATE TABLE workspace_ai_settings (
  workspace_id          TEXT PRIMARY KEY REFERENCES workspaces(id),
  tenant_id             TEXT NOT NULL,
  ai_enabled            INTEGER NOT NULL DEFAULT 0,
  capabilities_enabled  TEXT NOT NULL DEFAULT '[]',  -- JSON AICapabilityType[]
  model_tier            TEXT NOT NULL DEFAULT 'cost' CHECK (model_tier IN ('cost','best')),
  user_byok_allowed     INTEGER NOT NULL DEFAULT 1,
  monthly_cu_cap        REAL,
  auto_topup_enabled    INTEGER NOT NULL DEFAULT 0,
  auto_topup_threshold  REAL,
  auto_topup_pack       TEXT,
  updated_at            INTEGER DEFAULT (unixepoch())
);
```

**Tests required:** ≥20 tests total for admin routes, HITL flow, workspace settings.

---

## M8b-AI through M8e-AI: Per-Vertical AI Configs (Parallel — after M8a-AI-4)

For each P1 vertical being implemented, BEFORE writing AI feature code:

1. Complete `docs/templates/vertical-ai-research-template.md` for that vertical
2. Create `packages/verticals-{slug}/src/ai-config.ts`:
```typescript
export const AI_CONFIG = {
  capabilitySet: ['text', 'summarize'] as AICapabilitySet,
  features: {
    'product_description': { autonomy: 1, hitl: false, writeBoundary: [] },
    'sales_summary': { autonomy: 0, hitl: false, writeBoundary: [] },
  },
  sensitiveSector: false,
  minimumPlan: 'growth',
} as const;
```

3. Wire AI features using the shared routing engine — never call provider directly

---

## M9-AI: Advanced (Background Agents, Agentic Write Boundaries)

Not in M8. Depends on M8a-AI-4 being stable in production.

Includes:
- Background agent CRON triggers
- Agentic workflow engine (`packages/ai-agents/`)
- Write boundary enforcement middleware
- Rollback engine for L4/L5 autonomous writes
- Full autonomy level enforcement in `resolveAdapter()`

---

## Success Criteria for M8a-AI Complete

- [ ] `pnpm -r typecheck` passes across all packages (0 errors)
- [ ] `pnpm -r test` — ≥55 new AI tests passing (≥20 adapters + ≥15 routes + ≥20 admin/HITL/settings)
- [ ] Migrations 0037–0041 valid SQL (no wrangler parse errors)
- [ ] `POST /ai/complete` returns valid response with platform key
- [ ] `POST /ai/complete` returns 402 when credits exhausted
- [ ] `POST /ai/complete` returns 503 when all providers unavailable
- [ ] BYOK key registration, validation, and resolution working
- [ ] Super-admin emergency disable propagates within 60 seconds (KV TTL)
- [ ] All AI usage written to `ai_usage_logs` (fire-and-forget)
- [ ] Credit deduction atomic (D1 transaction test)
- [ ] HITL queue captures sensitive sector AI actions
