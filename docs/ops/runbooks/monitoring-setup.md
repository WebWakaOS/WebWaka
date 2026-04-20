# Runbook: Production Monitoring Setup — WebWaka Notification Engine

**Version:** 1.0 | **Phase:** 9 (N-129) | **Owner:** Platform Engineering

---

## Purpose

This document defines the 30-day monitoring plan for the WebWaka OS Notification Engine
production rollout, including alert thresholds, dashboard queries, and on-call response
procedures.

---

## Monitoring Architecture

```
Cloudflare Workers Analytics
  → webwaka-notificator (consumer worker)
  → webwaka-projections (CRON worker)
  → webwaka-api (event publisher)

D1 notification_delivery → Daily health check queries
D1 notification_audit_log → Compliance + latency queries
D1 notification_digest_batch → Digest flush rate queries
Cloudflare Queue → Dead-letter backlog monitoring
```

---

## Alert Definitions

### Critical Alerts (page on-call immediately)

| Alert | Threshold | Query |
|-------|-----------|-------|
| Email delivery failure rate | > 5% in 15 minutes | `notification_delivery WHERE status='failed' AND channel='email'` |
| SMS delivery failure rate | > 10% in 15 minutes | `notification_delivery WHERE status='failed' AND channel='sms'` |
| Audit log gaps | Zero entries in 30 minutes | `notification_audit_log WHERE created_at > unixepoch()-1800` |
| Cross-tenant leak | Any query error in isolation tests | CI governance check |
| Provider HTTP 5xx | > 5 consecutive | Notificator worker logs |
| Queue dead-letter backlog | > 500 messages | Cloudflare Queue metrics |

### Warning Alerts (notify platform team, no immediate page)

| Alert | Threshold |
|-------|-----------|
| P99 dispatch latency | > 3 seconds |
| Digest flush missed | Any `status='pending'` past flush window |
| Suppression list growth | > 100 new entries/hour |
| Sandbox mode active in production | Any `sandboxMode=true` delivery in prod |
| ADL-002 check failure | Script exits non-zero |

---

## Daily Health Check Queries

Run these daily (or automate via Cloudflare Cron):

```bash
# 1. Overall delivery success rate (last 24 hours)
wrangler d1 execute webwaka-os-production --command \
  "SELECT channel,
          SUM(CASE WHEN status='dispatched' THEN 1 ELSE 0 END) as success,
          SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) as failed,
          ROUND(100.0 * SUM(CASE WHEN status='dispatched' THEN 1 ELSE 0 END) /
                NULLIF(COUNT(*), 0), 2) as success_rate_pct
   FROM notification_delivery
   WHERE created_at > unixepoch() - 86400
   GROUP BY channel
   ORDER BY channel;"

# 2. Digest flush rate
wrangler d1 execute webwaka-os-production --command \
  "SELECT window_type,
          SUM(CASE WHEN status='flushed' THEN 1 ELSE 0 END) as flushed,
          SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) as failed
   FROM notification_digest_batch
   WHERE window_date >= date('now', '-1 day')
   GROUP BY window_type;"

# 3. Provider error breakdown
wrangler d1 execute webwaka-os-production --command \
  "SELECT provider_name, status, COUNT(*) as cnt,
          ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY provider_name), 2) as pct
   FROM notification_audit_log
   WHERE created_at > unixepoch() - 86400
   GROUP BY provider_name, status
   ORDER BY provider_name, status;"

# 4. Dead-letter volume
wrangler d1 execute webwaka-os-production --command \
  "SELECT COUNT(*) as dead_letter_count
   FROM notification_delivery
   WHERE status = 'failed' AND created_at > unixepoch() - 86400;"

# 5. Top tenant delivery volume
wrangler d1 execute webwaka-os-production --command \
  "SELECT tenant_id, COUNT(*) as deliveries
   FROM notification_delivery
   WHERE created_at > unixepoch() - 86400
   GROUP BY tenant_id
   ORDER BY deliveries DESC
   LIMIT 20;"
```

---

## Compliance Monitoring (Weekly)

### NDPR Compliance Check

```bash
# Verify erasure propagation is clean (no PII in audit log)
wrangler d1 execute webwaka-os-production --command \
  "SELECT COUNT(*) as erased_users
   FROM notification_audit_log
   WHERE actor_id = 'ERASED'
      OR recipient_id = 'ERASED';"

# Verify suppression list is growing (users exercising right to unsubscribe)
wrangler d1 execute webwaka-os-production --command \
  "SELECT reason, COUNT(*) as cnt
   FROM notification_suppression_list
   WHERE created_at > unixepoch() - 604800
   GROUP BY reason;"
```

### ADL-002 (G16) Weekly Credential Audit

```bash
npx tsx scripts/governance-checks/check-adl-002.ts
```

Expected output: `PASS: ADL-002 compliance verified — zero raw credentials in D1`

### CBN R8 Compliance Check (OTP Channels)

```bash
# Verify all transaction OTPs use SMS channel (not Telegram)
wrangler d1 execute webwaka-os-production --command \
  "SELECT channel, COUNT(*) as cnt
   FROM notification_delivery
   WHERE source_event_key LIKE 'otp%'
     AND metadata LIKE '%transaction%'
   GROUP BY channel;"
# Expected: only 'sms' and 'whatsapp', never 'telegram'
```

---

## 30-Day Observation Checklist

| Week | Metric | Target | Status |
|------|--------|--------|--------|
| W1 | Email delivery success rate | ≥ 99.5% | |
| W1 | Zero double-notifications | 0 incidents | |
| W1 | ADL-002 check | PASS | |
| W2 | P99 dispatch latency | ≤ 3s | |
| W2 | Digest flush rate | ≥ 99.5% | |
| W2 | Dead-letter volume | < 0.1% | |
| W3 | NDPR erasure working | 0 breaches | |
| W3 | CBN R8 OTP channels | 0 violations | |
| W3 | Cross-tenant isolation | 0 leaks | |
| W4 | Full rollout stability | No regressions | |
| W4 | Governance checks all green | All PASS | |
| W4 | Sign-off for legacy cleanup | Approved | |

---

## Cloudflare Workers Observability

Enable Workers Logpush for production:

```bash
# Configure Workers Logpush (Cloudflare dashboard or Terraform)
# Route: Cloudflare Workers Logpush → R2 bucket or SIEM

# Live tail for immediate debugging
wrangler tail webwaka-notificator --env production
wrangler tail webwaka-projections --env production

# Filter for notification errors only
wrangler tail webwaka-notificator --env production \
  --format pretty \
  | grep -E "FAIL|ERROR|dispatch failed|HITL|dead.letter"
```

---

## Escalation Matrix

| Severity | Response time | Owner |
|----------|--------------|-------|
| P0 — delivery stopped | 15 minutes | On-call engineer |
| P1 — > 5% failure rate | 30 minutes | Platform Engineering lead |
| P2 — > 1% failure rate | 2 hours | Platform team |
| P3 — monitoring anomaly | Next business day | Platform team |
| Compliance (NDPR/CBN) | Immediate + Compliance Officer | Platform Engineering + Legal |

---

## Key Files

- Spec: `docs/webwaka-notification-engine-final-master-specification-v2.md`
- ADL-002 audit: `scripts/governance-checks/check-adl-002.ts`
- Provider failover: `docs/ops/runbooks/provider-failover.md`
- Dead-letter sweep: `docs/ops/runbooks/dead-letter-sweep.md`
- Digest rerun: `docs/ops/runbooks/digest-rerun.md`
