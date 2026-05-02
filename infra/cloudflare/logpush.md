# Cloudflare Logpush Configuration — Wave 3 C4-1

## Overview

Structured log drain from Cloudflare Workers → external observability sink.
Implements ADR-0045 (request-level structured logging).

## Jobs

Two Logpush jobs are required — one per environment.

### Staging

```bash
# Create Logpush job for staging worker
curl -X POST "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/logpush/jobs" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "webwaka-api-staging",
    "logpull_options": "fields=WorkerSubrequestCount,WorkerStatus,WorkerStartTime,WorkerWallTimeUs,ClientIP,ClientRequestMethod,ClientRequestPath,ClientRequestProtocol,ClientRequestHost,EdgeResponseStatus,EdgeResponseBodyBytes,EdgeResponseTime,CfRay&timestamps=rfc3339",
    "destination_conf": "'"${LOGPUSH_DESTINATION_STAGING}"'",
    "dataset": "workers_trace_events",
    "filter": "{\"where\":{\"key\":\"ScriptName\",\"operator\":\"eq\",\"value\":\"webwaka-api-staging\"}}",
    "enabled": true
  }'
```

### Production

```bash
# Create Logpush job for production worker
curl -X POST "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/logpush/jobs" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "webwaka-api-production",
    "logpull_options": "fields=WorkerSubrequestCount,WorkerStatus,WorkerStartTime,WorkerWallTimeUs,ClientIP,ClientRequestMethod,ClientRequestPath,ClientRequestProtocol,ClientRequestHost,EdgeResponseStatus,EdgeResponseBodyBytes,EdgeResponseTime,CfRay&timestamps=rfc3339",
    "destination_conf": "'"${LOGPUSH_DESTINATION_PRODUCTION}"'",
    "dataset": "workers_trace_events",
    "filter": "{\"where\":{\"key\":\"ScriptName\",\"operator\":\"eq\",\"value\":\"webwaka-api\"}}",
    "enabled": true
  }'
```

## Secrets Required

| Secret | Description |
|--------|-------------|
| `CF_ACCOUNT_ID` | Cloudflare account ID |
| `CF_API_TOKEN` | Cloudflare API token with Logpush write permission |
| `LOGPUSH_DESTINATION_STAGING` | Log sink URI for staging (e.g. `s3://bucket/staging/` or Axiom endpoint) |
| `LOGPUSH_DESTINATION_PRODUCTION` | Log sink URI for production |

Add these to GitHub Actions secrets and to `infra/cloudflare/secrets-rotation-log.md`.

## Log Fields

The timing middleware (`apps/api/src/middleware/timing.ts`) emits structured JSON via `console.log`.
Cloudflare captures Worker `console.log` output in `workers_trace_events` dataset.

Key fields used by dashboards:

| Field | Source |
|-------|--------|
| `duration_ms` | Timing middleware (ADR-0045) |
| `status` | HTTP response status |
| `tenant_id` | JWT claim extracted by auth middleware |
| `cf_ray` | CF-Ray request header |
| `path` | Request pathname |
| `worker` | Constant `"webwaka-api"` |

## Dashboard Queries (Grafana / Axiom)

```sql
-- P95 latency by path (last 1h)
SELECT path, percentile(duration_ms, 0.95) as p95
FROM logs
WHERE worker = 'webwaka-api' AND ts > NOW() - INTERVAL '1 HOUR'
GROUP BY path ORDER BY p95 DESC LIMIT 20;

-- Error rate (last 15m)
SELECT COUNT(*) FILTER (WHERE status >= 500) * 1.0 / COUNT(*) as error_rate
FROM logs
WHERE worker = 'webwaka-api' AND ts > NOW() - INTERVAL '15 MINUTES';

-- AI spend anomaly (spike in /superagent/chat duration)
SELECT date_trunc('minute', ts) as minute, avg(duration_ms) as avg_ms
FROM logs
WHERE path LIKE '%superagent%' AND ts > NOW() - INTERVAL '2 HOURS'
GROUP BY minute ORDER BY minute;
```

## Verification

After creating the Logpush jobs, verify log delivery:

```bash
# Check job status
curl "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/logpush/jobs" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" | jq '.result[] | {name, enabled, last_complete}'
```
