# Security Review — WebWaka OS M7 (M7e + M7f)

**Document Type:** Security Baseline Review
**Date:** 2026-04-08
**Milestone:** M7e (Nigeria UX) + M7f (Contact Service, Telegram webhook, 360dialog)
**Reviewed against:** `docs/governance/security-baseline.md`
**Prepared by:** Engineering QA Gate process

---

## A. OTP Replay Prevention

**Verification command:**
```bash
grep -r "hashed_otp\|hashOTP\|hash.*otp" packages/otp/src/
```

| Check | Result | Evidence |
|---|---|---|
| OTP hashed before storage (R7) | PASS | `packages/otp/src/otp-generator.ts::hashOTP()` — SHA-256(`LOG_PII_SALT` + otp). Hash returned by `sendMultiChannelOTP()` for storage in `otp_log`. Raw OTP never written to D1. |
| Hash function used | PASS | `crypto.subtle.digest('SHA-256', data)` — Web Crypto API, same as Cloudflare Workers runtime |
| OTP verified by re-hashing submitted code | PASS | `packages/otp/src/multi-channel.ts::verifyOTP()` re-hashes the submitted code with the same salt and compares to stored hash |
| OTP single-use enforced | PASS | `otp_log.used_at` set on first use; subsequent verifications check `used_at IS NULL` |
| OTP expires after 10 minutes | PASS | `OTP_TTL_SECONDS = 600` — `otpExpiresAt()` in `otp-generator.ts`; `isOTPExpired()` checked at verify time |
| Test evidence | PASS | `packages/otp` tests include hash verification — hashed value passed to D1 mock, not raw code |

---

## B. BVN Enumeration Prevention

**Verification commands:**
```bash
grep "identityRateLimit" apps/api/src/index.ts
grep "maskPII\|maskPhone\|LOG_PII_SALT" apps/api/src/middleware/audit-log.ts
```

| Check | Result | Evidence |
|---|---|---|
| `identityRateLimit` applied to `/identity/verify-bvn` | PASS | `apps/api/src/index.ts` line 200: `app.use('/identity/verify-bvn', identityRateLimit)` |
| `identityRateLimit` applied to `/identity/verify-nin` | PASS | `apps/api/src/index.ts` line 201: `app.use('/identity/verify-nin', identityRateLimit)` |
| BVN value never logged in plaintext | PASS | `LOG_PII_SALT` env var used to hash phone/BVN before any log write. `hashOTP(env.LOG_PII_SALT, bvn)` pattern enforced in identity routes. |
| Rate limit key is per-user | PASS | `rate:identity:{userId}` — prevents enumeration via account switching |

---

## C. DM Encryption

**Verification commands:**
```bash
grep "assertDMMasterKey" apps/api/src/index.ts
grep "DM_MASTER_KEY" packages/social/src/dm.ts
```

| Check | Result | Evidence |
|---|---|---|
| `assertDMMasterKey()` called before any route registration | PASS | `apps/api/src/index.ts` line 250: called at startup before routes. 2 matches (import + call). |
| `DM_MASTER_KEY` used in AES-GCM encryption before every INSERT | PASS | `packages/social/src/dm.ts` — `crypto.subtle.importKey('raw', keyMaterial, { name: 'AES-GCM' })` wraps content before D1 INSERT. No plaintext content column. |
| P14 enforced — missing key throws at startup | PASS | `assertDMMasterKey()` throws `'P14_VIOLATION: DM_MASTER_KEY is required but was not provided'` if key absent |
| contact.ts refactor did NOT remove DM guard | PASS | Grep confirms `assertDMMasterKey` still present in `apps/api/src/index.ts` post-M7f refactor |
| No regression from M7e/M7f | PASS | All 42 `@webwaka/social` tests pass; DM encryption tests green |

---

## D. Tenant Isolation (T3) — New M7e/M7f Files

**Verification command:**
```bash
grep -n "SELECT\|INSERT\|UPDATE\|DELETE" \
  apps/api/src/routes/airtime.ts \
  apps/api/src/routes/geography.ts \
  packages/contact/src/contact-service.ts \
  apps/ussd-gateway/src/telegram.ts \
  2>/dev/null | grep -v "tenant_id\|T3.*exception\|#"
```

| File | SQL Queries | Tenant Isolation | Notes |
|---|---|---|---|
| `airtime.ts` | `SELECT agent_wallets WHERE agent_id=? AND tenant_id=?` | PASS | Initial wallet lookup binds `tenantId`. CTE UPDATE uses `wallet.id` from tenant-scoped result. KYC `SELECT users WHERE id=?` — `users.id` globally unique; JWT validates tenant membership before handler. |
| `geography.ts` | `SELECT geography WHERE geography_type=?` | T3 exception (documented) | `T3 exception: geography is platform-wide, not tenant-scoped` — documented in file comment line 113. Public route, no PII. |
| `contact-service.ts` | `SELECT/UPDATE/INSERT contact_channels WHERE user_id=?` | PASS | `contact_channels` has no `tenant_id` column — isolation via globally unique UUID `user_id` (assigned per user per platform). `assertChannelConsent` binds `tenantId` in `consent_records`. Documented in JSDoc. |
| `telegram.ts` | `UPDATE contact_channels SET telegram_chat_id WHERE user_id=?` | PASS | Looks up user by `telegram_chat_id` from bot message — no tenant leak; `user_id` globally unique. |

**Result: Zero new SQL queries violate T3. Geography exception documented. ✓**

---

## E. CORS Configuration

**Verification command:**
```bash
grep "origin\|ALLOWED_ORIGINS" apps/api/src/index.ts
```

| Check | Result | Evidence |
|---|---|---|
| CORS origin is not `'*'` (wildcard) | PASS | `apps/api/src/index.ts` — CORS reads `c.env.ALLOWED_ORIGINS` (comma-separated Worker secret). Returns origin only if it appears in the allowlist. Returns `null` (reject) otherwise. |
| No hardcoded wildcard in production path | PASS | `grep "origin.*'\*'" apps/api/src/index.ts` — zero matches. Wildcard fallback only in development hint comment. |
| `ALLOWED_ORIGINS` is env-driven | PASS | Comment: "CORS origin reads ALLOWED_ORIGINS from Worker env (not hardcoded wildcard). ALLOWED_ORIGINS is a comma-separated string set via CF Dashboard secret." |

---

## 1. Authentication & Authorisation

| Control | Implementation | Status |
|---|---|---|
| JWT-based auth on all API routes | `apps/api/src/index.ts` — auth middleware applied before routes | PASS |
| P13: Financial operations gated on verified primary phone | `requirePrimaryPhoneVerified()` in `packages/auth/src/guards.ts` | PASS |
| P12: NDPR consent required before channel OTP send | `assertChannelConsent()` in `packages/contact/src/contact-service.ts` | PASS |
| Telegram webhook validates `X-Telegram-Bot-Api-Secret-Token` | Constant-time comparison in `apps/ussd-gateway/src/index.ts` webhook handler | PASS |
| USSD sessions expire after 3 minutes | `USSD_SESSION_KV` TTL enforced in `getOrCreateSession()` | PASS |

---

## 2. Input Validation

| Control | Implementation | Status |
|---|---|---|
| Nigerian phone validation (P2) | `validateNigerianPhone()` — validates E.164 with Nigerian prefix | PASS |
| Integer kobo enforcement (T4) | `assertIntegerKobo()` — rejects non-integer monetary values | PASS |
| Airtime amount bounds check | Min 5,000 kobo (₦50), Max 500,000 kobo (₦5,000) | PASS |
| Channel type allowlist | `['sms','whatsapp','telegram','email']` — strict enum on all channel params | PASS |
| OTP purpose allowlist | `['verification','login','transaction','kyc_uplift','password_reset']` | PASS |
| Telegram update body validated before processing | `TelegramUpdate` typed interface — message optional | PASS |

---

## 3. Rate Limiting

| Channel | Limit | Key Pattern | Status |
|---|---|---|---|
| SMS OTP | 5/hr per phone | `rate:otp:sms:{phone_hash}` | PASS |
| WhatsApp OTP | 5/hr per phone | `rate:otp:whatsapp:{phone_hash}` | PASS |
| Telegram OTP | 3/hr per handle | `rate:otp:telegram:{handle_hash}` | PASS |
| Airtime top-up | 5/hr per user | `rate:airtime:{userId}` | PASS |
| USSD sessions | 30/hr per phone | `rate:ussd:{phone}` | PASS |

---

## 4. Secrets Management

| Secret | Storage | Status |
|---|---|---|
| `TERMII_API_KEY` | Cloudflare Worker secret | PASS |
| `WHATSAPP_ACCESS_TOKEN` | Cloudflare Worker secret | PASS |
| `DIALOG360_API_KEY` | Cloudflare Worker secret | PASS |
| `TELEGRAM_BOT_TOKEN` | Cloudflare Worker secret | PASS |
| `TELEGRAM_WEBHOOK_SECRET` | Cloudflare Worker secret | PASS |
| `LOG_PII_SALT` | Cloudflare Worker secret | PASS |
| `JWT_SECRET` | Cloudflare Worker secret | PASS |

No secrets committed to source control. All env vars declared in `apps/api/src/env.ts` as string types — Cloudflare Workers runtime injects at deploy time.

---

## 5. Content Security Policy

| App | CSP Header | Status |
|---|---|---|
| `apps/platform-admin` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'` | PASS |

PWA service worker served with `Cache-Control: no-cache, no-store, must-revalidate` to prevent stale SW registration.

---

## 6. Threat Model Summary (M7-scope)

| Threat | Mitigation | Risk Level |
|---|---|---|
| Fake Telegram bot impersonation | Webhook secret header validates origin | LOW |
| OTP replay via Telegram | OTP expires after 10 min; single-use enforced in `otp_log` | LOW |
| Airtime fraud (rapid top-up) | 5/hr rate limit + insufficient float check | MEDIUM |
| Phone harvesting via geography API | Public endpoints, no PII exposed — places data only | LOW |
| Low-data bypass (client strips header) | Server-side enforcement — client header is opt-in, not security boundary | INFO |
| Telegram chat_id enumeration | chat_id only stored after `/start` from verified handle | LOW |

---

## 7. Findings and Recommendations

### M7e/M7f — No Critical Findings

**Recommended improvements (non-blocking):**
1. Add `Strict-Transport-Security` header to `platform-admin` server responses
2. Replace `'unsafe-inline'` in CSP style-src with nonce-based CSP when CSS-in-JS is removed
3. Add DTIA for Telegram + Meta API cross-border data transfers (NDPR compliance)
4. Implement Telegram message queue with exponential backoff for failed sends
5. Consider rotating `TELEGRAM_WEBHOOK_SECRET` quarterly

---

## 8. QA Gate Result

| Gate | Pass Criteria | Result |
|---|---|---|
| P12 consent guard | All OTP sends require consent_records lookup | PASS |
| P13 phone guard | Financial ops gated on verified primary phone | PASS |
| R8 OTP routing | transaction/kyc_uplift → SMS only | PASS |
| T4 integer kobo | All monetary inputs validated as integers | PASS |
| PWA headers | manifest.json + sw.js + CSP served correctly | PASS |
| Test coverage | ≥ 655 tests (baseline 609 + 46 new) | PENDING (run `pnpm -r test`) |
