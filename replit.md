# WebWaka OS

## Overview

WebWaka OS is a multi-tenant, multi-vertical, white-label SaaS platform operating system for Africa, starting with Nigeria. It follows a governance-driven monorepo architecture with "Offline First," "Mobile First," and "Nigeria First" as core principles.

**Current State: Phase 20 COMPLETE + P21–P25 fully implemented — TypeScript 0 errors, all governance checks green**
**Backlog tracking: `docs/ops/implementation-plan.md` — phases P1–P25 defined**

### Phase Progress (docs/ops/implementation-plan.md)
| Phase | Status |
|-------|--------|
| Phase 1 — Critical Infrastructure | ✅ COMPLETE |
| Phase 2 — Foundation | ✅ COMPLETE |
| Phase 3 — Test Coverage Sprint | ✅ COMPLETE |
| Pre-Phase 4 QA Audit | ✅ COMPLETE (11 bugs fixed) |
| Phase 4 — Platform Production Quality | ✅ COMPLETE (669 → 737 API tests) |
| Phase 5 — Partner Platform Phase 3 | ✅ COMPLETE (914 total tests) |
| Phase 6 — Admin Platform Features | ✅ COMPLETE |
| Phase 7 — Architecture Hardening | ✅ COMPLETE (ARC-07: router.ts split from index.ts) |
| Phase 8 — Verticals Wave 1 | ✅ COMPLETE |
| Phase 9 — Commerce Verticals P2 | ✅ COMPLETE |
| Phase 10 — Commerce Verticals P3 (Sets H, I) | ✅ COMPLETE (24 verticals, 230 tests) |
| Phase 11 — Full API Test Coverage | ✅ COMPLETE (164 test files, 2305 tests) |
| Phase 12 — React PWA Frontend | ✅ COMPLETE (apps/workspace-app — React 18 + Vite + TypeScript strict + PWA) |
| Phase 13 / BUG-004 — Vertical AI Advisory Upgrade | ✅ COMPLETE (10 verticals, aiConsentGate pattern, 2321 tests) |
| Phase 14 — Load Testing + UX Polish + Performance | ✅ COMPLETE (k6 suite, ETag middleware, FTS5 migration, PWA service worker) |
| Phase 15 — Seed CSV Dedup + Final Gov Audit | ✅ COMPLETE (0 duplicates, UNIQUE constraint, 11/11 governance) |
| Phase 16 QA Audit — Comprehensive E2E Verification | ✅ COMPLETE (9 bugs fixed, 11/11 governance, 2328 tests) |
| Phase 17 — Sprint 14 Final Open Items | ✅ COMPLETE (MON-05 API, UX bundle, PERF-11, ARC-18, QA-12, docs — 2365 tests) |
| Phase 18 — P18 Execution Checklist | ✅ COMPLETE |
| Phase 19 — QA Audit + Edge Cases | ✅ COMPLETE (2416 tests, 10 bugs fixed) |
| Phase 20 — Workspace Invitations + Session Mgmt + Email Verification | ✅ COMPLETE (2452 tests) |
| Phase 21 — Bank Transfer Default Payment (P21) | ✅ COMPLETE (FSM routes + migrations 0237-0239 + email verification enforcement) |
| Phase 22 — AI SuperAgent Production (P22) | ✅ COMPLETE (ai_spend_events recording + budget warning notifications + HITL expiry CRON) |
| Phase 23 — Analytics Dashboard (P23) | ✅ COMPLETE (workspace analytics routes + analytics_snapshots migration 0242) |
| Phase 24 — Multi-Currency Foundation (P24) | ✅ COMPLETE (FX rates routes + migrations 0243-0245 + fr locale) |
| Phase 25 — B2B Marketplace (P25) | ✅ COMPLETE (RFQ/bid/PO/invoice/dispute/trust routes + migrations 0246-0250) |

## Milestone Status

| Milestone | Status |
|---|---|
| 0 — Program Setup | ✅ DONE |
| 1 — Governance Baseline | ✅ DONE |
| 2 — Monorepo Scaffolding | ✅ DONE (0 errors across 201+ packages) |
| 3–8 — API, Discovery, Claims, Commerce, Community, Verticals | ✅ DONE (132 route files, 132 test files, 227 migrations) |
| Governance Remediation (Phases 0–4) | ✅ COMPLETE — 48/48 items |
| 10 — Staging Hardening | ✅ COMPLETE — 9/9 tasks done |
| 11 — Partner & White-Label | ✅ COMPLETE — 7/7 tasks done |
| 12 — AI Integration (Production) | ✅ COMPLETE — 10/10 tasks done |
| 13 — Production Launch | ✅ COMPLETE — v1.0.0 |
| v1.0.1 — Foundation + Template Architecture | ✅ COMPLETE |
| 9 — Vertical Scaling | ✅ COMPLETE |
| M9–M12 QA Hardening | ✅ COMPLETE — 164 test files, 2305 tests, 11/11 governance checks |
| Full Comprehensive QA Audit | ✅ COMPLETE — 6 bugs fixed, 22 routes restored, all governance green |
| Phase 16 E2E QA Audit | ✅ COMPLETE — 9 additional fixes, 11/11 governance, 2328/2328 tests |
| Phase 17 Sprint 14 | ✅ COMPLETE — MON-05 (7 billing routes), UX-05/06/09/10/12/13, ARC-18, PERF-11, QA-12, DEV-07/ARC-09/ARC-16 docs, 2365/2365 tests |
| Phase 18 P18 Checklist | ✅ COMPLETE — AUTH-001–008 + QA-18-001–007 all fixed; ResetPassword.tsx added; change-password endpoint live; 2402/2402 tests |
| Phase 19 P19 Checklist | ✅ COMPLETE + QA pass — P19-A email via Resend (password-reset template); P19-B profile save (PATCH /auth/profile + workspace name + phone format validation); P19-C server logout (POST /auth/logout + KV blacklist); P19-D Playwright E2E suite (auth-flows.e2e.ts); P19-E free-plan upgrade banner; P19-F tenants table (migration 0230); 2416/2416 tests (QA: fixed phone validation, batch mock 2→3, AUT-005 smoke test shape, dead-code condition, 5 new edge-case tests) |

## Platform Scale

| Metric | Count |
|--------|-------|
| Apps | 9 (api, platform-admin, admin-dashboard, partner-admin, brand-runtime, public-discovery, ussd-gateway, tenant-public, projections) |
| Packages | 203 (all with pillar prefixes) |
| Verticals | 159 registry entries, 159 packages |
| Vertical route files | 132 (all mounted — BUG-005/BUG-006 fixed in QA audit) |
| Vertical test files | 132 (1:1 perfect balance with routes) |
| D1 migrations | 231 (all with rollback scripts — 0230 adds tenants table P19-F) |
| API tests (apps/api) | 2416 (167 test files, 0 failures — auth-routes.test.ts: 49 tests incl. phone validation, field clearing, constraint test; api.test.ts AUT-005 shape fix) |
| Phone-repair-shop package tests | 15 (packages/verticals-phone-repair-shop) |
| CI governance checks | 12 (all 12 PASS — check-api-versioning.ts added in P18-E) |
| Geography seeds | 774 LGAs, 37 states, 6 zones |
| k6 load test scripts | 3 (billing, negotiation, geography — tests/k6/) |
| Platform version | 1.0.1 |

## Comprehensive QA Audit — Bug Log (April 2026)

### FIXED BUGS

| ID | Severity | Description | File |
|----|----------|-------------|------|
| BUG-001 | CRITICAL | Migration 0087 used wrong table (`phone_accessories_stock`), wrong columns (`cac_or_trade_number`, `location_cluster`), missing job statuses (`diagnosing`, `awaiting_parts`), wrong column name (`fault` → `fault_description`) | `infra/db/migrations/0087_vertical_phone_repair_shop.sql` |
| BUG-002 | MEDIUM | TypeScript non-null assertion on `advisory_data[0]` without type guard in test | `apps/api/src/routes/verticals/phone-repair-shop.test.ts:166` |
| BUG-003 | HIGH | Rollback script dropped wrong table (`phone_accessories_stock` instead of `phone_repair_parts`) | `infra/db/migrations/0087_vertical_phone_repair_shop.rollback.sql` |
| BUG-004 | LOW | 10 verticals use old `/ai/prompt` stub pattern without `aiConsentGate` (all `planned` status, no PII processing yet) — fix in Phase 13 | `abattoir`, `agro-input`, `cassava-miller`, `cocoa-exporter`, `cold-room`, `creche`, `fish-market`, `food-processing`, `palm-oil`, `vegetable-garden` |
| BUG-005 | CRITICAL | 8 route files never mounted in any aggregator router — completely unreachable in production | `ngo`, `sole-trader`, `road-transport-union`, `produce-aggregator`, `community-radio`, `insurance-agent`, `savings-group`, `tech-hub` |
| BUG-006 | CRITICAL | `verticals-edu-agri-extended.ts` (14 routes) never imported or mounted in `router.ts` — all 14 routes unreachable | `apps/api/src/router.ts`, `verticals-edu-agri-extended.ts` |
| SCRIPT-001 | LOW | `check-ndpr-before-ai.ts` checked `index.ts` instead of `router.ts` (stale after ARC-07 split) | `scripts/governance-checks/check-ndpr-before-ai.ts` |
| SCRIPT-002 | LOW | `check-pillar-prefix.ts` didn't accept `[Infra/Pillar N]` hybrid prefix format | `scripts/governance-checks/check-pillar-prefix.ts` |
| AUTH-001 | CRITICAL | `POST /auth/register` missing — workspace-app register page returned 404; implemented self-service tenant+workspace+user creation with PBKDF2-600k | `apps/api/src/routes/auth-routes.ts` |
| AUTH-002 | MEDIUM | `POST /auth/forgot-password` missing — password reset initiation broken; implemented with KV TTL storage | `apps/api/src/routes/auth-routes.ts` |
| AUTH-003 | MEDIUM | `POST /auth/reset-password` missing — password reset completion broken; implemented with KV token validation | `apps/api/src/routes/auth-routes.ts` |
| AUTH-004 | HIGH | `/auth/login` returned `{ token }` only; frontend expected `{ token, user }` — user was always undefined after login until page refresh | `apps/api/src/routes/auth-routes.ts` |
| AUTH-005 | HIGH | `/auth/me` returned `{ data: { userId } }` (nested, wrong field names); frontend expected `{ id, email, tenantId, role }` — tenantId always showed `—` | `apps/api/src/routes/auth-routes.ts` |
| AUTH-006 | HIGH | `tryRefresh` sent token in POST body — `/auth/refresh` reads from Authorization header; refresh always failed causing immediate re-login on any 401 | `apps/workspace-app/src/lib/api.ts` |
| AUTH-007 | MEDIUM | `setRefreshToken(res.refreshToken)` stored literal string `"undefined"` in localStorage on login (refreshToken didn't exist in response) | `apps/workspace-app/src/contexts/AuthContext.tsx` |
| AUTH-008 | MEDIUM | `LoginResponse` type declared non-existent `refreshToken` field; `LoginResponse['user']` missing `workspaceId` needed by Dashboard/Offerings/POS | `apps/workspace-app/src/lib/api.ts` |
| WS-001 | HIGH | Dashboard used hardcoded `DEMO_STATS` — no real data; connected to `/billing/status` + `/pos-business/sales/:workspaceId/summary` | `apps/workspace-app/src/pages/Dashboard.tsx` |
| WS-002 | HIGH | Offerings used `setTimeout` stub for save/delete/toggle — data not persisted; connected to `/pos-business/products` CRUD | `apps/workspace-app/src/pages/Offerings.tsx` |
| WS-003 | HIGH | POS used `DEMO_PRODUCTS` + `setTimeout` for checkout — no real transactions; connected to `/pos-business/products` load + `/pos-business/sales` | `apps/workspace-app/src/pages/POS.tsx` |
| COVERAGE-001 | HIGH | `auth-routes.ts` had zero test coverage; added `auth-routes.test.ts` with 36 tests (login, register, me, refresh, verify, forgot-password, reset-password, change-password, NDPR erasure) | `apps/api/src/routes/auth-routes.test.ts` |
| QA-18-001 | CRITICAL | No `ResetPassword.tsx` page existed — email reset link hit 404; user had no way to complete the reset flow | `apps/workspace-app/src/pages/ResetPassword.tsx` (new), `App.tsx` |
| QA-18-002 | HIGH | No rate limit on `POST /auth/register` — open to spam account creation | `apps/api/src/router.ts` (added 5/15min limit) |
| QA-18-003 | HIGH | No rate limit on `POST /auth/forgot-password` — KV could be flooded | `apps/api/src/router.ts` (added 5/15min limit) |
| QA-18-004 | MEDIUM | `ForgotPassword.tsx` said "expires in 15 minutes" but backend TTL is 3600s (1 hour) | `apps/workspace-app/src/pages/ForgotPassword.tsx` |
| QA-18-005 | MEDIUM | Settings "Change password" form called a `setTimeout` stub — no API call made; no `POST /auth/change-password` endpoint existed | `apps/api/src/routes/auth-routes.ts`, `apps/workspace-app/src/pages/Settings.tsx` |
| QA-18-006 | LOW | `/offerings/new` route rendered the list view without opening the "Add offering" modal | `apps/workspace-app/src/pages/Offerings.tsx` (checks location.pathname) |
| QA-18-007 | LOW | Settings "Sign out of all devices" label was misleading (only clears localStorage) | `apps/workspace-app/src/pages/Settings.tsx` (label corrected) |
| P19-A | HIGH | `POST /forgot-password` generated tokens but never sent emails; `password-reset` template missing from EmailService | `apps/api/src/lib/email-service.ts` (template added), `apps/api/src/routes/auth-routes.ts` (EmailService wired) |
| P19-B | HIGH | Settings profile "Save changes" was a setTimeout stub; no `PATCH /auth/profile` endpoint; GET /auth/me returned only 5 fields | `apps/api/src/routes/auth-routes.ts` (PATCH /auth/profile + extended GET /auth/me), `apps/workspace-app/src/pages/Settings.tsx`, `apps/workspace-app/src/lib/api.ts` |
| P19-C | HIGH | No server-side logout; token blacklisting only happened on refresh; client just cleared localStorage | `apps/api/src/routes/auth-routes.ts` (POST /auth/logout + KV blacklist + session cleanup), `apps/workspace-app/src/contexts/AuthContext.tsx` (async logout), `apps/workspace-app/src/lib/api.ts` |
| P19-D | MEDIUM | No Playwright E2E tests for reset-password page, forgot-password flow, change-password, or NDPR erasure UI | `tests/e2e/workspace/auth-flows.e2e.ts` (new — 18 tests) |
| P19-E | MEDIUM | Dashboard showed `—` for Commerce metrics on free plan with no explanation; free-plan users had no upgrade path from the main screen | `apps/workspace-app/src/pages/Dashboard.tsx` (upgrade banner + locked metric labels) |
| P19-F | LOW | No tenants table — tenant_id was a bare string with no corresponding DB record; multi-tenant admin dashboard had nothing to query | `infra/db/migrations/0230_init_tenants.sql` + rollback, `apps/api/src/routes/auth-routes.ts` (tenants insert in register batch) |

### BUG-005/006 RESOLUTION — Complete Route Mounting Restoration

After fixes, all 132 vertical route files are mounted. The following router files were updated:
- `verticals-civic-extended.ts` — added `ngo`
- `verticals-transport-extended.ts` — added `road-transport-union`
- `verticals-edu-agri-extended.ts` — added `produce-aggregator`
- `verticals-financial-place-media-institutional-extended.ts` — added `community-radio`, `insurance-agent`, `savings-group`, `tech-hub`
- `verticals-commerce-p3.ts` — added `sole-trader`
- `router.ts` — imported `eduAgriExtendedRoutes`, added auth middleware for all 22 newly reachable routes, mounted edu-agri router at `/api/v1`

## Key Documents

| Document | Path |
|----------|------|
| Platform Invariants | `docs/governance/platform-invariants.md` |
| Compliance Dashboard | `docs/governance/compliance-dashboard.md` |
| Monitoring Runbook | `docs/governance/monitoring-runbook.md` |
| Template Spec | `docs/templates/template-spec.md` |
| Release Notes v1.0.1 | `docs/RELEASE-v1.0.1.md` |
| Milestone Tracker | `docs/governance/milestone-tracker.md` |
| 3-in-1 Architecture | `docs/governance/3in1-platform-architecture.md` |
| Security Baseline | `docs/governance/security-baseline.md` |
| Agent Execution Rules | `docs/governance/agent-execution-rules.md` |
| Enhancement Roadmap v1.0.1 | `docs/enhancements/ENHANCEMENT_ROADMAP_v1.0.1.md` |
| Implementation Plan | `docs/ops/implementation-plan.md` |

## Tech Stack (Target Production)

- **Runtime:** Cloudflare Workers (Edge-first)
- **Language:** TypeScript (strict mode everywhere)
- **API Framework:** Hono
- **Frontend:** React + PWA
- **Database:** Cloudflare D1 (SQLite at the edge)
- **Cache/Config:** Cloudflare KV
- **Storage:** Cloudflare R2
- **Offline Sync:** Dexie.js + Service Workers
- **AI Integration:** Vendor-neutral abstraction (BYOK capable)
- **Package Manager:** pnpm workspaces

## Repository Structure

```
webwaka-os/
  apps/
    api/                    — Cloudflare Workers API (Hono, 132 vertical routes — all mounted)
    platform-admin/         — Super admin dashboard (running on port 5000)
    admin-dashboard/        — Admin dashboard
    partner-admin/          — Partner/tenant management portal
    brand-runtime/          — Tenant-branded storefronts (Pillar 2)
    public-discovery/       — Public search and discovery (Pillar 3)
    ussd-gateway/           — USSD micro-transactions gateway
    tenant-public/          — Per-tenant profile listing
    projections/            — Data projection workers
  packages/
    types/                  — @webwaka/types: Canonical TypeScript types
    core/
      geography/            — @webwaka/geography: Geography hierarchy + rollup
      politics/             — @webwaka/politics: Political office model
    auth/                   — @webwaka/auth: JWT validation + entitlement guards
    claims/                 — @webwaka/claims: 8-state FSM with transition guards
    design-system/          — @webwaka/design-system: Mobile-first CSS foundation
    white-label-theming/    — @webwaka/white-label-theming: Brand token system
    superagent/             — @webwaka/superagent: AI integration layer
    verticals-*/            — 159 vertical-specific packages
  infra/
    db/
      migrations/           — D1 SQL migrations (0001–0227, all with rollbacks)
      seed/                 — Nigeria geography seed data
    cloudflare/             — Cloudflare infrastructure config
  docs/
    governance/             — 16+ governance documents
    architecture/decisions/ — 12+ Technical Decision Records
  scripts/
    governance-checks/      — 11 automated CI governance checks (all PASS)
  tests/
    smoke/                  — Smoke tests (health, discovery, claims, branding)
```

## Running Locally (Development)

- **Workflow:** `Start application`
- **Command:** `node apps/platform-admin/server.js`
- **Port:** 5000
- **Host:** 0.0.0.0
- **Health:** `{"status":"ok","app":"WebWaka OS Platform Admin","milestone":2}`

## Key Dev Commands

```bash
pnpm install                    # Install all workspace packages
pnpm typecheck                  # Typecheck all packages
pnpm test                       # Run full test suite (2365 tests, 166 files — apps/api)

# API-level tests (primary)
cd apps/api && npx vitest run   # 2365 tests, 166 files, 0 failures

# Package-level tests
cd packages/verticals-phone-repair-shop && npx vitest run  # 15 tests

# Governance checks (all 11 must PASS before any push)
npx tsx scripts/governance-checks/check-cors.ts
npx tsx scripts/governance-checks/check-tenant-isolation.ts
npx tsx scripts/governance-checks/check-ndpr-before-ai.ts
# ... (11 total — run all before staging push)
```

## CI Pipeline (4 steps, all green)

| Step | Command | Status |
|------|---------|--------|
| TypeScript Check | `pnpm typecheck` | ✅ PASS (0 errors across api, ussd-gateway, brand-runtime, public-discovery) |
| Tests | `cd apps/api && npx vitest run` | ✅ PASS (2365 tests, 166 files, 0 failures) |
| Governance | 11 custom checks in `scripts/governance-checks/` | ✅ PASS (11/11) |

## CI Governance Checks (11 total — all PASS)

| Script | Invariant | Status |
|--------|-----------|--------|
| `check-cors.ts` | CORS non-wildcard | ✅ |
| `check-tenant-isolation.ts` | No tenant_id from user input | ✅ |
| `check-ai-direct-calls.ts` | No direct AI SDK calls (P7) | ✅ |
| `check-monetary-integrity.ts` | No floats on monetary values (P9) | ✅ |
| `check-dependency-sources.ts` | No file:/github: deps (CI-004) | ✅ |
| `check-rollback-scripts.ts` | Every migration has rollback (CI-003) — 229/229 | ✅ |
| `check-pillar-prefix.ts` | Package.json pillar prefix (DOC-010) — 203/203 packages | ✅ |
| `check-pwa-manifest.ts` | Client-facing apps have PWA manifest | ✅ |
| `check-ndpr-before-ai.ts` | NDPR consent gate + USSD exclusion on AI routes (ARC-07 aware) | ✅ |
| `check-geography-integrity.ts` | Geography seed integrity (T6) | ✅ |
| `check-vertical-registry.ts` | Registry↔package consistency — 159/159 entries, 0 orphans | ✅ |

## Wrangler Configuration

All Workers apps have `wrangler.toml` with staging + production environment sections:
- `apps/api/wrangler.toml` — Real Cloudflare D1/KV IDs for staging + production
- `apps/admin-dashboard/wrangler.toml` — Real Cloudflare D1 IDs
- `apps/brand-runtime/wrangler.toml` — Real Cloudflare D1/KV IDs
- `apps/partner-admin/wrangler.toml` — Real Cloudflare D1/KV IDs
- `apps/projections/wrangler.toml` — Real Cloudflare D1 IDs
- `apps/public-discovery/wrangler.toml` — Real Cloudflare D1/KV IDs
- `apps/tenant-public/wrangler.toml` — Real Cloudflare D1 IDs
- `apps/ussd-gateway/wrangler.toml` — Real Cloudflare D1/KV IDs

Local dev sections use `local-dev-placeholder` (correct for miniflare).

## Deployment

- **GitHub Repository:** `https://github.com/WebWakaOS/WebWaka` (staging branch)
- **CI:** `.github/workflows/ci.yml` (typecheck + test + lint + audit + governance)
- **Staging Deploy:** `.github/workflows/deploy-staging.yml` (D1 migrations → API deploy → smoke tests)
- **Production Deploy:** `.github/workflows/deploy-production.yml` (staging validation gate)
- **Target:** Cloudflare Workers (autoscale)

## Important Invariants for All Agents

- **Auth pattern:** `c.get('auth')` → `{ userId, tenantId, workspaceId? }`; NEVER decode JWT manually
- **T2:** TypeScript strict mode everywhere. `any` requires a comment explaining why.
- **T3:** Every query on tenant-scoped data includes `tenant_id`. No exceptions.
- **T4/P9:** All monetary values stored as **integer kobo** (NGN × 100). No floats.
- **T5:** Feature access gated by entitlement check via `@webwaka/auth`.
- **T6:** Discovery driven by `@webwaka/geography` hierarchy — no raw string matching.
- **T7:** Claim lifecycle enforced by `packages/claims/src/state-machine.ts`.
- **AI routes:** All `/:id/ai-advisory` routes MUST use `aiConsentGate` middleware (NDPR P13).
- **Old AI stubs:** 10 verticals use `/ai/prompt` stub pattern (no PII processed) — upgrade in Phase 13.
- **Router registration:** ARC-07 split — ALL routes registered in `apps/api/src/router.ts`, NOT index.ts.
- **Route mounting:** All 132 vertical routes MUST appear in a verticals aggregator router AND that router MUST be imported + mounted in router.ts.
- **App count:** 9 apps (NOT 7).
- **Repo URL:** `https://github.com/WebWakaOS/WebWaka` (NOT `WebWakaDOS/webwaka-os`).

## Key Architectural Patterns

### Vertical Route Pattern (new, P11+)
```typescript
// Named export from route file
export const myVerticalRoutes = new Hono<{ Bindings: Env }>();
// OR default export
const app = new Hono<{ Bindings: Env }>();
export default app;

// FSM transition guard — ALWAYS synchronous (mockReturnValue, NOT mockResolvedValue)
const g = guardSeedToClaimed({ kycTier: body.kycTier });
if (!g.allowed) return c.json({ error: g.reason }, 403);

// AI advisory route — ALWAYS gated with aiConsentGate
app.get('/:id/ai-advisory', aiConsentGate as MiddlewareHandler<...>, async (c) => {...});

// Double-findProfileById pattern in transition handlers
const current = await repo(c).findProfileById(id, tenantId); // get current state
await repo(c).transition(id, tenantId, to);
const updated = await repo(c).findProfileById(id, tenantId); // return updated state
return c.json(updated);
```

### Vertical Router Aggregator Pattern
```typescript
// In verticals-[category]-extended.ts
import myRoutes from './verticals/my-vertical.js'; // default import
import { myNamedRoutes } from './verticals/my-other-vertical.js'; // named import
router.route('/my-vertical', myRoutes);

// In router.ts — BOTH auth middleware AND route mount required:
app.use('/api/v1/my-vertical/*', authMiddleware);
app.route('/api/v1', myRoutes); // via the aggregator
```

## Enhancement Remediation Status (v1.0.1 — Final)

| Sprint | Scope | Status |
|--------|-------|--------|
| Sprint 1 | Critical Security + Quick Wins | ✅ DONE |
| Sprint 2 | Auth & Session Hardening | ✅ DONE |
| Sprint 3 | Deploy Config + Tests | ✅ DONE |
| Sprint 4 | Remaining High Items | ✅ DONE |
| Sprint 5 | Performance Optimization | ✅ DONE |
| Sprint 6 | DevOps Hardening | ✅ DONE |
| Sprint 7 | Product Foundation | ✅ DONE |
| Sprint 8 | UX & Accessibility | 🔶 PARTIAL (UX-08 done; UX-01/02/03/04/07 pending — Phase 14) |
| Sprint 9 | Monetization Infrastructure | ✅ DONE |
| Sprint 10 | SEO & Discovery | ✅ DONE |
| Sprint 11 | Governance & Documentation | ✅ DONE |
| Sprint 12 | Polish + Marketplace Launch | ✅ DONE |
| Sprint 13 | Skip nav, smoke CI, ETag, i18n, canary, resource hints | ✅ DONE |
| Sprint 14 | MON-05 billing API, UX bundle (6 items), PERF-11, ARC-18, QA-12, 3 docs | ✅ DONE |
