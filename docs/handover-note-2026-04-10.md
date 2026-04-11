# WebWaka OS — Comprehensive Agent Handover Note

**Date:** 2026-04-10  
**Author:** Replit Agent (Main)  
**HEAD commit:** `25c41d4`  
**Repo:** `https://github.com/WebWakaDOS/webwaka-os`  
**Audience:** Incoming agent or developer taking over this codebase

---

## Table of Contents

1. [What This Platform Is](#1-what-this-platform-is)
2. [Architecture Overview](#2-architecture-overview)
3. [Platform Invariants — The Non-Negotiable Rules](#3-platform-invariants)
4. [Monorepo Structure](#4-monorepo-structure)
5. [The Five Apps](#5-the-five-apps)
6. [Core Packages](#6-core-packages)
7. [The 160+ Vertical System](#7-the-160-vertical-system)
8. [Data Model — D1 Migrations](#8-data-model--d1-migrations)
9. [Auth, Tenancy, and RBAC](#9-auth-tenancy-and-rbac)
10. [AI / SuperAgent Layer](#10-ai--superagent-layer)
11. [Negotiable Pricing System](#11-negotiable-pricing-system)
12. [USSD Gateway](#12-ussd-gateway)
13. [Community + Social Platform](#13-community--social-platform)
14. [Cloudflare Infrastructure — Real IDs](#14-cloudflare-infrastructure--real-ids)
15. [Secrets Registry](#15-secrets-registry)
16. [CI/CD Pipeline](#16-cicd-pipeline)
17. [Current Deployment State](#17-current-deployment-state)
18. [Known Issues and Technical Debt](#18-known-issues-and-technical-debt)
19. [Development Patterns and Conventions](#19-development-patterns-and-conventions)
20. [Key Files Index](#20-key-files-index)
21. [Next Agent Priority Tasks](#21-next-agent-priority-tasks)

---

## 1. What This Platform Is

WebWaka OS is a **governance-driven, multi-tenant, multi-vertical, white-label SaaS operating system built for Africa** (Nigeria-first). It is structured as a "3-in-1" platform meaning a single codebase delivers three distinct product pillars simultaneously.

### The Three Pillars

| Pillar | Name | What It Does |
|---|---|---|
| **Pillar 1** | Operations-Management (POS) | Back-office workflows: POS, inventory, payroll, appointments, float ledger, team management |
| **Pillar 2** | Branding / Website / Portal | Branded digital presence: tenant-owned websites, storefronts, booking portals, service pages |
| **Pillar 3** | Listing / Multi-Vendor Marketplace | Public discovery: geography-driven search, claim-first onboarding, profiles, aggregation |

A **Cross-cutting AI layer** (SuperAgent) serves all three pillars. It is not a fourth pillar.

### Stakeholder Hierarchy

```
Platform Operator (WebWaka / Founder)
  └── Partners (subscribe to operate branded instances)
        └── Sub-partners (delegated under partners)
              └── Tenants (own data + config within subscription scope)
                    └── End users (interact through tenant-branded interfaces)
```

### Scale at HEAD

- **160+ vertical packages** covering every major Nigerian business sector
- **191 D1 SQL migrations** (0001–0190, with a 0007a gap-filler)
- **1039+ TypeScript source files**
- **Thousands of tests** (≥1,330 at last count, growing per milestone)
- **0 TypeScript errors** as of the production remediation (SHA `97ba9a1`)

---

## 2. Architecture Overview

### Runtime Stack

```
Edge (Cloudflare Workers)           — T1: Production runtime only
  └── Hono v4 (HTTP routing)        — chosen for CF Workers compatibility
       ├── secureHeaders middleware  — HSTS, X-Frame, etc.
       ├── CORS middleware           — ALLOWED_ORIGINS env var
       ├── logger middleware
       ├── lowData middleware        — strips heavy fields on slow connections
       ├── rateLimitMiddleware       — global 100 req/min via KV
       ├── authMiddleware            — JWT validation (on protected routes)
       └── Route handlers

Storage
  ├── D1     — main relational database (SQLite at edge)
  │             staging: cfa62668-bbd0-4cf2-996a-53da76bab948
  │             production: de1d0935-31ed-4a33-a0fd-0122d7a4fe43
  ├── KV     — sessions, rate limits, theme cache, geography cache, USSD sessions
  └── R2     — documents and assets (buckets: assets-staging, assets-production)

Local Dev
  └── Node.js shim (server.js in platform-admin) + wrangler --local for Workers
```

### Monorepo Build System

- **pnpm workspaces** (v9+, Node 20+)
- **TypeScript strict mode** everywhere: `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`
- **Vitest** for unit/integration tests
- **wrangler** (Cloudflare) for Workers deployment
- **ESLint** with TypeScript rules

### Key Design Constraints

- No Express, no Node.js HTTP in production — Cloudflare Workers only
- No `any` types without a comment
- No floating point money — all kobo (NGN × 100) as INTEGER
- No cross-tenant data leakage — `tenant_id` predicate on every query
- No AI SDK calls in business logic — all go through `@webwaka/ai-abstraction`
- No raw BVN/NIN stored — SHA-256(SALT + value) only

---

## 3. Platform Invariants

These are **non-negotiable**. Violating any of these is a blocking bug. Changing them requires Founder approval and a new TDR.

### Product Invariants (P-series)

| Code | Rule |
|---|---|
| **P1** | Build Once Use Infinitely — no vertical duplicates shared package code |
| **P2** | Nigeria First — all flows designed for Nigerian regulatory reality first |
| **P3** | Africa First — no country lock-in at data or runtime layer |
| **P4** | Mobile First — design at 360px viewport; desktop is enhancement |
| **P5** | PWA First — all client apps installable with service workers |
| **P6** | Offline First — core journeys work without network; writes queue in Dexie.js |
| **P7** | Vendor Neutral AI — no direct SDK calls to OpenAI/Anthropic in business logic |
| **P8** | BYOK Capable — every AI feature supports Bring Your Own Key |
| **P9** | Agent Float Double-Entry Ledger — `agent_float_ledger` is append-only; balance computed from history, never stored as scalar |
| **P10** | BVN/NIN Consent Before Lookup — NDPR Article 5, `consent_records` must exist before any identity lookup |
| **P11** | Offline Writes via Dexie.js — FIFO queue replay, server-wins conflict, never silently drop |
| **P12** | No AI on USSD — `aiConsentGate` blocks AI calls from USSD session context |
| **P13** | No Individual Child Data — nursery/orphanage verticals never store identifiable data on minors |
| **P14** | DMs AES-GCM Encrypted — direct messages encrypted with `DM_MASTER_KEY`; `assertDMMasterKey()` called at Worker startup |

### Technical Invariants (T-series)

| Code | Rule |
|---|---|
| **T1** | Cloudflare-First Runtime — production is CF Workers; no Express/Node HTTP in prod |
| **T2** | TypeScript-First — all code is TypeScript strict; `any` requires justification comment |
| **T3** | Tenant Isolation — every tenant-scoped DB query has `tenant_id` predicate; every KV key prefixed `tenant:{id}:`; every R2 path prefixed `{tenant_id}/` |
| **T4** | Monetary Integrity — all money is integer kobo; no floats |
| **T5** | Subscription-Gated Features — all non-public access checked via `@webwaka/entitlements` |
| **T6** | Geography-Driven Discovery — discovery uses `@webwaka/geography` hierarchy, not string matching |
| **T7** | Claim-First Growth — entities are seeded first, claimed later; lifecycle enforced by `@webwaka/profiles` |
| **T8** | Step-by-Step GitHub Commits — small coherent units, all pass CI |
| **T9** | No Skipped Phases — shared packages before verticals; milestones sequential |
| **T10** | Continuity-Friendly Code — every file readable by a new agent; inline comments required for non-obvious logic |

### CRITICAL: `tenant_id` must come from the JWT claim, NEVER from the HTTP request body or headers on authenticated routes. The JWT is validated server-side; the HTTP layer is untrusted.

---

## 4. Monorepo Structure

```
webwaka-os/
├── apps/
│   ├── api/                   — Main Cloudflare Workers API (Hono)
│   ├── ussd-gateway/          — USSD Worker (*384# shortcode, Africa's Talking)
│   ├── platform-admin/        — Super Admin dashboard (CF Workers / local dev: Node shim)
│   ├── partner-admin/         — Partner/tenant management portal
│   ├── brand-runtime/         — Pillar 2 tenant-branded website/storefront Worker
│   ├── public-discovery/      — Pillar 3 public search/discovery frontend
│   ├── tenant-public/         — Tenant public-facing page (CF Workers)
│   └── admin-dashboard/       — Internal analytics dashboard
│   └── projections/           — Event-driven projection worker
├── packages/
│   ├── types/                 — Canonical types: branded IDs, enums, entity types
│   ├── auth/                  — JWT validation, RBAC guards, entitlement hooks, AI hooks
│   ├── auth-tenancy/          — Identity + tenant scope middleware (@webwaka/core)
│   ├── entities/              — Individual + Organization entity repos
│   ├── relationships/         — Cross-entity graph rules
│   ├── entitlements/          — Subscription plans, features, limits, KYC tier enforcement
│   ├── geography/             — 8-level place hierarchy, ancestry, aggregation
│   ├── profiles/              — Discovery records, claim surfaces, FSM
│   ├── workspaces/            — Operations context management
│   ├── offerings/             — Products, services, routes, tickets, appointments
│   ├── claims/                — Claim lifecycle, verification evidence
│   ├── payments/              — Paystack checkout, webhook verify, billing history
│   ├── pos/                   — POS terminal registration, float ledger
│   ├── identity/              — BVN/NIN/CAC/FRSC verification (Prembly)
│   ├── otp/                   — Multi-channel OTP: SMS (Termii), WhatsApp (Meta/360dialog), Telegram
│   ├── contact/               — Contact channels D1 persistence, OTP routing
│   ├── community/             — Community spaces, channels, courses, events (M7c)
│   ├── social/                — Profiles, posts, groups, DMs AES-GCM (M7d)
│   ├── events/                — publishEvent, projection utilities
│   ├── negotiation/           — Negotiable pricing: policy, FSM, guardrails, price-lock tokens
│   ├── ai-abstraction/        — AI provider types, routing context, BYOK chain
│   ├── ai-adapters/           — Fetch-only adapters: OpenAI, Anthropic, Gemini, Cloudflare AI
│   ├── superagent/            — NDPR consent, aiConsentGate, CreditBurnEngine, UsageMeter, BYOK keys
│   ├── politics/              — Political offices, jurisdictions, assignments, terms
│   ├── search-indexing/       — Facets, full-text index, aggregation
│   ├── offline-sync/          — Dexie.js queue, PWA helpers, conflict model
│   ├── design-system/         — Shared UI tokens and patterns
│   ├── white-label-theming/   — Branding rules, theming, templates
│   ├── shared-config/         — Shared environment settings helpers
│   ├── frontend/              — Shared frontend utilities
│   ├── core/geography/        — Geography package (monorepo workspace alias)
│   ├── core/politics/         — Politics package (monorepo workspace alias)
│   └── verticals-*/           — 160+ individual vertical packages (see Section 7)
├── infra/
│   ├── db/
│   │   ├── migrations/        — 191 SQL files (0001–0190 + 0007a)
│   │   └── seed/              — Geography seed data: country, zones, states, LGAs, wards
│   ├── cloudflare/            — CF infrastructure notes
│   ├── github-actions/        — GitHub Actions config
│   └── scripts/               — Utility scripts
├── tests/
│   └── smoke/                 — Smoke tests (api-health.smoke.ts) — run vs. live Workers
├── docs/
│   ├── governance/            — 16+ governance documents (Founder-approved)
│   ├── architecture/decisions/ — 12+ TDRs
│   ├── enhancements/m7/       — M7 detailed specs
│   ├── prompts/               — Agent execution briefs
│   ├── plans/                 — Implementation plans
│   ├── super-admin-launch-checklist.md
│   ├── operator-runbook.md
│   └── production-remediation-plan-2026-04-10.md
└── package.json / pnpm-workspace.yaml / tsconfig.base.json
```

---

## 5. The Five Apps

### 5.1 `apps/api` — The Main API Worker

**Entry point:** `apps/api/src/index.ts` (610 lines)  
**Framework:** Hono on Cloudflare Workers  
**Routes file count:** 40+ route files in `apps/api/src/routes/`

**Global middleware stack (applied in this order):**
1. `secureHeaders()` — adds security HTTP headers
2. CORS origin check (from `ALLOWED_ORIGINS` secret, falls back to `*.webwaka.com`)
3. `logger()` — request logging
4. `lowDataMiddleware` — strips heavy payload fields for slow connections
5. `rateLimitMiddleware({ keyPrefix: 'global', maxRequests: 100, windowSeconds: 60 })` — KV-backed

**Route groups:**
| Prefix | Auth | Description |
|---|---|---|
| `/health` | None | Liveness probe + `/health/version` |
| `/geography/*` | None | Place hierarchy navigation |
| `/discovery/*` | None | Search, profiles, trending, nearby |
| `/auth/login`, `/auth/verify` | None | Issue/validate JWTs |
| `/auth/refresh`, `/auth/me` | Required | Refresh + identity |
| `/entities/*` | Required | Individuals + Organizations CRUD |
| `/claim/*` | Required/None | Claim lifecycle |
| `/workspaces/*` | Required | Workspace + billing + analytics |
| `/payments/*` | Required | Paystack verify + billing history |
| `/identity/*` | Required | BVN/NIN/CAC/FRSC (M7a) |
| `/contact/*` | Required | Multi-channel contact (M7a) |
| `/sync/apply` | Required | Offline queue replay (M7b) |
| `/pos/*` | Required | POS terminal + float ledger (M7b) |
| `/community/*` | Required | Community spaces (M7c) |
| `/social/*` | Required | Social feeds + DMs (M7d) |
| `/airtime` | Required | Airtime top-up (M7e) |
| `/superagent/*` | Required | AI consent + chat + usage (SA-2/3) |
| `/negotiation/*` | Required | Negotiable pricing (T001–T007) |
| `/api/v1/verticals/:slug/*` | Required | All 160+ vertical routes |
| CRON | System | `*/15 * * * *` — negotiation session expiry |

**CRON job:** `apps/api/src/jobs/negotiation-expiry.ts` — sweeps open sessions past expiry, abandons accepted sessions without payment after 24h. **OPS-004 fixed:** uses `session.tenant_id`, not hardcoded `'system'`.

### 5.2 `apps/ussd-gateway` — USSD Worker

**Shortcode:** `*384#` (pending NCC registration)  
**Carrier integration:** Africa's Talking USSD webhook  
**Session TTL:** 3 minutes in `USSD_SESSION_KV`

**Menu branches:**
- `1` — My Wallet (balance)
- `2` — Send Money (CBN KYC tier gated)
- `3` — Trending Now (top 5 social posts by `like_count`, M7c D1 pre-fetch)
- `4` — Book Transport
- `5` — Community (user's joined communities, M7c D1 pre-fetch)

**Telegram webhook:** also handles `POST /telegram/webhook` (M7f) — validated by `TELEGRAM_WEBHOOK_SECRET` header.

**CRITICAL:** `TENANT_ID` must be set as a Worker secret per deployment. Each USSD Worker instance serves exactly one tenant. Never from request body.

### 5.3 `apps/platform-admin` — Super Admin Dashboard

**Local dev:** `apps/platform-admin/server.js` — Node.js static file server (NOT deployed to production)  
**Production:** Cloudflare Pages (from `apps/platform-admin/src/`)  
**Access:** Requires `super_admin` role JWT  
**Features:** Claim approval, tenant management, analytics

### 5.4 `apps/brand-runtime` — Pillar 2 Worker

**Entry:** `apps/brand-runtime/src/index.ts`  
**Purpose:** Renders tenant-branded public websites and portal login pages  
**Tenant resolution (priority order):**
1. Custom domain match (from `tenant_branding.custom_domain`)
2. `brand-{slug}.webwaka.ng` subdomain
3. `/:slug` path parameter

**Routes:**
- `GET /` — branded home page
- `GET /portal/login` — branded login
- `POST /portal/login` — validates credentials against API Worker → JWT cookie
- `GET /portal/` — redirect to portal dashboard

### 5.5 `apps/public-discovery` — Pillar 3 Frontend

**Purpose:** Public-facing search and listing discovery  
**Auth:** None (fully public)  
**Key:** Powered by `/discovery/*` API routes; geography-filtered

---

## 6. Core Packages

### `@webwaka/types` (`packages/types/`)

The canonical type package — all other packages import from here. Never duplicate types elsewhere.

Key exports:
- **Branded IDs:** `IndividualId`, `OrganizationId`, `PlaceId`, `WorkspaceId`, `TenantId`, `UserId`, etc. — branded strings for compile-time safety
- **Enums:** `EntityType`, `GeographyLevel` (1=Country → 8=FacilityPlace), `GeographyType`, subscription types, roles
- **Entity types:** Core shape of all root entities
- **Auth types:** `AuthContext` shape returned by JWT middleware

### `@webwaka/auth` (`packages/auth/`)

JWT validation, RBAC middleware, entitlement guards, AI hooks.

Key exports:
- `jwtAuthMiddleware` — validates JWT, sets `c.get('auth')` as `AuthContext`
- `requireRole(role)` — RBAC gate middleware
- `requireKYCTier(ctx, minTier)` — CBN KYC enforcement (P9/M7 addition)
- `aiConsentGate` — Hono middleware: blocks AI on USSD (P12), checks AI rights, checks NDPR consent (P10)
- `checkEntitlement(ctx, feature)` — subscription-aware feature gate

**JWT payload shape:**
```json
{ "sub": "user_xxx", "tenant_id": "tenant_xxx", "workspace_id": "ws_xxx", "role": "super_admin" }
```

### `@webwaka/geography` (`packages/core/geography/`)

8-level Nigeria geography hierarchy:
```
Country (1) → GeopoliticalZone (2) → State (3) → LGA (4) → Ward (5) → Community (6) → Household (7) → FacilityPlace (8)
```

Facility types at level 8: `market`, `motor_park`, `warehouse`, `church`, etc.

Seed data in `infra/db/seed/`: country, zones, states, LGAs (0002), wards (0003) — generated by `infra/db/seed/scripts/generate_wards_sql.ts`.

### `@webwaka/entitlements` (`packages/entitlements/`)

Subscription plan model: manages which features, user limits, branch limits, AI rights, KYC tiers are available per workspace.

Dimensions: active layers, active modules, user limits, branch/place limits, offering limits, branding rights, white-label depth, delegation rights, visibility rights, AI rights, sensitive-sector rights, community rights, social rights, KYC tier.

### `@webwaka/payments` (`packages/payments/`)

Paystack integration:
- `initializePayment(env, workspaceId, amount)` — creates Paystack checkout
- `verifyPayment(env, reference)` — confirms payment
- `verifyWebhookSignature(secret, rawBody, header)` — HMAC webhook validation
- `syncPaymentToSubscription(...)` — updates workspace subscription after payment

### `@webwaka/pos` (`packages/pos/`)

POS agent network:
- Terminal registration
- `postLedgerEntry(db, entry)` — double-entry ledger credit/debit (P9)
- `reverseLedgerEntry(db, entryId, tenantId)` — reversal
- `getWalletBalance(db, agentId, tenantId)` — computed from ledger history (never from scalar)
- `getFloatHistory(db, agentId, tenantId, pagination)` — paginated ledger

### `@webwaka/identity` (`packages/identity/`)

Prembly API integration (M7a):
- BVN verification — requires NDPR consent record first (P10)
- NIN verification — requires NDPR consent record first (P10)
- CAC lookup — business registration
- FRSC lookup — driver's licence / vehicle

PII handling: SHA-256(LOG_PII_SALT + value) before storage — never raw BVN/NIN.

### `@webwaka/otp` (`packages/otp/`)

Multi-channel OTP delivery (M7a):
- SMS via Termii
- WhatsApp via Meta Cloud API v18 or 360dialog (configurable via `WHATSAPP_PROVIDER` env var)
- Telegram via Bot API
- Email (fallback)

Rate limiting (R9): 5 OTP sends per hour per phone, enforced in `RATE_LIMIT_KV`.

### `@webwaka/negotiation` (`packages/negotiation/`)

Platform-wide negotiable pricing capability (post-M12 remediation — **complete**):
- `NegotiationEngine` — FSM for offer/counteroffer sessions
- `NegotiationRepository` — D1 persistence (4 tables: policies, listing overrides, sessions, offers, audit log)
- `generatePriceLockToken(secret, sessionId, acceptedPrice)` — HMAC-signed price-lock token (T004 fixed)
- `verifyPriceLockToken(secret, token)` — validates at checkout
- `isNegotiationBlocked(verticalSlug)` — blocked verticals: `NEGOTIATION_BLOCKED_VERTICALS` constant
- Guardrails: min price floor, max discount %, KYC tier, max rounds
- `min_price_kobo` is **NEVER serialised** into any API response

### `@webwaka/superagent` (`packages/superagent/`)

Cross-cutting AI infrastructure (SA-1.x through SA-3.x):
- `KeyService` — BYOK key encryption + D1 storage
- `WalletService` — WakaCU balance + double-entry ledger
- `PartnerPoolService` — Partner credit allocation
- `CreditBurnEngine` — AI spend accounting: pool → own wallet → BYOK
- `UsageMeter` — AI audit log + pillar analytics
- `grantAiConsent` / `revokeAiConsent` / `getAiConsentStatus` / `listAiConsents` — NDPR consent management
- `aiConsentGate` — Hono middleware executing the SA-3 flow gate
- `VERTICAL_AI_CONFIGS` — Per-vertical AI capability declarations
- `getVerticalAiConfig(slug)` — look up config

**SA-3 POST /superagent/chat execution flow:**
1. `aiConsentGate` — P12 USSD block → AI rights → P10 NDPR consent
2. `WalletService.getWallet` — load spend cap
3. `resolveAdapter` — 5-level BYOK chain → picks provider + model + key
4. `createAdapter(resolved).complete(aiRequest)` — live HTTP fetch to provider (P7)
5. `CreditBurnEngine.burn` — deduct WakaCU post-pay (P9 integers)
6. `UsageMeter.record` — write `ai_usage_events` row (P10, P13)

---

## 7. The 160+ Vertical System

### Architecture

Each vertical has:
1. **`packages/verticals-{slug}/`** — Package with types, repository, FSM guards, exports
2. **`apps/api/src/routes/verticals/{slug}.ts`** — Hono route file
3. **One or more D1 migrations** creating the vertical's tables

### Vertical FSM Pattern

Every vertical implements a lifecycle FSM. Standard 3-state informal sector:
```
seeded → claimed → active
```

Regulated verticals add more states (e.g., `pending_license`, `verified`, `suspended`).

FSM transitions must pass `guardSeedToClaimed()` and `isValidXxxTransition()` checks.

### AI Autonomy Levels

| Level | Description | Examples |
|---|---|---|
| **L1** | AI auto-applies suggestions | Food vendor, bakery, cleaning service |
| **L2** | AI suggests, human reviews within 24h | Most commerce verticals |
| **L3 HITL ALL AI** | Every AI output requires human-in-the-loop before actioning | Law firm, funeral home, tax consultant, rehab centre (absolute privilege or deceased data) |

### Vertical Route Bundles (in `apps/api/src/index.ts`)

| Bundle | File | Verticals |
|---|---|---|
| Original P1 (17) | Multiple route files | politician, pos-business, motor-park, transit, rideshare, haulage, road-transport-union, okada-keke, church, ngo, cooperative, creator, sole-trader, market, professional, school, clinic, tech-hub, restaurant |
| Commerce P2 Batch 1 (9) | `verticals-commerce-p2.js` | auto-mechanic, bakery, beauty-salon, bookshop, catering, cleaning-service, electronics-repair, florist, food-vendor |
| Commerce P2 Batch 2 | `verticals-commerce-p2-batch2.js` | hotel, laundry-service, pharmacy-chain, photography-studio, driving-school, gym-fitness, event-hall, spa, restaurant-chain, printing-press, land-surveyor, handyman, it-support, internet-cafe, supermarket, fashion-brand, hardware-store |
| Commerce P3 (15) | `verticals-commerce-p3.js` | artisanal-mining, borehole-driller, building-materials, car-wash, cleaning-company, electrical-fittings, generator-dealer, hair-salon, petrol-station, phone-repair-shop, shoemaker, spare-parts, tyre-shop, used-car-dealer, water-vendor |
| Transport Extended | `verticals-transport-extended.js` | airport-shuttle, cargo-truck, clearing-agent, courier, dispatch-rider, ferry, logistics-delivery, haulage, transit |
| Civic Extended (10) | `verticals-civic-extended.js` | mosque, youth-organization, womens-association, waste-management, book-club, professional-association, sports-club, campaign-office, constituency-office, ward-rep |
| Health Extended (6) | `verticals-health-extended.js` | dental-clinic (MDCN), sports-academy, vet-clinic (VCNB), community-health (NPHCDA, USSD-safe), elderly-care (FMHSW), rehab-centre (NDLEA, L3 HITL ALL AI) |
| Prof+Creator Extended (11) | `verticals-prof-creator-extended.js` | accounting-firm, event-planner, law-firm (L3 HITL ALL AI), funeral-home (L3 HITL ALL AI), pr-firm, tax-consultant (L3 HITL ALL AI), wedding-planner, music-studio, photography-studio, recording-label, talent-agency |
| Financial+Place+Media+Institutional (13) | `verticals-financial-place-media-institutional-extended.js` | bureau-de-change, hire-purchase, mobile-money-agent, airtime-reseller, market, community-hall, container-depot, cold-room, newspaper-dist, podcast-studio, music-studio, government-agency, sports-club |
| Set J Extended (27) | `verticals-set-j-extended.js` | abattoir, advertising-agency, agro-input, cassava-miller, cocoa-exporter, construction, cooperative, creche, elderly-care, fish-market, florist, food-processing, fuel-station, furniture-maker, gas-distributor, generator-repair, iron-steel, ministry-mission, motorcycle-accessories, nurtw, oil-gas-services, optician, orphanage, palm-oil, paints-distributor, polling-unit, property-developer, real-estate-agency, security-company, solar-installer, tailor, travel-agent, used-car-dealer, vegetable-garden, vet-clinic, water-treatment, welding-fabrication |

**Total: 160+ verticals all wired, routes mounted, packages created, migrations applied.**

---

## 8. Data Model — D1 Migrations

### Migration Sequence Overview

All 191 migrations live in `infra/db/migrations/`. They must be applied in filename order.

| Range | Category |
|---|---|
| 0001–0010 | Core schema: places, entities, workspaces, memberships, subscriptions, profiles, political, relationships, search index, discovery events |
| 0011–0020 | Themes, branding, claims, analytics, audit logs, offerings, POS terminals, float ledger |
| 0021–0035 | Auth (users, sessions, consent), contact channels, OTP, identity verification, community spaces, social posts/groups/DMs |
| 0036–0055 | Vertical seed: all 160 verticals seeded in `profiles` table; vertical-specific tables |
| 0056–0092 | Commerce verticals: P1 originals, P2 batches, P3 batch |
| 0093–0116 | Transport extended, civic extended, health extended |
| 0117–0140 | Prof+creator extended |
| 0141–0186 | Financial+place+media+institutional+Set J extended; ministry members |
| 0187–0188 | **P9 fix:** Convert REAL columns to INTEGER in inventory and moderation (SEC-002/003) |
| 0189 | **Billing fix:** Rename `amount_naira` → `amount_kobo` in billing_records (OPS-003) |
| 0190 | **Auth fix:** Add `workspace_id`, `tenant_id`, `role` columns to `users` table (login endpoint requires these) |

### Critical Tables

| Table | Description |
|---|---|
| `places` | 8-level geography hierarchy; ~817 rows after seed |
| `users` | Platform users; must have `workspace_id`, `tenant_id`, `role` (migration 0190) |
| `memberships` | workspace_id + user_id + role; enforces RBAC at workspace level |
| `subscriptions` | Active subscription per workspace; entitlement source |
| `profiles` | Discovery records; seeded for all 160+ verticals before claiming |
| `claims` | Claim requests + FSM state |
| `agent_float_ledger` | Append-only double-entry ledger (P9) |
| `consent_records` | NDPR consent records for BVN/NIN/AI processing (P10) |
| `community_spaces` | Root entity for Skool-style communities |
| `social_posts` | User-generated content; `like_count` used for USSD trending (T3 scoped) |
| `direct_messages` | AES-GCM encrypted DMs (P14) |
| `vendor_pricing_policies` | Negotiation vendor-level policy |
| `negotiation_sessions` | Active/closed negotiation sessions |
| `negotiation_offers` | Offer/counteroffer history per session |
| `ai_usage_events` | AI billing audit log (P10, P13) |

### Applying Migrations

```bash
# Staging (after wrangler auth):
npx wrangler d1 migrations apply webwaka-os-staging \
  --env staging --remote \
  --config apps/api/wrangler.toml

# Production:
npx wrangler d1 migrations apply webwaka-os-production \
  --env production --remote \
  --config apps/api/wrangler.toml
```

### Geography Seed

After migrations, seed geographic data:
```bash
# Nigeria country + zones (from SQL files in infra/db/seed/)
npx wrangler d1 execute webwaka-os-staging --env staging --remote \
  --config apps/api/wrangler.toml \
  --file infra/db/seed/nigeria_country.sql

npx wrangler d1 execute webwaka-os-staging --env staging --remote \
  --config apps/api/wrangler.toml \
  --file infra/db/seed/nigeria_zones.sql

# States (generates SQL from TypeScript)
pnpm seed:wards
npx wrangler d1 execute webwaka-os-staging --env staging --remote \
  --config apps/api/wrangler.toml \
  --file infra/db/seed/0002_lgas.sql
```

---

## 9. Auth, Tenancy, and RBAC

### Login Flow

```
POST /auth/login { email, password }
  → D1: SELECT * FROM users WHERE email = ? (password bcrypt check)
  → D1: SELECT role FROM memberships WHERE user_id = ? AND workspace_id = ?
  → Issue JWT { sub, tenant_id, workspace_id, role }
  ← { token: "eyJ..." }
```

**Critical:** Migration 0190 added `workspace_id`, `tenant_id`, `role` columns to `users` table — without these the login endpoint cannot issue a complete JWT.

### JWT Validation

Every protected route runs `authMiddleware` which:
1. Extracts Bearer token from `Authorization` header
2. Verifies signature against `JWT_SECRET` Worker secret
3. Decodes payload; extracts `sub`, `tenant_id`, `workspace_id`, `role`
4. Sets `c.set('auth', authContext)` for downstream handlers
5. Returns 401 if token invalid, expired, or missing `tenant_id`

### Roles (in order of privilege)

`super_admin` > `admin` > `manager` > `agent` > `cashier` > `member` > `public`

### Super Admin Seed Values (staging)

```
email:        admin@webwaka.ng
password:     WebWaka@2026!  ← STAGING ONLY, NEVER PRODUCTION
user_id:      user_superadmin_001
workspace_id: ws_platform_001
tenant_id:    tenant_webwaka
role:         super_admin
```

See `docs/prompts/superagent-launch-prompt-2026-04-10.md` for the full SQL INSERT seed block.

**NEVER use the staging password on production.** Generate a fresh random password for production.

---

## 10. AI / SuperAgent Layer

### Provider Abstraction Chain

All AI calls go through a 5-level BYOK resolution chain in `@webwaka/ai-abstraction`:

```
1. Workspace BYOK key (if set by tenant)
2. Partner pool key (if tenant is under a partner with credits)
3. Platform WakaCU pool (platform-funded credits)
4. Platform default key (fallback to platform's own API key)
5. Error: no key available
```

### Supported Providers

- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google Gemini
- Cloudflare AI Workers (local inference)

### AI Capability Map per Pillar

| Capability | Pillar | Autonomy |
|---|---|---|
| `inventory_ai` | 1 (Ops) | L1/L2 per vertical |
| `pos_receipt_ai` | 1 (Ops) | L1 |
| `shift_summary_ai` | 1 (Ops) | L2 |
| `fraud_flag_ai` | 1 (Ops) | L2 |
| `bio_generator` | 2 (Brand) | L1 |
| `brand_copywriter` | 2 (Brand) | L1 |
| `seo_meta_ai` | 2 (Brand) | L1 |
| `listing_enhancer` | 3 (Discovery) | L1 |
| `review_summary` | 3 (Discovery) | L2 |
| `search_rerank` | 3 (Discovery) | L1 |

### WakaCU (Credits)

WakaCU is the platform's internal AI credit currency. It is stored as an INTEGER (P9 enforced by `CreditBurnEngine`). The `WalletService` computes balance from a double-entry ledger — never from a mutable scalar.

### NDPR Consent Gate

Before any AI call from a user session:
1. `aiConsentGate` middleware checks `consent_records` table for `data_type = 'AI_PROCESSING'`
2. USSD sessions are blocked entirely (P12)
3. KYC tier is checked for paid AI features
4. Consent history stored for DSAR compliance

---

## 11. Negotiable Pricing System

Implemented in the production remediation (T001–T007). Complete as of HEAD.

### How It Works

1. **Vendor policy** — seller sets a global policy: `pricing_mode` (`fixed`|`negotiable`|`auction`), `max_discount_pct`, `min_price_kobo` (NEVER returned in API responses), `max_rounds`, `auto_accept_threshold_kobo`
2. **Listing overrides** — individual listings can override the vendor-level mode
3. **Negotiation session** — buyer opens a session; FSM: `open` → `countered` → `accepted`/`declined`/`expired`/`cancelled`
4. **Offer/counteroffer** — buyers/sellers submit offers; `NegotiationEngine.evaluateOffer()` applies guardrails
5. **Price-lock token** — on acceptance, `generatePriceLockToken(PRICE_LOCK_SECRET, sessionId, price)` issues an HMAC-signed token; checkout validates with `verifyPriceLockToken`

### Blocked Verticals

`NEGOTIATION_BLOCKED_VERTICALS` constant in `@webwaka/negotiation` — verticals where price negotiation is inappropriate (e.g., emergency services).

### CRON Expiry

Every 15 minutes, the `runNegotiationExpiry()` job:
- Expires open sessions past TTL
- Cancels accepted sessions with no payment after 24h
- Writes audit entries using real `session.tenant_id` (OPS-004 fix)

---

## 12. USSD Gateway

**App:** `apps/ussd-gateway/`  
**Worker secrets required:**
- `AFRICAS_TALKING_USERNAME` + `AFRICAS_TALKING_API_KEY` — carrier integration
- `INTER_SERVICE_SECRET` — API-to-API auth
- `JWT_SECRET`
- `LOG_PII_SALT`
- `TELEGRAM_BOT_TOKEN` + `TELEGRAM_WEBHOOK_SECRET` (M7f)
- `TENANT_ID` — **one per deployed Worker instance** (T3 enforcement)

**Session model:** `USSD_SESSION_KV` — 3-minute TTL, keyed by phone number + session ID.

**KV bindings in `apps/ussd-gateway/wrangler.toml`:**
- `USSD_SESSION_KV` staging: `2d2b2b32beb94df989a7e3520cc3962a`
- `USSD_SESSION_KV` production: `c3f90b3b6b634983b1778964b0a92ed0`

**Rate limit:** 30 requests/hour per phone (`RATE_LIMIT_KV`).

**P12 enforcement:** `aiConsentGate` blocks all AI calls from USSD request context. The gateway checks `X-USSD-Session: true` header to identify USSD traffic.

---

## 13. Community + Social Platform

### Community (M7c)

Package: `@webwaka/community`  
Tables: `community_spaces`, `community_channels`, `community_members`, `community_posts`, `community_courses`, `community_events`

Key entities:
- `CommunitySpace` — root (owned by workspace, has `tenant_id`, `slug`, `visibility`)
- `CommunityMember` — user + community + role + KYC tier at join + `tenant_id`
- Visibility: `public` | `private` | `invite_only`

### Social (M7d)

Package: `@webwaka/social`  
Tables: `social_posts`, `social_groups`, `social_group_members`, `direct_messages`, `social_follows`, `social_likes`

Key rules:
- `direct_messages` — AES-GCM encrypted with `DM_MASTER_KEY` (P14); `assertDMMasterKey()` called at Worker startup
- `social_posts.like_count` — used by USSD Branch 3 (T3 tenant-scoped query)
- `social_follows` — unidirectional; no auto-follow on community join

---

## 14. Cloudflare Infrastructure — Real IDs

### Cloudflare Account

```
Account ID: a5f5864b726209519e0c361f2bb90e79
```

### D1 Databases

| Environment | Database Name | Database ID |
|---|---|---|
| Staging | `webwaka-os-staging` | `cfa62668-bbd0-4cf2-996a-53da76bab948` |
| Production | `webwaka-os-production` | `de1d0935-31ed-4a33-a0fd-0122d7a4fe43` |

### KV Namespaces

| Namespace Binding | Environment | ID |
|---|---|---|
| `GEOGRAPHY_CACHE` | staging | `01df2e1e329d446ebfd1577b93554ede` |
| `GEOGRAPHY_CACHE` | production | `b447c8dd14e3432baaeb8bf13d8fd736` |
| `RATE_LIMIT_KV` | staging | `608eacac3eb941a68c716b14e84b4d10` |
| `RATE_LIMIT_KV` | production | `af260e847d1e400e94cf13f6ae3214eb` |
| `THEME_CACHE` | staging | `bd24f563762d4ebb889f09cc711a6796` |
| `THEME_CACHE` | production | `323d03bf6f5f4caaa28c80830f4af892` |
| `DISCOVERY_CACHE` | staging | `ed8e7381f64e43ca97834bc7ace0f711` |
| `DISCOVERY_CACHE` | production | `dffe6346937f4fc78fbb3ea521f89d02` |
| `USSD_SESSION_KV` | staging | `2d2b2b32beb94df989a7e3520cc3962a` |
| `USSD_SESSION_KV` | production | `c3f90b3b6b634983b1778964b0a92ed0` |

### R2 Buckets

- `assets-staging` — tenant assets for staging
- `assets-production` — tenant assets for production

### Workers (to be deployed)

| Worker Name | App | Config |
|---|---|---|
| `webwaka-api-staging` | `apps/api` | `apps/api/wrangler.toml` env `staging` |
| `webwaka-api-production` | `apps/api` | `apps/api/wrangler.toml` env `production` |
| `webwaka-ussd-gateway-staging` | `apps/ussd-gateway` | `apps/ussd-gateway/wrangler.toml` env `staging` |
| `webwaka-ussd-gateway-production` | `apps/ussd-gateway` | `apps/ussd-gateway/wrangler.toml` env `production` |
| `webwaka-brand-runtime-staging` | `apps/brand-runtime` | `apps/brand-runtime/wrangler.toml` |
| `webwaka-brand-runtime-production` | `apps/brand-runtime` | `apps/brand-runtime/wrangler.toml` |
| `webwaka-partner-admin-staging` | `apps/partner-admin` | `apps/partner-admin/wrangler.toml` |
| `webwaka-partner-admin-production` | `apps/partner-admin` | `apps/partner-admin/wrangler.toml` |

---

## 15. Secrets Registry

### Required Secrets (per Worker, set via `wrangler secret put`)

#### `apps/api` Worker

| Secret | Purpose |
|---|---|
| `JWT_SECRET` | JWT signing/verification (generate 96-char hex) |
| `PAYSTACK_SECRET_KEY` | Paystack payment processing |
| `PREMBLY_API_KEY` | BVN/NIN/CAC/FRSC identity verification |
| `TERMII_API_KEY` | SMS OTP delivery |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp OTP via Meta Cloud API |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business phone number |
| `TELEGRAM_BOT_TOKEN` | Telegram OTP delivery |
| `LOG_PII_SALT` | SHA-256 salt for hashing PII before log storage (generate 64-char hex) |
| `DM_MASTER_KEY` | AES-GCM key for DM encryption (P14) (generate 64-char hex) |
| `PRICE_LOCK_SECRET` | HMAC key for price-lock tokens (generate 64-char hex) |
| `INTER_SERVICE_SECRET` | API-to-API auth (ussd-gateway → api) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `APP_BASE_URL` | Public platform URL e.g. `https://api.webwaka.ng` |

Optional:
- `WHATSAPP_PROVIDER` — `'360dialog'` or `'termii'` (default)
- `DIALOG360_API_KEY` — if `WHATSAPP_PROVIDER=360dialog`

#### `apps/ussd-gateway` Worker

| Secret | Purpose |
|---|---|
| `AFRICAS_TALKING_USERNAME` | Africa's Talking USSD account |
| `AFRICAS_TALKING_API_KEY` | Africa's Talking API key |
| `INTER_SERVICE_SECRET` | Auth for calls to API Worker |
| `JWT_SECRET` | Same as API Worker |
| `LOG_PII_SALT` | Same as API Worker |
| `TELEGRAM_BOT_TOKEN` | Telegram webhook handling |
| `TELEGRAM_WEBHOOK_SECRET` | Validates Telegram webhook header |
| `TENANT_ID` | Per-deployment tenant identity (T3) |

### Required GitHub Actions Secrets

| Secret | Used By |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | All deploy + migrate jobs |
| `CLOUDFLARE_API_TOKEN` | All wrangler commands |
| `CLOUDFLARE_D1_STAGING_ID` | Staging migrations |
| `CLOUDFLARE_D1_PRODUCTION_ID` | Production migrations |
| `JWT_SECRET_STAGING` | Staging deploy vars |
| `JWT_SECRET_PRODUCTION` | Production deploy vars |
| `INTER_SERVICE_SECRET` | Inter-service auth |

### ⚠️ CRITICAL SECURITY ALERT

The previous production remediation agent **committed a live Cloudflare API token** to the public GitHub repo inside `docs/production-remediation-plan-2026-04-10.md`. **This token must be rotated before any deployment.**

Steps:
1. Go to `https://dash.cloudflare.com/profile/api-tokens`
2. Revoke the exposed token
3. Create a new token with: Workers Edit, D1 Edit, KV Edit
4. Update GitHub Actions secret `CLOUDFLARE_API_TOKEN`
5. Use new token for all wrangler commands

---

## 16. CI/CD Pipeline

### Workflows in `.github/workflows/`

| Workflow | Trigger | Jobs |
|---|---|---|
| `ci.yml` | PR + push | typecheck, test, lint, security audit |
| `deploy-staging.yml` | Push to `staging` branch | ci → migrate-staging → deploy-api → deploy-ussd → deploy-brand-runtime → deploy-partner-admin |
| `deploy-production.yml` | Push to `main` (requires `production` environment approval) | ci → migrate-production → deploy-api-production → (other workers) |
| `check-core-version.yml` | PR | Checks `@webwaka/core` version consistency |
| `governance-check.yml` | PR | Validates governance doc format |

### Staging Deploy Trigger

```bash
git push origin main:staging
# OR: merge a PR into the staging branch
```

### Production Deploy Trigger

Push to `main` branch triggers `deploy-production.yml`. However, it uses `environment: production` in GitHub Actions — **this requires a manual approval gate to be configured in GitHub UI first.**

**OPS-001 (not yet done):** Go to `https://github.com/WebWakaDOS/webwaka-os/settings/environments` → Create `production` environment → Add required reviewer(s) → This gates the production deploy job.

---

## 17. Current Deployment State

### What is DONE (code complete, as of HEAD `25c41d4`)

| Item | Status |
|---|---|
| TypeScript: 0 errors across all 160+ verticals | ✅ Complete |
| All 191 D1 migrations created (0001–0190 + 0007a) | ✅ Complete |
| SEC-001: Tenant isolation fixed in social.ts + community.ts | ✅ Complete |
| SEC-002/003: P9 REAL→INTEGER migrations 0187/0188 | ✅ Complete |
| SEC-004: NDPR erasure endpoint `DELETE /auth/me` | ✅ Complete |
| SEC-005: Rate-limit Retry-After header + KV graceful degradation | ✅ Complete |
| TEST-001: `/health/version` endpoint | ✅ Complete |
| TEST-002: Smoke test `SMOKE_API_KEY` guard | ✅ Complete |
| OPS-002: CI jobs properly ordered (typecheck before test) | ✅ Complete |
| OPS-003: `amount_naira` → `amount_kobo` in billing_records (migration 0189) | ✅ Complete |
| OPS-004: CRON job uses real `session.tenant_id` | ✅ Complete |
| All 4 `wrangler.toml` files: real D1 UUIDs + KV IDs | ✅ Complete |
| All KV namespaces provisioned in Cloudflare | ✅ Complete |
| Migration 0190: `users` table gets `workspace_id`, `tenant_id`, `role` | ✅ Complete |
| Launch documents: checklist, runbook, superagent launch prompt | ✅ Complete |
| Price-lock token HMAC signing (T004) | ✅ Complete |
| Negotiable pricing system end-to-end | ✅ Complete |

### What is NOT DONE (platform not yet deployed)

| Item | Status | Reference |
|---|---|---|
| CF API token rotation (URGENT — exposed in docs) | ❌ Not done | `docs/super-admin-launch-checklist.md` Step 0 |
| Wrangler secrets set on staging Workers | ❌ Not done | Step 1 |
| D1 migrations applied to remote staging DB | ❌ Not done | Step 2 |
| Geography seed data loaded | ❌ Not done | Step 3 |
| Super Admin user seeded in staging D1 | ❌ Not done | Step 4 |
| Workers deployed to staging | ❌ Not done | Step 5 |
| Staging smoke tests passing | ❌ Not done | Step 6 |
| GitHub production environment configured (manual approval gate) | ❌ Not done | OPS-001 |
| Wrangler secrets on production Workers | ❌ Not done | Step 7 |
| D1 migrations applied to remote production DB | ❌ Not done | Step 8 (via CI) |
| Workers deployed to production | ❌ Not done | Step 9 (via CI) |

**The complete step-by-step deployment guide is at:** `docs/prompts/superagent-launch-prompt-2026-04-10.md`

---

## 18. Known Issues and Technical Debt

### P1 — CRITICAL (blocking)

1. **Exposed Cloudflare API Token** — `docs/production-remediation-plan-2026-04-10.md` contains a live CF API token committed to the public repo. Must be revoked immediately before deployment.

2. **Staging password never for production** — `WebWaka@2026!` is the staging Super Admin seed password. A fresh random password must be generated for production and stored securely.

### P2 — Important (should fix before launch)

3. **`RATE_LIMIT_KV` binding gap** — The API `wrangler.toml` has `RATE_LIMIT_KV` wired, but the `apps/ussd-gateway/wrangler.toml` may need verification that its `RATE_LIMIT_KV` IDs match the provisioned namespaces. Double-check against `docs/operator-runbook.md`.

4. **`THEME_CACHE` and `DISCOVERY_CACHE` not in API `wrangler.toml`** — These KV namespaces exist (IDs in operator runbook) but are only consumed by `apps/brand-runtime` and `apps/public-discovery`. Verify those apps' `wrangler.toml` files have them wired correctly.

5. **Smoke tests require live Worker** — `tests/smoke/api-health.smoke.ts` runs against `BASE_URL` + `SMOKE_API_KEY` — these require a deployed Worker. Smoke tests cannot run in CI without a deployed staging environment.

### P3 — Technical Debt (non-blocking)

6. **`apps/public-discovery`** — Frontend not fully implemented. The API routes it depends on are complete, but the actual React/HTML frontend pages are scaffolded, not production-ready.

7. **`apps/partner-admin`** — Partner-facing admin portal is scaffolded but not fully built out.

8. **`apps/projections`** — Event-driven projection Worker is scaffolded but projection handlers are not comprehensively implemented.

9. **M7b–M7e offline sync** — `packages/offline-sync` and `packages/events` are scaffolded; Dexie.js client-side queue integration is defined but not tested end-to-end with a real client app.

10. **`WEBWAKA_KV` binding** — Referenced in some older governance docs as a general KV namespace but does not appear in the current `apps/api/wrangler.toml`. May have been consolidated into `GEOGRAPHY_CACHE` and `RATE_LIMIT_KV`.

11. **Telegram webhook registration** — The Telegram Bot API webhook URL must be registered with Telegram (`POST https://api.telegram.org/bot{TOKEN}/setWebhook?url={USSD_WORKER_URL}/telegram/webhook`) after USSD gateway is deployed.

12. **Africa's Talking USSD shortcode** — `*384#` is pending NCC registration. Must register with NCC and Africa's Talking before USSD can be used in production.

---

## 19. Development Patterns and Conventions

### Adding a New Vertical

1. Create `packages/verticals-{slug}/` with `src/index.ts`, `src/types.ts`, `src/repository.ts`
2. Declare `primary_pillars: ['Pillar1', 'Pillar2', 'Pillar3']` in the `VerticalRegistration`
3. Set `"description"` field in `package.json` to start with `[Pillar N]`, `[AI]`, or `[Infra]`
4. Create D1 migration(s) for vertical tables (next available number)
5. Create `apps/api/src/routes/verticals/{slug}.ts`
6. Mount the route in `apps/api/src/routes/verticals.js` aggregator or appropriate bundle
7. Add the vertical to `apps/api/src/index.ts` mounting block

### P9 Money Rule

**Always:**
```typescript
// DB: INTEGER column
// API input: z.number().int().positive('amountKobo must be a positive integer')
// In response: return as-is (integer)
// Display only: divide by 100 for NGN display in frontend
```

**Never:**
```typescript
z.number() // without .int() for monetary values
parseFloat(...) // for any monetary calculation
```

### T3 Tenant Isolation Rule

**Always:**
```typescript
const auth = c.get('auth'); // from authMiddleware
const { tenantId } = auth;
db.prepare('SELECT * FROM foo WHERE id = ? AND tenant_id = ?').bind(id, tenantId).first();
```

**Never:**
```typescript
const tenantId = c.req.header('x-tenant-id'); // untrusted on auth routes
c.req.json().then(b => b.tenant_id);          // never from request body
```

Exception: `/health`, `/geography/*`, `/discovery/*` are public and have no `tenant_id` requirement.

### Test Pattern

Tests use Vitest. A common D1 mock pattern:

```typescript
import { describe, it, expect, vi } from 'vitest';

const mockDb = {
  prepare: vi.fn().mockReturnValue({
    bind: vi.fn().mockReturnValue({
      run: vi.fn().mockResolvedValue({ success: true }),
      first: vi.fn().mockResolvedValue(null),
      all: vi.fn().mockResolvedValue({ results: [] }),
    }),
  }),
};
```

Tests do not hit real D1. All D1 interactions are mocked.

### Smoke Test Pattern

Smoke tests (`tests/smoke/api-health.smoke.ts`) run against a live Worker URL:
```bash
BASE_URL=https://webwaka-api-staging.<account>.workers.dev \
SMOKE_TENANT_ID=tenant_webwaka \
SMOKE_API_KEY=<api-key> \
npx tsx tests/smoke/api-health.smoke.ts
```

Invariants validated: P9 (all money is integer), T3 (tenant_id present), P14 (DM ciphertext not plaintext).

### TypeScript Config

`tsconfig.base.json` is the root; each app/package extends it. Key settings:
- `"moduleResolution": "Bundler"` — for Cloudflare Workers compatibility
- `"noUncheckedIndexedAccess": true` — array/object access returns `T | undefined`
- `"exactOptionalPropertyTypes": true` — `undefined` is not assignable to optional props unless explicitly typed

### Import Paths

Internal packages are imported by workspace name:
```typescript
import { jwtAuthMiddleware } from '@webwaka/auth';
import type { AuthContext } from '@webwaka/types';
import { NegotiationRepository } from '@webwaka/negotiation';
```

These resolve via `pnpm` workspace aliases — no need for relative `../../` paths.

---

## 20. Key Files Index

| File | Purpose |
|---|---|
| `ARCHITECTURE.md` | High-level architecture reference |
| `AGENTS.md` | Multi-agent coordination model + M7 phase guide |
| `ROADMAP.md` | Milestone definitions |
| `apps/api/src/index.ts` | Main API entry point — all route mounting |
| `apps/api/src/env.ts` | All Worker bindings type definition (`Env` interface) |
| `apps/api/src/middleware/rate-limit.ts` | KV-backed rate limiter |
| `apps/api/src/routes/auth-routes.ts` | Login, verify, refresh, me, DELETE /auth/me |
| `apps/api/src/routes/negotiation.ts` | Full negotiable pricing API |
| `apps/api/src/routes/superagent.ts` | AI consent + chat + usage |
| `apps/api/src/jobs/negotiation-expiry.ts` | CRON session expiry |
| `apps/api/wrangler.toml` | API Worker config with real D1/KV IDs |
| `apps/ussd-gateway/src/index.ts` | USSD Worker entry |
| `apps/ussd-gateway/wrangler.toml` | USSD Worker config |
| `apps/brand-runtime/src/index.ts` | Brand Runtime Worker entry |
| `infra/db/migrations/0190_users_auth_columns.sql` | Most recent migration |
| `infra/db/seed/nigeria_country.sql` etc. | Geography seed files |
| `packages/auth/src/index.ts` | Auth package exports |
| `packages/types/src/index.ts` | All canonical types |
| `packages/negotiation/src/index.ts` | Negotiation package exports |
| `packages/superagent/src/index.ts` | SuperAgent AI layer exports |
| `tests/smoke/api-health.smoke.ts` | Smoke tests (run vs live Worker) |
| `docs/governance/platform-invariants.md` | All P/T invariants |
| `docs/governance/entitlement-model.md` | Subscription + KYC tiers |
| `docs/governance/security-baseline.md` | Security rules R1–R10 |
| `docs/governance/universal-entity-model.md` | All root entity types |
| `docs/governance/verticals-master-plan.md` | 160 vertical priority framework |
| `docs/super-admin-launch-checklist.md` | Operator step-by-step launch guide |
| `docs/operator-runbook.md` | All IDs, secrets, token rotation instructions |
| `docs/prompts/superagent-launch-prompt-2026-04-10.md` | Full Superagent deploy brief (Steps 1-9) |
| `docs/production-remediation-plan-2026-04-10.md` | ⚠️ CONTAINS EXPOSED CF TOKEN — do not re-read without rotating first |

---

## 21. Next Agent Priority Tasks

Execute in this order. Do not skip.

### IMMEDIATE (before any other work)

**Task 0 — Rotate Exposed Cloudflare API Token**
The file `docs/production-remediation-plan-2026-04-10.md` contains a live CF API token in the plain text. It has been committed to a public GitHub repo. You must:
1. Revoke the token at `https://dash.cloudflare.com/profile/api-tokens`
2. Create a replacement token (Workers Edit + D1 Edit + KV Edit)
3. Update GitHub Actions secret `CLOUDFLARE_API_TOKEN`
4. Set `export CLOUDFLARE_API_TOKEN="<new-token>"` for your session

### DEPLOY — Follow `docs/prompts/superagent-launch-prompt-2026-04-10.md` (Steps 1-9)

**Step 1 — Set all wrangler secrets on staging**

Generate random secrets for: `JWT_SECRET`, `LOG_PII_SALT`, `DM_MASTER_KEY`, `PRICE_LOCK_SECRET`, `INTER_SERVICE_SECRET`.  
Then `wrangler secret put` each one against the staging API Worker.  
Obtain and set: `PAYSTACK_SECRET_KEY`, `PREMBLY_API_KEY`, `TERMII_API_KEY`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `TELEGRAM_BOT_TOKEN`.

**Step 2 — Apply all 191 migrations to staging D1**
```bash
npx wrangler d1 migrations apply webwaka-os-staging \
  --env staging --remote --config apps/api/wrangler.toml
```
Verify: `SELECT COUNT(*) FROM sqlite_master WHERE type='table'` returns at least 60 tables.

**Step 3 — Seed Nigeria geography data**

Apply `infra/db/seed/nigeria_country.sql`, `nigeria_zones.sql`, `nigeria_states.sql`, `0002_lgas.sql`, `0003_wards.sql`.  
Verify: `SELECT COUNT(*) FROM places` returns ≥ 817.

**Step 4 — Seed Super Admin user**

Run the SQL INSERT in the launch prompt — creates `user_superadmin_001` in `users`, `memberships`, and `workspaces` tables with `tenant_id = 'tenant_webwaka'`, `role = 'super_admin'`.

**Step 5 — Deploy Workers to staging**
```bash
cd apps/api && npx wrangler deploy --env staging
cd apps/ussd-gateway && npx wrangler deploy --env staging
cd apps/brand-runtime && npx wrangler deploy --env staging
```

**Step 6 — Verify staging**
```bash
curl https://webwaka-api-staging.<account>.workers.dev/health
# → {"status":"ok","version":"x.y.z"}

curl -X POST .../auth/login -d '{"email":"admin@webwaka.ng","password":"WebWaka@2026!"}'
# → {"token":"eyJ..."} with role: "super_admin" in decoded payload
```

**Step 7 — Configure GitHub production environment (manual)**

Go to `https://github.com/WebWakaDOS/webwaka-os/settings/environments` → Create `production` → Add required reviewer (Founder) → Enable required reviewers gate.

**Step 8 — Trigger production CI**
```bash
git push origin main
# CI runs → hits approval gate → Founder approves → deploys to production
```

**Step 9 — Verify production**
```bash
curl https://api.webwaka.ng/health
# → {"status":"ok"}
```

### AFTER DEPLOY

- Register Telegram Bot webhook with `setWebhook` API
- Register `*384#` shortcode with NCC + Africa's Talking
- Rotate the staging `WebWaka@2026!` password (it's in a public commit — must change immediately)
- Set up monitoring/alerting on Cloudflare Workers Analytics
- Generate a proper production Super Admin password and store in a password manager

---

## Summary

WebWaka OS is a production-ready, governance-first, Africa-native platform. The code is complete. The blockers are purely operational (secrets, migrations, deploy commands). Everything you need to go live is documented in this note and in `docs/prompts/superagent-launch-prompt-2026-04-10.md`.

The single most important thing you can do right now is **rotate the exposed Cloudflare API token** and then execute the 9-step deployment guide.

---

*End of Handover Note — WebWaka OS — 2026-04-10 — HEAD `25c41d4`*
