# Wave 4 — Pilot Rollout & Production Launch Checklist

**Milestone 11 (Pilot Rollout) + Milestone 12 (Production Launch)**
**Status:** 🟡 IN PROGRESS — Backend/frontend complete, ops gate items remain (founder/engineering action)
**Branch:** `staging` → merge to `main` when all gate items signed off
**Last updated:** 2026-05-02

---

## Wave 4 Scope

| Milestone | Goal | Owner |
|-----------|------|-------|
| M11 — Pilot Rollout | Real-world validation with 2–5 controlled operator cohorts | Founder selects pilots → Base44 manages → Replit fixes |
| M12 — Production Launch | Stable initial production release, full public availability | Base44 executes → Founder approves go-live → Replit hotfixes |

---

## Pilot Rollout Infrastructure (M11)

### P1 — Database & Service Layer ✅
- [x] `0462_pilot_rollout.sql` — pilot_operators, pilot_feature_flags, pilot_feedback tables
- [x] `packages/pilot/` — PilotOperatorService, PilotFlagService, PilotFeedbackService
- [x] Full test coverage: 20+ tests across 3 service classes
- [x] `vitest.workspace.ts` — `packages/pilot` registered

### P2 — Pilot Admin Endpoints ✅
- [x] `apps/api/src/routes/platform-admin-pilots.ts` — all 7 admin endpoints
- [x] `register-admin-routes.ts` — mounted at `/platform-admin/pilots/*` (super_admin + audit)
- [x] POST/GET operators, GET summary, PATCH status FSM
- [x] POST/DELETE/GET feature flags, GET feedback/summary

### P3 — In-App Feedback Widget ✅
- [x] `pilot-feedback-route.ts` — `POST /workspace/feedback` (backend)
- [x] `GET /workspace/pilot-flags/:flagName` — frontend flag check (KV-first, D1 fallback)
- [x] `register-workspace-routes.ts` — mounted at `/workspace/feedback*`
- [x] NPS score validation, tenant isolation from JWT, first_txn_at side-effect
- [x] **FE-PILOT-01**: `PilotFeedbackWidget.tsx` — NPS 0–10, comments, snooze/submit, localStorage state
- [x] Trigger: after first successful transaction (`trigger="first_txn"`)
- [x] Trigger: every 30 days for active operators (`trigger="periodic"`, 7-day snooze)
- [x] `usePilotFlag.ts` — sessionStorage-cached flag hook
- [x] `Dashboard.tsx` — widget wired in, gated on `isPilot` flag

### P4 — Pilot Cohort 1 Seed Data ✅
- [x] `0463_pilot_cohort1_seed.sql` — 5 operators + 10 feature flags
- [x] `pilot-prune-expired-flags` scheduler job registered (daily)
- [x] `pilot-health-log` scheduler job registered (daily)
- [x] `0463_pilot_cohort1_seed.rollback.sql`

### P5 — Monitoring & Observability ✅
- [x] `pilot-health-log` job: daily NPS + status count structured log
- [x] `pilot-prune-expired-flags` job: daily expired flag cleanup
- [x] `scripts/pilot-zero-txn-alert.mjs` — D1 query → Slack alert for 0-txn operators after 7 days
- [x] `.github/workflows/pilot-zero-txn-alert.yml` — daily cron 07:00 UTC (08:00 WAT) + workflow_dispatch
- [x] Platform-admin NPS dashboard widget — stat tiles, canvas sparkline, operator list table

---

## Production Launch Runbooks (M12 — Ops-Ready) ✅

### Runbooks Written
- [x] `docs/release/release-gate.md` — 51-item sign-off gate (G1–G9)
- [x] `docs/runbooks/dns-cutover.md` — 5-step DNS cutover playbook
- [x] `docs/runbooks/rollback-procedure.md` — worker + migration + DNS rollback
- [x] `docs/runbooks/compliance-final-check.md` — NDPR/DSAR/KYC verification steps
- [x] `docs/runbooks/secrets-provisioning-guide.md` — G3: exactly which 11+13 secrets to set, how, verification

### Scripts Written
- [x] `scripts/smoke-production.mjs` — 7-check hard-gate smoke (exit 0/1), G6-8
- [x] `scripts/pilot-kv-warmup.mjs` — cohort_1 KV flag warm-up (3 flags × 5 tenants), G9-3
- [x] `scripts/pilot-zero-txn-alert.mjs` — ops alert for zero-txn pilot operators
- [x] `deploy-production.yml` updated — smoke is now a hard gate (removed continue-on-error)

### Load Tests Written
- [x] `tests/k6/superagent-chat.k6.js` — G2: p95 < 3s, TTFB p95 < 800ms, 30 VUs 5-min profile
- [x] `tests/k6/verticals-load.k6.js` — G2: p95 < 500ms, 100 VUs 3-min profile
- [x] `.github/workflows/load-test-production.yml` — workflow_dispatch + workflow_call

---

## Production Gate Items (Ops Tasks — Founder/Engineering sign-off)

### G1 — Code Quality
- [ ] CI passes on staging branch (all checks green) — trigger: `gh workflow run ci.yml --ref staging`
- [ ] TypeScript typecheck: `pnpm -r typecheck` exits 0
- [ ] Governance checks: all `scripts/governance-checks/` scripts exit 0

### G2 — Performance *(scripts ready — run against staging/production)*
- [ ] k6 load test: `k6 run tests/k6/superagent-chat.k6.js` — P95 < 3s ✓
- [ ] k6 load test: `k6 run tests/k6/verticals-load.k6.js` — P95 < 500ms ✓
- [ ] No D1 query > 200ms in staging logs (last 48h)

### G3 — Secrets (Founder action) *(guide: `docs/runbooks/secrets-provisioning-guide.md`)*
- [ ] 11 Cloudflare Worker secrets provisioned + verified via `wrangler secret list`
- [ ] 13 GitHub Actions secrets provisioned
- [ ] `node scripts/verify-deploy-secrets.mjs` exits 0

### G4 — Database (Engineering)
- [ ] Migrations 0001–0463 applied to `webwaka-production` D1
- [ ] Checksums verified

### G5 — DNS/Infrastructure (Founder + Engineering)
- [ ] `api.webwaka.com` → production worker (see `docs/runbooks/dns-cutover.md`)
- [ ] SSL Full (Strict) + WAF enabled

### G6 — Smoke Tests (Engineering post-deploy)
- [ ] `node scripts/smoke-production.mjs` exits 0

### G7 — Rollback (Engineering pre-deploy)
- [ ] Workflow dispatches tested on staging

### G8 — Compliance (Engineering + RM)
- [ ] All items in `docs/runbooks/compliance-final-check.md` verified

### G9 — Pilot (Engineering)
- [ ] Migration 0463 applied to production D1
- [ ] `DRY_RUN=1 node scripts/pilot-kv-warmup.mjs` — review output
- [ ] `node scripts/pilot-kv-warmup.mjs` — live run

---

## Wave 4 Progress

| Area | Done | Total | % |
|------|------|-------|---|
| Pilot DB + Services | 4 | 4 | **100%** ✅ |
| Pilot Admin API | 7 | 7 | **100%** ✅ |
| Pilot Feedback (backend) | 3 | 3 | **100%** ✅ |
| Pilot Feedback (frontend) | 5 | 5 | **100%** ✅ |
| Pilot Seed + Scheduler | 4 | 4 | **100%** ✅ |
| Pilot Monitoring | 5 | 5 | **100%** ✅ |
| Release Gate Runbooks | 5 | 5 | **100%** ✅ |
| Release Gate Scripts | 4 | 4 | **100%** ✅ |
| k6 Load Tests | 3 | 3 | **100%** ✅ |
| Production Ops Gate G1–G9 | 0 | 16 | **0% — ops/founder action** |
| **Overall Wave 4 (code/docs)** | **40** | **40** | **100% ✅ (code complete)** |
| **Ops gate items** | **0** | **16** | **Pending sign-off** |

---

## What's Left (All Ops — No More Code Required)

| # | Action | Owner | Reference |
|---|--------|-------|-----------|
| 1 | Provision 11 CF Worker secrets + 13 GH secrets | **Founder** | `docs/runbooks/secrets-provisioning-guide.md` |
| 2 | Run CI on staging branch | **Engineering** | `gh workflow run ci.yml --ref staging` |
| 3 | Run TypeScript typecheck | **Engineering** | `pnpm -r typecheck` |
| 4 | Run k6 load tests against staging | **Engineering** | `tests/k6/superagent-chat.k6.js`, `verticals-load.k6.js` |
| 5 | Apply migrations 0001–0463 to production D1 | **Engineering** | `scripts/migrations/` |
| 6 | Dry-run KV warm-up | **Engineering** | `DRY_RUN=1 node scripts/pilot-kv-warmup.mjs` |
| 7 | DNS cutover: api.webwaka.com → production worker | **Founder + Engineering** | `docs/runbooks/dns-cutover.md` |
| 8 | Enable SSL Full (Strict) + WAF in Cloudflare | **Founder** | Cloudflare dashboard |
| 9 | Sign off compliance checklist | **Engineering + RM** | `docs/runbooks/compliance-final-check.md` |
| 10 | Trigger `deploy-production.yml` | **Engineering** | GitHub Actions → Deploy Production |
| 11 | Run smoke test post-deploy | **Engineering** | `node scripts/smoke-production.mjs` |
| 12 | Live KV warm-up run | **Engineering** | `node scripts/pilot-kv-warmup.mjs` |
| 13 | Sign off all items in `release-gate.md` | **All** | `docs/release/release-gate.md` |

---

*16 commits pushed to `staging` across Wave 4.*
*All code, tests, runbooks, and automation scripts are complete.*
*Branch is ready for ops gate verification and merge to `main`.*
