# CBN KYC Audit Checklist — WebWaka OS M7 (M7e + M7f)

**Document Type:** KYC Compliance Audit (Internal)
**Applicable Framework:** Central Bank of Nigeria (CBN) KYC/AML Guidelines
**Date:** 2026-04-08
**Milestone:** M7e (Nigeria UX) + M7f (Contact + Auth guards)
**Prepared by:** Engineering QA Gate process

---

## 1. KYC Tier Enforcement

All four CBN KYC tiers implemented and enforced via `assertWithinTierLimits()` imported from `@webwaka/entitlements`.

| KYC Tier | Daily Limit | Enforcement Point | Implementation | Test Evidence |
|---|---|---|---|---|
| **Tier 0** | ₦0 (no transactions) | `assertWithinTierLimits(0, amount)` → throws `KYCTierError` | Airtime route: `kycTier === 't0'` → 403 | `apps/api/src/routes/airtime.test.ts` — KYC Tier 0 → 403 |
| **Tier 1** | ₦50,000/day | `requireKYCTier(ctx, 1)` on paid community tiers ≥ ₦1 | Community join for paid tier checks Tier 1; airtime requires T1 | `apps/api/src/routes/airtime.test.ts` — KYC gate |
| **Tier 2** | ₦200,000/day | `requireKYCTier(ctx, 2)` on community tiers ≥ ₦50,000/yr | Entitlements guard blocks T0/T1 from high-value communities | `packages/entitlements` guards test |
| **Tier 3** | Unlimited | `requireKYCTier(ctx, 3)` on agent float > ₦2M | Agent wallet top-up above ₦2M requires T3 | `packages/entitlements/guards.test.ts` |

---

## 2. Identity Verification Status

| KYC Tier | Requirement | Status | Evidence |
|---|---|---|---|
| Tier 1 | Phone number verified via SMS OTP | PASS | `POST /contact/verify/sms` + `POST /contact/confirm/sms` |
| Tier 2 | BVN or NIN linkage | IN PROGRESS | M7g milestone — identity uplift routes planned |
| Tier 3 | Government-issued ID upload | IN PROGRESS | M7g milestone — document upload KYC |

---

## 3. BVN Lookup Consent (P10)

BVN verification requires prior NDPR consent per P10. This is enforced at the identity route layer.

| Check | Status | Evidence |
|---|---|---|
| BVN lookup requires prior consent | PASS | `assertChannelConsent(db, userId, 'BVN', tenantId)` called before Prembly API call in `packages/identity` |
| Consent not present → 403 error | PASS | `ContactError { code: 'CONSENT_REQUIRED' }` returned as 403 |
| Test evidence | PASS | `packages/identity` test: `verifyBVN` without consent → `CONSENT_REQUIRED` error |

---

## 4. KYC Tier Upgrade — Irreversibility

KYC tier upgrades are irreversible by design. No downgrade path exists in the codebase.

| Check | Status | Evidence |
|---|---|---|
| No downgrade function in `@webwaka/entitlements` | PASS | `grep "downgrade\|decreaseTier\|reduceTier" packages/entitlements/src/` — zero matches |
| Tier stored as `kyc_tier TEXT CHECK('t0','t1','t2','t3')` | PASS | `infra/db/migrations/0013_*.sql` — column has CHECK constraint |
| Upgrade path is audit-logged | PASS | KYC tier change logged in `kyc_log` table |

---

## 5. OTP Channel Security (R8 — CBN transaction requirements)

| Rule | Requirement | Status | Evidence |
|---|---|---|---|
| R8 | Transaction/KYC-uplift OTPs must use SMS only | PASS | `routeOTPByPurpose()` blocks Telegram for `transaction` + `kyc_uplift` purposes |
| R8 | WhatsApp permitted as fallback but not primary for transactions | PASS | `sendMultiChannelOTP()` waterfall — SMS first, WA only on SMS failure |
| R9 | OTP rate limiting enforced (5/hr SMS, 3/hr Telegram) | PASS | `RATE_LIMIT_KV` keyed by `rate:otp:{channel}:{identifier}` |

---

## 6. Primary Phone Verification Guard (P13)

| Guard | Requirement | Status | Evidence |
|---|---|---|---|
| P13 | Financial operations require verified primary phone | PASS | `requirePrimaryPhoneVerified()` in `packages/auth/src/guards.ts` |
| P13 | Contact service validates verified primary phone before uplift | PASS | `assertPrimaryPhoneVerified()` in `packages/contact/src/contact-service.ts` |

---

## 7. Float / Wallet Integrity

| Requirement | Status | Evidence |
|---|---|---|
| All monetary values stored as integer kobo (T4) | PASS | `assertIntegerKobo()` enforced in airtime + POS routes |
| Float deductions atomic with ledger inserts (T4) | PASS | `agent_wallets` deduct + `float_ledger` insert in single D1 CTE transaction |
| Airtime operator rate limited per agent (R9 variant) | PASS | `rate:airtime:{tenantId}:{userId}` — 5/hr cap in `apps/api/src/routes/airtime.ts` |
| `assertWithinTierLimits()` imported from `@webwaka/entitlements` | PASS | Imported at each enforcement point per platform invariant |

---

## 8. Audit Trail

| Requirement | Status | Evidence |
|---|---|---|
| `otp_log` records all OTP sends with purpose, channel, status | PASS | `INSERT INTO otp_log` on every `POST /contact/verify` |
| `float_ledger` records all float movements (append-only) | PASS | POS + airtime routes insert ledger entries; no DELETE on ledger |
| `consent_records` NDPR consent persisted per channel | PASS | `assertChannelConsent()` reads `consent_records` table |

---

## 9. Open Action Items

- [ ] Complete T2/T3 KYC tiers (M7g)
- [ ] Submit CBN Sandbox approval for payment operations
- [ ] Integrate NIBSS for BVN verification
- [ ] Enable transaction monitoring (AML velocity rules)
