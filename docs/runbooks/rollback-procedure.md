# Rollback Procedure — WebWaka OS

> ⚠️ **This document has been superseded.**
> The canonical operational runbook is now: **[`docs/ops/RUNBOOK.md`](../ops/RUNBOOK.md)**
> This file is retained for historical reference only.

---

**Last updated:** 2026-04-12
**Owner:** Platform Engineering

---

## 1. Cloudflare Workers Rollback (API)

### Quick Rollback via Dashboard

1. Go to **Cloudflare Dashboard → Workers & Pages → webwaka-api**
2. Select the environment (staging or production)
3. Click **Deployments** tab
4. Find the last known good deployment
5. Click the three-dot menu → **Rollback to this deployment**
6. Confirm the rollback

### Rollback via Wrangler CLI

```bash
npx wrangler deployments list --env production --config apps/api/wrangler.toml
npx wrangler rollback --env production --config apps/api/wrangler.toml
```

### Verification

```bash
curl -s https://api.webwaka.com/health | jq .
curl -s https://api.webwaka.com/health/ready | jq .
curl -s https://api.webwaka.com/health/version | jq .version
```

---

## 2. D1 Database Migration Rollback

### Automated (Recommended)

Use the **Rollback D1 Migration** GitHub Actions workflow:

1. Go to **Actions → Rollback D1 Migration → Run workflow**
2. Enter the migration number (e.g., `0209`)
3. Select the target environment
4. Type `ROLLBACK` to confirm
5. Click **Run workflow**

### Manual

```bash
npx wrangler d1 execute webwaka-staging \
  --env staging \
  --remote \
  --file infra/db/migrations/0209_perf_indexes.rollback.sql \
  --config apps/api/wrangler.toml
```

### Verification

Check that the rolled-back tables/indexes no longer exist:

```bash
npx wrangler d1 execute webwaka-staging \
  --env staging \
  --remote \
  --command "SELECT name FROM sqlite_master WHERE type='index'" \
  --config apps/api/wrangler.toml
```

---

## 3. KV Cache Invalidation

If cached data is stale or corrupt:

```bash
npx wrangler kv:key list --namespace-id <KV_NAMESPACE_ID> --prefix "discovery:search:" | \
  jq -r '.[].name' | \
  xargs -I {} npx wrangler kv:key delete --namespace-id <KV_NAMESPACE_ID> "{}"
```

For geography cache:

```bash
npx wrangler kv:key delete --namespace-id <KV_NAMESPACE_ID> "geo:index"
```

---

## 4. Full Rollback Checklist

| Step | Action | Owner |
|---|---|---|
| 1 | Identify the bad deployment (check error logs, health endpoint) | On-call |
| 2 | Roll back Workers deployment via dashboard or CLI | On-call |
| 3 | Roll back D1 migration if schema change was involved | On-call |
| 4 | Invalidate KV cache if relevant | On-call |
| 5 | Verify health endpoints return 200 | On-call |
| 6 | Monitor error rates for 15 minutes | On-call |
| 7 | Post incident summary in team channel | On-call |

---

## 5. Escalation

If rollback does not restore service:

1. Check Cloudflare Status Page (cloudflarestatus.com) for platform issues
2. Review Cloudflare Workers logs via `wrangler tail --env production`
3. Escalate to Cloudflare support if D1 or Workers infrastructure is degraded
