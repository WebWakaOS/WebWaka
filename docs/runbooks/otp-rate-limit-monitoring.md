# OTP Rate-Limit Monitoring — Runbook & Query Templates

**Owner:** Platform Engineering  
**Last updated:** 2026-05-01  
**Related rules:** R5 (identity verify: 2/hour), R9 (OTP send: 5/hr SMS/WA, 3/hr TG)  
**Related code:** `apps/api/src/middleware/rate-limit.ts`, `apps/api/src/routes/contact.ts`

---

## Overview

Every rate-limit rejection emits a structured JSON log line to `console.log` (captured by
Cloudflare Workers runtime → Logpush → your external sink).

All log lines share this shape:

```json
{
  "level": "warn",
  "event": "rate_limit_exceeded",
  "rule_id": "R5 | R9 | otp:sms | ...",
  "key_prefix": "identity:verify | otp:sms | otp:whatsapp | otp:telegram",
  "channel": "sms | whatsapp | telegram",
  "purpose": "channel_verification | kyc_uplift | ...",
  "user_id": "usr_...",
  "workspace_id": "ws_...",
  "ip": "1.2.3.4",
  "path": "/contact/verify/sms",
  "method": "POST",
  "window_seconds": 3600,
  "max_requests": 5,
  "ip_count": 6,
  "ws_count": 0,
  "exceeded_by": 1,
  "timestamp": "2026-05-01T12:00:00.000Z"
}
```

---

## Cloudflare Workers Logpush Queries

### 1. OTP Abuse — all rate-limit hits in last 1 hour

```sql
SELECT
  timestamp,
  json_extract(message, '$.rule_id')       AS rule_id,
  json_extract(message, '$.channel')       AS channel,
  json_extract(message, '$.user_id')       AS user_id,
  json_extract(message, '$.workspace_id')  AS workspace_id,
  json_extract(message, '$.ip')            AS ip,
  json_extract(message, '$.exceeded_by')   AS exceeded_by
FROM workers_logs
WHERE json_extract(message, '$.event') = 'rate_limit_exceeded'
  AND timestamp > NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;
```

### 2. Per-workspace OTP spike detection (top offenders)

```sql
SELECT
  json_extract(message, '$.workspace_id') AS workspace_id,
  COUNT(*)                                 AS rate_limit_hits,
  COUNT(DISTINCT json_extract(message, '$.ip')) AS unique_ips
FROM workers_logs
WHERE json_extract(message, '$.event') = 'rate_limit_exceeded'
  AND json_extract(message, '$.key_prefix') LIKE 'otp:%'
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY workspace_id
ORDER BY rate_limit_hits DESC
LIMIT 20;
```

### 3. Identity verification abuse (R5 — BVN/NIN)

```sql
SELECT
  json_extract(message, '$.user_id')      AS user_id,
  json_extract(message, '$.workspace_id') AS workspace_id,
  json_extract(message, '$.ip')           AS ip,
  COUNT(*)                                AS hits,
  MIN(timestamp)                          AS first_hit,
  MAX(timestamp)                          AS last_hit
FROM workers_logs
WHERE json_extract(message, '$.event') = 'rate_limit_exceeded'
  AND json_extract(message, '$.rule_id') = 'R5'
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY user_id, workspace_id, ip
ORDER BY hits DESC
LIMIT 20;
```

### 4. Channel-level breakdown (R9 — SMS / WhatsApp / Telegram)

```sql
SELECT
  json_extract(message, '$.channel') AS channel,
  COUNT(*)                            AS hits,
  COUNT(DISTINCT json_extract(message, '$.workspace_id')) AS affected_workspaces,
  COUNT(DISTINCT json_extract(message, '$.ip'))           AS unique_ips
FROM workers_logs
WHERE json_extract(message, '$.event') = 'rate_limit_exceeded'
  AND json_extract(message, '$.rule_id') = 'R9'
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY channel
ORDER BY hits DESC;
```

### 5. Rate-limit hit rate over time (5-minute buckets)

```sql
SELECT
  DATE_TRUNC('minute', timestamp) - (EXTRACT(MINUTE FROM timestamp) % 5) * INTERVAL '1 minute' AS bucket,
  COUNT(*) AS hits
FROM workers_logs
WHERE json_extract(message, '$.event') = 'rate_limit_exceeded'
  AND timestamp > NOW() - INTERVAL '6 hours'
GROUP BY bucket
ORDER BY bucket;
```

---

## Axiom / Datadog Equivalent

If you use Axiom (CF Logpush → Axiom):

```
| filter event == "rate_limit_exceeded"
| summarize count() by bin_auto(timestamp), rule_id, channel
| sort -timestamp
```

If you use Datadog (CF Logpush → Datadog):

```
source:cloudflare-workers event:rate_limit_exceeded
| group by rule_id, workspace_id
| count
```

---

## Alert Thresholds

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| OTP burst — single workspace | > 20 rate-limit hits/min from same workspace_id | SEV-2 | Investigate; consider workspace suspension |
| OTP burst — single IP | > 50 rate-limit hits/min from same IP | SEV-2 | Add IP to CF firewall blocklist |
| Identity abuse (R5) | > 10 R5 hits/hour from same user_id | SEV-2 | Notify security; review KYC logs |
| Sustained OTP abuse | > 500 hits/hour global | SEV-1 | Alert on-call; review CF WAF rules |
| KV degraded | `event: ratelimit_kv_degraded` appears | SEV-3 | KV namespace health check |

---

## Cloudflare Email Routing Alert (Simple Setup)

For a quick alert without a full observability stack, add a **CF Workers Cron** that
queries the R2/Analytics Engine for spike detection, then sends an email:

```ts
// cron-worker/otp-rate-alert.ts
// Fires every 5 minutes; queries Analytics Engine for spikes.
// Deploy separately to alert-worker.
export default {
  async scheduled(_event: ScheduledEvent, env: Env) {
    const result = await env.OTP_ANALYTICS.query(
      `SELECT SUM(_sample_interval) as hits FROM otp_rate_limit
       WHERE timestamp > NOW() - INTERVAL '5 minutes'
       AND event = 'rate_limit_exceeded'`
    );
    const hits = result.rows?.[0]?.hits ?? 0;
    if (hits > 100) {
      await env.EMAIL_QUEUE.send({
        subject: `[ALERT] OTP rate-limit spike: ${hits} hits in 5m`,
        body: `Check Logpush for details. Threshold: 100/5min.`,
      });
    }
  },
};
```

---

## Testing the Log Output

Run the unit tests to confirm structured log shape:

```bash
pnpm --filter @webwaka/api test src/middleware/rate-limit.test.ts
```

Or trigger a real 429 in staging:

```bash
# Hit the OTP endpoint 6 times — 6th should 429 and emit the log
for i in $(seq 1 6); do
  curl -X POST https://api.staging.webwaka.io/contact/verify/sms \
    -H "Authorization: Bearer $STAGING_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"purpose":"channel_verification"}'
done
# Then tail Workers logs in CF dashboard or via `wrangler tail`
```

---

*See also: `docs/governance/incident-response.md` for SEV-1/SEV-2 escalation procedures.*
