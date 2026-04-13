# WebWaka OS — Implementation Backlog

**Status:** Living document — verified against codebase on 2026-04-13  
**Scope:** Code implementation tasks only. Human-only operational tasks are in `docs/ops/human-action-items.md`.  
**Sources audited:** `docs/reports/governance-remediation-plan-2026-04-11.md`, `docs/governance/webwaka_3in1_remediation_plan.md`, `docs/production-remediation-plan-2026-04-10.md`, `docs/enhancements/ENHANCEMENT_ROADMAP_v1.0.1.md`, `docs/execution-prompts/UNIMPLEMENTED_TASKS.md`, `docs/reports/governance-compliance-deep-audit-2026-04-11.md`, milestone briefs (M3–M8), 170 total docs  
**Methodology:** Every item verified against the live codebase — not taken from docs alone. Items confirmed to be already implemented are excluded.

---

## Priority Tiers

| Tier | Meaning |
|---|---|
| 🔴 CRITICAL | Security vulnerability or blocker for any production use |
| 🟠 HIGH | Required for core platform functionality; blocks major milestones |
| 🟡 MEDIUM | Required for production quality; does not block MVP |
| 🟢 LOW | Polish, optimization, or governance hardening |

---

## TIER 1 — CRITICAL (Unblocked, must fix first)

---

### CRIT-001 — ENT-003: Branding Entitlement Check in `brand-runtime`
**Source:** Governance Remediation Plan — ENT-003  
**Governance:** T5 (Subscription-Gated Features), White-Label Policy  
**File:** `apps/brand-runtime/src/index.ts`

`apps/brand-runtime/` resolves the tenant and renders a branded page but does NOT verify that the tenant's subscription includes Pillar 2 branding rights. Any tenant — regardless of plan — can get a branded page.

**Required:**
1. After tenant resolution, call `requireBrandingRights()` from `packages/entitlements/`
2. If the tenant does not have branding rights → serve an upgrade prompt page, not a branded page
3. Exception: `GET /health` does not require branding rights

**Acceptance:**
- [ ] A `starter`-plan tenant sees an upgrade prompt instead of a branded page
- [ ] A `brand` or `full_platform` plan tenant sees their branded page as before
- [ ] `/health` is unaffected

---

### CRIT-002 — SEC-ROTATE: Secret Rotation CI Check Not Wired
**Source:** Governance Remediation Plan — SEC-008  
**Governance:** Security Baseline §8 (Secret Rotation)  
**Files:** `scripts/verify-secrets.ts` (exists), `.github/workflows/ci.yml`

`scripts/verify-secrets.ts` exists but is NOT included in the `governance` CI job. Secrets are not automatically checked for age — a secret can silently exceed 90 days without any CI warning.

**Required:**
1. Add a step to the `governance` job in `.github/workflows/ci.yml`:
   ```yaml
   - name: Check secret rotation schedule (SEC-008)
     run: npx tsx scripts/verify-secrets.ts
   ```
2. `verify-secrets.ts` should read `infra/cloudflare/secrets-rotation-log.md`, parse rotation dates, and exit 1 with a warning if any secret is > 80 days old

**Acceptance:**
- [ ] CI `governance` job fails if any secret exceeds the 80-day warning threshold
- [ ] `infra/cloudflare/secrets-rotation-log.md` is the source of truth for rotation dates

---

### CRIT-003 — R2: Cloudflare R2 Bucket Not Bound in `wrangler.toml`
**Source:** `docs/HANDOVER.md` §10, known issue #4  
**Governance:** Infrastructure completeness  
**Files:** `apps/api/wrangler.toml`, `apps/brand-runtime/wrangler.toml`

The Cloudflare R2 buckets (`assets-staging`, `assets-production`) were provisioned at Milestone 0 but have never been bound in any `wrangler.toml`. Any route that tries to upload or serve files via R2 will fail with a binding-not-found error at runtime.

**Required:**
1. Add R2 bindings to `apps/api/wrangler.toml` for staging and production envs:
   ```toml
   [[env.staging.r2_buckets]]
   binding = "ASSETS"
   bucket_name = "assets-staging"

   [[env.staging.r2_buckets]]
   binding = "ASSETS"
   bucket_name = "assets-production"
   ```
2. Add same to `apps/brand-runtime/wrangler.toml` (logo and brand asset uploads)
3. Document the R2 binding in `infra/cloudflare/environments.md`

**Acceptance:**
- [ ] `wrangler deploy --env staging` succeeds with R2 binding
- [ ] `env.ASSETS.put(...)` and `env.ASSETS.get(...)` work in workers

---

## TIER 2 — HIGH (Core functionality gaps)

---

### HIGH-001 — GAP-001: `packages/superagent-sdk` Missing
**Source:** Governance Remediation Plan — GAP-001  
**Governance:** G1 — All AI Through SuperAgent, ADL-001  
**Files:** `packages/superagent-sdk/` (create), `docs/governance/ai-architecture-decision-log.md`

ADL-001 and multiple governance documents reference `packages/superagent-sdk` as the entry point for vertical packages to call SuperAgent. This package does not exist. Verticals currently call `packages/superagent` directly — inconsistent with the documented API contract.

**Options (pick one and file ADL-012 documenting the decision):**
- **Option A:** Create `packages/superagent-sdk` as a thin, documented wrapper around `packages/superagent` with a simplified verticals-facing API
- **Option B:** File ADL-012 officially renaming the package, update all governance docs to reference `packages/superagent` instead, and close the gap documentally

**Acceptance:**
- [ ] No governance document references a package name that does not exist in the monorepo
- [ ] Verticals have one documented, consistent entry point for AI calls

---

### HIGH-002 — GAP-002: Geography LGA and Ward Seed Data Missing
**Source:** Governance Remediation Plan — GAP-002, Milestone 3 Issue #8  
**Governance:** T6 — Geography Anchored to Real Administrative Divisions  
**Files:** `infra/db/seeds/` (new SQL files), `packages/geography/src/data/`

Current seeds include 37 states and 6 zones only. Nigeria has 774 LGAs and ~8,814 wards. Without LGA-level seeding, geography-based discovery (`/discover?lga=ikeja`), routing, and place assignment all fail or return empty results. T6 is only partially compliant.

**Required:**
1. Create `infra/db/seeds/0005_lgas.sql` — all 774 LGAs with correct state parent references
2. Create `infra/db/seeds/0006_wards_priority_states.sql` — all wards for Lagos, Abuja (FCT), Kano, Rivers — the 4 highest-population states
3. Create subsequent seed files for remaining states incrementally
4. Validate parent-child integrity: every LGA must reference a valid state, every ward a valid LGA
5. Update `packages/geography/src/data/` constants if applicable

**Acceptance:**
- [ ] `SELECT count(*) FROM geography_places WHERE level = 'lga'` returns 774
- [ ] Geography queries for `/discover?lga=ikeja` resolve correctly
- [ ] Seed files pass the `check-geography-integrity.ts` governance check

---

### HIGH-003 — QA-02: Identity Route Tests Missing
**Source:** Enhancement Roadmap — QA-02  
**Governance:** Test coverage for security-critical routes  
**Files:** `apps/api/src/routes/identity.ts` (existing), new test file

`apps/api/src/routes/identity.ts` handles KYC verification (BVN/NIN/FRSC), a security-critical feature with no dedicated test coverage. The 444-test suite covers other routes but not identity.

**Required:**
1. Create `apps/api/src/routes/identity.test.ts`
2. Cover: BVN submission (valid, invalid, already verified), NIN/FRSC submission, KYC tier upgrades, tenant isolation (T3), rate limiting on identity calls
3. Mock the Prembly provider (never call live KYC APIs in tests)

**Acceptance:**
- [ ] `identity.test.ts` has ≥ 20 test cases
- [ ] All T3, T5, and P10 invariants verified in tests
- [ ] CI passes with no regressions

---

### HIGH-004 — QA-03: Negotiation Route Tests Missing
**Source:** Enhancement Roadmap — QA-03  
**Governance:** Test coverage for financial-critical routes  
**Files:** `apps/api/src/routes/negotiation.ts` (existing, 23 KB), new test file

`negotiation.ts` is the largest route file in the codebase (23 KB) and handles all P9-sensitive money flows (offers in kobo, counter-offers, auto-accept thresholds) with no dedicated test file.

**Required:**
1. Create `apps/api/src/routes/negotiation.test.ts`
2. Cover: session creation, offer submission (kobo validation, no floats), counter-offer, auto-accept, max-rounds enforcement, expiry (CRON), disabled-vertical gate, T3 tenant isolation
3. Cover the 12 verticals with negotiation disabled (pharmacy-chain, food-vendor, bakery, etc.)

**Acceptance:**
- [ ] ≥ 30 test cases covering all major negotiation flows
- [ ] P9 violation (float offer amounts) correctly rejected in tests
- [ ] Disabled-vertical rejection tested for all 12 blocked verticals

---

### HIGH-005 — QA-06: Entity and Workspace Route Tests Missing
**Source:** Enhancement Roadmap — QA-06  
**Governance:** Core entity CRUD test coverage  
**Files:** `apps/api/src/routes/entities.ts`, new test file

`entities.ts` handles the foundational CRUD for all 7 root entities (Individuals, Organizations, Places, etc.). No dedicated test file exists for this route.

**Required:**
1. Create `apps/api/src/routes/entities.test.ts`
2. Cover: create/read/update for each entity type, T3 isolation, pagination, ID type enforcement

**Acceptance:**
- [ ] ≥ 20 test cases
- [ ] T3 isolation confirmed for all entity operations

---

### HIGH-006 — Vertical Route Tests Missing Entirely
**Source:** Live codebase audit  
**Governance:** Test coverage for 124 vertical route files  
**Files:** `apps/api/src/routes/verticals/` (124 files, 0 test files)

There are 124 vertical route files in `apps/api/src/routes/verticals/` with **zero test files**. While vertical package tests exist elsewhere, route-level behavior (tenant isolation, FSM state guard, entitlement check, input validation) is untested.

**Required (phased approach):**
1. **Phase 1:** Create tests for the 5 highest-priority verticals: `pos-business.test.ts`, `politician.test.ts`, `church.test.ts`, `clinic.test.ts`, `school.test.ts`
2. **Phase 2:** Cover all P1 verticals (34 total) — one test file per vertical
3. **Phase 3:** Cover P2 and P3 verticals

Each test file must cover: T3 tenant isolation, FSM state transitions, entitlement guard (403 on wrong plan), P9 monetary integrity.

**Acceptance (Phase 1):**
- [ ] 5 test files created covering the top P1 verticals
- [ ] Each file has ≥ 10 tests
- [ ] All existing 444 API tests continue passing

---

### HIGH-007 — P3IN1-001: `brand-runtime` Not Production Quality
**Source:** Governance Remediation Plan — P3IN1-001, 3-in-1 Architecture §4  
**Governance:** Pillar 2 gate for M9  
**Files:** `apps/brand-runtime/src/`

`brand-runtime` has a functional scaffold (tenant resolution, branded pages, CSS theming) but is basic SSR HTML. Missing: full branded page set (About, Services, Blog), single-vendor e-commerce (product listing, cart, checkout via Paystack), service portal (appointments, inquiry form), SEO meta tags, PWA compliance, mobile-first layouts.

**Required:**
1. Full branded page set: Homepage, About, Services/Products (from `packages/offerings/`), Contact, Blog/Updates
2. Single-vendor e-commerce flow: product listing → product detail → cart → checkout (Paystack)
3. Service portal: appointment booking, inquiry form
4. SEO: proper meta tags, Open Graph, JSON-LD structured data
5. PWA: `manifest.json`, service worker, offline fallback (currently `apps/brand-runtime/public/` directory is empty)
6. Mobile-first: apply `packages/design-system/` CSS

**Acceptance:**
- [ ] A tenant with branding rights can view a fully branded website with real product data
- [ ] Lighthouse mobile score > 80
- [ ] Pages have proper Open Graph tags

---

### HIGH-008 — P3IN1-002: `public-discovery` Not Production Quality
**Source:** Governance Remediation Plan — P3IN1-002, 3-in-1 Architecture §4  
**Governance:** Pillar 3 gate for M9  
**Files:** `apps/public-discovery/src/`

`public-discovery` has a functional MVP (geography search, profile views, listings) but is basic SSR. Missing: rich directory homepage with category browse, full-text search with filters, geography-aware URLs (`/lagos/restaurant`), multi-vendor marketplace views for Place-type verticals, sitemap generation, PWA compliance.

**Required:**
1. Rich directory homepage with sector and geography category browse
2. Full-text search with filters (sector, location, rating, price range)
3. Entity profile pages: offerings, ratings, location map, contact, claim CTA
4. Geography-aware URLs: `/lagos/restaurant`, `/abuja/motor-park` for all 37 Nigerian states
5. SEO: geography-specific meta tags, automatic sitemap
6. Mobile-first layouts using `packages/design-system/`

**Acceptance:**
- [ ] Users can browse and search the directory by sector and geography
- [ ] Geography URLs resolve correctly for all 37 states
- [ ] Lighthouse mobile score > 80

---

### HIGH-009 — P3IN1-003: Cross-Pillar Data Flow Not Implemented
**Source:** Governance Remediation Plan — P3IN1-003  
**Governance:** 3-in-1 Architecture §2 (Pillar Interconnection)  
**Files:** `apps/api/src/routes/`, `packages/offerings/src/`, `packages/search-indexing/src/`

Currently Pillar 1 (operations) data is completely isolated from Pillar 2 (branding) and Pillar 3 (marketplace). When a tenant creates offerings in their Pillar 1 workspace, those offerings do not automatically appear in their branded site or public discovery listing.

**Required:**
1. When an offering is created or updated in Pillar 1, trigger a search index update so Pillar 3 listing reflects it
2. `apps/brand-runtime/` product catalog reads directly from `packages/offerings/` — no duplication
3. Pillar 3 entity profiles link to the tenant's Pillar 2 brand site URL and Pillar 1 ordering endpoint

**Acceptance:**
- [ ] Creating an offering in Pillar 1 makes it visible in Pillar 2 product catalog and Pillar 3 directory
- [ ] No data duplication between pillars — single source of truth

---

### HIGH-010 — Partner Model Phase 3 Not Started
**Source:** `docs/governance/partner-and-subpartner-model.md` §Implementation Roadmap  
**Governance:** Partner + White-Label Policy, WakaCU wallet  
**Files:** `apps/api/src/routes/partners.ts` (Phases 1+2 done), new Phase 3 work

Phases 1 and 2 of the partner model are implemented (partner registration, sub-partner creation, delegation). Phase 3 — partner billing, WakaCU wholesale credit allocation, and white-label depth control per tier — is NOT STARTED. The WakaCU wallet D1 table (`0043_wc_wallets_transactions.sql`) exists but has no route implementation.

**Required:**
1. Partner WakaCU credit pool management: `GET /partners/:id/credits` (pool balance), `POST /partners/:id/credits/allocate` (allocate to sub-tenant)
2. Partner billing: revenue share calculation and settlement records
3. White-label depth control: enforce `max_branding_depth` from partner plan in `apps/brand-runtime/`
4. Partner Admin dashboard (`apps/partner-admin`) needs real routes — currently a PWA stub with placeholder data

**Acceptance:**
- [ ] Partners can view their WakaCU credit pool balance
- [ ] Partners can allocate WakaCU credits to their sub-tenants
- [ ] White-label depth is enforced (a Tier-1 partner cannot offer deeper white-label than their plan allows)

---

## TIER 3 — MEDIUM (Production polish, governance)

---

### MED-001 — ARC-07: `apps/api/src/index.ts` Too Large (758 lines)
**Source:** Enhancement Roadmap — ARC-07  
**File:** `apps/api/src/index.ts` (758 lines)

The API entry point is 758 lines, mounting all 20+ route modules inline. Should be split into a router registry pattern.

**Required:** Factor route mounting into `apps/api/src/router.ts` and middleware setup into `apps/api/src/middleware/index.ts`. `index.ts` should be < 100 lines.

**Acceptance:** `index.ts` ≤ 100 lines; all 444 tests still pass.

---

### MED-002 — ARC-08: Vertical Code Generation Tooling Missing
**Source:** Enhancement Roadmap — ARC-08  
**Files:** `scripts/codegen/` (create)

With 154 verticals pending implementation (Sets A–J), implementing each one manually from the execution prompt template is error-prone. A `scripts/codegen/vertical.ts` CLI that scaffolds a new vertical route file, migration file, and test file from a template would dramatically reduce implementation time.

**Required:**
1. Create `scripts/codegen/vertical.ts` taking `--slug`, `--category`, `--fsm-states` as arguments
2. Output: `infra/db/migrations/XXXX_vertical_<slug>.sql`, `apps/api/src/routes/verticals/<slug>.ts`, `apps/api/src/routes/verticals/<slug>.test.ts`
3. Apply all platform invariants (T3, T4, P9) by default in the generated template

**Acceptance:** Running `npx tsx scripts/codegen/vertical.ts --slug laundry --category commerce` generates three correct files in < 5 seconds.

---

### MED-003 — ARC-09: D1 Local Development Connection Documentation Missing
**Source:** Enhancement Roadmap — ARC-09  
**File:** `docs/` or `CONTRIBUTING.md`

No documentation exists explaining how to run D1 locally during development (`wrangler dev --local`), how to seed the local DB, or how to reset it. Developers must discover this by trial and error.

**Required:** Add a "Local D1 Development" section to `CONTRIBUTING.md` covering: `wrangler dev --local`, `wrangler d1 execute --local`, local seed commands, and how to reset the local DB.

---

### MED-004 — ARC-10: API Versioning Strategy Undefined
**Source:** Enhancement Roadmap — ARC-10  
**File:** `apps/api/src/index.ts`, `docs/`

All routes are mounted at root (e.g., `/auth/login`), with no `/v1/` prefix and no documented versioning strategy. Breaking changes will be difficult to ship without a clear versioning contract.

**Required:**
1. File an ADR (`docs/architecture/decisions/0017-api-versioning.md`) documenting the chosen strategy (URL versioning, header versioning, or semantic versioning with no-break policy)
2. Implement the chosen strategy consistently

---

### MED-005 — ARC-13: OpenAPI Spec Not Validated in CI
**Source:** Enhancement Roadmap — ARC-13  
**Files:** `apps/api/src/routes/openapi.ts`, `.github/workflows/ci.yml`

An OpenAPI 3.1 spec is served at `/openapi.json` but is not validated against a schema in CI. A malformed spec can be deployed silently.

**Required:** Add `npx @redocly/cli lint /openapi.json` (or equivalent) to the CI pipeline.

---

### MED-006 — ARC-15: No Circuit Breaker for External API Calls
**Source:** Enhancement Roadmap — ARC-15  
**Files:** `packages/ai-adapters/src/`, `packages/contact/src/otp.ts`

External API calls (Paystack, Prembly, Termii, WhatsApp) have no circuit breaker. A single slow or unavailable provider can cascade failures across the entire platform.

**Required:** Implement a simple circuit breaker (open/half-open/closed states with KV-backed state) in `packages/core/src/circuit-breaker.ts`. Apply to all external provider calls.

---

### MED-007 — ARC-17: KV Cache Lacks Graceful Degradation
**Source:** Enhancement Roadmap — ARC-17  
**Files:** Multiple KV-reading routes

KV reads that fail (timeout, quota exceeded) currently bubble up as 500 errors. The platform should degrade gracefully (serve stale cache or fall through to D1) rather than failing hard.

**Required:** Add try/catch around all KV reads; on failure, log the error and fall through to the source of truth (D1).

---

### MED-008 — QA-07: Load Testing Infrastructure Missing
**Source:** Enhancement Roadmap — QA-07  
**Files:** `tests/load/` (create)

No load testing exists. The platform has no validated response time baseline under load, making it impossible to detect performance regressions.

**Required:**
1. Create `tests/load/` with a k6 or Artillery configuration
2. Baseline scenarios: 100 concurrent requests to `/health`, 50 concurrent to `/discovery/search`, 20 concurrent negotiation sessions
3. Add load test results to `docs/qa/` as a baseline report

---

### MED-009 — QA-09: External API Contract Tests Missing
**Source:** Enhancement Roadmap — QA-09  
**Files:** `packages/ai-adapters/`, `packages/contact/`

No contract tests verify that the Paystack, Prembly, Termii, and AI provider APIs behave as expected. If a provider changes their API, the failure will only be discovered in production.

**Required:** Create mock-based contract tests for each external provider using recorded fixtures.

---

### MED-010 — QA-10: Template Lifecycle Tests Missing
**Source:** Enhancement Roadmap — QA-10  
**Files:** `apps/api/src/routes/templates.ts`, new test file

The template marketplace routes (install, rollback, publish) introduced in v1.0.1 have no dedicated test coverage.

**Required:** Create `apps/api/src/routes/templates.test.ts` covering: install (valid/invalid), rollback, publish (super_admin only), T3 isolation.

---

### MED-011 — PROD-03: Admin Analytics Dashboard Missing
**Source:** Enhancement Roadmap — PROD-03  
**Files:** `apps/admin-dashboard/src/`, `apps/api/src/routes/`

The admin dashboard PWA shell exists but shows placeholder data. No analytics API routes exist for key metrics (active tenants, monthly transactions, vertical usage, revenue).

**Required:**
1. Create `apps/api/src/routes/analytics.ts` with admin-level aggregation queries
2. Wire real data into the admin dashboard Overview view

---

### MED-012 — PROD-08: Template Ratings Not Implemented
**Source:** Enhancement Roadmap — PROD-08  
**Files:** `apps/api/src/routes/templates.ts`, `infra/db/migrations/`

The template marketplace has no ratings or reviews system. Tenants cannot signal quality.

**Required:**
1. Migration: `template_ratings` table
2. Routes: `POST /templates/:slug/rate`, `GET /templates/:slug/ratings`
3. Aggregate rating in `GET /templates/:slug` response

---

### MED-013 — PROD-10: Support Ticket System Missing
**Source:** Enhancement Roadmap — PROD-10  
**Files:** `apps/api/src/routes/support.ts` (create), `infra/db/migrations/`

No in-platform support ticket system exists. Tenants and partners have no self-service way to raise issues.

**Required:**
1. Migration: `support_tickets` table
2. Routes: `POST /support/tickets`, `GET /support/tickets`, `PATCH /support/tickets/:id` (status, assignee)
3. Super-admin view: `GET /platform/support/tickets` (all tenants)

---

### MED-014 — PROD-06: Multi-Currency Runtime Not Implemented
**Source:** Enhancement Roadmap — PROD-06  
**Files:** `packages/types/src/africa-first.ts` (types exist), `packages/payments/`

`CurrencyConfig` and `CountryConfig` types exist in `packages/types/src/africa-first.ts`, but all payment processing hardcodes NGN/kobo. No runtime multi-currency handling exists — amounts in other currencies would be stored as kobo silently.

**Required:**
1. Add `currency_code` and `amount_smallest_unit` fields to relevant payment tables
2. Payment processing middleware validates that amounts match the workspace's configured currency
3. Document that this is a future-readiness feature — Nigerian operations continue using NGN/kobo by default

---

### MED-015 — MON-05: Subscription Management UI Missing
**Source:** Enhancement Roadmap — MON-05  
**Files:** `apps/admin-dashboard/src/`

The billing enforcement API (`billing.ts`) exists but the admin dashboard has no UI to view, upgrade, or manually adjust a workspace's subscription. Currently admins must use the API directly.

**Required:** Wire the admin dashboard Billing/Subscription view to the real `GET /billing/status` and `POST /billing/reactivate` APIs.

---

### MED-016 — DEV-07: Local Development Setup Documentation Incomplete
**Source:** Enhancement Roadmap — DEV-07  
**Files:** `CONTRIBUTING.md`

`CONTRIBUTING.md` covers repository setup but lacks a "start developing locally" walkthrough covering: wrangler dev server, local D1, seeding the local DB, running the smoke tests, and debugging Worker errors.

**Required:** Add a "Local Development Quickstart" section to `CONTRIBUTING.md` with step-by-step commands from clone to first successful API call.

---

## TIER 4 — MAJOR FEATURE WORK (Milestone-sized items)

---

### FEAT-001 — 154 Vertical Code Implementations (Sets A–J)
**Source:** `docs/execution-prompts/UNIMPLEMENTED_TASKS.md`  
**Governance:** Milestone 9–11 delivery  
**Files:** `apps/api/src/routes/verticals/` (124 files exist for pre-M9 verticals; 154 new ones needed)

All 154 vertical implementations from Sets A–J have complete execution prompts written and ready. None have been implemented in code. Each vertical requires:
- D1 migration for the vertical's sector-specific tables
- Route file at `apps/api/src/routes/verticals/<slug>.ts`
- Test file at `apps/api/src/routes/verticals/<slug>.test.ts`
- FSM states, KYC tier guard, entitlement check, T3 isolation

**Sets and verticals:**
| Set | File | Count | Priority |
|---|---|---|---|
| A | webwaka_verticals_commerce_p2_batch1_execution_prompts.md | 9 | P2 |
| B | webwaka_verticals_commerce_p2_batch2_execution_prompts.md | 12 | P2 |
| C | webwaka_verticals_commerce_p3_execution_prompts.md | 15 | P3 |
| D | webwaka_verticals_transport_extended_execution_prompts.md | 8 | P2/P3 |
| E | webwaka_verticals_civic_extended_execution_prompts.md | 10 | P2/P3 |
| F | webwaka_verticals_health_extended_execution_prompts.md | 6 | P2 |
| G | webwaka_verticals_education_agricultural_extended_execution_prompts.md | 13 | P2/P3 |
| H | webwaka_verticals_professional_creator_execution_prompts.md | 11 | P2/P3 |
| I | webwaka_verticals_financial_place_media_institutional_execution_prompts.md | 13 | P2/P3 |
| J | webwaka_verticals_set_j_missing_execution_prompts.md | 28 | P2/P3 |

**Suggested execution order:** Set A (Commerce P2 Batch 1) → Set F (Health Extended) → Set D (Transport Extended) → Sets B, E, G, H, I, C, J

---

### FEAT-002 — Frontend Application (React PWA)
**Source:** `docs/reports/webwaka-implementation-audit-2026-04-11.md`, Milestone 6+  
**Governance:** P4 (Mobile First), P5 (PWA First)

No user-facing React application exists. The platform has an API and server-side rendered pages but no interactive SPA/PWA for tenants or end users. This is the largest single gap between the platform's architecture and its usability.

**Required (minimum viable):**
1. Tenant workspace app (login, dashboard, POS, offerings management)
2. Auth flows: login, registration, password reset, MFA
3. PWA shell with service worker and offline fallback
4. Mobile-first (360px base viewport)

This maps to Milestone 6 (Brand Runtime MVP) and Milestone 7 (Offline + PWA) briefs.

---

### FEAT-003 — `driving-school` Slug Deduplication in Seed CSV
**Source:** `docs/execution-prompts/UNIMPLEMENTED_TASKS.md`, Issue #5  
**File:** `infra/db/seeds/0004_verticals-master.csv`

Although `grep -c` now returns 1, the original audit flagged `driving-school` as a duplicate slug. Verify the CSV has no duplicate slugs and the unique index on `verticals.slug` would catch any future duplicates.

**Required:**
1. Run: `sort infra/db/seeds/0004_verticals-master.csv | awk -F',' '{print $2}' | sort | uniq -d` — confirm no duplicates
2. Verify the `verticals` D1 table has `UNIQUE` constraint on `slug`

---

## TIER 5 — UX / FRONTEND POLISH (Post-MVP)

These items are from `docs/enhancements/ENHANCEMENT_ROADMAP_v1.0.1.md`. They require the React frontend (FEAT-002) to exist before most can be implemented.

| ID | Item | Est |
|---|---|---|
| UX-01 | Accessibility: ARIA landmarks, roles, labels on admin dashboards | 8h |
| UX-05 | Form validation UI feedback components | 4h |
| UX-06 | Dark mode (CSS custom properties + `prefers-color-scheme`) | 6h |
| UX-07 | Responsive navigation (hamburger/bottom nav for mobile) | 6h |
| UX-08 | USSD menu depth reduced to max 3 levels (`apps/ussd-gateway`) | 4h |
| UX-09 | Error recovery guidance (friendly error pages with retry) | 4h |
| UX-10 | Confirmation dialogs for destructive actions | 2h |
| UX-12 | Breadcrumb navigation | 3h |
| UX-13 | Toast notification system | 3h |
| UX-14 | Discovery card design (search result cards) | 4h |

---

## TIER 6 — PERFORMANCE / ARCHITECTURE OPTIMIZATIONS

Items from Enhancement Roadmap that improve quality but do not block function.

| ID | Item | Est |
|---|---|---|
| ARC-14 | Dependency injection for external services (replace direct imports) | 8h |
| ARC-16 | Event replay documentation for `webhook_events` table | 2h |
| ARC-18 | Service worker cache auto-versioning (cache-bust on deploy) | 2h |
| PERF-05 | Full-text search (FTS5) for template registry | 4h |
| PERF-07 | Static asset generation from service worker | 2h |
| PERF-09 | Lazy vertical loading (split vertical bundles) | 6h |
| PERF-10 | ETag support for discovery endpoints | 4h |
| PERF-11 | D1 batch query optimization (reduce round-trips) | 4h |
| QA-12 | Visual regression tests using screenshot comparison | 6h |
| QA-07 | Load testing infrastructure (k6 or Artillery) | 8h |

---

## Summary by Tier

| Tier | Items | Estimated Code Hours |
|---|---|---|
| 🔴 CRITICAL | 3 | ~8h |
| 🟠 HIGH | 10 | ~180h |
| 🟡 MEDIUM | 15 | ~112h |
| 🔵 MAJOR FEATURE | 3 | ~600h (verticals alone) |
| 🟢 UX POLISH | 10 | ~44h |
| ⚪ PERF/ARCH | 10 | ~44h |
| **TOTAL** | **51 tracked items** | **~988h** |

> **Note:** The 154 vertical implementations (FEAT-001) represent ~500h of the Major Feature total alone. Each vertical averages 3–4 hours (migration + route + tests).

---

## What Was Confirmed DONE (Not in this backlog)

The following items appeared in source documents as gaps but are verified IMPLEMENTED in the current codebase:

| Item | Source | Evidence |
|---|---|---|
| SEC-001: Admin-dashboard auth middleware | Governance Remediation Plan | `apps/admin-dashboard/src/index.ts` |
| SEC-002: Platform-admin claims auth | Governance Remediation Plan | `apps/platform-admin/src/routes/claims.ts` |
| ENT-001: Entitlement middleware for verticals | Governance Remediation Plan | `apps/api/src/index.ts` L188/415/425 |
| ENT-002: AI entitlement on SuperAgent | Governance Remediation Plan | `packages/superagent/src/middleware.ts` |
| AI-001: HITL tables | Governance Remediation Plan | Migration `0194_ai001_hitl_tables.sql` |
| CI-001: Governance CI checks (10 scripts) | Governance Remediation Plan | `scripts/governance-checks/` + `ci.yml` L77-111 |
| CI-002: Frozen lockfile enforcement | Governance Remediation Plan | `ci.yml` L29/44/59/74/89 |
| CI-003: Migration rollback CI check | Governance Remediation Plan | `ci.yml` L100-101 |
| Negotiation tables (0181–0185) | Implementation Audit | `infra/db/migrations/` |
| renderAttribution in brand-runtime | 3-in-1 plan | `apps/brand-runtime/src/templates/base.ts:152` |
| WakaCU wallet D1 table | Partner model | Migration `0043_wc_wallets_transactions.sql` |
| Claim lifecycle stages (Branded/Monetized/Delegated) | Deep audit | `packages/claims/src/state-machine.ts:28-31` |
| DOC-012: Execution prompt pillar labels | 3-in-1 plan | 29 matches in prompt files |
| DOC-014: Africa-First expansion note | 3-in-1 plan | `docs/governance/core-principles.md:50-51` |
| Partner model Phases 1+2 | Partner model | `apps/api/src/routes/partners.ts` |
| compliance-dashboard.md | Governance Remediation Plan | `docs/governance/compliance-dashboard.md` |
| secrets-rotation-log.md | Governance Remediation Plan | `infra/cloudflare/secrets-rotation-log.md` |

---

*Last audit: 2026-04-13 — Verified against live codebase (`staging` branch HEAD)*  
*Auditor: WebWaka Agent*  
*Next recommended audit: After Milestone 9 delivery*
