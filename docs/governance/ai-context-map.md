# AI Context Map

**Status:** M8-AI Planning Baseline  
**Date:** 2026-04-08  
**Purpose:** Governance-level map of every AI touchpoint across the platform, present and planned  
**Detail source:** `docs/planning/m8-ai-existing-context-map.md`

> **3-in-1 Position:** AI is a cross-cutting intelligence layer that enhances all three pillars (Pillar 1 — Operations-Management, Pillar 2 — Branding, Pillar 3 — Marketplace). It is NOT a fourth pillar. All AI features must be accessed through the `@webwaka/ai-abstraction` and `@webwaka/ai-adapters` packages. See `docs/governance/3in1-platform-architecture.md` for authoritative pillar assignments.

---

## Platform AI Touchpoint Inventory

### Confirmed Existing (Pre-M8)

| Touchpoint | Location | Type | Status |
|---|---|---|---|
| AI type contracts | `packages/ai-abstraction/src/types.ts` | Foundation | Active (M3) |
| AI governance policy | `docs/governance/ai-policy.md` | Policy | Active (M1) |
| TDR-0009 | `docs/architecture/decisions/0009-ai-provider-abstraction.md` | Decision | Accepted (M1) |
| `aiRights` entitlement | `packages/entitlements/src/plan-config.ts` | Entitlement gate | Active |
| `requireAIAccess()` guard | `packages/entitlements/src/guards.ts` | Guard | Active |
| `EntitlementDimensions.aiRights` | `packages/types/src/subscription.ts` | Type contract | Active |
| KV rate limiter | `apps/api/src/middleware/rate-limit.ts` | Infrastructure | Active (extendable) |
| Billing pattern | `packages/payments/src/subscription-sync.ts` | Pattern (reuse) | Active |
| Field agents table | `infra/db/migrations/0022_agents.sql` | POS agents (NOT AI) | Active |

### Planned (M8-AI — This Milestone)

| Touchpoint | Location | Type | Phase |
|---|---|---|---|
| AI env vars | `apps/api/src/env.ts` (expand) | Config | M8a-AI-1 |
| Capability types | `packages/ai-abstraction/src/capabilities.ts` | Foundation | M8a-AI-1 |
| Provider router | `packages/ai-abstraction/src/router.ts` | Routing engine | M8a-AI-1/2 |
| Usage metering type | `packages/ai-abstraction/src/types.ts` (expand) | Type contract | M8a-AI-1 |
| BYOK key vault | `infra/db/migrations/0037_ai_provider_keys.sql` | Storage | M8a-AI-1 |
| Usage audit log | `infra/db/migrations/0038_ai_usage_logs.sql` | Audit | M8a-AI-1 |
| Credit system | `infra/db/migrations/0039_ai_credits.sql` | Billing | M8a-AI-1 |
| OpenAI adapter | `packages/ai-adapters/src/openai.ts` | Provider adapter | M8a-AI-2 |
| Anthropic adapter | `packages/ai-adapters/src/anthropic.ts` | Provider adapter | M8a-AI-2 |
| Google adapter | `packages/ai-adapters/src/google.ts` | Provider adapter | M8a-AI-2 |
| AI API routes | `apps/api/src/routes/ai.ts` | API | M8a-AI-3 |
| Super-admin AI routes | `apps/api/src/routes/admin-ai.ts` | Admin API | M8a-AI-4 |
| Workspace AI settings | `apps/api/src/routes/workspaces.ts` (extend) | API | M8a-AI-3 |
| Granular AI capabilities in plan-config | `packages/entitlements/src/plan-config.ts` (extend) | Entitlement | M8a-AI-1 |
| HITL queue | `infra/db/migrations/[0040]_ai_hitl.sql` | Workflow | M8a-AI-4 |
| Autonomy contracts | `packages/ai-abstraction/src/autonomy.ts` | Type contract | M8a-AI-4 |
| Write boundary enforcement | `packages/ai-abstraction/src/boundaries.ts` | Security | M8a-AI-4 |

### Planned (Per-Vertical — M8b+)

| Touchpoint | Location | Type | Phase |
|---|---|---|---|
| Politician AI config | `packages/verticals-politician/src/ai-config.ts` | Vertical config | M8b |
| POS Business AI config | `packages/verticals-pos-business/src/ai-config.ts` | Vertical config | M8b |
| Motor Park AI config | `packages/verticals-motor-park/src/ai-config.ts` | Vertical config | M8c |
| Church AI config | `packages/verticals-church/src/ai-config.ts` | Vertical config | M8d |
| NGO AI config | `packages/verticals-ngo/src/ai-config.ts` | Vertical config | M8d |
| Market AI config | `packages/verticals-market/src/ai-config.ts` | Vertical config | M8e |
| Creator AI config | `packages/verticals-creator/src/ai-config.ts` | Vertical config | M8e |

---

## Package / App Route Map

```
packages/ai-abstraction/     ← Core types + router (expand M8a-AI)
packages/ai-adapters/        ← Provider implementations (create M8a-AI)
packages/entitlements/       ← Plan capability matrix (expand M8a-AI)
packages/payments/           ← Billing patterns (reuse for credits)
packages/verticals-*/        ← Per-vertical AI configs (M8b+)

apps/api/routes/ai.ts        ← User-facing AI endpoints (create M8a-AI)
apps/api/routes/admin-ai.ts  ← Super-admin AI endpoints (create M8a-AI)
apps/api/env.ts              ← AI API key bindings (expand M8a-AI)
apps/admin-dashboard/        ← Super-admin AI control surface (M8a-AI-4)
```

---

## AI Opportunity Map by Vertical (P1 Only)

| Vertical | Primary AI Use Case | Capability | Plan Gate | HITL |
|---|---|---|---|---|
| Politician | Campaign content, schedule management | Text, TTS | Enterprise | Yes |
| Political Party | Comms drafts, member broadcast | Text | Enterprise | Yes |
| Motor Park | Route schedules, announcements | Text, TTS | Growth | No |
| Mass Transit | Route optimization, ETA estimation | Analytics | Growth | No |
| Rideshare | Demand prediction, dynamic pricing | Analytics | Pro | No |
| Haulage | Route + load optimization | Analytics | Pro | No |
| Church | Sermon outlines, announcements, devotionals | Text, TTS | Growth | No |
| NGO | Grant proposals, donor comms, beneficiary triage | Text, Classification | Growth/Enterprise | Triage: Yes |
| Cooperative | Financial summaries (read-only), meeting minutes | Text, Summarization | Growth | No |
| POS Business | Product descriptions, inventory alerts, sales insight | Text, Analytics | Growth | No |
| Market | Catalog enrichment, vendor onboarding | Text, Classification | Growth | No |
| Professional | Client proposals, portfolio descriptions | Text | Growth | No |
| School | Course outlines, parent communications | Text | Growth | No |
| Clinic | Patient comms (draft), triage routing | Text, Classification | Enterprise | Yes |
| Creator | Caption gen, content ideas, scheduling | Text, Image | Growth | No |
| Sole Trader | Product listings, customer chat | Text | Growth | No |
| Tech Hub | Event descriptions, member directory | Text, Summarization | Growth | No |
