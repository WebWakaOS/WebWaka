# Runbook: Rollback Procedure

**Release Gate:** G7 (Rollback Readiness)
**Last reviewed:** 2026-05-02

---

## Overview

Two types of rollback may be required:

| Type | When | Action |
|------|------|--------|
| **Worker rollback** | New deploy is unhealthy (5xx spike, smoke fails, canary trips) | Re-deploy previous stable worker version |
| **Migration rollback** | Schema change caused data corruption or query failures | Apply `.rollback.sql` migration in reverse order |

Rollbacks should be completed within **15 minutes** of incident detection.

---

## Part A — Worker Rollback

### A1. Identify the Previous Stable Version

```bash
# List recent deployments
wrangler deployments list --name webwaka-api-production

# The second entry is the previous stable version.
# Note its deployment ID (e.g. abc1234def5)
export PREVIOUS_VERSION=abc1234def5
```

### A2. Roll Back via GitHub Actions (Preferred)

```bash
gh workflow run rollback-worker.yml \
  --ref main \
  -f version=$PREVIOUS_VERSION \
  -f environment=production
```

Monitor the workflow in GitHub Actions until it completes (≤ 5 min).

### A3. Manual Rollback (Fallback)

If the GitHub Actions workflow is unavailable:

```bash
wrangler rollback $PREVIOUS_VERSION \
  --name webwaka-api-production \
  --message "Emergency rollback — incident $(date +%Y%m%d-%H%M)"
```

### A4. Verify Worker Rollback

```bash
curl -sf https://api.webwaka.com/health | jq .
# → {"status":"ok"}

SMOKE_BASE_URL=https://api.webwaka.com \
SMOKE_API_KEY=$SMOKE_API_KEY \
node scripts/smoke-production.mjs
# → All checks pass, exit 0
```

---

## Part B — Migration Rollback

> ⚠️ Migration rollbacks modify production data. Requires two-person sign-off
> (Engineering lead + RM) before execution.

### B1. Identify the Migration to Rollback

```bash
# Check current migration state
wrangler d1 execute webwaka-production \
  --command "SELECT name, applied_at FROM d1_migrations ORDER BY id DESC LIMIT 5;"
```

### B2. Locate the Rollback Script

All migrations have a paired rollback file:

```
apps/api/migrations/<NNNN>_<name>.sql
apps/api/migrations/<NNNN>_<name>.rollback.sql
```

### B3. Execute Rollback via GitHub Actions (Preferred)

```bash
gh workflow run rollback-migration.yml \
  --ref main \
  -f migration=0463_pilot_cohort1_seed \
  -f environment=production
```

### B4. Manual Migration Rollback (Fallback)

```bash
# Apply the rollback SQL against production D1
wrangler d1 execute webwaka-production \
  --file apps/api/migrations/0463_pilot_cohort1_seed.rollback.sql

# Verify — migration should no longer appear as latest
wrangler d1 execute webwaka-production \
  --command "SELECT name FROM d1_migrations ORDER BY id DESC LIMIT 3;"
```

### B5. Verify Migration Rollback

Run the full smoke test and confirm no regression in affected features.

---

## Part C — DNS Rollback

If the DNS cutover itself is the source of the incident:

```bash
# In Cloudflare Dashboard → DNS:
# Update api.webwaka.com CNAME back to:
#   webwaka-api-staging.workers.dev

# Verify within 60 seconds (Cloudflare proxied = near-instant propagation)
curl -sf https://api.webwaka.com/health | jq .
```

---

## Incident Logging

After any rollback, open an incident record in `docs/runbooks/incident-log.md`:

```markdown
## Incident YYYYMMDD-HHMM

- **Type:** Worker / Migration / DNS
- **Detected:** HH:MM UTC
- **Mitigated:** HH:MM UTC (TTM: N minutes)
- **Cause:** ...
- **Action taken:** ...
- **Previous version restored:** <version/migration>
- **Follow-up:** ...
- **Sign-off:** [Engineering lead] [RM]
```

---

## Contacts

| Role | Responsibility |
|------|---------------|
| Engineering Lead | Execute worker/migration rollback |
| RM (Release Manager) | Approve migration rollback, update status page |
| Founder | Final go/no-go on re-deploy after incident |

---

*Runbook owner: Engineering*
*Must be reviewed and confirmed (G7-3) within 48h of each production deploy.*
