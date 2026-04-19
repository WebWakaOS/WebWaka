# Superagent Prompt: OPS-001 + DEPLOY-005
## GitHub Environment Protection + Remote D1 Migration Application

**Date generated:** 2026-04-13  
**Branch:** staging  
**Prepared by:** WebWaka Agent

---

## Context

This prompt is for a human operator (or a CI Superagent with Cloudflare + GitHub credentials).
It covers two items from the production remediation plan that require credentials that the
code agent does not hold:

| ID | Item | Requires |
|---|---|---|
| OPS-001 | GitHub environment protection rules for `staging` + `production` | GitHub repo admin access |
| DEPLOY-005 | Apply all pending D1 migrations to staging + production remote databases | Cloudflare API token with D1 write access |

---

## OPS-001 — GitHub Environment Protection Rules

### Why this matters
The `deploy-production.yml` workflow uses `environment: production` gating. Without a
protected environment configured in GitHub, the production deploy job runs with no approval
gate, meaning any push to `staging` can automatically deploy to production.

### Steps (GitHub Web UI)

1. Navigate to:  
   `https://github.com/WebWakaOS/WebWaka/settings/environments`

2. **Create the `staging` environment** (if not already present):
   - Click **New environment** → name: `staging`
   - Under **Deployment protection rules**:
     - ✅ **Required reviewers**: add at least one reviewer (e.g. repo maintainer)
     - ✅ **Wait timer**: 0 minutes (or 5 minutes if desired)
   - Under **Environment secrets**: confirm these are set (or set them now):
     - `CF_API_TOKEN` — Cloudflare API token with Workers + D1 deploy permissions
     - `CF_ACCOUNT_ID` — Cloudflare account ID
   - Save

3. **Create the `production` environment**:
   - Click **New environment** → name: `production`
   - Under **Deployment protection rules**:
     - ✅ **Required reviewers**: add 2+ reviewers (enforce 4-eyes principle)
     - ✅ **Wait timer**: 10 minutes recommended (circuit-breaker window)
   - Under **Deployment branches and tags**:
     - Select **Protected branches only** → this restricts deploys to protected branches
   - Under **Environment secrets**: confirm or set:
     - `CF_API_TOKEN` — Cloudflare API token (production-scoped preferred)
     - `CF_ACCOUNT_ID` — Cloudflare account ID
   - Save

4. **Protect the `staging` branch**:
   - Navigate to: `https://github.com/WebWakaOS/WebWaka/settings/branches`
   - Add rule for `staging`:
     - ✅ Require a pull request before merging
     - ✅ Require status checks to pass: `ci` (the test workflow job)
     - ✅ Require branches to be up to date before merging
     - ✅ Do not allow bypassing above settings (uncheck "Allow force pushes")

### Verification
After setup, trigger a test production deploy and confirm the job pauses waiting for reviewer
approval before proceeding to the `wrangler deploy --env production` step.

---

## DEPLOY-005 — Apply D1 Migrations to Remote Databases

### Why this matters
All migrations (0001 through 0221) were written during development. The remote Cloudflare D1
databases (staging + production) have not had these migrations applied. Without them, the
workers will fail at runtime on any DB query.

### Prerequisites
- Cloudflare Wrangler CLI installed: `wrangler --version` (requires v3.x)
- Authenticated: `wrangler login` OR `CLOUDFLARE_API_TOKEN` env var set
- Account: WebWakaOS Cloudflare account

### Staging — apply migrations

```bash
# Confirm wrangler identity
wrangler whoami

# Apply all pending migrations to the staging D1 database
# DB: webwaka-os-staging (7c264f00-c36d-4014-b2fe-c43e136e86f6)
cd apps/api
wrangler d1 migrations apply webwaka-os-staging --env staging
```

Expected output: list of migration files applied (0001_init_core through 0221_xxx).
If any migration has already been applied, wrangler skips it safely.

### Production — apply migrations

> ⚠️  **4-eyes checkpoint**: production migration requires two-person review.  
> One person executes; another audits the output before confirming.

```bash
# Apply all pending migrations to the production D1 database
# DB: webwaka-os-production (72fa5ec8-52c2-4f41-b486-957d7b00c76f)
cd apps/api
wrangler d1 migrations apply webwaka-os-production --env production
```

### Post-migration smoke test

After each migration run, execute the smoke test suite against the target environment:

```bash
# Staging smoke test
cd tests/smoke
SMOKE_BASE_URL=https://api-staging.webwaka.com pnpm test

# Production smoke test
SMOKE_BASE_URL=https://api.webwaka.com pnpm test
```

The smoke suite (tests/smoke) checks:
- `GET /health` → `{ ok: true }`
- `GET /version` → `{ version: "x.x.x", environment: "staging|production" }`

Both must return 200 before declaring the migration successful.

### Rollback plan
D1 does not support automatic rollback. If a migration causes issues:
1. Identify the breaking migration number
2. Write a compensating migration (e.g., `0222_rollback_xxx.sql`) to revert the schema change
3. Apply the compensating migration: `wrangler d1 migrations apply <db-name> --env <env>`
4. Re-run smoke tests

---

## Quick reference: Cloudflare resource IDs

| Resource | Staging | Production |
|---|---|---|
| D1 database name | `webwaka-os-staging` | `webwaka-os-production` |
| D1 database ID | `7c264f00-c36d-4014-b2fe-c43e136e86f6` | `72fa5ec8-52c2-4f41-b486-957d7b00c76f` |
| RATE_LIMIT_KV ID | `2a81cd5b8d094911a20e1e0f6a190506` | `8cbf31285b0c43e1a8f44ee0af9fcdf3` |
| DISCOVERY_CACHE KV | `eb26f47e1be34ce59526f9617e02f51f` | `d82d3780283e4857966bc8fab4e2761c` |

---

## Completion checklist

- [ ] OPS-001: `staging` GitHub environment created with required reviewer
- [ ] OPS-001: `production` GitHub environment created with 2+ required reviewers + 10-min wait
- [ ] OPS-001: `staging` branch protection rules enabled (CI required, no force-push)
- [ ] DEPLOY-005: Migrations applied to staging D1 + smoke test passes
- [ ] DEPLOY-005: Migrations applied to production D1 + smoke test passes
- [ ] Both environments' secrets (`CF_API_TOKEN`, `CF_ACCOUNT_ID`) confirmed in GitHub

Once all items are checked, the platform is ready for its first full production deployment.
