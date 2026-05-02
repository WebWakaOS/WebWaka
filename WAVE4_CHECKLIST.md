# Wave 4 — Pilot Rollout & Production Launch Checklist

**Milestone 11 (Pilot Rollout) + Milestone 12 (Production Launch)**
**Status:** 🟡 IN PROGRESS — Wave 4 pilot infrastructure complete, production gate next (2026-05-02)
**Branch:** `staging` → merge to `main` when gate passes

---

## Wave 4 Scope

Wave 4 covers two milestones:

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
- [x] `POST /platform-admin/pilots/operators` — enrol operator
- [x] `GET /platform-admin/pilots/operators` — list (filter by cohort/status)
- [x] `GET /platform-admin/pilots/operators/summary` — cohort health stats
- [x] `PATCH /platform-admin/pilots/operators/:tenantId/status` — FSM transitions
- [x] `POST /platform-admin/pilots/flags` — grant per-tenant flag
- [x] `DELETE /platform-admin/pilots/flags/:tenantId/:flagName` — revoke flag
- [x] `GET /platform-admin/pilots/feedback/summary` — NPS + type breakdown

### P3 — In-App Feedback Widget ✅
- [x] `apps/api/src/routes/pilot-feedback-route.ts` — `POST /workspace/feedback`
- [x] `register-workspace-routes.ts` — mounted at `/workspace/feedback*` (auth required)
- [x] NPS score validation (0–10 integer), tenant isolation from JWT
- [ ] Frontend feedback widget component (Replit task — FE-PILOT-01)
- [ ] Trigger: shown after first successful transaction (`first_txn_at` set)
- [ ] Trigger: shown every 30 days for active operators

### P4 — Pilot Cohort 1 Seed Data ✅
- [x] `0463_pilot_cohort1_seed.sql` — 5 pilot operators (restaurant×2, pharmacy, logistics, motor-park)
- [x] Feature flags granted: `ai_chat_beta` + `superagent_proactive` for all cohort_1 tenants
- [x] Scheduler job registered: `pilot-prune-expired-flags` (daily, 86400s)
- [x] `0463_pilot_cohort1_seed.rollback.sql`
- [ ] KV warm-up: wallet flags set for cohort_1 tenants via `setFeatureFlag` (ops task)

### P5 — Monitoring & Observability
- [ ] Pilot health cron: daily summary log of active/churned/graduated counts
- [ ] Alert: Logpush rule — tenants with 0 txns after 7 days active
- [ ] Dashboard widget: pilot NPS trend (7-day rolling avg) in super-admin

---

## Production Launch Readiness (M12)

### G1 — Release Gate Sign-Off
- [ ] `docs/release/release-gate.md` — all items ✅ verified by RM
- [ ] No CRITICAL or HIGH in `PRODUCTION_READINESS_BACKLOG.md`
- [ ] k6 load test: P95 < 3s superagent-chat, < 500ms vertical-profiles
- [ ] HITL queue drained or RM waiver documented

### G2 — DNS & Infrastructure Cutover
- [ ] `api.webwaka.com` CNAME → production worker route verified
- [ ] `workspace.webwaka.com` CNAME verified
- [ ] SSL/TLS: Cloudflare Full (strict) confirmed
- [ ] Staging smoke tests pass against `api-staging.webwaka.com`

### G3 — Secrets Provisioned (Production)
- [ ] `JWT_SECRET` (≥ 64 chars)
- [ ] `INTER_SERVICE_SECRET`
- [ ] `PAYSTACK_SECRET_KEY`
- [ ] `PREMBLY_API_KEY`
- [ ] `TERMII_API_KEY`
- [ ] `AI_PROVIDER_API_KEY`
- [ ] `SMOKE_API_KEY`
- [ ] `R2_DSAR_ACCESS_KEY_ID` + `R2_DSAR_SECRET_ACCESS_KEY`
- [ ] `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` (GitHub secrets for CI)

### G4 — Migration Verified
- [ ] All migrations 0001 → 0463 applied to `webwaka-production` D1
- [ ] `wrangler d1 execute webwaka-production --command "SELECT name FROM d1_migrations ORDER BY id DESC LIMIT 5;"` shows 0463
- [ ] Migration checksums artifact matches staging run

### G5 — Post-Deploy Smoke (Production)
- [ ] `GET /health` → 200
- [ ] `GET /health/deep` → `{"status": "ok"}`
- [ ] Auth flow: register → OTP verify → JWT issued
- [ ] Marketplace: `GET /verticals` returns ≥ 150 entries
- [ ] Superagent: `GET /superagent/capabilities` returns tool list
- [ ] Wallet: `GET /wallets/my` returns valid response for authenticated user

### G6 — Rollback Tested
- [ ] `rollback-worker.yml` dispatch tested on staging
- [ ] `rollback-migration.yml` dispatch tested on staging
- [ ] `docs/runbooks/rollback-procedure.md` reviewed and up to date

### G7 — Incident Response Ready
- [ ] Alerting configured: 5xx spike, D1 latency > 500ms, KV unavailable
- [ ] On-call rotation: `docs/runbooks/incident-response.md`
- [ ] Status page configured

### G8 — Compliance Final Check
- [ ] NDPR consent middleware active on production
- [ ] DSAR export tested end-to-end on production D1
- [ ] Data retention sweep confirmed running
- [ ] KYC tier limits confirmed matching CBN guidelines

---

## Wave 4 Acceptance Criteria

```
[x] All P1–P4 Pilot Infrastructure items complete (backend)
[ ] P3 frontend widget (FE-PILOT-01) — Replit task
[ ] P5 monitoring/observability items
[ ] All G1–G8 Production Launch items complete
[ ] CI green on main branch (merge from staging)
[ ] Founder signs off on pilot cohort 1 selection
[ ] Production deploy executed via deploy-production.yml
[ ] Blue-green smoke passes on production green environment
[ ] Canary circuit breaker: no trip in first 5 minutes post-deploy
[ ] NPS baseline from pilot cohort 1 (minimum 3 responses)
```

---

## Wave 4 Progress

| Area | Done | Total | % |
|------|------|-------|---|
| Pilot DB + Services | 4 | 4 | **100%** ✅ |
| Pilot Admin API | 7 | 7 | **100%** ✅ |
| Pilot Feedback (backend) | 2 | 2 | **100%** ✅ |
| Pilot Feedback (frontend) | 0 | 3 | 0% (Replit) |
| Pilot Seed Data | 3 | 4 | 75% |
| Pilot Monitoring | 0 | 3 | 0% |
| Production Gate G1–G8 | 0 | 8 | 0% |
| **Overall Wave 4** | **16** | **31** | **52%** |

---

## Next Actions (in order)

1. **P5** — Pilot health cron: daily summary log job in `apps/schedulers/src/index.ts`
2. **G1** — `docs/release/release-gate.md` — formal release gate document
3. **G2** — DNS cutover verification checklist (`docs/runbooks/dns-cutover.md`)
4. **G3** — Production secrets provisioning confirmation (ops task for Founder)
5. **G4** — Migration apply script for production D1 (CI workflow update)
6. **G5** — Production smoke test script (`scripts/smoke-production.mjs`)
7. **G6** — Rollback procedure runbook review
8. **G8** — Compliance final check runbook

---

*Last updated: 2026-05-02 by WebWaka (Base44)*
