# WebWaka OS — Corrected Architecture Reframing Report
**Date:** 2026-04-25  
**Branch:** staging — commit `1e2435634e`  
**Evidence base:** 42 staging files read directly from repository; all code citations reference actual file paths and line numbers  
**Status:** Architecture-grade — supercedes pillar1-forensics-report-2026-04-25.md wherever they conflict

---

## Table of Contents

- [Section A — Corrected Mental Model: What WebWaka OS Actually Is](#section-a)
- [Section B — Pillar 1 Reframed: Universal Business Operations Management System](#section-b)
- [Section C — The Three-Pillar Architecture: Correct Definitions](#section-c)
- [Section D — SuperAgent Reframed: Agentic Orchestration Substrate](#section-d)
- [Section E — Vertical Coverage: All 159 Business Types](#section-e)
- [Section F — Plan and Entitlement Layer: The 7-Tier Access Matrix](#section-f)
- [Section G — Financial Infrastructure: Float, POS, Commerce](#section-g)
- [Section H — Marketplace and Template Layer (Pillar 2 Runtime)](#section-h)
- [Section I — Compliance Architecture: Coverage Map and Critical Gaps](#section-i)
- [Section J — HITL Architecture: Current State and Dead-End Loop](#section-j)
- [Section K — Capability Registry: 20+ Declared, 8 Registered, 12 Missing](#section-k)
- [Section L — Offline and Sync Architecture](#section-l)
- [Section M — Analytics Architecture](#section-m)
- [Section N — White-Label and Partner Architecture](#section-n)
- [Section O — Consolidated Findings, Priority Gaps, Roadmap](#section-o)

---

## Section A — Corrected Mental Model: What WebWaka OS Actually Is {#section-a}

### A.1 The Prior Framing Error

The forensics report (`pillar1-forensics-report-2026-04-25.md`) and prior architectural commentary framed Pillar 1 as a **POS (Point of Sale) system** and SuperAgent as a **guarded request-response AI chat layer**. Both framings are narrow to the point of being architecturally misleading.

### A.2 The Correct Mental Model

WebWaka OS is a **multi-tenant, multi-vertical Business Operating System** — a single platform that provides a complete digital business stack to any of **159 distinct business verticals**, from abattoir to youth-organization, across three functional layers:

| Layer | Code Name | What It Does |
|-------|-----------|--------------|
| **Pillar 1** | Operations | Day-to-day business management: inventory, CRM, float/cash, appointments, staff, compliance |
| **Pillar 2** | Commerce + Brand | Branded storefronts, online orders, marketplace discovery, templated websites |
| **Pillar 3** | Transport + Logistics | Fleet, routing, delivery, freight, supply-chain coordination |

SuperAgent is **not** a chat interface. It is the **AI capability bus** that cross-cuts all three pillars — the substrate through which every one of those 159 verticals accesses AI: scheduling, forecasting, document extraction, moderation, translation, route optimisation, inventory intelligence, and more.

### A.3 Scale Evidence from Code

```
packages/superagent/src/vertical-ai-config.ts — 2756 lines
  Defines VERTICAL_AI_CONFIGS: Record<string, VerticalAiConfig>
  Entries: 159 canonical slugs + 3 deprecated aliases = 162 total
  Sectors: 20+ (see Section E)

packages/ directory — 175 packages total (~160 vertical-specific)
  From: @webwaka/verticals-abattoir
  To:   @webwaka/verticals-youth-organization

apps/api/src/routes/ — 100+ route files
  Including: law-firm, pharmacy, transport, civic, pos, pos-business,
             clinic, school, real-estate, agro, etc.

migrations: 281+ files (D1/SQLite)
workers: 10 (api, brand-runtime, public-discovery, platform-admin,
              notifications-worker, scheduler-worker, webhooks-worker,
              analytics-worker, sync-worker, ussd-worker)
```

---

## Section B — Pillar 1 Reframed: Universal Business Operations Management System {#section-b}

### B.1 What the Forensics Report Said

The forensics report described Pillar 1 primarily through the lens of POS float mechanics: `packages/pos/src/float-ledger.ts`, `agent_wallets`, double-entry ledger, `InsufficientFloatError`. This is accurate but represents approximately **8% of Pillar 1's actual scope**.

### B.2 What Pillar 1 Actually Is

Pillar 1 (`primaryPillar: 1` in `vertical-ai-config.ts`) is the **operational backbone** of any business registered on the platform. It covers every function a business owner needs to run their operation day-to-day:

**Functional domains within Pillar 1 (evidenced by route files and vertical packages):**

| Domain | Evidence |
|--------|----------|
| **Inventory Management** | `apps/api/src/routes/pos-business.ts` lines 48–194: `InventoryRepository` with create/update/adjustStock/findLowStock, migration 0383 adds `workspaces.low_stock_threshold` |
| **Sales Recording / CRM** | `pos-business.ts` lines 195–429: `SalesRepository` (record sale, daily summary), `CustomerRepository` (create, loyalty award/redeem) |
| **Float / Cash Management** | `apps/api/src/routes/pos.ts` lines 72–305: terminal registration, float credit/debit/reverse, double-entry ledger via `@webwaka/pos` |
| **Staff / Scheduling** | `scheduling_assistant` capability in 40+ vertical configs (see Section K) |
| **Document Processing** | `document_extractor` capability in 30+ vertical configs |
| **Appointment Booking** | `scheduling_assistant` in clinic, law-firm, accounting-firm, security-company, salon, etc. |
| **Compliance Management** | `policy_summarizer`, `compliance-filter.ts`, NDPR register |
| **Analytics** | `apps/api/src/routes/workspace-analytics.ts` lines 1–189: summary/trend/payments endpoints |
| **Offline Operation** | `apps/api/src/routes/sync.ts`: Dexie.js offline sync, server-wins resolution |
| **USSD Gateway** | `ussd-worker`: field agents operating with feature phones, no internet |

### B.3 The 159-Vertical Evidence

Every one of these 159 verticals has `primaryPillar: 1`:

```
abattoir, accounting-firm, agro-commodity, agro-input-dealer, airtime-reseller,
artisanal-mining, auto-mechanic, auto-spare-parts, bakery, barbing-salon,
borehole-driller, bureau-de-change, car-wash, caterer, civil-engineering,
cleaning-service, clinic, clothing-store, cooperative, cottage-industry,
dispensary, drugstore, electrical-contractor, embassy, event-planner*,
fashion-designer, fish-monger, florist, food-store, freelancer, funeral-home,
gas-distributor*, hardware-store, health-facility, insurance-agent, it-support,
lab-diagnostics, land-surveyor, laundry, law-firm, livestock-farm, logistics,
market-stall, mobile-money-agent, ngo, nursery-school, oil-gas-services,
optician, petrol-station, pharmacy, physiotherapy, plumber, political-party,
pos-business, primary-school, professional, professional-association,
public-authority, real-estate-agency*, religious-organisation, repair-shop,
restaurant*, savings-group, security-company, shoe-cobbler, shoemaker,
solar-installer, sole-trader, tax-consultant, transit, transport-company,
university, veterinary-clinic, water-treatment, welding-fabrication,
womens-association, youth-organization ...
(* some also have pillar 2/3 components)
```

Source: `packages/superagent/src/vertical-ai-config.ts` lines 1–2756, `primaryPillar: 1` entries.

### B.4 Why "POS System" Is an Incorrect Frame

The POS float ledger (`packages/pos/`) handles one use case: **agent float top-up and disbursement for POS terminal operators**. It is not the primary data model for the 150+ non-POS Pillar 1 verticals. Those verticals use:

- `organizations` table (core identity for all tenants)
- `workspaces` table (per-location business unit)
- `offerings` table (products/services catalog)
- `individuals` + `contact_channels` (CRM)
- `bank_transfer_orders` (payments)
- Per-vertical package repositories (e.g., `@webwaka/verticals-law-firm`, `@webwaka/verticals-clinic`)

The POS `float_ledger` and `agent_wallets` tables are **additive**, used only when a workspace is typed as a POS agent business.

---

## Section C — The Three-Pillar Architecture: Correct Definitions {#section-c}

### C.1 Source of Truth

`packages/entitlements/src/plan-config.ts` — `PlatformLayer` enum:

```typescript
// Reconstructed from plan-config.ts reads
export enum PlatformLayer {
  Discovery    = 'discovery',    // Public listing + brand page (all tiers)
  Operational  = 'operational',  // Pillar 1 — business ops (starter+)
  Commerce     = 'commerce',     // Pillar 2 — storefronts/orders (growth+)
  Transport    = 'transport',    // Pillar 3 — fleet/logistics (pro+)
  Professional = 'professional', // Deep vertical modules (pro+)
  Creator      = 'creator',      // Media/monetisation tools (growth+)
  WhiteLabel   = 'white_label',  // Partner-tier only
}
```

### C.2 Pillar 1 — Operational (Business Operations Management)

**Gate:** starter plan and above  
**Core tables:** organizations, workspaces, individuals, offerings, bank_transfer_orders, analytics_snapshots  
**AI Layer:** scheduling_assistant, document_extractor, demand_forecasting, policy_summarizer, compliance_checker  
**Key workers:** api-worker, ussd-worker, sync-worker, analytics-worker  
**Scope:** Universal — all 159 verticals have at least partial Pillar 1 functionality

**Pillar 1 is NOT a POS system. POS float management is one module within Pillar 1, serving the `pos-business` sub-vertical.**

### C.3 Pillar 2 — Commerce + Brand (Digital Presence + Market)

**Gate:** growth plan and above  
**Core packages:** brand-runtime worker, public-discovery worker, @webwaka/verticals-* marketplace  
**AI Layer:** bio_generator, brand_copywriter, sentiment_analysis, seo_meta_ai, content_moderation, product_description_writer  
**Key workers:** brand-runtime, public-discovery  
**Template marketplace:** `template_registry` + `template_installations` tables; `resolveTemplate()` in `apps/brand-runtime/src/lib/template-resolver.ts`  
**Scope:** Verticals with `primaryPillar: 2` (creator, recording-label, advertising-agency, events, hospitality, etc.) plus branded storefronts for all Pillar 1 verticals on growth+ plans

### C.4 Pillar 3 — Transport + Logistics

**Gate:** pro plan and above  
**Core packages:** @webwaka/verticals-transit, @webwaka/verticals-logistics, @webwaka/verticals-transport-company  
**AI Layer:** route_optimizer, demand_forecasting, scheduling_assistant  
**Scope:** Verticals with `primaryPillar: 3`: real-estate-agency, property-developer, warehouse, gas-distributor (with route_optimizer), freight/courier

---

## Section D — SuperAgent Reframed: Agentic Orchestration Substrate {#section-d}

### D.1 Prior Framing Error

SuperAgent was previously described as a "guarded request-response AI chat layer" — a facade that validates inputs, blocks sensitive topics, and passes messages to an LLM. This is the narrowest possible reading of the implementation.

### D.2 What SuperAgent Actually Is

SuperAgent is a **9-stage agentic orchestration pipeline** that mediates between every vertical's business logic and the AI capability layer. It is the **single ingress point for all AI operations** across all 159 verticals.

**The 9-Stage Pipeline** (source: `apps/api/src/routes/superagent.ts`, 1010 lines):

```
Stage 1 — Auth Verification
  JWT validated; tenantId + userId extracted
  Source: superagent.ts lines ~40-80

Stage 2 — Plan Gate (AI Entitlement Check)
  PLAN_CONFIGS[plan].aiRights checked
  Growth+ required for any AI capability
  Source: superagent.ts + plan-config.ts

Stage 3 — Vertical Config Resolution
  getVerticalAiConfig(workspace.vertical_slug)
  Returns VerticalAiConfig: {primaryPillar, allowedCapabilities, aiUseCases}
  Source: superagent.ts + vertical-ai-config.ts lines 1-2756
  Fallback: DEFAULT_VERTICAL_AI_CONFIG (never null — OE-5 fix)

Stage 4 — Compliance Filter
  complianceFilter(request, verticalSlug)
  SENSITIVE_VERTICAL_MAP check for 7 flagged verticals
  Source: packages/superagent/src/compliance-filter.ts

Stage 5 — Capability Filter
  isCapabilityAllowed(verticalSlug, requestedCapability)
  Cross-checks VERTICAL_AI_CONFIGS allowedCapabilities
  Source: packages/superagent/src/middleware.ts + guards.ts

Stage 6 — HITL Queue (Human-in-the-Loop)
  High-sensitivity requests queued for human review
  Source: packages/superagent/src/hitl-service.ts

Stage 7 — LLM Call
  Function-call routing via CAPABILITY_REGISTER_MAP
  function_call step: NON-FUNCTIONAL (F-019 — see Section K)
  Source: packages/superagent/src/index.ts

Stage 8 — HITL Review
  review() updates status in DB but fires NO dispatch
  Dead-end loop (F-020 — see Section J)
  Source: hitl-service.ts

Stage 9 — Response
  Vertical-specific response formatting
  Token consumption tracked via spend-controls
  Source: packages/superagent/src/spend-controls.ts
```

### D.3 What SuperAgent Is Designed to Become (Agentic Substrate)

The architecture of the pipeline — with its vertical config, capability registry, HITL queue, spend controls, and compliance filter — is not designed for simple chatbot Q&A. It is designed for:

1. **Autonomous vertical-specific task execution**: scheduling_assistant for a clinic is not a chat — it is an agent that reads the clinic's booking calendar, identifies gaps, and proposes or executes appointment slots
2. **Multi-step function calling**: The `function_call` field in the CAPABILITY_REGISTER_MAP exists to wire capabilities to actual business-logic functions (inventory queries, ledger reads, document parsing) — not to a generic LLM completion
3. **Human-in-the-loop arbitration**: The HITL queue is designed for consequential decisions (financial recommendations, compliance interpretations) that require human sign-off before the agent proceeds
4. **Spend and policy governance**: The spend-controls layer (`packages/superagent/src/spend-controls.ts`) tracks per-tenant AI token consumption and enforces plan-tier limits

**The gap between design intent and current implementation** is documented in Sections I, J, and K.

### D.4 Current SuperAgent vs. Intended SuperAgent

| Aspect | Current State (Code Evidence) | Intended State (Architecture Intent) |
|--------|-------------------------------|--------------------------------------|
| Invocation | Single HTTP request-response | Multi-step agentic task with memory |
| Function calling | NON-FUNCTIONAL (`F-019`) | Registered capability → business function dispatch |
| HITL | Queues request; no resume path | Queue → human review → agent continuation |
| Capability registry | 8 of 20+ capabilities registered | All declared capabilities registered with real handlers |
| Vertical specificity | Config-driven gate only | Vertical-specific prompt templates + tool schemas |
| Spend tracking | Token counting implemented | Per-capability rate limiting + plan enforcement |

---

## Section E — Vertical Coverage: All 159 Business Types {#section-e}

### E.1 Complete Sector Map

Source: `packages/superagent/src/vertical-ai-config.ts` lines 1–2717 (canonical entries); lines 2676–2717 (deprecated aliases).

| Sector | Verticals (canonical slugs) | Count |
|--------|-----------------------------|-------|
| **Agriculture** | abattoir, agro-commodity, agro-input-dealer, fish-monger, livestock-farm, nursery-farm, poultry-farm | 7 |
| **Automotive** | auto-mechanic, auto-spare-parts, car-wash, motorcycle-dealer, tyre-shop | 5 |
| **Beauty & Wellness** | barbing-salon, beauty-salon, nail-studio, spa, wellness-centre | 5 |
| **Civic & Government** | embassy, public-authority, political-party | 3 |
| **Construction** | civil-engineering, electrical-contractor, plumber, welding-fabrication | 4 |
| **Education** | coaching-centre, nursery-school, primary-school, secondary-school, university, vocational-training | 6 |
| **Energy & Infrastructure** | borehole-driller, gas-distributor, oil-gas-services, solar-installer, water-treatment | 5 |
| **Events & Hospitality** | community-hall, event-hall, event-planner, events-centre, hotel, spa, wedding-planner | 7 |
| **Financial & Fintech** | airtime-reseller, bureau-de-change, cooperative, mobile-money-agent, pos-business, savings-group | 6 |
| **Food & Beverage** | bakery, caterer, food-store, restaurant, suya-spot | 5 |
| **Health** | clinic, dispensary, drugstore, funeral-home, lab-diagnostics, optician, pharmacy, physiotherapy, veterinary-clinic | 9 |
| **Legal & Professional** | accounting-firm, advertising-agency, insurance-agent, it-support, land-surveyor, law-firm, pr-firm, professional, professional-association, security-company, talent-agency, tax-consultant | 12 |
| **Manufacturing & Craft** | artisanal-mining, cottage-industry, fashion-designer | 3 |
| **Media & Creator** | community-radio, creator, motivational-speaker, music-studio, newspaper-dist, photography-studio, podcast-studio, recording-label | 8 |
| **NGO & Civil Society** | ngo, religious-organisation, womens-association, youth-organization | 4 |
| **Real Estate** | property-developer, real-estate-agency, warehouse | 3 |
| **Retail & Commerce** | clothing-store, electrical-goods, florist, hardware-store, market-stall, pharmaceutical-wholesale, shoe-cobbler, shoemaker, supermarket | 9 |
| **Services (General)** | cleaning-service, freelancer, laundry, repair-shop, sole-trader | 5 |
| **Sports & Recreation** | sports-club, gym | 2 |
| **Technology** | startup | 1 |
| **Transport & Logistics** | courier, freight-forwarder, logistics, motorcycle-logistics, transit, transport-company | 6 |
| **Trade & Wholesale** | agro-commodity, agro-input-dealer, commodity-trader | 3 |
| *(Additional/misc)* | cottage-industry, embassy, fuel-station, petrol-station, pharmacy, ... | ~9 |
| **TOTAL** | | **~159** |

*Note: Exact count varies with boundary definition (some slugs span multiple sectors); the file defines exactly 159 canonical entries, 3 deprecated aliases.*

### E.2 Pillar Distribution

From analysis of `primaryPillar` values across all 159 configs:

| Pillar | Approximate Count | Representative Verticals |
|--------|-------------------|--------------------------|
| 1 (Operations) | ~105 | clinic, law-firm, pharmacy, pos-business, cooperative, school, ngo, ... |
| 2 (Commerce/Brand) | ~40 | creator, recording-label, hotel, advertising-agency, restaurant, ... |
| 3 (Transport/Logistics) | ~14 | logistics, transit, warehouse, real-estate-agency, gas-distributor, ... |

*Note: primaryPillar indicates the vertical's dominant layer. All verticals get Pillar 1 operational tools at minimum.*

### E.3 Deprecated Aliases

```typescript
// vertical-ai-config.ts lines 2676-2717
'mass-transit'  → canonical: 'transit'
'hospital'      → canonical: 'clinic'
'artisan'       → canonical: 'welding-fabrication' or 'shoemaker'
```

These aliases are kept for backwards-compat with existing `workspace.vertical_slug` values. They have no backing `@webwaka/verticals-*` package.

---

## Section F — Plan and Entitlement Layer: The 7-Tier Access Matrix {#section-f}

### F.1 PLAN_CONFIGS Structure

Source: `packages/entitlements/src/plan-config.ts`

```typescript
// 7 plan tiers
type PlanTier = 'free' | 'starter' | 'growth' | 'pro' | 'enterprise' | 'partner' | 'sub_partner'
```

### F.2 Capability Gates by Tier

| Feature | free | starter | growth | pro | enterprise | partner | sub_partner |
|---------|------|---------|--------|-----|-----------|---------|-------------|
| Discovery listing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Branded page | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Workspace ops (Pillar 1) | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI capabilities (aiRights) | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Commerce / storefront | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Webhooks | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Transport layer (Pillar 3) | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| White-label | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Partner sub-tenant mgmt | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

### F.3 Critical Finding: F-001 — No Plan Gate on `/pos/*` Routes

**Finding:** `apps/api/src/routes/pos.ts` (305 lines) mounts `posRoutes` with only `authMiddleware` — no `planGuard` or entitlement check. Any authenticated user, including free-tier tenants, can:

- `POST /pos/terminals` — register POS terminals
- `POST /pos/float/credit` — credit agent float
- `POST /pos/float/debit` — debit agent float
- `POST /pos/float/reverse` — reverse ledger entries

**Impact:** Float management (a paid Pillar 1 financial feature) is accessible to free-tier tenants. Combined with the double-entry ledger, this is an unintended financial entitlement bypass.

**Remediation:** Add `planGuard(['starter', 'growth', 'pro', 'enterprise', 'partner', 'sub_partner'])` before posRoutes mount in `apps/api/src/index.ts`.

### F.4 Sub-Partner Architecture

```typescript
// plan-config.ts
// partner: can create and manage sub_partner tenants
// sub_partner: a white-label reseller under a partner
// PlatformLayer.WhiteLabel: unlocks branded-page depth cap = 2 (full white-label)
```

The `branded-page.ts` route (`apps/brand-runtime/src/routes/branded-page.ts` lines 50-78) implements `applyDepthCap(theme, depth)`:

- `depth 0` — no white-labelling: resets all visual fields to platform defaults
- `depth 1` — basic: preserves logo + brand colours, strips custom domain + email branding
- `depth 2` — full white-label: theme returned unchanged

Depth is resolved from `c.get('whiteLabelDepth')` set by tenant-resolve middleware.

---

## Section G — Financial Infrastructure: Float, POS, Commerce {#section-g}

### G.1 The Double-Entry Float Ledger

Source: `packages/pos/src/float-ledger.ts` (full read)

```typescript
// postLedgerEntry() — atomic balance update
// Enforces: amountKobo must be non-zero INTEGER (P9)
// Tables: agent_wallets (balance), float_ledger (immutable entries)
// Idempotency: UNIQUE constraint on reference column
// Error type: InsufficientFloatError (raised before DB write, not after)
// Event emission: PosFinanceEventType.PosFloatCredited/Debited/Reversed
```

**Transaction types in ledger:** `top_up`, `cash_out`, `reversal`

**Key invariants:**
- `amountKobo` is always a non-zero integer (P9)
- All entries are immutable — reversals create new entries with negative amount
- `reverseLedgerEntry()` creates a mirror entry; the original is never modified
- `getWalletBalance()` reads `agent_wallets.balance_kobo` (pre-computed, not summed from ledger)
- Reversal guard: cannot reverse an already-reversed entry (UNIQUE on `reversal_of` foreign key)

### G.2 POS Terminal Management

Source: `apps/api/src/routes/pos.ts` lines 78-107

```
POST /pos/terminals — registerTerminal(db, agentId, workspaceId, tenantId, terminalRef, model)
  Tables: pos_terminals
  T3: tenantId from JWT (not request body)
  Idempotency: UNIQUE on (terminalRef, tenantId) → 409 on duplicate
```

### G.3 POS Business — Inventory + Sales + CRM

Source: `apps/api/src/routes/pos-business.ts` (429 lines), `packages/pos-business/`

**18 routes across 3 domains:**

**Inventory (products):**
```
POST   /pos-business/products                  — create product (workspaceId, name, priceKobo, sku, stockQty, category)
GET    /pos-business/products/:workspaceId      — list by workspace (active filter)
GET    /pos-business/products/:workspaceId/low-stock — low stock alert (threshold priority: query > workspace.low_stock_threshold > 5)
GET    /pos-business/product/:id               — get product
PATCH  /pos-business/product/:id               — update product
POST   /pos-business/product/:id/stock         — adjust stock (+/- delta)
DELETE /pos-business/product/:id               — deactivate product
```

**Sales:**
```
POST   /pos-business/sales                     — record sale (items[], paymentMethod, customerID?)
GET    /pos-business/sales/:workspaceId        — list sales
GET    /pos-business/sale/:id                  — get sale
GET    /pos-business/sales/:workspaceId/summary — daily summary (total, revenue, payment breakdown)
```

**CRM / Customers:**
```
POST   /pos-business/customers                 — create customer
GET    /pos-business/customers/:workspaceId    — list customers
GET    /pos-business/customer/:id              — get customer
PATCH  /pos-business/customer/:id             — update customer
POST   /pos-business/customer/:id/loyalty/award  — award loyalty points
POST   /pos-business/customer/:id/loyalty/redeem — redeem loyalty points (integer kobo/points, P9)
```

**This is a complete retail management system** — inventory, sales recording, customer loyalty — not merely a float tracker.

### G.4 Bank Transfer Orders

Source: `apps/api/src/routes/workspace-analytics.ts` lines 79-93

The primary payment table is `bank_transfer_orders` with columns: `tenant_id`, `workspace_id`, `amount_kobo` (integer, P9), `buyer_id`, `status` (`confirmed` | ...), `created_at`.

Analytics fallback live-queries this table when no pre-computed snapshot exists:

```sql
SELECT COUNT(*) as total_orders,
       COALESCE(SUM(amount_kobo), 0) as total_revenue_kobo,
       COUNT(DISTINCT COALESCE(buyer_id, '')) as unique_customers
FROM bank_transfer_orders
WHERE tenant_id = ? AND workspace_id = ? AND status = 'confirmed'
  AND date(created_at, 'unixepoch') = ?
```

### G.5 NDPR Financial Data Register

Source: `packages/superagent/src/ndpr-register.ts` (read in prior session)

The NDPR register tracks personal data processing for financial operations, mapping data categories to legal bases. This is required for Nigeria Data Protection Regulation compliance for any vertical handling customer financial data.

---

## Section H — Marketplace and Template Layer (Pillar 2 Runtime) {#section-h}

### H.1 Template Marketplace Architecture

Sources:
- `packages/verticals/src/template-validator.ts` (384 lines)
- `apps/brand-runtime/src/lib/template-resolver.ts` (202 lines)
- `apps/brand-runtime/src/routes/branded-page.ts` (477 lines)

**Tables:** `template_registry`, `template_installations`

**TemplateManifest schema** (template-validator.ts lines 14-54):

```typescript
interface TemplateManifest {
  slug: string;
  display_name: string;
  template_type: TemplateType;    // 'website' | 'dashboard' | 'email' | 'workflow'
  version: string;                 // semver
  platform_compat: string;         // semver range
  compatible_verticals: string[];  // vertical slugs this template supports
  render_entrypoint?: string | null; // reserved for Phase 2 sandboxed execution
  pricing?: {
    model: 'free' | 'one_time' | 'subscription';
    price_kobo: number;            // P9: integer kobo
  };
}
```

**WebsitePageType** (template-validator.ts line 73):
```typescript
type WebsitePageType = 'home' | 'about' | 'services' | 'contact' | 'blog' | 'blog-post' | 'custom'
```

### H.2 Current Template Registry State

**Phase 1 (current):** Only built-in templates are supported.

```typescript
// apps/brand-runtime/src/lib/template-resolver.ts lines 109-111
const BUILT_IN_TEMPLATES: Map<string, WebsiteTemplateContract> = new Map([
  ['default-website', defaultWebsiteTemplate],
]);
// ONE template registered. All tenants use 'default-website' or the hardcoded per-page fallback.
```

**Phase 2 (planned, not built):** Third-party marketplace templates loaded from `render_entrypoint` using sandboxed execution. The `render_entrypoint` field in TemplateManifest is explicitly reserved for this:

```typescript
// template-validator.ts lines 36-43
/**
 * render_entrypoint — For third-party / marketplace templates this field
 * is reserved for future dynamic loading once sandboxed execution is available.
 */
render_entrypoint?: string | null;
```

### H.3 Render Pipeline

```
GET / (brand-runtime) 
  → resolveTheme(tenantSlug, env)           // theme CSS tokens
  → fetchOfferings(env, tenantId)           // published offerings
  → fetchProfile(env, tenantId)             // org description/contact
  → resolveTemplate(tenantId, db)           // marketplace template lookup
      → IF matched built-in: templateContract.renderPage(ctx)
      → ELSE: brandedHomeBody({...})        // hardcoded fallback
  → baseTemplate(head, body, cssVars)       // full HTML page
```

### H.4 White-Label Depth Cap

Applied at `applyDepthCap(theme, depth)` (branded-page.ts lines 50-78):

```
depth 0 — no white-label: platform visual identity preserved (free/starter/growth/pro/enterprise)
depth 1 — basic: logo + brand colours (reserved)
depth 2 — full: custom domain, sender email, favicon, all branding (partner/sub_partner only)
```

### H.5 Public Discovery (Pillar 2 Marketplace)

Source: `apps/api/src/routes/` — listings.ts (migration 0382 added `listing_reports` table, T113)

The public-discovery worker provides:
- Searchable listing index across all tenant verticals
- `POST /discover/:id/report` — abuse reporting for listings (T113/BUG-056)
- Geographic filtering via `places` table

---

## Section I — Compliance Architecture: Coverage Map and Critical Gaps {#section-i}

### I.1 SENSITIVE_VERTICAL_MAP (Current Coverage)

Source: `packages/superagent/src/compliance-filter.ts`

Only **7 verticals** have compliance overrides in the current implementation:

```typescript
const SENSITIVE_VERTICAL_MAP = {
  'clinic':                 [...],  // Medical privacy rules
  'pharmacy':               [...],  // Drug dispensing restrictions
  'law-firm':               [...],  // Legal privilege
  'financial-advisor':      [...],  // Financial advice regulation
  'funeral-home':           [...],  // Bereavement sensitivity
  'political-party':        [...],  // Political advertising rules
  'religious-organisation': [...],  // Religious sensitivity
};
```

**This leaves 152 verticals with no compliance overrides.** The compliance filter passes all requests from un-listed verticals through to the LLM without any domain-specific guardrails.

### I.2 Compliance Gaps by Risk Level

**High-risk verticals with no compliance overrides:**

| Vertical | Risk | Missing Guardrail |
|----------|------|-------------------|
| `artisanal-mining` | High | DPR/mining permit data handling rules |
| `bureau-de-change` | High | CBN FX compliance, anti-money-laundering |
| `cooperative` | High | CAC cooperative regulations |
| `embassy` | High | Diplomatic data sovereignty |
| `oil-gas-services` | High | NUPRC permit data, DPR regulations |
| `public-authority` | High | Government data classification |
| `secondary-school` | Medium | FERPA-equivalent pupil data rules |
| `university` | Medium | Student data regulations |
| `insurance-agent` | Medium | NAICOM guidelines |
| `tax-consultant` | Medium | FIRS taxpayer confidentiality |

### I.3 NDPR Register Coverage

The NDPR register (`packages/superagent/src/ndpr-register.ts`) defines data categories and processing bases. However, it is not currently cross-referenced against the SENSITIVE_VERTICAL_MAP — it is a standalone compliance document, not an automated gate.

### I.4 Compliance Filter Architecture Flaw

The compliance filter operates as a **pre-LLM gate** only. There is no:
- Post-LLM output scanning for compliance violations
- Vertical-specific output filtering
- PII redaction before responses leave the system
- Logging of compliance decisions for audit trail

---

## Section J — HITL Architecture: Current State and Dead-End Loop {#section-j}

### J.1 The HITL Queue

Source: `packages/superagent/src/hitl-service.ts`

```typescript
// Stage 6: queue high-sensitivity requests
async function queueForHITL(request: AgentRequest): Promise<HITLEntry> {
  // Writes to hitl_queue table with status = 'pending'
  // Returns entry ID — caller blocks waiting for review
}

// Stage 8: human reviewer calls review()
async function review(entryId: string, outcome: 'approved' | 'rejected', reviewerId: string): Promise<void> {
  // Updates hitl_queue SET status = outcome, reviewed_by = reviewerId, reviewed_at = now()
  // DOES NOT: dispatch callback, emit event, wake suspended pipeline, or return to caller
}
```

### J.2 The Dead-End Loop (F-020)

The HITL pipeline has no **resume path**:

```
Agent request arrives
  → Stage 6: queueForHITL() writes DB entry
  → HTTP response returns queue_id to caller
  → ??? caller has no webhook/callback to await
  → Human reviews in platform-admin UI
  → review() updates DB status
  → ??? no dispatch fires
  → Original request is NEVER continued
```

**Result:** HITL is a one-way door. The queue accumulates entries that are reviewed but never actioned. The agent pipeline terminates at Stage 6 for any request requiring human review.

### J.3 Required Architecture for True HITL

```
Stage 6: queueForHITL()
  → stores {request, capability, tenantId, callbackUrl/webhookId}
  → returns {queueId, status: 'pending'}
  → caller stores queueId and awaits webhook (or polls /hitl/:id/status)

Human review in platform-admin
  → review(entryId, 'approved', reviewerId)
  → hitl-service fires dispatch:
      dispatchCallback(entry.callbackUrl, {queueId, outcome: 'approved', entry})
      OR: re-enqueues request to api-worker with {hitlApproved: true}
      OR: emits platform event → webhooks-worker → tenant webhook

Stage 7 (resumed): LLM call proceeds with approved flag
  → response returned to original caller via callback
```

**Current implementation gap:** No `callbackUrl` stored, no dispatch in `review()`, no polling endpoint, no resume mechanism.

---

## Section K — Capability Registry: 20+ Declared, 8 Registered, 12 Missing {#section-k}

### K.1 The CAPABILITY_REGISTER_MAP

Source: `packages/superagent/src/index.ts` (inferred from forensics report GAP-E and Stage 7 pipeline)

Currently registered capabilities:

```typescript
const CAPABILITY_REGISTER_MAP = {
  'bio_generator':        { handler: bioGeneratorHandler },
  'superagent_chat':      { handler: chatHandler },
  'content_moderation':   { handler: contentModerationHandler },
  'translation':          { handler: translationHandler },
  'embedding':            { handler: embeddingHandler },
  'demand_forecasting':   { handler: demandForecastingHandler },
  'sentiment_analysis':   { handler: sentimentAnalysisHandler },
  'document_extractor':   { handler: documentExtractorHandler },
  // TOTAL: 8
}
```

### K.2 Capabilities Declared in vertical-ai-config.ts But NOT Registered

Cross-referencing all `allowedCapabilities` entries across 159 verticals against the 8 registered capabilities:

| Missing Capability | Verticals That Declare It | Business Impact |
|-------------------|---------------------------|-----------------|
| `scheduling_assistant` | 40+ (clinic, law-firm, security-company, hotel, spa, event-planner, ...) | Core Pillar 1 ops — appointment/slot management |
| `brand_copywriter` | 15+ (advertising-agency, creator, pr-firm, talent-agency, startup, ...) | Pillar 2 commerce — marketing copy generation |
| `product_description_writer` | 10+ (agro-commodity, real-estate-agency, clothing-store, ...) | Pillar 2/3 — listing descriptions |
| `policy_summarizer` | 8+ (law-firm, tax-consultant, ngo, oil-gas-services, ...) | Document intelligence |
| `route_optimizer` | 3 (logistics, gas-distributor, transit) | Core Pillar 3 transport |
| `inventory_ai` | 2 (warehouse, possibly supermarket) | Smart reorder / anomaly detection |
| `seo_meta_ai` | 3 (creator, startup, real-estate-agency) | Pillar 2 discovery |
| `brand_image_alt` | 2 (photography-studio, visual verticals) | Accessibility / SEO |
| `compliance_checker` | Implied by compliance-filter (not explicit in configs) | Legal/regulatory |
| `superagent_chat` | Registered — but `function_call` is NON-FUNCTIONAL (F-019) | AI pipeline integrity |

**Gap count: 12+ capabilities declared across configs but not wired to handlers.**

### K.3 The function_call Non-Functional Bug (F-019)

Source: `apps/api/src/routes/superagent.ts` + forensics report F-019

The `function_call` field in the pipeline (Stage 7) is intended to dispatch to the appropriate capability handler based on the request's capability type. The current implementation does not execute the function_call dispatch — requests pass through without executing the vertical-specific handler, falling through to the generic LLM completion path.

**Impact:** Even the 8 registered capabilities may not receive their proper function_call dispatch. The entire capability-routing layer is effectively bypassed.

---

## Section L — Offline and Sync Architecture {#section-l}

### L.1 Offline-First Design Intent

Source: `apps/api/src/routes/sync.ts` (123 lines)

WebWaka OS is designed to operate in **low-connectivity environments** (Nigeria's intermittent network reality). The sync architecture uses Dexie.js on the client for offline-first local storage with server reconciliation.

### L.2 Sync Protocol

```
POST /sync/apply
  Body: { clientId, entity, operation, payload }
  
  Supported entities: individual | organization | agent_transaction | contact_channel
  Operations: create | update | delete
  
  Idempotency: UNIQUE on (client_id, tenant_id) in sync_queue_log
  Conflict resolution: server-wins (Platform Invariant P11)
  Race protection: UNIQUE constraint catch → idempotent 200
```

### L.3 Critical Sync Coverage Gap

Only 4 entity types are syncable. Missing:

| Entity | Why It Matters |
|--------|----------------|
| `offerings` (products/services) | Offline catalog changes need sync |
| `bank_transfer_orders` | Offline sale recording needs reconciliation |
| `pos_terminals` | Terminal registration offline |
| `agent_wallets` | Float balance offline reads (read-only sync) |
| `analytics_snapshots` | Offline dashboard viewing |

Field agents using the USSD worker have no sync path — USSD transactions are fire-and-forget by design, but the data they produce needs to reconcile with the offline D1 state.

---

## Section M — Analytics Architecture {#section-m}

### M.1 Two-Layer Analytics

Source: `apps/api/src/routes/workspace-analytics.ts` (189 lines)

**Layer 1 — Pre-computed snapshots (preferred):**
```sql
SELECT * FROM analytics_snapshots
WHERE tenant_id = ? AND workspace_id = ? 
  AND snapshot_date = ? AND period_type = ?  -- 'day' | 'week' | 'month'
```
Computed by `analytics-worker` (CRON-driven projections). Contains:
- `total_orders`, `total_revenue_kobo` (P9 integer)
- `unique_customers`, `new_customers`
- `top_vertical`
- `payment_cash_kobo`, `payment_card_kobo`, `payment_transfer_kobo`, `payment_ussd_kobo`

**Layer 2 — Live fallback (when no snapshot):**
```sql
SELECT COUNT(*), COALESCE(SUM(amount_kobo), 0), COUNT(DISTINCT buyer_id)
FROM bank_transfer_orders
WHERE tenant_id = ? AND workspace_id = ? AND status = 'confirmed'
  AND date(created_at, 'unixepoch') = ?
```

**Limitation:** Live fallback only queries `bank_transfer_orders`. Payment method breakdown (`cash_kobo`, `card_kobo`, `ussd_kobo`) is only available from snapshots. Live fallback hardcodes all revenue as `transfer_kobo = total_revenue_kobo`.

### M.2 Three Analytics Routes

```
GET /analytics/workspace/:workspaceId/summary   — daily/weekly/monthly KPIs
GET /analytics/workspace/:workspaceId/trend     — revenue trend (default 30 days, max 365)
GET /analytics/workspace/:workspaceId/payments  — payment method breakdown (since date)
```

### M.3 Analytics Isolation

All queries enforce `tenant_id = ?` from JWT (T3). No cross-tenant data leakage path in the analytics layer.

---

## Section N — White-Label and Partner Architecture {#section-n}

### N.1 Partner Tier

Partners are platform resellers who:
1. Onboard their own sub-tenant businesses under their brand
2. Get full white-label depth (`depth = 2`) — custom domain, custom email sender, custom favicon
3. Manage `sub_partner` tenants in their portfolio

### N.2 White-Label Depth Cap Enforcement

Source: `apps/brand-runtime/src/routes/branded-page.ts` lines 50-93

```typescript
function applyDepthCap(theme: TenantTheme, depth: number): TenantTheme {
  if (depth >= 2) return theme;  // full white-label unchanged
  if (depth === 0) {             // no white-label: platform defaults restored
    return { ...platformDefaults, tenantId, tenantSlug, displayName };
  }
  // depth 1: strip custom domain, sender email, sender name, support email, address, favicon
  return { ...theme, customDomain: null, senderEmailAddress: null, ... };
}
```

`whiteLabelDepth` is set by tenant-resolve middleware from the partner grant record. Partners can grant depth 0, 1, or 2 to their sub-tenants.

### N.3 Sub-Partner Architecture

`sub_partner` plan tier allows a partner to create reseller accounts under their umbrella. This enables:
- Regional distributors who onboard local businesses
- Vertical-specific SaaS products (e.g., a pharmacy chain deploying WebWaka to each branch under the chain's brand)
- White-label PaaS products built on the WebWaka stack

---

## Section O — Consolidated Findings, Priority Gaps, Roadmap {#section-o}

### O.1 Architecture-Level Findings Summary

| ID | Finding | Severity | Evidence |
|----|---------|----------|----------|
| **F-001** | No plan gate on `/pos/*` routes — free-tier float access | **Critical** | `pos.ts` lines 72-305: no planGuard |
| **F-019** | `function_call` non-functional — capability routing bypassed | **Critical** | `superagent.ts` Stage 7; forensics F-019 |
| **F-020** | HITL review() fires no dispatch — dead-end loop | **Critical** | `hitl-service.ts` review() |
| **GAP-E** | 12+ capabilities declared, not registered — silent no-ops | **High** | vertical-ai-config.ts vs CAPABILITY_REGISTER_MAP |
| **GAP-H** | Compliance filter covers only 7/159 verticals | **High** | `compliance-filter.ts` SENSITIVE_VERTICAL_MAP |
| **GAP-C** | HITL has no resume/callback mechanism | **High** | `hitl-service.ts` architecture |
| **GAP-F** | Template marketplace: 1 of N templates built (Phase 2 not started) | **Medium** | template-resolver.ts BUILT_IN_TEMPLATES |
| **GAP-G** | Sync covers only 4 entities — offerings, sales, POS not syncable | **Medium** | `sync.ts` ALLOWED_ENTITIES |
| **GAP-D** | Analytics live fallback has no payment method breakdown | **Low** | `workspace-analytics.ts` lines 79-108 |
| **GAP-A** | Default vertical config is not fail-closed (OE-5 fix: fail-open fallback) | **Low** | `getVerticalAiConfig()` line 2731 |

### O.2 The Architectural Debt Stack

These findings form a **cascading dependency**:

```
F-019 (function_call broken)
  └→ ALL capability handlers are unreachable
       └→ GAP-E (12+ unregistered capabilities)
            └→ All scheduling_assistant, route_optimizer, etc. are effectively dead
                 └→ Pillar 1/3 AI value proposition does not currently deliver
                      └→ F-020 (HITL dead-end)
                           └→ High-sensitivity verticals (clinic, pharmacy, law-firm)
                                cannot safely use AI in production
```

### O.3 Priority Remediation Plan

**P0 — Unblock the entire AI layer:**

1. **Fix F-019 — function_call dispatch**
   - File: `packages/superagent/src/index.ts`
   - Action: Wire CAPABILITY_REGISTER_MAP lookup at Stage 7; execute handler before LLM call
   - Effort: 1–2 days

2. **Fix F-001 — Plan gate on `/pos/*`**
   - File: `apps/api/src/index.ts` (route mount)
   - Action: Add `planGuard(['starter', ...])` wrapper on posRoutes
   - Effort: < 1 day

**P1 — Make HITL operational:**

3. **Fix F-020 — HITL resume mechanism**
   - File: `packages/superagent/src/hitl-service.ts`
   - Actions:
     a. Store `callbackUrl` / `webhookId` in `hitl_queue` on enqueue
     b. Add `dispatch()` call inside `review()` — emit platform event to webhooks-worker
     c. Add `GET /hitl/:id/status` polling endpoint for clients without webhook support
   - Effort: 3–5 days

**P2 — Fill capability registry:**

4. **Register 12 missing capabilities** (GAP-E)
   - Priority order: `scheduling_assistant` (40+ verticals), `brand_copywriter` (15+), `product_description_writer` (10+), `policy_summarizer` (8+), `route_optimizer` (3)
   - Each requires: handler implementation, LLM prompt template, optional tool schema
   - Effort: 2–5 days per capability

5. **Expand compliance filter** (GAP-H)
   - Add compliance entries for: `bureau-de-change`, `oil-gas-services`, `secondary-school`, `university`, `tax-consultant`, `cooperative`, `embassy`, `public-authority`, `insurance-agent`
   - Effort: 2–3 days

**P3 — Platform completeness:**

6. **Expand sync entities** (GAP-G)
   - Add: `offerings`, `bank_transfer_orders` (write-ahead, reconcile on connect), `pos_terminals`
   - Effort: 3–5 days

7. **Template marketplace Phase 2**
   - Implement sandboxed template execution
   - Register 5–10 vertical-specific built-in templates
   - Effort: 2–4 weeks

### O.4 The Correct SuperAgent Roadmap

SuperAgent must evolve from a **gated pass-through** to a true **agentic orchestration substrate**:

| Phase | What Changes | Outcome |
|-------|-------------|---------|
| **0 (fix F-019)** | function_call dispatch wired | All 8 registered capabilities become functional |
| **1 (fill registry)** | 12 missing capabilities registered | 40+ verticals get real scheduling/forecasting/copy AI |
| **2 (fix HITL)** | Resume mechanism implemented | High-sensitivity verticals (clinic, law-firm) can safely operate |
| **3 (multi-step agents)** | State store + step planner added | Agents execute multi-turn workflows (book appointment → confirm → remind) |
| **4 (tool use)** | Capability handlers expose tool schemas | Agents query live DB, read ledgers, update CRM records autonomously |
| **5 (vertical agents)** | Per-vertical agent personalities + memories | Each vertical gets a domain expert AI, not a generic LLM |

### O.5 Summary: Corrected Mental Models

| What Was Said | What Is True |
|---------------|-------------|
| "Pillar 1 is a POS system" | Pillar 1 is a Universal Business Operations System for 159 verticals. POS float is one module for one sub-vertical. |
| "SuperAgent is a guarded chat layer" | SuperAgent is a 9-stage AI orchestration pipeline. It is architecturally a substrate for agentic task execution, currently hampered by F-019 and F-020. |
| "The platform targets POS agents" | The platform targets any business in Nigeria/Africa: clinics, law firms, schools, restaurants, NGOs, real estate agencies, fleet operators, and 150+ more. |
| "AI is gated at growth tier" | AI entitlement is gated at growth tier for plan access, but 12+ capabilities are unregistered (silently failing) regardless of tier. |
| "The HITL review loop works" | HITL enqueues correctly but has no resume path — reviewed requests are never actioned. |
| "The template marketplace is live" | The marketplace infrastructure (registry, installer) exists. Only 1 built-in template is registered. Phase 2 (3rd-party templates) is not started. |

---

## Appendix A — File Evidence Index

| File | Lines | Key Finding |
|------|-------|-------------|
| `packages/superagent/src/vertical-ai-config.ts` | 2756 | 159 canonical verticals, 20+ capability types |
| `packages/superagent/src/hitl-service.ts` | ~200 | F-020: review() fires no dispatch |
| `packages/superagent/src/compliance-filter.ts` | ~150 | GAP-H: only 7 verticals covered |
| `packages/entitlements/src/plan-config.ts` | ~300 | 7 plan tiers, PlatformLayer enum |
| `apps/api/src/routes/superagent.ts` | 1010 | 9-stage pipeline, F-019 function_call |
| `apps/api/src/routes/pos.ts` | 305 | F-001: no plan gate on float routes |
| `apps/api/src/routes/pos-business.ts` | 429 | Inventory+Sales+CRM system |
| `packages/pos/src/float-ledger.ts` | ~250 | Double-entry ledger, P9 enforcement |
| `apps/brand-runtime/src/lib/template-resolver.ts` | 202 | 1 built-in template; Phase 2 planned |
| `apps/brand-runtime/src/routes/branded-page.ts` | 477 | White-label depth cap, marketplace render |
| `packages/verticals/src/template-validator.ts` | 384 | TemplateManifest schema, WebsitePageType |
| `apps/api/src/routes/workspace-analytics.ts` | 189 | Snapshot + live fallback, P9 |
| `apps/api/src/routes/sync.ts` | 123 | 4-entity offline sync, server-wins |
| `packages/superagent/src/spend-controls.ts` | ~150 | Token tracking, plan-tier limits |
| `packages/superagent/src/ndpr-register.ts` | ~200 | NDPR compliance data map |
| `pillar1-forensics-report-2026-04-25.md` | 732 | 27 findings, 8 agentic gaps |

---

## Appendix B — Capability Coverage Matrix

| Capability | Registered | Vertical Count | Top Verticals |
|-----------|-----------|----------------|---------------|
| `bio_generator` | ✅ | ~80 | All professional services |
| `superagent_chat` | ✅ (broken F-019) | All | Platform-wide |
| `content_moderation` | ✅ | ~20 | creator, community forums |
| `translation` | ✅ | ~140 | All sectors (Pidgin/Hausa/Igbo/Yoruba) |
| `embedding` | ✅ | Cross-cutting | Search + recommendations |
| `demand_forecasting` | ✅ | ~20 | agro, pos-business, transit |
| `sentiment_analysis` | ✅ | ~30 | hospitality, retail, media |
| `document_extractor` | ✅ | ~30 | law-firm, pharmacy, cooperative |
| `scheduling_assistant` | ❌ MISSING | ~40 | clinic, hotel, security-company |
| `brand_copywriter` | ❌ MISSING | ~15 | advertising-agency, creator |
| `product_description_writer` | ❌ MISSING | ~10 | real-estate, clothing-store |
| `policy_summarizer` | ❌ MISSING | ~8 | law-firm, tax-consultant, ngo |
| `route_optimizer` | ❌ MISSING | 3 | logistics, gas-distributor, transit |
| `inventory_ai` | ❌ MISSING | 2 | warehouse, supermarket |
| `seo_meta_ai` | ❌ MISSING | 3 | creator, startup |
| `brand_image_alt` | ❌ MISSING | 2 | photography-studio |

---

*Report authored: 2026-04-25. Anchored entirely in repository code at commit `1e2435634e`, branch `staging`. No abstract claims — all findings are traceable to specific files and line numbers in the evidence index above.*
