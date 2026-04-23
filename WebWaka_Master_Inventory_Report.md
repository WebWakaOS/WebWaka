# WebWaka OS — Exhaustive Master Inventory Report

**Date produced:** 2026-04-23  
**Author:** Replit Agent (deep-research synthesis)  
**Purpose:** Foundation document for a future QA testing matrix — discovery and articulation only. No QA plan is included here.  
**Scope:** Entire monorepo as it exists at commit-time (post-Phase-3-remediation, Milestone 11 partner complete, Milestone 8a AI live, Milestone 8b POS Business live)  
**Verification key:**
- ✅ **Verified** — confirmed in source code during this research session
- ⚠️ **Strongly implied** — present in governance docs / migration SQL / test files but source not line-read
- ❓ **Uncertain** — referenced but not yet directly confirmed

---

## Table of Contents

1. Executive Summary
2. Platform Architecture Map
   - 2.1 Runtime Infrastructure
   - 2.2 Application Inventory (11 apps)
   - 2.3 Package Ecosystem (175+ packages)
   - 2.4 The 3-in-1 Pillar Model
   - 2.5 Tenancy & Access Hierarchy
   - 2.6 Platform Invariants (P1–P8, T1–T10)
   - 2.7 Database & Storage Surface Area
3. Vertical-by-Vertical Breakdown (160 verticals)
   - 3.1 Priority-1 Original Verticals (17)
   - 3.2 Commerce (45)
   - 3.3 Transport (12)
   - 3.4 Civic (13)
   - 3.5 Politics (8)
   - 3.6 Health (9)
   - 3.7 Education (8)
   - 3.8 Agricultural (12)
   - 3.9 Professional Services (10)
   - 3.10 Creator & Media (12)
   - 3.11 Financial (5)
   - 3.12 Place (8)
   - 3.13 Institutional / Social / Other (6)
   - 3.14 Vertical FSM States
   - 3.15 AI Capability-to-Vertical Mapping
4. User Category Matrix
   - 4.1 Platform Operator (super_admin)
   - 4.2 Partners
   - 4.3 Sub-Partners
   - 4.4 Tenants (admin / owner)
   - 4.5 Workspace Members (manager / cashier / agent / member)
   - 4.6 End Users (authenticated, low-trust)
   - 4.7 Public (unauthenticated)
   - 4.8 USSD Users (*384# sessions)
   - 4.9 KYC Tier Matrix
5. UI/UX Surface Inventory
   - 5.1 Workspace App (React PWA — primary tenant back-office)
   - 5.2 Platform Admin (Hono HTML — super-admin ops)
   - 5.3 Partner Admin (Hono HTML — partner management dashboard)
   - 5.4 Public Discovery (Hono HTML — marketplace front-end)
   - 5.5 Brand Runtime (Hono HTML — white-label tenant microsites)
   - 5.6 USSD Gateway (*384# — feature-phone interface)
   - 5.7 Admin Dashboard (Hono HTML — legacy admin ops)
   - 5.8 Tenant Public (Hono HTML — unsubscribe page)
   - 5.9 Notification System (Notificator Worker)
   - 5.10 Offline/PWA Surfaces
6. Scenario & Use-Case Catalog
   - 6.1 Auth & Identity Scenarios
   - 6.2 Onboarding Scenarios
   - 6.3 POS & Commerce Scenarios
   - 6.4 Wallet (HandyLife) Scenarios
   - 6.5 AI Advisory (SuperAgent) Scenarios
   - 6.6 Subscription & Billing Scenarios
   - 6.7 Partner & Sub-Partner Scenarios
   - 6.8 Community & Social Scenarios
   - 6.9 Discovery & Claim Scenarios
   - 6.10 Notification Scenarios
   - 6.11 USSD Scenarios
   - 6.12 Compliance & NDPR Scenarios
   - 6.13 CRON & Background Job Scenarios
   - 6.14 Offline & Sync Scenarios
7. Coverage Gaps & Open Questions
8. Verification Status Summary
9. Most Important UI/UX Areas to QA First

---

## 1. Executive Summary

WebWaka OS is a multi-tenant, multi-vertical, white-label SaaS platform OS built for Africa (Nigeria-first). It is implemented as a TypeScript monorepo targeting Cloudflare Workers (edge-native). The platform serves **160 distinct business verticals** across **14 sector categories**, and is organized around a **3-in-1 architecture**: every entity can simultaneously have an Operations-Management back-office (Pillar 1), a white-label branded website/storefront (Pillar 2), and a public marketplace/discovery listing (Pillar 3). A cross-cutting AI intelligence layer (SuperAgent) enriches all three pillars.

**Scale of the platform at the time of this report:**

| Dimension | Count / Detail |
|---|---|
| Cloudflare Worker apps | 11 (including React PWA workspace-app) |
| Shared packages | 175+ (incl. ~160 vertical packages, core infra, AI, wallet) |
| D1 database migrations | 381 (migration 0001–0381) |
| Architecture Decision Records (ADRs) | 19 |
| Governance documents | 40+ |
| Registered verticals (seeded) | 160 |
| UI surfaces | 8 distinct apps + USSD + offline PWA |
| API route files | 90+ (in apps/api/src/routes/) |
| User roles | super_admin, admin, manager, agent, cashier, member, public |
| KYC tiers | T0 (none), T1 (BVN-lite), T2 (BVN verified), T3 (Full KYC) |
| Subscription plans | free, starter, growth, enterprise |
| AI capabilities | 13 distinct capability types, 11+ provider chains |
| Completed milestones | M1–M11 (Phase 0→3 + Partner/AI/POS) |

---

## 2. Platform Architecture Map

### 2.1 Runtime Infrastructure ✅

All production workloads run on **Cloudflare Workers** (edge-native, globally distributed). The development/local environment uses a Node.js shim (`apps/platform-admin/server.js`) that wraps Cloudflare's Worker interface — this is the only non-Worker runtime and is explicitly not production.

**Cloudflare primitives in use:**

| Binding | Purpose |
|---|---|
| **D1** (SQLite) | Primary relational database — all tenant, entity, wallet, and event data |
| **KV** (Workers KV) | Session tokens, feature flags, wallet limits, rate limiting, BYOK keys, offline sync queues |
| **R2** (Object Storage) | Tenant asset uploads (images, documents, proof files), brand assets |
| **Queues** | Async event bus — Notificator Worker consumes events from the queue |
| **Cron Triggers** | Background scheduled jobs in apps/projections (daily 04:00 WAT) |
| **Service Bindings** | Inter-Worker communication (notificator ↔ api, projections ↔ api) |

**External integrations:**

| Service | Purpose |
|---|---|
| **Paystack** | NGN payment gateway — webhook for online funding confirmation |
| **Resend** | Transactional email delivery (password reset, invites, email verification) |
| **Telegram Bot API** | Chatbot commands via USSD gateway's Telegram webhook handler |
| **AI Providers** | OpenAI, Anthropic, Google, DeepSeek, OpenRouter, Groq, Together, Fireworks, Portkey, Qwen, Zhipu, Moonshot, MiniMax, Yi, Perplexity, Brave Search |

### 2.2 Application Inventory ✅

Eleven deployable applications in `/apps/`:

| App | Tech | Port (dev) | Purpose | Auth Model |
|---|---|---|---|---|
| `api` | Hono Worker | — | Central JSON API — all tenant business logic | JWT (authMiddleware) |
| `admin-dashboard` | Hono Worker (HTML) | — | Internal ops dashboard (analytics, system health) | JWT super_admin |
| `brand-runtime` | Hono Worker (HTML) | — | White-label tenant microsites (Pillar 2) | Public + tenant JWT for preview |
| `notificator` | Hono Worker (Queue consumer + Cron) | — | Async notification fan-out (push, email, SMS) | Inter-service secret |
| `partner-admin` | Hono Worker (HTML) | — | Partner/sub-partner management dashboard | JWT partner role |
| `platform-admin` | Hono Worker (Node.js dev shim) | 3001 | Super-admin claims, wallet HITL, feature flags | JWT super_admin |
| `projections` | Hono Worker (Cron) | — | Daily CRON: search projections, analytics, HITL sweep, wallet expiry, MLA payouts | Cron secret / service binding |
| `public-discovery` | Hono Worker (HTML) | — | Public marketplace / directory (Pillar 3) | Public |
| `tenant-public` | Hono Worker (HTML) | — | Tenant email unsubscribe page | Token in URL |
| `ussd-gateway` | Hono Worker (HTML/text) | — | *384# USSD menus + Telegram bot webhook | Shared secret (USSD provider) |
| `workspace-app` | React 18 + Vite + PWA | 5173 | Primary tenant back-office SPA (Pillar 1 UI) | JWT (AuthContext) |

### 2.3 Package Ecosystem ✅

Located in `/packages/` — TypeScript monorepo managed with pnpm workspaces.

**Infrastructure / Core packages:**

| Package | Purpose |
|---|---|
| `@webwaka/types` | Branded ID types, enums, shared interfaces |
| `@webwaka/shared-config` | Error codes, HTTP helpers, constants |
| `@webwaka/core` | JWT middleware, KV helpers, RBAC (`requireRole()`), rate limiting |
| `@webwaka/auth` | JWT issuance/verification, auth context resolution, RBAC guards |
| `@webwaka/events` | Event type registry (AuthEventType, BillingEventType, PosFinanceEventType, WalletEventType, etc.) |
| `@webwaka/geography` | Nigeria geography hierarchy — 6 zones, 37 states, 774 LGAs, wards |
| `@webwaka/entities` | Universal entity model — profiles, subjects (place/org/individual) |
| `@webwaka/claims` | 8-state claim FSM with transition guards (seeded→claimed→doc_verified→active→...) |
| `@webwaka/entitlements` | Subscription plan config, entitlement checks, feature gating |
| `@webwaka/notifications` | Notification fan-out, NDPR erasure propagation |
| `@webwaka/offline-sync` | IndexedDB queue, background sync, conflict resolution |
| `@webwaka/design-system` | Shared UI tokens, mobile-first CSS primitives |

**Business domain packages:**

| Package | Purpose |
|---|---|
| `@webwaka/hl-wallet` | HandyLife NGN wallet — ledger, funding requests, spend, MLA earnings, KYC gates |
| `@webwaka/superagent` | AI consent, HITL, credit burn engine, PII strip, sensitive sector detection, NDPR register |
| `@webwaka/ai` | Provider routing context, capability types, adapter interface |
| `@webwaka/ai-abstraction` | Provider abstraction layer (P7 invariant) |
| `@webwaka/ai-adapters` | Fetch-only adapters for OpenAI-compatible providers + Anthropic + Google |
| `@webwaka/pos` | Agent POS float infrastructure (agent network, separate from POS Business) |
| `@webwaka/verticals-pos-business` | Inventory, Sales, Customer (CRM) repositories for POS Business vertical |
| `@webwaka/community` | Community spaces, channels, courses, events, membership tiers |
| `@webwaka/social` | Social network features — follows, profiles, content |
| `@webwaka/identity` | FRSC vehicle verification, CAC registration, IT-registered bodies |
| `@webwaka/templates` | Email / notification template engine |

**Vertical packages (~160):** One package per seeded vertical (e.g. `@webwaka/vertical-abattoir`, `@webwaka/vertical-restaurant`, etc.) — all in `apps/api/src/routes/verticals/`. Each exposes FSM lifecycle hooks, offering types, and sector-specific compliance metadata.

### 2.4 The 3-in-1 Pillar Model ✅

WebWaka OS is structured as exactly three mutually-reinforcing pillars. **AI is NOT a fourth pillar** — it is a cross-cutting intelligence layer that enhances all three.

| Pillar | Name | App | What it delivers |
|---|---|---|---|
| **Pillar 1** | Operations-Management | `apps/api` + `apps/workspace-app` | Back-office operations: POS, inventory, CRM, analytics, wallet, team management, AI advisory |
| **Pillar 2** | Branding / White-label | `apps/brand-runtime` | Branded website/microsite/storefront for each tenant entity |
| **Pillar 3** | Marketplace / Discovery | `apps/public-discovery` | Public searchable directory — claim-first listing, profile verification |

All 160 verticals are classified across these pillars:
- **Ops + Marketplace** (`["ops","marketplace"]`): Motor Park, Farm, Cooperative, Polling Unit, Savings Group, NURTW, etc.
- **Ops + Branding** (`["ops","branding"]`): POS Business, Sole Trader, Hire Purchase
- **Ops + Marketplace + Branding** (`["ops","marketplace","branding"]`): Politician, Party, Church, NGO, Creator, Professional, School, Clinic, Rideshare, Haulage, Tech Hub, Restaurant, Hotel, Pharmacy, and ~100 more

### 2.5 Tenancy & Access Hierarchy ✅

```
Platform Operator (WebWaka)
    └─ super_admin users
         ├─ Platform Admin app
         ├─ Admin Dashboard app
         └─ All tenant data (cross-tenant read — audited)

Partners (Level 1)
    └─ partner_admin users (role: partner)
         └─ Partner Admin app
              └─ Sub-Partners (Level 2)
                   └─ Downstream Entity Managers (Level 3)

Tenants
    └─ Workspace (1 workspace per registration, multi-member)
         ├─ owner / admin (full workspace control)
         ├─ manager (operations access)
         ├─ cashier (POS access only)
         ├─ agent (field agent access)
         └─ member (read + limited write)

End Users (authenticated by tenant)
    └─ No workspace membership — interact via public-facing surfaces

Public (unauthenticated)
    └─ Public discovery pages, brand-runtime microsites, USSD unregistered users
```

**Tenant isolation invariant (T3):** Every DB query on tenant-scoped data MUST include a `tenant_id` predicate. Every KV key is prefixed `tenant:{tenant_id}:`. Every R2 path is prefixed `{tenant_id}/`.

### 2.6 Platform Invariants ✅

Non-negotiable rules requiring Founder approval before any modification:

**Product invariants:**
- **P1** — Build Once Use Infinitely: all capabilities as reusable primitives, no vertical code duplication
- **P2** — Nigeria First: NGN kobo, Nigerian geography, CBN/NDPR compliance throughout
- **P3** — Africa First (documented, not yet implemented — post-M12)
- **P4** — Mobile First: 360px base viewport
- **P5** — PWA First: installable, manifest, service worker on all client-facing apps
- **P6** — Offline First: IndexedDB queue + Background Sync for core journeys
- **P7** — Vendor Neutral AI: no direct AI SDK calls; all through `@webwaka/ai-adapters`
- **P8** — BYOK Capable: tenant/user-supplied AI keys fully supported

**Technical invariants:**
- **T1** — Cloudflare Workers runtime only in production
- **T2** — TypeScript strict mode everywhere
- **T3** — Tenant isolation on every query (CI-enforced)
- **T4** — Integer kobo for all monetary values (CI-enforced)
- **T5** — Subscription-gated feature access via `@webwaka/entitlements`
- **T6** — Geography-driven discovery
- **T7** — Claim-First Growth: 8-state FSM, all discoverable entities seeded before claimed
- **T8** — Step-by-step commits (process rule)
- **T9** — No skipped phases
- **T10** — Continuity-friendly code (inline comments, typed interfaces)

**Additional AI-specific invariants** (referenced in superagent.ts):
- **P9** — WakaCU amounts are integers only
- **P10** — NDPR AI consent required before any AI call
- **P11** — AI credit billing must be atomic (deduct on response, not on request)
- **P12** — No AI capability on USSD sessions (aiConsentGate blocks)
- **P13** — Callers must not send raw PII in AI messages (documented obligation)

### 2.7 Database & Storage Surface Area ⚠️ Strongly implied

**D1 schema (381 migrations, 0001–0381):**

Major table families confirmed or strongly implied:

| Family | Tables (examples) | Notes |
|---|---|---|
| Auth / Identity | `users`, `sessions`, `password_reset_tokens`, `email_verification_tokens`, `invite_tokens`, `consent_records`, `audit_logs` | Confirmed in auth-routes.ts |
| Tenants / Workspaces | `tenants`, `workspaces`, `workspace_members`, `subscriptions`, `billing_history` | Confirmed in billing.ts, workspace routes |
| Geography | `zones`, `states`, `lgas`, `wards` | 774 LGAs, 37 states, 6 zones seeded |
| Entities / Profiles | `entities`, `profiles`, `subjects`, `claim_requests` | Confirmed in claims.ts |
| Verticals | `verticals` (160 seeded), `vertical_instances`, `vertical_fsm_states` | Migration 0036/0037 |
| POS Business | `pos_products`, `pos_sales`, `pos_sale_items`, `pos_customers`, `pos_loyalty_events` | Confirmed in pos-business.ts |
| HandyLife Wallet | `hl_wallets`, `hl_ledger`, `hl_funding_requests`, `hl_transfer_requests`, `hl_withdrawal_requests`, `hl_mla_earnings` | Confirmed in hl-wallet.ts |
| AI / SuperAgent | `ai_consent_records`, `ai_usage_events`, `ai_credit_balances`, `ai_credit_transactions` | Confirmed in superagent.ts |
| Partners | `partners`, `sub_partners`, `partner_entitlements`, `partner_audit_log` | Confirmed in partner docs (M0202, M0203) |
| Community | `community_spaces`, `community_channels`, `community_courses`, `community_events`, `community_members` | Confirmed in community.ts |
| Social | `social_follows`, `social_posts`, `social_reactions` | Confirmed via social.ts |
| Notifications | `notifications`, `notification_preferences`, `notification_channels` | Confirmed in notificator Worker |
| Payments | `payment_transactions`, `paystack_webhooks` | Confirmed via payments.ts |
| Politics | `political_assignments`, `jurisdictions`, `candidate_records`, `term_records` | Governance docs (M2) |
| Offerings | `offerings`, `offering_categories`, `offering_prices` | Referenced in workspace-app/Offerings page |

**KV namespaces:**
- `WALLET_KV` — wallet feature flags, CBN limits, HITL threshold, eligible tenants
- `RATE_LIMIT_KV` — rate limiting counters
- `SESSION_KV` — active sessions, token blacklist
- `CACHE_KV` — discovery/search result caching
- `SYNC_KV` — offline sync queue metadata

---

## 3. Vertical-by-Vertical Breakdown

Total: **160 seeded verticals** organized in 14 categories. Each vertical has:
- A slug (URL-safe identifier)
- A D1 entity record (seeded in migration 0036)
- FSM state tracking (migration 0037)
- `primary_pillars` classification (`ops`, `marketplace`, `branding`)
- An optional `aiCapability` (for verticals with specific AI advisory)
- A dedicated route file in `apps/api/src/routes/verticals/<slug>.ts` ⚠️
- A test file alongside it ⚠️

### 3.1 Priority-1 Original Verticals (17) ✅

These are the founding verticals baked into the platform DNA. All must reach production before Milestone 10.

| # | Slug | Display Name | Entity Type | Pillars | AI Capability | Target Milestone |
|---|---|---|---|---|---|---|
| 1 | `politician` | Individual Politician | individual | ops + marketplace + branding | Content generation (HITL required) | M8b |
| 2 | `political-party` | Political Party | organization | ops + marketplace + branding | Content generation (HITL required) | M8b |
| 3 | `motor-park` | Motor Park / Bus Terminal | place | ops + marketplace | DEMAND_PLANNING_ADVISORY | M8c |
| 4 | `mass-transit` | City Bus / Mass Transit | organization | ops + marketplace | Route advisory | M8c |
| 5 | `rideshare` | Carpooling / Ride-Hailing | organization | ops + marketplace + branding | — | M8c |
| 6 | `haulage` | Haulage / Logistics | organization | ops + marketplace + branding | — | M8c |
| 7 | `church` | Church / Faith Community | organization | ops + marketplace + branding | — | M8d |
| 8 | `ngo` | NGO / Non-Profit | organization | ops + marketplace + branding | — | M8d |
| 9 | `cooperative` | Cooperative Society | organization | ops + marketplace | — | M8d |
| 10 | `pos-business` | POS Business Management System | organization | ops + branding | — | M8b ✅ LIVE |
| 11 | `market` | Market / Trading Hub | place | ops + marketplace | — | M8e |
| 12 | `professional` | Professional (Lawyer/Doctor) | individual | ops + marketplace + branding | — | M8e |
| 13 | `school` | School / Educational Institution | organization | ops + marketplace + branding | ENROLLMENT_CAPACITY_ADVISORY | M8e |
| 14 | `clinic` | Clinic / Healthcare Facility | organization | ops + marketplace + branding | — | M8e |
| 15 | `creator` | Creator / Influencer | individual | ops + marketplace + branding | — | M8e |
| 16 | `sole-trader` | Sole Trader / Artisan | individual | ops + branding | — | M8e |
| 17 | `tech-hub` | Tech Hub / Innovation Centre | place | ops + marketplace + branding | — | M8e |

### 3.2 Commerce Verticals (45) ⚠️

All have route files confirmed in `apps/api/src/routes/verticals/`. Core commerce capabilities: product catalog, POS sales, CRM, inventory management. Includes:

`restaurant`, `bakery`, `supermarket`, `pharmacy`, `hotel`, `laundry`, `auto-workshop` (`auto-mechanic`), `beauty-salon`, `barber-shop` (`hair-salon`), `tailoring` (`tailor`), `food-vendor`, `food-processing`, `catering`, `furniture-maker`, `electronics-repair`, `phone-repair-shop`, `print-shop`, `printing-press`, `bookshop`, `shoe-maker`, `spa`, `car-wash`, `internet-cafe`, `petrol-station` / `fuel-station`, `gas-distributor`, `generator-dealer`, `generator-repair`, `electrical-fittings`, `plumbing-supplies`, `building-materials`, `paints-distributor`, `iron-steel`, `welding-fabrication`, `motorcycle-accessories`, `spare-parts`, `tyre-shop`, `florist`, `cleaning-service` / `cleaning-company`, `event-hall` / `events-centre`, `event-planner`, `wedding-planner`, `photography-studio`, `recording-label` (also creator), `music-studio`

**AI capabilities within commerce:**
- Restaurant/bakery: `DEMAND_PLANNING_ADVISORY`, `PRODUCTION_DEMAND_ADVISORY`
- Supermarket: price advisory
- `food-processing`: `PRODUCTION_DEMAND_ADVISORY`

**POS Business** (slug `pos-business`) is implemented and **live in the workspace-app**:
- Product inventory CRUD (create, list, get, update, deactivate)
- Stock adjustment (manual +/−)
- Low-stock alert endpoint
- Sales recording (items, payment method: cash/card/transfer)
- Sales listing + daily summary
- Customer CRM (create, list, get, update)
- Loyalty points (award + redeem)

### 3.3 Transport Verticals (12) ⚠️

Dependency: FRSC verification (`packages/identity/frsc.ts` — implemented). Route licensing NOT yet implemented (deferred from M6c).

`motor-park`, `mass-transit`, `rideshare`, `haulage`, `nurtw` (National Union of Road Transport Workers), `okada-keke`, `courier`, `logistics-delivery`, `cargo-truck`, `dispatch-rider`, `airport-shuttle`, `ferry`

**Key capabilities:** Route scheduling, manifest management, FRSC identity verification, trip/freight pricing.

### 3.4 Civic Verticals (13) ⚠️

Dependency: CAC Incorporated Trustees (`packages/identity/cac.ts` — implemented), community spaces (M7c — implemented).

`church`, `ngo`, `cooperative`, `mosque`, `youth-organization`, `womens-association`, `market-association`, `community-hall`, `orphanage`, `ministry-mission`, `sports-club`, `professional-association`, `road-transport-union`

**Key capabilities:** Member management with tiers, donation collection, event management, community channels, courses.

### 3.5 Politics Verticals (8) ⚠️

Dependency: `packages/core/politics` — scaffolded (`.gitkeep` — needs implementation). Political tables (political_assignments, jurisdictions, candidate_records, term_records) seeded in M2.

`politician`, `political-party`, `campaign-office`, `constituency-office`, `ward-rep`, `government-agency`, `polling-unit`, `government-school` (`govt-school`)

**Key capabilities:** Campaign management, constituent engagement, voting analytics, political social network.  
**AI restriction:** All content generation for political verticals requires **mandatory HITL** before publication.

### 3.6 Health Verticals (9) ⚠️

Dependency: License verification (regulatory body integration — status uncertain ❓).

`clinic`, `pharmacy` / `pharmacy-chain`, `gym-fitness`, `dental-clinic`, `vet-clinic`, `rehab-centre`, `community-health`, `optician`, `elderly-care`

**Key capabilities:** Appointment scheduling, patient records (NDPR-sensitive), prescription management, regulatory compliance metadata.  
**AI restriction:** Medical content generation requires HITL.

### 3.7 Education Verticals (8) ⚠️

`school` / `private-school` / `govt-school`, `driving-school`, `vocational` / `training-institute`, `tutoring` / `nursery-school`, `creche`, `sports-academy`

**Key capability noted:** `creche` — `ENROLLMENT_CAPACITY_ADVISORY` AI capability. Advisory for creche specifically requires HITL (confirmed in VerticalView.tsx: `hitl_required: selectedVertical === 'creche'`).

### 3.8 Agricultural Verticals (12) ✅ (AI capabilities confirmed in verticals.ts)

`abattoir` (SLAUGHTER_YIELD_FORECAST), `agro-input` (INPUT_DEMAND_ADVISORY), `cassava-miller` (MILLING_YIELD_FORECAST), `cocoa-exporter` (COMMODITY_PRICE_ADVISORY), `cold-room` (TEMPERATURE_ALERT_ADVISORY), `fish-market` (DEMAND_PLANNING_ADVISORY), `food-processing` (PRODUCTION_DEMAND_ADVISORY), `palm-oil` (PALM_OIL_YIELD_ADVISORY), `vegetable-garden` (CROP_YIELD_ADVISORY), `produce-aggregator`, `artisanal-mining`, `water-treatment`

**Key capabilities:** Yield forecasting, commodity price advisory, supply chain optimization, cold chain monitoring.

### 3.9 Professional Services (10) ⚠️

`professional` (generic lawyer/doctor), `law-firm`, `accounting-firm`, `tax-consultant`, `land-surveyor`, `handyman`, `it-support`, `construction`, `solar-installer`, `borehole-driller`, `security-company`

**AI restriction:** Legal and medical content requires HITL.

### 3.10 Creator & Media (12) ⚠️

`creator` (individual influencer), `music-studio`, `photography-studio`, `recording-label`, `community-radio`, `newspaper-dist`, `podcast-studio`, `pr-firm`, `talent-agency`, `advertising-agency`, `motivational-speaker`, `print-shop`

### 3.11 Financial Verticals (5) ⚠️

`savings-group` (cooperative savings/ROSCA), `insurance-agent`, `bureau-de-change` (BDC — forex), `mobile-money-agent`, `hire-purchase` (credit)

**Note:** These are heavily regulated. `bureau-de-change` requires CBN BDC license. `mobile-money-agent` requires CBN agent banking authorization.

### 3.12 Place Verticals (8) ⚠️

`market` (multi-vendor marketplace hub), `community-hall`, `container-depot`, `warehouse`, `oil-gas-services`, `property-developer`, `real-estate-agency`, `used-car-dealer`

### 3.13 Institutional / Social / Other (6) ⚠️

`sports-club`, `book-club`, `startup`, `talent-agency`, `oil-gas-services`, `water-vendor`, `waste-management`, `funeral-home`, `clearing-agent`

### 3.14 Vertical FSM States ✅

Every vertical instance traverses this shared FSM:

```
seeded          → Profile record exists; not yet claimed/owned
claimed         → Owner has asserted ownership (KYC T1 minimum required)
doc_verified    → Regulatory documents verified (FRSC / CAC / IT / License)
active          → All requirements met; fully operational
suspended       → Temporarily inactive (compliance failure / non-payment)
deprecated      → Permanently removed
```

Vertical-specific extensions:
- **Transport:** `frsc_verified` → `route_licensed` (route licensing not yet built)
- **Church/NGO:** `it_verified` → `community_active`
- **POS Business:** `inventory_setup`
- **Education:** `courses_published`
- **Creator:** `social_active` → `monetization_enabled`

The FSM is enforced by `packages/claims/src/state-machine.ts` with 36 tests. ✅

### 3.15 AI Capability-to-Vertical Mapping ✅

Verticals with explicit AI capability slugs (confirmed in `apps/workspace-app/src/lib/verticals.ts`):

| Vertical | AI Capability Slug |
|---|---|
| abattoir | SLAUGHTER_YIELD_FORECAST |
| agro-input | INPUT_DEMAND_ADVISORY |
| cassava-miller | MILLING_YIELD_FORECAST |
| cocoa-exporter | COMMODITY_PRICE_ADVISORY |
| cold-room | TEMPERATURE_ALERT_ADVISORY |
| creche | ENROLLMENT_CAPACITY_ADVISORY |
| fish-market | DEMAND_PLANNING_ADVISORY |
| food-processing | PRODUCTION_DEMAND_ADVISORY |
| palm-oil | PALM_OIL_YIELD_ADVISORY |
| vegetable-garden | CROP_YIELD_ADVISORY |

Remaining verticals in the UI registry (pharmacy, hotel, supermarket, laundry, auto-workshop, beauty-salon, barber-shop, tailoring, restaurant, bakery) have **no `aiCapability`** defined — the advisory tab shows an empty state.

---

## 4. User Category Matrix

### 4.1 Platform Operator — super_admin ✅

**Who:** WebWaka engineering/ops team. One or more users with `role = 'super_admin'`.

**Primary surfaces:**
- `apps/platform-admin` — claims HITL, wallet HITL, feature flags, verticals management, settings
- `apps/admin-dashboard` — analytics, monitoring, system health
- `apps/api` — all cross-tenant super_admin routes (claims, wallet admin, partner registration, billing enforcement)

**Capabilities (confirmed in source):**
- Review and approve/reject business profile claim requests (claim FSM advancement)
- Approve/reject wallet HITL funding requests above the threshold (₦100,000 default)
- Configure wallet feature flags (transfers_enabled, withdrawals_enabled, online_funding_enabled, mla_payout_enabled)
- Configure CBN wallet limits per KYC tier (daily_limit_kobo, balance_cap_kobo)
- Register new Partners (`POST /partners`)
- Manage partner status FSM (pending → active → suspended → deactivated)
- View/manage platform-wide billing enforcement
- Expire stale claim requests
- Access audit logs (cross-tenant)
- Trigger CRON-equivalent operations manually

**Access model:** JWT with `role: super_admin`. Any route with `requireSuperAdmin()` guard.

### 4.2 Partners ✅

**Who:** External organizations licensed by WebWaka to resell the platform under their own brand.

**Primary surface:** `apps/partner-admin` (full HTML management dashboard)

**Capabilities:**
- View and manage their own workspace portfolio
- Register and manage sub-partners (if `delegation_rights` entitlement active)
- Allocate AI credit bundles (WakaCreditUnits) to tenant workspaces
- Manage partner-level white-label branding settings
- View partner audit log

**Entitlement dimensions:** `white_label_depth`, `delegation_rights`, `max_sub_partners`, AI credit resale rights (Business tier and above).

**Partner status FSM:** `pending` → `active` → `suspended` → `deactivated` (terminal).

### 4.3 Sub-Partners ✅

**Who:** Downstream entities created by Partners who have `delegation_rights`.

**Capabilities:** Subset of Partner capabilities, bounded by parent Partner's entitlements. Cannot grant sub-partners more than the parent holds.

### 4.4 Tenants (admin / owner) ✅

**Who:** Business owners who have registered a workspace on the platform.

**Primary surface:** `apps/workspace-app` (React PWA)

**Capabilities:**
- Full workspace settings management
- Invite and manage team members (roles: manager, cashier, agent, member)
- Manage business profile (name, phone, description)
- Create/edit/deactivate products / offerings
- Process sales (POS)
- View business analytics and sales history
- Request AI advisory (if plan permits)
- Manage subscription plan (upgrade/downgrade/cancel)
- Manage notification preferences (push, email, low-data mode)
- Manage active sessions (list, revoke individual, revoke all)
- Change password
- NDPR right to erasure (DELETE /auth/me)
- Grant/revoke AI processing consent

**Plan-gated capabilities:**
- `free` plan: Discovery layer only. Commerce metrics (revenue, orders, recent sales) locked. AI not available.
- `growth` plan: Commerce layer unlocked (POS, analytics, sales history). AI advisory available.
- `enterprise` plan: Full feature set including advanced AI capabilities.

### 4.5 Workspace Members ✅

Sub-roles within a tenant workspace:

| Role | Primary Capabilities |
|---|---|
| `admin` | Same as owner for workspace operations (cannot delete workspace) |
| `manager` | Operations + reporting; cannot invite/remove team |
| `cashier` | POS terminal only (record sales, view products) |
| `agent` | Field agent operations; float management |
| `member` | Read-only + limited participation |

Members receive an email invitation (P20-A) with a 24-hour token. Accept-invite flow in workspace-app.

### 4.6 End Users (authenticated, low-trust) ⚠️

**Who:** Customers or members who interact with a tenant's public-facing app (brand-runtime microsite, community portal, ordering system). Not workspace members.

**Capabilities (vertical-dependent):**
- Browse tenant's public product/service listings
- Submit contact forms or booking requests
- Join community spaces (if civic/social vertical)
- Accumulate/redeem loyalty points (via POS CRM)
- Manage NDPR notification consent (email unsubscribe)

### 4.7 Public (unauthenticated) ✅

**Primary surfaces:** `apps/public-discovery`, `apps/brand-runtime`

**Capabilities:**
- Browse the public discovery directory (geography-filtered)
- View entity profiles (businesses, professionals, places)
- Search by vertical category and location
- View brand-runtime microsites
- Submit USSD sessions without registration

### 4.8 USSD Users (*384#) ✅

**Who:** Any mobile phone user in Nigeria, including feature phones with no smartphone/internet requirement.

**Primary surface:** `apps/ussd-gateway`

**Confirmed USSD menu tree:**
```
*384# → 1. Register / 2. Login / 3. Check wallet / 4. Services / 5. Help
  └─ Wallet submenu: balance, fund request, spend history
  └─ Services submenu: browse by vertical category
  └─ Registration: name, phone, PIN setup
```

**USSD constraints:**
- Sessions are stateless beyond 20-character menu strings
- No AI capability (P12 invariant enforced by aiConsentGate)
- PIN-based auth (not JWT) — session tokens stored in KV
- Max 182 characters per USSD response
- Telegram bot integration (for richer interaction beyond USSD limits)

### 4.9 KYC Tier Matrix ✅

| Tier | Name | Verification | Wallet Daily Limit | Wallet Balance Cap |
|---|---|---|---|---|
| T0 | Unverified | None | Wallet not available | — |
| T1 | BVN-lite | Phone + BVN linkage | ₦50,000 | ₦300,000 |
| T2 | BVN verified | Full BVN + face match | ₦200,000 | ₦2,000,000 |
| T3 | Full KYC | BVN + NIN + CAC/FRSC | Unlimited | Unlimited |

KYC minimum for wallet creation and operations: **T1**.

---

## 5. UI/UX Surface Inventory

### 5.1 Workspace App (React PWA — Primary Tenant Back-Office) ✅

**Technology:** React 18, Vite 5, TypeScript, react-router-dom v6, PWA plugin (Vite PWA). Installable on Android/iOS via manifest.

**URL routes:**

| Route | Component | Auth Required | Description |
|---|---|---|---|
| `/login` | `Login.tsx` | Guest only | Email + password login form |
| `/register` | `Register.tsx` | Guest only | New workspace registration (email, password, business name, phone) |
| `/forgot-password` | `ForgotPassword.tsx` | Guest only | Request password reset email |
| `/reset-password` | `ResetPassword.tsx` | Guest only | Consume reset token, set new password |
| `/verify-email` | `VerifyEmail.tsx` | Public (token in URL) | Consume email verification token (P20-C) |
| `/accept-invite` | `AcceptInvite.tsx` | Public (token in URL) | Accept workspace member invitation (P20-A) |
| `/dashboard` | `Dashboard.tsx` | Required | Business overview, KPIs, quick actions, recent sales |
| `/pos` | `POS.tsx` | Required | Point-of-sale terminal (product grid → cart → checkout → receipt) |
| `/offerings` | `Offerings.tsx` | Required | Product/service catalog management |
| `/offerings/new` | `Offerings.tsx` | Required | New offering creation form |
| `/vertical` | `VerticalView.tsx` | Required | Vertical profile, overview, AI advisory, compliance checker |
| `/settings` | `Settings.tsx` | Required | Profile, team, notifications, appearance, security |
| `*` | `NotFound` | — | 404 page with navigation back to dashboard |
| `/` | Redirect → `/dashboard` | — | Root redirect |

**Layout components:**
- `WorkspaceLayout.tsx` — authenticated shell: sidebar (desktop) + bottom nav (mobile) + notification bell + skip-to-content link (accessibility)
- `Sidebar.tsx` — desktop navigation: Dashboard, POS, Offerings, Vertical, Settings
- `BottomNav.tsx` — mobile navigation (5-item tab bar)
- `NotificationBell.tsx` — real-time notification icon with unread badge
- `NotificationDrawer.tsx` — notification list drawer (slide-in panel)
- `RequireGuest` — route guard: redirects authenticated users away from auth pages

**UI library:** Custom components (`Button.tsx`, `Input.tsx`, `Spinner.tsx`). No external UI framework — inline styles throughout.

**Key UI states documented:**

*Dashboard (`/dashboard`):*
- Loading skeleton (data fetches with `Promise.allSettled`)
- Partial error state (some cards failed — toast warning shown)
- Free plan state (commerce KPIs locked with "—" placeholder, upgrade prompt banner)
- Email unverified banner (amber, dismissible, with "Send verification" action)
- Upgrade prompt banner (blue, links to `/settings`)
- Time-aware greeting ("Good morning/afternoon/evening")
- Tenant ID badge in header
- Subscription status badge (active = green, otherwise = red)
- 4 stat cards: Revenue today, Orders today, Active offerings, Plan
- 4 quick action cards: New sale → POS, Add offering → Offerings, Vertical view, AI Advisory
- Recent sales list (up to 5) with payment method and formatted Naira amounts

*POS (`/pos`):*
- Product grid (auto-fill 140px min tiles) with search
- Per-product: name, emoji 📦, category label, price, SKU unit, stock quantity (red if <5)
- Empty states: no products ("Add some in Offerings"), no search match, loading
- Cart panel (sticky, right column on desktop)
- Cart items: qty controls (−/+), per-item total, "Clear" button
- Payment method selector: Cash / Card / Transfer (3 toggle buttons)
- Checkout button with loading state
- Receipt overlay on success: order ID, total, "New sale" reset button
- 403 guard (plan not eligible) → toast error

*Offerings (`/offerings`):*
- ❓ Full source not read in this session — catalog management form with product CRUD

*VerticalView (`/vertical`):*
- Vertical selector dropdown (all 20 verticals from VERTICAL_REGISTRY)
- 3 tabs: Overview / Advisory / Compliance
- Overview tab: status, profile ID, AI capability, FSM state — 4 info cards + description section
- Advisory tab: AI capability check (empty state for non-AI verticals), "Request advisory" button with 1.5s mock delay, HITL warning banner for creche, recommendations list
- Compliance tab: 5 items (NDPR, NAFDAC, CAC, FIRS, SON) with PASS/PENDING badges

*Settings (`/settings`):*
- 5 tabs: Profile / Team / Notifications / Appearance / Security
- Profile tab: business name, phone (PATCH /auth/profile via P19-B)
- Team tab: invite by email + role (admin only), pending invitations list, revoke invitation
- Notifications tab: push notifications toggle, low-data mode toggle (N-070)
- Appearance tab: dark mode toggle (persisted to localStorage)
- Security tab: change password form, active sessions list, revoke individual session, revoke all other sessions

**Auth state management (`AuthContext.tsx`):**
- `useReducer` with INIT_START / INIT_DONE / LOGIN / LOGOUT actions
- Persists token in `localStorage.ww_token` (both access and refresh — same token, AUT-004 fix)
- `GET /auth/me` on mount to hydrate user profile
- Best-effort server-side logout (P19-C)

**Notification polling (`useNotificationPoll.ts`):** ⚠️ Polls the API for unread notification count on a timer to update the bell badge.

**Currency formatting (`lib/currency.ts`):** ✅ `formatNaira(kobo)` — converts integer kobo to "₦X,XXX.XX" string.

**API client (`lib/api.ts`):** ⚠️ Token-injecting fetch wrapper with automatic refresh via `/auth/refresh`. `ApiError` class with status code. `authApi` namespace for auth-specific calls.

### 5.2 Platform Admin (Hono HTML — Super-Admin Ops) ✅

**Technology:** Hono Worker serving HTML pages. Dev shim: `apps/platform-admin/server.js` (Node.js). Auth: JWT super_admin required on all routes.

**Routes confirmed:**

| Route | Description |
|---|---|
| `GET /admin/claims` | List claim requests (filterable by status: pending/approved/rejected/expired/all) |
| `GET /admin/claims/:id` | Claim detail + evidence viewer |
| `POST /admin/claims/:id/approve` | Approve claim → profile state advances to `verified` |
| `POST /admin/claims/:id/reject` | Reject claim (with optional reason) → profile state reverts to `claimable` |
| `POST /admin/claims/expire-stale` | Expire all pending claims older than 30 days |
| `GET /platform-admin/wallets/hitl-queue` | Wallet HITL funding queue ⚠️ |
| `POST /platform-admin/wallets/funding/:id/confirm` | Super-admin approves HITL funding → balance cap re-checked, wallet credited |
| `POST /platform-admin/wallets/funding/:id/reject` | Rejects with reason |
| `PATCH /platform-admin/wallets/feature-flags` | Toggle wallet feature flags |
| `GET /platform-admin/wallets/feature-flags` | Current feature flag state |
| `GET/PATCH /platform-admin/settings` | Platform-level settings ⚠️ |
| `GET/POST /platform-admin/verticals` | Vertical management ⚠️ |
| Various billing/admin routes | ⚠️ |

**HTML UI:** Rendered via Hono's JSX/HTML rendering — standard server-rendered HTML with forms. No React/SPA framework.

### 5.3 Partner Admin (Hono HTML — Partner Management Dashboard) ✅

**Technology:** Hono Worker. Auth: JWT partner role. Full HTML management dashboard.

**Confirmed capabilities:**
- View partner profile and status
- View/manage sub-partners list
- Create sub-partners (if `delegation_rights` entitlement)
- View partner entitlements
- Access partner audit log
- View AI credit balance

**Partner status FSM visible in UI:** pending → active → suspended → deactivated (terminal — cannot reverse).

### 5.4 Public Discovery (Hono HTML — Marketplace Front-End) ⚠️

**Technology:** Hono Worker. Public access (no auth required). Pillar 3 of the 3-in-1.

**Confirmed capabilities:**
- Browse entities by geography (zone → state → LGA → ward hierarchy)
- Browse by vertical category (160 categories)
- Search by name / keyword
- View entity profile pages (verified/unverified badge, claim state, offerings listed)
- Initiate claim request for unclaimed profiles
- Featured placement for paying tenants

**Offline caching:** Static assets + entity profile shells cached via service worker (P5 + P6 invariants).

### 5.5 Brand Runtime (Hono HTML — White-Label Tenant Microsites) ⚠️

**Technology:** Hono Worker. Domain-routed — each tenant can map a custom domain. Auth: optional (for protected microsite sections).

**Confirmed capabilities:**
- Serve branded website/microsite for a tenant entity
- Display customized colors, logo, business name (white-label depth per subscription)
- List tenant offerings/products with pricing
- Contact form submission
- Integration with community space (if civic vertical)
- Entitlement middleware: `branding-entitlement.ts` — blocks rendering if tenant not on a branding-eligible plan

**White-label depth levels:**
- `white_label_depth: 0` — no custom branding, default WebWaka template
- `white_label_depth: 1` — custom logo + colors
- `white_label_depth: 2` — full custom domain + template
- `white_label_depth: 3` — fully white-labeled (no WebWaka attribution)

### 5.6 USSD Gateway (*384#) ✅

**Technology:** Hono Worker. Handles both USSD provider HTTP callbacks and Telegram bot webhook.

**Menu tree (confirmed in Worker source from prior session):**

```
*384# entry:
  1. Register
     └─ Enter name → Enter phone → Set 4-digit PIN → "Welcome to WebWaka!"
  2. Login
     └─ Enter phone → Enter PIN → Main menu
  3. Check wallet
     └─ Balance / Fund wallet / Spend history
  4. Services
     └─ Browse by category → Select business → View offerings
  5. Help
     └─ Contact info / FAQ shortcode
```

**Telegram webhook:**
- Handles `/start`, `/help`, `/balance`, `/register`, `/status` commands
- Richer text responses (beyond 182 USSD char limit)
- Links out to workspace-app PWA for full functionality

**USSD constraints enforced:**
- AI disabled (P12)
- 20-second session timeout
- PIN-based authentication (not JWT)
- Nigerian phone format validation (+234/0)

### 5.7 Admin Dashboard (Hono HTML — Legacy Admin Ops) ⚠️

**Technology:** Hono Worker. Auth: JWT super_admin. Confirmed to be a separate app from platform-admin (this is the older "admin-dashboard").

**Inferred capabilities:**
- Platform-wide analytics: registrations/day, active tenants, transaction volume
- System health indicators
- Event log viewer
- D1 migration status

### 5.8 Tenant Public (Hono HTML — Unsubscribe Page) ✅

Single-purpose Worker. Handles `GET /unsubscribe?token=<token>` — NDPR notification opt-out via email link.

### 5.9 Notification System (Notificator Worker) ✅

**Technology:** Hono Worker with Queue consumer + Cron trigger.

**Notification channels:** email (Resend), push (Web Push / FCM), SMS (provider TBD), in-app (polled by workspace-app).

**Notification types confirmed from routes:**
- Auth events: login, password reset, invite, email verification
- Billing events: plan upgrade/downgrade, payment due, subscription suspended
- Wallet events: funding confirmed, HITL required, spend recorded, payout credited
- POS events: low stock alert, daily sales digest
- Community events: new message, course enrollment, event reminder
- Platform events: claim approved/rejected, profile verified

**Low-data mode (N-070):** ✅ Users can toggle low-data mode to reduce notification frequency. Setting stored in DB (`notification_preferences.low_data_mode`). Available in Settings > Notifications tab in workspace-app.

**NDPR erasure propagation:** When a user invokes RIGHT TO ERASURE (DELETE /auth/me), `propagateErasure()` from `@webwaka/notifications` is called to remove notification records.

### 5.10 Offline/PWA Surfaces ✅

**Service worker files confirmed:**
- `apps/workspace-app` — Vite PWA plugin generates SW with precache manifest
- `apps/public-discovery` — inline SW in Worker index.ts
- `apps/brand-runtime` — inline SW

**Offline capabilities:**
- `offline.html` — custom offline page (previously bug-fixed in Round 6B)
- IndexedDB queue for pending writes (`@webwaka/offline-sync`)
- Background Sync API for write replay on reconnect
- Conflict resolution: server-wins (latest timestamp) for most entities
- Cache-first for static assets; network-first + cache-fallback for entity profiles

**PWA install flow:**
- `manifest.json` with `display: standalone`, icons, theme_color (#0F4C81 — WebWaka blue)
- Install prompt handled in workspace-app

---

## 6. Scenario & Use-Case Catalog

### 6.1 Auth & Identity Scenarios ✅

| Scenario | Entry point | Actors | Key API calls | Invariants |
|---|---|---|---|---|
| New workspace registration | `/register` | New user | `POST /auth/register` | T3, P2 (phone validation Nigerian format) |
| Login with valid credentials | `/login` | Existing user | `POST /auth/login` | JWT issued, session written to KV |
| Login with wrong password | `/login` | Any | `POST /auth/login` | 401 returned, no token |
| Login lockout after N failures | `/login` | Attacker | Rate limit KV | Rate limiter triggers |
| Forgot password flow | `/forgot-password` | User | `POST /auth/forgot-password` → email | KV token TTL 1 hour |
| Reset password with valid token | `/reset-password?token=X` | User | `POST /auth/reset-password` | KV token consumed, invalidated after use |
| Reset password with expired token | `/reset-password?token=X` | User | `POST /auth/reset-password` | 400/410 returned |
| Change password (authenticated) | Settings > Security | User | `POST /auth/change-password` | Old password verified first |
| Refresh expiring JWT | Automatic (api.ts) | User | `POST /auth/refresh` | New JWT issued, old blacklisted |
| Server-side logout | Settings / explicit logout | User | `POST /auth/logout` | KV blacklist, all sessions cleared |
| Email verification (send) | Dashboard banner | User | `POST /auth/send-verification` | Throttled 5-min re-send; KV token 24h TTL |
| Email verification (consume) | Email link → `/verify-email` | User | `GET /auth/verify-email?token=X` | emailVerifiedAt set |
| Send invite to team member | Settings > Team (admin) | Admin | `POST /auth/invite` | 24h invite token, role-gated |
| Accept workspace invite | `/accept-invite?token=X` | Invitee | `POST /auth/accept-invite` | Creates user + workspace_member record |
| Revoke pending invite | Settings > Team (admin) | Admin | `DELETE /auth/invite/:id` | Token invalidated |
| View active sessions | Settings > Security | User | `GET /auth/sessions` | Lists sessions with device hint |
| Revoke specific session | Settings > Security | User | `DELETE /auth/sessions/:id` | Session removed from KV |
| Revoke all other sessions | Settings > Security | User | `DELETE /auth/sessions` | All except current cleared |
| NDPR Right to Erasure | Settings (advanced) | User | `DELETE /auth/me` | Cascade via propagateErasure() |
| Update profile | Settings > Profile | User | `PATCH /auth/profile` | Phone Nigerian format enforced |
| JWT verify (inter-service) | Internal | Service | `POST /auth/verify` | Decodes payload, returns claims |

### 6.2 Onboarding Scenarios ⚠️

| Scenario | Description |
|---|---|
| Self-service registration | User fills register form → workspace + tenant created atomically → JWT issued → redirected to dashboard |
| Claim-first business profile | User discovers their business in public discovery → initiates claim → uploads documents → super-admin reviews → profile state advances to verified |
| KYC upgrade T0 → T1 | User provides BVN → verified → wallet creation unlocked |
| KYC upgrade T1 → T2 | User provides BVN + face match → daily limit increases to ₦200k |
| KYC upgrade T2 → T3 | User provides BVN + NIN + CAC/FRSC → unlimited wallet |
| Vertical activation | Admin claims a profile → sets up inventory/offerings → FSM reaches `active` |

### 6.3 POS & Commerce Scenarios ✅

| Scenario | Entry | Actors | API |
|---|---|---|---|
| Add product to inventory | `/offerings/new` | Admin/manager | `POST /pos-business/products` |
| Update product price | `/offerings` | Admin | `PATCH /pos-business/product/:id` |
| Adjust stock count | `/offerings` | Admin | `POST /pos-business/product/:id/stock` |
| Deactivate product | `/offerings` | Admin | `DELETE /pos-business/product/:id` |
| View low-stock alert | Dashboard / Offerings | Admin | `GET /pos-business/products/:id/low-stock` |
| Record cash sale | `/pos` | Cashier | `POST /pos-business/sales` (payment_method: cash) |
| Record card sale | `/pos` | Cashier | `POST /pos-business/sales` (payment_method: card) |
| Record bank transfer sale | `/pos` | Cashier | `POST /pos-business/sales` (payment_method: transfer) |
| Sale with multiple items | `/pos` | Cashier | Cart array in POST body |
| View receipt after sale | `/pos` (receipt overlay) | Cashier | In-memory state after POST |
| Clear cart | `/pos` | Cashier | Client-side only |
| View sales history | `/dashboard` | Admin | `GET /pos-business/sales/:workspaceId?limit=5` |
| View daily sales summary | `/dashboard` | Admin | `GET /pos-business/sales/:workspaceId/summary` |
| Register customer in CRM | — | Staff | `POST /pos-business/customers` |
| Award loyalty points | — | Staff | `POST /pos-business/customer/:id/loyalty/award` |
| Redeem loyalty points | — | Staff | `POST /pos-business/customer/:id/loyalty/redeem` |
| POS on free plan | `/pos` | Free user | 403 from API → toast "Commerce features not available" |
| POS with no products | `/pos` | Any | Empty grid with "Add some in Offerings" message |
| POS search — no match | `/pos` | Any | "No products match your search" empty state |
| Checkout with empty cart | `/pos` | Any | toast.error('Cart is empty') |

### 6.4 Wallet (HandyLife) Scenarios ✅

| Scenario | Entry | Actors | API | Notes |
|---|---|---|---|---|
| Create wallet | Wallet page | T1+ user | `POST /wallet` | Requires NDPR payment_data consent |
| Check balance | Wallet / USSD | User | `GET /wallet/balance` | |
| View ledger history | Wallet | User | `GET /wallet/ledger` | |
| Initiate bank transfer funding | Wallet | User | `POST /wallet/fund/bank-transfer` | Offline only (Phase 1) |
| Submit bank transfer proof | Wallet | User | `POST /bank-transfer/:id/proof` | |
| Standard funding confirmation (below HITL threshold) | Admin | Admin | `POST /bank-transfer/:id/confirm` | Auto-credits wallet |
| HITL funding ≥₦100k | Admin | Admin | `POST /bank-transfer/:id/confirm` | Sets hitl_required=1, fires event |
| Super-admin HITL approve | Platform Admin | super_admin | `POST /platform-admin/wallets/funding/:id/confirm` | Balance cap re-checked (WF-032) |
| Super-admin HITL reject | Platform Admin | super_admin | `POST /platform-admin/wallets/funding/:id/reject` | |
| Wallet-to-wallet transfer | — | User | `POST /wallet/transfer` | 503 FEATURE_DISABLED (Phase W3+) |
| Withdrawal | — | User | `POST /wallet/withdraw` | 503 FEATURE_DISABLED (Phase W3+) |
| Online funding (Paystack) | — | User | `POST /wallet/fund/online` | 503 FEATURE_DISABLED (Phase W5) |
| MLA earnings view | Wallet | Agent | `GET /wallet/mla-earnings` | |
| MLA payout trigger | CRON (projections) | CRON | Internal | Off until mla_payout_enabled=1 |
| Daily spend limit exceeded | Any spend | User | 429/403 from API | checkDailyLimit() via KYC gate |
| Balance cap exceeded | Fund request | User | 400 from API | checkBalanceCap() |
| Wallet consent revoked | Any wallet op | User | 403 NDPR_CONSENT_REQUIRED | |
| Wallet for ineligible tenant | Any wallet op | User | 403 TENANT_NOT_ELIGIBLE | assertTenantEligible() |
| Feature flag disabled | Transfer/Withdrawal/Online | User | 503 with friendly message | isFeatureEnabled() |

### 6.5 AI Advisory (SuperAgent) Scenarios ✅

| Scenario | Entry | Actors | API | HITL? |
|---|---|---|---|---|
| Grant AI consent | Settings or first use | User | `POST /superagent/consent` | No |
| Revoke AI consent | Settings | User | `DELETE /superagent/consent` | No |
| Check consent status | Settings / on load | User | `GET /superagent/consent` | No |
| Request text generation | VerticalView > Advisory | User | `POST /superagent/chat` (capability: TEXT_GENERATION) | Only for political/legal/medical |
| Request AI advisory for palm-oil | `/vertical?tab=advisory` | User | SuperAgent with PALM_OIL_YIELD_ADVISORY | No |
| Request advisory — no AI capability | `/vertical?tab=advisory` | User | Empty state rendered (no API call) | N/A |
| Request advisory — creche | `/vertical?tab=advisory` | User | ENROLLMENT_CAPACITY_ADVISORY | Yes — HITL banner shown |
| AI on free plan | Any | Free user | 402 returned from /superagent/chat | N/A |
| AI on USSD | USSD session | USSD user | Blocked by aiConsentGate (P12) | N/A |
| BYOK — workspace key | Settings (advanced) | Admin | Key resolution: workspace BYOK first | N/A |
| BYOK — user key | Settings (personal) | User | Key resolution: user BYOK | N/A |
| Credit exhaustion | Any AI call | User | 402 with "insufficient credits" | N/A |
| AI provider fallback | Any AI call | System | DeepSeek fails → OpenRouter → GPT-4o-mini | Auto |
| View AI usage history | Settings | User | `GET /superagent/usage` | No |

### 6.6 Subscription & Billing Scenarios ✅

| Scenario | Entry | Actors | API |
|---|---|---|---|
| View billing status | Dashboard / Settings | User | `GET /billing/status` |
| Upgrade from free to growth | Settings | Admin | `POST /billing/change-plan` (plan: growth) |
| Downgrade from growth to free | Settings | Admin | `POST /billing/change-plan` (plan: free) |
| Cancel subscription (schedule) | Settings | Admin | `POST /billing/cancel` |
| Undo scheduled cancellation | Settings | Admin | `POST /billing/revert-cancel` |
| Subscription grace period | Automatic | System | 7-day grace after billing failure |
| Subscription suspended | Automatic | System | `POST /billing/enforce` (admin-triggered) |
| Reactivate suspended subscription | Settings | Admin | `POST /billing/reactivate` |
| View plan change history | Settings | Admin | `GET /billing/history` |
| Free plan — commerce locked | Dashboard | Free user | Client-side gating (billing.plan === 'free') |
| Free plan — AI locked | Any AI attempt | Free user | 402 from superagent |

### 6.7 Partner & Sub-Partner Scenarios ✅

| Scenario | Actors | API |
|---|---|---|
| Register new partner | super_admin | `POST /partners` |
| Activate partner | super_admin | `PATCH /partners/:id/status` → active |
| Suspend partner | super_admin | `PATCH /partners/:id/status` → suspended |
| Deactivate partner (terminal) | super_admin | `PATCH /partners/:id/status` → deactivated |
| View partner entitlements | Partner admin / super_admin | `GET /partners/:id/entitlements` |
| Set white_label_depth | super_admin | `POST /partners/:id/entitlements` |
| Create sub-partner | Partner (if delegation_rights) | `POST /partners/:id/sub-partners` |
| Sub-partner limit reached | Partner | 400 from API |
| View partner audit log | Partner admin | `GET /partners/:id/audit-log` ⚠️ |
| Partner AI credit resale | Partner (Business+ tier) | `POST /partners/:id/ai-credits` ⚠️ |

### 6.8 Community & Social Scenarios ⚠️

| Scenario | Description |
|---|---|
| Create community space | Admin creates a space (public/private) for their vertical |
| Create channel within space | Admin creates a channel (announcements, discussion, etc.) |
| Post message to channel | Member posts text/media |
| Create and publish course | Admin publishes course with modules and lessons |
| Enroll in course | Member enrolls, progress tracked |
| Schedule community event | Admin creates event with registration |
| Register for event | Member registers |
| Follow another user/entity | Social follow relationship (social.ts) |
| View follower/following count | Profile page (public-discovery or brand-runtime) |
| Post to social feed | Creator/professional posts content |

### 6.9 Discovery & Claim Scenarios ✅

| Scenario | Entry | Actors | API |
|---|---|---|---|
| Browse entities by geography | Public discovery | Public | `GET /discovery?lga_id=X&vertical=restaurant` |
| Search entities by name | Public discovery | Public | `GET /discovery?q=name` |
| View entity profile | Public discovery | Public | `GET /profiles/:id` |
| Submit claim request | Discovery profile page | Business owner | `POST /claim` |
| Provide verification evidence | Claim flow | Business owner | `POST /claim/:id/evidence` ⚠️ |
| Admin reviews pending claim | Platform Admin | super_admin | `GET /admin/claims` |
| Admin approves claim | Platform Admin | super_admin | `POST /admin/claims/:id/approve` → profile: verified |
| Admin rejects claim | Platform Admin | super_admin | `POST /admin/claims/:id/reject` → profile: claimable |
| Claim expires after 30 days | CRON / Admin | super_admin | `POST /admin/claims/expire-stale` |
| Entity featured in discovery | Admin pays Growth+ | System | Visibility rights entitlement |

### 6.10 Notification Scenarios ✅

| Scenario | Channel | Trigger |
|---|---|---|
| Welcome email on registration | Email | POST /auth/register |
| Password reset email | Email | POST /auth/forgot-password |
| Email verification link | Email | POST /auth/send-verification |
| Workspace invite email | Email | POST /auth/invite |
| Sale recorded notification | In-app | POST /pos-business/sales |
| Low-stock alert | Email + In-app | Stock level drops below threshold |
| Wallet funded | In-app + Email | confirmFunding() |
| Wallet HITL required | In-app (super-admin) | HITL threshold exceeded |
| Subscription expiring (3-day warning) | Email | CRON (projections) |
| Subscription suspended | Email | billing enforcement |
| Claim approved/rejected | Email + In-app | Admin action |
| Low-data mode active | All channels | Notification frequency reduced, delivery batched |
| Unsubscribe from notifications | Email link | GET /unsubscribe?token=X |
| Push notification (Web Push) | Browser | Any trigger on notification_preferences |

### 6.11 USSD Scenarios ✅

| Scenario | USSD String |
|---|---|
| Check wallet balance (unregistered) | *384# → 2. Login (prompted to register) |
| Check wallet balance (registered) | *384# → 2. Login → 3. Check wallet → 1. Balance |
| Register new account via USSD | *384# → 1. Register → name → phone → PIN |
| Browse local services | *384# → 4. Services → select category → select business |
| Get help | *384# → 5. Help |
| Telegram bot: check balance | Telegram → /balance |
| Telegram bot: register | Telegram → /register |

### 6.12 Compliance & NDPR Scenarios ✅

| Scenario | Description |
|---|---|
| NDPR payment_data consent gate | Required before wallet creation or spend |
| NDPR AI processing consent | Required before any SuperAgent call |
| Consent revocation | User revokes → specific operations return 403 |
| Right to Erasure | DELETE /auth/me → cascade deletion → propagateErasure() for notifications |
| Audit log for all wallet mutations | Every wallet mutation writes to audit_logs (WF-034) |
| IP masking in audit logs | ip_masked = '?.?.?.?' (all octets masked, NDPR data minimisation) |
| Consent retention | Records retained 7 years per NDPR Article 26 |
| NDPR notification opt-out | Email unsubscribe → tenant-public Worker |
| AI PII stripping | stripPii() called on AI messages (P13) |
| AI post-processing check | postProcessCheck() scans AI output for inadvertent PII |
| AI sensitive sector detection | isSensitiveVertical() gates legal/medical/political content → HITL |

### 6.13 CRON & Background Job Scenarios ✅

**CRON runs daily at 04:00 WAT (projections Worker):**

| Job | Description |
|---|---|
| Search projections | Rebuild geo-filtered discovery search index from D1 entity data |
| Analytics rollup | Aggregate daily KPIs per tenant (revenue, orders, new members) |
| HITL queue sweep | Escalate HITL wallet items older than 4 business hours |
| Wallet expiry | Expire pending bank-transfer funding requests older than 7 days |
| MLA payout engine | Credit payable MLA earnings to earner wallets (OFF until flag enabled) |
| Subscription enforcement | Check subscriptions in grace/past-due, send expiry warnings at 3-day mark, suspend at 0-day |

**Queue consumer (Notificator Worker):**

The `notificator` Worker consumes from the Cloudflare Queue (event bus). Each `publishEvent()` call in the API Worker pushes an event; the queue delivers it to notificator for fan-out.

### 6.14 Offline & Sync Scenarios ✅

| Scenario | Description |
|---|---|
| User goes offline during POS | Checkout button → write queued to IndexedDB |
| Reconnect → sync fires | Background Sync API calls replays the queue |
| Conflict: server wins | If server has newer timestamp, server version kept |
| Offline discovery browse | Previously cached entity profiles served from SW cache |
| Offline PWA install | App installable from `/` — precached shell + offline.html fallback |
| Service worker update | SW version bump → clients prompted to refresh |

---

## 7. Coverage Gaps & Open Questions

The following items could not be fully verified in this research session and represent gaps for the QA matrix to address:

### 7.1 UI/UX Gaps

| Gap | Status | Notes |
|---|---|---|
| `apps/workspace-app/src/pages/Offerings.tsx` | ❓ | Not read — product management form UI unknown. Does it support categories? Bulk import? |
| Workspace-app mobile POS layout | ❓ | Desktop 2-col grid + sticky cart confirmed but mobile breakpoint behavior for POS is unconfirmed |
| Dark mode CSS variables coverage | ❓ | `data-theme=dark` set but implementation of CSS variables across all pages not verified |
| Notification drawer UI | ❓ | `NotificationDrawer.tsx` exists but content not read |
| Admin dashboard HTML screens | ❓ | admin-dashboard Worker app source not read in detail this session |
| Partner admin HTML screens (full) | ❓ | partner-admin Worker source confirmed present but full HTML screens not read |
| Brand runtime microsite templates | ❓ | brand-runtime Worker confirmed but template design/layout not read |
| Public discovery HTML layout | ❓ | public-discovery Worker confirmed but HTML templates not read |
| USSD menu edge cases | ❓ | USSD menu tree confirmed at high level but specific error handling (invalid PIN, session timeout recovery) not confirmed |
| VerifyEmail page UX | ❓ | Component exists, UX flow not confirmed (success/failure/expired states) |
| AcceptInvite page UX | ❓ | Component exists, UX flow not confirmed |
| wallet.html / offline.html | ⚠️ | Previously bug-fixed in Round 6B — functionality present but wallet.html specific UX flows not re-read |

### 7.2 API / Feature Gaps

| Gap | Status | Notes |
|---|---|---|
| Route licensing for transport verticals | ❓ | Deferred from M6c — motor-park/rideshare cannot fully operate without it |
| `packages/core/politics` implementation | ❓ | Scaffolded only (`.gitkeep`) — no political vertical operational |
| WakaCU wallet (partner credits) | ❓ | ADL-008 — tables defined, implementation pending (Phase 3 partner billing) |
| Online funding (Paystack Virtual Account) | ❓ | Feature flag OFF, W5 target — not implemented |
| Wallet-to-wallet transfers | ❓ | Feature flag OFF, W3+ target |
| MLA payout engine | ⚠️ | Code exists in projections CRON but feature flag OFF pending Founder sign-off |
| B2B marketplace routes | ⚠️ | `b2b-marketplace.ts` exists in routes — contents not read |
| Negotiation routes | ⚠️ | `negotiation.ts` exists — contents not read |
| Commerce p2/p3 batch verticals | ⚠️ | `verticals-commerce-p2.ts`, `verticals-commerce-p2-batch2.ts`, `verticals-commerce-p3.ts` — full contents not read |
| Profiles routes | ⚠️ | `profiles.ts` exists — contents not read |
| FX rates routes | ⚠️ | `fx-rates.ts` exists — possibly for BDC vertical |
| Identity verification API | ⚠️ | `identity.ts` — FRSC/CAC/NIN verification route shapes not confirmed |
| Contact routes | ⚠️ | `contact.ts` — purpose not fully confirmed |
| Sync routes | ⚠️ | `sync.ts` — offline sync conflict resolution endpoint shape not confirmed |
| Templates routes | ⚠️ | `templates.ts` — email/notification template management |
| Workspace analytics routes | ⚠️ | `workspace-analytics.ts` — tenant-level analytics dashboard endpoint |
| Platform admin billing routes | ⚠️ | `platform-admin-billing.ts` — super-admin billing enforcement details |

### 7.3 Governance / Process Gaps

| Gap | Status |
|---|---|
| Partner Phase 3 (billing + revenue share) | NOT STARTED |
| Partner Phase 4 (analytics + cascading entitlements) | NOT STARTED |
| Africa expansion architecture (P3) | Documented, not implemented |
| Route licensing for transport | Deferred |
| Politics vertical implementation | Scaffolded only |
| Used car dealer backfill guide | Exists (`docs/plans/used-car-dealer-backfill-guide.md`) — specific requirements ❓ |

### 7.4 Edge States Requiring Attention

| Edge State | Area | Notes |
|---|---|---|
| Workspace without workspaceId | Auth/POS | `workspaceId` is optional on AuthUser — POS and dashboard guard against `null` with early returns |
| JWT refresh race condition | Auth | Multiple tabs refreshing simultaneously could cause token conflicts |
| Balance cap race (WF-032) | Wallet | Confirmed fixed — re-check at HITL confirm time |
| Concurrent HITL approvals | Wallet | Two admins approving same HITL item? Idempotency not confirmed |
| Offline cart sync + stock deduction | POS + Offline | Cart written offline → stock may be depleted by another cashier before sync |
| KV parsing NaN (wallet limits) | Wallet | Fixed 2026-04-21 — still worth regression-testing |
| Claim FSM concurrent submissions | Claims | Two users claiming same profile simultaneously — FSM guard behavior under race ❓ |
| USSD session abandoned mid-flow | USSD | Session timeout recovery, KV cleanup ❓ |
| Dark mode + email verification banner | Dashboard | Banner uses inline styles — dark mode CSS variables may not apply |
| Low-data mode + push notifications | Notifications | Batch delivery behavior not confirmed |

---

## 8. Verification Status Summary

| Section | Items | Verified ✅ | Strongly Implied ⚠️ | Uncertain ❓ |
|---|---|---|---|---|
| Runtime infrastructure | 10 | 10 | 0 | 0 |
| Application inventory | 11 | 11 | 0 | 0 |
| Platform invariants | 18 | 18 | 0 | 0 |
| Vertical count and registry | 160 | 20 (UI registry) | 140 (route files exist) | 0 |
| Vertical FSM states | 6 base + extensions | 6 | extensions | 0 |
| AI capability matrix | 13 capability types | 13 | 0 | 0 |
| User category roles | 7 | 7 | 0 | 0 |
| KYC tier limits | 4 tiers | 4 | 0 | 0 |
| Workspace app routes | 11 | 11 | 0 | 0 |
| Workspace app components | 14 | 12 | 2 | 0 |
| Workspace app pages (detailed) | 7 | 5 | 0 | 2 (Offerings, AcceptInvite UX) |
| Platform admin routes | 10+ | 5 | 5+ | 0 |
| Auth API endpoints | 21 | 21 | 0 | 0 |
| Wallet API endpoints | 20+ | 15 | 5+ | 0 |
| POS Business API endpoints | 16 | 16 | 0 | 0 |
| SuperAgent API endpoints | 5 | 5 | 0 | 0 |
| Billing API endpoints | 7 | 7 | 0 | 0 |
| Partner API endpoints | 6+ | 4 | 2+ | 0 |
| CRON jobs | 6 | 6 | 0 | 0 |
| Notification types | 15+ | 8 | 7+ | 0 |
| USSD menus | 5 main + sub-menus | 5 | sub-menu details | 0 |
| NDPR compliance scenarios | 8 | 8 | 0 | 0 |
| D1 table families | 14 | 8 | 6 | 0 |
| **TOTAL ITEMS** | **~300** | **~230 (77%)** | **~55 (18%)** | **~15 (5%)** |

---

## 9. Most Important UI/UX Areas to QA First

The following ranking is based on: (a) user-facing impact, (b) monetary/compliance risk, (c) complexity of the flow, and (d) number of edge states identified.

### Tier 1 — Critical (test these first)

| Priority | Area | Why Critical |
|---|---|---|
| 1 | **Auth flow end-to-end** (login → register → forgot-password → reset) | Entry gate to the entire platform. Bugs here lock all users out. JWT refresh race condition is a known risk. |
| 2 | **POS checkout flow** (product grid → cart → payment method → checkout → receipt) | Core revenue-generating flow. Cart state bugs or payment method misrouting would directly affect daily income reporting. |
| 3 | **Wallet funding + HITL flow** | Monetary integrity (T4) — a bug here can incorrectly credit or double-credit user balances. Balance cap re-check (WF-032) must be regression-tested. |
| 4 | **Subscription plan gating** (free vs growth vs enterprise) | Free plan locks commerce + AI features. Incorrect gating can give free users paid features (revenue loss) or block paying users (churn). |
| 5 | **Email verification + invite acceptance** (P20-A, P20-C) | Token TTL, expired token handling, concurrent acceptance. Broken invite flow blocks team collaboration. |

### Tier 2 — High Importance

| Priority | Area | Why Important |
|---|---|---|
| 6 | **Dashboard data loading** (all 4 API calls via Promise.allSettled) | Partial failure handling — wrong fallback behavior could show misleading KPIs. Free plan state rendering. |
| 7 | **Settings (all 5 tabs)** | Profile update, team invite, notification prefs, dark mode toggle, session management, password change. High-frequency user interaction. |
| 8 | **NDPR consent flows** (wallet + AI) | Non-compliance with NDPR consent gates is a regulatory risk, not just a UX bug. |
| 9 | **Claim request lifecycle** (submit → evidence → review → approve/reject) | Complex multi-actor workflow across workspace-app, platform-admin, and public-discovery. FSM state transitions must be correct. |
| 10 | **Vertical AI advisory** (capability check, advisory request, HITL banner) | AI calls with real provider cost. Wrong HITL detection for sensitive verticals (creche, political) has compliance implications. |

### Tier 3 — Important for Coverage

| Priority | Area | Why Important |
|---|---|---|
| 11 | **PWA offline behaviour** (product grid, POS checkout offline, sync on reconnect) | P6 invariant — core feature of the platform, especially for USSD + low-connectivity users |
| 12 | **USSD menu flows** (all 5 main branches including Telegram integration) | Serves the unbanked/feature-phone population — the platform's primary impact segment |
| 13 | **Mobile layout across all workspace-app pages** | P4 invariant — 360px base viewport. POS 2-column layout degrades on small screens. |
| 14 | **Notification delivery + low-data mode** | Notification correctness builds user trust. Low-data mode batching not confirmed to work under all scenarios. |
| 15 | **Partner management flows** (create, status FSM, sub-partner, entitlements) | Partner delegation is critical for growth. Sub-partner limit enforcement and cascading entitlement bugs could expose data. |
| 16 | **Brand-runtime white-label microsites** | Entitlement check (`branding-entitlement.ts`) must block non-paying tenants. Domain routing correctness. |
| 17 | **Public discovery search accuracy** | Geography-driven (T6) — LGA/state hierarchy filter bugs would show wrong results. |
| 18 | **CRON job correctness** (subscription enforcement, wallet expiry, MLA payout) | CRON bugs are silent — no UI shows whether they ran correctly. Wallet expiry + subscription suspension are time-sensitive. |
| 19 | **Dark mode styling consistency** | `data-theme` toggle confirmed but CSS variable coverage across all pages not verified. |
| 20 | **Accessibility — keyboard navigation + screen reader** | Skip-to-content link implemented; ARIA roles confirmed on Dashboard and POS. Full keyboard flow not tested. |

---

*End of WebWaka OS Master Inventory Report*  
*Produced: 2026-04-23 | For internal use only | Next step: QA test matrix derivation from this document*
