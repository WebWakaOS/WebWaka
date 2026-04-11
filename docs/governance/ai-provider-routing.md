# AI Provider / Key Architecture and Routing

**Status:** M8-AI Planning Baseline  
**Date:** 2026-04-08  
**Extends:** TDR-0009 (`docs/architecture/decisions/0009-ai-provider-abstraction.md`)  
**Depends on:** `packages/ai-abstraction/src/types.ts` (existing), migration 0037 (planned)

> **3-in-1 Position:** AI is a cross-cutting intelligence layer that enhances all three pillars (Pillar 1 — Operations-Management, Pillar 2 — Branding, Pillar 3 — Marketplace). It is NOT a fourth pillar. All AI features must be accessed through the `@webwaka/ai-abstraction` and `@webwaka/ai-adapters` packages. See `docs/governance/3in1-platform-architecture.md` for authoritative pillar assignments.

---

## 1. Super-Admin Platform Keys

Platform keys are API keys owned by the WebWaka platform team and used as the default source of AI capacity for all workspaces that do not have BYOK configured.

**Storage:** Cloudflare Workers environment secrets (NOT in D1)  
**Reference in code:** `apps/api/src/env.ts` bindings

```typescript
// apps/api/src/env.ts additions
OPENAI_API_KEY_1?: string;        // Primary OpenAI key
OPENAI_API_KEY_2?: string;        // Secondary OpenAI key (for key rotation / load split)
ANTHROPIC_API_KEY_1?: string;     // Primary Anthropic key
GOOGLE_AI_API_KEY_1?: string;     // Primary Google AI key
AI_DEFAULT_PROVIDER: string;      // 'openai' | 'anthropic' | 'google'
AI_FALLBACK_PROVIDER?: string;    // Different provider for fallback
AI_KEY_VAULT_KV: KVNamespace;     // KV binding for health check cache
```

**Rotation policy:**
- Platform keys are rotated quarterly or on suspected compromise
- Multiple keys per provider (`KEY_1`, `KEY_2`) allow zero-downtime rotation
- Health check cache in KV invalidated on rotation (`DELETE rl:ai:health:openai:*`)

---

## 2. Workspace-Owned Provider Keys (Workspace BYOK)

Workspace admins can register their own API keys for any supported provider.

**Storage:** D1 `ai_provider_keys` table (planned migration 0037)

```sql
-- migration 0037_ai_provider_keys.sql (planned)
CREATE TABLE ai_provider_keys (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL,
  workspace_id    TEXT NOT NULL,
  user_id         TEXT,                    -- NULL = workspace-level key
  provider        TEXT NOT NULL
    CHECK (provider IN ('openai', 'anthropic', 'google', 'byok_custom')),
  capabilities    TEXT NOT NULL DEFAULT '["text"]', -- JSON array of AICapabilityType
  key_hash        TEXT NOT NULL,           -- SHA-256(raw_key) for dedup
  key_encrypted   TEXT NOT NULL,           -- AES-GCM(raw_key, DM_MASTER_KEY)
  is_active       INTEGER NOT NULL DEFAULT 1,
  last_used_at    INTEGER,
  failure_count   INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER DEFAULT (unixepoch()),
  updated_at      INTEGER DEFAULT (unixepoch())
);
CREATE INDEX idx_aipk_workspace ON ai_provider_keys(workspace_id, provider, is_active);
CREATE INDEX idx_aipk_user ON ai_provider_keys(user_id, provider, is_active);
CREATE INDEX idx_aipk_tenant ON ai_provider_keys(tenant_id);
```

**Workspace BYOK registration flow:**
1. Workspace admin calls `POST /ai/keys` with `{ provider, apiKey, capabilities[] }`
2. System validates key with a minimal live test call (1-token completion)
3. System hashes and encrypts key; stores in D1
4. System returns `{ id, provider, capabilities, is_active }` — never returns raw key
5. Key is associated with workspace; all workspace members benefit

---

## 3. User BYOK Keys (User-Level)

Individual users can register personal API keys, overriding workspace keys for their own requests.

**Storage:** Same `ai_provider_keys` table; `user_id IS NOT NULL` indicates user-level key.

**User BYOK registration flow:**
- Same as workspace BYOK but routed to `user_id = authenticated_user.id`
- Key is private to the user; workspace admin cannot see/revoke it (audit shows usage volume only)
- User BYOK is checked first in the resolution chain (highest priority)

**When user BYOK is active:**
- Credit deduction is skipped (user pays their provider directly)
- Platform still meters usage in `ai_usage_logs` for platform audit
- `funded_by: 'user_byok'` logged in usage record

---

## 4. Key Vault Design

| Layer | Storage | Encryption | Scope |
|---|---|---|---|
| Platform keys | CF Workers Secrets (env.ts) | CF Secrets Manager | Platform-wide |
| Workspace BYOK keys | D1 `ai_provider_keys` | AES-GCM (DM_MASTER_KEY) | Workspace-scoped |
| User BYOK keys | D1 `ai_provider_keys` | AES-GCM (DM_MASTER_KEY) | User-scoped |
| Health check cache | Cloudflare KV | None (non-sensitive) | Platform-wide |
| Rate limit counters | Cloudflare KV | None (non-sensitive) | Per-subject |

**Key encryption pattern** (mirrors `packages/social/src/encryption.ts` DM encryption):
```typescript
// Never hardcode — use env.AI_ENCRYPTION_KEY (or reuse DM_MASTER_KEY pattern)
async function encryptKey(rawKey: string, masterKey: string): Promise<string>
async function decryptKey(encrypted: string, masterKey: string): Promise<string>
```

---

## 5. Provider Registry

### 5a. Adapter Architecture

The platform uses two adapter implementations. Every provider below routes through one of them:

| Adapter | Used For | Why |
|---|---|---|
| **OpenAI-compatible** (`packages/ai-adapters/src/openai.ts`) | OpenAI, all aggregators, all Chinese providers, Groq, Together, Fireworks, Mistral, DeepSeek, Qwen, Zhipu, Moonshot, MiniMax | All expose `POST /v1/chat/completions` and `POST /v1/embeddings` — only `baseUrl` and `apiKey` differ |
| **Anthropic-native** (`packages/ai-adapters/src/anthropic.ts`) | Anthropic Claude only | Anthropic's `/v1/messages` format is not OpenAI-compatible |
| **Google-native** (`packages/ai-adapters/src/google.ts`) | Google Gemini, Imagen, Chirp, Cloud TTS, Veo | Google uses its own REST format AND has the widest non-text capability set |

> **BYOK design implication:** A workspace supplying a single OpenRouter API key gains access to 200+ models across all OpenAI-compatible providers without registering separate keys per provider. The `AIProviderConfig.baseUrl` field (already in `packages/ai-abstraction/src/types.ts`) supports this pattern.

---

### 5b. First-Party Providers

| Provider ID | Adapter | Text | Embed | STT | TTS | Image | Vision | Notes |
|---|---|---|---|---|---|---|---|---|
| `openai` | openai-compat | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Platform primary default |
| `anthropic` | anthropic-native | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | Best for long-context + coding |
| `google` | google-native | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Only provider with video gen + understanding |

---

### 5c. AI Aggregators (Single-Key Multi-Model Access)

Aggregators sit in front of multiple providers and expose a unified OpenAI-compatible API. They are first-class provider IDs — not second-class adapters.

| Provider ID | Base URL | Text | Embed | Notes |
|---|---|---|---|---|
| `openrouter` | `https://openrouter.ai/api/v1` | ✅ | ✅ | 200+ models from one key; automatic fallback; cost routing per model. **Recommended for workspace BYOK** — single key accesses all providers |
| `portkey` | `https://api.portkey.ai/v1` | ✅ | ✅ | Observability + prompt caching + retry layer on top of any upstream. Adds latency tracking at aggregator level |
| `together` | `https://api.together.xyz/v1` | ✅ | ✅ | Open-source model hosting (Llama 3, Mixtral, Qwen). Strong cost/performance for batch workloads |
| `groq` | `https://api.groq.com/openai/v1` | ✅ | ❌ | Hardware-accelerated inference. Best latency for Llama + Mixtral. Use for latency-critical flows |
| `fireworks` | `https://api.fireworks.ai/inference/v1` | ✅ | ✅ | Open-source models with fast inference + embeddings. Good Llama/Mistral alternative |
| `aimlapi` | `https://api.aimlapi.com/v1` | ✅ | ✅ | Access to GPT-4o, Claude, Gemini, DeepSeek via one endpoint. Useful for mixed-provider BYOK |

**OpenRouter as recommended workspace BYOK strategy:**
- One key → access to GPT-4o, Claude 3.5, Gemini 1.5 Pro, DeepSeek V3, Qwen-Max, Llama 3.1, and 190+ more
- OpenRouter's own routing handles provider failover
- Cost routing: workspace can pin to cheapest model meeting quality threshold (e.g., `deepseek/deepseek-chat` at 1/50th of GPT-4o cost)
- Model string in `AIProviderConfig.model` follows OpenRouter format: `openai/gpt-4o`, `deepseek/deepseek-chat`, `anthropic/claude-3-5-sonnet`

---

### 5d. Chinese AI Providers

All listed providers expose OpenAI-compatible APIs — served by the existing OpenAI adapter with `baseUrl` override.

| Provider ID | Company | Base URL | Key Models | Notes |
|---|---|---|---|---|
| `deepseek` | DeepSeek AI | `https://api.deepseek.com/v1` | `deepseek-chat` (V3), `deepseek-reasoner` (R1) | **Lowest cost for text generation** — ~1/50th of GPT-4o cost per token. V3 competes with GPT-4o for many tasks. R1 = reasoning/chain-of-thought. Strong English + Mandarin |
| `qwen` | Alibaba (DashScope) | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-max`, `qwen-plus`, `qwen-long`, `qwen-turbo` | Best multilingual coverage including Hausa, Swahili, and other African languages. `qwen-long` = 1M context. Strong structured output |
| `zhipu` | Zhipu AI (Tsinghua) | `https://open.bigmodel.cn/api/paas/v4` | `glm-4`, `glm-4-flash`, `glm-4v` (vision) | Competitive pricing. `glm-4-flash` = very fast + cheap for classification tasks. `glm-4v` = vision capable |
| `moonshot` | Moonshot AI | `https://api.moonshot.cn/v1` | `moonshot-v1-8k`, `moonshot-v1-32k`, `moonshot-v1-128k` | Exceptional long-context. 128k context at low cost. Strong for document analysis use cases |
| `minimax` | MiniMax | `https://api.minimax.chat/v1` | `abab6.5s-chat`, `speech-01-turbo` (TTS) | Includes TTS capability (`speech-01-turbo`). Good for voice-forward verticals (church announcements, political broadcasts) |
| `yi` | 01.AI | `https://api.lingyiwanwu.com/v1` | `yi-large`, `yi-medium`, `yi-vision` | Strong multilingual. `yi-vision` = multimodal. Competitive pricing on long-context |
| `baidu` | Baidu (ERNIE) | Via Qianfan SDK or proxy | `ERNIE-4.0-8K`, `ERNIE-Speed` | Primarily Chinese-language strength. Lower priority for WebWaka Nigeria-first use case. Monitor for African language improvement |

**Nigeria-specific rationale for Chinese providers:**
- DeepSeek V3 is appropriate for most text generation tasks at a fraction of Western provider cost — directly reduces platform AI cost and allows wider free tier allocation
- Qwen has the strongest coverage of African languages among all providers — relevant for Hausa, Yoruba, Igbo localisation
- All Chinese providers are subject to the same data residency compliance review as Western providers — check NDPR requirements before enabling for PII-adjacent tasks
- All Chinese providers support BYOK — workspace admins can supply own key via the standard `ai_provider_keys` registration flow

---

### 5e. Open-Source / Self-Hosted via Aggregator

These are not direct providers — they are models accessed via aggregators (OpenRouter, Together, Groq, Fireworks):

| Model Family | Access Via | Use Case |
|---|---|---|
| Llama 3.1/3.3 (Meta) | OpenRouter, Together, Groq | Cost-optimized text; no API cost if self-hosted future |
| Mistral Large / Nemo | OpenRouter, Fireworks | EU data residency option; competitive pricing |
| Gemma 2 (Google) | Together, Groq | Fast, cheap classification |
| Qwen 2.5 (Alibaba open weights) | Together, OpenRouter | Open-source multilingual; Africa language advantage |
| DeepSeek R1 (open weights) | OpenRouter, Together | Reasoning tasks; open weights allow future self-hosting |
| Phi-4 (Microsoft) | OpenRouter | Small but capable; good for on-device future |

Provider registry is maintained in KV (`ai:provider:registry`) — updatable by super admin without code deployment. The `byok_custom` provider type (user-declared capabilities, custom `baseUrl`) supports any unlisted OpenAI-compatible endpoint.

---

## 6. Model Registry

Models are selected by the routing engine based on: capability type, workspace preference, and cost tier. The registry is configuration stored in KV — not hardcoded — so new models are added without deployment.

```typescript
// packages/ai-abstraction/src/models.ts (planned)
export const MODEL_REGISTRY = {
  text: {
    best: {
      openai:      'gpt-4o',
      anthropic:   'claude-3-5-sonnet-20241022',
      google:      'gemini-1.5-pro',
      openrouter:  'anthropic/claude-3-5-sonnet',   // via aggregator
      deepseek:    'deepseek-chat',                  // V3 — best/cost balance
      qwen:        'qwen-max',
    },
    cost: {
      openai:      'gpt-4o-mini',
      anthropic:   'claude-3-haiku-20240307',
      google:      'gemini-1.5-flash',
      openrouter:  'deepseek/deepseek-chat',         // cheapest strong model via aggregator
      deepseek:    'deepseek-chat',                  // direct — ~1/50th GPT-4o cost
      qwen:        'qwen-turbo',
      groq:        'llama-3.3-70b-versatile',        // fastest inference
      zhipu:       'glm-4-flash',                    // fast + cheap
    },
    reasoning: {
      openai:      'o1-mini',
      openrouter:  'deepseek/deepseek-r1',           // best open reasoning model
      deepseek:    'deepseek-reasoner',              // R1 direct
    },
    multilingual: {
      google:      'gemini-1.5-pro',                 // best African language coverage (Hausa, Yoruba, Igbo)
      qwen:        'qwen-max',                       // strong Hausa + Swahili
      openrouter:  'qwen/qwen-max',                  // via aggregator
    },
  },
  embed: {
    best:         { openai: 'text-embedding-3-large',  google: 'text-embedding-004' },
    cost:         { openai: 'text-embedding-3-small',  google: 'text-embedding-004', together: 'togethercomputer/m2-bert-80M-8k-retrieval' },
  },
  stt: {
    best:         { openai: 'whisper-1', google: 'chirp' },
  },
  tts: {
    best:         { openai: 'tts-1-hd', google: 'en-NG-Wavenet-A', minimax: 'speech-01-turbo' },
    cost:         { openai: 'tts-1', minimax: 'speech-01-turbo' },
  },
  image: {
    best:         { openai: 'dall-e-3', google: 'imagen-3.0-generate-001' },
  },
} as const;
```

Workspace admins can select `'best'`, `'cost'`, `'reasoning'`, or `'multilingual'` tier. Default: `'cost'`. The `multilingual` tier routes to models with the strongest African language support — relevant for Hausa, Yoruba, Igbo, and Pidgin English workflows.

---

## 7. Capability Routing

The routing engine (`packages/ai-abstraction/src/router.ts`) resolves the correct adapter for each request:

```typescript
export interface AIRoutingContext {
  tenantId: string;
  workspaceId: string;
  userId?: string;
  capability: AICapabilityType;
  modelTier?: 'best' | 'cost';
}

export async function resolveAdapter(
  ctx: AIRoutingContext,
  db: D1Like,
  kv: KVNamespace,
  env: Env,
): Promise<{ adapter: AIAdapter; fundedBy: 'user_byok' | 'workspace_byok' | 'platform' }> {
  // 1. Check user BYOK for this capability
  // 2. Check workspace BYOK for this capability
  // 3. Check platform key pool (health-checked via KV)
  // 4. Try fallback provider
  // 5. Throw AIUnavailableError (503)
}
```

---

## 8. Failover Ordering

Platform key pool ordering is configured in KV, not hardcoded. Defaults below; super admin can reorder.

```
For capability: text (cost tier)
  [user_byok: any provider] → [workspace_byok: any provider]
  → [platform: deepseek key_1]       ← cheapest first
  → [platform: openrouter key_1]     ← aggregator fallback (access to 200+ models)
  → [platform: openai key_1]
  → [platform: openai key_2]
  → [platform: anthropic key_1]
  → [platform: google key_1]
  → 503

For capability: text (best tier)
  [user_byok] → [workspace_byok]
  → [platform: openai key_1]         ← GPT-4o
  → [platform: anthropic key_1]      ← Claude 3.5 Sonnet
  → [platform: google key_1]         ← Gemini 1.5 Pro
  → [platform: openrouter key_1]     ← aggregator catch-all
  → 503

For capability: text (multilingual tier)
  [user_byok] → [workspace_byok]
  → [platform: qwen key_1]           ← best African language model
  → [platform: google key_1]         ← Gemini 1.5 Pro (strong Yoruba/Igbo/Hausa)
  → [platform: openrouter key_1]     ← qwen/qwen-max via aggregator
  → [platform: openai key_1]         ← fallback
  → 503

For capability: text (reasoning tier)
  [user_byok] → [workspace_byok]
  → [platform: deepseek key_1]       ← deepseek-reasoner (R1) — best open reasoning
  → [platform: openai key_1]         ← o1-mini fallback
  → [platform: openrouter key_1]     ← deepseek/deepseek-r1 via aggregator
  → 503

For capability: embed
  [workspace_byok] → [platform: openai embed key] → [platform: google embed] → 503

For capability: image
  [platform: openai dall-e-3] → [platform: google imagen] → 503
  (No BYOK for image generation — platform keys only)

For capability: stt
  [platform: openai whisper] → [platform: google chirp] → 503

For capability: tts
  [platform: openai tts-1-hd] → [platform: minimax speech-01-turbo] → [platform: google cloud-tts] → 503
```

---

## 9. Health Checks

Provider health is cached in KV with TTL:

```
Key: ai:health:{provider}:{key_hash_prefix}
Value: 'healthy' | 'degraded' | 'failed'
TTL: 
  healthy   → 300 seconds
  degraded  → 60 seconds (retry after 1 minute)
  failed    → 30 seconds (retry after 30 seconds)
```

Health check triggers:
- On 429: set `degraded`, TTL 60s
- On 5xx: set `failed`, TTL 30s
- On 401/403: set `failed`, TTL 3600s (key invalid — don't retry frequently)
- On success: set `healthy`, TTL 300s

Super admin can trigger manual health refresh via `POST /admin/ai/providers/:id/health-check`.

---

## 10. Spend Thresholds

Configured per workspace via D1 (defaults set by super admin in KV):

| Threshold | Default | Behavior |
|---|---|---|
| Soft limit | 90% credits used | Email notification to workspace admin |
| Hard limit | 100% credits used | AI requests → 402 with top-up link |
| Per-request max tokens | 4,096 | Request rejected if `maxTokens` exceeds limit |
| Per-minute requests | 60 | Rate limit via KV (R5 pattern) |
| Per-day requests | 1,000 | Soft limit — alert only |

---

## 11. Quota Exhaustion Behavior

```
Credits < 0: return { error: 'ai_quota_exhausted', topup_url: '/billing/ai-credits', code: 402 }
BYOK key invalid: log failure_count++, fall through to next resolution level
Provider 429: cache degraded in KV, fall through to next key/provider
Provider 5xx: cache failed in KV, fall through to next key/provider
All options exhausted: return { error: 'ai_unavailable', retry_after: 30, code: 503 }
```

---

## 12. Provider-Specific Capability Mapping

### First-Party + Native Adapters

| Capability | OpenAI | Anthropic | Google |
|---|---|---|---|
| Text (streaming) | ✅ | ✅ | ✅ |
| Text (function calling) | ✅ | ✅ | ✅ |
| Embeddings | ✅ | ❌ | ✅ |
| STT | ✅ (whisper-1) | ❌ | ✅ (Chirp) |
| TTS | ✅ (tts-1-hd) | ❌ | ✅ (en-NG-Wavenet-A) |
| Image gen | ✅ (DALL-E 3) | ❌ | ✅ (Imagen 3) |
| Image understanding | ✅ | ✅ | ✅ |
| Video gen | ❌ | ❌ | ✅ (Veo 2) |
| Video understanding | ❌ | ❌ | ✅ (Gemini 1.5 Pro) |
| Long context (>100k tokens) | ✅ (128k) | ✅ (200k) | ✅ (1M) |

### Aggregators (via OpenAI-compatible adapter)

| Capability | OpenRouter | Groq | Together | Fireworks | Portkey |
|---|---|---|---|---|---|
| Text (streaming) | ✅ (model-dependent) | ✅ | ✅ | ✅ | ✅ |
| Text (function calling) | ✅ (model-dependent) | ✅ | ✅ | ✅ | ✅ |
| Embeddings | ✅ (model-dependent) | ❌ | ✅ | ✅ | ✅ |
| STT | ✅ (via whisper models) | ✅ (whisper-large-v3) | ❌ | ❌ | ✅ |
| TTS | ❌ | ❌ | ❌ | ❌ | ❌ |
| Image gen | ✅ (via DALL-E / Flux models) | ❌ | ✅ (Flux) | ✅ (Flux) | ❌ |
| Image understanding | ✅ (model-dependent) | ❌ | ❌ | ❌ | ✅ |
| Long context (>100k tokens) | ✅ (via Moonshot, Qwen-Long) | ❌ | ❌ | ❌ | ✅ |

### Chinese Providers (via OpenAI-compatible adapter)

| Capability | DeepSeek | Qwen (Alibaba) | Zhipu (GLM) | Moonshot (Kimi) | MiniMax | Yi (01.AI) |
|---|---|---|---|---|---|---|
| Text (streaming) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Text (function calling) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Embeddings | ❌ | ✅ (`text-embedding-v3`) | ✅ (`embedding-3`) | ❌ | ✅ | ❌ |
| STT | ❌ | ✅ (Paraformer via Qwen-Audio) | ❌ | ❌ | ✅ (speech recognition) | ❌ |
| TTS | ❌ | ✅ (CosyVoice) | ❌ | ❌ | ✅ (speech-01-turbo) | ❌ |
| Image gen | ❌ | ✅ (Wanx) | ✅ (CogView-3) | ❌ | ✅ | ❌ |
| Image understanding | ❌ | ✅ (`qwen-vl-max`) | ✅ (`glm-4v`) | ❌ | ✅ | ✅ (`yi-vision`) |
| Long context (>100k tokens) | ✅ (64k) | ✅ (1M via `qwen-long`) | ✅ (128k) | ✅ (128k) | ❌ | ✅ (200k) |
| Approximate cost vs GPT-4o | ~2% | ~5% | ~3% | ~8% | ~4% | ~6% |

**Cost note:** Chinese providers are 2–10% of GPT-4o cost for comparable text generation tasks. This is the primary economic case for their inclusion — it directly enables wider free trial allocations and lower credit prices for workspace customers.

---

## 13. Per-Tenant and Per-User Policy Controls

| Control | Who Sets | Where Stored | API |
|---|---|---|---|
| AI globally enabled | Super admin | KV `ai:global:enabled` | `PATCH /admin/ai/policy` |
| AI enabled for workspace | Workspace admin | D1 `workspace_ai_settings` | `PATCH /workspaces/:id/ai` |
| BYOK allowed for workspace | Super admin (per plan) | `plan-config.ts` | Plan upgrade |
| Capability allowed | Workspace admin | D1 `workspace_ai_settings.capabilities` | `PATCH /workspaces/:id/ai` |
| Model tier preference | Workspace admin | D1 `workspace_ai_settings.model_tier` | `PATCH /workspaces/:id/ai` |
| User BYOK allowed | Workspace admin | D1 `workspace_ai_settings.user_byok_allowed` | `PATCH /workspaces/:id/ai` |
| Per-user capability limit | Workspace admin | D1 `workspace_member_ai_settings` | Future |
