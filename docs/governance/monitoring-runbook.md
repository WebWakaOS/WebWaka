# WebWaka OS — Monitoring & Alerting Runbook

**Status:** ACTIVE  
**Owner:** Platform Operations  
**Last updated:** 2026-04-11 (v1.0.1)

---

## 1. Monitoring Stack

| Component | Tool | Purpose |
|---|---|---|
| Structured Logs | Cloudflare Workers Logs + Logpush | JSON error logs with route, tenantId, timestamp |
| Analytics | Cloudflare Workers Analytics | Request counts, latency percentiles, error rates |
| Uptime | Cloudflare Health Checks | Synthetic monitors on /health endpoints |
| D1 Metrics | Cloudflare D1 Dashboard | Query latency, row reads, storage |
| CI/CD | GitHub Actions | Build, test, deploy status |

---

## 2. Alert Thresholds

| Metric | Threshold | Severity | Action |
|---|---|---|---|
| Error rate (5xx) | > 1% over 5 min | P1 — CRITICAL | Page on-call; check structured error logs |
| P99 latency | > 2000ms over 5 min | P2 — HIGH | Check D1 query performance; review slow routes |
| P95 latency | > 500ms sustained 15 min | P3 — MEDIUM | Investigate; may indicate cold start or D1 contention |
| D1 query timeout rate | > 0.1% over 5 min | P1 — CRITICAL | Check migration state; possible schema lock |
| Rate limit 429 spike | > 10x normal over 1 min | P2 — HIGH | Possible DDoS; check CF WAF; adjust rate limits |
| Health check failure | 2 consecutive failures | P1 — CRITICAL | Worker down; check CF dashboard; redeploy if needed |
| JWT validation errors | > 50/min sustained | P2 — HIGH | Possible token forgery; rotate JWT_SECRET |
| Sync queue depth | > 1000 pending items/tenant | P3 — MEDIUM | Offline sync backlog; scale sync processing |

---

## 3. Structured Error Log Format

All unhandled errors in the API produce structured JSON to `console.error`:

```json
{
  "level": "error",
  "service": "webwaka-api",
  "timestamp": "2026-04-11T12:00:00.000Z",
  "error": {
    "name": "TypeError",
    "message": "Cannot read properties of undefined"
  },
  "context": {
    "route": "/api/v1/verticals/restaurant/profiles",
    "method": "POST",
    "tenantId": "tenant_abc123",
    "environment": "production"
  }
}
```

**PII rules:** `tenantId` is logged. User PII (email, phone, BVN, NIN) is NEVER logged.

---

## 4. Runbook: Error Rate Spike (P1)

1. Open Cloudflare Workers Analytics → filter by worker `webwaka-api`
2. Check error rate trend — is it spike or sustained?
3. Open Workers Logs → filter by `level: "error"`
4. Identify the failing route and error pattern
5. If D1 related: check D1 dashboard for query timeouts
6. If auth related: verify JWT_SECRET hasn't been rotated mid-flight
7. If deployment related: check last GitHub Actions run; rollback if needed
8. Resolve and document in post-incident review

---

## 5. Runbook: Latency Degradation (P2)

1. Open CF Workers Analytics → check P95/P99 latency by route
2. Identify slow routes — common causes:
   - Cold start (first request after idle) — typically < 50ms, non-actionable
   - D1 query without index — add missing index
   - Large JSON serialization — paginate or stream
   - KV read timeout — check KV namespace health
3. If D1: run `EXPLAIN QUERY PLAN` on suspected query
4. If KV: check rate limit KV namespace in CF dashboard

---

## 6. Runbook: Health Check Failure (P1)

1. Verify CF Workers dashboard shows worker deployed
2. `curl -v https://api.webwaka.com/health` — check response
3. If 502/503: Worker crashed. Check Workers Logs for fatal errors
4. If no response: DNS issue. Check Cloudflare DNS records
5. Redeploy: `npx wrangler deploy --env production --config apps/api/wrangler.toml`
6. If persists: escalate to Cloudflare support

---

## 7. Runbook: Rate Limit Abuse (P2)

1. Check CF Workers Analytics for 429 response spike
2. Identify source IPs from `CF-Connecting-IP` in logs
3. If single IP: likely bot/scraper. Consider CF WAF rule
4. If distributed: possible DDoS. Enable CF Under Attack Mode
5. Adjust rate limits in `apps/api/src/middleware/rate-limit.ts` if legitimate traffic spike

---

## 8. Cloudflare Logpush Configuration

To enable persistent log storage:

```bash
# Push Workers logs to R2 bucket
wrangler logpush create \
  --dataset workers_trace_events \
  --destination-conf r2://webwaka-logs-production \
  --fields Event,EventTimestampMs,Outcome,ScriptName,Exceptions
```

Logs are retained in R2 for 90 days. Query via Cloudflare Analytics Engine or download for external analysis.

---

## 9. Incident Severity Matrix

| Severity | Response Time | Notification | Examples |
|---|---|---|---|
| P1 — CRITICAL | < 15 min | PagerDuty + SMS + Slack | API down, data breach, D1 corruption |
| P2 — HIGH | < 1 hour | Slack + email | Error rate spike, latency degradation, auth issues |
| P3 — MEDIUM | < 4 hours | Slack | Sync backlog, non-critical feature broken |
| P4 — LOW | Next business day | Jira ticket | UI cosmetic issue, documentation gap |

---

## 10. Post-Incident Review Template

```markdown
## Incident Report: [Title]
**Date:** YYYY-MM-DD
**Severity:** P1/P2/P3
**Duration:** X minutes
**Impact:** [affected tenants/routes/features]

### Timeline
- HH:MM — Alert triggered
- HH:MM — Investigation started
- HH:MM — Root cause identified
- HH:MM — Fix deployed
- HH:MM — Monitoring confirmed resolution

### Root Cause
[Description]

### Resolution
[What was done]

### Prevention
[What changes to prevent recurrence]
```
