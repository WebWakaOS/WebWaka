# WebWaka OS — Phase 0 Current-State Assessment

**Conducted by:** Emergent Agent  
**Date:** 2026-05-03  
**Branch:** `staging`  
**Commit baseline:** `e2c33a7d` (Add policy engine dependency and update project overview documentation)  
**Method:** Full repo clone, exhaustive file-by-file review across all 13 apps, 212 packages, 543+ migrations, all governance docs, all CI/CD workflows, and all prior audit artifacts.  
**Status:** AUTHORITATIVE — supersedes all prior summary documents for Phase 0 purposes.

---

## 1. Executive Summary

WebWaka OS is a **Nigeria-first, Africa-ready, multi-tenant, white-label, 3-in-1 SaaS platform** deployed on Cloudflare Workers infrastructure. The platform has achieved a substantial and genuine level of completeness on the backend. The staging environment is live and CI-green. Production is not yet deployed (awaiting DNS cutover and ops gate sign-off).

The platform is **pre-launch, which makes this Master Refactor program maximally safe** — there are no real users, no live revenue, and no breaking-change risk from even aggressive refactors.

### Bottom Line

| Dimension | Status | Detail |
|---|---|---|
| Backend API | ✅ Mature | 96,789 lines, 543+ migrations, 10+ route groups |
| Test coverage | ✅ Strong | 2,751+ tests, 108 QA TC-IDs, comprehensive E2E |
| CI/CD | ✅ Green | 17 workflows, all checks passing on staging |
| Governance | ✅ Strong | NDPR, CBN KYC, 15/15 governance checks |
| Control plane | ✅ Implemented | Dynamic plans/entitlements/roles/flags/delegation |
| SuperAgent AI | ✅ Functional | Agent loop, HITL, consent, credit burning |
| Staging deploy | ✅ Live | api-staging.webwaka.com confirmed green |
| Production deploy | 🔴 Pending | Ops gates G1–G9 remain; ops/founder action needed |
| Frontend UX | ⚠️ Mixed | workspace-app is mature; admin-dashboard/platform-admin are shells |
| Vertical packages | ⚠️ Exploded | 175 individual vertical packages; engine migration incomplete |
| Auth-tenancy package | 🔴 Stub | `packages/auth-tenancy/src` = `export {}` (dead stub) |
| POS entitlement gates | ⚠️ Missing | Forensic audit confirms 20+ POS routes lack `requireLayerAccess` |
| Platform admin UI | ⚠️ Static HTML | `apps/platform-admin` = Node.js dev shim + vanilla HTML files |

---

## 2. Platform Identity

### 2.1 Core Model

WebWaka is a **3-in-1 platform** (not three separate products):

| Pillar | Name | Runtime | Reality |
|--------|------|---------|---------|
| **Pillar 1** | Operations-Management (POS) | `apps/api`, `apps/ussd-gateway` | ✅ Fully implemented. POS, float ledger, products, sales, refunds, analytics, customers, USSD |
| **Pillar 2** | Branding / Website / Portal | `apps/brand-runtime` | ✅ Implemented. Template registry, white-label depth, blog, shop, portal, brand-runtime Worker |
| **Pillar 3** | Listing / Multi-Vendor Marketplace | `apps/public-discovery`, `apps/discovery-spa` | ✅ Implemented. Seeded entity directories, geography search, claim-first onboarding. Dual-surface issue |
| **Cross-cutting** | AI / SuperAgent | `packages/superagent`, `packages/ai-abstraction` | ✅ Functional. Agent loop, tool registry, HITL, consent, NDPR, BYOK |

### 2.2 Deployment Model

```
GitHub (staging branch) → GitHub Actions CI → Cloudflare Workers (staging env)
GitHub (main branch) → GitHub Actions CI → Cloudflare Workers (production env) [PENDING]
```

**Workers deployed (confirmed staging):**
1. `webwaka-api-staging` → `api-staging.webwaka.com`
2. `webwaka-brand-runtime-staging` → `staging.webwaka.com`
3. `webwaka-public-discovery-staging` → `discovery-staging.webwaka.com`
4. `webwaka-workspace-app` → Cloudflare Pages
5. `webwaka-partner-admin` → Cloudflare Pages / Worker
6. `webwaka-discovery-spa` → Cloudflare Pages
7. `webwaka-notificator-staging` → Queue consumer
8. `webwaka-projections-staging` → CRON worker
9. `webwaka-schedulers-staging` → CRON worker
10. `webwaka-ussd-gateway-staging` → `ussd-staging.webwaka.com`
11. `webwaka-log-tail` → Tail worker for structured log drain

---

## 3. Technology Stack (confirmed)

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Runtime | Cloudflare Workers | — | Edge compute, no cold starts |
| HTTP framework | Hono | Latest | ADR-0015 |
| Language | TypeScript | 5.x | ADR-0006 |
| Database | Cloudflare D1 (SQLite) | — | ADR-0013 |
| KV store | Cloudflare KV | — | Sessions, rate limits, feature flags, geo cache |
| Object storage | Cloudflare R2 | — | Assets, DSAR exports |
| Message queue | Cloudflare Queues | — | Notification pipeline |
| Package manager | pnpm workspaces | 9.x | Monorepo |
| Test framework | Vitest | 1.x | Unit + integration |
| E2E tests | Playwright | 1.49 | API E2E + visual |
| Load tests | k6 | — | Staging smoke |
| Frontend framework | React 18 + Vite | — | workspace-app, discovery-spa, partner-admin-spa |
| PWA | Service Worker + Dexie.js | — | Offline-first |

---

## 4. Database State (D1)

- **Staging D1:** `webwaka-staging` (ID: `52719457-5d5b-4f36-9a13-c90195ec78d2`)
- **Production D1:** `webwaka-production` (ID: `72fa5ec8-52c2-4f41-b486-957d7b00c76f`)
- **Migrations:** 543 forward migrations in `apps/api/migrations/`; mirror set in `infra/db/migrations/`
- **Schema scope:** Users, auth, tenants, workspaces, subscriptions, profiles, entities, geography, political, POS, payments, AI, notifications, templates, partners, community, social, groups, fundraising, USSD, wallets, B2B, verticals, control-plane (dynamic plans/roles/flags)
- **Seed data:** Nationwide Nigerian entity seeding (OSM, GRID3, INEC, NEMIS, regulatory bodies)

---

## 5. What Is Strong and Should Be Retained

### 5.1 Core API Backend
- `apps/api` with Hono routing is clean, well-structured, and mature
- 10 route groups (ARC-07 decomposition) with clear domain separation
- Comprehensive middleware: auth, CSRF, rate limiting (IP + tier), audit logging, correlation IDs, entitlement, billing enforcement, locale
- T3 tenant isolation enforced at every query layer
- All monetary values in integer kobo (P9 invariant enforced)
- JWT authentication with PBKDF2 password hashing

### 5.2 Control Plane (Track 2 foundation is COMPLETE)
- `packages/control-plane` — full `PlanCatalogService`, `EntitlementEngine`, `PermissionResolver`, `FlagService`, `DelegationGuard`, `AuditService`
- Migrations 0464–0472: 20 new dynamic config tables, 370+ seeded entitlement bindings
- All 7 PLAN_CONFIGS plans seeded into DB as source of truth
- KV caching with 3-tier cache scheme (flag: 5s kill-switch, 60s resolved, 120s definition)
- API routes at `/platform-admin/cp/*` for super_admin management
- This is a major implemented strength. Most SaaS platforms hardcode these for years.

### 5.3 SuperAgent AI (Track 3 foundation is COMPLETE)
- `packages/superagent`: full agent loop, multi-turn sessions, streaming support
- Tool registry with 13+ tools (create-booking, create-invoice, customer-lookup, inventory-check, etc.)
- HITL (Human-in-the-Loop) service for regulated verticals
- Compliance filter with NDPR + CBN + sector-specific rules
- Credit burning with spend controls and budgets
- Partner credit pool service (wholesale credits)
- BYOK key service (workspace + user level)
- Consent service (NDPR gate before AI task submission)
- Prompt management with customizable system prompts

### 5.4 Governance and Compliance
- 15 CI governance checks covering: CORS, tenant isolation, AI direct calls, monetary integrity, dependency sources, rollback scripts, pillar prefixes, PWA manifests, NDPR-before-AI, geography integrity, vertical registry, webhook signing, secret rotation, rollback dir guard, migration SQL syntax, correlation ID, security baseline, notification sandbox
- NDPR consent lifecycle (CBN KYC tiers T0–T3)
- Audit trail on all mutations
- DSAR export workflow
- IP masking in logs

### 5.5 Testing Infrastructure
- 2,751+ tests across 181+ files
- 108 QA TC-IDs fully traced in `CONTRADICTION_SCAN.md`
- Cycle-01 through Cycle-09 test execution plan
- Property-based tests (currency round-trip), chaos tests (KV fail-open), fuzz tests (price-lock), atomicity failure injection
- Visual regression baseline workflow

### 5.6 Vertical Engine
- `packages/vertical-engine`: CRUD, FSM, route generator, parity testing framework
- Configuration-driven architecture (vs. per-package code duplication)
- Parity tests prove engine matches legacy per-package implementations
- Expansion patterns documented

### 5.7 USSD Gateway
- `apps/ussd-gateway`: fully functional USSD menu tree
- 5-branch main menu: balance, send money, airtime, transactions, manage account
- Session persistence, rate limiting, tenant scoping
- Telegram integration for bot-based USSD alternative
- Nigeria-first design (any phone, any network, no internet required)

### 5.8 Offline-First PWA
- `packages/offline-sync`: Dexie.js IndexedDB, SyncEngine, conflict resolution (server-wins)
- Service workers in workspace-app, admin-dashboard, partner-admin
- FIFO queue, network error handling, 66 offline-sync tests

### 5.9 Nigeria / Africa Data Foundation
- Nationwide entity seeding: political (senators, reps, governors, state assemblies, polling units), health (GRID3 PHC data for all 36 states), education (NUC universities), regulated entities (CBN, NCC, NAICOM, SEC, NUPRC), OSM-sourced commercial entities
- Geography hierarchy: Zones → States → LGAs → Wards (774 LGAs, 8,809 wards)
- Multi-currency fields with NGN-first kobo standard

---

## 6. What Exists But Needs Improvement

### 6.1 Workspace App Frontend
- Functional but uses inline CSS objects everywhere (no design system integration)
- No dark mode support
- Limited mobile responsiveness in complex pages (POS, analytics)
- Missing some keyboard navigation / accessibility (ARIA labels present but incomplete)
- No formal i18n string coverage (t() called but many strings still hardcoded in English)

### 6.2 Discovery SPA
- `apps/discovery-spa`: new Vite/React app with 6 pages (Home, Search, Profile, Category, GeoDetail, InPlace)
- Basic implementation — listing cards, pagination, basic search
- Needs: offline caching, map integration, advanced filtering, mobile-first polish

### 6.3 Partner Admin SPA
- `apps/partner-admin-spa`: 8 pages (Overview, Branding, Credits, Notifications, Onboarding, Settlements, SubPartners, Login)
- Functional but minimal UX
- Needs: better charts, analytics, sub-partner drill-down

### 6.4 Notification Pipeline
- Templates and rules seeded, consumer implemented
- WhatsApp template management UI is basic
- No real-time inbox push (polling only)
- Missing: retry visibility, DLQ management UI

### 6.5 SuperAgent Frontend
- `apps/workspace-app/src/pages/AI.tsx` exists
- Multi-turn chat UI present
- Needs: tool-use visualization, HITL approval UI improvement, streaming indicator

---

## 7. What Should Be Refactored

### 7.1 POS Entitlement Gates (CRITICAL)
- **Finding from forensics report (2026-04-25):** 20+ POS routes in `apps/api/src/routes/pos.ts` and `pos-business.ts` are missing `requireLayerAccess` calls. All routes have JWT auth but do NOT gate on Pillar 1 layer subscription.
- **Impact:** Free-plan tenants can currently access POS functionality without an active commerce subscription.
- **Fix:** Apply `requireEntitlement('pos')` or equivalent layer check to all POS route handlers via the `workspace-entitlement-context.ts` middleware.

### 7.2 Router and Route Group Boundaries
- Route groups are decomposed (ARC-07) but several route files have grown very large
- `apps/api/src/routes/workspaces.ts` is 812 lines and handles too many concerns
- `apps/api/src/routes/wakapage.ts` is 1012 lines
- Some cross-cutting concerns (audit logging, rate limiting) applied inconsistently across route groups

### 7.3 Vertical Package Architecture
- 175 `@webwaka/verticals-*` packages represent massive duplication
- `packages/vertical-engine` provides a configuration-driven alternative — migration is in progress
- Legacy individual packages will coexist with vertical-engine until parity is proven
- Migration strategy: Engine absorbs verticals in batches as parity tests pass

### 7.4 Duplicate/Overlapping App Surfaces
- `apps/admin-dashboard` (old Hono Worker shell) vs. actual admin UI
- `apps/platform-admin` (Node.js dev shim serving static HTML) — needs to become a proper CF Pages app
- `apps/partner-admin` (old Hono Worker) vs. `apps/partner-admin-spa` (new Vite SPA) — dual implementations
- `apps/public-discovery` (old SSR Worker) vs. `apps/discovery-spa` (new Vite SPA) — dual surfaces for Pillar 3

### 7.5 ESLint Warnings (238)
- 238 ESLint warnings in `apps/api` (primarily explicit-function-return-type and no-console)
- Should be reduced to < 20 or all explicitly acknowledged

---

## 8. What Should Be Re-Architected

### 8.1 Platform Admin UI
- **Current state:** `apps/platform-admin/public/index.html` + `control-plane.html` + `wallet.html` = vanilla JavaScript HTML pages served by a Node.js dev shim
- **Problem:** Not a real admin application. No React. No state management. No reusable components. Cannot be deployed to Cloudflare Workers/Pages in this form.
- **Target:** Migrate to a proper React/Vite SPA (like workspace-app architecture) that consumes all existing control-plane APIs (`/platform-admin/cp/*`), adds admin-level analytics, pilot management, and super_admin operations.

### 8.2 Admin Dashboard
- **Current state:** `apps/admin-dashboard/src/index.ts` = single Cloudflare Worker serving HTML shell. Only two React components exist (`AIUsageChart.tsx`, `ErrorRateChart.tsx`). The rest is a placeholder.
- **Problem:** Operators have no functional admin dashboard to manage the platform.
- **Target:** Merge platform-admin and admin-dashboard into a single, cohesive React SPA admin application deployed as Cloudflare Pages.

### 8.3 Auth-Tenancy Package
- **Current state:** `packages/auth-tenancy/src/` contains only `.gitkeep` + `export {}` — a complete stub
- **Problem:** The ARCHITECTURE.md references this as the canonical tenant identity/access control package, but it does nothing.
- **Resolution options:** (1) Delete the stub and update all references to point to `packages/auth` directly, OR (2) Implement the tenancy primitives (tenant resolution, tenant context, tenant isolation helpers) in this package as planned.

---

## 9. What Should Be Deprecated or Removed

### 9.1 `apps/tenant-public`
- Legacy public tenant profile pages (just an `index.ts` stub)
- Superseded by `apps/brand-runtime` (Pillar 2)
- Should be deprecated and eventually removed

### 9.2 `.bak` Migration Files
- `apps/api/migrations/0306_political_polling_units_seed.sql.bak`, `0307_*.bak`, `0308_*.bak`, `0309_*.bak`
- These are `.bak` files in the forward migrations directory
- Not picked up by Wrangler but create noise and governance confusion
- Should be removed or moved to `infra/db/migrations/bak/`

### 9.3 Old Partner-Admin Worker
- `apps/partner-admin` (old Hono Worker + vanilla HTML) is superseded by `apps/partner-admin-spa`
- Once `partner-admin-spa` is complete and deployed, the old worker can be retired

### 9.4 Old Public-Discovery Worker
- `apps/public-discovery` (SSR Worker) will eventually be superseded by `apps/discovery-spa`
- Keep both during transition; deprecate SSR worker once SPA is feature-complete

### 9.5 `packages/support-groups`
- Renamed to `packages/groups` (migration 0432 confirms the DB rename)
- Package still exists under both names — cleanup needed

---

## 10. Critical Gaps and Bottlenecks

| Gap | Severity | Impact | Reference |
|-----|----------|--------|----------|
| POS entitlement gates missing | 🔴 HIGH | Free plan users can access paid POS features | Forensics 2026-04-25 §2.1 |
| auth-tenancy is a stub | 🔴 HIGH | Undefined dependency in ARCHITECTURE.md creates confusion | `packages/auth-tenancy/src/` |
| platform-admin is static HTML | 🔴 HIGH | No real admin UI for super_admin operations | `apps/platform-admin/` |
| admin-dashboard is a shell | 🔴 HIGH | Platform operators have no usable admin UI | `apps/admin-dashboard/src/` |
| Vertical package explosion | 🟠 MEDIUM | 175 packages create maintenance overhead; engine migration incomplete | `packages/verticals-*/` |
| Dual public-discovery surfaces | 🟠 MEDIUM | `apps/public-discovery` + `apps/discovery-spa` both exist, unclear priority | — |
| Dual partner-admin surfaces | 🟠 MEDIUM | `apps/partner-admin` + `apps/partner-admin-spa` both exist | — |
| 238 ESLint warnings | 🟡 LOW | Noise in CI; may hide real issues | `apps/api/` |
| SMOKE_API_KEY not provisioned | 🟡 LOW | k6 smoke test cannot authenticate; continues with error | HANDOVER.md §3b |
| Production never deployed | 🟡 LOW (pre-launch) | Ops gates G1–G9 pending founder/engineering action | WAVE4_CHECKLIST.md |

---

## 11. Invariants to Never Violate (Platform Invariants)

All refactors MUST preserve these:

| Code | Invariant | Where enforced |
|------|-----------|----------------|
| T3 | tenant_id derived from JWT only, never from request body/params | `apps/api/src/middleware/auth.ts` |
| T4 | All monetary operations are atomic | `apps/api/src/routes/payments.ts`, wallets |
| P9 | All monetary values are integer kobo | Governance check script |
| G23 | NDPR hard delete — no soft-delete fallback | `apps/api/src/routes/compliance.ts` |
| G24 | Staging always has `NOTIFICATION_SANDBOX_MODE=true` | Governance check script |
| P6 | No raw PII (BVN/NIN) in logs or API responses | `apps/api/src/middleware/auth.ts` |
| P7 | No direct AI provider calls — always via `@webwaka/ai-abstraction` | Governance check script |
| SEC-009 | `/internal/projections/rebuild` requires X-Inter-Service-Secret | `apps/projections/src/index.ts` |
| W1 | Paystack webhook HMAC must be verified | `apps/api/src/routes/payments.ts` |
| ARC-17 | Fail open on KV unavailability (never block on KV) | Rate limit middleware |

---

## 12. Evidence of Prior Work Quality

The following confirms the platform has been built with care and intentionality:
- 543+ migrations all with rollback scripts and idempotent `IF NOT EXISTS` / `OR IGNORE`
- KI-001, KI-002 from CONTRADICTION_SCAN resolved by Sprint 4
- All 108 TC-IDs fully traced (zero untraced)
- PRODUCTION_READINESS_BACKLOG.md shows all C-1 through L-12 items marked RESOLVED
- FlagService 3-tier KV caching prevents extra D1 reads on every request
- Multiple chaos and property-based tests prove resilience at boundaries
- PilotFlagService → FlagService bridge completed cleanly

---

## 13. Launch Readiness Summary

**Staging is green.** The platform is technically ready to launch on the backend.

**Remaining blockers (ops + code):**
1. Provision 11 Cloudflare secrets + 13 GitHub Actions secrets (founder action)
2. Apply migrations 0001–0463 to production D1 (engineering action)
3. DNS cutover: `api.webwaka.com` + `webwaka.com` + subdomains (founder + engineering)
4. Fix POS entitlement gates (code change)
5. Replace static platform-admin HTML with real admin UI (code change — major)
6. Complete Wave 2 frontend rebuild before public launch (UX quality gate)

---

*This document is authoritative for Phase 0. All refactor decisions in subsequent phases must reference it as the baseline.*
