# Base44 Superagent — M13 Production Launch Execution Prompt

**Date:** 2026-04-11  
**Repository:** https://github.com/WebWakaOS/WebWaka  
**Branch:** `staging` (commit `d5d0fb9`)  
**Version:** v1.0.0  
**Context:** All code work is complete. M0–M13 milestones are DONE. This prompt executes the operational deployment steps that require Cloudflare credentials and infrastructure access.

---

## Current State (Verified)

- **347+ tests passing** (279 API + 68 SuperAgent), 0 failures
- **10/10 governance checks** green (tenant isolation, AI direct calls, monetary integrity, CORS, rollback scripts, pillar prefixes, PWA manifests, NDPR gates, geography integrity, dependency sources)
- **TypeScript:** 0 errors across all apps and packages
- **5 smoke test suites** ready (health, discovery, claims, branding, superagent)
- **206 D1 migrations** with rollback scripts
- **CHANGELOG.md** v1.0.0 complete
- **QA Report:** `docs/qa/m12-ai-qa-report.md` — 9 bugs found and fixed, all verified
- **Milestone Tracker:** `docs/governance/milestone-tracker.md` — M0–M13 all DONE

---

## Reference Documents

Read these before executing. They are in the repo at `staging` branch:

1. **Launch Checklist (step-by-step):** [`docs/super-admin-launch-checklist.md`](https://github.com/WebWakaOS/WebWaka/blob/staging/docs/super-admin-launch-checklist.md)
2. **Operator Runbook:** [`docs/operator-runbook.md`](https://github.com/WebWakaOS/WebWaka/blob/staging/docs/operator-runbook.md)
3. **Release Governance:** [`docs/governance/release-governance.md`](https://github.com/WebWakaOS/WebWaka/blob/staging/docs/governance/release-governance.md)
4. **Security Baseline:** [`docs/governance/security-baseline.md`](https://github.com/WebWakaOS/WebWaka/blob/staging/docs/governance/security-baseline.md)
5. **Compliance Dashboard:** [`docs/governance/compliance-dashboard.md`](https://github.com/WebWakaOS/WebWaka/blob/staging/docs/governance/compliance-dashboard.md)
6. **M12 QA Report:** [`docs/qa/m12-ai-qa-report.md`](https://github.com/WebWakaOS/WebWaka/blob/staging/docs/qa/m12-ai-qa-report.md)
7. **Milestone Tracker:** [`docs/governance/milestone-tracker.md`](https://github.com/WebWakaOS/WebWaka/blob/staging/docs/governance/milestone-tracker.md)

---

## Execution Steps (In Order — Do Not Skip)

### Step 0 — URGENT: Rotate Cloudflare API Token

The previous audit committed a live Cloudflare API token to the repo. This MUST be rotated before any deployment.

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Find and **Revoke** the compromised token
3. Create a new token using the **Edit Cloudflare Workers** template with these permissions:
   - `D1 → Edit`
   - `Workers KV Storage → Edit`
   - `Workers Scripts → Edit`
4. Copy the new token (shown only once)
5. Add to GitHub Actions secrets at https://github.com/WebWakaOS/WebWaka/settings/secrets/actions → Name: `CLOUDFLARE_API_TOKEN`
6. Set locally for the remaining steps:
   ```bash
   export CLOUDFLARE_API_TOKEN="<new-token>"
   export CLOUDFLARE_ACCOUNT_ID="a5f5864b726209519e0c361f2bb90e79"
   ```

---

### Step 1 — Apply Wrangler Secrets to Staging

Generate random secrets where needed:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Apply each secret (wrangler will prompt for the value):
```bash
npx wrangler secret put JWT_SECRET --env staging --config apps/api/wrangler.toml
npx wrangler secret put PAYSTACK_SECRET_KEY --env staging --config apps/api/wrangler.toml
npx wrangler secret put PREMBLY_API_KEY --env staging --config apps/api/wrangler.toml
npx wrangler secret put TERMII_API_KEY --env staging --config apps/api/wrangler.toml
npx wrangler secret put WHATSAPP_ACCESS_TOKEN --env staging --config apps/api/wrangler.toml
npx wrangler secret put WHATSAPP_PHONE_NUMBER_ID --env staging --config apps/api/wrangler.toml
npx wrangler secret put TELEGRAM_BOT_TOKEN --env staging --config apps/api/wrangler.toml
npx wrangler secret put LOG_PII_SALT --env staging --config apps/api/wrangler.toml
npx wrangler secret put DM_MASTER_KEY --env staging --config apps/api/wrangler.toml
npx wrangler secret put PRICE_LOCK_SECRET --env staging --config apps/api/wrangler.toml
npx wrangler secret put INTER_SERVICE_SECRET --env staging --config apps/api/wrangler.toml
npx wrangler secret put AFRICAS_TALKING_USERNAME --env staging --config apps/ussd-gateway/wrangler.toml
npx wrangler secret put AFRICAS_TALKING_API_KEY --env staging --config apps/ussd-gateway/wrangler.toml
```

---

### Step 2 — Apply All 206 D1 Migrations to Staging

```bash
npx wrangler d1 migrations apply webwaka-os-staging \
  --env staging \
  --config apps/api/wrangler.toml \
  --remote
```

Verify critical tables exist:
```bash
npx wrangler d1 execute webwaka-os-staging --env staging --remote \
  --config apps/api/wrangler.toml \
  --command "SELECT name FROM sqlite_master WHERE type='table' AND name IN (
    'search_entries','discovery_events','vendor_pricing_policies',
    'listing_price_overrides','negotiation_sessions','negotiation_offers',
    'negotiation_audit_log','ministry_members',
    'ai_hitl_queue','ai_hitl_events','ai_spend_budgets','ai_processing_register',
    'partner_entitlements','partner_audit_log'
  ) ORDER BY name;"
```
Expected: 14 rows (including 4 new M11–M12 tables).

---

### Step 3 — Load Geography Seed Data

```bash
npx wrangler d1 execute webwaka-os-staging --env staging --remote \
  --config apps/api/wrangler.toml \
  --file infra/db/seed/nigeria_country.sql

npx wrangler d1 execute webwaka-os-staging --env staging --remote \
  --config apps/api/wrangler.toml \
  --file infra/db/seed/nigeria_zones.sql

npx wrangler d1 execute webwaka-os-staging --env staging --remote \
  --config apps/api/wrangler.toml \
  --file infra/db/seed/nigeria_states.sql

npx wrangler d1 execute webwaka-os-staging --env staging --remote \
  --config apps/api/wrangler.toml \
  --file infra/db/seed/0002_lgas.sql

npx wrangler d1 execute webwaka-os-staging --env staging --remote \
  --config apps/api/wrangler.toml \
  --file infra/db/seed/0003_wards.sql
```

---

### Step 4 — Seed Platform Tenant + Super Admin

Create seed file (DO NOT commit this — contains password hash):
```bash
cat > /tmp/seed-super-admin.sql << 'ENDSQL'
INSERT OR IGNORE INTO workspaces (
  id, tenant_id, name, owner_type, owner_id,
  subscription_plan, subscription_status, active_layers
) VALUES (
  'ws_platform_001', 'tenant_webwaka', 'WebWaka Platform',
  'organization', 'user_superadmin_001', 'enterprise', 'active',
  '["discovery","commerce","social","community","civic","identity","payments"]'
);

INSERT OR IGNORE INTO users (
  id, email, full_name, password_hash,
  workspace_id, tenant_id, role, kyc_status, kyc_tier
) VALUES (
  'user_superadmin_001', 'admin@webwaka.com', 'WebWaka Super Admin',
  'sW1pwz9G7XVBfoRNBx/a8A==:/YCp11+knrqLewuSodctrLD+A6ilM4ypZyT4imquP9U=',
  'ws_platform_001', 'tenant_webwaka', 'super_admin', 'verified', 't3'
);

INSERT OR IGNORE INTO memberships (
  id, workspace_id, tenant_id, user_id, role
) VALUES (
  'mbr_superadmin_001', 'ws_platform_001', 'tenant_webwaka',
  'user_superadmin_001', 'super_admin'
);
ENDSQL
```

Apply to staging:
```bash
npx wrangler d1 execute webwaka-os-staging --env staging --remote \
  --config apps/api/wrangler.toml \
  --file /tmp/seed-super-admin.sql
```

Verify:
```bash
npx wrangler d1 execute webwaka-os-staging --env staging --remote \
  --config apps/api/wrangler.toml \
  --command "SELECT id, email, role, tenant_id FROM users WHERE email='admin@webwaka.com';"
```

> **Staging credentials:** Email: `admin@webwaka.com` / Password: `WebWaka@2026!`
> **CHANGE THE PASSWORD on production** — generate a new PBKDF2 hash.

---

### Step 5 — Deploy All 4 Workers to Staging

```bash
npx wrangler deploy --env staging --config apps/api/wrangler.toml
npx wrangler deploy --env staging --config apps/brand-runtime/wrangler.toml
npx wrangler deploy --env staging --config apps/public-discovery/wrangler.toml
npx wrangler deploy --env staging --config apps/ussd-gateway/wrangler.toml
```

Note the Worker URLs from the output.

---

### Step 6 — Run Staging Verification

**Health check:**
```bash
API_URL="https://webwaka-api-staging.<your-cf-subdomain>.workers.dev"
curl -s "$API_URL/health" | jq .
curl -s "$API_URL/health/version" | jq .
```

Expected:
- `{"status":"ok","service":"webwaka-api",...}`
- `{"version":"1.0.0"}`

**Test login:**
```bash
curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@webwaka.com","password":"WebWaka@2026!"}' | jq .
```

**Verify identity with token:**
```bash
TOKEN="<paste-token>"
curl -s "$API_URL/auth/me" -H "Authorization: Bearer $TOKEN" | jq .
```

**Run full smoke suite:**
```bash
SMOKE_API_KEY=<your-smoke-key> BASE_URL="$API_URL" pnpm --filter smoke run smoke:staging
```

All 5 suites must pass (health, discovery, claims, branding, superagent).

---

### Step 7 — Enable Production Approval Gate

1. Go to https://github.com/WebWakaOS/WebWaka/settings/environments
2. Click **"production"** (create if needed)
3. Enable **"Required reviewers"** → add Founder's GitHub username
4. Save

---

### Step 8 — Deploy to Production

Push staging to main (or merge a PR from staging → a new `main` branch if one doesn't exist yet). Since `staging` is the default branch, you may need to create a `main` branch first:

```bash
git checkout staging
git checkout -b main
git push origin main
```

Or use the GitHub UI to create a PR from `staging` and merge it.

The CI pipeline will:
1. Run TypeScript check
2. Run `pnpm audit`
3. Apply migrations to production D1
4. Deploy all 4 Workers to production
5. Pause for your manual approval (Step 7)

After you click **Approve** in GitHub, Workers deploy to production.

---

### Step 9 — Seed Production

After production migrations apply:

1. Generate a **new strong password** and PBKDF2 hash for production super admin
2. Update `/tmp/seed-super-admin.sql` with the new hash
3. Apply:
```bash
npx wrangler d1 execute webwaka-os-production --env production --remote \
  --config apps/api/wrangler.toml \
  --file /tmp/seed-super-admin.sql
```

4. Apply all production secrets (same as Step 1 but with `--env production`)

---

### Step 10 — Production Smoke Tests

```bash
SMOKE_API_KEY=<prod-key> BASE_URL=https://api.webwaka.com pnpm --filter smoke run smoke:production
```

All 5 suites must pass.

---

## Post-Launch Checklist

- [ ] Delete `/tmp/seed-super-admin.sql` from any machine where it was created
- [ ] Verify the compromised API token from Step 0 is fully revoked
- [ ] Change the staging super admin password
- [ ] Set a production-specific super admin password (different from staging)
- [ ] Document the production Worker URLs in the operator runbook
- [ ] Tag the release: `git tag v1.0.0 && git push origin v1.0.0`
- [ ] Announce launch to stakeholders

---

## Emergency Rollback Plan

If production issues are found:

**Code rollback:**
```bash
git revert -m 1 <merge-sha>
git push origin main
```
CI will auto-redeploy the previous version.

**Database rollback:**
Every migration has a `.rollback.sql` file in `infra/db/migrations/`. Apply the reverse:
```bash
npx wrangler d1 execute webwaka-os-production --env production --remote \
  --config apps/api/wrangler.toml \
  --file infra/db/migrations/NNNN_description.rollback.sql
```

---

## Platform Summary at Launch

| Metric | Value |
|--------|-------|
| Version | 1.0.0 |
| Apps | 9 |
| Packages | 176 |
| Verticals | 143 |
| D1 Migrations | 206 |
| Tests | 347+ |
| Governance Checks | 10/10 |
| Smoke Suites | 5 |
| HITL Levels | 3 (L1 standard, L2 elevated, L3 regulatory 72h) |
| Budget Scopes | 4 (user, team, project, workspace) |
| Sensitive Sectors | 4 (medical, legal, political, pharmaceutical) |
| Geography Seeds | 37 states, 774 LGAs, 6 zones, 8810 wards |

---

*Generated: 2026-04-11 — WebWaka OS v1.0.0 Production Launch*
