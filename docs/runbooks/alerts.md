# Alerting Runbook — Wave 3 C4-3

Each alert type lists: trigger condition, diagnosis steps, and remediation.

---

## ALERT-001: High Error Rate

**Trigger:** HTTP 5xx rate > 1% over any 5-minute window (workers_trace_events).

**Dashboard query:**
```sql
SELECT COUNT(*) FILTER (WHERE status >= 500) * 1.0 / COUNT(*) as error_rate
FROM logs WHERE ts > NOW() - INTERVAL '5 MINUTES';
```

**Diagnosis:**
1. Check `/health/deep` → if `d1.ok = false`, it's a D1 outage (→ ALERT-003).
2. Check Cloudflare Workers dashboard for CPU limit exceeded errors.
3. `wrangler tail webwaka-api --env staging` — scan for unhandled exceptions.
4. Check recent deploys: if alert began after a deploy, consider rollback (see `docs/runbooks/rollback-procedure.md`).

**Remediation:**
- If D1 issue: see ALERT-003.
- If Worker crash loop: `pnpm run rollback:worker -- --env staging`.
- If specific route: add `continue-on-error` guard or feature-flag the endpoint off.
- P0 (>5% 5xx): escalate to on-call, open incident (P1 SLA: 30 min response).

---

## ALERT-002: AI Spend Spike

**Trigger:** WakaCU burn rate > 3× 7-day rolling average in any 10-minute window.

**Dashboard query:**
```sql
SELECT tenant_id, SUM(waka_cu_charged) as spend_10m
FROM wc_transactions
WHERE created_at > NOW() - INTERVAL '10 MINUTES'
GROUP BY tenant_id
HAVING spend_10m > (
  SELECT AVG(daily_spend) * 3 FROM (
    SELECT date_trunc('day', created_at) as day, SUM(waka_cu_charged) as daily_spend
    FROM wc_transactions WHERE created_at > NOW() - INTERVAL '7 DAYS'
    GROUP BY day
  )
);
```

**Diagnosis:**
1. Identify the tenant(s) from the query above.
2. Check `wc_transactions` for the tenant — look for unusually high `tokens_used`.
3. Check `ai_sessions` — is there an infinite loop agent? (session with >100 turns in 10min)
4. Check `spend_controls` — is the tenant's monthly budget set and enforced?

**Remediation:**
- Short-term: `UPDATE wc_wallets SET spend_cap_monthly_wc = 0 WHERE tenant_id = '<id>'` (emergency freeze).
- Notify tenant via email/notification.
- If agent loop: terminate active sessions in `ai_sessions` (set `status = 'terminated'`).
- If BYOK abuse: disable the workspace's BYOK key via key-service.
- Review and adjust `ai_spend_budgets` entry for the tenant.

---

## ALERT-003: D1 Latency

**Trigger:** `d1.latency_ms` from `/health/deep` > 500ms; OR D1 error rate > 0.1%.

**Diagnosis:**
1. `/health/deep` response — check `d1.latency_ms` and `d1.error`.
2. Cloudflare D1 status page: https://www.cloudflarestatus.com/
3. Check migration history — a bad migration (missing index) may have caused a table scan.
4. Run: `wrangler d1 execute webwaka-db --env staging --command "PRAGMA index_list(offerings);"` to verify indexes.

**Remediation:**
- If Cloudflare D1 service incident: wait + monitor, escalate to CF support if >30min.
- If missing index: create index via new migration (do NOT run raw SQL in prod without migration).
- If runaway query: identify via slow query log (D1 trace), add EXPLAIN QUERY PLAN.

---

## ALERT-004: Worker CPU Limit

**Trigger:** Worker CPU time > 90% of 50ms limit (Cloudflare Workers free tier limit).

**Diagnosis:**
1. `wrangler tail webwaka-api` — look for `cpu time exceeded` entries.
2. Identify the route via `path` field in timing logs.
3. Check if the route is doing synchronous heavy work (e.g. large JSON parse, crypto).

**Remediation:**
- Move heavy sync work to async (D1 queries are already async).
- If regex/parse-heavy: use streaming or chunking.
- If consistent: upgrade Workers plan to Paid (50ms CPU → 30s CPU wall time on Paid).
- If a specific tenant: check for malformed request bodies causing expensive parse.

---

## Escalation Matrix

| Severity | Condition | Response Time | Who |
|----------|-----------|---------------|-----|
| P0 | >5% 5xx OR D1 down | 15 min | On-call + Founder |
| P1 | >1% 5xx OR AI spend 5× spike | 30 min | On-call |
| P2 | Latency > 2× baseline OR spend spike 3× | 2 hours | Next engineer |
| P3 | Single route slow OR minor config drift | Next business day | Team |

---

## On-call Contact

Defined in `docs/runbooks/incident-response.md`.
