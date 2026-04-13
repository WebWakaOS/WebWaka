# WebWaka OS — All Remaining Human-Action Items

**Status:** Living document — update checkboxes as items are completed  
**Last updated:** 2026-04-13  
**Prepared by:** WebWaka Agent  
**Branch:** staging  
**GitHub repo:** https://github.com/WebWakaOS/WebWaka

---

## Summary

These are all tasks that **cannot be automated** by the code agent because they require
Cloudflare credentials, GitHub admin access, or production secrets. All code changes have
been made; only the operations below are outstanding.

| ID | Category | Item | Effort | Blocker for |
|---|---|---|---|---|
| DEPLOY-001 | Cloudflare | Verify/create KV namespaces in Cloudflare account | 10 min | Production deploys |
| DEPLOY-005 | Cloudflare | Apply D1 migrations to staging + production databases | 20 min | Runtime queries |
| CF-SECRETS | Cloudflare | Set `wrangler secret put` for each worker app | 15 min | Worker authentication |
| OPS-001-A | GitHub | Create `staging` environment with required reviewer | 5 min | Staging gate |
| OPS-001-B | GitHub | Create `production` environment with 2+ reviewers + wait timer | 5 min | Production gate |
| OPS-001-C | GitHub | Enable branch protection on `staging` branch | 5 min | PR quality gate |
| GH-SECRETS | GitHub | Set `CF_API_TOKEN` + `CF_ACCOUNT_ID` in GitHub environments | 5 min | CI deploys |
| GH-VARS | GitHub | Set `STAGING_BASE_URL` + `PRODUCTION_BASE_URL` as Actions variables | 3 min | Smoke tests in CI |
| CODE-5 | GitHub | Create 5 GitHub labels for 3-in-1 pillar tracking | 5 min | PR tagging |
| CODE-5-RETRO | GitHub | Apply labels retroactively to 27 previously merged PRs | 30 min | Audit trail |

---

## DEPLOY-001 — Verify / Create KV Namespaces in Cloudflare

**Requires:** Cloudflare CLI (`wrangler`) + `CLOUDFLARE_API_TOKEN`  
**Why:** If the KV namespaces referenced in `wrangler.toml` do not exist in the Cloudflare
account, all worker deploys will fail with a namespace-not-found error.

### Cloudflare resource IDs already in `wrangler.toml`

| Binding | App | Staging ID | Production ID |
|---|---|---|---|
| `RATE_LIMIT_KV` | apps/api | `2a81cd5b8d094911a20e1e0f6a190506` | `8cbf31285b0c43e1a8f44ee0af9fcdf3` |
| `GEOGRAPHY_CACHE` | apps/api | `4732f3a682964607bae2170f350e4fb4` | `5bd5695d963247d0b105a936827e0a89` |
| `DISCOVERY_CACHE` | apps/public-discovery | `eb26f47e1be34ce59526f9617e02f51f` | `d82d3780283e4857966bc8fab4e2761c` |
| `THEME_CACHE` | apps/brand-runtime | `3093422f3e4e4252a3b542ed9a06fd18` | `d89a05e8c5814c6c966061f62dd24f8c` |
| `USSD_SESSION_KV` | apps/ussd-gateway | `67c95f1527114e4bac480a44c4169b85` | `e34fb28b075b4362a8d4d840c19e670c` |

### Steps

```bash
export CLOUDFLARE_API_TOKEN="<your-token>"
export CLOUDFLARE_ACCOUNT_ID="a5f5864b726209519e0c361f2bb90e79"

# List existing KV namespaces and confirm each ID above exists:
wrangler kv namespace list

# If any namespace ID is missing, create it (example):
wrangler kv namespace create "GEOGRAPHY_CACHE" --env staging
# Copy the printed ID and update apps/api/wrangler.toml accordingly.
```

### D1 Databases

| Name | Staging ID | Production ID |
|---|---|---|
| `webwaka-os-staging` | `7c264f00-c36d-4014-b2fe-c43e136e86f6` | — |
| `webwaka-os-production` | — | `72fa5ec8-52c2-4f41-b486-957d7b00c76f` |

```bash
# Verify D1 databases exist:
wrangler d1 list
```

- [ ] All KV namespace IDs verified to exist in Cloudflare account
- [ ] Both D1 databases verified to exist

---

## DEPLOY-005 — Apply D1 Migrations to Remote Databases

**Requires:** Wrangler CLI authenticated to WebWakaOS Cloudflare account  
**Why:** Migrations 0001–0221 have been written but have never been applied to the
remote Cloudflare D1 instances. Without them, every database query will fail at runtime.

### Staging

```bash
cd apps/api
wrangler d1 migrations apply webwaka-os-staging --env staging
```

Expected: list of 221 migration files applied. Re-running is safe — already-applied
migrations are skipped.

### Production

> **4-eyes requirement:** One person executes; a second person audits the output before confirming.

```bash
cd apps/api
wrangler d1 migrations apply webwaka-os-production --env production
```

### Post-migration smoke test

```bash
# Staging
cd tests/smoke
SMOKE_BASE_URL=https://api-staging.webwaka.ng pnpm test

# Production
SMOKE_BASE_URL=https://api.webwaka.ng pnpm test
```

Both must return `200 { ok: true }` before the migration is considered complete.

### Rollback procedure (if needed)

D1 does not support automatic rollback. To fix a broken migration:

1. Identify the breaking migration number (e.g., `0199_broken_change.sql`)
2. Write a compensating migration: `apps/api/migrations/0222_rollback_broken_change.sql`
3. Apply it: `wrangler d1 migrations apply webwaka-os-<env> --env <env>`
4. Re-run smoke tests

- [ ] Staging migrations applied + smoke test passes
- [ ] Production migrations applied + smoke test passes (4-eyes signed off)

---

## CF-SECRETS — Set Wrangler Worker Secrets

**Requires:** Wrangler CLI + the secret values  
**Why:** These secrets are never stored in `wrangler.toml` (by design). Each worker reads
them at runtime via `env.JWT_SECRET` etc. They must be set separately per environment.

### apps/api

```bash
cd apps/api
wrangler secret put JWT_SECRET --env staging
wrangler secret put JWT_SECRET --env production
wrangler secret put LOG_PII_SALT --env staging
wrangler secret put LOG_PII_SALT --env production
```

### apps/brand-runtime

```bash
cd apps/brand-runtime
wrangler secret put JWT_SECRET --env staging
wrangler secret put JWT_SECRET --env production
wrangler secret put LOG_PII_SALT --env staging
wrangler secret put LOG_PII_SALT --env production
```

### apps/tenant-public

```bash
cd apps/tenant-public
wrangler secret put JWT_SECRET --env staging
wrangler secret put JWT_SECRET --env production
wrangler secret put LOG_PII_SALT --env staging
wrangler secret put LOG_PII_SALT --env production
```

### apps/public-discovery

```bash
cd apps/public-discovery
wrangler secret put LOG_PII_SALT --env staging
wrangler secret put LOG_PII_SALT --env production
```

### apps/ussd-gateway

```bash
cd apps/ussd-gateway
wrangler secret put JWT_SECRET --env staging
wrangler secret put JWT_SECRET --env production
wrangler secret put LOG_PII_SALT --env staging
wrangler secret put LOG_PII_SALT --env production
```

**Secret values guidance:**

| Secret | Minimum entropy | Notes |
|---|---|---|
| `JWT_SECRET` | 256-bit random hex | `openssl rand -hex 32` |
| `LOG_PII_SALT` | 128-bit random hex | `openssl rand -hex 16` — used for NDPR pseudonymisation |

- [ ] apps/api secrets set (staging + production)
- [ ] apps/brand-runtime secrets set (staging + production)
- [ ] apps/tenant-public secrets set (staging + production)
- [ ] apps/public-discovery secrets set (staging + production)
- [ ] apps/ussd-gateway secrets set (staging + production)

---

## OPS-001-A — Create `staging` GitHub Environment

**URL:** https://github.com/WebWakaOS/WebWaka/settings/environments  
**Requires:** GitHub repository admin access

### Steps

1. Click **New environment** → name: `staging`
2. Under **Deployment protection rules**:
   - ✅ Required reviewers: add at least 1 reviewer
   - Wait timer: 0 minutes (optional)
3. Under **Environment secrets** (add here OR via GH-SECRETS below):
   - `CF_API_TOKEN` — Cloudflare API token with Workers + D1 write access
   - `CF_ACCOUNT_ID` — `a5f5864b726209519e0c361f2bb90e79`
4. Save

- [ ] `staging` GitHub environment created with required reviewer
- [ ] `CF_API_TOKEN` + `CF_ACCOUNT_ID` set as environment secrets for `staging`

---

## OPS-001-B — Create `production` GitHub Environment

**URL:** https://github.com/WebWakaOS/WebWaka/settings/environments  
**Requires:** GitHub repository admin access

### Steps

1. Click **New environment** → name: `production`
2. Under **Deployment protection rules**:
   - ✅ Required reviewers: add **2+ reviewers** (4-eyes principle)
   - ✅ Wait timer: **10 minutes** (circuit-breaker window — allows hotfix cancellation)
3. Under **Deployment branches and tags**:
   - Select **Protected branches only** — restricts deploys to protected branches
4. Under **Environment secrets**:
   - `CF_API_TOKEN` — production-scoped Cloudflare API token (recommend separate token)
   - `CF_ACCOUNT_ID` — `a5f5864b726209519e0c361f2bb90e79`
5. Save

### Verification

Trigger a test production deploy → confirm the `deploy-api-production` job pauses at the
reviewer approval step before proceeding to `wrangler deploy --env production`.

- [ ] `production` GitHub environment created with 2+ required reviewers + 10-min timer
- [ ] Deployment restricted to protected branches only
- [ ] `CF_API_TOKEN` + `CF_ACCOUNT_ID` set as environment secrets for `production`

---

## OPS-001-C — Enable Branch Protection on `staging`

**URL:** https://github.com/WebWakaOS/WebWaka/settings/branches  
**Requires:** GitHub repository admin access

### Steps

1. Click **Add branch protection rule**
2. Branch name pattern: `staging`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging → add: `ci`
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings (disables force-push for admins too)
4. Save

- [ ] Branch protection rule created for `staging`
- [ ] `ci` status check required before merge
- [ ] Force-push disabled

---

## GH-SECRETS — Set GitHub Actions Secrets

**URL:** https://github.com/WebWakaOS/WebWaka/settings/secrets/actions  
**Why:** The CI/CD workflows (`.github/workflows/ci.yml`, `deploy-production.yml`) read
`CF_API_TOKEN` and `CF_ACCOUNT_ID` from GitHub Actions secrets to authenticate wrangler.

These should be set **at the environment level** (inside the `staging` and `production`
environments created in OPS-001-A and OPS-001-B), not as repository-level secrets, so
that each environment can use a differently scoped API token.

If separate per-environment tokens are not available, set them as repository-level secrets:

1. Navigate to: **Settings → Secrets and variables → Actions → New repository secret**
2. Add:
   - `CF_API_TOKEN` — Cloudflare API token
   - `CF_ACCOUNT_ID` — `a5f5864b726209519e0c361f2bb90e79`

- [ ] `CF_API_TOKEN` accessible from CI workflows
- [ ] `CF_ACCOUNT_ID` accessible from CI workflows

---

## GH-VARS — Set GitHub Actions Variables

**URL:** https://github.com/WebWakaOS/WebWaka/settings/variables/actions  
**Why:** The smoke test step in CI reads these public URLs. They are not secrets.

1. Navigate to: **Settings → Secrets and variables → Actions → Variables tab → New repository variable**
2. Add:
   - `STAGING_BASE_URL` = `https://webwaka-api-staging.<your-cf-subdomain>.workers.dev`
   - `PRODUCTION_BASE_URL` = `https://api.webwaka.ng`

Replace `<your-cf-subdomain>` with the actual Workers subdomain shown in the Cloudflare
dashboard under **Workers & Pages → Overview**.

- [ ] `STAGING_BASE_URL` variable set
- [ ] `PRODUCTION_BASE_URL` variable set

---

## CODE-5 — Create GitHub Labels for 3-in-1 Pillar Tracking

**URL:** https://github.com/WebWakaOS/WebWaka/labels  
**Why:** Without these labels, PRs and issues cannot be tracked by pillar, making it
impossible to monitor implementation balance across Ops / Branding / Marketplace.

### Labels to create

| Label name | Color | Description |
|---|---|---|
| `3in1:ops` | `#0075ca` (blue) | Pillar 1 — Back-office / POS / operations features |
| `3in1:branding` | `#7057ff` (purple) | Pillar 2 — White-label branding / website / portal features |
| `3in1:marketplace` | `#0e8a16` (green) | Pillar 3 — Public directory / marketplace / discovery features |
| `3in1:ai` | `#e4e669` (yellow) | AI/ML features attached to any pillar |
| `3in1:infra` | `#cfd3d7` (grey) | Cross-cutting infrastructure (auth, KV, migrations, CI) |

### Steps

1. Open https://github.com/WebWakaOS/WebWaka/labels
2. Click **New label** for each row above
3. Enter the name, color, and description exactly as shown
4. Click **Create label**

- [ ] `3in1:ops` label created
- [ ] `3in1:branding` label created
- [ ] `3in1:marketplace` label created
- [ ] `3in1:ai` label created
- [ ] `3in1:infra` label created

---

## CODE-5-RETRO — Apply Labels to Previously Merged PRs

**URL:** https://github.com/WebWakaOS/WebWaka/pulls?state=closed  
**Why:** 27 PRs have been merged without 3-in-1 labels. Retroactive labeling ensures
the audit trail is accurate for governance reporting.

### Steps

1. Open each closed PR
2. In the **Labels** sidebar, apply the appropriate `3in1:*` label(s)
3. At minimum, label the PRs that touch:
   - `apps/api` → `3in1:infra`
   - `apps/brand-runtime` → `3in1:branding`
   - `apps/public-discovery` → `3in1:marketplace`
   - `apps/tenant-public` → `3in1:branding`
   - `packages/white-label-theming` → `3in1:branding`
   - `packages/community` → `3in1:marketplace`
   - `packages/social` → `3in1:marketplace`
   - Migrations (0001–0221) → `3in1:infra`

- [ ] All 27 closed PRs reviewed and labeled

---

## PR Template Update (Recommended)

After CODE-5 is done, add label application as a required PR checklist item. The 3-in-1
remediation plan already contains the suggested PR template addition at the bottom of
`docs/governance/webwaka_3in1_remediation_plan.md` (search for "PR template checklist").

- [ ] `.github/pull_request_template.md` updated with `3in1:*` label requirement checkbox

---

## Master Completion Checklist

```
Cloudflare
- [ ] DEPLOY-001   KV namespaces verified to exist in Cloudflare account
- [ ] DEPLOY-005   Migrations applied to staging D1 + smoke test passes
- [ ] DEPLOY-005   Migrations applied to production D1 + smoke test passes (4-eyes)
- [ ] CF-SECRETS   Wrangler secrets set for all 5 worker apps (staging + production)

GitHub
- [ ] OPS-001-A    staging GitHub environment created with required reviewer
- [ ] OPS-001-B    production GitHub environment created (2+ reviewers, 10-min timer)
- [ ] OPS-001-C    staging branch protection enabled (CI required, no force-push)
- [ ] GH-SECRETS   CF_API_TOKEN + CF_ACCOUNT_ID set in GitHub
- [ ] GH-VARS      STAGING_BASE_URL + PRODUCTION_BASE_URL set as Actions variables
- [ ] CODE-5       5 GitHub labels created
- [ ] CODE-5-RETRO 27 closed PRs retroactively labeled

Optional
- [ ] PR template updated with 3in1:* label checkbox
```

When every box is ticked, the platform is fully configured for its first production deployment.

---

## Reference: Cloudflare Account IDs

| Resource | Value |
|---|---|
| Cloudflare Account ID | `a5f5864b726209519e0c361f2bb90e79` |
| D1 staging database ID | `7c264f00-c36d-4014-b2fe-c43e136e86f6` |
| D1 production database ID | `72fa5ec8-52c2-4f41-b486-957d7b00c76f` |
| RATE_LIMIT_KV staging | `2a81cd5b8d094911a20e1e0f6a190506` |
| RATE_LIMIT_KV production | `8cbf31285b0c43e1a8f44ee0af9fcdf3` |
| GEOGRAPHY_CACHE staging | `4732f3a682964607bae2170f350e4fb4` |
| GEOGRAPHY_CACHE production | `5bd5695d963247d0b105a936827e0a89` |
| DISCOVERY_CACHE staging | `eb26f47e1be34ce59526f9617e02f51f` |
| DISCOVERY_CACHE production | `d82d3780283e4857966bc8fab4e2761c` |
| THEME_CACHE staging | `3093422f3e4e4252a3b542ed9a06fd18` |
| THEME_CACHE production | `d89a05e8c5814c6c966061f62dd24f8c` |
| USSD_SESSION_KV staging | `67c95f1527114e4bac480a44c4169b85` |
| USSD_SESSION_KV production | `e34fb28b075b4362a8d4d840c19e670c` |
