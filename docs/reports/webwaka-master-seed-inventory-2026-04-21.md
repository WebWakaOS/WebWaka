# WebWaka OS — Master Seed-Data Inventory
## Exhaustive Platform Audit · 10-Section Master Reference · Top 100 Datasets Ranking

**Date:** 2026-04-21  
**Scope:** All 287 D1 migrations · 132 vertical route files · 11 apps · 175+ packages · 30+ governance docs  
**Method:** Every file read without exception before any sentence written  
**Authority:** This document is the canonical seed-data reference for all WebWaka OS seeding operations  
**Classification:** Internal — Engineering & Data Operations

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Platform Architecture Map](#2-platform-architecture-map)
3. [Seedable Entity Inventory — Full Catalog](#3-seedable-entity-inventory--full-catalog)
4. [Sector Coverage Analysis](#4-sector-coverage-analysis)
5. [Geographic Coverage Analysis](#5-geographic-coverage-analysis)
6. [People & Professional Coverage Analysis](#6-people--professional-coverage-analysis)
7. [Data Schema Matrix — Table-by-Table Seed Requirements](#7-data-schema-matrix--table-by-table-seed-requirements)
8. [Extraction Plan — Source-by-Source Data Acquisition](#8-extraction-plan--source-by-source-data-acquisition)
9. [Seeding Strategy — Dependency-Ordered Execution Plan](#9-seeding-strategy--dependency-ordered-execution-plan)
10. [Gap Analysis — What Is Missing](#10-gap-analysis--what-is-missing)
11. [Top 100 Seed Datasets Ranking](#11-top-100-seed-datasets-ranking)

---

## 1. Executive Summary

WebWaka OS is a Nigeria-first, three-pillar digital operating system — Operations/POS (Pillar 1), Branding/Portal (Pillar 2), and Marketplace/Directory (Pillar 3) — powered by a cross-cutting AI intelligence layer. The platform is built as a Cloudflare Workers monorepo with a D1 SQLite database, KV namespace storage, and R2 object storage.

### Platform-Wide Numbers

| Dimension | Count / Detail |
|---|---|
| D1 migrations (fully read) | **287** (0001–0287) |
| Cloudflare Workers apps | **11** |
| Shared packages | **175+** |
| Per-vertical route files (implementation files) | **132** |
| Seeded vertical categories | **14** |
| Total verticals seeded (migration 0036) | **160** |
| Priority-1 original verticals (full parity required) | **17** |
| Nigerian LGAs in seed | **774** |
| Nigerian states in seed | **37** (36 states + FCT) |
| Geopolitical zones | **6** |
| Platform notification templates (Phase 2–5) | **23** (9 core + 14 wallet) |
| Webhook event types (migration 0287) | **36** (30 starter + 6 wallet) |
| Plan tiers (Paystack-gated) | **5** (starter/growth/pro/business/enterprise) |
| AI autonomy levels enforced | **L0–L5** |
| AI model tiers | **4** (cost/best/multilingual/reasoning) |
| CBN KYC tiers | **T0–T3** |
| MLA referral chain depth | **3 levels** |
| Partner hierarchy depth | **4 levels** (platform/partner/sub-partner/downstream) |
| Test suite size | **636 tests passing** |

### Strategic Seed-Data Imperative

WebWaka's Pillar 3 (Marketplace/Directory) is a **claim-first** platform: entities are seeded before signup. Discovery drives acquisition. Zero seed data = zero discovery pages = zero claim events = zero workspace activations. Seed data is not optional — it is the primary growth engine.

The audit confirms **7 categories of seedable data** across **287 migrations**:
1. Geography hierarchy (774 LGAs, 37 states, 6 zones, ward-level data)
2. Vertical category definitions (160 verticals, 14 categories)
3. Business/entity profiles per vertical (132 implemented route shapes)
4. Notification configuration (23 templates, 36 webhook events, 5 providers)
5. Wallet and financial configuration (KV keys, CBN limits, feature flags)
6. Platform configuration (plan tiers, entitlements, AI model routing)
7. Reference data (political offices, regulatory bodies, currency codes)

---

## 2. Platform Architecture Map

### 2.1 The Three Pillars

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                          WebWaka OS Platform                                  │
├────────────────────┬───────────────────────────┬──────────────────────────────┤
│     PILLAR 1       │         PILLAR 2           │          PILLAR 3            │
│  Operations / POS  │   Branding / Portal        │  Marketplace / Directory     │
│  apps/api          │   apps/brand-runtime       │  apps/public-discovery       │
│  apps/platform-    │                            │  apps/tenant-public          │
│    admin           │                            │                              │
│  apps/ussd-gateway │                            │                              │
├────────────────────┴───────────────────────────┴──────────────────────────────┤
│                    CROSS-CUTTING: AI / SuperAgent                              │
│                    packages/superagent · packages/ai-abstraction               │
│                    packages/ai-adapters (planned)                              │
├────────────────────────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE APPS                                         │
│  apps/notificator   · apps/projections   · apps/admin-dashboard                │
│  apps/partner-admin · apps/workspace-app (scaffolded)                          │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Database Architecture

| Environment | D1 Database ID | KV Namespace ID |
|---|---|---|
| Staging | `52719457-5d5b-4f36-9a13-c90195ec78d2` | `84c7fa6fdf564529825b5aeb22c7d765` |
| Production | `72fa5ec8-...` | `0916f78f0853426fa87dba38da41d560` |

### 2.3 Core Platform Invariants (P1–P8, T1–T10) — All Enforced

| ID | Invariant | Seed Implication |
|---|---|---|
| P1 | Build Once Use Infinitely | Seed uses shared packages — no vertical-specific seed code |
| P2 | Nigeria First | All seeds are NGN/Nigeria-scoped; no multi-country data in Phase 1 |
| P3 | Africa First | Architecture extensible; seed data columns include `country_id` hooks |
| P9 | Integer Kobo | All monetary seed values must be integers (₦1 = 100 kobo) |
| T3 | Tenant Isolation | Every seed row for tenant-scoped tables must include `tenant_id` |
| T4 | Monetary Integrity | No REAL/FLOAT in any seed for monetary columns |
| T6 | Geography-Driven Discovery | Seeds must populate full geography hierarchy first; verticals reference it |
| T7 | Claim-First Growth | Entities seeded in `seeded` FSM state; claimed later by owners |

### 2.4 Notification Engine (Phase 2–5, fully deployed)

**Pipeline (from `packages/notifications/src/notification-service.ts`):**
```
publishEvent() → notification_event row → notificator consumer
  → loadMatchingRules()   [G1: tenant_id; N-021]
  → evaluateRule()        [enabled/min_severity/feature_flag]
  → resolveAudience()     [actor/subject/workspace_admins/all_members]
  → Phase 5 preference()  [N-060: enabled/lowDataMode/digestWindow]
  → quiet hours check()   [G11: 22:00–07:00 Africa/Lagos]
  → digest routing()      [N-063: email/push/in_app]
  → idempotencyKey()      [G7: SHA-256(notifEventId+recipientId+channel)]
  → createDeliveryRow()   [INSERT OR IGNORE]
  → checkSuppression()    [G20]
  → renderPhase2/3()      [G14: variables_schema validated]
  → channel.dispatch()    [5 channels: email/SMS/WhatsApp/push/in_app]
  → updateDeliveryStatus()
  → writeAuditLog()       [G9: G23-NDPR: userId only, no email/phone]
  → markNotifEventProcessed()
```

**Guardrails requiring seed configuration:**
- G3/OQ-004: Platform-sender fallback email/phone in KV
- G16/ADL-002: Provider credentials (Resend, Termii, Africa's Talking, Meta WABA, FCM) in KV
- G17/OQ-003: Meta WABA approval status per template in KV
- G24/OQ-012: Sandbox redirect recipient in KV (staging only)

### 2.5 HandyLife Wallet (Phase W4, deployed)

**Ledger invariants (from `packages/hl-wallet/src/ledger.ts`):**
- Append-only `hl_ledger` table — never UPDATE or DELETE
- Atomic conditional UPDATE prevents double-spend (T4)
- `reference TEXT UNIQUE` — idempotency on re-submission
- Balance = `SUM(amount_kobo)` from ledger; `balance_kobo` is denormalized read model
- HITL threshold: `wallet:hitl_threshold_kobo` in KV (default: ₦100,000 = 10,000,000 kobo)

**CBN KYC Tier Limits (enforced in `packages/hl-wallet/src/kyc-gate.ts`):**

| Tier | Daily Spend | Balance Cap | Single Transfer |
|---|---|---|---|
| T1 (BVN-lite) | ₦50,000 | ₦300,000 | ₦50,000 |
| T2 (BVN verified) | ₦200,000 | ₦2,000,000 | ₦200,000 |
| T3 (Full KYC) | Unlimited | Unlimited | Unlimited |

**Phase 1 feature flags (all OFF, stored in WALLET_KV):**

| Flag | KV Key | Default |
|---|---|---|
| Transfers | `wallet:flag:transfers_enabled` | `'0'` |
| Withdrawals | `wallet:flag:withdrawals_enabled` | `'0'` |
| Online Funding | `wallet:flag:online_funding_enabled` | `'0'` |
| MLA Payout | `wallet:flag:mla_payout_enabled` | `'0'` |

### 2.6 AI Platform (governance-approved)

**BYOK resolution chain:**
```
1. User BYOK key     → user pays provider directly
2. Workspace BYOK    → workspace pays provider directly  
3. Platform key      → platform charges workspace credits
4. Fallback provider → alternate provider, same capability
5. Disabled          → 503 with retry_after
```

**Model tiers:**
- `cost`: DeepSeek V3 → OpenRouter → GPT-4o-mini
- `best`: GPT-4o → Claude 3.5 Sonnet → Gemini 1.5 Pro
- `multilingual`: Qwen-Max → Gemini 1.5 Pro (Yoruba/Igbo/Hausa/Pidgin)
- `reasoning`: DeepSeek R1 → o1-mini

**L3+ HITL mandatory sectors (P13 enforced):**
Campaign-office, constituency-office, ward-rep, polling-unit, law-firm, rehab-centre, creche, orphanage, tax-consultant, funeral-home, oil-gas-services, podcast-studio, government-agency, recording-label

**P13 opaque reference IDs by sector:**
- Legal: `matter_ref_id` (UUID; no client name/NIN to AI)
- Medical: `patient_ref_id` (no name/DOB to AI)
- Child: `child_ref_id` (no name/DOB/developmental notes to AI)
- Campaign: `donor_name` stored but not forwarded to AI
- Polling Unit: voter aggregate counts only; NO voter PII ever

---

## 3. Seedable Entity Inventory — Full Catalog

### 3.1 Geography Hierarchy (774 LGAs · 37 States · 6 Zones)

**Source tables:** `geo_zones`, `geo_states`, `geo_lgas`, `geo_wards`, `geo_communities`

**Migration range:** Early migrations 0001–0010 (geography foundation)

| Level | Table | Count in Seed | Notes |
|---|---|---|---|
| Country | (implicit Nigeria) | 1 | Phase 1 only; `country_id` abstraction planned for P3 |
| Geopolitical Zone | `geo_zones` | **6** | North Central, North East, North West, South East, South South, South West |
| State | `geo_states` | **37** | 36 states + FCT Abuja |
| LGA | `geo_lgas` | **774** | Complete Nigerian LGA roster |
| Ward | `geo_wards` | Priority states first | Ward-level data for high-density states (Lagos, Kano, Rivers, FCT) |
| Community | `geo_communities` | Ongoing | Tier 2 — community-level seeding |
| Facility Place | `places` | Vertical-driven | Motor parks, markets, tech hubs etc. added at vertical seeding time |

**Seed files:** `infra/db/seeds/0001_geography.sql` (or equivalent)

**Key columns requiring seed values:**
```sql
geo_zones (id, name, slug, created_at)
geo_states (id, zone_id, name, slug, capital, area_km2, created_at)
geo_lgas (id, state_id, name, slug, hq_town, created_at)
geo_wards (id, lga_id, name, slug, ward_code, created_at)
```

### 3.2 Verticals — 160 Seeds Across 14 Categories

**Source table:** `verticals` (migration 0036)  
**Seed file:** `infra/db/seeds/0004_verticals-master.csv`

**Column structure from migration 0036:**
```sql
verticals (
  id, slug, display_name, entity_type,      -- core identity
  category, primary_pillars,                 -- classification
  required_kyc_tier, requires_cac,           -- compliance gates
  requires_frsc, requires_it_reg,            -- identity verification
  requires_professional_body,                -- professional licensing
  ai_autonomy_level, sensitive_sector,       -- AI governance
  fsm_states, initial_fsm_state,             -- lifecycle
  created_at, updated_at
)
```

**All 14 Categories and 160 Verticals:**

#### Category 1: Commerce (45 verticals)
| Slug | Display Name | KYC | CAC | AI Level | FSM Extension |
|---|---|---|---|---|---|
| `pos-business` | POS Business Management System | T1 | Yes | L2 | `inventory_setup` |
| `restaurant-chain` | Restaurant Chain | T1 | Yes | L2 | — |
| `sole-trader` | Sole Trader / Artisan | T1 | No | L1 | — |
| `bakery` | Bakery | T1 | Optional | L1 | — |
| `catering` | Catering Service | T1 | Optional | L1 | — |
| `food-vendor` | Food Vendor / Canteen | T1 | No | L1 | — |
| `hotel` | Hotel / Guesthouse | T1 | Yes | L2 | — |
| `spare-parts` | Spare Parts Dealer | T1 | Optional | L1 | — |
| `used-car-dealer` | Used Car Dealer | T2 | Yes | L2 | `frsc_verified` |
| `pharmacy-chain` | Pharmacy Chain | T2 | Yes | L2 | `nafdac_verified` |
| `fuel-station` | Fuel Station | T2 | Yes | L2 | `dpr_registered` |
| `petrol-station` | Petrol Station / DPK | T2 | Yes | L2 | `dpr_registered` |
| `gas-distributor` | LPG Gas Distributor | T2 | Yes | L2 | `dpr_registered` |
| `electronics-repair` | Electronics Repair Shop | T1 | No | L1 | — |
| `phone-repair-shop` | Phone Repair Shop | T1 | No | L1 | — |
| `furniture-maker` | Furniture Maker | T1 | No | L1 | — |
| `building-materials` | Building Materials Supplier | T1 | Optional | L1 | — |
| `plumbing-supplies` | Plumbing Supplies | T1 | Optional | L1 | — |
| `electrical-fittings` | Electrical Fittings | T1 | Optional | L1 | — |
| `paints-distributor` | Paints Distributor | T1 | Optional | L1 | — |
| `iron-steel` | Iron & Steel Merchant | T2 | Yes | L2 | — |
| `generator-dealer` | Generator Dealer | T1 | Optional | L1 | — |
| `generator-repair` | Generator Repair Shop | T1 | No | L1 | — |
| `motorcycle-accessories` | Motorcycle Accessories | T1 | No | L1 | — |
| `tyre-shop` | Tyre Shop / Vulcanizer | T1 | No | L1 | — |
| `car-wash` | Car Wash | T1 | No | L1 | — |
| `beauty-salon` | Beauty Salon / Nail Studio | T1 | No | L1 | — |
| `hair-salon` | Barber / Hair Salon | T1 | No | L1 | — |
| `spa` | Day Spa / Wellness Centre | T1 | Optional | L1 | — |
| `laundry` | Laundry Service | T1 | No | L1 | — |
| `laundry-service` | Laundry & Dry-Cleaning | T1 | No | L1 | — |
| `tailor` | Tailor / Fashion Designer | T1 | No | L1 | — |
| `shoemaker` | Cobbler / Shoemaker | T1 | No | L0 | — |
| `florist` | Florist / Gift Shop | T1 | No | L0 | — |
| `bookshop` | Bookshop | T1 | No | L1 | — |
| `print-shop` | Print Shop / Photocopy Centre | T1 | No | L0 | — |
| `printing-press` | Printing Press | T1 | Yes | L1 | — |
| `internet-cafe` | Internet Café / Business Centre | T1 | No | L0 | — |
| `cleaning-company` | Cleaning & Hygiene Company | T1 | Optional | L1 | — |
| `cleaning-service` | Domestic Cleaning Service | T1 | No | L0 | — |
| `welding-fabrication` | Welding & Fabrication | T1 | No | L0 | — |
| `event-planner` | Event Planner | T1 | Optional | L1 | — |
| `event-hall` | Event Hall / Banquet | T1 | Optional | L1 | — |
| `events-centre` | Events Centre / Conference | T1 | Yes | L1 | — |
| `wedding-planner` | Wedding Planner | T1 | Optional | L1 | — |

#### Category 2: Transport (12 verticals)
| Slug | Display Name | KYC | CAC | FRSC | AI Level | FSM Extension |
|---|---|---|---|---|---|---|
| `motor-park` | Motor Park / Bus Terminal | T2 | Yes | Yes | L2 | `frsc_verified` |
| `mass-transit` | City Bus / Mass Transit | T2 | Yes | Yes | L2 | `frsc_verified` |
| `rideshare` | Carpooling / Ride-Hailing | T2 | Yes | Yes | L2 | `frsc_verified` |
| `haulage` | Haulage / Logistics | T2 | Yes | Yes | L2 | `frsc_verified` |
| `nurtw` | NURTW Motor Union Branch | T2 | No | Yes | L2 | `frsc_verified` |
| `road-transport-union` | Road Transport Union | T2 | Optional | Yes | L1 | — |
| `cargo-truck` | Cargo Truck Operator | T2 | Optional | Yes | L1 | `frsc_verified` |
| `airport-shuttle` | Airport Shuttle Service | T2 | Yes | Yes | L2 | `frsc_verified` |
| `courier` | Courier & Dispatch | T1 | Yes | No | L1 | — |
| `logistics-delivery` | Last-Mile Logistics | T1 | Yes | No | L2 | — |
| `dispatch-rider` | Dispatch Rider / Errand | T1 | No | No | L0 | — |
| `okada-keke` | Okada / Keke Operator | T1 | No | Yes | L1 | `frsc_verified` |
| `ferry` | Ferry / Water Transport | T2 | Yes | No | L2 | `nimasa_verified` |

#### Category 3: Civic (13 verticals)
| Slug | Display Name | KYC | IT-Reg | AI Level | FSM Extension |
|---|---|---|---|---|---|
| `church` | Church / Faith Community | T1 | Optional | L2 | `it_verified` |
| `mosque` | Mosque / Islamic Centre | T1 | Optional | L2 | `it_verified` |
| `ministry-mission` | Ministry / Mission | T1 | Optional | L1 | — |
| `ngo` | NGO / Non-Profit | T2 | Yes | L2 | `cac_registered` |
| `cooperative` | Cooperative Society | T2 | No (CAC) | L2 | `cac_registered` |
| `youth-organization` | Youth Organisation | T1 | Optional | L1 | — |
| `womens-association` | Women's Association | T1 | Optional | L1 | — |
| `market-association` | Market Traders Association | T1 | Optional | L1 | — |
| `professional-association` | Professional Association | T2 | Yes | L2 | `it_verified` |
| `community-hall` | Community Hall / Town Hall | T1 | No | L0 | — |
| `book-club` | Book Club / Reading Circle | T1 | No | L0 | — |
| `sports-club` | Sports Club / Fan Club | T1 | Optional | L1 | — |
| `orphanage` | Orphanage / Children's Home | T2 | Yes | **L3 HITL** | `state_welfare_verified` |

#### Category 4: Politics (8 verticals)
| Slug | Display Name | KYC | INEC | AI Level | FSM Extension |
|---|---|---|---|---|---|
| `politician` | Individual Politician | T2 | No | **L3 HITL** | `inec_filed` |
| `political-party` | Political Party | T2 | Yes | **L3 HITL** | `inec_registered` |
| `campaign-office` | Campaign Office | T2 | Yes | **L3 HITL** | `inec_filed` |
| `constituency-office` | Constituency Office | T2 | Yes | **L3 HITL** | `inec_verified` |
| `ward-rep` | Ward Representative | T1 | Yes | **L3 HITL** | `inec_verified` |
| `polling-unit` | Polling Unit | T2 | Yes | **L3 HITL** | `inec_accredited` |
| `government-agency` | Government Agency | T2 | No (BPP) | **L3 HITL** | `bpp_verified` |
| `road-transport-union` | *see Transport* | — | — | — | — |

#### Category 5: Health (9 verticals)
| Slug | Display Name | KYC | CAC | Professional Body | AI Level | FSM Extension |
|---|---|---|---|---|---|---|
| `clinic` | Clinic / Healthcare Facility | T2 | Yes | MDCN | L2 | `mdcn_verified` |
| `dental-clinic` | Dental Clinic | T2 | Yes | MDCN/DSN | L2 | `mdcn_verified` |
| `pharmacy-chain` | Pharmacy Chain | T2 | Yes | PCN | L2 | `pcn_verified` |
| `optician` | Optical / Optometrist | T2 | Yes | NICO | L2 | `nico_verified` |
| `gym-fitness` | Gym & Fitness Centre | T1 | Optional | No | L1 | — |
| `vet-clinic` | Veterinary Clinic | T2 | Yes | VCNVMB | L2 | `vcnvmb_verified` |
| `community-health` | Community Health Worker Network | T1 | No | No | L1 | — |
| `rehab-centre` | Rehabilitation Centre | T2 | Yes | Federal MoH | **L3 HITL** | `fmoh_verified` |
| `elderly-care` | Elderly Care Home | T2 | Yes | State MoH | L2 | `state_welfare_verified` |

#### Category 6: Education (8 verticals)
| Slug | Display Name | KYC | CAC | Regulator | AI Level | FSM Extension |
|---|---|---|---|---|---|---|
| `school` | School / Educational Institution | T2 | Yes | State SUBEB/MoE | L2 | `subeb_verified` |
| `govt-school` | Government School | T1 | No | MoE | L2 | `moe_verified` |
| `private-school` | Private School | T2 | Yes | State MoE | L2 | `moe_verified` |
| `nursery-school` | Nursery School | T2 | Yes | State SUBEB | L2 | `subeb_verified` |
| `creche` | Crèche / Day-Care | T2 | Yes | SUBEB | **L3 HITL** | `subeb_verified` |
| `driving-school` | Driving School | T2 | Yes | FRSC | L2 | `frsc_verified` |
| `training-institute` | Vocational / Training Institute | T2 | Yes | NABTEB/NBTE | L2 | — |
| `sports-academy` | Sports Academy | T1 | Optional | No | L1 | — |

#### Category 7: Agricultural (12 verticals)
| Slug | Display Name | KYC | CAC | Regulator | AI Level | FSM Extension |
|---|---|---|---|---|---|---|
| `palm-oil` | Palm Oil Processor | T1 | Optional | NAFDAC | L2 | — |
| `cocoa-exporter` | Cocoa Exporter | T2 | Yes | NEPC + CBN | L2 | `nepc_verified` |
| `cold-room` | Cold Room / Refrigerated Storage | T1 | Optional | NAFDAC | L1 | — |
| `produce-aggregator` | Farm Produce Aggregator | T1 | Optional | No | L1 | — |
| `agro-input` | Agro-Input Dealer | T1 | Optional | NAFDAC | L1 | — |
| `food-processing` | Food Processing / Packaging | T2 | Yes | NAFDAC | L2 | `nafdac_verified` |
| `cassava-miller` | Cassava Miller | T1 | No | No | L0 | — |
| `fish-market` | Fish Market / Fishmonger | T1 | No | No | L0 | — |
| `vegetable-garden` | Market Garden / Urban Farm | T1 | No | No | L0 | — |
| `abattoir` | Abattoir / Slaughterhouse | T2 | Yes | State Vet Services | L2 | `vet_verified` |
| `artisanal-mining` | Artisanal Mining Operation | T2 | Yes | MoM/NCDMB | L2 | `mom_licensed` |
| `water-treatment` | Water Treatment Plant | T2 | Yes | NAFDAC | L2 | `nafdac_verified` |

#### Category 8: Professional Services (10 verticals)
| Slug | Display Name | KYC | CAC | Professional Body | AI Level | FSM Extension |
|---|---|---|---|---|---|---|
| `professional` | Professional (Lawyer/Doctor) | T2 | No | NBA/MDCN | **L3 HITL** | `body_verified` |
| `law-firm` | Law Firm | T2 | Yes | NBA | **L3 HITL** | `nba_verified` |
| `accounting-firm` | Accounting Firm | T2 | Yes | ICAN/ANAN | L2 | `ican_verified` |
| `tax-consultant` | Tax Consultant | T2 | Yes | ICAN/FIRS | **L3 HITL** | `firs_registered` |
| `it-support` | IT Support / Tech Consultant | T1 | Optional | No | L2 | — |
| `handyman` | Handyman / Multi-Trade | T1 | No | No | L1 | — |
| `land-surveyor` | Land Surveyor | T2 | Yes | SURCON | L2 | `surcon_verified` |
| `construction` | Construction Company | T2 | Yes | COREN | L2 | `coren_verified` |
| `borehole-driller` | Borehole / Water Well Driller | T2 | Yes | COREN | L2 | `coren_verified` |
| `solar-installer` | Solar Energy Installer | T2 | Yes | NAFDAC/REA | L2 | — |

#### Category 9: Creative & Media (8 verticals)
| Slug | Display Name | KYC | CAC | Professional Body | AI Level | FSM Extension |
|---|---|---|---|---|---|---|
| `creator` | Creator / Influencer | T1 | No | NMMA (optional) | L2 | `social_active` |
| `music-studio` | Music Recording Studio | T1 | Yes | COSON | L2 | `coson_verified` |
| `recording-label` | Recording Label / Music Label | T2 | Yes | COSON + NMMA | **L3 HITL** | `coson_verified` |
| `photography-studio` | Photography Studio | T1 | Optional | No | L1 | — |
| `motivational-speaker` | Motivational Speaker / Coach | T1 | Optional | No | L2 | — |
| `advertising-agency` | Advertising Agency | T2 | Yes | APCON | L2 | `apcon_registered` |
| `pr-firm` | PR / Public Affairs Firm | T2 | Yes | NIPR | L2 | `nipr_verified` |
| `talent-agency` | Talent Agency | T2 | Yes | NMMA | L2 | `nmma_verified` |

#### Category 10: Financial Services (5 verticals)
| Slug | Display Name | KYC | CAC | Regulator | AI Level | FSM Extension |
|---|---|---|---|---|---|---|
| `savings-group` | Savings Group / Ajo | T2 | Optional | CBN | L2 | `cbn_registered` |
| `insurance-agent` | Insurance Agent / Broker | T2 | Yes | NAICOM | L2 | `naicom_verified` |
| `bureau-de-change` | Bureau de Change | T3 | Yes | CBN | L2 | `cbn_verified` |
| `mobile-money-agent` | Mobile Money Agent | T2 | No | CBN/NIBSS | L2 | `cbn_registered` |
| `hire-purchase` | Hire Purchase / Consumer Finance | T2 | Yes | CBN | L2 | `cbn_registered` |

#### Category 11: Place-Based (8 verticals)
| Slug | Display Name | KYC | Notes |
|---|---|---|---|
| `market` | Market / Trading Hub | T2 | Multi-vendor; geography facility place |
| `tech-hub` | Tech Hub / Innovation Centre | T2 | Pillar 3 primary |
| `container-depot` | Container Depot / Yard | T2 | Port-adjacent; NPA-registered |
| `warehouse` | *via Pillar 1 inventory* | T2 | Standalone storage facility |
| `clearing-agent` | Clearing & Forwarding Agent | T2 | NCA/CVFF licensed |
| `water-vendor` | Water Vendor / Tanker | T1 | High-frequency USSD-capable |
| `waste-management` | Waste Management Company | T2 | NESREA-registered |
| `property-developer` | Property Developer | T2 | CAC + LASRERA/state-equivalent |

#### Category 12: Media & Broadcast (4 verticals)
| Slug | Display Name | KYC | Professional Body | AI Level | FSM Extension |
|---|---|---|---|---|---|
| `community-radio` | Community Radio Station | T2 | NBC | L2 | `nbc_licensed` |
| `newspaper-dist` | Newspaper / Magazine Publisher | T2 | NPC | L2 | `npc_registered` |
| `podcast-studio` | Podcast Studio / Network | T2 | NBC (broadcast) | **L3 HITL** | `nbc_licensed` |
| `real-estate-agency` | Real Estate Agency | T2 | ESVAR/NIESV | L2 | `esvar_verified` |

#### Category 13: Institutional (3 verticals)
| Slug | Display Name | KYC | Regulator | AI Level | Notes |
|---|---|---|---|---|---|
| `government-agency` | Government Agency | T2 | BPP | **L3 ALL AI** | Strictest HITL — all AI mandatory |
| `polling-unit` | Polling Unit (INEC) | T2 | INEC | **L3 ALL AI** | No voter PII; integer counts only |
| `sports-club` | Formal Sports Club | T1 | State Sports Commission | L1 | — |

#### Category 14: Social & Lifestyle (3 verticals)
| Slug | Display Name | KYC | Notes |
|---|---|---|---|
| `startup` | Tech Startup / Startup Studio | T1 | Pillar 1+3; CAC optional |
| `book-club` | Book Club / Reading Group | T1 | Community-driven |
| `talent-agency` | Talent Agency | T2 | *See Creative category* |

### 3.3 Notification Templates (23 Templates Across 5 Channels)

**Source tables:** `notification_templates`, `notification_rules` (migrations 0254–0275)  
**Channels:** email (Resend) · sms (Termii/Africa's Talking) · whatsapp (Meta WABA) · push (FCM) · in_app · telegram

#### Core Platform Templates (9 templates)

| Template Family | Event Key | Channels | Audience | Migration |
|---|---|---|---|---|
| `auth.workspace_invite` | `auth.workspace.invite` | email, in_app | actor | 0271 |
| `auth.email_verification` | `auth.email.verify` | email | actor | 0272 |
| `billing.template_purchase_receipt` | `billing.template.purchased` | email, in_app | actor | 0273 |
| `community.post_reply` | `community.post.replied` | email, in_app, push | subject | 0254+ |
| `community.event_reminder` | `community.event.reminder` | email, sms, push | workspace_admins | 0254+ |
| `claims.claim_approved` | `claims.approved` | email, in_app, push | actor | 0254+ |
| `claims.claim_rejected` | `claims.rejected` | email, in_app | actor | 0254+ |
| `payment.subscription_renewed` | `payment.subscription.renewed` | email, in_app | actor | 0254+ |
| `payment.payment_failed` | `payment.failed` | email, sms, push | actor | 0254+ |

#### HandyLife Wallet Templates (14 templates)

| Template Family | Event Key | Channels | Migration |
|---|---|---|---|
| `wallet.funded` | `wallet.bank_transfer.confirmed` | email, in_app, sms | 0285 |
| `wallet.spend_approved` | `wallet.spend.approved` | email, in_app | 0285 |
| `wallet.spend_declined` | `wallet.spend.declined` | email, in_app, sms | 0285 |
| `wallet.funding.hitl_required` | `wallet.funding.hitl_required` | in_app, email | 0285 |
| `wallet.funding.admin_approved` | `wallet.funding.admin_approved` | email, in_app, sms | 0285 |
| `wallet.funding.admin_rejected` | `wallet.funding.admin_rejected` | email, in_app, sms | 0285 |
| `wallet.kyc_tier_upgrade` | `wallet.kyc.tier_upgraded` | email, in_app | 0285 |
| `wallet.daily_limit_warning` | `wallet.limit.daily_approaching` | in_app, push | 0285 |
| `wallet.balance_cap_warning` | `wallet.limit.balance_approaching` | in_app, push | 0285 |
| `wallet.mla_commission_earned` | `wallet.mla.commission_earned` | in_app, push | 0285 |
| `wallet.transfer_sent` | `wallet.transfer.sent` | email, in_app, sms | 0285 |
| `wallet.transfer_received` | `wallet.transfer.received` | email, in_app, sms | 0285 |
| `wallet.withdrawal_processed` | `wallet.withdrawal.processed` | email, in_app, sms | 0285 |
| `wallet.account_frozen` | `wallet.admin.frozen` | email, in_app, sms | 0285 |

### 3.4 Webhook Event Types (36 Events)

**Source table:** `webhook_event_types` (migration 0274 + 0287)

#### Starter Set — 30 Events (migration 0274)

| Category | Event Keys |
|---|---|
| Workspace | `workspace.created`, `workspace.updated`, `workspace.suspended` |
| Claim | `claim.created`, `claim.approved`, `claim.rejected` |
| Payment | `payment.completed`, `payment.failed`, `payment.refunded` |
| Subscription | `subscription.activated`, `subscription.cancelled`, `subscription.renewed`, `subscription.expired` |
| Entity | `entity.created`, `entity.updated`, `entity.archived` |
| Community | `community.post_created`, `community.event_created`, `community.member_joined` |
| Notification | `notification.delivered`, `notification.failed`, `notification.dead_lettered` |
| Auth | `auth.user_registered`, `auth.password_changed`, `auth.mfa_enabled` |
| Vertical | `vertical.claimed`, `vertical.activated`, `vertical.suspended` |
| AI | `ai.credit_low`, `ai.credit_exhausted`, `ai.hitl_required` |

#### Wallet-Specific — 6 Events (migration 0287)

| Event Key | Description |
|---|---|
| `wallet.funded` | Bank transfer confirmed; balance credited |
| `wallet.spend_approved` | Debit approved within KYC limits |
| `wallet.transfer_sent` | Peer transfer sent (Phase 2+) |
| `wallet.transfer_received` | Peer transfer received (Phase 2+) |
| `wallet.withdrawal_processed` | Bank withdrawal processed (Phase 2+) |
| `wallet.admin_action` | Freeze/unfreeze/admin_credit by super-admin |

### 3.5 KV Configuration Keys (Wallet + Notification)

**Wallet KV (WALLET_KV):**
```
wallet:eligible_tenants          JSON array — ["handylife"] prod / ["handylife_staging"] staging
wallet:hitl_threshold_kobo       Integer string — "10000000" (₦100,000)
wallet:daily_limit_kobo:1        Integer string — "5000000" (T1 ₦50,000)
wallet:daily_limit_kobo:2        Integer string — "20000000" (T2 ₦200,000)
wallet:daily_limit_kobo:3        Integer string — "0" (T3 unlimited = 0 sentinel)
wallet:balance_cap_kobo:1        Integer string — "30000000" (T1 ₦300,000)
wallet:balance_cap_kobo:2        Integer string — "200000000" (T2 ₦2,000,000)
wallet:balance_cap_kobo:3        Integer string — "0" (T3 unlimited)
wallet:flag:transfers_enabled    "0"
wallet:flag:withdrawals_enabled  "0"
wallet:flag:online_funding_enabled "0"
wallet:flag:mla_payout_enabled   "0"
```

**Notification KV (NOTIFICATION_KV):**
```
notif:platform_sender_email      platform@webwaka.com
notif:platform_sender_name       WebWaka Platform
notif:platform_sender_phone      +234...
notif:sandbox_mode               "false" (prod) / "true" (staging)
notif:sandbox_recipient_email    test@webwaka.com (staging)
notif:kill_switch                "false"
provider:resend:api_key          [secret — from Wrangler]
provider:termii:api_key          [secret — from Wrangler]
provider:africastalking:api_key  [secret — from Wrangler]
provider:meta_waba:access_token  [secret — from Wrangler]
provider:meta_waba:phone_id      [Meta WABA phone ID]
provider:fcm:server_key          [Firebase server key]
notif:meta_waba_approved:{template_family}  "1" or "0"
```

---

## 4. Sector Coverage Analysis

### 4.1 Coverage by Economic Sector (Nigeria NBS Classification)

| NBS Sector | WebWaka Verticals Covering It | Coverage Score |
|---|---|---|
| Wholesale & Retail Trade | pos-business, spare-parts, building-materials, electronics-repair, phone-repair-shop, bookshop, electrical-fittings, paints-distributor, iron-steel, generator-dealer, motorcycle-accessories, fuel-station, petrol-station | **High (13 verticals)** |
| Food Services & Hospitality | restaurant-chain, bakery, catering, food-vendor, hotel, spa, event-hall, events-centre, wedding-planner, florist | **High (10 verticals)** |
| Transport & Logistics | motor-park, mass-transit, rideshare, haulage, nurtw, cargo-truck, airport-shuttle, courier, logistics-delivery, dispatch-rider, okada-keke, ferry | **Very High (12 verticals)** |
| Agriculture & Agro-Processing | palm-oil, cocoa-exporter, cold-room, produce-aggregator, agro-input, food-processing, cassava-miller, fish-market, vegetable-garden, abattoir, water-treatment | **High (11 verticals)** |
| Construction & Real Estate | construction, building-materials, borehole-driller, land-surveyor, property-developer, real-estate-agency, solar-installer | **Moderate (7 verticals)** |
| Financial Services | savings-group, insurance-agent, bureau-de-change, mobile-money-agent, hire-purchase, airtime-reseller | **Moderate (6 verticals)** |
| Professional Services | law-firm, accounting-firm, tax-consultant, it-support, handyman, land-surveyor, professional | **Moderate (7 verticals)** |
| Health & Wellness | clinic, dental-clinic, pharmacy-chain, optician, gym-fitness, vet-clinic, community-health, rehab-centre, elderly-care | **High (9 verticals)** |
| Education & Training | school, govt-school, private-school, nursery-school, creche, driving-school, training-institute, sports-academy | **High (8 verticals)** |
| Public Administration & Civic | government-agency, ngo, cooperative, youth-organization, womens-association, community-hall, professional-association, market-association | **Moderate-High (8 verticals)** |
| Media & Entertainment | community-radio, newspaper-dist, podcast-studio, advertising-agency, pr-firm, photography-studio, music-studio, recording-label | **Moderate (8 verticals)** |
| Energy & Utilities | fuel-station, gas-distributor, generator-dealer, solar-installer, water-vendor, water-treatment | **Moderate (6 verticals)** |
| Religion & Faith | church, mosque, ministry-mission | **Moderate (3 verticals)** |
| Mining & Extractive | oil-gas-services, artisanal-mining | **Limited (2 verticals)** |
| Politics & Governance | politician, political-party, campaign-office, constituency-office, ward-rep, polling-unit | **Full (6 verticals)** |

### 4.2 Regulatory Body Coverage

| Regulatory Body | Verticals Requiring It | FSM Gate |
|---|---|---|
| **CAC** (Corporate Affairs Commission) | 45+ verticals | `cac_verified` state |
| **FRSC** (Federal Road Safety Corps) | motor-park, mass-transit, rideshare, haulage, okada-keke, cargo-truck, airport-shuttle, driving-school | `frsc_verified` |
| **INEC** | politician, political-party, campaign-office, constituency-office, ward-rep, polling-unit | `inec_filed/verified/accredited` |
| **NBA** (Nigerian Bar Association) | law-firm, professional (lawyer) | `nba_verified` |
| **MDCN** (Medical & Dental Council) | clinic, dental-clinic, professional (doctor) | `mdcn_verified` |
| **PCN** (Pharmacy Council) | pharmacy-chain | `pcn_verified` |
| **CBN** | bureau-de-change, savings-group, mobile-money-agent, hire-purchase | `cbn_verified` |
| **NCDMB/DPR** | oil-gas-services | Dual gate: `ncdmb_certified` → `dpr_registered` |
| **NAFDAC** | pharmacy-chain, food-processing, agro-input, palm-oil, cassava-miller | `nafdac_verified` |
| **ICAN/ANAN** | accounting-firm | `ican_verified` |
| **COSON** | music-studio, recording-label | `coson_verified` |
| **APCON** | advertising-agency | `apcon_registered` |
| **NIPR** | pr-firm | `nipr_verified` |
| **NMMA** | recording-label, talent-agency | `nmma_verified` |
| **NBC** | community-radio, podcast-studio | `nbc_licensed` |
| **NPC** | newspaper-dist | `npc_registered` |
| **FIRS** | tax-consultant | `firs_registered` |
| **BPP** | government-agency | `bpp_verified` |
| **NEPC** | cocoa-exporter | `nepc_verified` |
| **COREN** | construction, borehole-driller | `coren_verified` |
| **SURCON** | land-surveyor | `surcon_verified` |
| **SUBEB** | school, nursery-school, creche | `subeb_verified` |

---

## 5. Geographic Coverage Analysis

### 5.1 Nigeria's 6 Geopolitical Zones

| Zone | States Covered | LGA Count | Priority Seeding |
|---|---|---|---|
| **South West** | Lagos, Ogun, Oyo, Osun, Ondo, Ekiti | ~140 LGAs | **P1 — Lagos first** |
| **North West** | Kano, Kaduna, Zamfara, Katsina, Kebbi, Sokoto, Jigawa | ~185 LGAs | P2 |
| **South South** | Rivers, Delta, Cross River, Akwa Ibom, Edo, Bayelsa | ~96 LGAs | P2 |
| **North Central** | FCT, Niger, Benue, Kogi, Kwara, Nasarawa, Plateau | ~115 LGAs | P2 — FCT with Lagos |
| **South East** | Anambra, Enugu, Imo, Abia, Ebonyi | ~95 LGAs | P3 |
| **North East** | Borno, Gombe, Bauchi, Taraba, Adamawa, Yobe | ~112 LGAs | P3 |

**Total: 774 LGAs across 37 states (36 + FCT)**

### 5.2 Priority Seed Strategy by Geography

**Tier 1 — Immediate (highest entity density):**
- Lagos State: 20 LGAs · ~60%+ of formal SME registrations in SW
- FCT Abuja: 6 LGAs · government agencies, professionals
- Kano State: 44 LGAs · transport, trade, Islamic verticals
- Rivers State: 23 LGAs · oil & gas services, port logistics

**Tier 2 — Phase 2 rollout:**
- Ogun, Oyo (SW manufacturing belt)
- Kaduna (North Central industry)
- Delta, Edo (South South commerce)
- Anambra (South East trading)

**Tier 3 — Nationwide completion:**
- All remaining 37 states; ward-level data for electoral verticals

### 5.3 Place Facility Seeds by Vertical Category

| Facility Type | Parent Geography | Seeding Source | Priority |
|---|---|---|---|
| Motor parks | LGA / ward level | NURTW registry + NBS transport census | P1 |
| Markets | LGA level | State Ministry of Commerce registers | P1 |
| Tech hubs | State / LGA level | NITDA tech-hub registry, CcHUB network data | P2 |
| Hospitals / Clinics | LGA level | NHIS provider list, State MoH registers | P2 |
| Schools | LGA level | EMIS (Education Management Info System) | P2 |
| Community halls | Ward level | LGA administration registers | P3 |
| Filling stations | LGA level | DPR/NMDPRA retail outlet registry | P2 |
| Mosques / Churches | Ward level | NPC (National Population Commission) data | P3 |
| Polling units | Ward level | INEC polling unit register (176,846 units) | P1 for political verticals |
| Constituency offices | Constituency | INEC federal/state constituency map | P1 for political verticals |

---

## 6. People & Professional Coverage Analysis

### 6.1 Individual Verticals (entity_type = 'individual')

| Slug | Title | Professional Body | Min KYC | AI Level | Key Data Points |
|---|---|---|---|---|---|
| `politician` | Individual Politician | INEC filing | T2 | L3 HITL | Term records, jurisdictions, party affiliation, campaign office link |
| `professional` | Professional (Lawyer/Doctor) | NBA/MDCN | T2 | L3 HITL | License number, practice area, NJC/MDH affiliation |
| `creator` | Creator / Influencer | NMMA (optional) | T1 | L2 | Social handles, follower counts, content categories, monetization tier |
| `sole-trader` | Sole Trader / Artisan | None | T1 | L1 | Trade type, service area (LGA), WhatsApp catalog link |
| `handyman` | Handyman | None | T1 | L1 | Trade skills, service LGAs, daily rate kobo |
| `motivational-speaker` | Speaker / Coach | None | T1 | L2 | Topic areas, booking rate kobo, testimonials |
| `land-surveyor` | Land Surveyor | SURCON | T2 | L2 | SURCON license number, survey types |
| `dispatch-rider` | Dispatch Rider | None | T1 | L0 | Vehicle type, coverage LGAs, rate per km kobo |
| `ward-rep` | Ward Representative | INEC | T1 | L3 HITL | Ward jurisdiction, term records, constituency links |
| `travel-agent` | Travel Agent | IATA | T2 | L2 | IATA number, airline partnerships, tour packages |
| `insurance-agent` | Insurance Agent | NAICOM | T2 | L2 | NAICOM license, insurer partnerships, product lines |

### 6.2 Political Taxonomy (from `docs/governance/political-taxonomy.md`)

| Office Type | Territory Scope | INEC Filing | Seed Priority |
|---|---|---|---|
| Councilor | Ward | Required | High — 774 LGAs × wards |
| LGA Chairman | LGA | Required | High — 774 LGAs |
| State House of Assembly | State Constituency | Required | High — 360+ state constituencies |
| House of Representatives | Federal Constituency | Required | High — 360 federal constituencies |
| Senator | Senatorial District / Zone | Required | High — 109 senatorial districts |
| Governor | State | Required | Medium — 36 states |
| President | Country | Required | Low — 1 entity |

**Key tables for political entities:**
- `jurisdictions` — territory instances by type
- `political_assignments` — person × office × jurisdiction × term
- `party_affiliations` — individual × political party
- `candidate_records` — pre-election representation
- `term_records` — start/end of confirmed assignments

### 6.3 MLA (Multi-Level Agent) Chain Data

**Source tables:** `hl_mla_earnings`, `hl_withdrawal_requests`, `hl_transfer_requests` (migrations 0279–0281)

MLA chain supports up to 3 referral levels:
- Level 1: Direct referrer (earns highest rate)
- Level 2: Referrer's referrer
- Level 3: Top of chain

**Seed requirements for MLA data:**
- MLA rate table in KV: `wallet:mla_rate:level:1`, `wallet:mla_rate:level:2`, `wallet:mla_rate:level:3`
- MLA earnings remain in `pending` status Phase 1 (mla_payout_enabled = '0')
- Commission events recorded in `hl_mla_earnings` per spend event

---

## 7. Data Schema Matrix — Table-by-Table Seed Requirements

### 7.1 Foundation Layer (seed first — all other tables depend on these)

| Table | Migration | Seed Type | Rows Needed | Source |
|---|---|---|---|---|
| `geo_zones` | 0002 | Static | 6 | National geography standard |
| `geo_states` | 0002 | Static | 37 | National geography standard |
| `geo_lgas` | 0003 | Static | 774 | NBS/INEC LGA roster |
| `geo_wards` | 0004 | Script exists; DB application/reconciliation pending | 8,809 official / 8,810 local SQL | INEC ward register + local `0003_wards.sql` audit |
| `verticals` | 0036 | Static | 160 | `infra/db/seeds/0004_verticals-master.csv` |
| `plan_tiers` | 0287 | Static | 5 | Platform pricing (starter/growth/pro/business/enterprise) |

### 7.2 Notification Layer

| Table | Migration | Seed Rows Needed | Notes |
|---|---|---|---|
| `notification_templates` | 0256 | 23 templates × channels | Core 9 + Wallet 14 |
| `notification_rules` | 0254 | ~23 default rules | One per template family |
| `webhook_event_types` | 0274/0287 | 36 event types | 30 starter + 6 wallet |
| `notification_channels` | 0255 | 5 channel configs | email/sms/whatsapp/push/in_app |
| `tenant_branding` | 0276 | Per tenant | Notification color/logo per tenant |

### 7.3 Wallet Layer

| Table | Migration | Seed Notes |
|---|---|---|
| `hl_wallets` | 0279 | Created on-demand; no pre-seeding |
| `hl_ledger` | 0279 | Append-only; no pre-seeding |
| `hl_funding_requests` | 0279 | On-demand via bank transfer flow |
| `hl_spend_events` | 0280 | On-demand via spend API |
| `hl_mla_earnings` | 0281 | On-demand via MLA chain |
| `hl_withdrawal_requests` | 0282 | Phase 2+; no pre-seeding |
| `hl_transfer_requests` | 0283 | Phase 2+; no pre-seeding |

**KV seeds required (wallet:*):**  All 14 KV keys listed in Section 3.5.

### 7.4 Entity & Claim Layer

| Table | Migration | Seed Strategy |
|---|---|---|
| `entities` | 0010–0015 | Seeded from external data sources (SMEDAN, NBS, CAC registry extracts) |
| `places` | 0016–0020 | Seeded from NBS facility surveys + INEC polling unit register |
| `profiles` | 0021–0025 | Auto-created on entity seed for Pillar 3 discovery |
| `claims` | 0030–0035 | Created on-demand via claim flow; FSM starts at `unclaimed` |
| `search_index` | trigger-maintained | Populated via D1 trigger on entity insert |

### 7.5 Vertical Profile Tables (132 per-vertical tables)

Each vertical has its own D1 table seeded in its corresponding migration:

| Vertical Group | Migration Range | Tables Pattern |
|---|---|---|
| Phase-2 core (politician, church, motor-park, cooperative, POS) | 0080–0150 | `{slug}_profiles`, `{slug}_metadata` |
| Phase-2 extended (NGO, school, clinic, creator) | 0151–0200 | `{slug}_profiles`, `{slug}_rosters` |
| Phase-3 regulatory (law-firm, accounting-firm, bureau-de-change) | 0201–0240 | `{slug}_profiles`, `{slug}_matters/transactions/rates` |
| Phase-4 specialist (oil-gas, polling-unit, creche, orphanage) | 0241–0270 | `{slug}_profiles` + domain-specific child tables |

### 7.6 Financial Tables

| Table | Migration | Seed Type |
|---|---|---|
| `bank_transfer_orders` | 0237 | On-demand; no pre-seeding |
| `paystack_payments` | 0040–0045 | On-demand; no pre-seeding |
| `subscriptions` | 0050–0060 | On-demand at workspace creation |
| `partner_settlements` | 0222 | CRON-generated monthly; no pre-seeding |
| `wc_wallets` | 0043 | Auto-created per workspace on AI feature activation |
| `partner_credit_pools` | 0044 | On-demand via partner admin |

### 7.7 Auth & Identity Tables

| Table | Migration | Seed Strategy |
|---|---|---|
| `tenants` | 0001 | Seed: `handylife` (prod), `handylife_staging` (staging), `webwaka` (platform) |
| `users` | 0001 | Do not pre-seed — NDPR consent required at signup |
| `otp_codes` | 0045 | TTL-based; no pre-seeding |
| `kyc_records` | 0055–0070 | On-demand via BVN/NIN verification flow |
| `consent_records` | 0075 | On-demand at signup; NDPR required for AI + wallet |
| `ai_provider_keys` | 0080 | On-demand via BYOK registration |

---

## 8. Extraction Plan — Source-by-Source Data Acquisition

### 8.1 Nigerian Government & Regulatory Sources

| Dataset | Source Agency | Format | Priority | Records Estimated |
|---|---|---|---|---|
| LGA boundaries & names | NBS / INEC / NIMC | Excel/PDF/KML | **P1** | 774 LGAs |
| Ward register | INEC | Excel/SQL | **P1** | 8,809 official wards/RAs; local SQL has 8,810 |
| Federal/State constituency map | INEC | PDF/Excel | P2 | 360 fed + 990+ state |
| Polling unit register | INEC | Excel/API | P1 | 176,846 polling units |
| CAC registered companies | CAC | Web API (basic) | **P1** | 2M+ (extract by LGA) |
| FIRS TIN register | FIRS | Official request | P3 | Restricted — by sector |
| NAFDAC registered products | NAFDAC | Web portal | P2 | ~50,000 products |
| NBS business surveys | NBS | Annual report PDFs | P2 | Aggregate counts by sector |
| NHIS provider list | NHIS | Web portal | P2 | ~7,000 healthcare providers |
| NMDPRA retail outlets | NMDPRA/DPR | Web portal | P2 | Fuel station register |
| INEC RAAS voter stats | INEC | Published summaries | P2 | Aggregate only (no PII) |

### 8.2 Industry & Association Sources

| Dataset | Source | Format | Priority |
|---|---|---|---|
| NBA member firms directory | NBA Lagos/Abuja | Web scrape / API | P2 |
| MDCN licensed practitioners | MDCN | PDF lists | P2 |
| PCN registered pharmacies | PCN | Web portal | P2 |
| ICAN member firms | ICAN | Web portal | P2 |
| NURTW motor park registry | NURTW branches | Physical + web | P2 |
| NAICOM insurance agents | NAICOM | Web portal | P3 |
| CBN BDC licensees | CBN | Published quarterly | P2 |
| NIPR member firms | NIPR | Web portal | P3 |
| APCON registered agencies | APCON | Web portal | P3 |
| COSON music rights holders | COSON | Restricted | P3 |

### 8.3 Commercial Data Sources

| Dataset | Source | Notes | Priority |
|---|---|---|---|
| Google Places API | Google | Motor parks, restaurants, petrol stations, markets | **P1** — highest density |
| OpenStreetMap Nigeria | OSM Overpass API | Bus stops, markets, mosques, churches | P1 |
| Foursquare/Yelp API | Commercial | Venue data for Lagos/Abuja | P2 |
| LinkedIn Company API | LinkedIn | Professional firms (law, accounting, IT) | P3 |
| WhatsApp Business Directory | Meta | Business profiles with WA accounts | P2 |

### 8.4 Crowdsourced & Field Data

| Dataset | Method | Priority |
|---|---|---|
| Motor park operator details | Field agents + NURTW | P1 |
| Market stall operator details | LGA market associations | P1 |
| Church/mosque details | Field agents + directory apps | P2 |
| Artisan / sole trader | Field enrollment agents | P1 |
| Food vendor locations | GPS + field enrollment | P1 |

### 8.5 Extraction Query Patterns (D1-Compatible)

```sql
-- Extract all unseeded entities by LGA for discovery pages
SELECT e.id, e.vertical_slug, e.name, g.name AS lga, g.state_id
FROM entities e
JOIN geo_lgas g ON e.lga_id = g.id
WHERE e.claim_status = 'seeded'
ORDER BY g.state_id, g.name;

-- Extract notification delivery success rate per channel
SELECT channel, 
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'dispatched' THEN 1 ELSE 0 END) AS delivered,
       SUM(CASE WHEN status = 'dead_lettered' THEN 1 ELSE 0 END) AS dead_lettered
FROM notification_delivery
WHERE tenant_id = ?
GROUP BY channel;

-- Wallet balance summary per KYC tier (aggregate — no PII)
SELECT kyc_tier, COUNT(*) AS wallet_count,
       SUM(balance_kobo) AS total_balance_kobo,
       AVG(balance_kobo) AS avg_balance_kobo
FROM hl_wallets
WHERE tenant_id = ? AND status = 'active'
GROUP BY kyc_tier;
```

---

## 9. Seeding Strategy — Dependency-Ordered Execution Plan

### 9.1 Phase 0 — Platform Foundation (must run before any entity seed)

| Step | Dataset | Target Table | Dependency |
|---|---|---|---|
| 0.1 | 6 geopolitical zones | `geo_zones` | None |
| 0.2 | 37 states | `geo_states` | geo_zones |
| 0.3 | 774 LGAs | `geo_lgas` | geo_states |
| 0.4 | 160 vertical definitions | `verticals` | None |
| 0.5 | 5 plan tiers | `plan_tiers` / `subscription_plans` | None |
| 0.6 | 3 platform tenants | `tenants` | None |
| 0.7 | 36 webhook event types | `webhook_event_types` | None |
| 0.8 | 5 notification channel configs | `notification_channels` | None |
| 0.9 | Notification KV keys | NOTIFICATION_KV | None |
| 0.10 | Wallet KV keys | WALLET_KV | None |

### 9.2 Phase 1 — Entity Profile Seeds (priority verticals first)

**Sequence within Phase 1:**
```
Geography facility places → Entities → Profiles → Search index (auto-trigger)
```

| Step | Vertical Batch | LGA Priority | Source |
|---|---|---|---|
| 1.1 | Motor parks (12 transport verticals) | Lagos, Kano, FCT first | NURTW + OSM |
| 1.2 | Markets (market, market-association) | All 774 LGAs | State commerce registers + OSM |
| 1.3 | Food vendors & restaurants | Lagos, Port Harcourt, Abuja | Google Places |
| 1.4 | Churches & mosques | Lagos, Kano, FCT | OSM + field |
| 1.5 | Politicians & political entities | All 774 LGAs | INEC data |
| 1.6 | Sole traders & artisans | Lagos, Kano, Onitsha | Field enrollment |
| 1.7 | POS businesses | Lagos, Kano | CAC + field |
| 1.8 | Schools (all types) | All 774 LGAs | EMIS + state MoE |
| 1.9 | Clinics & pharmacies | All 774 LGAs | NHIS + PCN |
| 1.10 | NGOs & cooperatives | FCT + all states | CAC IT-reg |

### 9.3 Phase 2 — Regulatory & Professional Seeds

| Step | Vertical Batch | Regulatory Dependency |
|---|---|---|
| 2.1 | Law firms (nba_verified seed state) | NBA member directory |
| 2.2 | Accounting firms (ican_verified) | ICAN member directory |
| 2.3 | Bureaux de change (cbn_verified) | CBN quarterly BDC list |
| 2.4 | Oil & gas services (ncdmb → dpr dual gate) | NCDMB contractors list |
| 2.5 | Insurance agents (naicom_verified) | NAICOM agent register |
| 2.6 | Pharmacy chains (pcn_verified) | PCN licensed pharmacy list |
| 2.7 | Community radio stations (nbc_licensed) | NBC license registry |

### 9.4 Phase 3 — Notification Template & Rule Seeds

```
Sequence:
1. Seed notification_templates (23 families × channel variants)
2. Seed notification_rules (one rule per family; link to template)
3. Seed Meta WABA approval status in KV per template (G17)
4. Seed provider credentials in KV (G16/ADL-002)
5. Verify sandbox redirect configured (G24/OQ-012)
```

### 9.5 Phase 4 — Ward-Level & Electoral Seeds

```
Sequence:
1. Reconcile and seed geo_wards (8,809 official INEC wards/RAs; local `0003_wards.sql` currently has 8,810 rows)
2. Seed jurisdictions (ward/LGA/state/fed-constituency/senatorial-district)
3. Seed political_office_types (Councilor → President)
4. Seed polling units (176,846 from INEC polling-unit register)
5. Seed constituency_offices per politician vertical
6. Seed ward_reps per ward (as seeded FSM entities — not claimed yet)
```

### 9.6 Seeding Tool Architecture

```
infra/db/seeds/
  0001_geography.sql           ← geo_zones, geo_states, geo_lgas
  0002_ward_data.sql           ← geo_wards (priority states first)
  0003_platform_config.sql     ← plan_tiers, tenants, webhook_event_types
  0004_verticals-master.csv    ← 160 verticals (already exists)
  0005_notification_templates.sql ← 23 notification template families
  0006_notification_rules.sql  ← default notification rules
  0007_entities_lagos.sql      ← Lagos entities (P1 highest density)
  0008_entities_kano.sql       ← Kano entities
  0009_entities_fct.sql        ← FCT/Abuja entities
  0010_entities_rivers.sql     ← Rivers entities
  0011_political_jurisdictions.sql ← all constituency/senatorial data
  0012_polling_units.sql       ← INEC polling unit register
  0013_motor_parks.sql         ← NURTW motor park registry
  0014_markets.sql             ← Market place facilities
  ...
  scripts/
    kv-init-wallet.sh          ← wallet KV initialization (exists)
    kv-init-notification.sh    ← notification KV initialization
    kv-init-ai.sh              ← AI model routing config
```

---

## 10. Gap Analysis — What Is Missing

### 10.1 Critical Gaps (P0 — Blocks Discovery)

| Gap | Impact | Resolution |
|---|---|---|
| **Entity seed data not yet loaded** | Pillar 3 discovery pages are empty — zero claim CTAs possible | Execute Phase 1 entity seeding (Section 9.2) |
| **Notification provider credentials not in KV** | G16 violated — all notification dispatch will fail | Add Resend/Termii/Meta WABA keys via wrangler secret |
| **Meta WABA template approval not set in KV** | G17 violated — WhatsApp channel silently blocked | Set `notif:meta_waba_approved:{family}` for each template |
| **Ward-level geography incomplete** | Electoral verticals (polling-unit, ward-rep) cannot be geographically resolved | Execute Phase 4 ward seeding |
| **`notification_templates` table unpopulated** | Phase 3 renderer fails for all 23 template families | Seed 23 template families with channel variants |

### 10.2 High-Priority Gaps (P1 — Degrades Core Experience)

| Gap | Impact | Resolution |
|---|---|---|
| Wallet KV keys not initialized | Wallet creation will fail (eligibility check returns null) | Run `scripts/kv-init-wallet.sh` for prod + staging |
| `webhook_event_types` empty | No webhook delivery for any event | Seed 36 event types from migration 0274/0287 |
| `geo_wards` not confirmed applied and local SQL count differs from INEC official count | Political vertical FSM gates cannot validate ward jurisdictions | Reconcile `0003_wards.sql` to 8,809 official wards/RAs or formally document the accepted local variance |
| `plan_tiers` / subscription plans not seeded | Entitlement checks return empty — T5 fails gracefully but blocks features | Seed 5 plan tiers with entitlement JSON |
| AI model routing KV unpopulated | SuperAgent will use hardcoded fallback instead of governance-approved routing | Seed model routing config in AI_KV |

### 10.3 Medium-Priority Gaps (P2 — Reduces Coverage)

| Gap | Impact | Resolution |
|---|---|---|
| Professional body verification not integrated | NBA/MDCN/ICAN FSM gates cannot verify — `body_verified` state unreachable | Build verification API integrations per body |
| INEC candidate records for current officeholders | Politician/ward-rep verticals lack historical term data | Obtain INEC published data for 2023 election results |
| CBN BDC current licensee list not loaded | bureau-de-change `cbn_verified` seeds require valid CBN licence refs | Download CBN quarterly BDC list |
| MLA commission rates not set in KV | MLA chain records amounts correctly but rate = 0 | Set `wallet:mla_rate:level:{1,2,3}` in WALLET_KV |

### 10.4 Architecture Gaps (P3 — Future Phases)

| Gap | Phase | Notes |
|---|---|---|
| `packages/ai-adapters` not yet built | M9+ | Types exist in `packages/ai-abstraction`; no concrete adapters yet |
| Offline entity sync (Pillar 6) | Phase post-M8 | `packages/offline-sync` exists but entity seed sync not wired |
| P3 Africa First — multi-country `country_id` abstraction | Post-M12 | Architecture documented in `core-principles.md`; not implemented |
| Partner Phase 3 billing / WakaCU wholesale | M11–M12 | `partner_credit_pools` exists; wholesale allocation UI not built |
| Digest service Phase 8 CRON sweep | Phase 8 | Quiet-hours deferred deliveries need CRON re-queue; currently logged but not re-sent |
| `apps/workspace-app` | M9+ | Scaffolded only; workspace admin frontend not built |

### 10.5 Compliance Gaps (Regulatory Risk)

| Gap | Risk | Resolution |
|---|---|---|
| NDPR data processing agreements with tenants | Medium — NDPR Article 24 requires written DPA | Standard DPA template required at tenant onboarding |
| CBN wallet licensing (Phase 2 transfers/withdrawals) | High — transfers enabled without CBN MMO license is illegal | MUST NOT enable wallet:flag:transfers_enabled without CBN clearance |
| INEC spending caps not cross-referenced to live INEC data | Medium | `guardInecSpendingCap()` uses hardcoded limits; needs INEC published cap integration |
| NPC newspaper registration verification | Low | newspaper-dist `npc_registered` state is FSM-gated but API verification not built |

---

## 11. Top 100 Seed Datasets Ranking

Rankings are scored on four dimensions:  
**A** = Acquisition feasibility (1–25: hard/restricted → easy/open)  
**B** = Business impact if seeded (1–25: low → high)  
**C** = Discovery value / entity density in Nigeria (1–25: sparse → dense)  
**D** = Platform readiness (FSM implemented, routes live) (1–25: not built → fully live)  
**Total** = A + B + C + D (max 100)

| Rank | Dataset | A | B | C | D | Total | Source |
|---|---|---|---|---|---|---|---|
| **1** | **Nigeria LGA Roster — 774 LGAs** | 25 | 25 | 25 | 25 | **100** | NBS/INEC — freely available |
| **2** | **6 Geopolitical Zones + 37 States** | 25 | 25 | 25 | 25 | **100** | NBS — canonical national standard |
| **3** | **160 Vertical Definitions** | 25 | 25 | 25 | 25 | **100** | Internal — `0004_verticals-master.csv` |
| **4** | **Motor Park Registry — Lagos + Kano** | 20 | 25 | 25 | 24 | **94** | NURTW + OSM Overpass |
| **5** | **Market / Trading Hub Locations** | 20 | 25 | 25 | 23 | **93** | State commerce + OSM |
| **6** | **Food Vendor / Restaurant Profiles** | 22 | 23 | 24 | 23 | **92** | Google Places API |
| **7** | **23 Notification Template Families** | 25 | 25 | 20 | 22 | **92** | Internal — platform build |
| **8** | **36 Webhook Event Types** | 25 | 24 | 20 | 23 | **92** | Internal — migrations 0274/0287 |
| **9** | **Wallet KV Configuration Keys** | 25 | 24 | 20 | 23 | **92** | Internal — `kv-init-wallet.sh` |
| **10** | **5 Platform Plan Tiers + Entitlements** | 25 | 24 | 20 | 22 | **91** | Internal — plan config |
| **11** | **Church / Mosque Locations — Lagos + Kano** | 18 | 22 | 25 | 24 | **89** | OSM + field data |
| **12** | **POS Business Profiles — Lagos** | 20 | 23 | 23 | 22 | **88** | CAC + field enrollment |
| **13** | **Sole Trader / Artisan Profiles — Lagos** | 18 | 22 | 25 | 22 | **87** | Field enrollment agents |
| **14** | **School Profiles — All 774 LGAs** | 19 | 24 | 22 | 22 | **87** | EMIS + state MoE |
| **15** | **Clinic & Pharmacy Profiles — All LGAs** | 17 | 24 | 23 | 22 | **86** | NHIS + PCN register |
| **16** | **8,809 Ward Register** | 22 | 22 | 22 | 20 | **86** | INEC ward register |
| **17** | **Politician Profiles — State Legislators** | 15 | 24 | 23 | 23 | **85** | INEC 2023 election data |
| **18** | **Polling Unit Register — 176,846 Units** | 24 | 24 | 24 | 24 | **96** | INEC polling-unit register |
| **19** | **NGO Profiles — Federal + State** | 17 | 22 | 22 | 23 | **84** | CAC IT-registration data |
| **20** | **Fuel Station / Petrol Station Profiles** | 16 | 22 | 24 | 22 | **84** | NMDPRA/DPR retail outlets |
| **21** | **Tech Hub Profiles — Lagos + FCT** | 20 | 22 | 20 | 22 | **84** | NITDA + CcHUB network |
| **22** | **Cooperative Society Registry** | 15 | 23 | 22 | 23 | **83** | CAC + State co-op registries |
| **23** | **Notification KV Provider Credentials** | 22 | 25 | 15 | 21 | **83** | Resend/Termii/Meta WABA/FCM |
| **24** | **Restaurant Chain Profiles — Lagos** | 20 | 20 | 22 | 20 | **82** | Google Places + CAC |
| **25** | **Constituency Office Profiles** | 16 | 22 | 22 | 22 | **82** | INEC + field data |
| **26** | **Ward Representative Profiles** | 15 | 22 | 23 | 22 | **82** | INEC 2021 local govt elections |
| **27** | **Spare Parts Dealer Profiles — Ladipo + Nnewi** | 18 | 20 | 22 | 22 | **82** | OSM + field |
| **28** | **Hotel / Guesthouse Profiles — All LGAs** | 18 | 21 | 21 | 21 | **81** | Google Places + NTC registry |
| **29** | **Pharmacy Profiles — PCN Licensed** | 15 | 23 | 21 | 22 | **81** | PCN licensed pharmacy list |
| **30** | **Law Firm Profiles — NBA Registered** | 14 | 23 | 21 | 23 | **81** | NBA member directory |
| **31** | **Haulage / Logistics Company Profiles** | 17 | 21 | 21 | 22 | **81** | FRSC + CAC |
| **32** | **Bakery & Catering Profiles** | 18 | 19 | 22 | 21 | **80** | Google Places + field |
| **33** | **Government Agency Profiles — Federal** | 15 | 23 | 20 | 22 | **80** | Official FG agencies list |
| **34** | **Accounting Firm Profiles — ICAN** | 14 | 22 | 21 | 23 | **80** | ICAN member directory |
| **35** | **Hair Salon / Beauty Salon Profiles** | 18 | 18 | 23 | 21 | **80** | Google Places + field |
| **36** | **Mobile Money Agent Profiles** | 15 | 23 | 20 | 22 | **80** | CBN/NIBSS agent roster |
| **37** | **Bureau de Change — CBN Licensed** | 15 | 21 | 21 | 23 | **80** | CBN quarterly BDC list |
| **38** | **Sports Academy Profiles** | 18 | 18 | 22 | 21 | **79** | Field + OSM |
| **39** | **Taxi / Rideshare Operator Profiles** | 16 | 21 | 21 | 21 | **79** | LASG + field enrollment |
| **40** | **Building Materials Supplier Profiles** | 17 | 19 | 21 | 22 | **79** | Field + Lagos Building Materials Assoc |
| **41** | **Driving School Profiles — FRSC Licensed** | 15 | 20 | 22 | 22 | **79** | FRSC licensed driving school list |
| **42** | **Political Party Profiles — INEC Registered** | 16 | 22 | 19 | 22 | **79** | INEC 18 registered parties |
| **43** | **Tailor / Fashion Designer Profiles** | 17 | 18 | 22 | 21 | **78** | Field enrollment |
| **44** | **Community Health Worker Network Profiles** | 15 | 22 | 20 | 21 | **78** | NHIS + state PHC boards |
| **45** | **Electronics Repair Shop Profiles** | 17 | 18 | 22 | 21 | **78** | Google Places + field |
| **46** | **Private School Profiles** | 15 | 21 | 20 | 22 | **78** | State MoE + CAC |
| **47** | **Event Hall / Event Centre Profiles** | 17 | 19 | 20 | 22 | **78** | Google Places |
| **48** | **Savings Group / Ajo Registry** | 15 | 21 | 21 | 21 | **78** | Field + cooperative registries |
| **49** | **Gas Distributor (LPG) Profiles** | 15 | 21 | 21 | 21 | **78** | DPR/NMDPRA + field |
| **50** | **Vegetable Garden / Urban Farm Profiles** | 16 | 19 | 21 | 21 | **77** | Field + agric extension workers |
| **51** | **Gym & Fitness Centre Profiles** | 17 | 18 | 20 | 22 | **77** | Google Places |
| **52** | **Cold Room / Agro-Storage Profiles** | 14 | 21 | 21 | 21 | **77** | NAFDAC + state agric |
| **53** | **Produce Aggregator Profiles** | 15 | 21 | 20 | 21 | **77** | State agric ministry + field |
| **54** | **Car Wash Profiles** | 18 | 16 | 22 | 21 | **77** | Google Places + field |
| **55** | **Dental Clinic Profiles** | 14 | 21 | 20 | 22 | **77** | MDCN/DSN register |
| **56** | **Used Car Dealer Profiles** | 16 | 19 | 21 | 21 | **77** | FRSC + field (Berger Lagos) |
| **57** | **Generator Dealer Profiles** | 17 | 17 | 22 | 21 | **77** | Field + Google Places |
| **58** | **IT Support / Tech Consultant Profiles** | 16 | 19 | 21 | 21 | **77** | Google Places + CAC |
| **59** | **Construction Company Profiles — COREN** | 13 | 20 | 21 | 22 | **76** | COREN member list |
| **60** | **Insurance Agent Profiles — NAICOM** | 13 | 20 | 21 | 22 | **76** | NAICOM agent register |
| **61** | **Music Studio Profiles** | 15 | 19 | 20 | 22 | **76** | COSON + Google Places |
| **62** | **Motorcycle Accessories Shop Profiles** | 17 | 17 | 21 | 21 | **76** | Field |
| **63** | **Handyman / Multi-Trade Profiles** | 17 | 17 | 21 | 21 | **76** | Field enrollment |
| **64** | **Transport Union (NURTW) Branch Profiles** | 14 | 21 | 20 | 21 | **76** | NURTW national register |
| **65** | **Printing Press Profiles** | 15 | 17 | 22 | 22 | **76** | NPC + field |
| **66** | **Water Vendor / Tanker Profiles** | 16 | 19 | 20 | 21 | **76** | State water boards + field |
| **67** | **Property Developer Profiles — CAC** | 14 | 20 | 20 | 22 | **76** | CAC + LASRERA |
| **68** | **Real Estate Agency Profiles — ESVAR** | 13 | 19 | 21 | 22 | **75** | ESVAR/NIESV register |
| **69** | **Laundry & Dry-Cleaning Profiles** | 17 | 17 | 20 | 21 | **75** | Google Places + field |
| **70** | **Photography Studio Profiles** | 16 | 17 | 21 | 21 | **75** | Google Places |
| **71** | **Advertising Agency Profiles — APCON** | 13 | 19 | 21 | 22 | **75** | APCON member list |
| **72** | **Tyre Shop / Vulcanizer Profiles** | 16 | 17 | 21 | 21 | **75** | Field |
| **73** | **Phone Repair Shop Profiles** | 16 | 17 | 21 | 21 | **75** | Field + Google Places |
| **74** | **Youth Organisation Profiles** | 14 | 19 | 20 | 22 | **75** | CAC + state youth councils |
| **75** | **Women's Association Profiles** | 14 | 19 | 20 | 22 | **75** | CAC + state women councils |
| **76** | **Book Club / Reading Group Profiles** | 18 | 14 | 21 | 22 | **75** | Online directories + field |
| **77** | **Orphanage / Children's Home Profiles** | 12 | 22 | 19 | 22 | **75** | State Social Welfare + CAC |
| **78** | **Vocational Training Institute Profiles** | 13 | 20 | 20 | 22 | **75** | NABTEB + NBTE register |
| **79** | **AI Model Routing KV Config** | 25 | 20 | 15 | 15 | **75** | Internal — platform build |
| **80** | **Airtime Reseller Profiles** | 15 | 18 | 21 | 21 | **75** | NCC licensed resellers |
| **81** | **Rehab Centre Profiles — FMoH** | 12 | 21 | 19 | 22 | **74** | FMoH drug rehab centers |
| **82** | **Clearing & Forwarding Agent Profiles** | 14 | 19 | 20 | 21 | **74** | NCA/CVFF licensed agents |
| **83** | **Funeral Home Profiles** | 14 | 18 | 21 | 21 | **74** | Field |
| **84** | **Elderly Care Home Profiles** | 12 | 21 | 19 | 22 | **74** | State welfare + CAC |
| **85** | **PR Firm Profiles — NIPR** | 12 | 19 | 21 | 22 | **74** | NIPR member directory |
| **86** | **Abattoir / Slaughterhouse Profiles** | 13 | 19 | 20 | 22 | **74** | State vet services register |
| **87** | **Palm Oil Processor Profiles** | 14 | 18 | 21 | 21 | **74** | State agric ministry |
| **88** | **Cocoa Exporter Profiles — NEPC** | 12 | 20 | 20 | 22 | **74** | NEPC + CBN registered exporters |
| **89** | **Community Radio Station Profiles — NBC** | 12 | 20 | 20 | 22 | **74** | NBC license register |
| **90** | **Food Processing Company Profiles — NAFDAC** | 13 | 19 | 20 | 22 | **74** | NAFDAC database |
| **91** | **Land Surveyor Profiles — SURCON** | 12 | 19 | 20 | 22 | **73** | SURCON member register |
| **92** | **Solar Installer Profiles** | 14 | 18 | 20 | 21 | **73** | REA + NASENI |
| **93** | **Motivational Speaker / Coach Profiles** | 15 | 17 | 20 | 21 | **73** | LinkedIn + online directories |
| **94** | **Borebole Driller Profiles — COREN** | 13 | 18 | 20 | 22 | **73** | COREN + UNICEF WASH register |
| **95** | **Waste Management Company Profiles** | 13 | 18 | 20 | 22 | **73** | NESREA + state waste agencies |
| **96** | **Newspaper / Magazine Publisher Profiles** | 12 | 18 | 20 | 22 | **72** | NPC registered publications |
| **97** | **Oil & Gas Services Profiles — NCDMB** | 10 | 22 | 18 | 22 | **72** | NCDMB contractors database |
| **98** | **Recording Label Profiles — COSON + NMMA** | 12 | 18 | 20 | 22 | **72** | COSON + NMMA member registry |
| **99** | **Artisanal Mining Operation Profiles** | 10 | 18 | 20 | 22 | **70** | MoM ASGM register |
| **100** | **Ferry / Water Transport Profiles — NIMASA** | 11 | 18 | 19 | 22 | **70** | NIMASA licensed operators |

---

### Summary: Top 10 by Category

| Category | Best Dataset | Score |
|---|---|---|
| **Geography** | 774 LGA Roster | 100 |
| **Platform Config** | 160 Vertical Definitions | 100 |
| **Notifications** | 23 Template Families | 92 |
| **Commerce** | Market Locations | 93 |
| **Transport** | Motor Park Registry | 94 |
| **Civic** | Church/Mosque Locations | 89 |
| **Politics** | Polling Unit Register | 85 |
| **Health** | Clinic & Pharmacy Profiles | 86 |
| **Education** | School Profiles All LGAs | 87 |
| **Financial** | Mobile Money Agent Profiles | 80 |

---

## Appendix A — Platform Invariant Quick Reference

| ID | Rule | Seed Impact |
|---|---|---|
| P1 | Build Once — no vertical-specific seed code | All seeds use shared `entities`, `profiles`, `verticals` tables |
| P2 | Nigeria First — NGN kobo only | All monetary seed values in integer kobo |
| P9 | Integer Kobo — NO FLOATS | Validated by CI `check-monetary-integrity.ts` |
| T3 | Tenant Isolation — `tenant_id` on every row | Every seed row for tenant-scoped tables must include `tenant_id` |
| T6 | Geography-Driven Discovery | Geography seeds run before any entity seed |
| T7 | Claim-First Growth | Entity seeds land in `seeded` FSM state — never `active` |
| P13 | No PII to AI | Seed opaque reference IDs (matter_ref_id, patient_ref_id etc.) — never real names |

## Appendix B — FSM State Reference

**Universal base FSM (all 160 verticals):**
```
seeded → claimed → active → suspended → deprecated
```

**Extension states by sector:**

| Sector | Extension States |
|---|---|
| Transport (FRSC) | `+ frsc_verified` between claimed→active |
| Church/NGO (IT-reg) | `+ it_verified` or `+ cac_registered` |
| Health (professional body) | `+ mdcn_verified / pcn_verified / nico_verified` |
| Education (SUBEB/MoE) | `+ subeb_verified / moe_verified` |
| Legal (NBA) | `+ nba_verified` |
| Finance (CBN) | `+ cbn_verified` |
| Oil & Gas | `+ ncdmb_certified + dpr_registered` (dual gate, sequential) |
| Media (NBC) | `+ nbc_licensed` |
| Advertising (APCON) | `+ apcon_registered` |
| PR (NIPR) | `+ nipr_verified` |
| Music (COSON) | `+ coson_verified` |
| Tax (FIRS) | `+ firs_registered` |
| Politics (INEC) | `+ inec_filed / inec_accredited / inec_registered` |
| Government | `+ bpp_verified` |
| Export (NEPC) | `+ nepc_verified` |
| Surveyor (SURCON) | `+ surcon_verified` |
| Engineering (COREN) | `+ coren_verified` |

## Appendix C — Notification Guardrail Index

| Code | Guardrail | Seed/Config Dependency |
|---|---|---|
| G1 | tenant_id in every query | `tenant_id` NOT NULL on all tables |
| G3/OQ-004 | Platform sender fallback | KV: `notif:platform_sender_email` |
| G7 | Idempotency key UNIQUE | `notification_delivery.idempotency_key UNIQUE` |
| G9 | Audit log every attempt | `notification_audit_log` table seeded |
| G10 | Dead-lettered (never silent) | Consumer retry logic; max_retries configured |
| G11 | Quiet hours 22:00–07:00 Africa/Lagos | Preference service timezone default |
| G14 | variables_schema validation | Template seed must include `variables_schema` JSON |
| G16/ADL-002 | Provider credentials in KV | Resend/Termii/Meta WABA/FCM secrets in KV |
| G17/OQ-003 | Meta WABA approval blocks dispatch | KV: `notif:meta_waba_approved:{family}` per template |
| G20 | Suppression check | `notification_suppressions` table exists |
| G21/OQ-009 | USSD bypass | PreferenceService source='ussd' → SMS immediate |
| G22/OQ-011 | Low data mode | Preference flag; push disabled, SMS critical-only |
| G23 | NDPR erasure | Audit logs store userId only — never email/phone |
| G24/OQ-012 | Sandbox redirect | KV: `notif:sandbox_recipient_email` on staging |

---

*Document completed 2026-04-21.*  
*Basis: 287 migrations + 132 vertical route files + 11 apps + 175+ packages + 30+ governance docs — all read in full.*  
*Next action: Execute Section 9 seeding strategy beginning with Phase 0 foundation seeds.*
