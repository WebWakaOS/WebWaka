# Release Gate Checklist — Wave 3 C5-5

All items must be ✅ before any production deploy is approved.
The Release Manager (RM) signs off on completion.

---

## Pre-Deploy: CI Green

- [ ] `ci.yml` — All jobs passing: typecheck, test, lint, openapi-lint, security-audit, governance-checks, smoke, k6-load
- [ ] `coverage.yml` — Line coverage ≥ 70% for superagent, ai-abstraction, vertical-engine
- [ ] `lighthouse.yml` — Performance ≥ 85, Accessibility ≥ 90 on workspace-app
- [ ] Frontend bundle size check — no regression > 15% vs baseline
- [ ] No CRITICAL or HIGH issues open in `PRODUCTION_READINESS_BACKLOG.md`

**Verify:**
```bash
gh run list --workflow=ci.yml --branch=main --limit=1 --json status,conclusion
```

---

## Pre-Deploy: Load Test Pass

- [ ] k6 superagent-chat load test: P95 < 3s, error rate < 1%
- [ ] k6 vertical-profiles load test: P95 < 500ms, error rate < 1%
- [ ] k6 baseline comparison: no metric regressed by > 20%

**Run:**
```bash
# Staging environment
k6 run --env BASE_URL=https://api-staging.webwaka.com \
        --env API_KEY=$STAGING_SMOKE_KEY \
        --out json=results.json \
        infra/k6/superagent-chat-load.js

node infra/k6/compare-baseline.mjs
```

---

## Pre-Deploy: HITL Queue Drained

- [ ] Zero open HITL tasks in `hitl_tasks` table with `status = 'pending'`
- [ ] Or: RM confirms all pending tasks are for post-deploy review and can safely survive a deploy

**Verify:**
```bash
wrangler d1 execute webwaka-db --env production \
  --command "SELECT COUNT(*) as pending FROM hitl_tasks WHERE status = 'pending';"
```

---

## Pre-Deploy: Anomaly Review

- [ ] No active spend-spike anomaly alerts in the last 24h
- [ ] AI adapter error rate < 1% in last 1h (check Logpush / dashboard)
- [ ] D1 latency < 200ms p95 in last 1h
- [ ] No unacknowledged PagerDuty / monitoring alerts

**Check:**
```bash
curl https://api-staging.webwaka.com/health/deep | jq .
```

---

## Pre-Deploy: Rollback Plan Documented

- [ ] Migration rollback scripts present for every migration in this release:
  ```bash
  npx tsx scripts/governance-checks/check-rollback-scripts.ts
  ```
- [ ] Worker version ID for current production noted:
  ```bash
  wrangler versions list --env production | head -5
  # Note the current VERSION_ID for instant rollback
  ```
- [ ] Rollback procedure tested on staging at least once

---

## Deploy Steps

1. **Tag the release:**
   ```bash
   git tag v<MAJOR>.<MINOR>.<PATCH> && git push origin v<MAJOR>.<MINOR>.<PATCH>
   ```

2. **Deploy to staging (if not already there):**
   ```bash
   pnpm run deploy:staging
   ```

3. **Run expanded smoke on staging:**
   ```bash
   SMOKE_BASE_URL=https://api-staging.webwaka.com \
   SMOKE_API_KEY=$STAGING_SMOKE_KEY \
   npx tsx tests/smoke/deploy-expanded.smoke.ts
   ```

4. **Promote to production:**
   ```bash
   pnpm run deploy:production
   # Or trigger the deploy-production.yml workflow
   ```

5. **Confirm production smoke:**
   ```bash
   SMOKE_BASE_URL=https://api.webwaka.com \
   SMOKE_API_KEY=$PROD_SMOKE_KEY \
   npx tsx tests/smoke/deploy-expanded.smoke.ts
   ```

6. **Update `WAVE3_CHECKLIST.md`** and close any related issues.

---

## Post-Deploy

- [ ] Monitor error rate for 15 minutes post-deploy
- [ ] Confirm `/health/deep` → `"status":"ok"` on production
- [ ] Announce in `#releases` Slack channel with deploy summary
- [ ] If anything looks wrong: **rollback immediately** (< 5 minutes):
  ```bash
  pnpm run rollback:worker -- --env production
  ```
