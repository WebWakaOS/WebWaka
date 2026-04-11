# M8-AI Repository Audit Summary

**Status:** Complete  
**Date:** 2026-04-08  
**Purpose:** Executive summary of the exhaustive audit documented in `m8-ai-phase0-repo-audit.md`

---

## What Already Exists (Confirmed Assets)

| Asset | Location | Completeness | Action |
|---|---|---|---|
| AI type contracts | `packages/ai-abstraction/src/types.ts` | Partial — text-only | EXPAND |
| AI governance policy | `docs/governance/ai-policy.md` | Complete (M1) | REFERENCE |
| TDR-0009 (provider abstraction) | `docs/architecture/decisions/0009-ai-provider-abstraction.md` | Complete (accepted) | EXTEND |
| `aiRights` binary entitlement | `packages/entitlements/src/plan-config.ts` | Partial — single boolean | EXPAND |
| `requireAIAccess()` guard | `packages/entitlements/src/guards.ts` | Complete | EXTEND with capability variant |
| KV rate limiting middleware | `apps/api/src/middleware/rate-limit.ts` | Complete | REUSE (new callers) |
| Billing/subscription sync pattern | `packages/payments/src/subscription-sync.ts` | Complete | REUSE (AI credits) |
| Plan capability matrix | `packages/entitlements/src/plan-config.ts` | Partial — no AI capabilities | EXPAND |
| `EntitlementDimensions.aiRights` | `packages/types/src/subscription.ts` | Complete | REFERENCE |
| NDPR consent records | `infra/db/migrations/0017_consent_records.sql` | Complete | REFERENCE |

**Total confirmed assets: 10 existing, all reusable without breaking changes.**

---

## What Is Partial (Needs Expansion, Not Replacement)

| Component | Current State | What's Missing | Effort |
|---|---|---|---|
| `packages/ai-abstraction/` | Text types only (`AIAdapter` with `complete()` + `stream()`) | `embed()`, `transcribe()`, `tts()`, `imageGen()`, `AIUsageRecord`, capability types, router | Medium |
| `packages/entitlements/plan-config.ts` | `aiRights: boolean` per plan | `aiCapabilities: AICapabilitySet`, `monthlyFreeCU`, `byokAllowed` per plan | Small |
| `apps/api/src/env.ts` | No AI API key bindings | `OPENAI_API_KEY_*`, `ANTHROPIC_API_KEY_*`, `GOOGLE_AI_API_KEY_*`, `AI_*` vars | Small |
| `packages/entitlements/src/evaluate.ts` | Layer/user/place/offering evaluation | `evaluateAICapability()` | Small |
| `packages/entitlements/src/guards.ts` | `requireAIAccess()` | `requireAICapability(ctx, capability)` | Small |

---

## What Is Missing (Completely Absent — Must Create)

### Critical Path (blocks all AI features)

| Missing Component | Type | Who Uses It | Complexity |
|---|---|---|---|
| `packages/ai-adapters/` | NEW package | All AI features | High |
| `packages/ai-abstraction/src/router.ts` | NEW file | All AI routes | High |
| `infra/db/migrations/0037_ai_provider_keys.sql` | NEW migration | BYOK system | Medium |
| `infra/db/migrations/0038_ai_usage_logs.sql` | NEW migration | Metering + audit | Medium |
| `infra/db/migrations/0039_ai_credits.sql` | NEW migration | Credit billing | Medium |
| `apps/api/src/routes/ai.ts` | NEW routes | All AI API consumers | High |

### Important (needed for complete M8a-AI)

| Missing Component | Type | Complexity |
|---|---|---|
| `infra/db/migrations/0040_ai_hitl.sql` | NEW migration | Small |
| `infra/db/migrations/0041_workspace_ai_settings.sql` | NEW migration | Small |
| `apps/api/src/routes/admin-ai.ts` | NEW routes | Medium |
| `packages/ai-abstraction/src/capabilities.ts` | NEW file | Small |
| `packages/ai-abstraction/src/autonomy.ts` | NEW file | Small |
| `packages/ai-abstraction/src/billing.ts` | NEW file | Medium |
| `packages/ai-abstraction/src/audit.ts` | NEW file | Small |
| Workspace AI settings expansion | EXPAND `workspaces.ts` | Small |

### Deferred (M9+)

| Missing Component | Why Deferred |
|---|---|
| Background agent CRON engine | HITL infrastructure must be stable first |
| Agentic write boundary enforcement | Needs stable L2/L3/L4 rollout from M8 |
| AI video generation adapter | Provider ecosystem still maturing |
| AI-powered KYC OCR | High complexity; not P1 vertical dependency |
| AI USSD assistance | Architecturally excluded from USSD paths |
| Model fine-tuning per vertical | M11+ — requires data volume |

---

## What Must Be Expanded Now (Before Vertical AI Can Start)

The following 5 expansions MUST be complete before any vertical implements AI features:

1. **`packages/ai-abstraction/`** — Add capability types, router, billing, audit  
2. **`packages/entitlements/`** — Add `aiCapabilities` to plan-config; add capability guard  
3. **`packages/ai-adapters/`** — At least OpenAI and Anthropic adapters working  
4. **Migrations 0037–0039** — BYOK vault, usage logs, credit tables in D1  
5. **`apps/api/src/routes/ai.ts`** — Basic `/ai/complete` route working end-to-end  

Without these 5 in place, no vertical can call AI in a compliant, metered, tenant-isolated way.

---

## Dependencies Between M8-AI and M8-Verticals

```
M8a-AI-1 (types + migrations + env)
  ↓
M8a-AI-2 (adapters + router)
  ↓
M8a-AI-3 (routes + credits + BYOK)
  ↓
M8a-AI-4 (admin controls + HITL + workspace settings)
  ↓
[M8b Verticals AI] ‖ [M8c Verticals AI] ‖ [M8d Verticals AI] ‖ [M8e Verticals AI]
  (all parallel — each vertical completes vertical-ai-research-template.md first)
```

**M8a-AI blocks M8b/M8c/M8d/M8e AI features.**  
**M8a-AI does NOT block M8b/M8c/M8d/M8e non-AI features.**  
Verticals can implement their non-AI features (FSM, routing, KYC requirements, data models) while M8a-AI is in progress.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| OpenAI API pricing changes | Medium | Medium | Multi-provider design absorbs this |
| Cloudflare Workers CPU limit (50ms) on AI calls | High | High | All AI calls use `fetch()` async — CPU budget is for routing logic only, not AI inference |
| D1 write throughput on `ai_usage_logs` (high-frequency writes) | Medium | Medium | Use `ctx.waitUntil()` — non-blocking; log in batch if needed |
| BYOK key compromise | Low | High | AES-GCM encryption + hash dedup + is_active revocation |
| NDPR violation from AI processing PII | Medium | Critical | Consent check enforced at router level before any AI call on personal data |
| CBN concern about AI financial advice | Low | High | `sensitiveSectorRights` gate + HITL mandatory for all financial AI |
| Token cost overrun | Medium | Medium | Per-workspace CU caps + hard limit at 100% exhaustion |
| Provider outage (all providers simultaneously) | Very Low | High | 503 with `retry_after` — graceful degradation |

---

## Recommended Implementation Order (Dependency-Ordered)

```
Day 1: Repo audit docs (DONE) + plan-config.ts + env.ts + capabilities.ts
Day 2: Migrations 0037–0041 + billing.ts + audit.ts
Days 3–4: packages/ai-adapters/ (OpenAI + Anthropic)
Day 5: router.ts + router tests
Days 6–7: apps/api/src/routes/ai.ts + tests
Days 8–9: apps/api/src/routes/admin-ai.ts + HITL + workspace settings
Day 10: QA gate (74 scenarios) + typecheck + test count verification
  → After Day 10: All vertical AI features can begin in parallel
```
