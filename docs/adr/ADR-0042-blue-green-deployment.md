# ADR-0042: Blue-Green Deployment with Instant Rollback

**Status**: Accepted  
**Date**: 2026-05-01  
**Rule ID**: L-4  
**Deciders**: Platform Engineering  

---

## Context

Cloudflare Workers use in-place deployment: `wrangler deploy` atomically replaces
the live script. A failed deploy currently requires re-running the full CI pipeline
(≥5 min). The platform needs rollback in <30 seconds with no migration conflicts.

### Constraints
- Cloudflare Workers do not expose a native blue/green switch.
- D1 migrations are forward-only (DDL cannot be reversed by the platform).
- Workers are stateless; all state lives in D1, R2, KV, or Durable Objects.
- The Cloudflare API exposes per-worker deployment history (versions).

---

## Decision

Implement **versioned Worker rollback** using the Cloudflare Deployments API
(`PUT /accounts/{account_id}/workers/scripts/{script_name}/deployments`).

Each `wrangler deploy` creates a numbered version. Rollback promotes a previous
version to 100% traffic. This is the platform-native approach and requires
**no infrastructure changes** — no load balancer, no DNS flip, no routing rules.

### Mechanism

```
Deploy          →  wrangler deploy                 (creates version N)
Rollback        →  rollback-worker.yml workflow     (promotes version N-1 to 100%)
Rollback time   →  ~5-10 seconds (API call only, no re-build)
```

### Why not environment aliasing?
Cloudflare Workers environments (`[env.blue]`, `[env.green]`) deploy as _separate
named scripts_, requiring DNS/route changes to switch traffic. That adds latency
and operational complexity without meaningful benefit over versioned rollback.

### Database compatibility
Workers rollback does **not** roll back D1 schema changes. A rolled-back Worker
must be backward-compatible with the current schema. Policy:

1. All migrations are **expand-only** at deploy time (no DROP, no NOT NULL
   without DEFAULT, no RENAME without alias period).
2. Breaking schema changes require a two-phase deploy:
   - Phase 1: migrate (expand schema) — new + old Worker both work.
   - Phase 2: deploy new Worker code — then clean up old columns ≥7 days later.
3. If Phase 2 fails, rolling back the Worker is safe because the schema is
   still backward-compatible.

---

## Implementation

### 1. GitHub Actions workflow: `rollback-worker.yml`

A `workflow_dispatch` workflow accepting `worker_name` and `environment`.
Steps:
1. Fetch deployment history via CF API (`GET …/deployments`).
2. Identify the version immediately before the current live one.
3. Promote it via `PUT …/deployments` with `{"strategy":"percentage","versions":[{"version_id":"<prev>","percentage":100}]}`.
4. Health-check the API. If it fails, re-promote the current version.

### 2. Deployment history tag in CI

Each production deploy tags the Cloudflare version with the git SHA via
`--version-tag` (wrangler 3.78+), enabling audit-trail mapping.

### 3. 30-second SLA

| Step | Time |
|------|------|
| Trigger `rollback-worker.yml` | 0 s |
| GitHub Actions runner start | ~5 s |
| CF API promotion call | ~5 s |
| CF edge propagation | ~5 s |
| Health check pass | ~5 s |
| **Total** | **~20 s** |

---

## Alternatives Considered

| Option | Rejected reason |
|--------|----------------|
| DNS blue-green (two origins) | CF Workers have no separate origin; requires route/custom domain changes (30–120 s TTL) |
| KV feature flags for traffic split | Adds complexity; doesn't help with code rollback |
| Wrangler `--rollback` flag | `wrangler rollback` exists but is not idempotent in CI; the Deployments API is more reliable |

---

## Consequences

**Positive**
- Rollback time: <30 seconds (meets acceptance criteria).
- No infra changes; fully self-service via GitHub Actions.
- Audit trail: every deploy/rollback links to a git SHA.

**Negative / Risks**
- Schema rollback is NOT included — expand-only migration policy is required.
- Requires `CLOUDFLARE_API_TOKEN` to have `Workers Scripts:Edit` permission.
- If the previous Worker version is >30 days old, CF may have purged it
  (retention policy). Mitigated by tagging and keeping staging as a warm fallback.

---

## Acceptance Criteria

- [x] ADR committed to `docs/adr/`
- [x] `rollback-worker.yml` workflow created and tested
- [x] Deployment history tagging added to `deploy-production.yml`
- [x] Expand-only migration policy documented in `CONTRIBUTING.md`
- [ ] Live drill: rollback executed and verified in staging (ops team action)
