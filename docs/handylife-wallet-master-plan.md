# HandyLife Wallet — Comprehensive Implementation-Ready Master Plan

**Document type:** Architecture & Implementation Planning  
**Status:** APPROVED FOR IMPLEMENTATION — Do not deviate without founder review  
**Date:** 2026-04-20  
**Author:** Replit Agent (deep platform discovery — all 278 migrations, 70+ docs, 11 apps, 175+ packages read)  
**Scope:** Build Once Use Infinitely shared financial capability for the HandyLife ecosystem and WebWaka platform  
**Phase 1 constraint:** Offline bank funding only; transfers/withdrawals/online funding designed but super-admin-disabled; WebWaka direct clients only; MLA earnings tracked but not paid out  
**Hard rule:** Do NOT implement until this plan is founder-approved.

---

## Table of Contents

1. [Review Method](#1-review-method)
2. [Current-State Findings](#2-current-state-findings)
3. [Finance Reuse Analysis](#3-finance-reuse-analysis)
4. [Wallet Scope](#4-wallet-scope)
5. [Canonical Domain Model](#5-canonical-domain-model)
6. [Target Architecture](#6-target-architecture)
7. [Feature Flag & Rollout Model](#7-feature-flag--rollout-model)
8. [Repo-by-Repo Impact](#8-repo-by-repo-impact)
9. [Phased Roadmap](#9-phased-roadmap)
10. [Risks & Controls](#10-risks--controls)
11. [Open Decisions](#11-open-decisions)
12. [Execution Backlog](#12-execution-backlog)

---

## 1. Review Method

### 1.1 Scope of Discovery

Every artifact in the monorepo was read before any design decision was made. The following were reviewed without exception:

**Migrations:** All 278 D1 migration files (0001–0278) including every financial schema, ledger table, payment table, KYC table, audit table, partner settlement table, and notification table.

**Apps (11 total):**
- `apps/api` — all route files: auth, bank-transfer, billing, claims, workspaces, partners, mobile-money, airtime, pos, identity, superagent, USSD, HITL, webhook, notifications
- `apps/platform-admin` — super admin dashboard
- `apps/partner-admin` — partner/tenant management
- `apps/brand-runtime` — Pillar 2 branded sites
- `apps/public-discovery` — Pillar 3 marketplace
- `apps/tenant-public` — per-tenant discovery
- `apps/ussd-gateway` — USSD micro-transactions
- `apps/projections` — CRON workers, HITL sweeps
- `apps/notificator` — notification queue consumer
- `apps/workspace-app` — workspace admin frontend (scaffolded)

**Packages (175+ read):**
- `packages/pos` — float ledger, agent wallets (primary reuse target)
- `packages/payments` — Paystack init/verify/webhook HMAC
- `packages/entitlements` — CBN KYC tiers T0–T3, plan-config, guards
- `packages/superagent` — WakaCU wallet (ADL-008 template)
- `packages/identity` — BVN/NIN/CAC/FRSC verification
- `packages/otp` — SMS OTP (Termii + Africa's Talking)
- `packages/auth-tenancy` — JWT, RBAC, tenant isolation
- `packages/notifications` — notification engine v2.1
- `packages/offline-sync` — Dexie + IndexedDB offline queue
- All 7 financial verticals: airtime-reseller, mobile-money-agent, cooperative, savings-group, hire-purchase, bureau-de-change, insurance-agent
- `packages/community`, `packages/social`, `packages/relationships`, `packages/geography`, `packages/claims`, `packages/verticals`

**Governance docs (30+):**
- platform-invariants (P1–P8, T1–T10)
- core-principles, security-baseline, white-label-policy
- 3in1-platform-architecture, universal-entity-model, relationship-schema
- vision-and-mission, entitlement-model
- partner-and-subpartner-model (4-level hierarchy, Phase 3 NOT STARTED)
- ai-architecture-decision-log (ADL-001–ADL-012)
- ai-billing-and-entitlements, superagent governance suite (01–06)
- All CBN KYC docs (cbn-kyc-tiers.md, kyc-compliance.md, cbn-kyc-audit.md)
- All NDPR docs (ndpr-consent.md, ndpr-consent-audit.md)
- agent-network.md, offline-sync.md

**Strategy & Planning docs:**
- negotiable-pricing-strategy.md (865 lines, full read)
- ops/implementation-plan.md (1460 lines, full read)
- All m8-ai-* planning docs
- All m7 enhancement docs

**QA, reports, runbooks:**
- All QA reports (m7a, m7b, m7c, m7ef, m8, m12, cbn-kyc-audit, ndpr-consent-audit, security-review-m7)
- All reports (governance-compliance-deep-audit, webwaka-implementation-audit, production-readiness-audit, milestone reports)
- All runbooks (rollback-procedure, secret-rotation)
- Both ADRs (notification-realtime-sse-upgrade-path, notification-retention-ttl)
- Enhancement roadmap (112 items, all cleared)
- Notification engine master implementation prompt (380 lines)

**HANDOVER.md** — full infrastructure, deployment, CI/CD, live endpoint state

### 1.2 Discovery Invariant

No design decision in this document was made before the discovery was complete. Every architectural choice below is grounded in what actually exists in the codebase, not assumptions about what might exist.

---

## 2. Current-State Findings

### 2.1 What Exists That Is Directly Reusable for Wallet

#### A. Float Ledger Pattern — PRIMARY REUSE TARGET
**File:** `packages/pos/src/float-ledger.ts` + migration `0024_float_ledger.sql`

This is the strongest financial primitive in the codebase. Key properties:
- **Append-only:** No UPDATE or DELETE on ledger rows — ever. Reversals are negative-amount credit entries.
- **Double-entry:** Every economic event has a corresponding entry pair (debit one side, credit another)
- **Integer kobo (P9):** `amount_kobo INTEGER NOT NULL` — no floats anywhere
- **Idempotent reference:** `reference TEXT UNIQUE NOT NULL` — re-submitting the same reference is a no-op
- **Reversal pattern:** `transaction_type = 'reversal'`, `amount_kobo < 0` — clean undo without mutation
- **Tenant isolation (T3):** `tenant_id` on every row, indexed for scoped queries
- **Balance via aggregate:** Balance is computed `SUM(amount_kobo)` from `float_ledger WHERE wallet_id = ?`

**Verdict:** The HandyLife Wallet ledger (`hl_ledger`) must follow this exact pattern without deviation.

#### B. Agent Wallets — BALANCE TABLE PATTERN
**File:** `packages/pos/src/wallet.ts` + migration `0022_agents.sql`

The `agent_wallets` table provides the balance-tracking pattern:
```sql
CREATE TABLE agent_wallets (
  id              TEXT PRIMARY KEY,
  agent_id        TEXT UNIQUE NOT NULL,
  balance_kobo    INTEGER NOT NULL DEFAULT 0,
  credit_limit_kobo INTEGER NOT NULL DEFAULT 0,
  tenant_id       TEXT NOT NULL,
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
```

The `balance_kobo` column is a **denormalized read-model** (updated atomically alongside ledger writes via conditional UPDATE: `WHERE balance_kobo >= debit_amount`). This prevents double-spend without a distributed lock.

**Verdict:** HandyLife wallet balance uses the same denormalized read-model + conditional UPDATE pattern.

#### C. WakaCU Wallet — SECOND REUSE TEMPLATE
**File:** migrations `0043_wc_wallets_transactions.sql`, `0044_partner_credit_pools.sql` + `packages/superagent` + ADL-008

The WakaCU wallet system (implemented for AI credits) is architecturally the closest analog to HandyLife Wallet:
- `wc_wallets` — per-workspace balance (integer WakaCU)
- `wc_transactions` — append-only credit/debit audit trail with `balance_after` snapshot
- `partner_credit_pools` — wholesale allocation from partner to workspace
- `partner_tenant_allocations` — per-allocation tracking

Key implementation insight from ADL-008: **Atomic deduction via conditional UPDATE:**
```sql
UPDATE wc_wallets SET balance_wc = balance_wc - ?, updated_at = unixepoch()
WHERE workspace_id = ? AND balance_wc >= ?
-- Returns rows_affected = 0 if balance insufficient → clean insufficient-funds error
```

**Verdict:** `hl_wallets` and `hl_ledger` follow this exact pattern with NGN kobo instead of WakaCU.

#### D. Bank Transfer Orders — PHASE 1 FUNDING FSM
**File:** `apps/api/src/routes/bank-transfer.ts` + migrations `0237_bank_transfer_orders.sql`, `0239_bank_transfer_disputes.sql`, `0238_workspace_default_payment.sql`

The bank transfer order system is the closest existing analog for Phase 1 wallet funding:

```sql
-- FSM: pending → proof_submitted → confirmed | rejected | expired
CREATE TABLE bank_transfer_orders (
  id, workspace_id, tenant_id, buyer_id,
  seller_entity_id, amount_kobo INTEGER NOT NULL CHECK (amount_kobo > 0),
  reference TEXT NOT NULL UNIQUE,      -- human-readable: WKA-20260414-ABCDE
  bank_name, account_number, account_name,
  status CHECK (status IN ('pending', 'proof_submitted', 'confirmed', 'rejected', 'expired')),
  proof_url TEXT,                      -- R2 URL for uploaded proof
  proof_submitted_at, confirmed_at, confirmed_by,
  rejection_reason,
  expires_at INTEGER NOT NULL          -- default 48h from creation
);
```

The dispute table (`0239_bank_transfer_disputes.sql`) supports fraud controls:
- Buyers can raise disputes within 24h of confirmation
- Platform admins review and can reverse confirmed status
- Dispute has its own FSM: open → under_review → resolved | escalated

**Verdict:** HandyLife wallet funding request creates a `bank_transfer_order` (existing table, no duplication) and links it to an `hl_funding_request` record. This reuses the full FSM, OTP confirmation, R2 proof upload, dispute, and audit trail already built.

#### E. CBN KYC Tiers — WALLET ELIGIBILITY GATE
**File:** `packages/entitlements/src/cbn-kyc-tiers.ts`

The complete CBN tier system already exists:
| Tier | Daily Limit | Monthly Cap | Balance Cap | Wallet |
|------|-------------|-------------|-------------|--------|
| T0 | ₦0 | ₦0 | ₦0 | Not allowed |
| T1 | ₦50,000 | ₦300,000 | ₦300,000 | Allowed (basic) |
| T2 | ₦200,000 | ₦1,000,000 | ₦1,000,000 | Allowed (standard) |
| T3 | Unlimited | Unlimited | Unlimited | Allowed (premium) |

`requireKYCTier(ctx, minTier, transactionAmount?)` already throws `KYCUpgradeRequired` with 403 response.

**Verdict:** HandyLife Wallet calls `requireKYCTier(ctx, 1)` on wallet creation, `requireKYCTier(ctx, 1, amountKobo)` on every funding and spend operation. T1 minimum to hold a wallet. T2 required for operations above ₦50,000.

#### F. Partner Settlements — MLA EARNINGS PATTERN
**File:** migration `0222_partner_revenue_share.sql`, `apps/api/src/routes/partners.ts`

```sql
CREATE TABLE partner_settlements (
  gross_gmv_kobo      INTEGER NOT NULL DEFAULT 0,
  platform_fee_kobo   INTEGER NOT NULL DEFAULT 0,
  partner_share_kobo  INTEGER NOT NULL DEFAULT 0,
  share_basis_points  INTEGER NOT NULL DEFAULT 0  -- e.g. 500 = 5%
  CHECK (share_basis_points >= 0 AND share_basis_points <= 10000),
  status CHECK (status IN ('pending', 'approved', 'paid', 'disputed', 'cancelled'))
);
```

**Verdict:** MLA (Multi-Level Affiliate) earnings follow the `share_basis_points` model. The `hl_mla_earnings` table uses `commission_bps` (basis points of the transacted amount) as the primary commission basis. This is consistent with the platform's existing revenue share model and the `commission_kobo` scatter pattern found across 15+ verticals.

#### G. Transactions Table — PLATFORM-LEVEL LEDGER
**File:** migration `0225a_create_transactions.sql`

```sql
CREATE TABLE transactions (
  id, tenant_id, workspace_id,
  amount_kobo INTEGER NOT NULL DEFAULT 0 CHECK (amount_kobo >= 0),
  tx_type TEXT NOT NULL DEFAULT 'payment',
  status CHECK (status IN ('pending','success','failed','refunded','reversed')),
  reference, paystack_ref, metadata TEXT NOT NULL DEFAULT '{}'
);
```

**Verdict:** HandyLife Wallet spend events cross-reference this table for platform-level audit. Every wallet debit that corresponds to a product/service purchase links to a `transactions` row.

#### H. Notification Engine — WALLET EVENTS DELIVERY
**Files:** Migrations 0254–0278, `packages/notifications`, `apps/notificator`

The full notification engine v2.1 is live with 20 migrations, 25 guardrails, 9 channels (email, SMS, WhatsApp, push, in-app, Telegram, Slack, webhook), and a template system seeded with platform templates. Notification events are emitted via `publishEvent()` from `packages/events`.

**Verdict:** HandyLife Wallet emits standard `notification_event` rows for: `wallet.funded`, `wallet.spend`, `wallet.funding_rejected`, `wallet.balance_low`, `wallet.mla_credited`, `wallet.transfer_disabled`, `wallet.withdrawal_disabled`. No bespoke notification infrastructure needed.

#### I. HITL Escalations — HIGH-VALUE OPERATION REVIEW
**Files:** migration `0236_hitl_escalations.sql`, `apps/projections`

The HITL (Human-in-the-Loop) escalation system supports regulatory-level review queues.

**Verdict:** Wallet funding confirmations above ₦100,000 (configurable via KV flag `wallet:hitl_threshold_kobo`) are automatically added to the HITL review queue for admin confirmation before crediting. This implements the CBN requirement that high-value cash-in operations have human oversight.

#### J. Audit Logging — APPEND-ONLY COMPLIANCE
**File:** `apps/api/src/middleware/audit-log.ts` + migration `0193_sec004_audit_logs.sql`

Every destructive and financial operation must emit an audit_log row. Audit logs are append-only (no UPDATE, no DELETE). Fields: `tenant_id, user_id, action, resource_type, resource_id, timestamp, ip_hash`.

**Verdict:** All HandyLife Wallet mutations (credit, debit, freeze, unfreeze, feature flag change) emit audit log rows.

### 2.2 What Is Partially Relevant

**Negotiable Pricing Strategy** (865-line doc): Introduces `pricing_mode`, `negotiation_sessions`, `price_guardrails`. The HandyLife Wallet must be designed to support wallet-funded checkout in the future, but this is NOT Phase 1 scope. The architecture allows a wallet spend to be triggered from a negotiation-accepted price.

**Dual-Currency Fields** (migration 0245): `original_currency_code`, `original_amount`, `fx_rate_used`. HandyLife Wallet Phase 1 is NGN-only, but the `hl_ledger` should include a `currency_code TEXT NOT NULL DEFAULT 'NGN'` column for Africa-First future expansion.

**B2B RFQs/POs/Invoices** (migrations 0246–0249): Future wallet-funded B2B commerce. Phase 1 excludes B2B, but the wallet architecture must not block this use case.

**Partner Phase 3 (NOT STARTED):** Partner billing, revenue share engine, WakaCU wholesale — documented in partner-and-subpartner-model.md as Phase 3. MLA affiliate earnings for HandyLife wallet will need to co-exist with this future partner earnings model. The HandyLife MLA model is implemented in `packages/hl-wallet` and must be designed for eventual migration into the partner settlements framework.

### 2.3 What Does Not Exist (Gaps — Must Build)

| Gap | Severity | Resolution |
|-----|----------|------------|
| No user-facing wallet (all wallets are workspace/agent scoped) | CRITICAL | Build `hl_wallets` per-user, not per-workspace |
| No unified affiliate/MLA earnings table | HIGH | Build `hl_mla_earnings` with basis_points model |
| No wallet eligibility entitlement gate | HIGH | Build via KV feature flags + tenant allowlist |
| No wallet spend-from-wallet checkout path | HIGH | Build `hl_spend_events` + route integration |
| No super admin wallet feature flag UI | MEDIUM | Add to platform-admin routes |
| No wallet balance notification triggers | MEDIUM | Wire into notification engine event keys |
| No multi-vertical MLA commission aggregation | MEDIUM | Build in Phase 2 |
| No wallet-funded payment mode in vertical routes | LOW (Phase 2) | Design now, implement in Wave 2 |

### 2.4 Critical Invariants Confirmed Active

From the governance compliance deep audit (2026-04-11), these are **WELL-ENFORCED** and must not be violated:

| Invariant | Evidence | Wallet Impact |
|-----------|----------|---------------|
| P1 Build Once | 175 shared packages, no vertical reimplements auth/payments | `packages/hl-wallet` must be shared, not per-vertical |
| P9 Integer Kobo | CI check: `check-monetary-integrity.ts` | All `hl_*` amounts: `INTEGER` with kobo, no REAL |
| T3 Tenant Isolation | CI scan on every query | `tenant_id NOT NULL` on all `hl_*` tables |
| T4 Monetary Integrity | CI + Zod validation | All route handlers validate `amount_kobo` as integer ≥ 0 |
| T5 Entitlement Gated | Entitlement middleware on all vertical routes | Wallet routes behind `requireWalletEntitlement()` |
| T7 Claim-First | 8-state FSM with transition guards | Wallet uses FSM for lifecycle management |
| Audit Append-Only | `audit_logs` table, no DELETE | `hl_ledger` and `audit_logs` are append-only forever |
| NDPR Consent | `assertChannelConsent()` before any PII processing | Wallet features require `payment_data` consent before activation |

---

## 3. Finance Reuse Analysis

### 3.1 Reuse Decision Matrix

| Existing Primitive | Reuse Decision | How It Is Reused |
|-------------------|----------------|------------------|
| `float_ledger` schema pattern | **REPLICATE** (new table `hl_ledger`) | Same append-only, double-entry, idempotent reference, negative-reversal pattern |
| `agent_wallets` balance model | **REPLICATE** (new table `hl_wallets`) | Same denormalized `balance_kobo` + conditional UPDATE atomic deduction |
| `wc_wallets` + `wc_transactions` | **REPLICATE** (new tables) | Same balance snapshot + `balance_after` on every ledger row |
| `bank_transfer_orders` table | **REUSE DIRECTLY** (no new table) | Wallet funding requests create rows in the existing table |
| `bank_transfer_disputes` table | **REUSE DIRECTLY** | Wallet funding disputes use existing dispute table |
| `requireKYCTier()` | **REUSE DIRECTLY** | Called in all wallet route handlers |
| `partner_settlements.share_basis_points` | **REPLICATE** (`commission_bps` in `hl_mla_earnings`) | Same basis-points arithmetic |
| `transactions` table | **REFERENCE** | Wallet spend events write a `transactions` row for platform-level audit |
| `audit_logs` table | **REUSE DIRECTLY** | All wallet mutations emit audit log rows |
| Notification engine events | **REUSE DIRECTLY** | `publishEvent()` emits wallet-domain events |
| `assertChannelConsent()` | **REUSE DIRECTLY** | Consent gate before wallet activation |
| `HITL` queue + escalations | **REUSE DIRECTLY** | High-value funding above threshold triggers HITL |
| Paystack webhook pattern | **REUSE** (future online funding) | For future Paystack virtual account funding (Phase 2+) |
| KV feature flag pattern | **REPLICATE** | `WALLET_KV` namespace, keys: `wallet:flag:{feature}` |

### 3.2 What Must NOT Be Rebuilt

- Authentication and JWT validation — existing `jwtAuthMiddleware`
- RBAC — existing `requireRole()`
- Tenant isolation enforcement — existing patterns
- OTP — existing `packages/otp`
- BVN/NIN verification — existing `packages/identity`
- NDPR consent gates — existing `assertChannelConsent()`
- Rate limiting — existing `RATE_LIMIT_KV` KV sliding window
- Webhook delivery — existing `webhook_subscriptions` + dispatcher
- Offline sync — existing Dexie + IndexedDB pattern in `packages/offline-sync`
- Notification delivery — existing 9-channel engine

### 3.3 The Canonical Atomic Debit Pattern

This is the single most important implementation detail. Every wallet debit MUST use this pattern:

```typescript
// packages/hl-wallet/src/ledger.ts
export async function debitWallet(
  db: D1Database,
  walletId: string,
  tenantId: string,
  amountKobo: number,
  txType: HlLedgerTxType,
  reference: string,
  description: string
): Promise<HlLedgerEntry> {
  // Step 1: Atomic conditional debit — returns 0 rows if insufficient funds
  const result = await db.prepare(`
    UPDATE hl_wallets
    SET balance_kobo = balance_kobo - ?,
        updated_at = unixepoch()
    WHERE id = ?
      AND tenant_id = ?
      AND balance_kobo >= ?
      AND status = 'active'
  `).bind(amountKobo, walletId, tenantId, amountKobo).run();

  if (result.meta.changes === 0) {
    // Either insufficient balance, wrong tenant, or wallet not active
    const wallet = await db.prepare(
      'SELECT balance_kobo, status FROM hl_wallets WHERE id = ? AND tenant_id = ?'
    ).bind(walletId, tenantId).first();
    if (!wallet) throw new WalletError('WALLET_NOT_FOUND');
    if (wallet.status !== 'active') throw new WalletError('WALLET_FROZEN');
    throw new WalletError('INSUFFICIENT_BALANCE', { balance: wallet.balance_kobo, required: amountKobo });
  }

  // Step 2: Get current balance after update
  const updated = await db.prepare(
    'SELECT balance_kobo FROM hl_wallets WHERE id = ? AND tenant_id = ?'
  ).bind(walletId, tenantId).first<{ balance_kobo: number }>();

  // Step 3: Append ledger entry (immutable audit trail)
  const entry: HlLedgerEntry = {
    id: generateId('hl_ledger'),
    walletId,
    tenantId,
    entryType: 'debit',
    amountKobo: -amountKobo,   // negative for debits (P9: sign encodes direction)
    balanceAfter: updated!.balance_kobo,
    txType,
    reference,
    description,
    currencyCode: 'NGN',
    createdAt: Math.floor(Date.now() / 1000)
  };

  await db.prepare(`
    INSERT INTO hl_ledger (id, wallet_id, tenant_id, entry_type, amount_kobo,
      balance_after, tx_type, reference, description, currency_code, created_at)
    VALUES (?, ?, ?, 'debit', ?, ?, ?, ?, ?, 'NGN', unixepoch())
  `).bind(
    entry.id, walletId, tenantId, -amountKobo,
    entry.balanceAfter, txType, reference, description
  ).run();

  return entry;
}
```

---

## 4. Wallet Scope

### 4.1 What HandyLife Wallet Is

HandyLife Wallet is a **shared, ledger-backed, user-level financial capability** embedded in the WebWaka platform. It is:

- A prepaid NGN wallet held by an individual user (not a workspace, not an agent)
- Governed by CBN KYC tiers for balance caps and daily limits
- Fundable via offline bank transfer in Phase 1
- Spendable within the HandyLife/WebWaka ecosystem for products and services
- The future home for MLA (Multi-Level Affiliate) earnings payouts
- White-labelable: branded as "HandyLife Wallet" for the HandyLife rollout; generalizable to any tenant
- A Build-Once Use-Infinitely primitive: deployed once in `packages/hl-wallet`, usable across all WebWaka verticals, partners, and white-label tenants

### 4.2 Phase 1 Hard Boundaries

| Capability | Phase 1 Status | Mechanism |
|-----------|----------------|-----------|
| Wallet creation | ✅ Enabled (eligible tenants only) | KV flag `wallet:eligible_tenants` allowlist |
| Balance check | ✅ Enabled | GET /wallet/balance |
| Ledger view | ✅ Enabled | GET /wallet/ledger |
| Fund via offline bank transfer | ✅ Enabled | Reuses `bank_transfer_orders` FSM |
| Fund via card/online | ❌ DISABLED (designed) | KV flag `wallet:flag:online_funding_enabled = 0` |
| Spend within ecosystem | ✅ Enabled (vertical routes call debitWallet) | POST /wallet/spend |
| Wallet-to-wallet transfer | ❌ DISABLED (designed) | KV flag `wallet:flag:transfers_enabled = 0` |
| Withdrawal to bank account | ❌ DISABLED (designed) | KV flag `wallet:flag:withdrawals_enabled = 0` |
| MLA earnings tracking | ✅ Enabled (tracked, not paid) | Rows written to `hl_mla_earnings`, status = 'pending' |
| MLA payout to wallet | ❌ Phase 2 only | `hl_mla_earnings.status` remains 'pending' in Phase 1 |
| External integrations (NIBSS, etc.) | ❌ Phase 3+ | Architecture accommodates, not built |
| USSD wallet access | ❌ Phase 3+ (USSD balance query only) | ADL-006: no AI on USSD; wallet spend on USSD is future |

### 4.3 Who Is Eligible (Phase 1)

Only **direct WebWaka clients** (not sub-partners or downstream entities managed by partners) are eligible in Phase 1. Eligibility is:

1. User has KYC Tier ≥ 1 (phone OTP verified + full name)
2. User's `tenant_id` is in the `wallet:eligible_tenants` KV set (super admin configures)
3. User has provided `payment_data` NDPR consent
4. Tenant has wallet feature enabled (KV flag `wallet:tenant:{tenant_id}:enabled = 1`)

Affiliate/MLA users: Tracked in Phase 1, wallet only accessible to direct clients.

### 4.4 Scope of "Build Once Use Infinitely"

The `packages/hl-wallet` package must be usable by:
- Any vertical route (airtime, POS sale, cooperative contribution, savings group payout, hire purchase installment)
- Any partner's tenant (once eligible)
- Any white-label HandyLife deployment
- Future Africa-First expansion (currency_code column future-proofs the schema)

The package MUST NOT contain:
- Any vertical-specific business logic
- Any partner-specific commission logic
- Any tenant-specific branding

---

## 5. Canonical Domain Model

### 5.1 Core Tables

#### `hl_wallets` — User Wallet Balance (Denormalized Read-Model)

```sql
-- Migration: 0279_hl_wallets.sql
-- HandyLife Wallet — per-user wallet balance (denormalized read-model)
-- Balances are updated atomically alongside hl_ledger inserts.
-- P9: balance_kobo INTEGER — no floats. T3: tenant_id NOT NULL.
-- KYC: kyc_tier drives daily limits and balance cap (CBN compliance).
-- Status FSM: pending_kyc → active → frozen → closed (terminal)

CREATE TABLE IF NOT EXISTS hl_wallets (
  id                    TEXT NOT NULL PRIMARY KEY,    -- 'hlw_' + ulid
  user_id               TEXT NOT NULL,               -- FK → users.id
  tenant_id             TEXT NOT NULL,               -- T3: always scoped
  workspace_id          TEXT NOT NULL,               -- eligibility context
  balance_kobo          INTEGER NOT NULL DEFAULT 0 CHECK (balance_kobo >= 0),
  lifetime_funded_kobo  INTEGER NOT NULL DEFAULT 0,  -- all-time deposits
  lifetime_spent_kobo   INTEGER NOT NULL DEFAULT 0,  -- all-time spend
  kyc_tier              INTEGER NOT NULL DEFAULT 1 CHECK (kyc_tier IN (1, 2, 3)),
  status                TEXT NOT NULL DEFAULT 'pending_kyc'
                        CHECK (status IN ('pending_kyc', 'active', 'frozen', 'closed')),
  currency_code         TEXT NOT NULL DEFAULT 'NGN', -- Africa-First expansion hook
  frozen_reason         TEXT,                        -- set when status = 'frozen'
  closed_at             INTEGER,
  closed_reason         TEXT,
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX idx_hl_wallets_user_tenant ON hl_wallets(user_id, tenant_id);
CREATE INDEX idx_hl_wallets_tenant ON hl_wallets(tenant_id, status);
CREATE INDEX idx_hl_wallets_workspace ON hl_wallets(workspace_id, tenant_id);
```

**Wallet FSM:**
```
pending_kyc → active      (guard: kyc_tier >= 1 AND status = 'pending_kyc')
active      → frozen      (guard: admin_action OR compliance_trigger)
frozen      → active      (guard: admin_unfreezes, resolution documented)
active      → closed      (guard: user_request AND balance_kobo = 0)
frozen      → closed      (guard: admin_closes, balance must be 0 or refunded)
```

#### `hl_ledger` — Append-Only Double-Entry Ledger

```sql
-- Migration: 0280_hl_ledger.sql
-- HandyLife Wallet Ledger — canonical append-only double-entry audit trail
-- NEVER UPDATE OR DELETE rows in this table.
-- Reversals are new rows with negative amount_kobo and tx_type = 'reversal'.
-- P9: amount_kobo INTEGER — positive = credit, negative = debit.
-- Idempotent: reference UNIQUE — re-submitting same reference is safe.
-- balance_after is a snapshot at insert time for audit; do NOT use for live balance.

CREATE TABLE IF NOT EXISTS hl_ledger (
  id            TEXT NOT NULL PRIMARY KEY,            -- 'hll_' + ulid
  wallet_id     TEXT NOT NULL REFERENCES hl_wallets(id),
  user_id       TEXT NOT NULL,
  tenant_id     TEXT NOT NULL,                        -- T3: always scoped
  entry_type    TEXT NOT NULL CHECK (entry_type IN ('credit', 'debit')),
  amount_kobo   INTEGER NOT NULL,                     -- positive = credit, negative = debit (P9)
  balance_after INTEGER NOT NULL,                     -- snapshot of wallet.balance_kobo after this entry
  tx_type       TEXT NOT NULL CHECK (tx_type IN (
    'bank_fund',        -- offline bank transfer confirmed
    'spend',            -- payment for goods/services
    'reversal',         -- reversal of any prior entry (negative amount_kobo)
    'mla_credit',       -- MLA affiliate commission payout (Phase 2+)
    'admin_adjust',     -- super admin correction (audit + reason required)
    'refund',           -- refund of a prior spend
    'withdrawal_reserved', -- withdrawal reserved (Phase 2+, currently always reversed)
    'transfer_out',     -- wallet-to-wallet transfer debit (Phase 2+)
    'transfer_in'       -- wallet-to-wallet transfer credit (Phase 2+)
  )),
  reference     TEXT NOT NULL UNIQUE,                 -- idempotency key
  description   TEXT NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'NGN',
  related_id    TEXT,                                 -- bank_transfer_order.id | spend_event.id | etc.
  related_type  TEXT,                                 -- 'bank_transfer_order' | 'hl_spend_event' | etc.
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
  -- NO updated_at — this table is append-only, never updated
);

CREATE INDEX idx_hl_ledger_wallet ON hl_ledger(wallet_id, created_at DESC);
CREATE INDEX idx_hl_ledger_tenant ON hl_ledger(tenant_id, created_at DESC);
CREATE INDEX idx_hl_ledger_user ON hl_ledger(user_id, created_at DESC);
CREATE INDEX idx_hl_ledger_reference ON hl_ledger(reference);  -- idempotency lookup
CREATE INDEX idx_hl_ledger_related ON hl_ledger(related_type, related_id);
```

#### `hl_funding_requests` — Bank Transfer Funding Link

```sql
-- Migration: 0281_hl_funding_requests.sql
-- Links a wallet to a bank_transfer_order.
-- bank_transfer_orders handles the full FSM + proof upload + disputes.
-- This table is the join: hl_wallets ↔ bank_transfer_orders.
-- When bank_transfer_order.status = 'confirmed', a cron/webhook credits hl_wallets.

CREATE TABLE IF NOT EXISTS hl_funding_requests (
  id                    TEXT NOT NULL PRIMARY KEY,    -- 'hlfr_' + ulid
  wallet_id             TEXT NOT NULL REFERENCES hl_wallets(id),
  user_id               TEXT NOT NULL,
  tenant_id             TEXT NOT NULL,
  bank_transfer_order_id TEXT NOT NULL REFERENCES bank_transfer_orders(id),
  amount_kobo           INTEGER NOT NULL CHECK (amount_kobo > 0),
  status                TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'confirmed', 'rejected', 'expired', 'reversed')),
  ledger_entry_id       TEXT,                         -- hl_ledger.id once credited
  confirmed_at          INTEGER,
  confirmed_by          TEXT,                         -- user_id of admin who confirmed
  rejection_reason      TEXT,
  hitl_required         INTEGER NOT NULL DEFAULT 0    -- 1 if above hitl_threshold_kobo
    CHECK (hitl_required IN (0, 1)),
  hitl_queue_item_id    TEXT,                         -- FK → hitl_queue if hitl_required
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX idx_hl_fr_order ON hl_funding_requests(bank_transfer_order_id);
CREATE INDEX idx_hl_fr_wallet ON hl_funding_requests(wallet_id, status);
CREATE INDEX idx_hl_fr_tenant ON hl_funding_requests(tenant_id, created_at DESC);
CREATE INDEX idx_hl_fr_pending ON hl_funding_requests(status, expires_at)
  WHERE status = 'pending';
```

#### `hl_spend_events` — Wallet Spend Tracking

```sql
-- Migration: 0282_hl_spend_events.sql
-- Records each wallet spend event linked to a vertical/order.
-- status = 'reserved' when debit is held pending order confirmation.
-- status = 'completed' when order is fulfilled.
-- status = 'reversed' when order is cancelled/refunded.

CREATE TABLE IF NOT EXISTS hl_spend_events (
  id              TEXT NOT NULL PRIMARY KEY,          -- 'hlse_' + ulid
  wallet_id       TEXT NOT NULL REFERENCES hl_wallets(id),
  user_id         TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  vertical_slug   TEXT,                               -- e.g. 'cooperative', 'airtime-reseller'
  order_id        TEXT,                               -- vertical-specific order ID
  order_type      TEXT,                               -- e.g. 'contribution', 'airtime', 'pos_sale'
  amount_kobo     INTEGER NOT NULL CHECK (amount_kobo > 0),
  status          TEXT NOT NULL DEFAULT 'reserved'
                  CHECK (status IN ('reserved', 'completed', 'reversed', 'failed')),
  ledger_debit_id TEXT,                               -- hl_ledger.id for the debit entry
  ledger_refund_id TEXT,                              -- hl_ledger.id for the reversal (if reversed)
  transactions_id TEXT,                               -- transactions.id for platform ledger
  completed_at    INTEGER,
  reversed_at     INTEGER,
  reversal_reason TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_hl_se_wallet ON hl_spend_events(wallet_id, status, created_at DESC);
CREATE INDEX idx_hl_se_tenant ON hl_spend_events(tenant_id, created_at DESC);
CREATE INDEX idx_hl_se_order ON hl_spend_events(order_type, order_id);
```

#### `hl_mla_earnings` — Affiliate Commission Tracking

```sql
-- Migration: 0283_hl_mla_earnings.sql
-- Multi-Level Affiliate (MLA) commission tracking.
-- Phase 1: status stays 'pending' — not credited to wallet.
-- Phase 2+: batch settlement credits to hl_wallets via cron.
-- commission_bps: basis points of transacted amount (500 = 5%).
-- All amounts P9: integer kobo.

CREATE TABLE IF NOT EXISTS hl_mla_earnings (
  id                TEXT NOT NULL PRIMARY KEY,        -- 'hlmla_' + ulid
  wallet_id         TEXT NOT NULL REFERENCES hl_wallets(id),
  earner_user_id    TEXT NOT NULL,                    -- user earning the commission
  tenant_id         TEXT NOT NULL,
  source_vertical   TEXT,                             -- vertical slug that generated the commission
  source_order_id   TEXT,                             -- vertical order/contribution ID
  source_spend_event_id TEXT,                         -- hl_spend_events.id (the qualifying spend)
  referral_level    INTEGER NOT NULL DEFAULT 1 CHECK (referral_level IN (1, 2, 3)),
                                                      -- 1 = direct referral, 2 = 2nd tier, 3 = 3rd tier
  commission_bps    INTEGER NOT NULL CHECK (commission_bps >= 0 AND commission_bps <= 10000),
  commission_kobo   INTEGER NOT NULL CHECK (commission_kobo >= 0),  -- computed: amount * commission_bps / 10000
  base_amount_kobo  INTEGER NOT NULL,                 -- amount the commission was computed from
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'payable', 'credited', 'voided')),
  period_start      TEXT,                             -- ISO date YYYY-MM-DD (for batch settlement)
  period_end        TEXT,
  ledger_entry_id   TEXT,                             -- hl_ledger.id once credited (Phase 2+)
  credited_at       INTEGER,
  voided_at         INTEGER,
  void_reason       TEXT,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_hl_mla_wallet ON hl_mla_earnings(wallet_id, status, created_at DESC);
CREATE INDEX idx_hl_mla_tenant ON hl_mla_earnings(tenant_id, status);
CREATE INDEX idx_hl_mla_period ON hl_mla_earnings(tenant_id, period_start, status);
CREATE INDEX idx_hl_mla_earner ON hl_mla_earnings(earner_user_id, status);
```

#### `hl_withdrawal_requests` — Designed, Disabled in Phase 1

```sql
-- Migration: 0284_hl_withdrawal_requests.sql
-- Withdrawal requests from wallet to bank account.
-- Phase 1: ALL inserts rejected by route layer (feature flag check returns 503).
-- Phase 2+: Paystack Transfers API or NIBSS direct debit.
-- This table is CREATED NOW so the schema is ready; no data will be written in Phase 1.

CREATE TABLE IF NOT EXISTS hl_withdrawal_requests (
  id              TEXT NOT NULL PRIMARY KEY,          -- 'hlwr_' + ulid
  wallet_id       TEXT NOT NULL REFERENCES hl_wallets(id),
  user_id         TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  amount_kobo     INTEGER NOT NULL CHECK (amount_kobo > 0),
  bank_code       TEXT NOT NULL,
  account_number  TEXT NOT NULL,
  account_name    TEXT NOT NULL,
  paystack_recipient_code TEXT,                       -- Paystack Transfer recipient code
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')),
  reference       TEXT NOT NULL UNIQUE,
  provider_ref    TEXT,                               -- Paystack transfer reference
  rejection_reason TEXT,
  completed_at    INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_hl_wr_wallet ON hl_withdrawal_requests(wallet_id, status);
CREATE INDEX idx_hl_wr_tenant ON hl_withdrawal_requests(tenant_id, status, created_at DESC);
```

#### `hl_transfer_requests` — Designed, Disabled in Phase 1

```sql
-- Migration: 0285_hl_transfer_requests.sql
-- Wallet-to-wallet transfer within WebWaka ecosystem.
-- Phase 1: ALL inserts rejected by route layer (feature flag check returns 503).
-- Phase 2+: Atomic double-ledger-entry (debit sender, credit receiver).

CREATE TABLE IF NOT EXISTS hl_transfer_requests (
  id              TEXT NOT NULL PRIMARY KEY,          -- 'hltx_' + ulid
  from_wallet_id  TEXT NOT NULL REFERENCES hl_wallets(id),
  to_wallet_id    TEXT NOT NULL REFERENCES hl_wallets(id),
  from_user_id    TEXT NOT NULL,
  to_user_id      TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,                      -- T3: transfers within same tenant only
  amount_kobo     INTEGER NOT NULL CHECK (amount_kobo > 0),
  reference       TEXT NOT NULL UNIQUE,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'completed', 'reversed', 'rejected')),
  from_ledger_id  TEXT,                               -- hl_ledger.id for debit
  to_ledger_id    TEXT,                               -- hl_ledger.id for credit
  completed_at    INTEGER,
  reversal_reason TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_hl_tr_from ON hl_transfer_requests(from_wallet_id, status);
CREATE INDEX idx_hl_tr_to ON hl_transfer_requests(to_wallet_id, status);
CREATE INDEX idx_hl_tr_tenant ON hl_transfer_requests(tenant_id, created_at DESC);
```

### 5.2 KV Feature Flag Keys

All feature flags live in the `WALLET_KV` KV namespace. Keys use `wallet:` prefix.

| KV Key | Type | Default | Purpose |
|--------|------|---------|---------|
| `wallet:flag:transfers_enabled` | `'0'` \| `'1'` | `'0'` | Enable/disable wallet-to-wallet transfers |
| `wallet:flag:withdrawals_enabled` | `'0'` \| `'1'` | `'0'` | Enable/disable bank withdrawals |
| `wallet:flag:online_funding_enabled` | `'0'` \| `'1'` | `'0'` | Enable/disable card/Paystack online funding |
| `wallet:flag:mla_payout_enabled` | `'0'` \| `'1'` | `'0'` | Enable/disable MLA earnings payout to wallet |
| `wallet:hitl_threshold_kobo` | integer string | `'10000000'` | Above this amount (₦100k), funding needs HITL review |
| `wallet:eligible_tenants` | JSON array string | `'["handylife"]'` | Allowlist of eligible tenant IDs |
| `wallet:kyc_tier_minimum` | `'1'`\|`'2'`\|`'3'` | `'1'` | Minimum KYC tier to open a wallet |
| `wallet:daily_limit_kobo:{tier}` | integer string | per CBN | Override CBN daily limits per tier |
| `wallet:balance_cap_kobo:{tier}` | integer string | per CBN | Override CBN balance caps per tier |

### 5.3 Notification Event Keys

All wallet notification events are registered in the notification engine via `publishEvent()`. Event keys follow the domain.entity.action pattern:

| Event Key | Trigger | Channels |
|-----------|---------|---------|
| `wallet.funding.requested` | Funding request created | in_app |
| `wallet.funding.proof_submitted` | User uploads bank transfer proof | in_app |
| `wallet.funding.confirmed` | Admin confirms the transfer | email, in_app, sms |
| `wallet.funding.rejected` | Admin rejects the transfer | email, in_app, sms |
| `wallet.funding.expired` | Bank transfer order expires | email, in_app |
| `wallet.spend.completed` | Wallet used for a purchase | in_app |
| `wallet.balance.low` | Balance below 20% of daily limit | in_app |
| `wallet.kyc.upgrade_required` | User hit KYC limit | in_app, email |
| `wallet.mla.earned` | Commission entry created (Phase 1: tracked) | in_app |
| `wallet.mla.credited` | Commission credited to wallet (Phase 2+) | email, in_app |
| `wallet.transfer.disabled` | User attempted disabled transfer | in_app |
| `wallet.withdrawal.disabled` | User attempted disabled withdrawal | in_app |
| `wallet.admin.frozen` | Admin froze a wallet | email, in_app |
| `wallet.admin.unfrozen` | Admin unfroze a wallet | email, in_app |

### 5.4 TypeScript Types (Core)

```typescript
// packages/hl-wallet/src/types.ts

export type WalletStatus = 'pending_kyc' | 'active' | 'frozen' | 'closed';
export type LedgerEntryType = 'credit' | 'debit';
export type LedgerTxType =
  | 'bank_fund' | 'spend' | 'reversal' | 'mla_credit'
  | 'admin_adjust' | 'refund' | 'withdrawal_reserved'
  | 'transfer_out' | 'transfer_in';
export type FundingRequestStatus = 'pending' | 'confirmed' | 'rejected' | 'expired' | 'reversed';
export type SpendEventStatus = 'reserved' | 'completed' | 'reversed' | 'failed';
export type MlaEarningStatus = 'pending' | 'payable' | 'credited' | 'voided';
export type WalletFeatureFlag = 'transfers' | 'withdrawals' | 'online_funding' | 'mla_payout';

export interface HlWallet {
  id: string;
  userId: string;
  tenantId: string;
  workspaceId: string;
  balanceKobo: number;
  lifetimeFundedKobo: number;
  lifetimeSpentKobo: number;
  kycTier: 1 | 2 | 3;
  status: WalletStatus;
  currencyCode: string;
  frozenReason: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface HlLedgerEntry {
  id: string;
  walletId: string;
  userId: string;
  tenantId: string;
  entryType: LedgerEntryType;
  amountKobo: number;
  balanceAfter: number;
  txType: LedgerTxType;
  reference: string;
  description: string;
  currencyCode: string;
  relatedId: string | null;
  relatedType: string | null;
  createdAt: number;
}

export interface WalletError {
  code: 'WALLET_NOT_FOUND' | 'WALLET_FROZEN' | 'WALLET_CLOSED' | 'INSUFFICIENT_BALANCE'
      | 'KYC_UPGRADE_REQUIRED' | 'FEATURE_DISABLED' | 'DAILY_LIMIT_EXCEEDED'
      | 'BALANCE_CAP_EXCEEDED' | 'TENANT_NOT_ELIGIBLE' | 'CONSENT_REQUIRED'
      | 'IDEMPOTENT_REFERENCE_EXISTS';
  message: string;
  context?: Record<string, unknown>;
}

export interface WalletEntitlementContext {
  userId: string;
  tenantId: string;
  workspaceId: string;
  kycTier: 0 | 1 | 2 | 3;
}
```

---

## 6. Target Architecture

### 6.1 Layer Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CLIENT SURFACES                                  │
│  Workspace App  │  HandyLife Mobile  │  Partner Admin  │  USSD (read)│
└───────────────────────────┬─────────────────────────────────────────┘
                             │ JWT + tenant_id
┌───────────────────────────▼─────────────────────────────────────────┐
│                  WALLET API GATEWAY (apps/api)                       │
│  POST /wallet                   — create wallet                      │
│  GET  /wallet/balance           — current balance                    │
│  GET  /wallet/ledger            — paginated ledger history           │
│  POST /wallet/fund/bank-transfer — initiate offline funding          │
│  GET  /wallet/funding/:id        — funding request status            │
│  POST /wallet/spend              — debit for purchase                │
│  POST /wallet/withdraw           — DISABLED (503 + flag message)     │
│  POST /wallet/transfer           — DISABLED (503 + flag message)     │
│  GET  /wallet/mla-earnings       — affiliate earnings history        │
│  --- Super Admin ---                                                  │
│  GET  /platform-admin/wallets/stats                                  │
│  PATCH /platform-admin/wallets/feature-flags                         │
│  POST /platform-admin/wallets/:id/freeze                             │
│  POST /platform-admin/wallets/:id/adjust                             │
└───────────────────────────┬─────────────────────────────────────────┘
                             │
┌───────────────────────────▼─────────────────────────────────────────┐
│              packages/hl-wallet — Core Package                       │
│                                                                       │
│  src/ledger.ts          creditWallet() debitWallet() getBalance()    │
│                         getLedger() reverseEntry()                   │
│  src/kyc-gate.ts        assertWalletKYCTier() checkDailyLimit()      │
│                         checkBalanceCap()                             │
│  src/feature-flags.ts   isFeatureEnabled(flag, env)                  │
│                         assertFeatureEnabled(flag, env)              │
│  src/spend-controls.ts  reserveSpend() completeSpend() reverseSpend()│
│  src/funding.ts         createFundingRequest() confirmFunding()      │
│                         rejectFunding() expireFunding()              │
│  src/mla.ts             computeCommission() recordMlaEarning()       │
│                         getPendingEarnings() creditMlaEarning()       │
│  src/eligibility.ts     assertTenantEligible() assertUserEligible()  │
│  src/types.ts           HlWallet, HlLedgerEntry, WalletError, ...   │
│  src/errors.ts          WalletError class with typed codes           │
│  src/reference.ts       generateWalletRef() — WLT-YYYYMMDD-XXXXX    │
│  src/index.ts           re-exports all public API                    │
└───────────────┬──────────────────────────┬──────────────────────────┘
                │                          │
┌───────────────▼──────────┐  ┌───────────▼──────────────────────────┐
│  Cloudflare D1 (SQLite)  │  │  Cloudflare KV (WALLET_KV)           │
│  hl_wallets              │  │  wallet:flag:transfers_enabled        │
│  hl_ledger               │  │  wallet:flag:withdrawals_enabled      │
│  hl_funding_requests     │  │  wallet:flag:online_funding_enabled   │
│  hl_spend_events         │  │  wallet:flag:mla_payout_enabled       │
│  hl_mla_earnings         │  │  wallet:eligible_tenants              │
│  hl_withdrawal_requests  │  │  wallet:hitl_threshold_kobo           │
│  hl_transfer_requests    │  │  wallet:kyc_tier_minimum              │
│  bank_transfer_orders    │  │  wallet:daily_limit_kobo:{tier}       │
│    (EXISTING — reused)   │  │  wallet:balance_cap_kobo:{tier}       │
│  bank_transfer_disputes  │  └───────────────────────────────────────┘
│    (EXISTING — reused)   │
│  transactions (EXISTING) │
│  audit_logs (EXISTING)   │
│  notification_event      │
│    (EXISTING — emitted)  │
└──────────────────────────┘
```

### 6.2 Package Dependencies

`packages/hl-wallet` depends on:
- `@webwaka/auth-tenancy` — JWT context, RBAC
- `@webwaka/entitlements` — `requireKYCTier()`, `assertWithinTierLimits()`, `requireWalletEntitlement()`
- `@webwaka/events` — `publishEvent()` for notification events
- `@webwaka/types` — shared enums and interfaces
- No direct dependency on `@webwaka/payments` — wallet routes call the bank-transfer route via internal API, NOT directly importing payments

### 6.3 Wallet Route Implementation Patterns

```typescript
// apps/api/src/routes/hl-wallet.ts

// Pattern for DISABLED features (transfers, withdrawals)
app.post('/wallet/transfer', authMiddleware, async (c) => {
  const enabled = await isFeatureEnabled('transfers', c.env);
  if (!enabled) {
    // Emit notification so user knows
    await publishEvent(c.env.DB, {
      eventKey: 'wallet.transfer.disabled',
      tenantId: c.get('auth').tenantId,
      actorId: c.get('auth').userId,
      payload: { feature: 'transfers' }
    });
    return c.json({
      error: 'wallet_feature_disabled',
      feature: 'transfers',
      message: 'Wallet-to-wallet transfers are not yet available. Check back soon.'
    }, 503);
  }
  // ... transfer logic (Phase 2)
});

// Pattern for funded operations — full guard chain
app.post('/wallet/spend', authMiddleware, requireRole('member'), async (c) => {
  const { amountKobo, orderId, orderType, verticalSlug } = await c.req.json();

  // Guard 1: Tenant eligibility
  await assertTenantEligible(c.env.WALLET_KV, c.get('auth').tenantId);

  // Guard 2: NDPR consent for payment_data
  await assertChannelConsent(c.env.DB, c.get('auth').userId, 'payment_data', c.get('auth').tenantId);

  // Guard 3: KYC tier gate
  await requireKYCTier(c.get('auth'), 1, amountKobo);

  // Guard 4: Daily limit check
  await checkDailyLimit(c.env.DB, c.env.WALLET_KV, walletId, amountKobo, kycTier);

  // Guard 5: Integer kobo validation (Zod schema)
  // ... validated by Zod in schema before this

  // Guard 6: Debit (atomic conditional update)
  const reference = generateWalletRef('spend');
  const entry = await debitWallet(c.env.DB, walletId, tenantId, amountKobo, 'spend', reference, `Spend: ${orderType}`);

  // Guard 7: Write spend event + transactions row
  // Guard 8: Emit notification event
  // Guard 9: Emit audit log
  // ...
});
```

### 6.4 Bank Transfer Funding Flow

```
User                     API                    Admin
─────                    ───                    ─────
POST /wallet/fund/bank-transfer
                         → creates bank_transfer_order (EXISTING table)
                           reference: WLT-20260420-ABCDE
                           amount_kobo, bank_name, account_number
                         → creates hl_funding_request (status: pending)
                           links wallet_id → bank_transfer_order_id
                         → publishes wallet.funding.requested event
                         ← 201 { reference, bankDetails, expiresAt }

User uploads proof:
POST /bank-transfer/{id}/proof (EXISTING route — reused)
                         → bank_transfer_order.status = 'proof_submitted'
                         → hl_funding_request.status = 'pending' (unchanged until confirmation)
                         → publishes wallet.funding.proof_submitted event

Admin reviews:
                                                PATCH /bank-transfer/{id}/status
                                                { action: 'confirm', confirmedBy }
                         → bank_transfer_order.status = 'confirmed'
                         → hl_funding_request.status = 'confirmed'

                         [If amountKobo >= hitl_threshold_kobo]
                         → Creates HITL queue item
                         → Requires additional HITL reviewer before crediting

                         [After confirmation / HITL approval]
                         → creditWallet(db, walletId, tenantId, amountKobo, 'bank_fund', reference)
                            • Atomic: UPDATE hl_wallets SET balance_kobo = balance_kobo + ?
                            • Appends hl_ledger row (balance_after snapshot)
                         → hl_funding_request.ledger_entry_id = entry.id
                         → transactions table row (platform audit)
                         → publishes wallet.funding.confirmed event (email + SMS + in-app)
                         → audit_log row: { action: 'wallet_funded', ... }
                         ← User notified via all subscribed channels

[If rejected]
                                                PATCH /bank-transfer/{id}/status
                                                { action: 'reject', reason }
                         → bank_transfer_order.status = 'rejected'
                         → hl_funding_request.status = 'rejected'
                         → publishes wallet.funding.rejected event (email + SMS + in-app)
```

### 6.5 MLA Earnings Architecture

```
Qualifying transaction occurs (Phase 1: only tracking, no payout)

POST /wallet/spend (or vertical order completion)
     │
     ├─ debitWallet() — user pays
     │
     └─ computeAndRecordMlaEarnings(db, {
           spendEventId, tenantId, earnerChain, amountKobo, verticalSlug
        })
           │
           ├─ For each earner in referral chain (up to 3 levels):
           │    commission_kobo = Math.floor(amountKobo * commission_bps / 10000)
           │    INSERT INTO hl_mla_earnings (status = 'pending', ...)
           │    publishEvent('wallet.mla.earned', { earnerUserId, commissionKobo })
           │
           └─ Returns recorded earning count (not paid out in Phase 1)

Phase 2: Payout CRON (daily, apps/projections)
     ├─ Query hl_mla_earnings WHERE status = 'pending' AND period_end <= today
     ├─ Update status = 'payable'
     ├─ For each payable earning:
     │    creditWallet(db, walletId, tenantId, commissionKobo, 'mla_credit', ref)
     │    UPDATE hl_mla_earnings SET status = 'credited', ledger_entry_id = entry.id
     │    publishEvent('wallet.mla.credited', ...)
     └─ Emit audit log
```

---

## 7. Feature Flag & Rollout Model

### 7.1 Super Admin Feature Flag Control

Feature flags are stored in `WALLET_KV` (Cloudflare KV namespace). They are **not** stored in D1, so they take effect instantly without a deployment (consistent with the AI billing pattern using `ai:global:enabled` in KV).

```typescript
// packages/hl-wallet/src/feature-flags.ts

export type WalletFeatureFlag =
  | 'transfers'
  | 'withdrawals'
  | 'online_funding'
  | 'mla_payout';

export async function isFeatureEnabled(
  flag: WalletFeatureFlag,
  kv: KVNamespace
): Promise<boolean> {
  const value = await kv.get(`wallet:flag:${flag}_enabled`);
  return value === '1';
}

export async function assertFeatureEnabled(
  flag: WalletFeatureFlag,
  kv: KVNamespace
): Promise<void> {
  const enabled = await isFeatureEnabled(flag, kv);
  if (!enabled) {
    throw new WalletError('FEATURE_DISABLED', { feature: flag });
  }
}

// Super admin endpoint to toggle flags
// PATCH /platform-admin/wallets/feature-flags
// { flag: 'transfers', enabled: true }
// → kv.put('wallet:flag:transfers_enabled', '1' | '0')
// → audit_log: { action: 'wallet_feature_flag_changed', ... }
```

### 7.2 Tenant Eligibility Rollout

Phase 1 limits wallet access to an explicit tenant allowlist in KV:

```typescript
// KV key: wallet:eligible_tenants
// Value: JSON array of tenant IDs
// e.g. '["handylife", "handylife_staging"]'

export async function assertTenantEligible(
  kv: KVNamespace,
  tenantId: string
): Promise<void> {
  const raw = await kv.get('wallet:eligible_tenants');
  if (!raw) throw new WalletError('TENANT_NOT_ELIGIBLE');
  const eligible: string[] = JSON.parse(raw);
  if (!eligible.includes(tenantId)) {
    throw new WalletError('TENANT_NOT_ELIGIBLE', { tenantId });
  }
}
```

### 7.3 Rollout Stages

| Stage | Tenants | Features Active | Trigger |
|-------|---------|-----------------|---------|
| **Alpha** | `['handylife_staging']` | create, balance, ledger, bank_fund | Super admin sets KV |
| **Beta** | `['handylife']` | + spend | Super admin adds HandyLife prod tenant |
| **MLA Tracking** | `['handylife']` | + mla_earnings tracking | Enable after beta validation |
| **WebWaka-Wide** | `['handylife', 'webwaka_direct', ...]` | all above | Founder decision |
| **Transfers** | All eligible | + transfers | Feature flag `transfers_enabled = '1'` |
| **Withdrawals** | All eligible | + withdrawals | Feature flag `withdrawals_enabled = '1'` |
| **Online Funding** | All eligible | + card/Paystack | Feature flag `online_funding_enabled = '1'` |
| **MLA Payout** | All eligible | + mla_payout | Feature flag `mla_payout_enabled = '1'` |

---

## 8. Repo-by-Repo Impact

### 8.1 New Package — `packages/hl-wallet`

**Create from scratch.** This is the primary deliverable of the wallet work.

```
packages/hl-wallet/
  package.json                    — @webwaka/hl-wallet, [Pillar 1] Operations-Management
  tsconfig.json
  src/
    types.ts                      — all domain types and error codes
    errors.ts                     — WalletError class
    reference.ts                  — generateWalletRef() — WLT-YYYYMMDD-XXXXX
    feature-flags.ts              — isFeatureEnabled(), assertFeatureEnabled()
    eligibility.ts                — assertTenantEligible(), assertUserEligible()
    kyc-gate.ts                   — assertWalletKYCTier(), checkDailyLimit(), checkBalanceCap()
    ledger.ts                     — creditWallet(), debitWallet(), reverseEntry(), getBalance(), getLedger()
    spend-controls.ts             — reserveSpend(), completeSpend(), reverseSpend()
    funding.ts                    — createFundingRequest(), confirmFunding(), rejectFunding(), expireFunding()
    mla.ts                        — computeCommission(), recordMlaEarning(), getPendingEarnings(), creditMlaEarning()
    index.ts                      — public API re-exports
  src/tests/
    ledger.test.ts                — 20+ tests: credit, debit, insufficient balance, idempotency, reversal
    kyc-gate.test.ts              — 12+ tests: tier gates, daily limits, balance caps
    feature-flags.test.ts         — 6+ tests: flag on/off, disabled routes
    funding.test.ts               — 15+ tests: FSM transitions, HITL trigger, expiry
    mla.test.ts                   — 10+ tests: commission computation, recording, status
```

**Package invariants:**
- `package.json` description must start with `[Pillar 1] Operations-Management — HandyLife Wallet`
- All monetary types: `INTEGER` kobo, no floats
- No direct AI imports (P7 Vendor Neutral AI — AI may analyze aggregate wallet data in future, never raw)
- No direct Paystack imports — all payments routed through `@webwaka/payments`
- No vertical-specific logic

### 8.2 Migrations — `infra/db/migrations/`

Create 7 new migration files in sequence after current maximum (0278):

| Number | File | Description |
|--------|------|-------------|
| 0279 | `0279_hl_wallets.sql` | `hl_wallets` table |
| 0280 | `0280_hl_ledger.sql` | `hl_ledger` table |
| 0281 | `0281_hl_funding_requests.sql` | `hl_funding_requests` table |
| 0282 | `0282_hl_spend_events.sql` | `hl_spend_events` table |
| 0283 | `0283_hl_mla_earnings.sql` | `hl_mla_earnings` table |
| 0284 | `0284_hl_withdrawal_requests.sql` | `hl_withdrawal_requests` (schema only, disabled) |
| 0285 | `0285_hl_transfer_requests.sql` | `hl_transfer_requests` (schema only, disabled) |

Each migration must also have a matching `.rollback.sql` file.

### 8.3 API Routes — `apps/api/src/routes/hl-wallet.ts`

**Create new route file.** Register in `apps/api/src/index.ts`.

```typescript
// Route registration in apps/api/src/index.ts
import hlWalletRoutes from './routes/hl-wallet.js';
app.route('/wallet', hlWalletRoutes);
// Super admin routes already under /platform-admin — add wallet sub-routes there
```

**Routes to implement:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/wallet` | member | Create wallet (idempotent: returns existing if already created) |
| GET | `/wallet/balance` | member | Current balance, kyc_tier, status |
| GET | `/wallet/ledger` | member | Paginated ledger (limit 50, cursor-based) |
| POST | `/wallet/fund/bank-transfer` | member | Initiate bank transfer funding |
| GET | `/wallet/funding/:id` | member | Funding request status |
| POST | `/wallet/spend` | member | Debit wallet for purchase (called by vertical routes) |
| POST | `/wallet/withdraw` | member | DISABLED — 503 response |
| POST | `/wallet/transfer` | member | DISABLED — 503 response |
| GET | `/wallet/mla-earnings` | member | MLA earnings history |
| GET | `/platform-admin/wallets/stats` | super_admin | Platform wallet statistics |
| PATCH | `/platform-admin/wallets/feature-flags` | super_admin | Toggle feature flags |
| GET | `/platform-admin/wallets/:id` | super_admin | Single wallet detail |
| POST | `/platform-admin/wallets/:id/freeze` | super_admin | Freeze a wallet |
| POST | `/platform-admin/wallets/:id/unfreeze` | super_admin | Unfreeze a wallet |
| POST | `/platform-admin/wallets/:id/adjust` | super_admin | Admin adjustment (audit + reason required) |

### 8.4 `apps/api/src/env.ts` (Bindings)

Add `WALLET_KV: KVNamespace` binding to the Env type.

### 8.5 `apps/api/wrangler.toml`

Add `WALLET_KV` KV namespace binding for staging and production environments.

### 8.6 `packages/entitlements/src/guards.ts`

Add `requireWalletEntitlement(ctx)` — calls `assertTenantEligible()` and `requireKYCTier(ctx, 1)`.

### 8.7 `apps/projections` (Phase 2: MLA Payout CRON)

Add a new CRON schedule: `0 3 * * *` (daily 04:00 WAT) for MLA earnings settlement.  
Phase 1: CRON exists but runs with `mla_payout_enabled = '0'` check at the start — immediately exits without processing.

### 8.8 `apps/platform-admin/src/` — Super Admin UI

Add wallet management pages:
- `/wallets` — stats dashboard (total wallets, total balance, daily volume)
- `/wallets/feature-flags` — toggle interface for transfers, withdrawals, online funding, MLA payout
- `/wallets/:id` — individual wallet detail: balance, ledger, freeze/unfreeze, admin adjust

### 8.9 Vertical Routes (Selective Integration — Phase 2)

In Phase 2, these vertical routes add wallet-as-payment-method support by calling `POST /wallet/spend` internally when the checkout payment method is `'wallet'`:
- `packages/verticals-cooperative` — contribution payments
- `packages/verticals-savings-group` — group contributions
- `packages/verticals-mobile-money-agent` — wallet top-up via agent
- `packages/pos` — POS sales with wallet payment
- Any vertical with a `payment_method` field

Phase 1: These integrations do NOT exist yet. The wallet spend endpoint is available for direct API calls but not wired into any vertical.

### 8.10 Notification Templates — `infra/db/migrations/0286_seed_wallet_notification_templates.sql`

Seed platform-level notification templates for all 14 wallet event keys. Templates follow the existing pattern from `0268_seed_platform_notification_templates.sql`.

### 8.11 Webhook Event Types — `infra/db/migrations/0287_seed_wallet_webhook_events.sql`

Register wallet event keys in `webhook_event_type` table so tenants can subscribe to wallet webhooks.

### 8.12 `docs/governance/` — New Governance Doc

Create `docs/governance/handylife-wallet-governance.md`:
- Canonical reference for wallet invariants
- CBN compliance section (KYC tiers, daily limits, balance caps)
- NDPR compliance section (payment_data consent gate)
- Feature flag governance (who can enable, under what conditions)
- MLA commission rate governance
- Audit log requirements

---

## 9. Phased Roadmap

### Phase W1 — Core Foundation (Est: 8–10 hours)

**Deliverables:**
- [ ] `packages/hl-wallet` package scaffolded with all source files
- [ ] 7 D1 migrations (0279–0285) written with full schemas and rollbacks
- [ ] `WALLET_KV` KV namespace provisioned in Cloudflare (staging + production)
- [ ] `wrangler.toml` updated with `WALLET_KV` binding
- [ ] `Env` type updated with `WALLET_KV: KVNamespace`
- [ ] Core ledger functions: `creditWallet()`, `debitWallet()`, `reverseEntry()`, `getBalance()`, `getLedger()`
- [ ] Feature flag functions: `isFeatureEnabled()`, `assertFeatureEnabled()`
- [ ] Eligibility functions: `assertTenantEligible()`, `assertUserEligible()`
- [ ] KYC gate functions: `assertWalletKYCTier()`, `checkDailyLimit()`, `checkBalanceCap()`
- [ ] Wallet error class: `WalletError` with all error codes
- [ ] All wallet routes: GET balance, GET ledger, POST create, POST fund/bank-transfer, GET funding/:id, POST spend, POST withdraw (disabled), POST transfer (disabled), GET mla-earnings
- [ ] Platform admin routes: stats, feature-flags PATCH, freeze, unfreeze, adjust
- [ ] Route registration in `apps/api/src/index.ts`
- [ ] **Test suite:** ≥40 tests covering: ledger atomic debit, idempotency, insufficient balance, KYC gate, feature flag gate, tenant eligibility, daily limit enforcement
- [ ] KV initialized: all feature flags set to `'0'`, eligible_tenants set to `'["handylife_staging"]'`
- [ ] TypeScript clean, all CI governance checks pass

**Acceptance:**
- `POST /wallet` creates wallet for eligible user, returns 409 for existing
- `GET /wallet/balance` returns balance in kobo
- `POST /wallet/fund/bank-transfer` creates `bank_transfer_order` + `hl_funding_request`
- `POST /wallet/spend` with insufficient balance returns `INSUFFICIENT_BALANCE` error
- `POST /wallet/transfer` returns 503 with feature flag message
- All tests pass

### Phase W2 — Funding Confirmation Flow & Notifications (Est: 6–8 hours)

**Deliverables:**
- [ ] Funding confirmation webhook: when `bank_transfer_order.status = 'confirmed'`, trigger `creditWallet()`
- [ ] HITL integration: funding above `hitl_threshold_kobo` creates HITL queue item; credit happens only after HITL approval
- [ ] All 14 wallet notification event templates seeded (migration 0286)
- [ ] Webhook event types seeded (migration 0287)
- [ ] `publishEvent()` calls integrated at all wallet state transitions
- [ ] MLA earnings recording: `recordMlaEarning()` called after every qualifying spend
- [ ] Funding expiry handler: CRON in `apps/projections` checks `bank_transfer_orders.expires_at` and marks expired funding requests
- [ ] **Test suite additions:** ≥20 tests for: confirmation flow, HITL trigger, MLA recording, expiry
- [ ] Platform Admin UI pages: `/wallets`, `/wallets/feature-flags`, `/wallets/:id`

**Acceptance:**
- Admin confirms a bank transfer → wallet balance increases → user notified via email + in-app
- Funding above ₦100k → HITL queue item created → balance NOT credited until HITL approval
- Qualifying spend records MLA earning entry (status: 'pending')
- Expired funding request triggers `wallet.funding.expired` notification

### Phase W3 — Compliance, Governance, and Hardening (Est: 6 hours)

**Deliverables:**
- [ ] `docs/governance/handylife-wallet-governance.md` written and complete
- [ ] CBN daily limit enforcement: `checkDailyLimit()` queries ledger sum for rolling 24h period
- [ ] Balance cap enforcement: `checkBalanceCap()` checks wallet.balance_kobo + amountKobo ≤ cap
- [ ] NDPR `payment_data` consent gate wired into wallet creation and spend routes
- [ ] Audit log rows on: wallet creation, credit, debit, freeze, unfreeze, feature flag change, admin adjust
- [ ] KYC tier upgrade flow: `wallet.kyc.upgrade_required` event points to identity upgrade URL
- [ ] Withdrawal and transfer routes: full designed-but-disabled implementation (proper Zod validation, schema wiring, stub logic, 503 response)
- [ ] `wallet:eligible_tenants` updated to include `'handylife'` (production tenant)
- [ ] CI governance check for wallet package: `check-tenant-isolation.ts` covers `hl_*` tables
- [ ] Reconciliation report endpoint: `GET /platform-admin/wallets/reconciliation` — compares `hl_wallets.balance_kobo` vs `SUM(hl_ledger.amount_kobo)` per wallet

**Acceptance:**
- T1 user cannot fund above ₦50,000 in 24h
- T1 user cannot hold more than ₦300,000 balance
- Wallet creation fails without `payment_data` consent
- Every wallet mutation appears in `audit_logs`

### Phase W4 — MLA Payout Engine (Est: 8 hours)

**Deliverables:**
- [ ] MLA payout CRON in `apps/projections` (runs at 04:00 WAT daily)
- [ ] CRON checks `wallet:flag:mla_payout_enabled` — exits immediately if `'0'`
- [ ] Payout batch logic: marks `hl_mla_earnings` as 'payable', then batches credits to wallets
- [ ] `creditMlaEarning()` function in `packages/hl-wallet/src/mla.ts`
- [ ] `wallet.mla.credited` notification event emitted after each credit
- [ ] Partner/MLA commission rate config: KV key `wallet:mla:commission_bps:{level}` (default: level 1 = 500bps, level 2 = 200bps, level 3 = 100bps)
- [ ] MLA void logic: if earner's wallet is frozen or closed, void the earning
- [ ] **Test suite:** ≥15 tests for payout CRON logic, commission computation, void logic
- [ ] `GET /wallet/mla-earnings` route fully paginated with status filter

**Acceptance:**
- Enabling `mla_payout_enabled = '1'` triggers next CRON run to process payable earnings
- Payout credits appear in wallet ledger with `tx_type = 'mla_credit'`
- Voided earnings appear in `hl_mla_earnings` with `status = 'voided'`
- No double-payout: idempotency reference prevents re-crediting

### Phase W5 — Vertical Integration Wave (Est: 10 hours — Phase 2)

**Deliverables:**
- [ ] Add `payment_method: 'wallet'` option to: cooperative contributions, savings group payments, POS sales
- [ ] Wire `POST /wallet/spend` into each vertical route's payment handling
- [ ] Add MLA commission triggers to applicable verticals (cooperative join, marketplace purchase)
- [ ] USSD balance query: `GET /ussd/wallet/balance` (read-only, no spend on USSD — ADL-006)
- [ ] Offline sync: wallet balance cached in `packages/offline-sync` (read-only cache, never offline-write)
- [ ] Enable online funding (Paystack virtual account): KV flag `online_funding_enabled = '1'` after Paystack integration built

---

## 10. Risks & Controls

### 10.1 Monetary Integrity Risks

| Risk | Likelihood | Impact | Control |
|------|-----------|--------|---------|
| Double-spend (two simultaneous debits) | Medium | CRITICAL | Atomic conditional UPDATE (`WHERE balance_kobo >= ?`) — D1 SQLite serializes writes per database |
| Float drift (balance ≠ ledger sum) | Low | HIGH | Daily reconciliation CRON; alert on any wallet where `balance_kobo ≠ SUM(hl_ledger.amount_kobo)` |
| Idempotency failure (duplicate credits) | Low | HIGH | `reference TEXT UNIQUE` constraint on `hl_ledger` — duplicate INSERT → conflict → safely ignored |
| Integer overflow (very large balances) | Very Low | MEDIUM | D1 SQLite `INTEGER` is 64-bit signed → max ~₦92 trillion → not a practical concern |
| Admin adjust without audit trail | Medium | HIGH | All admin adjustments require `reason TEXT NOT NULL` + audit_log row |

### 10.2 Regulatory & Compliance Risks

| Risk | Likelihood | Impact | Control |
|------|-----------|--------|---------|
| CBN KYC non-compliance | Low | CRITICAL | `requireKYCTier()` called on every transaction; daily limit tracked in ledger |
| NDPR violation — payment_data processed without consent | Medium | HIGH | `assertChannelConsent(db, userId, 'payment_data', tenantId)` before wallet creation and spend |
| BVN/NIN in wallet records | Low | HIGH | `hl_*` tables store only opaque user_id — no raw identity documents |
| HITL bypass for high-value funding | Low | HIGH | HITL threshold checked in `confirmFunding()` before any credit; threshold KV-configurable |
| Unauthorized wallet freeze | Low | MEDIUM | Freeze endpoint requires `super_admin` role; all freezes logged to audit_log |

### 10.3 Operational Risks

| Risk | Likelihood | Impact | Control |
|------|-----------|--------|---------|
| Feature flag stuck in wrong state | Low | MEDIUM | Platform admin UI shows current flag state; flags are KV reads (instant effect) |
| Funding request expires before admin confirms | Medium | LOW (no money lost) | `expires_at` tracked; user notified 2h before expiry via `wallet.funding.expiry_warning` event; user can re-submit |
| Bank transfer fraud (fake proof upload) | Medium | HIGH | HITL above threshold; dispute window (24h after confirmation); bank admin confirmation required |
| Wallet used for money laundering | Low | CRITICAL | CBN KYC tiers + daily limits + balance caps; HITL for large amounts; audit trail; dispute mechanism |
| Offline wallet balance mismatch | Low | LOW | Balance is server-side only; client reads from API; offline cache is read-only display |

### 10.4 Architecture Risks

| Risk | Likelihood | Impact | Control |
|------|-----------|--------|---------|
| Wallet becomes vertical-coupled (violates P1) | Medium | HIGH | `packages/hl-wallet` has no vertical imports; CI check enforces |
| MLA commission rates become inconsistent across tenants | Medium | MEDIUM | KV-stored rates per level; single source of truth in `wallet:mla:commission_bps:{level}` |
| Cross-tenant wallet access | Low | CRITICAL | `tenant_id` on every table + query; existing CI check `check-tenant-isolation.ts` |
| Wallet scope creeps into AI billing | Low | LOW | WakaCU and HandyLife Wallet are separate packages with separate tables; no coupling |

---

## 11. Open Decisions

These decisions require founder or key stakeholder input before implementation begins.

### OD-001: HandyLife Tenant Identity
**Question:** Is HandyLife a dedicated `tenant_id` in the WebWaka platform, or is it a workspace_id within an existing tenant? What is the exact `tenant_id` string?  
**Impact:** Determines the initial value of `wallet:eligible_tenants` in KV.  
**Recommendation:** Dedicated `tenant_id = 'handylife'` (lowercase, no spaces) consistent with platform conventions.

### OD-002: MLA Commission Tiers
**Question:** What are the commission rates per referral level?  
**Impact:** Determines KV values for `wallet:mla:commission_bps:1`, `:2`, `:3`.  
**Recommendation:** Level 1 = 500bps (5%), Level 2 = 200bps (2%), Level 3 = 100bps (1%). Configurable via KV — not hardcoded.

### OD-003: Offline Funding Bank Account
**Question:** Which bank account do users transfer to for wallet funding?  
**Options:**  
- (a) WebWaka company bank account — manual admin confirmation required  
- (b) Paystack virtual account per user — automated confirmation via webhook  
**Impact:** If (a), the existing `bank_transfer_orders` confirmation flow works as-is. If (b), requires Paystack Virtual Account API integration (deferred to Phase W2+).  
**Recommendation:** Start with (a) in Phase 1 for speed and simplicity. Add (b) in Phase 2.

### OD-004: HITL Threshold
**Question:** Above what single-deposit amount should admin review be required before crediting the wallet?  
**Default:** ₦100,000 (₦100k = 10,000,000 kobo) — configurable in KV.  
**Recommendation:** Start at ₦100k; adjust based on CBN guidance and operational capacity.

### OD-005: Wallet-to-Wallet Transfer Scope
**Question:** When transfers are enabled (Phase 2+), should they be limited to users within the same `tenant_id`, or can they cross tenants (e.g., HandyLife user → WebWaka user)?  
**Recommendation:** Same-tenant only initially (T3 isolation is simpler and safer). Cross-tenant transfers require CBN sign-off and more complex KYC matching.

### OD-006: MLA Referral Chain Source of Truth
**Question:** Where is the referral relationship recorded? (Who referred whom?)  
**Options:**  
- (a) `packages/relationships` — existing `affiliated_with` relationship type  
- (b) New `hl_referral_links` table in hl-wallet package  
- (c) Existing partner hierarchy (partner → sub-partner → workspace)  
**Recommendation:** (a) for user-to-user referrals; (c) for partner-level MLA. The referral chain query at spend time reads `relationships` to find up-to-3-level referrers.

### OD-007: Wallet Freeze Grace Period
**Question:** When a wallet is frozen, what happens to in-flight spend reservations?  
**Recommendation:** In-flight reservations that were created before the freeze are allowed to complete. New reservations after freeze are rejected. `hl_spend_events` with `status = 'reserved'` where `created_at < freeze_timestamp` are completed normally.

### OD-008: MLA Earnings Minimum Payout Threshold
**Question:** Should there be a minimum accumulated MLA earnings before they can be credited to the wallet?  
**Recommendation:** Minimum ₦500 (50,000 kobo) per payout batch. Below this, earnings accumulate. Configurable via KV: `wallet:mla:min_payout_kobo = '50000'`.

### OD-009: Wallet Display Name and Branding
**Question:** Should the wallet be branded "HandyLife Wallet" in all UI copy, or "WebWaka Wallet" with HandyLife theming?  
**Recommendation:** The API returns `brandName` from tenant's `TenantTheme` (existing `packages/white-label-theming`). No hardcoded "HandyLife" in `packages/hl-wallet`. The brand name is resolved at the API response level from tenant theme.

### OD-010: Direct Client Eligibility Beyond HandyLife
**Question:** Are there other existing WebWaka tenants who should be immediately eligible for the wallet?  
**Recommendation:** Only `handylife` in Phase 1 Alpha. Super admin adds additional tenants via `PATCH /platform-admin/wallets/feature-flags` → updates `wallet:eligible_tenants` KV key.

---

## 12. Execution Backlog

### Sequencing Rules

- **WF-001** through **WF-010** must be complete before any other item begins.
- **WF-011** through **WF-020** can run in parallel once WF-001–WF-010 are done.
- **WF-021** through **WF-030** require WF-011–WF-020 complete.
- **WF-031+** are Phase W2+ and require founder sign-off on OD-001 through OD-010.

### Pre-Implementation (WF-000 series) — Founder/Human Actions

| ID | Task | Owner | Blocker For |
|----|------|-------|-------------|
| WF-000 | Resolve OD-001 through OD-010 | Founder | All implementation |
| WF-000a | Confirm `tenant_id = 'handylife'` | Founder | WF-001 |
| WF-000b | Confirm MLA commission rates | Founder | WF-025 |
| WF-000c | Confirm HITL threshold | Founder | WF-019 |
| WF-000d | Provision `WALLET_KV` KV namespace in Cloudflare (staging + production) | Human (CF dashboard or wrangler) | WF-005 |

### Phase W1 — Core Foundation

| ID | Task | Est | Blocks | Files |
|----|------|-----|--------|-------|
| WF-001 | Create `packages/hl-wallet` directory scaffold and `package.json` | 30m | WF-002+ | `packages/hl-wallet/` |
| WF-002 | Write `src/types.ts` — all domain types and error codes | 45m | WF-003+ | `packages/hl-wallet/src/types.ts` |
| WF-003 | Write `src/errors.ts` — WalletError class | 15m | WF-004+ | `packages/hl-wallet/src/errors.ts` |
| WF-004 | Write `src/reference.ts` — generateWalletRef() | 15m | WF-008 | `packages/hl-wallet/src/reference.ts` |
| WF-005 | Write `src/feature-flags.ts` — isFeatureEnabled(), assertFeatureEnabled() | 30m | WF-008 | `packages/hl-wallet/src/feature-flags.ts` |
| WF-006 | Write `src/eligibility.ts` — assertTenantEligible(), assertUserEligible() | 30m | WF-008 | `packages/hl-wallet/src/eligibility.ts` |
| WF-007 | Write `src/kyc-gate.ts` — assertWalletKYCTier(), checkDailyLimit(), checkBalanceCap() | 60m | WF-008 | `packages/hl-wallet/src/kyc-gate.ts` |
| WF-008 | Write `src/ledger.ts` — creditWallet(), debitWallet(), reverseEntry(), getBalance(), getLedger() | 90m | WF-009+ | `packages/hl-wallet/src/ledger.ts` |
| WF-009 | Write `src/spend-controls.ts` — reserveSpend(), completeSpend(), reverseSpend() | 60m | WF-011 | `packages/hl-wallet/src/spend-controls.ts` |
| WF-010 | Write `src/funding.ts` — createFundingRequest(), confirmFunding(), rejectFunding(), expireFunding() | 60m | WF-011 | `packages/hl-wallet/src/funding.ts` |
| WF-011 | Write all 7 D1 migrations (0279–0285) with schemas and rollbacks | 90m | WF-012 | `infra/db/migrations/0279_*.sql` through `0285_*.sql` |
| WF-012 | Add `WALLET_KV` binding to `apps/api/src/env.ts` and `wrangler.toml` | 20m | WF-013 | `apps/api/src/env.ts`, `apps/api/wrangler.toml` |
| WF-013 | Write `apps/api/src/routes/hl-wallet.ts` — all routes (Phase 1) | 120m | WF-014 | `apps/api/src/routes/hl-wallet.ts` |
| WF-014 | Register hl-wallet routes in `apps/api/src/index.ts` | 15m | WF-015 | `apps/api/src/index.ts` |
| WF-015 | Write tests: `ledger.test.ts` (≥20 tests) | 90m | WF-016 | `packages/hl-wallet/src/tests/ledger.test.ts` |
| WF-016 | Write tests: `kyc-gate.test.ts`, `feature-flags.test.ts`, `funding.test.ts`, `mla.test.ts` (≥30 combined) | 90m | WF-017 | `packages/hl-wallet/src/tests/*.test.ts` |
| WF-017 | Add `requireWalletEntitlement()` to `packages/entitlements/src/guards.ts` | 20m | WF-018 | `packages/entitlements/src/guards.ts` |
| WF-018 | Initialize KV feature flags via wrangler (all `'0'`, eligible_tenants: `["handylife_staging"]`) | 20m | Phase W1 done | wrangler KV put commands |
| WF-019 | TypeScript clean, all governance CI checks pass | 30m | Phase W1 done | CI |
| WF-020 | Self-verification: all Phase W1 acceptance criteria met | 20m | Phase W2 | Manual verification |

### Phase W2 — Funding Confirmation & Notifications

| ID | Task | Est | Blocks | Files |
|----|------|-----|--------|-------|
| WF-021 | Wire funding confirmation: `bank_transfer_order` confirmed → `confirmFunding()` → `creditWallet()` | 60m | WF-022 | `apps/api/src/routes/bank-transfer.ts` |
| WF-022 | HITL integration: create HITL queue item when funding above threshold | 45m | WF-023 | `apps/api/src/routes/hl-wallet.ts`, `apps/api/src/middleware/hitl.ts` |
| WF-023 | Write migration 0286: wallet notification templates (14 event keys, email + SMS + in_app) | 90m | WF-024 | `infra/db/migrations/0286_seed_wallet_notification_templates.sql` |
| WF-024 | Write migration 0287: wallet webhook event types | 20m | WF-025 | `infra/db/migrations/0287_seed_wallet_webhook_events.sql` |
| WF-025 | Write `src/mla.ts` — computeCommission(), recordMlaEarning(), getPendingEarnings(), creditMlaEarning() | 60m | WF-026 | `packages/hl-wallet/src/mla.ts` |
| WF-026 | Wire MLA recording into spend route | 30m | WF-027 | `apps/api/src/routes/hl-wallet.ts` |
| WF-027 | publishEvent() calls at all wallet state transitions | 45m | WF-028 | `apps/api/src/routes/hl-wallet.ts` |
| WF-028 | Funding expiry CRON in `apps/projections` | 45m | WF-029 | `apps/projections/src/index.ts` |
| WF-029 | Platform Admin UI: `/wallets`, `/wallets/feature-flags`, `/wallets/:id` | 120m | WF-030 | `apps/platform-admin/src/` |
| WF-030 | Phase W2 verification: end-to-end funding flow, notification delivery | 30m | Phase W3 | Manual + tests |

### Phase W3 — Compliance Hardening

| ID | Task | Est | Blocks | Files |
|----|------|-----|--------|-------|
| WF-031 | CBN daily limit enforcement: rolling 24h sum from `hl_ledger` | 45m | WF-032 | `packages/hl-wallet/src/kyc-gate.ts` |
| WF-032 | Balance cap enforcement: `balance_kobo + amountKobo ≤ cap` check | 20m | WF-033 | `packages/hl-wallet/src/kyc-gate.ts` |
| WF-033 | NDPR payment_data consent gate wired into wallet creation + spend | 30m | WF-034 | `apps/api/src/routes/hl-wallet.ts` |
| WF-034 | Audit log rows on all wallet mutations | 30m | WF-035 | `apps/api/src/routes/hl-wallet.ts` |
| WF-035 | Reconciliation endpoint: `GET /platform-admin/wallets/reconciliation` | 45m | WF-036 | `apps/api/src/routes/hl-wallet.ts` |
| WF-036 | `docs/governance/handylife-wallet-governance.md` written | 60m | Phase W3 done | `docs/governance/handylife-wallet-governance.md` |
| WF-037 | Update `wallet:eligible_tenants` to include `'handylife'` (production) | 5m | Phase W3 done | wrangler KV put |
| WF-038 | Phase W3 verification: CBN limit test, NDPR consent test, reconciliation report | 30m | Phase W4 | Manual + tests |

### Phase W4 — MLA Payout Engine

| ID | Task | Est | Blocks | Files |
|----|------|-----|--------|-------|
| WF-041 | MLA payout CRON in `apps/projections` (feature-flag-gated) | 60m | WF-042 | `apps/projections/src/index.ts` |
| WF-042 | `creditMlaEarning()` with idempotency + void logic | 45m | WF-043 | `packages/hl-wallet/src/mla.ts` |
| WF-043 | MLA payout tests (≥15) | 60m | WF-044 | `packages/hl-wallet/src/tests/mla.test.ts` |
| WF-044 | `GET /wallet/mla-earnings` fully paginated with status filter | 30m | Phase W4 done | `apps/api/src/routes/hl-wallet.ts` |
| WF-045 | Phase W4 verification | 20m | Phase W5 | Manual + tests |

### Phase W5 — Vertical Integration (Phase 2)

| ID | Task | Est | Blocks | Files |
|----|------|-----|--------|-------|
| WF-051 | Cooperative contribution: add `payment_method: 'wallet'` support | 45m | WF-052 | `packages/verticals-cooperative/src/` |
| WF-052 | Savings group contribution: add wallet payment support | 45m | WF-053 | `packages/verticals-savings-group/src/` |
| WF-053 | POS sale: add wallet payment support | 45m | WF-054 | `packages/pos/src/` |
| WF-054 | USSD balance query: `GET /ussd/wallet/balance` (read-only) | 30m | WF-055 | `apps/ussd-gateway/src/` |
| WF-055 | Paystack virtual account online funding (when enabled by super admin) | 120m | Phase W5 done | `packages/payments/src/`, `apps/api/src/routes/hl-wallet.ts` |
| WF-056 | Enable wallet eligibility for additional tenants (super admin action) | 5m | — | wrangler KV put |

---

## Summary: The 10 Things This Plan Does Not Violate

1. **P1 Build Once Use Infinitely** — `packages/hl-wallet` is tenant/vertical/partner agnostic
2. **P9 Integer Kobo** — every `amount_kobo`, `balance_kobo`, `commission_kobo` field is `INTEGER NOT NULL`
3. **T3 Tenant Isolation** — `tenant_id NOT NULL` on every `hl_*` table, every query scoped
4. **T4 Monetary Integrity** — conditional UPDATE prevents double-spend; Zod validates integer kobo on every route
5. **T5 Entitlement-Gated** — `requireWalletEntitlement()` gates all wallet routes
6. **T7 Claim-First** — wallet lifecycle managed by FSM with explicit transition guards
7. **Audit Append-Only** — `hl_ledger` has no UPDATE or DELETE; `audit_logs` used for all mutations
8. **NDPR Consent** — `assertChannelConsent('payment_data')` before wallet creation and spend
9. **CBN KYC Compliance** — `requireKYCTier()` + daily limit + balance cap on every financial operation
10. **Feature-Flag Control** — all disabled features (transfers, withdrawals, online funding) return 503 with proper message; no silent failures

---

*This document is the single source of truth for HandyLife Wallet implementation planning.*  
*It supersedes all scattered wallet references in earlier documents.*  
*Next step: Founder review of Open Decisions (Section 11) before any code is written.*  
*Companion document to be created at implementation time: `docs/governance/handylife-wallet-governance.md`*
