# WebWaka Wave 3 — Scale, AI, and Hardening Checklist

**Branch:** staging
**Agent:** WebWaka (Base44 Super Agent)
**Date:** 2026-05-02
**Status:** IN PROGRESS (Wave 3 — Batches 1-5 complete, ~33% done)

---

## Pre-Flight: Wave 2 Stability Confirmation

- [x] Wave 2 checklist exists and is fully checked (WAVE2_CHECKLIST.md)
- [x] Staging branch is HEAD (commit: 1486ec0b)
- [x] CI passing: TypeCheck, Tests (489 test files), Lint, OpenAPI, Security, Governance, Smoke
- [x] Staging deploy green (api-staging.webwaka.com/health → 200)
- [x] 159 individual vertical packages present
- [x] Vertical Engine registry has 157 entries (config-driven, Wave 3 will close the 2-slug gap)

---

## A. AI-NATIVE CORE

### A1. SuperAgent — Agent Loop & Prompt Management
- [x] A1-1: Extract agent-loop logic from `apps/api/src/routes/superagent.ts` into a standalone `packages/superagent/src/agent-loop.ts` module (currently inline in route — hard to test and extend)
- [x] A1-2: Add `PromptManager` class (`packages/superagent/src/prompt-manager.ts`) — loads versioned system prompts from vertical config, supports locale injection, and prevents raw user-constructed prompt injection
- [x] A1-3: Add per-vertical system prompt templates to `vertical-ai-config.ts` (currently no system prompt is injected — agent loop starts cold)
- [x] A1-4: Add `agent-loop.test.ts` with full coverage: tool round capping, error recovery, HITL gating, multi-turn state
- [x] A1-5: Add streaming agent loop variant in `agent-loop-stream.ts` for `POST /superagent/chat/stream` (currently the stream route is separate and lacks multi-turn tool support)

### A2. Tool Registry — Completeness & Runtime
- [x] A2-1: Add `search_offerings` tool (Pillar 3 — marketplace lookup for agent context)
- [x] A2-2: Add `get_customer_history` tool (CRM read — purchase history for bookings context)
- [x] A2-3: Add `log_payment` tool (write-capable, HITL-gated at autonomy < 3, guarded by `guardAIFinancialWrite`)
- [x] A2-4: Add `get_analytics_summary` tool (read-only, Pillar 1 — gives agent daily/weekly stats context)
- [x] A2-5: Add `create_support_ticket` tool (write-capable, HITL-gated at autonomy < 2)
- [x] A2-6: Add tool-level metadata (description, pillar, autonomyThreshold, readOnly flag) to `RegisteredTool` interface and propagate to all 9 existing + 5 new tools
- [x] A2-7: Expose `GET /superagent/tools` endpoint returning the registered tool catalogue (non-sensitive, useful for UI and debugging)
- [x] A2-8: Add `ToolRegistry.executeWithTimeout()` — wrap each tool call with a configurable deadline (default 5s) to prevent slow D1 queries blocking the agent loop

### A3. AI Governance — Billing, BYOK, Failover
- [x] A3-1: Add `ByokKeyService` integration test — verify Level 1 (user BYOK) and Level 2 (workspace BYOK) resolution paths are actually exercised in CI
- [x] A3-2: Implement Level 5 fallback behaviour: currently `resolveAdapter` throws `NO_ADAPTER_AVAILABLE` — add a genuine fallback model config (e.g. groq/llama-3.1-8b-instant with a platform key) before the hard throw
- [x] A3-3: Add `CreditBurnEngine` edge-case tests: insufficient balance, partner pool exhausted, monthly cap reached — currently only happy path is tested
- [x] A3-4: Add `SpendControls` hard-cap enforcement test in the `/superagent/chat` route — verify 402 is returned when budget is exceeded
- [x] A3-5: Implement AI billing reconciliation cron: `apps/schedulers` — nightly job that scans `ai_usage_events` for unmatched `wc_transactions` and flags discrepancies
- [x] A3-6: Add `POST /superagent/byok` and `DELETE /superagent/byok/:id` endpoints (currently `KeyService` exists but no HTTP surface exists to add/remove BYOK keys)
- [x] A3-7: Implement `BYOK key rotation` — `PUT /superagent/byok/:id/rotate` replaces encrypted key in D1, invalidates KV cache

### A4. HITL — End-to-End Flow Hardening
- [x] A4-1: Add `POST /admin/hitl/actions/:id/approve` and `/reject` API endpoints with full test coverage (currently AdminHITL.tsx polls but the approve/reject endpoints need verification in tests)
- [x] A4-2: Add HITL expiry cron in `apps/schedulers` — sweep `ai_hitl_queue` for expired `pending` items and flip to `expired`, then notify workspace admin
- [x] A4-3: Add HITL Level 3 (regulatory 72h window) enforcement test — verify Level 3 items cannot be auto-approved before 72h
- [x] A4-4: Add HITL notification: when a HITL item is submitted, fire a workspace notification to designated reviewers (integrate with `packages/notifications`)
- [x] A4-5: Add HITL audit trail: append structured event to `ai_hitl_events` on every status change (pending → approved/rejected/expired/executed)

### A5. State Persistence & Session Hardening
- [x] A5-1: Add `SessionService` TTL cleanup cron in `apps/schedulers` — expire sessions older than 7 days of inactivity (currently no cleanup job exists)
- [x] A5-2: Add `GET /superagent/sessions` and `DELETE /superagent/sessions/:id` routes for session listing and GDPR-compliant deletion
- [x] A5-3: Add context-window trim test: verify `loadHistory(maxTokens)` correctly drops oldest messages when budget is exceeded
- [x] A5-4: Implement session title auto-generation: after first assistant message, call a cheap AI completion to set `title` in `ai_sessions` (currently always null)

### A6. AI Observability & Background Jobs
- [x] A6-1: Add `GET /admin/ai/usage` endpoint — aggregate usage by tenant, pillar, capability, provider for the platform admin dashboard (currently `admin-metrics.ts` exists but AI-specific aggregation is missing)
- [ ] A6-2: Add AI usage chart component in `apps/admin-dashboard` — daily spend, top tenants, top capabilities (currently no AI-specific admin UI)
- [x] A6-3: Add AI anomaly detection cron in `apps/schedulers` — flag tenants with unusual WakaCU spend velocity (>3x rolling average) and write to an `ai_anomaly_flags` table
- [x] A6-4: Add structured AI error logging to `packages/logging` — `logAiEvent(logger, event)` helper that emits a structured JSON log line with routing level, capability, duration, tokens, error code (if any) without PII
- [x] A6-5: Add AI background job infrastructure: `packages/superagent/src/background-jobs/` with a typed `BackgroundJob` interface and two initial jobs: `demand-forecast-job.ts` and `shift-summary-job.ts` (triggered by Cloudflare Cron via schedulers)

### A7. Inline AI Surfaces
- [ ] A7-1: Add `AIInsightWidget` component (`packages/design-system`) — reusable inline AI suggestion card (shows capability output inline without full chat UI)
- [ ] A7-2: Wire `inventory_ai` capability to Inventory page — add "AI Reorder Suggestions" panel that calls `POST /superagent/chat` with `capability: inventory_ai`
- [ ] A7-3: Wire `pos_receipt_ai` capability to POS receipt modal — add "Enhance Receipt" button
- [ ] A7-4: Wire `bio_generator` capability to Brand Settings page — add "Generate Bio" one-click button
- [ ] A7-5: Wire `shift_summary_ai` capability to Dashboard — add "Today's Summary" AI card (end-of-day)

---

## B. VERTICAL ENGINE & REUSABLE MODULES

### B1. Vertical Registry — Completeness & Taxonomy
- [x] B1-1: Add 2 missing verticals to `vertical-engine` registry to reach 159/159 (identify which 2 are absent vs individual packages and add their configs)
- [x] B1-2: Add `maturity` field validation to registry — enforce all 159 entries have `maturity: 'full' | 'basic' | 'stub'` and update the governance check (`check-vertical-registry.ts`) to fail on missing maturity
- [x] B1-3: Add `pillarCoverage` stats to registry — `getRegistryStats()` should return breakdown by primaryPillar (1/2/3) and by maturity level
- [x] B1-4: Cross-check `VERTICAL_AI_CONFIGS` (159 entries in `vertical-ai-config.ts`) vs engine registry — ensure every registry slug has a corresponding AI config entry (run as governance check)

### B2. Shared FSM Patterns
- [x] B2-1: Add `FSMEngine.validateConfig()` — static method that validates a `VerticalFSMConfig` at registration time (catch orphan states, missing transitions, unreachable states)
- [x] B2-2: Add FSM event emission: on every state transition, publish an event via `packages/events` (`vertical.state.transitioned`) to enable downstream reactions (audit, notification, analytics)
- [x] B2-3: Add FSM history: store last N state transitions in a `profile_state_history` table (migration needed) for audit/compliance
- [x] B2-4: Add FSM bulk validation test: run `FSMEngine.validateConfig()` against all 157 registry FSM configs in a single vitest spec

### B3. Shared UI & Workflow Primitives
- [x] B3-1: Add `VerticalStatusBadge` component to `packages/design-system` — renders FSM state with color coding (seeded=grey, claimed=blue, active=green, suspended=red)
- [x] B3-2: Add `VerticalProfileCard` component — reusable profile display card driven by `VerticalConfig.profileFields`
- [x] B3-3: Add `VerticalFormRenderer` component — generates a create/edit form from `VerticalConfig.createFields`/`updateFields` (eliminates repeated form code across 159 workspace pages)
- [x] B3-4: Add `useVerticalEngine` React hook — client-side hook that calls the API for profile CRUD + FSM transitions, abstracting fetch logic from page components

### B4. Vertical Deduplication & Migration
- [x] B4-1: Audit 20 representative individual `verticals-*` packages against engine registry configs — identify structural patterns that diverge (custom FSMs, extra sub-entities)
- [x] B4-2: Create migration guide (`docs/vertical-engine/migration-from-package.md`) — step-by-step instructions for replacing a `verticals-*` package with a pure engine config entry
- [x] B4-3: Migrate 5 high-traffic verticals from standalone packages to engine-only: `restaurant`, `pharmacy`, `hotel`, `school`, `farm` — verify parity via `parity-framework.ts`
- [x] B4-4: Add `parity.test.ts` coverage for all 157 engine-registered verticals (currently parity framework exists but test only covers a subset)
- [x] B4-5: Add `new-vertical.config.ts` template + generator script: `pnpm run generate:vertical <slug>` that scaffolds a new engine config entry with placeholders (reduces new vertical setup friction)

### B5. Configuration-Driven Route Generation
- [x] B5-1: Add `RouteGenerator.generateAllRoutes(registry, app)` — wire all 157 registry verticals to Hono routes automatically (currently individual vertical route files exist for each of 159 packages)
- [x] B5-2: Add generated route coverage test — verify every slug in the engine registry has a corresponding HTTP route registered
- [x] B5-3: Add `entitlementLayer` enforcement in generated routes — automatically check `VerticalConfig.route.entitlementLayer` against `packages/entitlements` before allowing profile operations

---

## C. PERFORMANCE, QA & OBSERVABILITY

### C1. Test Coverage & Regression Prevention
- [ ] C1-1: Add Vitest coverage report to CI — run `pnpm test --coverage` and fail if line coverage drops below 70% on `packages/superagent`, `packages/ai-abstraction`, `packages/vertical-engine`
- [ ] C1-2: Add regression test gate: new `tests/regression/` directory with tests that encode every CRITICAL/HIGH issue from `PRODUCTION_READINESS_BACKLOG.md` — ensures fixed bugs cannot re-emerge
- [ ] C1-3: Add mutation testing baseline for `packages/superagent/src/credit-burn.ts` and `packages/superagent/src/spend-controls.ts` — financial logic must be mutation-resilient
- [ ] C1-4: Add contract tests for all external AI provider adapters (`packages/ai-adapters`) — mock HTTP server that validates request shape matches provider spec
- [ ] C1-5: Add test for every governance check in `scripts/governance-checks/` — verify each check correctly catches a known violation (currently governance checks run but aren't themselves tested)

### C2. API Resilience & Performance
- [x] C2-1: Add retry middleware to all outbound AI provider calls in `packages/ai-adapters` — exponential backoff with jitter, max 3 retries, provider-specific error classification (rate limit vs server error)
- [x] C2-2: Add circuit breaker per AI provider — after 5 consecutive failures, mark provider as `OPEN` for 60s and skip in routing chain (prevents cascade)
- [ ] C2-3: Add `db-perf.ts` query budget enforcement — currently `db-perf.ts` exists but is not wired to CI; add a test that runs all common query patterns against an in-memory D1 and asserts they complete within budget
- [ ] C2-4: Add API response time logging middleware — log `duration_ms` on every request in structured JSON; wire to Cloudflare logpush drain (ADR-0045)
- [ ] C2-5: Add OpenAPI spec completeness check — verify every Hono route has a corresponding OpenAPI operation defined; fail CI if routes are undocumented

### C3. Frontend Performance
- [ ] C3-1: Add Lighthouse CI to the CI pipeline — run against `apps/workspace-app` and `apps/marketing-site` builds; enforce Performance ≥ 85, Accessibility ≥ 90
- [ ] C3-2: Add bundle size budget enforcement — `infra/bundle-baseline.json` exists; wire it to a CI step that fails if any worker or frontend bundle exceeds baseline by >15%
- [ ] C3-3: Add lazy loading for heavy pages — `Analytics.tsx`, `AI.tsx`, and `VerticalView.tsx` should use `React.lazy()` + `Suspense` to reduce initial load
- [ ] C3-4: Add `ResourceHints` component to `packages/design-system` — emits `<link rel="preconnect">` for AI provider domains and Cloudflare KV endpoints
- [ ] C3-5: Add `ServiceWorker` precache manifest update — ensure Wave 3 new routes are added to the PWA precache list

### C4. Alerting & Production Diagnostics
- [ ] C4-1: Add Cloudflare Logpush configuration to `infra/cloudflare/` — configure structured log drain to external sink (Grafana/Datadog/Axiom) for both staging and production
- [ ] C4-2: Add health check expansion — current `/health` returns 200; expand to `/health/deep` that checks D1 connectivity, KV read, and AI provider reachability (with cached results, TTL 30s)
- [ ] C4-3: Add alerting runbook (`docs/runbooks/alerts.md`) — for each alert type (high error rate, AI spend spike, D1 latency, worker CPU limit) document: trigger condition, diagnosis steps, remediation
- [ ] C4-4: Add deployment smoke test expansion — current smoke only hits `/health`; add POST `/superagent/consent` (dry-run), GET `/v1/workspace`, GET `/v1/discovery/search?q=test` to staging smoke suite
- [ ] C4-5: Add incident response checklist (`docs/runbooks/incident-response.md`) — P0/P1/P2 classification, escalation path, rollback procedure, post-mortem template

### C5. Load Testing & Release Gates
- [ ] C5-1: Fix k6 staging JWT provisioning — `JWT_SECRET_STAGING` must be added to GitHub Actions secrets (documented in `PRODUCTION_READINESS_BACKLOG.md` as C-1 ops action required)
- [ ] C5-2: Add k6 load test for SuperAgent chat endpoint — simulate 50 concurrent users hitting `/superagent/chat` with `inventory_ai` capability; assert P95 < 3s, error rate < 1%
- [ ] C5-3: Add k6 load test for vertical profile list — 100 concurrent reads to `/v1/vertical/:slug/profiles`; assert P95 < 500ms
- [ ] C5-4: Add k6 baseline comparison to CI — `infra/k6/compare-baseline.mjs` exists but is not called in CI; wire it to fail if P95 regresses by >20% vs baseline
- [ ] C5-5: Add release gate checklist (`docs/release/release-gate.md`) — mandatory checks before any production deploy: CI green, load test pass, HITL queue drained, anomaly flags reviewed, rollback plan documented

### C6. Logging Quality & Analytics Freshness
- [x] C6-1: Add request correlation ID middleware — inject `X-Request-Id` header on all API responses and include in all log entries for trace correlation
- [ ] C6-2: Add `packages/logging` structured log drain integration — implement `LogDrainTransport` that batches log entries and POSTs to Cloudflare Logpush endpoint (replacing console.log in production)
- [ ] C6-3: Add analytics freshness check — `apps/projections` projection worker should include a `last_projected_at` metadata KV entry; add a CI/monitoring check that fails if projections are >6h stale
- [ ] C6-4: Add error rate dashboard (`apps/admin-dashboard`) — chart showing 5xx rate by route over last 24h, sourced from `ai_usage_events` error field + API error log aggregation
- [ ] C6-5: Add `packages/analytics` event taxonomy audit — ensure all Wave 3 new features emit the correct analytics events and the schema is documented

---

## D. PRODUCTION HARDENING (Remaining from Backlog)

- [ ] D1: Provision `JWT_SECRET_STAGING` in GitHub Actions secrets (ops action — flagged as C-1 in backlog)
- [ ] D2: Add pre-deploy production secrets validation step in `deploy-production.yml`
- [ ] D3: Add blue-green deployment smoke verification — after traffic shift, run `tests/smoke/cycle-01-smoke.ts` against green environment before retiring blue (ADR-0042/0046)
- [ ] D4: Add canary deployment circuit breaker — if error rate on canary >2% within 5 min of traffic shift, auto-rollback via `rollback-worker.yml`
- [ ] D5: Add chaos engineering baseline (`docs/adr/ADR-0047`) — implement first 3 chaos scenarios: D1 timeout, AI provider down, KV unavailable; document expected degradation behaviour

---

## Completion Criteria

Wave 3 is complete when:
1. All items above are checked ✅
2. CI is green on staging branch (TypeCheck, Tests, Lint, OpenAPI, Governance, Smoke)
3. Cloudflare staging deploy is successful and `/health/deep` returns green
4. k6 load tests pass with JWT provisioned (no 401 on authenticated endpoints)
5. Final Wave 3 completion report is written
6. Staging is merged to main
7. Production deploy from main is verified

---

**Total items:** 72
**Completed:** 0
**In Progress:** 0
