# WebWaka OS — Apps and Workers Map

**Date:** 2026-05-03  
**Branch:** `staging`  
**Status:** Authoritative for Phase 0+

---

## Summary

| # | App | Type | Domain | Auth | D1 | KV | R2 | Queue | Status | Priority |
|---|-----|------|--------|------|----|----|----|-------|--------|----------|
| 1 | `apps/api` | CF Worker (Hono) | api-staging.webwaka.com | JWT | ✅ | ✅ x4 | ✅ x2 | Producer | ✅ LIVE | Core |
| 2 | `apps/workspace-app` | CF Pages (React/Vite) | app.webwaka.com | JWT (via API) | via API | IndexedDB | — | — | ✅ LIVE | Core |
| 3 | `apps/brand-runtime` | CF Worker (Hono) | *.webwaka.com | Cookie (portal) | ✅ | — | — | — | ✅ LIVE | Core |
| 4 | `apps/public-discovery` | CF Worker (Hono SSR) | discovery-staging.webwaka.com | None | ✅ | — | — | — | ✅ LIVE | Core (Legacy SSR) |
| 5 | `apps/discovery-spa` | CF Pages (React/Vite) | discovery.webwaka.com | None | via API | — | — | — | ✅ DEPLOYED | Core (New SPA) |
| 6 | `apps/ussd-gateway` | CF Worker | ussd-staging.webwaka.com | TENANT_ID secret | ✅ | — | — | — | ✅ LIVE | Strategic |
| 7 | `apps/notificator` | CF Worker (Queue consumer) | — | Internal | ✅ | — | — | Consumer | ✅ LIVE | Infrastructure |
| 8 | `apps/projections` | CF Worker (CRON) | — | X-Inter-Service | ✅ | — | — | — | ✅ LIVE | Infrastructure |
| 9 | `apps/schedulers` | CF Worker (CRON) | — | Internal | ✅ | — | — | — | ✅ LIVE | Infrastructure |
| 10 | `apps/log-tail` | CF Worker (Tail) | — | Internal | — | — | — | — | ✅ LIVE | Infrastructure |
| 11 | `apps/platform-admin` | Node.js dev shim | localhost:5000 (dev) | None | None | None | None | — | 🔴 DEV ONLY | Admin (needs rebuild) |
| 12 | `apps/admin-dashboard` | CF Worker (shell) | admin.webwaka.com | JWT | via API | — | — | — | ⚠️ SHELL | Admin (needs rebuild) |
| 13 | `apps/partner-admin` | CF Worker (old) | partner.webwaka.com | JWT | via API | — | — | — | ⚠️ OLD | Admin (superseded) |
| 14 | `apps/partner-admin-spa` | CF Pages (React/Vite) | partner.webwaka.com | JWT (via API) | via API | — | — | — | ✅ DEPLOYED | Admin (new SPA) |
| 15 | `apps/marketing-site` | CF Pages (React/Vite) | webwaka.com | None | — | — | — | — | ✅ DEPLOYED | Marketing |
| 16 | `apps/tenant-public` | CF Worker (stub) | — | None | ✅ | — | — | — | ⚠️ LEGACY | Deprecated |

---

## apps/api — Route Groups

| Group | File | Route Prefix | Domain |
|-------|------|-------------|--------|
| Public | `register-public-routes.ts` | `/health`, `/geography/*`, `/discover/*`, `/fx-rates`, `/superagent/capabilities` | Unauthenticated |
| Auth | `register-auth-routes.ts` | `/auth/*`, `/identity/*`, `/contact/*`, `/entities/*`, `/claim/*`, `/sync/*` | JWT/OTP |
| Workspace | `register-workspace-routes.ts` | `/workspaces/*`, `/themes/*`, `/profiles/*`, `/analytics/*`, `/onboarding/*` | JWT |
| Financial | `register-financial-routes.ts` | `/pos/*`, `/payments/*`, `/billing/*`, `/bank-transfer/*`, `/wallet/*`, `/b2b/*`, `/airtime/*` | JWT |
| Verticals | `register-vertical-routes.ts` | `/v/*` (vertical-specific) | JWT |
| Vertical Engine | `register-vertical-engine-routes.ts` | `/ve/*` (engine-driven) | JWT |
| Social | `register-social-routes.ts` | `/social/*`, `/community/*`, `/groups/*`, `/fundraising/*`, `/cases/*`, `/workflows/*`, `/polls/*`, `/appeals/*` | JWT |
| AI | `register-ai-routes.ts` | `/superagent/*` | JWT |
| Admin | `register-admin-routes.ts` | `/admin/*`, `/platform-admin/*` | super_admin |
| Notifications | `register-notification-routes.ts` | `/notifications/*` | JWT |
| Platform Features | `register-platform-feature-routes.ts` | `/templates/*`, `/partners/*`, `/webhooks/*`, `/compliance/*`, `/wakapage/*` | JWT |

---

## Key Bindings Reference (per app)

### apps/api
```
D1:     DB (webwaka-staging / webwaka-production)
KV:     RATE_LIMIT_KV, GEOGRAPHY_CACHE, KV (audit fallback), WALLET_KV
R2:     ASSETS (logos/uploads), DSAR_BUCKET (NDPR exports)
Queue:  NOTIFICATION_QUEUE (producer)
Tail:   log-tail / log-tail-production
```

### apps/brand-runtime
```
D1:     DB
KV:     CART_KV (shopping cart), SESSIONS_KV (portal auth)
R2:     —
```

### apps/notificator
```
D1:     DB
Queue:  NOTIFICATION_QUEUE (consumer)
Secrets: SENDGRID_API_KEY, TERMII_API_KEY
```

### apps/projections
```
D1:     DB
Auth:   X-Inter-Service-Secret
```

---

## Cloudflare CRON Budget

> CF Workers limit: **5 triggers per account**. Currently at capacity.

| Worker | CRON |
|--------|------|
| webwaka-api-staging | Not used (disabled — cron limit) |
| webwaka-api-production | `*/15 * * * *` (negotiation expiry) |
| webwaka-projections-staging | Registered |
| webwaka-schedulers-staging | Data retention + DSAR processor |
| Additional | ⚠️ NO CAPACITY — do not add new crons without removing one |

---

## Production Secrets Required

Per `docs/runbooks/secrets-provisioning-guide.md`:

| Secret | Worker(s) | Type |
|--------|-----------|------|
| JWT_SECRET | api | Auth |
| INTER_SERVICE_SECRET | api, projections | Auth |
| PAYSTACK_SECRET_KEY | api | Payment |
| PREMBLY_API_KEY | api | Identity/KYC |
| TERMII_API_KEY | api, notificator | OTP/SMS |
| WHATSAPP_ACCESS_TOKEN | api | Messaging |
| WHATSAPP_PHONE_NUMBER_ID | api | Messaging |
| TELEGRAM_BOT_TOKEN | ussd-gateway | Bot |
| LOG_PII_SALT | api | Privacy |
| DM_MASTER_KEY | api | Encryption |
| PRICE_LOCK_SECRET | api | Commerce |
| SENDGRID_API_KEY | notificator | Email |
| R2_DSAR_ACCESS_KEY_ID | api | NDPR |
| R2_DSAR_SECRET_ACCESS_KEY | api | NDPR |
