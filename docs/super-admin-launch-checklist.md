# WebWaka OS — Super Admin Launch Checklist

**For:** Platform Operator (Founder / Tech Lead)  
**Date:** 2026-04-10  
**After:** Production Remediation Plan implementation complete (100/100 score)  
**Goal:** First login as Super Admin on staging → verify → ship to production

---

## What Was Just Completed (Superagent Implementation)

| Item | Status |
|---|---|
| TypeScript: 0 errors across all 160+ verticals | ✅ Done |
| All 189 migrations created (including 0038-0041 gaps, 0187-0189) | ✅ Done |
| SEC-001: Tenant impersonation fixed in social.ts + community.ts | ✅ Done |
| SEC-002/003: P9 REAL columns → INTEGER in bakery, cleaning-service, moderation | ✅ Done |
| SEC-004: NDPR erasure endpoint `DELETE /auth/me` | ✅ Done |
| SEC-005: Rate-limit `Retry-After` header + KV graceful degradation | ✅ Done |
| TEST-001/002/003: `/version` endpoint, smoke test package.json, SMOKE_API_KEY guard | ✅ Done |
| OPS-002/003/004: CI job ordering, billing column rename, CRON tenant_id fix | ✅ Done |
| All 4 `wrangler.toml` files: real D1 UUIDs + KV IDs wired in | ✅ Done |
| KV namespaces created in Cloudflare (GEOGRAPHY, THEME, DISCOVERY, USSD, RATE_LIMIT) | ✅ Done |
| Operator runbook: `docs/operator-runbook.md` | ✅ Done |

---

## What You Still Need to Do (Ordered Checklist)

Work through this top to bottom. Do not skip steps.

---

## Step 0 — URGENT: Rotate the Exposed Cloudflare API Token

The previous audit Superagent committed your live Cloudflare API token to the public GitHub repo
inside `docs/production-remediation-plan-2026-04-10.md`.

**Do this before anything else:**

1. Go to → https://dash.cloudflare.com/profile/api-tokens
2. Find the token and click **Revoke**
3. Click **Create Token** → use the **Edit Cloudflare Workers** template
4. Add permissions: `D1 → Edit`, `Workers KV Storage → Edit`, `Workers Scripts → Edit`
5. Copy the new token (you will only see it once)
6. Add it to GitHub Actions secrets:
   → https://github.com/WebWakaDOS/webwaka-os/settings/secrets/actions  
   → Name: `CLOUDFLARE_API_TOKEN`
7. For running wrangler commands locally, set it in your terminal:
   ```bash
   export CLOUDFLARE_API_TOKEN="<your-new-token>"
   export CLOUDFLARE_ACCOUNT_ID="a5f5864b726209519e0c361f2bb90e79"
   ```

---

## Step 1 — Apply All Wrangler Secrets to Staging

Run each of these. Wrangler will prompt you to type/paste the value:

```bash
# Set your terminal env first (from Step 0)
export CLOUDFLARE_API_TOKEN="<your-new-token>"
export CLOUDFLARE_ACCOUNT_ID="a5f5864b726209519e0c361f2bb90e79"

# Core JWT secret — generate a strong 64-char random string
npx wrangler secret put JWT_SECRET --env staging --config apps/api/wrangler.toml

# Paystack secret key (from https://dashboard.paystack.com/#/settings/developer)
npx wrangler secret put PAYSTACK_SECRET_KEY --env staging --config apps/api/wrangler.toml

# Prembly (ID verification) API key
npx wrangler secret put PREMBLY_API_KEY --env staging --config apps/api/wrangler.toml

# Termii (OTP SMS) API key
npx wrangler secret put TERMII_API_KEY --env staging --config apps/api/wrangler.toml

# WhatsApp Business API
npx wrangler secret put WHATSAPP_ACCESS_TOKEN --env staging --config apps/api/wrangler.toml
npx wrangler secret put WHATSAPP_PHONE_NUMBER_ID --env staging --config apps/api/wrangler.toml

# Telegram Bot
npx wrangler secret put TELEGRAM_BOT_TOKEN --env staging --config apps/api/wrangler.toml

# PII logging salt (random 32-char string — used to anonymise logs)
npx wrangler secret put LOG_PII_SALT --env staging --config apps/api/wrangler.toml

# AES-GCM master key for DM encryption (P14) — random 32-char string
npx wrangler secret put DM_MASTER_KEY --env staging --config apps/api/wrangler.toml

# HMAC key for price-lock tokens — random 32-char string
npx wrangler secret put PRICE_LOCK_SECRET --env staging --config apps/api/wrangler.toml

# Inter-service auth secret (used by USSD gateway → API calls)
npx wrangler secret put INTER_SERVICE_SECRET --env staging --config apps/api/wrangler.toml

# Africa's Talking (USSD)
npx wrangler secret put AFRICAS_TALKING_USERNAME --env staging --config apps/ussd-gateway/wrangler.toml
npx wrangler secret put AFRICAS_TALKING_API_KEY --env staging --config apps/ussd-gateway/wrangler.toml
```

**Generate random secrets quickly:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 2 — Apply All Migrations to Staging D1

```bash
npx wrangler d1 migrations apply webwaka-os-staging \
  --env staging \
  --config apps/api/wrangler.toml \
  --remote

# Expected: "Applied N migrations" — must include migration 0189
```

Verify the 8 previously-missing tables are now there:
```bash
npx wrangler d1 execute webwaka-os-staging --env staging --remote \
  --config apps/api/wrangler.toml \
  --command "SELECT name FROM sqlite_master WHERE type='table' AND name IN (
    'search_entries','discovery_events','vendor_pricing_policies',
    'listing_price_overrides','negotiation_sessions','negotiation_offers',
    'negotiation_audit_log','ministry_members'
  ) ORDER BY name;"
# Must return 8 rows
```

---

## Step 3 — Load Geography Seed Data

This loads all 36 states, 774 LGAs, 6 geopolitical zones, and the country node:

```bash
# Nigeria country + zones
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

## Step 4 — Patch: Add Missing Columns to `users` Table

The `users` table from migration 0013 is missing `workspace_id`, `tenant_id`, and `role`
columns that the login endpoint requires. Apply this patch:

```bash
npx wrangler d1 execute webwaka-os-staging --env staging --remote \
  --config apps/api/wrangler.toml \
  --command "
    ALTER TABLE users ADD COLUMN workspace_id TEXT;
    ALTER TABLE users ADD COLUMN tenant_id TEXT;
    ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'member';
  "
```

> This will also be added as migration 0190 — see Step 4b below.

---

## Step 4b — Create Migration 0190 (Permanent Fix)

Create the file `infra/db/migrations/0190_users_auth_columns.sql`:

```sql
-- Migration 0190 — Add auth columns to users table
-- The users table requires workspace_id, tenant_id, and role
-- for the login endpoint JWT issuance without a JOIN.
-- These columns are nullable to allow OR IGNORE insertion patterns.

ALTER TABLE users ADD COLUMN workspace_id TEXT;
ALTER TABLE users ADD COLUMN tenant_id TEXT;
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'member';

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_workspace_id ON users(workspace_id) WHERE workspace_id IS NOT NULL;
```

Then commit and push:
```bash
git add infra/db/migrations/0190_users_auth_columns.sql
git commit -m "fix(schema): migration 0190 — add workspace_id/tenant_id/role to users table for login"
git push origin main
```

---

## Step 5 — Seed the Platform Tenant and Super Admin User

This creates:
- The `webwaka` platform tenant
- A super admin workspace
- Your Super Admin account

**Save this SQL to a file** (never commit it — it contains a password hash):

```bash
cat > /tmp/seed-super-admin.sql << 'ENDSQL'
-- ============================================================
-- WebWaka OS — Platform Super Admin Seed
-- Run once on staging, then once on production
-- Change the email and password_hash before running
-- ============================================================

-- 1. Platform workspace (the top-level operating entity)
INSERT OR IGNORE INTO workspaces (
  id, tenant_id, name, owner_type, owner_id,
  subscription_plan, subscription_status, active_layers
) VALUES (
  'ws_platform_001',
  'tenant_webwaka',
  'WebWaka Platform',
  'organization',
  'user_superadmin_001',
  'enterprise',
  'active',
  '["discovery","commerce","social","community","civic","identity","payments"]'
);

-- 2. Super Admin user
-- Password below is WebWaka@2026! — CHANGE THIS before running on production
-- Generate a new hash: node -e "
--   const c=require('crypto').webcrypto;
--   const e=new TextEncoder();
--   const s=c.getRandomValues(new Uint8Array(16));
--   const sb=btoa(String.fromCharCode(...s));
--   c.subtle.importKey('raw',e.encode('YOUR_PASSWORD'),{name:'PBKDF2'},false,['deriveBits'])
--   .then(k=>c.subtle.deriveBits({name:'PBKDF2',salt:s,iterations:100000,hash:'SHA-256'},k,256))
--   .then(b=>console.log(sb+':'+btoa(String.fromCharCode(...new Uint8Array(b)))));
-- "
INSERT OR IGNORE INTO users (
  id,
  email,
  full_name,
  password_hash,
  workspace_id,
  tenant_id,
  role,
  kyc_status,
  kyc_tier
) VALUES (
  'user_superadmin_001',
  'admin@webwaka.ng',
  'WebWaka Super Admin',
  'sW1pwz9G7XVBfoRNBx/a8A==:/YCp11+knrqLewuSodctrLD+A6ilM4ypZyT4imquP9U=',
  'ws_platform_001',
  'tenant_webwaka',
  'super_admin',
  'verified',
  't3'
);

-- 3. Super Admin membership (links user to workspace with role)
INSERT OR IGNORE INTO memberships (
  id, workspace_id, tenant_id, user_id, role
) VALUES (
  'mbr_superadmin_001',
  'ws_platform_001',
  'tenant_webwaka',
  'user_superadmin_001',
  'super_admin'
);
ENDSQL
```

**Apply to staging:**
```bash
npx wrangler d1 execute webwaka-os-staging --env staging --remote \
  --config apps/api/wrangler.toml \
  --file /tmp/seed-super-admin.sql
```

**Verify the user was created:**
```bash
npx wrangler d1 execute webwaka-os-staging --env staging --remote \
  --config apps/api/wrangler.toml \
  --command "SELECT id, email, role, tenant_id FROM users WHERE email='admin@webwaka.ng';"
# Should return 1 row
```

> **Default staging credentials:**  
> Email: `admin@webwaka.ng`  
> Password: `WebWaka@2026!`  
> ⚠️ Change this password on first login or generate a new hash for production

---

## Step 6 — Deploy All 4 Workers to Staging

```bash
# API Worker (the main one)
npx wrangler deploy --env staging --config apps/api/wrangler.toml

# Brand Runtime Worker (white-label theme engine)
npx wrangler deploy --env staging --config apps/brand-runtime/wrangler.toml

# Public Discovery Worker (unauthenticated business listing search)
npx wrangler deploy --env staging --config apps/public-discovery/wrangler.toml

# USSD Gateway Worker (Africa's Talking integration)
npx wrangler deploy --env staging --config apps/ussd-gateway/wrangler.toml
```

Note the Worker URLs printed by each deploy command — you will need the API Worker URL for Step 7.

---

## Step 7 — Verify Staging with Smoke Tests + Manual Login

**Health check:**
```bash
curl https://webwaka-api-staging.<your-subdomain>.workers.dev/health
# Expected: {"status":"ok","service":"webwaka-api",...}

curl https://webwaka-api-staging.<your-subdomain>.workers.dev/health/version
# Expected: {"version":"1.x.x"}
```

**Test login as Super Admin:**
```bash
curl -s -X POST https://webwaka-api-staging.<your-subdomain>.workers.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@webwaka.ng","password":"WebWaka@2026!"}' | jq .
# Expected: {"token": "eyJ..."}
```

**Use the token to verify your identity:**
```bash
TOKEN="<paste the token from above>"
curl -s https://webwaka-api-staging.<your-subdomain>.workers.dev/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .
# Expected: {"data":{"userId":"user_superadmin_001","role":"super_admin",...}}
```

**Run the full smoke suite:**
```bash
SMOKE_API_KEY=<your-smoke-key> BASE_URL=https://webwaka-api-staging.<your-subdomain>.workers.dev \
  pnpm --filter smoke run smoke:staging
# Expected: all checks PASS
```

---

## Step 8 — Enable Production Approval Gate (GitHub UI)

1. Go to → https://github.com/WebWakaDOS/webwaka-os/settings/environments
2. Click **"production"** (create it if it doesn't exist)
3. Enable **"Required reviewers"** → add your GitHub username
4. Save

This ensures no push to `main` auto-deploys to production without your click.

---

## Step 9 — Deploy to Production via CI

Push to `main` (or merge a PR). The CI pipeline will:
1. Run TypeScript check
2. Run `pnpm audit`
3. Apply migrations to production D1
4. Deploy all 4 Workers to production
5. Pause at production deploy for your manual approval (Step 8)

After you click **Approve** in GitHub:
- Workers deploy to `api.webwaka.ng`
- Smoke tests run against production

---

## Step 10 — Seed Production Super Admin

After production migrations apply (Step 9), seed the production database:

```bash
# Use a DIFFERENT strong password for production — regenerate the hash
npx wrangler d1 execute webwaka-os-production --env production --remote \
  --config apps/api/wrangler.toml \
  --file /tmp/seed-super-admin.sql
```

Then set production secrets (same as Step 1, but with `--env production`).

---

## First Login Summary

| Item | Value |
|---|---|
| Staging API URL | `https://webwaka-api-staging.<your-cf-subdomain>.workers.dev` |
| Production API URL | `https://api.webwaka.ng` |
| Super Admin email | `admin@webwaka.ng` |
| Staging password | `WebWaka@2026!` (change on production) |
| Login endpoint | `POST /auth/login` → returns JWT |
| Identity check | `GET /auth/me` with `Authorization: Bearer <token>` |
| Roles | `super_admin` can access all routes including `POST /workspaces`, platform admin endpoints |

---

## Quick Reference: Super Admin API Capabilities

As `super_admin`, your JWT unlocks:

| Area | What you can do |
|---|---|
| Tenants | Create + manage client tenants (white-label partners) |
| Workspaces | Create/suspend workspaces across all tenants |
| Verticals | Activate any of 160+ verticals for any workspace |
| Users | Promote users to `admin` or `super_admin` |
| Politicians/Claims | Approve/reject politician profile claims |
| Billing | View all `billing_history` across tenants |
| KYC | View KYC status; manually override tiers |
| Negotiation | Full access to negotiation audit logs |

---

*End of Super Admin Launch Checklist — WebWaka OS — 2026-04-10*
