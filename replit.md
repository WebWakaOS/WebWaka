# WebWaka OS

## Overview

WebWaka OS is a multi-tenant, multi-vertical, white-label SaaS platform operating system for Africa, starting with Nigeria. It follows a governance-driven monorepo architecture with "Offline First," "Mobile First," and "Nigeria First" as core principles.

**Current Phase: Milestone 10 — Staging Hardening (IN PROGRESS)**

## Milestone Status

| Milestone | Status |
|---|---|
| 0 — Program Setup | ✅ DONE |
| 1 — Governance Baseline | ✅ DONE |
| 2 — Monorepo Scaffolding | ✅ DONE (0 errors across 175+ packages) |
| 3–8 — API, Discovery, Claims, Commerce, Community, Verticals | ✅ SUBSTANTIALLY COMPLETE (143 verticals, 124 route files, 200 migrations) |
| Governance Remediation (Phases 0–4) | ✅ COMPLETE — 48/48 items |
| 10 — Staging Hardening | 🔧 IN PROGRESS — CI pipeline green, remaining: incident response, logging, smoke tests |

## Platform Scale

| Metric | Count |
|--------|-------|
| Apps | 9 (api, platform-admin, admin-dashboard, partner-admin, brand-runtime, public-discovery, ussd-gateway, tenant-public, projections) |
| Packages | 175+ (183 with pillar prefixes) |
| Verticals | 143 |
| D1 migrations | 200 (all with rollback scripts) |
| Claims FSM states | 8 (with transition guards, 36 tests) |
| Geography seeds | 774 LGAs, 37 states, 6 zones |
| CI governance checks | 10 |
| Total test files | 182 (163 packages + 18 apps + 1 smoke, 0 failures) |

## Key Documents

| Document | Path |
|----------|------|
| Platform Invariants | `docs/governance/platform-invariants.md` |
| Compliance Dashboard | `docs/governance/compliance-dashboard.md` |
| Milestone Tracker | `docs/governance/milestone-tracker.md` |
| 3-in-1 Architecture | `docs/governance/3in1-platform-architecture.md` |
| Security Baseline | `docs/governance/security-baseline.md` |
| Agent Execution Rules | `docs/governance/agent-execution-rules.md` |

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
      migrations/           — D1 SQL migration files (0001–0199)
      seed/                 — Nigeria geography seed data
    cloudflare/             — Cloudflare infrastructure config
  docs/
    governance/             — 16+ governance documents
    architecture/decisions/ — 12 Technical Decision Records
  scripts/
    governance-checks/      — 10 automated CI governance checks
  tests/
    smoke/                  — Smoke tests (api-health)
```

## Running Locally (Development)

- **Workflow:** `Start application`
- **Command:** `node apps/platform-admin/server.js`
- **Port:** 5000
- **Host:** 0.0.0.0

## Key Dev Commands

```bash
pnpm install                    # Install all workspace packages
pnpm typecheck                  # Typecheck all packages (175+)
pnpm test                       # Run full test suite (182 test files)
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
| Tests | `pnpm test` | ✅ PASS (182 test files, 0 failures) |
| Lint | `pnpm lint` | ✅ PASS |
| Governance | 10 custom checks in `scripts/governance-checks/` | ✅ PASS (10/10) |

## Wrangler Configuration

All 4 Workers apps have `wrangler.toml` with staging + production environment sections:
- `apps/api/wrangler.toml` — Real Cloudflare D1/KV IDs for staging + production
- `apps/brand-runtime/wrangler.toml` — Real Cloudflare D1/KV IDs for staging + production
- `apps/public-discovery/wrangler.toml` — Real Cloudflare D1/KV IDs for staging + production
- `apps/ussd-gateway/wrangler.toml` — Real Cloudflare D1/KV IDs for staging + production

Local dev sections use `local-dev-placeholder` (correct for miniflare).

## Deployment

- **GitHub Repository:** `https://github.com/WebWakaOS/WebWaka` (staging branch)
- **CI:** `.github/workflows/ci.yml` (typecheck + test + lint + audit + governance)
- **Staging Deploy:** `.github/workflows/deploy-staging.yml` (D1 migrations → API deploy → smoke tests)
- **Production Deploy:** `.github/workflows/deploy-production.yml`
- **Target:** Cloudflare Workers (autoscale)

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
