# Runbook: Secrets Provisioning Guide

**Release Gate:** G3 (Security — Secrets)
**Audience:** Founder (Cloudflare dashboard access)
**Last reviewed:** 2026-05-02

---

## Overview

This guide tells you **exactly which secrets to set, where to set them, and how**.
Every secret in Section A must be provisioned before the production deploy workflow
(`deploy-production.yml`) will proceed — `verify-deploy-secrets.mjs` will block the
pipeline if any are missing.

---

## Section A — Cloudflare Worker Secrets (11 required)

**Dashboard path:**
Workers & Pages → `webwaka-api-production` → Settings → Variables → Add secret

| # | Secret Name | What it is | How to generate / where to get it |
|---|-------------|------------|-----------------------------------|
| 1 | `JWT_SECRET` | 256-bit random string for signing user JWTs | `openssl rand -hex 32` |
| 2 | `INTER_SERVICE_SECRET` | Service-to-service auth shared secret | `openssl rand -hex 32` |
| 3 | `PAYSTACK_SECRET_KEY` | Paystack live secret key | Paystack dashboard → Settings → API Keys → Secret Key |
| 4 | `PREMBLY_API_KEY` | Prembly KYC/identity API key | Prembly dashboard → API Keys |
| 5 | `TERMII_API_KEY` | Termii SMS / OTP API key | Termii dashboard → API Keys |
| 6 | `AI_PROVIDER_API_KEY` | OpenAI (or compatible) API key | OpenAI platform → API Keys |
| 7 | `WHATSAPP_ACCESS_TOKEN` | Meta WhatsApp Business API token | Meta Business Manager → WhatsApp → Settings |
| 8 | `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID | Meta Business Manager → WhatsApp → Phone Numbers |
| 9 | `LOG_PII_SALT` | HMAC salt for hashing PII in logs | `openssl rand -hex 32` |
| 10 | `DM_MASTER_KEY` | Master key for E2EE direct messages | `openssl rand -hex 32` |
| 11 | `PRICE_LOCK_SECRET` | HMAC key for price-lock signatures | `openssl rand -hex 32` |

### Set via wrangler CLI (recommended — avoids copy-paste in browser)

```bash
# Repeat for each of the 11 secrets (wrangler prompts securely)
wrangler secret put JWT_SECRET                --name webwaka-api-production
wrangler secret put INTER_SERVICE_SECRET      --name webwaka-api-production
wrangler secret put PAYSTACK_SECRET_KEY       --name webwaka-api-production
wrangler secret put PREMBLY_API_KEY           --name webwaka-api-production
wrangler secret put TERMII_API_KEY            --name webwaka-api-production
wrangler secret put AI_PROVIDER_API_KEY       --name webwaka-api-production
wrangler secret put WHATSAPP_ACCESS_TOKEN     --name webwaka-api-production
wrangler secret put WHATSAPP_PHONE_NUMBER_ID  --name webwaka-api-production
wrangler secret put LOG_PII_SALT              --name webwaka-api-production
wrangler secret put DM_MASTER_KEY             --name webwaka-api-production
wrangler secret put PRICE_LOCK_SECRET         --name webwaka-api-production
```

### Verify all 11 are present

```bash
wrangler secret list --name webwaka-api-production
# Expected: 11 rows (names only — values are never shown)
```

---

## Section B — GitHub Actions Secrets (13 required)

**Dashboard path:**
GitHub repo → Settings → Secrets and variables → Actions → New repository secret

| # | Secret Name | What it is |
|---|-------------|-----------|
| 1 | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID (found in CF dashboard URL) |
| 2 | `CLOUDFLARE_API_TOKEN` | CF API token with Workers Deploy + D1 Edit + KV Edit |
| 3 | `JWT_SECRET` | Same value as Worker secret #1 |
| 4 | `INTER_SERVICE_SECRET` | Same value as Worker secret #2 |
| 5 | `PAYSTACK_SECRET_KEY` | Same value as Worker secret #3 |
| 6 | `PREMBLY_API_KEY` | Same value as Worker secret #4 |
| 7 | `TERMII_API_KEY` | Same value as Worker secret #5 |
| 8 | `AI_PROVIDER_API_KEY` | Same value as Worker secret #6 |
| 9 | `SMOKE_API_KEY` | Bearer token (super_admin role) for smoke tests |
| 10 | `AUTH_TOKEN_PRODUCTION` | Bearer token (owner role) for k6 load tests |
| 11 | `D1_DATABASE_ID_PRODUCTION` | Production D1 database ID (from CF dashboard) |
| 12 | `SLACK_PILOT_OPS_WEBHOOK` | Slack incoming webhook URL for #pilot-ops channel |
| 13 | `KV_NAMESPACE_ID` | KV namespace ID for feature flags (from CF dashboard) |

### Create the Cloudflare API Token

1. Cloudflare dashboard → My Profile → API Tokens → Create Token
2. Use **"Edit Cloudflare Workers"** template as the base
3. Add extra permissions:
   - D1 → Edit
   - Workers KV Storage → Edit
   - Account Settings → Read
4. Copy the token immediately (shown once) → paste as `CLOUDFLARE_API_TOKEN`

---

## Section C — GitHub Actions Variables (Non-Secret)

**Dashboard path:**
GitHub repo → Settings → Secrets and variables → Actions → Variables tab

| Variable | Value |
|----------|-------|
| `PRODUCTION_BASE_URL` | `https://api.webwaka.com` |
| `STAGING_BASE_URL` | `https://api-staging.webwaka.com` |
| `SMOKE_TENANT_ID` | `tenant_smoke_test` |
| `LOAD_TEST_WORKSPACE_ID` | `ws_load_test_01` |

---

## Section D — Verification Checklist

After provisioning, run:

```bash
# 1. Verify Cloudflare secrets
wrangler secret list --name webwaka-api-production
# Expected: 11 secrets listed

# 2. Run the pre-deploy secrets validator
CLOUDFLARE_ACCOUNT_ID=<id> \
CLOUDFLARE_API_TOKEN=<token> \
DEPLOY_ENV=production \
node scripts/verify-deploy-secrets.mjs
# Expected: "✅ All required secrets present. Deploy may proceed."

# 3. Verify GitHub secrets (via gh CLI)
gh secret list --repo WebWakaOS/WebWaka
# Expected: all 13 secrets listed
```

---

## Sign-Off

When all checks pass, update `docs/release/release-gate.md`:

```
### G3 — Secrets
- [x] G3-1  Worker secrets provisioned (11/11) — [Name] [Date]
- [x] G3-2  GitHub Actions secrets provisioned (13/13) — [Name] [Date]
- [x] G3-3  verify-deploy-secrets.mjs exits 0 — [Name] [Date]
```

---

> **Security policy:** Never commit secret values to the repository.
> Never share secrets over Slack, email, or chat in plaintext.
> Use only the Cloudflare and GitHub UIs or CLI for provisioning.
> Rotate immediately if a secret is ever exposed.

---

*Runbook owner: Founder + Engineering Lead*
*Prerequisite for: G3 gate sign-off and `deploy-production.yml` success*
