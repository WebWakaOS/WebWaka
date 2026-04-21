# Cloudflare Environments

**Status:** ✅ CONFIGURED — 2026-04-07
**Configured by:** Base44 Super Agent

---

## Environment Overview

| Environment | Purpose | Branch | Status |
|---|---|---|---|
| staging | Pre-production testing | `staging` | ✅ CREATED |
| production | Live platform | `main` | ✅ CREATED |

---

## Cloudflare Resources

### D1 Databases

| Name | Environment | Database ID | Status |
|---|---|---|---|
| webwaka-os-staging | staging | `cfa62668-bbd0-4cf2-996a-53da76bab948` | ✅ Created |
| webwaka-os-production | production | `de1d0935-31ed-4a33-a0fd-0122d7a4fe43` | ✅ Created |

> IDs stored as GitHub Actions secrets: `CLOUDFLARE_D1_STAGING_ID`, `CLOUDFLARE_D1_PRODUCTION_ID`

### KV Namespaces

| Name | Environment | Namespace ID | Purpose | Status |
|---|---|---|---|---|
| WEBWAKA_KV_STAGING | staging | `dd0fc527f4714275af996e77335b8aa8` | Tenant config, sessions | ✅ Created |
| WEBWAKA_KV_PRODUCTION | production | `9f7573b954d743d79ba7b37480f9af85` | Tenant config, sessions | ✅ Created |
| WEBWAKA_RATE_LIMIT_KV_STAGING | staging | `608eacac3eb941a68c716b14e84b4d10` | Rate limiting | ✅ Created |
| WEBWAKA_RATE_LIMIT_KV_PRODUCTION | production | `af260e847d1e400e94cf13f6ae3214eb` | Rate limiting | ✅ Created |
| webwaka-wallet-kv-staging | staging | `9ccb594b305f4e5a83b8c9fe39ad33cd` | Wallet feature flags, KYC limits (WALLET_KV) | ✅ Created 2026-04-21 |
| webwaka-wallet-kv-production | production | `e28f499febf24482b81e0b5a1b1de65e` | Wallet feature flags, KYC limits (WALLET_KV) | ✅ Created 2026-04-21 |
| webwaka-audit-kv-staging | staging | `1be2915ea0c74f33bbad76f5973474f4` | Audit log fallback (KV) | ✅ Created 2026-04-21 |
| webwaka-audit-kv-production | production | `a43e090a1b344e0aa4dbc311089d3d86` | Audit log fallback (KV) | ✅ Created 2026-04-21 |

> IDs also set as GitHub environment variables: `KV_NAMESPACE_ID`, `RATE_LIMIT_KV_ID`

### R2 Buckets

| Name | Purpose | Status |
|---|---|---|
| webwaka-os-assets-staging | Tenant assets, documents (staging) | ✅ Created |
| webwaka-os-assets-production | Tenant assets, documents (production) | ✅ Created |

### Workers Projects

| App | Worker Name (staging) | Worker Name (production) | Status |
|---|---|---|---|
| API | `webwaka-api-staging` | `webwaka-api-production` | ✅ DEPLOYED 2026-04-21 — commit c6a884896 |
| Notificator | `webwaka-notificator-staging` | `webwaka-notificator-production` | ✅ Previously deployed |
| Admin Dashboard | `webwaka-admin-dashboard-staging` | `webwaka-admin-dashboard-production` | ✅ Previously deployed |
| Partner Admin | `webwaka-partner-admin-staging` | `webwaka-partner-admin` | ✅ Previously deployed |
| Public Discovery | `webwaka-public-discovery-staging` | `webwaka-public-discovery-production` | ✅ Previously deployed |
| Tenant Public | `webwaka-tenant-public-staging` | `webwaka-tenant-public-production` | ✅ Previously deployed |
| Brand Runtime | `webwaka-brand-runtime-staging` | `webwaka-brand-runtime-production` | ✅ Previously deployed |
| USSD Gateway | `webwaka-ussd-gateway-staging` | — | ✅ Previously deployed |
| Projections | `webwaka-projections-staging` | — | ✅ Previously deployed |

**API — 2026-04-21 Deployment Details:**
- Staging version: uploaded successfully, all bindings active (RATE_LIMIT_KV, GEOGRAPHY_CACHE, KV, WALLET_KV)
- Production version ID: `1af582b0-0d36-42fb-8d5e-5f8c7739fb81`, all bindings + cron `*/15 * * * *` + custom domain
- D1 migrations: 0279–0287 applied to both staging and production (9 wallet migrations: hl_wallets, hl_ledger, hl_funding_requests, hl_spend_events, hl_mla_earnings, hl_withdrawal_requests, hl_transfer_requests, seed templates, seed webhook events)
- D1 migrations: 0288–0300 applied to both staging and production 2026-04-21 (notification engine template library + rules — 13 migrations: rules for 22 existing families, 9 new domains × 1-3 channels = 147 templates total, 84 unique families, 95 enabled rules, 0 orphan rules)
- Health: staging `api-staging.webwaka.com` → 200, production `api.webwaka.com` → 200

**Cron trigger note (account plan limit = 5 triggers):**
- Slots used: notificator-staging (2) + notificator-production (2) + api-production (1) = 5/5
- Staging API cron omitted (staging expiry runs on HTTP-triggered reload — acceptable for non-prod)
- To add staging API cron: upgrade account plan or remove notificator-staging `0 2 * * *` trigger

---

## GitHub Actions Secrets (all set ✅)

| Secret Name | Status |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | ✅ Set |
| `CLOUDFLARE_API_TOKEN` | ✅ Set |
| `CLOUDFLARE_D1_STAGING_ID` | ✅ Set |
| `CLOUDFLARE_D1_PRODUCTION_ID` | ✅ Set |
| `JWT_SECRET_STAGING` | ✅ Set |
| `JWT_SECRET_PRODUCTION` | ✅ Set |
| `INTER_SERVICE_SECRET` | ✅ Set |

## GitHub Environment Variables (all set ✅)

| Variable | Environment | Value |
|---|---|---|
| `ENVIRONMENT` | staging | `staging` |
| `ENVIRONMENT` | production | `production` |
| `LOG_LEVEL` | staging | `debug` |
| `LOG_LEVEL` | production | `warn` |
| `KV_NAMESPACE_ID` | staging | `dd0fc527f4714275af996e77335b8aa8` |
| `KV_NAMESPACE_ID` | production | `9f7573b954d743d79ba7b37480f9af85` |
| `RATE_LIMIT_KV_ID` | staging | `608eacac3eb941a68c716b14e84b4d10` |
| `RATE_LIMIT_KV_ID` | production | `af260e847d1e400e94cf13f6ae3214eb` |

---

## DNS / Custom Domains

| Domain | Environment | Status |
|---|---|---|
| `api-staging.webwaka.com` | staging | NOT CONFIGURED — awaiting domain confirmation |
| `api.webwaka.com` | production | NOT CONFIGURED — awaiting domain confirmation |
| `admin-staging.webwaka.com` | staging | NOT CONFIGURED |
| `admin.webwaka.com` | production | NOT CONFIGURED |

To configure: provide Base44 with the DNS zone details, or confirm webwaka.com is managed in this Cloudflare account.
