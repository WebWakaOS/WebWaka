# Artifact 06 — Phase Program Plan
## WebWaka OS: Master Refactor + Strategic Enhancement Program (Phase 0 → Phase 5)

**Status:** AUTHORITATIVE — Phase 0 Deep Discovery output  
**Date:** 2026-05-02  
**Governing document:** `docs/reports/WEBWAKA-UNIVERSAL-MOBILIZATION-PLATFORM-PRD.md`  
**Authority:** Synthesized from PRD + Blueprint + all Phase completion reports + Discovery findings  
**Principle:** Build once, use infinitely (P1). No new feature without architectural integrity.

---

## Program Overview

```
PHASE 0: Deep Discovery and Platform Understanding    ← CURRENT (completing now)
    └── PHASE 1: Pre-Launch Refactor and Foundation  ← NEXT
          └── PHASE 2: Vertical Completion Sprint    
                └── PHASE 3: Expansion and Growth   
                      └── PHASE 4: Partner and Scale 
                            └── PHASE 5: GA and Beyond
```

---

## PHASE 0 — Deep Discovery and Platform Understanding
**Status:** ✅ COMPLETE (this session)  
**Duration:** Completed  
**Deliverables:**

| Artifact | File | Status |
|---|---|---|
| Platform Truth Map | `docs/phase0-artifacts/01-platform-truth-map.md` | ✅ DONE |
| Architecture Dependency Map | `docs/phase0-artifacts/02-architecture-dependency-map.md` | ✅ DONE |
| Invariants and Constraints Register | `docs/phase0-artifacts/03-invariants-and-constraints-register.md` | ✅ DONE |
| Risk and Debt Register | `docs/phase0-artifacts/04-risk-and-debt-register.md` | ✅ DONE |
| Vertical and Niche Universe Map | `docs/phase0-artifacts/05-vertical-and-niche-universe-map.md` | ✅ DONE |
| Phase Program Plan (this file) | `docs/phase0-artifacts/06-phase-program-plan.md` | ✅ DONE |
| Implementation Readiness Checklist | `docs/phase0-artifacts/07-implementation-readiness-checklist.md` | ✅ DONE |

---

## PHASE 1 — Pre-Launch Refactor and Foundation Hardening
**Status:** NEXT TO EXECUTE  
**Duration:** 3–5 weeks  
**Gate:** All P0/P1 items resolved; TypeScript clean; lint clean; notification engine live on staging  
**Priority:** HIGHEST — all items here must be done before any external API consumer onboards

### 1.1 — Critical Blockers (Must Resolve First)

| Task | Description | Effort | Owner |
|---|---|---|---|
| P1-001 | **Rotate Cloudflare API token** (URGENT — public commit exposure) | 1h | Founder/Ops |
| P1-002 | **Provision NOTIFICATION_KV** (UI-002) — `wrangler kv namespace create NOTIFICATION_KV` for staging + production | 1h | Ops |
| P1-003 | **Align notificator D1 ID** (UI-001) — update `apps/notificator/wrangler.toml` staging D1 to `52719457-5d5b-4f36-9a13-c90195ec78d2` | 30m | Ops |
| P1-004 | **Activate notification pipeline** (UI-003) — `NOTIFICATION_PIPELINE_ENABLED="1"` in staging CF secrets | 30m | Ops |
| P1-005 | **Fix apps/api ESLint errors** (LINT-001) — typed JSON helper + eslint-disable comments | 2h | Engineering |
| P1-006 | **Provision SMOKE_API_KEY** GitHub secret for staging smoke tests | 1h | Ops |
| P1-007 | **Rotate all secrets** (90-day rotation now due for most) — JWT, PAYSTACK, PREMBLY, TERMII, WHATSAPP | 2h | Ops |

### 1.2 — Naming and Scope Debt (DEBT-001, PRD Class 1)

| Task | Description | Effort |
|---|---|---|
| P1-010 | **Verify group rename migrations applied** — confirm migrations 0432-0437 ran on staging D1; verify all `support_groups_*` table references renamed to `groups_*` | 1h |
| P1-011 | **Deprecate `@webwaka/support-groups`** — mark as deprecated alias in package.json, ensure all consumers use `@webwaka/groups` | 2h |
| P1-012 | **Rename API route** from `/support-groups/*` to `/groups/*` with backward-compatible redirect | 2h |
| P1-013 | **Update event types** — confirm `GroupEventType` is canonical; `SupportGroupEventType` is deprecated alias | 1h |
| P1-014 | **Rename GOTV-specific schema columns** — `support_group_gotv_records` column names generalized (voter_ref → member_ref, polling_unit_code → unit_code) in new migration | 3h |

### 1.3 — Policy Engine Integration (DEBT-002, PRD Class 2)

| Task | Description | Effort |
|---|---|---|
| P1-020 | **Migrate INEC cap** from hardcoded `INEC_DEFAULT_CAP_KOBO` to policy engine `policy_rules` row | 2h |
| P1-021 | **Rename fundraising schema fields** — `inec_cap_kobo` → `contribution_cap_kobo`, `inec_disclosure_required` → `disclosure_required` | 2h + migration |
| P1-022 | **Wire `checkContributionCap()`** using `policy-engine.evaluate('contribution_cap', context)` | 2h |
| P1-023 | **Add CBN daily limit rules** to `policy_rules` table (seed migration) | 1h |

### 1.4 — Type and Enum Cleanup (DEBT-003, PRD Class 3)

| Task | Description | Effort |
|---|---|---|
| P1-030 | **Audit PlatformLayer enum** — map all 11 values to their actual plan-config usage; document which 4 are "dead" | 1h |
| P1-031 | **Resolve dead enum values** — either add to plan `layers[]` arrays or move to `VerticalLayer` enum | 3h |

### 1.5 — Dual-Path Routing (DEBT-005)

| Task | Description | Effort |
|---|---|---|
| P1-040 | **Fix or remove engineFeatureFlagMiddleware** — current implementation is a no-op pass-through | 2h |
| P1-041 | **Document vertical engine path status** — is it production-ready? What parity testing exists? | 1h |

### 1.6 — Security Hardening

| Task | Description | Effort |
|---|---|---|
| P1-050 | **Patch Dependabot vulnerabilities** (3 moderate) | 2h |
| P1-051 | **Add NOTIFICATION_KV binding** to all Workers that need provider credentials | 1h |
| P1-052 | **Verify all T3 patches** from sprint-4 are in production | 1h |

### Phase 1 Exit Gate

- [ ] CF API token rotated and verified
- [ ] Notification engine live on staging (UI-001/002/003 resolved, 48h observation window complete)
- [ ] apps/api ESLint: 0 errors
- [ ] SMOKE_API_KEY provisioned; smoke tests passing
- [ ] All support-groups → groups renames verified applied
- [ ] INEC cap migrated to policy engine
- [ ] PlatformLayer dead values resolved
- [ ] Dependabot vulnerabilities patched

---

## PHASE 2 — P3 Niche Completion Sprint
**Status:** PLANNED  
**Duration:** 4–6 weeks  
**Gate:** Phase 1 complete; platform stable on staging  
**Goal:** Complete all 70 remaining P3 niches (Pillar 2 templates + Pillar 3 discovery templates)

### 2.1 — Activate P3 Niche Queue

**Current position:** `mosque` (VN-CIV-004) — next to build

**Protocol per niche (each niche ≈ 1–2 days):**
1. Read niche from P3 queue (`docs/templates/pillar3-template-queue.md`)
2. Research brief — Nigeria market, key features, regulatory gates
3. Create `WebsiteTemplateContract` in `apps/brand-runtime/src/templates/niches/{slug}/`
4. Register in `BUILT_IN_TEMPLATES` Map
5. Create Pillar 3 discovery template / listing page
6. Add `template_registry` seed row (migration)
7. Update P3 registry JSON to `SHIPPED` status
8. Update execution board

**Sprint batches (10 niches each):**
- Batch 1: mosque, youth-organization, womens-association, okada-keke, dental-clinic, chw-network, ferry, campaign-office, lga-office, polling-unit-rep
- Batch 2: professional-association, airport-shuttle, container-depot, veterinary-clinic, orphanage, startup, sports-club, book-club, market-association, cargo-truck
- Batch 3–7: Remaining 50 P3 niches in queue order

### 2.2 — i18n Gap Resolution (DEBT-004)

| Task | Description | Effort |
|---|---|---|
| P2-i18n-001 | **Fill 136 missing keys** in ha locale | 2 days |
| P2-i18n-002 | **Fill 136 missing keys** in ig locale | 2 days |
| P2-i18n-003 | **Fill 136 missing keys** in yo locale | 2 days |
| P2-i18n-004 | **Fill 136 missing keys** in pcm locale | 2 days |
| P2-i18n-005 | **Fill 100 missing keys** in fr locale | 1 day |
| P2-i18n-006 | **Add new module keys** (cases, groups, fundraising, policy-engine messages) to all locales | 1 day |
| P2-i18n-007 | **Reach 90%+ coverage** on all Nigeria-native locales (PRD UX-15) | Ongoing |

### 2.3 — Seeding Sprint (Outstanding Data)

| Task | Description |
|---|---|
| P2-SEED-001 | INEC 2023 HoA candidates SQL (DEBT-010) — 8,971 records, JSON extracted |
| P2-SEED-002 | State assembly priority states (DEBT-011) — Lagos done; Kano, Rivers, Ogun, Oyo next |
| P2-SEED-003 | LGA chairpersons priority states (DEBT-012) — Lagos, Kano, Rivers first |
| P2-SEED-004 | Mosque profiles seed (for mosque niche discovery density) |

### Phase 2 Exit Gate

- [ ] All 70 P3 niches have Pillar 2 brand-runtime templates (SHIPPED status)
- [ ] All 70 P3 niches have Pillar 3 discovery templates
- [ ] i18n: ha/ig/yo/pcm ≥ 90% coverage
- [ ] INEC 2023 HoA candidates seeded
- [ ] Priority state assemblies seeded

---

## PHASE 3 — Expansion Candidates Activation
**Status:** PLANNED  
**Duration:** 4–6 weeks  
**Gate:** Phase 2 complete  
**Goal:** Activate Sprint 1 expansion candidates (11 new niches, no compliance blocker)

### 3.1 — Sprint 1 Expansion Niches (11 niches)

For each: add to CSV, assign VN-ID, create vertical package, create AI config, create P2+P3 templates, wire API routes

| Priority | Slug | Proposed VN-ID | Family |
|---|---|---|---|
| 1 | `software-agency` | VN-PRO-009 | NF-TEC-AGY (anchor) |
| 2 | `elearning-platform` | VN-EDU-011 | NF-EDU-DIG (anchor) |
| 3 | `digital-marketing-agency` | VN-PRO-013 | NF-TEC-AGY (variant) |
| 4 | `electronics-store` | VN-COM-001 | NF-COM-RET (anchor) |
| 5 | `coworking-space` | VN-PRP-001 | NF-PRP-SVC (anchor) |
| 6 | `recruitment-agency` | VN-PRO-011 | NF-PRO-HR (anchor) |
| 7 | `cybersecurity-firm` | VN-TEC-001 | NF-TEC-SEC (anchor) |
| 8 | `exam-prep-centre` | VN-EDU-010 | NF-EDU-SCH (variant) |
| 9 | `management-consulting` | VN-PRO-012 | NF-PRO-ADV (anchor) |
| 10 | `data-analytics-firm` | VN-TEC-002 | NF-TEC-AGY (variant) |
| 11 | `tech-academy` | VN-EDU-013 | NF-EDU-DIG (variant) |

### 3.2 — Compliance-Gated Expansion Niches (pending verification infra)

| Slug | Gate | Blocking Requirement |
|---|---|---|
| `hospital` | MDCN verification | Manual verification workflow or MDCN API integration |
| `university` | NUC approval | NUC verification workflow |
| `diagnostic-lab` | MLSCN licensing | MLSCN API or manual gate |
| `microfinance-bank` | CBN license | CBN API or manual license check |

### 3.3 — Multi-Country Architecture Research (P3 Invariant)

| Task | Description |
|---|---|
| P3-MC-001 | Research `country_id` abstraction layer design |
| P3-MC-002 | Research multi-currency (NGN → GHS, KES, ZAR) support path |
| P3-MC-003 | Research payment provider abstraction (beyond Paystack) |
| P3-MC-004 | Research regulatory body abstraction (CBN→BoG/CMA) |
| P3-MC-005 | Produce Africa expansion architecture ADR |

### Phase 3 Exit Gate

- [ ] All 11 Sprint 1 expansion niches activated and in production
- [ ] Compliance-gated niches have verification infrastructure or explicit deferral decision
- [ ] Africa expansion architecture ADR approved

---

## PHASE 4 — Partner Model Completion + Scale Features
**Status:** PLANNED  
**Duration:** 6–8 weeks  
**Gate:** Phase 3 complete  
**Goal:** Complete partner revenue model; scale infrastructure

### 4.1 — Partner Model Phase 3 (DEBT-006)

| Task | Description |
|---|---|
| P4-PTR-001 | Partner billing system — WakaCU wholesale pricing for partners |
| P4-PTR-002 | Revenue share engine — partner commission splits |
| P4-PTR-003 | White-label depth control per subscription tier |
| P4-PTR-004 | Partner invoice generation and billing history |

### 4.2 — Partner Model Phase 4 (DEBT-006)

| Task | Description |
|---|---|
| P4-PTR-010 | Partner analytics dashboard |
| P4-PTR-011 | Partner-level audit logs (beyond current partner_audit_log) |
| P4-PTR-012 | Partner→sub-partner cascading entitlements |
| P4-PTR-013 | Downstream entity manager role |

### 4.3 — Performance and Scale

| Task | Description |
|---|---|
| P4-PERF-001 | Axiom log drain activation (ADR-0045) — verify Logpush → Axiom pipeline |
| P4-PERF-002 | D1 multi-region (ADR-0044) — activate when CF rolls out African replicas |
| P4-PERF-003 | CDN cache headers on static PWA assets |
| P4-PERF-004 | k6 load test at 2x expected traffic |
| P4-PERF-005 | Image pipeline optimization (thumbnail <100KB target) |

### 4.4 — AI / SuperAgent Phase 2

| Task | Description |
|---|---|
| P4-AI-001 | AgentLoop stream — multi-turn conversational AI sessions |
| P4-AI-002 | Background AI jobs (async tool execution) |
| P4-AI-003 | Partner pool AI credit allocation (PartnerPoolService) |
| P4-AI-004 | Per-vertical AI capability expansion (Sprint 2 verticals) |

### Phase 4 Exit Gate

- [ ] Partner billing model live (revenue share working)
- [ ] Partner analytics dashboard deployed
- [ ] Axiom log drain operational
- [ ] Load test passes at 2x expected volume
- [ ] All AI HITL queues operational and monitored

---

## PHASE 5 — General Availability and Beyond
**Status:** PLANNED  
**Duration:** Ongoing  
**Gate:** Phase 4 complete; external audit; production DNS cutover confirmed

### 5.1 — Pre-GA Checklist

| Task | Description |
|---|---|
| P5-GA-001 | External NDPR compliance audit |
| P5-GA-002 | CBN sandbox submission and approval |
| P5-GA-003 | INEC compliance review for political fundraising module |
| P5-GA-004 | CAC registration for NGO/cooperative tenants verified |
| P5-GA-005 | Security penetration test (third-party) |
| P5-GA-006 | Production DNS cutover (api.webwaka.com → CF Worker) |
| P5-GA-007 | Merge staging → main; trigger production deploy |
| P5-GA-008 | 48-hour staging observation window post-notification-engine activation |
| P5-GA-009 | Public launch announcement |

### 5.2 — Post-GA Roadmap

| Track | Items |
|---|---|
| Africa Expansion | Ghana (GHS + GRA + BoG), Kenya (KES + CBK), South Africa (ZAR + SARB) |
| Sprint 2 Expansion | hospital, university, diagnostic-lab, microfinance-bank (after compliance infra) |
| Sprint 3+ Expansion | Remaining 30+ expansion candidates |
| Platform Capabilities | E2EE DMs (ADR-0043 — if user privacy requirements escalate), WebRTC, video, live events |
| Mobile Apps | iOS + Android via PWA wrapper or React Native |
| Partner Network | Sub-partner program public launch, partner marketplace |
| API Ecosystem | Public API docs, developer portal, API key management for third parties |

---

## Dependency Graph

```
Phase 0 (DONE)
    │
    ▼
Phase 1 (Critical path — all items blocking)
    ├── 1.1 Security blockers (P1-001 to P1-007)
    ├── 1.2 Naming debt (P1-010 to P1-014)
    ├── 1.3 Policy engine integration (P1-020 to P1-023)
    ├── 1.4 Type cleanup (P1-030 to P1-031)
    └── 1.5 Routing cleanup (P1-040 to P1-041)
         │
         ▼
Phase 2 (Long sprint — can parallelize per niche)
    ├── P3 niche completion (70 niches, 7 batches)
    ├── i18n gap resolution (parallel with niches)
    └── Seeding sprint (parallel with niches)
         │
         ▼
Phase 3 (Expansion)
    ├── Sprint 1 niches (11, can parallelize)
    └── Multi-country research (can parallelize with niches)
         │
         ▼
Phase 4 (Scale)
    ├── Partner revenue model
    ├── Performance/scale infra
    └── AI Phase 2
         │
         ▼
Phase 5 (GA)
    ├── External audits
    ├── DNS cutover
    └── Public launch
```

---

## Milestone-to-Phase Mapping

| PRD Milestone | Phase | Key Deliverable |
|---|---|---|
| M8b | Done | Politician + POS Business verticals |
| M8c | Done | Transport verticals |
| M8d | Done | Civic verticals (church, NGO, cooperative) |
| M8e | Done | Health, education, agricultural, market, professional verticals |
| M9 | Done | Support Groups + Fundraising engine |
| M10 | Done | Policy Engine + Cases + Workflows + Offline Phase 1 |
| M11 | Done | Partner model Phase 1+2, notification engine |
| M12 | Done | Universal module generalization (dues, mutual aid, analytics) |
| M13 | Done | Offline/PWA hardening (Phase 3) |
| **Phase 1** | **Next** | **Pre-launch refactor (naming, policy, lint, security)** |
| Phase 2 | Q3 2026 | P3 niche completion (70 niches) |
| Phase 3 | Q3-Q4 2026 | 11 Sprint 1 expansion niches |
| Phase 4 | Q4 2026 | Partner revenue + scale |
| Phase 5 | Q1 2027 | GA + Africa expansion |
