# Pillar 2 Template Queue

**Document type:** Agent work queue — single source of truth for what to build next  
**Status:** ACTIVE — updated by agents after every completed niche  
**Date last updated:** 2026-04-25  
**Authority:** `docs/reports/pillar2-niche-identity-system-2026-04-25.md`

> **One agent, one niche at a time.**  
> Before claiming a niche, read this queue. Take the CURRENT niche at the top.  
> After completing a niche, advance CURRENT to the next niche in the list.  
> Never skip ahead — the queue order is the build priority order.

---

## ⟶ CURRENT (Build This Next)

```
Niche ID:       P2-creator-personal-brand
Vertical:       creator
Vertical Name:  Creator / Influencer
Niche Name:     Creator / Influencer Personal Brand Site
Status:         IMPLEMENTED ✅
Owner:          replit-agent-2026-04-25-session-B
Template Slug:  creator-personal-brand
Source File:    apps/brand-runtime/src/templates/niches/creator/personal-brand.ts (to create)

Rationale for priority:
  - creator economy is fast-growing in Nigeria — YouTube, TikTok, Instagram monetisation
  - Personal brand site is a core need for every creator/influencer seeking brand deals
  - Social-native audience expects polished web presence alongside their socials
  - P1-Original vertical

Pre-work checklist:
  [ ] Read pillar2-generic-implementation-prompt.md (mandatory)
  [ ] Confirm status is READY_FOR_RESEARCH in pillar2-niche-registry.json
  [ ] Claim niche (set status to RESEARCH_IN_PROGRESS + set owner)
  [ ] Begin 4-thread parallel research
```

---

## Queue (Ordered Build Sequence)

### Batch 1 — Highest-Priority Niches (M8e / M9 deadline)
These niches are the highest-build-priority targets. `restaurant` leads as the reference implementation despite being a P2-category vertical — it is the most searched Nigerian SME type. All others are P1-Original verticals. Must be ready before M10.

| Priority | Niche ID | Status | Notes |
|----------|----------|--------|-------|
| 1 | `P2-restaurant-general-eatery` | IMPLEMENTED ✅ | NF-FDS anchor — 2026-04-25 |
| 2 | `P2-sole-trader-artisan-catalogue` | IMPLEMENTED ✅ | Standalone — 2026-04-25 |
| 3 | `P2-creator-personal-brand` | IMPLEMENTED ✅ | NF-CRE-DIG anchor — 2026-04-25 |
| 4 | `P2-professional-practice-site` | IMPLEMENTED ✅ | NF-PRO-LIC anchor — 2026-04-25 |
| 5 | `P2-church-faith-community` | IMPLEMENTED ✅ | NF-CIV-REL anchor — 2026-04-25 |
| 6 | `P2-clinic-primary-care` | READY_FOR_RESEARCH | Health — P1-Original; high social value |
| 7 | `P2-school-institution-site` | READY_FOR_RESEARCH | Education — P1-Original |
| 8 | `P2-ngo-nonprofit-portal` | READY_FOR_RESEARCH | Civic — P1-Original |
| 9 | `P2-pos-business-operations-portal` | READY_FOR_RESEARCH | Commerce — P1-Original |
| 10 | `P2-politician-campaign-site` | READY_FOR_RESEARCH | Politics — P1-Original (M8b) |
| 11 | `P2-political-party-party-website` | READY_FOR_RESEARCH | Politics — P1-Original (M8b) |
| 12 | `P2-tech-hub-innovation-centre` | READY_FOR_RESEARCH | Place — P1-Original |
| 13 | `P2-rideshare-ride-hailing-service` | READY_FOR_RESEARCH | Transport — P1-Original |
| 14 | `P2-haulage-freight-logistics` | READY_FOR_RESEARCH | Transport — P1-Original |

### Batch 2 — P2 High-Fit Commerce Verticals (M9 deadline)
High-volume Nigerian SME types. Prioritised by estimated Nigerian market size.

| Priority | Niche ID | Status | Notes |
|----------|----------|--------|-------|
| 15 | `P2-pharmacy-drug-store` | READY_FOR_RESEARCH | Regulatory trust signals critical |
| 16 | `P2-beauty-salon-personal-care` | READY_FOR_RESEARCH | Very high Nigeria demand |
| 17 | `P2-hotel-hospitality-booking` | READY_FOR_RESEARCH | Booking system focus |
| 18 | `P2-real-estate-agency-property-listings` | READY_FOR_RESEARCH | Property — high search intent |
| 19 | `P2-law-firm-legal-practice` | READY_FOR_RESEARCH | Professional — NBA trust signals |
| 20 | `P2-it-support-tech-service` | READY_FOR_RESEARCH | B2B tech services |
| 21 | `P2-handyman-trade-service` | READY_FOR_RESEARCH | Home services — very high demand |
| 22 | `P2-supermarket-grocery-store` | READY_FOR_RESEARCH | Retail — inventory-driven |
| 23 | `P2-bakery-confectionery` | READY_FOR_RESEARCH | Food — pre-order focus |
| 24 | `P2-catering-event-service` | READY_FOR_RESEARCH | Event season driven |
| 25 | `P2-event-hall-venue-booking` | READY_FOR_RESEARCH | Venue booking calendar |
| 26 | `P2-fashion-brand-clothing-label` | READY_FOR_RESEARCH | Creator + commerce crossover |
| 27 | `P2-photography-visual-portfolio` | READY_FOR_RESEARCH | Portfolio-first design (slug ambiguity noted — see blockers) |
| 28 | `P2-music-studio-artist-profile` | READY_FOR_RESEARCH | Artist profile + booking |
| 29 | `P2-travel-agent-tour-operator` | READY_FOR_RESEARCH | Tour package showcase |
| 30 | `P2-savings-group-thrift-community` | READY_FOR_RESEARCH | Ajo/esusu — Nigeria-specific |

### Batch 3 — P2/P3 Specialist Verticals (M10–M11)

| Priority | Niche ID | Status | Notes |
|----------|----------|--------|-------|
| 31 | `P2-gym-fitness-membership` | READY_FOR_RESEARCH | Membership + class booking |
| 32 | `P2-spa-wellness-centre` | READY_FOR_RESEARCH | Appointment booking |
| 33 | `P2-tax-consultant-financial-services` | READY_FOR_RESEARCH | ICAN trust signals |
| 34 | `P2-driving-school-training` | READY_FOR_RESEARCH | FRSC-aligned |
| 35 | `P2-training-institute-vocational` | READY_FOR_RESEARCH | Course catalog |
| 36 | `P2-tutoring-private-lessons` | READY_FOR_RESEARCH | Subject + booking |
| 37 | `P2-wholesale-market-trading-hub` | READY_FOR_RESEARCH | B2B price discovery |
| 38 | `P2-warehouse-logistics-hub` | READY_FOR_RESEARCH | Slot booking |
| 39 | `P2-insurance-agent-broker-site` | READY_FOR_RESEARCH | NAICOM trust signals |

### Batch 4 — Slug-Mismatch Flagged (Resolve Before Implementing)

These niches have slug mismatches in migration 0037 that must be resolved first. A remediation migration must be confirmed before these templates are marked SHIPPED.

| Priority | Niche ID | Status | Flag |
|----------|----------|--------|------|
| 40 | `P2-dental-clinic-specialist-care` | READY_FOR_RESEARCH | Slug mismatch: `dental` vs `dental-clinic` |
| 41 | `P2-vet-clinic-veterinary-care` | READY_FOR_RESEARCH | Slug mismatch: `vet` vs `vet-clinic` |
| 42 | `P2-creche-early-childhood` | READY_FOR_RESEARCH | |
| 43 | `P2-mobile-money-agent-fintech` | READY_FOR_RESEARCH | Slug mismatch: `mobile-money` vs `mobile-money-agent` |
| 44 | `P2-bureau-de-change-fx-dealer` | READY_FOR_RESEARCH | Slug mismatch: `bdc` vs `bureau-de-change` |
| 45 | `P2-hire-purchase-asset-finance` | READY_FOR_RESEARCH | |
| 46 | `P2-community-hall-civic-space` | READY_FOR_RESEARCH | |

---

## Completed Niches

| Completed Date | Niche ID | Niche Name | SHIPPED |
|----------------|----------|-----------|---------|
| 2026-04-25 | `P2-restaurant-general-eatery` | General Restaurant / Eatery / Buka Site | ❌ (IMPLEMENTED — awaiting SQL seed apply + QA) |
| 2026-04-25 | `P2-sole-trader-artisan-catalogue` | Sole Trader / Artisan Catalogue Site | ❌ (IMPLEMENTED — awaiting SQL seed apply + QA) |
| 2026-04-25 | `P2-creator-personal-brand` | Creator / Influencer Personal Brand Site | ❌ (IMPLEMENTED — awaiting SQL seed apply + QA) |
| 2026-04-25 | `P2-professional-practice-site` | Licensed Professional Practice Site | ❌ (IMPLEMENTED — awaiting SQL seed apply + QA) |
| 2026-04-25 | `P2-church-faith-community` | Church / Faith Community Website | ❌ (IMPLEMENTED — awaiting SQL seed apply + QA) |

---

## Queue Rules

1. **Always work from the CURRENT niche first.** Never self-select a different niche without a documented reason.
2. **Only one niche may be IMPLEMENTATION_IN_PROGRESS at a time** (per agent session).
3. **After completing a niche:** move it to the Completed table, advance CURRENT to the next unclaimed READY_FOR_RESEARCH niche.
4. **Batch 4 niches** may be implemented (the template code can be written) but cannot be marked SHIPPED until the slug mismatch remediation migration is confirmed applied.
5. **Queue order may be changed by a human platform owner only.** Agents do not reorder the queue.
6. **If the CURRENT niche is already IMPLEMENTATION_IN_PROGRESS by another agent:** take the next available niche in the list.

---

*Last updated: 2026-04-25 — P2-church-faith-community IMPLEMENTED. 43 niches queued. 5 completed (IMPLEMENTED, not yet SHIPPED).*
