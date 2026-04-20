# Runbook: Notification Provider Failover

**Version:** 1.0 | **Phase:** 9 (N-130) | **Owner:** Platform Engineering

---

## Purpose

This runbook describes how to fail over the notification provider for any channel
(email, SMS, WhatsApp, push) when the primary provider becomes degraded or unavailable.

Provider credentials are stored in `NOTIFICATION_KV` (AES-256-GCM encrypted), referenced from
D1 via `credentials_kv_key` in the `channel_provider` table (ADL-002/G16).

---

## Decision Criteria: When to Failover

Failover is warranted when **any** of the following conditions persist for > 5 minutes:

| Signal | Threshold | Check location |
|--------|-----------|----------------|
| Provider error rate | > 10% of sends | `notification_delivery` table `status='failed'` |
| Provider latency | P99 > 8s | `notification_audit_log` `dispatch_duration_ms` |
| Provider HTTP 5xx | > 5 consecutive | App logs: `[notificator] dispatch failed` |
| Provider status page | Incident active | See Provider Status URLs below |

**Provider Status Pages:**
- Resend (email): https://status.resend.com
- Termii (SMS): https://status.termii.com
- Meta 360dialog (WhatsApp): https://www.360dialog.io/status

---

## Step 1: Confirm Degradation

```bash
# Check recent failure rate in D1 (last 15 minutes)
wrangler d1 execute webwaka-os-production --command \
  "SELECT channel, status, COUNT(*) as cnt
   FROM notification_delivery
   WHERE created_at > unixepoch() - 900
   GROUP BY channel, status
   ORDER BY channel, status;"

# Check audit log for dispatch errors
wrangler d1 execute webwaka-os-production --command \
  "SELECT provider_name, COUNT(*) as failures
   FROM notification_audit_log
   WHERE status='failed' AND created_at > unixepoch() - 900
   GROUP BY provider_name;"
```

---

## Step 2: Identify Failover Target

Before activating failover, confirm the backup provider is configured:

```bash
# List active channel providers
wrangler d1 execute webwaka-os-production --command \
  "SELECT id, tenant_id, channel, provider_name, is_active, credentials_kv_key
   FROM channel_provider
   WHERE channel = '<CHANNEL>'
   ORDER BY is_platform_default DESC, is_active DESC;"
```

The backup provider should already have:
- A `channel_provider` row with `is_active = 0`
- A valid `credentials_kv_key` pointing to encrypted credentials in `NOTIFICATION_KV`

---

## Step 3: Activate Backup Provider

### Option A — Flip is_active flags in D1

```bash
# Deactivate primary (e.g., resend → email)
wrangler d1 execute webwaka-os-production --command \
  "UPDATE channel_provider
   SET is_active = 0, updated_at = unixepoch()
   WHERE provider_name = 'resend' AND channel = 'email' AND tenant_id IS NULL;"

# Activate backup (e.g., sendgrid → email)
wrangler d1 execute webwaka-os-production --command \
  "UPDATE channel_provider
   SET is_active = 1, updated_at = unixepoch()
   WHERE provider_name = 'sendgrid' AND channel = 'email' AND tenant_id IS NULL;"
```

### Option B — Route via NOTIFICATION_PIPELINE_ENABLED kill-switch

If the full pipeline is degraded, fall back to legacy EmailService:

```bash
# Set kill-switch to 0 (legacy EmailService path in apps/api)
wrangler secret put NOTIFICATION_PIPELINE_ENABLED --env production
# Enter value: 0
```

> ⚠ **Warning:** Legacy path uses `RESEND_API_KEY` secret directly. Confirm secret is set.

---

## Step 4: Verify Failover is Working

```bash
# Monitor new delivery attempts
wrangler d1 execute webwaka-os-production --command \
  "SELECT provider_name, status, COUNT(*) as cnt
   FROM notification_audit_log
   WHERE created_at > unixepoch() - 300
   GROUP BY provider_name, status;"

# Send a test notification via admin panel or API
curl -X POST https://api.webwaka.com/platform/notifications/test \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel": "email", "to": "ops-test@webwaka.com", "subject": "Failover test"}'
```

---

## Step 5: Drain Dead-Letter Queue

After failover, check for failed deliveries that should be retried:

```bash
# Count failed deliveries from degraded window
wrangler d1 execute webwaka-os-production --command \
  "SELECT COUNT(*) as failed
   FROM notification_delivery
   WHERE status = 'failed' AND created_at > <DEGRADATION_START_TIMESTAMP>;"
```

Then run the dead-letter sweep runbook: [dead-letter-sweep.md](./dead-letter-sweep.md)

---

## Step 6: Post-Incident

1. **Document** the incident start/end time and affected channels
2. **Update** `channel_provider.is_active` once primary provider recovers
3. **File** a post-mortem within 48 hours in `docs/incidents/`
4. **Review** whether additional backup providers need to be pre-configured

---

## Rollback

To restore primary provider:

```bash
wrangler d1 execute webwaka-os-production --command \
  "UPDATE channel_provider
   SET is_active = 1, updated_at = unixepoch()
   WHERE provider_name = '<PRIMARY>' AND channel = '<CHANNEL>' AND tenant_id IS NULL;
   UPDATE channel_provider
   SET is_active = 0, updated_at = unixepoch()
   WHERE provider_name = '<BACKUP>' AND channel = '<CHANNEL>' AND tenant_id IS NULL;"
```

---

## Contact

- **On-call:** #platform-oncall Slack channel
- **Escalation:** Platform Engineering lead
- **Monitoring:** Cloudflare Workers analytics → `webwaka-notificator` worker
