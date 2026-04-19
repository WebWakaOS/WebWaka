# WebWaka OS — Remaining Human-Action Items

**Status:** Living document — update checkboxes as items are completed  
**Last updated:** 2026-04-19 (SUPER-ADMIN seeded, MIGRATIONS verified, GH-VARS set, SMOKE_API_KEY provisioned)  
**Prepared by:** WebWaka Agent  
**Branch:** `staging` (default branch)  
**GitHub repo:** https://github.com/WebWakaOS/WebWaka

---

## What Is Already Done

The following items from earlier remediation plans are **confirmed complete** as of the
April 10–11 infrastructure handover (see `docs/HANDOVER.md`):

| Item | Completed | Evidence |
|---|---|---|
| Cloudflare account provisioned | ✅ | Account ID `98174497603b3edc1ca0159402956161` |
| Domain `webwaka.com` active zone | ✅ | Zone ID `ee14050f896d897ad93d300397d0d26d` |
| D1 databases created (staging + production) | ✅ | See §5 of HANDOVER.md |
| 191 D1 migrations applied to staging | ✅ | 559 tables; applied 2026-04-10 ~21:16 UTC |
| KV namespaces created (6 total) | ✅ | 3 staging + 3 production; IDs in HANDOVER.md §5 |
| `webwaka-api-staging` Worker deployed | ✅ | Live at `https://api-staging.webwaka.com` |
| `webwaka-api-production` Worker deployed | ✅ | Live at `https://api.webwaka.com` |
| `JWT_SECRET` + `INTER_SERVICE_SECRET` pushed to both Workers | ✅ | Via `wrangler secret put` in deploy CI |
| GitHub environments `staging` + `production` created | ✅ | IDs 14009923309 / 14009923508 |
| GitHub secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` set | ✅ | Repo-level + environment-level |
| CI/CD pipelines green (CI, Deploy-Staging, Deploy-Production) | ✅ | Run #24268508845 all green |
| `staging` set as default branch (`main` deleted) | ✅ | 2026-04-11 00:23 UTC |
| D1 migrations auto-apply on every CI deploy | ✅ | Step 5 of deploy workflow |

---

## What Is Still Outstanding

| ID | Category | Item | Effort | Blocker for |
|---|---|---|---|---|
| **⚠️ TOKEN-ROTATE** | **Cloudflare — URGENT** | **Rotate the Cloudflare API token exposed in a public GitHub commit** | **5 min** | **Security — do this first** |
| EXT-SECRETS | Cloudflare | Set third-party integration secrets on `apps/api` worker | 15 min | Payments, KYC, OTP, messaging |
| ~~SUPER-ADMIN~~ | ~~Cloudflare~~ | ~~Seed platform tenant and super admin user in D1~~ | ~~10 min~~ | ~~✅ Done 2026-04-19~~ |
| ~~MIGRATIONS~~ | ~~Cloudflare~~ | ~~Production D1 migration backlog (verify fully applied)~~ | ~~Auto / verify~~ | ~~✅ 442 applied (up to 0254)~~ |
| NEW-SECRETS | Cloudflare | Set `LOG_PII_SALT` + `JWT_SECRET` on newly deployed worker apps | 10 min | NDPR pseudonymisation |
| OPS-001-A | GitHub | Add required-reviewer protection to `staging` environment | 5 min | Prevents unreviewed staging deploys |
| OPS-001-B | GitHub | Add required-reviewers + wait timer to `production` environment | 5 min | 4-eyes gate on production |
| OPS-001-C | GitHub | Enable branch protection rules on `staging` branch | 5 min | PR quality gate |
| ~~GH-VARS~~ | ~~GitHub~~ | ~~Set `STAGING_BASE_URL` + `PRODUCTION_BASE_URL` as Actions variables~~ | ~~3 min~~ | ~~✅ Done 2026-04-13~~ |
| SMOKE | GitHub | Wire real smoke tests into CI (replace placeholder) | See note | Post-M3 regression detection |
| CODE-5 | GitHub | Create 5 GitHub labels for 3-in-1 pillar tracking | 5 min | PR tagging |
| CODE-5-RETRO | GitHub | Apply labels retroactively to 27 previously merged PRs | 30 min | Governance audit trail |

---

## ⚠️ TOKEN-ROTATE — Rotate the Exposed Cloudflare API Token (DO FIRST)

**URGENT — Security**  
**Why:** A live Cloudflare API token was committed to the public GitHub repository inside
`docs/production-remediation-plan-2026-04-10.md`. Anyone who has ever viewed that file
has a copy of the token. This must be rotated before any other work proceeds.

### Steps

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Find the token (search for one matching `mx5yewdNFpT7oGZxt81BdUKJ1UF3_tUaiVL0rrG_` prefix) and click **Revoke**
3. Click **Create Token** → use the **Edit Cloudflare Workers** template
4. Add scopes: `D1 → Edit`, `Workers KV Storage → Edit`, `Workers Scripts → Edit`, `Zone → Edit` (for custom domains)
5. Copy the new token — you will only see it once
6. Update **GitHub Actions secret** (repo-level + both environments):
   - Go to: https://github.com/WebWakaOS/WebWaka/settings/secrets/actions
   - Update `CLOUDFLARE_API_TOKEN` with the new value
7. For local wrangler commands, set in your terminal:
   ```bash
   export CLOUDFLARE_API_TOKEN="<new-token>"
   export CLOUDFLARE_ACCOUNT_ID="98174497603b3edc1ca0159402956161"
   ```

- [ ] Old Cloudflare API token revoked
- [ ] New token created with correct scopes
- [ ] `CLOUDFLARE_API_TOKEN` updated in GitHub Actions secrets

---

## EXT-SECRETS — Set Third-Party Integration Secrets on `apps/api`

**Why:** `apps/api/wrangler.toml` documents 9 additional secrets that must be set via
`wrangler secret put` for payments (Paystack), identity verification (Prembly), OTP (Termii),
messaging (WhatsApp, Telegram), and platform security (DM encryption, price-lock). These
are different from `JWT_SECRET` which was already pushed.

### Generate values

```bash
# Generate strong random keys for platform-internal secrets:
openssl rand -hex 32   # for DM_MASTER_KEY
openssl rand -hex 32   # for PRICE_LOCK_SECRET
openssl rand -hex 32   # for INTER_SERVICE_SECRET
```

### Set secrets (run once for staging, repeat for production)

```bash
export CLOUDFLARE_API_TOKEN="<your-token>"
cd apps/api

# Paystack (from https://dashboard.paystack.com/#/settings/developer)
wrangler secret put PAYSTACK_SECRET_KEY --env staging
wrangler secret put PAYSTACK_SECRET_KEY --env production

# Prembly — identity/KYC verification
wrangler secret put PREMBLY_API_KEY --env staging
wrangler secret put PREMBLY_API_KEY --env production

# Termii — OTP SMS provider
wrangler secret put TERMII_API_KEY --env staging
wrangler secret put TERMII_API_KEY --env production

# WhatsApp Business API (Meta developer portal)
wrangler secret put WHATSAPP_ACCESS_TOKEN --env staging
wrangler secret put WHATSAPP_ACCESS_TOKEN --env production
wrangler secret put WHATSAPP_PHONE_NUMBER_ID --env staging
wrangler secret put WHATSAPP_PHONE_NUMBER_ID --env production

# Telegram Bot (from @BotFather)
wrangler secret put TELEGRAM_BOT_TOKEN --env staging
wrangler secret put TELEGRAM_BOT_TOKEN --env production

# Platform-internal secrets (generate fresh values per env)
wrangler secret put DM_MASTER_KEY --env staging       # AES-256-GCM key for DM encryption
wrangler secret put DM_MASTER_KEY --env production
wrangler secret put PRICE_LOCK_SECRET --env staging   # HMAC key for price-lock tokens
wrangler secret put PRICE_LOCK_SECRET --env production
wrangler secret put INTER_SERVICE_SECRET --env staging  # API→Admin service-to-service auth
wrangler secret put INTER_SERVICE_SECRET --env production
```

> **Staging vs Production:** Use test credentials (Paystack test key, etc.) for staging.
> Use live credentials only for production.

- [ ] PAYSTACK_SECRET_KEY set (staging + production)
- [ ] PREMBLY_API_KEY set (staging + production)
- [ ] TERMII_API_KEY set (staging + production)
- [ ] WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID set (staging + production)
- [ ] TELEGRAM_BOT_TOKEN set (staging + production)
- [ ] DM_MASTER_KEY set (staging + production)
- [ ] PRICE_LOCK_SECRET set (staging + production)
- [ ] INTER_SERVICE_SECRET set (staging + production)

---

## SUPER-ADMIN — Seed Platform Tenant and Super Admin User

**Why:** The D1 database has no data yet. Before the first login can happen, a platform-level
tenant and a super admin user must be seeded. Without this, `POST /auth/login` will always
return 404/401.

### Generate password hash

```bash
# Generate a bcrypt hash of your super admin password (use a strong password):
node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update('YourChosenPassword').digest('hex'))"
# Or use a proper bcrypt tool — the API uses bcrypt for password verification
```

### Seed staging

```bash
export CLOUDFLARE_API_TOKEN="<your-token>"

# 1. Create the platform tenant
wrangler d1 execute webwaka-os-staging --env staging \
  --command "INSERT INTO tenants (id, slug, name, status, created_at) VALUES ('ten_platform', 'webwaka', 'WebWaka OS', 'active', unixepoch())"

# 2. Create the super admin user
wrangler d1 execute webwaka-os-staging --env staging \
  --command "INSERT INTO users (id, tenant_id, email, password_hash, role, status, created_at) VALUES ('usr_superadmin', 'ten_platform', 'admin@webwaka.com', '<bcrypt-hash>', 'super_admin', 'active', unixepoch())"

# 3. Create the platform workspace
wrangler d1 execute webwaka-os-staging --env staging \
  --command "INSERT INTO workspaces (id, tenant_id, name, status, plan, created_at) VALUES ('wsp_platform', 'ten_platform', 'WebWaka Platform', 'active', 'full_platform', unixepoch())"
```

### Verify first login

```bash
curl -X POST https://api-staging.webwaka.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@webwaka.com","password":"YourChosenPassword"}' | jq .
# Expected: { "token": "eyJ...", "user": { "role": "super_admin" } }
```

### Repeat for production (after staging verified)

Use a **different**, stronger password for production. Store it in a password manager.

- [ ] Platform tenant seeded in staging D1 (staging DB unreachable — ID may need update)
- [ ] Super admin user seeded in staging D1 (staging DB unreachable — ID may need update)
- [ ] First login to staging API verified (returns JWT with `super_admin` role)
- [x] Platform tenant seeded in production D1 (`ten_platform` / `WebWaka OS`)
- [x] Super admin user seeded in production D1 (`admin@webwaka.com`, role=`super_admin`, PBKDF2-600k hash)
- [x] Production D1 JOIN query verified (rows_read: 3 — tenant+workspace+user joined correctly) — 2026-04-19

> **Credentials (production):** email `admin@webwaka.com`. Password stored separately — contact the agent session that ran the seed. The hash is PBKDF2-600k with SHA-256.  
> **Note on staging:** D1 database ID `7c264f00-c36d-4014-b2fe-c43e136e86f6` returns `code: 7404` via wrangler — this ID may be stale. Seed staging once the DB ID is confirmed.

---

## MIGRATIONS — Production D1 Migration Backlog

**Status:** Self-healing via CI, but verify manually  
**Why:** As of the April 10 handover, the production D1 database had only 6 migration files applied
(13 tables). Every push to `staging` triggers the CI deploy pipeline which runs
`wrangler d1 migrations apply` automatically. Migrations 0007–0221 should now be applied.
Verify and confirm they are fully caught up.

### Verify

```bash
# Check how many migrations have been applied to production:
wrangler d1 execute webwaka-os-production \
  --command "SELECT name FROM _cf_METADATA ORDER BY id" \
  --env production

# Or via Cloudflare dashboard:
# https://dash.cloudflare.com/98174497603b3edc1ca0159402956161/workers/d1
```

If any migrations are missing, the next CI deploy will apply them. To trigger manually:

```bash
cd apps/api
wrangler d1 migrations apply webwaka-os-production --env production
```

> **4-eyes checkpoint:** Production migration changes require two-person sign-off.

- [x] Production D1 confirmed: **442 migrations applied**, latest = `0254_b2b_disputes_bank_transfer_fk.sql` — verified 2026-04-19

---

## NEW-SECRETS — `LOG_PII_SALT` for Additional Worker Apps

**Why:** `JWT_SECRET` and `INTER_SERVICE_SECRET` were injected for `apps/api` in the April 10
deploy. As additional worker apps are deployed to Cloudflare (brand-runtime, tenant-public,
public-discovery, ussd-gateway), they each need their own secrets set.

`LOG_PII_SALT` is used for NDPR-compliant pseudonymisation of personal data in logs. It is
required by the security baseline (SEC-004). `JWT_SECRET` is required for any app that
validates bearer tokens.

### Per app, run when deploying each worker for the first time:

```bash
# Generate values (run once, store securely):
openssl rand -hex 32   # for JWT_SECRET
openssl rand -hex 16   # for LOG_PII_SALT

# apps/brand-runtime
cd apps/brand-runtime
wrangler secret put JWT_SECRET --env staging
wrangler secret put JWT_SECRET --env production
wrangler secret put LOG_PII_SALT --env staging
wrangler secret put LOG_PII_SALT --env production

# apps/tenant-public
cd apps/tenant-public
wrangler secret put JWT_SECRET --env staging
wrangler secret put JWT_SECRET --env production
wrangler secret put LOG_PII_SALT --env staging
wrangler secret put LOG_PII_SALT --env production

# apps/public-discovery (no JWT — unauthenticated discovery; LOG_PII_SALT only)
cd apps/public-discovery
wrangler secret put LOG_PII_SALT --env staging
wrangler secret put LOG_PII_SALT --env production

# apps/ussd-gateway
cd apps/ussd-gateway
wrangler secret put JWT_SECRET --env staging
wrangler secret put JWT_SECRET --env production
wrangler secret put LOG_PII_SALT --env staging
wrangler secret put LOG_PII_SALT --env production
```

> **Note:** These apps are not yet deployed to Cloudflare Workers. Complete this step at
> first deploy time for each app. Do not pre-create secrets for undeployed workers.

- [ ] `LOG_PII_SALT` + `JWT_SECRET` set for brand-runtime (at first deploy)
- [ ] `LOG_PII_SALT` + `JWT_SECRET` set for tenant-public (at first deploy)
- [ ] `LOG_PII_SALT` set for public-discovery (at first deploy)
- [ ] `LOG_PII_SALT` + `JWT_SECRET` set for ussd-gateway (at first deploy)

---

## OPS-001-A — Add Required-Reviewer Protection to `staging` Environment

**URL:** https://github.com/WebWakaOS/WebWaka/settings/environments/14009923309  
**Why:** The `staging` environment was created (ID: 14009923309) but may not have deployment
protection rules enabled. Without a required reviewer, every push to `staging` auto-deploys
with no human gate.

### Steps

1. Open the link above
2. Under **Deployment protection rules**, enable:
   - ✅ **Required reviewers** — add at least 1 reviewer
3. Save

- [ ] `staging` environment has required reviewer set

---

## OPS-001-B — Add Required-Reviewers + Wait Timer to `production` Environment

**URL:** https://github.com/WebWakaOS/WebWaka/settings/environments/14009923508  
**Why:** The `production` environment was created (ID: 14009923508). A 4-eyes gate and wait
timer are required before any production deploy proceeds.

> **Important note on current trigger:** Per `docs/HANDOVER.md §10`, every push to `staging`
> currently triggers *both* the staging AND production deploy simultaneously. Consider changing
> `deploy-production.yml` to `workflow_dispatch` only (manual trigger) if you want staging-only
> pushes. The environment protection gate is a secondary safeguard regardless.

### Steps

1. Open the link above
2. Under **Deployment protection rules**, enable:
   - ✅ **Required reviewers** — add **2+ reviewers** (4-eyes principle)
   - ✅ **Wait timer** — set to **10 minutes** (circuit-breaker window)
3. Under **Deployment branches and tags**:
   - Select **Protected branches only**
4. Save

### Optional: Change production trigger to manual-only

In `.github/workflows/deploy-production.yml`, change the trigger from `push` to `workflow_dispatch`:

```yaml
on:
  workflow_dispatch:   # manual trigger only
  # push:              # remove or comment out the push trigger
```

This prevents any push to `staging` from auto-deploying to production.

- [ ] `production` environment has 2+ required reviewers set
- [ ] `production` environment has 10-minute wait timer set
- [ ] (Optional) Production deploy trigger changed to `workflow_dispatch` only

---

## OPS-001-C — Enable Branch Protection on `staging`

**URL:** https://github.com/WebWakaOS/WebWaka/settings/branches  
**Why:** `staging` is the default branch and the source of truth. Without branch protection,
anyone with push access can push directly without passing CI, bypassing the test + lint gates.

### Steps

1. Click **Add branch protection rule**
2. Branch name pattern: `staging`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging → search and add: `ci`
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings
4. Save

- [ ] Branch protection rule created for `staging`
- [ ] `ci` status check required before merge
- [ ] Force-push disabled (including for admins)

---

## GH-VARS — Set GitHub Actions Variables for Smoke Tests

**URL:** https://github.com/WebWakaOS/WebWaka/settings/variables/actions  
**Why:** The CI smoke test step reads `STAGING_BASE_URL` and `PRODUCTION_BASE_URL` as public
Actions variables. Currently the smoke test is skipped (placeholder). These should be set
now so they are ready when the smoke suite is wired in during Milestone 3.

### Steps

1. Navigate to: **Settings → Secrets and variables → Actions → Variables tab → New repository variable**
2. Add:
   - `STAGING_BASE_URL` = `https://api-staging.webwaka.com`
   - `PRODUCTION_BASE_URL` = `https://api.webwaka.com`

- [ ] `STAGING_BASE_URL` variable set to `https://api-staging.webwaka.com`
- [ ] `PRODUCTION_BASE_URL` variable set to `https://api.webwaka.com`

---

## SMOKE — Wire Real Smoke Tests into CI

**Note:** This is a code task, not a UI-only action. It can be done by the code agent when
Milestone 3 is complete.

**Why:** Per `docs/HANDOVER.md §3`, the smoke test step in the CI workflow is currently a
placeholder that is always skipped. Real smoke tests exist in `tests/smoke/` but are not
wired into the CI pipeline.

### When Milestone 3 ships, update `.github/workflows/ci.yml` smoke test step to:

```bash
cd tests/smoke
SMOKE_API_KEY=${{ secrets.SMOKE_API_KEY }} \
SMOKE_BASE_URL=${{ vars.STAGING_BASE_URL }} \
pnpm test
```

And add `SMOKE_API_KEY` as a repo-level secret.

- [ ] Smoke test step wired into `ci.yml` (Milestone 3)
- [ ] `SMOKE_API_KEY` set as a GitHub Actions secret

---

## CODE-5 — Create GitHub Labels for 3-in-1 Pillar Tracking

**URL:** https://github.com/WebWakaOS/WebWaka/labels  
**Why:** 29 GitHub labels were created at Milestone 0 but none cover the 3-in-1 pillars.
Without these labels, PRs cannot be tracked by pillar.

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
2. Click **New label** for each row above — enter name, color, description exactly as shown
3. Click **Create label**

- [ ] `3in1:ops` label created
- [ ] `3in1:branding` label created
- [ ] `3in1:marketplace` label created
- [ ] `3in1:ai` label created
- [ ] `3in1:infra` label created

---

## CODE-5-RETRO — Apply Labels to Previously Merged PRs

**URL:** https://github.com/WebWakaOS/WebWaka/pulls?state=closed  
**Effort:** ~30 minutes  
**Dependency:** CODE-5 must be done first

Apply the appropriate `3in1:*` label(s) to every closed PR. Use this file-to-pillar mapping:

| Files changed | Label(s) |
|---|---|
| `apps/api/` | `3in1:infra` |
| `apps/brand-runtime/` | `3in1:branding` |
| `apps/public-discovery/` | `3in1:marketplace` |
| `apps/tenant-public/` | `3in1:branding` |
| `apps/ussd-gateway/` | `3in1:infra` |
| `packages/white-label-theming/` | `3in1:branding` |
| `packages/community/` | `3in1:marketplace` |
| `packages/social/` | `3in1:marketplace` |
| `packages/auth-tenancy/` | `3in1:infra` |
| `infra/db/migrations/` | `3in1:infra` |
| `.github/workflows/` | `3in1:infra` |
| `packages/ai-abstraction/` | `3in1:ai` |

- [ ] All 27 closed PRs reviewed and labeled

---

## Master Completion Checklist

```
Cloudflare
- [x] MIGRATIONS    Production D1: 442 migrations applied (latest 0254) — verified 2026-04-19
- [x] SUPER-ADMIN   Production D1: tenant/workspace/super-admin seeded — 2026-04-19
- [ ] SUPER-ADMIN   Staging D1: seed pending (DB ID 7c264f00 returns 7404 — verify ID)
- [ ] EXT-SECRETS   Third-party secrets (Paystack, Prembly, Termii, WhatsApp, Telegram, DM_MASTER_KEY, etc.)

Secrets (at first deploy of each new worker app)
- [ ] NEW-SECRETS   LOG_PII_SALT + JWT_SECRET set for brand-runtime
- [ ] NEW-SECRETS   LOG_PII_SALT + JWT_SECRET set for tenant-public
- [ ] NEW-SECRETS   LOG_PII_SALT set for public-discovery
- [ ] NEW-SECRETS   LOG_PII_SALT + JWT_SECRET set for ussd-gateway

GitHub Environments
- [ ] OPS-001-A     staging environment: required reviewer added
- [ ] OPS-001-B     production environment: 2+ reviewers + 10-min wait timer
- [ ] OPS-001-B     (Optional) production deploy trigger changed to workflow_dispatch

GitHub Branch & CI
- [ ] OPS-001-C     staging branch protection enabled (CI required, no force-push)
- [x] GH-VARS       STAGING_BASE_URL + PRODUCTION_BASE_URL set as Actions variables — 2026-04-13
- [x] SMOKE         SMOKE_API_KEY added as GitHub secret (placeholder) — 2026-04-14
- [ ] SMOKE         Real smoke tests wired into CI (Milestone 3 task)

GitHub Labels
- [ ] CODE-5        5 GitHub labels created (3in1:ops/branding/marketplace/ai/infra)
- [ ] CODE-5-RETRO  27 closed PRs retroactively labeled
```

---

## Reference: Active Infrastructure (as of April 11, 2026)

| Resource | Value |
|---|---|
| Cloudflare Account ID | `98174497603b3edc1ca0159402956161` |
| Cloudflare Zone ID (webwaka.com) | `ee14050f896d897ad93d300397d0d26d` |
| D1 staging (`webwaka-staging`) | `7c264f00-c36d-4014-b2fe-c43e136e86f6` |
| D1 production (`webwaka-production`) | `72fa5ec8-52c2-4f41-b486-957d7b00c76f` |
| Production API | https://api.webwaka.com |
| Staging API | https://api-staging.webwaka.com |
| GitHub Environments | https://github.com/WebWakaOS/WebWaka/settings/environments |
| Cloudflare Dashboard | https://dash.cloudflare.com/98174497603b3edc1ca0159402956161 |
