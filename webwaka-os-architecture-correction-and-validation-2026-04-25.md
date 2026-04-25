# WebWaka OS — Architecture Correction and Report Validation Pass

**Date:** 2026-04-25  
**Subject:** Correction of `webwaka-os-corrected-architecture-reframing-report-2026-04-25.md`  
**Method:** All claims re-verified against canonical sources. No defensive posture toward prior report.  
**Evidence labeling convention:**
- `[CODE-PROVEN]` — derived from direct file read with line citations
- `[DOCS-PROVEN]` — derived from governance documentation with file citations
- `[INFERRED]` — derived by logical reasoning; not directly stated in a source file

---

## Section 1 — Executive Verdict

The prior report (`webwaka-os-corrected-architecture-reframing-report-2026-04-25.md`) contained **three critical architectural framing errors** that render its Sections C, E, F, and O unreliable as a basis for implementation planning.

**The three critical errors, stated plainly:**

1. **Pillar 3 was defined as "Transport + Logistics."** This is wrong. The canonical Pillar 3 is **Listing / Multi-Vendor Marketplace** — the public directory where every entity is discoverable. Transport is a sector of businesses, not a platform pillar.

2. **The PlatformLayer entitlement enum was conflated with canonical pillar definitions.** `PlatformLayer.Transport`, `PlatformLayer.Commerce`, `PlatformLayer.Creator` are plan-tier feature unlocks, not pillar definitions. These are two entirely separate classification systems that the prior report merged.

3. **Pillar 2 was named "Commerce + Brand."** The canonical name is **Branding / Website / Portal**. Commerce (e-commerce store) is one capability within Pillar 2, not its defining identity. The word "Market" in the prior report's Pillar 2 subtitle ("Digital Presence + Market") belongs to Pillar 3, not Pillar 2.

Additionally, `vertical-ai-config.ts`'s `primaryPillar` field (values 1/2/3) was presented as the canonical vertical-to-pillar classification. It is not. It is an **AI billing category tag** used internally for `ai_usage_events` billing attribution. It uses a different taxonomy that does not map cleanly to the canonical 3-in-1 pillars.

**Salvage verdict:** Sections A (partial), B (partial), D (partial), G, J, K, L, M, N contain valid, code-proven findings that are not corrupted by the pillar framing error. Those findings are listed in Section 5 (Salvage Matrix).

**Stop condition for implementation:** No Pillar 1 or SuperAgent implementation planning should proceed until Section 6 (Corrected Mental Model) and Section 8 (Safe Next Scope) are accepted as the working frame.

---

## Section 2 — Canonical Pillar Definitions

All definitions sourced from `docs/governance/3in1-platform-architecture.md` (the declared single source of truth, dated 2026-04-09, updated 2026-04-11). Cross-validated against `docs/governance/webwaka_3in1_core_audit_summary.md`.

---

### 2.1 Pillar 1 — Operations-Management (POS)

**Canonical name:** Operations-Management (POS)  
**Tagline:** "The back office that runs the business."  
**Source:** `docs/governance/3in1-platform-architecture.md` lines 20–35  
**Source quote:**
> The operations layer provides turn-key management tools for any entity: Point-of-Sale (POS), order management, inventory management, reporting and analytics, staff and scheduling, back-office workflows, USSD operations.

**Runtime apps:** `apps/api/` (POS, payments, workspaces routes), `apps/ussd-gateway/`, `apps/platform-admin/`, `apps/partner-admin/`, `apps/admin-dashboard/`  
**Core packages:** `packages/pos/`, `packages/offerings/`, `packages/workspaces/`, `packages/payments/`  
**Plan gate:** `PlatformLayer.Operational` — unlocked at **starter** plan and above  
**Free tier:** Free plan gets `PlatformLayer.Discovery` only — NOT Operational  
**Scope:** All 159 verticals have Pillar 1 as minimum operational foundation  

**What Pillar 1 is NOT:**
- Not limited to POS float agents
- Not Transport/Logistics as a separate pillar
- Not the same as "PlatformLayer.Operational" (that's an entitlement concept, not the pillar definition)

---

### 2.2 Pillar 2 — Branding / Website / Portal

**Canonical name:** Branding / Website / Portal  
**Tagline:** "The front of house that faces the world."  
**Source:** `docs/governance/3in1-platform-architecture.md` lines 39–51  
**Source quote:**
> The branding layer provides a dedicated digital presence for any entity: branded website, single-vendor e-commerce store, service portal, campaign or event site, informational site, white-label capability.

**Runtime app:** `apps/brand-runtime/` — `[CODE-PROVEN]` this app is implemented as of staging commit `1e2435634e` (routes/, templates/, lib/ directories confirmed)  
**Core packages:** `packages/white-label-theming/`, `packages/design-system/`, `packages/frontend/`  
**Plan gate:** `PlatformLayer.Commerce` — unlocked at **growth** plan and above (for storefront); basic branding rights available at **starter**  
**White-label:** Partners control branded surface via `whiteLabelDepth` (0/1/2)  

**Canonical name is NOT:**
- "Commerce" (commerce is one sub-capability, not the pillar name)
- "Brand Runtime" (that is the runtime app name, not the pillar name)
- "Commerce + Brand" (prior report error — see Section 3)

---

### 2.3 Pillar 3 — Listing / Multi-Vendor Marketplace

**Canonical name:** Listing / Multi-Vendor Marketplace  
**Tagline:** "The public directory where every entity is discoverable."  
**Source:** `docs/governance/3in1-platform-architecture.md` lines 55–69  
**Source quote:**
> The marketplace layer provides discoverable, searchable, geography-aware listings: seeded directories (160+ vertical categories pre-seeded across Nigeria's LGAs, wards, and states), claim-first onboarding, multi-vendor marketplace, geography-powered search, public profile pages, category browse, white-label directories.

**Runtime apps:** `apps/public-discovery/` (marketplace frontend) and `apps/tenant-public/` (per-tenant discovery page)  
`[CODE-PROVEN]` — `apps/public-discovery/src/` contains index.ts, routes/, templates/ as of staging commit `1e2435634e`  
**Core packages:** `packages/profiles/`, `packages/search-indexing/`, `packages/claims/`, `packages/geography/`, `packages/verticals/`  
**Plan gate:** `PlatformLayer.Discovery` — available at ALL plan tiers including **free**  
**Key feature:** Claim-first onboarding — entities are seeded before signup; owners claim them  

**Canonical name is NOT:**
- Transport + Logistics (prior report critical error)
- Gated at pro+ plan (Discovery layer is free)
- A sector classification — Pillar 3 is about HOW an entity is found (public directory), not what sector they operate in

---

### 2.4 SuperAgent / AI — Cross-Cutting Intelligence Layer

**Canonical status:** NOT a fourth pillar  
**Source:** `docs/governance/3in1-platform-architecture.md` lines 73–85  
**Source quote:**
> WebWaka SuperAgent is **not a product pillar** — it is the cross-cutting intelligence service that enhances every pillar: On Pillar 1 (Ops), On Pillar 2 (Branding), On Pillar 3 (Marketplace).

**Source:** `docs/governance/webwaka_3in1_core_audit_summary.md` lines 22–23  
**Source quote:**
> **SuperAgent (AI layer)** is NOT a fourth primary capability — it is the **cross-cutting intelligence layer** running on top of all three.

**Runtime:** `packages/superagent/` — routes through `apps/api/`  
**Plan gate:** `aiRights: true` — unlocked at **growth** plan and above (confirmed `[CODE-PROVEN]` `plan-config.ts` lines 77, 95)  
**Governance:** All AI features route through `packages/superagent` — never directly to any AI provider (P7)

---

### 2.5 Discovery Layer vs. Pillar 3

These are related but distinct concepts:

| Concept | What It Is | Source |
|---------|-----------|--------|
| **PlatformLayer.Discovery** | An entitlement layer in the plan system; unlocks access to marketplace listing and public profiles | `packages/types/src/enums.ts` line 173 |
| **Pillar 3 — Marketplace** | A product pillar; the entire public directory/marketplace system | `docs/governance/3in1-platform-architecture.md` |
| Relationship | `PlatformLayer.Discovery` is the entitlement gate that controls a tenant's Pillar 3 access rights | `[INFERRED]` from plan-config + architecture doc |

---

### 2.6 PlatformLayer Enum — What It Actually Is

**Source:** `packages/types/src/enums.ts` lines 172–184 `[CODE-PROVEN]`

```typescript
export const PlatformLayer = {
  Discovery:     'discovery',
  Operational:   'operational',
  Commerce:      'commerce',
  Transport:     'transport',
  Civic:         'civic',
  Political:     'political',
  Institutional: 'institutional',
  Professional:  'professional',
  Creator:       'creator',
  WhiteLabel:    'white_label',
  AI:            'ai',
} as const;
```

**What PlatformLayer IS:** A plan entitlement system — 11 capability buckets that the plan tier matrix uses to gate which product features a tenant can access.

**What PlatformLayer IS NOT:** The canonical 3-in-1 pillar definitions. The 3-in-1 pillars are Ops/Branding/Marketplace. The PlatformLayer enum has 11 values, not 3, and uses different naming and grouping.

**Mapping (best-effort) `[INFERRED]`:**

| PlatformLayer value | Relates to | Canonical pillar(s) |
|--------------------|-----------|-------------------|
| Discovery | Access to marketplace listing | Pillar 3 |
| Operational | Back-office ops access | Pillar 1 |
| Commerce | Storefront / e-commerce access | Pillar 2 |
| Transport | Transport-sector vertical features | Pillar 1 (transport sector) |
| Civic, Political, Institutional | Sector-specific feature unlocks | Pillar 1 (civic/gov sector) |
| Professional | Professional services sector | Pillar 1 (professional sector) |
| Creator | Creator/media sector features | Pillar 2 (creator brand) |
| WhiteLabel | Partner white-label rights | Cross-pillar (partner tier) |
| AI | AI/SuperAgent features | Cross-cutting AI layer |

**The prior report's error:** It treated the PlatformLayer enum as if it defined pillars. It does not. `PlatformLayer.Transport` is not "Pillar 3" — it is a sector capability unlock within Pillar 1.

---

### 2.7 `primaryPillar` in `vertical-ai-config.ts` — What It Actually Is

**Source:** `packages/superagent/src/vertical-ai-config.ts` lines 7–10, 32–36 `[CODE-PROVEN]`

```typescript
// File-level comment (lines 7-10):
//   - Billing category assignment (pillar-tagged usage in ai_usage_events)
//
export interface VerticalAiConfig {
  slug: string;
  primaryPillar: 1 | 2 | 3;  // AI billing category tag
  ...
}
```

**What `primaryPillar` IS:** An internal AI billing category tag. It is used to categorize AI usage events in `ai_usage_events` for billing attribution. Values 1/2/3 indicate which pillar context the AI use cases primarily serve for that vertical.

**What `primaryPillar` IS NOT:** The canonical business-level 3-in-1 pillar classification for that vertical. The canonical vertical classification is in the `verticals` DB table's `primary_pillars` JSON column (a separate field).

**Evidence of taxonomy mismatch:** `gas-distributor` has `primaryPillar: 3` and capabilities `[route_optimizer, demand_forecasting, translation]`. In the canonical system, Pillar 3 = Marketplace/Directory. Gas distributor with route_optimizer is clearly an operational (Pillar 1) + logistics AI use case. The `primaryPillar: 3` here likely means "commerce/transport billing category" in the AI system's internal taxonomy — it does NOT mean "gas-distributor is primarily a marketplace entity."

**Verdict:** The `primaryPillar` field in `vertical-ai-config.ts` should NOT be used as the source of truth for canonical pillar classification. The prior report's Section E distribution table (using this field to classify all 159 verticals into canonical pillars) was built on the wrong evidence.

---

## Section 3 — Error Register Against Prior Report

| ID | Section | Prior Claim | Why Wrong | Corrected Claim | Evidence | Severity |
|----|---------|-------------|-----------|-----------------|----------|----------|
| **ERR-01** | Section C.4 | "Pillar 3 — Transport + Logistics. Gate: pro plan and above. Core packages: @webwaka/verticals-transit, @webwaka/verticals-logistics. AI Layer: route_optimizer." | Pillar 3 is the Marketplace/Directory layer. Transport is a sector, not a pillar. No pro+ gate on Pillar 3 — Discovery is free tier. | Pillar 3 = Listing / Multi-Vendor Marketplace. Runtime: `apps/public-discovery/`. Free tier. Transport/logistics verticals are served by Pillar 1 (ops) + Pillar 3 (marketplace listing). | `docs/governance/3in1-platform-architecture.md` lines 55-69 | **CRITICAL** |
| **ERR-02** | Section E Pillar Distribution | "Pillar 3 (Transport/Logistics) — ~14 verticals: logistics, transit, warehouse, real-estate-agency, gas-distributor" | Transport is not Pillar 3. The `primaryPillar: 3` field in `vertical-ai-config.ts` is an AI billing category, not a canonical pillar classification. | All 159 verticals have at minimum Pillar 1 (ops). Most have Pillar 3 (marketplace listing). Many have Pillar 2 (brand site). No vertical is purely "Transport Pillar 3." | `docs/governance/3in1-platform-architecture.md` Section 5; `vertical-ai-config.ts` lines 7-10 | **CRITICAL** |
| **ERR-03** | Section F.2 (plan gate table) | Row: "Transport layer (Pillar 3): pro+" | PlatformLayer.Transport is not Pillar 3. Pillar 3 (Discovery) is free tier. PlatformLayer.Transport is a sector capability unlock within Pillar 1. | Remove the "Transport = Pillar 3" row. Add: "PlatformLayer.Transport (transport-sector ops features): pro+". Pillar 3 (Discovery) available free. | `plan-config.ts` lines 80-96; `enums.ts` lines 172-184; architecture doc | **CRITICAL** |
| **ERR-04** | Section C.1 | Presented PlatformLayer enum values (Discovery/Operational/Commerce/Transport/Professional/Creator/WhiteLabel) as the canonical pillar structure | PlatformLayer is a plan entitlement system with 11 values. The canonical 3-in-1 has 3 pillars. They use different names and groupings. | PlatformLayer is an entitlement classification, not a pillar definition. Canonical pillars are: 1=Ops-Management, 2=Branding/Website/Portal, 3=Listing/Marketplace. | `enums.ts` lines 172-184; `docs/governance/3in1-platform-architecture.md` | **HIGH** |
| **ERR-05** | Section C.3, header | "Pillar 2 — Commerce + Brand (Digital Presence + Market)" | Canonical name is "Branding / Website / Portal." Commerce is one sub-capability. "Market" in the subtitle implies marketplace which belongs to Pillar 3. | Pillar 2 = Branding / Website / Portal. Single-vendor e-commerce is one feature of Pillar 2. Marketplace (multi-vendor) is Pillar 3. | `docs/governance/3in1-platform-architecture.md` lines 39-51 | **HIGH** |
| **ERR-06** | Section H heading | "Marketplace and Template Layer (Pillar 2 Commerce + Brand)" | Template marketplace lives in brand-runtime (Pillar 2). But calling it "Commerce + Brand" misnames the pillar. The word "marketplace" in this context is confusing — brand-runtime has a template marketplace (not a product marketplace). | Section H should be "Template System within Pillar 2 (Branding / Website / Portal). The `template_registry` and `template_installations` tables provide the branded site template selection system." | `apps/brand-runtime/src/lib/template-resolver.ts` lines 1-26 | **HIGH** |
| **ERR-07** | Section F.2 (plan gate table) | Row: "Commerce / storefront: growth+" (labeled as Pillar 2 feature) | Partially correct (Commerce layer unlocks at growth), but the prior table was framing this alongside "Pillar 3 = Transport" creating a 4-layer system instead of 3-in-1 | Commerce storefront capability (`PlatformLayer.Commerce`) unlocks at growth. This is a Pillar 2 feature. Correct in isolation; wrong in the framing context. | `plan-config.ts` lines 65-79 | **MEDIUM** |
| **ERR-08** | ToC / Section D framing | Table of Contents says "Pillar 4 / SuperAgent if explicitly defined" as a section heading | There is no Pillar 4. The canonical is unambiguous: SuperAgent is not a fourth pillar. Hedging with "if explicitly defined" does not excuse the framing. | SuperAgent is the cross-cutting intelligence layer. Section should be titled "SuperAgent — Cross-Cutting AI Layer (Not a Pillar)" | `docs/governance/3in1-platform-architecture.md` lines 73-85 | **MEDIUM** |
| **ERR-09** | Section D.4 (comparison table) | Listed "Pillar specificity" as a SuperAgent attribute, implying SuperAgent is a product with vertical specificity as a gap | SuperAgent is a cross-cutting service. "Pillar specificity" is not a valid attribute for a cross-cutting layer — it should serve all pillars. The table framed gaps as if SuperAgent should be more "pillar-native." | SuperAgent serves all 3 pillars. Gaps should be framed as "capability registration gaps" and "HITL dead-end" — not as "insufficient pillar specificity." | `docs/governance/3in1-platform-architecture.md` lines 79-84 | **MEDIUM** |
| **ERR-10** | Section O.4 SuperAgent Roadmap | Listed "Phase 3 (multi-step agents)" and "Phase 5 (vertical agents)" as pillars of a SuperAgent evolution roadmap | SuperAgent evolution phases may be valid but they should be framed as improvements to the cross-cutting AI layer, not as a pillar buildout. Calling it a "roadmap" implies product ownership. | SuperAgent improvements are capability-gap closures. They enhance all three pillars. They are not a separate product roadmap. | Architecture docs; canonical cross-cutting position | **LOW** |

---

## Section 4 — Corrected Component-to-Pillar Mapping

For each component, I state: primary pillar, secondary pillar if cross-cutting, prior misclassification (yes/no), effect on remediation priority.

| Component | Primary Pillar | Secondary | Prior Misclassification? | Correction Effect |
|-----------|---------------|-----------|--------------------------|-------------------|
| `apps/brand-runtime/` | **Pillar 2** (Branding/Website/Portal) | None | No — correctly identified | None needed |
| `apps/public-discovery/` | **Pillar 3** (Listing/Marketplace) | None | **YES** — prior report did not mention public-discovery as Pillar 3; instead invented Transport as Pillar 3 | Pillar 3 remediation must focus on discovery/marketplace, not transport |
| Template marketplace (`template_registry`, `template_installations`) | **Pillar 2** (Branding — brand site template selection) | None | Partially — called "Pillar 2 Commerce + Brand"; should be Pillar 2 Branding | Minor renaming only |
| White-label depth logic (`applyDepthCap`) | **Pillar 2** (brand surface control) | Partner/infra | No | None |
| Single-vendor storefront / shop | **Pillar 2** (Branding/Website/Portal — e-commerce within brand site) | None | **YES** — prior report implied Commerce was a separate pillar | Commerce = a feature of Pillar 2, not a standalone pillar |
| POS float ledger (`packages/pos/`, `float-ledger.ts`) | **Pillar 1** (Ops — agent float management) | None | No — correctly identified | None |
| POS business inventory/sales/CRM (`packages/verticals-pos-business/`) | **Pillar 1** (Ops) | Pillar 2 (branded store) — per canonical `pos-business` classification `["ops","branding"]` | No — correctly identified | None |
| Transport/logistics verticals (transit, logistics, transport-company) | **Pillar 1** (Ops — fleet, route management) | Pillar 3 (marketplace listing in transport directory) | **YES** — prior report labeled these "Pillar 3" | These are Pillar 1 + Pillar 3 entities. Transport is NOT its own pillar. |
| `route_optimizer` capability | **Cross-cutting AI** (serves Pillar 1 transport-sector ops) | None | **YES** — placed under "Pillar 3 AI Layer" | Route optimizer serves Pillar 1 (transport ops) through the AI cross-cutting layer |
| Analytics (`workspace-analytics.ts`) | **Pillar 1** (Ops — reporting and analytics) | None | No | None |
| Sync/offline (`sync.ts`, Dexie.js) | **Pillar 1** (Ops — offline-first field operations) | None | No | None |
| Entitlement gates (`plan-config.ts`, `PLAN_CONFIGS`) | **Infra** (pre-vertical platform infrastructure) | None | **YES** — conflated PlatformLayer enum with canonical pillar definitions | The entitlement system controls access to pillar features; it is not the pillar definition |
| SuperAgent capability routing (`packages/superagent/`) | **Cross-cutting AI** (serves Pillar 1+2+3) | None | **YES** — implied "pillar-specific" framing | SuperAgent is cross-cutting. Its capability gaps affect all 3 pillars equally. |
| HITL (`hitl-service.ts`) | **Cross-cutting AI governance** (applies to all AI operations across all pillars) | None | No — correctly identified as broken | None |
| Compliance filter (`compliance-filter.ts`) | **Cross-cutting AI governance** (pre-LLM gate for all pillars) | None | No — correctly identified as having only 7 verticals covered | None |
| Vertical registry (`packages/verticals/`, `vertical-ai-config.ts`) | **Pillar 3** (Marketplace — verticals are the taxonomy for the directory) + **Pillar 1** (ops module selection) | Cross-cutting AI | **YES** — used `primaryPillar` field from `vertical-ai-config.ts` as canonical classification | `primaryPillar` in `vertical-ai-config.ts` is an AI billing tag. Canonical vertical classification is in the `verticals` DB table `primary_pillars` column. |
| Public profiles (`packages/profiles/`) | **Pillar 3** (Marketplace — discoverable profiles) | None | No | None |
| Claims workflow (`packages/claims/`) | **Pillar 3** (Marketplace — claim-first onboarding) | None | No — not discussed in prior report | Claims are a critical Pillar 3 mechanism |
| Geography (`packages/geography/`) | **Pillar 3** (Marketplace — geography-powered search) + **Infra** | None | No — not discussed in prior report | Geography is foundational to Pillar 3 |
| Search indexing (`packages/search-indexing/`) | **Pillar 3** (Marketplace — faceted search) | None | No — not discussed in prior report | Core Pillar 3 infrastructure |

---

## Section 5 — Salvage Matrix

| Finding / Section | Still Valid As-Is | Valid, Needs Rewording | Invalid (Wrong Frame) | Needs Re-Verification | Disposition |
|-------------------|-------------------|----------------------|----------------------|----------------------|-------------|
| **F-001** No plan gate on `/pos/*` routes | ✅ YES | — | — | — | **KEEP** — code-proven, critical finding |
| **F-019** function_call non-functional | ✅ YES | — | — | — | **KEEP** — code-proven |
| **F-020** HITL review() fires no dispatch | ✅ YES | — | — | — | **KEEP** — code-proven |
| **GAP-E** 12+ capabilities declared, not registered | ✅ YES | — | — | — | **KEEP** — code-proven |
| **GAP-H** Compliance filter covers 7/159 verticals | ✅ YES | — | — | — | **KEEP** — code-proven |
| **GAP-C** HITL has no resume mechanism | ✅ YES | — | — | — | **KEEP** — code-proven |
| **GAP-G** Sync covers only 4 entity types | ✅ YES | — | — | — | **KEEP** — code-proven |
| Section G — Float ledger double-entry | ✅ YES | — | — | — | **KEEP** — code-proven |
| Section G — POS business 18 routes (inventory/sales/CRM) | ✅ YES | — | — | — | **KEEP** — code-proven |
| Section J — HITL dead-end loop architecture | ✅ YES | — | — | — | **KEEP** — code-proven |
| Section K — Capability registry 8 registered, 12+ missing | ✅ YES | — | — | — | **KEEP** — code-proven |
| Section L — Sync 4 entities, missing offerings/sales/POS | ✅ YES | — | — | — | **KEEP** — code-proven |
| Section M — Analytics snapshot + live fallback | ✅ YES | — | — | — | **KEEP** — code-proven |
| Section N — White-label depth cap logic | ✅ YES | — | — | — | **KEEP** — code-proven |
| Section A.3 — 159 verticals, 175 packages, 10 workers | ✅ YES | — | — | — | **KEEP** — code-proven |
| Section D.2 — 9-stage pipeline description | ✅ YES | — | — | — | **KEEP** — code-proven |
| Section B.4 — "POS = 8% of Pillar 1 scope" | — | ✅ NEEDS REWORDING | — | — | **REPHRASE** — the point is valid but Pillar 1 scope claim needs canonical backing, not just a percentage |
| Section C.1 — PlatformLayer enum as pillar definitions | — | — | ❌ INVALID | — | **DISCARD** — PlatformLayer is not canonical pillar definition |
| Section C.3 — "Pillar 2 Commerce + Brand" | — | ✅ NEEDS REWORDING | — | — | **RENAME** to "Pillar 2 Branding / Website / Portal" |
| Section C.4 — "Pillar 3 Transport + Logistics" | — | — | ❌ INVALID | — | **DISCARD AND REPLACE** — entirely wrong canonical definition |
| Section E — Pillar Distribution table (using primaryPillar from AI config) | — | — | ❌ INVALID | — | **DISCARD** — wrong evidence source for pillar classification |
| Section F.2 — Plan gate table row "Transport layer (Pillar 3): pro+" | — | — | ❌ INVALID | — | **DISCARD** — wrong pillar label |
| Section O.4 — SuperAgent roadmap "Phase 4: Pillar 3 route optimizer" | — | — | ❌ INVALID | — | **DISCARD** — route optimizer is cross-cutting AI for Pillar 1 transport, not Pillar 3 |
| Vertical sector map (Section E.1) | — | — | — | ✅ RE-VERIFY | **RE-VERIFY** — sector groupings of verticals are valid; the pillar-distribution column is invalid; keep sector map, discard pillar distribution column |
| Capability coverage matrix (Appendix B) | ✅ YES | — | — | — | **KEEP** — valid code-proven findings regardless of pillar framing |
| File evidence index (Appendix A) | ✅ YES | — | — | — | **KEEP** |

---

## Section 6 — Corrected Mental Model

**Authoring constraint:** This section does not inherit wording from the prior report. Every sentence is written fresh from canonical sources.

---

### 6.1 What WebWaka OS Is

`[DOCS-PROVEN]` Source: `docs/governance/3in1-platform-architecture.md` lines 18-19

WebWaka OS is a **single platform** for any individual or organization, sold via reseller partners and sub-partners, with white-labeling opportunities, offering **three primary, interconnected capabilities** that can be subscribed to individually or in any combination.

---

### 6.2 The Three Pillars

```
┌───────────────────────────────────────────────────────────────┐
│                      WebWaka Platform                          │
├──────────────────┬─────────────────────┬──────────────────────┤
│    Pillar 1      │      Pillar 2       │       Pillar 3        │
│  Operations-     │   Branding /        │  Listing / Multi-     │
│  Management      │   Website /         │  Vendor Marketplace   │
│  (POS)           │   Portal            │  (Public Directory)   │
├──────────────────┼─────────────────────┼──────────────────────┤
│ Inventory        │ Branded website     │ Seeded entity         │
│ POS / float      │ E-commerce store    │   directories         │
│ Orders           │ Booking portal      │ Claim-first           │
│ Staff/scheduling │ Campaign site       │   onboarding          │
│ Back-office docs │ White-label         │ Geography search      │
│ USSD operations  │   surfaces          │ Public profiles       │
│ Analytics        │                     │ Multi-vendor          │
│                  │                     │   marketplace         │
├──────────────────┼─────────────────────┼──────────────────────┤
│ `apps/api/`      │ `apps/             │ `apps/               │
│ `apps/ussd-      │  brand-runtime/`    │  public-discovery/`   │
│  gateway/`       │                     │ `apps/tenant-public/` │
└──────────────────┴─────────────────────┴──────────────────────┘
                            ↑ ↑ ↑
              SuperAgent AI — cross-cutting intelligence layer
                  (NOT a pillar; serves all three equally)
```

`[DOCS-PROVEN]` Source: `docs/governance/3in1-platform-architecture.md` Section 2

---

### 6.3 Plan Tiers and Pillar Access

`[CODE-PROVEN]` Source: `packages/entitlements/src/plan-config.ts`; `packages/types/src/enums.ts`

| Plan | Pillar 3 (Discovery) | Pillar 1 (Operational) | Pillar 2 (Commerce/brand) | AI (cross-cutting) |
|------|---------------------|----------------------|--------------------------|-------------------|
| free | ✅ | ❌ | ❌ | ❌ |
| starter | ✅ | ✅ | ❌ (branding rights = true, but PlatformLayer.Commerce not included) | ❌ |
| growth | ✅ | ✅ | ✅ | ✅ |
| pro | ✅ | ✅ (+ sector unlocks: Transport, Professional, Creator, Civic, Political) | ✅ | ✅ |
| enterprise | ✅ | ✅ (all layers) | ✅ | ✅ |
| partner | ✅ | ✅ (all layers) | ✅ | ✅ |
| sub_partner | ✅ | ✅ | ✅ | ✅ |

*Note: `starter` has `brandingRights: true` (can set logo/colours) but `PlatformLayer.Commerce` is not in its layers array — full branded storefront requires growth+.*

---

### 6.4 How Verticals Are Classified Across Pillars

`[DOCS-PROVEN]` Source: `docs/governance/3in1-platform-architecture.md` Section 5

Classification rules:
- **Every vertical** gets Pillar 1 (Ops) — minimum foundation
- **Add Pillar 3 (Marketplace)** when the vertical benefits from being discoverable in a public directory
- **Add Pillar 2 (Branding)** when the vertical benefits from a dedicated branded website or portal

Example classifications `[DOCS-PROVEN]`:
- `pos-business` → ops + branding
- `politician` → ops + marketplace + branding
- `motor-park` → ops + marketplace
- `market` → ops + marketplace
- `clinic` → ops + marketplace + branding
- `creator` → ops + branding + marketplace

**The `primaryPillar` field in `vertical-ai-config.ts` is NOT this classification.** It is an AI billing category tag for `ai_usage_events`. The canonical vertical pillar classification is in the `verticals` DB table's `primary_pillars` column and governed by the rules above. `[CODE-PROVEN]` + `[DOCS-PROVEN]`

---

### 6.5 SuperAgent's Correct Position

`[DOCS-PROVEN]` Source: `docs/governance/3in1-platform-architecture.md` lines 73-85

- SuperAgent is a cross-cutting intelligence service
- It enhances all three pillars — it is not "primarily" any one pillar
- It is NOT a product in its own right — it must be exposed through a pillar's UI surface
- All AI features must route through `packages/superagent` — never directly to an AI provider (P7)
- It is governed by `docs/governance/superagent/06-governance-rules.md`

**Current implementation state** `[CODE-PROVEN]`:
- `packages/superagent/src/superagent.ts` (route: 1010 lines) — 9-stage pipeline exists
- `packages/superagent/src/hitl-service.ts` — HITL queue exists; resume path does not
- `packages/superagent/src/vertical-ai-config.ts` — 159 vertical AI configs exist
- `packages/superagent/src/compliance-filter.ts` — covers 7/159 verticals only
- `CAPABILITY_REGISTER_MAP` — 8 of 20+ capabilities registered; function_call dispatch broken (F-019)

---

## Section 7 — Revised Priority Stack

Priorities have been rebuilt from the corrected architecture. Items retained from prior report are marked with their original finding ID.

### P0 — Platform integrity blockers (fix before any AI or vertical work)

| Priority | Finding | Correct Pillar Context | Evidence |
|----------|---------|----------------------|----------|
| P0-A | **F-001** No plan gate on `/pos/*` routes — free-tier float access | Pillar 1 (Ops) financial entitlement | `apps/api/src/routes/pos.ts` lines 72-305: no planGuard |
| P0-B | **F-019** `function_call` non-functional — all AI capability routing bypassed | Cross-cutting AI (affects all pillars) | `apps/api/src/routes/superagent.ts` Stage 7 |
| P0-C | **BUG-001** T3 breach in `guards.ts::requirePrimaryPhoneVerified` | Infra — affects all pillars | `packages/auth/src/guards.ts` line 61; Consolidated Master Report |

### P1 — High-impact capability and compliance gaps

| Priority | Finding | Correct Pillar Context | Evidence |
|----------|---------|----------------------|----------|
| P1-A | **F-020** HITL review() dead-end — no resume path | Cross-cutting AI governance | `packages/superagent/src/hitl-service.ts` |
| P1-B | **GAP-E** 12+ AI capabilities declared, 0 handlers wired | Cross-cutting AI (blocks Pillar 1+2 AI features) | `vertical-ai-config.ts` vs `CAPABILITY_REGISTER_MAP` |
| P1-C | **GAP-H** Compliance filter covers 7/159 verticals | Cross-cutting AI governance | `compliance-filter.ts` SENSITIVE_VERTICAL_MAP |
| P1-D | **BUG-004** JWT refresh — no opaque token, no rotation (Consolidated Master Report) | Infra | `apps/api/src/routes/auth-routes.ts` |

### P2 — Platform completeness

| Priority | Finding | Correct Pillar Context | Evidence |
|----------|---------|----------------------|----------|
| P2-A | **GAP-G** Sync covers 4 entities — offerings/sales/POS not syncable | Pillar 1 (Ops — offline-first) | `apps/api/src/routes/sync.ts` ALLOWED_ENTITIES |
| P2-B | Template marketplace Phase 2 (3rd-party templates) | Pillar 2 (Branding) | `template-resolver.ts` BUILT_IN_TEMPLATES has 1 entry |
| P2-C | `apps/public-discovery/` — Pillar 3 listing/search discovery | Pillar 3 (Marketplace) — needs verification of full feature set | `apps/public-discovery/src/` — structure confirmed, completeness unknown |

### Items from prior report's P0 that are NOW DEPRIORITIZED or REFRAMED

- Prior "Pillar 3 = Transport, fix route_optimizer" → **INVALID FRAME** — route_optimizer is a cross-cutting AI capability serving Pillar 1 transport-sector operations; it belongs in P1-B (capability registration gap), not as a Pillar 3 remediation
- Prior "Expand Pillar 3 transport verticals" → **REFRAME** — transport verticals need Pillar 1 (ops) + Pillar 3 (marketplace listing); this is vertical implementation work, not architecture remediation

---

## Section 8 — Safe Next Scope for Pillar 1 and SuperAgent/AI

### 8.1 Pillar 1 — Safe In-Scope Items

These items are correctly scoped to Pillar 1 (Operations-Management) and are code-evidenced. Implementation can proceed when the P0 architecture fixes (Section 7) are complete.

**Financial integrity:**
- F-001: Add plan gate to `/pos/*` routes (`apps/api/src/index.ts` — add planGuard before posRoutes mount)
- Analytics live fallback: Add payment method breakdown (currently hardcodes all revenue as transfer_kobo)

**Operational completeness:**
- Sync entity expansion: Add offerings, bank_transfer_orders to ALLOWED_ENTITIES in `sync.ts`
- POS VAT: Add 7.5% VAT calculation to POS cart (`apps/workspace-app/src/pages/POS.tsx`) — BUG-013 from Consolidated Master Report

**Compliance (Pillar 1 operations):**
- NDPR erasure batch transaction — COMP-002 from Consolidated Master Report
- CBN wallet daily reconciliation — BUG-037 from Consolidated Master Report

### 8.2 SuperAgent / AI Layer — Safe In-Scope Items

These items are correctly scoped to the cross-cutting AI layer. They serve all three pillars.

**Unblock the capability layer (P0-B, P1-A, P1-B):**
1. Fix F-019: Wire function_call dispatch in Stage 7 of pipeline (`packages/superagent/src/index.ts`)
2. Fix F-020: Implement HITL resume mechanism — add callbackUrl storage, dispatch in `review()`, polling endpoint
3. Register missing capabilities in priority order: `scheduling_assistant` (40+ verticals), `brand_copywriter` (15+), `product_description_writer` (10+), `policy_summarizer` (8+), `route_optimizer` (3)

**Governance (P1-C):**
4. Expand SENSITIVE_VERTICAL_MAP in `compliance-filter.ts` — add bureau-de-change, oil-gas-services, secondary-school, university, tax-consultant at minimum

**Note on `route_optimizer`:** Despite being in `vertical-ai-config.ts` for gas-distributor, logistics, and transit — this is a Pillar 1 operations capability (transport route optimization). It should be wired as a capability that reads Pillar 1 operational data (fleet, stops, schedules). It has nothing to do with Pillar 3 (marketplace/directory).

### 8.3 Items That Must NOT Be Implemented Until Architecture Frame Is Confirmed

- Any vertical described as "Pillar 3 transport vertical" — needs reframing as "Pillar 1 + Pillar 3 (marketplace listing)" before implementation
- Any SuperAgent feature described as serving "Pillar 3 logistics" — needs reframing as cross-cutting AI for Pillar 1 transport-sector ops
- The `primaryPillar` field in `vertical-ai-config.ts` must NOT be used as the canonical vertical classification for any implementation decision; use the `verticals` DB table `primary_pillars` column instead

---

## Section 9 — Explicit List of Claims Withdrawn from Prior Report

The following claims from `webwaka-os-corrected-architecture-reframing-report-2026-04-25.md` are formally withdrawn. They should not be cited in any implementation planning document.

| Withdrawn Claim | Location in Prior Report | Reason for Withdrawal |
|----------------|-------------------------|----------------------|
| "Pillar 3 — Transport + Logistics" as a canonical pillar definition | Section C.4 | Wrong canonical definition. Pillar 3 = Marketplace. |
| "Gate: pro plan and above" for Pillar 3 | Section C.4 | Pillar 3 (Discovery) is free tier. pro+ gates transport-sector features within Pillar 1. |
| "Core packages: @webwaka/verticals-transit, @webwaka/verticals-logistics" under Pillar 3 | Section C.4 | These serve Pillar 1 (ops). They have a Pillar 3 discovery listing but are not Pillar 3 packages. |
| "AI Layer [for Pillar 3]: route_optimizer, demand_forecasting, scheduling_assistant" | Section C.4 | route_optimizer and scheduling_assistant serve Pillar 1 (ops). They are cross-cutting AI capabilities. |
| "Pillar 3 (Transport/Logistics) — ~14 verticals: logistics, transit, warehouse, real-estate-agency, gas-distributor" | Section E, Pillar Distribution | Transport is not Pillar 3. The `primaryPillar: 3` in vertical-ai-config.ts is an AI billing tag, not canonical classification. |
| PlatformLayer enum values (Discovery/Operational/Commerce/Transport/Professional/Creator/WhiteLabel) presented as canonical pillar structure | Section C.1 | PlatformLayer is a plan entitlement system, not a 3-in-1 pillar definition. |
| Row "Transport layer (Pillar 3): pro+" in capability gate table | Section F.2 | PlatformLayer.Transport is a sector capability unlock within Pillar 1 ops. Not Pillar 3. |
| Section C title and content calling Pillar 2 "Commerce + Brand" | Section C.3 | Canonical name is "Branding / Website / Portal". Commerce is one sub-capability. |
| "Section D — SuperAgent Reframed: Agentic Orchestration Substrate" framed with implicit product primacy | Section D heading/framing | SuperAgent is cross-cutting infrastructure. It does not have "platform primacy" — it serves all 3 pillars. |
| Section O.4 SuperAgent roadmap "Phase 3: multi-step agents" framed as a pillar buildout | Section O.4 | SuperAgent improvements are capability-gap closures; they are not a pillar buildout. |
| "Pillar Distribution" table using `primaryPillar` values from `vertical-ai-config.ts` as canonical vertical classification | Section E.2 | `primaryPillar` in that file is an AI billing tag. Canonical vertical classification is in `verticals.primary_pillars` DB column. |

---

## Section 10 — Statements Confirmed Correct and Retained

The following findings from the prior report are confirmed correct against canonical sources and code evidence.

| Confirmed Finding | Source Type | Prior Report Section |
|------------------|-------------|---------------------|
| 159 canonical verticals, 3 deprecated aliases | CODE-PROVEN: `vertical-ai-config.ts` line 2753 | Section A.3, E.1 |
| F-001: No plan gate on `/pos/*` routes | CODE-PROVEN: `pos.ts` lines 72-305 | Section F.3 |
| F-019: function_call non-functional | CODE-PROVEN: pipeline Stage 7 | Section K.3 |
| F-020: HITL `review()` fires no dispatch | CODE-PROVEN: `hitl-service.ts` | Section J |
| HITL dead-end loop architecture description | CODE-PROVEN: `hitl-service.ts` | Section J.2 |
| 8 of 20+ capabilities registered | CODE-PROVEN: `CAPABILITY_REGISTER_MAP` | Section K |
| Compliance filter covers 7/159 verticals | CODE-PROVEN: `compliance-filter.ts` SENSITIVE_VERTICAL_MAP | Section I |
| `scheduling_assistant` declared in 40+ verticals, not registered | CODE-PROVEN: cross-reference of configs | Section K.2 |
| Float ledger double-entry mechanics | CODE-PROVEN: `float-ledger.ts` | Section G.1 |
| POS business system: 18 routes / inventory+sales+CRM | CODE-PROVEN: `pos-business.ts` 429 lines | Section G.3 |
| Sync covers only 4 entity types | CODE-PROVEN: `sync.ts` ALLOWED_ENTITIES | Section L |
| Analytics: snapshot + live fallback; live fallback missing payment breakdown | CODE-PROVEN: `workspace-analytics.ts` | Section M |
| White-label depth cap (`applyDepthCap`) at 0/1/2 | CODE-PROVEN: `branded-page.ts` lines 50-78 | Section N |
| Template marketplace Phase 1: 1 built-in template only | CODE-PROVEN: `template-resolver.ts` lines 109-111 | Section H.2 |
| Plan tiers: 7 tiers (free/starter/growth/pro/enterprise/partner/sub_partner) | CODE-PROVEN: `plan-config.ts` | Section F.1 |
| Pillar 2 runtime is `apps/brand-runtime/` | DOCS-PROVEN: `3in1-platform-architecture.md` line 51 | Section C.3 |
| Pillar 1 scope is universal — all 159 verticals | DOCS-PROVEN: `3in1-platform-architecture.md` line 34 | Section B |

---

*This document supersedes the architectural framing in `webwaka-os-corrected-architecture-reframing-report-2026-04-25.md`. The prior report's code-evidenced findings (F-001, F-019, F-020, GAP-C through GAP-H) remain valid and are fully retained in the Salvage Matrix above. The pillar definitions, pillar-to-component mapping, and vertical classification methodology in the prior report are replaced by this document.*

*Evidence labeling used throughout: `[CODE-PROVEN]` = direct file read with citation; `[DOCS-PROVEN]` = governance documentation; `[INFERRED]` = logical derivation, not directly stated.*
