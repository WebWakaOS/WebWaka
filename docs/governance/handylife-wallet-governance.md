# HandyLife Wallet — Governance Document

**Version:** 1.1.0
**Date:** 2026-04-21
**Status:** Phase W4 Complete — W5 Pending Founder Sign-Off
**Owner:** WebWaka OS Platform Team
**Classification:** Internal — Super-Admin Only

---

## 1. Purpose and Scope

This document is the authoritative governance record for the HandyLife NGN Wallet — a shared, ledger-backed, per-user wallet available exclusively to users of the `handylife` tenant on the WebWaka OS platform.

It covers:
- Regulatory compliance posture (CBN, NDPR)
- Feature flag governance and phase gates
- HITL (Human-in-the-Loop) approval procedures
- MLA commission governance and payout engine
- Reconciliation and audit procedures
- Tenant eligibility management
- Audit log requirements (WF-034)

---

## 2. Regulatory Compliance

### 2.1 CBN Money Transmission

The HandyLife Wallet is a stored-value facility scoped to the HandyLife tenant only. It is NOT a licensed mobile money operator (MMO) at Phase 1. All Phase 1 funding flows exclusively through offline bank transfer (user sends NGN to a designated collection account; admin confirms receipt). No value is created ex nihilo — every credit is 1:1 backed by a confirmed bank transfer.

**CBN limits enforced at the ledger layer (KYC-gated):**

| KYC Tier | Daily Spend Limit | Balance Cap | Single Transfer Limit |
|----------|------------------|-------------|----------------------|
| T1 (BVN-lite) | ₦50,000 | ₦300,000 | ₦50,000 |
| T2 (BVN verified) | ₦200,000 | ₦2,000,000 | ₦200,000 |
| T3 (Full KYC) | Unlimited | Unlimited | Unlimited |

**Implementation:** All limits are enforced in `packages/hl-wallet/src/kyc-gate.ts`:
- `checkDailyLimit()` — queries the rolling 24-hour debit sum from `hl_ledger` before any spend
- `checkBalanceCap()` — checked at both fund-request creation and admin confirmation (WF-032)
- NaN-safe KV parsing: invalid KV values fall back to CBN defaults (patched 2026-04-21)

Default limits are stored in `WALLET_KV` and can be overridden per-tier by super-admin via these KV keys:
- `wallet:daily_limit_kobo:{tier}` — e.g. `wallet:daily_limit_kobo:1` = `'5000000'`
- `wallet:balance_cap_kobo:{tier}` — e.g. `wallet:balance_cap_kobo:1` = `'30000000'`

**Policy:** Changes to CBN-mandated limits require written approval from the Chief Compliance Officer before being applied to `WALLET_KV`. Lowering limits (more restrictive) is lower-risk; raising limits above CBN guidance requires CBN legal review.

### 2.2 NDPR (Nigeria Data Protection Regulation)

Every user must provide `payment_data` consent before:
- Creating a wallet (`POST /wallet`)
- Spending from their wallet (`POST /wallet/spend`)

Consent is checked against `consent_records WHERE data_type = 'payment_data' AND revoked_at IS NULL`. If the user has revoked consent, both operations return `403 NDPR_CONSENT_REQUIRED`.

Consent records are append-only (revoked_at is set, not deleted) and are retained for 7 years per NDPR Article 26.

**IP masking in audit logs:** Audit log entries store `ip_masked = '?.?.?.?'` (all octets masked) to prevent PII exposure in the `audit_logs` table — compliant with NDPR's data minimisation principle.

---

## 3. Feature Flag Governance

Feature flags are stored in `WALLET_KV` and controlled via `PATCH /platform-admin/wallets/feature-flags` (super-admin JWT required).

| Flag | KV Key | Phase | Default | Requires Before Enabling |
|------|--------|-------|---------|--------------------------|
| `transfers` | `wallet:flag:transfers_enabled` | W3+ | OFF | CBN clearance + reconciliation baseline (30-day zero-drift) |
| `withdrawals` | `wallet:flag:withdrawals_enabled` | W3+ | OFF | CBN clearance + NIP integration + payout provider contract |
| `online_funding` | `wallet:flag:online_funding_enabled` | W5 | OFF | Paystack Virtual Account API + PCI-DSS scoping |
| `mla_payout` | `wallet:flag:mla_payout_enabled` | W4 | OFF | Payout engine complete + tax deduction review + founder sign-off |

**Decision to enable any Phase 2+ feature requires:**
1. Written sign-off from the Founder
2. Legal review of CBN implications
3. Staging environment test passing (end-to-end fund flow)
4. Reconciliation report showing zero drift over 30 days

**MLA payout flag specifically:** Enabling `wallet:flag:mla_payout_enabled = '1'` will cause the daily 04:00 WAT CRON in `apps/projections` to begin crediting payable MLA earnings to earner wallets. Test on staging with real test earnings first.

---

## 4. HITL Approval Process

The HITL (Human-in-the-Loop) threshold is stored at `WALLET_KV` key `wallet:hitl_threshold_kobo`. Default: `10_000_000` (₦100,000).

**Flow for funding requests at or above the threshold:**

1. User initiates bank transfer: `POST /wallet/fund/bank-transfer` with `amount_kobo >= threshold`
   → API sets `hitl_required = 1` on the `hl_funding_requests` row.

2. User submits bank transfer proof: `POST /bank-transfer/:id/proof`

3. Seller/admin confirms the bank transfer: `POST /bank-transfer/:id/confirm`
   → API detects `hitl_required = 1`
   → Does NOT auto-credit the wallet
   → Fires `wallet.funding.hitl_required` event
   → Super-admin is notified via the platform-admin HITL queue.

4. Super-admin reviews evidence (proof screenshot, bank statement) and:
   - **Approves:** `POST /platform-admin/wallets/funding/:id/confirm` → balance cap re-checked against current balance → wallet is credited → audit log written
   - **Rejects:** `POST /platform-admin/wallets/funding/:id/reject` with reason → user is notified → audit log written

**SLA:** HITL queue items must be reviewed within 4 business hours. Stale items are escalated via the HITL CRON sweep.

**Balance cap at confirmation (WF-032):** `confirmFunding()` re-checks the balance cap against the wallet's current balance at the moment of admin confirmation, not at request creation time. This prevents a race condition where the user funds twice simultaneously and both get confirmed.

**Threshold change procedure:** Changes to `wallet:hitl_threshold_kobo` require:
- Approval from the Chief Risk Officer
- Entry in the governance change log (append to this document)

---

## 5. Tenant Eligibility

Eligible tenants are stored at `WALLET_KV` key `wallet:eligible_tenants` as a JSON array string.

**Phase 1 values:**
- Staging: `'["handylife_staging"]'`
- Production: `'["handylife"]'`

**KV initialization commands (run after namespace provisioning — see `scripts/kv-init-wallet.sh`):**
```bash
# Production tenant eligibility
wrangler kv key put wallet:eligible_tenants '["handylife"]' \
  --namespace-id <WALLET_KV_PRODUCTION_ID> --env production

# Staging tenant eligibility
wrangler kv key put wallet:eligible_tenants '["handylife_staging"]' \
  --namespace-id <WALLET_KV_STAGING_ID> --env staging
```

**To add a new tenant in future:**
```bash
wrangler kv key put wallet:eligible_tenants '["handylife","new_tenant"]' \
  --namespace-id <WALLET_KV_PRODUCTION_ID> --env production
```

**Eligibility expansion requires:**
1. Founder sign-off on tenant's CBN compliance posture
2. NDPR data processing agreement with the tenant
3. KYC flow configured and tested in staging for that tenant

---

## 6. MLA Commission Governance

MLA (Multi-Level Agent) commissions are recorded when a user spends from their wallet. The referral chain is traversed up to 3 levels via the `relationships` table (`kind='referral'`).

Commission rates (basis points) are stored in `WALLET_KV`:

| Level | KV Key | Default BPS | Equivalent % |
|-------|--------|-------------|--------------|
| L1 (direct referrer) | `wallet:mla:commission_bps:1` | 500 | 5.0% |
| L2 (referrer's referrer) | `wallet:mla:commission_bps:2` | 200 | 2.0% |
| L3 (L2's referrer) | `wallet:mla:commission_bps:3` | 100 | 1.0% |

**Minimum payout threshold:** `wallet:mla:min_payout_kobo` — default `50_000` (₦500). Earnings below this are not paid until the cumulative balance meets the threshold.

**Settlement window:** `wallet:mla:settlement_window_secs` — default `86400` (24 hours). Earnings older than this are promoted from `pending` to `payable` by the daily CRON.

### 6.1 MLA Earning Lifecycle (FSM)

```
pending ──(24h settlement window)──► payable ──(payout CRON)──► credited
   │                                    │
   └──── voidMlaEarning() ──────────────┘
                                    voided
```

- `pending` → `payable`: `markEarningsPayable()` CRON (04:00 WAT daily, or when `mla_payout_enabled = '1'`)
- `payable` → `credited`: `creditMlaEarning()` — idempotent, guarded by `reference UNIQUE` on `hl_ledger`
- `pending`/`payable` → `voided`: `voidMlaEarning()` — used when earner's wallet is frozen, the source spend is reversed, or by admin action
- `credited` → voiding is **BLOCKED** — a credited earning is an immutable ledger entry; reversal requires a separate correction entry

**At Phase 1 (W1–W3):** Commissions are recorded as `status='pending'` in `hl_mla_earnings` — they are NOT paid out. MLA payout requires `wallet:flag:mla_payout_enabled = '1'` (super-admin action).

**Phase W4:** Payout engine complete. CRON is in `apps/projections/src/index.ts`, gated by feature flag. Do not enable in production until staging payout test passes end-to-end.

**Commission rate change procedure:**
- Changes require Founder approval
- Must be applied to `WALLET_KV` in staging first, verified, then production
- Total L1+L2+L3 commission must not exceed 8% (platform profitability guard — updated from 3.5% to reflect revised defaults)

---

## 7. Reconciliation Procedures

A reconciliation check is available at `GET /platform-admin/wallets/reconciliation`. It detects wallets where `hl_wallets.balance_kobo ≠ SUM(hl_ledger.amount_kobo)`.

**Scheduled reconciliation:** Run weekly minimum. Any discrepancy > ₦0 is a P1 incident.

**Reconciliation discrepancy response:**
1. Freeze the affected wallet(s) immediately
2. Pull ledger entries for the wallet (`GET /platform-admin/wallets/:id`)
3. Identify the entry causing drift — check for interrupted credit operations
4. If a credit was applied to the ledger but NOT to the wallet balance (partial write), manually apply the balance delta
5. Document the incident in the governance change log below
6. Unfreeze the wallet after verification

---

## 8. Funding Expiry

The daily CRON (02:00 UTC) in `apps/projections` runs two sequential expiry sweeps:
1. Expire `bank_transfer_orders` older than 48h with status `pending`
2. Expire `hl_funding_requests` whose associated `bank_transfer_order` is now expired

Expired funding requests cannot be re-used. Users must initiate a new bank transfer.

---

## 9. Audit Trail

### 9.1 Event Log (`event_log` table)

All wallet mutations emit events via `publishEvent()` to `event_log`. The following mutations are guaranteed to have an event:

| Operation | Event Key | Severity |
|-----------|-----------|----------|
| Funding requested | `wallet.funding.requested` | high |
| Funding confirmed | `wallet.funding.confirmed` | critical |
| Funding rejected | `wallet.funding.rejected` | high |
| Funding expired | `wallet.funding.expired` | medium |
| HITL review required | `wallet.funding.hitl_required` | critical |
| Spend completed | `wallet.spend.completed` | high |
| MLA commission earned | `wallet.mla.earned` | medium |
| MLA commission credited | `wallet.mla.credited` | high |
| Transfer attempted (disabled) | `wallet.transfer.disabled` | low |
| Wallet frozen | `wallet.admin.frozen` | critical |
| Wallet unfrozen | `wallet.admin.unfrozen` | high |

Events are retained in `event_log` per the platform retention policy (7 years for financial events).

### 9.2 Structured Audit Log (`audit_logs` table — WF-034)

In addition to the event log, every wallet mutation writes a structured row to `audit_logs` (migration 0193). This provides an NDPR-compliant, security-queryable record of every state-changing operation.

**Columns populated:**

| Column | Value |
|--------|-------|
| `tenant_id` | Caller's tenant |
| `user_id` | Caller's user ID (or system user for CRON operations) |
| `action` | Namespaced action string (see table below) |
| `method` | HTTP method (POST, PATCH, etc.) |
| `path` | Request path |
| `resource_type` | Logical resource type |
| `resource_id` | ID of the affected resource |
| `ip_masked` | Always `'?.?.?.?'` (NDPR compliance) |
| `status_code` | HTTP response code |
| `metadata` | JSON blob with operation-specific details (amounts, reasons, etc.) |

**Wallet action codes:**

| Action | Trigger |
|--------|---------|
| `wallet.created` | `POST /wallet` |
| `wallet.funded` | `POST /wallet/fund/bank-transfer` (auto-confirm path) |
| `wallet.fund.requested` | `POST /wallet/fund/bank-transfer` (HITL path) |
| `wallet.spend` | `POST /wallet/spend` |
| `wallet.spend.completed` | `POST /wallet/spend/:id/complete` |
| `wallet.spend.reversed` | `POST /wallet/spend/:id/reverse` |
| `wallet.admin.freeze` | `POST /platform-admin/wallets/:walletId/freeze` |
| `wallet.admin.unfreeze` | `POST /platform-admin/wallets/:walletId/unfreeze` |
| `wallet.funding.confirm` | `POST /platform-admin/wallets/funding/:id/confirm` |
| `wallet.funding.reject` | `POST /platform-admin/wallets/funding/:id/reject` |

**Audit log query examples (for compliance officers):**

```sql
-- All freeze actions in the last 30 days
SELECT * FROM audit_logs
WHERE tenant_id = 'handylife'
  AND action = 'wallet.admin.freeze'
  AND created_at >= unixepoch('now', '-30 days')
ORDER BY created_at DESC;

-- All funding confirmations for a wallet
SELECT * FROM audit_logs
WHERE tenant_id = 'handylife'
  AND action = 'wallet.funding.confirm'
  AND resource_id = 'hlfr_xxx';
```

---

## 10. KV Namespace Provisioning

The `WALLET_KV` KV namespace must be provisioned before the API can serve wallet requests. The namespace IDs are placeholders in `apps/api/wrangler.toml` and must be replaced with real IDs after provisioning.

**Step-by-step provisioning (one-time, human operator):**

```bash
# 1. Create namespaces
wrangler kv namespace create WALLET_KV --env staging
# → Copy the returned ID → replace <WALLET_KV_STAGING_ID> in wrangler.toml

wrangler kv namespace create WALLET_KV --env production
# → Copy the returned ID → replace <WALLET_KV_PRODUCTION_ID> in wrangler.toml

# 2. Uncomment the [[kv_namespaces]] blocks in wrangler.toml (lines 43-48, 102-107)

# 3. Run the full KV initialization (all feature flags + limits + eligible tenants)
bash scripts/kv-init-wallet.sh staging
bash scripts/kv-init-wallet.sh production
```

See `scripts/kv-init-wallet.sh` for the complete initialization command set.

---

## 11. Phase Implementation Status

| Phase | Status | WF Range | Description |
|-------|--------|----------|-------------|
| W1 | Complete | WF-001–020 | Package, ledger, migrations, routes, events, KV binding, 51 tests |
| W2 | Complete | WF-021–030 | Funding confirm wiring, HITL, MLA chain, NDPR gate, expiry CRON, admin UI |
| W3 | Complete | WF-031–038 | CBN/balance-cap enforcement at confirmation (WF-032), 32 KYC gate tests (WF-031), audit log on all 9 wallet mutations (WF-034), NaN fallback fix |
| W4 | Complete | WF-041–045 | MLA payout CRON in projections (WF-041), mla.ts enhancements — markEarningsPayable/idempotent credit/pagination (WF-042), 24 MLA tests (WF-043), paginated mla-earnings route (WF-044) |
| W5 | Pending Founder Sign-Off | WF-051–056 | Cooperative/savings-group/POS wallet payment, USSD balance query, Paystack virtual account, additional tenant eligibility |

---

## 12. W3 + W4 Acceptance Verification (2026-04-21)

### W3 Acceptance Criteria

| Criterion | Status | Evidence |
|-----------|--------|----------|
| T1 user cannot fund above ₦50,000 in 24h | **PASS** | `checkDailyLimit()` enforced in `POST /wallet/spend`; 32 kyc-gate tests including rolling 24h boundary |
| T1 user cannot hold more than ₦300,000 balance | **PASS** | `checkBalanceCap()` enforced at fund creation AND admin confirmation (WF-032); balance loaded fresh from DB at confirmation |
| Wallet creation fails without `payment_data` consent | **PASS** | `assertChannelConsent(db, userId, 'payment_data', tenantId)` called before wallet creation and spend |
| Every wallet mutation appears in `audit_logs` | **PASS** | WF-034: all 9 mutations wired with `writeWalletAuditLog()` (fire-and-forget, NDPR ip_masked) |

### W4 Acceptance Criteria

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Enabling `mla_payout_enabled = '1'` triggers CRON to process payable earnings | **PASS** | `apps/projections/src/index.ts`: CRON reads `wallet:flag:mla_payout_enabled`, exits immediately if `'0'` |
| Payout credits appear in wallet ledger with `tx_type = 'mla_credit'` | **PASS** | `creditMlaEarning()` in `mla.ts`: inserts `hl_ledger` row with `tx_type='mla_credit'`; emits `wallet.mla.credited` event |
| No double-payout: idempotency reference prevents re-crediting | **PASS** | `creditMlaEarning()` checks `status='credited'` first and returns existing row; `hl_ledger.reference UNIQUE` constraint provides DB-level idempotency guard |
| Voided earnings appear in `hl_mla_earnings` with `status = 'voided'` | **PASS** | `voidMlaEarning()` in `mla.ts`: FSM blocks voiding `credited` earnings; 4 void tests in mla.test.ts |

### Test Suite Summary (2026-04-21)

| Package | Tests | Pass | Fail |
|---------|-------|------|------|
| `@webwaka/hl-wallet` vitest | 91 | 91 | 0 |
| `apps/api` vitest | 2463 | 2463 | 0 |
| TypeScript (`hl-wallet`) | — | clean | 0 errors |
| TypeScript (`apps/api`) | — | clean | 0 errors |
| TypeScript (`apps/projections`) | — | clean | 0 errors |

---

## 13. Governance Change Log

| Date | Change | Approver | Reference |
|------|--------|----------|-----------|
| 2026-04-20 | Initial document created. Phase W1+W2 complete. | Platform Team | WF-036 |
| 2026-04-21 | Updated to v1.1.0. W3+W4 marked complete. Added: WF-034 audit log section (§9.2), MLA FSM lifecycle (§6.1), balance cap at confirmation (§4), KV provisioning guide (§10), W3+W4 acceptance verification (§12). Fixed commission rate defaults (L1=5%, L2=2%, L3=1%) and T2 balance cap (₦2M). NaN fallback fix documented. | Platform Team | WF-036 v1.1 |

---

*This document is maintained under `docs/governance/handylife-wallet-governance.md`. All changes require a PR to the main branch and are recorded in the change log above.*
