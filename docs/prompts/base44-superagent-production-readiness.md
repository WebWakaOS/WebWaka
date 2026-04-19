# Base44 Superagent — WebWaka OS Production Readiness Prompt

**Date:** 2026-04-11
**Objective:** Bring WebWaka OS to 100% production-ready state — zero CI failures, successful Cloudflare deployment via GitHub Actions, every API endpoint reachable, every front-end rendering, every dashboard functional, every vertical operational.

> **Primary pillar(s):** All three — Pillar 1 (Ops), Pillar 2 (Branding), Pillar 3 (Marketplace) + AI (Cross-cutting). This is a full-platform readiness prompt spanning all pillars and the SuperAgent intelligence layer. See `docs/governance/3in1-platform-architecture.md` for authoritative pillar assignments.

---

## 1. PROJECT OVERVIEW

WebWaka OS is a **multi-tenant, multi-vertical, white-label SaaS platform** for Africa (Nigeria-first). It is built as a **pnpm TypeScript monorepo** deployed entirely on **Cloudflare Workers + D1 + KV**.

### Repository

- **GitHub:** `https://github.com/WebWakaOS/WebWaka`
- **Branch:** `staging` (primary development & CI branch)
- **Runtime:** Cloudflare Workers (Hono framework)
- **Database:** Cloudflare D1 (SQLite edge database)
- **Cache/Sessions:** Cloudflare KV namespaces
- **Language:** TypeScript (strict mode)
- **Package manager:** pnpm 9 with workspaces

### Workspace layout

```
pnpm-workspace.yaml:
  - apps/*
  - packages/*
  - packages/core/*
```

### Scale

| Category | Count |
|----------|-------|
| Apps (Cloudflare Workers) | 8 |
| Core packages | ~30 |
| Vertical business modules | 143 |
| Total packages | 175+ |
| D1 migrations | 19 |
| GitHub Actions workflows | 6 |

---

## 2. APPS — CLOUDFLARE WORKERS

Each app has its own `wrangler.toml` with `[env.staging]` and `[env.production]` sections. Every app must compile, deploy, and respond to its `/health` endpoint.

### 2.1 API Worker (`apps/api`)

- **wrangler.toml:** `apps/api/wrangler.toml`
- **Entry:** `apps/api/src/index.ts` (~610 lines)
- **Worker names:** `webwaka-api-staging` / `webwaka-api-production`
- **Routes:** `api-staging.webwaka.com` / `api.webwaka.com`
- **Bindings:** D1 (`DB`), KV (`RATE_LIMIT_KV`, `CACHE_KV`, `SESSIONS_KV`)
- **Secrets:** `JWT_SECRET`, `INTER_SERVICE_SECRET`
- **CRON:** `*/15 * * * *` (negotiation expiry)
- **Key endpoints:**
  - `GET /health` — liveness probe
  - `POST /auth/login` — issue JWT
  - `POST /auth/verify` — validate JWT
  - `POST /auth/refresh` — refresh JWT
  - `GET /auth/me` — caller AuthContext
  - `GET /geography/places/:id` — geography tree
  - `GET|POST /entities/individuals` — individual entities
  - `GET|POST /entities/organizations` — organization entities
  - `GET /discovery/search` — full-text + geography search
  - `POST /claim/intent` — claim workflow
  - `POST /workspaces/:id/activate` — workspace activation
  - `POST /payments/verify` — Paystack payment verification
  - `POST /identity/verify-bvn|nin|cac|frsc` — KYC identity verification
  - `PUT /contact/channels` — contact channel management
  - `POST /sync/apply` — offline queue replay
  - `POST /pos/terminals` — POS terminal registration
  - `POST /pos/float/credit|debit|reverse` — POS float ledger
  - `/api/v1/:slug/*` — all 143 vertical CRUD routes

### 2.2 Admin Dashboard (`apps/admin-dashboard`)

- **Entry:** `apps/admin-dashboard/src/index.ts`
- **Endpoints:** `GET /health`, `GET /layout`, `GET /billing`
- **Bindings:** D1 (`DB`), Secret (`JWT_SECRET`)

### 2.3 Brand Runtime (`apps/brand-runtime`)

- **wrangler.toml:** `apps/brand-runtime/wrangler.toml`
- **Worker names:** `webwaka-brand-runtime-staging` / `webwaka-brand-runtime-production`
- **Bindings:** D1 (`DB`), KV (`THEME_CACHE`)
- **Secrets:** `JWT_SECRET`, `LOG_PII_SALT`, `INTER_SERVICE_SECRET`
- **Endpoints:**
  - `GET /health` — liveness probe
  - `GET /` — tenant-branded public home
  - `GET /portal/login` — branded login page
  - `POST /portal/login` — auth submission

### 2.4 Public Discovery (`apps/public-discovery`)

- **wrangler.toml:** `apps/public-discovery/wrangler.toml`
- **Worker names:** `webwaka-public-discovery-staging` / `webwaka-public-discovery-production`
- **Bindings:** D1 (`DB`), KV (`DISCOVERY_CACHE`)
- **Secrets:** `LOG_PII_SALT`

### 2.5 USSD Gateway (`apps/ussd-gateway`)

- **wrangler.toml:** `apps/ussd-gateway/wrangler.toml`
- **Worker names:** `webwaka-ussd-gateway-staging` / `webwaka-ussd-gateway-production`
- **Routes:** `api-staging.webwaka.com/ussd` / `api.webwaka.com/ussd`
- **Bindings:** D1 (`DB`), KV (`RATE_LIMIT_KV`, `USSD_SESSION_KV`)
- **Secrets:** `AFRICAS_TALKING_USERNAME`, `AFRICAS_TALKING_API_KEY`, `INTER_SERVICE_SECRET`, `JWT_SECRET`, `LOG_PII_SALT`

### 2.6 Projections (`apps/projections`)

- **Entry:** `apps/projections/src/index.ts`
- **Endpoints:** `GET /health`, `POST /rebuild/search`, `POST /rebuild/analytics`, `GET /events/:aggregate/:id`

### 2.7 Tenant Public (`apps/tenant-public`)

- **Entry:** `apps/tenant-public/src/index.ts`
- **Endpoints:** `GET /health`, `GET /`, `GET /profiles/:id`

### 2.8 Platform Admin (`apps/platform-admin`)

- **Entry:** `apps/platform-admin/server.js` (Node.js dev/admin server, port 5000)

---

## 3. CORE PACKAGES (~30)

These are shared libraries consumed by all apps and verticals:

| Package | Path | Purpose |
|---------|------|---------|
| `@webwaka/auth` | `packages/auth` | JWT issuance/verification (HMAC-SHA256 Web Crypto) |
| `@webwaka/auth-tenancy` | `packages/auth-tenancy` | Multi-tenant auth context |
| `@webwaka/claims` | `packages/claims` | Claim workflow FSM |
| `@webwaka/community` | `packages/community` | Community features |
| `@webwaka/contact` | `packages/contact` | Contact channels + OTP |
| `@webwaka/design-system` | `packages/design-system` | UI component library |
| `@webwaka/entities` | `packages/entities` | Individual/Organization entities |
| `@webwaka/entitlements` | `packages/entitlements` | Subscription-gated feature checks |
| `@webwaka/events` | `packages/events` | Event sourcing + projections |
| `@webwaka/frontend` | `packages/frontend` | Tenant manifest + admin layout |
| `@webwaka/geography` | `packages/core/geography` | Nigerian geography tree (774 LGAs, 8809 wards) |
| `@webwaka/identity` | `packages/identity` | BVN/NIN/CAC/FRSC verification |
| `@webwaka/negotiation` | `packages/negotiation` | Price negotiation engine |
| `@webwaka/offerings` | `packages/offerings` | Service/product offerings |
| `@webwaka/offline-sync` | `packages/offline-sync` | Offline-first queue + conflict resolution |
| `@webwaka/otp` | `packages/otp` | One-time password generation/verification |
| `@webwaka/payments` | `packages/payments` | Paystack integration + subscription sync |
| `@webwaka/pos` | `packages/pos` | POS terminal + float ledger |
| `@webwaka/profiles` | `packages/profiles` | Profile management |
| `@webwaka/relationships` | `packages/relationships` | Entity relationship graph |
| `@webwaka/search-indexing` | `packages/search-indexing` | Full-text search index |
| `@webwaka/shared-config` | `packages/shared-config` | Shared ESLint/TSConfig |
| `@webwaka/social` | `packages/social` | Social features |
| `@webwaka/superagent` | `packages/superagent` | AI agent abstraction |
| `@webwaka/types` | `packages/types` | Shared TypeScript types |
| `@webwaka/verticals` | `packages/verticals` | Vertical registry + loader |
| `@webwaka/ai` | `packages/ai-abstraction` | AI provider abstraction layer |
| `@webwaka/ai-adapters` | `packages/ai-adapters` | Concrete AI provider adapters |
| `@webwaka/politics` | `packages/politics` | Political entity taxonomy |

---

## 4. VERTICAL BUSINESS MODULES (143)

Every vertical follows the same pattern: `packages/verticals-{slug}/src/index.ts` exports `registerXxxVertical()` with FSM transitions, guards, and a repository class.

**Complete list of 143 verticals:**

```
abattoir, accounting-firm, advertising-agency, agro-input, airport-shuttle,
airtime-reseller, artisanal-mining, auto-mechanic, bakery, beauty-salon,
book-club, bookshop, borehole-driller, building-materials, bureau-de-change,
campaign-office, cargo-truck, car-wash, cassava-miller, catering, church,
cleaning-company, cleaning-service, clearing-agent, clinic, cocoa-exporter,
cold-room, community-hall, community-health, constituency-office, construction,
container-depot, cooperative, courier, creator, creche, dental-clinic,
dispatch-rider, driving-school, elderly-care, electrical-fittings,
electronics-repair, event-hall, event-planner, events-centre, ferry,
fish-market, florist, food-processing, food-vendor, fuel-station, funeral-home,
furniture-maker, gas-distributor, generator-dealer, generator-repair,
government-agency, govt-school, gym-fitness, hair-salon, handyman, haulage,
hire-purchase, hotel, internet-cafe, iron-steel, it-support, land-surveyor,
laundry-service, laundry, law-firm, logistics-delivery, market-association,
market, ministry-mission, mobile-money-agent, mosque, motivational-speaker,
motorcycle-accessories, motor-park, music-studio, newspaper-dist, ngo,
nursery-school, nurtw, oil-gas-services, okada-keke, optician, orphanage,
paints-distributor, palm-oil, petrol-station, pharmacy-chain, phone-repair-shop,
photography-studio, plumbing-supplies, podcast-studio, political-party,
politician, polling-unit, pos-business, pr-firm, printing-press, print-shop,
private-school, professional-association, professional, property-developer,
real-estate-agency, recording-label, rehab-centre, restaurant-chain, restaurant,
rideshare, road-transport-union, school, security-company, shoemaker,
solar-installer, sole-trader, spare-parts, spa, sports-academy, sports-club,
tailor, talent-agency, tax-consultant, tech-hub, training-institute, transit,
travel-agent, tyre-shop, used-car-dealer, vegetable-garden, vet-clinic, ward-rep,
waste-management, water-treatment, water-vendor, wedding-planner,
welding-fabrication, womens-association, youth-organization
```

Each vertical must:
- Export a `registerXxxVertical()` function returning `{ slug, transitions, guards }`
- Have a repository class with `create`, `findById`, `findByWorkspace`, `update`, `transition` methods
- Enforce **T3** (tenant_id isolation on every query)
- Enforce **P9/T4** (integer kobo for monetary fields)
- Enforce **P13** (no PII in sensitive verticals: orphanage, polling-unit)
- Have 15+ passing vitest tests

---

## 5. PLATFORM INVARIANTS (NON-NEGOTIABLE)

These are hardcoded rules that must be verified across the entire codebase:

| ID | Rule | Verification |
|----|------|-------------|
| **P1** | Build Once Use Infinitely — no duplication of shared capabilities in verticals | Grep for duplicated logic across verticals |
| **P2** | Nigeria First — UX, payments, compliance for Nigerian market | Paystack integration, NDPR consent, NGN kobo |
| **P4** | Mobile First — 360px viewport first | CSS/layout review |
| **P5** | PWA First — service worker, manifest | Check manifest.json and SW registration |
| **P6** | Offline First — writes queued offline, synced on reconnect | `@webwaka/offline-sync` package |
| **P7** | Vendor Neutral AI — provider abstraction layer | `@webwaka/ai` package, no direct SDK calls |
| **P8** | BYOK Capable — tenants supply their own AI keys | Key storage in tenant config |
| **T1** | Cloudflare-First Runtime — no Node.js in production | Only Workers in deploy pipeline |
| **T2** | TypeScript-First — no untyped JS in packages/apps | `pnpm typecheck` passes |
| **T3** | Tenant Isolation — every query includes `tenant_id` | Audit all SQL queries in repositories |
| **T4** | Monetary Integrity — integer kobo, no floating point money | Grep for float arithmetic on monetary fields |
| **T5** | Subscription-Gated Features — entitlement checks | `@webwaka/entitlements` usage |
| **P9** | Integer amounts — all amounts are non-negative integers | Guard functions in every vertical |
| **P10** | NDPR Consent — consent records before PII processing | `consent_records` table |
| **P13** | No PII — orphanage, polling-unit use opaque references | Verify opaque UUIDs, no names/addresses |

---

## 6. CI/CD PIPELINE (GitHub Actions)

### 6.1 CI Workflow (`.github/workflows/ci.yml`)

Triggered on push/PR to `staging`. Must all pass:

```
Jobs:
  1. typecheck    → pnpm typecheck (tsc --noEmit across all packages)
  2. test         → pnpm test (vitest run across all packages)
  3. lint         → pnpm lint (eslint across all packages)
  4. audit        → pnpm audit --audit-level=high (security audit)
```

### 6.2 Deploy Staging (`.github/workflows/deploy-staging.yml`)

Triggered on push to `staging`. Pipeline:

```
CI Checks (reuses ci.yml)
  └→ D1 Migrations (staging)
       - Copies infra/db/migrations/*.sql → apps/api/migrations/
       - Runs: wrangler d1 migrations apply webwaka-staging --env staging
       └→ Deploy API (staging)
            - Runs: wrangler deploy --env staging --config apps/api/wrangler.toml
            - Pushes secrets: JWT_SECRET, INTER_SERVICE_SECRET
            └→ Smoke Test (staging)
                 - Runs tests/smoke (if exists) against STAGING_BASE_URL
```

### 6.3 Deploy Production (`.github/workflows/deploy-production.yml`)

Same pipeline but with `--frozen-lockfile`, production environment, and production D1/KV IDs.

### 6.4 Other Workflows

- **Governance Check** (`.github/workflows/governance-check.yml`) — verifies governance docs exist
- **Check Core Version** (`.github/workflows/check-core-version.yml`) — ensures `@webwaka/core` version is pinned correctly
- **Refresh Lockfile** (`.github/workflows/refresh-lockfile.yml`) — manual trigger to regenerate `pnpm-lock.yaml`

---

## 7. GITHUB SECRETS REQUIRED

The following secrets must be configured in GitHub → Settings → Secrets for the CI/CD pipeline to work:

### Repository Secrets (required for deployment)

| Secret | Purpose |
|--------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Workers/D1/KV permissions |
| `JWT_SECRET` | HMAC-SHA256 signing key for JWTs |
| `INTER_SERVICE_SECRET` | Secret for inter-worker authentication |
| `SMOKE_API_KEY` | API key for smoke test authentication |

### Repository Variables (required for smoke tests)

| Variable | Purpose |
|----------|---------|
| `STAGING_BASE_URL` | e.g. `https://api-staging.webwaka.com` |
| `PRODUCTION_BASE_URL` | e.g. `https://api.webwaka.com` |
| `SMOKE_TENANT_ID` | Tenant ID used for smoke testing |

### Worker-Level Secrets (pushed via wrangler secret put)

| Worker | Secrets |
|--------|---------|
| API | `JWT_SECRET`, `INTER_SERVICE_SECRET` |
| Brand Runtime | `JWT_SECRET`, `LOG_PII_SALT`, `INTER_SERVICE_SECRET` |
| Public Discovery | `LOG_PII_SALT` |
| USSD Gateway | `AFRICAS_TALKING_USERNAME`, `AFRICAS_TALKING_API_KEY`, `INTER_SERVICE_SECRET`, `JWT_SECRET`, `LOG_PII_SALT` |

---

## 8. D1 MIGRATIONS

Located in `infra/db/migrations/`. Currently 19 migration files:

```
0001_init_places.sql              — Geography: places (states, LGAs, wards)
0002_init_entities.sql            — Individuals + Organizations
0003_init_workspaces_memberships.sql — Workspaces + membership
0004_init_subscriptions.sql       — Subscription plans
0005_init_profiles.sql            — Public profiles
0006_init_political.sql           — Political taxonomy
0007a_political_assignments_constraint.sql
0007_init_relationships.sql       — Entity relationship graph
0008_init_search_index.sql        — Full-text search
0009_init_discovery_events.sql    — View/click analytics
0010_claim_workflow.sql           — Claim FSM state
0011_payments.sql                 — Payment records
0012_event_log.sql                — Event sourcing log
0013_init_users.sql               — User accounts
0014_kyc_fields.sql               — KYC verification fields
0015_otp_log.sql                  — OTP audit log
0016_kyc_records.sql              — KYC record storage
0017_consent_records.sql          — NDPR consent tracking
0018_contact_channels.sql         — Contact channel registry
0019_missing_indexes.sql          — Performance indexes
```

**CRITICAL:** Each vertical also needs its own table. Verify that vertical-specific migration files exist or are generated dynamically. If any vertical table is missing from D1, the API routes for that vertical will fail at runtime.

---

## 9. YOUR TASKS — PRODUCTION READINESS CHECKLIST

### Phase 1: Code Quality — Make CI Green

1. **TypeScript compilation (0 errors):**
   - Run `pnpm typecheck` — must complete with zero errors.
   - `apps/api/tsconfig.json` uses `baseUrl: "../.."` and `paths` for all 175+ packages.
   - If any new packages were added, verify they have paths entries in the API tsconfig.
   - Ensure `exactOptionalPropertyTypes: false` is set in `apps/api/tsconfig.json`.

2. **Lint (0 errors):**
   - Run `pnpm lint` — must complete with zero errors across all packages.
   - Known patterns already fixed: `async` methods in test mocks have `// eslint-disable-next-line @typescript-eslint/require-await`.
   - `VERTICAL_SLUG` assignments do NOT use `as const` (it's unnecessary and flagged by ESLint).
   - Test files using `db as any` have `// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any` on the preceding line.

3. **Tests (all passing):**
   - Run `pnpm test` — every package's vitest suite must pass.
   - Bakery uses `quantityInStockX1000` (×1000 scaled integer), not `quantityInStock`.
   - Ferry mock DB uses table-aware `_table` tagging with `extractTable()` helper.
   - Each vertical must have ≥15 tests covering: T3 isolation, P9 integer amounts, FSM transitions, guards.

4. **Security audit:**
   - Run `pnpm audit --audit-level=high` — must pass or all high/critical vulnerabilities must be resolved.
   - GitHub Dependabot reports 1 moderate vulnerability — review and fix.

### Phase 2: Build & Bundle

5. **Build all packages:**
   - Run `pnpm build` — every package must produce its output.
   - Ensure all `wrangler.toml` files reference correct entry points.

6. **Verify wrangler compatibility:**
   - All workers use `compatibility_date = "2024-12-05"` (or later).
   - All workers have `compatibility_flags = ["nodejs_compat"]`.
   - Verify each worker can be locally validated: `npx wrangler dev --env staging --config apps/XXX/wrangler.toml`.

### Phase 3: Database Readiness

7. **D1 migrations:**
   - Verify all 19 migrations in `infra/db/migrations/` are syntactically valid SQL.
   - Verify they apply cleanly in order to both staging and production D1 databases.
   - **CRITICAL:** Create migration files for ALL 143 vertical tables if they don't exist yet. Each vertical repository issues SQL like `INSERT INTO {vertical_slug}_profiles ...`, `INSERT INTO {vertical_slug}_catalogue ...`, `INSERT INTO {vertical_slug}_orders ...` — the tables must exist in D1.

8. **Seed data:**
   - Verify `infra/db/seed/` contains necessary seed data for geography (774 LGAs, 8809 wards).
   - Run seed scripts if staging D1 is empty.

### Phase 4: Deployment Pipeline

9. **GitHub Actions CI must pass:**
   - Push to `staging` branch and verify all 4 CI jobs go green: typecheck, test, lint, audit.
   - Fix any failures immediately.

10. **GitHub Secrets configuration:**
    - Verify ALL secrets listed in Section 7 are configured in GitHub repository settings.
    - Verify all Cloudflare resources (D1 databases, KV namespaces) exist with the IDs in wrangler.toml files.

11. **Staging deployment:**
    - Verify `deploy-staging.yml` completes successfully:
      - D1 migrations applied
      - API worker deployed to `webwaka-api-staging`
      - Secrets pushed to the worker
    - After deploy, verify `https://api-staging.webwaka.com/health` returns `{ ok: true }`.

12. **Deploy ALL workers (not just API):**
    - The current `deploy-staging.yml` only deploys the API worker. You must **extend it** to also deploy:
      - `apps/brand-runtime` → `webwaka-brand-runtime-staging`
      - `apps/public-discovery` → `webwaka-public-discovery-staging`
      - `apps/ussd-gateway` → `webwaka-ussd-gateway-staging`
      - `apps/admin-dashboard` → admin dashboard worker (add wrangler.toml if missing)
      - `apps/projections` → projections worker (add wrangler.toml if missing)
      - `apps/tenant-public` → tenant public worker (add wrangler.toml if missing)
    - Each worker needs its own deploy job with correct `--env staging` and `--config` flags.
    - Each worker needs its secrets pushed after deployment.

13. **Production deployment:**
    - Same as staging but using `deploy-production.yml`, `--env production`, and `--frozen-lockfile`.
    - Verify production D1 database IDs match wrangler.toml.

### Phase 5: Smoke Tests & Verification

14. **Health checks (all workers):**
    After deployment, verify ALL workers respond:
    ```
    GET https://api-staging.webwaka.com/health         → { ok: true }
    GET https://brand-runtime-staging.../health        → { ok: true }
    GET https://public-discovery-staging.../health     → { ok: true }
    GET https://api-staging.webwaka.com/ussd            → (Africa's Talking endpoint)
    ```

15. **API endpoint smoke tests:**
    Test critical flows end-to-end against staging:
    ```
    POST /auth/login         → returns JWT
    GET  /auth/me            → returns auth context with JWT
    GET  /geography/places/NG → returns Nigeria root node
    POST /entities/individuals → creates individual (with auth)
    GET  /discovery/search?q=lagos → returns search results
    POST /claim/intent       → initiates claim workflow
    ```

16. **Vertical API smoke tests:**
    For EACH of the 143 verticals, verify the CRUD routes work:
    ```
    POST /api/v1/{slug}/profiles     → creates profile
    GET  /api/v1/{slug}/profiles/:id → reads profile
    PATCH /api/v1/{slug}/profiles/:id → updates profile
    POST /api/v1/{slug}/transition   → advances FSM state
    ```
    At minimum, test 10 representative verticals spanning different categories:
    - **Commerce:** bakery, restaurant, bookshop
    - **Transport:** ferry, motor-park, rideshare
    - **Health:** clinic, pharmacy-chain, dental-clinic
    - **Community:** church, mosque, ngo
    - **Government:** politician, polling-unit, ward-rep
    - **Professional:** law-firm, accounting-firm, tax-consultant
    - **Agriculture:** agro-input, cocoa-exporter, palm-oil

17. **Front-end verification:**
    - Admin Dashboard: `GET /layout` returns valid admin layout model
    - Tenant Public: `GET /` returns rendered tenant discovery page
    - Brand Runtime: `GET /` returns tenant-branded home page

18. **Implement smoke test suite:**
    If `tests/smoke/` doesn't exist yet, create it:
    - `tests/smoke/package.json` with vitest
    - `tests/smoke/health.test.ts` — hit all worker `/health` endpoints
    - `tests/smoke/auth.test.ts` — login flow
    - `tests/smoke/verticals.test.ts` — CRUD on representative verticals
    - Wire into `deploy-staging.yml` smoke test step

### Phase 6: Production Hardening

19. **Rate limiting:**
    - Verify KV-based rate limiting is active on auth endpoints.
    - Verify `RATE_LIMIT_KV` binding is present in all relevant wrangler.toml files.

20. **Error handling:**
    - Every route must return structured JSON errors, never raw stack traces.
    - 404 handler on every app: `app.notFound((c) => c.text('Not found', 404))`.
    - Global error handler: `app.onError((err, c) => c.json({ error: err.message }, 500))`.

21. **CORS configuration:**
    - Verify CORS headers allow the correct origins for staging and production.
    - `hono/cors` middleware must be configured with explicit allowed origins.

22. **Security headers:**
    - `hono/secure-headers` middleware on every app.
    - Verify CSP, X-Frame-Options, X-Content-Type-Options headers.

23. **Logging:**
    - No PII in logs (P13). Verify `LOG_PII_SALT` is used for hashing identifiers in logs.
    - Log levels respect `LOG_LEVEL` environment variable.

24. **NDPR compliance:**
    - Verify consent_records table is populated before PII processing.
    - Verify orphanage and polling-unit verticals use opaque references (no names/addresses stored).

---

## 10. CLOUDFLARE RESOURCE VERIFICATION

Before deployment, verify these Cloudflare resources exist:

### D1 Databases

| Name | Environment | Database ID (from wrangler.toml) |
|------|-------------|----------------------------------|
| webwaka-staging | staging | `7c264f00-c36d-4014-b2fe-c43e136e86f6` |
| webwaka-production | production | `72fa5ec8-52c2-4f41-b486-957d7b00c76f` |
| webwaka-os-staging | staging (brand/discovery/ussd) | `cfa62668-bbd0-4cf2-996a-53da76bab948` |
| webwaka-os-production | production (brand/discovery/ussd) | `de1d0935-31ed-4a33-a0fd-0122d7a4fe43` |

### KV Namespaces (Staging)

| Binding | Worker | KV ID |
|---------|--------|-------|
| RATE_LIMIT_KV | API | `2a81cd5b8d094911a20e1e0f6a190506` |
| CACHE_KV | API | `4732f3a682964607bae2170f350e4fb4` |
| SESSIONS_KV | API | `58bec07ac48448388b372c3dd8bc1bb9` |
| THEME_CACHE | Brand Runtime | `bd24f563762d4ebb889f09cc711a6796` |
| DISCOVERY_CACHE | Public Discovery | `ed8e7381f64e43ca97834bc7ace0f711` |
| RATE_LIMIT_KV | USSD | `608eacac3eb941a68c716b14e84b4d10` |
| USSD_SESSION_KV | USSD | `2d2b2b32beb94df989a7e3520cc3962a` |

### KV Namespaces (Production)

| Binding | Worker | KV ID |
|---------|--------|-------|
| RATE_LIMIT_KV | API | `8cbf31285b0c43e1a8f44ee0af9fcdf3` |
| CACHE_KV | API | `5bd5695d963247d0b105a936827e0a89` |
| SESSIONS_KV | API | `86d90c013d3d4529ac08aad6d283a6bf` |
| THEME_CACHE | Brand Runtime | `323d03bf6f5f4caaa28c80830f4af892` |
| DISCOVERY_CACHE | Public Discovery | `dffe6346937f4fc78fbb3ea521f89d02` |
| RATE_LIMIT_KV | USSD | `af260e847d1e400e94cf13f6ae3214eb` |
| USSD_SESSION_KV | USSD | `c3f90b3b6b634983b1778964b0a92ed0` |

### DNS Routes

| Pattern | Worker |
|---------|--------|
| `api-staging.webwaka.com` | webwaka-api-staging |
| `api.webwaka.com` | webwaka-api-production |
| `api-staging.webwaka.com/ussd` | webwaka-ussd-gateway-staging |
| `api.webwaka.com/ussd` | webwaka-ussd-gateway-production |

---

## 11. DEFINITION OF DONE

The project is 100% production-ready when ALL of the following are true:

- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 errors
- [ ] `pnpm test` — all tests pass (every vertical has ≥15 tests)
- [ ] `pnpm audit --audit-level=high` — 0 high/critical vulnerabilities
- [ ] `pnpm build` — all packages build successfully
- [ ] GitHub Actions CI pipeline (ci.yml) — all 4 jobs green on `staging`
- [ ] D1 migrations applied to staging — all 19+ migrations (including vertical tables)
- [ ] API Worker deployed to staging — `/health` returns `{ ok: true }`
- [ ] Brand Runtime deployed to staging — `/health` returns `{ ok: true }`
- [ ] Public Discovery deployed to staging — `/health` returns `{ ok: true }`
- [ ] USSD Gateway deployed to staging — responds on route
- [ ] Admin Dashboard deployed to staging — `/health` returns `{ ok: true }`
- [ ] Projections deployed to staging — `/health` returns `{ ok: true }`
- [ ] Tenant Public deployed to staging — `/health` returns `{ ok: true }`
- [ ] Auth flow works end-to-end (login → JWT → /auth/me)
- [ ] Geography API works (places tree, ancestry, children)
- [ ] Entity CRUD works (individuals, organizations)
- [ ] Discovery search works (full-text + geography)
- [ ] Claim workflow works (intent → advance → verify)
- [ ] Vertical CRUD works for all 143 verticals
- [ ] Vertical FSM transitions work for all 143 verticals
- [ ] POS float ledger works (credit, debit, balance, reverse)
- [ ] Offline sync replay works (/sync/apply)
- [ ] Payment verification works (Paystack)
- [ ] Smoke test suite exists and passes in CI
- [ ] No PII in logs or sensitive vertical data
- [ ] Rate limiting active on auth endpoints
- [ ] Structured JSON error responses on all routes
- [ ] CORS and security headers configured
- [ ] All GitHub secrets and variables configured
- [ ] All Cloudflare resources (D1, KV, DNS) verified
- [ ] Production deployment pipeline tested and green
- [ ] Zero console errors, zero unhandled promise rejections

**This is a zero-tolerance deployment. Every checkbox must be green before declaring production-ready.**

---

## 12. KEY FILES REFERENCE

```
Root:
  pnpm-workspace.yaml          — workspace definition
  package.json                  — root scripts (typecheck, test, lint, build)
  tsconfig.json                 — root TypeScript config (if exists)

Apps:
  apps/api/wrangler.toml        — API worker Cloudflare config
  apps/api/src/index.ts         — API entry point (~610 lines)
  apps/api/tsconfig.json        — API TypeScript config (paths for all 175+ packages)
  apps/api/package.json         — API dependencies
  apps/brand-runtime/wrangler.toml
  apps/public-discovery/wrangler.toml
  apps/ussd-gateway/wrangler.toml
  apps/admin-dashboard/src/index.ts
  apps/tenant-public/src/index.ts
  apps/projections/src/index.ts

CI/CD:
  .github/workflows/ci.yml                — lint + typecheck + test + audit
  .github/workflows/deploy-staging.yml     — staging deployment
  .github/workflows/deploy-production.yml  — production deployment
  .github/workflows/governance-check.yml   — governance doc verification
  .github/workflows/check-core-version.yml — @webwaka/core pin check
  .github/workflows/refresh-lockfile.yml   — lockfile regeneration

Database:
  infra/db/migrations/          — 19 D1 migration files
  infra/db/seed/                — seed data scripts

Governance:
  docs/governance/platform-invariants.md
  docs/governance/security-baseline.md
  docs/governance/release-governance.md
  docs/governance/agent-execution-rules.md
  docs/governance/milestone-tracker.md
```

---

*End of prompt. Execute every phase sequentially. Do not skip any step. Report status after each phase completion.*
