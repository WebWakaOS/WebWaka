# WebWaka OS — Phase 3: Staged Implementation Plan

**Date:** 2026-05-03  
**Branch target:** `feature/provider-registry-phone-identity` → merge to `staging`

---

## Batch Overview

| Batch | Scope | Files Affected | Status |
|-------|-------|---------------|--------|
| 1 | DB Migrations | infra/db/migrations/ | ⏳ Pending |
| 2 | Provider Registry Package | packages/provider-registry/ | ⏳ Pending |
| 3 | AI Key Pool | packages/ai-abstraction/src/ | ⏳ Pending |
| 4 | Cloudflare Email Provider | apps/api/src/lib/ | ⏳ Pending |
| 5 | Phone/Email Identity | apps/api/src/routes/auth-routes.ts | ⏳ Pending |
| 6 | Provider Admin Routes | apps/api/src/routes/ | ⏳ Pending |
| 7 | Platform Admin UI | apps/platform-admin/src/ | ⏳ Pending |
| 8 | Tests | Various *.test.ts | ⏳ Pending |
| 9 | Wrangler Config | apps/api/wrangler.toml | ⏳ Pending |
| 10 | Seed + Staging Deploy | CI/CD | ⏳ Pending |

---

## BATCH 1: Database Migrations

**Objective:** Create all new D1 tables and user table extensions  
**Files:**
- `infra/db/migrations/0544_provider_registry.sql`
- `infra/db/migrations/0545_provider_audit_log.sql`
- `infra/db/migrations/0546_ai_provider_keys.sql`
- `infra/db/migrations/0547_users_phone_identity.sql`
- Possibly also update `apps/api/migrations/` if this project uses a local copy

**Schema changes:**
1. `provider_registry` table — provider metadata + encrypted credentials
2. `provider_audit_log` table — immutable audit trail
3. `ai_provider_keys` table — multi-key pool for AI providers
4. `users.phone_verified_at` (INTEGER, nullable) — phone verification timestamp
5. `users.identity_providers` (TEXT, default '["email"]') — identity method used
6. `users.phone_e164` (TEXT, nullable, UNIQUE per tenant) — E.164 normalized phone
7. `phone_otps` table — OTP storage for phone auth

**Tests required:**  
- `infra/db/migrations/test/0544-0547.test.ts` (migration apply + rollback safety)

**Rollout:**  
- Apply to staging D1 first; verify via `wrangler d1 execute --env staging`
- No backward compatibility risk (all additive)

---

## BATCH 2: Provider Registry Package

**Objective:** Implement core provider registry service  
**New package:** `packages/provider-registry/`  
**Files:**
- `packages/provider-registry/src/types.ts`
- `packages/provider-registry/src/crypto.ts`
- `packages/provider-registry/src/service.ts`
- `packages/provider-registry/src/resolution.ts`
- `packages/provider-registry/src/index.ts`
- `packages/provider-registry/package.json`
- `packages/provider-registry/tsconfig.json`
- `packages/provider-registry/vitest.config.ts`

**Key implementations:**
1. `encryptCredentials(credentials, encryptionSecret)` — AES-256-GCM
2. `decryptCredentials(encrypted, iv, encryptionSecret)` — AES-256-GCM
3. `ProviderRegistryService.create/update/activate/deactivate/list`
4. `resolveProvider(category, scopeHints, db, kv, encryptionSecret)` — hierarchical lookup
5. Audit log write on every mutating action
6. KV cache pattern: `provider:active:{category}:{scope}:{scope_id}`

**Tests required:**
- Encrypt → decrypt roundtrip
- resolveProvider: tenant override wins over platform
- resolveProvider: falls back when no tenant/partner override
- Audit log written on activate/deactivate

---

## BATCH 3: AI Provider Pool Extension

**Objective:** OpenRouter multi-key pool + DB-backed provider resolution  
**Files:**
- `packages/ai-abstraction/src/key-pool.ts` — NEW
- `packages/ai-abstraction/src/free-models.ts` — NEW
- `packages/ai-abstraction/src/router.ts` — extend resolveAdapter()
- `packages/ai-abstraction/src/types.ts` — extend for D1Like type

**Key implementations:**
1. `OpenRouterKeyPool.selectKey(db, kv)` — LRU with rate-limit filtering
2. `OpenRouterKeyPool.markRateLimited(db, keyId, until)` — update D1 + KV
3. `OpenRouterKeyPool.markSuccess/Failure(db, keyId)` — usage stats
4. `FREE_MODEL_ALLOWLIST` constant + KV override pattern
5. Extended `resolveAdapter()`: DB key pool for openrouter at Level 3/4

**Tests required:**
- Key pool selects LRU key
- Rate-limited keys are skipped
- Falls back to env var when pool is empty
- markRateLimited updates D1 record

---

## BATCH 4: Cloudflare Email Provider

**Objective:** Cloudflare Email as default, Resend as fallback  
**Files:**
- `apps/api/src/lib/email-provider.ts` — NEW
- `apps/api/src/lib/email-service.ts` — update to use EmailProviderRouter
- `apps/api/src/env.ts` — add SEND_EMAIL binding type

**Key implementations:**
1. `IEmailProvider` interface
2. `CloudflareEmailProvider.send()` — uses `env.SEND_EMAIL.send()`
3. `ResendEmailProvider.send()` — existing Resend REST call extracted
4. `EmailProviderRouter.send()` — CF first, Resend fallback
5. Update `EmailService.sendTransactional()` to call `EmailProviderRouter`

**Tests required:**
- CF binding present → CF provider selected
- CF binding absent → Resend fallback
- CF fails → Resend retry

**Wrangler config:** See Batch 9

---

## BATCH 5: Phone + Email Identity

**Objective:** Phone OTP login + phone-first registration  
**Files:**
- `apps/api/src/routes/auth-routes.ts` — extend login + register + add OTP routes
- `apps/api/src/routes/otp.ts` — NEW: OTP request/verify routes

**Key implementations:**
1. `POST /auth/otp/request` — Nigerian phone validation + Termii send + hashed OTP storage
2. `POST /auth/otp/verify` — OTP hash verify + JWT issue + phone_verified_at update
3. Update `POST /auth/login` — accept phone identifier (OTP login)
4. Update `POST /auth/register` — phone-first registration path
5. `normalizePhoneToE164()` helper
6. KV velocity limits: `otp_req:{phone_e164}:{purpose}` → count, TTL=900s (15 min)
7. D1 OTP attempt tracking (max 5 attempts before OTP invalidation)

**Tests required:**
- OTP request stores hashed OTP in D1
- OTP verify: correct code issues JWT
- OTP verify: wrong code increments attempt_count
- OTP verify: attempt_count >= 5 → reject
- OTP verify: expired OTP → reject
- Velocity limit: 4th request in 15 min → 429
- Phone login: valid OTP → JWT
- Phone register: phone+OTP+businessName → new tenant+user → JWT

---

## BATCH 6: Provider Admin API Routes

**Objective:** Admin CRUD for provider management  
**Files:**
- `apps/api/src/routes/admin/providers.ts` — NEW
- `apps/api/src/routes/admin/ai-keys.ts` — NEW
- `apps/api/src/route-groups/register-admin-routes.ts` — add new routes
- `apps/api/package.json` — add provider-registry dep
- `apps/api/tsconfig.json` — add path mapping

**Key implementations:**
1. `GET /admin/providers` — list all, paginated, with decrypted preview (masked)
2. `POST /admin/providers` — create with encrypted credentials
3. `PATCH /admin/providers/:id` — update non-credential fields + audit log
4. `POST /admin/providers/:id/credentials` — rotate credentials + audit log
5. `POST /admin/providers/:id/activate` — set status=active + deactivate conflicting single-active
6. `POST /admin/providers/:id/deactivate` — set status=inactive
7. `POST /admin/providers/:id/test` — safe connectivity test (email/AI ping)
8. `GET /admin/providers/:id/audit` — audit log list
9. `GET /admin/providers/:id/keys` — AI key pool (masked keys)
10. `POST /admin/providers/:id/keys` — add key to pool
11. `DELETE /admin/providers/:id/keys/:keyId` — remove key

**Auth:** All routes require `role === 'super_admin'`

**Tests required:**
- 403 for non-super_admin
- Create → list → activate → deactivate flow
- Credentials are masked in list/get responses
- Audit log entry on every mutation

---

## BATCH 7: Platform Admin React UI

**Objective:** Visual provider management interface  
**Target app:** `apps/platform-admin/` (React SPA)
**Files:**
- `apps/platform-admin/src/pages/Providers.tsx` — NEW
- `apps/platform-admin/src/pages/ProviderDetail.tsx` — NEW
- `apps/platform-admin/src/pages/AIKeyPool.tsx` — NEW
- `apps/platform-admin/src/components/ProviderCard.tsx` — NEW
- `apps/platform-admin/src/components/ProviderStatusBadge.tsx` — NEW
- `apps/platform-admin/src/api/providers.ts` — API client functions
- `apps/platform-admin/src/router.tsx` — add new routes

**UI Features:**
1. Provider list with category tabs + status badges
2. Create/edit provider form with category selection
3. Credential update form (password-masked inputs, never displayed after save)
4. Activate/Deactivate toggle with confirmation
5. Test connectivity button + response display
6. Audit log timeline per provider
7. AI Key Pool management: add/remove/view-status keys (masked)

---

## BATCH 8: Tests

**Objective:** Comprehensive test coverage for all new functionality  
**Strategy:** Unit tests for each new module; integration smoke tests for end-to-end flows  

**New test files:**
- `packages/provider-registry/src/crypto.test.ts`
- `packages/provider-registry/src/resolution.test.ts`
- `packages/provider-registry/src/service.test.ts`
- `packages/ai-abstraction/src/key-pool.test.ts`
- `packages/ai-abstraction/src/free-models.test.ts`
- `apps/api/src/lib/email-provider.test.ts`
- `apps/api/src/routes/otp.test.ts`
- `apps/api/src/routes/admin/providers.test.ts`

**Coverage targets:**
- Crypto: encrypt/decrypt roundtrip, handles empty input
- Resolution: all 3 scope levels, fallback to env var
- Key pool: LRU selection, rate-limit skipping, fallback
- Email provider: CF first, Resend fallback, CF failure fallback
- OTP: full flow including rate limits and attempt tracking
- Provider admin: CRUD + auth guards + audit entries

---

## BATCH 9: Wrangler Config Updates

**Objective:** Add Cloudflare Email Service binding  
**Files:** `apps/api/wrangler.toml`

**Changes:**
```toml
# Add to [env.staging] section:
[[env.staging.email]]
binding = "SEND_EMAIL"
domain = "webwaka.com"

# Add to [env.production] section:
[[env.production.email]]
binding = "SEND_EMAIL"
domain = "webwaka.com"
```

**Prerequisites (must be done in CF Dashboard BEFORE deploying Batch 9):**
1. Verify `webwaka.com` as sending domain in Cloudflare Email Service
2. Add SPF, DKIM, DMARC records for `webwaka.com`
3. Confirm webwaka.com DNS is managed by Cloudflare (or accessible for record creation)

**Staging note:** Can be deployed with `SEND_EMAIL` binding only in staging config first  
**Fallback safety:** EmailProviderRouter uses Resend when `env.SEND_EMAIL` is absent

---

## BATCH 10: Seed + Deploy

**Objective:** Seed initial provider registry + staging verification  
**Files:**
- `infra/db/seeds/provider-registry-seed.sql` — NEW
- `.github/workflows/deploy-staging.yml` — update for migration + seed

**Seed data:**
```sql
-- Seed platform-level providers matching existing env var config
INSERT INTO provider_registry (id, category, provider_name, display_name, status, scope, priority)
VALUES
  ('pvd_groq_01', 'ai', 'groq', 'Groq', 'active', 'platform', 10),
  ('pvd_openrouter_01', 'ai', 'openrouter', 'OpenRouter', 'active', 'platform', 20),
  ('pvd_together_01', 'ai', 'together', 'Together AI', 'inactive', 'platform', 30),
  ('pvd_deepinfra_01', 'ai', 'deepinfra', 'DeepInfra', 'inactive', 'platform', 40),
  ('pvd_cloudflare_email_01', 'email', 'cloudflare_email', 'Cloudflare Email', 'inactive', 'platform', 10),
  ('pvd_resend_01', 'email', 'resend', 'Resend', 'active', 'platform', 20),
  ('pvd_termii_01', 'sms', 'termii', 'Termii', 'active', 'platform', 10),
  ('pvd_paystack_01', 'payment', 'paystack', 'Paystack', 'active', 'platform', 10),
  ('pvd_prembly_01', 'identity', 'prembly', 'Prembly', 'active', 'platform', 10);
```

**Staging verification checklist:**
1. All 4 migrations apply cleanly
2. Provider registry seed rows present
3. Admin routes return correct data
4. Existing auth flow (email+password) unchanged
5. Phone OTP flow: request → verify → JWT
6. Email still sends (Resend fallback active, CF Email binding pending domain verification)
7. AI routes continue working (env var fallback)

---

## Continuation Log Format

Each batch that gets implemented should append to:  
`docs/phase0-artifacts/provider-identity-implementation-log.md`

Format:
```markdown
## BATCH N — <Title>
**Date:** YYYY-MM-DD  
**Status:** COMPLETE | IN_PROGRESS | BLOCKED  
**Commit:** <hash>  
**Tests:** PASS | FAIL  
**Notes:** ...
```

---

## Pre-Implementation Checklist (Credentials Needed)

Before starting implementation, the following must be available:

1. ✅ GitHub PAT — to clone and push to WebWakaOS/WebWaka
2. ✅ Cloudflare API Token — for wrangler deploy + D1 migration apply
3. ✅ Cloudflare Account ID — for wrangler targeting
4. ⏳ CF Email Service domain verification — webwaka.com verified as sender
   (Can proceed without this for Batch 1-8; needed for Batch 9)

---

*Implementation plan complete. Ready to proceed once credentials are provided.*
