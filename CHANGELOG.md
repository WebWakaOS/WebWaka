# Changelog

All notable changes to WebWaka OS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] — 2026-04-13 (Sprint 11 — Governance & Docs)

### Added

- **GOV-01:** 13 governance documents updated for SuperAgent alignment (ADL-010 aggregator-only, WakaCU wallet schemas, Partner AI Credit Resale model)
- **GOV-02:** `CONTRIBUTING.md` expanded — full setup guide, architecture overview, platform invariants quick reference, PR checklist, conventional commits guide
- **GOV-03:** Swagger UI at `GET /docs` — interactive API documentation backed by `/openapi.json`
- **GOV-04:** ADRs 0013 (D1 as primary database), 0014 (JWT + multi-tenancy), 0015 (Hono framework), 0016 (AI abstraction layer)
- **GOV-05:** Changesets changelog automation — `.changeset/config.json`, `pnpm changeset:add/version` scripts, `release-changelog.yml` CI workflow
- **PROD-02:** Template Marketplace HTML UI in admin-dashboard — listing page (search + filter), detail page (install/purchase CTA), install action with API proxy
- **MON-03:** `GET /superagent/usage/quota` endpoint with plan-based monthly WakaCU limits (D1 migration 0216)

### Fixed

- **B6 (openapi):** `swaggerRoutes` double-export conflict resolved
- **superagent test:** `sql?.includes()` optional chain for `string[][]` destructuring

## [1.0.0] — 2026-04-11

### Added

#### M12 — AI Integration (Production)
- HITL Service (`hitl-service.ts`) — submit, review, list, expire, 72h L3 review window
- Enterprise Spend Controls (`spend-controls.ts`) — per-user/team/project/workspace WakaCU budgets
- Compliance-Mode AI (`compliance-filter.ts`) — sensitive sector detection, PII stripping, post-processing
- NDPR Article 30 Register (`ndpr-register.ts`) — auto-populated processing register with review/export
- AI Audit Export — anonymized usage export route
- 13 new SuperAgent API endpoints (HITL, budgets, compliance, NDPR, audit, usage)
- D1 migration 0204: `ai_spend_budgets` table
- D1 migration 0205: `ai_processing_register` table
- 68 SuperAgent package tests (hitl-service, spend-controls, compliance-filter, ndpr-register)
- 43 SuperAgent route integration tests (auth guards, CRUD, T3 isolation)
- SuperAgent smoke tests (`tests/smoke/superagent.smoke.ts`) — 16 checks

#### M11 — Partner & White-Label
- Partner API routes — 8 endpoints (GET/POST partners, sub-partners, entitlements)
- Partner status FSM: pending → active → suspended → deactivated (terminal)
- Sub-partner delegation with `delegation_rights` + `max_sub_partners` enforcement
- D1 migration 0202: `partner_entitlements` table
- D1 migration 0203: `partner_audit_log` table
- `apps/partner-admin` Hono Worker — full partner management dashboard
- 72 partner route integration tests (61 partner + 11 entitlement)

#### M10 — Staging Hardening
- CI pipeline fully green (typecheck + test + lint + governance)
- Incident response runbook (`docs/governance/incident-response.md`)
- Structured logging package (`packages/logging/`) with PII masking
- 4 smoke test suites (health, discovery, claims, branding)
- Secrets provisioning verification script

#### Governance Remediation (Phases 0–4)
- SEC-001: JWT authentication on admin-dashboard routes
- SEC-002: JWT authentication on platform-admin claims routes
- SEC-003: Full tenant isolation on all claim_requests queries
- SEC-004: Persistent audit_logs table (migration 0193) with D1 write middleware
- SEC-005: Production-safe CORS — localhost excluded in production mode
- SEC-006: Security headers (secureHeaders) on all 9 apps
- SEC-007: Release governance documentation aligned to actual workflow
- SEC-008: Secret rotation tracking log with documented procedures
- ENT-001: Entitlement middleware for vertical route access control
- ENT-002: AI entitlement check on all SuperAgent routes
- ENT-003: Branding entitlement check in brand-runtime
- AI-001: HITL tables (ai_hitl_queue, ai_hitl_events) — migration 0194
- AI-002: AI vertical configs table + 17 seeds
- AI-003: Financial table write prohibition guard for AI operations
- AI-004: USSD exclusion middleware on all AI entry points
- AI-005: SuperAgent key storage reconciliation
- PWA-001: PWA assets all client-facing apps
- PWA-002: Wire offline-sync (Background Sync + IndexedDB)
- PWA-003: Mobile-first design system (360px base)
- CI-001 through CI-004: 10 automated governance checks in CI
- GAP-001 through GAP-006: SDK resolution, ward seeding, rollback scripts, claim FSM
- DOC-001 through DOC-015: Documentation harmonization (14 items)

### Fixed

#### M12 QA Fixes (9 bugs)
- Fixed hardcoded `autonomyLevel=1` in `/chat` — now derives from `isSensitiveVertical()`; sensitive verticals trigger HITL
- Fixed `/compliance/check` inconsistent HITL levels — now uses shared `preProcessCheck()` logic
- Fixed workspace budget enforcement — `recordSpend()` now increments workspace-scoped budgets
- Fixed `expireStale` T3 violation — `tenantId` is now required (was optional)
- Fixed `listBudgets` returning inactive budgets — added `AND is_active = 1` filter
- Fixed `checkBudget` missing workspace scope — workspace budgets now checked alongside user/team/project
- Fixed PII regex patterns — BVN now matches 11 digits; phone patterns separated for local (080/090/070) and international (+234)
- Fixed `review()` redundant DB query — `created_at` now included in initial SELECT
- Fixed `markExpired` missing `actor_id` in audit events — added `actor_id = 'system'`

#### Earlier Fixes
- CORS fallback no longer includes localhost in production
- Audit log middleware now persists entries to D1 (previously console-only)

### Security
- All destructive/financial routes emit persistent audit log entries
- Free-plan workspaces blocked from SuperAgent AI features (403)
- USSD sessions rejected on all AI endpoints (P12)
- AI cannot write to financial tables without human approval
- Sensitive sector PII stripped before AI processing (P13)
- 72h mandatory review window for L3 HITL items (regulatory)
- Tenant-scoped HITL expiry prevents cross-tenant data leakage
