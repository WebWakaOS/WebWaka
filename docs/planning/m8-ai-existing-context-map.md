# M8-AI Existing Context Map

**Status:** Complete  
**Date:** 2026-04-08  
**Purpose:** Map every current AI-relevant codepath and document in the repo.

---

## Package Map

```
packages/
├── ai-abstraction/              ← @webwaka/ai — TYPE CONTRACTS ONLY
│   ├── src/types.ts             ← AIProvider, AIAdapter, AIRequest, AIResponse
│   └── src/index.ts             ← re-exports
├── entitlements/               ← @webwaka/entitlements — AI GATING
│   ├── src/plan-config.ts       ← aiRights: bool per plan (growth+ = true)
│   ├── src/guards.ts            ← requireAIAccess(ctx) guard
│   ├── src/evaluate.ts          ← evaluateLayerAccess() engine
│   └── src/cbn-kyc-tiers.ts    ← KYC tier limits (affect AI financial ops)
├── payments/                   ← @webwaka/payments — BILLING PATTERNS
│   ├── src/subscription-sync.ts ← plan upgrade after payment (reuse for credits)
│   └── src/types.ts             ← BillingRecord (reuse pattern for AI usage)
├── types/                      ← @webwaka/types — SHARED TYPES
│   ├── src/subscription.ts      ← EntitlementDimensions.aiRights
│   └── src/enums.ts             ← PlatformLayer, SubscriptionPlan
└── [adapters — MISSING]        ← packages/ai-adapters/* — NOT YET CREATED
```

## App Map

```
apps/
├── api/
│   ├── src/env.ts               ← Worker bindings (AI keys MISSING)
│   ├── src/middleware/
│   │   ├── auth.ts              ← JWT validation (AI routes inherit this)
│   │   └── rate-limit.ts        ← KV rate limiter (extend for AI)
│   └── src/routes/
│       ├── workspaces.ts        ← Analytics stub (AI insights opportunity)
│       └── [ai routes MISSING] ← /ai/complete, /ai/keys, /ai/usage
├── admin-dashboard/             ← Super-admin AI controls surface (MISSING)
├── ussd-gateway/               ← USSD gateway (AI-EXCLUDED — 140 char limit)
└── [platform-admin/]           ← Workspace AI settings surface (MISSING)
```

## Migration Map (AI-Relevant)

```
infra/db/migrations/
├── 0004_init_subscriptions.sql  ← subscription plans referenced by aiRights
├── 0011_payments.sql            ← billing_history (pattern for AI billing)
├── 0022_agents.sql              ← field agent table (NOT AI agents — POS humans)
└── [AI tables MISSING]:
    ├── 0037_ai_provider_keys.sql ← BYOK + platform key vault
    ├── 0038_ai_usage_logs.sql    ← metering + audit
    └── 0039_ai_credits.sql       ← credit packs + quota tracking
```

## Document Map

```
docs/governance/
├── ai-policy.md                 ← 6 principles + 5 rules (M1 baseline)
├── platform-invariants.md       ← P7 (vendor neutral), P8 (BYOK)
├── entitlement-model.md         ← aiRights dimension defined
└── agent-execution-rules.md     ← Replit agent rules (NOT AI agents)

docs/architecture/decisions/
└── 0009-ai-provider-abstraction.md ← TDR-0009 (ACCEPTED, founder approved)

docs/[MISSING for M8-AI]:
├── docs/governance/ai-platform-master-plan.md
├── docs/governance/ai-capability-matrix.md
├── docs/governance/ai-provider-routing.md
├── docs/governance/ai-billing-and-entitlements.md
├── docs/governance/ai-agent-autonomy.md
├── docs/governance/ai-integration-framework.md
├── docs/governance/ai-context-map.md
├── docs/governance/ai-repo-wiring.md
├── docs/implementation/m8-ai-phase-plan.md
├── docs/templates/vertical-ai-research-template.md
└── docs/qa/ai-platform-qa-framework.md
```

---

## Per-Surface AI Opportunity and Dependency

| Surface | Package/App | Existing Hook | AI Opportunity | Dependency |
|---|---|---|---|---|
| Workspace activation | `apps/api/src/routes/workspaces.ts` | `requireAIAccess()` guard | AI feature unlock on upgrade | `ai_provider_keys` table |
| Plan entitlements | `packages/entitlements/src/plan-config.ts` | `aiRights: boolean` | Granular capability matrix | Extend plan-config |
| Discovery results | `apps/api/src/routes/discovery.ts` | None | Semantic search, ranked results | Embeddings adapter |
| Community content | `packages/community/src/community-space.ts` | None | AI post drafts, course outlines | Text adapter |
| Social posts | `packages/social/src/social-post.ts` | None | Caption, hashtag, translation | Text adapter |
| Contact routing | `packages/contact/src/channel-resolver.ts` | None | AI triage, auto-reply | Text adapter |
| Offerings | `packages/offerings/src/` | None | Product descriptions, pricing | Text adapter |
| Search indexing | `packages/search-indexing/src/` | None | Vector embeddings for semantic search | Embeddings adapter |
| POS anomaly | `packages/pos/src/float-ledger.ts` | None | Anomaly detection on float | Analytics capability |
| Identity docs | `packages/identity/src/` | None | AI OCR for document verification | Image understanding |
| Analytics | `apps/api/src/routes/workspaces.ts` | `/analytics` stub | AI-generated insights | Analytics capability |
| USSD gateway | `apps/ussd-gateway/src/index.ts` | None | EXCLUDED — 140 char hard limit | N/A |
| Admin dashboard | `apps/admin-dashboard/src/index.ts` | None | Super-admin AI controls | Admin API routes |

---

## Provider Resolution Chain (Current State vs Target)

### Current (M1 spec only — nothing implemented)
```
TDR-0009 says:
  1. Tenant BYOK key (if provided and valid)
  2. Platform default provider
  3. Fallback provider (if configured)
```

### Target (M8-AI design)
```
  1. User BYOK key (user-level, highest priority)
  2. Workspace BYOK key (workspace-level)
  3. Platform key pool (multiple keys per provider, load balanced)
  4. Fallback provider (different provider, platform key)
  5. Disabled (quota exhausted or super-admin disabled)
```

---

## Billing Pattern Reference (Reuse from Payments)

`packages/payments/src/subscription-sync.ts` defines the pattern:
```typescript
interface SyncPaymentToSubscriptionParams {
  workspaceId: string;
  paystackRef: string;
  amountKobo: number;
  metadata: Record<string, unknown>;
}
// Creates billing_history record → updates subscription plan
```

AI credits billing follows the same pattern:
```typescript
// (M8-AI target)
interface SyncAICreditPurchaseParams {
  workspaceId: string;
  tenantId: string;
  paystackRef: string;
  creditUnits: number;     // token units purchased
  capabilityType: AICapabilityType;
  metadata: Record<string, unknown>;
}
```
