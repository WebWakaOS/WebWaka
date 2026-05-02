# Incident Response Checklist — Wave 3 C4-5

## Severity Classification

| Level | Definition | Example |
|-------|-----------|---------|
| **P0** | Complete service outage or critical data integrity risk | D1 down, all API 503, billing double-charge |
| **P1** | Major feature unavailable or significant performance degradation | SuperAgent chat fails for all users, >5% 5xx |
| **P2** | Minor feature broken or elevated latency (no data risk) | Analytics page broken, one vertical fails |
| **P3** | Cosmetic issues, single-user edge cases | Wrong currency display, typo in error message |

---

## Escalation Path

```
Alert fires
    │
    ▼
On-call engineer (P0: 15 min, P1: 30 min, P2: 2h, P3: next biz day)
    │
    ├─ P0/P1 unresolved within SLA ──► Founder + senior engineer
    │
    └─ Resolved ──► Post-mortem within 48h (P0/P1)
```

**On-call rotation:** See `docs/identity/team.md` (not committed to public repo).

---

## Response Procedures

### 1. IDENTIFY

```bash
# Tail live Worker logs
wrangler tail webwaka-api --env staging
wrangler tail webwaka-api --env production

# Check deep health
curl https://api.webwaka.com/health/deep | jq .

# Check recent deploys
git log --oneline origin/main -10
```

- Note: `started_at`, `severity`, `affected_component`, `user_impact`.

### 2. COMMUNICATE

- P0/P1: post immediately to `#incidents` Slack channel:
  ```
  🔴 [P0 INCIDENT] webwaka-api — D1 connectivity failure
  Started: 2026-05-02 09:15 WAT
  Impact: All workspace reads failing
  IC: @yourname
  ```
- Update status page (if applicable) within 10 minutes of P0/P1.
- P2: post to `#engineering` within 2h.

### 3. MITIGATE

**Option A — Rollback Worker (fastest)**
```bash
# List recent versions
wrangler versions list --env production

# Rollback to previous stable version
pnpm run rollback:worker -- --env production --version <id>
# Or: scripts/rollback-worker.sh production <version-id>
```

**Option B — Rollback Migration (data issue)**
```bash
# Identify the failing migration
wrangler d1 execute webwaka-db --env production \
  --command "SELECT * FROM d1_migrations ORDER BY created_at DESC LIMIT 5;"

# Run the rollback SQL
wrangler d1 execute webwaka-db --env production \
  --file infra/db/migrations/<migration>.rollback.sql

# See: docs/runbooks/rollback-procedure.md
```

**Option C — Feature Flag Off (specific feature)**
```bash
# Disable a feature flag via KV
wrangler kv key put --binding=KV --env production \
  "feature:superagent_chat" "false"
```

**Option D — Emergency spend freeze**
```sql
-- Via Wrangler D1 console
UPDATE wc_wallets SET spend_cap_monthly_wc = 0 WHERE tenant_id = '<id>';
```

### 4. RESOLVE

- Confirm `/health/deep` returns `"status":"ok"`.
- Run expanded smoke suite:
  ```bash
  SMOKE_BASE_URL=https://api.webwaka.com \
  SMOKE_API_KEY=$SMOKE_API_KEY \
  npx tsx tests/smoke/deploy-expanded.smoke.ts
  ```
- Announce resolution in `#incidents` with duration.

### 5. POST-MORTEM (P0/P1 required within 48h)

Use template below. File in `docs/post-mortems/YYYY-MM-DD-title.md`.

---

## Post-Mortem Template

```markdown
# Post-Mortem: [Title]
**Date:** YYYY-MM-DD
**Severity:** P0/P1
**Duration:** HH:MM
**IC:** @name

## Summary
One-paragraph description of what happened and its impact.

## Timeline (WAT)
- HH:MM — Alert fired
- HH:MM — On-call engaged
- HH:MM — Root cause identified
- HH:MM — Mitigation applied
- HH:MM — Resolved

## Root Cause
Technical description of the root cause.

## Impact
- Users affected: N tenants / N requests
- Data impact: None / Describe
- Revenue impact: N WakaCU lost / refunded

## Corrective Actions
| Action | Owner | Due |
|--------|-------|-----|
| Add regression test | @name | YYYY-MM-DD |
| Add alert for X | @name | YYYY-MM-DD |
| Update runbook | @name | YYYY-MM-DD |

## Lessons Learned
What went well. What didn't. What to improve.
```

---

## Rollback Decision Matrix

| Condition | Action |
|-----------|--------|
| New deploy broke API (5xx spike) | Rollback Worker (Option A) |
| Migration added bad constraint | Rollback Migration (Option B) |
| New feature causing spend spike | Feature flag off (Option C) |
| Tenant billing error | Emergency spend freeze (Option D) |
| CF infrastructure issue | Wait + monitor CF status page |
