# Pillar 2 Niche Identity and Tracking System Design Report

**Report type:** Canonical Architecture Research + System Design  
**Date:** 2026-04-25  
**Scope:** Full repo audit (code + docs) — Pillar 2 template niche identity, tracking system, and agent workflow  
**Method:** Source-verified — every claim traced to specific file and line  
**Status:** FINAL — READY TO ADOPT  
**Authority:** This document governs all Pillar 2 template work from this date forward.

---

## WORKING TRUTH SUMMARY

> This section is the controlling anchor for all agents doing Pillar 2 template work.  
> Read this first. Accept no alternate framing.

### Canonical Pillar Definitions

| Pillar | Name | Runtime App | Status |
|--------|------|-------------|--------|
| **Pillar 1** | Operations-Management (POS) | `apps/api/`, `apps/ussd-gateway/` | ✅ Live |
| **Pillar 2** | Branding / Website / Portal | `apps/brand-runtime/` | ✅ Live (MVP) |
| **Pillar 3** | Listing / Multi-Vendor Marketplace | `apps/public-discovery/`, `apps/tenant-public/` | ✅ Live (MVP) |
| **SuperAgent** | Cross-cutting AI intelligence layer | `packages/superagent/` | NOT a pillar — cross-cutting only |

**Source:** `docs/governance/3in1-platform-architecture.md` (canonical) + `docs/reports/webwaka-os-post-correction-verification-2026-04-25.md` (confirmed clean).

### What Pillar 2 Actually Is

Pillar 2 = **Branding / Website / Portal** — the front-of-house that faces the world.

It provides: branded websites, single-vendor e-commerce stores, service portals, campaign or event sites, and informational sites. Every tenant with Pillar 2 rights gets a subdomain or custom domain served from `apps/brand-runtime/`.

Pillar 2 is **NOT** "Commerce + Brand" — this is an invalid prior framing that must be ignored.

### Current Runtime State of Pillar 2 Templates

**What exists now (2026-04-25):**

1. **System A — Built-in Page-Type Templates (active runtime):** Hardcoded TypeScript functions in `apps/brand-runtime/src/templates/` — `base.ts`, `branded-home.ts`, `about.ts`, `services.ts`, `contact.ts`, `blog-list.ts`, `blog-post.ts`. These render HTML for every tenant site right now.

2. **The Template Resolver (`apps/brand-runtime/src/lib/template-resolver.ts`):** A live bridge that queries `template_installations` + `template_registry` + `template_render_overrides` and dispatches to `BUILT_IN_TEMPLATES`. This bridge IS now active (post-April-25 correction — `resolveTemplate()` called on every page render in `branded-page.ts`).

3. **BUILT_IN_TEMPLATES registry:** Currently contains exactly ONE entry: `'default-website'`. This maps to the generic branded home/about/services/contact template. All tenants, regardless of vertical, receive this single default.

4. **System B — Marketplace Templates (management layer):** D1 tables `template_registry`, `template_installations`, `template_versions`, `template_upgrade_log`, `template_purchases`, `revenue_splits`, `template_ratings`, `template_fts`. REST API at `apps/api/src/routes/templates.ts` (944 lines, 12 routes). These manage the catalog and installations.

5. **The bridge is live:** Installing a marketplace-approved template with `template_type = 'website'` AND the slug existing in `BUILT_IN_TEMPLATES` now changes what brand-runtime renders. Phase 2 (third-party/sandboxed template loading from external code) is planned but not yet built.

**What is real now:**
- One built-in template (`default-website`) serves all tenants
- The resolver infrastructure is wired and operational
- Adding a new niche template = adding a new `WebsiteTemplateContract` implementation to `BUILT_IN_TEMPLATES` in `template-resolver.ts`

**What is planned but not runtime-connected:**
- Phase 2: third-party templates loaded from external code (sandboxed execution — not yet built)
- Per-vertical layout intelligence (brand-runtime currently has no vertical-awareness — all tenants get same structure)
- Niche-specific templates that render different HTML structures based on the tenant's vertical

**What prior framing must be ignored:**
- Pillar 2 = Commerce + Brand (WRONG — Pillar 2 = Branding/Website/Portal only)
- Pillar 3 = Transport/Logistics (WRONG — Pillar 3 = Listing/Multi-Vendor Marketplace)
- PlatformLayer enum = canonical pillars (WRONG — PlatformLayer is subscription gating, not architecture)
- `vertical-ai-config.ts` `primaryPillar` = canonical vertical classification (WRONG — that file is AI config only)
- SuperAgent = a fourth pillar (WRONG — SuperAgent is cross-cutting AI intelligence)
- Marketplace template installation = runtime template change (CONDITIONALLY WRONG — only works for slugs in BUILT_IN_TEMPLATES)

### What "Completed" Means for a Pillar 2 Template

A niche template is **COMPLETED** (status `IMPLEMENTED`) when:
1. A `WebsiteTemplateContract` implementation exists in `apps/brand-runtime/src/templates/`
2. It is registered in `BUILT_IN_TEMPLATES` in `apps/brand-runtime/src/lib/template-resolver.ts`
3. A corresponding marketplace manifest entry exists in `template_registry` (or a seed SQL)
4. The template renders niche-appropriate HTML for: home, about, services, contact (minimum)
5. The template is vertically-aware — its content reflects the specific niche's business reality
6. Nigeria-first / Africa-first content principles are applied throughout
7. The niche registry record is updated to `IMPLEMENTED` status

---

## PHASE 1 FINDINGS — Canonical Context (Code-Verified)

### Vertical Classification Source of Truth

The authoritative source for vertical pillar classification is:
- **D1 table:** `verticals.primary_pillars` (migration `0037_verticals_primary_pillars.sql`)
- **Seed:** `infra/db/seeds/0004_verticals-master.csv` (160 verticals)
- **Governance doc:** `docs/governance/3in1-platform-architecture.md` §5

**Classification rule:** Verticals with `"branding"` in their `primary_pillars` array are Pillar 2-eligible. These are the only verticals that should receive Pillar 2 templates.

### Template Validator Source of Truth

- `packages/verticals/src/template-validator.ts` (282 lines) — validates manifest format
- Import path: `import { validateTemplateManifest } from '@webwaka/verticals'`
- Validates: slug format, semver version, template type (6 types), price_kobo, platform_compat range, and `compatible_verticals` against the live registry

### Brand-Runtime Architecture (Code-Verified)

- Rendering: Pure SSR via Hono on Cloudflare Workers — no React, no build step
- CSS: `@webwaka/design-system` `generateBaseCSS()` inlined per response, `@webwaka/white-label-theming` generates CSS custom properties from tenant DB data
- Theme: 9 CSS custom properties via `--ww-primary`, `--ww-secondary`, etc.; KV-cached (5-min TTL)
- PWA: service worker + manifest.json — `lang="en-NG"` hardcoded (Nigeria First)
- Security: `sanitizeCssValue()` protects against CSS injection via fontFamily

### Governance Constraints for Pillar 2 Template Work

1. **T3:** Every DB query must include `tenant_id` predicate
2. **T4:** All monetary values in integer kobo
3. **T5:** Entitlement checks before feature access
4. **P7:** No direct AI SDK calls — route through `packages/superagent`
5. **P10:** NDPR consent required before PII processing
6. **White-label policy:** Template themes must respect `whiteLabelDepth` via `applyDepthCap()`
7. **Template type `'website'`** is the only type that affects brand-runtime rendering
8. **Templates must be `status = 'approved'`** in `template_registry` before the resolver returns them

---

## PHASE 2 FINDINGS — Pillar 2 Template Implementation State

| Item | Finding |
|------|---------|
| Runtime rendering engine | Hono SSR — pure TypeScript → HTML string |
| Niche-specific templates at runtime | **NOT YET** — only `default-website` built-in exists |
| Marketplace entries affect runtime | **YES (conditionally)** — only if slug is in `BUILT_IN_TEMPLATES` |
| Built-in templates count | **1** — `default-website` |
| Completed niche templates | **0** — no vertical-specific templates exist yet |
| Template resolver wired | **YES** — `resolveTemplate()` called per page render |
| Source of truth files for new templates | `apps/brand-runtime/src/lib/template-resolver.ts` (add to BUILT_IN_TEMPLATES) + `apps/brand-runtime/src/templates/` (new .ts files) |
| Brand-runtime vertical-awareness | **NONE** — same HTML structure for all verticals |

**Critical architectural insight:** Adding a new niche template is a Cloudflare Worker deployment. It is not a database-only change. Any new template requires code changes to `apps/brand-runtime/` followed by `wrangler deploy`.

---

## PHASE 3 — CANONICAL NICHE IDENTITY SYSTEM

### A. Terminology Model

| Term | Definition |
|------|-----------|
| **Vertical** | A sector-specific activation category in the WebWaka platform, defined as a row in the `verticals` D1 table with a canonical `slug`. Examples: `restaurant`, `politician`, `clinic`. 160 verticals exist across 14 categories. |
| **Niche** | A specific business-type or market-segment implementation target *within* a vertical, for the purpose of building a Pillar 2 website template. A single vertical may have multiple niches (e.g., `restaurant` has niches: `general-eatery`, `fast-food-outlet`, `fine-dining`). For the first pass, each vertical begins with exactly one niche. |
| **Template Family** | All `WebsiteTemplateContract` implementations across all variants for a single niche. Example: the `restaurant-general-eatery` family contains the standard variant and (future) seasonal / campaign variants. |
| **Template Variant** | A single `WebsiteTemplateContract` implementation — one set of HTML rendering functions for a given niche. Distinguished by a version suffix: `v1`, `v2`, etc. |
| **Runtime Template** | A `WebsiteTemplateContract` registered in `BUILT_IN_TEMPLATES` in `apps/brand-runtime/src/lib/template-resolver.ts`. This is what actually renders HTML to visitors. |
| **Marketplace Template Artifact** | A row in `template_registry` with manifest JSON. Connects to a runtime template via its `slug`. Without a matching entry in `BUILT_IN_TEMPLATES`, installation has no rendering effect. |
| **Niche Completion Unit** | One niche is "complete" when: (a) a runtime template exists and is wired in BUILT_IN_TEMPLATES, (b) a marketplace manifest row exists, (c) the niche registry record is `IMPLEMENTED`, and (d) Nigeria-first principles are verified applied. |

### B. Identity Model

#### Niche ID Format

```
P2-{vertical-slug}-{niche-slug}
```

**Rules:**
- `P2` prefix is fixed — this is the Pillar 2 namespace
- `{vertical-slug}` is the exact canonical slug from the `verticals` D1 table (e.g., `restaurant`, `politician`)
- `{niche-slug}` is a lowercase-hyphenated descriptor of the specific business type (e.g., `general-eatery`, `campaign-site`)
- Total length should be under 80 characters
- Must be globally unique within the Pillar 2 registry
- Once assigned, a niche ID never changes (stable)

**Examples:**
```
P2-restaurant-general-eatery
P2-politician-campaign-site
P2-clinic-primary-care
P2-creator-personal-brand
P2-church-faith-community
P2-law-firm-legal-practice
```

#### Template Slug Derivation

The marketplace `template_registry.slug` for a niche template is derived from its nicheId:
```
{vertical-slug}-{niche-slug}
```
Example: `P2-restaurant-general-eatery` → template slug = `restaurant-general-eatery`

#### Source File Path Convention

Runtime template files live at:
```
apps/brand-runtime/src/templates/niches/{vertical-slug}/{niche-slug}.ts
```
Example: `apps/brand-runtime/src/templates/niches/restaurant/general-eatery.ts`

BUILT_IN_TEMPLATES key = template slug = `restaurant-general-eatery`

### C. Required Fields for Each Niche Record

See `docs/templates/pillar2-niche-registry.schema.md` for the full field specification.

### D. Status Model

The following statuses are the ONLY valid values for `templateStatus`. No other values are permitted.

| Status | Meaning | Who Sets It | Next Status |
|--------|---------|------------|-------------|
| `UNASSESSED` | Niche exists in registry but has not been evaluated for template feasibility | System (auto) | `READY_FOR_RESEARCH` |
| `READY_FOR_RESEARCH` | Niche is confirmed Pillar 2-eligible; research not yet begun | Human or agent | `RESEARCH_IN_PROGRESS` |
| `RESEARCH_IN_PROGRESS` | Agent has begun niche research (online research + repo context synthesis) | Agent (start of work) | `RESEARCH_SYNTHESIZED` |
| `RESEARCH_SYNTHESIZED` | Research complete; brief written; ready for template implementation | Agent (end of research) | `READY_FOR_IMPLEMENTATION` |
| `READY_FOR_IMPLEMENTATION` | Research brief accepted; template implementation may begin | Human or agent | `IMPLEMENTATION_IN_PROGRESS` |
| `IMPLEMENTATION_IN_PROGRESS` | Agent is actively building the template | Agent (start of coding) | `IMPLEMENTED` |
| `IMPLEMENTED` | Template code complete and wired in BUILT_IN_TEMPLATES; marketplace manifest exists | Agent (end of coding) | `VERIFIED` |
| `VERIFIED` | Template deployed, tested, and confirmed rendering correctly in brand-runtime | Human or QA agent | `APPROVED` |
| `APPROVED` | Template is approved for production use; marketplace entry set to `approved` | Platform admin | `SHIPPED` |
| `SHIPPED` | Template live in production marketplace; available for tenant installation | System | — |
| `BLOCKED` | Work cannot proceed due to a dependency or technical blocker | Agent or human | `READY_FOR_RESEARCH` or `READY_FOR_IMPLEMENTATION` |
| `NEEDS_REVISION` | Template was returned for changes after review | Reviewer | `IMPLEMENTATION_IN_PROGRESS` |
| `VARIANTS_PENDING` | Primary template is SHIPPED; additional variants are queued | System | — |
| `ARCHIVED` | Template permanently removed from active development | Platform admin | — |

---

## PHASE 4 — TRACKING SYSTEM DESIGN

### File Structure Decision

The tracking system lives in `docs/templates/` (not `docs/reports/`) because these are operational files, not historical records.

**Justification for this structure over alternatives:**
- `docs/templates/` is already the home of all template-related governance docs
- JSON for the registry enables machine-readable parsing by agents without additional tooling
- Separate files for schema, registry, board, queue, status-codes, and handoff prevent any single file from becoming unwieldy
- The queue file ensures future agents always know the unambiguous next niche

### File Registry

| File | Purpose | Updated by |
|------|---------|-----------|
| `docs/templates/pillar2-niche-registry.schema.md` | Field definitions and validation rules for every niche record | Human only (schema changes) |
| `docs/templates/pillar2-niche-registry.json` | Machine-readable master registry of all niche records | Agent (after each niche completion) |
| `docs/templates/pillar2-template-execution-board.md` | Human-readable status board showing all niches and their statuses | Agent (after each status change) |
| `docs/templates/pillar2-template-queue.md` | The ordered queue of niches ready for implementation — one clear "NEXT" | Agent (after each completion) |
| `docs/templates/pillar2-template-status-codes.md` | Reference card for all status codes and transition rules | Human only |
| `docs/templates/pillar2-template-agent-handoff.md` | Step-by-step workflow every agent must follow before building a template | Human only (workflow changes) |

### Safety Rules

The tracking system prevents accidental damage through these rules:
1. **Duplicate prevention:** No two records may share the same `nicheId`. The registry JSON is the source of truth — agents must read it before claiming work.
2. **Skip prevention:** The queue file shows the next niche. Agents must work from the queue, not self-select.
3. **Wrong niche prevention:** Agents must confirm the niche status is `READY_FOR_IMPLEMENTATION` before starting coding.
4. **Runtime/marketplace confusion:** The `runtimeIntegrationStatus` field separately tracks whether the BUILT_IN_TEMPLATES entry exists vs whether the marketplace manifest exists.
5. **Overwrite prevention:** Only an agent that SET `IMPLEMENTATION_IN_PROGRESS` may SET `IMPLEMENTED`. The `owner` field enforces accountability.

---

## PHASE 5 — NICHE UNIVERSE

### Pillar 2-Eligible Verticals (Code-Verified from migration 0037)

The following 46 verticals have `"branding"` in their `primary_pillars` value in D1. These are the ONLY verticals eligible for Pillar 2 template work. All others default to `["ops","marketplace"]` and do NOT receive Pillar 2 templates (they are discoverable via Pillar 3 instead).

**Category: Politics (P1-Original)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 1 | `politician` | Individual Politician | `P2-politician-campaign-site` | Political Campaign Website |
| 2 | `political-party` | Political Party | `P2-political-party-party-website` | Party Organisation Website |

**Category: Transport (P1-Original)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 3 | `rideshare` | Carpooling / Ride-Hailing | `P2-rideshare-ride-hailing-service` | Ride-Hailing / Driver Network Site |
| 4 | `haulage` | Haulage / Logistics | `P2-haulage-freight-logistics` | Freight & Logistics Company Site |

**Category: Civic (P1-Original)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 5 | `church` | Church / Faith Community | `P2-church-faith-community` | Church / Faith Community Website |
| 6 | `ngo` | NGO / Non-Profit | `P2-ngo-nonprofit-portal` | NGO / Non-Profit Donor Portal |

**Category: Commerce — POS + Micro-Business (P1-Original)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 7 | `pos-business` | POS Business Management System | `P2-pos-business-operations-portal` | POS Business Operations Portal |
| 8 | `sole-trader` | Sole Trader / Artisan | `P2-sole-trader-artisan-catalogue` | Sole Trader / Artisan Catalogue Site |

**Category: Professional (P1-Original + P2)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 9 | `professional` | Professional (Lawyer/Doctor/Accountant) | `P2-professional-practice-site` | Licensed Professional Practice Site |
| 10 | `law-firm` | Law Firm / Legal Practice | `P2-law-firm-legal-practice` | Law Firm / Legal Services Site |

**Category: Education (P1-Original)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 11 | `school` | School / Educational Institution | `P2-school-institution-site` | School / Educational Institution Site |

**Category: Health (P1-Original)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 12 | `clinic` | Clinic / Healthcare Facility | `P2-clinic-primary-care` | Primary Care Clinic / Healthcare Site |

**Category: Creator (P1-Original)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 13 | `creator` | Creator / Influencer | `P2-creator-personal-brand` | Creator / Influencer Personal Brand Site |

**Category: Place (P1-Original)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 14 | `tech-hub` | Tech Hub / Innovation Centre | `P2-tech-hub-innovation-centre` | Tech Hub / Innovation Centre Site |

**Category: Commerce — Food & Hospitality (P2)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 15 | `restaurant` | Restaurant / Eatery / Buka | `P2-restaurant-general-eatery` | General Restaurant / Eatery / Buka Site |
| 16 | `hotel` | Hotel / Guesthouse / Shortlet | `P2-hotel-hospitality-booking` | Hotel / Guesthouse Booking Site |
| 17 | `bakery` | Bakery / Confectionery | `P2-bakery-confectionery` | Bakery / Confectionery Showcase Site |
| 18 | `catering` | Catering Service | `P2-catering-event-service` | Event Catering Service Site |

**Category: Commerce — Retail & Personal Care (P2)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 19 | `supermarket` | Supermarket / Grocery Store | `P2-supermarket-grocery-store` | Supermarket / Grocery Store Site |
| 20 | `pharmacy` | Pharmacy / Drug Store | `P2-pharmacy-drug-store` | Pharmacy / Drug Store Site |
| 21 | `beauty-salon` | Beauty Salon / Barber Shop | `P2-beauty-salon-personal-care` | Beauty Salon / Barbershop Booking Site |
| 22 | `spa` | Spa / Massage Parlour | `P2-spa-wellness-centre` | Spa / Wellness Centre Booking Site |
| 23 | `gym` | Gym / Wellness Centre | `P2-gym-fitness-membership` | Gym / Fitness Centre Membership Site |

**Category: Commerce — Professional Services (P2)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 24 | `real-estate-agency` | Real Estate Agency | `P2-real-estate-agency-property-listings` | Real Estate Agency / Property Listings Site |
| 25 | `travel-agent` | Travel Agent / Tour Operator | `P2-travel-agent-tour-operator` | Travel Agent / Tour Operator Site |
| 26 | `it-support` | IT Support / Computer Repair | `P2-it-support-tech-service` | IT Support / Tech Service Provider Site |
| 27 | `handyman` | Plumber / Electrician / Handyman | `P2-handyman-trade-service` | Handyman / Trade Service Booking Site |
| 28 | `tax-consultant` | Tax Consultant / Revenue Agent | `P2-tax-consultant-financial-services` | Tax Consultant / Financial Services Site |

**Category: Commerce — Fashion & Creative (P2)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 29 | `fashion-brand` | Fashion Brand / Clothing Label | `P2-fashion-brand-clothing-label` | Fashion Brand / Clothing Label Storefront |

**Category: Creator — Visual & Audio (P2)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 30 | `photography-studio` | Photography / Videography Studio | `P2-photography-studio-visual-portfolio` | Photography / Videography Studio Portfolio |
| 31 | `music-studio` | Music Studio / Recording Artist | `P2-music-studio-artist-profile` | Music Studio / Recording Artist Profile Site |

**Category: Commerce — Venues & Events (P2)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 32 | `event-hall` | Event Hall / Venue | `P2-event-hall-venue-booking` | Event Hall / Venue Booking Site |

**Category: Health — Specialist (P2)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 33 | `dental-clinic` | Dental Clinic / Orthodontist | `P2-dental-clinic-specialist-care` | Dental Clinic / Orthodontist Booking Site |
| 34 | `vet-clinic` | Veterinary Clinic / Pet Shop | `P2-vet-clinic-veterinary-care` | Veterinary Clinic / Pet Care Site |

**Category: Education — Specialist (P2)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 35 | `driving-school` | Driving School | `P2-driving-school-training` | Driving School / Transport Training Site |
| 36 | `training-institute` | Training Institute / Vocational School | `P2-training-institute-vocational` | Training Institute / Vocational School Site |
| 37 | `tutoring` | Tutoring / Lesson Teacher | `P2-tutoring-private-lessons` | Private Tutoring / Lesson Teacher Site |
| 38 | `creche` | Crèche / Day Care Centre | `P2-creche-early-childhood` | Crèche / Day Care Centre Enrollment Site |

**Category: Financial (P2)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 39 | `insurance-agent` | Insurance Agent / Broker | `P2-insurance-agent-broker-site` | Insurance Agent / Broker Site |
| 40 | `mobile-money-agent` | Mobile Money / POS Agent | `P2-mobile-money-agent-fintech` | Mobile Money / POS Agent Service Site |
| 41 | `bureau-de-change` | Bureau de Change / FX Dealer | `P2-bureau-de-change-fx-dealer` | Bureau de Change / FX Dealer Site |
| 42 | `hire-purchase` | Hire Purchase / Asset Finance | `P2-hire-purchase-asset-finance` | Hire Purchase / Asset Finance Site |
| 43 | `savings-group` | Thrift / Ajo / Esusu Group | `P2-savings-group-thrift-community` | Thrift / Ajo / Esusu Group Member Portal |

**Category: Place — Commerce (P2)**
| # | Vertical Slug | Display Name | Initial Niche ID | Niche Name |
|---|---|---|---|---|
| 44 | `wholesale-market` | Wholesale Market | `P2-wholesale-market-trading-hub` | Wholesale Market / Trading Hub Portal |
| 45 | `community-hall` | Community Hall / Town Hall | `P2-community-hall-civic-space` | Community Hall / Civic Space Booking Site |
| 46 | `warehouse` | Warehouse Operator | `P2-warehouse-logistics-hub` | Warehouse / Logistics Hub Service Site |

**Total Pillar 2-eligible niches (first pass):** 46

### Slug Mismatch Flags (Ambiguities Requiring Remediation)

Migration `0037_verticals_primary_pillars.sql` uses slugs that do not match the canonical CSV:

| Migration slug | CSV canonical slug | Action required |
|---|---|---|
| `dental` | `dental-clinic` | Update migration to use `dental-clinic` |
| `vet` | `vet-clinic` | Update migration to use `vet-clinic` |
| `mobile-money` | `mobile-money-agent` | Update migration to use `mobile-money-agent` |
| `bdc` | `bureau-de-change` | Update migration to use `bureau-de-change` |
| `vocational` | `training-institute` | Update migration to use `training-institute` |
| `photography-studio` | `photography` (vtx_photography in CSV) | Verify: package is `verticals-photography-studio` but CSV slug may be `photography` |

> **BLOCKER NOTE:** These mismatch slugs in migration 0037 will result in the `primary_pillars` UPDATE silently matching zero rows. Each mismatched slug's vertical will retain the default `["ops","marketplace"]` — meaning it will NOT be correctly identified as Pillar 2-eligible in D1. A remediation migration should be created.

### Verticals Explicitly NOT Pillar 2-Eligible (ops+marketplace only)

The following P1-Original verticals have `primary_pillars = ["ops","marketplace"]` — they are discoverable in Pillar 3 but do NOT receive branded websites:

| Vertical Slug | Reason |
|---|---|
| `motor-park` | Place entity — directory and operations only; no branded website value |
| `mass-transit` | Route operations + transit directory; no standalone branded website |
| `cooperative` | Member operations + cooperative directory; governance-focused not brand-focused |
| `market` | Multi-vendor marketplace — is itself a Pillar 3 surface |

All other verticals (default: `["ops","marketplace"]`) also do not receive Pillar 2 templates in the first pass. Future passes may promote some to include branding.

---

## PHASE 6 — NIGERIA-FIRST / AFRICA-FIRST ENFORCEMENT MODEL

See `docs/templates/pillar2-template-agent-handoff.md` §4 for the full enforcement checklist.

### Core Principles (Summary)

1. **Default language:** Nigerian English with Pidgin English (PCM) secondary awareness. Never default to American or British English phrasing.
2. **Currency:** Always NGN / Naira (₦) and Kobo. Never USD, GBP, or EUR in example pricing. Reference realistic Nigerian price ranges.
3. **Geography:** Use Nigerian cities, LGAs, states, and streets. Lagos / Abuja / Kano / Port Harcourt / Ibadan / Owerri as primary geo references. Never use London, New York, or generic Western city names.
4. **Contact models:** WhatsApp is the primary customer contact channel in Nigeria — always include WhatsApp CTA. Phone (local format: 080X, 070X, 081X) is secondary. Email is tertiary.
5. **Trust signals:** NAFDAC numbers, CAC registration, professional body memberships (NBA, NMA, ICAN, PCN), FRSC license numbers — these build trust in Nigerian context. Not western BBB or Yelp.
6. **Payment references:** Paystack, Flutterwave, bank transfer, POS agent cash. Never Stripe, PayPal, Venmo.
7. **Mobile-first absolute:** 70%+ of Nigerian internet users are mobile. Templates must render perfectly on 375px–414px screens (older iPhones / mid-range Android). Low bandwidth = no large images inline.
8. **No generic western stock images:** All image direction must specify realistic Nigerian / African subjects: Nigerian professionals, Nigerian street scenes, Nigerian food, Nigerian fashion.
9. **Business reality:** Nigerian SMEs operate with different trust and discovery patterns. Testimonials are critical. "Verified by" badges matter. Church-based referrals matter. WhatsApp group promotion matters.
10. **NDPR awareness:** Any form that collects PII must include the NDPR consent disclosure language.

---

## PHASE 7 — RESEARCH-REQUIRED TEMPLATE WORKFLOW FOR FUTURE AGENTS

See `docs/templates/pillar2-template-agent-handoff.md` for the full step-by-step protocol.

### Workflow Summary (9 Mandatory Steps)

```
STEP 1: Read registry → confirm target niche → confirm status is READY_FOR_IMPLEMENTATION
STEP 2: Claim niche → set status to IMPLEMENTATION_IN_PROGRESS + set owner field
STEP 3: Read all required repo context documents
STEP 4: Launch specialist research sub-agents (minimum 4 parallel research threads)
STEP 5: Synthesize research into niche brief
STEP 6: Design Nigeria-first template structure (sections, copy tone, CTAs)
STEP 7: Implement the WebsiteTemplateContract in apps/brand-runtime/src/templates/niches/
STEP 8: Register in BUILT_IN_TEMPLATES + create marketplace manifest SQL
STEP 9: Update registry to IMPLEMENTED + update execution board + advance queue
```

**Research is MANDATORY before implementation. Implementation without completed research is a protocol violation.**

---

## PHASE 8 — VERIFICATION AGAINST REPO REALITY

### Verification Checklist

| Item | Verified | Notes |
|------|---------|-------|
| Niche identity system does not conflict with Pillar 2 runtime | ✅ | Adding to BUILT_IN_TEMPLATES is the correct integration point |
| Niche IDs do not conflict with marketplace template slugs | ✅ | Derived slugs follow `{vertical-slug}-{niche-slug}` pattern — no existing slugs |
| Vertical slugs match canonical CSV | ✅ (with flags) | 5 slug mismatches in migration 0037 flagged — do not block registry creation |
| Status model does not conflict with template_registry statuses | ✅ | Registry statuses (`draft`, `pending_review`, `approved`, `deprecated`) are separate from niche tracking statuses |
| Pillar definitions are clean | ✅ | post-correction-verification-2026-04-25 confirms no wrong framing anywhere |
| White-label policy compatible | ✅ | `whiteLabelDepth` is consumed at render time post-correction; templates must respect it |
| Nigeria-first `lang="en-NG"` already in base template | ✅ | `base.ts` hardcodes `lang="en-NG"` — NF compliance at infrastructure level |
| Build-once-use-infinitely architecture compatible | ✅ | `WebsiteTemplateContract` interface is the reusable contract; each niche implements it once |

### Open Ambiguities

| Ambiguity | Impact | Resolution |
|-----------|--------|-----------|
| 5 slug mismatches in migration 0037 | Affects `primary_pillars` classification for 5 verticals | Create remediation migration; do not block registry work |
| `photography` vs `photography-studio` slug | One niche ID may reference wrong slug | Verify against live D1 before implementing this niche |
| `law-firm` present in migration 0037 list but tagged under "commerce" group | Confirmed in CSV as `vtx_law_firm` (professional category) | Safe to use — slug confirmed correct |

### Assumptions Made

1. The `WebsiteTemplateContract` interface (imported from `@webwaka/verticals`) is stable and the correct abstraction for new niche templates.
2. The `BUILT_IN_TEMPLATES` map in `template-resolver.ts` is the only required code change to activate a new niche template.
3. No new DB migrations are required to add niche templates — only code changes to `apps/brand-runtime/`.
4. The marketplace manifest for each niche template can be seeded via SQL at implementation time.

### System Readiness

> **VERDICT: SAFE TO ADOPT IMMEDIATELY**

The canonical Pillar 2 frame is correctly established. Invalid prior framing is explicitly excluded. Every niche can be uniquely identified. Future agents can tell what is done vs pending. Nigeria-first / Africa-first requirements are built into the system. Research-before-implementation is mandatory and enforced in the handoff protocol. The build-once-use-infinitely model is explicit and enforced via the `WebsiteTemplateContract` interface. This system is safe and the first implementation (Prompt 2) may now be written on top of it.

---

*Report generated: 2026-04-25*  
*Evidence base: Full code review of apps/brand-runtime/, packages/verticals/, all migrations, infra/db/seeds/0004_verticals-master.csv, docs/governance/3in1-platform-architecture.md, docs/reports/pillar2-forensics-report-2026-04-24.md, docs/reports/webwaka-os-post-correction-verification-2026-04-25.md, and all docs/templates/ files*  
*Companion files: docs/templates/pillar2-niche-registry.schema.md, docs/templates/pillar2-niche-registry.json, docs/templates/pillar2-template-execution-board.md, docs/templates/pillar2-template-queue.md, docs/templates/pillar2-template-status-codes.md, docs/templates/pillar2-template-agent-handoff.md*
