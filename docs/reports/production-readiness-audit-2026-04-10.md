# WebWaka Production Readiness Audit

**Date:** 2026-04-10
**Repo State:** `09f707d` (HEAD → main, origin/main)
**Audit Scope:** 100% repo coverage — 2,316 files, 8 apps, ~160 packages, 182 migrations
**Auditor:** Replit Agent (automated deep-dive)

---

## 1. EXECUTIVE SUMMARY

| Dimension | Score | Finding |
|---|---|---|
| **Overall Production Readiness** | **2 / 10** | Cannot deploy — D1/KV IDs are placeholders |
| Code completeness | 5 / 10 | 83 of ~160 vertical packages have broken imports |
| TypeScript health | 1 / 10 | 517 tsc errors across 92 files — CI blocks all deployments |
| Security posture | 6 / 10 | Strong intent, several controls unimplemented |
| Infrastructure provisioning | 3 / 10 | Cloudflare resources exist but not wired in |
| Compliance (NDPR/CBN) | 5 / 10 | NDPR consent solid; CBN T2/T3 and AML incomplete |
| Frontend / UX | 1 / 10 | No user-facing React/SPA UI exists anywhere |
| Monitoring / Observability | 1 / 10 | `console.error` only — no metrics, tracing, or alerting |
| Documentation | 3 / 10 | Excellent governance docs; no README, no API spec |
| Testing | 4 / 10 | 180 test files exist; smoke/e2e dirs empty |

### Critical Blockers Summary (deployment literally impossible)
1. `wrangler.toml` placeholder IDs — Cloudflare D1 and KV not wired
2. 517 TypeScript errors — CI `pnpm typecheck` fails → staging deploy gate blocked
3. `apps/api/src/types.ts` missing — 47 route files fail to import
4. Paystack workspace activation is a code stub (generates fake reference)
5. Price-lock tokens unsigned (base64 only) — forgeable by any attacker

### 30-Day Path to Minimum Viable Production
```
Week 1: Wire Cloudflare IDs → fix types.ts → clear tsc errors → unblock CI
Week 2: Remove as-never casts → HMAC-sign price tokens → add global rate limit
Week 3: Fix hardcoded URLs → provision all GitHub secrets → smoke tests
Week 4: Load test → external NDPR audit → CBN sandbox submission → soft launch
```

---

## 2. BLOCKERS — Production Impossible Without These

### B-01: Cloudflare D1 / KV Placeholder IDs Not Inserted
**Impact:** Every `wrangler deploy` attempt will throw binding errors and fail.
**Evidence:**
```
apps/api/wrangler.toml:       database_id = "placeholder-replace-with-actual-id"
apps/api/wrangler.toml:       id = "placeholder-replace-with-actual-id"
apps/brand-runtime/wrangler.toml: same pattern
apps/public-discovery/wrangler.toml: same pattern
```
**Fix:** The milestone tracker confirms IDs were provisioned:
- Staging D1: `cfa62668` / Production D1: `de1d0935`
- GEOGRAPHY_CACHE KV, RATE_LIMIT_KV IDs known — insert into all four `wrangler.toml` files.
**Est:** 1 hour

---

### B-02: 517 TypeScript Compilation Errors — CI Gate Fails
**Impact:** `pnpm typecheck` in CI returns exit code 1 → deploy-staging.yml blocks → no deployment possible.
**Evidence:** `npx tsc --noEmit -p apps/api/tsconfig.json` → 517 errors in 92 files.
**Root causes:**
1. **Missing `apps/api/src/types.ts`** (47 errors) — Extended route bundles (`verticals-edu-agri-extended.ts`, `verticals-health-extended.ts`, etc.) import `'../types.js'` which does not exist
2. **83 vertical packages with unresolved module paths** — routes in `apps/api/src/routes/verticals/*.ts` reference packages that cannot resolve `@cloudflare/workers-types` (devDependency not installed at package level in monorepo)
3. **Mismatched Hono context type parameters** — `Context<{ Bindings: Env }>` vs `Context<Env>` pattern inconsistency in Set J vertical routes
4. **Missing exports** — e.g. `MinistryRepository` not exported from `@webwaka/verticals-ministry-mission`
**Fix:** (a) Create `apps/api/src/types.ts` with shared types. (b) Standardise Hono context typing in all vertical routes. (c) Fix missing package exports.
**Est:** 3–5 days (systematic, not complex)

---

### B-03: 151 `as never` Type Casts in Production Route Handlers
**Impact:** TypeScript is silenced — type errors become runtime panics with real data. Any vertical with `as never` is functionally unverified.
**Evidence:**
```bash
grep -r "as never" apps/api/src/routes/verticals/ | wc -l  → 151
```
Examples:
- `bookshop.ts:122` — `orderItems: body.order_items ?? '[]', totalKobo: body.total_kobo as never`
- `catering.ts:38` — `speciality: body.speciality as never`
- `car-wash.ts:86` — `guardClaimedToActive({} as never)`
**Fix:** Fix the underlying type definitions so casts are unnecessary. Remove all `as never`.
**Est:** 3 days

---

### B-04: Workspace Activation Uses a Fake Paystack Reference
**Impact:** Any workspace that "upgrades" via `POST /workspaces/:id/activate` receives a `stub_` reference — no real money moves. Subscription billing is non-functional.
**Evidence:**
```typescript
// apps/api/src/routes/workspaces.ts line 77–94
const paystackReference = `stub_${crypto.randomUUID().replace(/-/g, '')}`;
// note: 'Payment processing via Paystack stub — full integration in Milestone 6'
```
**Fix:** Implement actual Paystack checkout initialisation using the real `packages/payments` integration (which does exist and is functional for manual payment verification).
**Est:** 1 day

---

### B-05: Price-Lock Tokens Are Not Cryptographically Signed
**Impact:** Any party can decode a base64 price-lock token, modify `listed_price_kobo` or `session_id`, re-encode it, and submit a forged token to bypass negotiation guardrails.
**Evidence:**
```typescript
// packages/negotiation/src/price-lock.ts
// TODO: sign with HMAC-SHA256 using a platform secret key before production.
// Current implementation: btoa(JSON.stringify(payload)) — no integrity check
```
**Fix:** Sign with `HMAC-SHA256(PRICE_LOCK_SECRET, JSON.stringify(payload))` using a new Worker Secret. Verify before decoding on every `POST /api/v1/negotiation/price-lock/verify`.
**Est:** 2 hours

---

### B-06: `apps/api/src/types.ts` Does Not Exist
**Impact:** 47 route files fail to compile because they import `'../types.js'` (a shared types file that was never created).
**Evidence:**
```
apps/api/src/routes/verticals-edu-agri-extended.ts(20,26): error TS2307: Cannot find module '../types.js'
apps/api/src/routes/verticals-health-extended.ts(13,26): same
apps/api/src/routes/verticals-prof-creator-extended.ts(18,26): same
...and 44 more
```
**Fix:** Create `apps/api/src/types.ts` with the shared helper types used by extended route bundles.
**Est:** 30 minutes

---

### B-07: GitHub Actions Secrets Not Set (CLOUDFLARE_*)
**Impact:** `deploy-staging.yml` and `deploy-production.yml` both require `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` in GitHub repository secrets. Without them, every deploy job will fail with "Secret not found."
**Evidence:** Workflow files reference `${{ secrets.CLOUDFLARE_ACCOUNT_ID }}` and `${{ secrets.CLOUDFLARE_API_TOKEN }}` but these are not visible in this repo's environment.
**Fix:** Set in GitHub → Settings → Secrets → Actions. Milestone tracker lists them as "DONE" but they must be re-verified against the current repo fork.
**Est:** 30 minutes

---

## 3. HIGH PRIORITY — Must Fix Before 1,000 Users

### H-01: No Global Rate Limiting on API
**Impact:** All endpoints except `/identity/verify-*`, `/contact/verify/*`, and `/pos/float/*` have no rate limiting. Mass scraping, brute-force, and denial-of-service are possible on claims, payments, community, social, commerce, and negotiation routes.
**Files:** `apps/api/src/index.ts` — no `app.use('/*', globalRateLimit)` exists
**Fix:** Add a global `rateLimitMiddleware` per-tenant (100 req/min by default) before all authenticated routes, with vertical-specific overrides.
**Est:** 4 hours

---

### H-02: No README.md at Repository Root
**Impact:** Developer onboarding impossible. Any new contributor (or future agent) has no starting point.
**Evidence:** `ls README.md` → file not found
**Fix:** Create `README.md` with: project description, tech stack, setup steps, env vars, how to run locally, how to deploy.
**Est:** 2 hours

---

### H-03: No API Documentation (OpenAPI / Swagger)
**Impact:** No external developer, frontend team, mobile app, or integration partner can consume the API without reading 12,000+ lines of route code.
**Evidence:** `find . -name "openapi*" -o -name "swagger*"` → no results
**Fix:** Generate OpenAPI 3.1 spec from Hono routes (use `@hono/zod-openapi` or document manually for core routes at minimum). Start with the 14 core platform routes.
**Est:** 2 days (minimal viable), 2 weeks (complete)

---

### H-04: Hardcoded `app.webwaka.com` Callback URL in Payments
**Impact:** Payment callbacks fail in staging and development — Paystack redirects back to a production URL that doesn't exist yet.
**Evidence:**
```typescript
// apps/api/src/routes/payments.ts line 99
callbackUrl: `https://app.webwaka.com/billing/verify?ref={PAYSTACK_REFERENCE}`,
```
**Fix:** Move to `c.env.APP_BASE_URL` Worker var, set to the correct value per environment.
**Est:** 30 minutes

---

### H-05: No Security Headers on Main API Responses
**Impact:** Browser-based consumers of the API receive no HSTS, X-Frame-Options, X-Content-Type-Options, or Referrer-Policy headers.
**Evidence:** `grep -n "secureHeaders\|X-Frame\|Strict-Transport" apps/api/src/index.ts` → zero results (only platform-admin has CSP)
**Fix:** Add `import { secureHeaders } from 'hono/secure-headers'` and `app.use('/*', secureHeaders())` — already available in Hono, used in `apps/projections`.
**Est:** 30 minutes

---

### H-06: No Smoke Tests Implemented
**Impact:** After every staging deploy, there is no automated verification that the API is reachable and returning correct responses. Broken deployments go undetected until a human notices.
**Evidence:** `tests/smoke/` directory exists but is empty. `deploy-staging.yml` silently skips smoke tests when `tests/smoke/package.json` is absent.
**Fix:** Implement a minimal smoke test suite: `GET /health`, `POST /auth/login` (valid + invalid), `GET /geography/places`, `GET /discovery/search`. Run after every staging deploy.
**Est:** 1 day

---

### H-07: No Error Monitoring / Observability
**Impact:** Production errors are silently lost. No alerting, no incident detection, no performance metrics.
**Evidence:**
```typescript
// apps/api/src/index.ts line 579
app.onError((err, c) => {
  console.error('[webwaka-api] Unhandled error:', err);
  // ... that's it — console.error only
});
```
**Fix:** Integrate Cloudflare Workers' built-in `logpush` to an external destination (e.g., Better Stack, Axiom, or Datadog) for structured logs and error alerting. Add `Sentry.captureException()` or equivalent on the `onError` handler.
**Est:** 1 day

---

### H-08: Analytics Rebuild in Projections App Is a Stub
**Impact:** `POST /rebuild/analytics` in `apps/projections` returns a fake "queued" message. Platform analytics (usage, tenant metrics) never update.
**Evidence:**
```typescript
// apps/projections/src/index.ts
// For M6 we acknowledge + return a stub response.
return c.json({ message: 'Analytics rebuild queued (stub — full implementation in M7)' });
```
**Fix:** Implement actual analytics aggregation from `event_log` into an analytics snapshot table. This was deferred from M6 → M7 and is still unresolved.
**Est:** 2 days

---

### H-09: `apps/partner-admin` Has No Source Code
**Impact:** The partner/tenant management portal (Pillar 1) does not exist. Partners cannot self-manage their tenants, billing, or configuration.
**Evidence:** `ls apps/partner-admin/src/` → empty directory
**Fix:** Implement partner admin portal. Critical for multi-tenant operations at any commercial scale.
**Est:** 2 weeks minimum

---

### H-10: DTIA for Telegram and Meta API Not Completed
**Impact:** Under NDPR Article 2.10, cross-border data transfers require a Data Transfer Impact Assessment. Sending OTP content and user handles to Telegram (Netherlands) and Meta (USA) without DTIA is a regulatory violation.
**Evidence:** `docs/qa/ndpr-consent-audit.md` explicitly flags both as `PARTIAL` with an open action item.
**Fix:** Commission DTIA documentation for both integrations. Engage a NITDA-accredited DPCO.
**Est:** 2–4 weeks (external dependency)

---

## 4. MEDIUM PRIORITY — Must Fix Before 10,000 Users

### M-01: KYC Tier 2 and Tier 3 Identity Verification Not Implemented
Only phone-based Tier 1 is production-ready. BVN/NIN linkage for Tier 2 exists as routes but document upload for Tier 3 is missing entirely. This caps transaction limits at ₦200,000/day for all users.
**Files:** No document upload handler exists anywhere in the codebase.
**Est:** 2 weeks

---

### M-02: No AML / Transaction Monitoring
CBN KYC/AML guidelines require velocity checks and suspicious activity reporting. No AML rule engine exists.
**Files:** Not implemented — `docs/qa/cbn-kyc-audit.md` lists it as an open action item.
**Est:** 2 weeks

---

### M-03: CBN Sandbox Approval Not Submitted
Payment operations (Paystack, mobile money, airtime) require CBN sandbox + production approval letters. No evidence this was submitted.
**Fix:** File CBN PSSP application or confirm Paystack umbrella licence covers the use case.
**Est:** 4–12 weeks (regulatory)

---

### M-04: NIBSS BVN Verification Not Integrated
Currently, BVN verification routes through Prembly only. CBN prefers NIBSS direct integration for KYC T2 operations.
**Est:** 1 week

---

### M-05: Privacy Policy v2 Not Published
The NDPR audit explicitly lists this as an open action item. A public Privacy Policy is required under NDPR before any personal data can be collected.
**Est:** 1 week (legal review)

---

### M-06: R2 Storage Not Configured for File Uploads
Document uploads (for KYC, profile images, product photos) have no implementation. R2 buckets were provisioned (milestone tracker) but no upload routes or signed URL generation exist.
**Est:** 3 days

---

### M-07: Community and Social Packages Have Stub Files
`packages/community/src/stub.ts` and `packages/social/src/stub.ts` exist alongside real implementations, suggesting incomplete migration from stubs. These should be removed and their exports consolidated.
**Files:** `packages/community/src/stub.ts`, `packages/social/src/stub.ts`
**Est:** 2 hours

---

### M-08: Consent Withdrawal Webhook to Telegram Not Implemented
When a user removes their Telegram channel, their Telegram chat data should be deleted from Telegram's servers. This is open under NDPR right-to-erasure.
**Est:** 1 day

---

### M-09: No Load Testing or Capacity Planning
No `k6`, `artillery`, or Cloudflare load test results exist in the repo. Cloudflare Workers handle concurrency differently from traditional servers — D1 write throughput in particular has known limits (1 writer at a time per database).
**Est:** 2 days setup + ongoing

---

### M-10: Backup / Restore Not Tested
D1 backups are managed by Cloudflare, but no documented backup schedule, restore procedure, or restore drill exists. Point-in-time recovery strategy is unclear.
**Est:** 1 day (document + test)

---

### M-11: No Multi-Region / HA Setup Documentation
Cloudflare Workers are globally distributed, but D1 is a single-writer SQLite — there's no replica read strategy documented. Under high read load, queries will bottleneck on D1.
**Est:** 1 week (architecture + implementation)

---

## 5. VERTICAL-SPECIFIC GAPS

### Commerce (used-car, spare-parts, building-materials, etc.)
**Status:** Business logic in packages is solid. Negotiation system newly complete. Payment integration per-listing not yet wired. Inventory management (stock deduction on order) not universally implemented.
**Gaps:**
- Order fulfilment state machine not fully wired for most commerce verticals
- No buyer-side dispute resolution flow
- Product image upload via R2 not implemented

### Transport (motor-park, rideshare, haulage, logistics, okada-keke)
**Status:** Routes and packages implemented. `OkadaKekeRepository` missing `create` method (tsc error `TS2339`). Logistics route has negotiation integration (bulk_rfq only). NURTW compliance documented but no enforcement gate.
**Gaps:**
- `OkadaKekeRepository.create()` missing → compile error
- Real-time tracking not implemented
- Driver KYC enforcement (FRSC licence) not wired into booking flow

### Civic (mosque, church, NGO, campaign-office, ward-rep)
**Status:** Packages exist and are detailed. Political verticals (campaign-office, ward-rep) have L3 HITL gates. `MinistryRepository` is not exported from the ministry-mission package → compile error.
**Gaps:**
- `MinistryRepository` missing export → compile error in `apps/api/src/routes/civic.ts`
- Community hall booking conflict detection wired but not tested with realistic concurrency
- Campaign finance reporting not connected to INEC e-portal

### POS / Financial
**Status:** Float ledger is double-entry and correct (P9 invariant). Airtime integration complete with rate limiting. Bureau de change FX rates (integer kobo/cent, no floats) well implemented.
**Gaps:**
- Workspace activation payment stub (B-04)
- Mobile money `agent_wallet` settlement to real bank not implemented
- POS terminal offline sync tested in isolation but not with real D1 + Worker

### Health / Professional / Educational
**Status:** Vertical packages complete with regulatory gates (MDCN, VCNB, NDLEA, NBA). L3 HITL enforced where required.
**Gaps:**
- No integration with MDCN or NDLEA registrar APIs (currently static reference number validation only)
- Elderly care + rehab centre KYC T3 enforcement needs T2/T3 implementation first (M-01)

---

## 6. INFRASTRUCTURE READINESS

### Database — 3/10
| Item | Status |
|---|---|
| D1 databases provisioned | ✅ Yes (staging `cfa62668`, prod `de1d0935`) per milestone tracker |
| IDs inserted into wrangler.toml | ❌ **No — all show `placeholder-replace-with-actual-id`** |
| 182 migrations written | ✅ Yes |
| Migrations applied to staging | ❌ Unknown — no apply confirmed |
| Migrations applied to production | ❌ No — never deployed |
| Indexes on high-cardinality columns | ⚠️ Partial — some tables missing indexes on `tenant_id + status` |
| D1 backup strategy | ❌ Not documented |
| Read replica strategy | ❌ None |

### Deployment — 2/10
| Item | Status |
|---|---|
| GitHub Actions CI workflow | ✅ Configured (typecheck, test, lint, audit) |
| CI currently passing | ❌ **No — 517 tsc errors fail typecheck** |
| Staging deploy workflow | ✅ Configured (on push to staging) |
| Production deploy workflow | ✅ Configured (on push to main) |
| `staging` branch exists | ❌ Not confirmed — all pushes to `main` |
| DNS configured | ❌ PENDING in milestone tracker |
| Smoke tests after deploy | ❌ Empty test suite |
| Rollback procedure | ❌ Not documented |
| Zero-downtime deploy | ✅ Workers are stateless — inherent |

### Monitoring — 1/10
| Item | Status |
|---|---|
| Structured error logging | ❌ `console.error` only |
| Error alerting | ❌ None |
| Performance metrics | ❌ None |
| Uptime monitoring | ❌ None |
| Cloudflare Analytics | ✅ Available by default (Workers) |
| Custom dashboards | ❌ None |

### Storage — 2/10
| Item | Status |
|---|---|
| R2 buckets provisioned | ✅ Yes per milestone tracker |
| R2 wired into any app | ❌ No upload routes exist |
| File upload security | ❌ Not implemented |
| CDN for static assets | ⚠️ Cloudflare by default but no asset pipeline |

---

## 7. SECURITY ASSESSMENT

| Control | Status | Notes |
|---|---|---|
| JWT auth on all protected routes | ✅ PASS | `authMiddleware` applied correctly |
| CORS origin restriction | ✅ PASS | Reads `ALLOWED_ORIGINS` env var, no wildcard |
| NDPR consent gates (P10/P12) | ✅ PASS | `assertChannelConsent()` enforced |
| DM encryption at rest (P14) | ✅ PASS | AES-GCM with `DM_MASTER_KEY` |
| OTP hashed in storage (R7) | ✅ PASS | SHA-256 + `LOG_PII_SALT` |
| PII never raw in logs | ✅ PASS | `hashOTP()` pattern before any log write |
| KYC T0/T1 limits enforced | ✅ PASS | `assertWithinTierLimits()` |
| Telegram webhook secret | ✅ PASS | Constant-time compare |
| BVN enumeration prevention | ✅ PASS | `identityRateLimit` (2/hr) |
| SQL injection | ✅ PASS | All queries use `?` bindings, no interpolation |
| Price-lock token integrity | ❌ **FAIL** | Base64 only — no HMAC signature |
| Global rate limiting | ❌ **FAIL** | Only 3 endpoint families protected |
| Security headers (API) | ❌ **FAIL** | No HSTS, X-Frame, CSP on API |
| DTIA for cross-border transfers | ❌ **FAIL** | Telegram + Meta DTIA not done |
| CBN sandbox approval | ❌ **FAIL** | Not submitted |
| KYC T2/T3 enforcement | ⚠️ PARTIAL | T2/T3 not yet implemented |
| Secrets management | ✅ PASS | All secrets in Cloudflare Worker Secrets |

---

## 8. FRONTEND / UX ASSESSMENT

| Item | Status |
|---|---|
| Buyer/user-facing web UI | ❌ **Does not exist** — brand-runtime is an SSR Worker with HTML templates |
| Mobile app (Android/iOS) | ❌ Not in repository |
| Admin dashboard (platform-admin) | ⚠️ Exists as a Node.js Express server with basic HTML |
| Partner admin portal | ❌ `apps/partner-admin/src/` is empty |
| Public discovery (Pillar 3) | ⚠️ Cloudflare Worker with Hono + template strings — no SPA |
| PWA (service worker, manifest) | ❌ Referenced in docs/governance but no manifest.json or sw.js found |
| Mobile responsiveness | ❌ Not testable — no HTML templates found with responsive CSS |
| Accessibility (a11y) | ❌ Not assessable |
| Lighthouse scores | ❌ Not run |
| Design system package | ✅ `packages/design-system` exists (tokens + patterns) |

**Critical finding:** The entire product has no user-facing frontend beyond template-string HTML in Cloudflare Workers. Pillar 2 (Branding), Pillar 3 (Marketplace), and the mobile experience are all effectively absent from the codebase. This is likely the largest single gap between current state and production.

---

## 9. TASK PLAN — 90-Day Production Roadmap

### Sprint 1: Remove Deployment Blockers (Week 1–2)

| Task | Files | Acceptance Criteria | Est |
|---|---|---|---|
| 1.1: Wire Cloudflare D1 + KV IDs | `apps/api/wrangler.toml`, `apps/brand-runtime/wrangler.toml`, `apps/public-discovery/wrangler.toml`, `apps/ussd-gateway/wrangler.toml` | All `placeholder` values replaced; `wrangler deploy --env staging` succeeds | 1h |
| 1.2: Create `apps/api/src/types.ts` | New file | 47 `Cannot find module '../types.js'` errors resolve | 30m |
| 1.3: Fix Hono context type pattern in Set J routes | `apps/api/src/routes/verticals/*.ts` (124 files) | `Context<{ Bindings: Env }>` used consistently; abattoir-style errors gone | 2d |
| 1.4: Fix missing package exports | `@webwaka/verticals-ministry-mission` (MinistryRepository), `@webwaka/verticals-okada-keke` (create method) | `civic.ts` and `transport.ts` errors clear | 4h |
| 1.5: Remove all 151 `as never` casts | All affected vertical route files | Zero `as never` in production route handlers | 2d |
| 1.6: Set GitHub Actions secrets | GitHub repo Settings → Secrets | `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` set; CI green | 30m |
| 1.7: Clear remaining tsc errors | Remaining 92 files | `pnpm typecheck` exits 0; CI unblocked | 1d |

### Sprint 2: Security + Deployment Hardening (Week 3–4)

| Task | Files | Acceptance Criteria | Est |
|---|---|---|---|
| 2.1: HMAC-sign price-lock tokens | `packages/negotiation/src/price-lock.ts` | Tokens contain HMAC-SHA256 signature; forged tokens rejected with 422 | 2h |
| 2.2: Add global rate limiting | `apps/api/src/index.ts` | All authenticated routes rate-limited at 100 req/min per tenant | 4h |
| 2.3: Add security headers to API | `apps/api/src/index.ts` | `secureHeaders()` middleware applied; Hono built-in used | 30m |
| 2.4: Fix hardcoded callback URL | `apps/api/src/routes/payments.ts` | `APP_BASE_URL` Worker var used; env-appropriate URL in Paystack checkout | 30m |
| 2.5: Implement workspace Paystack flow | `apps/api/src/routes/workspaces.ts` | Real Paystack checkout initialised; `stub_` prefix gone | 1d |
| 2.6: Apply migrations to staging D1 | CI + wrangler CLI | `wrangler d1 migrations apply webwaka-staging` confirms 182 migrations applied | 2h |
| 2.7: Create smoke test suite | `tests/smoke/` | `GET /health`, auth, geography, discovery smoke tests pass post-deploy | 1d |
| 2.8: Wire error monitoring | `apps/api/src/index.ts` | Unhandled errors forwarded to observability platform (Sentry / Axiom / Logpush) | 1d |

### Sprint 3: Compliance + Regulatory (Week 5–6)

| Task | Files | Acceptance Criteria | Est |
|---|---|---|---|
| 3.1: Commission DTIA for Telegram + Meta | External (DPCO engagement) | DTIA document signed off by accredited DPCO | 2–4w |
| 3.2: Publish Privacy Policy v2 | Legal / public URL | Policy published; URL set in `PRIVACY_POLICY_URL` env var | 1w |
| 3.3: Submit CBN sandbox application | External (CBN / Paystack relationship) | Submission receipt obtained | 1w |
| 3.4: Create README.md | `README.md` | Setup, dev, deploy, env vars all documented | 2h |
| 3.5: Consent withdrawal Telegram webhook | `packages/contact/src/`, `apps/ussd-gateway/src/` | Removing Telegram channel sends Telegram deleteMessage + forgetUser | 1d |
| 3.6: Remove community + social stub files | `packages/community/src/stub.ts`, `packages/social/src/stub.ts` | Files deleted; no broken exports | 30m |

### Sprint 4: Infrastructure + Frontend (Week 7–12)

| Task | Files | Acceptance Criteria | Est |
|---|---|---|---|
| 4.1: R2 file upload routes | New route + signed URL generation | Profile images, KYC documents upload to R2 | 3d |
| 4.2: Analytics rebuild implementation | `apps/projections/src/index.ts` | `POST /rebuild/analytics` runs real aggregation; stub removed | 2d |
| 4.3: KYC T2/T3 implementation | `packages/identity`, `apps/api` | Document upload → Prembly/NIBSS → tier upgrade flow complete | 2w |
| 4.4: AML velocity rule engine | New package or route | Suspicious transaction flagging + reporting to compliance queue | 2w |
| 4.5: Frontend SPA (Pillar 2 + 3) | `apps/brand-runtime`, new React app | User-facing marketplace and brand portal UI | 4–8w |
| 4.6: Partner admin portal | `apps/partner-admin/src/` | Partners can manage tenants, billing, workspaces | 2w |
| 4.7: Load testing | `tests/load/` | 1,000 concurrent users on `/discovery/search` < 200ms p95 | 2d |
| 4.8: Backup / restore drill | Docs + runbook | D1 point-in-time restore tested and documented | 1d |
| 4.9: Generate OpenAPI spec | New file or tooling | Core 30 endpoints documented in OpenAPI 3.1 | 3d |
| 4.10: NIBSS BVN integration | `packages/identity/src/` | Direct NIBSS verification path available as alternative to Prembly | 1w |
| 4.11: DNS configuration | Cloudflare dashboard | `api.webwaka.com`, `app.webwaka.com`, `discover.webwaka.com` configured | 2h |
| 4.12: Staging → production promotion process | `RELEASES.md` | Written runbook for promoting staging to production with sign-off | 1d |

---

## 10. ASSUMPTIONS MADE

1. The Cloudflare D1 and KV IDs listed in the milestone tracker (`cfa62668`, `de1d0935`) are still valid and the resources still exist.
2. GitHub repository secrets (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`) exist in the repo — only their presence in workflow environment can be verified, not their values.
3. The `staging` branch is expected to exist (deploy-staging.yml triggers on push to `staging`) but all recent commits are on `main`. Confirmed that no `staging` branch was pushed to — the staging CI/CD pipeline has never been triggered.
4. Paystack `PAYSTACK_SECRET_KEY` is set as a Cloudflare Worker secret but has never been tested against a real Paystack environment in this deployment.
5. The platform intends to launch web-first (browser) — no mobile SDK was found in the repo.

---

## 11. FILES / AREAS NOT FULLY UNDERSTOOD

| Area | Gap |
|---|---|
| `packages/offerings/` | Package exists but no routes consume it directly in the current index.ts |
| `packages/shared-config/` | Purpose unclear — may be a placeholder |
| `packages/profiles/` | Discovery record format partially understood; claim surface unclear at scale |
| `apps/tenant-public/src/index.ts` | Only a 2-line scaffold — purpose vs `apps/brand-runtime` unclear |
| `apps/admin-dashboard/src/index.ts` | Only 1 file — purpose vs `apps/platform-admin` unclear |
| `.github/workflows/governance-check.yml` | Not read in full — governance enforcement mechanism unclear |
| `packages/auth-tenancy/` vs `packages/auth/` | Functional difference between these two packages not fully traced |
| `infra/cloudflare/` | Directory exists but was not explored in detail |
| `docs/governance/superagent/` | AI billing governance structure not fully audited |

---

## APPENDIX: KEY METRICS

| Metric | Value |
|---|---|
| Total files in repo | 2,316 |
| D1 migrations | 182 |
| Vertical packages | ~160 |
| Vertical route files | 124 |
| TypeScript errors | 517 across 92 files |
| `as never` casts | 151 |
| Missing package imports | 83 unique vertical packages |
| Test files | 180 |
| Governance docs | 29 |
| Technical Decision Records | 12 |
| GitHub Actions workflows | 5 |
| Apps (Workers + servers) | 8 |
| Estimated lines of code | ~60,000+ |

---

*End of Audit — 2026-04-10*
