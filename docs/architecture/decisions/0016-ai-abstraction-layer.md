# ADR-0016: AI Abstraction Layer and Aggregator-Only Architecture

**Status:** ACTIVE
**Approval owner:** Platform team
**Author:** Platform team
**Date:** 2026-04-13
**Supersedes:** —
**Superseded by:** —

---

## Context

WebWaka OS serves 145+ business verticals in Nigeria, each potentially needing AI capabilities (text generation, summarisation, classification, embeddings, TTS, STT, image generation, vision). The platform must:

1. Route AI requests to the best provider for the capability and cost tier
2. Enforce P13 (no PII in AI requests) before any request leaves the platform
3. Allow workspaces to supply their own provider keys (BYOK) while falling back to platform keys
4. Abstract provider-specific APIs behind a single interface — vertical code should not know which provider handles a given request
5. Meter usage in WakaCreditUnits (WC) for billing (ADL-008)
6. Work on Cloudflare Workers (no persistent connections, no Node.js-native SDKs)

---

## Decision

Use a **3-layer AI abstraction**:

1. **`packages/ai-abstraction/`** — core type contracts (`AICapability`, `AIProvider`, `AIRequest`, `AIResponse`), the 5-level key resolution chain, and the `resolveAdapter()` router. This is an internal platform primitive.

2. **`packages/ai-adapters/`** — provider adapters wrapping HTTP fetch (not vendor SDKs). Key adapters: `openai-compat.ts` (handles OpenAI, OpenRouter, Together, Groq — all OpenAI-compatible endpoints), `anthropic.ts`, `google.ts`, `edenai.ts` (multimodal via Eden AI).

3. **`packages/superagent-sdk/`** — the vertical-facing SDK contract. Verticals call `superagent.generate()`, `superagent.analyze()` etc. They never import `packages/ai-abstraction` directly. The SDK handles key resolution, P13 PII filter, WakaCU metering, and HITL gate.

**Aggregator-only for platform keys (ADL-010):** All platform-level AI traffic routes through aggregators — OpenRouter (primary), Together AI, Groq, Eden AI. Direct OpenAI/Anthropic/Google keys are BYOK-only. This avoids vendor lock-in and enables a single platform API key to access hundreds of models.

---

## Alternatives Rejected

| Alternative | Reason Rejected |
|-------------|----------------|
| **Direct OpenAI SDK** | Node.js-native — incompatible with Cloudflare Workers runtime. Vendor lock-in. |
| **LangChain / LlamaIndex** | Heavy Node.js dependencies. Workers CPU/memory budget makes these unsuitable. Platform needs bespoke routing logic. |
| **Direct first-party keys as platform keys** | Creates vendor lock-in, multiple billing relationships, complex failover per vendor. ADL-009 established aggregators as first-class. ADL-010 codified aggregator-only. |
| **One adapter per model** | Combinatorial explosion — 15+ providers × 5+ capabilities = 75+ adapters. OpenAI-compatible format covers OpenRouter, Together, Groq, DeepSeek, Qwen etc. with a single adapter. |

---

## P13 Invariant Enforcement

Before any AI request leaves the platform, the SuperAgent SDK runs a PII filter:
- Strips Nigerian NIN, BVN, phone numbers, email addresses from prompt context
- If PII is detected and `allow_pii_context` is not explicitly set with NDPR consent proof, the request is rejected with `422`
- All PII filter decisions are logged in `ai_usage_logs`

---

## Key Resolution Chain (5 levels)

1. **User BYOK key** — user's personal provider key (highest priority)
2. **Workspace BYOK key** — workspace admin-supplied key
3. **SuperAgent managed key** — auto-issued workspace-scoped key backed by aggregator pool
4. **Platform aggregator key** — platform-level OpenRouter/Together/Groq key (rotated)
5. **Emergency fallback** — secondary platform aggregator on different provider

---

## Consequences

- **Positive:** Vertical code is insulated from provider changes. Adding a new provider (e.g., Gemini 2.0) requires only a new adapter and registry entry — no vertical changes.
- **Positive:** P13 enforcement is centralised — no vertical can accidentally send PII to an AI provider.
- **Positive:** WakaCU metering is transparent — verticals don't implement billing logic.
- **Positive:** Aggregator keys cover hundreds of models — platform can route to the best cost/quality model for each capability without managing per-vendor keys.
- **Negative:** All AI capabilities must be declared in the `AICapability` enum — ad-hoc AI calls outside this framework are prohibited.
- **Negative:** Latency of P13 filter adds ~1–5 ms per request. Acceptable for the safety guarantee.

---

## References

- `packages/ai-abstraction/` — core type contracts and router
- `packages/ai-adapters/` — provider adapter implementations
- `packages/superagent/` — SuperAgent runtime (SpendControls, CreditBurnEngine, NdprRegister)
- `docs/governance/superagent/` — full SuperAgent governance suite
- `docs/planning/m8-ai-architecture-decision-log.md` — ADL-008 (credits), ADL-009 (aggregators), ADL-010 (aggregator-only)
- `docs/governance/ai-provider-routing.md` — key vault design and failover chain
