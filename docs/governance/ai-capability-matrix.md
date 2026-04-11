# AI Capability Matrix

**Status:** M8-AI Planning Baseline  
**Date:** 2026-04-08  
**Builds on:** `packages/entitlements/src/plan-config.ts`, `packages/ai-abstraction/src/types.ts`

Column definitions:
- **Allowed Tiers**: Minimum subscription plan (cumulative — higher plans also get it)
- **Free Behavior**: What happens on free plan
- **Trial Limit**: Platform-funded trial credits per workspace (lifetime)
- **Billing Method**: How usage is charged
- **Quota Unit**: Unit of measurement for billing
- **Providers Allowed**: Which provider types can serve this capability
- **Fallback Chain**: If primary fails
- **Audit Required**: Whether every use is logged with full context
- **Approval Required**: Whether workspace admin must enable explicitly
- **HITL**: Human-in-the-loop required before output is actioned

---

## Text Generation

| Field | Value |
|---|---|
| **Allowed Tiers** | Growth, Pro, Enterprise, Partner, Sub-partner |
| **Free Behavior** | Not available. Returns `402` with upgrade prompt. |
| **Trial Limit** | 50,000 tokens (approx 37,500 words) per workspace lifetime |
| **Billing Method** | Credit deduction from `ai_credit_balances` |
| **Quota Unit** | Token pair (1,000 input + 500 output = 1 credit unit) |
| **Providers Allowed** | Platform keys (all tiers), Workspace BYOK, User BYOK — **all OpenAI-compatible providers** (OpenAI, OpenRouter, Groq, Together, DeepSeek, Qwen, Zhipu, Moonshot, MiniMax, Yi, Fireworks, Portkey) and Anthropic (native) and Google (native) |
| **Default Cost-Tier Chain** | DeepSeek V3 → OpenRouter (deepseek/deepseek-chat) → OpenAI GPT-4o-mini → Anthropic Claude Haiku |
| **Default Best-Tier Chain** | OpenAI GPT-4o → Anthropic Claude 3.5 Sonnet → Google Gemini 1.5 Pro |
| **Default Multilingual Chain** | Qwen-Max → Google Gemini 1.5 Pro → OpenRouter (qwen/qwen-max) |
| **Default Reasoning Chain** | DeepSeek R1 → OpenAI o1-mini → OpenRouter (deepseek/deepseek-r1) |
| **Workspace BYOK Recommendation** | Single OpenRouter key (access to 200+ models across all providers) |
| **Audit Required** | Yes — log capability, provider, model, tokens, workspace, user |
| **Approval Required** | Workspace admin must enable AI in workspace settings |
| **HITL** | No (except: Politician, Clinic, Legal/Professional verticals) |

---

## Summarization

| Field | Value |
|---|---|
| **Allowed Tiers** | Growth, Pro, Enterprise, Partner, Sub-partner |
| **Free Behavior** | Not available |
| **Trial Limit** | Shares text generation trial allocation |
| **Billing Method** | Credit deduction |
| **Quota Unit** | Token pair |
| **Providers Allowed** | All |
| **Fallback Chain** | Same as text generation |
| **Audit Required** | Yes |
| **Approval Required** | Yes (workspace-level AI enabled) |
| **HITL** | No |

---

## Classification / Categorization

| Field | Value |
|---|---|
| **Allowed Tiers** | Growth, Pro, Enterprise, Partner, Sub-partner |
| **Free Behavior** | Not available |
| **Trial Limit** | Shares text generation trial allocation |
| **Billing Method** | Credit deduction (lower rate — classification prompts are short) |
| **Quota Unit** | Token pair |
| **Providers Allowed** | All |
| **Fallback Chain** | Same as text generation |
| **Audit Required** | Yes |
| **Approval Required** | Yes |
| **HITL** | No |

---

## Embeddings / Semantic Search

| Field | Value |
|---|---|
| **Allowed Tiers** | Pro, Enterprise, Partner |
| **Free Behavior** | Not available |
| **Trial Limit** | 1,000,000 tokens per workspace lifetime |
| **Billing Method** | Credit deduction |
| **Quota Unit** | 10,000 embedding tokens = 1 credit unit |
| **Providers Allowed** | OpenAI (text-embedding-3-*), Google (text-embedding-004) |
| **Fallback Chain** | OpenAI → Google |
| **Audit Required** | Yes |
| **Approval Required** | Yes |
| **HITL** | No |

---

## Voice Transcription (STT — Speech-to-Text)

| Field | Value |
|---|---|
| **Allowed Tiers** | Pro, Enterprise, Partner |
| **Free Behavior** | Not available |
| **Trial Limit** | 60 minutes per workspace lifetime |
| **Billing Method** | Credit deduction |
| **Quota Unit** | 1 minute audio = 5 credit units |
| **Providers Allowed** | OpenAI (whisper-1), Google (Chirp) — no user BYOK for voice |
| **Fallback Chain** | OpenAI → Google |
| **Audit Required** | Yes — log audio duration, not audio content |
| **Approval Required** | Yes |
| **HITL** | No (except: legal/political/medical recordings) |

---

## Text-to-Speech (TTS)

| Field | Value |
|---|---|
| **Allowed Tiers** | Pro, Enterprise, Partner |
| **Free Behavior** | Not available |
| **Trial Limit** | 100,000 characters per workspace lifetime |
| **Billing Method** | Credit deduction |
| **Quota Unit** | 1,000 characters = 1 credit unit |
| **Providers Allowed** | OpenAI (tts-1, tts-1-hd), Google (Cloud TTS) |
| **Fallback Chain** | OpenAI → Google |
| **Audit Required** | Yes |
| **Approval Required** | Yes |
| **HITL** | No |

---

## Image Generation

| Field | Value |
|---|---|
| **Allowed Tiers** | Enterprise, Partner |
| **Free Behavior** | Not available |
| **Trial Limit** | 10 images per workspace lifetime |
| **Billing Method** | Credit deduction |
| **Quota Unit** | 1 image (1024×1024) = 50 credit units |
| **Providers Allowed** | OpenAI (DALL-E 3), Google (Imagen 3) — platform keys only (no user BYOK for image gen) |
| **Fallback Chain** | OpenAI → Google |
| **Audit Required** | Yes — log prompt hash (not raw prompt for privacy) |
| **Approval Required** | Yes — workspace admin explicit enable + super-admin feature flag |
| **HITL** | No (automated moderation of generated image via classification first) |

---

## Image Understanding (Vision)

| Field | Value |
|---|---|
| **Allowed Tiers** | Enterprise, Partner |
| **Free Behavior** | Not available |
| **Trial Limit** | 20 image analyses per workspace lifetime |
| **Billing Method** | Credit deduction |
| **Quota Unit** | 1 image analysis = 20 credit units |
| **Providers Allowed** | OpenAI (gpt-4o vision), Anthropic (claude-3-5-sonnet), Google (gemini-1.5-pro) |
| **Fallback Chain** | OpenAI → Anthropic → Google |
| **Audit Required** | Yes — log image hash, not image content |
| **Approval Required** | Yes |
| **HITL** | No (except: KYC document AI reading — requires human verification sign-off) |

---

## Video Generation

| Field | Value |
|---|---|
| **Allowed Tiers** | Enterprise, Partner |
| **Free Behavior** | Not available |
| **Trial Limit** | 3 short videos (≤10s) per workspace lifetime |
| **Billing Method** | Credit deduction |
| **Quota Unit** | 1 second video = 100 credit units |
| **Providers Allowed** | Platform keys only — no BYOK. Provider TBD (market evolving) |
| **Fallback Chain** | Single provider for now; fallback = graceful degradation to image |
| **Audit Required** | Yes — log prompt hash, duration |
| **Approval Required** | Yes — super-admin feature flag AND workspace admin enable |
| **HITL** | Yes — all video generation requires human review before external publication |

---

## Video Understanding

| Field | Value |
|---|---|
| **Allowed Tiers** | Enterprise, Partner |
| **Free Behavior** | Not available |
| **Trial Limit** | 5 video analyses per workspace lifetime |
| **Billing Method** | Credit deduction |
| **Quota Unit** | 1 minute video analysis = 30 credit units |
| **Providers Allowed** | Google (Gemini 1.5 Pro) — only provider with reliable video understanding at launch |
| **Fallback Chain** | Single provider; fallback = error (not degradable) |
| **Audit Required** | Yes |
| **Approval Required** | Yes |
| **HITL** | No |

---

## Research / Web Enrichment

| Field | Value |
|---|---|
| **Allowed Tiers** | Enterprise, Partner |
| **Free Behavior** | Not available |
| **Trial Limit** | 20 research queries per workspace lifetime |
| **Billing Method** | Credit deduction |
| **Quota Unit** | 1 research query = 10 credit units |
| **Providers Allowed** | Platform keys — Perplexity API, Brave Search API (via `external_apis` skill pattern) |
| **Fallback Chain** | Perplexity → Brave Search |
| **Audit Required** | Yes — log query hash |
| **Approval Required** | Yes |
| **HITL** | No (output is informational, not actioned autonomously) |

---

## Agentic Workflows

| Field | Value |
|---|---|
| **Allowed Tiers** | Enterprise, Partner |
| **Free Behavior** | Not available |
| **Trial Limit** | 5 workflow runs per workspace lifetime |
| **Billing Method** | Credit deduction per step |
| **Quota Unit** | 1 agent step = varies by capability used |
| **Providers Allowed** | All (routed per step capability) |
| **Fallback Chain** | Per-step fallback as above |
| **Audit Required** | Yes — full step-by-step audit trail with input/output hashes |
| **Approval Required** | Yes — Enterprise plan + workspace admin explicit enable |
| **HITL** | Yes — all write-action steps require HITL unless `autonomy.autonomous` explicitly granted |

---

## Database Write Assistance

| Field | Value |
|---|---|
| **Allowed Tiers** | Enterprise, Partner |
| **Free Behavior** | Not available |
| **Trial Limit** | None — must use credits |
| **Billing Method** | Credit deduction |
| **Quota Unit** | 1 batch write operation = 25 credit units |
| **Providers Allowed** | Platform keys — text generation providers only |
| **Fallback Chain** | Standard text generation chain |
| **Audit Required** | Yes — full before/after state logged |
| **Approval Required** | Yes + super-admin feature flag |
| **HITL** | Yes — mandatory. AI proposes write; human must approve before execution |

---

## AI Support Chat

| Field | Value |
|---|---|
| **Allowed Tiers** | Growth, Pro, Enterprise, Partner, Sub-partner |
| **Free Behavior** | Not available (deterministic FAQ bot only on free) |
| **Trial Limit** | 200 messages per workspace lifetime |
| **Billing Method** | Credit deduction |
| **Quota Unit** | 1 message exchange = 2 credit units |
| **Providers Allowed** | All |
| **Fallback Chain** | Standard text generation chain |
| **Audit Required** | Yes — log conversation hash, not raw content (privacy) |
| **Approval Required** | Yes |
| **HITL** | No (except: medical/legal/political escalation detection) |

---

## Sales Assist

| Field | Value |
|---|---|
| **Allowed Tiers** | Growth, Pro, Enterprise, Partner, Sub-partner |
| **Free Behavior** | Not available |
| **Trial Limit** | 50 interactions per workspace lifetime |
| **Billing Method** | Credit deduction |
| **Quota Unit** | 1 sales assist session = 3 credit units |
| **Providers Allowed** | All |
| **Fallback Chain** | Standard text generation chain |
| **Audit Required** | Yes |
| **Approval Required** | Yes |
| **HITL** | No |

---

## Analytics Insights

| Field | Value |
|---|---|
| **Allowed Tiers** | Pro, Enterprise, Partner |
| **Free Behavior** | Not available |
| **Trial Limit** | 10 insight generations per workspace lifetime |
| **Billing Method** | Credit deduction |
| **Quota Unit** | 1 insight generation = 5 credit units |
| **Providers Allowed** | All (text generation) |
| **Fallback Chain** | Standard text generation chain |
| **Audit Required** | Yes |
| **Approval Required** | Yes |
| **HITL** | No |

---

## Email / Content Generation

| Field | Value |
|---|---|
| **Allowed Tiers** | Growth, Pro, Enterprise, Partner, Sub-partner |
| **Free Behavior** | Not available |
| **Trial Limit** | Shares text generation trial allocation |
| **Billing Method** | Credit deduction |
| **Quota Unit** | Token pair |
| **Providers Allowed** | All |
| **Fallback Chain** | Standard text generation chain |
| **Audit Required** | Yes |
| **Approval Required** | Yes |
| **HITL** | No (except: political communication — HITL mandatory) |

---

## Website / Product Description Generation

| Field | Value |
|---|---|
| **Allowed Tiers** | Growth, Pro, Enterprise, Partner, Sub-partner |
| **Free Behavior** | Not available |
| **Trial Limit** | Shares text generation trial allocation |
| **Billing Method** | Credit deduction |
| **Quota Unit** | Token pair |
| **Providers Allowed** | All |
| **Fallback Chain** | Standard text generation chain |
| **Audit Required** | Yes |
| **Approval Required** | Yes |
| **HITL** | No |

---

## Automation Workflows

| Field | Value |
|---|---|
| **Allowed Tiers** | Enterprise, Partner |
| **Free Behavior** | Not available |
| **Trial Limit** | 3 automation runs per workspace lifetime |
| **Billing Method** | Credit deduction per action step |
| **Quota Unit** | 1 automation step = varies by action type |
| **Providers Allowed** | All (per action type) |
| **Fallback Chain** | Per-step |
| **Audit Required** | Yes — full step audit trail |
| **Approval Required** | Yes + Enterprise plan |
| **HITL** | Yes for write actions; No for read-only actions |
