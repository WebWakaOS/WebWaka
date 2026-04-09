# AI Billing, Credits, and Entitlements

**Status:** M8-AI Planning Baseline  
**Date:** 2026-04-08  
**Builds on:** `packages/entitlements/src/plan-config.ts`, `packages/payments/src/subscription-sync.ts`  
**Architectural decision:** ADL-008 (AI credits separate from subscription)

---

## 1. Metering Units Per Capability

All credit consumption is expressed in **credit units** (CU). 1 CU is the platform's internal accounting unit.

| Capability | Input | Output | CU Cost |
|---|---|---|---|
| Text generation (cost tier) | 1,000 tokens | 500 tokens | 1 CU |
| Text generation (best tier) | 1,000 tokens | 500 tokens | 5 CU |
| Summarization | 2,000 tokens | 200 tokens | 1 CU |
| Classification | 500 tokens | 50 tokens | 0.2 CU (round up) |
| Embeddings | 10,000 tokens | — | 1 CU |
| STT (transcription) | 1 minute audio | — | 5 CU |
| TTS | 1,000 characters | — | 1 CU |
| Image generation (1024×1024) | 1 image | — | 50 CU |
| Image understanding | 1 image analysis | 500 tokens | 20 CU |
| Video generation (per second) | 1 second | — | 100 CU |
| Video understanding (per minute) | 1 minute | 1,000 tokens | 30 CU |
| Research query | 1 query | 2,000 tokens | 10 CU |
| AI support chat (per exchange) | 500 tokens | 300 tokens | 2 CU |
| Sales assist (per session) | 1,000 tokens | 500 tokens | 3 CU |
| Analytics insight | 5,000 tokens (context) | 1,000 tokens | 5 CU |
| Agentic step | Per capability used | — | Varies |
| Automation step | Per capability used | — | Varies |
| Database write assist | 2,000 tokens | 500 tokens | 25 CU |

**CU → NGN conversion rate** (configurable by super admin, KV stored):
- Default: 1 CU = ₦0.05 (5 kobo)
- Credit pack pricing: 10,000 CU = ₦300 (₦0.03/CU — 40% discount for bulk)

---

## 2. Subscription Inclusion Rules

Each plan includes a monthly free allocation of CUs (platform-funded, not deducted from credit balance):

| Plan | Monthly Free CU | Notes |
|---|---|---|
| `free` | 0 | No AI access |
| `starter` | 0 | No AI access |
| `growth` | 500 CU | Text generation, support chat, email gen only |
| `pro` | 2,000 CU | All growth caps + embeddings, STT, TTS, analytics |
| `enterprise` | 10,000 CU | All capabilities including image gen, agents |
| `partner` | 20,000 CU | All capabilities; partner resells AI credits |
| `sub_partner` | 5,000 CU | All capabilities within partner allocation |

Monthly free CU resets on subscription renewal date. Does not roll over.

---

## 3. Trial Entitlements (Workspace Lifetime)

On first workspace creation, a one-time lifetime trial allocation is granted:

| Capability | Trial Allocation | Expires |
|---|---|---|
| Text generation | 50,000 tokens (≈50 CU) | 30 days from workspace creation |
| Embeddings | 1,000,000 tokens (≈100 CU) | 30 days |
| STT | 60 minutes (300 CU) | 30 days |
| TTS | 100,000 characters (100 CU) | 30 days |
| Image generation | 10 images (500 CU) | 30 days |
| Image understanding | 20 analyses (400 CU) | 30 days |
| Video generation | 3 × 10s clips (3,000 CU) | 30 days |
| Research | 20 queries (200 CU) | 30 days |
| AI support chat | 200 exchanges (400 CU) | 30 days |
| Agentic workflows | 5 runs (variable CU) | 30 days |

Trial CUs are consumed before subscription monthly CUs, which are consumed before purchased credit pack CUs.

Trial expiry does not block access — it simply stops the platform from funding trial CUs.

---

## 4. Credit Pack Rules

Workspaces can purchase top-up credit packs via Paystack:

| Pack Name | CU | Price (NGN) | CU/₦ |
|---|---|---|---|
| Starter Pack | 5,000 CU | ₦150 | 33.3 |
| Growth Pack | 20,000 CU | ₦500 | 40.0 |
| Pro Pack | 100,000 CU | ₦2,000 | 50.0 |
| Enterprise Pack | 500,000 CU | ₦8,000 | 62.5 |
| Custom | Negotiated | Negotiated | — |

**Credit pack purchase flow** (follows `packages/payments/src/subscription-sync.ts` pattern):
1. Workspace admin initiates Paystack checkout for credit pack amount
2. Paystack webhook fires on success
3. `syncAICreditPurchase()` inserts into `ai_credit_transactions` (credit type: `purchase`) and increments `ai_credit_balances.balance_cu`
4. Workspace admin receives email confirmation
5. Credits available immediately

---

## 5. Overage Handling

| Scenario | Behavior |
|---|---|
| Monthly free CU exhausted | Deduct from credit pack balance; if no credit pack, return 402 |
| Credit pack exhausted | Return 402 with top-up link; AI disabled until top-up |
| BYOK key active | Credits not consumed; BYOK pays provider directly |
| Emergency override | Super admin can grant emergency CU (audit logged, requires reason) |

No auto-charge on overage. Explicit purchase required.

---

## 6. Rate Limiting and Throttling

Extends `apps/api/src/middleware/rate-limit.ts` (KV-based sliding window):

| Scope | Limit | Window | KV Key Pattern |
|---|---|---|---|
| Per-workspace, all AI | 60 requests | 60 seconds | `rl:ai:ws:{workspace_id}` |
| Per-workspace, image gen | 5 requests | 60 seconds | `rl:ai:img:{workspace_id}` |
| Per-workspace, video gen | 2 requests | 300 seconds | `rl:ai:vid:{workspace_id}` |
| Per-workspace, agentic | 10 requests | 300 seconds | `rl:ai:agent:{workspace_id}` |
| Per-user, all AI | 30 requests | 60 seconds | `rl:ai:user:{user_id}` |
| Platform-wide, per provider | Managed by provider failover engine | — | — |

Rate limit errors return `429 Too Many Requests` with `Retry-After` header.

---

## 7. Platform-Funded vs User-Funded Usage

```
Platform-funded:
  → Monthly subscription CU allocation
  → Workspace trial CU allocation (30-day)
  → Super-admin emergency CU grant

User-funded (workspace pays credit pack):
  → Purchased credit packs (via Paystack)
  → Credit pack deducted per request

BYOK-funded (provider charges user/workspace directly):
  → User BYOK key active → no CU deduction; platform meters only
  → Workspace BYOK key active → no CU deduction; platform meters only
  → Usage still logged in ai_usage_logs with funded_by = 'byok'
```

---

## 8. Workspace Policy Overrides

Workspace admins can configure, within their plan limits:

| Setting | Options | Default |
|---|---|---|
| AI enabled | true/false | false (must explicitly enable) |
| Model tier | 'cost' / 'best' | 'cost' |
| Capabilities enabled | Array of AICapabilityType | All plan-allowed |
| User BYOK allowed | true/false | true (if plan allows) |
| Monthly CU budget cap | 0–plan_limit | plan_limit (no cap) |
| Auto top-up | true/false | false |
| Auto top-up threshold | CU amount | 1,000 CU |
| Auto top-up pack | Pack name | 'growth_pack' |

---

## 9. Disable / Enable Switches (Hierarchy)

```
Super admin global disable (KV: ai:global:enabled = false)
  → ALL AI requests fail with 503 "AI temporarily unavailable"
  → Overrides all workspace settings

Super admin per-capability disable (KV: ai:capability:{type}:enabled = false)
  → Specific capability disabled platform-wide
  → Example: emergency disable image gen

Workspace admin disable (D1: workspace_ai_settings.ai_enabled = false)
  → All AI for this workspace disabled
  → Does not affect other workspaces

Workspace admin per-capability disable
  → Specific capability disabled for this workspace

Plan-level disable (plan-config.ts: aiRights = false)
  → AI not available for this plan tier
  → requireAIAccess() guard throws EntitlementError
```

---

## 10. Admin Approval Gates

| Action | Who Approves | How |
|---|---|---|
| Enable AI for workspace | Workspace admin | Toggle in workspace settings |
| Register BYOK key | Workspace admin or user | API call with key validation |
| Enable image generation | Super admin (feature flag) + Workspace admin | Two-step: SA feature flag ON + WA enable |
| Enable video generation | Super admin feature flag + Workspace admin | Same as image |
| Enable agentic workflows | Super admin feature flag + Workspace admin | Same |
| Enable database write assist | Super admin feature flag + Workspace admin (Enterprise only) | Same |
| Emergency CU grant | Super admin + audit log reason | Admin API with mandatory reason field |
| Revoke workspace BYOK key | Workspace admin | `DELETE /ai/keys/:id` |
| Revoke user BYOK key | User (own key) or workspace admin | `DELETE /ai/keys/:id` |

---

## D1 Schema (Planned Migrations)

### migration 0037: `ai_provider_keys` (see ai-provider-routing.md for full schema)

### migration 0038: `ai_usage_logs`

```sql
CREATE TABLE ai_usage_logs (
  id                TEXT PRIMARY KEY,
  tenant_id         TEXT NOT NULL,
  workspace_id      TEXT NOT NULL,
  user_id           TEXT,
  capability        TEXT NOT NULL,     -- AICapabilityType
  provider          TEXT NOT NULL,
  model             TEXT NOT NULL,
  tokens_in         INTEGER DEFAULT 0,
  tokens_out        INTEGER DEFAULT 0,
  credits_consumed  REAL DEFAULT 0,
  funded_by         TEXT NOT NULL      -- 'trial' | 'subscription' | 'credit_pack' | 'user_byok' | 'workspace_byok' | 'admin_grant'
    CHECK (funded_by IN ('trial','subscription','credit_pack','user_byok','workspace_byok','admin_grant')),
  latency_ms        INTEGER,
  status            TEXT NOT NULL DEFAULT 'success'
    CHECK (status IN ('success','error','rate_limited','quota_exhausted')),
  vertical_slug     TEXT,
  created_at        INTEGER DEFAULT (unixepoch())
);
CREATE INDEX idx_aiul_workspace ON ai_usage_logs(workspace_id, created_at);
CREATE INDEX idx_aiul_tenant ON ai_usage_logs(tenant_id, created_at);
CREATE INDEX idx_aiul_user ON ai_usage_logs(user_id, created_at);
CREATE INDEX idx_aiul_capability ON ai_usage_logs(capability, created_at);
```

### migration 0039: `ai_credits`

```sql
CREATE TABLE ai_credit_balances (
  workspace_id        TEXT PRIMARY KEY REFERENCES workspaces(id),
  tenant_id           TEXT NOT NULL,
  trial_cu            REAL NOT NULL DEFAULT 0,
  subscription_cu     REAL NOT NULL DEFAULT 0,
  purchased_cu        REAL NOT NULL DEFAULT 0,
  total_consumed_cu   REAL NOT NULL DEFAULT 0,
  trial_expires_at    INTEGER,
  updated_at          INTEGER DEFAULT (unixepoch())
);

CREATE TABLE ai_credit_transactions (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES ai_credit_balances(workspace_id),
  tenant_id       TEXT NOT NULL,
  type            TEXT NOT NULL
    CHECK (type IN ('trial_grant','subscription_reset','credit_purchase','usage_debit','admin_grant','admin_revoke')),
  cu_amount       REAL NOT NULL,          -- positive = credit, negative = debit
  balance_after   REAL NOT NULL,          -- snapshot for audit
  reference       TEXT,                   -- Paystack ref for purchases
  admin_user_id   TEXT,                   -- for admin_grant/revoke
  reason          TEXT,                   -- for admin_grant/revoke
  created_at      INTEGER DEFAULT (unixepoch())
);
CREATE INDEX idx_aict_workspace ON ai_credit_transactions(workspace_id, created_at);
```
