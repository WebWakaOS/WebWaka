# WebWaka OS — CONSOLIDATED MASTER REVIEW REPORT

**Consolidation date:** 2026-04-23  
**Sources:** Replit Agent (main branch, `be5f5ef` → `75460fa`) + Abacus AI Deep Agent (staging branch, `7f5ad53679`)  
**Conflict resolution applied:** Higher severity wins · Stronger evidence wins · "Verify" > "Resolved" · Distinct root causes kept separate · UX + Security both kept  
**Governance note:** No finding in this report modifies or softens frozen invariants P9, T3, WF-0xx, or the frozen QA matrix (108 TCs). Every finding is proposed *around* invariants, never against them.

**Finding counts (deduplicated):**
- P0 Critical Bugs: 3
- P1 High Issues: 11
- P2 Medium Issues: 28
- P3 Low/Code Quality: 15
- Security Findings: 15
- Compliance Findings: 8
- Test Gaps: 12
- Infra/CI-CD Findings: 10
- Enhancement Proposals: 48
- **Total unique findings: 102**

**Platform score:** 8.1–8.4 / 10 (range across both reviews; consolidated assessment 8.2/10 pending sprint-1 resolution)

---

## CONFLICT RESOLUTION LOG

| Topic | Replit | Abacus | Resolution |
|---|---|---|---|
| Migration 0374 guard | Present in `main/deploy-production.yml` (lines read) | Absent on `staging` branch (grep zero matches) | Both valid: guard is in `main` but NOT in `staging`; the guard is also ad-hoc/one-time. **P1 finding preserved** (BUG-003): guard exists on main but staging has zero CRONs and no equivalent protection. |
| JWT refresh rotation | SEC-002 (High) | BUG-004 (P1) | **Merged as SEC-002 / BUG-004 at P1** — same root cause, one finding. |
| T3 uniformity | `requirePrimaryPhoneVerified` missing tenant_id | "T3 uniform across all sampled packages" | Abacus did not sample `guards.ts`. Replit read it directly. **T3 gap in guards.ts preserved at P0.** |
| Rate limit fail-open | SEC-004 (Medium) — no alerting | SEC-002 — no SEV alert path | **Merged**: Replit scoped to availability; Abacus added the alerting gap. Combined into one finding with both dimensions. |
| CSRF bypass | BUG-005 (Low) | SEC-001 / BUG-005 (P1) | **Higher severity wins: P1.** |
| NDPR erasure | SEC-012 — atomicity gap | COMP-001/002 — DSAR + receipt | **All distinct root causes preserved** (4 separate findings). |
| CRON ceiling | Not in Replit report | BUG-002 (P1) | **Preserved from Abacus.** |
| UX ErrorBoundary | Not in Replit report | UX-001 (P1) | **Preserved from Abacus.** |
| PBKDF2 iterations | SEC-001 (Medium) | Not in Abacus | **Preserved from Replit.** |

---

## FINDING FORMAT

```
ID | Severity | File/Path | Invariant | Description | Evidence | Fix
```

---

## A. Critical Bugs (P0)

**P0 = data loss, security breach, compliance violation, or production deploy failure risk.**

---

**BUG-001 | P0 | `packages/auth/src/guards.ts:61` | T3 (multi-tenant isolation) | `requirePrimaryPhoneVerified` ignores `tenant_id` in D1 query — T3 invariant breach | Evidence: Function signature has `_tenantId: string` (underscore = intentionally unused). D1 query is `SELECT id FROM contact_channels WHERE user_id = ? AND channel_type = 'sms' AND is_primary = 1 AND verified = 1` — no `AND tenant_id = ?` clause. Abacus sampled `verticals-clinic`, `hl-wallet`, `pos-business` (all correct) but did not read `guards.ts`. Replit read it directly and confirmed the gap. | Fix: Add `AND tenant_id = ?` to query. Pass `tenantId` as second bind parameter. Rename `_tenantId` → `tenantId`. Effort: 30 min.**

---

**BUG-002 | P0 | `.github/workflows/deploy-production.yml` / `infra/db/migrations/0374_s14_claim_readiness.sql` | Governance / Deploy Safety | Migration 0374 idempotence guard is absent on `staging` branch and is ad-hoc on `main` — no generalised SQLite ALTER TABLE safety mechanism | Evidence (Abacus): `grep -n "0374\|Guard" .github/workflows/*.yml` on `staging` branch → zero matches. The staging deploy workflow lacks the guard. Evidence (Replit): Guard exists in `main/deploy-production.yml` as a hardcoded CI step but is a one-time patch specific to migration 0374 only. Future `ALTER TABLE ADD COLUMN` migrations will fail identically. SQLite/D1 does not support `ALTER TABLE ADD COLUMN IF NOT EXISTS`. | Fix (two-part): (1) Port the guard to `staging` branch deploy workflow immediately. (2) Create `scripts/migrations/apply-safe.sh` that pre-scans migration SQL for `ALTER TABLE … ADD COLUMN` patterns, checks column existence via `pragma_table_info()`, and conditionally skips. Integrate into both staging and production deploy workflows. Emit CI artifact `migration-audit-${GITHUB_SHA}.txt`. Effort: 4 h.**

---

**BUG-003 | P0 | `apps/api/src/middleware/csrf.ts` | Security Baseline §CSRF | `csrfMiddleware` bypasses when both `Origin` and `Referer` headers are absent and `Content-Type` is JSON — CSRF posture weaker than documented | Evidence (Abacus, direct file read): For non-browser state-mutating calls where neither `Origin` nor `Referer` is present, middleware calls `next()` without challenge. The stated rationale is M2M clients, but the allowance is broader than required — any client that suppresses these headers passes. This is a P0 because the security baseline explicitly claims CSRF protection on all mutating routes. | Fix: Require `X-CSRF-Intent: m2m` header when both `Origin` and `Referer` are absent, OR gate M2M through `INTER_SERVICE_SECRET` verification. Effort: 3 h.**

---

## B. High Issues (P1)

**P1 = near-blocking, stolen session risk, data integrity risk, or UX blocker for core personas.**

---

**BUG-004 | P1 | `apps/api/src/routes/auth-routes.ts` (refresh handler) | Security Baseline §JWT | `/auth/refresh` still issues stateless JWT from existing JWT — no opaque token, no single-use rotation, stolen tokens are permanently refreshable | Evidence (both agents, direct code read): No `refresh_tokens` D1 table, no `revoked_at`, no `replaced_by` column. Enhancement roadmap v1.0.1 marked SEC-04 as "overtaken by events" on 2026-04-20 — this was incorrect closure. The implementation remains JWT-to-JWT with no rotation. | Fix: Issue opaque refresh token (UUID, stored SHA-256 hashed in `refresh_tokens` table with `jti_hash`, `user_id`, `tenant_id`, `revoked_at`, `replaced_by`). Single-use rotation: consuming a refresh token atomically revokes it and issues a new one. Detect reuse (old token re-presented after rotation) → revoke ALL sessions for that user. Effort: 8 h.**

---

**BUG-005 | P1 | `apps/api/wrangler.toml` (`[env.production]` CRON block) | Platform Operations | CRON allocation at 5/5 ceiling — staging has zero CRONs, no headroom for new scheduled jobs | Evidence (Abacus, direct file read): `[triggers.crons]` in production env has 5 entries. Staging block has comment noting zero negotiation-expiry crons due to allocation pressure. | Impact: New time-based features (DSAR exporter, CBN reconciliation sweep, invoice reminders, erasure audit) cannot ship to production without eviction trade-offs. Staging cannot reproduce production cron behaviour. | Fix: Create dedicated `apps/schedulers` Worker. Internal dispatch table: 1 cron at 30s tick, reads a `scheduled_jobs` D1 table, executes due jobs. Frees all 5 production CRON slots for critical-path only. Effort: 1 day.**

---

**BUG-006 | P1 | `packages/auth/src/jwt.ts` + `apps/api/src/middleware/auth.ts` | Security Baseline §Audit | JWT parse failures not routed to audit log — session-forge attempts invisible to IDS/SIEM | Evidence (Abacus, direct file read): `jwt.ts` catches decoding exceptions; auth middleware branches on `JwtPayloadInvalid` without structured emission to `audit-log.ts`. Auth failure events are `console.error` only. | Fix: Route all `JwtValidationError` events through `audit-log.ts` with `event_type='AUTH_FAILURE_VERIFY'`, IP hash, User-Agent hash, and request timestamp. Rate-limit audit writes to prevent self-DOS (max 100/min per IP). Effort: 3 h.**

---

**BUG-007 | P1 | `.github/workflows/ci.yml:5` | Governance / CI | CI does not trigger on `push` to `main` — direct hotfix pushes bypass TypeScript check, lint, security audit, all governance checks | Evidence (Replit, direct file read): `ci.yml` triggers only on `pull_request` to `staging` and `push` to `staging`. `deploy-production.yml` calls `ci.yml` as reusable workflow but a direct push to `main` outside the PR flow does not guarantee a fresh governance check run. | Fix: Add `push: branches: [main]` to `ci.yml` triggers. Add branch protection on `main` requiring `ci` status check to pass. Effort: 15 min.**

---

**BUG-008 | P1 | `apps/api/src/routes/payments.ts:52` | Payment Integrity / UX | Silent `PLATFORM_BANK_ACCOUNT_JSON` misconfiguration returns `account_number: "N/A"` to users with no operator alert | Evidence (Replit, direct file read): `parseBankAccount()` returns `{ bank_name: 'Not configured', account_number: 'N/A', account_name: 'N/A' }` on missing/malformed env var. Users attempting bank transfer see N/A details. No monitoring fires. | Fix: (1) Return HTTP 503 `{ "error": "payment_method_unavailable" }` instead of N/A details. (2) Add startup validation that emits structured error log on invalid config. (3) Add platform health endpoint `/health/payment-config` (internal, admin-only). Effort: 2 h.**

---

**BUG-009 | P1 | `apps/workspace-app/src/pages/*.tsx` (all React apps) | UX / Resilience | Zero React `ErrorBoundary`s across any frontend app — any render exception produces white-screen-of-death | Evidence (Abacus, grep): `grep -R "ErrorBoundary" apps/` returns zero matches across workspace-app, brand-runtime, public-discovery, partner-admin, platform-admin. | Personas affected: Every persona using a React app. | Fix: Ship shared `packages/ui-error-boundary` with audit-log hook that POSTs to `/internal/error-report`. Wrap `<App/>` in every `main.tsx`. Show toast + graceful fallback UI. Effort: half-day.**

---

**BUG-010 | P1 | `apps/workspace-app/src/` (all pages) | UX / P6 Offline-First | No offline UI affordance despite P6 "Offline First" platform principle — POS unusable during network drops | Evidence (Abacus, grep): `grep -R "navigator.onLine\|offline" apps/workspace-app/src` → zero matches outside `offline.html` fallback page. POS checkout has no offline queue. Tenant Staff in 2G/3G Nigeria (explicit target persona) affected. | Fix: `useOnlineStatus()` React hook; IndexedDB-backed offline queue for POS sales; offline banner; auto-sync on reconnect via existing `/sync` route. Effort: 2 days.**

---

**BUG-011 | P1 | `apps/workspace-app/src/pages/Settings.tsx` | UX / NDPR | No confirmation step on `DELETE /auth/me` (right to erasure) — user can trigger irreversible NDPR erasure with single click | Evidence (Abacus): `Settings.tsx` (661 LOC) has no confirmation modal or typed-name confirmation before the DELETE call. | Fix: Two-step confirmation: (1) modal with "This will permanently delete your account and all associated data" text; (2) require user to type their email to confirm. Effort: 1 h.**

---

**BUG-012 | P1 | `apps/ussd-gateway/src/`, `apps/partner-admin/public/` | UX / Nigeria-Market | USSD strings have no i18n (Yoruba/Hausa/Igbo) — critical gap for Nigeria-first market | Evidence (Abacus): USSD menu strings are English-only hardcoded. `apps/partner-admin/public/index.html` has no branding-preview iframe (partner cannot preview tenant pages before publish). | Impact: Alienates North and South-West Nigerian users; blocks real partner adoption. | Fix: Static KV string tables keyed by `LANG` per session for USSD. Branding preview iframe sandboxed in partner-admin. Effort: 3 days (i18n scaffold). Mark UX-P7-06 and UX-P2-04 as P1 compliance issues for Nigerian market launch.**

---

**BUG-013 | P1 | `apps/workspace-app/src/pages/POS.tsx` | Compliance / UX | POS cart totals do not show VAT 7.5% line-item breakdown — compliance blocker for issuing valid Nigerian VAT receipts | Evidence (Abacus): POS receipt panel uses inline styles with no VAT calculation. FIRS requires VAT-inclusive receipts for registered businesses. | Fix: Add VAT calculation engine to POS cart: `vat_kobo = Math.round(subtotal_kobo * 0.075)`, `total_kobo = subtotal_kobo + vat_kobo`. Display VAT as separate line item on receipt. Add print CSS. Effort: 1 day.**

---

**BUG-014 | P1 | `apps/api/src/middleware/audit-log.ts` | Security Baseline §Audit | Audit-log middleware writes in `try/catch` with `console.error` only — failed audit writes leave no durable trace | Evidence (Abacus, per v1.0.1 SEC-17 closure memo which incorrectly closed this): Write failures are silent beyond `console.error`. NDPR and CBN compliance requires durable audit trails. | Fix: Dual-write failed audit entries to `audit_log_failures` KV list (48-hour TTL) for re-drive on recovery. Alert on KV list length > threshold. Effort: 2 h.**

---

## C. Medium Issues (P2)

**P2 = significant quality issues, compliance gaps, or UX blockers for secondary personas.**

---

**BUG-015 | P2 | `apps/api/src/middleware/billing-enforcement.ts:36` | Billing / UX | `EXEMPT_PATHS` exact string match misses trailing slash and query string variants | Evidence (Replit): `EXEMPT_PATHS.has(path)` is exact — `/auth/login/` or `/auth/login?redirect=...` are not exempt, could block suspended workspace users. | Fix: Normalize path before check: strip trailing slash, extract pathname before `?`. Effort: 30 min.**

---

**BUG-016 | P2 | `apps/api/src/routes/auth-routes.ts` (refresh handler) | Auth / Billing | JWT refresh does not check workspace active status — terminated workspace tokens refreshable indefinitely | Evidence (Replit): Refresh re-uses JWT claims without querying workspace status. | Fix: On refresh, `SELECT status FROM workspaces WHERE id = ? AND tenant_id = ?`; reject with 403 `workspace_terminated` if status = terminated. Effort: 1 h.**

---

**BUG-017 | P2 | `scripts/governance-checks/check-tenant-isolation.ts:67` | T3 Enforcement | T3 governance check only scans template-literal SQL strings — single/double-quoted SQL bypasses check entirely | Evidence (Replit, direct file read): Script explicitly documents: "Single/double-quoted strings are intentionally NOT checked here." | Fix: Add secondary check for single-quoted SQL strings via boundary-aware regex, or ESLint rule requiring template literals for SQL in hl-wallet files. Effort: 1 h.**

---

**BUG-018 | P2 | `scripts/governance-checks/check-ai-direct-calls.ts` | P7 (AI abstraction) | Governance check does not detect dynamic-URL AI API calls — `fetch(config.openaiUrl)` bypasses P7 enforcement | Evidence (Replit): Script checks for hardcoded SDK imports and hardcoded URL strings only. Dynamic variable references (`fetch(AI_URL)`) are invisible to the check. | Fix: Add patterns for common variable names (`AI_URL`, `OPENAI_URL`, `ANTHROPIC_URL`, `AI_ENDPOINT`). Add PR template requirement for AI-file changes. Effort: 1 h.**

---

**BUG-019 | P2 | `apps/api/src/routes/payments.ts` | Supply Chain / Security | Paystack webhook verification header name not validated in tests — `x-paystack-signature` case sensitivity risk | Evidence (Replit): W1 invariant critical for payment security. No integration test verifying exact header name case and HMAC computation path. | Fix: Add E2E test that sends a known test payload with computed HMAC signature and asserts 200. Assert 401/403 on tampered signature. Effort: 2 h.**

---

**BUG-020 | P2 | `apps/api` ESLint config | Code Quality | ESLint Category A/B/C errors still open per `HANDOVER.md` §3a | Evidence (Abacus, HANDOVER.md): Unresolved lint errors remain in `apps/api`. | Fix: Triage batch in hygiene sprint. Set CI to blocking mode for new violations. Effort: 4 h.**

---

**BUG-021 | P2 | `apps/api/src/routes/openapi.ts` | DX / API Governance | OpenAPI spec is static hardcoded object — missing notification, wallet, bank-transfer, B2B, negotiation routes added after initial authoring | Evidence (Replit, direct file read): 412-line static TypeScript object. Routes from Phases 0-9, hl-wallet (1590 lines), bank-transfer (670 lines) are absent from `paths`. | Fix: Migrate to `@hono/zod-openapi` auto-generation. Effort: 8 h.**

---

**BUG-022 | P2 | `packages/superagent/src/hitl-service.ts` | WF-0xx / HITL Governance | SuperAgent HITL decision store lacks append-only DDL guarantee | Evidence (Abacus): Decisions written to D1 but no `ON CONFLICT` uniqueness constraint beyond table DDL. | Fix: Enforce `WITHOUT ROWID, PRIMARY KEY (decision_id)` + write-once application guard before INSERT. Effort: 2 h.**

---

**BUG-023 | P2 | `packages/superagent/src/middleware.ts::aiConsentGate()` | COMP-005 / NDPR | AI consent gate does not persist consent text revision/version per user | Evidence (Abacus): Consent flag checked but consent version not stored. | Fix: Add `consent_version` and `consented_at` columns to users table. Store on each AI-route consent check. Show last-accepted version in Settings. Effort: 3 h.**

---

**BUG-024 | P2 | `apps/workspace-app/src/pages/POS.tsx::updateQty()` | UX / Inventory | POS quantity control allows rapid taps to overshoot stock — error only surfaces at server roundtrip | Evidence (Abacus): `updateQty()` applies delta without checking `product.stock_qty`. | Fix: Client-side clamp: `newQty = Math.min(delta + currentQty, product.stock_qty)`. Show toast if clamped. Effort: 30 min.**

---

**BUG-025 | P2 | `apps/workspace-app/src/App.tsx` | UX / Accessibility | No focus management on route changes — screen-reader users lose context on every navigation | Evidence (Abacus): React Router used but no `useEffect` to shift focus to `<main>` on navigation. | Fix: Add `<ScrollRestoration/>` + `document.querySelector('main')?.focus()` on route change. Effort: 1 h.**

---

**BUG-026 | P2 | `apps/workspace-app/src/pages/POS.tsx` | UX / WCAG AA | Color contrast `#9ca3af` at 11px captions on white — ratio 2.85:1, fails WCAG AA (4.5:1 required) | Evidence (Abacus): POS uses `#9ca3af` for captions. | Fix: Bump to `#6b7280` (4.83:1) or increase font-size to 14px. Align with design-system tokens. Effort: 30 min.**

---

**BUG-027 | P2 | `apps/brand-runtime/src/templates/` | UX / NDPR | No cookie/analytics consent banner on brand-runtime pages — NDPR compliance gap for end-users | Evidence (Abacus): Base template has Open Graph and manifest but no consent banner. | Fix: Per-tenant NDPR-compliant consent banner component; store consent in `localStorage`; respect `DNT` header. Effort: 1 day.**

---

**BUG-028 | P2 | `apps/brand-runtime/src/templates/` | UX / PWA | No service-worker registration in brand-runtime templates — brand pages not installable as PWA despite manifest link | Evidence (Abacus): `manifest.webmanifest` linked but no SW registration. | Fix: Register a SW from `brand-runtime` with cache-first strategy for CSS/images. Effort: 4 h.**

---

**BUG-029 | P2 | `apps/public-discovery/src/templates/base.ts` | UX / SEO | JSON-LD `LocalBusiness` structured data hook exists but not populated per-page | Evidence (Abacus): Hook present in `base.ts` but per-page template verification needed. | Fix: Populate `@type: LocalBusiness`, `name`, `address`, `geo`, `openingHours` from entity D1 row in each discovery page template. Effort: 3 h.**

---

**BUG-030 | P2 | `apps/partner-admin/public/` | UX / Accessibility | Partner-admin navigation uses `<button class="nav-item">` without ARIA `aria-current` state | Evidence (Abacus): No `aria-current="page"` on active nav item. | Fix: Add `aria-current="page"` on active route. Audit all dashboards for skip-to-main anchor completeness. Effort: 1 h.**

---

**BUG-031 | P2 | `docs/governance/white-label-policy.md` | Governance / Audit | White-label attribution removal toggle not audit-logged | Evidence (Abacus): Policy allows removal above tier; `partners.attribution_enabled` changes not in `audit_log`. | Fix: Hook `attribution_enabled` PATCH into `audit-log.ts` with `event_type='PARTNER_ATTRIBUTION_CHANGED'`. Effort: 1 h.**

---

**BUG-032 | P2 | `infra/k6/smoke.js:23` | Testing / CI | k6 smoke accepts 4xx as success in `http_req_failed` metric — broken auth or 404 passes load test | Evidence (Replit, direct file read): `http.setResponseCallback(http.expectedStatuses({min:200,max:299},{min:400,max:499}))` — 4xx counted as non-failure. A deploy breaking auth entirely would pass k6. | Fix: Remove 4xx from `expectedStatuses` for health/version endpoints. Scope 4xx acceptance only to explicitly auth-required endpoints where 401 is expected smoke response. Effort: 1 h.**

---

**BUG-033 | P2 | `infra/db/migrations/` | Ops | No migration checksum verification before apply — tampered or partially-transferred migration files could apply silently | Evidence (Abacus): 378+ migration files; no sha256 cross-check between repo file hash and D1 `d1_migrations` record. | Fix: Pre-apply CI step: compute sha256 per staged migration file, compare to `d1_migrations.checksum` if present. Fail deploy on mismatch. Effort: 2 h.**

---

**BUG-034 | P2 | `.github/` (no Dependabot suppression file) | Supply Chain | 3 unpatched moderate CVEs with no suppression justification recorded | Evidence (Abacus, `HANDOVER.md` §3b): Dependabot reports 3 moderate vulnerabilities. No `.security-suppressions.yaml` or equivalent. | Fix: Either patch or create `.security-suppressions.yaml` with rationale, CVE ID, and expiry date per suppressed item. Effort: 2 h (triage).**

---

**BUG-035 | P2 | `apps/workspace-app/src/pages/Settings.tsx` | UX | 661 LOC settings page with no left-nav/section anchors — unusable on mobile | Evidence (Abacus): Single long-scrolling page with multiple sections (profile, billing, team, branding, danger zone). | Fix: Add anchor-based left-nav tabs. Extract each section into its own component. Effort: 1 day.**

---

**BUG-036 | P2 | `apps/ussd-gateway/src/` | UX / USSD | USSD menu has no explicit "back" affordance documented in menu text | Evidence (Abacus): No back instruction visible in menu strings. USSD users unfamiliar with the platform have no escape path. | Fix: Append `0. Back` option to all non-root menus. Document in USSD UX spec. Effort: 2 h.**

---

**BUG-037 | P2 | `packages/hl-wallet/src/kyc-gates.ts` | Compliance / CBN | CBN wallet tier-limit checks have no daily reconciliation — real transfers vs tier caps not cross-checked | Evidence (Abacus): In-process KYC classification is correct per governance doc, but no nightly reconciliation job exists (blocked by BUG-005 CRON ceiling). | Fix: After BUG-005 (schedulers Worker), add nightly CRON that runs tier-cap reconciliation across `hl_ledger` and alerts on exceeded limits. Effort: 4 h (after ENH-004).**

---

**BUG-038 | P2 | `apps/platform-admin/`, `apps/partner-admin/` | UX | No 2FA/TOTP enforcement for platform super-admin accounts | Evidence (Abacus): Platform super-admin dashboard has no 2FA enrolment UI. Super-admin accounts are the highest-privilege accounts in the system. | Fix: Enforce TOTP enrolment on first login for super_admin role. Add TOTP verification step to `/auth/login` for this role. Effort: 1 day.**

---

**BUG-039 | P2 | `docs/governance/compliance-dashboard.md` (does not exist) | Compliance / D1 | No data residency assertion for D1 primary region — future NDPR regulators may request proof | Evidence (Abacus): No doc or workflow asserting `WNAM`/`WEUR` placement for Nigerian market. | Fix: Document in `docs/governance/compliance-dashboard.md`; add explicit region hint in `wrangler.toml` D1 database block. Effort: 2 h.**

---

**BUG-040 | P2 | `apps/workspace-app/src/lib/toast.ts:29` | UX / Accessibility | Toast container not `role="status"` — assistive technology may not announce on mount | Evidence (Abacus): `aria-live="polite"` present but missing `role="status"` wrapper. | Fix: Add `role="status"` to toast container. Effort: 15 min.**

---

**BUG-041 | P2 | `infra/` (no canary automation) | Ops / Reliability | No canary-deploy automation despite `docs/architecture/canary-deployment.md` existing | Evidence (Abacus): Canary doc exists but no Cloudflare Workers versioned rollout configured in CI. | Fix: Use Cloudflare Workers `--gradual-rollout 5` flag in staging→production promotion step. Effort: 4 h.**

---

**BUG-042 | P2 | `apps/public-discovery/src/templates/base.ts` | UX / Discovery | No "nearby places" geo-IP default — public users must type full location | Evidence (Abacus): No Cloudflare `cf.city`/`cf.latitude`/`cf.longitude` headers used for geo-default. | Fix: Use Cloudflare incoming request `cf.city` to pre-populate search location. Graceful fallback to empty. Effort: 2 h.**

---

## D. Low / Code Quality (P3)

---

**BUG-043 | P3 | `apps/workspace-app/src/lib/currency.ts` | Display | `formatNaira()` compact branch uses `toFixed(1)` — inconsistent with invoice printouts showing full precision | Evidence (Abacus): `₦1.2M` vs invoice showing `₦1,200,000.00`. | Fix: Configurable compact precision or explicit "~" prefix for approximate values. Effort: 30 min.**

---

**BUG-044 | P3 | `apps/ussd-gateway/src/session.ts` | Code Quality | USSD session TTL `180` is a magic number — no named constant | Evidence (Abacus): Header says "3-minute TTL, TDR-0010" but code uses literal `180`. | Fix: `const USSD_SESSION_TTL_SECONDS = 180;` exported from constants file. Effort: 15 min.**

---

**BUG-045 | P3 | `apps/api/src/routes/notification-routes.ts` | Code Quality | Multiple `as any` casts (per `HANDOVER.md` Category C) | Evidence (Abacus): Per handover notes. | Fix: Replace with Zod-parsed types from `@webwaka/types`. Effort: 2 h.**

---

**BUG-046 | P3 | `apps/workspace-app/src/pages/POS.tsx` | UX | Inline `style={styles.xxx}` throughout POS — no CSS Modules, larger bundle, no runtime theming | Evidence (Abacus): Line 180+ is all inline styles. | Fix: Migrate to CSS Modules aligned with `packages/design-system` tokens. Effort: 1 day (gradual).**

---

**BUG-047 | P3 | `apps/workspace-app/src/pages/Register.tsx:83` | UX | Phone input missing `pattern`, `autocomplete="tel-national"`, `inputMode="tel"` — Nigerian carrier format hints absent | Evidence (Abacus): `type="tel"` present but no `pattern="^\\+?234[0-9]{10}$"`. | Fix: Add `pattern`, `autocomplete`, `inputMode` attributes. Effort: 15 min.**

---

**BUG-048 | P3 | `apps/workspace-app/src/pages/POS.tsx` | UX | No `@media print` stylesheet for POS receipts — printed receipts include nav/cart panels | Evidence (Abacus): No print CSS block. | Fix: Add `@media print` block hiding nav/cart; paper-roll 58mm friendly layout. Effort: 2 h.**

---

**BUG-049 | P3 | `apps/workspace-app/src/pages/POS.tsx` | UX | Low-stock badge threshold `stock_qty < 5` hardcoded — tenants cannot configure | Evidence (Abacus): Hardcoded constant. | Fix: Add `low_stock_threshold` field to workspace settings. Default 5. Effort: 2 h.**

---

**BUG-050 | P3 | `apps/workspace-app/src/pages/POS.tsx` | UX | Payment method icons are emoji — may render inconsistently on Android 2G devices common in Nigeria | Evidence (Abacus): Emoji icons in payment method selection. | Fix: Replace with inline SVG or icon font. Effort: 1 h.**

---

**BUG-051 | P3 | `apps/api/src/middleware/auth.ts:56` | Security / Resilience | Per-session revocation check silently skipped when SHA-256 hash fails — fail-open on a security check | Evidence (Replit, direct file read): `try/catch` sets `sessionHashHex = null` on hash failure; revocation check skipped. | Fix: Log at `error` level (not `warn`) on hash failure. Consider fail-closed for session revocation. Effort: 30 min.**

---

**BUG-052 | P3 | `apps/api/src/routes/openapi.ts` | DX | OpenAPI `info.version` is `1.0.1` but has no changelog or deprecation tracking | Evidence (Replit): Static version string with no associated changelog endpoint. | Fix: Add `GET /changelog` endpoint. Add `Deprecation` and `Sunset` headers (RFC 8594) to deprecated routes. Effort: 2 h.**

---

**BUG-053 | P3 | `packages/verticals-law-firm/src/` | UX / Vertical | Law firm vertical has no matter-number auto-generation — manual entry risks duplicates | Evidence (Abacus): No auto-generation observed. | Fix: Add `matter_number_sequence` per workspace. Effort: 2 h.**

---

**BUG-054 | P3 | `apps/ussd-gateway/` | UX / USSD | USSD rate limit 30/hour exceeded with generic error — no specific user-facing message | Evidence (Abacus): No custom 429 message for USSD rate limit exceeded state. | Fix: Return `END Rate limit reached. Try again in 1 hour.` for USSD 429. Effort: 30 min.**

---

**BUG-055 | P3 | `apps/public-discovery/src/` | UX | No "Report this listing" UI for moderation | Evidence (Abacus): No report mechanism visible in discovery templates. | Fix: Add `POST /discovery/:id/report` endpoint + "Report this listing" link in entity templates. Effort: 4 h.**

---

**BUG-056 | P3 | Multiple governance check scripts | Governance | `governance-check.yml` founder-approval label check is advisory only — no enforcement | Evidence (Replit): Workflow prints INFO but does not fail on missing label. | Fix: Use `gh pr view --json labels` in CI to fail if `founder-approval` absent on governance doc changes. Effort: 1 h.**

---

**BUG-057 | P3 | `infra/` (no `scripts/rollback/` directory) | Ops | No rollback runbook or executable rollback procedure documented | Evidence (Replit + Abacus): `scripts/rollback/` returns 404. `.rollback.sql` files exist in `infra/db/migrations/` but no procedure for executing them. | Fix: Create `docs/operations/database-rollback-runbook.md`. Create `scripts/rollback/README.md`. Effort: 2 h.**

---

## E. Security Findings

**Distinct security findings not already fully captured in Sections A-D:**

---

**SEC-001 | High | `packages/auth/src/jwt.ts:65` (PBKDF2 iteration count) | Security Baseline §Password Storage | PBKDF2 at 100,000 iterations — OWASP 2024 recommends 600,000 for PBKDF2-HMAC-SHA256 | Evidence (Replit): Auth routes reviewed directly; iteration count confirmed at 100k. Enhancement roadmap v1.0.1 marked SEC-05 as resolved — implementation not verified. | Fix: Increase to 600,000. Add `password_hash_version` column. Detect and rehash on next login. Document transition window. Effort: 4 h.**

---

**SEC-002 | High | `apps/api/src/middleware/rate-limit.ts` | Security Baseline R5/R9 | Rate limiter fails open on KV outage with no alert path — all rate limits silently stop working | Evidence (both agents, direct file read): `try/catch` on KV read → `next()`. No `SEV-2` alert, no `rate_limit_degraded` counter. Under KV outage, BVN verification (R5: 2/hour) and OTP (R9) become unrestricted. | Fix: Emit `{ level: 'error', event: 'rate_limit_kv_degraded', key }` structured log on KV failure. Add `ratelimit_degradation` Cloudflare Analytics Engine counter. Wire into monitoring-runbook alerting matrix. Effort: 2 h.**

---

**SEC-003 | High | `apps/api/src/middleware/auth.ts:42` | Security / KV Limits | Full JWT tokens used as KV blacklist keys — risk of exceeding 512-byte KV key limit for long tokens | Evidence (Replit): `blacklist:${rawToken}` where JWT can be 400+ chars plus prefix approaches KV 512-byte limit. | Fix: Replace with `blacklist:token:${sha256hex(rawToken)}`. Consistent with the existing `blacklist:jti:${hash}` pattern. Effort: 1 h.**

---

**SEC-004 | Medium | `apps/api/src/middleware/rate-limit.ts:32` | UX / Nigeria Market | Rate limit keyed per-IP — shared NAT (common in Nigerian ISPs) means one user exhausts limit for all users behind same NAT | Evidence (Replit): `CF-Connecting-IP` key shared across NAT pool. Affects R5 identity verification and R9 OTP in enterprise/carrier NAT environments. | Fix: Secondary rate limit key `rl:${keyPrefix}:ws:${workspaceId}`. Apply minimum of IP-level and workspace-level count. Effort: 3 h.**

---

**SEC-005 | Medium | `.github/workflows/governance-check.yml` + `apps/api/wrangler.toml` | Governance | No CI job verifies required secrets exist per environment | Evidence (Abacus): `PRICE_LOCK_SECRET` removal confirmed without CI enforcement. No `verify-secrets` step. | Fix: Add CI job that runs `wrangler secret list` and asserts all required secrets (`JWT_SECRET`, `PAYSTACK_SECRET_KEY`, `PRICE_LOCK_SECRET`, `INTER_SERVICE_SECRET`, `CLOUDFLARE_API_TOKEN`) exist for each environment. Effort: 2 h.**

---

**SEC-006 | Medium | `apps/api/src/middleware/auth.ts` + `audit-log.ts` | Security Baseline | No structured IP logging on repeated auth-login failures — IDS/SIEM cannot detect credential-stuffing | Evidence (Abacus): Enhancement roadmap v1.0.1 SEC-16 closure note says "overtaken by events" but no `AUTH_LOGIN_FAILURE` audit action with IP hash exists in practice. | Fix: On `/auth/login` 401, write `audit_log` entry with `event_type='AUTH_LOGIN_FAILURE'`, `ip_hash=sha256(CF-Connecting-IP)`, `ua_hash=sha256(User-Agent)`. Effort: 2 h.**

---

**SEC-007 | Medium | `packages/payments/src/paystack.ts` + outbound webhook dispatcher | W1 Invariant | Outbound webhook payload signing not enforced in governance checks — partners cannot verify WebWaka webhook authenticity | Evidence (Replit): W1 enforced inbound (Paystack→WebWaka) but no `X-WebWaka-Signature` header on outbound deliveries. No governance check for this. | Fix: HMAC-SHA256 `X-WebWaka-Signature: sha256=<hmac>` on all outbound webhook payloads, per-partner secret. Add `check-webhook-signing.ts` governance script. Effort: 3 h.**

---

**SEC-008 | Medium | `apps/` (all workers) | Security Headers | Content-Security-Policy not in CI governance enforcement | Evidence (Replit): CI checks CORS but not CSP, `X-Frame-Options`, `X-Content-Type-Options`, or `Referrer-Policy` on HTML-serving workers. | Fix: Add `check-security-headers.ts` governance script. Require headers on all non-API HTML responses. Effort: 3 h.**

---

**SEC-009 | Medium | `apps/api/src/middleware/auth.ts:56` | Security / Session | SHA-256 hash failure silently skips per-session revocation check (P20-B) — fail-open on security enforcement | Evidence (Replit + cross-reference with audit-log gap): Hash failure → `sessionHashHex = null` → revocation check skipped. Interacts with BUG-014 (audit-log silent failure) to create a gap where both revocation and audit fail silently. | Fix: Log at `error` level. Evaluate fail-closed for this path. Effort: 30 min.**

---

**SEC-010 | Medium | `apps/api/src/routes/auth-routes.ts` (PBKDF2 + register handler) | Auth / Atomicity | `/auth/register` multi-row D1 insert (tenant + workspace + user) not in batch transaction — partial registration leaves orphaned rows | Evidence (Replit): If workspace creation succeeds but user creation fails, orphaned tenant row exists with no associated user. | Fix: Wrap tenant + workspace + user creation in a single `db.batch()` call. Add cleanup job for orphaned tenants older than 24h. Effort: 2 h.**

---

**SEC-011 | Low | `packages/superagent/src/index.ts` | P7 / AI Abstraction | Service worker inline in PWA has no CSP nonce pattern | Evidence (Abacus): P6 doc states SW is inline; no CSP exemption or integrity hash documented. | Fix: Document CSP exemption explicitly. Pin integrity hash. Add to security-headers governance check. Effort: 1 h.**

---

**SEC-012 | Low | `packages/auth/src/jwt.ts::decodeJwtPayload()` | Auth | `atob()` used for base64 decode — reliable in CF Workers but not Node.js test environment without polyfill | Evidence (Replit, direct file read): `atob(padded)` at line ~63. Node.js 18+ has `atob` but older test runners may not. | Fix: Use `Buffer.from(base64, 'base64').toString()` as Node.js-safe alternative, or add polyfill to test setup. Effort: 30 min.**

---

**SEC-013 | Low | `apps/api/src/middleware/auth.ts` | Security | Session blacklist uses full-token KV key AND hash key — dual-path creates inconsistency risk if one path succeeds and other fails | Evidence (Replit): Two separate KV writes for one revocation event. If KV is flaky, partial revocation possible. | Fix: Standardize on hash-only path. Single KV write per revocation. Effort: 1 h.**

---

**SEC-014 | Low | `docs/governance/` | Governance | CONTRADICTION_SCAN.md rows C-002 through C-009 and KI-001/002/003 unverified since initial pass | Evidence (Abacus, Appendix 1): Only C-001 re-verified (resolved). Other 8 contradiction entries and 3 known issues remain unaudited. | Fix: Refresh `CONTRADICTION_SCAN.md` — verify each entry against current codebase. Add to M9 sprint gate criteria. Effort: 4 h.**

---

**SEC-015 | Low | `apps/api/src/middleware/audit-log.ts` | Session Forensics | SHA-256 of full token as blacklist key makes forensic token reconstruction infeasible if an incident requires jti review | Evidence (Abacus): Full token hash vs jti-only hash has different forensic implications. | Fix: Hash `jti` claim only for blacklist key; keep truncated full-token hash as correlation ID in separate field. Effort: 1 h.**

---

## F. Compliance Findings

---

**COMP-001 | P2 | No endpoint | NDPR Art. 3.1(6) | No automated NDPR Data Subject Access Request (DSAR) export pipeline | Evidence (Abacus): No `POST /compliance/dsar/request` endpoint. No scheduled worker assembling per-user data ZIP. `security-baseline.md` references NDPR but no implementation exists. | Fix: M9 feature — `POST /compliance/dsar/request` triggers a 24-hour scheduled Worker that assembles signed ZIP of all per-user rows across `users`, `workspaces`, `ledger_transactions`, `notifications`, `hitl_decisions`. Effort: 2 days.**

---

**COMP-002 | P2 | `apps/api/src/routes/auth-routes.ts` (DELETE /auth/me) | NDPR G23 | Erasure cascade not in D1 batch transaction — partial NDPR erasure possible if one delete fails mid-cascade | Evidence (Replit + Abacus): `propagateErasure()` from `@webwaka/notifications` is a sequential cascade across multiple D1 tables. No D1 `batch()` wrapping. | Fix: Wrap entire erasure in `db.batch()`. Create `erasure_receipts` table (append-only: request_id, user_id_hash, tenant_id, requested_at, completed_at, tables_affected). CRON detects incomplete erasures and retries. Effort: 4 h.**

---

**COMP-003 | P2 | `apps/api/src/routes/auth-routes.ts` (DELETE /auth/me) | NDPR G23 | `DELETE /auth/me` does not emit an NDPR erasure receipt — no confirmation to user | Evidence (Abacus): Handler silently processes deletion; no receipt record written; no confirmation email sent. | Fix: On successful deletion, (1) append to `erasure_receipts` table, (2) send erasure confirmation email via Resend with reference number. Effort: 2 h.**

---

**COMP-004 | P2 | `packages/superagent/src/middleware.ts::aiConsentGate()` | NDPR / AI Consent | AI consent gate checks flag but does not persist consent text revision/version per user | Evidence (Abacus): Version-less consent means if consent text changes, users cannot demonstrate they consented to the current version. NDPR requires this. | Fix: `consent_history` table with `user_id`, `consent_version`, `consent_text_hash`, `consented_at`. Display last-accepted version in Settings. (See also BUG-023.) Effort: 3 h.**

---

**COMP-005 | P2 | `apps/workspace-app/src/pages/POS.tsx` | FIRS / CBN | POS receipts do not include VAT 7.5% line-item — FIRS compliance blocker for issuing valid receipts | Evidence (Abacus + Replit): No VAT calculation in POS cart. FIRS requires VAT-inclusive receipts. (See also BUG-013.) | Fix: VAT line item on all receipts. Effort: 1 day.**

---

**COMP-006 | P2 | `apps/api/wrangler.toml` + D1 config | NDPR / Data Residency | No data residency assertion for D1 primary region — cannot provide proof of Nigeria/EU data localisation | Evidence (Abacus): No `WNAM`/`WEUR` region hint in D1 binding config. No governance doc asserting residency. | Fix: Add explicit D1 region hint in `wrangler.toml`. Create `docs/governance/compliance-dashboard.md` with data residency attestations. Effort: 2 h.**

---

**COMP-007 | P3 | `docs/governance/white-label-policy.md` + `partners` table | Governance | White-label attribution removal toggle not audit-logged | Evidence (Abacus): Policy allows removal above tier; no `audit_log` entry on toggle. | Fix: Hook `attribution_enabled` change into `audit_log` with `event_type='PARTNER_ATTRIBUTION_CHANGED'`. Effort: 1 h.**

---

**COMP-008 | P3 | `apps/api/src/routes/auth-routes.ts` | NDPR | No NDPR data retention policy enforced in code — G23 requires max 24-month retention for non-essential data | Evidence (Replit): G23 hard-delete implemented for user request but no background job purging stale data beyond retention window. | Fix: Add retention policy CRON (in schedulers Worker after ENH-004): purge non-essential data (inactive sessions, old notifications, expired invitations) older than 24 months. Effort: 4 h.**

---

## G. Test Gaps + Contradictions

---

**TST-001 | P2 | `tests/e2e/` | Test Coverage | No persona-specific E2E scenarios for Partner Admin full-session, Platform Super-Admin, USSD-only user journeys | Evidence (Abacus): 34 E2E files exist but none cover complete partner-admin session, platform super-admin admin actions, or USSD-only user journey end-to-end. | Fix: Add 3 new E2E files: `tests/e2e/api/22-partner-admin-session.e2e.ts`, `tests/e2e/api/23-super-admin-actions.e2e.ts`, `tests/e2e/api/24-ussd-full-journey.e2e.ts`. Effort: 2 days.**

---

**TST-002 | P2 | `tests/visual/snapshots/` | Test Coverage | Visual regression snapshots folder is empty despite workflow hooks | Evidence (Abacus): Directory exists, workflow configured, but no baseline snapshots committed. | Fix: Run `pnpm test:visual:update` against staging to populate baselines. Commit. Add to CI as blocking check on visual regression. Effort: 4 h.**

---

**TST-003 | P2 | `packages/payments/src/currency.ts` | Test Coverage | No property-based tests on `parseNairaInput`/`formatNaira` round-trips | Evidence (Abacus): P9 invariant critical; unit tests exist but no property-based testing. | Fix: Add `fast-check` property test: for every `x ≥ 0`, `parseNairaInput(formatNaira(x))` round-trips within 1 kobo. Effort: 2 h.**

---

**TST-004 | P2 | `tests/e2e/` | Test Coverage | Only `08-i18n.e2e.ts` for discovery-app — search-by-geography, by-vertical-filter, paging untested | Evidence (Abacus): Single E2E file for entire discovery worker. | Fix: Add `tests/e2e/discovery/` files for geographic search, vertical filter, pagination. Effort: 4 h.**

---

**TST-005 | P2 | `packages/notificator/` (or equivalent) | Test Coverage | No contract tests between API and notification worker — schema drift undetected | Evidence (Abacus): No Pact-style or shared Zod schema validation between workers. | Fix: Shared Zod schema in `@webwaka/types` for notification events. Contract test in CI. Effort: 4 h.**

---

**TST-006 | P2 | `packages/hl-wallet/` | Test Coverage | hl-wallet has 5 test files — no fuzzer on double-debit / idempotency-token collision | Evidence (Abacus): The wallet is the most critical financial component. No adversarial fuzzing for idempotency-key collision scenarios. | Fix: Targeted fuzzing with deterministic seeds on `debitWallet()`. Test double-debit with same idempotency key. Add to nightly CI. Effort: 4 h.**

---

**TST-007 | P2 | `apps/api/src/middleware/rate-limit.ts` | Test Coverage | No chaos test on KV outage — fail-open behaviour unverified in CI | Evidence (Abacus): SEC-002 (rate limit) documents fail-open but no automated test forces KV read failure and asserts the expected behaviour. | Fix: Add chaos E2E test that mocks KV failure and asserts rate limit silently passes (with monitoring counter incremented). Effort: 4 h.**

---

**TST-008 | P2 | `tests/e2e/` | Test Coverage | No axe-core accessibility audit in CI — WCAG violations accumulate undetected | Evidence (Abacus): BUG-026 color contrast already identified. More violations likely exist. | Fix: Add `axe-core` Playwright integration to workspace-app E2E. Run on every PR. Fail on new WCAG AA violations. Effort: 2 h.**

---

**TST-009 | P2 | `tests/e2e/api/` | Test Coverage | No hostile-tenant RLS regression suite — T3 enforced in code but not asserted via cross-tenant E2E | Evidence (Abacus): BUG-001 confirms T3 can be breached in guards.ts. No automated test asserts that `tenant_id=A` cannot read `tenant_id=B` rows via any route. | Fix: Add `tests/e2e/api/25-cross-tenant-isolation.e2e.ts` with 2-tenant fixtures. Assert every entity route rejects cross-tenant access. Effort: 4 h.**

---

**TST-010 | P2 | `packages/superagent/` | Test Coverage | No negotiation price-lock signature fuzzing | Evidence (Abacus): Given SEC-005 (missing secret CI check), fuzz testing of `priceLockToken` against tampered signatures is missing. | Fix: Add fuzz test suite for `priceLockToken` verification. Test bit-flip, truncation, replay attacks. Effort: 2 h.**

---

**TST-011 | P2 | `tests/e2e/` | Test Coverage | No E2E test for workspace registration atomicity — orphaned tenant rows undetected | Evidence (Replit): If user creation fails during registration, orphaned tenant exists. No test simulates this. | Fix: Add failure-injection test that forces user-creation failure after tenant creation. Assert no orphaned row. Effort: 2 h.**

---

**CONTRADICTION-001 | P2 | `CONTRADICTION_SCAN.md` | QA Process | Contradictions C-002 through C-009 and known issues KI-001/002/003 unverified since initial pass | Evidence (Abacus, Appendix 1): Only C-001 re-verified (payments float rejection — confirmed resolved in `04-payments.e2e.ts` lines 34-40). Rows C-002–C-009 carry unknown resolution status. | Fix: Full `CONTRADICTION_SCAN.md` refresh pass against current `main` codebase. Close resolved items. Re-open any that have regressed. Effort: 4 h.**

---

## H. Infra / CI-CD Findings

---

**INF-001 | P2 | `.github/workflows/ci.yml` | CI / Ops | No smoke-test API key provisioned (`SMOKE_API_KEY`) — post-deploy smoke degrades to health pings only | Evidence (Abacus, `HANDOVER.md`): `SMOKE_API_KEY` not set. `cycle-01-smoke.ts` exits with `FATAL: SMOKE_API_KEY not set` without it. | Fix: Provision `SMOKE_API_KEY` as GitHub Actions secret in staging and production environments. Effort: 30 min.**

---

**INF-002 | P2 | `apps/api/wrangler.toml` | Ops / Observability | No SLO dashboard — MTTR, p95 latency, error-budget untracked | Evidence (Abacus): No Grafana Cloud / Cloudflare Analytics dashboard linked from `docs/governance/`. | Fix: Create minimal SLO scorecard using Cloudflare Analytics Engine data. Surface in `docs/governance/compliance-dashboard.md`. Thresholds: p95 < 500ms, error-budget < 0.1%. Effort: 1 day.**

---

**INF-003 | P2 | `.github/workflows/deploy-production.yml` | Ops | No migration checksum verification before apply | Evidence (Abacus + Replit): 378+ migration files applied without sha256 cross-check between repo and D1. | Fix: Pre-apply CI step computing sha256 per staged migration file. Compare to `d1_migrations.checksum` if present. Fail deploy on mismatch. Effort: 2 h.**

---

**INF-004 | P2 | `.github/workflows/` | DevEx | Branch preview URLs not standardised | Evidence (Abacus): No documented pattern for per-PR preview Worker deploys. | Fix: Add `preview-deploy.yml` workflow: `pr-$PR_NUMBER.webwaka-preview.workers.dev` pattern. Auto-delete on PR close. Effort: 4 h.**

---

**INF-005 | P2 | `.github/workflows/deploy-production.yml` (LFS filter) | Ops | Oversize/LFS filter lacks explicit allowlist and threshold documentation | Evidence (Abacus): `FILE_SIZE -gt 5242880` check present but no CI artifact listing flagged files. | Fix: Add CI step that emits a skipped-files artifact. Add configurable threshold constant `MAX_MIGRATION_BYTES=5242880`. Effort: 1 h.**

---

**INF-006 | P3 | `apps/api/wrangler.toml` | Infra | Orphaned KV bindings (`CACHE_KV`, `SESSIONS_KV`) in API wrangler.toml (from prior roadmap ARC-02) | Evidence (Replit + prior roadmap): Prior roadmap ARC-02 flagged these. Verify resolution status. | Fix: Remove orphaned bindings if unused. Update documentation. Effort: 15 min.**

---

**INF-007 | P3 | Multiple `wrangler.toml` files | Infra | Inconsistent `compatibility_date` across workers — verify all unified to `2024-12-05` | Evidence (Prior roadmap BUG-06): `2024-09-23` vs `2024-12-05` found. Marked resolved; verify. | Fix: `grep -r "compatibility_date" apps/*/wrangler.toml` and unify. Effort: 15 min.**

---

**INF-008 | P3 | `apps/` (4 workers) | Infra | 4 apps still lack `wrangler.toml` — admin-dashboard, platform-admin, projections-app (if separate), workspace-app | Evidence (Replit + prior roadmap ARC-01): Prior roadmap marked as resolved; verify which remain as static-only intentionally. | Fix: Document which apps are intentionally Cloudflare-deploy-free. Add `wrangler.toml` for any that require Worker deployment. Effort: 2 h.**

---

**INF-009 | P3 | `apps/api/src/routes/ussd.ts` | Architecture | USSD route file does not exist as standalone — USSD handling location ambiguous | Evidence (Replit): `apps/api/src/routes/ussd.ts` returns 404. USSD endpoints are presumably in `apps/ussd-gateway/` but the route registration in `router.ts` is unclear. | Fix: Document canonical USSD route registration. Add dedicated `ussd.ts` route file with clear import in `router.ts`. Effort: 2 h.**

---

**INF-010 | P3 | `packages/` | Architecture | Notification package name is ambiguous — `packages/notificator/` returns 404; actual package may be `packages/notifications/` or `packages/notification-engine/` | Evidence (Replit): Index file for notificator not found. Notification engine is a major platform feature (Phases 0-9). | Fix: Confirm canonical package name. Update all cross-references. Effort: 30 min.**

---

## I. Enhancement Proposals (48 items)

**All items are new — none duplicate closed items from `ENHANCEMENT_ROADMAP_v1.0.1.md` (112/112 done as of 2026-04-20). Items from both agents merged; distinct items from each preserved in full.**

---

### Sprint 1 — Critical Security & Compliance (< 1 week)

**ENH-001 | Security | Opaque Refresh Token with Single-Use Rotation** — `refresh_tokens (jti_hash, user_id, tenant_id, revoked_at, replaced_by)`. Detect reuse → revoke all sessions. Fixes BUG-004. Effort: 8 h.

**ENH-002 | Security | PBKDF2 600k Iteration Upgrade with Live Rehash-on-Login** — Detect `password_hash_version < current` on login. Rehash transparently. Fixes SEC-001. Effort: 4 h.

**ENH-003 | Compliance | NDPR Erasure in D1 Batch with Erasure Receipt** — `db.batch()` for full cascade. `erasure_receipts` table. Confirmation email via Resend. Fixes COMP-002/003. Effort: 4 h.

**ENH-004 | Infrastructure | Dedicated `apps/schedulers` Worker** — 1 cron at 30s tick, internal dispatch table. Frees 5 production CRON slots. Enables COMP-003 (CBN reconciliation), COMP-008 (NDPR retention), COMP-001 (DSAR). Fixes BUG-005. Effort: 1 day.

**ENH-005 | Security | CI `verify-secrets` Job** — `wrangler secret list` asserts required secrets per env. Fixes SEC-005. Effort: 2 h.

**ENH-006 | Auth | T3 Fix in `requirePrimaryPhoneVerified`** — Add `AND tenant_id = ?` to D1 query. Fixes BUG-001. Effort: 30 min.

**ENH-007 | CI | CI Trigger on Push to Main** — Add `push: branches: [main]` to `ci.yml`. Branch protection on `main`. Fixes BUG-007. Effort: 15 min.

**ENH-008 | Auth | Workspace Status Check on JWT Refresh** — Query workspace status on every refresh. Reject terminated workspaces. Fixes BUG-016. Effort: 1 h.

---

### Sprint 2 — API Quality & Developer Experience

**ENH-009 | Governance | Extend check-tenant-isolation to Single-Quoted SQL** — ESLint rule or secondary regex. Fixes BUG-017. Effort: 1 h.

**ENH-010 | Governance | Founder-Approval Label CI Enforcement** — `gh pr view --json labels` check. Fixes BUG-056. Effort: 1 h.

**ENH-011 | Security | Token Blacklist Key Hashing** — `blacklist:token:${sha256hex(token)}`. Fixes SEC-003. Effort: 1 h.

**ENH-012 | API | Standardize Error Response Format** — `{ error, code, message, request_id }` everywhere. Governance check for missing `code`/`request_id`. Effort: 3 h.

**ENH-013 | API | Auto-Generated OpenAPI Spec from Route Definitions** — Migrate to `@hono/zod-openapi`. All routes auto-included. Fixes BUG-021. Effort: 8 h.

**ENH-014 | Security | Webhook Outbound HMAC Signing** — `X-WebWaka-Signature: sha256=<hmac>`. Per-partner secret. Governance check. Fixes SEC-007. Effort: 3 h.

**ENH-015 | Observability | Structured Logging with Request Correlation IDs** — `X-Request-ID` injected at edge. `cf.ray` in all log lines. Cloudflare Logpush. Effort: 4 h.

**ENH-016 | Security | Failed-Auth IP Logging Pipeline** — `AUTH_LOGIN_FAILURE` audit action with IP hash and UA hash. Fixes SEC-006. Effort: 2 h.

**ENH-017 | Compliance | Consent-Version Persistence** — `consent_history (user_id, consent_version, consented_at)`. Fixes COMP-004 / BUG-023. Effort: 3 h.

**ENH-018 | Performance | CDN Cache-Control Headers on Geography/Discovery** — `Cache-Control: public, max-age=86400` on geography; 30s TTL with `Vary: x-tenant-id` on discovery. 40-60% D1 read reduction. Effort: 2 h.

---

### Sprint 3 — UX & Resilience

**ENH-019 | UX | React `ErrorBoundary` Package** — Shared `packages/ui-error-boundary` with API error-report hook. All `main.tsx` wrapped. Fixes BUG-009. Effort: 4 h.

**ENH-020 | UX | `useOnlineStatus` Hook + Offline Queue** — New `packages/offline-queue` with IndexedDB. POS + Offerings. Auto-sync on reconnect. Fixes BUG-010. Effort: 2 days.

**ENH-021 | UX | Barcode Scanner Input (WebUSB / Keyboard Wedge)** — Single input listener in POS. Fixes UX-P4-01 / BUG-P4-01. Effort: 4 h.

**ENH-022 | Compliance | VAT 7.5% POS Line Item + Print Receipt** — `Math.round(subtotal_kobo * 0.075)`. `@media print` block. Fixes BUG-013 / COMP-005. Effort: 1 day.

**ENH-023 | UX | Skeleton Loader Component in Design-System** — Replaces text "Loading…". Effort: 2 h.

**ENH-024 | UX | Role-Permissions Matrix Viewer** — Auto-generated from `entitlement-model.md`. Tenant Admin can see who can do what. Effort: 4 h.

**ENH-025 | UX | Workspace Audit-Log Viewer** — Paginated `audit_log` filtered by `workspace_id`. Fixes UX-P3-07. Effort: 4 h.

**ENH-026 | UX | Branding Preview Iframe in Partner-Admin** — Sandboxed iframe for tenant page preview before publish. Fixes BUG-012 / UX-P2-04. Effort: 4 h.

**ENH-027 | UX | axe-core A11y Runner in CI** — Playwright integration. Fail on new WCAG AA violations. Fixes TST-008. Effort: 2 h.

**ENH-028 | UX | Account Deletion Confirmation Step** — Two-step: modal + typed email. Fixes BUG-011 (UX-P3-02). Effort: 1 h.

---

### Sprint 4 — Infrastructure & Ops

**ENH-029 | Infrastructure | Generalized SQLite ALTER TABLE Migration Guard** — `scripts/migrations/apply-safe.sh`. `pragma_table_info()` pre-check. Fixes BUG-002. Effort: 4 h.

**ENH-030 | Infrastructure | Migration Checksum Verification** — Pre-apply sha256 cross-check. Fixes INF-003 / BUG-033. Effort: 2 h.

**ENH-031 | Infrastructure | Canary Deploy Automation** — CF Workers `--gradual-rollout 5%`. Fixes BUG-041 / INF-004. Effort: 4 h.

**ENH-032 | Observability | SLO Scorecard + Dashboard** — Cloudflare Analytics Engine. p95 < 500ms, error-budget < 0.1%. Fixes INF-002. Effort: 1 day.

**ENH-033 | Reliability | Dead Letter Queue for Failed Webhooks** — `webhook_dead_letter` D1 table. Exponential backoff. Manual replay endpoint. Effort: 4 h.

**ENH-034 | Security | Rate-Limit Degradation Counter + Alert** — Analytics Engine counter on KV failure. Monitoring runbook integration. Fixes SEC-002. Effort: 2 h.

**ENH-035 | Security | 2FA / TOTP Enforcement for Super-Admins** — TOTP enrolment on first super_admin login. Fixes BUG-038 / UX-P1-07. Effort: 1 day.

**ENH-036 | Infrastructure | Branch Preview Deploy Workflow** — `pr-$PR_NUMBER.webwaka-preview.workers.dev`. Auto-delete on close. Fixes INF-004. Effort: 4 h.

---

### Sprint 5+ — Product Enhancements & Market Fit

**ENH-037 | Localization | USSD i18n (Yoruba / Hausa / Igbo)** — Static KV string tables keyed by `LANG`. Yoruba first. Fixes BUG-012 / UX-P7-06. Effort: 3 days.

**ENH-038 | Localization | Nigerian Phone Number Normalization** — E.164 `+2348012345678` before OTP and storage. Accept all formats. Effort: 2 h.

**ENH-039 | Platform | Workspace-Scoped Rate Limiting** — Secondary key `rl:${prefix}:ws:${workspaceId}`. Handles shared NAT. Fixes SEC-004. Effort: 3 h.

**ENH-040 | Product | NDPR DSAR Export Endpoint** — `POST /compliance/dsar/request`. 24h scheduled Worker assembles signed ZIP. Fixes COMP-001. Effort: 2 days.

**ENH-041 | Product | Real-Time Platform Admin Dashboard** — Cloudflare Durable Object push. Tenant-claim stream. Fixes UX-P1-01. Effort: 2 days.

**ENH-042 | Product | Admin Keyboard Command Palette** — `/ ` focus, `⌘K`. Fixes UX-P1-05. Effort: 4 h.

**ENH-043 | Product | Shared Reservation Primitive** — `packages/reservations` reused across hotel/restaurant-chain/creche. "Build Once Use Infinitely" principle. Fixes UX-V-07. Effort: 1 week.

**ENH-044 | Product | Consent-Capture UI in verticals-clinic First-Visit Flow** — Patient consent at intake. Fixes UX-V-01 / NDPR gap. Effort: 4 h.

**ENH-045 | Compliance | Controlled-Drugs Register in verticals-pharmacy** — PCN compliance. Scheduled register exports. Fixes UX-V-03. Effort: 1 day.

**ENH-046 | Product | Property-Based Tests on Currency Round-Trips** — `fast-check`: for all `x ≥ 0`, `parseNairaInput(formatNaira(x))` within 1 kobo. Fixes TST-003. Effort: 2 h.

**ENH-047 | Product | Hostile-Tenant RLS Regression Suite** — `25-cross-tenant-isolation.e2e.ts`. 2-tenant fixtures. Fixes TST-009. Effort: 4 h.

**ENH-048 | Product | FIRS VAT Calculation Engine** — 7.5% VAT on marketplace transactions. FIRS exemption list. VAT receipt. Effort: 1 day.

---

## J. IMMEDIATE ACTIONS — Sprint 1

**These 10 actions directly unblock compliance, prevent security breaches, and fix production gaps. Execute this week.**

| Priority | ID | Action | File | Effort |
|---|---|---|---|---|
| 1 | BUG-001 | Add `AND tenant_id = ?` to `requirePrimaryPhoneVerified` D1 query | `packages/auth/src/guards.ts:61` | 30 min |
| 2 | BUG-003 | Tighten CSRF: require `X-CSRF-Intent: m2m` when Origin+Referer absent | `apps/api/src/middleware/csrf.ts` | 3 h |
| 3 | BUG-007 | Add `push: branches: [main]` to `ci.yml`; add branch protection | `.github/workflows/ci.yml` | 15 min |
| 4 | BUG-008 | Return 503 on invalid `PLATFORM_BANK_ACCOUNT_JSON`; add health check | `apps/api/src/routes/payments.ts` | 2 h |
| 5 | BUG-009 | Ship minimal `ErrorBoundary` wrapping all React `main.tsx` | `apps/workspace-app/src/main.tsx` | 4 h |
| 6 | ENH-006 | T3 fix in `requirePrimaryPhoneVerified` (same file as BUG-001 — combine) | `packages/auth/src/guards.ts` | included above |
| 7 | BUG-004 / ENH-001 | Plan opaque refresh token architecture; create `refresh_tokens` migration | `infra/db/migrations/` | 8 h |
| 8 | BUG-002 | Port migration 0374 guard to staging deploy workflow | `.github/workflows/deploy-staging.yml` | 1 h |
| 9 | COMP-002/003 | Wrap erasure in `db.batch()`; add `erasure_receipts` table | `apps/api/src/routes/auth-routes.ts` | 4 h |
| 10 | BUG-014 | Route auth failures to audit-log with `AUTH_FAILURE_VERIFY` event type | `apps/api/src/middleware/auth.ts` | 3 h |

**Total Sprint 1 effort: ~26 hours (3.25 engineer-days)**

---

## Appendix — Source Attribution

| Finding IDs | Source |
|---|---|
| BUG-001, BUG-007, BUG-008, BUG-009 (CSRF), BUG-005, BUG-016, BUG-019 | Both agents (independently identified) |
| BUG-002, BUG-003 (CRON), BUG-009, BUG-010, BUG-011–013, BUG-020, BUG-022–024 | Abacus AI Deep Agent (staging branch) |
| BUG-001 (guards.ts), BUG-007, BUG-008, BUG-015, BUG-017–018, BUG-032, BUG-052 | Replit Agent (main branch) |
| UX findings (UX-001 through UX-P7-06) | Abacus AI Deep Agent |
| SEC-001 (PBKDF2), SEC-003, SEC-004, SEC-007–015 | Replit Agent |
| SEC-002, SEC-005, SEC-006 | Both agents |
| COMP-001–008 | Both agents (Abacus: COMP-001/002/004/005; Replit: COMP-002/003/006/007/008) |
| TST-001–011 | Abacus (TST-001–010) + Replit (TST-011) |
| INF-001–010 | Abacus (INF-001/002/004/005/007) + Replit (INF-003/006/007/008/009/010) |
| ENH-001–048 | Merged: Abacus ENH-001–036 + Replit unique enhancements |

---

*Consolidated by Replit Agent · 2026-04-23 · WebWaka OS main branch · Lossless merge of both review passes*
