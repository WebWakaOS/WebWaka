# WebWaka OS — Deep Agent Platform Review Brief

**Prepared for:** Abacus Deep Agent (Agent Swarm)
**Date:** 2026-04-23
**Priority instruction:** Thoroughness is the only acceptable standard. Speed is irrelevant and must not be traded for depth. Do not mark any area reviewed until you have read its code, its governance rules, its test coverage, and its known defect history. Take as long as you need.

---

## 1. Repository Access

**GitHub Organisation:** `WebWakaOS`
**Repository:** `WebWakaOS/WebWaka`
**Primary branches:**
- `main` — production-deployed, frozen after each milestone gate
- `staging` — continuous integration target; all QA runs against this branch first

**Commit context (as of this brief):** Production deploy achieved on commit `7f5ad53679` (run 24858370773 — 19/19 jobs green). All 22 QA staging checkpoints are green.

---

## 2. What WebWaka OS Is

WebWaka OS is a **multi-tenant, multi-vertical, white-label SaaS platform operating system** built for Africa, starting with Nigeria. It is governance-first: no code ships without corresponding governance documentation.

**Core principles (non-negotiable):**
- Build Once, Use Infinitely — every capability is a reusable primitive
- Nigeria First → Africa First
- Mobile First, PWA First, Offline First
- Vendor-Neutral AI (BYOK capable)
- Edge-native runtime (Cloudflare Workers, D1, KV, R2)

**3-in-1 Platform Pillars:**
| Pillar | What it does | Key apps |
|---|---|---|
| Pillar 1 — Operations Management | POS, float ledger, orders, inventory, staff, USSD | `apps/api`, `apps/admin-dashboard`, `apps/ussd-gateway` |
| Pillar 2 — Branding / Website / Portal | Tenant-branded storefronts, white-label portals | `apps/brand-runtime`, `apps/partner-admin` |
| Pillar 3 — Discovery / Marketplace | Seeded directories, geography search, claim-first onboarding | `apps/public-discovery`, `apps/tenant-public` |
| AI Cross-cutting | Provider-neutral intelligence layer, BYOK, SuperAgent | `packages/superagent`, `packages/ai-abstraction`, `packages/ai-adapters` |

**Runtime stack:** TypeScript, Cloudflare Workers (Hono), D1 (SQLite at edge), KV, R2, React + PWA, Dexie offline sync, pnpm workspaces monorepo.

**Regulatory context (Nigeria):** CBN (banking/KYC), NDPR (data privacy), FIRS (taxation), INEC/electoral, NBA, BPP. All payment amounts are enforced as integer kobo (Invariant P9 — any float value is a P0 bug).

---

## 3. Repository Structure (Orientation)

```
apps/                  — 11 deployable Cloudflare Workers + frontends
  api/                 — Core API (Hono, D1, KV, JWT auth, RBAC)
  platform-admin/      — Super-admin dashboard (port 5000)
  admin-dashboard/     — Tenant admin dashboard
  partner-admin/       — Partner/sub-partner management portal
  public-discovery/    — Public search & discovery frontend
  brand-runtime/       — Tenant-branded storefront/website runtime
  ussd-gateway/        — USSD micro-transaction gateway (Africa's Talking)
  tenant-public/       — Per-tenant discovery listing
  notificator/         — Notification delivery worker (queue consumer)
  projections/         — Data projection workers
  workspace-app/       — Workspace operations app

packages/              — 170+ shared library packages including:
  entities, relationships, entitlements, geography, profiles, workspaces
  offerings, payments, pos, claims, auth, auth-tenancy, identity
  ai-abstraction, ai-adapters, superagent
  notifications, events, logging, otp, offline-sync, search-indexing
  design-system, white-label-theming, shared-config, types
  negotiation, community, social, contact, hl-wallet (HandyLife Wallet)
  verticals/           — 160+ domain-specific vertical packages (farm, clinic,
                         restaurant, pharmacy, hotel, law-firm, mosque, etc.)

infra/                 — Cloudflare config, D1 migrations, k6 load tests
  db/migrations/       — 374+ sequential D1 migrations
  k6/                  — k6 load and smoke test scripts

tests/
  smoke/               — CYCLE-01 smoke tests (15 TC-IDs)
  e2e/api/             — Files 01–21 covering all 8 QA cycles
  e2e/discovery/       — Discovery frontend flows
  e2e/workspace/       — Workspace app e2e
  visual/              — Visual regression (Playwright)

docs/
  governance/          — ALL non-negotiable rules (read before anything else)
  architecture/        — ADRs, canary deployment, decisions log
  qa/                  — QA master prompts, milestone QA reports, CBN/NDPR audits
  milestones/          — M7–M12 milestone frameworks
  enhancements/        — ENHANCEMENT_ROADMAP_v1.0.1.md and per-milestone enhancement logs
  plans/               — Production remediation plans, implementation plans
  reports/             — Phase S00–S05 completion reports
  runbooks/            — Operator and monitoring runbooks
  adr/                 — Architecture Decision Records
  openapi/             — OpenAPI spec documents
```

---

## 4. Critical Context Documents — Read All of These First

The following documents are **mandatory reading** before any review work begins. They contain hard rules, frozen invariants, known defects, and architectural decisions that determine what is a bug vs. intended behaviour.

### 4.1 Governance and Architecture (in `docs/governance/`)
All files are binding. The most important:
- `docs/governance/platform-invariants.md` — the hard invariants that must never be violated (P1–P9 payment rules, G1–G24 global rules, R1–R7 regulatory rules, tenant isolation rules)
- `docs/governance/core-principles.md`
- `docs/governance/security-baseline.md` — JWT scoping rules, RBAC middleware requirements, audit log requirements, secret management
- `docs/governance/entitlement-model.md` — subscription tiers, feature flags, limits
- `docs/governance/ai-policy.md` and `docs/governance/ai-provider-routing.md` — BYOK rules, provider neutrality, quota enforcement
- `docs/governance/partner-and-subpartner-model.md` — multi-tier tenant hierarchy
- `docs/governance/claim-first-onboarding.md` — claim state machine
- `docs/governance/universal-entity-model.md`
- `docs/governance/handylife-wallet-governance.md` — HandyLife Wallet (WF-001 through WF-032), HITL rules, float-to-kobo enforcement
- `docs/governance/white-label-policy.md` — branding isolation rules
- `docs/governance/ai-platform-master-plan.md`
- `docs/governance/webwaka_3in1_core_audit_summary.md` and `webwaka_3in1_remediation_plan.md`

### 4.2 Frozen QA Baseline
These three documents together define the complete test scope and frozen expected behaviours:
- `WebWaka_OS_QA_Test_Matrix.md` — 108 TC-IDs across 8 cycles; every expected result is a regression target
- `WebWaka_OS_QA_Execution_Plan.md` — test cycle sequencing, environment assignments, release gates
- `WebWaka_OS_Corrected_Master_Inventory_v2.md` — frozen platform inventory v2.0; all invariants anchored here

### 4.3 Known Defects and Contradictions
- `CONTRADICTION_SCAN.md` — 316-line report of contradictions found between existing tests and frozen invariants; includes CRITICAL (C-001 through C-020+), WARN, INFO, and RESOLVED classifications. Pay particular attention to `C-001` (float kobo not tested in file 04), `C-002` (expired/tampered JWT not tested in file 01), and all unresolved WARN-level gaps.
- `CYCLE_01_CHECKPOINT_REPORT.md` — results of the first full cycle run; documents which tests passed, which failed, which were deferred
- `HANDOVER.md` and `docs/HANDOVER.md` — agent handover notes documenting known blockers, remaining work, and `apps/api` ESLint errors that were outstanding at time of handover
- `docs/plans/production-remediation-plan-2026-04-10.md` — documented production-specific remediation actions
- `docs/reports/governance-compliance-deep-audit-2026-04-11.md` and `governance-remediation-plan-2026-04-11.md`

### 4.4 Architecture and Implementation
- `ARCHITECTURE.md` — platform architecture overview; Pillar-to-package map
- `docs/architecture/decisions/` — all ADRs; every decision is a review target
- `docs/architecture/canary-deployment.md`
- `docs/milestones/m8a-framework.md` through `m9-m12-framework.md` — upcoming milestone scope
- `docs/enhancements/ENHANCEMENT_ROADMAP_v1.0.1.md` — the existing enhancement roadmap; use this to avoid duplicating suggestions that are already planned
- `WebWaka_Comprehensive_Master_Report.md` — full platform comprehensive report
- `WebWaka_Detailed_Implementation_Plan_P21_P25.md`
- `WebWaka_Verification_Audit_Report.md`
- `WebWaka_OS_Final_Freeze_Validation_Report.md`

### 4.5 Compliance and Security
- `COMPLIANCE_ATTESTATION_LOG.md`
- `SECURITY.md`
- `docs/qa/cbn-kyc-audit.md` — CBN KYC compliance audit
- `docs/qa/ndpr-consent-audit.md` — NDPR consent audit
- `docs/qa/nitda-self-assessment.md`
- `docs/qa/security-review-m7.md`
- `docs/governance/compliance-dashboard.md`

### 4.6 Notification Engine (recently implemented, high complexity)
- `docs/webwaka-notification-engine-final-master-specification-v2.md` — canonical spec v2.1 (all phases 0–9)
- `docs/webwaka-notification-engine-section13-resolution.md` — section 13 architectural decisions
- `docs/webwaka-notification-engine-v2-fix-report.md` and `v2-merge-report.md`
- `docs/notification-engine-audit.md` and `notification-engine-review.md`
- `docs/notification-preference-inheritance.md`
- `docs/notification-template-variable-schema.md`
- `docs/adr/notification-realtime-sse-upgrade-path.md`
- `docs/adr/notification-retention-ttl.md`

### 4.7 Infrastructure Config (check every file)
- `apps/api/wrangler.toml` — D1, KV, R2, Queue, route bindings for staging and production; CRON triggers
- Every `wrangler.toml` in every app — verify binding names match across producers/consumers, environment variable names are consistent, compatibility_date is current
- `infra/db/migrations/` — all 374+ migration files; check sequencing, idempotence, rollback coverage
- `.github/workflows/` — `ci.yml`, `deploy-production.yml`, `deploy-staging.yml`, and any other workflows
- `infra/k6/` — load test thresholds and smoke scripts
- `package.json` (root) and `pnpm-workspace.yaml`
- `playwright.config.ts` and `vitest.workspace.ts`
- `apps/api/migrations/` — the staged migration copies used by wrangler

### 4.8 Financial and Wallet
- `docs/handylife-wallet-master-plan.md`
- `docs/governance/handylife-wallet-governance.md`
- All files referencing `hl-wallet`, `WF-0xx` codes, `kobo`, `HITL`, `bank_transfer`, `float_account`

---

## 5. Review Scope and Deliverables

Your review must cover ALL of the following areas. Do not skip or summarise any area without having read the relevant code and documentation. Produce a separate findings section for each area.

### 5.1 Security Review
- JWT validation: algorithm pinning, expiry enforcement, tampered-token rejection, `alg:none` attack surface
- Tenant isolation: every D1 query must be scoped by `tenant_id`; any cross-tenant data leak is a P0
- RBAC middleware: 5-layer stack enforcement (platform, partner, sub-partner, tenant, user); privilege escalation paths
- CSRF protection on all state-mutating endpoints
- Secret management: any secret in source code, `.env` committed, or wrangler var that should be a secret
- Rate limiting: coverage across all public and authenticated endpoints; bypass paths
- Input validation: SQL injection surface, schema-less JSON body handling, oversize payload handling
- Audit log coverage: all destructive and financial operations must produce audit records
- Session management: token refresh race conditions, logout-invalidation gaps

### 5.2 Data Integrity and Financial Correctness
- **Invariant P9** (CRITICAL): every amount field in every handler, every migration, every package must be integer kobo. Trace all flows from UI input → API → DB → response. Any float path is a P0 bug.
- Payment FSM completeness: bank transfer states (INITIATED → PENDING → SETTLED / FAILED / EXPIRED / CANCELLED) — are all transitions handled? Are there orphaned states?
- HandyLife Wallet (WF-001 through WF-032): HITL approval flow, float ledger integrity, wallet-to-bank settlement, withdrawal limits
- Idempotency: all payment and wallet endpoints must have idempotency key enforcement; identify any endpoints missing this
- D1 migration integrity: are there any migrations that could produce data loss, type coercion errors, or leave orphaned rows?
- Kobo precision: identify any place where amounts are divided, multiplied, or formatted before storage (should never happen before DB write)

### 5.3 Multi-Tenancy and Isolation
- Verify that every single D1 query in every handler includes a `tenant_id` filter
- Check entitlement enforcement: are feature-gated capabilities actually gated at the middleware layer, or only at the UI?
- Partner hierarchy: does `partner_id → sub_partner_id → tenant_id` scoping hold throughout all APIs?
- White-label isolation: can one tenant's branding bleed into another's brand-runtime responses?
- KV namespace scoping: are all KV reads/writes tenant-keyed?

### 5.4 API Design and Contract Quality
- Review every route in `apps/api/src/` for: correct HTTP methods, consistent error shapes, missing 404/403/422 responses, incomplete OpenAPI annotations
- Check `docs/openapi/` against actual route implementations for drift
- Identify any routes that return 200 on partial failures (silent failure pattern)
- Identify any routes missing validation middleware
- Check all paginated endpoints for consistent cursor/offset patterns, missing `total` counts, max-page-size enforcement

### 5.5 AI Layer Review
- BYOK enforcement: can a user bypass the platform's AI quota using their own key without the platform knowing?
- Provider neutrality: is any part of the codebase hardcoded to a specific AI provider?
- AI quota enforcement: are `ai_credits_remaining` checks atomic, or is there a TOCTOU race?
- SuperAgent: review `packages/superagent/` for prompt injection surface, context leakage between tenants, and missing HITL gates
- AI billing: are all AI calls billed to the correct tenant?
- Review `docs/governance/ai-capability-matrix.md` against implementation

### 5.6 Notification Engine (Phases 0–9)
- Trace the full notification pipeline: trigger → queue producer → notificator consumer → channel dispatcher → delivery confirmation → dead-letter handling
- Check every channel (email, SMS, in-app, push, WhatsApp, webhook, digest): are provider errors retried correctly? Is the retry backoff implemented?
- Preference inheritance: does `user override → tenant default → platform default` resolution work correctly in all edge cases?
- Idempotency on notification delivery: can the same notification be delivered twice if the queue retries?
- Dead-letter sweep: is the runbook implemented in code? Is there a CRON or scheduled trigger?
- SSE upgrade path (ADR): is the real-time path correctly falling back to polling for environments without SSE support?
- Template variable injection: is there any path where an unresolved variable `{{name}}` is sent to an end user?
- Multi-tenant queue isolation: can one tenant's notification burst starve another's?

### 5.7 Offline Sync and PWA
- Review `packages/offline-sync/`: conflict resolution strategy, sync queue ordering, handling of network restoration during an active transaction
- Service worker: check cache invalidation strategy — is there a scenario where a user sees stale data for too long after a schema-breaking update?
- USSD gateway: review `apps/ussd-gateway/` session state management, timeout handling, and re-entry idempotence; check Africa's Talking integration for double-delivery risk
- Offline POS: can a POS transaction committed offline create a duplicate when it syncs?

### 5.8 Geography and Vertical Coverage
- Review `packages/geography/`: is the place hierarchy (country → state → LGA → ward → polling unit) complete and consistent with the political taxonomy?
- `docs/reports/phase-s01-geography-reconciliation-completion-report-2026-04-21.md` — read this; verify the reconciliation is reflected in code
- Verticals: with 160+ vertical packages, check a representative sample (farm, clinic, hotel, restaurant, pos-business, cooperative, government-agency) for: correct entity model inheritance, missing fields vs. the `docs/governance/verticals-master-plan.md`, and any vertical that imports from a sibling vertical (should use shared `packages/entities` instead)
- `docs/governance/verticals-dependency-dag.md` — verify no circular imports

### 5.9 Claims and Discovery
- Claim state machine: `seeded → claimable → claimed → verified` — are all transitions server-enforced or can a client skip states?
- Public discovery: are unauthenticated searches correctly returning only publicly visible profiles?
- Claim-first onboarding: review `docs/governance/claim-first-onboarding.md` against `apps/public-discovery/` implementation
- Migration 0374 (`0374_s14_claim_readiness.sql`) was recently applied to production — verify the `claim_state` transition UPDATE ran correctly and that no profiles remain in `seeded` state that should be `claimable`

### 5.10 CI/CD and Infrastructure
- Review all GitHub Actions workflows in `.github/workflows/`
- Verify `deploy-production.yml`'s `Guard 0374 idempotence` step (the most recent change) is correct and does not accidentally mark future migrations as applied
- Check that concurrency groups prevent race conditions between overlapping deploys
- Verify D1 migration staging step correctly excludes rollback files, LFS pointers, and oversized seeds
- Check wrangler.toml CRON triggers — is the negotiation expiry CRON correctly omitted from staging (account limit) and present in production?
- Verify all `CLOUDFLARE_API_TOKEN`, `JWT_SECRET`, `INTER_SERVICE_SECRET`, `SMOKE_API_KEY` secrets are provisioned in all required environments
- Are there any environment variables referenced in code that are missing from any `wrangler.toml`?

### 5.11 Test Coverage Gaps
- Using `CONTRADICTION_SCAN.md` as a starting point, identify any CRITICAL or WARN items that remain unresolved
- Check `tests/e2e/api/04-payments.e2e.ts` — Contradiction C-001 states it lacks float kobo rejection assertions; confirm whether this was patched or remains open
- Identify any of the 108 TC-IDs from the QA matrix that have no automation and no manual test record
- The two deferred items (D11 USDT precision, partner-admin AI integration) — confirm they are cleanly excluded with placeholder tickets, not silently dropped
- Review `infra/k6/` smoke scripts against the QA matrix's performance acceptance criteria (p95 < 2000ms threshold was applied — verify this is the correct threshold for production)

### 5.12 Code Quality and Technical Debt
- TypeScript strictness: look for `any` type escapes, missing return type annotations, unsafe casts — particularly in payment and auth code
- `apps/api` ESLint errors — `HANDOVER.md` §3a flags these as outstanding; confirm whether they are resolved or still present
- Unused exports, dead code paths, and packages that are imported but empty
- Package boundary violations: does any app import directly from another app (should only import from `packages/*`)?
- Circular dependency risk across the 170+ packages
- Missing error boundary handling in React components (brand-runtime, workspace-app, public-discovery)
- Inconsistent error logging: are all errors logged with tenant context, or are some errors swallowed silently?

---

## 6. Enhancement Suggestions — Scope and Approach

After completing the issue and bug review, produce a separate enhancements section. **Before suggesting any enhancement, first read `docs/enhancements/ENHANCEMENT_ROADMAP_v1.0.1.md` and `docs/milestones/m8a-framework.md` through `m9-m12-framework.md` to confirm the enhancement is not already planned.** Only suggest net-new enhancements.

Produce **at minimum 30 enhancement suggestions** covering the following domains:

1. **Developer Experience** — monorepo tooling, local development setup, hot reload, seed data automation
2. **Observability** — structured logging improvements, distributed tracing across Workers, Cloudflare Analytics integration, custom dashboards for tenant health
3. **Security Hardening** — beyond current baseline (e.g. request signing between workers, WAF rule recommendations, automated secret rotation, dependency supply-chain scanning)
4. **Performance** — edge caching strategy, D1 read replica patterns, KV cache warming, query optimisation opportunities, bundle size for PWA apps
5. **AI Layer** — new AI capabilities, improved BYOK UX, AI cost attribution dashboards, model fallback chains, fine-tuning pipeline hooks
6. **Offline and USSD** — enhanced conflict resolution, USSD session recovery, offline analytics queuing, background sync UX improvements
7. **Notification Engine** — new channels, intelligent digest scheduling, A/B testing for notification copy, notification analytics dashboard
8. **Multi-tenancy** — tenant onboarding automation, self-serve partner provisioning, usage metering dashboard, white-label domain provisioning
9. **Financial** — open banking API integration, reconciliation automation, VAT/FIRS filing hooks, multi-currency groundwork (post-USDT decision)
10. **Discovery and Marketplace** — enhanced search (semantic search, geospatial ranking), aggregated marketplace analytics, claim verification automation, review and rating system, B2B RFQ/PO workflow improvements
11. **Verticals** — vertical-specific feature gaps, cross-vertical data sharing patterns, vertical-specific AI prompts, missing vertical coverage for Nigerian market
12. **Governance and Compliance** — automated compliance reporting, NDPR data subject request automation, audit log export, SOC2 readiness gaps
13. **Testing Infrastructure** — contract testing between workers, chaos engineering hooks, production replay testing, visual regression coverage expansion
14. **Platform Economics** — marketplace commission engine, revenue share automation, usage-based billing pipeline, partner analytics portal

For each enhancement, provide:
- A clear title
- Which platform area it affects
- The user/operator problem it solves
- An estimated complexity (Low / Medium / High)
- Whether it is a prerequisite for anything else

---

## 7. Output Format

Produce your review as a structured report with the following top-level sections:

```
# WebWaka OS — Deep Review Report
[Date and agent identification]

## Executive Summary
[Top 10 most critical findings in one paragraph each]

## Section A — Critical Bugs (P0 blockers — must fix before next production deploy)
## Section B — High-Severity Issues (P1 — fix within current milestone)
## Section C — Medium-Severity Issues (P2 — fix in next milestone)
## Section D — Low-Severity / Code Quality (P3 — backlog)
## Section E — Security-Specific Findings (ranked by severity)
## Section F — Compliance-Specific Findings (CBN, NDPR, FIRS, NBA, BPP)
## Section G — Test Coverage Gaps and Contradiction Status
## Section H — Infrastructure and CI/CD Findings
## Section I — Enhancement Proposals (minimum 30, grouped by domain)
## Section J — Recommended Immediate Actions (ordered action list for the next sprint)
```

Each finding must include:
- Finding ID (e.g. `BUG-001`, `SEC-003`, `ENH-012`)
- Severity
- Affected file(s) or package(s)
- Governance invariant or TC-ID violated (if applicable)
- Description
- Evidence (file path, line reference, or query result)
- Recommended fix or action

---

## 8. Operating Rules for This Review

1. **Read the governance docs in `docs/governance/` before reviewing any code.** The governance rules define what is correct — code that contradicts governance is a bug, not a design choice.
2. **Treat `WebWaka_OS_Corrected_Master_Inventory_v2.md` as the frozen baseline.** Any deviation is a defect.
3. **Do not suggest changes to the frozen QA test matrix.** If a test fails, it is a code bug, not a matrix error.
4. **Do not suggest deviating from the multi-agent model** described in `AGENTS.md`. Enhancement suggestions must be implementable within the existing agent coordination model.
5. **Financial invariants are absolute.** P9 (integer kobo), P1–P8, and all WF-0xx wallet rules are non-negotiable. Any finding that touches money must be classified at P0 or P1 minimum.
6. **Tenant isolation is a hard security boundary.** Any cross-tenant data access finding is automatically P0.
7. **Do not suggest enhancements that require changing the runtime stack** (e.g. moving off Cloudflare Workers, replacing D1) unless you have found a specific capability gap that cannot be addressed within the current stack, and even then frame it as a long-term ADR candidate, not an immediate action.
8. **When in doubt about whether something is a bug or a feature, read `docs/governance/platform-invariants.md` first**, then `CONTRADICTION_SCAN.md`, then file a finding with your reasoning.

---

## 9. Time and Depth Expectation

There is no deadline on this review. The platform has:
- 11 deployable apps
- 170+ packages (including 160+ vertical domain packages)
- 374+ D1 migrations
- 108 QA test cases across 8 cycles
- 21 e2e test files
- Extensive governance documentation across 35+ governance docs
- A multi-phase notification engine (phases 0–9)
- A 3-in-1 product model with distinct pillar-specific rules
- Nigerian regulatory compliance requirements across 6 regulatory bodies

A superficial review would be worse than no review — it would create false confidence. Every app, every package, and every governance rule must be read and checked. If you cannot cover something in depth, say so explicitly and explain what prevented you from completing it. Partial coverage must be declared, not implied.

---

## 10. Starting Point Recommendation

Begin your review in this order:

1. Read all governance documents (`docs/governance/`) — establish what "correct" means
2. Read `WebWaka_OS_Corrected_Master_Inventory_v2.md` — establish the frozen baseline
3. Read `CONTRADICTION_SCAN.md` — understand known pre-existing contradictions
4. Read `HANDOVER.md` and `docs/HANDOVER.md` — understand what was left unresolved
5. Read all `wrangler.toml` files across all apps — map the infrastructure surface
6. Review `apps/api/src/` — the core API is the highest blast-radius surface
7. Review `packages/payments/`, `packages/hl-wallet/`, `packages/auth/`, `packages/auth-tenancy/` — financial and auth packages first
8. Review `packages/superagent/` and `packages/ai-abstraction/` — AI layer
9. Review `apps/notificator/` and the notification engine packages
10. Sample-review 10 representative vertical packages
11. Review all test files in `tests/`
12. Review all CI/CD workflows in `.github/workflows/`
13. Produce your enhancement proposals last, after the full bug review is complete
