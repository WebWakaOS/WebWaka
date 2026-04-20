# Runbook: Dead-Letter Notification Sweep

**Version:** 1.0 | **Phase:** 9 (N-130) | **Owner:** Platform Engineering

---

## Purpose

This runbook describes how to identify and retry failed notifications that have landed
in a "dead-letter" state — deliveries with `status='failed'` in `notification_delivery` 
that were not automatically retried.

Dead-letter scenarios:
1. Provider outage during dispatch (e.g., Resend/Termii downtime)
2. Cloudflare Queue consumer crash before acknowledgement
3. Template render failure that blocked the entire rule's recipients
4. Suppression or preference service timeout causing fallback-failure

---

## Step 1: Identify Dead-Letter Volume

```bash
# Count failed deliveries by channel, provider, and time window
wrangler d1 execute webwaka-os-production --command \
  "SELECT channel, provider_name, COUNT(*) as failed_count,
          MIN(created_at) as oldest_failure, MAX(created_at) as newest_failure
   FROM notification_delivery
   WHERE status = 'failed'
   GROUP BY channel, provider_name
   ORDER BY failed_count DESC;"

# See the specific error messages
wrangler d1 execute webwaka-os-production --command \
  "SELECT id, tenant_id, channel, provider_name, last_error, created_at
   FROM notification_delivery
   WHERE status = 'failed'
   ORDER BY created_at DESC
   LIMIT 50;"
```

---

## Step 2: Classify Dead Letters

Before retrying, classify each batch:

| Category | Indicator | Action |
|----------|-----------|--------|
| **Provider outage** | `last_error` contains `503`, `429`, or `timeout` | Retry after failover |
| **Invalid address** | `last_error` contains `invalid email`, `undeliverable` | Do NOT retry; add to suppression |
| **Suppressed** | `last_error` contains `suppressed` | No action needed |
| **Template error** | `last_error` contains `render`, `template` | Fix template; retry |
| **Rate limit** | `last_error` contains `429` | Retry with backoff |

---

## Step 3: Retry Eligible Dead Letters

### Option A — Re-enqueue via Cloudflare Queue

If the Cloudflare Queue consumer is available, re-enqueue failed `notif_event` messages:

```bash
# Find notification_event IDs for failed deliveries (last 24h)
wrangler d1 execute webwaka-os-production --command \
  "SELECT DISTINCT nd.notification_event_id
   FROM notification_delivery nd
   WHERE nd.status = 'failed'
     AND nd.created_at > unixepoch() - 86400
     AND nd.last_error NOT LIKE '%suppressed%'
     AND nd.last_error NOT LIKE '%invalid email%'
   LIMIT 100;"
```

Then re-publish those events via the admin API:

```bash
# Re-publish a specific notification event
curl -X POST https://api.webwaka.com/platform/notifications/replay \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Inter-Service-Secret: $INTER_SERVICE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"notificationEventId": "<NOTIF_EVENT_ID>"}'
```

### Option B — Mark as permanently failed (suppress retry)

For deliveries that should NOT be retried (invalid addresses, content violations):

```bash
wrangler d1 execute webwaka-os-production --command \
  "UPDATE notification_delivery
   SET status = 'permanently_failed', updated_at = unixepoch()
   WHERE status = 'failed'
     AND (last_error LIKE '%invalid email%' OR last_error LIKE '%undeliverable%')
     AND created_at < unixepoch() - 3600;"
```

### Option C — Add permanently undeliverable addresses to suppression list

```bash
# Find undeliverable email addresses
wrangler d1 execute webwaka-os-production --command \
  "SELECT DISTINCT recipient_address, tenant_id
   FROM notification_delivery
   WHERE status = 'failed'
     AND last_error LIKE '%bounce%' OR last_error LIKE '%undeliverable%'
   LIMIT 100;"

# For each address, call the suppression API
curl -X POST https://api.webwaka.com/api/v1/notifications/suppression \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel": "email", "address": "<EMAIL>", "reason": "hard_bounce"}'
```

---

## Step 4: Monitor Retry Progress

```bash
# Monitor retry success rate
wrangler d1 execute webwaka-os-production --command \
  "SELECT status, COUNT(*) as cnt
   FROM notification_delivery
   WHERE updated_at > unixepoch() - 1800
   GROUP BY status;"
```

---

## Step 5: Post-Sweep Audit

```bash
# Confirm dead-letter queue is cleared
wrangler d1 execute webwaka-os-production --command \
  "SELECT COUNT(*) as remaining_failures
   FROM notification_delivery
   WHERE status = 'failed' AND created_at > unixepoch() - 86400;"
```

---

## Escalation

If > 1,000 dead letters remain after sweep, or > 10% are unclassifiable:
- Page Platform Engineering lead
- Open incident in #platform-incidents Slack
- Preserve all `last_error` messages in `docs/incidents/<DATE>-dead-letter.md`

---

## Prevention

1. Configure retry policies on the Cloudflare Queue consumer in `apps/notificator/wrangler.toml`
2. Set `max_retries = 3` with exponential backoff for transient errors
3. Enable provider alerting in Resend/Termii dashboards
4. Monitor `notification_delivery.status='failed'` count daily (N-129 monitoring)
