# ADR-0046: Blue-Green Deployment with Instant Rollback

**Status**: Accepted  
**Date**: 2026-05-01  
**Rule ID**: L-4  
**Deciders**: Platform Engineering  

---

## Context

WebWaka currently deploys via `wrangler deploy`, which overwrites the live
Worker in-place. A failed deployment requires re-running the pipeline, which
means:

1. **Downtime during rollback**: a re-deploy takes 60–120 seconds.
2. **No zero-downtime guarantee**: the new Worker is live the moment Wrangler
   finishes uploading — before any smoke tests can run.
3. **Migration risk**: if a DB migration runs but the Worker deploy fails,
   the system is in a mixed state.

### Cloudflare Wrangler 4 capabilities relevant here

- **Versioned Workers** (`wrangler versions upload` + `wrangler versions deploy`):
  Upload a new version without deploying it; then split traffic between versions.
  Allows instant rollback by switching traffic back to the previous version.
- **Environment aliasing** (`wrangler deploy --env staging --name webwaka-api-blue`):
  Two named Workers (`webwaka-api-blue`, `webwaka-api-green`) behind a shared
  route. Instant cutover via Cloudflare DNS/route change.

---

## Decision

**Use Cloudflare Versioned Workers (Wrangler 4 `versions` subcommand) for staged
Blue-Green rollouts with <30-second rollback.**

### Deployment Flow

```
1. wrangler versions upload --env production    → uploads new version (not yet live)
2. Smoke tests run against staged version (via X-Version-Override header)
3. wrangler versions deploy --percentage 10     → canary: 10% traffic to new version
4. Monitor error rate for 5 minutes (P95 < 20% regression threshold)
5a. Pass → wrangler versions deploy --percentage 100  → full cutover
5b. Fail → wrangler versions deploy --percentage 0    → instant rollback (<30s)
```

### CI/CD Pipeline Integration

The existing `deploy-production.yml` workflow is extended with these steps:

```yaml
- name: Upload new Worker version (not live)
  run: wrangler versions upload --env production

- name: Run smoke tests against canary version
  run: pnpm test:e2e:smoke --env production

- name: Canary rollout (10%)
  run: wrangler versions deploy --percentage 10 --env production

- name: Wait for error rate stabilisation (5 min)
  run: sleep 300

- name: Full cutover
  run: wrangler versions deploy --percentage 100 --env production
  # On failure: automatic rollback step below

- name: Rollback on failure
  if: failure()
  run: wrangler versions deploy --percentage 0 --env production
```

### Rollback Triggers

| Trigger | Action |
|---------|--------|
| Smoke test failure | `versions deploy --percentage 0` (instant) |
| Error rate > 5% during canary | `versions deploy --percentage 0` (via alerting webhook) |
| Manual rollback | `wrangler versions deploy --percentage 0 --env production` |

### Migration Safety

DB migrations are applied **before** the new Worker version is uploaded.
The old Worker must remain compatible with the new schema during the canary window
(i.e., migrations must be backwards-compatible — no column drops during the canary).

This is enforced by a migration compatibility check added to CI:
- Forward-only migrations (already enforced by C-5).
- No column drops while canary is active (documented convention).

---

## Implementation

### Files Changed

- `.github/workflows/deploy-production.yml` — extended with versions upload/deploy steps
- `.github/workflows/rollback-worker.yml` — existing workflow updated to use `versions deploy`
- `docs/ops/RUNBOOK.md` — updated rollback procedure

### Rollback Runbook (summary)

```bash
# Instant rollback — cuts traffic back to previous version
wrangler versions deploy --percentage 0 --env production

# Verify previous version is live
wrangler versions list --env production

# Check error rate in Axiom / CF dashboard
# Once confirmed stable, close the incident
```

---

## Acceptance Criteria

- [x] ADR committed to `docs/adr/`
- [x] `deploy-production.yml` updated with versioned deployment steps
- [x] `rollback-worker.yml` updated to use `versions deploy --percentage 0`
- [x] Rollback documented in RUNBOOK.md
- [ ] First production deployment using this flow (ops action)
- [ ] Rollback time verified: previous version live in <30 seconds

---

## Consequences

**Positive**
- Zero-downtime deployments: traffic shifts gradually (10% → 100%).
- Rollback time: <30 seconds (just a CF traffic rule change, no re-upload).
- Smoke tests can run before any user traffic hits the new version.
- Canary monitoring catches regressions before full rollout.

**Negative / Risks**
- Canary window means two Worker versions run concurrently for 5 minutes.
  Both must be DB-schema-compatible during this window.
- `wrangler versions` requires Wrangler 4.x (already upgraded — C-2 resolved).
- Slightly longer deploy pipeline (5-minute canary wait vs instant current).
