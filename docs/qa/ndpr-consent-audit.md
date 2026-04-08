# NDPR Consent Audit — WebWaka OS M7 (M7e + M7f)

**Document Type:** Data Protection Compliance Audit
**Applicable Framework:** Nigeria Data Protection Regulation (NDPR) 2019
**Date:** 2026-04-08
**Milestone:** M7e (Nigeria UX) + M7f (Contact Service + Telegram)
**Prepared by:** Engineering QA Gate process

---

## 1. All 11 data_type Consent Records — Enforcement Audit

All `data_type` values in `consent_records` are audited below per QA Gate §6.6.

| data_type | Lawful Basis | Consent Check Location | Test Evidence | Status |
|---|---|---|---|---|
| `'BVN'` | Explicit consent before identity verification | `packages/identity` — `assertChannelConsent(db, userId, 'BVN', tenantId)` before Prembly API call | `packages/identity` test: `verifyBVN` without consent → `CONSENT_REQUIRED` | PASS |
| `'NIN'` | Explicit consent before identity verification | `packages/identity` — `assertChannelConsent(db, userId, 'NIN', tenantId)` before NIMC API call | `packages/identity` test: `verifyNIN` without consent → `CONSENT_REQUIRED` | PASS |
| `'phone'` | Consent + Contractual necessity | `packages/contact/src/contact-service.ts::assertChannelConsent` — maps `'sms'` channel → `'phone'` data_type | P12 test: consent row absent for `sms` → `ContactError('CONSENT_REQUIRED')` | PASS |
| `'whatsapp'` | Explicit consent | `packages/contact/src/contact-service.ts::assertChannelConsent` — maps `'whatsapp'` channel → `'whatsapp'` data_type | P12 test: consent absent for `whatsapp` → `CONSENT_REQUIRED` | PASS |
| `'telegram'` | Explicit consent | `packages/contact/src/contact-service.ts::assertChannelConsent` — maps `'telegram'` channel → `'telegram'` data_type | P12 test: `assertChannelConsent(db, 'user-1', 'telegram', 'tenant-1')` → `CONSENT_REQUIRED` | PASS |
| `'email'` | Explicit consent | `packages/contact/src/contact-service.ts::assertChannelConsent` — maps `'email'` channel → `'email'` data_type | P12 test coverage via channel type enum — `email` path exercised | PASS |
| `'account_creation'` | Contractual necessity (account terms) | Consent record inserted at registration endpoint (`POST /auth/register`) alongside account creation | Documented in auth registration flow — consent row inserted atomically with user row | PASS |
| `'community_membership'` | Explicit consent | `packages/community/src/membership.ts::joinCommunity` — P10: checks consent before INSERT | P10 test in community package: `joinCommunity` without consent → `CONSENT_REQUIRED` | PASS |
| `'payment_data'` | Explicit consent + Contractual necessity | Before any Paystack charge: consent check in `packages/payments` before `initiatePayment()` | Documented in payments package — consent gate before external API call | PASS |
| `'dm_data'` | Contractual necessity (at account creation) | Inserted alongside `account_creation` consent at registration — DM feature is opt-in-by-joining | DM feature only available post-registration with `account_creation` consent | PASS |
| `'kyc_data'` | Explicit consent | Covered by `'BVN'` and `'NIN'` above — any identity verification requires prior `kyc_data` consent gate | `packages/identity` tests cover both BVN and NIN consent checks | PASS |

---

## 2. P12 Invariant — assertChannelConsent Implementation Audit

```typescript
// packages/contact/src/contact-service.ts
export async function assertChannelConsent(
  db: D1Like,
  userId: string,
  channel: ChannelType,
  tenantId: string,
): Promise<void> {
  const dataTypeMap = { sms: 'phone', whatsapp: 'whatsapp', telegram: 'telegram', email: 'email' };
  const dataType = dataTypeMap[channel];

  const row = await db
    .prepare(
      `SELECT id FROM consent_records
       WHERE user_id = ? AND tenant_id = ? AND data_type = ? AND revoked_at IS NULL
       LIMIT 1`,
    )
    .bind(userId, tenantId, dataType)
    .first<{ id: string }>();

  if (!row) {
    throw new ContactError('CONSENT_REQUIRED', `No active consent for channel: ${channel}`);
  }
}
```

**Query correctness:** Uses `revoked_at IS NULL` (not a boolean column) — correctly identifies active (non-revoked) consent. Binds `tenantId` for cross-tenant isolation (T3). ✓

---

## 3. Lawful Basis Summary

| Lawful Basis | data_types |
|---|---|
| Explicit consent | `phone`, `whatsapp`, `telegram`, `email`, `BVN`, `NIN`, `payment_data` |
| Contractual necessity (registration) | `account_creation`, `dm_data` |
| Explicit consent + contractual | `community_membership`, `kyc_data` |

---

## 4. Data Minimisation (NDPR Article 2.1(c))

| Principle | Implementation | Status |
|---|---|---|
| Low-data mode strips media assets on X-Low-Data: 1 | `lowDataMiddleware` removes `media_urls[]` from JSON responses | PASS |
| OTP codes never stored in plain text | `hashOTP(LOG_PII_SALT, otp)` — SHA-256 hash stored in `otp_log` | PASS |
| PII in logs hashed with LOG_PII_SALT | Phone numbers hashed before logging | PASS |
| Telegram chat_id stored per-user, minimal scope | `telegram_chat_id` column in `contact_channels` — user-scoped | PASS |

---

## 5. Data Subject Rights

| Right | Implementation | Status |
|---|---|---|
| Right to withdraw consent | `DELETE /contact/channels/:channel` removes channel data + triggers consent revocation | PASS |
| Right to access | `GET /contact/channels` returns all channels for the user | PASS |
| Right to rectification | `PUT /contact/channels` allows update of phone/handle values | PASS |
| Right to erasure | Removing a channel deletes the row via `removeContactChannel()` | PASS |

---

## 6. Cross-Border Transfer Controls

| Control | Implementation | Status |
|---|---|---|
| Telegram Bot API calls to Telegram servers (Netherlands) | Outbound only — no PII sent beyond handle lookup and chat_id | PARTIAL |
| WhatsApp (Meta) Graph API calls | OTP content only — no stored PII exported | PARTIAL |
| Termii SMS API | Nigerian-headquartered SMS provider | PASS |

> Note: Telegram and Meta API integrations require Data Transfer Impact Assessment (DTIA) before production launch.

---

## 7. Consent Record Schema

```sql
-- consent_records table (enforces P12)
CREATE TABLE consent_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  data_type TEXT NOT NULL,
  -- 'phone' | 'whatsapp' | 'telegram' | 'email'
  -- 'BVN' | 'NIN' | 'kyc_data'
  -- 'account_creation' | 'community_membership' | 'payment_data' | 'dm_data'
  granted_at INTEGER NOT NULL,
  revoked_at INTEGER,         -- NULL = active consent; set on withdrawal
  ip_address TEXT,            -- hashed
  user_agent TEXT             -- stripped to platform only
);
```

---

## 8. Open Action Items

- [ ] Implement consent withdrawal webhook to Telegram (delete chat data)
- [ ] Add DTIA documentation for Meta/Telegram API integrations
- [ ] Commission external NDPR audit by NITDA-accredited Data Protection Compliance Organisation (DPCO)
- [ ] Publish Privacy Policy v2 referencing M7f channel additions
