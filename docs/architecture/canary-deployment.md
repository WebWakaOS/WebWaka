# Canary Deployment Strategy for WebWaka OS

**ADR:** ARC-20
**Status:** Accepted
**Date:** 2026-04-13

---

## Context

WebWaka OS runs on Cloudflare Workers. Cloudflare supports traffic splitting between Worker versions via **Gradual Deployments**, allowing a percentage of production traffic to be routed to a new version while the current version handles the remainder.

Canary deployments protect against regressions in:
- API contract changes (route parameter renames, response shape changes)
- D1 migration side effects (new columns, index changes)
- Performance regressions (increased CPU time, memory usage)
- Error rate spikes (5xx surge on new code paths)

---

## Traffic Splitting Mechanism

Cloudflare Workers **Gradual Deployments** (Versions API) allows deploying a new version as a "canary" with a configurable traffic percentage while the current version continues to handle the remainder.

```
                    ┌───────────────────────────────────────┐
                    │         Cloudflare Edge               │
  Incoming ─────►  │  10% → Worker Version N (canary)      │
  Traffic          │  90% → Worker Version N-1 (stable)    │
                    └───────────────────────────────────────┘
```

**Key characteristics:**
- Split is applied at the account level via the Cloudflare Workers API
- Individual requests are deterministically routed (not 50/50 per-request coin-flip)
- D1 databases are shared across both versions (schema must be backward compatible during canary window)

---

## Canary Promotion Stages

| Stage | Traffic Split | Duration | Promotion Criteria |
|-------|--------------|----------|--------------------|
| 1 — Initial canary | 10% canary | 30 min | Error rate < 0.5%, p99 latency < 1.5× baseline |
| 2 — Widened canary | 50% canary | 30 min | Same criteria at 50% load |
| 3 — Full rollout | 100% canary | — | Promote to stable |

---

## Health Check Gates

Before each promotion step, the CI pipeline checks:

1. **Error rate gate:** `5xx_rate(canary, last_15m) < 0.5%`
2. **Latency gate:** `p99_latency(canary, last_15m) < p99_latency(stable) * 1.5`
3. **Custom smoke tests:** `pnpm test:smoke` passes against the canary URL
4. **D1 migration safety:** No destructive schema changes (no DROP TABLE, no DROP COLUMN)

If any gate fails, an automatic rollback is triggered.

---

## D1 Migration Safety during Canary

Because D1 is shared between canary and stable versions, all migrations run during a canary window **must be backward-compatible**:

**Allowed during canary window:**
- `ADD COLUMN` with a DEFAULT or nullable value
- `CREATE TABLE` (new tables only)
- `CREATE INDEX`

**Not allowed during canary window (defer to post-full-rollout):**
- `DROP TABLE`
- `DROP COLUMN`
- `ALTER COLUMN` (type changes)
- Renaming tables or columns

---

## Rollback Procedure

Rollback is triggered automatically by CI if health check gates fail. To manually rollback:

```bash
# List current versions
wrangler versions list --name webwaka-api

# Roll back to previous stable version (100% traffic)
wrangler versions deploy --version <STABLE_VERSION_ID> --percentage 100

# Verify rollback
curl https://api.webwaka.com/health | jq .version
```

The rollback restores 100% traffic to the previously stable version within ~30 seconds (Cloudflare propagation).

---

## Promotion Criteria (Definition of Done for a Canary)

A canary is considered safe to fully promote when **all** of the following hold:

- [ ] Zero P0/P1 incidents reported during canary window
- [ ] Error rate < 0.5% across both canary stages
- [ ] p99 latency within 1.5× of pre-deployment baseline
- [ ] All smoke test suites pass (`pnpm test:smoke`)
- [ ] No unexpected D1 migration errors in Cloudflare logs
- [ ] Monitoring dashboard shows no anomalies (CPU spikes, memory, KV cache misses)

---

## CI Workflow

See `.github/workflows/deploy-canary.yml` for the automated implementation.

The workflow:
1. Deploys the new version at 10% traffic
2. Waits 30 minutes (health check gate)
3. If gates pass, widens to 50%
4. Waits another 30 minutes
5. If gates pass, promotes to 100% (full rollout)
6. If any gate fails at any stage, automatically rolls back

---

## Monitoring

During a canary window, monitor:

- **Cloudflare Dashboard → Workers → Analytics** — error rates per version
- **Structured logs** — `X-Request-ID` correlation, error rates, latency percentiles
- **Alerting webhook** (`ALERT_WEBHOOK_URL`) — configured to fire on error rate > 1%

---

## Related

- ADR-0015: Hono as API framework
- ADR-0013: D1 as primary database
- `docs/governance/incident-response.md` — incident escalation
- `.github/workflows/deploy-staging.yml` — staging deployment
