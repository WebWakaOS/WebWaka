# AI Platform Master Plan

**Status:** APPROVED — M8-AI Planning Baseline  
**Date:** 2026-04-08  
**Authority:** Extends `docs/governance/ai-policy.md` (M1) and TDR-0009 (accepted)  
**Builds on:** `packages/ai-abstraction/` (M3 type contracts), `packages/entitlements/` (plan-config)

> **3-in-1 Position:** AI is a cross-cutting intelligence layer that enhances all three pillars (Pillar 1 — Operations-Management, Pillar 2 — Branding, Pillar 3 — Marketplace). It is NOT a fourth pillar. All AI features must be accessed through the `@webwaka/ai-abstraction` and `@webwaka/ai-adapters` packages. See `docs/governance/3in1-platform-architecture.md` for authoritative pillar assignments.

---

## 1. System Vision

WebWaka OS is AI-embedded across all verticals — not as a chatbot product layer, but as an operational intelligence layer that accelerates every workflow a business, professional, or public figure performs on the platform. AI is:

- **Ambient, not dominant** — AI assists; humans decide
- **Provider-neutral** — OpenAI, Anthropic, Google, or any BYOK-compatible API
- **Economy-aware** — Free tier, trial credits, paid credits, workspace BYOK, user BYOK
- **Nigeria-first** — English, Pidgin, Yoruba, Igbo, Hausa content optimization
- **Compliance-first** — NDPR, CBN, NCC, NITDA constraints hard-wired into every capability
- **Vertical-specialized** — Each vertical declares its AI use cases, required capabilities, and autonomy level

---

## 2. User / Admin / Provider Hierarchy

```
Super Admin (WebWaka platform team)
├── Global enable/disable per AI capability type
├── Platform API key management (multiple keys per provider)
├── Pricing policy (credit rates, trial allocation per workspace)
├── Provider health monitoring
└── Compliance policy enforcement

Workspace Admin (business owner)
├── Enable/disable AI for workspace
├── BYOK key registration (workspace-level)
├── Per-capability enable/disable
├── Credit balance management and top-up
├── AI usage audit (workspace scope only)
└── Member AI permission policy

Workspace Member (staff user)
├── BYOK key registration (user-level, overrides workspace key)
├── Use AI features within workspace entitlement
└── View own AI usage

End User / Consumer
├── Interact with AI-powered public features (e.g. discovery, support chat)
└── No direct API access — all requests proxied through workspace
```

---

## 3. Capability Matrix (Summary — see ai-capability-matrix.md for full detail)

| Capability | Plans | Billing | HITL |
|---|---|---|---|
| Text generation | Growth+ | Credits | No (except sensitive sectors) |
| Summarization | Growth+ | Credits | No |
| Classification | Growth+ | Credits | No |
| Embeddings / Semantic Search | Pro+ | Credits | No |
| Voice transcription (STT) | Pro+ | Credits | No |
| Text-to-speech (TTS) | Pro+ | Credits | No |
| Image generation | Enterprise | Credits | No |
| Image understanding | Enterprise | Credits | No |
| Video generation | Enterprise | Credits | Yes |
| Research / web enrichment | Enterprise | Credits | No |
| Agentic workflows | Enterprise | Credits | Yes |
| AI support chat | Growth+ | Credits | No |
| Analytics insights | Pro+ | Credits | No |
| Email / content generation | Growth+ | Credits | No |
| Database write assistance | Enterprise | Credits | Yes |
| Sales assist | Growth+ | Credits | No |
| Sensitive sector AI (political/medical/legal) | Enterprise only | Credits | Yes (mandatory) |

---

## 4. Trust and Safety Policy

### 4.1 Content Governance
- All AI-generated content is subject to platform moderation before external publication
- Politically sensitive output (Politician, Political Party verticals) requires HITL approval
- Medical advice output (Clinic vertical) is limited to informational classification; no diagnosis statements
- Legal output (Professional/Law vertical) requires HITL + disclaimer injection
- Financial output (any billing/payment AI) is read-only (no autonomous write)

### 4.2 Data Privacy (NDPR Compliance)
- Personal data processed by AI requires prior NDPR consent from the data subject (`consent_records` table — M7a)
- AI must not process raw BVN, NIN, or phone numbers — only hashed representations (Platform Invariant R7: SHA-256)
- AI output containing personal data must be logged with data subject reference for 7-year retention

### 4.3 Provider Trust
- Platform API keys are secrets stored in Cloudflare Workers environment (never in D1)
- BYOK keys are AES-GCM encrypted in D1 `ai_provider_keys`; decrypted only at request time; never returned in API responses
- Provider responses are not persisted in raw form; only usage metadata is stored

---

## 5. Billing and Metering Policy

### 5.1 Credit Unit Definition
- 1 credit unit = 1,000 input tokens + 500 output tokens (text generation baseline)
- Non-text capabilities have their own conversion rates (see `ai-billing-and-entitlements.md`)
- Kobo cost is calibrated to provider pricing with 30% platform margin

### 5.2 Funding Sources (priority order)
1. User BYOK key → user pays provider directly; platform meters but does not charge credits
2. Workspace BYOK key → workspace pays provider directly; platform meters but does not charge credits
3. Platform key → platform charges workspace credits
4. Free trial allocation → platform-funded (capped per workspace lifetime)

### 5.3 Quota Exhaustion Behavior
- Soft limit (90% consumed): admin email notification
- Hard limit (100% consumed): AI requests return `402 Payment Required` with top-up link
- Emergency override: Super admin can grant emergency credits (audit logged)

---

## 6. BYOK Policy

- Workspace admins may register provider API keys in `ai_provider_keys` (workspace-level)
- Individual users may register personal API keys (user-level, highest resolution priority)
- BYOK keys are validated on registration (live API test call with minimal token usage)
- BYOK keys may be scoped to specific capabilities (e.g., workspace BYOK for text only)
- If a BYOK key fails (invalid, quota exhausted, rate limited), the router falls back to next level
- Fallback from BYOK to platform key is transparent to the end user
- BYOK reduces or eliminates credit consumption (workspace pays their provider directly)

---

## 7. Failover and Fallback Policy

Resolution order for each AI request:

```
1. User BYOK key for this capability (D1 ai_provider_keys WHERE user_id = :uid)
2. Workspace BYOK key for this capability (D1 ai_provider_keys WHERE workspace_id = :wid AND user_id IS NULL)
3. Platform key — same provider, rotating across key pool (KV cached, health-checked)
4. Platform key — fallback provider (different provider, capability-compatible)
5. Disabled — return 503 with retry_after header
```

Failover triggers:
- HTTP 401/403 from provider (key invalid) → skip key, try next
- HTTP 429 from provider (rate limit) → skip key for 60 seconds (KV TTL)
- HTTP 5xx from provider → skip provider for 30 seconds (KV TTL)
- `tokensUsed > quota_remaining` → skip key, try next

---

## 8. Autonomy Policy (Summary — see ai-agent-autonomy.md for full detail)

| Level | Description | Requires | Example |
|---|---|---|---|
| L0 — Read-only assist | AI reads data, suggests text | `aiRights` | Summarize past orders |
| L1 — Draft generation | AI drafts content for user review | `aiRights` | Draft post, email, product description |
| L2 — Supervised action | AI proposes action; user one-click approves | `aiRights` + explicit HITL UI | Schedule a post, send a message |
| L3 — Batch automation | AI executes multi-step batch with per-step approval | `aiRights` + `autonomy.batch` flag | Bulk update product descriptions |
| L4 — Autonomous with boundaries | AI executes within defined read/write scope, no per-action approval | `aiRights` + `autonomy.autonomous` flag + Enterprise plan | Auto-respond to support inquiries |
| L5 — Sensitive autonomous | Same as L4 but in regulated sector | All L4 + `sensitiveSectorRights` + HITL mandatory | Political scheduling, medical triage routing |

---

## 9. Model Routing Policy

Model selection is capability-driven, not hardcoded. The model registry is stored in KV — super admin updates it without deployment (Platform Invariant P7).

### Four Model Tiers

| Tier | Use When | Default Providers |
|---|---|---|
| `cost` | Most workloads — default | DeepSeek V3 → OpenRouter (DeepSeek/GPT-4o-mini) → OpenAI GPT-4o-mini |
| `best` | Quality-critical output (legal, medical, political drafts) | GPT-4o → Claude 3.5 Sonnet → Gemini 1.5 Pro |
| `multilingual` | Hausa / Yoruba / Igbo / Pidgin workflows | Qwen-Max → Gemini 1.5 Pro → OpenRouter (qwen/qwen-max) |
| `reasoning` | Chain-of-thought, analysis, complex data tasks | DeepSeek R1 → o1-mini → OpenRouter (deepseek/deepseek-r1) |

### Provider Selection Per Capability

```
Text generation:
  → cost tier:        deepseek-chat (V3) → openrouter:deepseek/deepseek-chat → gpt-4o-mini
  → best tier:        gpt-4o → claude-3-5-sonnet → gemini-1.5-pro
  → multilingual:     qwen-max → gemini-1.5-pro → openrouter:qwen/qwen-max
  → reasoning:        deepseek-reasoner (R1) → o1-mini
  → offline/low-data: Local prompt templates (no AI call)

Embeddings:
  → text-embedding-3-large (OpenAI) → text-embedding-004 (Google)
  → Fallback: text-embedding-3-small

Voice/STT:
  → whisper-1 (OpenAI) → Chirp (Google)
  → Aggregator: whisper-large-v3 (Groq) for latency-critical paths

TTS:
  → tts-1-hd (OpenAI) → speech-01-turbo (MiniMax) → Cloud TTS (Google)
  → MiniMax speech-01-turbo is preferred for Nigerian-accent voice content

Image generation:
  → dall-e-3 (OpenAI) → Imagen 3 (Google)

Image understanding:
  → gpt-4o-vision → claude-3-5-sonnet (vision) → gemini-1.5-pro → qwen-vl-max
```

### Aggregator Strategy

**OpenRouter** is the recommended platform-level aggregator key for two reasons:
1. It provides a single-key abstraction over 200+ models — if a direct provider fails, OpenRouter re-routes automatically
2. Workspace admins who supply an OpenRouter key as BYOK get access to every provider in the registry without managing separate API credentials

**Portkey** is the recommended observability layer for enterprise workspaces that need prompt caching, detailed latency analytics, and retry policies beyond what the platform router provides.

**Groq** is the recommended key for latency-critical paths (USSD-adjacent prompts with short text, support chat first response). Note: USSD itself is AI-excluded; Groq applies to the web/mobile fast-response path.

### Chinese Provider Economics

DeepSeek V3 and Qwen are the default `cost` tier providers. At approximately 2–5% of GPT-4o pricing for comparable quality on most text generation tasks, this directly funds:
- A larger free trial allocation per workspace (more CU for the same platform cost)
- Lower credit pack prices — making AI accessible to Growth-tier SME customers
- Competitive pricing advantage over competitors running exclusively on Western providers

All Chinese providers must complete the same compliance review as Western providers before being enabled for PII-adjacent tasks (NDPR requirement).

---

## 10. Vertical Integration Policy

Before any vertical implements AI features:

1. Complete `docs/templates/vertical-ai-research-template.md` for that vertical
2. Declare `AI_CAPABILITY_SET` in the vertical's package config
3. Declare `AUTONOMY_LEVEL` (L0–L5) per use case
4. Declare `HITL_REQUIRED: boolean` per use case
5. Declare `SENSITIVE_SECTOR: boolean` (gates `sensitiveSectorRights` check)
6. Register vertical in `ai_vertical_configs` D1 table (migration TBD per vertical)

Platform Invariant P1 (Build Once Use Infinitely) applies: vertical AI configs compose from shared AI platform primitives. No vertical reimplements token counting, routing, or credit deduction.

---

## 11. Implementation Phases

| Phase | Duration | Deliverable | Blocks |
|---|---|---|---|
| M8a-AI-0 | Day 1 | Repo audit + docs (this document) | All |
| M8a-AI-1 | Days 2–3 | `packages/ai-abstraction/` expansion, AI env vars, migrations 0037–0039 | All AI implementation |
| M8a-AI-2 | Days 4–6 | `packages/ai-adapters/` (OpenAI + Anthropic adapters), routing engine | All AI features |
| M8a-AI-3 | Days 7–8 | AI API routes, rate limiting, credit deduction, BYOK key management | Vertical AI |
| M8a-AI-4 | Days 9–10 | Super-admin AI controls, workspace AI settings, usage dashboard | Reporting |
| M8b-AI+ | Parallel | Per-vertical AI configs using research template | Vertical AI features |
