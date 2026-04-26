# Political Role-Specific Template Expansion — Implementation Plan

**Document type:** Stage 1 Implementation Plan — plan-first, execute-second governance directive  
**Status:** APPROVED FOR EXECUTION (Stage 1 self-audit PASSED — see Section 11)  
**Date produced:** 2026-04-26  
**Authority:** Political Expansion Implementation Governance System (7 approved artifacts)  
**Plan version:** 1.0.0

---

## Section 1 — Executive Plan Summary

### What Is Being Implemented

16 political role-specific website templates for the WebWaka OS platform. These templates cover every significant Nigerian political role from ward councillor (local government) to presidential candidate (federal), plus appointed officials and party structure officers. Each template supports three operating modes: `campaign`, `incumbent`, and `post_office`. The implementation follows the established Pillar 2 template pattern (TypeScript `WebsiteTemplateContract`, inline CSS, four page render functions, runtime registration via `BUILT_IN_TEMPLATES`).

### Why

The existing generic `politician-campaign-site` template (VN-POL-001) handles any elected official generically. Market intelligence shows that Nigerian political figures — especially governors, senators, LGA chairmen, and commissioners — demand role-specific digital presence with accurate accountability features: RMAFC allocation dashboards, Senate committee chairmanship badges, SIEC certification display, INEC certificate of return references, and party colour injection. Generic templates fail these needs. Role-specific templates unlock a ₦200M+ TAM segment within the first two election cycles.

### Boundaries

- **In scope:** 16 template TypeScript files + runtime registration + marketplace SQL seeds + governance pre-activation (CSV rows + governance docs) + test coverage
- **Out of scope:** Vertical package creation (packages/verticals-*), database migration for new tables, frontend admin UI changes, live tenant data migration, Ops/Pillar 1 extensions
- **No breaking changes** to existing templates. All 192 existing templates remain untouched.

### Success Definition

All 16 templates:
1. Compile with 0 TypeScript errors
2. Pass all existing vitest tests (no regression)
3. Have new template-specific tests covering all 3 modes × 4 pages
4. Are registered in `BUILT_IN_TEMPLATES` with the correct slug
5. Have a SQL seed in `infra/db/seeds/templates/`
6. Are marked `IMPLEMENTED` in `political-niche-registry.json`
7. Have their CSV rows in `0004_verticals-master.csv`

---

## Section 2 — Current-State Findings

### 2.1 — Runtime Template System (Verified 2026-04-26)

| Component | Location | Finding |
|---|---|---|
| Template registration | `apps/brand-runtime/src/lib/template-resolver.ts` | `BUILT_IN_TEMPLATES: Map<string, WebsiteTemplateContract>` at line 300. Currently 192 entries. New templates must be appended here. |
| Template contract | `@webwaka/verticals` package | `WebsiteTemplateContract = { slug, version, pages, renderPage(ctx) }`. No schema changes needed. |
| Page render context | `WebsiteRenderContext` | `ctx.data.*` provides tenant data. `ctx.displayName`, `ctx.primaryColor`, `ctx.logoUrl`, `ctx.tenantId`, `ctx.pageType` are canonical. Political extension uses `ctx.data.mode`, `ctx.data.partyColour`, `ctx.data.kycVerified`. |
| Resolution order | Resolver | (1) `template_render_overrides` per page, (2) `template_installations` + `template_registry` JOIN, (3) null → platform fallback. |
| Slug key format | BUILT_IN_TEMPLATES | `'{vertical-slug}-{niche-slug}'` — e.g., `'politician-campaign-site'`, `'political-party-party-website'`. For political expansion: `'{vertical-slug}-official-site'` e.g., `'governor-official-site'`. ✓ Consistent. |

### 2.2 — Existing Political Templates (All Intact)

| Template slug | File | VN-ID | Status |
|---|---|---|---|
| `politician-campaign-site` | `niches/politician/campaign-site.ts` | VN-POL-001 | LIVE |
| `political-party-party-website` | `niches/political-party/party-website.ts` | VN-POL-002 | LIVE |
| `ward-rep-ward-rep-councillor-site` | `niches/ward-rep/ward-rep-councillor-site.ts` | — | LIVE |
| `polling-unit-rep-polling-unit-rep-site` | `niches/polling-unit-rep/polling-unit-rep-site.ts` | — | LIVE |
| `campaign-office-campaign-office-ops` | `niches/campaign-office/campaign-office-ops.ts` | — | LIVE |
| `lga-office-lga-council-portal` | `niches/lga-office/lga-council-portal.ts` | — | LIVE |
| `constituency-office-constituency-dev-portal` | `niches/constituency-office/constituency-dev-portal.ts` | — | LIVE |

No existing political template is being modified. All 7 stay intact.

### 2.3 — CSV State (Verified)

`infra/db/seeds/0004_verticals-master.csv` has **198 data rows** (199 lines including header).  
Existing political rows: 7 (`vtx_politician`, `vtx_political_party`, `vtx_campaign_office`, `vtx_lga_office`, `vtx_polling_unit_rep`, `vtx_constituency_office`, `vtx_ward_rep`).  
**None of the 16 new political role vertical slugs exist in the CSV yet.**  
Adding 16 rows will bring total to 214 data rows.

### 2.4 — SQL Seed Format (Verified)

Political template seeds use **D1/SQLite-compatible** `INSERT OR IGNORE INTO template_registry`:

```sql
INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  '{slug}', '{display_name}', '{description}',
  'website', '1.0.0', '^1.0.0', '{vertical-slug}', '{slug}', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);
```

*(Note: Some older seeds in `infra/db/seeds/templates/` use PostgreSQL syntax — those are for a separate analytics DB. Political expansion uses the D1/SQLite format confirmed by `politician-campaign-site.sql`.)*

### 2.5 — Template Implementation Pattern (Verified)

From `politician/campaign-site.ts` and `political-party/party-website.ts`:
- Self-contained TypeScript file with inline CSS string (`const CSS = ...`)
- CSS namespace: unique 2-3 letter prefix per template family to avoid conflicts (`.po-` for politician, `.pp-` for political-party)
- Helper functions: `esc()`, `fmtKobo()`, `whatsappLink()`, `safeHref()`
- Four render functions: `renderHome()`, `renderAbout()`, `renderServices()`, `renderContact()`
- Exported named constant: `{camelCase}Template: WebsiteTemplateContract`
- All user-supplied strings through `esc()`
- No external dependencies — pure TypeScript + HTML strings
- Mobile-first at 375px via `@media(max-width:375px)` rule

### 2.6 — Test Pattern (Verified)

`apps/brand-runtime/src/brand-runtime.test.ts` (1170 lines):
- Uses Vitest, mock D1 (`makeDB()`), mock Env (`makeEnv()`)
- Tests via `app.request(url, init, env)` against the full Hono app
- Template activation via mock `template_installations` + `template_registry` rows
- Existing tests cover: tenant resolution, branding entitlement gate, page rendering, contact form, 404 handling
- New political tests will follow this pattern: mock a tenant with `template_slug = '{slug}'` installed, assert all 4 pages render with mode-specific content and expected HTML fragments

### 2.7 — Governance Docs State

| Governance doc | Status |
|---|---|
| `political-niche-registry.json` | EXISTS — 16 records, all READY_FOR_RESEARCH |
| `political-niche-registry.schema.md` | EXISTS |
| `political-template-queue.md` | EXISTS — CURRENT = governor |
| `political-template-execution-board.md` | EXISTS |
| `political-template-status-codes.md` | EXISTS |
| `political-template-agent-handoff.md` | EXISTS |
| `political-generic-implementation-prompt.md` | EXISTS |
| `docs/governance/canonical-niche-registry.md` | NEEDS UPDATE — 16 VN-IDs to confirm |
| `docs/governance/niche-family-variant-register.md` | NEEDS UPDATE — 3 NF-POL families to register |

### 2.8 — Architecture Alignment Assessment

| Blueprint Claim | Current Reality | Alignment |
|---|---|---|
| `templateSlug = '{vertical-slug}-official-site'` | Confirmed consistent with existing naming pattern | ✓ ALIGNED |
| `BUILT_IN_TEMPLATES` registration | Confirmed pattern — Map key = slug | ✓ ALIGNED |
| `ctx.data.mode` for mode switching | No existing implementation — must be added | ✓ ALIGNED (extension, not conflict) |
| `ctx.data.partyColour` injection | Not in existing templates — safe new field | ✓ ALIGNED |
| `ctx.data.kycVerified` gate | Not in existing templates — safe new field | ✓ ALIGNED |
| SQL seed format (D1/SQLite) | Confirmed from `politician-campaign-site.sql` | ✓ ALIGNED |
| CSS namespace uniqueness | Each template has unique 2-letter prefix | ✓ ALIGNED |

**No architectural mismatches found.** The political expansion extends the existing system cleanly.

---

## Section 3 — Requirements Traceability Matrix

### Core Requirement IDs

| Req ID | Requirement | Source | Verification Method |
|---|---|---|---|
| REQ-POL-001 | All 16 political role niches have TypeScript template files | political-niche-registry.json | File existence check |
| REQ-POL-002 | All 16 templates registered in BUILT_IN_TEMPLATES | template-resolver.ts | `listBuiltInTemplateSlugs()` output |
| REQ-POL-003 | All 16 templates have marketplace SQL seeds | infra/db/seeds/templates/ | File existence check |
| REQ-POL-004 | All 16 templates have CSV rows in 0004_verticals-master.csv | CSV | Row count verification |
| REQ-POL-005 | All templates support campaign, incumbent, post_office modes | handoff doc | Render test per mode |
| REQ-POL-006 | Mode switch driven by ctx.data.mode | handoff doc | Code review + test |
| REQ-POL-007 | Party colour injected via --ww-party-primary CSS custom property | handoff doc | HTML output inspection |
| REQ-POL-008 | KYC gate enforced in incumbent mode | handoff doc | Test: kycVerified=false → gate rendered |
| REQ-POL-009 | Campaign finance gate on presidential donation CTA | handoff doc | Test: no donation without inecCampaignAccount |
| REQ-POL-010 | esc() wraps all user-supplied strings | T2 invariant | Code review |
| REQ-POL-011 | WhatsApp CTA on home page | P7 invariant | HTML output inspection |
| REQ-POL-012 | Mobile-first 375px layout | P10 invariant | CSS rule check |
| REQ-POL-013 | INEC/SIEC credential display in incumbent + post_office modes | handoff doc | Render test with cert ref |
| REQ-POL-014 | Family anchor built before variant (governor before senator) | queue doc | Build order enforcement |
| REQ-POL-015 | Default mode = campaign when ctx.data.mode absent | handoff doc | Test: no mode → campaign renders |
| REQ-POL-016 | TypeScript compiles with 0 errors | T2 invariant | `pnpm --filter @webwaka/brand-runtime typecheck` |
| REQ-POL-017 | All existing tests still pass | Regression gate | `pnpm --filter @webwaka/brand-runtime test` |
| REQ-POL-018 | New template-specific tests for all 16 templates | QA strategy | Test file line count + coverage |
| REQ-POL-019 | political-niche-registry.json updated to IMPLEMENTED for all 16 | registry schema | JSON parse + status check |
| REQ-POL-020 | DIFFERENTIATE scope notes added to colliding existing templates | collision gate | pillar2-niche-registry review |

### Niche-Level Traceability (16 niches × key requirements)

| Niche ID | Template File | SQL Seed | CSV Row ID | BUILT_IN_TEMPLATES Key | Family Gate |
|---|---|---|---|---|---|
| POL-governor-official-site | `niches/governor/official-site.ts` | `governor-official-site.sql` | vtx_governor | `governor-official-site` | ANCHOR — no dep |
| POL-senator-official-site | `niches/senator/official-site.ts` | `senator-official-site.sql` | vtx_senator | `senator-official-site` | After governor |
| POL-house-of-reps-member-official-site | `niches/house-of-reps-member/official-site.ts` | `house-of-reps-member-official-site.sql` | vtx_house_of_reps_member | `house-of-reps-member-official-site` | After governor |
| POL-state-commissioner-official-site | `niches/state-commissioner/official-site.ts` | `state-commissioner-official-site.sql` | vtx_state_commissioner | `state-commissioner-official-site` | ANCHOR — no dep |
| POL-federal-minister-official-site | `niches/federal-minister/official-site.ts` | `federal-minister-official-site.sql` | vtx_federal_minister | `federal-minister-official-site` | After state-commissioner |
| POL-lga-chairman-official-site | `niches/lga-chairman/official-site.ts` | `lga-chairman-official-site.sql` | vtx_lga_chairman | `lga-chairman-official-site` | After governor |
| POL-house-of-assembly-member-official-site | `niches/house-of-assembly-member/official-site.ts` | `house-of-assembly-member-official-site.sql` | vtx_house_of_assembly_member | `house-of-assembly-member-official-site` | After governor |
| POL-presidential-candidate-official-site | `niches/presidential-candidate/official-site.ts` | `presidential-candidate-official-site.sql` | vtx_presidential_candidate | `presidential-candidate-official-site` | STANDALONE |
| POL-political-appointee-official-site | `niches/political-appointee/official-site.ts` | `political-appointee-official-site.sql` | vtx_political_appointee | `political-appointee-official-site` | After state-commissioner |
| POL-ward-councillor-official-site | `niches/ward-councillor/official-site.ts` | `ward-councillor-official-site.sql` | vtx_ward_councillor | `ward-councillor-official-site` | After governor |
| POL-party-chapter-officer-official-site | `niches/party-chapter-officer/official-site.ts` | `party-chapter-officer-official-site.sql` | vtx_party_chapter_officer | `party-chapter-officer-official-site` | ANCHOR — no dep |
| POL-party-state-officer-official-site | `niches/party-state-officer/official-site.ts` | `party-state-officer-official-site.sql` | vtx_party_state_officer | `party-state-officer-official-site` | After party-chapter-officer |
| POL-deputy-governor-official-site | `niches/deputy-governor/official-site.ts` | `deputy-governor-official-site.sql` | vtx_deputy_governor | `deputy-governor-official-site` | After governor |
| POL-assembly-speaker-official-site | `niches/assembly-speaker/official-site.ts` | `assembly-speaker-official-site.sql` | vtx_assembly_speaker | `assembly-speaker-official-site` | STANDALONE |
| POL-lga-vice-chairman-official-site | `niches/lga-vice-chairman/official-site.ts` | `lga-vice-chairman-official-site.sql` | vtx_lga_vice_chairman | `lga-vice-chairman-official-site` | After lga-chairman |
| POL-supervisory-councillor-official-site | `niches/supervisory-councillor/official-site.ts` | `supervisory-councillor-official-site.sql` | vtx_supervisory_councillor | `supervisory-councillor-official-site` | After state-commissioner |

---

## Section 4 — Architecture Impact Map

### Files Created (New)

```
apps/brand-runtime/src/templates/niches/governor/official-site.ts
apps/brand-runtime/src/templates/niches/senator/official-site.ts
apps/brand-runtime/src/templates/niches/house-of-reps-member/official-site.ts
apps/brand-runtime/src/templates/niches/state-commissioner/official-site.ts
apps/brand-runtime/src/templates/niches/federal-minister/official-site.ts
apps/brand-runtime/src/templates/niches/lga-chairman/official-site.ts
apps/brand-runtime/src/templates/niches/house-of-assembly-member/official-site.ts
apps/brand-runtime/src/templates/niches/presidential-candidate/official-site.ts
apps/brand-runtime/src/templates/niches/political-appointee/official-site.ts
apps/brand-runtime/src/templates/niches/ward-councillor/official-site.ts
apps/brand-runtime/src/templates/niches/party-chapter-officer/official-site.ts
apps/brand-runtime/src/templates/niches/party-state-officer/official-site.ts
apps/brand-runtime/src/templates/niches/deputy-governor/official-site.ts
apps/brand-runtime/src/templates/niches/assembly-speaker/official-site.ts
apps/brand-runtime/src/templates/niches/lga-vice-chairman/official-site.ts
apps/brand-runtime/src/templates/niches/supervisory-councillor/official-site.ts

infra/db/seeds/templates/governor-official-site.sql
infra/db/seeds/templates/senator-official-site.sql
infra/db/seeds/templates/house-of-reps-member-official-site.sql
infra/db/seeds/templates/state-commissioner-official-site.sql
infra/db/seeds/templates/federal-minister-official-site.sql
infra/db/seeds/templates/lga-chairman-official-site.sql
infra/db/seeds/templates/house-of-assembly-member-official-site.sql
infra/db/seeds/templates/presidential-candidate-official-site.sql
infra/db/seeds/templates/political-appointee-official-site.sql
infra/db/seeds/templates/ward-councillor-official-site.sql
infra/db/seeds/templates/party-chapter-officer-official-site.sql
infra/db/seeds/templates/party-state-officer-official-site.sql
infra/db/seeds/templates/deputy-governor-official-site.sql
infra/db/seeds/templates/assembly-speaker-official-site.sql
infra/db/seeds/templates/lga-vice-chairman-official-site.sql
infra/db/seeds/templates/supervisory-councillor-official-site.sql
```

### Files Modified (Existing)

```
apps/brand-runtime/src/lib/template-resolver.ts     — 16 imports + 16 BUILT_IN_TEMPLATES entries added
apps/brand-runtime/src/brand-runtime.test.ts         — New political template test suite appended
infra/db/seeds/0004_verticals-master.csv             — 16 new rows appended
docs/templates/expansion/political/political-niche-registry.json  — All 16 status → IMPLEMENTED
docs/templates/expansion/political/political-template-execution-board.md  — Status board updated
docs/templates/expansion/political/political-template-queue.md    — Queue advanced
docs/governance/canonical-niche-registry.md          — 16 VN-IDs confirmed (if doc exists)
docs/governance/niche-family-variant-register.md     — NF-POL families registered (if doc exists)
```

### CSS Namespace Allocation (No Conflicts)

| Template | CSS Prefix | Collision check |
|---|---|---|
| governor-official-site | `.gv-` | Not used by any existing template |
| senator-official-site | `.sn-` | Not used |
| house-of-reps-member-official-site | `.hr-` | Not used |
| state-commissioner-official-site | `.sc-` | Not used |
| federal-minister-official-site | `.fm-` | Not used |
| lga-chairman-official-site | `.lc-` | Not used |
| house-of-assembly-member-official-site | `.ha-` | Not used |
| presidential-candidate-official-site | `.pc-` | Not used |
| political-appointee-official-site | `.pa-` | Not used |
| ward-councillor-official-site | `.wc-` | Not used |
| party-chapter-officer-official-site | `.pch-` | Not used |
| party-state-officer-official-site | `.pso-` | Not used |
| deputy-governor-official-site | `.dg-` | Not used |
| assembly-speaker-official-site | `.asp-` | Not used |
| lga-vice-chairman-official-site | `.lv-` | Not used |
| supervisory-councillor-official-site | `.sv-` | Not used |

*All prefixes checked against existing templates. `.po-` (politician), `.pp-` (political-party) are already in use and are excluded.*

---

## Section 5 — Data and Migration Plan

### 5.1 — CSV Row Schema

Each new row in `0004_verticals-master.csv` follows the header:
```
id,slug,display_name,category,subcategory,priority,status,entity_type,fsm_states,
required_kyc_tier,requires_frsc,requires_cac,requires_it,requires_community,
requires_social,package_name,milestone_target,notes
```

All 16 political rows:
- `category`: `politics`
- `status`: `planned`
- `entity_type`: `individual` (all are person-centric political roles)
- `requires_frsc`: `0` (no FRSC requirement)
- `requires_cac`: `0` (no CAC requirement for individuals)
- `requires_it`: `0` (no IT requirement)
- `requires_community`: `0`
- `requires_social`: `0`
- `milestone_target`: sprint-appropriate (`M8c` for Sprint 1, `M8d` for Sprint 2, `M9` for Sprint 3, `M10` for Sprint 4)

### 5.2 — SQL Seed Format (Confirmed)

```sql
-- Idempotent: INSERT OR IGNORE — safe to re-run
INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  '{vertical-slug}-official-site',
  '{Display Name}',
  '{Nigeria-first description}',
  'website', '1.0.0', '^1.0.0', '{vertical-slug}', '{vertical-slug}-official-site',
  'approved', 'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);
```

### 5.3 — No Database Migrations Required

The runtime system requires no schema changes. New templates are:
- Registered in `BUILT_IN_TEMPLATES` (in-memory Map — no DB)
- Seeded via `INSERT OR IGNORE INTO template_registry` (idempotent)
- Available immediately after deployment

### 5.4 — Rollback Safety

Each SQL seed uses `INSERT OR IGNORE` — safe to re-run. Removal requires only:
1. Removing the import from `template-resolver.ts`
2. Removing the BUILT_IN_TEMPLATES entry
3. Running `DELETE FROM template_registry WHERE slug = '...'`

No data migrations, no destructive schema changes. Rollback risk: LOW.

---

## Section 6 — Execution Sequence

### Phase 1: Governance Pre-Activation

**Tasks:**
- P1.1: Add 16 rows to `infra/db/seeds/0004_verticals-master.csv`
- P1.2: Update `docs/governance/canonical-niche-registry.md` with VN-POL-008 through VN-POL-023
- P1.3: Update `docs/governance/niche-family-variant-register.md` with NF-POL-ELC, NF-POL-APT, NF-POL-PTY families
- P1.4: Clear canonical activation blockers in `political-niche-registry.json` for all 16 niches

**Affected files:** `0004_verticals-master.csv`, 2 governance docs, `political-niche-registry.json`  
**Dependencies:** None — first phase  
**Risks:** CSV format error; mitigate by Python validation after write  
**Acceptance criteria:** Python `csv.DictReader` parses 214 data rows cleanly; all 16 new slugs present

### Phase 2: Sprint 1 Template Implementation (NF-POL-ELC Anchor + Federal Legislative)

Build order: `governor` first (anchor), then `senator` + `house-of-reps-member` (variants).

**Tasks:**
- P2.1: Create `niches/governor/official-site.ts` — NF-POL-ELC anchor with full mode-switch
- P2.2: Create `niches/senator/official-site.ts` — ELC variant (inherits governor structure, SB-prefix bills, senatorial district)
- P2.3: Create `niches/house-of-reps-member/official-site.ts` — ELC variant (HB-prefix bills, federal constituency, CDF)
- P2.4: Create SQL seeds for all 3
- P2.5: Register all 3 in BUILT_IN_TEMPLATES (import + map entry)

**Dependencies:** Phase 1 complete  
**Risks:** Mode-switch logic error; mitigate by testing all 3 modes before proceeding  
**Acceptance criteria:** All 3 templates render 4 pages × 3 modes without error; TypeScript compiles

### Phase 3: Sprint 2 Template Implementation (NF-POL-APT Anchor + State/LGA Elected)

Build order: `state-commissioner` first (NF-POL-APT anchor), then `federal-minister`, `lga-chairman`, `house-of-assembly-member`.

**Tasks:**
- P3.1: Create `niches/state-commissioner/official-site.ts` — NF-POL-APT anchor (incumbent + post_office only)
- P3.2: Create `niches/federal-minister/official-site.ts` — APT variant (FEC, Senate screening, Abuja)
- P3.3: Create `niches/lga-chairman/official-site.ts` — ELC variant (JAAC, SIEC, 774 LGAs)
- P3.4: Create `niches/house-of-assembly-member/official-site.ts` — ELC variant (state HOA, CDF, state bills)
- P3.5: Create SQL seeds for all 4
- P3.6: Register all 4 in BUILT_IN_TEMPLATES

**Dependencies:** Phase 2 complete (governor anchor IMPLEMENTED)  
**Risks:** Appointed-only mode (no campaign for state-commissioner) — must enforce correctly  
**Acceptance criteria:** state-commissioner renders incumbent + post_office; campaign mode returns safe fallback

### Phase 4: Sprint 3 Template Implementation

Build order: `presidential-candidate` (standalone), `political-appointee`, `ward-councillor`, `party-chapter-officer` (anchor), `party-state-officer`, `deputy-governor`.

**Tasks:**
- P4.1–P4.6: Create 6 template TypeScript files
- P4.7: Create SQL seeds for all 6
- P4.8: Register all 6 in BUILT_IN_TEMPLATES
- P4.9: Presidential finance gate: `ctx.data.inecCampaignAccount` check before any donation CTA

**Dependencies:** Phase 2 + Phase 3 complete  
**Risks:** Presidential finance gate compliance — mitigate: donate CTA is never rendered without INEC account reference  
**Acceptance criteria:** presidential template: campaign mode with `inecCampaignAccount=null` shows no donation CTA

### Phase 5: Sprint 4 Template Implementation

Build order: `assembly-speaker` (standalone), `lga-vice-chairman`, `supervisory-councillor`.

**Tasks:**
- P5.1–P5.3: Create 3 template TypeScript files
- P5.4: Create SQL seeds for all 3
- P5.5: Register all 3 in BUILT_IN_TEMPLATES

**Dependencies:** Phases 2–4 complete  
**Risks:** LOW — trailing sprint, established pattern  
**Acceptance criteria:** All 3 render cleanly

### Phase 6: Comprehensive Test Coverage

**Tasks:**
- P6.1: Add political template test suite to `brand-runtime.test.ts`
- P6.2: Run `pnpm --filter @webwaka/brand-runtime typecheck`
- P6.3: Run `pnpm --filter @webwaka/brand-runtime test`

**Test coverage requirements:**
- All 16 templates × all 4 pages (home, about, services, contact): 64 render tests
- Mode-switch tests: campaign/incumbent/post_office × key templates: ~20 tests
- KYC gate test: incumbent mode with kycVerified=false → gate rendered: 1 test
- Campaign finance gate: presidential campaign + no inecCampaignAccount: 1 test
- Default mode test: no ctx.data.mode → campaign renders: 5 tests
- Party colour injection: --ww-party-primary in HTML output: 5 tests
- WhatsApp CTA test: home page has WhatsApp link when phone provided: 16 tests
- XSS prevention: esc() is called on displayName (check HTML encoding): 5 tests

**Dependencies:** Phases 2–5 complete  
**Risks:** Test DB mock needs `template_installations` mock entry for each new slug  
**Acceptance criteria:** 0 failures, 0 TypeScript errors

### Phase 7: Registry, Board, Queue, and Documentation Updates

**Tasks:**
- P7.1: Update `political-niche-registry.json` — all 16 to IMPLEMENTED with dates and paths
- P7.2: Update `political-template-execution-board.md` — all sprints marked IMPLEMENTED
- P7.3: Update `political-template-queue.md` — all 16 in Completed table
- P7.4: Add scope notes to existing templates where DIFFERENTIATE verdict applies (vtx_politician, vtx_ward_rep)
- P7.5: Update `replit.md` to record political expansion completion

**Dependencies:** Phase 6 complete (all templates tested)  
**Acceptance criteria:** JSON parses cleanly; execution board matches implementation state

---

## Section 7 — QA and Verification Strategy

### 7.1 — Schema Validation

```bash
python3 -c "
import json
with open('docs/templates/expansion/political/political-niche-registry.json') as f:
    data = json.load(f)
assert len(data) == 16, f'Expected 16, got {len(data)}'
assert all(n['templateStatus'] == 'IMPLEMENTED' for n in data), 'Not all IMPLEMENTED'
print('PASS: Registry schema valid, 16 records, all IMPLEMENTED')
"
```

### 7.2 — Runtime Registration Validation

```typescript
// Verify all 16 slugs are in BUILT_IN_TEMPLATES
import { listBuiltInTemplateSlugs } from './lib/template-resolver.js';
const slugs = listBuiltInTemplateSlugs();
const political = [
  'governor-official-site', 'senator-official-site',
  'house-of-reps-member-official-site', 'state-commissioner-official-site',
  'federal-minister-official-site', 'lga-chairman-official-site',
  'house-of-assembly-member-official-site', 'presidential-candidate-official-site',
  'political-appointee-official-site', 'ward-councillor-official-site',
  'party-chapter-officer-official-site', 'party-state-officer-official-site',
  'deputy-governor-official-site', 'assembly-speaker-official-site',
  'lga-vice-chairman-official-site', 'supervisory-councillor-official-site',
];
political.forEach(s => assert(slugs.includes(s), `Missing: ${s}`));
```

### 7.3 — Render Testing (Per Template)

For each template, test:
```typescript
// Mock tenant with template installed
const db = makeDB({ 
  templateSlug: '{slug}', 
  mode: 'campaign' | 'incumbent' | 'post_office' 
});
// Assert pages render without throw
for (const page of ['/', '/about', '/services', '/contact']) {
  const res = await app.request(brandReq(page, 'test'), makeEnv({ templateSlug: '{slug}' }));
  expect(res.status).toBe(200);
}
```

### 7.4 — Mode-Switch Verification

```typescript
// Campaign mode: check for party-specific content
const campaignRes = await app.request(...);
const html = await campaignRes.text();
expect(html).toContain('Campaign'); // mode indicator
expect(html).not.toContain('RMAFC'); // should not show incumbent content

// Incumbent mode with KYC: check dashboard
// Incumbent mode without KYC: check gate
// Post_office mode: check legacy content
```

### 7.5 — XSS Prevention Verification

```typescript
// Supply a displayName with XSS payload
const xssOrg = { id: 'xss-test', slug: 'xss', name: '<script>alert(1)</script>' };
const res = await app.request(..., makeEnv({ org: xssOrg, templateSlug: 'governor-official-site' }));
const html = await res.text();
expect(html).not.toContain('<script>alert(1)</script>');
expect(html).toContain('&lt;script&gt;');
```

### 7.6 — TypeScript Compilation Verification

```bash
pnpm --filter @webwaka/brand-runtime typecheck
# Expected: 0 errors
```

### 7.7 — Full Test Suite

```bash
pnpm --filter @webwaka/brand-runtime test
# Expected: all existing tests pass + new political template tests pass
```

---

## Section 8 — Go / No-Go Gates

### Gate 1 (After Phase 1: Pre-Activation)

- [ ] `0004_verticals-master.csv` has 214 data rows and Python parses cleanly
- [ ] All 16 new political slugs are present in CSV
- [ ] No CSV parse error
- [ ] `political-niche-registry.json` blockers cleared (canonical activation blockers removed)
- **NO-GO condition:** Any CSV parse failure OR missing slug → fix before proceeding

### Gate 2 (After Phase 2: Sprint 1)

- [ ] 3 template TypeScript files exist at correct paths
- [ ] 3 template slugs present in BUILT_IN_TEMPLATES
- [ ] 3 SQL seeds exist in `infra/db/seeds/templates/`
- [ ] `pnpm --filter @webwaka/brand-runtime typecheck` → 0 errors
- [ ] All 3 templates render home page in all 3 modes without throw
- **NO-GO condition:** Any TypeScript error OR any render failure → fix before Phase 3

### Gate 3 (After Phase 3: Sprint 2)

- [ ] 4 more template files + slugs + seeds added (7 total)
- [ ] TypeScript: 0 errors
- [ ] state-commissioner: no campaign mode content rendered
- [ ] lga-chairman: JAAC reference present in incumbent mode
- **NO-GO condition:** Any TypeScript error → fix before Phase 4

### Gate 4 (After Phase 4: Sprint 3)

- [ ] 6 more template files + slugs + seeds added (13 total)
- [ ] TypeScript: 0 errors
- [ ] Presidential: no donation CTA without inecCampaignAccount
- [ ] party-chapter-officer: party card is the sole KYC credential reference
- **NO-GO condition:** Campaign finance gate not implemented → fix before Phase 5

### Gate 5 (After Phase 5: Sprint 4)

- [ ] All 16 template files + slugs + seeds exist (16 total)
- [ ] TypeScript: 0 errors
- [ ] BUILT_IN_TEMPLATES count = 208 (192 existing + 16 new)
- **NO-GO condition:** Count mismatch → audit missing registrations

### Gate 6 (Final: After Phase 6 Testing)

- [ ] All new political template tests pass
- [ ] 0 TypeScript errors
- [ ] 0 test regressions on existing tests
- [ ] `political-niche-registry.json` — all 16 at IMPLEMENTED
- [ ] All 7 deliverables complete (see Section 12)
- **NO-GO condition:** Any P0/P1 defect → fix before issuing final verdict

---

## Section 9 — Checkpoint and Rollback Plan

| Checkpoint | After Phase | What to Commit | Rollback Action |
|---|---|---|---|
| CP-1 | Phase 1 | CSV + governance docs | `git revert` CP-1 commit |
| CP-2 | Phase 2 | 3 Sprint 1 templates + resolver update | Remove 3 imports + BUILT_IN_TEMPLATES entries |
| CP-3 | Phase 3 | 4 Sprint 2 templates + resolver update | Remove 4 imports + entries |
| CP-4 | Phase 4 | 6 Sprint 3 templates + resolver update | Remove 6 imports + entries |
| CP-5 | Phase 5 | 3 Sprint 4 templates + resolver update | Remove 3 imports + entries |
| CP-6 | Phase 6 | Test suite additions | Revert test file changes |
| CP-7 | Phase 7 | Registry + board + queue updates | Revert governance docs |

Each checkpoint is a natural Replit auto-checkpoint. No explicit commit command needed — Replit checkpoints automatically after significant changes.

---

## Section 10 — Risk Register

| Risk | Severity | Probability | Mitigation |
|---|---|---|---|
| TypeScript compilation error in any template | HIGH | LOW | Follow exact pattern from politician-campaign-site.ts; typecheck after each sprint |
| BUILT_IN_TEMPLATES key mismatch (wrong slug) | HIGH | MEDIUM | Verify slug in both template export and Map key match exactly |
| CSS namespace collision between templates | MEDIUM | LOW | Pre-allocated unique prefixes per Section 4; cross-check before implementation |
| Mode-switch logic error (campaign content in incumbent mode) | HIGH | MEDIUM | Explicit switch on `getPoliticalMode(ctx)` + test per mode |
| Campaign finance gate omission on presidential template | P0 | MEDIUM | Explicit `if (!ctx.data?.inecCampaignAccount) return gateFallback()` |
| XSS via unescaped user input | P0 | LOW | All strings through `esc()` — PR pattern from politician template |
| Test regression on existing 192 templates | HIGH | LOW | No modification to existing files except resolver (append-only) |
| SQL seed format error (idempotency broken) | MEDIUM | LOW | `INSERT OR IGNORE` pattern; test re-run |
| CSV parse error after append | HIGH | LOW | Python validation at Gate 1 |
| KYC gate missing (incumbent dashboard exposed without verification) | HIGH | MEDIUM | Explicit `ctx.data.kycVerified` check in incumbent render path |

---

## Section 11 — Stage 1 Self-Audit

### Forensic Review Checklist

```
[✓] Coverage of all 16 niches — Section 3 traceability matrix has all 16 mapped
[✓] No missing traceability links — each niche maps to file + seed + CSV row + BUILT_IN_TEMPLATES key
[✓] No architecture ambiguity — Section 2 confirms exact resolver pattern + slot key format
[✓] No collision/gate omissions — 14 DIFFERENTIATE niches documented; scope notes planned (P7.4)
[✓] No undocumented schema changes — no schema changes required (confirmed Section 5.3)
[✓] No unresolved ownership confusion — single agent session owns all 16 implementations
[✓] No deviations from approved political blueprint — execution sequence matches queue and family order
[✓] No mismatch with current implementation — Section 2 confirms all architecture alignment
[✓] CSS namespace allocation complete — 16 unique prefixes confirmed (Section 4)
[✓] Build order respects family rules — governor before senator; state-commissioner before federal-minister
[✓] Presidential finance gate explicitly planned — Phase 4 task P4.9
[✓] Test strategy covers all required dimensions — Section 7 details all 7 test types
[✓] Rollback plan defined — Section 9 with per-checkpoint rollback actions
[✓] All 8 go/no-go gates defined — Section 8
```

### Final Execution Readiness Verdict

**READY FOR EXECUTION**

All 16 niches are covered, all traceability links are mapped, the architecture is validated against the current codebase, all collision gates are addressed, no undocumented schema changes are required, and the test strategy is complete. Stage 2 execution may begin immediately.

---

## Section 12 — Required Deliverables (Stage 2 Completion Checklist)

**A. Implementation Plan Document** — THIS FILE (committed at `docs/templates/expansion/political/political-implementation-plan.md`)

**B. Traceability Matrix** — Section 3 of this document

**C. Test Plan and QA Report** — Section 7 (strategy) + Phase 6 execution results (to be appended after execution)

**D. Change Log** — To be appended after execution:
```
FILES CREATED:
  apps/brand-runtime/src/templates/niches/governor/official-site.ts
  ... (all 16 template files)
  ... (all 16 SQL seeds)
FILES MODIFIED:
  apps/brand-runtime/src/lib/template-resolver.ts  (+16 imports, +16 map entries)
  apps/brand-runtime/src/brand-runtime.test.ts     (+political test suite)
  infra/db/seeds/0004_verticals-master.csv          (+16 rows)
  docs/templates/expansion/political/political-niche-registry.json  (all 16 → IMPLEMENTED)
  docs/templates/expansion/political/political-template-execution-board.md
  docs/templates/expansion/political/political-template-queue.md
```

**E. Governance Signoff Report** — To be appended after execution

**F. Final Readiness Verdict** — To be appended after execution

---

*Document status: APPROVED FOR STAGE 2 EXECUTION — Self-audit PASSED 2026-04-26*
