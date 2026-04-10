# WebWaka Negotiable Pricing Strategy
## Product, Architecture, and Rollout Report

**Document version:** 1.0  
**Date:** 2026-04-10  
**Classification:** Internal — Founders & Engineering  
**Author:** Strategy & Architecture Review (AI-assisted)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current-State Assessment](#2-current-state-assessment)
3. [Research-Backed Findings](#3-research-backed-findings)
4. [Recommended Product Strategy](#4-recommended-product-strategy)
5. [UX and Workflow Design](#5-ux-and-workflow-design)
6. [Architecture and Data Model](#6-architecture-and-data-model)
7. [Vertical-by-Vertical Application](#7-vertical-by-vertical-application)
8. [Risk Management](#8-risk-management)
9. [MVP Roadmap](#9-mvp-roadmap)
10. [Open Questions and Assumptions](#10-open-questions-and-assumptions)

---

## 1. Executive Summary

WebWaka is a multi-tenant, multi-vertical SaaS platform serving Nigerian commerce, services, transport, logistics, and civic verticals. Negotiation is not a peripheral feature in the Nigerian market — it is a dominant pricing convention in physical markets, bulk trade, spare parts, used goods, services, and transport. Today the platform has no general-purpose negotiation infrastructure: pricing is entirely fixed at the point of catalog entry, with only two verticals (used-car-dealer and real estate agency) having ad hoc `offer_price_kobo` columns and an informal `negotiating` status.

This report recommends introducing **negotiation as a first-class, seller-opt-in, platform-wide capability** built around four new primitives:

1. A `pricing_mode` flag on every listing or service catalog entry (values: `fixed` | `negotiable` | `hybrid`).
2. A `price_guardrails` table per seller/listing defining the minimum acceptable price, maximum discount percentage, counteroffer round limit, and expiry window.
3. A `negotiation_sessions` table recording the full offer–counteroffer–accept/reject lifecycle.
4. An audit and moderation layer capturing all price events for analytics, abuse detection, and governance.

Fixed pricing is not weakened. It remains the default. Negotiation is strictly opt-in by the seller, per listing or per vendor. Buyers only see the negotiation capability when the seller has enabled it. The design is forward-compatible with AI-assisted auto-negotiation, dynamic floor pricing, and bulk-discount automation.

**Critical platform constraint preserved throughout:** All monetary values are stored and transmitted as integer kobo (platform invariant P9). No floating-point arithmetic is introduced anywhere in this design.

---

## 2. Current-State Assessment

### 2.1 How Pricing Is Currently Defined

WebWaka currently stores prices at the individual vertical table level. There is no unified catalog, no unified checkout, and no pricing abstraction layer. The following patterns exist:

| Pattern | Example columns | Verticals using it |
|---|---|---|
| Single fixed unit price | `price_kobo`, `unit_price_kobo` | Restaurant menus, beauty salon services, bookshop, food vendor, florist, laundry |
| Retail + wholesale dual price | `retail_price_kobo`, `wholesale_price_kobo` | Iron-steel, paints-distributor, motorcycle-accessories, pharmacy-chain |
| Cost + revenue split | `labour_cost_kobo`, `parts_cost_kobo`, `total_kobo` | Auto-mechanic, generator-repair, electronics-repair, handyman |
| Asking price + offer price | `asking_price_kobo`, `offer_price_kobo` | Used-car-dealer, real estate agency (informal negotiation) |
| Rate-based | `fare_kobo`, `rate_per_night_kobo`, `per_minute_kobo` | Transport, hotel, internet cafe |
| Bulk pricing | `bulk_price_kobo`, `cylinder_size_grams` | Gas distributor |
| Contract value | `contract_value_kobo` (bigint) | Oil-gas-services, construction |
| Deal/floor rate | `deal_value_kobo`, `monthly_rate_kobo` | Creator vertical (brand deals) |
| Min/max fee range | `min_fee_kobo`, `max_fee_kobo` | Service verticals (cleaning, etc.) |

### 2.2 Checkout and Order Flow

There is no unified cart or checkout. Each vertical defines its own order/booking table. Orders are recorded post-negotiation (or not at all) at the total price agreed by participants. There is no order-in-progress state that reflects a live price negotiation.

Payment processing uses Paystack via the `@webwaka/payments` package. The amount passed to Paystack is the kobo integer in the order's `total_kobo` field.

### 2.3 Where Negotiation Already Exists (Informally)

| Vertical | Informal negotiation marker | Gap |
|---|---|---|
| used-car-dealer | `offer_price_kobo`, status `negotiating` | No counteroffer chain, no expiry, no guardrails |
| real-estate-agency | `offer_price_kobo`, status `under_offer` | Same — single offer field, no rounds |
| creator brand deals | status `negotiating` | No offer record, just a status flag |
| catering / construction | `balance_kobo`, `deposit_kobo` patterns imply negotiation happened offline | No in-platform trail |

### 2.4 Gaps, Risks, and Opportunities

**Gaps**
- No seller-visible switch to opt a listing into negotiation mode.
- No in-platform offer submission or counteroffer capability.
- No price guardrails (minimum price, max discount, expiry).
- No negotiation audit trail or buyer/seller communication layer tied to pricing.
- No bulk-discount or tiered pricing engine.
- No unified listing layer; negotiation logic would need to touch every vertical table individually if done without a shared abstraction.

**Risks**
- Adding negotiation per-vertical without abstraction creates 100+ bespoke implementations.
- Sellers without guardrails face margin erosion from determined buyers who anchor at extreme low offers.
- Without expiry, open offers can be accepted at a later date when prices have changed (inflation risk).
- Without deduplication, a buyer could spam offers to manipulate seller psychology.

**Opportunities**
- Nigeria's market culture means negotiation features will differentiate WebWaka from generic SaaS tools used by vendors.
- Wholesale and B2B segments expect negotiated contract pricing. Enabling this creates a clear monetisation path.
- AI-assisted negotiation (auto-accept rules, market-rate benchmarking) is a premium-tier capability that can be gated.
- Aggregated negotiation analytics (accepted price distributions, discount depth, conversion rates) are valuable platform intelligence.

---

## 3. Research-Backed Findings

### 3.1 Pricing Model Taxonomy

**Fixed pricing**  
The seller names a price. The buyer either pays or leaves. Universally understood, simple to implement, zero trust overhead. Used by almost all digital-native commerce platforms as the default. Works best when goods are commodity-priced, when inventory turns fast, or when the seller cannot afford the overhead of back-and-forth negotiation.

**Negotiated pricing**  
The seller publishes an asking price (or a price range) and enables buyers to make offers. Both parties engage in a back-and-forth that converges on a transaction price. Well-established in real estate, B2B supply chains, used goods markets, and professional services globally. Dominant in Nigerian physical markets across all categories.

**Dynamic pricing**  
Price is set by algorithm based on real-time supply/demand, time-of-day, buyer profile, or external signals (fuel price, exchange rate). Used by transport platforms (Uber surge), airlines (revenue management), and perishable goods. Not the same as negotiation — the price varies without buyer input.

**Hybrid pricing**  
The seller sets a fixed price and a "make an offer" floor simultaneously. Common on eBay (Buy It Now + Best Offer). Allows fast purchase for buyers who accept the list price, while enabling negotiation for price-sensitive buyers.

**Auction pricing**  
Competitive bidding with time expiry. Relevant for unique goods (art, livestock, property at auction), rare inventory, or distress sales. Not broadly applicable to WebWaka's service-heavy vertical mix.

### 3.2 Relevant Platform Patterns

**eBay Best Offer**  
Sellers opt into "Best Offer" at listing level. Buyers submit offers. Sellers can accept, decline, or counter. Sellers can configure auto-accept thresholds (e.g., accept any offer ≥ 80% of asking price). Offers expire in 48 hours. Sellers see all open offers on a dashboard. One of the best-studied implementations of in-platform negotiation in e-commerce.

**Alibaba / 1688 RFQ and Trade Assurance**  
B2B-first negotiation. Buyers submit Requests for Quotation (RFQ). Sellers respond with a quote valid for N days. Negotiation happens over multiple rounds in a message thread tied to the listing. Price is only finalised when both parties confirm. Trade Assurance locks the agreed price and terms before payment. Strong audit trail, multi-round support, explicit validity windows.

**OLX / Jiji Nigeria**  
Classifieds model. All listings default to "negotiable." This creates a race to the bottom — buyers always offer less and sellers always ask more. There are no guardrails, no counteroffer structure, and no trust signals. The result is high friction and low conversion for many listing types. This is the anti-pattern to avoid.

**Jiji (improved) and Cars45 Nigeria**  
Introduced inspection-verified pricing and "price drop alerts." Cars45 uses algorithmic market valuation to anchor negotiation — the AI suggests a fair offer range. This reduces extreme anchoring while preserving negotiation culture.

**Freight Tiger and B2B logistics platforms**  
Freight rate negotiation: shipper posts a load, carriers bid down, shipper accepts. Reverse-auction model for transport. Rate cards are pre-negotiated for recurring relationships. API-driven rate confirmation locks the agreed price before dispatch.

**ServiceM8 and Jobber (service SME platforms)**  
Service businesses set quote-based (not fixed-price) rates. A quote is generated, emailed to the client, and accepted. The quote creates an immutable price record on the job. Multi-revision quoting (quote v1, v2, v3) is tracked. This is the professional service equivalent of offer–counteroffer.

### 3.3 Nigerian Market Realities

- **Inflation and FX volatility:** The cost of imported goods changes weekly. A fixed price set on a listing three weeks ago may no longer be viable. Sellers need the ability to set price-valid-until dates, and buyers need to know when a price was last updated.
- **Fuel price volatility:** Transport and logistics costs are highly sensitive to PMS price changes. Rates quoted today may need renegotiation if the NNPCL adjusts fuel prices before delivery.
- **Bulk-buy culture:** Nigerian traders routinely offer loyalty discounts for repeat buyers and volume discounts for large orders. This is not negotiation per se — it is structured discount logic.
- **"Best price" culture:** Buyers in Nigerian markets expect to ask for "best price" even on fixed-price items. A flat rejection without explanation damages goodwill. The platform should allow sellers to respond gracefully (e.g., "price is firm" or "minimum we can do is ₦X").
- **Trust and payment sequencing:** Negotiation without payment commitment is risky. The platform should allow price-lock with deposit before final delivery or payment, not just a verbal agreement.

### 3.4 Key Distinctions for WebWaka

| Dimension | Fixed | Negotiable | Hybrid |
|---|---|---|---|
| Default for new listings | ✅ Yes | No | Optional |
| Seller effort | Low | Medium | Medium |
| Buyer effort | Zero | Medium | Low (Buy Now) or Medium (Offer) |
| Trust requirement | Low | Medium | Medium |
| Works for high-volume FMCG | ✅ Yes | No | Partial |
| Works for high-value/bespoke | Partial | ✅ Yes | ✅ Yes |
| Works for transport/logistics | ✅ Yes (fare-based) | ✅ Yes (charter, bulk) | ✅ Yes |
| Works for B2B | Partial | ✅ Yes | ✅ Yes |
| AI enhancement potential | Low | ✅ High | ✅ High |

---

## 4. Recommended Product Strategy

### 4.1 Decision: Vendor-Level Default + Listing-Level Override

**Recommended approach: Vendor-level default with per-listing overrides.**

This is the optimal balance for WebWaka's architecture because:

1. **Seller UX is simpler.** A vendor sets their negotiation policy once ("I accept offers on all my listings" or "I never negotiate") and listings inherit that default. Exceptions are set at listing level. This avoids requiring sellers to configure every listing individually.

2. **Vertical appropriateness.** Some verticals have uniform negotiation culture (spare parts market, used goods) — vendor-level default fits those. Others are mixed (building materials — standard items are fixed, custom orders negotiate) — listing-level overrides handle the exception.

3. **Category-level defaults are not recommended** for WebWaka at this stage. Category-level configuration requires more admin overhead and is harder for sellers to discover and control. It is appropriate only if WebWaka has a platform-wide category management system, which does not yet exist.

4. **Fixed pricing is never degraded.** The default for all vendors remains `fixed`. Negotiation requires a deliberate opt-in at the vendor level or listing level.

### 4.2 The Three Pricing Modes

Every listing (or service offering) will carry exactly one pricing mode:

| Mode | Description | Who controls it |
|---|---|---|
| `fixed` | Buyer pays the listed price or does not buy. | Seller (default). |
| `negotiable` | Buyer can submit an offer. Seller can accept, counter, or decline. Guardrails apply. | Seller opt-in. |
| `hybrid` | Buy-Now at the listed price is available AND offers can be submitted simultaneously. | Seller opt-in. |

The `hybrid` mode is the recommended default for sellers who want to retain fast-purchase capability while enabling negotiation for price-sensitive buyers. It maps closely to eBay's Best Offer mechanic and prevents the platform from losing buyers who simply want to buy at the listed price.

### 4.3 Guardrail Parameters

Every `negotiable` or `hybrid` listing must be paired with guardrail parameters. These can be set at vendor level (applying to all their listings) and overridden at listing level:

| Parameter | Type | Description |
|---|---|---|
| `min_price_kobo` | INTEGER | The absolute floor below which offers are auto-rejected. |
| `max_discount_bps` | INTEGER | Maximum discount the seller will grant, in basis points (e.g., 1500 = 15%). Guards against extreme anchoring. |
| `max_offer_rounds` | INTEGER | Maximum number of offer/counteroffer rounds before session closes. Recommended default: 3. |
| `offer_expiry_hours` | INTEGER | Hours until an unanswered offer expires. Recommended default: 48. |
| `auto_accept_threshold_bps` | INTEGER | Offers ≥ (list_price × (10000 - threshold) / 10000) are accepted automatically without seller review. Optional. |
| `eligible_buyer_tier` | TEXT | Restrict negotiation to KYC Tier 2+, verified business buyers, or all buyers. |
| `wholesale_min_qty` | INTEGER | Minimum quantity for wholesale pricing (bulk-discount use case). |

All discount calculations are done in integer basis points (bps) to avoid floating-point arithmetic. 100 bps = 1%. The final accepted price is always an integer kobo value.

### 4.4 What This Does NOT Change

- Fixed-price listings continue to work exactly as today with zero additional overhead.
- The Paystack integration receives a final kobo integer regardless of how the price was reached.
- All platform invariants (P9 integer kobo, T3 tenant_id, T4 no floats) are preserved.
- Existing vertical repository and route patterns are not broken. The negotiation layer is additive.

---

## 5. UX and Workflow Design

### 5.1 Seller Journey (Enabling Negotiation)

**Step 1 — Vendor-level opt-in (one-time setup)**  
In the workspace settings panel, the seller sees a "Pricing Policy" section:
```
Pricing Policy
  ○ Fixed Only (default) — No offers accepted on my listings
  ● Accept Offers — Buyers can negotiate on listings I mark as negotiable
  ○ Always Open to Offers — All my listings accept offers by default

When accepting offers:
  Minimum price: ₦ [___________]  (applied across all listings unless overridden)
  Max discount:  [__]%  (maximum I'll discount any single listing)
  Offer rounds:  [3] rounds before session closes
  Offer expiry:  [48] hours
  Auto-accept offers above: [__]% of listed price  (optional)
```

**Step 2 — Per-listing toggle (optional override)**  
When creating or editing a catalog item / service offering:
```
Pricing mode:
  ○ Fixed price (₦ 45,000)
  ● Negotiable  (₦ 45,000 listed — buyer can offer)
  ○ Hybrid      (₦ 45,000 buy-now, or make an offer)

  [Override vendor defaults for this item]  ← expands guardrail fields
```

**Step 3 — Offer management dashboard**  
Sellers see an "Offers" tab in their workspace dashboard:
```
Open Offers (3)
┌──────────────────────────────────────────────────────┐
│ Item: Toyota Camry 2018        Asked: ₦4,200,000     │
│ Offer from: Buyer #1           Offer: ₦3,700,000     │
│ Received: 2h ago               Expires: 46h          │
│                                                      │
│ [Accept ₦3,700,000]  [Counter]  [Decline]            │
└──────────────────────────────────────────────────────┘
```

**Step 4 — Counteroffer flow**  
Seller taps "Counter":
```
Counteroffer
Current offer from buyer: ₦3,700,000
Your asking price:         ₦4,200,000
Your minimum (private):    ₦3,900,000

Enter your counteroffer:   ₦ [4,000,000]
Note to buyer (optional):  "Best I can do — price includes full service history docs"

[Send Counteroffer]
```
The minimum is never shown to the buyer. The counteroffer is sent. Round 1 of 3 consumed.

### 5.2 Buyer Journey

**Discovery — Search and catalog**  
Listings with negotiation enabled show a subtle badge:
```
[Toyota Camry 2018] [NEGOTIABLE]  ₦4,200,000
[Honda Accord 2019] [FIXED PRICE] ₦3,800,000
[Toyota Corolla 2020]             ₦4,500,000
```
Buyers can filter: `Pricing: [ ] Fixed only  [ ] Negotiable  [●] All`

**Offer submission**  
On a negotiable listing:
```
₦4,200,000  [Buy Now (Hybrid mode)]

Make an Offer:
  Your offer: ₦ [___________]
  Message to seller (optional): "Buying cash, can we do ₦3.9M?"
  
  [Submit Offer]
  
  Note: Offer expires in 48h if seller does not respond.
  Note: You can submit 3 offers on this listing.
```

**Counteroffer notification**  
Buyer receives notification:
```
The seller has countered at ₦4,000,000.
Note: "Best I can do — includes full service history docs"

Your original offer: ₦3,700,000
Seller counter:       ₦4,000,000
Rounds remaining:    1

[Accept ₦4,000,000]  [Counter Again]  [Decline]
```

**Acceptance**  
On acceptance, a price-lock record is created. The buyer is directed to payment checkout with the locked price. The listing is marked `reserved` (for single-item goods) or remains available (for services/repeatable goods).

### 5.3 Coexistence of Fixed and Negotiable Items

In catalog views, both types appear without degrading either:

- Fixed-price items: standard add-to-cart / book now flow, no offer button visible.
- Negotiable items: "Make Offer" button shown alongside (or instead of) "Buy Now" in Hybrid mode.
- Search filters allow buyers to opt out of seeing negotiable items if they prefer fixed pricing.
- Multi-vendor aggregated views (market-association, wholesale hubs) show per-item badges.

### 5.4 Bulk / B2B Offer Flow

For bulk orders (applicable to building materials, iron-steel, paints-distributor, gas-distributor):

```
Order quantity: 50 bags of cement
Unit price (fixed): ₦9,500/bag   → Total: ₦475,000

[Buy at Fixed Price]  [Request Bulk Quote]

Bulk Quote Request:
  Quantity: [50] bags
  Your budget: ₦ [420,000]  (~₦8,400/bag)
  Delivery required? [Yes/No]
  Delivery date needed: [___]

  [Submit Quote Request]
```
The bulk quote request creates a `negotiation_session` with `session_type = 'bulk_rfq'`. The seller receives it on the same Offers dashboard with the quantity context visible.

---

## 6. Architecture and Data Model

### 6.1 Design Principles

- **Additive, not disruptive.** The negotiation layer is a new set of tables and API endpoints. Existing vertical tables and routes are unchanged.
- **Polymorphic listing reference.** A single `negotiation_sessions` table references listings across all verticals using a `(listing_type, listing_id)` pattern rather than vertical-specific foreign keys.
- **All kobo, always integer.** No REAL columns anywhere in the pricing layer.
- **Audit-first.** Every price event is logged immutably.
- **Tenant-scoped everywhere (T3).** Every new table has `tenant_id`.

### 6.2 New Tables

#### `vendor_pricing_policies`
Vendor-level negotiation defaults. One row per workspace.

```sql
CREATE TABLE IF NOT EXISTS vendor_pricing_policies (
  id                         TEXT    PRIMARY KEY,
  workspace_id               TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id                  TEXT    NOT NULL,
  default_pricing_mode       TEXT    NOT NULL DEFAULT 'fixed'
                                     CHECK (default_pricing_mode IN ('fixed','negotiable','hybrid')),
  min_price_kobo             INTEGER,          -- Global floor; NULL = no global floor
  max_discount_bps           INTEGER NOT NULL DEFAULT 1500, -- 15% default max discount
  max_offer_rounds           INTEGER NOT NULL DEFAULT 3,
  offer_expiry_hours         INTEGER NOT NULL DEFAULT 48,
  auto_accept_threshold_bps  INTEGER,          -- NULL = no auto-accept
  eligible_buyer_kyc_tier    INTEGER NOT NULL DEFAULT 1, -- Min KYC tier to make offers
  wholesale_min_qty          INTEGER,          -- NULL = no bulk-discount mode
  created_at                 INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at                 INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vendor_policy_workspace
  ON vendor_pricing_policies(workspace_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_vendor_policy_tenant
  ON vendor_pricing_policies(tenant_id);
```

#### `listing_price_overrides`
Per-listing pricing mode and guardrail overrides.

```sql
CREATE TABLE IF NOT EXISTS listing_price_overrides (
  id                         TEXT    PRIMARY KEY,
  workspace_id               TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id                  TEXT    NOT NULL,
  listing_type               TEXT    NOT NULL, -- e.g., 'spare_part','hotel_room','service_item'
  listing_id                 TEXT    NOT NULL, -- FK to the specific vertical table row
  pricing_mode               TEXT    NOT NULL CHECK (pricing_mode IN ('fixed','negotiable','hybrid')),
  listed_price_kobo          INTEGER NOT NULL, -- Snapshot of price at override creation
  min_price_kobo             INTEGER,          -- NULL = inherit from vendor_pricing_policies
  max_discount_bps           INTEGER,          -- NULL = inherit
  max_offer_rounds           INTEGER,          -- NULL = inherit
  offer_expiry_hours         INTEGER,          -- NULL = inherit
  auto_accept_threshold_bps  INTEGER,          -- NULL = inherit
  valid_until                INTEGER,          -- Unix epoch; NULL = no expiry on price validity
  created_at                 INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at                 INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lpo_listing
  ON listing_price_overrides(listing_type, listing_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_lpo_workspace
  ON listing_price_overrides(workspace_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_lpo_tenant
  ON listing_price_overrides(tenant_id);
```

#### `negotiation_sessions`
One session per buyer–seller–listing negotiation attempt.

```sql
CREATE TABLE IF NOT EXISTS negotiation_sessions (
  id                   TEXT    PRIMARY KEY,
  tenant_id            TEXT    NOT NULL,
  listing_type         TEXT    NOT NULL,
  listing_id           TEXT    NOT NULL,
  seller_workspace_id  TEXT    NOT NULL REFERENCES workspaces(id),
  buyer_ref_id         TEXT    NOT NULL,  -- individual_id or organization_id; never opaque
  session_type         TEXT    NOT NULL DEFAULT 'offer'
                               CHECK (session_type IN ('offer','bulk_rfq','service_quote')),
  status               TEXT    NOT NULL DEFAULT 'open'
                               CHECK (status IN ('open','accepted','declined','expired','cancelled')),
  listed_price_kobo    INTEGER NOT NULL,  -- Snapshot of list price at session open
  initial_offer_kobo   INTEGER NOT NULL,  -- Buyer's first offer
  final_price_kobo     INTEGER,           -- Set only on status = 'accepted'
  rounds_used          INTEGER NOT NULL DEFAULT 0,
  max_rounds           INTEGER NOT NULL,  -- Copied from guardrails at session creation
  expires_at           INTEGER NOT NULL,  -- Unix epoch
  quantity             INTEGER NOT NULL DEFAULT 1,
  notes                TEXT,              -- Buyer note on first offer
  created_at           INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at           INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_neg_session_seller
  ON negotiation_sessions(seller_workspace_id, tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_neg_session_buyer
  ON negotiation_sessions(buyer_ref_id, tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_neg_session_listing
  ON negotiation_sessions(listing_type, listing_id, tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_neg_session_expiry
  ON negotiation_sessions(expires_at, status);
```

#### `negotiation_offers`
Immutable ledger of every offer and counteroffer in a session.

```sql
CREATE TABLE IF NOT EXISTS negotiation_offers (
  id             TEXT    PRIMARY KEY,
  session_id     TEXT    NOT NULL REFERENCES negotiation_sessions(id),
  tenant_id      TEXT    NOT NULL,
  round          INTEGER NOT NULL,           -- 1, 2, 3 …
  offered_by     TEXT    NOT NULL CHECK (offered_by IN ('buyer','seller')),
  amount_kobo    INTEGER NOT NULL CHECK (amount_kobo > 0), -- P9: integer kobo
  message        TEXT,                       -- Optional note from offerer
  status         TEXT    NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','accepted','countered','declined','expired')),
  created_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  responded_at   INTEGER                    -- NULL until buyer/seller responds
);

CREATE INDEX IF NOT EXISTS idx_neg_offer_session
  ON negotiation_offers(session_id, round);
CREATE INDEX IF NOT EXISTS idx_neg_offer_tenant
  ON negotiation_offers(tenant_id, status);
```

#### `negotiation_audit_log`
Immutable event log for compliance and moderation.

```sql
CREATE TABLE IF NOT EXISTS negotiation_audit_log (
  id           TEXT    PRIMARY KEY,
  tenant_id    TEXT    NOT NULL,
  session_id   TEXT    NOT NULL REFERENCES negotiation_sessions(id),
  event_type   TEXT    NOT NULL, -- 'session_opened','offer_submitted','countered',
                                 -- 'accepted','declined','expired','cancelled','auto_accepted'
  actor_type   TEXT    NOT NULL CHECK (actor_type IN ('buyer','seller','system')),
  actor_ref_id TEXT    NOT NULL,
  amount_kobo  INTEGER,          -- Present for price events
  metadata     TEXT    NOT NULL DEFAULT '{}', -- JSON: extra context
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_neg_audit_session
  ON negotiation_audit_log(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_neg_audit_tenant
  ON negotiation_audit_log(tenant_id, event_type, created_at);
```

### 6.3 API Surface

All endpoints are prefixed `/api/v1/negotiation` and require authentication (authMiddleware).

| Method | Path | Description |
|---|---|---|
| `GET` | `/negotiation/policy` | Get caller's vendor pricing policy |
| `PUT` | `/negotiation/policy` | Upsert vendor pricing policy (seller) |
| `POST` | `/negotiation/listings/:type/:id/mode` | Set pricing mode on a listing (seller) |
| `GET` | `/negotiation/listings/:type/:id/mode` | Get pricing mode for a listing |
| `POST` | `/negotiation/sessions` | Buyer opens a negotiation session |
| `GET` | `/negotiation/sessions` | List sessions for caller (buyer or seller) |
| `GET` | `/negotiation/sessions/:id` | Get session detail |
| `POST` | `/negotiation/sessions/:id/offer` | Submit offer or counteroffer |
| `POST` | `/negotiation/sessions/:id/accept` | Accept current best offer |
| `POST` | `/negotiation/sessions/:id/decline` | Decline and close session |
| `POST` | `/negotiation/sessions/:id/cancel` | Buyer cancels open session |
| `GET` | `/negotiation/sessions/:id/history` | Full offer history for a session |
| `GET` | `/negotiation/analytics` | Seller negotiation analytics (admin/workspace) |

### 6.4 Integration with Existing Checkout

When `negotiation_sessions.status` transitions to `accepted`:
1. `final_price_kobo` is set on the session record.
2. A price-lock token is generated (a signed reference to the session ID + accepted price).
3. The buyer is directed to the standard checkout/payment flow with the locked price passed as `amount_kobo`.
4. The Paystack initialisation receives the locked price in kobo.
5. On Paystack verification, the payment is recorded and the underlying listing's order/booking record is created with the negotiated `total_kobo`.

The payment flow does not change. Only the price source changes (fixed catalog vs. accepted negotiation session).

### 6.5 Auto-Expiry Background Job

A Cloudflare Worker scheduled trigger (CRON: every 15 minutes) runs an expiry sweep:

```sql
UPDATE negotiation_sessions
SET status = 'expired', updated_at = unixepoch()
WHERE status = 'open'
  AND expires_at < unixepoch();
```

Expired sessions trigger:
- A notification to the buyer (offer expired without response).
- An audit log entry (`event_type = 'expired'`, `actor_type = 'system'`).
- The listing reverts to `available` status if it was temporarily `reserved`.

### 6.6 Auto-Accept Logic

When a new offer is submitted, the system evaluates auto-accept:

```typescript
function shouldAutoAccept(
  offerKobo: number,
  listedPriceKobo: number,
  thresholdBps: number | null
): boolean {
  if (thresholdBps === null) return false;
  // Accept if offer >= listed_price * (1 - threshold_bps / 10000)
  // All integer arithmetic: no floats
  const minAutoAccept = Math.floor(
    (listedPriceKobo * (10000 - thresholdBps)) / 10000
  );
  return offerKobo >= minAutoAccept;
}
```

If auto-accept fires, the session transitions to `accepted` immediately and an audit log entry records `event_type = 'auto_accepted'`, `actor_type = 'system'`.

---

## 7. Vertical-by-Vertical Application

### 7.1 Commerce — Goods Marketplaces

| Vertical | Negotiation recommendation | Mode | Notes |
|---|---|---|---|
| spare-parts | ✅ Enable | `hybrid` default | Negotiation is culturally dominant in Ladipo/UAC/Aspamda. Wholesale min-qty guardrail applicable. |
| used-car-dealer | ✅ Enable (already informal) | `negotiable` | Formalise existing `offer_price_kobo` into proper session model. |
| building-materials | ✅ Enable for bulk orders | `hybrid` | Standard products fixed; custom/bulk orders negotiable. Use `session_type = 'bulk_rfq'`. |
| iron-steel | ✅ Enable wholesale | `hybrid` | `wholesale_price_kobo` already exists; bulk RFQ layer adds negotiation for custom mill specs. |
| paints-distributor | ✅ Enable wholesale | `hybrid` | Contractor discounts standard; RFQ layer for large volume. |
| plumbing-supplies | ✅ Enable wholesale | `hybrid` | Same pattern as paints. |
| motorcycle-accessories | ✅ Enable | `negotiable` vendor default | Market-first product, high bargaining expectation. |
| bookshop | ⚠️ Partial | `fixed` default, `negotiable` for bulk | Retail books fixed. Bulk institutional orders (schools) negotiate. |
| bakery | ❌ Not recommended | `fixed` | FMCG perishable — negotiation adds friction without value. |
| food-vendor | ❌ Not recommended | `fixed` | Real-time street food — negotiation is impractical per order. |
| pharmacy-chain | ❌ Not recommended | `fixed` | Drug pricing is regulated. Negotiation creates compliance risk. |
| gas-distributor | ⚠️ Partial | `fixed` standard, `bulk_rfq` for commercial | Retail cylinder refills fixed. Commercial tank deliveries: use bulk RFQ. |

### 7.2 Service Marketplaces

| Vertical | Negotiation recommendation | Mode | Notes |
|---|---|---|---|
| handyman | ✅ Enable | `negotiable` | Service quote model — every job is bespoke. Use `service_quote` session type. |
| it-support | ✅ Enable for project scope | `negotiable` | Recurring support contracts negotiated; per-ticket fixed. |
| generator-repair | ✅ Enable | `negotiable` | Labour + parts quotes naturally negotiated. |
| auto-mechanic | ✅ Enable | `negotiable` | Same as generator-repair. |
| catering | ✅ Enable | `negotiable` | Per-event price-per-head negotiation is standard practice. |
| cleaning-service | ✅ Enable for recurring | `hybrid` | One-time clean: fixed. Recurring contract: negotiable. |
| laundry / laundry-service | ❌ Not recommended | `fixed` | Per-item or per-kg pricing. Negotiation adds no value. |
| beauty-salon | ❌ Not recommended | `fixed` | Service menu pricing. |
| optician | ❌ Not recommended | `fixed` | Clinical + product pricing should be consistent and transparent. |
| land-surveyor | ✅ Enable | `negotiable` | Job-specific scoping and pricing. Quote-based. |
| printing-press | ✅ Enable | `negotiable` | Print specs (quantity, paper, binding) drive quote-based pricing. |
| motivational-speaker | ✅ Enable | `negotiable` | Speaker fee negotiation is universal in this category. |
| gym-fitness | ⚠️ Partial | `fixed` default, `negotiable` for corporate | Retail memberships fixed. Corporate packages: negotiate. |

### 7.3 Transport and Logistics

| Vertical | Negotiation recommendation | Mode | Notes |
|---|---|---|---|
| logistics-delivery | ✅ Enable for charter | `hybrid` | Per-parcel delivery: fixed fare. Full-vehicle charter or bulk freight: negotiable. |
| cargo-truck | ✅ Enable | `negotiable` | Haulage rates are always negotiated. Use `bulk_rfq` session type. |
| okada-keke | ❌ Not recommended | `fixed` | Per-trip fare — negotiation is pre-platform. App standardises rates. |
| clearing-agent | ✅ Enable | `negotiable` | Clearing fees and port logistics are always quoted and negotiated. |
| dispatch-rider | ❌ Not recommended | `fixed` | Same as okada-keke — per-delivery fixed rates. |
| hotel | ⚠️ Partial | `fixed` standard, `negotiable` for corporate/group | Rack rates fixed. Corporate rates and group bookings: negotiable. |

### 7.4 Single-Vendor Commerce

For single-vendor setups (one seller, direct buyer), the negotiation model is simpler — there is no platform-level aggregation complexity. The seller's `vendor_pricing_policy` row is the sole source of negotiation parameters. All sessions are between the registered seller workspace and identified buyers.

### 7.5 Multi-Vendor Aggregation (Market Hub, Market Association)

In multi-vendor settings (e.g., a market association workspace where individual traders are sub-tenants or listed vendors):

- Each vendor has their own `vendor_pricing_policy`.
- Platform-level display shows the per-item negotiation badge pulled from `listing_price_overrides`.
- The buyer negotiates directly with the individual vendor workspace, not the aggregator.
- The aggregator can optionally set a **platform-wide minimum** (ensuring vendors do not negotiate below a floor that would undermine market reputation).
- All negotiation sessions are scoped to `tenant_id` — the aggregator tenant — but buyer ↔ individual vendor workspace.

### 7.6 B2B and Wholesale

For B2B order flows (iron-steel, construction, oil-gas-services, clearing agent):

- Session type is `bulk_rfq`.
- The session record carries `quantity` in addition to price.
- The seller's response is a formal quote with `valid_until` timestamp.
- Accepted RFQ sessions generate a purchase order record in the respective vertical's order table.
- Payment via Paystack trade or bank transfer reference is tied to the PO.

### 7.7 Verticals Where Negotiation Should Be Disabled or Restricted

| Vertical | Reason |
|---|---|
| Pharmacy chain | Drug pricing is regulated by NAFDAC / PCN. Negotiation creates compliance exposure. |
| Food vendor (street food) | Real-time FMCG — negotiation is operationally impractical. |
| Bakery (retail) | Perishable FMCG — same as food vendor. |
| Petrol station | PMS price is regulated by NNPCL. Station cannot legally negotiate pump price. |
| Internet cafe (session pricing) | Per-minute or per-session rates — fixed by operational necessity. |
| Govt school | Fee structures are set by government. Negotiation is inappropriate. |
| Orphanage | Financial transactions are donation-based or government-funded. No commercial negotiation. |
| Okada-keke | Platform standardises fares to combat exploitation. Negotiation undermines that goal. |

---

## 8. Risk Management

### 8.1 Abuse Cases and Mitigations

| Risk | Description | Mitigation |
|---|---|---|
| Low-ball anchoring | Buyer submits ₦1 offers to manipulate seller psychology | `min_price_kobo` floor on session creation; offers below floor are auto-rejected with a clear message before consuming a round |
| Offer farming | Buyer opens multiple sessions on same listing across accounts | Rate limit: one open session per buyer per listing per tenant. Detected via `(buyer_ref_id, listing_id)` unique-open check |
| Price shadowing | Competitor opens offers to discover seller's real floor price | `max_offer_rounds` limits rounds. `min_price_kobo` is never revealed to buyer. Sellers are advised not to counter at exactly their minimum |
| Session ghost | Buyer accepts, then does not pay. Listing stays reserved. | Accepted sessions without payment within N hours auto-cancel. Listing is released back to available. Buyer gets a strike |
| Offer expiry abuse | Seller deliberately does not respond to let offer expire, then relists at higher price | Audit log captures all events. Excessive non-response patterns are flagged in seller health score |
| Counteroffer spam | Seller keeps countering to drain buyer's patience | `max_offer_rounds` enforced by system, not by politeness |
| Fake RFQ | Buyer submits RFQ for industrial quantity with no intention to buy | Require KYC Tier 2+ for bulk RFQ session type. Large-value RFQs (above threshold) require deposit before session opens |
| Price collusion | Multiple vendors coordinate minimum prices via external channel | Analytics layer monitors accepted price distributions. Anomalies flagged for platform review |

### 8.2 Fairness and Trust

- **Price history transparency:** Buyers can see when a listing's price was last updated (via `listing_price_overrides.valid_until` and `updated_at`). This is important given Nigerian inflation realities.
- **Minimum visible to buyer:** The buyer is never shown the seller's private minimum price. The system only reveals whether their offer meets auto-accept threshold — not the exact threshold.
- **Seller accountability:** Sellers who consistently decline all offers without countering may have their "Accepts Offers" badge hidden by the platform after a review period.
- **Dispute resolution:** If a session is accepted and the seller refuses to honour the agreed price, the dispute is escalated to platform support. The `negotiation_audit_log` serves as the evidence record.

### 8.3 Margin Protection Analytics

The platform should surface the following seller analytics:

| Metric | Description |
|---|---|
| Acceptance rate | % of offer sessions that result in a sale |
| Average discount depth | Mean (listed_price - final_price) / listed_price, in bps |
| Counteroffer conversion | % of sessions where seller's counteroffer was accepted |
| Session abandonment rate | % of sessions where buyer declines or lets offer expire |
| Time to close | Median hours from session open to accepted/declined |
| Revenue at risk | Aggregate of open session offers below listed price |

These analytics are surfaced in the seller's workspace analytics dashboard.

### 8.4 Platform Governance

- **Negotiation feature flag per tenant:** Platform admins can disable negotiation for a specific tenant if abuse is detected.
- **AI content review:** Offer notes and messages pass through the platform's content moderation before delivery.
- **Rate limits:** Max N negotiation sessions open per buyer per day (platform-level). Max M offer submissions per hour per buyer.
- **Price-below-cost alert:** If the accepted price is below the cost_price_kobo recorded on the catalog item (where that field exists), the system flags the transaction for seller review. This is advisory, not blocking.

---

## 9. MVP Roadmap

### Phase 0 — Foundation (4–6 weeks)

**Goal:** Lay the data and API foundations without exposing UX to buyers yet.

- [ ] Migration: `vendor_pricing_policies`, `listing_price_overrides`, `negotiation_sessions`, `negotiation_offers`, `negotiation_audit_log`
- [ ] Packages: `@webwaka/negotiation` — repository classes, FSM, guardrail evaluator, auto-accept logic
- [ ] API routes: `PUT /negotiation/policy`, `POST /negotiation/listings/:type/:id/mode`
- [ ] Background job: auto-expiry CRON sweep
- [ ] Internal tooling: admin panel can view/override any session
- [ ] Unit tests: guardrail evaluation, auto-accept logic, FSM transitions, audit log writes

**Pilot verticals for Phase 0 internal test:** used-car-dealer (already has informal `negotiating` status), spare-parts.

### Phase 1 — Seller Opt-In MVP (4–6 weeks)

**Goal:** Sellers can enable negotiation. Buyers can submit first offers. No auto-accept, no counteroffer yet.

- [ ] Seller UX: Pricing Policy panel in workspace settings
- [ ] Per-listing negotiation toggle in catalog management
- [ ] Buyer UX: Negotiation badge on listings, "Make Offer" form
- [ ] Notification: Seller receives offer notification (push + in-app)
- [ ] Seller response: Accept or Decline (no counter yet)
- [ ] Checkout integration: Price-lock token → Paystack initialisation at negotiated price
- [ ] Analytics: Session count, acceptance rate, discount depth
- [ ] Pilot verticals: used-car-dealer, spare-parts, real-estate-agency

**Success metric for Phase 1:** ≥30 accepted sessions on pilot verticals within 30 days of launch. Acceptance rate ≥25% of opened sessions.

### Phase 2 — Counteroffer and Guardrails (4–6 weeks)

**Goal:** Full offer ↔ counteroffer lifecycle. Auto-accept. Bulk RFQ.

- [ ] Counteroffer flow: seller can counter with message
- [ ] Multi-round tracking: rounds_used, auto-close at max_rounds
- [ ] Auto-accept threshold configuration and evaluation
- [ ] Bulk RFQ session type (`bulk_rfq`): quantity field, seller responds with per-unit price
- [ ] Buyer counter to seller's counteroffer
- [ ] Session abandonment: auto-cancel unpaid accepted sessions
- [ ] Expand pilot verticals: handyman, building-materials, iron-steel, catering, land-surveyor, logistics-delivery (charter), cargo-truck, clearing-agent

**Success metric for Phase 2:** ≥60% of opened sessions reach a resolution (accept or decline) within 48 hours. Counteroffer-to-accept conversion ≥40%.

### Phase 3 — Platform-Wide Expansion (6–8 weeks)

**Goal:** Roll out to all eligible verticals. Enable wholesale/B2B track. Seller analytics dashboard.

- [ ] Enable for all verticals rated ✅ or ⚠️ in Section 7 above
- [ ] Wholesale/B2B track: `service_quote` session type for professional services
- [ ] Full analytics dashboard for sellers (acceptance rate, discount depth, time to close)
- [ ] Platform-level moderation: session abuse flagging, seller health score
- [ ] Price history display on listing pages (last updated, price changes)
- [ ] Multi-vendor market hub: aggregator-level floor price configuration

### Phase 4 — AI Enhancements (8–12 weeks, premium tier)

**Goal:** AI-assisted negotiation as a premium workspace capability.

- [ ] Smart price suggestions for buyers (based on accepted price distribution for similar listings)
- [ ] AI counteroffer drafting for sellers (suggest a counter based on guardrails and market data)
- [ ] Dynamic floor pricing: seller sets a cost basis; platform adjusts `min_price_kobo` based on input cost index (fuel, FX, commodity) — seller-approved automation
- [ ] Demand-based pricing hints: "3 buyers are looking at this item — demand is high"
- [ ] Auto-negotiation bot: buyer sets max budget; system negotiates on their behalf within guardrails

**AI cap constraints:** AI-generated offer messages are L2 (reviewed by seller before sending). AI-generated price analysis is advisory only. No AI action can result in an accepted price below the seller's `min_price_kobo`.

---

## 10. Open Questions and Assumptions

### 10.1 Open Questions

1. **Buyer identity in negotiation sessions.** The design uses `buyer_ref_id` (linking to `individuals.id` or `organizations.id`). Should anonymous or KYC-Tier-1 buyers be allowed to make offers, or is Tier 2 KYC required? Recommendation: Tier 1 for low-value offers; Tier 2 for B2B/bulk RFQ.

2. **Cross-tenant negotiation.** In multi-tenant deployments, can a buyer on Tenant A negotiate with a seller listed on Tenant B? Current design assumes all negotiation is within the same tenant. Cross-tenant is a Phase 5+ consideration.

3. **Currency handling.** The platform is NGN-first. Should USD or other currencies be supported for export-oriented verticals (oil-gas-services, cocoa-exporter, clearing-agent)? Recommendation: Express all amounts in NGN kobo; display USD equivalent as a view-layer formatting concern only. No FX conversion in the database.

4. **WhatsApp integration.** Some Nigerian sellers prefer to negotiate on WhatsApp. Should the platform support a "Take to WhatsApp" escape hatch that pre-fills a message with the listing and asking price? This would exit the platform's audit trail but may improve conversion in the short term. Not recommended for Phase 1.

5. **Offer cancellation by buyer.** Should buyers be able to cancel an offer they've submitted before the seller responds? The design includes `/sessions/:id/cancel`. This should be allowed but limited to once per session per 24 hours to prevent tactical manipulation.

6. **Integration with the Superagent AI layer.** WebWaka has an existing AI advisory layer (`@webwaka/superagent`). The negotiation AI features in Phase 4 should be implemented as an extension of that layer, subject to existing P12/P13 data-handling rules.

7. **Price-lock and inventory reservation.** For single-quantity items (used cars, specific properties), an accepted offer should block other buyers from purchasing. For multi-quantity or service items, the listing remains available. The MVP should handle single-quantity reservation; multi-quantity reservation is Phase 2.

8. **Dispute resolution workflow.** What happens when a seller refuses to honour an accepted price? The audit log provides evidence. A dispute resolution API and escalation workflow are needed but are not in the MVP scope.

### 10.2 Key Assumptions

- All prices are stored and processed as integer kobo (NGN). This is a hard invariant.
- The buyer is always an authenticated, identified individual or organisation with at least KYC Tier 1.
- The `listing_type` + `listing_id` combination uniquely identifies any catalog item across the platform.
- Negotiation is a seller-side feature — sellers can see all their open sessions; buyers can see only their own sessions.
- The Cloudflare Workers runtime supports scheduled triggers (CRON) for the auto-expiry sweep.
- Phase 4 AI enhancements require the AI abstraction layer (`@webwaka/ai-abstraction`) and are gated behind a premium workspace tier.
- Fixed pricing is never affected by the introduction of these features. Sellers who do not opt in see no change to their experience.

---

## Appendix A — Migration Reference

Next available migration number: **0181**

Proposed migration files:
- `0181_negotiation_vendor_policies.sql` — `vendor_pricing_policies`
- `0182_negotiation_listing_overrides.sql` — `listing_price_overrides`
- `0183_negotiation_sessions.sql` — `negotiation_sessions`
- `0184_negotiation_offers.sql` — `negotiation_offers`
- `0185_negotiation_audit_log.sql` — `negotiation_audit_log`

---

## Appendix B — Vertical Applicability Summary

| Vertical | Mode | Phase |
|---|---|---|
| used-car-dealer | negotiable | Phase 1 (pilot) |
| spare-parts | hybrid | Phase 1 (pilot) |
| real-estate-agency | negotiable | Phase 1 (pilot) |
| handyman | negotiable | Phase 2 |
| building-materials | hybrid (bulk RFQ) | Phase 2 |
| iron-steel | hybrid (wholesale) | Phase 2 |
| catering | negotiable | Phase 2 |
| logistics-delivery (charter) | hybrid | Phase 2 |
| cargo-truck | negotiable (bulk RFQ) | Phase 2 |
| clearing-agent | negotiable | Phase 2 |
| land-surveyor | negotiable | Phase 2 |
| printing-press | negotiable | Phase 2 |
| it-support (project) | negotiable | Phase 2 |
| generator-repair | negotiable | Phase 2 |
| auto-mechanic | negotiable | Phase 2 |
| paints-distributor | hybrid (wholesale) | Phase 3 |
| plumbing-supplies | hybrid (wholesale) | Phase 3 |
| motorcycle-accessories | negotiable | Phase 3 |
| bookshop (bulk) | negotiable | Phase 3 |
| hotel (corporate/group) | hybrid | Phase 3 |
| gas-distributor (commercial) | bulk RFQ | Phase 3 |
| oil-gas-services | negotiable (service_quote) | Phase 3 |
| construction | negotiable (service_quote) | Phase 3 |
| motivational-speaker | negotiable | Phase 3 |
| cleaning-service (recurring) | hybrid | Phase 3 |
| market-association (stall holders) | hybrid | Phase 3 |
| gym-fitness (corporate) | hybrid | Phase 3 |
| pharmacy-chain | ❌ Disabled | — |
| food-vendor | ❌ Disabled | — |
| bakery (retail) | ❌ Disabled | — |
| petrol-station | ❌ Disabled | — |
| internet-cafe | ❌ Disabled | — |
| govt-school | ❌ Disabled | — |
| orphanage | ❌ Disabled | — |
| okada-keke | ❌ Disabled | — |
| laundry / laundry-service | ❌ Disabled | — |
| beauty-salon | ❌ Disabled | — |
| optician | ❌ Disabled | — |

---

*End of document.*
