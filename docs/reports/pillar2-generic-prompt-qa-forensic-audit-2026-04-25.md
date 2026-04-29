# WebWaka OS — Generic Pillar 2 Prompt: QA Forensic Audit

**Report type:** Comprehensive forensic audit — production readiness verification  
**Subject:** `docs/templates/pillar2-generic-implementation-prompt.md` v1.0.0  
**Date:** 2026-04-25  
**Auditor:** Replit QA Forensic Agent  
**Method:** Line-by-line prompt read → cross-check against 14 governance/schema/code sources → 6 simulation runs  
**Status:** PARTIAL-FIXED (defects found and remediated; v1.0.1 produced)

---

## EXECUTIVE VERDICT

| | |
|---|---|
| **Status** | PARTIAL-FIXED → v1.0.1 produced and pushed |
| **Defects found** | 8 (1 CRITICAL, 5 MEDIUM, 2 LOW) |
| **Defects remediated** | 8 / 8 |
| **Safe for agent handoff** | YES — after v1.0.1 corrections |

---

## Forensic Evidence Base

The following 14 sources were read or queried before each audit finding was classified:

| Source | Type | Key fact confirmed |
|---|---|---|
| `docs/templates/pillar2-generic-implementation-prompt.md` | Subject | Full 1,212-line read |
| `docs/governance/vertical-niche-master-map.md` | Authoritative | 157/39 families/44 standalone confirmed |
| `docs/templates/pillar2-niche-registry.json` | Authoritative | 46 entries; restaurant entry fully read |
| `docs/templates/pillar2-niche-registry.schema.md` | Schema | `africaFirstNotes`, `blockers`, `dependencies` all REQUIRED |
| `docs/templates/pillar2-template-agent-handoff.md` | Workflow | 9-step; Step 1 reads registry + queue |
| `docs/templates/pillar2-template-status-codes.md` | Status codes | 14 valid statuses confirmed |
| `docs/templates/pillar2-template-queue.md` | Queue | CURRENT = P2-restaurant-general-eatery; Owner: — |
| `docs/reports/pillar2-forensics-report-2026-04-24.md` | Runtime truth | Two disconnected systems confirmed |
| `docs/reports/pillar2-niche-identity-system-2026-04-25.md` | Design authority | System design confirmed |
| `webwaka-os-architecture-correction-and-validation-2026-04-25.md` | Arch corrections | File confirmed at repo ROOT (not `docs/reports/`) |
| Registry: restaurant entry | JSON data | `blockers: []`, `dependencies: ["packages/verticals-restaurant"]` |
| Registry: all 46 entries | JSON data | 6 niches with blockers; 45 of 46 with dependencies |
| `packages/verticals-restaurant/` | Code | Directory exists: `package.json`, `src/`, `tsconfig.json` |
| `infra/db/seeds/0004_verticals-master.csv` | CSV | Locked at commit 68eae9a3; status field confirmed |

---

## DETAILED AUDIT TABLE — Requirements A through I

### A. CONTEXT RE-ANCHORING

| Requirement | Status | Evidence Quote | Notes |
|---|---|---|---|
| Forces reading canonical pillar docs first | ✅ PASS | S3.1: `docs/governance/3in1-platform-architecture.md` — "Canonical pillar definitions; Pillar 2 scope and architecture" | Present and mandatory |
| Forces reading corrected architecture validation docs | ⚠️ CRITICAL | S3.1 line 119: `webwaka-os-architecture-correction-and-validation-2026-04-25.md` — **no path prefix**, while all 4 adjacent rows use `docs/reports/` prefix | File is at repo ROOT, not `docs/reports/`. Agents following the table pattern would prepend `docs/reports/` and get file-not-found. Fixed in v1.0.1. |
| Forces reading Pillar 2 forensics findings | ✅ PASS | S3.1 line 116: `docs/reports/pillar2-forensics-report-2026-04-24.md` — "all 49 forensic findings" | Correct path; mandatory |
| Forces reading niche identity/tracking files | ✅ PASS | S3.3 lists all 6 tracking files with correct paths and purpose statements | Complete |
| Forces reading authoritative master map | ✅ PASS | S3.2 line 126: "**THE single authoritative source** — all 157 active verticals" | Emphasised correctly |
| Forces understanding runtime truth before code | ✅ PASS | S3.4 lists all runtime code files; S7.1 repeats mandate to read before any new file creation | Dual enforcement |

**Section A verdict: PASS with 1 CRITICAL fix applied.**

---

### B. CORRECT TARGET SELECTION

| Requirement | Status | Evidence Quote | Notes |
|---|---|---|---|
| Uses queue/registry/board for next niche | ✅ PASS | S4.2a: "Read the CURRENT niche block at the top of pillar2-template-queue.md" | Queue is primary source |
| Verifies Pillar 2 eligibility | ✅ PASS | S4.3: `[ ] pillar2Eligible = true` | Explicit check |
| Checks not already completed | ✅ PASS | S4.3: `[ ] No entry in Completed table in pillar2-template-queue.md` | Queue + registry cross-check |
| Handles CURRENT vs explicit override | ✅ PASS | S4.1 covers override; S4.2 covers queue path; mutually exclusive | Correct branching |
| Resolves family anchor/variant order | ✅ PASS | S4.1j: "if a family niche (variant), the anchor is already IMPLEMENTED or SHIPPED" S4.2f: "If the CURRENT niche is a family variant... Defer this niche" | Both paths covered |
| Checks blockers[] before claiming | ❌ MEDIUM | S4.3 checklist has no `blockers[]` check. 6 of 46 niches have active blockers. Agent would claim and research a blocked niche. | Fixed in v1.0.1: blockers and dependencies now checked in S4.3 |
| Checks dependencies[] before claiming | ❌ MEDIUM | S4.3 checklist has no `dependencies[]` check. 45 of 46 niches have package dependencies. | Fixed in v1.0.1: dependency existence check added |

**Section B verdict: PASS with 2 MEDIUM fixes applied.**

---

### C. RESEARCH FIRST

| Requirement | Status | Evidence Quote | Notes |
|---|---|---|---|
| Launches multiple parallel research threads | ✅ PASS | S5 preamble: "You must launch at minimum 4 parallel research threads" | Minimum quantified |
| Covers Nigeria market context | ✅ PASS | Thread A: "Market size, growth, SME penetration... Top 5-10 Nigerian examples" | Specific and grounded |
| Covers African context where relevant | ⚠️ MEDIUM | Thread C: "What makes this template feel genuinely Nigerian, not generically African or western?" — Africa-beyond-Nigeria context has no dedicated capture mechanism | `africaFirstNotes` is a REQUIRED registry field (schema line 46). Research brief template (S6.1) has 9 sections but none maps to this field. Fixed in v1.0.1: Section 10 added to research brief template. |
| Covers design/customer/trust/regulatory expectations | ✅ PASS | Thread B: design patterns; Thread C: trust signals; Thread E: regulatory depth | Three separate threads; regulatory covered |
| Thread E: regulatory required where applicable | ❌ LOW | Thread E labelled `[OPTIONAL]` — 19 of 46 queued niches are in categories (health, financial, education, civic, transport) where Thread E is practically mandatory | Fixed in v1.0.1: label changed to "Required for health/legal/financial/education/agriculture/energy/transport" |
| Converts research to structured synthesis brief | ✅ PASS | S6.1: "You must synthesise your research into a structured brief before writing any code" | Enforced with commit gate |

**Section C verdict: PASS with 2 fixes applied (1 MEDIUM, 1 LOW).**

---

### D. SYNTHESIS

| Requirement | Status | Evidence Quote | Notes |
|---|---|---|---|
| Synthesises repo + research + registry + family status | ✅ PASS | S6.2 requires anchor/variant decision from master map; S7.1 requires reading existing code before writing | Multi-source synthesis enforced |
| Creates implementation brief before code | ✅ PASS | S6.3: "COMMIT research brief + registry update before proceeding to implementation" | Hard commit gate |
| No coding until synthesis complete | ✅ PASS | S6.3: "COMMIT... before proceeding" | Explicit ordering |
| Africa-First synthesis captured | ❌ MEDIUM | S6.1 research brief template has no Africa-First section. `africaFirstNotes` is REQUIRED by schema. | Fixed in v1.0.1 as part of Section C fix |
| Nigeria-First content fields review at completion | ❌ MEDIUM | S11.1 completion update shows only status/tracking fields. 7 content fields (`audienceSummary`, `businessContextSummary`, `contentLocalizationNotes`, `imageArtDirectionNotes`, `regulatoryOrTrustNotes`, `africaFirstNotes`, `nigeriaFirstPriority`) pre-seeded but need research-based validation/revision | Fixed in v1.0.1: S11.1 now instructs review and revision of pre-seeded content fields |

**Section D verdict: PASS with 2 MEDIUM fixes applied.**

---

### E. IMPLEMENTATION SAFETY

| Requirement | Status | Evidence Quote | Notes |
|---|---|---|---|
| Respects current template architecture | ✅ PASS | S2.3: full two-system explanation; S7.4: BUILT_IN_TEMPLATES registration required | Architecture truth foregrounded |
| Respects white-label/theme rules | ✅ PASS | S8.6: "Always use var(--ww-primary)..."; S3.5 lists `white-label-policy.md` as mandatory read | CSS custom properties enforced; policy file listed |
| Respects governance invariants | ✅ PASS | S3.5 lists `platform-invariants.md`; research brief template S9 checks T3/T4/T5/P7/P10 | Double enforcement (read + checklist) |
| No invalid runtime/marketplace assumptions | ✅ PASS | S2.2.8: "The runtime bridge does not exist yet"; S9.1: "NEVER assume the runtime bridge exists" | Both stated in disambiguation rules AND safety rules |
| Handles family inheritance correctly | ✅ PASS | S6.2: anchor vs variant decision; S9.4: family order safety rules; S10.5: family QA checklist | Three-layer enforcement |

**Section E verdict: FULL PASS — no fixes required.**

---

### F. NIGERIA-FIRST / AFRICA-FIRST

| Requirement | Status | Evidence Quote | Notes |
|---|---|---|---|
| Explicit Nigeria-first audience assumptions | ✅ PASS | S8 entire section (8 subsections); S2.2.1: "Nigeria-first multi-tenant SaaS platform" | Comprehensive; grounded examples given |
| Mobile-first/low-bandwidth realities | ✅ PASS | S8.7: "Minimum layout width: 375px... No external font CDN requests... No external script requests" | Three explicit performance constraints |
| Local business norms/examples | ✅ PASS | S8.1: bad/good examples; S8.2: LGA-level city specificity; S8.3: NGN pricing | Concrete, not abstract |
| Culturally grounded visuals/content | ✅ PASS | S8.6: "All image direction must specify Nigerian/African subjects" with specific example | Mandatory, not advisory |
| Africa-First dimension explicitly captured | ❌ MEDIUM | Section 8 heading says "Nigeria-First / Africa-First" but body rules are almost entirely Nigeria-specific. No Africa-First specific rule set. Research brief template had no Africa-First section. | Fixed in v1.0.1: Africa-First Notes added to research brief; Section 8 introductory text clarified |

**Section F verdict: PASS with 1 MEDIUM fix applied.**

---

### G. COMPLETION AND TRACKING

| Requirement | Status | Evidence Quote | Notes |
|---|---|---|---|
| Updates registry status/owner fields | ✅ PASS | S11.1 shows full JSON update block with all status/tracking fields | Explicit field-by-field instructions |
| Syncs queue/board/registry | ✅ PASS | S11.1 (registry), S11.2 (board), S11.3 (queue) — all three files explicitly updated | Atomic update enforced by section |
| Claim step updates queue owner | ❌ MEDIUM | S4.4 updates registry and board, NOT the queue's CURRENT block `Owner` field. Queue shows `Owner: —` throughout the session, creating a narrow race window for concurrent agents. | Fixed in v1.0.1: S4.4 now also updates queue CURRENT block owner |
| Logs blockers/follow-ups | ✅ PASS | S11.1: "log them in blockers[]"; S12 report includes "Blockers Discovered" section | Both tracking and reporting |
| Recommends next niche | ✅ PASS | S12 "Next Niche Recommendation" section is required in session report; S13 final item: "Next niche recommendation made with family-dependency check confirmed" | Enforced at completion |
| No silent completion | ✅ PASS | S12 structured session report required; S13 20-item checklist all must be green | Two-layer completion enforcement |

**Section G verdict: PASS with 1 MEDIUM fix applied.**

---

### H. REUSE DISCIPLINE

| Requirement | Status | Evidence Quote | Notes |
|---|---|---|---|
| No alternative tracking formats | ✅ PASS | S9.2: "NEVER create a new tracking format, status vocabulary, or registry structure" | Explicit prohibition |
| No renamed status vocabularies | ✅ PASS | Appendix B lists all valid statuses from `pillar2-template-status-codes.md` | Agent can compare at any point |
| No per-agent identity scheme imposed | ✅ PASS | S4.4: example format given but not mandated as the only format | Flexible within existing convention |
| Honors 157-active authoritative model | ✅ PASS | S2.1 table: "Active verticals: 157" explicitly locked | Cannot be overridden |
| Explicitly forbids old 46-item assumptions | ✅ PASS | S2.2 rule 5: "The old 46-item registry is fully superseded by the 157-item canonical-niche-registry.md" | Direct prohibition with source named |

**Section H verdict: FULL PASS — no fixes required.**

---

### I. DISAMBIGUATION RULES

| Requirement | Status | Evidence Quote | Notes |
|---|---|---|---|
| Vertical = niche same entity | ✅ PASS | S2.2 rule 1: "Every vertical IS a niche. 'Niche' is the identity dimension; 'vertical' is the implementation dimension." | Clear unambiguous statement |
| Standalone = deliberate not incomplete | ✅ PASS | S2.2 rule 2: "A standalone niche has its own self-contained package... It is not unclassified." | Both the positive (what it is) and negative (what it isn't) stated |
| Family = shared package baseline | ✅ PASS | S2.2 rule 3: "'Family' means shared package baseline." | Concise and correct |
| Anchor built first | ✅ PASS | S2.2 rule 3: "The anchor is the first-built member, not the most important" + enforcement in S4.1j, S4.2f, S9.4 | Four-layer enforcement |
| Deprecated slugs excluded from active count | ✅ PASS | S2.2 rule 4: names all 3 deprecated (`gym-fitness`, `petrol-station`, `nurtw`); "Any figure of 158+ actives is stale" | Specific enough to catch hallucination |
| Master map wins conflicts | ✅ PASS | S2.2 rule 9: "If any stale file conflicts with vertical-niche-master-map.md, the master map is correct" | Unambiguous priority rule |

**Section I verdict: FULL PASS — no fixes required.**

---

## SIMULATION RESULTS

| Test Case | Expected | Actual Behavior (v1.0.0) | v1.0.0 Pass? | Fixed in v1.0.1? |
|---|---|---|---|---|
| 1. CURRENT niche blocked | Detect blockers[], HALT | No blockers check in S4.3 — agent claims and researches blocked niche | ❌ FAIL | ✅ YES — S4.3 now checks blockers[] |
| 2. Family variant before anchor not IMPLEMENTED | Defer to next eligible niche | S4.2f defers; S4.1j halts on override | ✅ PASS | N/A |
| 3. Explicit override niche assigned | Validate 10 conditions before proceeding | S4.1a-j cover all 10 conditions | ✅ PASS | N/A |
| 4. Deprecated niche assigned as explicit override | Reject and report | S4.1d-e check CSV `status=planned` | ✅ PASS | N/A |
| 5. Queue/registry tracking inconsistency | Detect inconsistency, HALT | S4.2c cross-checks registry; S4.3 cross-checks completed table | ✅ PASS | N/A |
| 6. restaurant-general-eatery happy path | Full flow with correct file paths, Nigeria-first research, 4 threads, TypeScript check, 3-file update | Follows correctly. All checks pass. `packages/verticals-restaurant` exists. Research brief path correct. BUILT_IN_TEMPLATES registration instructed. | ✅ PASS | Africa-First section now required in brief |

---

## DEFECT REGISTER

| ID | Severity | Section | Finding | Fix Applied |
|---|---|---|---|---|
| D-01 | CRITICAL | S3.1 | `webwaka-os-architecture-correction-and-validation-2026-04-25.md` referenced without path prefix. File is at repo root, not `docs/reports/`. Agents may append wrong prefix and fail to find the file. | Added explicit note: "(repo root)" |
| D-02 | MEDIUM | S6.1 | Research brief template has no Africa-First Notes section. `africaFirstNotes` is a REQUIRED registry field. 19 of 46 niches have meaningful Africa context. No mechanism to capture or validate this field from research. | Added Section 10 "Africa-First Context" to research brief template |
| D-03 | MEDIUM | S11.1 | Completion update shows only status/tracking fields. 7 Nigeria-First content fields pre-seeded in registry but may need revision from research. Prompt provides no instruction to review them at completion. | Added explicit instruction to review and revise content fields in S11.1 |
| D-04 | MEDIUM | S4.3 | Eligibility checklist does not check `blockers[]` or `dependencies[]`. 6 niches have active blockers; 45 have package dependencies. Agent can claim and research a blocked or dependency-unmet niche. | Added `blockers[]` and `dependencies[]` checks to S4.3 eligibility checklist |
| D-05 | MEDIUM | S4.4 | Claim step updates registry and board but NOT the queue CURRENT block `Owner` field. Creates narrow race window where concurrent agent reads queue and sees `Owner: —`. | Added queue CURRENT block owner update to S4.4 |
| D-06 | MEDIUM | S5 | Thread E labelled `[OPTIONAL]`. 19 of 46 queued niches are in regulatory categories (health, financial, education, civic, transport). Thread E practically mandatory for these — "optional" label may lead to its omission on safety-critical templates. | Relabelled to "REQUIRED for health/legal/financial/education/agriculture/energy/transport" |
| D-07 | LOW | S11.1 | `templateVariantCount: 1` hardcoded. Correct for first implementation. But when a variant is completed, the anchor's `templateVariantCount` should also increment. Prompt is silent on this cross-update. | Added note on variant completion anchor count update |
| D-08 | LOW | S4.3 | File existence check says HALT if template file already exists but doesn't say what to do (inspect and resume, or treat as error). An abandoned partial implementation would permanently halt all agents. | Added explicit guidance: inspect partial file, check abandonedstatus before halting |

---

## RECOMMENDED ACTION

**PASS with fixes.** The generic prompt is architecturally sound. All disambiguation rules, family ordering, two-system architecture explanation, Nigeria-First rules, completion tracking, and simulation cases pass. Eight targeted defects were found and remediated in v1.0.1.

**v1.0.1 is production-ready for agent handoff.**

---

## FINAL GO / NO-GO

**GO** — `docs/templates/pillar2-generic-implementation-prompt.md` v1.0.1 is safe for infinite niche-by-niche execution by production agents, subject to the 8 fixes applied in v1.0.1 (one CRITICAL, five MEDIUM, two LOW — all remediated).

*Audit version: 1.0 — 2026-04-25*
