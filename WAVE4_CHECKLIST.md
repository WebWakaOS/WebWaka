# Wave 4 — Pilot Rollout & Production Launch Checklist

**Milestone 11 (Pilot Rollout) + Milestone 12 (Production Launch)**
**Status:** 🟡 IN PROGRESS — Wave 3 complete, Wave 4 begun (2026-05-02)
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

### P1 — Database & Service Layer
- [x] `0462_pilot_rollout.sql` — pilot_operators, pilot_feature_flags, pilot_feedback tables
- [x] `packages/pilot/` — PilotOperatorService, PilotFlagService, PilotFeedbackService
- [x] Full test coverage: 20+ tests across 3 service classes
- [x] `vitest.workspace.ts` — `packages/pilot` registered
- [ ] `apps/api/src/routes/pilot-routes.ts` — REST endpoints for pilot admin
- [ ] `apps/api/src/routes/index.ts` — wire pilot routes under `/platform-admin/pilots`
- [ ] Pilot scheduler job: `pruneExpiredFlags` added to `apps/schedulers/src/index.ts`

### P2 — Pilot Admin Endpoints
- [ ] `POST /platform-admin/pilots/operators` — enrol a new pilot operator
- [ ] `GET /platform-admin/pilots/operators` — list all operators (filter by cohort/status)
- [ ] `PATCH /platform-admin/pilots/operators/:tenantId/status` — transition status
- [ ] `GET /platform-admin/pilots/operators/summary` — cohort health dashboard stats
- [ ] `POST /platform-admin/pilots/flags` — grant a per-tenant feature flag
- [ ] `DELETE /platform-admin/pilots/flags/:tenantId/:flagName` — revoke a flag
- [ ] `GET /platform-admin/pilots/feedback/summary` — NPS + type breakdown

### P3 — In-App Feedback Widget
- [ ] `POST /workspace/feedback` — operator-facing endpoint to submit NPS/bug/feature request
- [ ] Trigger: shown after first successful transaction (`first_txn_at` set)
- [ ] Trigger: shown every 30 days for active operators

### P4 — Pilot Cohort 1 Seed Data
- [ ] `0463_pilot_cohort1_seed.sql` — seed 5 pilot operators (restaurant × 2, pharmacy × 1, logistics × 1, motor-park × 1)
- [ ] Feature flags granted for `ai_chat_beta` and `superagent_proactive` on all cohort_1 tenants
- [ ] KV warm-up: wallet flags set for cohort_1 tenants via `setFeatureFlag`

### P5 — Monitoring & Observability
- [ ] Pilot health cron: daily summary log of `active`/`churned`/`graduated` counts
- [ ] Alert: Logpush rule to flag tenants with 0 transactions after 7 days active
- [ ] Dashboard widget: pilot NPS trend (7-day rolling avg) visible in super-admin

---

## Production Launch Readiness (M12)

### G1 — Release Gate Sign-Off
- [ ] `docs/release/release-gate.md` — all items ✅ verified by RM
- [ ] No CRITICAL or HIGH issues in `PRODUCTION_READINESS_BACKLOG.md`
- [ ] k6 load test: P95 < 3s for superagent-chat, < 500ms for vertical-profiles
- [ ] HITL queue drained (`hitl_tasks` pending count = 0) or RM waiver documented

### G2 — DNS & Infrastructure Cutover
- [ ] `api.webwaka.com` CNAME verified pointing to production worker route
- [ ] `workspace.webwaka.com` CNAME verified
- [ ] SSL/TLS: Cloudflare Full (strict) mode confirmed
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
- [ ] All migrations from 0001 → 0462 applied to production D1 (`webwaka-production`)
- [ ] `wrangler d1 execute webwaka-production --command "SELECT name FROM d1_migrations ORDER BY id DESC LIMIT 5;"` — shows 0462
- [ ] Migration checksums artifact matches staging run

### G5 — Post-Deploy Smoke (Production)
- [ ] `GET /health` → 200
- [ ] `GET /health/deep` → `{"status": "ok"}`
- [ ] Auth flow: register → OTP verify → JWT issued
- [ ] Marketplace: `GET /verticals` returns ≥ 150 entries
- [ ] Superagent: `GET /superagent/capabilities` returns tool list
- [ ] Wallet: `GET /wallets/my` returns valid response for authenticated user

### G6 — Rollback Tested
- [ ] `rollback-worker.yml` dispatch tested on staging (confirmed worker reverts)
- [ ] `rollback-migration.yml` dispatch tested on staging (confirmed D1 reverts)
- [ ] Runbook: `docs/runbooks/rollback-procedure.md` reviewed and up to date

### G7 — Incident Response Ready
- [ ] PagerDuty / alerting configured for: 5xx spike, D1 latency > 500ms, KV unavailable
- [ ] On-call rotation documented: `docs/runbooks/incident-response.md`
- [ ] Status page configured (Atlassian Statuspage or equivalent)

### G8 — Compliance Final Check
- [ ] NDPR consent middleware active on production (confirmed via integration test)
- [ ] DSAR export tested end-to-end on production D1
- [ ] Data retention sweep confirmed running (`ndpr-retention-sweep` scheduler active)
- [ ] KYC tier limits confirmed matching CBN guidelines in `docs/governance/entitlement-model.md`

---

## Wave 4 Acceptance Criteria

```
[ ] All P1–P5 Pilot Infrastructure items complete
[ ] All G1–G8 Production Launch items complete
[ ] CI green on main branch (merge from staging)
[ ] Founder signs off on pilot cohort 1 selection
[ ] Production deploy executed via deploy-production.yml (push to main)
[ ] Blue-green smoke passes on production green environment
[ ] Canary circuit breaker: no trip in first 5 minutes post-deploy
[ ] NPS baseline established from pilot cohort 1 (minimum 3 responses)
```

---

## Wave 4 Progress

| Area | Done | Total | % |
|------|------|-------|---|
| Pilot DB + Services | 4 | 7 | 57% |
| Pilot Admin API | 0 | 7 | 0% |
| Pilot Feedback Widget | 0 | 3 | 0% |
| Pilot Seed Data | 0 | 3 | 0% |
| Production Gate | 0 | 8 | 0% |
| **Overall Wave 4** | **4** | **28** | **14%** |

---

## Next Actions (in order)

1. `apps/api/src/routes/pilot-routes.ts` — pilot admin REST layer
2. Wire routes into `apps/api/src/routes/index.ts`
3. Scheduler job: `pruneExpiredFlags` in `apps/schedulers/src/index.ts`
4. Migration `0463_pilot_cohort1_seed.sql` — seed first cohort
5. Production secrets provisioning confirmation
6. DNS cutover + production smoke test

---

*Last updated: 2026-05-02 by WebWaka (Base44)*
