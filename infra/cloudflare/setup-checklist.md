# Cloudflare Setup Checklist

**Owner:** Base44 Super Agent
**Status:** BLOCKED — awaiting Cloudflare credentials from Founder

---

## Pre-requisites

- [ ] Founder provides Cloudflare Account ID
- [ ] Founder provides Cloudflare API Token (Workers:Edit + D1:Edit + KV:Edit + R2:Edit)
- [ ] Founder confirms domain(s) for the platform

---

## Step 1: Create D1 Databases

```bash
# Staging
wrangler d1 create webwaka-os-staging
# → Copy the database_id output and store as GitHub secret CLOUDFLARE_D1_STAGING_ID

# Production
wrangler d1 create webwaka-os-production
# → Copy the database_id output and store as GitHub secret CLOUDFLARE_D1_PRODUCTION_ID
```

- [ ] webwaka-os-staging created
- [ ] webwaka-os-production created
- [ ] D1 IDs stored as GitHub Actions secrets

---

## Step 2: Create KV Namespaces

```bash
# Staging
wrangler kv namespace create WEBWAKA_KV --env staging

# Production
wrangler kv namespace create WEBWAKA_KV --env production
```

- [ ] WEBWAKA_KV_STAGING created — ID recorded in environments.md
- [ ] WEBWAKA_KV_PRODUCTION created — ID recorded in environments.md

---

## Step 3: Create R2 Buckets

```bash
wrangler r2 bucket create webwaka-os-assets-staging
wrangler r2 bucket create webwaka-os-assets-production
```

- [ ] webwaka-os-assets-staging created
- [ ] webwaka-os-assets-production created

---

## Step 4: Store GitHub Actions Secrets

Go to: https://github.com/WebWakaDOS/webwaka-os/settings/secrets/actions

Add each secret:
- [ ] CLOUDFLARE_ACCOUNT_ID
- [ ] CLOUDFLARE_API_TOKEN
- [ ] CLOUDFLARE_D1_STAGING_ID
- [ ] CLOUDFLARE_D1_PRODUCTION_ID
- [ ] JWT_SECRET_STAGING (generate: openssl rand -hex 32)
- [ ] JWT_SECRET_PRODUCTION (generate: openssl rand -hex 32)
- [ ] INTER_SERVICE_SECRET (generate: openssl rand -hex 32)

---

## Step 5: Configure GitHub Environment Variables

Go to: https://github.com/WebWakaDOS/webwaka-os/settings/environments

**staging environment:**
- [ ] Add variable: STAGING_BASE_URL = https://api-staging.webwaka.com (or workers.dev URL)

**production environment:**
- [ ] Add variable: PRODUCTION_BASE_URL = https://api.webwaka.com

---

## Step 6: Configure Custom Domains (after Workers deployed)

```bash
# After first deploy, add custom domains via Cloudflare dashboard or:
wrangler domains add api-staging.webwaka.com --env staging
wrangler domains add api.webwaka.com --env production
```

- [ ] DNS zone verified in Cloudflare
- [ ] Staging custom domain configured
- [ ] Production custom domain configured

---

## Step 7: Update environments.md

After all steps complete:
- [ ] Update infra/cloudflare/environments.md with all real IDs and URLs
- [ ] Update docs/governance/milestone-tracker.md: Cloudflare setup → DONE
- [ ] Close GitHub issue #1 (Cloudflare environment setup)
