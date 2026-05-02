# Wave 4 — Pilot Rollout & Production Launch Checklist

**Milestone 11 (Pilot Rollout) + Milestone 12 (Production Launch)**
**Status:** 🟡 IN PROGRESS — Backend complete, production gate runbooks done, ops tasks remain
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

### P3 — In-App Feedback Widget
- [x] `pilot-feedback-route.ts` — `POST /workspace/feedback` (backend complete)
- [x] `register-workspace-routes.ts` — mounted at `/workspace/feedback*`
- [x] NPS score validation, tenant isolation from JWT, first_txn_at side-effect
- [ ] **FE-PILOT-01**: Frontend feedback widget component *(Replit task)*
- [ ] Trigger: after first successful transaction
- [ ] Trigger: every 30 days for active operators

### P4 — Pilot Cohort 1 Seed Data ✅
- [x] `0463_pilot_cohort1_seed.sql` — 5 operators + 10 feature flags
- [x] `pilot-prune-expired-flags` scheduler job registered (daily)
- [x] `pilot-health-log` scheduler job registered (daily)
- [x] `0463_pilot_cohort1_seed.rollback.sql`

### P5 — Monitoring & Observability ✅ (backend)
- [x] `pilot-health-log` job: daily NPS + status count structured log
- [x] `pilot-prune-expired-flags` job: daily expired flag cleanup
- [ ] Alert: Logpush rule — tenants with 0 txns after 7 days active *(ops task)*
- [ ] Dashboard widget: pilot NPS trend in platform-admin *(Replit task)*

---

## Production Launch Runbooks (M12 — Ops-Ready) ✅

### Runbooks Written
- [x] `docs/release/release-gate.md` — 51-item sign-off gate (G1–G9)
- [x] `docs/runbooks/dns-cutover.md` — 5-step DNS cutover playbook
- [x] `docs/runbooks/rollback-procedure.md` — worker + migration + DNS rollback
- [x] `docs/runbooks/compliance-final-check.md` — NDPR/DSAR/KYC verification steps

### Scripts Written
- [x] `scripts/smoke-production.mjs` — 7-check hard-gate smoke (exit 0/1), G6-8
- [x] `scripts/pilot-kv-warmup.mjs` — cohort_1 KV flag warm-up (3 flags × 5 tenants), G9-3
- [x] `deploy-production.yml` updated — smoke is now a hard gate (removed continue-on-error)

---

## Production Gate Items (Ops Tasks — Founder/Engineering sign-off)

### G1 — Code Quality
- [ ] CI passes on staging branch (all checks green) — *check GitHub Actions*
- [ ] TypeScript typecheck: `pnpm -r typecheck` exits 0
- [ ] Governance checks: all `scripts/governance-checks/` scripts exit 0

### G2 — Performance
- [ ] k6 load test: P95 < 3s superagent-chat, < 500ms verticals
- [ ] No D1 query > 200ms in staging logs (last 48h)

### G3 — Secrets (Founder action)
- [ ] All 9 production secrets provisioned in Cloudflare + GitHub

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
| Pilot Feedback (frontend) | 0 | 3 | 0% — Replit |
| Pilot Seed + Scheduler | 4 | 4 | **100%** ✅ |
| Pilot Monitoring (backend) | 2 | 2 | **100%** ✅ |
| Pilot Monitoring (ops alerts) | 0 | 1 | 0% — ops |
| Release Gate Runbooks | 4 | 4 | **100%** ✅ |
| Release Gate Scripts | 3 | 3 | **100%** ✅ |
| Production Ops Gate G1–G9 | 0 | 9 | 0% — ops |
| **Overall Wave 4 (backend/docs)** | **27** | **40** | **68%** |

---

## Next Recommended Actions

1. **Replit** → FE-PILOT-01: pilot feedback widget component
2. **Engineering** → Run CI on staging: `gh workflow run ci.yml --ref staging`
3. **Founder** → Provision all G3 secrets in Cloudflare + GitHub
4. **Engineering** → Apply migrations 0462–0463 to production D1 (G4)
5. **Engineering** → Dry-run KV warm-up: `DRY_RUN=1 node scripts/pilot-kv-warmup.mjs`
6. **Engineering + Founder** → DNS cutover (`docs/runbooks/dns-cutover.md`)
7. **All** → Sign off release-gate.md items and trigger `deploy-production.yml`

---

*10 commits pushed to `staging` in this session.*
*Branch is ready for ops gate verification and eventual merge to `main`.*
