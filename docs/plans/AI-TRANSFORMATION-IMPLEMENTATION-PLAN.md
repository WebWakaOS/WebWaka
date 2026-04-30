# WebWaka OS — AI Transformation Implementation Plan
## Phase-by-Phase Execution Blueprint (Derived from AI Transformation OS Audit Report)

**Source of Truth:** `WebWaka_AI_Transformation_OS_Audit_Report.md` (branch: `audit-report-2026-01`)
**Repository:** `WebWakaOS/WebWaka` · branch `staging`
**Plan Date:** April 28, 2026
**Current HEAD:** `0fe60b5` (staging)
**Evidence Standard:** Every task references exact files. Every claim is verifiable from repo state.
**Principle:** Thoroughness > Speed. Zero drift. Zero skipped context. Zero partial verification.

---

## Plan Governance Rules

For **every phase** in this plan, the executing agent MUST enforce this sequence:

1. **REVIEW** — Read 100% of all relevant repo files, documents, prior reports, and context materials listed for that phase.
2. **UNDERSTAND** — Fully comprehend the task, dependencies, constraints, and intended end-state before proposing actions.
3. **RESEARCH** — Conduct online research to confirm best practices, safer implementation patterns, and relevant technical standards.
4. **IMPLEMENT** — Execute the phase fully with no partial delivery, no shortcuts, and no assumption-based drift.
5. **TEST & VERIFY** — Test, verify, bug-fix, and re-test until all identified issues are resolved 100%.
6. **PUSH & HANDOFF** — Push to GitHub staging; clearly identify the exact next phase with its prerequisites.

---

## Current State Summary (Verified April 28, 2026)

| Metric | Value | Source |
|--------|-------|--------|
| Apps | 12 directories in `apps/` | `ls -d apps/*/` |
| Packages | 199 directories in `packages/` | `ls -d packages/*/` |
| Vertical packages | 159 `packages/verticals-*/` | Counted |
| Migrations (infra/db) | 419 SQL files (excluding rollbacks) | Counted |
| SuperAgent tools | 15 files in `packages/superagent/src/tools/` | Counted |
| Router.ts lines | 1,033 | `wc -l apps/api/src/router.ts` |
| API tests | 2,660 passing (176 files) | `pnpm --filter @webwaka/api test` |
| TypeScript | Clean across all packages | `pnpm typecheck` |
| auth-tenancy | Re-exports from @webwaka/auth (no longer empty stub) | Verified |
| Support groups | Fully implemented (23 routes, 24 tests) | Verified |
| Fundraising | Fully implemented (24 routes, 24 tests) | Verified |
| Notification engine | Rule-based with 55 templates, 27 rules | Verified |

### What Has Changed Since the Audit (January 28, 2026)

1. `@webwaka/auth-tenancy` — No longer an empty stub; now re-exports `@webwaka/auth`
2. SuperAgent tools — Increased from 8 to 15 (create-booking, create-invoice, customer-lookup, get-active-offerings, inventory-check, pos-recent-sales, schedule-availability, send-notification, update-inventory)
3. Support Groups + Fundraising — Fully implemented with tests, routes, events, notification integration
4. Notification Engine — Expanded with rule-based processing, 7 channels, templates
5. Router.ts — Reduced from 1,207 to 1,033 lines
6. Migrations — Relocated from `apps/api/migrations/` to `infra/db/migrations/` with renumbering
7. Multiple QA and governance passes completed (see `docs/reports/`)

---

## Phase Dependency Graph

```
Phase 0: Architecture Correction & Guardrails
    └── Phase 1: Vertical Consolidation (depends on Phase 0)
         └── Phase 4: Vertical & Module AI Adaptation (depends on Phase 1, Phase 3)

Phase 0: Architecture Correction & Guardrails
    └── Phase 2: Frontend Rebuild (depends on Phase 0, parallel with Phase 1)
         └── Phase 3: AI-Native Core Enablement (depends on Phase 2 scaffold)
              └── Phase 4: Vertical & Module AI Adaptation (depends on Phase 1, Phase 3)
                   └── Phase 5: QA, Rollout, Migration, Stabilization (depends on all)
```

---

## PHASE 0: Architecture Correction & Guardrails
**Duration:** 2–3 weeks
**Priority:** CRITICAL — Must complete before any other phase

### 0.1 Objectives

- Fix POS route entitlement gap (F-001 compliance risk)
- Resolve duplicate vertical packages (gym/gym-fitness, laundry/laundry-service)
- Fix apps/api lint errors blocking CI
- Split router.ts into domain-grouped files (reduce merge conflicts)
- Verify and harden CI pipeline
- Confirm production deployment readiness

### 0.2 Scope & Affected Areas

| Area | Files |
|------|-------|
| POS entitlement | `apps/api/src/router.ts` lines around POS mount |
| Duplicate verticals | `packages/verticals-gym/`, `packages/verticals-gym-fitness/`, `packages/verticals-laundry/`, `packages/verticals-laundry-service/` |
| Router split | `apps/api/src/router.ts` → domain-grouped files |
| Lint fixes | `apps/api/src/routes/*.ts` |
| CI | `.github/workflows/*.yml` |

### 0.3 Documents to Review Before Implementation

1. `apps/api/src/router.ts` — Full file, identify POS routes and entitlement guards
2. `packages/entitlements/src/plan-config.ts` — Understand plan matrix
3. `docs/governance/platform-invariants.md` — Confirm P1-P8, T1-T10 invariants
4. `docs/reports/production-readiness-audit-2026-04-10.md` — Prior audit findings
5. `docs/reports/governance-compliance-deep-audit-2026-04-11.md` — Compliance gaps
6. `packages/verticals-gym/src/index.ts` and `packages/verticals-gym-fitness/src/index.ts` — Compare for duplication
7. `packages/verticals-laundry/src/index.ts` and `packages/verticals-laundry-service/src/index.ts` — Compare
8. `.github/workflows/` — All 9 workflow files
9. `CONTRIBUTING.md` — Development standards
10. `docs/governance/niche-alias-deprecation-registry.md` (if exists) — Canonical vertical decisions

### 0.4 Required Online Research

- Hono v4 route grouping best practices for large APIs (2025-2026)
- Cloudflare Workers ESLint `no-unnecessary-type-assertion` fix patterns
- Monorepo package deprecation strategies (pnpm workspace)
- Cloudflare DNS cutover zero-downtime patterns

### 0.5 Implementation Tasks

| # | Task | File(s) | Acceptance Criteria |
|---|------|---------|---------------------|
| 0.1 | Add `requireEntitlement(PlatformLayer.Operational)` to all POS route mounts | `apps/api/src/router.ts` | Free-tier users receive 403 on `/pos/*` |
| 0.2 | Merge `verticals-gym` into `verticals-gym-fitness` (canonical) | Both packages | Single package remains; alias redirect in router |
| 0.3 | Merge `verticals-laundry` into `verticals-laundry-service` (canonical) | Both packages | Single package remains; alias redirect in router |
| 0.4 | Fix all ESLint errors in `apps/api` | Multiple route files | `pnpm --filter @webwaka/api lint` passes with 0 errors |
| 0.5 | Split `router.ts` into domain-grouped registration files | New files: `apps/api/src/route-groups/` | Each domain has its own registration file; router.ts imports and mounts |
| 0.6 | Add consistent API versioning comment/header | All route groups | Clear documentation of versioning strategy |
| 0.7 | Verify all CI workflows pass | `.github/workflows/` | All 9 workflows green on staging |
| 0.8 | Provision `SMOKE_API_KEY` GitHub secret if missing | GitHub Settings | Smoke tests can authenticate |

### 0.6 Testing & Verification Tasks

| # | Test | Command/Method | Expected Result |
|---|------|----------------|-----------------|
| T0.1 | POS entitlement enforcement | `curl` with free-tier JWT to `/pos/*` | HTTP 403 |
| T0.2 | POS access with valid plan | `curl` with starter+ JWT to `/pos/*` | HTTP 200 |
| T0.3 | Gym vertical still accessible after merge | `curl` to `/gym/*` endpoint | Valid response (alias works) |
| T0.4 | Full test suite passes | `pnpm --filter @webwaka/api test` | 2660+ tests pass |
| T0.5 | Full lint passes | `pnpm --filter @webwaka/api lint` | 0 errors |
| T0.6 | Full typecheck passes | `pnpm --filter @webwaka/api typecheck` | 0 errors |
| T0.7 | All governance checks pass | `pnpm governance:check` (or equivalent) | All green |
| T0.8 | Smoke tests pass | `pnpm test:smoke` | All suites green |

### 0.7 QA Gates

- [ ] POS entitlement gap closed (F-001 resolved)
- [ ] Zero duplicate vertical packages
- [ ] ESLint clean across apps/api
- [ ] Router.ts split into maintainable domain files
- [ ] All 2660+ tests passing
- [ ] TypeScript clean
- [ ] CI pipeline fully green
- [ ] No regression in any existing functionality

### 0.8 GitHub Push/Checkpoint

- Branch: `staging`
- Commit message format: `fix(phase-0): <description>`
- After push: tag as `phase-0-complete`
- Verify: CI passes on pushed commit

### 0.9 Next-Phase Handoff

**Next:** Phase 1 (Vertical Consolidation) OR Phase 2 (Frontend Rebuild) — these can run in parallel.
**Prerequisites for Phase 1:** Router.ts must be split (task 0.5); duplicate verticals resolved (tasks 0.2, 0.3).
**Prerequisites for Phase 2:** API stability confirmed (all tests pass); design system package reviewed.

---

## PHASE 1: Vertical Consolidation
**Duration:** 3–4 weeks
**Priority:** HIGH — Reduces maintenance surface by 90%
**Depends on:** Phase 0 complete

### 1.1 Objectives

- Create `@webwaka/vertical-engine` package — configuration-driven vertical management
- Replace 159 individual vertical packages with a schema-driven registry
- Maintain 100% API compatibility during migration
- Reduce route-mounting code from ~500 lines to ~10 lines

### 1.2 Scope & Affected Areas

| Area | Files |
|------|-------|
| New package | `packages/vertical-engine/` (create) |
| Vertical registry | `packages/vertical-engine/src/registry.ts` (create) |
| AI config integration | `packages/superagent/src/vertical-ai-config.ts` (extend as registry source) |
| Route mounting | `apps/api/src/route-groups/verticals.ts` (refactor) |
| Deprecation | All 159 `packages/verticals-*/` (mark deprecated) |

### 1.3 Documents to Review Before Implementation

1. `packages/superagent/src/vertical-ai-config.ts` — All 159 vertical AI configs (already config-driven)
2. Sample verticals (at least 5): `packages/verticals-bakery/src/`, `packages/verticals-hotel/src/`, `packages/verticals-pharmacy/src/`, `packages/verticals-politician/src/`, `packages/verticals-church/src/`
3. `apps/api/src/router.ts` — Current vertical route mounting pattern
4. `packages/vertical-events/` — Vertical-specific event helpers
5. `docs/governance/platform-invariants.md` — P1 (Build Once Use Infinitely)
6. `packages/entitlements/src/plan-config.ts` — Plan-gated vertical access
7. Any existing `docs/architecture/decisions/` ADRs about verticals
8. `WebWaka_AI_Transformation_OS_Audit_Report.md` Section 5.1-5.2 (drift analysis)

### 1.4 Required Online Research

- Configuration-driven multi-tenant vertical/module systems in TypeScript (2025-2026)
- Schema-driven REST API route generation with Hono
- D1 SQLite generic CRUD patterns for dynamic schemas
- Feature flag patterns for gradual migration (old → new) in monorepos
- Cloudflare Workers dynamic module resolution limitations

### 1.5 Implementation Tasks

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 1.1 | Analyze all 159 verticals — extract common patterns (FSM states, fields, validations) | Pattern report documenting commonalities and exceptions |
| 1.2 | Design `VerticalConfig` schema type (fields, FSM, AI caps, compliance rules, entitlements) | TypeScript interface that can express any of the 159 verticals |
| 1.3 | Create `@webwaka/vertical-engine` package scaffold | Package with `tsconfig.json`, `vitest.config.ts`, `package.json` |
| 1.4 | Implement schema-driven model definition (from VerticalConfig → D1 CRUD operations) | Given a config, generates create/read/update/list/archive operations |
| 1.5 | Implement generic route generator (from VerticalConfig → Hono route handlers) | Given a config, produces standard REST endpoints |
| 1.6 | Implement generic test generator (from VerticalConfig → vitest assertions) | Given a config, produces test suite verifying CRUD + auth + T3 |
| 1.7 | Migrate `vertical-ai-config.ts` entries to be the source of truth for all vertical behavior | Single config file defines schema + FSM + AI + compliance per vertical |
| 1.8 | Create `vertical-registry.json` or `.ts` with all 159 vertical definitions | Complete registry replaces 159 packages |
| 1.9 | Implement dynamic route mounting: `registerVerticalRoutes(app, registry)` | Router uses registry instead of 159 individual imports |
| 1.10 | Add feature flag: `X-Use-Engine: 1` header to route through new engine during migration | Both old and new paths operational simultaneously |
| 1.11 | Run dual-path comparison tests (call both old and new, diff responses) | Zero response differences for all 159 verticals |
| 1.12 | Deprecate individual `@webwaka/verticals-*` packages (add deprecation notice) | All 159 packages marked deprecated in package.json |

### 1.6 Testing & Verification Tasks

| # | Test | Expected Result |
|---|------|-----------------|
| T1.1 | Engine generates correct CRUD for sample vertical (bakery) | Create, read, update, list, archive all work |
| T1.2 | Engine-generated routes match existing vertical routes exactly | API contract comparison shows 0 differences |
| T1.3 | T3 tenant isolation enforced in engine-generated queries | Cross-tenant access impossible |
| T1.4 | Engine respects entitlement gating per vertical | Free-tier blocked from premium verticals |
| T1.5 | All 159 vertical E2E tests pass against engine routes | Zero regression |
| T1.6 | Dual-path comparison (old vs new) for all verticals | Zero response differences |
| T1.7 | Feature flag routing works correctly | `X-Use-Engine: 1` → engine path; without → legacy path |

### 1.7 QA Gates

- [ ] `@webwaka/vertical-engine` package has comprehensive test suite
- [ ] All 159 verticals expressible in new config format
- [ ] API contract parity proven via automated comparison
- [ ] No regression in existing functionality
- [ ] Dual-path tests green for 2+ weeks before removing old path
- [ ] Performance: engine-generated routes within 5% latency of hand-coded routes

### 1.8 GitHub Push/Checkpoint

- Branch: `staging`
- Commit messages: `feat(vertical-engine): <description>`
- After push: tag as `phase-1-complete`
- Keep old packages for 2 sprints minimum as rollback path

### 1.9 Next-Phase Handoff

**Next:** Phase 4 (Vertical AI Adaptation) — after Phase 3 provides AI tools
**Parallel:** Phase 2 (Frontend) can run simultaneously
**Prerequisites for Phase 4:** Vertical engine stable; SuperAgent tool registry complete (Phase 3)

---

## PHASE 2: Frontend Rebuild
**Duration:** 6–8 weeks
**Priority:** HIGH — Platform is API-only for most user categories
**Depends on:** Phase 0 complete (API stability confirmed)
**Can parallel with:** Phase 1

### 2.1 Objectives

- Production-ready React SPAs for all user categories
- Shared component library (`@webwaka/ui`)
- AI-ready UI patterns (inline assist, copilot panel placeholders)
- Mobile-first, PWA-installable, offline-capable
- HITL approval widget in admin dashboard

### 2.2 Scope & Affected Areas

| Area | Action |
|------|--------|
| `packages/ui/` | CREATE — shared React component library |
| `apps/admin-dashboard/` | REBUILD — React SPA (Vite) |
| `apps/public-discovery/` | REBUILD — React SPA with SSR/SSG |
| `apps/brand-runtime/` | BUILD — WakaPage rendering engine |
| `apps/workspace-app/` | EXPAND — Vertical views, AI copilot, analytics |
| `apps/partner-admin/` | REBUILD — React SPA |

### 2.3 Documents to Review Before Implementation

1. `packages/design-system/src/` — Existing CSS tokens and patterns
2. `packages/wakapage-blocks/` — Block type definitions
3. `packages/white-label-theming/` — Theming infrastructure
4. `packages/frontend/` — Existing composition utilities
5. `packages/ui-error-boundary/` — Existing error boundary
6. `apps/workspace-app/src/` — Existing React PWA (32 files)
7. `apps/admin-dashboard/src/` — Current shell state
8. `apps/public-discovery/src/` — Current shell state
9. `apps/brand-runtime/src/` — Current theme resolution logic
10. `packages/offline-sync/` — Offline sync patterns
11. `docs/governance/platform-invariants.md` — P4 (Mobile First), P6 (Offline First)
12. API route files — All endpoints that frontends will consume

### 2.4 Required Online Research

- React 19 + Vite 6 PWA patterns for Cloudflare Workers (2026)
- Offline-first React patterns with IndexedDB (Dexie.js) and Background Sync
- Accessible design system component libraries (mobile-first, 360px baseline)
- WakaPage/block-editor architecture patterns (similar to Notion/Framer)
- Cloudflare Workers + React SSR/streaming patterns
- HITL approval UI best practices for AI systems
- Tailwind CSS v4 + Shadcn/ui component patterns for enterprise dashboards

### 2.5 Implementation Tasks

#### 2.5.1 Shared UI Library (`@webwaka/ui`)

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 2.1 | Scaffold `@webwaka/ui` package (React, TypeScript, Storybook) | Package builds; Storybook serves |
| 2.2 | Implement core components: Button, Input, Select, Modal, Table, Card, Badge, Avatar | All components render at 360px+ |
| 2.3 | Implement layout components: Sidebar, Header, PageLayout, MobileNav | Responsive from 360px to 1440px |
| 2.4 | Implement data visualization: Chart (line/bar/pie), StatCard, MetricGrid | Charts render with sample data |
| 2.5 | Implement forms: FormField, DatePicker, FileUpload, SearchInput | All accessible (WCAG 2.1 AA) |
| 2.6 | Implement AI-specific: AICopilotPanel, AIAssistField, AIActionButton | Components render with placeholder states |
| 2.7 | Apply design tokens from `@webwaka/design-system` | Consistent theming across all components |

#### 2.5.2 Admin Dashboard Rebuild

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 2.8 | Scaffold admin-dashboard as React SPA (Vite, React Router) | App builds and serves |
| 2.9 | Implement auth flow (login, session management, RBAC) | Admin/super_admin can log in |
| 2.10 | Implement tenant management views (list, detail, activate/suspend) | CRUD operations work |
| 2.11 | Implement vertical activation/deactivation UI | Can enable/disable verticals per tenant |
| 2.12 | Implement analytics dashboards (workspace metrics, revenue, growth) | Charts populate from API data |
| 2.13 | Implement HITL approval widget (pending AI actions, approve/reject/modify) | Queue items display; actions work |
| 2.14 | Implement support ticket queue | Tickets listable, assignable, resolvable |
| 2.15 | Implement AI usage monitoring (spend per tenant, provider health) | Real-time WakaCU usage visible |

#### 2.5.3 Public Discovery Rebuild

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 2.16 | Scaffold public-discovery as React app with SSR | App renders on server and hydrates |
| 2.17 | Implement geography-powered search (state → LGA → ward) | Drill-down navigation works |
| 2.18 | Implement category browse (by vertical type) | All vertical categories browseable |
| 2.19 | Implement listing pages (business profiles, offerings) | Individual profile pages render |
| 2.20 | Implement claim CTA (unclaimed profiles prompt verification) | Claim flow initiates correctly |
| 2.21 | Implement responsive mobile layout (360px → 1440px) | No horizontal scroll at any viewport |
| 2.22 | Implement SEO (meta tags, structured data, sitemap) | Lighthouse SEO score > 90 |

#### 2.5.4 Brand Runtime Page Builder

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 2.23 | Implement WakaPage block renderer (using `@webwaka/wakapage-blocks` types) | All block types render correctly |
| 2.24 | Implement template browser (list, preview, install) | Templates browseable and installable |
| 2.25 | Implement storefront product views (offerings display) | Products display with prices |
| 2.26 | Implement tenant-branded theming (from `@webwaka/white-label-theming`) | Each tenant's brand applies correctly |

#### 2.5.5 Workspace App Expansion

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 2.27 | Add per-vertical operation views (auto-generated from vertical config) | Vertical CRUD works in UI |
| 2.28 | Add AI copilot panel (conversational assistant sidebar) | Panel opens; messages send to SuperAgent |
| 2.29 | Add analytics page (workspace metrics, charts) | Data populates from API |
| 2.30 | Add settings page (workspace config, team management, billing) | All settings editable |
| 2.31 | Add notification center (in-app notifications from notificator) | Notifications display and mark-read |

### 2.6 Testing & Verification Tasks

| # | Test | Expected Result |
|---|------|-----------------|
| T2.1 | Lighthouse scores for all apps | Performance > 90, Accessibility > 90, SEO > 90 |
| T2.2 | Playwright E2E for admin dashboard critical paths | Login → navigate → action → verify |
| T2.3 | Mobile viewport testing (360px, 414px, 768px) | No layout breaks |
| T2.4 | Offline mode: workspace-app works without network | Core journeys complete offline |
| T2.5 | PWA install flow works on Chrome/Safari mobile | App installs and launches |
| T2.6 | Visual regression (Playwright snapshots) | No unintended visual changes between commits |
| T2.7 | HITL widget E2E: submit → queue → approve → verify | Full flow works |

### 2.7 QA Gates

- [ ] All 4 SPAs build without errors
- [ ] Lighthouse scores > 90 (performance, accessibility)
- [ ] Mobile-first verified at 360px
- [ ] PWA installable on mobile Chrome and Safari
- [ ] HITL approval flow works end-to-end
- [ ] No CORS or API connection issues
- [ ] Offline sync works for workspace-app
- [ ] All E2E test suites pass

### 2.8 GitHub Push/Checkpoint

- Branch: `staging`
- Commit messages: `feat(frontend): <description>`
- Sub-checkpoints: push after each app rebuild (admin-dashboard, public-discovery, brand-runtime, workspace-app)
- After all: tag as `phase-2-complete`

### 2.9 Next-Phase Handoff

**Next:** Phase 3 (AI-Native Core) — requires admin-dashboard HITL widget scaffolded
**Prerequisites for Phase 3:** HITL widget in admin-dashboard at least scaffolded (task 2.13)

---

## PHASE 3: AI-Native Core Enablement
**Duration:** 4–6 weeks
**Priority:** HIGH — Transforms platform from API-with-chat to AI-native OS
**Depends on:** Phase 2 admin-dashboard scaffolded (HITL widget)

### 3.1 Objectives

- Complete SuperAgent from single-turn to multi-turn agentic workflows
- Implement all remaining AI capabilities with tool execution
- Build functional HITL approval flow (queue → UI → action → audit)
- Deploy AI background jobs
- Create Inline AI SDK for frontend

### 3.2 Scope & Affected Areas

| Area | Action |
|------|--------|
| `packages/superagent/` | MAJOR REFACTOR — Agent loop, tool completion |
| `packages/ai-abstraction/` | IMPROVE — Streaming, multi-modal contracts |
| `packages/ai-adapters/` | IMPROVE — Retry, circuit-breaker, health checks |
| `apps/api/src/routes/superagent.ts` | EXTEND — Multi-turn endpoints |
| `apps/admin-dashboard/` | WIRE — HITL widget to real data |
| `apps/schedulers/` | EXTEND — AI background jobs |
| `packages/superagent/src/tools/` | COMPLETE — Remaining 5-7 tool implementations |

### 3.3 Documents to Review Before Implementation

1. `packages/superagent/src/` — All files (pipeline, tools, HITL, wallet, compliance)
2. `packages/ai-abstraction/src/types.ts` — Current type contracts
3. `packages/ai-adapters/src/` — All adapter implementations
4. `packages/superagent/src/vertical-ai-config.ts` — All 159 capability declarations
5. `packages/superagent/src/tool-registry.ts` — Current tool registration
6. `packages/superagent/src/hitl-service.ts` — HITL queue implementation
7. `packages/superagent/src/compliance-filter.ts` + `ndpr-register.ts` — Policy/compliance logic (integrated in superagent)
8. `apps/api/src/routes/superagent.ts` — Current SuperAgent API routes
9. `infra/db/migrations/` — AI-related tables (ai_sessions, ai_hitl_queue, ai_usage_events, etc.)
10. `WebWaka_AI_Transformation_OS_Audit_Report.md` Section 7 (Target Architecture)
11. `docs/governance/platform-invariants.md` — P7 (Provider Neutral), P10 (Consent First), P12 (USSD exclusion), P13 (PII stripping)

### 3.4 Required Online Research

- Multi-turn AI agent loop patterns in TypeScript (2025-2026)
- Tool-calling with structured outputs: OpenAI, Anthropic, Google function calling APIs
- Agent state persistence patterns (D1/SQLite edge databases)
- Parallel tool execution with Promise.allSettled
- Context window management (sliding window with summarization)
- AI background job patterns on Cloudflare Workers (CRON triggers)
- Human-in-the-loop approval system UX patterns
- WakaCU-style credit metering for AI usage
- Prompt management and versioning systems

### 3.5 Implementation Tasks

#### 3.5.1 Agent Loop Engine

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 3.1 | Design `AgentLoop` class with state machine (run → tool_call → execute → loop → final) | Clear state diagram; TypeScript interface |
| 3.2 | Implement multi-turn state persistence (D1 `agent_sessions` table) | Sessions persist across requests |
| 3.3 | Implement tool execution with retry (max 3), timeout (30s), error handling | Failed tools retry; timeout fires |
| 3.4 | Implement parallel tool calls (Promise.allSettled pattern) | Multiple tools execute concurrently |
| 3.5 | Implement memory/context window management (sliding window with summarization) | Sessions > 8k tokens get summarized |
| 3.6 | Add hard limits: max 10 iterations, max token budget per session | Runaway loops prevented |
| 3.7 | Wire agent loop into `/superagent/chat` endpoint (multi-turn) | Conversations maintain state across turns |

#### 3.5.2 Tool Registry Completion

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 3.8 | Implement `demand_forecasting` tool (reads sales data, returns predictions) | Returns forecast for given vertical/period |
| 3.9 | Implement `document_extractor` tool (parses uploaded documents, returns structured data) | Extracts key fields from PDFs/images |
| 3.10 | Implement `bio_generator` tool (generates profile bios from data) | Returns bio text given entity data |
| 3.11 | Implement `brand_copywriter` tool (generates marketing copy) | Returns copy given product/service context |
| 3.12 | Implement `route_optimizer` tool (optimizes delivery/transport routes) | Returns optimized route given waypoints |
| 3.13 | Implement `compliance_checker` tool (validates against NDPR/CBN/INEC rules) | Returns compliance status with citations |
| 3.14 | Implement `market_insights` tool (analyzes marketplace data) | Returns insights for given geography/vertical |
| 3.15 | Register all new tools in tool registry with proper schemas | All tools discoverable by agent loop |

#### 3.5.3 HITL Approval Flow

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 3.16 | Wire admin-dashboard HITL widget to real `ai_hitl_queue` API | Widget shows actual pending items |
| 3.17 | Implement approve/reject/modify actions with diff view | Reviewer can see proposed changes and act |
| 3.18 | Implement audit trail (all HITL decisions → `ai_hitl_events`) | Every decision logged with timestamp, actor, action |
| 3.19 | Implement auto-reject after configurable timeout (default 24h) | Stale items auto-rejected |
| 3.20 | Implement escalation (4h no action → escalate to workspace owner) | Escalation notification fires |
| 3.21 | Push notification for pending HITL items | Admin receives notification when items queued |

#### 3.5.4 AI Background Jobs

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 3.22 | Implement daily workspace summaries (06:00 WAT trigger in schedulers) | Summary generated and stored |
| 3.23 | Implement anomaly detection on sales/inventory (every 6h) | Anomalies flagged in notification system |
| 3.24 | Implement content freshness checks for marketplace listings (weekly) | Stale listings flagged |
| 3.25 | Wire background jobs to WakaCU metering (credit deductions) | Credits correctly deducted for background AI |

#### 3.5.5 Inline AI SDK

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 3.26 | Build `<AIAssist>` React component (field-level suggestions) | Shows AI suggestion below form field |
| 3.27 | Build `<AICopilot>` React component (side-panel conversational assistant) | Panel slides in; multi-turn chat works |
| 3.28 | Build `<AIAction>` React component (one-click AI actions with confirmation) | Button triggers AI; shows confirmation before executing |
| 3.29 | Wire SDK components to SuperAgent multi-turn endpoint | All components hit correct API |

### 3.6 Testing & Verification Tasks

| # | Test | Expected Result |
|---|------|-----------------|
| T3.1 | Multi-turn conversation completes tool use successfully | Agent uses tool, gets result, responds |
| T3.2 | Tool execution integration tests (each tool against mock D1) | All tools produce correct output |
| T3.3 | HITL flow E2E: submit → queue → approve → execute | Full flow completes |
| T3.4 | HITL flow E2E: submit → queue → timeout → auto-reject | Auto-reject fires at configured time |
| T3.5 | Background job fires and produces output | CRON triggers; output stored |
| T3.6 | WakaCU metering: credits deducted for each tool use | Credit balance decreases correctly |
| T3.7 | Agent loop respects max iterations (10) | Loop terminates; error returned |
| T3.8 | PII stripping in agent context (P13) | voter_ref, donor_phone never in AI context |
| T3.9 | USSD exclusion (P12) | USSD sessions cannot trigger AI |
| T3.10 | Provider failover works | Primary down → secondary used transparently |

### 3.7 QA Gates

- [ ] Agent loop handles 10-turn conversations correctly
- [ ] All 20+ capabilities have working tool implementations
- [ ] HITL queue has functional UI with < 2 second load time
- [ ] 3 background job types running on schedule
- [ ] WakaCU metering accurate (credits match usage)
- [ ] No PII leakage into AI context (P13 enforced)
- [ ] USSD exclusion enforced (P12)
- [ ] Provider failover tested and working
- [ ] All governance invariants preserved

### 3.8 GitHub Push/Checkpoint

- Branch: `staging`
- Commit messages: `feat(superagent): <description>`
- Sub-checkpoints: agent-loop, tools-complete, hitl-wired, background-jobs
- After all: tag as `phase-3-complete`

### 3.9 Next-Phase Handoff

**Next:** Phase 4 (Vertical AI Adaptation)
**Prerequisites:** Vertical engine (Phase 1) stable; all tools registered (this phase)

---

## PHASE 4: Vertical & Module AI Adaptation
**Duration:** 3–4 weeks
**Priority:** MEDIUM — Activates AI across all verticals + monetization
**Depends on:** Phase 1 (vertical-engine) + Phase 3 (complete tool registry)

### 4.1 Objectives

- All 159 verticals benefit from AI capabilities without individual coding
- Template marketplace activated with revenue
- Marketplace take-rate logic implemented
- Tenant payment collection enabled

### 4.2 Scope & Affected Areas

| Area | Action |
|------|--------|
| `@webwaka/vertical-engine` | Wire AI capability declarations |
| `packages/superagent/src/vertical-ai-config.ts` | Source of truth for per-vertical AI |
| `apps/api/src/routes/templates.ts` | Activate marketplace |
| `apps/api/src/routes/b2b-marketplace.ts` | Add take-rate logic |
| `apps/brand-runtime/` | Template rendering |
| `apps/api/src/routes/payments/` | Tenant payment collection |

### 4.3 Documents to Review

1. `packages/superagent/src/vertical-ai-config.ts` — All 159 AI configs
2. `apps/api/src/routes/templates.ts` — Current template marketplace code
3. `apps/api/src/routes/b2b-marketplace.ts` — Current B2B marketplace
4. `packages/payments/` — Paystack integration
5. `packages/offerings/` — Product/service catalog
6. Financial compliance docs (P9 integer kobo, INEC caps)

### 4.4 Required Online Research

- Paystack sub-account pattern for marketplace tenant payouts (Nigeria 2026)
- Marketplace take-rate implementation patterns (percentage deduction at settlement)
- AI prompt template versioning and A/B testing systems
- Configuration-driven AI capability declaration patterns

### 4.5 Implementation Tasks

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 4.1 | Wire vertical-engine to read AI capabilities from config | SuperAgent auto-loads correct tools per vertical context |
| 4.2 | Build per-vertical prompt templates (stored in `ai_prompt_templates` table) | Each vertical has optimized prompts |
| 4.3 | Implement marketplace take-rate logic (configurable % per transaction type) | Platform fee deducted at settlement |
| 4.4 | Activate template marketplace with 10-20 starter templates | Templates browseable, purchasable, installable |
| 4.5 | Implement tenant payment collection (Paystack sub-accounts) | Customers can pay tenants; platform fee auto-deducted |
| 4.6 | Build AI capability demo per top-5 verticals (commerce, food, beauty, transport, civic) | Each shows AI working in context |

### 4.6 Testing & Verification

| # | Test | Expected Result |
|---|------|-----------------|
| T4.1 | Bakery vertical uses `demand_forecasting` (from engine, not bakery-specific code) | Forecast returned correctly |
| T4.2 | Template purchase E2E: browse → purchase → install → render | Full flow works |
| T4.3 | Take-rate: ₦10,000 transaction deducts correct platform fee | Integer kobo precision maintained |
| T4.4 | Tenant payment: customer pays ₦5,000 → tenant receives minus fee | Settlement correct |
| T4.5 | AI prompts load per-vertical correctly | Each vertical gets its own prompt context |

### 4.7 QA Gates

- [ ] Any vertical's AI capabilities work without vertical-specific code
- [ ] Template marketplace has 10+ purchasable templates
- [ ] Take-rate correctly calculated (P9 integer kobo precision)
- [ ] Tenant payment collection works end-to-end
- [ ] All governance invariants preserved

### 4.8 GitHub Push/Checkpoint

- Branch: `staging`
- Tag: `phase-4-complete`

### 4.9 Next-Phase Handoff

**Next:** Phase 5 (QA, Rollout, Stabilization)
**Prerequisites:** All previous phases complete; pilot tenants identified

---

## PHASE 5: QA, Rollout, Migration, Stabilization
**Duration:** 3–4 weeks
**Priority:** CRITICAL — Production hardening with real users
**Depends on:** All previous phases complete

### 5.1 Objectives

- Production hardening under real load
- Pilot tenant onboarding (5-10 real businesses)
- Performance optimization
- Observability and incident response readiness
- Documentation refresh

### 5.2 Scope

All production infrastructure, monitoring, documentation, and real-world validation.

### 5.3 Documents to Review

1. `tests/k6/` — Existing load test scripts
2. `docs/governance/incident-response.md` — Existing runbook
3. `infra/cloudflare/` — Production configuration
4. `.github/workflows/` — Deploy workflows
5. All QA reports in `docs/reports/`
6. `SECURITY.md` — Security practices

### 5.4 Required Online Research

- Cloudflare Workers performance benchmarking and D1 SQLite limits (2026)
- OWASP Top 10 2025 + API-specific penetration testing vectors
- Cloudflare Logpush → Grafana Cloud observability patterns
- Nigerian SaaS pilot onboarding best practices
- k6 load testing for edge-compute APIs

### 5.5 Implementation Tasks

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 5.1 | Extend k6 load tests: auth, POS, discovery, AI, payment flows at 2x expected peak | Tests scripted and runnable |
| 5.2 | Run load tests and capture baseline performance | P95 latency < 500ms at 2x peak |
| 5.3 | Security audit: OWASP Top 10 + API vectors | Zero critical/high findings |
| 5.4 | Observability: structured logs → Cloudflare Logpush → APM | Dashboard live with 5 key alerts |
| 5.5 | Onboard 5-10 pilot tenants across 3+ verticals | Tenants operational with white-glove support |
| 5.6 | Performance optimization based on pilot learnings | Slow queries optimized; KV caching for hot paths |
| 5.7 | Documentation refresh: OpenAPI spec, user guides, partner playbook, incident runbook | All docs current and reviewed |
| 5.8 | DNS cutover and production deploy (if not done in Phase 0) | Production live at api.webwaka.com |

### 5.6 Testing & Verification

| # | Test | Expected Result |
|---|------|-----------------|
| T5.1 | Load test: 2x peak without errors | P95 < 500ms; zero 5xx errors |
| T5.2 | Penetration test: all findings remediated | Zero critical/high |
| T5.3 | Observability alerts fire on synthetic failures | Alerts trigger correctly |
| T5.4 | Pilot tenants operational for 2+ weeks | No blocking issues reported |
| T5.5 | Smoke tests pass against production | All suites green |

### 5.7 QA Gates

- [ ] Load tests pass at 2x peak
- [ ] Security audit: zero critical/high findings
- [ ] Observability dashboard live
- [ ] 5+ pilot tenants operational 2+ weeks
- [ ] All documentation reviewed and current
- [ ] Production deployment stable

### 5.8 GitHub Push/Checkpoint

- Branch: `main` (merge staging → main for production)
- Tag: `v2.0.0` (AI-native release)

### 5.9 Final State

Platform is production-live with:
- Configuration-driven verticals (159 types, zero code per vertical)
- Multi-turn AI agent with 20+ capabilities
- HITL approval system for sensitive operations
- 4 production-ready frontend SPAs
- Template and B2B marketplaces active with revenue
- Pilot tenants validating real-world usage
- Full observability and incident response

---

## Appendix A: Non-Negotiable Architecture Rules

These rules MUST be preserved across ALL phases:

1. **T3 — Tenant Isolation**: Every D1 query scoped by `tenant_id`. No exceptions.
2. **T4/P9 — Integer Kobo**: No floating point for money. Ever.
3. **P7 — Provider-Neutral AI**: No direct AI SDK calls. All through abstraction layer.
4. **P10 — Consent-First AI**: NDPR consent required before any AI processing of personal data.
5. **P6 — Offline Capability**: Core journeys must work without network.
6. **P1 — Build Once Use Infinitely**: No duplication. Shared primitives only.
7. **P12 — USSD Exclusion**: AI completely blocked on USSD sessions.
8. **P13 — PII Stripping**: voter_ref, donor_phone, bank_account_number never in AI context.

### Appendix B: Risk Register

| Phase | Risk | Severity | Mitigation |
|-------|------|----------|------------|
| 0 | DNS cutover causes downtime | LOW | Cloudflare instant rollback |
| 1 | Vertical engine doesn't cover edge cases | HIGH | Keep old packages as fallback; feature flag |
| 2 | Frontend scope creep | MEDIUM | Define MVP per app upfront; strict feature gates |
| 3 | AI provider costs during dev | MEDIUM | Use cheapest tier (DeepSeek/Groq); mock for unit tests |
| 3 | Agent loop runaway | HIGH | Hard limit 10 iterations; token budget cap |
| 4 | Take-rate financial precision | MEDIUM | P9 integer kobo; extensive unit tests |
| 5 | D1 SQLite performance limits | MEDIUM | KV caching strategy; Cloudflare enterprise escalation path |

---

## Appendix C: Verification Commands Reference

```bash
# Full test suite
pnpm --filter @webwaka/api test
pnpm --filter @webwaka/support-groups test
pnpm --filter @webwaka/fundraising test
pnpm --filter @webwaka/community test
pnpm --filter @webwaka/notificator test

# TypeScript verification
pnpm --filter @webwaka/api typecheck
pnpm --filter @webwaka/support-groups typecheck
pnpm --filter @webwaka/fundraising typecheck
pnpm --filter @webwaka/events typecheck
pnpm --filter @webwaka/entitlements typecheck

# Lint
pnpm --filter @webwaka/api lint

# Governance checks
pnpm governance:check

# Smoke tests
pnpm test:smoke
```

---

*End of Implementation Plan*
