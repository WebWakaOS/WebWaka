# GitHub Actions Secrets Inventory

**Owner:** Base44 Super Agent
**Last updated:** 2026-04-07

This document records all GitHub Actions secrets and environment variables used in CI/CD.
It contains NAMES ONLY — never actual values.

---

## Repository Secrets (all environments)

| Secret Name | Purpose | Status |
|---|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account for wrangler deploy | NOT SET |
| `CLOUDFLARE_API_TOKEN` | API token for Workers + D1 + KV operations | NOT SET |

---

## Staging Environment Secrets

| Secret Name | Purpose | Status |
|---|---|---|
| `CLOUDFLARE_D1_STAGING_ID` | D1 database ID for staging | NOT SET |
| `JWT_SECRET_STAGING` | JWT signing secret for staging | NOT SET |
| `INTER_SERVICE_SECRET` | Shared secret for inter-service auth (staging) | NOT SET |

---

## Production Environment Secrets

| Secret Name | Purpose | Status |
|---|---|---|
| `CLOUDFLARE_D1_PRODUCTION_ID` | D1 database ID for production | NOT SET |
| `JWT_SECRET_PRODUCTION` | JWT signing secret for production | NOT SET |
| `INTER_SERVICE_SECRET` | Shared secret for inter-service auth (production) | NOT SET |

---

## Environment Variables (non-secret)

| Variable | Environment | Value | Status |
|---|---|---|---|
| `STAGING_BASE_URL` | staging | https://api-staging.webwaka.com | NOT SET |
| `PRODUCTION_BASE_URL` | production | https://api.webwaka.com | NOT SET |

---

## Rotation Policy

All secrets must be rotated every 90 days or immediately on suspected exposure.
Rotation steps:
1. Generate new value
2. Update in GitHub Actions secrets
3. Update in Cloudflare Worker secrets via `wrangler secret put`
4. Verify deployment still works
5. Update last-rotated date in this doc (dates in comments — not values)
