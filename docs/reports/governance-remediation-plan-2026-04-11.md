# WebWaka OS — Comprehensive Governance Remediation Plan

**Date:** 2026-04-11
**Source:** `docs/reports/governance-compliance-deep-audit-2026-04-11.md`
**Goal:** 100% production readiness — zero governance deviation, zero documentation drift, zero pending issues
**Supersedes:** `docs/governance/webwaka_3in1_remediation_plan.md` (2026-04-09, partial scope)

---

## How This Plan Is Organized

The plan is divided into **7 workstreams**, each targeting a distinct category of remediation. Within each workstream, items are ordered by **execution phase**:

| Phase | Meaning | Gate |
|-------|---------|------|
| **Phase 0** | Must be done first — blocks all other work | Nothing proceeds until Phase 0 is complete |
| **Phase 1** | Security-critical and structural fixes | Must be complete before any new feature work |
| **Phase 2** | Enforcement infrastructure (middleware, CI, tests) | Must be complete before staging promotion |
| **Phase 3** | Feature completeness and production polish | Must be complete before production deployment |
| **Phase 4** | Documentation harmonization and hardening | Must be complete alongside Phases 1–3, final pass at end |

Every item has: a unique ID, the governance principle it remediates, the specific files affected, the exact action required, acceptance criteria, and a verification method.

---

## WORKSTREAM 1: SECURITY HARDENING (CRITICAL — Phase 0/1)

These items represent active security vulnerabilities. They must be resolved before any other work.

---

### SEC-001: Add authentication middleware to admin-dashboard

**Governance Principle:** Security Baseline §2 (Authentication and Tenancy)
**Severity:** CRITICAL — unauthenticated admin access
**Phase:** 0

**Current State:** `apps/admin-dashboard/src/index.ts` states auth is required but implements none. Routes trust the `x-workspace-id` header without JWT verification. Any caller who knows a workspace ID can access billing data and layout configuration.

**Files:**
- `apps/admin-dashboard/src/index.ts`

**Action:**
1. Import `jwtAuthMiddleware` from `@webwaka/auth` (or `@webwaka/core`)
2. Apply it globally to all routes except `GET /health`
3. Extract `tenant_id` and `workspace_id` from the verified JWT payload — do NOT trust headers
4. Replace all instances of `c.req.header('x-workspace-id')` with the JWT-derived workspace ID
5. Add `requireRole('admin')` or `requireRole('manager')` guard to `/billing` and `/layout` routes
6. Return 401 for missing/invalid JWT, 403 for insufficient role

**Acceptance Criteria:**
- [ ] No route except `/health` is accessible without a valid JWT
- [ ] `x-workspace-id` header is no longer used for authorization decisions
- [ ] Role check prevents non-admin users from accessing admin endpoints
- [ ] Unit tests cover: valid JWT, missing JWT (401), wrong role (403), wrong tenant (403)

**Verification:** Attempt `curl /billing` without JWT → must return 401. Attempt with valid JWT but `member` role → must return 403.

---

### SEC-002: Add authentication to platform-admin claims routes

**Governance Principle:** Security Baseline §2, §3 (RBAC)
**Severity:** CRITICAL — unauthenticated super-admin operations
**Phase:** 0

**Current State:** `apps/platform-admin/src/routes/claims.ts` uses `X-Admin-Id` header without verification. Default fallback: `'platform-admin'`. Any caller can approve or reject claims.

**Files:**
- `apps/platform-admin/src/routes/claims.ts`
- `apps/platform-admin/src/index.ts` (if main entry point mounts these routes)

**Action:**
1. Add JWT authentication middleware to all claim routes
2. Require `super_admin` role for all claim management operations (approve, reject, expire-stale)
3. Replace `c.req.header('X-Admin-Id') ?? 'platform-admin'` with the authenticated user's ID from JWT payload
4. Add `tenant_id` predicate to all claim queries where currently missing (see SEC-003)

**Acceptance Criteria:**
- [ ] All claim routes require valid JWT with `super_admin` role
- [ ] `X-Admin-Id` header is no longer used — admin identity comes from JWT
- [ ] Unauthorized callers receive 401; insufficient role receives 403
- [ ] `approved_by` field is populated from authenticated JWT, not from a header

**Verification:** Attempt `POST /admin/claims/:id/approve` without JWT → 401. With non-super-admin JWT → 403.

---

### SEC-003: Fix tenant isolation gaps in auth and claims routes

**Governance Principle:** T3 — Tenant Isolation Everywhere
**Severity:** CRITICAL
**Phase:** 0

**Current State:** Five specific queries lack `tenant_id` predicates:
1. `apps/api/src/routes/auth-routes.ts` — `DELETE FROM contact_channels WHERE user_id = ?`
2. `apps/api/src/routes/auth-routes.ts` — `DELETE FROM sessions WHERE user_id = ?`
3. `apps/api/src/routes/workspaces.ts` — pending claims count returns platform-wide count
4. `apps/api/src/routes/claim.ts` — `SELECT id, claim_state FROM profiles WHERE id = ?`
5. `apps/api/src/routes/claim.ts` — `UPDATE claim_requests SET status = 'expired' WHERE id = ?`

**Files:**
- `apps/api/src/routes/auth-routes.ts`
- `apps/api/src/routes/workspaces.ts`
- `apps/api/src/routes/claim.ts`

**Action:**
1. Add `AND tenant_id = ?` to all five queries, binding the authenticated user's `tenant_id`
2. For the `profiles` SELECT in `claim.ts`: profiles are intentionally global when in `seeded`/`claimable` state, but once a claim is initiated, the claim_request must be scoped to the requesting tenant. Add `tenant_id` to the `claim_requests` queries.
3. For the `workspaces.ts` analytics query: scope the pending claims count to only claims initiated by the current tenant's users.

**Acceptance Criteria:**
- [ ] Every DELETE, UPDATE, and SELECT on tenant-scoped tables includes `tenant_id` predicate
- [ ] The analytics endpoint no longer leaks platform-wide claim counts
- [ ] Unit tests verify that a user from Tenant A cannot delete Tenant B's contact channels

**Verification:** Grep all .ts files in `apps/api/src/routes/` for `DELETE FROM` and `UPDATE` — every instance must include `tenant_id`.

---

### SEC-004: Create audit_logs table and wire audit middleware

**Governance Principle:** Security Baseline §6 (Audit Logging)
**Severity:** HIGH
**Phase:** 1

**Current State:** `apps/api/src/middleware/audit-log.ts` exists and logs to console with `[AUDIT]` prefix. It is applied only to `/identity/*` and `/contact/verify/*` routes. There is no persistent `audit_logs` table. Destructive operations (DELETE, archive, deactivate) and financial operations leave no auditable trail beyond Cloudflare Logpush.

**Files:**
- `infra/db/migrations/` (new migration)
- `apps/api/src/middleware/audit-log.ts`
- `apps/api/src/index.ts`

**Action:**
1. Create migration for `audit_logs` table:
   ```sql
   CREATE TABLE audit_logs (
     id TEXT PRIMARY KEY,
     tenant_id TEXT NOT NULL,
     user_id TEXT NOT NULL,
     action TEXT NOT NULL,
     resource_type TEXT NOT NULL,
     resource_id TEXT,
     method TEXT NOT NULL,
     path TEXT NOT NULL,
     status_code INTEGER,
     ip_hash TEXT,
     metadata TEXT,
     created_at INTEGER DEFAULT (unixepoch())
   );
   CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id, created_at);
   ```
2. Update the existing `auditLogMiddleware` to write to D1 in addition to console logging
3. Apply audit middleware to all destructive operation routes: `DELETE`, `PUT`, `PATCH` on entities, workspaces, subscriptions, claims, and financial endpoints
4. Apply to all RBAC escalation routes (role changes, super-admin operations)

**Acceptance Criteria:**
- [ ] `audit_logs` table exists in D1
- [ ] Every DELETE, deactivate, and financial operation creates an audit log entry
- [ ] Audit logs include tenant_id, user_id, action, resource_type, resource_id, timestamp
- [ ] Audit logs are append-only — no UPDATE or DELETE on audit_logs table
- [ ] Rollback migration exists

---

### SEC-005: Verify CORS is non-wildcard in production

**Governance Principle:** Security Baseline §8 (Transport Security)
**Severity:** MEDIUM
**Phase:** 1

**Current State:** CORS reads from `ALLOWED_ORIGINS` env var with fallback to `['https://*.webwaka.com', 'http://localhost:5173']`. Production CORS must be explicitly set, not wildcarded.

**Files:**
- `apps/api/src/index.ts` (CORS configuration)
- `apps/api/wrangler.toml` (production env vars)

**Action:**
1. Verify that the production `ALLOWED_ORIGINS` Cloudflare secret is set to exact domains (not `*`)
2. Remove `http://localhost:5173` from production fallback — it should only apply in dev
3. Add a CI check or wrangler validation that ensures production ALLOWED_ORIGINS does not contain `*` or `localhost`

**Acceptance Criteria:**
- [ ] Production CORS does not accept wildcard origins
- [ ] Localhost origins are excluded from production configuration
- [ ] Documented in `infra/cloudflare/secrets-inventory.md`

---

### SEC-006: Add security headers to all apps

**Governance Principle:** Security Baseline §8 (Transport Security)
**Severity:** MEDIUM
**Phase:** 1

**Current State:** `secureHeaders()` is applied in `apps/api/src/index.ts` and `apps/admin-dashboard/src/index.ts`. Not applied in: `apps/brand-runtime/`, `apps/public-discovery/`, `apps/partner-admin/`, `apps/ussd-gateway/`, `apps/platform-admin/`.

**Files:**
- `apps/brand-runtime/src/index.ts`
- `apps/public-discovery/src/index.ts`
- `apps/partner-admin/src/index.ts`
- `apps/ussd-gateway/src/index.ts`

**Action:**
1. Import and apply `secureHeaders()` middleware globally in every app's entry point
2. Ensure headers include: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (or `SAMEORIGIN` for apps with iframe embeds), `Referrer-Policy: strict-origin-when-cross-origin`

**Acceptance Criteria:**
- [ ] Every app in `apps/` applies `secureHeaders()` globally
- [ ] Response headers verified via `curl -I` on each app's health endpoint

---

### SEC-007: Enforce release governance (PR-based promotion)

**Governance Principle:** Release Governance (entire document)
**Severity:** HIGH
**Phase:** 1

**Current State:** Governance requires PR-based promotion (`feat/*` → `staging` → `main`) with CI passing, reviewer approval, and Founder signoff. Actual practice: direct pushes to `staging` via GitHub API, bypassing all review gates. Branch protection rules exist on GitHub but are circumvented by admin/API pushes.

**Files:**
- `.github/workflows/ci.yml`
- `.github/workflows/deploy-staging.yml`
- `docs/governance/release-governance.md`
- `docs/governance/agent-execution-rules.md`

**Action:**
1. Document the current execution model honestly (direct API pushes from Replit)
2. Implement a pragmatic enforcement approach for the Replit-based workflow:
   - After each batch of changes, create a retrospective PR (`staging` → `main`) for audit trail
   - CI must pass on the PR before merge to `main`
   - Founder is tagged for visibility on every PR
3. Add a `CHANGELOG.md` entry for every batch of changes pushed
4. Update `release-governance.md` to describe both the ideal workflow and the current practical workflow
5. Ensure `governance-check.yml` flags PRs missing the `founder-approval` label as a warning (not a hard block, since the current workflow necessitates flexibility)

**Acceptance Criteria:**
- [ ] Every batch of code changes has a corresponding PR for audit trail
- [ ] CI passes on all PRs before merge to main
- [ ] Founder has visibility into all changes via PR notifications
- [ ] Release governance doc describes the actual process, not an aspirational one
- [ ] CHANGELOG.md is maintained

---

### SEC-008: Implement secret rotation tracking

**Governance Principle:** Security Baseline §1 (Secrets Management), 90-day rotation
**Severity:** HIGH
**Phase:** 1

**Current State:** Security baseline requires 90-day secret rotation. No tracking mechanism exists. No rotation has been performed. Secrets include: `JWT_SECRET`, `INTER_SERVICE_SECRET`, `SA_KEY_ENCRYPTION_KEY`, aggregator API keys.

**Files:**
- `infra/cloudflare/secrets-inventory.md` (update)
- New: `scripts/governance-checks/check-secret-rotation.ts`

**Action:**
1. Create `infra/cloudflare/secrets-rotation-log.md` documenting:
   - Every secret name, creation date, last rotation date, next rotation due date
   - Rotation procedure for each secret (which services need restart, etc.)
2. Create a CI check script that reads the rotation log and warns if any secret is > 80 days old
3. Document rotation procedures:
   - `JWT_SECRET`: rotate → update Cloudflare secret → restart workers → existing JWTs expire (acceptable, short-lived)
   - `INTER_SERVICE_SECRET`: rotate → update both API and admin workers simultaneously
   - Aggregator keys: rotate via provider dashboard → update Cloudflare secret
4. Add Dependabot triage process: document who reviews Dependabot PRs and the SLA (72 hours for critical, 1 week for high)

**Acceptance Criteria:**
- [ ] Every secret has a documented rotation date and procedure
- [ ] CI warns on secrets approaching 90-day age
- [ ] Dependabot triage process is documented and assigned

---

## WORKSTREAM 2: ENTITLEMENT ENFORCEMENT (Phase 1)

---

### ENT-001: Create entitlement middleware for vertical routes

**Governance Principle:** T5 — Subscription-Gated Features
**Severity:** HIGH
**Phase:** 1

**Current State:** 0 out of 124 vertical route files in `apps/api/src/routes/verticals/` have direct entitlement guards. Entitlement checks exist only at entity creation (`POST /individuals`, `POST /organizations`) and vertical activation (`workspace-verticals.ts`). Once a vertical is activated, all its route handlers are accessible regardless of subscription status.

**Files:**
- `packages/entitlements/src/` (new middleware file)
- `apps/api/src/index.ts` (apply middleware)
- All 124 files in `apps/api/src/routes/verticals/`

**Action:**
1. Create `packages/entitlements/src/middleware.ts` exporting `entitlementMiddleware`:
   - On every request to `/verticals/*`, load the workspace's subscription from D1
   - Verify the workspace has an active subscription (not expired, not suspended)
   - Verify the workspace's plan includes the requested vertical's required layer access
   - Return 403 with `{ error: 'subscription_required', plan: 'upgrade_to_x' }` if check fails
2. Apply `entitlementMiddleware` globally to all `/verticals/*` routes in `apps/api/src/index.ts`
3. This replaces the need for each of the 124 vertical route files to individually import entitlement guards

**Acceptance Criteria:**
- [ ] A workspace with an expired subscription cannot access any vertical route (403)
- [ ] A workspace on the `free` plan cannot access vertical routes requiring `growth` or above
- [ ] A workspace with an active subscription and correct plan can access its activated verticals
- [ ] The middleware is applied once, globally — not repeated in each vertical file
- [ ] Tests cover: expired sub (403), wrong plan (403), correct plan (200), no subscription (403)

---

### ENT-002: Add AI entitlement checks to SuperAgent routes

**Governance Principle:** T5, G1 (AI through SuperAgent), AI Billing and Entitlements
**Severity:** HIGH
**Phase:** 1

**Current State:** The `aiConsentGate` middleware in `packages/superagent/src/middleware.ts` handles NDPR consent. But AI *entitlement* checks (`requireAIAccess()` — verifying the workspace's plan includes AI rights) are not consistently applied to all AI-consuming routes.

**Files:**
- `apps/api/src/routes/superagent.ts`
- `packages/entitlements/src/guards.ts`

**Action:**
1. Apply `requireAIAccess()` from `packages/entitlements` as middleware on all SuperAgent routes
2. Verify that `aiRights: true` is checked against the workspace's plan before any AI call proceeds
3. Return 403 with `{ error: 'ai_not_included', upgrade: 'growth' }` if AI rights are not present

**Acceptance Criteria:**
- [ ] A `free` plan workspace cannot access SuperAgent routes (403)
- [ ] A `growth` plan workspace with `aiRights: true` can access SuperAgent routes
- [ ] The check runs before the NDPR consent gate (no point checking consent if plan doesn't include AI)

---

### ENT-003: Add branding entitlement check to brand-runtime

**Governance Principle:** T5, White-Label Policy
**Severity:** MEDIUM
**Phase:** 2

**Current State:** `apps/brand-runtime/` resolves the tenant and renders a branded page. It does not verify that the tenant's subscription includes branding rights (`requireBrandingRights()`).

**Files:**
- `apps/brand-runtime/src/index.ts`
- `packages/entitlements/src/guards.ts`

**Action:**
1. After tenant resolution, call `requireBrandingRights()` to verify the tenant's plan includes Pillar 2
2. If the tenant does not have branding rights, serve a "Branding not activated" page with upgrade CTA
3. Exception: the health endpoint (`/health`) does not require branding rights

**Acceptance Criteria:**
- [ ] A tenant on `starter` plan (no branding) sees an upgrade prompt, not a branded page
- [ ] A tenant on `brand` or `full_platform` plan sees their branded page
- [ ] Health endpoint remains accessible without branding rights

---

## WORKSTREAM 3: AI GOVERNANCE ENFORCEMENT (Phase 1–2)

---

### AI-001: Create ai_hitl_events and ai_hitl_queue tables

**Governance Principle:** G9 (Sensitive Sector HITL), ADL-007
**Severity:** HIGH
**Phase:** 1

**Current State:** The `ai_hitl_events` and `ai_hitl_queue` tables referenced in governance docs and ADL-007 do not exist in D1 migrations. Sensitive sector AI output (political, medical, legal) cannot be staged for human review.

**Files:**
- `infra/db/migrations/` (new migration)

**Action:**
1. Create migration for HITL tables:
   ```sql
   CREATE TABLE ai_hitl_events (
     id TEXT PRIMARY KEY,
     tenant_id TEXT NOT NULL,
     workspace_id TEXT NOT NULL,
     user_id TEXT NOT NULL,
     action_type TEXT NOT NULL,
     ai_call_id TEXT,
     status TEXT NOT NULL DEFAULT 'pending_review',
     approved_by TEXT,
     approved_at INTEGER,
     rejected_reason TEXT,
     created_at INTEGER DEFAULT (unixepoch())
   );

   CREATE TABLE ai_hitl_queue (
     id TEXT PRIMARY KEY,
     tenant_id TEXT NOT NULL,
     workspace_id TEXT NOT NULL,
     ai_call_id TEXT NOT NULL,
     output_text TEXT NOT NULL,
     vertical_slug TEXT NOT NULL,
     reviewer_id TEXT,
     status TEXT NOT NULL DEFAULT 'pending',
     reviewed_at INTEGER,
     expires_at INTEGER NOT NULL,
     created_at INTEGER DEFAULT (unixepoch())
   );
   ```
2. Create corresponding rollback migration

**Acceptance Criteria:**
- [ ] Both tables exist in D1
- [ ] Schema matches ADL-007 specification
- [ ] Rollback migration can cleanly reverse

---

### AI-002: Create ai_vertical_configs table

**Governance Principle:** AI Integration Framework (Checklist item: "Register vertical AI config")
**Severity:** MEDIUM
**Phase:** 2

**Current State:** Governance requires each vertical to register its AI configuration (capability set, autonomy level, HITL requirements, write boundaries) in a `ai_vertical_configs` table. This table does not exist.

**Files:**
- `infra/db/migrations/` (new migration)

**Action:**
1. Create migration:
   ```sql
   CREATE TABLE ai_vertical_configs (
     id TEXT PRIMARY KEY,
     vertical_slug TEXT NOT NULL UNIQUE,
     capability_set TEXT NOT NULL DEFAULT '[]',
     max_autonomy_level INTEGER NOT NULL DEFAULT 0,
     hitl_required INTEGER NOT NULL DEFAULT 1,
     sensitive_sector INTEGER NOT NULL DEFAULT 0,
     write_boundary TEXT NOT NULL DEFAULT '[]',
     created_at INTEGER DEFAULT (unixepoch()),
     updated_at INTEGER DEFAULT (unixepoch())
   );
   ```
2. Seed with configurations for all 17 P1 verticals based on the AI Integration Framework document

**Acceptance Criteria:**
- [ ] Table exists with all 17 P1 vertical configurations seeded
- [ ] Write boundary JSON matches the `AIWriteBoundary` type from governance docs

---

### AI-003: Implement financial table write prohibition guard

**Governance Principle:** G8 — Financial Tables Are AI Read-Only
**Severity:** HIGH
**Phase:** 1

**Current State:** No runtime guard prevents AI from writing to financial tables. The prohibition exists only in documentation.

**Files:**
- `packages/superagent/src/guards.ts` (new file)
- `apps/api/src/routes/superagent.ts`

**Action:**
1. Create a `guardAIFinancialWrite()` function that inspects AI tool call requests for any write operation targeting: `float_ledger`, `agent_wallets`, `wc_wallets`, `wc_transactions`, `payments`, `subscriptions`, `billing_history`, `pos_transactions`
2. Apply this guard in the SuperAgent route handler before executing any AI-initiated database write
3. If a write to a prohibited table is detected, reject with 403 and log the violation

**Acceptance Criteria:**
- [ ] Any AI-initiated write to a financial table is rejected at runtime
- [ ] Violation is logged with full context (workspace, user, table, operation)
- [ ] Unit test confirms the guard blocks writes to each prohibited table

---

### AI-004: Ensure USSD exclusion covers all AI entry points

**Governance Principle:** G7, ADL-006 — USSD Path AI-Excluded
**Severity:** MEDIUM
**Phase:** 1

**Current State:** `aiConsentGate` middleware includes USSD header check and is mounted on `/superagent/chat`. Need to verify ALL AI entry points are covered, not just the chat route.

**Files:**
- `apps/api/src/routes/superagent.ts`
- `apps/api/src/index.ts`

**Action:**
1. Audit all routes that invoke `resolveAdapter()` or any AI-consuming function
2. Ensure every such route has the USSD exclusion check
3. Add a global middleware on `/superagent/*` (not just `/superagent/chat`) that short-circuits if `X-USSD-Session` header is present

**Acceptance Criteria:**
- [ ] Every route under `/superagent/*` rejects USSD requests with 400
- [ ] No AI call can be triggered from any USSD session path
- [ ] Test: send request with `X-USSD-Session` header to every SuperAgent route → 400

---

### AI-005: Reconcile SuperAgent key storage (KV vs D1 drift)

**Governance Principle:** G3, ADL-002 — Key Vault in KV
**Severity:** MEDIUM
**Phase:** 2

**Current State:** ADL-002 specifies keys stored encrypted in Cloudflare KV (`SA_KEY_KV`). Implementation in `packages/superagent/src/key-service.ts` stores keys encrypted in D1 via migration `0042_superagent_keys.sql`. This is a doc-vs-code drift.

**Files:**
- `packages/superagent/src/key-service.ts`
- `docs/governance/ai-architecture-decision-log.md`

**Action:**
1. Decide: keep D1 (current implementation) or migrate to KV (governance spec)
2. If keeping D1: File ADL-011 documenting the decision to use D1 with AES-GCM instead of KV, and update ADL-002 to SUPERSEDED status
3. If migrating to KV: implement KV-based key storage per ADL-002 spec
4. Regardless of decision: implement key rotation (currently missing)

**Acceptance Criteria:**
- [ ] ADL is updated to reflect actual storage choice
- [ ] Key rotation mechanism exists (90-day rotation per security baseline)
- [ ] No undocumented architecture drift between governance docs and code

---

## WORKSTREAM 4: PWA / OFFLINE / MOBILE ENFORCEMENT (Phase 2–3)

---

### PWA-001: Add PWA assets to all client-facing apps

**Governance Principle:** P5 — PWA First
**Severity:** HIGH
**Phase:** 2

**Current State:** Only `apps/platform-admin/` has `manifest.json`, `sw.js`, and icons. Four other client-facing apps have none: `apps/brand-runtime/`, `apps/public-discovery/`, `apps/partner-admin/`, `apps/admin-dashboard/`.

**Files:**
- `apps/brand-runtime/public/` (create manifest.json, sw.js, icons/)
- `apps/public-discovery/public/` (create manifest.json, sw.js, icons/)
- `apps/partner-admin/public/` (create manifest.json, sw.js, icons/)
- `apps/admin-dashboard/public/` (create manifest.json, sw.js, icons/)

**Action:**
1. For each app, create:
   - `manifest.json` with app-specific name, short_name, start_url, display: standalone, theme_color, background_color, and icon references
   - `sw.js` implementing network-first caching strategy (matching platform-admin pattern)
   - `icons/icon-192.png` and `icons/icon-512.png`
2. For `apps/brand-runtime/`: the manifest should be dynamically generated per-tenant (tenant name, tenant colors, tenant icon)
3. Ensure HTML responses include `<link rel="manifest" href="/manifest.json">` and service worker registration script

**Acceptance Criteria:**
- [ ] All 5 client-facing apps have valid manifest.json files
- [ ] All 5 apps register a service worker
- [ ] `apps/brand-runtime/` serves tenant-specific manifest

---

### PWA-002: Wire offline-sync package into app entry points

**Governance Principle:** P6 — Offline First
**Severity:** HIGH
**Phase:** 3

**Current State:** `packages/offline-sync` has real implementation (Dexie.js, SyncEngine, service worker bridge) but no app calls `registerSyncServiceWorker()`. The offline capability is built but disconnected.

**Files:**
- `apps/platform-admin/public/sw.js` (upgrade to full Background Sync sw)
- `apps/brand-runtime/` (frontend entry, if applicable)
- `apps/public-discovery/` (frontend entry, if applicable)

**Action:**
1. Upgrade `apps/platform-admin/public/sw.js` to include Background Sync event listeners as documented in `packages/offline-sync/src/service-worker.ts`
2. In each app's frontend JavaScript, call `registerSyncServiceWorker()` from `@webwaka/offline-sync`
3. Implement offline form submission for at least one critical user journey per app:
   - Platform-admin: offline entity creation (queued for sync)
   - Brand-runtime: offline contact form submission
   - Public-discovery: offline search results cached from last visit
4. Add sync recovery handling for when network reconnects

**Acceptance Criteria:**
- [ ] At least one user journey per app works without network
- [ ] Writes made offline are queued in IndexedDB and synced on reconnect
- [ ] Service worker handles Background Sync events
- [ ] No data loss when network drops mid-operation

---

### PWA-003: Implement mobile-first responsive foundation

**Governance Principle:** P4 — Mobile First
**Severity:** HIGH
**Phase:** 2

**Current State:** `packages/design-system/` is a stub. No responsive CSS framework. All SSR HTML in `brand-runtime` and `public-discovery` renders without mobile optimization.

**Files:**
- `packages/design-system/src/` (implement)
- `apps/brand-runtime/src/` (apply)
- `apps/public-discovery/src/` (apply)

**Action:**
1. Implement `packages/design-system/` with:
   - CSS custom properties for spacing, typography, color (extending white-label-theming tokens)
   - Mobile-first breakpoint system (360px base, 768px tablet, 1024px desktop)
   - Core layout components: Container, Stack, Grid (CSS-only, no React dependency)
   - Typography scale optimized for mobile readability
2. Apply design system CSS to all HTML templates in `apps/brand-runtime/` and `apps/public-discovery/`
3. All pages must be usable at 360px viewport width

**Acceptance Criteria:**
- [ ] `packages/design-system/` exports a functional CSS foundation
- [ ] All pages in brand-runtime and public-discovery render correctly at 360px
- [ ] No horizontal scrolling at mobile viewport
- [ ] Text is readable without zooming on mobile

---

## WORKSTREAM 5: 3-IN-1 PLATFORM COMPLETION (Phase 2–3)

---

### P3IN1-001: Complete Pillar 2 brand-runtime to production quality

**Governance Principle:** 3-in-1 Architecture §4 (Pillar 2 gate for M9)
**Severity:** HIGH
**Phase:** 3

**Current State:** `apps/brand-runtime/` has functional scaffold (tenant resolution, branded pages, CSS theming) but is basic SSR HTML. Not production-quality.

**Files:**
- `apps/brand-runtime/src/`
- `packages/white-label-theming/src/`

**Action:**
1. Wire `packages/white-label-theming/` into brand-runtime — eliminate duplicated theming logic in `lib/theme.ts`
2. Implement full branded page set: Homepage, About, Services/Products (from `packages/offerings/`), Contact, Blog/Updates
3. Single-vendor e-commerce: product listing, product detail, add-to-cart, checkout (via Paystack)
4. Service portal: appointment booking, inquiry form
5. Apply design system (PWA-003) for mobile-first layouts
6. SEO: proper meta tags, Open Graph, structured data (JSON-LD)
7. PWA compliance (PWA-001)

**Acceptance Criteria:**
- [ ] A tenant with branding rights can view a fully branded, mobile-optimized website
- [ ] Product catalog pulls from `packages/offerings/` data
- [ ] Contact form submits to the tenant's workspace
- [ ] Pages are SEO-ready with proper meta tags
- [ ] Lighthouse mobile score > 80

---

### P3IN1-002: Complete Pillar 3 public-discovery to production quality

**Governance Principle:** 3-in-1 Architecture §4 (Pillar 3 gate for M9)
**Severity:** HIGH
**Phase:** 3

**Current State:** `apps/public-discovery/` has functional MVP (geography search, profile views, listings) but is basic SSR.

**Files:**
- `apps/public-discovery/src/`

**Action:**
1. Implement rich directory homepage with category browse (by sector and geography)
2. Full-text search with filters (sector, location, rating, price range)
3. Entity profile pages with: offerings, ratings, location map, contact, claim CTA
4. Geography-aware URLs: `/lagos/restaurant`, `/abuja/motor-park`
5. Multi-vendor marketplace views for Place-type verticals (markets, motor parks)
6. Apply design system (PWA-003)
7. SEO: geography-specific meta tags, sitemaps
8. PWA compliance (PWA-001)

**Acceptance Criteria:**
- [ ] Users can browse and search the directory by sector and geography
- [ ] Entity profile pages show complete information
- [ ] Claim CTA links to claim workflow
- [ ] Geography URLs resolve correctly for all Nigerian states
- [ ] Lighthouse mobile score > 80

---

### P3IN1-003: Implement cross-pillar data flow

**Governance Principle:** 3-in-1 Architecture §2 (Pillar Interconnection)
**Severity:** MEDIUM
**Phase:** 3

**Current State:** No cross-pillar data flow exists. Pillar 1 inventory data does not feed Pillar 2 catalog or Pillar 3 listings.

**Files:**
- `apps/api/src/routes/` (integration routes)
- `packages/offerings/src/` (cross-pillar exposure)

**Action:**
1. When a tenant creates offerings in Pillar 1 (operations), those offerings should automatically be available in:
   - Pillar 2 (brand-runtime product catalog) — read from same `offerings` table
   - Pillar 3 (public-discovery listing) — read from `search_index` updated by offerings changes
2. Implement event-driven or polling-based sync from offerings changes to search index updates
3. Verify Pillar 3 discovery links to Pillar 2 brand site and Pillar 1 ordering

**Acceptance Criteria:**
- [ ] Creating an offering in Pillar 1 makes it visible in Pillar 2 and Pillar 3
- [ ] Updating an offering in Pillar 1 reflects in both other pillars
- [ ] A user can discover an entity in Pillar 3, visit their brand site (Pillar 2), and place an order (routed to Pillar 1)

---

### P3IN1-004: Wire white-label-theming package properly

**Governance Principle:** White-Label Policy, P1 (Build Once)
**Severity:** MEDIUM
**Phase:** 2

**Current State:** `packages/white-label-theming/` is a stub. `apps/brand-runtime/src/lib/theme.ts` implements its own theming logic separately — violating P1 (no duplication of shared capabilities).

**Files:**
- `packages/white-label-theming/src/index.ts` (implement fully)
- `apps/brand-runtime/src/lib/theme.ts` (refactor to use shared package)
- `apps/tenant-public/src/` (wire theming)

**Action:**
1. Implement `packages/white-label-theming/` with:
   - `getBrandTokens(tenantId, db)` → reads from `tenant_branding` table
   - `generateCSS(tokens)` → produces CSS custom properties
   - `validateBrandConfig(config)` → validates colors, fonts, logo URLs
2. Refactor `apps/brand-runtime/src/lib/theme.ts` to import from `@webwaka/white-label-theming` instead of reimplementing
3. Wire into `apps/tenant-public/` for discovery profile styling

**Acceptance Criteria:**
- [ ] Single source of truth for theming in `packages/white-label-theming/`
- [ ] No duplicated theming logic in any app
- [ ] Both brand-runtime and tenant-public use the shared package

---

## WORKSTREAM 6: CI/CD AND GOVERNANCE AUTOMATION (Phase 1–2)

---

### CI-001: Add governance invariant checks to CI pipeline

**Governance Principle:** Platform Invariants enforcement
**Severity:** HIGH
**Phase:** 1

**Current State:** CI runs typecheck, test, lint, audit. No checks enforce governance invariants (T3, T4, T5, P7).

**Files:**
- `.github/workflows/ci.yml`
- New: `scripts/governance-checks/` directory

**Action:**
1. Create `scripts/governance-checks/check-tenant-isolation.ts`:
   - Scan all `.ts` files in `apps/api/src/routes/` for SQL queries
   - Flag any DELETE, UPDATE, or INSERT on tenant-scoped tables that lacks `tenant_id`
   - Exit 1 on violation
2. Create `scripts/governance-checks/check-ai-direct-calls.ts`:
   - Scan all `.ts` files outside `packages/ai-adapters/` for direct fetch calls to AI provider URLs
   - Flag any `fetch('https://api.openai.com')` or similar outside the adapters package
   - Exit 1 on violation
3. Create `scripts/governance-checks/check-monetary-integrity.ts`:
   - Scan migration files for REAL/FLOAT/DECIMAL on columns containing 'amount', 'price', 'cost', 'balance', 'kobo'
   - Exit 1 on violation
4. Add a `governance-check` job to `ci.yml` that runs all governance check scripts
5. Make the governance-check job a required check for merge

**Acceptance Criteria:**
- [ ] CI fails if a new query lacks tenant_id on a tenant-scoped table
- [ ] CI fails if direct AI provider calls are introduced outside adapters
- [ ] CI fails if monetary columns use non-integer types
- [ ] All checks are fast (< 30s total)

---

### CI-002: Add frozen lockfile enforcement

**Governance Principle:** Security Baseline §9 (Dependency Security)
**Severity:** MEDIUM
**Phase:** 1

**Current State:** CI uses `pnpm install --no-frozen-lockfile`, allowing dependency drift.

**Files:**
- `.github/workflows/ci.yml`

**Action:**
1. Change `pnpm install --no-frozen-lockfile` to `pnpm install --frozen-lockfile`
2. Ensure `pnpm-lock.yaml` is committed and up to date

**Acceptance Criteria:**
- [ ] CI fails if `pnpm-lock.yaml` is out of sync with `package.json` files

---

### CI-003: Add migration rollback verification

**Governance Principle:** Release Governance §Rollback Policy
**Severity:** MEDIUM
**Phase:** 2

**Current State:** Governance requires every migration to have a corresponding `.rollback.sql` file. No CI check verifies this.

**Files:**
- `.github/workflows/ci.yml`
- New: `scripts/governance-checks/check-rollback-scripts.sh`

**Action:**
1. Create script that checks: for every `NNNN_description.sql` in `infra/db/migrations/`, a corresponding `NNNN_description.rollback.sql` must exist
2. Add to CI as a check step

**Acceptance Criteria:**
- [ ] CI fails if any migration lacks a rollback script
- [ ] Existing migrations without rollbacks are backfilled

---

### CI-004: Add dependency source check

**Governance Principle:** Security Baseline §9
**Severity:** LOW
**Phase:** 2

**Current State:** Security baseline forbids `file:` or `github:` references in production `package.json`. No CI check enforces this.

**Files:**
- `.github/workflows/ci.yml`

**Action:**
1. Add a CI step that greps all `package.json` files for `"file:"` or `"github:"` in dependency fields
2. Exit 1 if found

**Acceptance Criteria:**
- [ ] CI fails if any production package.json uses file: or github: dependency references

---

## WORKSTREAM 7: DOCUMENTATION HARMONIZATION AND HARDENING (Phase 4 — continuous)

This workstream ensures every governance document accurately reflects the current codebase, eliminates all drift between docs and code, and hardens documents against future drift by cross-referencing code locations.

---

### DOC-001: Update vision-and-mission.md pillar names and order

**Governance Principle:** Core Principles alignment
**Phase:** 4
**Source:** Previous remediation plan DOC-1

**Current State:** Vision document lists pillars in wrong order (1. Discovery, 2. Operational, 3. Branded) vs. canonical (1. Ops, 2. Branding, 3. Marketplace).

**Files:**
- `docs/governance/vision-and-mission.md`

**Action:**
1. Update Mission section to use canonical pillar names and ordering:
   - Pillar 1: Operations-Management
   - Pillar 2: Branding / Website / Portal
   - Pillar 3: Listing / Multi-Vendor Marketplace
2. Add: "SuperAgent (AI) is the cross-cutting intelligence layer — not a fourth pillar."
3. Add "Last verified against code: 2026-04-11" footer

**Acceptance Criteria:**
- [ ] Pillar names and order match canonical spec exactly
- [ ] No agent or developer reading this doc gets a different pillar ordering

---

### DOC-002: Update ARCHITECTURE.md with 3-in-1 pillar map

**Governance Principle:** 3-in-1 Platform Architecture governance rule 1
**Phase:** 4
**Source:** Previous remediation plan DOC-2

**Files:**
- `ARCHITECTURE.md`

**Action:**
1. Add `## 3-in-1 Pillar Architecture` section with pillar-to-app/package mapping table
2. Include the rule: "All new modules and verticals must declare their primary pillar in their package.json description field"
3. Add "Last verified against code: 2026-04-11" footer

**Acceptance Criteria:**
- [ ] Every app and package in the codebase is listed with its pillar assignment
- [ ] The mapping matches the actual code structure

---

### DOC-003: Update 3in1-platform-architecture.md implementation status

**Governance Principle:** 3-in-1 Architecture accuracy
**Phase:** 4

**Current State:** The document says `apps/brand-runtime/` is "❌ Not implemented" and `apps/public-discovery/` is "❌ Not implemented". Both are now functional scaffolds.

**Files:**
- `docs/governance/3in1-platform-architecture.md`

**Action:**
1. Update `apps/brand-runtime/` status from "❌ Not implemented" to "⚠️ Functional scaffold — basic SSR, needs production polish"
2. Update `apps/public-discovery/` status from "❌ Not implemented" to "⚠️ Functional MVP — geography search, profile views, listings"
3. Update the migration reference from "0046" to the actual migration number for `primary_pillars` (0037)
4. Update all package statuses to reflect current reality
5. Add code file references (e.g., "See `apps/brand-runtime/src/routes/branded-page.ts`") so the doc can be verified against code

**Acceptance Criteria:**
- [ ] Every status in the document matches the actual codebase
- [ ] Code file references allow future auditors to verify claims

---

### DOC-004: Update platform-invariants.md with enforcement status

**Governance Principle:** Platform Invariants self-documentation
**Phase:** 4

**Current State:** Platform invariants document lists rules but does not indicate which are enforced by code vs. documentation-only.

**Files:**
- `docs/governance/platform-invariants.md`

**Action:**
1. Add an "Enforcement Status" column or subsection to each invariant:
   - P1: ✅ Enforced (architecture, 143 verticals compose from shared packages)
   - P2: ⚠️ Implicit (Nigerian data, no country abstraction yet)
   - P3: ❌ No multi-country path
   - P4: ❌ No mobile-first CSS framework (remediation: PWA-003)
   - P5: ⚠️ Platform-admin only (remediation: PWA-001)
   - P6: ⚠️ Infrastructure built, not wired (remediation: PWA-002)
   - P7: ✅ Enforced (resolveAdapter, no direct SDK imports)
   - P8: ⚠️ Architecture exists, key rotation missing (remediation: AI-005)
   - T1–T10: Add enforcement status for each
2. Link each remediation ID to this plan

**Acceptance Criteria:**
- [ ] Every invariant has a documented enforcement status
- [ ] Every non-enforced invariant links to a remediation item

---

### DOC-005: Update milestone-tracker.md to reflect actual progress

**Governance Principle:** Milestone Tracker accuracy
**Phase:** 4

**Current State:** Milestone tracker shows Milestones 3–12 as "NOT STARTED" with generic titles. In reality, significant work has been completed across what would be Milestones 3–8 (API worker, discovery, claims, commerce/verticals, etc.).

**Files:**
- `docs/governance/milestone-tracker.md`

**Action:**
1. Add detailed breakdowns for Milestones 3–8 reflecting actual completed work:
   - M3 (API Worker): apps/api is live with 100+ routes ✅
   - M4 (Discovery): discovery routes, search indexing, geography ✅
   - M5 (Claim-First): claims state machine, claim routes ✅
   - M6 (Commerce/Transport): POS, offerings, payments ✅
   - M7 (Community/Social): community spaces, social, courses ✅
   - M8 (Verticals): 143 vertical packages, 124 vertical route files ✅
2. Update M2 status to reflect that CI issues have been resolved (0 errors)
3. Add remaining work items as open tasks within each milestone

**Acceptance Criteria:**
- [ ] Milestone tracker reflects actual project state
- [ ] A new developer or agent can read the tracker and understand what's done vs. pending
- [ ] Each milestone lists completed tasks, remaining tasks, and blockers

---

### DOC-006: Update agent-execution-rules.md for current reality

**Governance Principle:** Agent Execution Rules accuracy
**Phase:** 4

**Current State:** Document references a 3-agent model (Replit Agent 4, Base44 Super Agent, Perplexity) with handoff protocols. The actual execution model has diverged — direct staging pushes, no PR reviews, no Base44 governance reviews.

**Files:**
- `docs/governance/agent-execution-rules.md`

**Action:**
1. Add a "Current Execution Model" section acknowledging the deviation from the documented model
2. Document the actual workflow being used (direct pushes via GitHub API)
3. Define a realistic, enforceable execution protocol going forward:
   - Either: restore the PR-based workflow with CI gates
   - Or: formalize the current model with appropriate safeguards
4. Ensure the chosen model still enforces: CI passing, governance compliance, founder visibility

**Acceptance Criteria:**
- [ ] Document describes what is actually happening, not an aspirational process
- [ ] Going-forward execution protocol is realistic and enforceable
- [ ] Founder has visibility into what changes are being made

---

### DOC-007: Add 3-in-1 position statement to all AI governance docs

**Governance Principle:** G10, 3-in-1 Architecture §7
**Phase:** 4
**Source:** Previous remediation plan DOC-6

**Current State:** Only `docs/governance/superagent/06-governance-rules.md` has the 3-in-1 position statement. The other 11 AI governance docs do not.

**Files:**
- `docs/governance/ai-policy.md`
- `docs/governance/ai-agent-autonomy.md`
- `docs/governance/ai-integration-framework.md`
- `docs/governance/ai-capability-matrix.md`
- `docs/governance/ai-billing-and-entitlements.md`
- `docs/governance/ai-context-map.md`
- `docs/governance/ai-platform-master-plan.md`
- `docs/governance/ai-provider-routing.md`
- `docs/governance/ai-repo-wiring.md`
- `docs/governance/ai-architecture-decision-log.md`
- `docs/governance/superagent/01-synthesis-report.md` through `05-document-update-plan.md`

**Action:**
1. Add to the top of each AI doc (after status block):
   ```
   > **3-in-1 Position:** WebWaka SuperAgent is the cross-cutting intelligence layer.
   > It is NOT a fourth platform pillar. All AI features are exposed through
   > Pillar 1 (Ops), Pillar 2 (Branding), or Pillar 3 (Marketplace).
   ```

**Acceptance Criteria:**
- [ ] Every AI governance doc opens with the 3-in-1 position statement
- [ ] No reader can mistake SuperAgent for a standalone product pillar

---

### DOC-008: Correct claim-first-onboarding.md lifecycle reference

**Governance Principle:** T7, Claim-First Onboarding accuracy
**Phase:** 4

**Current State:** Governance doc says `@packages/profiles` enforces the claim lifecycle. Actual lifecycle logic lives in `packages/claims` and `packages/entities`.

**Files:**
- `docs/governance/claim-first-onboarding.md`
- `docs/governance/platform-invariants.md` (T7 reference)

**Action:**
1. Update references from `@packages/profiles` to `@packages/claims` as the lifecycle enforcer
2. Note that `packages/profiles` provides the `PublicProfile` data contract only
3. Document the last 3 lifecycle stages (Branded, Monetized, Delegated) as "Planned — not yet tracked in FSM"

**Acceptance Criteria:**
- [ ] All governance references to lifecycle enforcement point to the correct package
- [ ] Planned-but-not-implemented lifecycle stages are clearly marked as such

---

### DOC-009: Update security-baseline.md with actual enforcement locations

**Governance Principle:** Security Baseline self-documentation
**Phase:** 4

**Current State:** Security baseline lists rules but doesn't reference the code files that enforce them. This makes verification impossible without a full codebase audit.

**Files:**
- `docs/governance/security-baseline.md`

**Action:**
1. For each security rule, add "Enforced in:" with file references:
   - §1 Secrets: "Enforced in: `.github/workflows/deploy-staging.yml` (secrets injection)"
   - §2 Auth: "Enforced in: `apps/api/src/index.ts` (JWT middleware global), `packages/auth/src/jwt.ts`"
   - §3 RBAC: "Enforced in: `packages/auth/src/rbac.ts`, `requireRole()` calls"
   - §4 Input validation: "Enforced in: Zod schemas in route handlers"
   - §5 Rate limiting: "Enforced in: `apps/api/src/index.ts` (`rateLimitMiddleware`), `RATE_LIMIT_KV` binding"
   - §6 Audit logging: "Enforced in: `apps/api/src/middleware/audit-log.ts` — INCOMPLETE, see SEC-004"
   - §8 Security headers: "Enforced in: `apps/api/src/index.ts` (`secureHeaders()`)"
2. Flag incomplete enforcement items with remediation references

**Acceptance Criteria:**
- [ ] Every security rule has code file references
- [ ] A new auditor can verify each rule without searching the codebase

---

### DOC-010: Add [Pillar N] prefix to all package.json descriptions

**Governance Principle:** 3-in-1 Architecture §7
**Phase:** 4
**Source:** Previous remediation plan CODE-4

**Files:**
- All `package.json` files in `packages/` and `apps/`

**Action:**
1. Add `[Pillar N]` prefix to each package's `"description"` field:
   - `packages/pos/` → `"[Pillar 1] POS float ledger, agent network, terminals"`
   - `packages/offerings/` → `"[Pillar 1] Products, services, routes, seats, tickets"`
   - `packages/white-label-theming/` → `"[Pillar 2] Brand token system for white-label surfaces"`
   - `packages/profiles/` → `"[Pillar 3] Discovery profiles for individuals, orgs, places"`
   - `packages/ai-abstraction/` → `"[AI] Provider-neutral AI routing and type contracts"`
   - `packages/auth/` → `"[Infra] Auth, tenancy, JWT, RBAC"`
   - All 143 vertical packages → `"[Pillar 1+3] {vertical name} sector module"`
   - etc. for all ~175 packages

**Acceptance Criteria:**
- [ ] Every package.json has a pillar prefix in its description
- [ ] CI governance check validates the prefix exists (add to CI-001)

---

### DOC-011: Update AI architecture decision log for SuperAgent key drift

**Governance Principle:** ADL integrity
**Phase:** 4

**Current State:** ADL-002 specifies KV storage for keys. Implementation uses D1. This must be formally resolved.

**Files:**
- `docs/governance/ai-architecture-decision-log.md`

**Action:**
1. Based on the decision made in AI-005, either:
   - Update ADL-002 status to "SUPERSEDED by ADL-011" and add ADL-011 documenting D1 choice, OR
   - Update ADL-002 to note "Implementation currently in D1, migration to KV pending"

**Acceptance Criteria:**
- [ ] ADL accurately reflects the actual architecture
- [ ] No undocumented drift between ADL and code

---

### DOC-012: Update execution prompt documents with pillar labels

**Governance Principle:** 3-in-1 Architecture consistency
**Phase:** 4
**Source:** Previous remediation plan DOC-4, DOC-5

**Files:**
- All 7 files in `docs/execution-prompts/`

**Action:**
1. Add `**Primary pillar(s):**` line to each task block header in all execution prompt documents
2. Add pillar classification column to vertical tables in master continuation prompt

**Acceptance Criteria:**
- [ ] Every execution prompt task block declares its primary pillar(s)

---

### DOC-013: Create partner-and-subpartner implementation roadmap

**Governance Principle:** Partner and Sub-Partner Model
**Phase:** 4

**Current State:** Partner model is governance-documented but has zero implementation. No APIs, no partner management, no delegation rights.

**Files:**
- `docs/governance/partner-and-subpartner-model.md`

**Action:**
1. Add an "Implementation Status" section: "NOT IMPLEMENTED — no partner management API exists"
2. Add an "Implementation Roadmap" section with:
   - Phase 1: Partner registration API, partner workspace creation
   - Phase 2: Sub-partner creation, delegation rights enforcement
   - Phase 3: Partner billing, revenue share, white-label depth control
3. Link implementation to M11 (Partner & White-Label) milestone

**Acceptance Criteria:**
- [ ] Document clearly states what is implemented vs. planned
- [ ] Implementation roadmap exists with milestone targets

---

### DOC-014: Add Africa-First expansion architecture note

**Governance Principle:** P3 — Africa First
**Phase:** 4

**Current State:** All data structures are Nigeria-specific (hardcoded states/LGAs/wards, NGN kobo, Paystack, CBN KYC). No architecture exists for multi-country expansion.

**Files:**
- `docs/governance/core-principles.md`
- `docs/governance/platform-invariants.md`

**Action:**
1. Add to P3 invariant: "Current implementation is Nigeria-only. Multi-country expansion requires:"
   - `country_id` column on geography_places and tenant-scoped tables
   - Payment provider abstraction layer (Paystack → interface → other providers)
   - Multi-currency support (kobo → abstract smallest-unit integer per currency)
   - Regulatory body abstraction (CAC/FRSC → interface → other countries' registries)
2. Mark this as a "Future Architecture" item, not a current violation

**Acceptance Criteria:**
- [ ] The expansion path is documented
- [ ] Current Nigeria-only status is acknowledged, not treated as a violation

---

### DOC-015: Create governance compliance dashboard document

**Governance Principle:** Governance visibility
**Phase:** 4

**Files:**
- `docs/governance/compliance-dashboard.md` (new)

**Action:**
1. Create a single-page dashboard showing compliance status for all invariants:
   - For each P1–P8 and T1–T10: status (✅/⚠️/❌), enforcement method, code reference, last verified date
   - For each G1–G10: same structure
   - For security baseline: each section's status
2. This document must be updated after every remediation item is completed
3. Include a "Last full audit" date and link to the audit report

**Acceptance Criteria:**
- [ ] Dashboard exists and is accurate
- [ ] Any stakeholder can open one document and see full compliance status
- [ ] Update process is documented (who updates, when, how)

---

## WORKSTREAM 8: REMAINING GOVERNANCE GAPS (Phase 1–3)

Items identified during code review as missing from the initial plan.

---

### GAP-001: Create superagent-sdk package (referenced but missing)

**Governance Principle:** G1 — All AI Through SuperAgent, ADL-001
**Severity:** MEDIUM
**Phase:** 2

**Current State:** ADL-001 and governance rules reference `packages/superagent-sdk` as the entry point for vertical packages to call AI. This package does not exist. Vertical packages currently call `packages/superagent` directly.

**Files:**
- `packages/superagent-sdk/` (create)
- `docs/governance/ai-architecture-decision-log.md`

**Action:**
1. Either: create `packages/superagent-sdk` as a thin wrapper around `packages/superagent` that provides a simplified API for vertical packages, OR
2. Update ADL-001 and all governance docs to reference `packages/superagent` as the correct package name, and file an ADL-012 noting the name change
3. Whichever approach is chosen, ensure consistency between docs and code

**Acceptance Criteria:**
- [ ] No governance doc references a package that doesn't exist
- [ ] Vertical packages have a documented, consistent entry point for AI calls

---

### GAP-002: Complete ward/community geography seeding

**Governance Principle:** T6 — Geography Anchored to Real Administrative Divisions
**Severity:** MEDIUM
**Phase:** 3

**Current State:** Nigeria has 774 LGAs and ~8,814 wards. Current seeds include 37 states and 6 zones. LGA and ward seeding is deferred (Issue #8). T6 compliance is incomplete without full geography data.

**Files:**
- `infra/db/seeds/` (new seed files)
- `packages/geography/src/data/` (TypeScript constants if applicable)

**Action:**
1. Create seed data for all 774 LGAs with correct parent state references
2. Create seed data for wards within priority LGAs (Phase 1 cities: Lagos, Abuja, Port Harcourt, Kano — all wards for these states' LGAs)
3. Remaining wards seeded incrementally by state in subsequent phases
4. Validate parent-child integrity (every LGA has a valid state parent, every ward has a valid LGA parent)

**Acceptance Criteria:**
- [ ] All 774 LGAs seeded with correct parent state references
- [ ] At least 4 priority states have complete ward-level seeding
- [ ] Geography hierarchy validates without orphan records
- [ ] `packages/geography/` queries return correct results for LGA and ward lookups

---

### GAP-003: White-label attribution and sub-delegation controls

**Governance Principle:** White-Label Policy §4 (Attribution), §6 (Sub-delegation)
**Severity:** MEDIUM
**Phase:** 3

**Current State:** White-label policy requires "Powered by WebWaka" attribution on all white-labeled surfaces. No attribution enforcement exists in code. Sub-delegation rights (partner → sub-partner) are governance-documented but have no implementation.

**Files:**
- `packages/white-label-theming/src/` (add attribution requirement)
- `apps/brand-runtime/src/` (render attribution)

**Action:**
1. Add `renderAttribution()` function to `packages/white-label-theming/` that generates the "Powered by WebWaka" footer
2. Call `renderAttribution()` in all branded page templates in `apps/brand-runtime/`
3. Make attribution removal a paid feature gated by entitlement (`removeAttribution: true` in plan)
4. Document sub-delegation rights in partner model implementation (deferred to P3IN1-005 when partner management is built)

**Acceptance Criteria:**
- [ ] All white-labeled pages show "Powered by WebWaka" unless the plan explicitly removes it
- [ ] Attribution is rendered from the shared package, not hardcoded in each app
- [ ] Sub-delegation controls are documented as a future implementation item

---

### GAP-004: Backfill rollback scripts for existing migrations

**Governance Principle:** Release Governance §Rollback Policy
**Severity:** MEDIUM
**Phase:** 2
**Prerequisite for:** CI-003 (migration rollback verification in CI)

**Current State:** CI-003 will require rollback scripts for all migrations. Most existing migrations (0001–0185+) lack rollback scripts. CI-003 cannot be enabled until rollbacks exist.

**Files:**
- `infra/db/migrations/` (add .rollback.sql files)

**Action:**
1. Create rollback scripts for all existing migrations
2. For simple CREATE TABLE migrations: `DROP TABLE IF EXISTS {table_name};`
3. For ALTER TABLE migrations: reverse ALTER (DROP COLUMN, etc.)
4. For data-only migrations (seeds, updates): document as "non-reversible — data migration"
5. Complete this BEFORE enabling CI-003

**Acceptance Criteria:**
- [ ] Every migration file has a corresponding .rollback.sql (or .rollback.md for non-reversible)
- [ ] CI-003 can be enabled without immediate failure

---

### GAP-005: Expand CI governance checks (Phase 2 additions)

**Governance Principle:** Multiple invariants
**Severity:** MEDIUM
**Phase:** 2
**Depends on:** CI-001 (base governance checks), DOC-010 (pillar prefixes)

**Current State:** CI-001 covers tenant isolation, AI direct calls, and monetary integrity. Additional governance checks are needed but must wait for prerequisite fixes.

**Files:**
- `scripts/governance-checks/` (additional check scripts)
- `.github/workflows/ci.yml`

**Action:**
1. `check-pillar-prefix.ts`: Verify all `package.json` descriptions start with `[Pillar N]`, `[AI]`, or `[Infra]`
   - MUST NOT be enabled until DOC-010 is complete
2. `check-pwa-manifest.ts`: Verify all apps in `apps/` (except `apps/api` and `apps/ussd-gateway`) have a `manifest.json`
   - MUST NOT be enabled until PWA-001 is complete
3. `check-ndpr-before-ai.ts`: Verify all SuperAgent route handlers call consent gate before AI invocation
4. Add all checks to CI, but gate each on its prerequisite being merged

**Acceptance Criteria:**
- [ ] Each check has a prerequisite documented
- [ ] Checks are added to CI only after prerequisites are met
- [ ] No check causes CI to fail due to missing prerequisites

---

### GAP-006: Complete Claim lifecycle FSM stages

**Governance Principle:** T7 — Claim-First Architecture
**Severity:** LOW
**Phase:** 3

**Current State:** Claim FSM implements: Seeded → Claimable → Claimed → NAS-Verified → Verified. Three additional stages documented in governance (Branded, Monetized, Delegated) are not implemented.

**Files:**
- `packages/claims/src/fsm.ts`
- `packages/entities/src/types.ts`

**Action:**
1. Add `branded`, `monetized`, and `delegated` states to the claim FSM
2. Define transition guards:
   - `verified` → `branded`: requires Pillar 2 subscription active
   - `branded` → `monetized`: requires at least one payment method configured
   - `monetized` → `delegated`: requires partner delegation agreement
3. These stages are informational tracking only — they don't gate access, they track business maturity

**Acceptance Criteria:**
- [ ] FSM accepts all 8 lifecycle states
- [ ] Transition guards validate prerequisites
- [ ] Existing verified entities are not affected (backward compatible)

---

## EXECUTION SEQUENCE

### Phase 0 (Immediate — blocks all other work)
| ID | Item | Est. Effort |
|----|------|-------------|
| SEC-001 | Admin-dashboard auth | 2 hours |
| SEC-002 | Platform-admin claims auth | 2 hours |
| SEC-003 | Tenant isolation gaps (5 queries) | 1 hour |

### Phase 1 (Security + structural — before any new features)
| ID | Item | Est. Effort |
|----|------|-------------|
| SEC-004 | Audit logs table + middleware | 3 hours |
| SEC-005 | CORS production verification | 1 hour |
| SEC-006 | Security headers all apps | 1 hour |
| SEC-007 | Release governance enforcement | 3 hours |
| SEC-008 | Secret rotation tracking | 2 hours |
| ENT-001 | Entitlement middleware for verticals | 4 hours |
| ENT-002 | AI entitlement checks | 2 hours |
| AI-001 | HITL tables | 1 hour |
| AI-003 | Financial table write guard | 2 hours |
| AI-004 | USSD exclusion all AI routes | 1 hour |
| CI-001 | Governance invariant CI checks (base) | 4 hours |
| CI-002 | Frozen lockfile | 30 min |

### Phase 2 (Enforcement infrastructure)
| ID | Item | Est. Effort | Depends On |
|----|------|-------------|------------|
| ENT-003 | Branding entitlement check | 1 hour | — |
| AI-002 | AI vertical configs table | 2 hours | — |
| AI-005 | SuperAgent key storage reconciliation | 3 hours | — |
| PWA-001 | PWA assets all apps | 4 hours | — |
| PWA-003 | Mobile-first design system | 8 hours | — |
| P3IN1-004 | Wire white-label-theming | 3 hours | — |
| GAP-001 | SuperAgent SDK package resolution | 1 hour | — |
| GAP-004 | Backfill rollback scripts | 4 hours | — |
| CI-003 | Migration rollback verification | 2 hours | GAP-004 |
| CI-004 | Dependency source check | 1 hour | — |
| DOC-010 | Package.json pillar prefixes | 2 hours | — |
| GAP-005 | Expanded CI governance checks | 3 hours | DOC-010, PWA-001 |

### Phase 3 (Feature completeness)
| ID | Item | Est. Effort | Depends On |
|----|------|-------------|------------|
| PWA-002 | Wire offline-sync | 6 hours | PWA-001 |
| P3IN1-001 | Brand-runtime production quality | 16 hours | P3IN1-004, PWA-003 |
| P3IN1-002 | Public-discovery production quality | 16 hours | PWA-003 |
| P3IN1-003 | Cross-pillar data flow | 8 hours | P3IN1-001, P3IN1-002 |
| GAP-002 | Ward/community geography seeding | 6 hours | — |
| GAP-003 | White-label attribution | 2 hours | P3IN1-004 |
| GAP-006 | Complete Claim lifecycle FSM | 3 hours | — |

### Phase 4 (Documentation — continuous, final pass at end)
| ID | Item | Est. Effort |
|----|------|-------------|
| DOC-001 | Vision-mission pillar names | 30 min |
| DOC-002 | ARCHITECTURE.md pillar map | 1 hour |
| DOC-003 | 3in1 architecture status update | 1 hour |
| DOC-004 | Platform invariants enforcement status | 1 hour |
| DOC-005 | Milestone tracker update | 2 hours |
| DOC-006 | Agent execution rules update | 1 hour |
| DOC-007 | AI docs 3-in-1 position statement | 1 hour |
| DOC-008 | Claim-first lifecycle reference fix | 30 min |
| DOC-009 | Security baseline code references | 1 hour |
| DOC-011 | ADL key storage update | 30 min |
| DOC-012 | Execution prompts pillar labels | 2 hours |
| DOC-013 | Partner model roadmap | 1 hour |
| DOC-014 | Africa-First expansion note | 30 min |
| DOC-015 | Compliance dashboard | 2 hours |

---

## TOTAL ESTIMATED EFFORT

| Phase | Items | Estimated Hours |
|-------|-------|----------------|
| Phase 0 | 3 | 5 |
| Phase 1 | 12 | 24.5 |
| Phase 2 | 12 | 34 |
| Phase 3 | 7 | 57 |
| Phase 4 | 14 | 15 |
| **TOTAL** | **48 items** | **~135.5 hours** |

---

## VERIFICATION AND SIGN-OFF

After all items are complete:

1. **Re-run full governance audit** using the methodology from `docs/reports/governance-compliance-deep-audit-2026-04-11.md`
2. **Every invariant must score 8/10 or above** on the compliance scorecard
3. **CI must pass** with all new governance checks enabled
4. **Founder review** of the updated compliance dashboard
5. **Update** `docs/governance/milestone-tracker.md` to reflect completed remediation
6. **Archive** this remediation plan as "COMPLETED" with the date of final verification

---

## ANTI-DRIFT MEASURES (Permanent)

To prevent future governance drift:

1. **CI governance checks (CI-001)** run on every PR — no merge without passing
2. **Compliance dashboard (DOC-015)** updated after every milestone
3. **"Last verified" dates** on all governance docs — stale docs are flagged in quarterly reviews
4. **PR template** already requires governance alignment checklist — enforce it
5. **Code references** in governance docs allow automated verification
6. **New packages** must declare pillar in package.json — CI enforces this
7. **New AI features** must register in ai_vertical_configs — blocked if missing

---

*This plan is the authoritative remediation roadmap. All items must be completed before the platform can be declared 100% production-ready. No exceptions without explicit Founder approval and a documented TDR.*

*Last updated: 2026-04-11*
