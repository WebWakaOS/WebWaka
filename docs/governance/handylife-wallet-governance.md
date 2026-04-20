# HandyLife Wallet — Governance Document

**Version:** 1.0.0  
**Date:** 2026-04-20  
**Status:** Phase W2 Complete  
**Owner:** WebWaka OS Platform Team  
**Classification:** Internal — Super-Admin Only

---

## 1. Purpose and Scope

This document is the authoritative governance record for the HandyLife NGN Wallet — a shared, ledger-backed, per-user wallet available exclusively to users of the `handylife` tenant on the WebWaka OS platform.

It covers:
- Regulatory compliance posture (CBN, NDPR)
- Feature flag governance and phase gates
- HITL (Human-in-the-Loop) approval procedures
- MLA commission governance
- Reconciliation and audit procedures
- Tenant eligibility management

---

## 2. Regulatory Compliance

### 2.1 CBN Money Transmission

The HandyLife Wallet is a stored-value facility scoped to the HandyLife tenant only. It is NOT a licensed mobile money operator (MMO) at Phase 1. All Phase 1 funding flows exclusively through offline bank transfer (user sends NGN to a designated collection account; admin confirms receipt). No value is created ex nihilo — every credit is 1:1 backed by a confirmed bank transfer.

**CBN limits enforced at the ledger layer (KYC-gated):**

| KYC Tier | Daily Spend Limit | Balance Cap |
|----------|------------------|-------------|
| T1 (BVN-lite) | ₦50,000 | ₦300,000 |
| T2 (BVN verified) | ₦200,000 | ₦1,000,000 |
| T3 (Full KYC) | ₦5,000,000 | ₦10,000,000 |

Default limits are stored in `WALLET_KV` and can be overridden per-tier by super-admin. Changes to CBN-mandated limits require written approval from the Chief Compliance Officer before being applied to `WALLET_KV`.

### 2.2 NDPR (Nigeria Data Protection Regulation)

Every user must provide `payment_data` consent before:
- Creating a wallet (`POST /wallet`)
- Spending from their wallet (`POST /wallet/spend`)

Consent is checked against `consent_records WHERE data_type = 'payment_data' AND revoked_at IS NULL`. If the user has revoked consent, both operations return `403 NDPR_CONSENT_REQUIRED`.

Consent records are append-only (revoked_at is set, not deleted) and are retained for 7 years per NDPR Article 26.

---

## 3. Feature Flag Governance

Feature flags are stored in `WALLET_KV` and controlled via `PATCH /platform-admin/wallets/feature-flags` (super-admin JWT required).

| Flag | KV Key | Phase | Default | Requires Before Enabling |
|------|--------|-------|---------|--------------------------|
| `transfers` | `wallet:flag:transfers_enabled` | W3+ | OFF | CBN clearance + reconciliation baseline |
| `withdrawals` | `wallet:flag:withdrawals_enabled` | W3+ | OFF | CBN clearance + NIP integration |
| `online_funding` | `wallet:flag:online_funding_enabled` | W5 | OFF | Paystack Virtual Account API + PCI-DSS scoping |
| `mla_payout` | `wallet:flag:mla_payout_enabled` | W4 | OFF | Payout engine complete + tax deduction logic |

**Decision to enable any Phase 2+ feature requires:**
1. Written sign-off from the Founder
2. Legal review of CBN implications
3. Staging environment test passing (end-to-end fund flow)
4. Reconciliation report showing zero drift over 30 days

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
   - **Approves:** `POST /platform-admin/wallets/funding/:id/confirm` → wallet is credited
   - **Rejects:** `POST /platform-admin/wallets/funding/:id/reject` with reason → user is notified

**SLA:** HITL queue items must be reviewed within 4 business hours. Stale items are escalated via the HITL CRON sweep.

**Threshold change procedure:** Changes to `wallet:hitl_threshold_kobo` require:
- Approval from the Chief Risk Officer
- Entry in the governance change log (append to this document)

---

## 5. Tenant Eligibility

Eligible tenants are stored at `WALLET_KV` key `wallet:eligible_tenants` as a JSON array.

Phase 1: `["handylife"]` (production), `["handylife_staging"]` (staging)

To add a new tenant:
```bash
wrangler kv key put wallet:eligible_tenants '["handylife","new_tenant"]' \
  --namespace-id <WALLET_KV_ID> --env production
```

**Eligibility expansion requires:**
1. Founder sign-off on tenant's CBN compliance posture
2. NDPR data processing agreement with the tenant
3. KYC flow configured and tested in staging

---

## 6. MLA Commission Governance

MLA (Multi-Level Agent) commissions are recorded when a user spends from their wallet. The referral chain is traversed up to 3 levels via the `relationships` table (`kind='referral'`).

Commission rates (basis points) are stored in `WALLET_KV`:

| Level | KV Key | Default BPS | Equivalent % |
|-------|--------|-------------|--------------|
| L1 (direct referrer) | `wallet:mla:commission_bps:1` | 200 | 2.0% |
| L2 (referrer's referrer) | `wallet:mla:commission_bps:2` | 100 | 1.0% |
| L3 (L2's referrer) | `wallet:mla:commission_bps:3` | 50  | 0.5% |

**At Phase 1:** Commissions are recorded as `status='pending'` in `hl_mla_earnings` — they are NOT paid out. MLA payout requires Phase W4 (feature flag `mla_payout` enabled).

**Commission rate change procedure:**
- Changes require Founder approval
- Must be applied to `WALLET_KV` in staging first, verified, then production
- Total L1+L2+L3 commission must not exceed 3.5% (platform profitability guard)

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
| Wallet frozen | `wallet.admin.frozen` | critical |
| Wallet unfrozen | `wallet.admin.unfrozen` | high |

Events are retained in `event_log` per the platform retention policy (7 years for financial events).

---

## 10. Phase Implementation Status

| Phase | Status | WF Range | Description |
|-------|--------|----------|-------------|
| W1 | Complete | WF-001–020 | Package, ledger, migrations, routes, events, KV binding, 51 tests |
| W2 | Complete | WF-021–030 | Funding confirm wiring, HITL, MLA chain, NDPR gate, expiry CRON, admin UI |
| W3 | Pending | WF-031–038 | CBN/balance-cap enforcement, NDPR gates, audit log, governance doc |
| W4 | Pending | WF-041–045 | MLA payout engine (feature-flag gated) |
| W5 | Pending | WF-051–056 | Cooperative/savings group wallet payment, Paystack virtual account |

---

## 11. Governance Change Log

| Date | Change | Approver | Reference |
|------|--------|----------|-----------|
| 2026-04-20 | Initial document created. Phase W1+W2 complete. | Platform Team | WF-036 |

---

*This document is maintained under `docs/governance/handylife-wallet-governance.md`. All changes require a PR to the main branch and are recorded in the change log above.*
