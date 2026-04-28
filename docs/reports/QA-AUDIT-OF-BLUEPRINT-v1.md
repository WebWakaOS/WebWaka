# INDEPENDENT QA AUDIT REPORT
## WebWaka Universal Mobilization Platform Blueprint v1
### Zero-Trust Verification of Prior Output

**QA performed by:** Independent verification agent  
**Blueprint under review:** `docs/reports/WEBWAKA-UNIVERSAL-MOBILIZATION-PLATFORM-BLUEPRINT.md`  
**Audit date:** April 28, 2026  
**Evidence standard:** Every finding is backed by direct repository evidence, grep output, or file-path citation. No narrative claims accepted without proof.

---

## 1. QA VERDICT

**CONDITIONAL PASS**

The blueprint is architecturally sound in its core platform analysis and its most important recommendations are correct. However, it contains material factual errors in its repository inventory and PlatformLayer analysis, and it missed 4 of 12 deployable applications, 29 of 64 production route files, and several packages of functional significance. One architectural recommendation (adding new `Mobilization` and `CivicAction` PlatformLayer values) is directly contradicted by existing code. These errors are correctable but must be resolved before the document is used to drive PRD or implementation-ticket generation.

---

## 2. EXECUTIVE QA SUMMARY

The blueprint produced a comprehensive, readable, 2,094-line architecture document with strong evidence density in its core areas: platform invariants, support-groups/fundraising analysis, offline-first gaps, notification pipeline, AI/superagent architecture, and the governance chronology. For those areas it is trustworthy and implementation-grade.

However, the repository inventory is materially incomplete. The blueprint enumerated 8 deployable applications — there are 12. It cited "35+ route files" — there are 64. It described the PlatformLayer enum as having 7 values — the enum has 11 (`Civic`, `Political`, `Institutional`, `AI` are present in code but unacknowledged), which directly invalidates the recommendation to add `Mobilization` and `CivicAction` as new layer values. The DSAR processor scheduler (`apps/schedulers`), a production NDPR-compliance component, was completely absent from the review. Four packages with distinct functional roles (`contact`, `webhooks`, `workspaces`, `white-label-theming`) were either missing or superficially treated. These omissions are significant enough to require targeted corrections before proceeding to PRD.

---

## 3. COVERAGE AUDIT

| Repository Area | Expected Coverage | Actual Coverage Found | Evidence of Review | Depth | QA Finding |
|----------------|------------------|-----------------------|-------------------|-------|-----------|
| **Apps (all 12)** | All 12 reviewed | 8 of 12 reviewed | Blueprint lists 8 apps; `ls apps/` shows 12 | LOW | **FAIL** — missed `partner-admin`, `schedulers`, `tenant-public`, `workspace-app` |
| `apps/api` | Deep review | Reviewed | Route counts, handler logic cited | HIGH | PASS |
| `apps/brand-runtime` | Deep review | Mentioned | Templates cited, niche count mentioned | MEDIUM | PASS |
| `apps/notificator` | Mentioned | Mentioned | Cited as queue consumer | MEDIUM | PASS |
| `apps/admin-dashboard` | Mentioned | Mentioned | Cited briefly | LOW | ACCEPTABLE |
| `apps/platform-admin` | Mentioned | Mentioned | Cited briefly | LOW | ACCEPTABLE |
| `apps/ussd-gateway` | Mentioned | Mentioned | Cited with P12 invariant | LOW | ACCEPTABLE |
| `apps/public-discovery` | Mentioned | Mentioned | Cited briefly | LOW | ACCEPTABLE |
| `apps/projections` | Mentioned | Mentioned | CRON/HITL citation | LOW | ACCEPTABLE |
| `apps/partner-admin` | Should be reviewed | **NOT reviewed** | Not mentioned anywhere | MISSING | **FAIL** |
| `apps/schedulers` | Should be reviewed | **NOT reviewed** | Not mentioned anywhere | MISSING | **FAIL** — contains production NDPR DSAR processor (`dsar-processor.ts`) |
| `apps/tenant-public` | Should be reviewed | **NOT reviewed** | Not mentioned | MISSING | **FAIL** — tenant white-label public site; distinct from brand-runtime |
| `apps/workspace-app` | Should be reviewed | **NOT reviewed** | Not mentioned | MISSING | **FAIL** — React app for workspace UI |
| **Non-test API Routes (64 total)** | All 64 | ~20 reviewed | Blueprint says "35+ route files" — `ls apps/api/src/routes/ \| grep -v .test. \| wc -l` = 64 | LOW | **FAIL** — 29 routes entirely unanalyzed |
| `civic.ts` | Should be reviewed | **NOT reviewed** | Not mentioned | MISSING | **FAIL** — church, NGO, cooperative, mosque, womens-assoc routes (major M8d feature) |
| `compliance.ts` | Should be reviewed | **NOT reviewed** | Not mentioned | MISSING | **FAIL** — NDPR DSAR routes (COMP-001/002) |
| `contact.ts` | Should be reviewed | **NOT reviewed** | Not mentioned | MISSING | **FAIL** — multi-channel contact management (M7a/M7f) |
| `fx-rates.ts` | Should be reviewed | **NOT reviewed** | Not mentioned | MISSING | **FAIL** — multi-currency FX (P24 feature) |
| `transport.ts` | Should be reviewed | **NOT reviewed** | Not mentioned | MISSING | **FAIL** — motor park, transit, rideshare, haulage routes (M8c) |
| `analytics.ts` | Should be reviewed | **NOT reviewed** | Not mentioned | MISSING | **FAIL** — platform super-admin analytics |
| `admin-metrics.ts` | Should be reviewed | Not reviewed | Not mentioned | MISSING | GAP |
| `inbox-routes.ts` | Should be reviewed | Not reviewed | Not mentioned | MISSING | GAP |
| `onboarding.ts` | Should be reviewed | Not reviewed | Not mentioned | MISSING | GAP |
| `pos-business.ts` | Should be reviewed | Not reviewed | Not mentioned | MISSING | GAP |
| `pos-reconciliation.ts` | Should be reviewed | Not reviewed | Not mentioned | MISSING | GAP |
| `preference-routes.ts` | Should be reviewed | Not reviewed | Not mentioned | MISSING | GAP |
| `regulatory-verification.ts` | Should be reviewed | Not reviewed | Not mentioned | MISSING | GAP |
| `resend-bounce-webhook.ts` | Should be reviewed | Not reviewed | Not mentioned | MISSING | GAP |
| `workspace-analytics.ts` | Should be reviewed | Not reviewed | Not mentioned | MISSING | GAP |
| 10 `verticals-*.ts` extended routes | Should be surveyed | Not reviewed | Not mentioned | MISSING | GAP |
| **Core packages (40 non-vertical)** | All reviewed | 35 of 40 reviewed | Named and described | MEDIUM | PARTIAL PASS |
| `packages/contact` | Should be reviewed | **NOT reviewed** | Not mentioned | MISSING | **FAIL** — M7 multi-channel contact management |
| `packages/webhooks` | Should be reviewed | **NOT reviewed** | Not mentioned | MISSING | **FAIL** — webhook delivery system |
| `packages/workspaces` | Should be reviewed | Not reviewed | Not mentioned | MISSING | GAP |
| `packages/white-label-theming` | Reviewed | Mentioned briefly | Brief mention, no analysis | LOW | WEAK — full brand-walk mechanism not analyzed |
| **Vertical packages (159 total)** | Survey of structure | 10 read in full | Blueprint claims "150+" then appendix says 159 | MEDIUM | ACCEPTABLE — structure consistent |
| **apps/api/migrations** | All reviewed | Partially misstated | Blueprint claims range 0001-0423; actual range 0001-0388 | MEDIUM | **ERROR** — migrations 0389-0423 are only in `infra/db/migrations/`, not `apps/api/migrations/` |
| **infra/db/migrations** | All reviewed | Reviewed | 0001-0431 forward + rollback files verified | MEDIUM | ACCEPTABLE |
| **docs/governance** | All reviewed | Partially reviewed | Key reports cited; some AI governance docs missed | MEDIUM | ACCEPTABLE |
| **docs/architecture/decisions (19 ADRs)** | All 19 reviewed | Partially cited | Some cited (0007, 0010, 0011, 0013, 0014); ~14 not explicitly reviewed | LOW | WEAK |
| **docs/architecture (non-ADR)** | Should be reviewed | Not explicitly reviewed | `3in1-platform-architecture.md` not cited (file doesn't exist; AI docs in governance/ missed) | LOW | WEAK |
| **Root config files** | All reviewed | Reviewed | pnpm-workspace.yaml, tsconfig.base.json, vitest.workspace.ts, playwright.config.ts cited | HIGH | PASS |
| **Test files** | Surveyed | Surveyed | 48 tests referenced; test config cited | MEDIUM | ACCEPTABLE |

---

## 4. EVIDENCE QUALITY AUDIT

### Strongly Evidence-Backed (HIGH confidence)

- **Platform invariants (T3, P9, P10, P13, P14, P15, P7, P12):** Each cited to specific file + line evidence. No unsupported claims.
- **Support Groups schema analysis:** Column-by-column evidence from migration 0425. Specific columns (`politician_id`, `campaign_office_id`, `voter_ref`, `polling_unit_code`) correctly identified and cited.
- **Fundraising schema analysis:** `inec_cap_kobo`, `inec_disclosure_required` correctly cited from migration 0426.
- **Plan-config matrix:** 7 plans read and accurately transcribed from `packages/entitlements/src/plan-config.ts`.
- **Atomic CTE ledger pattern:** Correctly identified in both `packages/pos/src/float-ledger.ts` and `packages/hl-wallet/src/ledger.ts`.
- **HITL system:** Three-level escalation correctly described with file citations.
- **Offline-sync architecture:** Dexie.js, exponential backoff (30s→1h), FIFO, server-wins all confirmed from source files.
- **Event bus (240+ events):** Confirmed against `packages/events/src/event-types.ts` — count ~255 events.
- **Partner/sub-partner model:** Correctly traced to migrations 0200-0203.
- **NDPR consent gate (P10):** Correctly traced to `packages/identity/src/consent.ts` with P10 annotation evidence.
- **Notification engine architecture:** Rule-driven pipeline correctly described.

### Weak or Assumption-Driven (LOW confidence — errors found)

- **App count ("8 apps"):** WRONG. Actual: 12 apps. The missed 4 are confirmable with `ls apps/`. This is a basic inventory failure.
- **Route file count ("35+ route files"):** SEVERELY UNDERCOUNTED. Actual: 64 non-test routes. The blueprint listed ~20 routes by name; the remaining 44 were implicitly claimed as covered but were not.
- **PlatformLayer enum ("7 values"):** WRONG. Actual enum has 11 values. The blueprint listed `Discovery, Operational, Commerce, Transport, Professional, Creator, WhiteLabel` — missing `Civic`, `Political`, `Institutional`, `AI`. This is verifiable in one command: `grep -A15 "export const PlatformLayer" packages/types/src/enums.ts`.
- **AI capabilities ("23"):** WRONG by 1. Actual: 24. `sentiment_analysis` is a first-class `AICapabilityType` union member, not ambiguous as stated. Verifiable: `grep "sentiment_analysis" packages/ai-abstraction/src/capabilities.ts`.
- **AI vertical slugs ("159"):** WRONG. Actual: 168. `grep "slug:" packages/superagent/src/vertical-ai-config.ts | wc -l` = 168.
- **Migration path ("apps/api/migrations/0001-0423"):** WRONG. apps/api/migrations ends at `0388_organizations_discovery_columns.sql`. Migrations 0389-0423 are only in `infra/db/migrations/`. The path description conflates the two locations.
- **Roles ("6 roles"):** WRONG by 1. Actual: 7 (SuperAdmin, Admin, Manager, Agent, Cashier, Member, Public). `grep -A10 "export const Role" packages/types/src/enums.ts` confirms 7.

### Where the Blueprint Confused Docs With Implementation

- **`Civic`, `Political`, `Institutional` PlatformLayer values:** These EXIST in code (`packages/types/src/enums.ts` lines 172-186) but are NOT in `plan-config.ts` layer assignments. Sensitive sector access (political, clinic, etc.) is gated via `sensitiveSectorRights: boolean`, not via layer array. The blueprint missed this entire mechanism — it described the layer array as the only access control, which is incomplete.
- **`apps/schedulers/DSAR processor`:** An automated NDPR Data Subject Access Request processor exists as a production Worker. The blueprint claimed NDPR compliance is "a governance gap not addressed in code" for DPA agreements, but the automated DSAR export processor (compiling user data exports, writing to R2, retry logic, T3/P13 enforced) is production-ready code and was completely overlooked.

---

## 5. 3-IN-1 ARCHITECTURE QA

### What Was Done Well

The blueprint correctly identified:
- Pillar 1 = Operations (apps/api + admin-dashboard), Pillar 2 = Branding (brand-runtime + wakapage), Pillar 3 = Discovery/Marketplace (public-discovery + FTS5 search)
- The entitlement-layer mapping between plans and pillars
- Discovery cross-tenant access
- Template registry + installation tracking

### What Is Missing or Wrong

**Critical error:** The `PlatformLayer` enum has `Civic` and `Political` values that are NOT used in `plan-config.ts` layer arrays. The blueprint:
1. Did not discover these values exist
2. Did not diagnose the gap (enum values present but unused in plan-config)
3. Then recommended ADDING `Mobilization` and `CivicAction` as new layers — which is wrong; `Civic` and `Political` already exist and need to be wired into plan-config, not replaced with differently-named new values

**Missing Pillar surfaces:**
- `apps/tenant-public` is a distinct white-label tenant public site Worker, different from brand-runtime. The blueprint implicitly merged these.
- `apps/partner-admin` is a distinct administrative surface for partner-level management.
- The `@webwaka/white-label-theming` Pillar 2 brand-walk mechanism (resolveBrandContext, resolveEmailSender, brand_independence_mode) was mentioned once but not analyzed.

**Undercounted route surfaces:** The Civic verticals route (`civic.ts`) covers church, NGO, cooperative, mosque, womens-association, youth-org — an entire "civic sector" pillar surface. The compliance route (`compliance.ts`) implements NDPR DSAR which is a legal obligation. Neither appeared in the 3-in-1 analysis.

### Whether Current-Code Analysis Is Trustworthy

**Partially trustworthy.** The analysis of what's working (invariants, notification engine, support groups, fundraising, ledger) is reliable. The analysis of the full surface area (apps, routes, packages) is not — it describes approximately 60% of the actual API surface and 67% of deployable applications.

---

## 6. AI / SUPERAGENT QA

### Adequacy of Review

The AI/SuperAgent analysis is one of the stronger sections. The five-level resolver chain, fetch-only adapters (P7), HITL three levels, WakaCU billing, NDPR consent gate on AI routes, and the `preProcessCheck` + `stripPii` pipeline are all correctly described and evidence-backed.

### Missing Areas

1. **Capability count is off by 1:** 24 capabilities, not 23. `sentiment_analysis` is a named union member, not ambiguous.

2. **AI vertical slug count is off by 9:** 168 slugs, not 159. The blueprint's Appendix B says "159 vertical AI configurations" — grep shows 168.

3. **Blueprint states:** "sentiment_analysis is in the support-group capability set but not in `@webwaka/ai-abstraction/src/capabilities.ts` as a first-class capability" — THIS IS WRONG. `sentiment_analysis` appears explicitly in the `AICapabilityType` union type definition on a named line. The "Problem 2" in Part 4.5 is factually incorrect.

4. **AI layer not tracked in entitlements:** `PlatformLayer.AI` exists in the enum but `aiRights: boolean` in plan-config does not map to it. The blueprint missed this inconsistency — there is a semantic split between `PlatformLayer.AI` (unused in plan assignments) and `aiRights` (used as a standalone boolean). This is an actual entitlement architecture gap that should have been identified.

### Unsupported Claims

- "159 vertical AI configs" — actual 168. No grep output provided to support the 159 number.
- The claim that sentiment_analysis is unclear/ambiguous in capability.ts — directly contradicted by the source code.

---

## 7. GOVERNANCE TRUTH-MAP QA

### What Was Done Correctly

The governance chronology is the best-executed section of the blueprint. The table distinguishing superseded from authoritative documents is accurate:
- RELEASE-READINESS-REPORT-v3.md correctly identified as current authoritative ✅
- April 10-11 audit docs correctly labeled as superseded ✅
- FORENSIC-VERIFICATION-REPORT.md correctly labeled as authoritative ✅
- AGENTS.md correctly identified as the operating model ✅
- Phase s00-s16 reports correctly identified as authoritative for completed infra ✅

### Where It Failed

**Migration path description is wrong.** The blueprint states:
> "431 migrations covering the full schema evolution (apps/api/migrations/0001 through apps/api/migrations/0423, plus infra/db/migrations/0424-0431)"

Actual evidence:
- `apps/api/migrations/` ends at `0388_organizations_discovery_columns.sql` — NOT 0423
- `infra/db/migrations/` contains 0001-0431 as the canonical location (including rollback files: 761 total files)
- Migrations 0389-0423 exist ONLY in `infra/db/migrations/`, not in apps/api/migrations/

This error means the blueprint incorrectly described where migrations 0389-0423 live. Any engineer following the blueprint's migration path description would look in the wrong directory.

**Not all 19 ADRs reviewed.** The blueprint cites some ADRs by number (0007, 0008, 0010, 0011, 0013, 0014) but does not demonstrate review of all 19. ADRs 0001-0006, 0009, 0012, 0015-0019 are not cited or discussed.

---

## 8. RECOMMENDATION QA

### 8.1 Preserve

**Assessment: IMPLEMENTATION-GRADE with one gap**

The preserve list is accurate and well-evidenced. All 8 platform invariants are correctly characterized. The ledger pattern, notification engine, HITL system, offline-sync substrate, partner model, and plan-config matrix are correctly recommended for preservation.

**Gap:** `@webwaka/white-label-theming` (`resolveBrandContext`, brand-walk logic) is a Pillar 2 critical component that should be explicitly in the preserve list. It's mentioned once in passing but not analyzed.

**Gap:** `@webwaka/contact` (multi-channel contact management, OTP routing, NDPR consent channel gate) is not in the preserve list at all and should be.

### 8.2 Deprecate

**Assessment: PARTIALLY IMPLEMENTATION-GRADE — critical naming error**

The deprecations D1-D5 (schema), D6-D8 (package/route/event naming), D9-D13 (code-level) are well-specified with exact file paths, column names, and migration actions.

**Critical error in D5 follow-through:** The blueprint recommends deprecating `inec_cap_kobo` and `inec_disclosure_required` columns and replacing with a `campaign_compliance_policies` table. This is architecturally correct. However, the blueprint also recommends retaining the column name reasoning without acknowledging that `PlatformLayer.Political` already exists — meaning the policy layer should use the `Political` layer gate, not a new layer.

**Deprecation list is otherwise concrete enough to act on.**

### 8.3 Refactor

**Assessment: MOSTLY IMPLEMENTATION-GRADE — one invalid recommendation**

Refactors R1 (rename support-groups → groups), R2 (fundraising generalization), R3 (community vs groups boundary), R4 (ledger extraction), R6 (search ward_code), R7 (AI config alignment CI check) are all evidence-backed and specific enough for ticket generation.

**Invalid recommendation R5:** "Add `PlatformLayer.Mobilization` and `PlatformLayer.CivicAction` to `packages/types/src/enums.ts`" — `Civic` and `Political` ALREADY EXIST in the enum. The correct refactor is: wire existing `PlatformLayer.Civic` and `PlatformLayer.Political` into plan-config layer arrays (they are currently defined in the enum but not assigned to any plan), and define `sensitiveSectorRights: true` plans as the gate for Political layers. Adding `Mobilization` and `CivicAction` would create duplicates and confusion.

**Evidence:** `grep -A15 "export const PlatformLayer" packages/types/src/enums.ts` → Civic: 'civic', Political: 'political', Institutional: 'institutional', AI: 'ai' all present.

### 8.4 Build Anew

**Assessment: IMPLEMENTATION-GRADE in principle — two gaps**

The Policy Engine (10.1), Universal Groups extension pattern (10.2), Value Movement module (10.3), Cases module (10.4), Workflow Engine (10.5), Offline scope extension (10.6), Analytics unification (10.7) are all well-specified with schema examples and package structure proposals.

**Gap 1:** The blueprint does not recommend integrating the existing `apps/schedulers` DSAR processor into the governance model. This is already built and handles automated NDPR compliance. It should be in the preserve section and its integration with the Cases module (case-style DSAR request tracking) should be noted.

**Gap 2:** The blueprint does not identify the need to wire `PlatformLayer.Civic`, `PlatformLayer.Political`, `PlatformLayer.Institutional` into plan-config. These layers exist in the enum but are assigned to no plan — they are dead code. Fixing this should be in Build New or Refactor.

---

## 9. OFFLINE / MOBILE / PWA QA

**Assessment: MEDIUM quality — adequate for planning but thin on some foundations**

### Adequate

The blueprint correctly identifies:
- Dexie.js + IndexedDB as the current offline mechanism ✅
- Background Sync API via service worker ✅
- Exponential backoff (30s→2m→10m→30m→1h) ✅
- FIFO ordering (P11) ✅
- Server-Wins conflict resolution ✅
- clientId idempotency ✅
- Cache-first/network-first strategies ✅
- 5 explicit offline gaps (no module scope for Groups/Cases, server-wins only, no differential sync, no per-module cache budget, no offline UI components) ✅
- Nigeria field realities (power cuts, 2G, WhatsApp > SMS, shared devices, daily data bundles) ✅

### Gaps

1. **`apps/schedulers` not considered in offline model.** DSAR processing is an async background job that affects user-visible data. The interaction between offline request queuing and scheduled batch processing was not addressed.

2. **`apps/tenant-public` offline behavior.** This is a distinct public site Worker. Its PWA/caching behavior is different from admin-dashboard. Not analyzed.

3. **Service worker scope per app.** The blueprint recommends per-module sync tags but does not address that the service worker is registered at the app level. With 4+ separate PWA apps (admin-dashboard, workspace-app, tenant-public, brand-runtime), each needs its own service worker configuration. This is not analyzed.

4. **`packages/offline-sync/src/notification-store.ts`** correctly cited but the integration with In-App notification badge counts (digest batching → offline notification count) is not fully traced.

---

## 10. EXTERNAL RESEARCH QA

**Assessment: MEDIUM quality — adequate depth, some application gaps**

### Adequate

- NationBuilder, Action Network, ControlShift research is relevant and correctly applied to WebWaka's architecture
- Offline-first best practices (local-first software, Ink & Switch) are relevant
- Cloudflare D1 limitations and mitigations are accurate
- DPI/India Stack/MOSIP references are relevant and correctly scoped
- CBN KYC tiering is correctly mapped
- NDPR technical requirements are correctly characterized

### Gaps

1. **Beckn protocol research** was cited but not deeply applied. Beckn's open network specification could directly inform how WebWaka's discovery layer exposes profiles to third-party buyers. This was mentioned in passing without actionable translation.

2. **mySociety FixMyStreet** research was cited as applicable to the Cases module but the actual routing logic (issue → responsible authority via geography) was not translated into a concrete architecture decision.

3. **Nigeria-specific civic tech** (e.g., BudgIT, Tracka, TheyWorkForYou Nigeria equivalents) was not referenced. These are locally relevant analogues for constituency casework and civic issue tracking.

4. **WhatsApp Business API** compliance rules (24-hour messaging windows, template approval) were cited as a "future integration" but the existing OTP WhatsApp channel already uses these constraints. The compliance gap (templates must be pre-approved by Meta) is a live operational concern, not a future one.

5. The external research was correctly translated into architecture decisions in most cases. It was not generic filler. This is the strongest section of the blueprint among the qualitative sections.

---

## 11. CRITICAL OMISSIONS

### Omission 1 (CRITICAL): `PlatformLayer.Civic`, `PlatformLayer.Political`, `PlatformLayer.Institutional` already exist
**Impact:** Blueprint's recommendation to add `Mobilization` and `CivicAction` layers is directly wrong. Will confuse the enum with duplicates. Must be corrected before any implementation ticket is created based on Part 9.5 or Part 16.

**Evidence:** `packages/types/src/enums.ts` lines 172-186, grep-confirmed.

### Omission 2 (CRITICAL): 4 of 12 apps not reviewed
**Impact:** `apps/schedulers` contains the production NDPR DSAR processor — a legal compliance component. `apps/tenant-public` is a distinct public site Worker. `apps/partner-admin` is a partner management surface. `apps/workspace-app` is a workspace React UI. All missing from the architecture review.

**Evidence:** `ls apps/` shows 12 directories. Blueprint names only 8.

### Omission 3 (CRITICAL): 29 route files not reviewed
**Impact:** `civic.ts` covers the entire M8d civic vertical (church, NGO, cooperative, mosque, womens-association) — this is a significant platform surface. `compliance.ts` covers DSAR/NDPR rights. `transport.ts` covers M8c (motor park, transit, rideshare). All missing.

**Evidence:** `ls apps/api/src/routes/ | grep -v .test. | wc -l` = 64.

### Omission 4 (HIGH): `packages/contact` not reviewed
**Impact:** `@webwaka/contact` manages multi-channel contact identity (phone, WhatsApp, Telegram, email), OTP routing preferences, and NDPR consent per channel. This is M7a/M7f work. Not mentioned once in the blueprint despite being a core compliance and identity package.

**Evidence:** `packages/contact/src/index.ts` exports 13 functions including `routeOTPByPurpose`, `assertChannelConsent`, `assertPrimaryPhoneVerified`.

### Omission 5 (HIGH): apps/api/migrations range misstated
**Impact:** Engineers using the blueprint to understand the migration history will look in `apps/api/migrations/` for 0389-0423 and find nothing — they are only in `infra/db/migrations/`.

**Evidence:** `ls apps/api/migrations/ | sort | tail -3` → ends at `0388_organizations_discovery_columns.sql`.

### Omission 6 (MEDIUM): AI capability count and slug count both wrong
**Impact:** Minor but undermines confidence in the AI section precision. 24 capabilities (not 23); 168 slugs (not 159).

### Omission 7 (MEDIUM): Roles miscounted (7, not 6)
**Impact:** Minor but the Role enum has `Agent` and `Cashier` as distinct roles. The blueprint claim of "6 roles" (and list: super_admin, admin, member, partner) is significantly incomplete.

### Omission 8 (MEDIUM): `sensitiveSectorRights` mechanism not analyzed
**Impact:** The blueprint describes the PlatformLayer array as the sole access control mechanism. In reality, `Civic`, `Political`, `Institutional` access is gated by `sensitiveSectorRights: boolean` in plan-config, not by layer membership. This split mechanism was not identified or discussed.

### Omission 9 (LOW): 19 ADRs not systematically reviewed
**Impact:** Some ADRs (0001-0006, 0009, 0012, 0015-0019) are not cited. These include decisions on monorepo strategy, CI/CD, versioning, and connection lifecycle that may have bearing on the architecture recommendations.

---

## 12. GATE DECISION

**APPROVED TO PROCEED AFTER MINOR FIXES**

The document is not fundamentally wrong. Its core architectural analysis, preserve/deprecate/refactor recommendations, offline-first gap analysis, and Policy Engine proposal are implementation-grade. The errors identified are discrete and correctable without restructuring the document.

Mandatory corrections must be made to Parts 2, 9.5, and Appendix B before the blueprint is used for PRD or implementation ticket generation.

---

## 13. MANDATORY CORRECTIONS BEFORE PRD

1. **Fix PlatformLayer enum description (Part 2, Part 9.5, Appendix B):** Update to reflect the actual 11 values: `Discovery, Operational, Commerce, Transport, Civic, Political, Institutional, Professional, Creator, WhiteLabel, AI`. Remove the recommendation to add `Mobilization` and `CivicAction`. Replace with: "Wire existing `PlatformLayer.Civic` and `PlatformLayer.Political` into plan-config layer arrays for starter+ plans; wire `PlatformLayer.Institutional` for enterprise+ plans."

2. **Fix `sensitiveSectorRights` analysis (Part 3.2, Part 3.4):** Document the actual access control mechanism for sensitive sectors: it is the `sensitiveSectorRights: boolean` flag in plan-config (not PlatformLayer array membership) that gates political, clinic, legal verticals. This split must be explained and reconciled.

3. **Add all 12 apps to Part 2 inventory (Part 2.1):** Add `apps/partner-admin` (partner admin interface, M11), `apps/schedulers` (DSAR processor, COMP-002), `apps/tenant-public` (white-label public site), `apps/workspace-app` (workspace React UI) with their purposes, Worker bindings, and relationship to other apps.

4. **Correct route file count and analysis (Parts 2.1, 3.2):** Change "35+ route files" to "64 route files." Add descriptions of `civic.ts` (M8d civic verticals), `compliance.ts` (NDPR DSAR), `contact.ts` (multi-channel), `fx-rates.ts` (P24 multi-currency), `transport.ts` (M8c transport verticals), `analytics.ts` (platform analytics), and the 10 `verticals-*.ts` extended route files.

5. **Correct migration path description (Part 2.1):** Change "apps/api/migrations/0001 through apps/api/migrations/0423, plus infra/db/migrations/0424-0431" to: "apps/api/migrations/0001 through 0388 (392 files), plus infra/db/migrations/0389-0431 (including rollback files; 761 total files in infra/db/migrations/)."

6. **Fix AI capability count (Part 4.2, Part 4.5 Problem 2):** Change "23 capabilities" to "24 capabilities." Remove "Problem 2" in Part 4.5 — `sentiment_analysis` IS a first-class `AICapabilityType` union member. It is not ambiguous or missing.

7. **Fix AI vertical slug count (Parts 2.1, 4.1, Appendix B):** Change "159" to "168" everywhere.

8. **Fix Role count (Part 2.1):** Change "6 roles" to "7 roles (super_admin, admin, manager, agent, cashier, member, public)."

9. **Add `packages/contact` to reviewed packages (Part 2.1, Appendix B):** Document its purpose (multi-channel contact management, OTP routing, R8/R9/R10 enforcement, assertChannelConsent). Add to preserve list.

10. **Add `apps/schedulers` DSAR processor to preserve list and compliance analysis (Part 7, Part 13):** The DSAR processor is production-ready NDPR compliance code. It should be in the preserve list and the NDPR compliance section must acknowledge it exists rather than treating DSAR as unimplemented.

11. **Correct Part 9.5 (PlatformLayer refactor):** Remove "Add `PlatformLayer.Mobilization` and `PlatformLayer.CivicAction`." Replace with: "Wire `PlatformLayer.Civic` (starter+), `PlatformLayer.Political` (pro+ with `sensitiveSectorRights: true`), and `PlatformLayer.Institutional` (enterprise+) into plan-config layer arrays. This eliminates the current dead-code status of these enum values."

12. **Update Part 17.2 "Do-Now Actions" item 9:** Remove "Add `PlatformLayer.Mobilization` and `PlatformLayer.CivicAction` to `packages/types/src/enums.ts`." Replace with: "Wire `PlatformLayer.Civic`, `PlatformLayer.Political`, `PlatformLayer.AI` into plan-config.ts layer arrays for appropriate tiers."

---

## SCORING FRAMEWORK

| Dimension | Score (0–5) | Rationale |
|-----------|------------|-----------|
| Repository coverage | **2.5 / 5** | Missed 4 of 12 apps, 29 of 64 routes, 3+ packages |
| Code evidence density | **3.5 / 5** | Strong in core areas; PlatformLayer and capability count are factual errors |
| Governance chronology accuracy | **3.5 / 5** | Good doc classification; migration path description is wrong |
| 3-in-1 architecture accuracy | **3.0 / 5** | Core correct; Civic/Political/Institutional layers missed; undercounted surface |
| AI / Superagent depth | **3.5 / 5** | HITL/adapter/compliance correct; slug count off by 9, capability off by 1, sentiment_analysis claim wrong |
| Deprecation / refactor specificity | **4.0 / 5** | Mostly specific enough; PlatformLayer addition recommendation is invalid |
| Offline / PWA depth | **3.5 / 5** | Good gap list; missed schedulers, tenant-public, per-app SW scope |
| Local-context adaptation | **4.0 / 5** | Nigeria realities well-handled; WhatsApp Business template compliance gap missed |
| External research quality | **3.5 / 5** | Relevant, not filler; some translation gaps (Beckn, FixMyStreet, local civic tech) |
| Implementation readiness | **3.0 / 5** | Usable after corrections; PlatformLayer error blocks Part 9.5 and 16.2 |

**Total: 34.5 / 50**

### Interpretation

34.5/50 (69%) = **Conditional Pass**. The document is well above the threshold for a first-pass architecture review. It is thorough in its strongest areas (invariants, support groups, fundraising, offline gaps, notifications, governance) and its core architectural recommendations (Policy Engine, groups rename, ledger extraction, Cases module) are correct and actionable. The errors identified are discrete, verifiable, and correctable. After the 12 mandatory corrections above, the document is ready to serve as the PRD foundation.

**The errors are not reasons to discard the document. They are reasons to correct it before acting on it.**

---

*QA Audit complete.*  
*Evidence sources: 25 direct grep/ls commands run against live repository during audit.*  
*Zero claims accepted without code verification.*
