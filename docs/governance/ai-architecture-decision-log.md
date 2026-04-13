# WebWaka AI Architecture Decision Log

**Status:** LIVE — Binding on all AI implementation work
**Date:** 2026-04-09
**Authority:** Platform Architecture Team
**Reviewed by:** SuperAgent Master Plan (docs/governance/superagent/)

> **3-in-1 Position:** AI is a cross-cutting intelligence layer that enhances all three pillars (Pillar 1 — Operations-Management, Pillar 2 — Branding, Pillar 3 — Marketplace). It is NOT a fourth pillar. All AI features must be accessed through the `@webwaka/ai-abstraction` and `@webwaka/ai-adapters` packages. See `docs/governance/3in1-platform-architecture.md` for authoritative pillar assignments.

This log records all Architecture Decision Log (ADL) entries for WebWaka's AI subsystem.
Entries are ordered chronologically (ADL-001 first). Each decision is binding until superseded by a later ADL.

---

## ADL-001: AI Abstraction Layer — No Direct Provider Calls

**Date:** M1 (Platform Foundation)
**Status:** ACTIVE — Never superseded

**Context:** Early platform design considered calling AI providers directly from vertical packages and route handlers. This creates tight coupling, makes provider switching expensive, and violates TDR-0009.

**Decision:** All AI calls must go through `packages/ai-abstraction`. No vertical package, route file, or app may import an AI provider's SDK or call a provider API URL directly.

**Consequences:**
- `packages/ai-abstraction` is the single entry point for all AI features
- Vertical packages call `packages/superagent` which calls `packages/ai-abstraction` (see ADL-012)
- Platform Invariant P7: "No direct OpenAI/Anthropic SDK imports" enforced by lint

**Evidence:** `docs/governance/ai-policy.md`, TDR-0009

---

## ADL-002: AI Provider Key Vault — Cloudflare KV + AES-GCM

**Date:** M3 (Auth and Entitlements)
**Status:** SUPERSEDED by ADL-011 (2026-04-11) — Actual implementation uses D1 with AES-256-GCM

**Context:** Provider API keys must be stored securely. D1 is unsuitable for sensitive key storage (plain-text at rest without additional encryption).

**Decision:** All AI provider keys (both platform keys and user BYOK keys) are stored encrypted in Cloudflare KV using AES-256-GCM. D1 stores only the key metadata (prefix, provider, scope, status, hash). The full encrypted key is in KV only.

**Consequences:**
- `SA_KEY_KV` (KV namespace binding) + `SA_KEY_ENCRYPTION_KEY` (AES master key) are required env vars
- BYOK keys in `ai_provider_keys.key_hash` (D1) + KV (encrypted full value)
- SuperAgent keys in `superagent_keys.key_hash` (D1) + `SA_KEY_KV` (encrypted full value)

---

## ADL-003: NDPR Consent Gate for AI Output Delivery

**Date:** M3 (Auth and Entitlements)
**Status:** ACTIVE

**Context:** NDPR requires consent before processing personal data. AI features that generate personalised output and deliver it via contact channels (SMS, WhatsApp, Telegram, email) constitute data processing.

**Decision:** Any AI-generated content delivered via an outbound contact channel requires an active `consent_records` entry for the target user. The routing engine must check consent before dispatching AI output — not after generation.

**Consequences:**
- `assertChannelConsent()` must be called before every AI-assisted outbound communication
- This is in addition to (not instead of) the existing P12 consent gate for non-AI messages
- `ai_usage_logs.purpose` must record the consent basis for every logged AI call

**Evidence:** `docs/governance/platform-invariants.md` — P10, P12

---

## ADL-004: `ai_provider_keys` D1 Table

**Date:** M8-AI-1 (AI Platform Foundation)
**Status:** ACTIVE — Table defined, implementation pending Phase 1

**Context:** Multiple key scopes (user, workspace, platform) need a unified storage schema for BYOK key metadata.

**Decision:** Create `ai_provider_keys` D1 table (migration 0036) with columns: `id`, `workspace_id`, `user_id` (nullable for workspace-scope), `provider` (enum), `scope` ('user' | 'workspace'), `key_prefix`, `key_hash`, `status` ('active' | 'revoked' | 'expired'), `created_at`, `expires_at`, `tenant_id`.

**Consequences:**
- All BYOK key lookups use this table
- `SELECT ... WHERE scope = 'user' AND user_id = ? AND status = 'active'` for Level 1 resolution
- `SELECT ... WHERE scope = 'workspace' AND workspace_id = ? AND status = 'active'` for Level 2

---

## ADL-005: `ai_usage_logs` D1 Table

**Date:** M8-AI-1 (AI Platform Foundation)
**Status:** ACTIVE — Table defined, implementation pending Phase 1

**Context:** WakaCU billing requires an audit trail of every AI call: who made it, which model, how many tokens, cost in WC.

**Decision:** Create `ai_usage_logs` D1 table (migration 0037) with columns: `id`, `workspace_id`, `user_id`, `provider_key_id`, `model_id`, `prompt_tokens`, `completion_tokens`, `wc_cost`, `purpose`, `log_prompt` (boolean — user-consented prompt logging), `created_at`, `tenant_id`.

**Consequences:**
- Every AI call through `resolveAdapter()` inserts a row
- `wc_cost` = 0 for BYOK calls (no WC consumed)
- Prompt content only logged when `log_prompt = true` (NDPR-gated)

---

## ADL-006: USSD Path is AI-Excluded — No Exceptions

**Date:** M6 (USSD Gateway)
**Status:** ACTIVE — Absolute rule

**Context:** USSD is a synchronous protocol with strict response-time requirements (<3s per exchange). AI inference latency (P50: 800ms–3s) is incompatible with reliable USSD operation.

**Decision:** No AI inference call of any kind may be made from `apps/ussd-gateway` FSM branches. USSD responses must be deterministic, pre-computed text only. Pre-fetching of AI-generated content (computed offline and cached) is permitted, but not inline inference.

**Consequences:**
- ESLint rule (future): no `ai-abstraction` import in ussd-gateway source
- Rule G7 in `docs/governance/superagent/06-governance-rules.md` is binding on this ADL

---

## ADL-007: Human-in-the-Loop Required for Sensitive Sectors

**Date:** M8-AI-2 (AI Safety and Compliance)
**Status:** ACTIVE — Implementation pending Phase 1

**Context:** WebWaka serves regulated sectors (financial services, healthcare, legal). AI-generated output in these sectors without human review creates regulatory and reputational risk.

**Decision:** AI features serving regulated sectors (identified by workspace `vertical` tag: 'health', 'legal', 'financial', 'government') must implement a Human-in-the-Loop (HITL) queue before delivery. AI output is staged in `ai_hitl` table (migration 0038) with `status = 'pending_review'`. A qualified human reviewer approves or rejects before dispatch.

**Consequences:**
- `ai_hitl` table with columns: `id`, `workspace_id`, `ai_call_id`, `output_text`, `reviewer_id`, `status`, `reviewed_at`, `tenant_id`
- Rule G9 in `docs/governance/superagent/06-governance-rules.md`
- Vertical packages must check `requireHITL()` before delivering regulated AI output

---

## ADL-008: WakaCU Credit Wallet System

**Date:** M8-AI-3 (AI Billing)
**Status:** ACTIVE — Schema defined, implementation pending Phase 1

**Context:** AI usage needs a prepaid credit system that is (1) fair across tiers, (2) supports partner resale, (3) never exposes raw USD costs to end users, and (4) integrates with existing `float_ledger` patterns.

**Decision:** Introduce WebWaka Credit Units (WakaCU / WC) as the sole internal billing unit for AI. 1 WC = ₦1.50 retail. All AI costs are normalised to WC. Users never see dollar amounts. WC is stored in `wc_wallets` table (migration 0043, per architecture RFC).

**Key parameters:**
- Retail price: ₦1.50 / WC
- Bulk price (100K WC pack): ₦1.00 / WC
- Wholesale / partner price: ₦0.60 / WC

**Consequences:**
- `packages/wc-wallet` implements `deductWC()`, `creditWC()`, `getBalance()`, `topUpIntent()`
- `wc_wallets` + `wc_transactions` tables (migration 0043)
- `partner_credit_pools` table for partner wholesale allocation (migration 0044)
- WC deduction is atomic (conditional UPDATE: `WHERE balance_wc >= ?`)

---

## ADL-009: Multi-Aggregator Sourcing + Chinese Provider Support

**Date:** M8-AI-3 (AI Billing and Provider Expansion)
**Status:** ACTIVE — Expanded by ADL-010

**Context:** Relying on a single aggregator (OpenRouter) creates concentration risk. Additionally, Nigerian enterprises increasingly request cost-effective Chinese AI models (DeepSeek, Qwen, MiniMax) which are available via aggregators at 70–90% lower cost than OpenAI equivalents.

**Decision:** WebWaka uses multiple aggregators for platform traffic: OpenRouter (primary, 200+ models), Together AI (open-source), Groq (latency-optimised), and any aggregator providing Chinese model access. Chinese providers (DeepSeek, Qwen, MiniMax) are accessed via aggregators only — not via direct API relationships.

**Env vars introduced:** `OPENROUTER_API_KEY_1`, `TOGETHER_API_KEY_1`, `GROQ_API_KEY_1`
(Note: ADL-010 adds Eden AI; Chinese providers accessed via OpenRouter/Together.)

**Consequences:**
- Routing engine selects aggregator per capability and health
- No direct Chinese provider keys in `env.ts`; all traffic via OpenRouter or Together

---

## ADL-010: SuperAgent Aggregator-Only Platform Architecture

**Date:** 2026-04-09 (SuperAgent Master Plan)
**Status:** ACTIVE — Supersedes original M8-AI direct provider key model

**Context:** The original M8-AI plan assumed WebWaka would maintain direct API relationships with OpenAI, Anthropic, and Google as "platform keys". WebWaka SuperAgent changes this model fundamentally: WebWaka becomes an AI service provider itself, not a reseller of named vendor access.

**Decision:** All platform-side AI (where WakaCU credits are consumed) routes through AI aggregators. WebWaka does not hold direct API relationships with OpenAI, Anthropic, or Google for platform keys. Direct provider keys are only used in BYOK context (user/workspace supplies their own key).

**Aggregators (platform-funded):**
- OpenRouter — primary, 200+ models, automatic failover
- Together AI — open-source model access
- Groq — latency-critical paths
- Eden AI — multimodal: STT, TTS, translation (Nigerian language support)

**Env vars added:** `EDEN_AI_KEY_1`, `SA_KEY_KV`, `SA_KEY_ENCRYPTION_KEY`
**Env vars removed (never to be added as platform keys):** `OPENAI_API_KEY_*`, `ANTHROPIC_API_KEY_*`, `GOOGLE_AI_API_KEY_*`

**Alternatives rejected:**
- Keep direct provider keys as platform default — Rejected (aggregator-only: no contracts, instant model switching, 200+ model fallback)
- Single aggregator (OpenRouter only) — Rejected (multi-aggregator reduces concentration risk, enables cost-optimised routing)

**Consequences:**
- `ai-provider-routing.md` §1: Platform keys = OpenRouter, Together, Groq, Eden AI only
- `env.ts`: 4 aggregator key groups + 2 SuperAgent key vars — no direct vendor platform keys
- Users/workspaces BYOK with OpenAI/Anthropic/Google still fully supported (user-supplied only)
- SuperAgent key (`sk-waka-{32 hex}`) auto-issued when AI is enabled; stored encrypted in `SA_KEY_KV`

**Evidence:** Consistent with TDR-0009, ADL-001, ADL-009. See full rationale in `docs/governance/superagent/03-system-architecture.md`.

---

## ADL-011: SuperAgent Key Vault — D1 with AES-256-GCM (Supersedes ADL-002 KV Spec)

**Date:** 2026-04-11 (Phase 2 Governance Remediation)
**Status:** ACTIVE — Supersedes ADL-002

**Context:** ADL-002 specified Cloudflare KV as the storage backend for encrypted AI provider keys. The actual implementation (`packages/superagent/src/key-service.ts`, migration `0042_superagent_keys.sql`) stores encrypted keys in D1 using AES-256-GCM via the Web Crypto API (HKDF key derivation with SHA-256). This approach is operationally simpler (single data store, joins with key metadata, transactional upsert) and provides equivalent security since keys are encrypted at rest before being stored.

**Decision:** Keep D1 as the key storage backend. Encrypted key material (AES-256-GCM ciphertext + 12-byte IV, Base64-encoded) is stored in the `superagent_keys.encrypted_key` column. The AES master key is derived from `SA_KEY_ENCRYPTION_KEY` env var via HKDF. D1 stores both metadata and encrypted value in a single row — no KV split.

**Key Rotation Mechanism:**
1. Generate new `SA_KEY_ENCRYPTION_KEY` value
2. Run key re-encryption migration: read all active keys, decrypt with old master, encrypt with new master, update in place
3. Update `SA_KEY_ENCRYPTION_KEY` in Cloudflare secrets
4. Restart all Workers consuming the binding
5. Existing decrypted session keys in memory expire naturally (short-lived)
6. Rotation target: every 90 days per security baseline

**Alternatives Rejected:**
- KV-based storage (ADL-002 original) — more complex split architecture, no transactional guarantees between metadata and key storage, harder to audit

**Consequences:**
- ADL-002 status changed to SUPERSEDED
- `SA_KEY_KV` binding is no longer required for key storage (may be retained for other caching)
- All key operations (upsert, resolve, revoke, list) are D1-only

---

## ADL-012: SuperAgent SDK Package Name Resolution

**Date:** 2026-04-11 (Phase 2 Governance Remediation)
**Status:** ACTIVE

**Context:** ADL-001 and governance rules reference `packages/superagent` as the entry point for vertical packages to call AI. This package was never created. The actual implementation uses `packages/superagent` directly (which wraps `packages/ai-abstraction`). Creating a separate `-sdk` wrapper would add an unnecessary indirection layer with no functional benefit.

**Decision:** `packages/superagent` IS the SDK. All governance doc references to `packages/superagent` are updated to `packages/superagent`. No new package is created.

**Consequences:**
- ADL-001 reference to `packages/superagent` is understood to mean `packages/superagent`
- All governance docs updated to reference `packages/superagent` as the AI entry point
- Vertical packages that need AI capabilities import from `@webwaka/superagent`

---

*This log must be updated whenever a new ADL is approved. ADL numbers are sequential and permanent — a superseded ADL is marked SUPERSEDED, never deleted.*
