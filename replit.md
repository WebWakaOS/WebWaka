# WebWaka OS

## Overview

WebWaka OS is a multi-tenant, multi-vertical, white-label SaaS platform operating system for Africa, starting with Nigeria. It follows a governance-driven monorepo architecture with "Offline First," "Mobile First," and "Nigeria First" as core principles.

**Current Phase: M9 — Vertical Scaling (🔄 IN PROGRESS)**
**Active: Enhancement Sprints 1–7 COMPLETE + M9 Vertical Scaling (190 new tests, 2 D1 migrations, 2 new packages)**

## Milestone Status

| Milestone | Status |
|---|---|
| 0 — Program Setup | ✅ DONE |
| 1 — Governance Baseline | ✅ DONE |
| 2 — Monorepo Scaffolding | ✅ DONE (0 errors across 175+ packages) |
| 3–8 — API, Discovery, Claims, Commerce, Community, Verticals | ✅ SUBSTANTIALLY COMPLETE (143 verticals, 124 route files, 206 migrations) |
| Governance Remediation (Phases 0–4) | ✅ COMPLETE — 48/48 items |
| 10 — Staging Hardening | ✅ COMPLETE — 9/9 tasks done |
| 11 — Partner & White-Label | ✅ COMPLETE — 7/7 tasks done |
| 12 — AI Integration (Production) | ✅ COMPLETE — 10/10 tasks done (incl. QA: 9 bugs fixed, 111 tests) |
| 13 — Production Launch | ✅ COMPLETE — v1.0.0 (CHANGELOG, version bumps, smoke tests, docs) |
| v1.0.1 — Foundation + Template Architecture | ✅ COMPLETE — Template marketplace, production hardening, Africa-First interfaces, 5 frame repos |
| 9 — Vertical Scaling | 🔄 IN PROGRESS — D1 migrations 0213+0214, 190 new tests across 7 packages, 2 new vertical packages |

## Platform Scale

| Metric | Count |
|--------|-------|
| Apps | 9 (api, platform-admin, admin-dashboard, partner-admin, brand-runtime, public-discovery, ussd-gateway, tenant-public, projections) |
| Packages | 178 (186 with pillar prefixes) — +2 new: verticals-supermarket, verticals-savings-group |
| Verticals | 145 (+2: supermarket, savings-group) |
| D1 migrations | 222 (all with rollback scripts) — +2: 0213 delivery_orders, 0214 reservations |
| Claims FSM states | 8 (with transition guards, 36 tests) |
| Geography seeds | 774 LGAs, 37 states, 6 zones |
| CI governance checks | 10 |
| Smoke test suites | 5 (health, discovery, claims, branding, superagent) |
| Total API tests (@webwaka/api) | 444 (21 test files, incl. 61 partner + 43 superagent + 20 sprint5-perf + 9 security/isolation + 25 sprint7-product tests) |
| SuperAgent package tests | 68 (hitl-service, spend-controls, compliance-filter, ndpr-register) |
| M9 vertical package tests | 190 (hotel×35, logistics×31, pharmacy×31, gas×13, restaurant×30, supermarket×35, savings-group×15) |
| Platform version | 1.0.1 |
| Template validator tests | 50 |
| Frame template repos | 5 (dashboard, website, workflow, vertical, module) |

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
    api/                    — Cloudflare Workers API (Hono, 124 vertical routes)
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
    verticals-*/            — 143 vertical-specific packages
  infra/
    db/
      migrations/           — D1 SQL migration files (0001–0207, 208 total)
      seed/                 — Nigeria geography seed data
    cloudflare/             — Cloudflare infrastructure config
  docs/
    governance/             — 16+ governance documents
    architecture/decisions/ — 12 Technical Decision Records
  scripts/
    governance-checks/      — 10 automated CI governance checks
  tests/
    smoke/                  — Smoke tests (health, discovery, claims, branding)
```

## Running Locally (Development)

- **Workflow:** `Start application`
- **Command:** `node apps/platform-admin/server.js`
- **Port:** 5000
- **Host:** 0.0.0.0

## Key Dev Commands

```bash
pnpm install                    # Install all workspace packages
pnpm typecheck                  # Typecheck all packages (176)
pnpm test                       # Run full test suite (233 API tests, 0 failures)
pnpm lint                       # Lint all packages

# Individual package commands
pnpm --filter @webwaka/claims test    # Run claims tests
pnpm --filter @webwaka/auth test      # Run auth tests

# Governance checks
npx tsx scripts/governance-checks/check-cors.ts
npx tsx scripts/governance-checks/check-tenant-isolation.ts
# ... (10 total checks)
```

## CI Pipeline (4 steps, all green)

| Step | Command | Status |
|------|---------|--------|
| TypeScript Check | `pnpm typecheck` | ✅ PASS |
| Tests | `pnpm test` | ✅ PASS (279 API tests, 60 superagent pkg tests, 73 root tests — 0 failures) |
| Lint | `pnpm lint` | ✅ PASS |
| Governance | 10 custom checks in `scripts/governance-checks/` | ✅ PASS (10/10) |

## Wrangler Configuration

All 7 Workers apps have `wrangler.toml` with staging + production environment sections:
- `apps/api/wrangler.toml` — Real Cloudflare D1/KV IDs for staging + production
- `apps/admin-dashboard/wrangler.toml` — Real Cloudflare D1 IDs for staging + production (ARC-01)
- `apps/brand-runtime/wrangler.toml` — Real Cloudflare D1/KV IDs for staging + production
- `apps/partner-admin/wrangler.toml` — Real Cloudflare D1/KV IDs for staging + production (ARC-04)
- `apps/projections/wrangler.toml` — Real Cloudflare D1 IDs for staging + production (ARC-01)
- `apps/public-discovery/wrangler.toml` — Real Cloudflare D1/KV IDs for staging + production
- `apps/tenant-public/wrangler.toml` — Real Cloudflare D1 IDs for staging + production (ARC-01)
- `apps/ussd-gateway/wrangler.toml` — Real Cloudflare D1/KV IDs for staging + production

Local dev sections use `local-dev-placeholder` (correct for miniflare).

## Deployment

- **GitHub Repository:** `https://github.com/WebWakaOS/WebWaka` (staging branch)
- **CI:** `.github/workflows/ci.yml` (typecheck + test + lint + audit + governance)
- **Staging Deploy:** `.github/workflows/deploy-staging.yml` (D1 migrations → API deploy → smoke tests)
- **Production Deploy:** `.github/workflows/deploy-production.yml` (DEV-01: staging validation gate added)
- **Target:** Cloudflare Workers (autoscale)

## Enhancement Remediation Status (v1.0.1)

| Sprint | Scope | Status | Items |
|--------|-------|--------|-------|
| Sprint 1 | Critical Security + Quick Wins | ✅ PUSHED | SEC-01/02/03/06/07/08/13, BUG-06, ARC-02, SEO-01 |
| Sprint 2 | Auth & Session Hardening | ✅ PUSHED | SEC-04/05/09/10/11/15/16 |
| Sprint 3 | Deploy Config + Tests | ✅ PUSHED | ARC-01/04/05/06/11, QA-01/11, DEV-05 |
| Sprint 4 | Remaining High Items | ✅ PUSHED | SEC-14, ARC-19, DEV-01 |
| QA Audit | Verification & Integration | ✅ PUSHED | ARC-05/06 integration, SEC-08 projections/tenant-public |
| Sprint 5 | Performance Optimization | ✅ PUSHED | PERF-01/02/03/04/06/08 |
| Sprint 6 | DevOps Hardening | ✅ PUSHED | DEV-01/02/03/04/06/08/09 |
| Sprint 7 | Product Foundation | ✅ PUSHED | PROD-01/07/09 |
| Sprint 9 | Monetization Infrastructure | ✅ DONE | MON-01/02/04 — template purchase flow, 70/30 revenue splits, free tier limits |
| Sprint 10 | SEO & Discovery | ✅ DONE | SEO-03/05 — ItemList JSON-LD on all 3 listing pages, default OG image |
| Sprint 9+10 QA | Bug-Fix Pass | ✅ DONE | B1 auth guard, B2 @context dupe, B3/B3b null place_name, B4 upgrade_url, B5 email validation |

### Key Security Hardening Applied
- Admin dashboard routes now require JWT auth + workspace-scoped authorization (SEC-01, IDOR prevention)
- Wildcard CORS eliminated from projections + tenant-public (SEC-02/06)
- Login rate limiting: 10/5min per IP (SEC-03)
- Refresh token rotation with KV blacklist (SEC-04/10)
- PBKDF2 increased to 600k iterations with transparent rehash (SEC-05)
- Password complexity validation utility available for registration/change-password flows (SEC-09)
- Sessions table for NDPR erasure compliance (SEC-11)
- Body size limits on all API requests (SEC-13)
- Template manifest schema validation (SEC-14)
- Price-lock HMAC secret now required, not optional (SEC-15)
- Auth failure IP logging for security monitoring (SEC-16)
- Localhost CORS gated behind ENVIRONMENT check — all 5 workers (SEC-08)
- Request correlation IDs on all API requests (ARC-19)
- Staging health check gate before production deploy (DEV-01)
- Shared CORS config (`@webwaka/shared-config`) adopted by api, projections, tenant-public (ARC-05)
- Standardized error response schema adopted in auth routes + middleware (ARC-06)

### Sprint 5 Performance Optimizations Applied
- CDN cache headers on all PWA workers — partner-admin now serves manifest.json/sw.js (PERF-01)
- Geography graceful degradation: KV failures fall back to D1 queries, individual place caching (PERF-02)
- Cursor-based pagination for template listing (backward-compatible with page/offset) (PERF-03)
- Database index audit: 8 new indexes for high-traffic query patterns (PERF-04)
- Gzip response compression via Hono compress middleware (Accept-Encoding gated) (PERF-06)
- Discovery search result KV caching with 5-minute TTL for first-page queries (PERF-08)

### Sprint 6 DevOps Hardening Applied
- Staging validation gate blocks production deploy if staging health check fails (DEV-01, Sprint 4)
- Rollback procedure runbook: Workers dashboard/CLI, D1 migration, KV cache invalidation (DEV-02)
- Secret rotation documentation with 90-day schedule and per-secret procedures (DEV-03)
- Monitoring middleware: request latency tracking, error rate alerting, webhook integration (DEV-04)
- Readiness probe `/health/ready` with D1, KV, and error rate dependency checks (DEV-04)
- Branch protection rules documented for staging (1 review) and main (2 reviews) (DEV-06)
- Dependabot configured for npm + GitHub Actions with grouped updates (DEV-08, pre-existing)
- Migration rollback automation via manual-dispatch GitHub Actions workflow (DEV-09)

### Sprint 7 Product Foundation Applied
- Tenant onboarding checklist: 6-step guided setup (profile, vertical, template, payment, team, branding) with per-workspace progress tracking (PROD-01)
- Template version upgrade path: semver comparison, config preservation, upgrade log audit trail (PROD-07)
- Billing enforcement engine: grace period (7 days), suspended state (read-only), free plan exempt, admin-triggered enforcement (PROD-09)
- Billing enforcement middleware: checks subscription status on authenticated requests, exempt paths for health/auth/billing/onboarding (PROD-09)
- New tables: onboarding_progress, template_versions, template_upgrade_log, usage_snapshots + subscription enforcement columns
- New routes: /onboarding/:workspaceId, /billing/status, /billing/enforce, /billing/reactivate, /templates/:slug/upgrade

### Sprint 11 — Governance & Documentation Applied
- **GOV-01**: 13 governance documents updated (DOC-001–DOC-013), all TODO items resolved and marked ✅
- **GOV-02**: `CONTRIBUTING.md` created at repo root — setup, architecture overview, PR guide, platform invariants reference
- **GOV-03**: Swagger UI served at `GET /docs` in API worker; `GET /openapi.json` returns OpenAPI spec (CDN-hosted UI, no npm package needed for Workers)
- **GOV-04**: ADR-0013 (D1 as primary DB), ADR-0014 (JWT + multi-tenancy), ADR-0015 (Hono framework choice), ADR-0016 (AI abstraction layer) in `docs/architecture/decisions/`
- **GOV-05**: `@changesets/cli` installed; `.changeset/config.json`; `changeset:add`/`changeset:version` scripts; `CHANGELOG.md` seeded from sprint history; CI changelog step added

### Sprint 12 — Polish + Marketplace Applied
- **PROD-02**: Template marketplace UI in `apps/admin-dashboard` — 3 SSR pages (browse with pagination/filter, detail, install/purchase flow)
- **PROD-04**: Webhook system — D1 migrations `0217_webhook_subscriptions` + `0218_webhook_deliveries`; `WebhookDispatcher` (HMAC-SHA256, 3-attempt retry, fire-and-forget); full CRUD routes at `/webhooks` + `/webhooks/:id/deliveries`; events wired into templates.ts, payments.ts, workspaces.ts
- **PROD-05**: `EmailService` using Resend REST API — 4 templates (welcome, template-purchase-receipt, workspace-invite, payment-confirmation); `RESEND_API_KEY` env var; hooked into workspace invites and template purchases
- **MON-03**: `GET /superagent/usage/quota` endpoint — `{used_waku_cu, quota_waku_cu, remaining_waku_cu, reset_date}`; plan-based monthly limits via D1
- **QA-04**: Playwright E2E suite — `playwright.config.ts`; 162 tests in 8 critical journeys (J1 auth/T3, J2 marketplace, J3 workspace invite, J4 payments/P9, J5 AI quota, J6 webhooks, J7 SuperAgent/P13, J8 i18n/locale); `pnpm test:e2e`
- **QA-05**: AI package tests — 19 tests in `packages/ai-adapters` (factory routing, HTTP mock, P8 key safety); 83 tests in `packages/superagent` (WalletService, SpendControls, CreditBurnEngine, NdprRegister)
- **UX-15**: `@webwaka/i18n` package — 5 locales (en, ha/Hausa, yo/Yoruba, ig/Igbo, pcm/Nigerian Pidgin); 60+ typed keys; `detectLocale()` (Accept-Language header + `?lang=`); `createI18n()` typed `t()` with interpolation; `createLocaleMiddleware()`; integrated into all `public-discovery` HTML pages (base.ts lang attribute, nav labels, footer tagline); 52 tests passing
- **ARC-20**: `docs/architecture/canary-deployment.md` (10%→50%→100% stages, health gates, D1 migration safety, rollback procedure); `.github/workflows/deploy-canary.yml` (automated with SIGTERM rollback on gate failure)
- **SEO-02**: ✅ Done — `sitemap.xml` route in `apps/public-discovery/src/index.ts`
- **SEO-04**: ✅ Done — preconnect/dns-prefetch resource hints + `loading=lazy` JS in `base.ts`

**New package:** `packages/i18n` — `@webwaka/i18n` v0.1.0

**Final test counts (post Sprint 12):**
- `apps/api`: 444 tests (21 files) | `apps/ussd-gateway`: 96 tests (4 files) | `packages/superagent`: 83 tests | `packages/ai-adapters`: 19 tests | `packages/i18n`: 52 tests
- **Total unit/integration**: 1764 tests (96 files) | **E2E defined**: 162 tests (8 journeys)

## Important Invariants for All Agents

- **Auth pattern:** `c.get('auth')` → `{ userId, tenantId, workspaceId? }`; NEVER decode JWT manually
- **T2:** TypeScript strict mode everywhere. `any` requires a comment explaining why.
- **T3:** Every query on tenant-scoped data includes `tenant_id`. No exceptions.
- **T4/P9:** All monetary values stored as **integer kobo** (NGN × 100). No floats.
- **T5:** Feature access gated by entitlement check via `@webwaka/auth`.
- **T6:** Discovery driven by `@webwaka/geography` hierarchy — no raw string matching.
- **T7:** Claim lifecycle enforced by `packages/claims/src/state-machine.ts` (NOT `@packages/profiles`).
- **AI position:** AI/SuperAgent is cross-cutting intelligence layer (NOT a 4th pillar).
- **App count:** 9 apps (NOT 7).
- **Repo URL:** `https://github.com/WebWakaOS/WebWaka` (NOT `WebWakaDOS/webwaka-os`).

## CI Governance Checks (10 total)

| Script | Invariant |
|--------|-----------|
| `check-cors.ts` | CORS non-wildcard |
| `check-tenant-isolation.ts` | No tenant_id from user input |
| `check-ai-direct-calls.ts` | No direct AI SDK calls (P7) |
| `check-monetary-integrity.ts` | No floats on monetary values (P9) |
| `check-dependency-sources.ts` | No file:/github: deps (CI-004) |
| `check-rollback-scripts.ts` | Every migration has rollback (CI-003) |
| `check-pillar-prefix.ts` | Package.json pillar prefix (DOC-010) |
| `check-pwa-manifest.ts` | Client-facing apps have PWA manifest |
| `check-ndpr-before-ai.ts` | NDPR consent gate on AI routes |
| `check-geography-integrity.ts` | Geography seed integrity |
