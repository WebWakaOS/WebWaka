# Runbook: Digest Rerun

**Version:** 1.0 | **Phase:** 9 (N-130) | **Owner:** Platform Engineering

---

## Purpose

This runbook describes how to rerun notification digests when the scheduled digest
flush failed or produced incorrect output. Digests aggregate multiple notification
events into a single batch email/push/in-app delivery per user per window type
(`hourly`, `daily`, `weekly`).

Digest infrastructure:
- `notification_digest_batch` — one row per (tenant, user, channel, window_type, date)
- `notification_digest_batch_item` — individual notification events within a batch
- Digest flush CRON: runs at top of each hour (hourly), 07:00 daily, 09:00 Monday (weekly)

---

## Step 1: Identify Failed or Missed Digests

```bash
# Find digest batches that should have been flushed but are still pending
wrangler d1 execute webwaka-os-production --command \
  "SELECT id, tenant_id, user_id, channel, window_type, window_date,
          item_count, status, created_at, flushed_at
   FROM notification_digest_batch
   WHERE status = 'pending'
     AND window_date < date('now')
   ORDER BY window_date ASC
   LIMIT 50;"

# Find batches that failed during flush
wrangler d1 execute webwaka-os-production --command \
  "SELECT id, tenant_id, user_id, channel, window_type, window_date,
          status, last_error
   FROM notification_digest_batch
   WHERE status = 'failed'
   ORDER BY window_date DESC
   LIMIT 50;"
```

---

## Step 2: Investigate Root Cause

Common failure causes:

| Symptom | Likely Cause | Diagnosis |
|---------|-------------|-----------|
| All batches failed same window | CRON trigger missed | Check Cloudflare Workers cron logs |
| Email-only failures | Email provider outage | Check `notification_delivery` failures at flush time |
| Specific tenant failures | Tenant suspended/over-limit | Check `workspace.status` in D1 |
| Empty batch emails | `item_count=0` | Items may have been cleaned up prematurely |

```bash
# Check CRON execution logs (Cloudflare Workers Logpush or live tail)
wrangler tail webwaka-notificator --env production | grep "digest"
```

---

## Step 3: Rerun Failed Digests

### Option A — Re-trigger digest flush for specific batches

```bash
# Reset failed batches to 'pending' for re-flush
wrangler d1 execute webwaka-os-production --command \
  "UPDATE notification_digest_batch
   SET status = 'pending', last_error = NULL, updated_at = unixepoch()
   WHERE status = 'failed'
     AND window_date = '<WINDOW_DATE>'
     AND channel = '<CHANNEL>';"
```

Then trigger a manual CRON run via the projections inter-service endpoint:

```bash
curl -X POST https://notificator.webwaka.com/digest/flush \
  -H "X-Inter-Service-Secret: $INTER_SERVICE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"windowType": "daily", "windowDate": "<WINDOW_DATE>"}'
```

### Option B — Flush specific tenant's batches

```bash
# Find tenant's pending batches
wrangler d1 execute webwaka-os-production --command \
  "SELECT id FROM notification_digest_batch
   WHERE tenant_id = '<TENANT_ID>' AND status IN ('pending', 'failed')
   AND window_date < date('now');"

# Reset them
wrangler d1 execute webwaka-os-production --command \
  "UPDATE notification_digest_batch
   SET status = 'pending', updated_at = unixepoch()
   WHERE tenant_id = '<TENANT_ID>' AND status = 'failed';"
```

### Option C — Manual digest delivery for critical tenant

For VIP/enterprise tenants requiring immediate resolution without waiting for CRON:

```bash
curl -X POST https://api.webwaka.com/platform/notifications/digest/flush-tenant \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Inter-Service-Secret: $INTER_SERVICE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "<TENANT_ID>", "windowType": "daily"}'
```

---

## Step 4: Verify Digest Delivery

```bash
# Confirm batches transitioned to 'flushed'
wrangler d1 execute webwaka-os-production --command \
  "SELECT status, COUNT(*) as cnt, window_date
   FROM notification_digest_batch
   WHERE window_date >= '<WINDOW_DATE>'
   GROUP BY status, window_date
   ORDER BY window_date DESC;"

# Verify deliveries were created for the flushed batches
wrangler d1 execute webwaka-os-production --command \
  "SELECT nd.status, COUNT(*) as cnt
   FROM notification_delivery nd
   JOIN notification_digest_batch ndb ON nd.notification_event_id = ndb.id
   WHERE ndb.flushed_at > unixepoch() - 3600
   GROUP BY nd.status;"
```

---

## Step 5: Prevent Future Misses

1. **Alert on pending digests past flush window:** Add Cloudflare D1 monitor query
2. **Set digest CRON redundancy:** Ensure both the notificator and projections workers have digest flush triggers
3. **Test digest flush in staging** after any change to `digest-engine.ts`

---

## SLA Commitments

| Window type | Max acceptable delay |
|-------------|----------------------|
| Hourly | 90 minutes from window close |
| Daily | 4 hours from window close (07:00 UTC target) |
| Weekly | 12 hours from window close (Monday 09:00 UTC target) |

If delay exceeds SLA, escalate to Platform Engineering lead and notify affected tenants.

---

## Contact

- **On-call:** #platform-oncall Slack
- **Digest code:** `packages/notifications/src/digest-engine.ts`
- **Digest CRON:** `apps/notificator/src/consumer.ts` + CRON triggers in `wrangler.toml`
