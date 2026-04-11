# WebWaka OS

## Overview

WebWaka OS is a multi-tenant, multi-vertical, white-label SaaS platform operating system for Africa, starting with Nigeria. It follows a governance-driven monorepo architecture with "Offline First," "Mobile First," and "Nigeria First" as core principles.

**Current Phase: Governance Compliance Remediation COMPLETE (2026-04-11)**

## Milestone Status

| Milestone | Status |
|---|---|
| 0 — Program Setup | ✅ DONE |
| 1 — Governance Baseline | ✅ DONE |
| 2 — Monorepo Scaffolding | ✅ DONE (0 errors across 175+ packages) |
| 3–8 — API, Discovery, Claims, Commerce, Community, Verticals | ✅ SUBSTANTIALLY COMPLETE (143 verticals, 124 route files, 200 migrations) |
| Governance Remediation | ✅ COMPLETE — 48/48 items across 5 phases |

## Governance Remediation Plan

**Location:** `docs/reports/governance-remediation-plan-2026-04-11.md`
**Audit Report:** `docs/reports/governance-compliance-deep-audit-2026-04-11.md`
**Compliance Dashboard:** `docs/governance/compliance-dashboard.md`

48 remediation items across 5 phases — ALL COMPLETE:
- **Phase 0 (3 items):** Admin auth fixes (SEC-001/002/003) — ✅ COMPLETE
- **Phase 1 (12 items):** Audit logs, CORS, entitlements, AI guards, governance CI — ✅ COMPLETE
- **Phase 2 (12 items):** PWA assets, mobile-first CSS, white-label wiring, rollback backfill, expanded CI — ✅ COMPLETE
- **Phase 3 (7 items):** Brand-runtime + public-discovery production quality, cross-pillar data, offline-sync, geography seeding — ✅ COMPLETE
- **Phase 4 (14 items):** Documentation harmonization — pillar labels, milestone tracker, compliance dashboard, AI position statements — ✅ COMPLETE

## Tech Stack (Target Production)

- **Runtime:** Cloudflare Workers (Edge-first)
- **Language:** TypeScript (strict mode everywhere)
- **API Framework:** Hono
- **Frontend:** React + PWA
- **Database:** Cloudflare D1 (SQLite at the edge) — shared staging + shared production (TDR-0007)
- **Cache/Config:** Cloudflare KV
- **Storage:** Cloudflare R2
- **Offline Sync:** Dexie.js + Service Workers
- **AI Integration:** Vendor-neutral abstraction (BYOK capable)
- **Package Manager:** pnpm workspaces

## Repository Structure

```
webwaka-os/
  apps/
    api/                    — Cloudflare Workers API (Milestone 2 phase 2)
    platform-admin/         — Super admin dashboard (running on port 5000)
    partner-admin/          — Partner/tenant management portal (Milestone 2 phase 2)
    public-discovery/       — Public search and discovery (Milestone 3)
    brand-runtime/          — Tenant-branded storefronts (Milestone 3)
  packages/
    types/                  — @webwaka/types: Canonical TypeScript types ✅
    core/
      geography/            — @webwaka/geography: Geography hierarchy + rollup helpers ✅
      politics/             — @webwaka/politics: Political office + territory model ✅
    auth/                   — @webwaka/auth: JWT validation + entitlement guards ✅
  infra/
    db/
      migrations/           — D1 SQL migration files (0001–0006) ✅
      seed/                 — Nigeria geography seed data (country + zones + states) ✅
    cloudflare/             — Cloudflare infrastructure config
    github-actions/         — CI/CD workflow references
  docs/
    governance/             — 16 governance documents (Milestone 1 baseline)
    architecture/decisions/ — 12 TDRs (Milestone 1 baseline)
  tests/                    — e2e, integration, smoke (Milestone 2+)
```

## Package Dependencies

```
@webwaka/types (no internal deps)
  ↑
@webwaka/geography (depends on: types)
@webwaka/politics  (depends on: types, geography)
@webwaka/auth      (depends on: types)
```

## Running Locally (Development)

- **Workflow:** `Start application`
- **Command:** `node apps/platform-admin/server.js`
- **Port:** 5000
- **Host:** 0.0.0.0

## Key Dev Commands

```bash
pnpm install                                # Install all workspace packages
pnpm --filter @webwaka/types build          # Build types (required before other packages)
pnpm --filter @webwaka/geography typecheck  # Typecheck geography (resolves via paths from source)
pnpm --filter @webwaka/politics typecheck   # Typecheck politics  (resolves via paths from source)
pnpm --filter @webwaka/auth typecheck       # Typecheck auth      (resolves via paths from source)
pnpm -r build                               # Build all packages in dependency order
pnpm -r test                                # Run full workspace test suite
```

## tsconfig Pattern (Two tsconfigs per dependent package)

Each package that depends on other workspace packages uses two tsconfig files:
- `tsconfig.json` — for IDE/typecheck: has `paths` pointing to source, wide `rootDir` encompassing all workspace sources. Use: `tsc --noEmit`
- `tsconfig.build.json` — for building dist: `rootDir: "src"`, `outDir: "dist"`, no cross-package paths. Use: `tsc -p tsconfig.build.json`

The `types` package has only `tsconfig.json` (no cross-package deps, standard `rootDir: "src"`).

## Test Summary (Milestone 2 — All fixes applied)

| Package | Tests | Status |
|---|---|---|
| @webwaka/geography | 21 | ✅ All passing |
| @webwaka/politics | 16 | ✅ All passing |
| @webwaka/auth | 34 (was 24 — +10 jwt.test.ts) | ✅ All passing |
| **Total** | **71** | ✅ All passing |

## D1 Migration Files

| File | Description |
|---|---|
| `0001_init_places.sql` | Places table with geography hierarchy |
| `0002_init_entities.sql` | Individuals + Organizations root entities |
| `0003_init_workspaces_memberships.sql` | Workspaces + Memberships |
| `0004_init_subscriptions.sql` | Subscriptions |
| `0005_init_profiles.sql` | Profiles (discovery records) |
| `0006_init_political.sql` | Jurisdictions, terms, political assignments, party affiliations |
| `0191_sec003_add_tenant_id_to_contact_channels.sql` | Add tenant_id to contact_channels (Phase 0) |
| `0192_sec003_add_tenant_id_to_claim_requests.sql` | Add tenant_id to claim_requests (Phase 0) |
| `0193_sec004_audit_logs.sql` | Persistent audit_logs table (Phase 1 SEC-004) |
| `0194_ai001_hitl_tables.sql` | AI HITL queue + events tables (Phase 1 AI-001) |
| `0195_ai002_vertical_configs.sql` | AI vertical configs table + 17 vertical seeds (Phase 2 AI-002) |
| `0196_add_slug_to_organizations.sql` | Add slug column to organizations for tenant resolution (Phase 2 QA) |
| `0197_create_tenant_branding.sql` | Create tenant_branding table for white-label theming (Phase 2 QA) |
| `0198_create_contact_submissions.sql` | Contact form submissions table for brand-runtime (Phase 3 P3IN1-001) |
| `0199_offerings_search_trigger.sql` | Search index table + D1 triggers on offerings insert/update (Phase 3 P3IN1-003) |

## Deployment

- **Target:** autoscale
- **Run command:** `node apps/platform-admin/server.js`
- **Production:** Requires Cloudflare credentials (see `.env.example` and `docs/governance/security-baseline.md`)

## Key Governance Documents

- `docs/governance/platform-invariants.md` — Non-negotiable rules (read before implementing)
- `docs/governance/universal-entity-model.md` — Root entity definitions
- `docs/governance/geography-taxonomy.md` — Geography hierarchy
- `docs/governance/political-taxonomy.md` — Political office model
- `docs/governance/entitlement-model.md` — Subscription-gated access rules
- `docs/governance/release-governance.md` — Release flow and CI governance gates
- `docs/governance/agent-execution-rules.md` — Agent coordination and governance enforcement
- `docs/architecture/decisions/` — 12 Technical Decision Records
- `infra/cloudflare/secrets-rotation-log.md` — Secret inventory and rotation schedule
- `CHANGELOG.md` — Release changelog (Keep a Changelog format)

## Phase 3 New Files

| File | Purpose |
|---|---|
| `apps/brand-runtime/src/templates/about.ts` | About page template (Pillar 2) |
| `apps/brand-runtime/src/templates/services.ts` | Full services/offerings catalog template (Pillar 2) |
| `apps/brand-runtime/src/templates/contact.ts` | Contact form template with offline-capable submission (Pillar 2) |
| `packages/offerings/src/index.ts` | Cross-pillar offerings data access layer (P1→P2→P3 flow) |
| `packages/claims/src/state-machine.ts` | Extended with transition guards (GAP-006) |
| `scripts/governance-checks/check-geography-integrity.ts` | Geography seed validation (GAP-002) |
| `infra/db/migrations/0198_create_contact_submissions.sql` | Contact submissions table |
| `infra/db/migrations/0199_offerings_search_trigger.sql` | Search index + triggers |

## Phase 2 New Files

| File | Purpose |
|---|---|
| `apps/brand-runtime/src/middleware/branding-entitlement.ts` | ENT-003: Branding entitlement gate (Pillar 2 plan check) |
| `apps/brand-runtime/src/env.ts` | Variables type (tenantSlug, tenantId, tenantName, themeColor) |
| `packages/white-label-theming/src/index.ts` | Shared brand token system (getBrandTokens, generateCSS) |
| `packages/design-system/src/index.ts` | Mobile-first CSS (360px base, breakpoints, spacing, typography) |
| `infra/db/migrations/0195_ai002_vertical_configs.sql` | ai_vertical_configs table + 17 vertical seeds |
| `infra/db/migrations/*.rollback.{sql,md}` | Rollback scripts for all 196 migrations |

## Phase 1 New Middleware Files

| File | Purpose |
|---|---|
| `apps/api/src/middleware/audit-log.ts` | Persistent audit logging to D1 + console |
| `apps/api/src/middleware/entitlement.ts` | `requireEntitlement(layer)` — subscription plan gate for vertical routes |
| `apps/api/src/middleware/ai-entitlement.ts` | AI access entitlement check (blocks free plan from SuperAgent) |
| `apps/api/src/middleware/ussd-exclusion.ts` | Blocks USSD sessions from all AI entry points (P12) |
| `packages/superagent/src/guards.ts` | `guardAIFinancialWrite()` — prevents AI from writing to financial tables |

## CI Governance Checks

| Script | Checks |
|---|---|
| `scripts/governance-checks/check-cors.ts` | CORS non-wildcard, no localhost in production |
| `scripts/governance-checks/check-tenant-isolation.ts` | No tenant_id from user input |
| `scripts/governance-checks/check-ai-direct-calls.ts` | No direct AI SDK calls (P7) |
| `scripts/governance-checks/check-monetary-integrity.ts` | No floats on monetary values (P9) |
| `scripts/governance-checks/check-dependency-sources.ts` | No file:/github: dependency sources (CI-004) |
| `scripts/governance-checks/check-rollback-scripts.ts` | Every migration has rollback script (CI-003) |
| `scripts/governance-checks/check-pillar-prefix.ts` | Every package.json has pillar prefix (DOC-010) |
| `scripts/governance-checks/check-pwa-manifest.ts` | All client-facing apps have PWA manifest (PWA-001) |
| `scripts/governance-checks/check-ndpr-before-ai.ts` | NDPR consent gate on AI routes (GAP-005) |
| `scripts/governance-checks/check-geography-integrity.ts` | Geography seed integrity — zones, states, LGAs, wards, priority states (GAP-002) |

## Important Invariants for All Agents

- T2: TypeScript strict mode everywhere. `any` requires a comment explaining why.
- T3: Every query on tenant-scoped data includes `tenant_id`. No exceptions.
- T4: All monetary values stored as **integer kobo** (NGN × 100). No floats.
- T5: Feature access gated by entitlement check via `@webwaka/auth`.
- T6: Discovery driven by `@webwaka/geography` hierarchy — no raw string city/state matching.
