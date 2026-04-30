# WebWaka Operational Runbook — Consolidated Reference

> **Single source of truth** for all critical operations. Individual runbooks
> in `docs/ops/runbooks/`, `docs/runbooks/`, and `docs/operations/` are retained
> for detailed procedures; this document serves as the master index.

---

## Table of Contents

1. [Deploy](#deploy)
2. [Rollback](#rollback)
3. [Database Operations](#database-operations)
4. [Secret Rotation](#secret-rotation)
5. [Monitoring & Alerting](#monitoring--alerting)
6. [Incident Response](#incident-response)
7. [Provider Failover](#provider-failover)
8. [Notification Operations](#notification-operations)
9. [USSD Operations](#ussd-operations)

---

## Deploy

### Staging Deploy
**Trigger**: Push to `staging` branch  
**Workflow**: `.github/workflows/deploy-staging.yml`

```bash
# Normal flow (automated):
git push origin staging

# Manual deploy via Actions UI:
# Go to Actions → Deploy — Staging → Run workflow
```

**Pipeline stages**:
1. CI Checks (lint, typecheck, tests, governance)
2. D1 Migrations (`wrangler d1 migrations apply --remote`)
3. Deploy API Worker
4. Deploy 8 auxiliary workers
5. QA Seed Data
6. Smoke Tests (k6 + custom)
7. QA Gate (Cycles 01–08)

**Verification**: `curl https://api-staging.webwaka.com/health/ready`

### Production Deploy
**Trigger**: Push to `main` branch  
**Workflow**: `.github/workflows/deploy-production.yml`

**Pre-checks**:
- Staging must be green (validated by workflow)
- Secrets validation passes (C-3 check)
- All CI checks pass

**Rollback**: See [Rollback](#rollback) section below.

---

## Rollback

### API Rollback (Instant)
```bash
# List recent deployments:
wrangler deployments list --name webwaka-api --env production

# Roll back to previous version:
wrangler rollback --name webwaka-api --env production
```

### Migration Rollback
**Workflow**: `.github/workflows/rollback-migration.yml`  
**Detail**: [docs/operations/database-rollback-runbook.md](../operations/database-rollback-runbook.md)

```bash
# Each migration has a companion .rollback.sql file in infra/db/migrations/
# The rollback workflow applies the rollback SQL to the target database.

# Manual rollback of last migration:
wrangler d1 execute webwaka-production --remote \
  --file infra/db/migrations/0456_multi_country_geography.rollback.sql
```

**Important**: Always verify rollback in staging first.

---

## Database Operations

### Apply a new migration manually
```bash
cd apps/api
echo "y" | npx wrangler d1 migrations apply webwaka-staging --remote
```

### Execute raw SQL on staging
```bash
wrangler d1 execute webwaka-staging --remote --command "SELECT COUNT(*) FROM tenants;"
```

### Seed data (staging only)
```bash
wrangler d1 execute webwaka-staging --remote --file scripts/seed/phase-1-tenants.sql
```

---

## Secret Rotation

**Schedule**: Every 90 days  
**Log**: [docs/ops/secrets-rotation-log.md](secrets-rotation-log.md)  
**Detail**: [docs/runbooks/secret-rotation.md](../runbooks/secret-rotation.md)

### Procedure
```bash
# 1. Generate new secret value
openssl rand -base64 32

# 2. Update in Cloudflare
echo "NEW_VALUE" | wrangler secret put JWT_SECRET --env production

# 3. Update GitHub secret (for CI)
gh secret set JWT_SECRET_PRODUCTION --body "NEW_VALUE"

# 4. Update rotation log
# Edit docs/ops/secrets-rotation-log.md with date and operator
```

### Secrets to rotate
| Secret | Rotation Period | Last Rotated |
|--------|----------------|--------------|
| JWT_SECRET | 90 days | See rotation log |
| INTER_SERVICE_SECRET | 90 days | See rotation log |
| PAYSTACK_SECRET_KEY | 90 days | See rotation log |
| DM_MASTER_KEY | 180 days | See rotation log |
| PRICE_LOCK_SECRET | 180 days | See rotation log |

---

## Monitoring & Alerting

**Dashboard**: Cloudflare Dashboard → Workers & Pages → Analytics  
**Detail**: [docs/governance/monitoring-runbook.md](../governance/monitoring-runbook.md)

### Key metrics
- `http_req_duration` P95 < 500ms
- Error rate < 0.1%
- D1 query latency < 100ms
- KV read latency < 50ms

### Health endpoints
```bash
# API health
curl https://api.webwaka.com/health/ready

# Version
curl https://api.webwaka.com/health/version
```

### Error monitoring
The API worker emits structured JSON logs for:
- `event: rate_limit_exceeded` — Track abuse patterns
- `event: auth_failed` — Monitor unauthorized access attempts
- `event: scheduler_job_failed` — Job execution failures
- `event: billing_enforcement_blocked` — Suspended workspaces

---

## Incident Response

### Severity Levels
| Level | Definition | Response Time | Communication |
|-------|-----------|---------------|---------------|
| SEV-1 | Total platform outage | 15 min | All stakeholders |
| SEV-2 | Major feature broken | 1 hour | Engineering + PM |
| SEV-3 | Minor degradation | 4 hours | Engineering |
| SEV-4 | Non-urgent issue | Next business day | Ticket |

### SEV-1 Procedure
1. Verify outage: `curl https://api.webwaka.com/health`
2. Check Cloudflare Status: https://www.cloudflarestatus.com
3. If CF healthy → Check recent deploys → Rollback if correlated
4. If CF degraded → Wait for CF resolution, post status update
5. Post-incident: Create RCA document within 48 hours

### SEV-2 Procedure
1. Identify affected feature and users
2. Check logs: Cloudflare Dashboard → Workers → Logs
3. Determine if rollback needed or hotfix possible
4. Apply fix via staging → verify → promote to production

---

## Provider Failover

**Detail**: [docs/ops/runbooks/provider-failover.md](runbooks/provider-failover.md)

### Termii (SMS/OTP) Failover
If Termii is down:
1. Check status: https://status.termii.com
2. Switch to backup provider via feature flag in KV
3. Update `SMS_PROVIDER` KV key: `echo "backup" | wrangler kv:key put SMS_PROVIDER backup --binding RATE_LIMIT_KV --env production`

### Paystack Failover
Paystack has no direct failover. If degraded:
1. Enable "graceful degradation" mode for payment flows
2. Queue failed transactions for retry when service recovers
3. Notify affected workspaces via notification system

---

## Notification Operations

**Detail**: [docs/operations/notification-package.md](../operations/notification-package.md)

### Sandbox mode toggle
```bash
# Enable sandbox (staging should ALWAYS be sandbox):
echo "true" | wrangler secret put NOTIFICATION_SANDBOX_MODE --env staging

# Verify production is live:
echo "false" | wrangler secret put NOTIFICATION_SANDBOX_MODE --env production
```

### Dead letter sweep
**Detail**: [docs/ops/runbooks/dead-letter-sweep.md](runbooks/dead-letter-sweep.md)

---

## USSD Operations

**Detail**: [docs/operations/ussd-route-registration.md](../operations/ussd-route-registration.md)

### Session monitoring
USSD sessions are stored in KV with TTL. Monitor via:
```bash
# Check active session count (approximate):
wrangler kv:key list --binding USSD_KV --env production --prefix "session:" | wc -l
```

### Route registration with telcos
Follow the procedure in `docs/operations/ussd-route-registration.md` for each new deployment region.

---

## Quick Reference

| Operation | Command |
|-----------|---------|
| Deploy staging | `git push origin staging` |
| Check API health | `curl https://api-staging.webwaka.com/health/ready` |
| Rollback API | `wrangler rollback --name webwaka-api --env production` |
| Run migration | `wrangler d1 migrations apply webwaka-staging --remote` |
| Rotate secret | `echo "VAL" \| wrangler secret put NAME --env production` |
| Check logs | Cloudflare Dashboard → Workers → Tail |
| k6 load test | `k6 run infra/k6/smoke.js --env BASE_URL=URL` |
