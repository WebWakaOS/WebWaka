# M8-AI Architecture Decision Log

**Status:** Active  
**Date:** 2026-04-08  
**Scope:** All architectural decisions made during M8-AI planning  

Every decision records: context, decision, alternatives rejected, consequences, and repo evidence.

---

## ADL-001: Expand `packages/ai-abstraction/`, Do Not Replace

**Context:** `packages/ai-abstraction/src/types.ts` (M3) defines text-only `AIAdapter`. TDR-0009 is already accepted and founder-approved. `@webwaka/ai` is the established package name.

**Decision:** Expand the existing package with additional capability type families. Keep all existing type contracts unchanged.

**Alternatives rejected:**
- **Replace with new package** — Rejected. Would break TDR-0009 acceptance and require re-approval. `@webwaka/ai` is already referenced in docs.
- **Separate packages per capability** — Rejected. Over-engineered for current scale. The provider abstraction boundary is the package boundary.

**Consequences:**
- `packages/ai-abstraction/src/types.ts` adds new interfaces without modifying existing ones
- New file `packages/ai-abstraction/src/capabilities.ts` for non-text capability types
- New file `packages/ai-abstraction/src/router.ts` for provider routing logic

**Evidence:** `packages/ai-abstraction/src/types.ts` line 1: "Milestone 3: interfaces only — no runtime calls. Full adapter implementations (OpenAI, Anthropic, BYOK): Milestone 5+"

---

## ADL-002: 5-Level Provider Resolution Chain

**Context:** TDR-0009 specifies a 3-level chain: Tenant BYOK → Platform default → Fallback. The M8-AI brief requires user BYOK and workspace BYOK as distinct levels.

**Decision:** Implement a 5-level chain:
1. User BYOK key (highest priority — user-supplied, user-scoped)
2. Workspace BYOK key (workspace admin-supplied)
3. Platform key pool (multiple keys, load-balanced, same provider)
4. Platform fallback provider (different provider, platform key)
5. Disabled (quota exhausted, super-admin disabled, or no key available)

**Alternatives rejected:**
- **3-level chain only** — Rejected. Does not distinguish user-level vs workspace-level BYOK. Brief requires both.
- **Workspace key only, no user BYOK** — Rejected. Brief requires user BYOK as a distinct level for personal usage scenarios.
- **Static fallback only** — Rejected. Multi-key pool within same provider required for load distribution and quota splitting.

**Consequences:**
- `ai_provider_keys` D1 table must have `user_id` nullable (NULL = workspace-level, non-NULL = user-level)
- Router must check `user_id` first, then `workspace_id` only
- Platform key pool requires KV-cached health check to skip expired/over-quota keys

**Evidence:** TDR-0009 "Supported providers are registered at runtime. The active provider is resolved from: 1. Tenant BYOK config (if provided and valid), 2. Platform default provider, 3. Fallback provider"

---

## ADL-003: Binary `aiRights` Retained + Granular `aiCapabilities` Added

**Context:** `packages/entitlements/src/plan-config.ts` already has `aiRights: boolean`. Removing it would break existing `requireAIAccess()` guard and all test suites referencing it.

**Decision:** Keep `aiRights: boolean` as the master on/off switch. Add `aiCapabilities: AICapabilitySet` as the granular control. Evaluation: `aiRights` must be true AND the specific capability must be in `aiCapabilities` for access to be granted.

**Alternatives rejected:**
- **Replace `aiRights` with `aiCapabilities` only** — Rejected. Breaking change. 746 tests currently pass.
- **New plan-config alongside old one** — Rejected. Single source of truth (plan-config.ts) must be maintained.
- **Hardcoded capability checks in feature code** — Rejected. Platform Invariant T5: all feature access checked via `@packages/entitlements`.

**Consequences:**
- `PlanConfig` interface in `plan-config.ts` adds `aiCapabilities: AICapabilitySet` field
- New `evaluateAICapability(subscription, capability)` function in `evaluate.ts`
- New `requireAICapability(ctx, capability)` guard in `guards.ts`
- Existing `requireAIAccess()` remains unchanged

**Evidence:** `packages/entitlements/src/plan-config.ts` — `aiRights: boolean` in `PlanConfig` interface. `packages/entitlements/src/guards.ts` — `requireAIAccess(ctx)` implemented.

---

## ADL-004: BYOK Keys Stored in D1 (Encrypted), Referenced in KV

**Context:** P8 requires BYOK support. Keys must not be logged or hardcoded. T3 requires tenant isolation. Security baseline R7 requires PII hashing pattern.

**Decision:** Store BYOK keys in D1 `ai_provider_keys` table with:
- `key_encrypted`: AES-GCM encrypted value (using `DM_MASTER_KEY` pattern from `apps/api/src/env.ts`)
- `key_hash`: SHA-256 of plaintext key for deduplication
- Never return decrypted key in API responses
- KV caches resolved provider adapter (TTL: 60 seconds) to avoid repeated D1 reads per request

**Alternatives rejected:**
- **Store in KV only** — Rejected. KV does not support complex queries (by workspace, by provider, by capability). D1 is required for relational lookups.
- **Store in Cloudflare Secrets** — Rejected. Secrets are per-deployment, not per-tenant. Cannot support multi-tenant BYOK.
- **Store plaintext in D1** — Rejected. Security baseline R7 mandates encryption at rest for sensitive values.

**Consequences:**
- `AES_GCM_KEY` or reuse of `DM_MASTER_KEY` must be defined in `env.ts` for key encryption
- `ai_provider_keys` table requires `key_encrypted TEXT NOT NULL` and `key_hash TEXT NOT NULL`
- Key rotation requires re-encryption of stored values

**Evidence:** `apps/api/src/env.ts` — `DM_MASTER_KEY?: string` pattern for AES-GCM. `packages/social/src/encryption.ts` — encryption already implemented in platform.

---

## ADL-005: AI Usage Logged to D1, Not KV

**Context:** `ai-policy.md` rule 5: "AI usage logs must be retained for platform audit and compliance purposes." Rate-limit state uses KV. Audit logs (security-baseline.md) are append-only D1 records.

**Decision:** AI usage metering and audit logs go to D1 `ai_usage_logs` table, append-only. KV is used only for rate-limit counters (transient, TTL-based).

**Alternatives rejected:**
- **KV for usage logs** — Rejected. KV cannot be queried relationally. Billing requires aggregating usage by workspace/user/period. D1 is required.
- **External log service** — Rejected. Cloudflare Workers + D1 is the production runtime (T1). No external dependencies in the request path.
- **Analytics Engine only** — Rejected. Billing calculations require queryable records, not aggregated analytics.

**Consequences:**
- `ai_usage_logs` is high-write. Add indexes on `(tenant_id, workspace_id, created_at)` and `(workspace_id, capability, created_at)` for billing queries.
- Write to `ai_usage_logs` is non-blocking (fire-and-forget using `ctx.waitUntil()`) to avoid adding latency to AI responses.

**Evidence:** `apps/api/src/middleware/rate-limit.ts` — KV for transient rate limit counters. `docs/governance/security-baseline.md` — "Audit logs are append-only. No update or delete on audit log records."

---

## ADL-006: USSD Path is AI-Excluded

**Context:** `apps/ussd-gateway/src/index.ts` exists. USSD protocol limits responses to 182 characters (140 on some networks). AI text generation cannot be constrained to this limit reliably.

**Decision:** AI capabilities are architecturally excluded from all USSD code paths. USSD responses must be deterministic, pre-defined, and short. AI may pre-generate USSD menu text offline (batch), but never inline per-request.

**Alternatives rejected:**
- **AI-summarized USSD responses** — Rejected. Adds latency to time-critical USSD sessions. Unpredictable length. Cannot be tested deterministically.
- **AI on USSD with length guard** — Rejected. Still adds latency. USSD sessions have 3-second response windows.

**Consequences:**
- AI middleware must check `c.req.header('X-USSD-Session')` and short-circuit if present
- USSD menu strings are static or pulled from D1 (pre-generated content)

**Evidence:** `apps/ussd-gateway/src/index.ts` — USSD gateway routes. M7b offline-sync design specifies USSD as last-resort channel.

---

## ADL-007: Sensitive Sector AI Requires `sensitiveSectorRights` + HITL

**Context:** `ai-policy.md` rule 4: "Sensitive workflows (legal, political, medical, financial) require human-in-the-loop review before AI output is actionable." `packages/entitlements/src/plan-config.ts` — `sensitiveSectorRights: boolean` (only `enterprise` and `partner` plans have this).

**Decision:** AI features in sensitive verticals (Politician, Clinic, NGO financial flows, legal advice) require BOTH `sensitiveSectorRights: true` AND HITL approval before output is actioned. No exceptions.

**Alternatives rejected:**
- **Disclaimer-only approach** — Rejected. In regulated Nigerian sectors (medical, legal, political), disclaimers are insufficient for compliance.
- **Autonomous AI in sensitive sectors** — Rejected. Direct violation of `ai-policy.md` rule 4.

**Consequences:**
- HITL approval events stored in D1 `ai_hitl_queue` table (planned)
- Vertical-specific AI configs must declare `requiresHITL: true` for sensitive capabilities
- Workspace must be on Enterprise/Partner plan to enable sensitive-sector AI at all

**Evidence:** `packages/entitlements/src/plan-config.ts` — `sensitiveSectorRights: false` for all plans below Enterprise.

---

## ADL-008-NOTE: ADL-008 (Credits) was decided before ADL-009 (Aggregators). Numbering in this file was corrected 2026-04-13 — ADL-008 section appears after ADL-009 in this file due to original insertion order; logical ordering is ADL-008 → ADL-009 → ADL-010.

## ADL-009: AI Aggregators and Chinese Providers Are First-Class in the Provider Registry

**Context:** The M8-AI brief initially scoped only OpenAI, Anthropic, and Google as named providers. AI aggregators (OpenRouter, Groq, Together, Portkey, Fireworks) and Chinese AI providers (DeepSeek, Qwen, Zhipu, Moonshot, MiniMax, Yi/01.AI) have matured significantly and offer meaningful advantages for the Nigeria-first platform mission.

**Decision:** Aggregators and Chinese providers are incorporated into the provider registry, capability mapping, model registry, and failover chain as first-class entries. No new adapter code is required for any of them.

**Key technical insight — single adapter serves all:**
- The OpenAI adapter (`packages/ai-adapters/src/openai.ts`) calls `POST {baseUrl}/v1/chat/completions` and `POST {baseUrl}/v1/embeddings`
- OpenRouter, Groq, Together, Fireworks, DeepSeek, Qwen, Zhipu, Moonshot, MiniMax, Yi — all expose this exact API surface
- Only `baseUrl` and `apiKey` change. `AIProviderConfig.baseUrl` (already in `packages/ai-abstraction/src/types.ts`) was designed for exactly this
- New providers are added via KV configuration, not code deployment — satisfying Platform Invariant P7

**Aggregator role in architecture:**
- OpenRouter as platform platform-level fallback aggregator: if all direct provider keys fail, one OpenRouter key serves as catch-all with its own internal routing
- OpenRouter as recommended workspace BYOK: one key gives workspaces access to 200+ models — dramatically simplifies BYOK for non-technical workspace admins
- Portkey as observability layer: enterprise workspaces can route via Portkey to get prompt caching, latency analytics, per-model cost tracking without platform code changes
- Groq for latency-critical sub-paths: hardware-accelerated inference for support chat first-response and classification tasks

**Chinese provider rationale:**
- DeepSeek V3 is ~2% of GPT-4o cost for comparable text quality — enables wider free trial allocation and lower credit prices
- DeepSeek R1 is the leading open-source reasoning model — strong for chain-of-thought analysis tasks at minimal cost
- Qwen-Max (Alibaba) has the strongest multilingual coverage for African languages (Hausa, Swahili) among all providers
- All are OpenAI-compatible — zero additional adapter work required
- All require same data residency compliance review as Western providers before enabling for PII-adjacent tasks

**Alternatives rejected:**
- **Western-only provider registry** — Rejected. Unnecessarily increases platform AI cost by 20–50x vs cost-optimized alternatives for the same output quality. Directly disadvantages Nigerian SME customers on credit pricing.
- **Separate adapter per Chinese provider** — Rejected. All are OpenAI-compatible. A separate adapter would be identical code with a different `baseUrl`. Over-engineered.
- **Aggregator-only (no direct providers)** — Rejected. Aggregators add latency and a dependency. Direct provider keys remain primary; aggregators are fallback and BYOK simplification tools.

**Consequences:**
- `AIProvider` type in `packages/ai-abstraction/src/types.ts` expands to include: `'openrouter' | 'portkey' | 'together' | 'groq' | 'fireworks' | 'aimlapi' | 'deepseek' | 'qwen' | 'zhipu' | 'moonshot' | 'minimax' | 'yi'`
- Model registry adds `reasoning` and `multilingual` tiers alongside `best` and `cost`
- Platform default provider chain for `cost` tier: DeepSeek → OpenRouter → OpenAI (not OpenAI first)
- Workspace admins recommending a single BYOK key should be guided toward OpenRouter
- Compliance review required for Chinese providers before PII processing enabled (NDPR)

**Evidence:** `packages/ai-abstraction/src/types.ts` — `AIProviderConfig.baseUrl?: string` already supports custom endpoints. TDR-0009 — "No single-provider lock-in" principle applies here.

---

## ADL-008: AI Credits Are Separate from Subscription Billing

**Context:** Subscription billing uses Paystack, billing_history table, and `syncPaymentToSubscription()`. AI usage is variable — metered by token, not fixed monthly.

**Decision:** AI credits are a separate billing dimension from subscription. Workspaces buy credit packs (via Paystack). Credits are deducted per AI request. Subscription plan determines which capabilities are available; credits determine whether the wallet has balance to use them.

**Alternatives rejected:**
- **Bundle AI tokens into subscription plan** — Rejected. Makes plan pricing complex. Nigerian market price sensitivity requires separating base subscription from variable AI spend.
- **Per-request Paystack charge** — Rejected. Too many micro-transactions. Paystack charges per transaction. Credit pre-purchase is economically sound.
- **Platform-funded AI (no user cost)** — Rejected. AI API costs are real. Platform can offer a free trial allocation, but ongoing usage must be user-funded.

**Consequences:**
- New `ai_credit_balances` and `ai_credit_transactions` D1 tables required
- `ai_usage_logs` deducts from `ai_credit_balances` atomically (D1 transaction)
- Free trial: first N credits platform-funded per workspace (configurable by super-admin)

**Evidence:** `packages/payments/src/subscription-sync.ts` — billing pattern available to reuse. `packages/payments/src/types.ts` — `BillingRecord` shape to follow.

---

## ADL-010: SuperAgent Aggregator-Only Platform Architecture

**Context:** As WebWaka adds AI capabilities across all 145+ business verticals, the platform needs a managed AI layer that shields individual workspaces from API key management complexity, handles billing abstraction, and enforces P13 (no PII to AI). Direct first-party vendor keys (OpenAI, Anthropic, Google) require per-model integration work, separate billing relationships, and expose the platform to vendor lock-in.

**Decision:** All platform AI traffic routes exclusively through AI aggregators. OpenRouter is the primary aggregator. Together AI, Groq, and Eden AI are co-aggregators. Direct OpenAI/Anthropic/Google keys are user/workspace BYOK only — never platform keys.

SuperAgent manages workspace-scoped API keys (stored in `superagent_keys` D1 table, encrypted in KV) as the default key at Level 3 in the 5-level resolution chain. When a workspace has no BYOK registered, SuperAgent auto-issues a managed key backed by the aggregator pool.

**Alternatives rejected:**
- **Direct first-party vendor keys as platform keys** — Rejected. Creates vendor lock-in, requires separate billing relationships per vendor, complex failover logic per vendor. ADL-009 aggregator strategy is already established.
- **No managed key — require all workspaces to supply BYOK** — Rejected. Onboarding friction. Nigerian SMBs expect plug-and-play AI, not API key management.
- **Platform-funded unlimited AI** — Rejected. AI API costs are real. WakaCU metering (ADL-008) is the economically sound model.

**Consequences:**
- `superagent_keys` D1 table required (id, workspace_id, tenant_id, encrypted_key, aggregator, status, created_at, rotated_at)
- `SA_KEY_KV` KV namespace required for key caching
- `SA_KEY_ENCRYPTION_KEY` env secret required for AES-GCM key encryption
- Eden AI added as aggregator for multimodal capabilities (TTS, STT, translation, vision)
- `packages/ai-adapters/src/openai.ts` → renamed to `openai-compat.ts` (handles all OpenAI-compatible endpoints including aggregators)

**Date accepted:** 2026-04-13  
**Authority:** SuperAgent governance suite (`docs/governance/superagent/`)
