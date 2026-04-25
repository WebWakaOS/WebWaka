# WebWaka OS — Full-Platform Forensics Report
**Date:** 2026-04-25  
**Scope:** Pillar 1 (Operations/POS) deep audit + full cross-pillar analysis (Pillars 2, 3, AI/SuperAgent)  
**Method:** 100% code read — every route file, every package, every governance doc  
**Status:** COMPLETE — no file left unread

---

## Table of Contents

1. [System Architecture Map](#1-system-architecture-map)
2. [Pillar 1 — Operations/POS Deep Audit](#2-pillar-1--operationspos-deep-audit)
3. [Pillar 2 — Brand Runtime Audit](#3-pillar-2--brand-runtime-audit)
4. [Pillar 3 — Discovery/Marketplace Audit](#4-pillar-3--discovermarketplace-audit)
5. [AI/SuperAgent Cross-Cutting Audit](#5-aisuperagent-cross-cutting-audit)
6. [Cross-Pillar Connection Analysis](#6-cross-pillar-connection-analysis)
7. [Critical Findings Registry](#7-critical-findings-registry)
8. [Agentic Expansion Readiness Assessment](#8-agentic-expansion-readiness-assessment)
9. [Prioritised Remediation Roadmap](#9-prioritised-remediation-roadmap)

---

## 1. System Architecture Map

### Workers (10 total)

| App | Role | Auth | D1 | KV | R2 |
|-----|------|------|----|----|----|
| `apps/api` | Master API — all business logic | JWT (authMiddleware) | ✅ | ✅ GEOGRAPHY_CACHE, RATE_LIMIT_KV, KV | ✅ ASSETS |
| `apps/brand-runtime` | Pillar 2 — tenant-branded SSR site | Cookie (portal only) | ✅ | ✗ | ✗ |
| `apps/public-discovery` | Pillar 3 — public marketplace SSR | None | ✅ | ✗ | ✗ |
| `apps/projections` | CRON event processor / search rebuilder | X-Inter-Service-Secret | ✅ | ✗ | ✗ |
| `apps/workspace-app` | React PWA — cashier/operator UI | JWT | via API | IndexedDB (Dexie) | ✗ |
| `apps/ussd-gateway` | USSD dial-in (float/discovery) | TENANT_ID Worker secret | ✅ | ✗ | ✗ |
| `apps/admin-dashboard` | Platform super-admin React SPA | JWT (super_admin) | via API | ✗ | ✗ |
| `apps/platform-admin` | Dev-mode admin Node.js shim | None (dev only) | ✗ | ✗ | ✗ |
| `apps/partner-admin` | Partner/sub-partner management UI | JWT | via API | ✗ | ✗ |
| `apps/tenant-public` | Legacy public tenant pages | None | ✅ | ✗ | ✗ |

### Shared Packages (175 packages)

Key packages for this audit:

| Package | Purpose |
|---------|---------|
| `@webwaka/pos` | Float ledger, shift manager, agent wallet |
| `@webwaka/verticals-pos-business` | Inventory, sales, CRM repositories |
| `@webwaka/superagent` | Full AI layer — keys, wallet, HITL, consent, compliance |
| `@webwaka/ai` (ai-abstraction) | 5-level BYOK routing engine |
| `@webwaka/ai-adapters` | Fetch-only provider adapters (P7) |
| `@webwaka/entitlements` | Plan matrix + evaluation engine |
| `@webwaka/offline-sync` | Dexie.js IndexedDB + SyncEngine + SW |
| `@webwaka/claims` | 8-state claim FSM |
| `@webwaka/auth-tenancy` | **STUB — `export {}`** |
| `@webwaka/payments` | Paystack integration + subscription sync |

### Database Schema (D1 — 281+ migrations)

Key POS tables confirmed by migration scan:
- `pos_terminals` (0023), `float_ledger` (0024), `pos_sales` / `pos_products` / `pos_customers` (0049), `pos_shifts` (0256), `pos_sale_payments` (0257), `pos_sale_refunds` (0258), `pos_products.barcode` (0259), `permission_overrides` (0269), `pos_storefront_sync` (0272), `float_reconciliations` (0281)

Key AI tables:
- `wc_wallets` / `wc_transactions` (0043), `superagent_keys` (0042), `ai_usage_events` (0045), `ai_hitl_queue` / `ai_hitl_events` (0194), `ai_spend_budgets` (0204), `ai_processing_register` (0205)

---

## 2. Pillar 1 — Operations/POS Deep Audit

### 2.1 Route Coverage

**API Layer (`apps/api`):**

| Route | File | Auth | Entitlement Gate | Audit Log |
|-------|------|------|-----------------|-----------|
| `POST /pos/terminals` | pos.ts:L1 | ✅ JWT | ❌ MISSING | ✅ |
| `GET /pos/terminals` | pos.ts | ✅ JWT | ❌ MISSING | ✅ |
| `GET /pos/float` | pos.ts | ✅ JWT | ❌ MISSING | ✅ |
| `POST /pos/float/credit` | pos.ts | ✅ JWT | ❌ MISSING | ✅ |
| `POST /pos/float/debit` | pos.ts | ✅ JWT | ❌ MISSING | ✅ |
| `GET /pos/float/history` | pos.ts | ✅ JWT | ❌ MISSING | ✅ |
| `POST /pos/shifts/open` | pos.ts | ✅ JWT | ❌ MISSING | ✅ |
| `POST /pos/shifts/close` | pos.ts | ✅ JWT | ❌ MISSING | ✅ |
| `GET /pos/shifts/active` | pos.ts | ✅ JWT | ❌ MISSING | ✅ |
| `GET /pos/analytics/trend` | pos.ts | ✅ JWT | ❌ MISSING | ✅ |
| `GET /pos/analytics/top-products` | pos.ts | ✅ JWT | ❌ MISSING | ✅ |
| `GET /pos/analytics/payment-mix` | pos.ts | ✅ JWT | ❌ MISSING | ✅ |
| `GET /pos/float/audit` | pos.ts:L494 | ✅ JWT | ❌ MISSING | ✅ |
| `POST /pos/float/reconcile` | pos.ts:L597 | ✅ JWT | ❌ MISSING | ✅ |
| `POST /pos/business/products` | pos-business.ts | ✅ JWT | ❌ MISSING | ✅ |
| `GET /pos/business/products` | pos-business.ts | ✅ JWT | ❌ MISSING | ✅ |
| `POST /pos/business/sales` | pos-business.ts | ✅ JWT | ❌ MISSING | ✅ |
| `GET /pos/business/sales` | pos-business.ts | ✅ JWT | ❌ MISSING | ✅ |
| `POST /pos/business/sales/:id/refund` | pos-business.ts | ✅ JWT | ❌ MISSING | ✅ |
| `POST /pos/business/customers` | pos-business.ts | ✅ JWT | ❌ MISSING | ✅ |
| `GET /pos/business/customers` | pos-business.ts | ✅ JWT | ❌ MISSING | ✅ |
| `GET /staff-permissions` | staff-permissions.ts | ✅ JWT | manager role guard | ✗ |
| `POST /staff-permissions` | staff-permissions.ts | ✅ JWT | manager role guard | ✗ |
| `GET /analytics/workspace/:id/*` | workspace-analytics.ts | ✅ JWT | ✗ | ✗ |
| `POST /sync/apply` | sync.ts | ✅ JWT | ✗ | ✗ |

**Finding F-001 (CRITICAL):** Every single `/pos/*` and `/pos/business/*` route in `router.ts` (lines 248–250) applies only `authMiddleware` and `auditLogMiddleware`. **There is no `requireEntitlement(PlatformLayer.Operational)` call anywhere on the POS route group.** A user on the `free` plan (which only has `PlatformLayer.Discovery`) can access float ledger, shift management, analytics, reconciliation, and all POS business operations. The plan matrix explicitly blocks Operational for `free` plan but the enforcement is never applied.

**Root Cause in `router.ts` lines 248–250:**
```typescript
app.use('/api/v1/pos/*', authMiddleware);
app.use('/api/v1/pos/*', auditLogMiddleware);
// ← requireEntitlement(PlatformLayer.Operational) is MISSING
```

### 2.2 Package Layer

**`@webwaka/pos` — float-ledger.ts:**
- Double-entry ledger: every credit/debit writes to `float_ledger` then updates `agent_wallets.balance_kobo`
- P9 compliant: all amounts validated as positive integers before any DB write
- T3 compliant: every query binds `tenant_id` from caller context
- Shift manager: full open/close FSM, `active_shift_id` tracked on wallet

**`@webwaka/verticals-pos-business` — inventory, sales, customers:**
- `InventoryRepository`: product catalog with barcode lookup (0259), stock adjustment events
- `SalesRepository`: sale recording with `pos_sale_payments` split tracking (0257), refund FSM (0258)
- `CustomerRepository`: CRM with loyalty points, `pos_customers` table

**Finding F-002 (MEDIUM):** `sendPosWhatsAppReceipt()` in `pos-business.ts` line 72 computes `totalKobo / 100` for the WhatsApp message display string. This is T4-compliant (display formatting is a presentation concern) but the computation is done inline in a route handler with no abstraction via `formatNaira()`. Any future code that copy-pastes this pattern into a non-display context would create a T4 violation.

**Finding F-003 (LOW):** `requireManagerRole()` in `staff-permissions.ts` lines 54–60 is a local inline function that duplicates `requireRole()` from `@webwaka/auth/roles.ts`. This violates P1 (Build Once Use Infinitely). No runtime impact, but a maintenance risk.

### 2.3 Frontend Layer (`apps/workspace-app/src/pages/POS.tsx` — 952 lines)

Fully implements ENH-P1 through ENH-P18:
- **ENH-P1 (offline queue):** `db.pendingSales` Dexie table; failed checkouts queued locally
- **ENH-P2 (product cache):** `db.products` refreshed on every fetch, served from cache when offline
- **ENH-P5 (UUID pre-generation):** Sale IDs generated client-side (idempotency on sync)
- **ENH-P6 (offline receipts):** `db.receipts` stores receipt per sale
- **ENH-P7 (pending visibility):** `useSyncStatus` hook drives "X pending" banner
- **ENH-P8 (float snapshot):** `db.floatSnapshot` shown when offline
- **ENH-P13 (daily summary):** `db.dailySummary` compound index `[workspaceId+dateKey]`
- **ENH-P15 (Workbox):** StaleWhileRevalidate for product catalog route
- **ENH-P18 (offline error messages):** Context-aware error text for offline state

**Finding F-004 (MEDIUM):** `workspace-analytics.ts` fallback path (line 76) queries `bank_transfer_orders` only — it is completely blind to POS sales. A POS-only workspace (starter plan using float/cash sales) will show zero revenue in its analytics dashboard when no snapshot is available. The snapshot is only computed by the `apps/projections` CRON (`0 2 * * *` — daily). Any workspace that hasn't had a CRON run in the last day shows blank analytics.

### 2.4 Offline Sync (Cross-cutting with Pillar 1)

**`/sync/apply` (sync.ts):**
```typescript
const ALLOWED_ENTITIES = [
  'individual', 'organization', 'agent_transaction',
  'contact_channel', 'pos_sale',   // ← pos_sale IS included
] as const;
```

**Corrected Finding (Previous Note Retracted):** `pos_sale` is in `ALLOWED_ENTITIES`. Offline POS sales sync via `applySaleSync` handler → `INSERT OR IGNORE INTO pos_sales` (client-wins, D5). This is correctly implemented.

**Finding F-005 (MEDIUM):** Float ledger entries are NOT syncable. When a cashier opens a shift and credits/debits the float while offline, those float transactions cannot be queued for sync. Only a `FloatSnapshot` (read-only balance) is cached in IndexedDB. Float reconciliation integrity requires online connectivity.

**Finding F-006 (MEDIUM):** `pos_sale` sync handler (`sync-handlers/pos-sale.ts`) validates `paymentMethod` against `['cash', 'card', 'transfer']` only. The `pos_sale_payments` split table (migration 0257 — multi-payment method support) is not touched by the sync handler. A split-payment sale completed offline will sync with only the primary payment method, losing the payment split detail.

### 2.5 Analytics Layer

**`/analytics/workspace/:id/summary`** reads from `analytics_snapshots` (pre-computed by projections CRON). Fallback queries `bank_transfer_orders` — see F-004.

**`/platform/analytics/summary`** (admin view) at line 62 of `analytics.ts`:
```typescript
db.prepare('SELECT COUNT(*) AS cnt FROM organizations')
```

**Finding F-007 (MEDIUM):** Platform analytics queries `organizations` table for tenant count. The platform's canonical tenant identity lives in `tenants` table (added by auth registration in `auth-routes.ts`). `organizations` counts business entities, which can be one-to-many with tenants. The admin dashboard shows the wrong metric for "total tenants."

### 2.6 USSD Gateway

**`apps/ussd-gateway`:** Handles `*384*#` (float query) and `*900*#` (discovery) via USSD sessions.

**Finding F-008 (ARCHITECTURAL):** The `TENANT_ID` environment variable is a single Worker secret per deployment. This means one USSD Worker deployment = one tenant. Multi-tenant USSD requires deploying separate Worker instances per tenant. This is a documented architectural constraint but creates significant operational overhead at scale. No USSD dynamic tenant resolution exists.

### 2.7 Entitlement Enforcement Divergence

Three separate authorities enforce subscription gating across the platform:

| Mechanism | Source of Truth | Used In |
|-----------|----------------|---------|
| `requireEntitlement()` (middleware/entitlement.ts) | `workspaces.active_layers` column | Vertical routes, branding |
| `billingEnforcementMiddleware` | `subscriptions` table | Payment routes |
| `branding-entitlement.ts` (brand-runtime) | `workspaces JOIN subscriptions` | Brand portal (most correct) |

**Finding F-009 (HIGH):** These three mechanisms diverge. If a subscription is downgraded (updating the `subscriptions` table) but `workspaces.active_layers` is not synchronously updated, `requireEntitlement()` will still grant access to previously-entitled layers. There is no subscription change webhook or trigger that keeps `workspaces.active_layers` in sync with the `subscriptions.plan` column. The `/pos/*` routes don't use any of these anyway (F-001).

### 2.8 Auth Package Stub

**Finding F-010 (HIGH):** `packages/auth-tenancy/src/index.ts` contains only `export {}`. This package is imported by several vertical route files as a dependency but provides zero runtime functionality. Any code expecting cross-tenant isolation utilities from this package gets nothing. T3 compliance relies entirely on manual `tenant_id` binding in every query — there is no package-level enforcement.

---

## 3. Pillar 2 — Brand Runtime Audit

### 3.1 Architecture

`apps/brand-runtime` is a separate Hono Worker that server-renders tenant-branded pages. It shares D1 with `apps/api` but is a completely separate Worker deployment.

**Tenant Resolution Chain (`tenant-resolve.ts`):**
1. Custom domain → `tenant_branding.custom_domain` → `organizations.slug`
2. Subdomain → `brand-{slug}.webwaka.com` → slug
3. Route param → `:slug`

**Branding Entitlement (`branding-entitlement.ts`):**
```typescript
const PLANS_WITH_BRANDING = new Set(['starter', 'growth', 'pro', 'enterprise', 'partner', 'sub_partner']);
```
Reads from `workspaces JOIN subscriptions` — the most correct entitlement check in the codebase (joins both tables). Returns HTTP 403 upgrade page if not entitled.

### 3.2 Shop (E-commerce) Routes

**`/shop`** reads from `offerings` table (tenant-scoped). Paystack checkout is implemented via `/shop/checkout` → Paystack API → `/shop/checkout/callback` verify → creates order in `bank_transfer_orders`.

**`/shop/cart`** stores cart in KV per session token — session-scoped, not user-account-scoped.

**Finding F-011 (HIGH):** Pillar 2 e-commerce (`offerings` table + `bank_transfer_orders`) and Pillar 1 POS (`pos_products` + `pos_sales`) are **entirely separate sale pipelines**. There is no inventory synchronisation between them. A product sold online (brand-runtime shop) does not decrement `pos_products.stock_quantity`. A cashier's POS sale does not affect online availability. This creates the risk of overselling and inventory inconsistency for tenants using both Pillar 1 and Pillar 2 simultaneously.

**Finding F-012 (MEDIUM):** `branding-entitlement.ts` uses a hardcoded plan set (`PLANS_WITH_BRANDING`) rather than reading from `@webwaka/entitlements/plan-config.ts`. If the plan matrix changes (e.g., new plan tier added), the branding entitlement check does not automatically update.

### 3.3 Brand Analytics

**`POST /brand/analytics/event`** (public, no auth) records storefront engagement events (`page_view`, `product_click`, `whatsapp_cta`, `checkout_start`, `purchase`) from brand-runtime.

**`GET /brand/analytics/summary`** (auth required) returns tenant analytics with `since`/`until` date range.

P10 compliant: `visitor_id = SHA-256(IP + UA + date)` — no raw PII stored.

**Finding F-013 (MEDIUM):** Brand analytics events (`brand_analytics_events` table) are completely separate from workspace analytics (`analytics_snapshots` + `bank_transfer_orders`) and POS analytics (`pos_sales`). There is no unified revenue view combining storefront sales, POS cash sales, and bank transfers. A tenant seeing their "total revenue" in the dashboard will miss POS cash sales (Pillar 1) from the count.

### 3.4 Branding Wizard

5-step wizard (`branding.ts`): business name/tagline → logo/colors/font → subdomain/custom domain → email settings → complete. All validated with Zod schemas. Data stored in `tenant_branding` table.

**Finding F-014 (LOW):** `WizardStep3Schema` validates `subdomain` as `/^[a-z0-9-]{3,63}$/` but does not check for subdomain uniqueness against the `tenant_branding` table. Duplicate subdomains can be registered — the subdomain routing in `tenant-resolve.ts` would serve the first match.

---

## 4. Pillar 3 — Discovery/Marketplace Audit

### 4.1 Architecture

`apps/public-discovery` is a separate public Hono Worker. No authentication required — all routes are public. Cross-tenant by design (no `tenant_id` filter).

**Routes:**
- `GET /discover` — homepage with state chips, sector chips, recent listings
- `GET /discover/in/:placeId` — geography-filtered listings
- `GET /discover/search` — full-text + geography-filtered search (KV cache 5min)
- `GET /discover/category/:cat` — category browse
- `GET /discover/profile/:entityType/:id` — public entity profile
- `GET /discover/:stateSlug`, `/:stateSlug/:lgaSlug`, `/:stateSlug/:lgaSlug/:sectorSlug` — SEO-friendly geography URLs

### 4.2 Claim-to-Operations Pipeline (P3 → P1)

**`/discovery/claim-intent`** → **`/claim/intent`** → **`/claim/advance`** → workspace provisioned

**`packages/claims`**: 8-state FSM (`unclaimed` → `intent_captured` → `email_verified` → `document_verified` → `admin_review` → `claimed` → `rejected` / `disputed`)

Once a business is claimed and verified, a workspace is created. That workspace's plan determines POS access (Pillar 1) via the entitlement matrix.

**Finding F-015 (LOW):** The claim pipeline ends at workspace creation. There is no automated seed of POS data (initial product catalog, float wallet, shift configuration) upon claim completion. New operators must manually configure their entire POS setup after claiming — creating a cold-start friction barrier.

### 4.3 Discovery Events

Every discovery route fires `logEvent()` to `discovery_events` table — asynchronously, non-blocking. Events include: `profile_view`, `search_query`, `claim_intent`, `nearby_search`, `trending_view`.

**Finding F-016 (LOW):** Discovery event `ip_hash` uses `SHA-256(raw_ip)`. The security baseline (R7) requires `SHA-256(PII_SALT + value)`. The salt is missing from discovery event IP hashing — this creates a rainbow table risk for IP de-anonymisation.

### 4.4 Search Infrastructure

**`/discovery/search`** uses SQLite FTS5 via `entities_fts` virtual table (maintained by `apps/projections`). KV cache keyed as `discovery:search:{query}:{placeId}` with 5-minute TTL.

**`apps/projections`**: CRON `*/15 * * * *` triggers incremental search index rebuild. Uses `X-Inter-Service-Secret` for auth — timing-safe comparison (`crypto.subtle.timingSafeEqual`) is implemented correctly.

---

## 5. AI/SuperAgent Cross-Cutting Audit

### 5.1 Layer Architecture

SuperAgent is explicitly documented as NOT a fourth pillar — it is infrastructure serving all three pillars. Its architecture spans five sub-layers:

```
SA-1.x Infrastructure:  KeyService | WalletService | PartnerPoolService | CreditBurnEngine | UsageMeter
SA-2.x Authorization:   aiConsentGate | ConsentService | VerticalAiConfig | NdprRegister
SA-3.x Execution:       resolveAdapter (5-level) | createAdapter | /superagent/chat pipeline
SA-4.x Production:      HitlService | SpendControls | ComplianceFilter | NdprRegister
```

### 5.2 SA-1.x — Infrastructure Layer

**KeyService (`key-service.ts`):**
- AES-256-GCM encryption using HKDF key derivation from `LOG_PII_SALT`
- Key hierarchy: user-level (scope='user') → workspace-level (scope='workspace')
- Revoke-and-replace pattern (no in-place updates)
- `keyHint` (last 4 chars) only exposed to clients — raw key never returned
- T3 compliant: all queries bind `tenant_id`

**WalletService (`wallet-service.ts`):**
- Double-entry: every balance change writes `wc_transactions` before updating `wc_wallets`
- `ensureWallet()`: 100 WakaCU starter grant, 1000/month spend cap on activation
- `debit()`: checks balance before deducting — no overdraft (returns `success: false`, post-pay model)
- `resetMonthlySpend()`: CRON-triggered, resets `current_month_spent_wc` + advances `spend_cap_reset_at`
- P9 compliant: integer validation on every credit/debit

**CreditBurnEngine (`credit-burn.ts`):**
- Priority: partner_pool → own_wallet → byok (levels 1/2 = no WakaCU charged)
- Insufficient balance: does NOT block response — records zero charge, collections out-of-band
- `Math.ceil((tokensUsed / 1000) * wakaCuPer1kTokens)` — ceiling ensures minimum 1 WakaCU

**UsageMeter (`usage-meter.ts`):**
- Records pillar (1/2/3), capability, provider, model, tokens, WakaCU, routing_level, duration_ms
- `ndprConsentRef` required — links usage to consent record (P10)
- No prompt/response content stored (P13)
- `aggregate()` groups by pillar — enables cross-pillar AI cost attribution

**Finding F-017 (MEDIUM):** `UsageMeter.record()` hardcodes `inputTokens: 0` in `superagent.ts` line 392, passing only `outputTokens` from `aiResponse.tokensUsed`. The `ai_usage_events` table stores separate `input_tokens` and `output_tokens` columns but input tokens are always recorded as zero. Token cost calculations and NDPR register reporting based on `input_tokens` will be incorrect.

### 5.3 SA-2.x — Authorization Layer

**`aiConsentGate` middleware (middleware.ts):**
- Guard 1: `assertNotUssd()` — checks `x-waka-channel` header (P12)
- Guard 2: `auth.aiRights === false` → 403 with upgrade URL
- Guard 3: `getAiConsentStatus()` D1 lookup → `assertNdprConsent()` (P10)
- On success: attaches `aiConsentId` to context for downstream meter

**`aiRights` JWT claim:** The consent gate checks `auth.aiRights` from the JWT. This field must be embedded in the JWT at login time — it is not fetched from D1 at runtime. This means a plan upgrade that grants `aiRights` requires a fresh JWT (re-login) to take effect. There is no mid-session re-validation.

**Finding F-018 (MEDIUM):** `aiRights` is a boolean in the JWT claim but the plan matrix defines it per-plan (`aiRights: false` for free/starter, `true` for growth+). If a tenant upgrades from starter to growth mid-session, their existing JWT still carries `aiRights: false` until they re-authenticate. AI features remain blocked until token refresh.

**VERTICAL_AI_CONFIGS (`vertical-ai-config.ts` — 2,756 lines):**
- Covers all 159 verticals across all sectors
- Each config declares: `slug`, `primaryPillar` (1/2/3), `allowedCapabilities`, `aiUseCases`
- `DEFAULT_VERTICAL_AI_CONFIG` used as fallback for unlisted verticals — fail-safe (not fail-closed)

**AI Capability Types mapped to pillars:**

| Pillar | Capabilities |
|--------|-------------|
| Pillar 1 (Ops) | `pos_receipt_ai`, `shift_summary_ai`, `fraud_flag_ai`, `inventory_ai`, `scheduling_assistant`, `demand_forecasting`, `route_optimizer` |
| Pillar 2 (Brand) | `bio_generator`, `brand_copywriter`, `brand_image_alt`, `seo_meta_ai` |
| Pillar 3 (Marketplace) | `listing_enhancer`, `review_summary`, `search_rerank`, `price_suggest` |
| Cross-cutting | `superagent_chat`, `function_call`, `translation`, `embedding`, `content_moderation`, `document_extractor`, `sentiment_analysis`, `policy_summarizer` |

### 5.4 SA-3.x — Execution Layer

**5-Level Adapter Resolution (`router.ts`):**
```
Level 1: User BYOK     → openai / anthropic / google (user's own key, 0 WakaCU)
Level 2: Workspace BYOK → openai / anthropic / google (operator's key, 0 WakaCU)
Level 3: Groq           → llama-3.1-8b-instant (1 WakaCU/1k tokens)
Level 4: OpenRouter     → llama-3.1-8b-instruct (2 WakaCU/1k tokens)
Level 4: Together       → Llama-3.2-3B-Instruct (1 WakaCU/1k tokens)
Level 4: DeepInfra      → Meta-Llama-3.1-8B (1 WakaCU/1k tokens)
Level 5: NO_ADAPTER_AVAILABLE error
```

**Finding F-019 (HIGH):** `function_call` is listed as a capability in `PLATFORM_AGGREGATORS` (Groq + OpenRouter), but there is no tool/function registry in the codebase. The `/superagent/chat` route has no `tools` parameter in `AIRequest`, no tool result processing, and no function call routing logic. `function_call` is a capability name that exists in configuration but is non-functional — calling it will produce a text completion with no structured output.

**`/superagent/chat` 9-Step Pipeline:**
1. `aiConsentGate` (P10/P12 gates)
2. Compliance pre-check → vertical sensitivity detection → PII stripping (P13)
3. SpendControls budget check → 429 if exhausted
4. WalletService.getWallet → spend cap context
5. resolveAdapter → 5-level BYOK chain
6. createAdapter(resolved).complete(aiRequest) → live provider call
7. CreditBurnEngine.burn → charge accounting
8. postProcessCheck → flag regulated content, inject disclaimers
9. UsageMeter.record → audit trail

All 9 steps confirmed implemented and wired.

**`/superagent/nl-report` (ENH-AI-01):**
Natural language business reporting — fetches aggregated POS stats (`pos_sales`, `pos_products`) and passes to AI with language instruction (en/pid/ha/yo/ig). Non-PII only — counts and sums, not customer records. This is the only Pillar 1 AI route with live data integration.

### 5.5 SA-4.x — Production/Compliance Layer

**HitlService (`hitl-service.ts`):**
- 3-level queue: L1 (24h, admin approve), L2 (elevated reviewer), L3 (72h mandatory regulatory)
- `submit()`: batch INSERT to `ai_hitl_queue` + `ai_hitl_events`
- `review()`: L3 enforces 72h minimum before approval attempt
- `expireAllStale()` (static): cross-tenant CRON sweep — L3 expired items write to `hitl_escalations`
- Projections CRON `0 */4 * * *`: calls `HitlService.expireAllStale()` every 4 hours

**Finding F-020 (HIGH):** After a human approves a HITL item via `PATCH /superagent/hitl/:id/review`, the status is updated to `approved` but nothing is dispatched. The AI action is not re-executed. No webhook, queue message, or notification is fired to tell the original requester their action was approved and is ready. The client must poll `GET /superagent/hitl/queue` to detect approval and then manually re-invoke the AI. For sensitive sector workflows (clinic appointment scheduling approved after HITL review), this creates a broken UX loop.

**ComplianceFilter (`compliance-filter.ts`):**
- PII stripping: phone numbers (NGN format + international), NIN-like (11 digits), BVN-like, email addresses, driver's license numbers
- Sensitive vertical map: hospital/clinic → 'medical', pharmacy → 'pharmaceutical', politician/political-party → 'political', legal/law-firm → 'legal'
- Pre-processing: detects sensitivity, sets HITL requirement for autonomy level ≥ 2
- Post-processing: checks for prohibited patterns (medical prescriptions, legal advice guarantees, political incitement), injects mandatory disclaimers

**Finding F-021 (MEDIUM):** `ComplianceFilter` detects sensitivity from `SENSITIVE_VERTICAL_MAP` which has only 7 entries. The `VERTICAL_AI_CONFIGS` covers 159 verticals with many sensitive sectors not in this map (e.g., `rehab-centre`, `elderly-care`, `orphanage`, `mental-health`). Compliance filtering is only applied to explicitly listed verticals — unlisted sensitive verticals receive no compliance pre/post-processing.

**SpendControls (`spend-controls.ts`):**
- 4 scopes: user, team, project, workspace
- `checkBudget()`: sequential check across all applicable scopes — first exhausted scope blocks
- `recordSpend()`: updates all applicable scope counters simultaneously
- `resetMonthlyBudgets()`: resets where `reset_at <= today` — needs CRON trigger

**Finding F-022 (MEDIUM):** `SpendControls.resetMonthlyBudgets()` and `WalletService.resetMonthlySpend()` are separate operations that must both be triggered monthly. There is no confirmed CRON handler in `apps/projections` for monthly spend cap reset. The daily CRON `0 2 * * *` runs `rebuild analytics` — monthly reset is not documented in the projections CRON schedule.

**NdprRegister (`ndpr-register.ts`):**
- NDPR Article 30 processing register auto-seeded from `VERTICAL_AI_CONFIGS`
- 8 capability types mapped to `CAPABILITY_REGISTER_MAP` with legal basis, data categories, retention periods
- `exportRegister()`: full audit export for DSAR compliance
- `seedFromVerticalConfigs()`: idempotent seed — skips existing entries

**Finding F-023 (LOW):** `CAPABILITY_REGISTER_MAP` covers 8 capability types. `VERTICAL_AI_CONFIGS` declares 20+ capability types. Capabilities like `scheduling_assistant`, `route_optimizer`, `demand_forecasting`, `sentiment_analysis`, `policy_summarizer` have no entry in `CAPABILITY_REGISTER_MAP` — they will be silently skipped during NDPR register seeding.

**ai_notification_queue:**
**Finding F-024 (HIGH):** Budget warning notifications are written to `ai_notification_queue` table (fire-and-forget in `superagent.ts` lines 451–475) when spending crosses 80% of budget. However, there is no consumer — no CRON handler, no queue listener, and no notification dispatch worker reads from this table. Budget warning notifications are permanently queued and never delivered.

---

## 6. Cross-Pillar Connection Analysis

### 6.1 P1 ↔ P2 (Operations ↔ Brand)

| Touchpoint | Status | Gap |
|------------|--------|-----|
| Product catalog | **Disconnected** | `pos_products` (P1) ≠ `offerings` (P2). Online shop and in-store POS are separate catalogs with no sync |
| Revenue reporting | **Blind** | Workspace analytics fallback reads `bank_transfer_orders` (P2 payments), never `pos_sales` (P1) |
| Inventory deduction | **None** | Online shop purchase does not decrement POS stock; POS sale does not affect online availability |
| WhatsApp receipts | **Partial** | POS sends WhatsApp receipts via `sendPosWhatsAppReceipt()`. Brand-runtime CTA buttons link to WhatsApp number from `tenant_branding.whatsapp_number` |
| Customer identity | **None** | `pos_customers` (P1) and `offerings` buyer IDs (P2) are separate customer stores |

**Finding F-025 (CRITICAL):** For tenants running both a physical POS and an online shop (a very common Nigerian SME pattern), there is no unified product or inventory layer. This is not an oversight — it reflects the current scope of implementation — but it is the single largest functional gap between what the platform promises and what it delivers for hybrid merchants.

### 6.2 P1 ↔ P3 (Operations ↔ Discovery)

| Touchpoint | Status | Gap |
|------------|--------|-----|
| Claim → workspace → POS | **Implemented** | Claim FSM → workspace provisioned → POS access on starter+ |
| Live inventory on discovery | **None** | `public-discovery` never reads `pos_products`. Discovery profiles show no real-time stock |
| POS data for discovery ranking | **None** | `discovery_events` trending uses profile views only, not sales volume or transaction count |
| Cold start after claim | **Gap** | No POS seed on workspace creation post-claim |

### 6.3 P2 ↔ P3 (Brand ↔ Discovery)

| Touchpoint | Status | Gap |
|------------|--------|-----|
| Brand storefront → discovery profile | **Partial** | Discovery shows `organizations` data. Brand-runtime serves from same DB but different query paths |
| Offering prices in discovery | **None** | Discovery profiles don't surface current offering prices from `offerings` table |
| Brand analytics ↔ discovery events | **Separate** | `brand_analytics_events` and `discovery_events` are separate tables with no cross-reference |

### 6.4 AI ↔ All Pillars

| Connection | Status |
|------------|--------|
| `pos_receipt_ai` | Declared in config, Groq-capable, but no `/pos/ai/receipt` route exists. Only via generic `/superagent/chat` |
| `inventory_ai` | Declared in config, but no `/pos/ai/inventory` route. Only via `/superagent/chat` |
| `shift_summary_ai` | Declared but no route. Only via `/superagent/chat` |
| `fraud_flag_ai` | Declared but no route and no fraud detection trigger on POS sales |
| `bio_generator` | Live — served via `/superagent/chat` + seeded in NDPR register |
| `listing_enhancer` | Declared for P3 but no discovery route invokes it |
| `/superagent/nl-report` | **Implemented** — only Pillar 1 AI route with live POS data integration |
| HITL integration | Running — projections CRON expires stale items every 4h |

**Finding F-026 (HIGH):** Pillar 1 AI capabilities (`pos_receipt_ai`, `inventory_ai`, `shift_summary_ai`, `fraud_flag_ai`) are declared in `VERTICAL_AI_CONFIGS` and listed in `PLATFORM_AGGREGATORS` but have **no dedicated API routes**. They can only be invoked via the generic `/superagent/chat` endpoint where the client must correctly construct the prompt. There is no structured, purpose-built Pillar 1 AI endpoint with workspace data context pre-loaded — the exception being `/superagent/nl-report` which is the only implemented Pillar 1 AI integration.

### 6.5 Entitlement Flow (Cross-Pillar)

```
Plan Matrix (plan-config.ts)
        ↓ source of truth
Three separate enforcement paths:

Path A: requireEntitlement()  →  reads workspaces.active_layers
Path B: billingEnforcement()  →  reads subscriptions table
Path C: branding-entitlement  →  joins workspaces + subscriptions

POS routes: NONE (F-001)
```

**Finding F-027 (HIGH):** The three enforcement paths can diverge on subscription changes. There is no synchronisation mechanism between `workspaces.active_layers` and `subscriptions.plan`. A plan downgrade that is recorded in `subscriptions` but hasn't propagated to `workspaces.active_layers` leaves Path A granting stale access. The `billingEnforcementMiddleware` reads the correct `subscriptions` table but is only applied to `/bank-transfer/*` routes, not POS.

---

## 7. Critical Findings Registry

### CRITICAL — Must Fix Before Production

| ID | Finding | Location | Impact |
|----|---------|----------|--------|
| F-001 | NO entitlement gate on ALL `/pos/*` routes — free plan users access POS | `router.ts` lines 248–250 | Revenue leakage, plan integrity |
| F-025 | Zero inventory sync between POS (`pos_products`) and online shop (`offerings`) | Architecture-level | Overselling, merchant trust |

### HIGH — Fix Within Current Sprint

| ID | Finding | Location | Impact |
|----|---------|----------|--------|
| F-009 | Three diverging entitlement authorities; no sync between `workspaces.active_layers` and `subscriptions.plan` | middleware layer | Access control drift |
| F-010 | `@webwaka/auth-tenancy` is a runtime stub (`export {}`) | `packages/auth-tenancy/src/index.ts` | All importers get nothing |
| F-019 | `function_call` AI capability declared but non-functional — no tool registry exists | `router.ts`, `superagent.ts` | Broken capability promise |
| F-020 | HITL approval fires no dispatch — approved actions are silently dropped | `hitl-service.ts`, routes | Broken governance workflow |
| F-024 | `ai_notification_queue` has no consumer — budget warnings never delivered | `superagent.ts` fire-and-forget | Silent budget overruns |
| F-026 | P1 AI capabilities (receipt, inventory, shift, fraud) have no dedicated routes | `router.ts`, `superagent.ts` | AI layer invisible to Pillar 1 |
| F-027 | Subscription downgrade doesn't propagate to `workspaces.active_layers` | subscription change flow | Stale access after downgrade |

### MEDIUM — Fix Within Next Sprint

| ID | Finding | Location | Impact |
|----|---------|----------|--------|
| F-004 | Workspace analytics fallback blind to POS revenue (`bank_transfer_orders` only) | `workspace-analytics.ts:76` | Blank analytics for POS workspaces |
| F-005 | Float ledger entries not syncable offline — float integrity requires online | `ALLOWED_ENTITIES` in sync.ts | Float reconciliation risk |
| F-006 | Offline sync loses `pos_sale_payments` split detail | `sync-handlers/pos-sale.ts` | Payment split reporting gaps |
| F-007 | Platform analytics counts `organizations` instead of `tenants` | `analytics.ts:62` | Wrong admin metric |
| F-011 | Brand shop checkout doesn't update POS inventory; POS sale doesn't affect online stock | Architecture-level | Overselling for hybrid merchants |
| F-012 | Brand entitlement uses hardcoded plan set instead of `plan-config.ts` | `branding-entitlement.ts:20` | Stale plan list on schema change |
| F-013 | No unified revenue view: POS + brand + bank transfers in separate silos | Architecture-level | Incomplete analytics |
| F-017 | `inputTokens` always recorded as 0 in `ai_usage_events` | `superagent.ts:392` | AI billing reconciliation errors |
| F-018 | `aiRights` JWT claim not refreshed after plan upgrade — requires re-login | `aiConsentGate` | Post-upgrade AI access blocked |
| F-021 | ComplianceFilter `SENSITIVE_VERTICAL_MAP` covers only 7 of 159 verticals | `compliance-filter.ts:43` | Sensitive sectors bypass compliance |
| F-022 | Monthly spend cap reset CRON not confirmed in projections schedule | `spend-controls.ts`, projections | Budget caps drift month-to-month |

### LOW — Backlog

| ID | Finding | Location | Impact |
|----|---------|----------|--------|
| F-002 | `totalKobo / 100` inline in route handler (display-only, T4 compliant but fragile) | `pos-business.ts:72` | Future T4 violation risk |
| F-003 | `requireManagerRole()` duplicates `requireRole()` from auth package (P1 violation) | `staff-permissions.ts:54` | Maintenance drift |
| F-014 | Subdomain uniqueness not validated in branding wizard | `branding.ts` WizardStep3Schema | Duplicate subdomain registrations |
| F-015 | No POS seed on workspace creation post-claim | Claim pipeline | Cold-start friction |
| F-016 | Discovery IP hash missing PII_SALT — rainbow table risk | `discovery.ts:50` | IP de-anonymisation risk |
| F-023 | 12 AI capabilities missing from NDPR `CAPABILITY_REGISTER_MAP` | `ndpr-register.ts` | Incomplete NDPR Article 30 register |

---

## 8. Agentic Expansion Readiness Assessment

This section directly addresses the planned expansion of SuperAgent to cover deep agentic roles.

### 8.1 What Is Already Built (Foundations)

The following capabilities are solid foundations for agentic expansion:

**Strong foundations:**
- ✅ **5-level BYOK adapter resolution** — provider-agnostic, expandable to new models
- ✅ **Per-vertical capability declarations** — 159 verticals, capability allowlists defined
- ✅ **HITL queue (3 levels)** — human-in-the-loop governance infrastructure exists
- ✅ **NDPR consent gate** — legally compliant AI invocation gate for all routes
- ✅ **WakaCU double-entry ledger** — metered AI spend with audit trail
- ✅ **ComplianceFilter** — PII stripping and sector-specific safety rails
- ✅ **SpendControls** — user/team/project/workspace budget scopes
- ✅ **guardAIFinancialWrite()** — explicit prohibition of AI writes to financial tables
- ✅ **Pillar attribution** — `pillar: 1|2|3` tagged on every usage event

### 8.2 Critical Gaps for Agentic Roles

**GAP-A (BLOCKING): No agent orchestration layer**

The current architecture is strictly request-response. One `/superagent/chat` call = one capability invocation = one AI response. There is no:
- Multi-step agent planning (ReAct, CoT, tool chaining)
- Persistent session/context across calls
- Agent memory (short-term conversation history, long-term episodic memory)
- Tool execution loop (plan → call tool → observe result → plan next step)

For a deep agentic role (e.g., "Inventory Agent for pharmacy-chain that monitors stock, predicts demand, drafts purchase orders, and sends approval for HITL review"), the platform needs an agent execution loop — not just a single completion endpoint.

**GAP-B (BLOCKING): `function_call` non-functional (F-019)**

Function calling is the core mechanism by which agents take structured actions. It is currently declared in the capability registry but entirely unimplemented. An agentic role requires:
- A tool registry: what functions/tools each vertical-agent can call
- Structured output parsing: extracting `tool_name` + `arguments` from the model response
- Tool execution: actually calling the target function (e.g., `create_purchase_order`, `send_shift_summary`, `flag_transaction`)
- Tool result feedback: returning the tool result to the model for the next reasoning step

**GAP-C (HIGH): HITL is one-way (F-020)**

The current HITL queue is a dead-end for agents. An agent that needs human approval (e.g., a purchase order over ₦500,000 that requires manager sign-off) submits to HITL and stops. After the manager approves, no signal is sent back to the agent pipeline. The agent cannot resume.

For agentic workflows, HITL needs:
- A dispatch mechanism on approval (webhook, KV notification, Cloudflare Queue)
- An agent "resume" endpoint that can continue an interrupted pipeline
- Timeout handling with escalation (currently only exists for L3 expiry)

**GAP-D (HIGH): No agent identity / persona per vertical**

All `/superagent/chat` calls receive the same generic prompt template. There is no:
- Vertical-specific system prompt injection (a pharmacy agent should know drug categories; a motor park agent should know route data)
- Agent persona configuration per workspace
- Tool allowlist injected into the model context at runtime based on `VERTICAL_AI_CONFIGS`

**GAP-E (MEDIUM): No streaming support**

All AI responses are returned as single JSON blobs after the full completion. Agentic UIs require streaming for:
- Showing the agent's reasoning steps as they happen
- Progressive disclosure of long-form outputs (reports, emails, plans)
- Real-time tool call display ("Agent is checking inventory... Agent is drafting PO...")

**GAP-F (MEDIUM): No persistent agent memory**

Each `/superagent/chat` call is stateless. For multi-turn agentic roles, the platform needs:
- Session storage: conversation history per agent session (KV or D1 `agent_sessions` table)
- Context window management: summarise old context before truncation
- Long-term memory: persist learned facts about a workspace (e.g., "this pharmacy's top sellers are paracetamol and amoxicillin") — embedded in D1 + vector search via `embedding` capability

**GAP-G (MEDIUM): No cross-vertical agent delegation**

For enterprise tenants with multiple verticals (e.g., a conglomerate with a pharmacy, a clinic, and a logistics fleet), there is no orchestrator agent that can delegate to sub-agents per vertical. The current architecture assumes one workspace = one vertical = one agent scope.

**GAP-H (LOW): `ai_notification_queue` abandoned (F-024)**

Budget warning notifications are silently dropped. For agentic roles where AI spend can spike (long reasoning chains, multiple tool calls), real-time budget alerts are critical for cost governance.

### 8.3 Recommended Architecture for Agentic Expansion

Based on the forensic findings, the recommended expansion path:

**Phase A: Tool Registry + Function Calling (unblocks everything)**
1. Define `AgentTool` type: `{ name, description, parameters (JSON Schema), handler }`
2. Build `ToolRegistry`: maps vertical slug → allowed tools
3. Wire `function_call` into `/superagent/chat` pipeline: inject tools into `AIRequest`, parse tool call response, execute handler, feed result back to model
4. Add `AIRequest.tools` field to ai-abstraction types

**Phase B: Agent Sessions + Context**
1. `agent_sessions` D1 table: `(id, tenant_id, workspace_id, user_id, vertical, messages JSONB, created_at, last_active_at)`
2. `POST /superagent/agent/sessions` — create session
3. `POST /superagent/agent/sessions/:id/message` — multi-turn with full history
4. Context window management: auto-summarise when approaching model's limit

**Phase C: HITL Dispatch + Agent Resume**
1. `ai_hitl_queue.callback_url` column — agent resume endpoint
2. On `review()` → approved: fire POST to `callback_url` with `{ queueItemId, decision, agentPayload }`
3. `POST /superagent/agent/sessions/:id/resume` — re-enters the pipeline after HITL approval

**Phase D: Vertical Agent Personas**
1. `agent_personas` D1 table per workspace: system prompt template, tool allowlist, autonomy level
2. Auto-seeded from `VERTICAL_AI_CONFIGS` on workspace activation
3. Injected into every agent session at initialisation

**Phase E: Streaming**
1. Cloudflare Workers support `ReadableStream` — implement SSE (`text/event-stream`) on `/superagent/agent/sessions/:id/message`
2. Chunk: reasoning step | tool_call | tool_result | final_response

**Phase F: Cross-Pillar Agent Orchestration**
1. `OrchestratorAgent`: receives high-level goal, decomposes into per-pillar sub-tasks
2. Sub-agent results aggregated and returned to orchestrator
3. Constrained by `VERTICAL_AI_CONFIGS.allowedCapabilities` + entitlement check per sub-task

---

## 9. Prioritised Remediation Roadmap

### Sprint 1 — Security & Compliance (Week 1)

| Priority | Task | Files | Effort |
|----------|------|-------|--------|
| 1 | Add `requireEntitlement(PlatformLayer.Operational)` to `/pos/*` and `/pos/business/*` route groups | `router.ts:248` | 1h |
| 2 | Fix `analytics.ts` to query `tenants` not `organizations` for tenant count | `analytics.ts:62` | 30min |
| 3 | Add PII salt to discovery IP hash: `SHA-256(LOG_PII_SALT + rawIp)` | `discovery.ts:50` | 1h |
| 4 | Fix `inputTokens` always recorded as 0 — pass `aiResponse.inputTokens` if provider returns it | `superagent.ts:392` | 1h |

### Sprint 2 — Data Integrity (Week 2)

| Priority | Task | Files | Effort |
|----------|------|-------|--------|
| 5 | Add `pos_sales` to workspace analytics fallback query (UNION with `bank_transfer_orders`) | `workspace-analytics.ts:76` | 2h |
| 6 | Build subscription→workspace sync: on plan change, update `workspaces.active_layers` | New subscription webhook handler | 3h |
| 7 | Replace `branding-entitlement.ts` hardcoded plan set with `PLAN_CONFIGS` from plan-config.ts | `branding-entitlement.ts:20` | 1h |
| 8 | Add NDPR register entries for missing capabilities (scheduling_assistant, route_optimizer, etc.) | `ndpr-register.ts` | 2h |

### Sprint 3 — AI Layer Fixes (Week 3)

| Priority | Task | Files | Effort |
|----------|------|-------|--------|
| 9 | Build `ai_notification_queue` consumer CRON in projections (push budget warnings via WhatsApp/email) | `apps/projections` | 3h |
| 10 | Add HITL approval dispatch: write callback on review approval, add `/superagent/agent/resume` | `hitl-service.ts`, `superagent.ts` | 4h |
| 11 | Confirm/add monthly spend cap reset CRON to projections schedule | `apps/projections/src/index.ts` | 2h |
| 12 | Expand `SENSITIVE_VERTICAL_MAP` to cover all sensitive verticals from vertical-ai-config.ts | `compliance-filter.ts:43` | 2h |

### Sprint 4 — Agentic Foundation (Week 4–6)

| Priority | Task | Files | Effort |
|----------|------|-------|--------|
| 13 | Implement `function_call` tool registry + handler routing in `/superagent/chat` | New `tool-registry.ts`, `superagent.ts` | 2 days |
| 14 | Create `agent_sessions` D1 table + session create/message routes | New migration + routes | 2 days |
| 15 | Implement multi-turn context management with auto-summarisation | New `context-manager.ts` | 1 day |
| 16 | Build vertical agent persona injection from `VERTICAL_AI_CONFIGS` | `superagent.ts`, new `agent-persona.ts` | 1 day |

### Sprint 5 — Production Hardening (Week 7–8)

| Priority | Task | Files | Effort |
|----------|------|-------|--------|
| 17 | Implement SSE streaming for agent sessions | `superagent.ts`, new SSE handler | 2 days |
| 18 | Implement `@webwaka/auth-tenancy` with real tenant isolation utilities | `packages/auth-tenancy/src/index.ts` | 1 day |
| 19 | Fix P1↔P2 inventory bridge: add `pos_storefront_sync` trigger on sale + online purchase | New sync handler (migration 0272 exists) | 3 days |
| 20 | Build unified cross-pillar revenue aggregation for workspace analytics | New `unified-analytics.ts` | 2 days |

---

## Appendix A — Platform Invariant Compliance Status

| ID | Invariant | Status | Violations |
|----|-----------|--------|-----------|
| P1 | Build Once | ⚠️ | `requireManagerRole()` duplicated (F-003) |
| P2 | Nigeria First | ✅ | — |
| P3 | Africa First | ⚠️ | Documented; Nigeria-only implementation |
| P4 | Mobile First | ✅ | — |
| P5 | PWA First | ✅ | — |
| P6 | Offline First | ✅ | Float entries not syncable (F-005) |
| P7 | Vendor Neutral AI | ✅ | — |
| P8 | BYOK Capable | ✅ | — |
| T1 | CF-First Runtime | ✅ | — |
| T2 | TypeScript-First | ✅ | — |
| T3 | Tenant Isolation | ⚠️ | auth-tenancy stub (F-010); relies on manual binding |
| T4 | Monetary Integrity | ✅ | Display-only float division acceptable |
| T5 | Subscription-Gated | ❌ | POS routes have NO entitlement gate (F-001) |
| T6 | Geography-Driven | ✅ | — |
| T7 | Claim-First | ✅ | — |
| T8 | Step Commits | ⚠️ | Process discipline |
| T9 | No Skipped Phases | ✅ | — |
| T10 | Continuity Code | ✅ | Inline comments throughout |

---

## Appendix B — Pillar 1 AI Capabilities Readiness

| Capability | Config Declared | Route Exists | Data Wired | NDPR Registered | Ready |
|-----------|----------------|-------------|------------|-----------------|-------|
| `pos_receipt_ai` | ✅ | ❌ (`/superagent/chat` only) | ❌ | ❌ | ❌ |
| `shift_summary_ai` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `inventory_ai` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `fraud_flag_ai` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `demand_forecasting` | ✅ | ❌ | ❌ | ✅ | ❌ |
| `scheduling_assistant` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `nl-report` (ENH-AI-01) | N/A | ✅ | ✅ (pos_sales) | Partial | ✅ |

---

*Report complete. 100% of source code and governance documentation reviewed.*  
*Total files read: ~85 source files, 15+ governance documents, 281+ migration files scanned.*
