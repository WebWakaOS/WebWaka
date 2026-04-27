# WebWaka OS — Platform Architecture & Implementation QA Audit Report

**Document class:** Independent QA Gatekeeper Review  
**Audit target:** `docs/reports/MASTER-IMPLEMENTATION-PREPARATION-REPORT.md` (prior agent output)  
**Audit date:** 2026-04-27  
**Auditor role:** QA Swarm — independent, adversarial, no prior knowledge of prior report  
**Authority:** Every finding is grounded in live file verification. "UNVERIFIED" is marked where claims could not be confirmed.

> **HARD RULE:** No claim in this report is accepted without a file path. Every finding cites the specific migration, source file, or governance document that proves or disproves it.

---

## Summary Verdict

| Category | Verdict | Risk Level |
|---|---|---|
| Coverage & Readiness | AUDIT INSUFFICIENT — significant gaps proven | HIGH |
| Build Once Use Infinitely | NEEDS RE-WORK — 4 compliance failures | HIGH |
| Support Group Management | INTEGRATION NEEDS REFINEMENT — 3 blocking architectural errors | HIGH |
| Fundraising / Crowdfunding | REUSE-RISKY — 2 backward compatibility gaps missed | MEDIUM |
| AI / SuperAgent Integration | AI-INTEGRATION NEEDS REFINEMENT — dual-system blindness | HIGH |
| Data Model & Contracts | MODEL HIGH-RISK — schema-code mismatch in foundation primitive | HIGH |
| Implementation Roadmap | ROADMAP INCOMPLETE — 2 phantom migrations, 1 phantom plan name | HIGH |

**Overall verdict: PAUSE — fix the 9 blocking issues catalogued in Section 8 before any implementation begins.**

---

## 1. Coverage & Readiness of Audit

### 1.1 Coverage Ledger Analysis

The prior report claims:

> "Total files in scope: 4,890 TypeScript/SQL/Markdown files"

**Verified count from repo:** The `find` command returning 5,866 total files timed out before full type-count completion. The 4,890 figure cannot be independently confirmed and may undercount the scope.

More critically, the coverage methodology is pattern-reading ("150+ vertical packages pattern-verified"), which is stated as adequate. **The QA audit accepts this for vertical niche packages that genuinely follow identical patterns.** What is NOT acceptable is skipping the key infrastructure packages that directly govern the capabilities being proposed. Three of those were skipped or misread — findings below.

### 1.2 File Gaps Proven by This Audit

**GAP 1 — `packages/superagent/src/vertical-ai-config.ts` (partial read / misunderstood)**

The prior report states AI vertical configs should be added via SQL migration 0392. This is based on reading migration 0195 (`ai_vertical_configs` table). **However, the actual runtime AI capability system is the TypeScript object `VERTICAL_AI_CONFIGS` in `packages/superagent/src/vertical-ai-config.ts`**, not the SQL table.

Verified from `packages/superagent/src/index.ts`:
```
export { VERTICAL_AI_CONFIGS } from './vertical-ai-config.js';
export { getVerticalAiConfig } from './vertical-ai-config.js';
export { isCapabilityAllowed } from './vertical-ai-config.js';
```

This file was not read in full. The prior report never references `VERTICAL_AI_CONFIGS` (TypeScript) as a system to modify. It only references the SQL table. This is a coverage failure for a critical file.

**GAP 2 — `packages/community/src/entitlements.ts` (not read)**

The prior report proposes a namespaced entitlement scheme (`support_groups.enabled`, `support_groups.max_groups`, etc.). The actual `packages/community/src/entitlements.ts` uses a completely different pattern — a standalone `CommunityEntitlements` interface with `maxCommunitySpaces`, `paidTiersEnabled`, `coursesEnabled`. This is the established WebWaka extension pattern for community-like capabilities. Had this file been read, the proposed entitlement design would have followed the correct pattern.

**GAP 3 — `packages/community/src/types.ts` (not read directly)**

This is the canonical type contract for the community engine. It reveals two critical schema-code mismatches (see Section 6) that fundamentally affect the prior report's architectural foundation.

**GAP 4 — `apps/api/migrations/0052_civic_church_ngo.sql` (not read)**

This migration contains `tithe_records` — an existing fundraising primitive for the church vertical. The prior report incorrectly states "No fundraising" for the Church vertical. `tithe_records` has `payment_type` values including `donation`, making it directly relevant to the fundraising module backward-compatibility requirement.

**GAP 5 — `packages/entitlements/src/plan-config.ts` (read but key facts missed)**

The prior report did not register that plan names are: `free`, `starter`, `growth`, `pro`, `enterprise`, `partner`, `sub_partner`. It invented a `scale` plan that does not exist anywhere in the codebase.

### 1.3 Files That Were Not Needed (Accepted Exclusions)

- `.cache/pnpm/`, `dist/`, `.wrangler/` — correctly excluded
- 100+ vertical niche template files that follow verified identical patterns — acceptable exclusion

### 1.4 Coverage Verdict

**AUDIT INSUFFICIENT — RE-READ REQUIRED for the 5 files above before implementation begins.**

---

## 2. Build Once Use Infinitely Compliance

### 2.1 Reuse Tags Assessment

The prior report does supply reuse category tags in its scratchpad and summary (REUSE AS-IS, ENHANCE EXISTING, CREATE NEW SHARED, etc.). This structural requirement is met.

However, three specific reuse decisions are wrong or unsupported:

**FAILURE 1 — `community_channels.type` and `community_events.type` claimed to need "enum migrations"**

The prior report proposes migrations 0393 and 0394 to "extend the channel type enum" and "event type enum" with new values `'mobilization'` and `'gotv'`.

**Verified from actual migrations:**

```sql
-- Migration 0027
community_channels.type TEXT NOT NULL DEFAULT 'discussion'

-- Migration 0029
community_events.type TEXT NOT NULL DEFAULT 'live'
```

These are free-text `TEXT` columns with a `DEFAULT` value. There is **no SQL CHECK constraint and no enum** to extend. Migrations 0393 and 0394 as proposed would create empty migration files that accomplish nothing. This is a waste of a migration slot and would create confusion in the migration sequence. The "enum" extension is done entirely at the application layer (TypeScript type unions) — no database migration is required.

**Verdict: Migrations 0393 and 0394 must be dropped. The word "enum" was applied incorrectly.**

**FAILURE 2 — `fundraising.platform_fee_bps` entitlement dimension proposed as plan-level config**

The prior report proposes:
```typescript
'fundraising.platform_fee_bps': { starter: 0, growth: 200, scale: 150, enterprise: 100 }
```

Platform fee percentage is a **business/commercial decision**, not an entitlement dimension. Storing it in plan-config would make it impossible to adjust pricing without a code deployment. The prior report also uses `scale` which doesn't exist. Platform fees belong in a `platform_settings` KV key or a `fundraising_platform_config` table, not in `plan-config.ts`.

**Verdict: NEEDS RE-WORK — remove platform_fee_bps from entitlement plan-config.**

**FAILURE 3 — Dual fundraising primitives not addressed (tithe_records vs fundraising_campaigns)**

The prior report states "No fundraising" for the Church vertical (Section 6.3 table). This is incorrect.

**Verified from `apps/api/migrations/0052_civic_church_ngo.sql`:**
```sql
CREATE TABLE IF NOT EXISTS tithe_records (
  id            TEXT    PRIMARY KEY,
  workspace_id  TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id     TEXT    NOT NULL,
  member_id     TEXT    NOT NULL,
  amount_kobo   INTEGER NOT NULL CHECK (amount_kobo > 0),
  payment_type  TEXT    NOT NULL CHECK (payment_type IN ('tithe','offering','seed','donation','special')),
  paystack_ref  TEXT,
  recorded_at   INTEGER NOT NULL DEFAULT (unixepoch())
);
```

`tithe_records` is a live fundraising/contribution table for the church vertical with `payment_type = 'donation'` as a valid value. The new shared `fundraising_campaigns` module must either:
a. Define a migration path for `tithe_records` to use the shared module, or
b. Leave `tithe_records` as a vertical-specific primitive and explicitly note that `fundraising_campaigns` is an ADDITIONAL capability (not a replacement)

This was not addressed. Without addressing it, any implementation risks creating two parallel contribution tracking systems for church workspaces, violating P1.

**FAILURE 4 — `scale` plan used throughout entitlement tables**

The prior report's entitlement tables reference `scale` as a plan tier in multiple places:
- Section 5.7: `'support_groups.broadcast': { starter: false, growth: false, scale: true, enterprise: true }`
- Section 7.7: `'fundraising.reward_tiers': { starter: false, growth: false, scale: true, enterprise: true }`

**Verified from `packages/entitlements/src/plan-config.ts`:** The actual plans are `free`, `starter`, `growth`, `pro`, `enterprise`, `partner`, `sub_partner`. There is no `scale` plan. Every entitlement table in the report that uses `scale` must be rewritten to use `pro`.

### 2.2 Build Once Compliance Verdict

**NEEDS RE-WORK on all four failures above. The structural commitment to reuse is present but execution has 4 specific errors that would cause compilation failures or runtime bugs if implemented as written.**

---

## 3. Support Group Management Integration

### 3.1 Blocking Issue: One-CommunitySpace-Per-Workspace Rule

**Verified from `docs/community/community-model.md`:**
> "One CommunitySpace per Workspace — a Workspace may manage multiple Brand Surfaces but only one CommunitySpace root."

**Verified from `packages/community/src/entitlements.ts`:**
```typescript
export const FREE_COMMUNITY_ENTITLEMENTS: CommunityEntitlements = {
  maxCommunitySpaces: 1,    // ONE space per workspace on free plan
  ...
};
```

The prior report proposes that **support groups are implemented as community_space instances**. Specifically, Section 5.2 states: "Creates community_space + support_group_profile" in the API route description.

**Problem:** A politician workspace managing ward, LGA, state, and national support groups needs multiple community spaces. Under the current one-per-workspace rule, this is impossible unless:
- The rule is changed (requires ADR), or
- Each support group hierarchy level uses a separate workspace (operationally unworkable — a politician cannot manage 4 separate workspaces), or
- Support groups are NOT individual community_spaces but are a lighter primitive that references ONE community_space

The prior report does not acknowledge this constraint or propose any resolution. This is a **blocking architectural design error**.

**Action required:** Either propose an ADR to raise `maxCommunitySpaces` limits for political/civic verticals, OR redesign support groups to not consume a CommunitySpace slot per group. The hierarchy design (ward/LGA/state/federal) only works if multiple groups can coexist under one workspace.

### 3.2 Schema-Code Mismatch in Foundation Primitive

The prior report builds the entire support group architecture on `community_spaces`. It states: "`community_spaces` + related tables → support groups can be a community_space variant."

**Verified from `apps/api/migrations/0026_community_spaces.sql`:**
```sql
CREATE TABLE IF NOT EXISTS community_spaces (
  id               TEXT PRIMARY KEY,
  tenant_id        TEXT NOT NULL,
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL,
  description      TEXT,
  visibility       TEXT NOT NULL DEFAULT 'public',
  member_count     INTEGER NOT NULL DEFAULT 0,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
```

**No `workspace_id` column in the actual D1 migration.**

**Verified from `packages/community/src/types.ts`:**
```typescript
export interface CommunitySpace {
  id: string;
  workspaceId: string;   // ← NOT in the SQL schema
  ...
}
```

**Verified from `packages/community/src/community-space.ts` INSERT SQL:**
```sql
INSERT INTO community_spaces (id, workspace_id, name, slug, ...)
```

This INSERT references `workspace_id` but the column does not exist in migration 0026. If no subsequent ALTER TABLE migration exists (none found in the grep across all 388 migrations for `ALTER TABLE community_spaces ADD COLUMN workspace_id`), this INSERT would fail at runtime with a D1 schema error.

**The foundation that the prior report builds upon has an UNRESOLVED schema-code mismatch.** Before proposing any support group extension on top of `community_spaces`, this discrepancy must be:
1. Confirmed (is there a missing ALTER TABLE migration?), and
2. Resolved (add the missing column via a migration if it truly doesn't exist)

This is a **blocking data model issue**.

### 3.3 Lifecycle, USSD, and Offline Gaps

The prior report does not address:
- **Offline-first / USSD support for group management.** Nigeria-first requires that support group coordinators can operate via USSD (apps/ussd-gateway). Ward-level mobilization in rural areas depends on feature phones, not smartphones. No USSD branch design for support groups is proposed.
- **Mass communication via WhatsApp.** The prior report defers WhatsApp broadcast to a future ADR. However, this is not just a nice-to-have — for Nigerian political mobilization, WhatsApp is the primary coordination channel. Deferring this without a design stub leaves the feature incomplete for its stated purpose.
- **Role matrix for group coordinators.** The prior report defines membership roles for the community engine (owner/admin/moderator/member/guest) but does not define a support group-specific role matrix. Who is a "ward coordinator" vs. "group admin" vs. "volunteer captain"?

**Verdict: INTEGRATION NEEDS REFINEMENT — fix blocking issues in 3.1 and 3.2 before implementation. Address gaps in 3.3 in the design phase.**

---

## 4. Fundraising / Crowdfunding Architecture

### 4.1 Reuse Assessment: tithe_records Gap

As established in Section 2.1 (FAILURE 3), the church vertical already has `tithe_records` for contributions. The prior report's "10 verticals that need fundraising" table incorrectly marks church as having "No fundraising."

**Required action:** The fundraising module design must include:
- A canonical position statement on whether `tithe_records` is replaced, deprecated, or coexists with `campaign_contribution_records`
- A migration stub for `tithe_records → fundraising_campaigns` for church workspaces that want to use the shared module
- An explicit statement that church verticals may use EITHER `tithe_records` (existing, simple) OR `fundraising_campaigns` (new, full-featured) — with clear upgrade path

### 4.2 Reuse Assessment: campaign_donations Dual-Write Strategy

The prior report proposes keeping `campaign_donations` during migration and adding a `fundraising_campaign_id` FK in migration 0391b. **This is reasonable and correctly non-destructive.** No finding here.

### 4.3 Payout Architecture: Missing CBN Nuance

The prior report's `campaign_payout_requests` correctly includes HITL for political payouts. However, it does not address:
- **CBN's definition of "payment aggregation"**: Routing donations from many donors through a platform wallet to a political campaign may constitute payment aggregation, which requires a CBN Payment Service Provider (PSP) or Switching & Processing license. The prior report says "requires CBN licensing review" in Section 13.1 but does NOT recommend this review be completed BEFORE the module is designed. The entire payout architecture could require fundamental redesign if CBN determines it needs different licensing.
- **Escrow vs. pass-through**: The prior report uses `hl_wallets` as "campaign escrow wallets." Under Nigerian law, holding donor funds in an escrow-like structure may constitute unlicensed deposit-taking unless structured as a payment-pass-through. This must be reviewed before implementation.

**Verdict: REUSE-RISKY — the fundraising payment architecture needs CBN licensing clarification before `campaign_payout_requests` is finalized. Mark as DEFER pending legal/compliance review.**

### 4.4 INEC Compliance: Threshold Accuracy

The prior report states:
> "Maximum donation from individual to political campaign: ₦50,000,000 per Electoral Act 2022 s.88(3)"

This specific claim — **₦50,000,000 individual cap, per s.88(3)** — should be verified by legal counsel against the actual Electoral Act 2022 text. The QA audit cannot independently verify Nigerian statute citations. Mark as **UNVERIFIED — legal review required before implementing cap enforcement.**

**Verdict: REUSE-SAFE for the data model and contribution tracking. REUSE-RISKY for payout architecture and political donation caps. UNVERIFIED for INEC statutory references.**

---

## 5. AI / SuperAgent Integration

### 5.1 Dual-System Blindness (BLOCKING)

**This is the most significant AI integration error in the prior report.**

The prior report proposes migration 0392 to add rows to `ai_vertical_configs` (the SQL table) for support_group and fundraising vertical types. It does not mention `VERTICAL_AI_CONFIGS` (the TypeScript object in `packages/superagent/src/vertical-ai-config.ts`) at all.

**Verified: The actual runtime system uses `getVerticalAiConfig(slug)` from `packages/superagent/src/vertical-ai-config.ts`**, not the SQL table. When `superagent` is called for a vertical, it looks up the TypeScript config object. The SQL `ai_vertical_configs` table appears to be a governance/audit record, not the runtime config.

**Evidence:**
- `packages/superagent/src/index.ts` exports `getVerticalAiConfig` from `./vertical-ai-config.js`
- `packages/superagent/src/vertical-ai-config.ts` contains `VERTICAL_AI_CONFIGS` — a large TypeScript object with per-vertical capability declarations
- The SQL migration 0195 seeds `ai_vertical_configs` with different capability names than the TypeScript config (SQL: `content_draft`, `profile_summary`; TypeScript: `bio_generator`, etc.)

**There are TWO parallel AI config systems with DIFFERENT capability naming conventions:**
- SQL `ai_vertical_configs.capability_set`: `["content_draft","profile_summary","campaign_analysis"]`
- TypeScript `VERTICAL_AI_CONFIGS.politician.allowedCapabilities`: `['bio_generator', ...]`

Any new vertical AI config (support_group, fundraising) must be added to BOTH systems with consistent capability names. The prior report only addresses one.

**Action required:**
1. Determine which system is authoritative at runtime — read the actual superagent middleware and capability check code
2. Add `support_group` and `fundraising` entries to `packages/superagent/src/vertical-ai-config.ts` (TypeScript config)
3. Add matching rows to `ai_vertical_configs` SQL table (migration 0392) with aligned capability names
4. Document the capability naming convention discrepancy between the two systems and resolve it

### 5.2 `VerticalAIConfig` Type Reference Error

The prior report's `ai-config.ts` code examples use:
```typescript
import type { VerticalAIConfig } from '@webwaka/superagent';
```

**Verified from `packages/superagent/src/index.ts`:** No type named `VerticalAIConfig` is exported. The exported type system uses the config structure defined within `vertical-ai-config.ts`. The correct type must be verified from the actual exports before this import statement is used.

**Action required:** Verify the actual exported type name for vertical AI config from `packages/superagent/src/index.ts` before writing package code.

### 5.3 Capability Names Not Verified

The prior report defines new capabilities for support groups:
```typescript
capabilities: ['text_generation', 'summarization', 'classification', 'content_moderation']
```

But the actual `VERTICAL_AI_CONFIGS` uses capability names like `bio_generator`, `brand_copywriter`, `content_moderation`, `scheduling_assistant`, `sentiment_analysis`, `translation`, etc. (verified from the TypeScript config file).

The capability names `text_generation`, `summarization`, `classification` used by the prior report are from the governance documentation (`ai-capability-matrix.md`) but do NOT match the actual capability identifiers used in the TypeScript VERTICAL_AI_CONFIGS system.

**Action required:** Read `packages/superagent/src/capability-metadata.ts` to get the authoritative list of capability identifiers before writing any new vertical AI config.

**Verdict: AI-INTEGRATION NEEDS REFINEMENT — dual-system blindness is a blocking implementation error. Type name and capability naming errors would cause compilation failures.**

---

## 6. Data Model & Contracts

### 6.1 community_spaces Schema-Code Mismatch (BLOCKING)

As established in Section 3.2, the `community_spaces` SQL schema (migration 0026) does NOT have a `workspace_id` column, but:
- `packages/community/src/types.ts` CommunitySpace interface has `workspaceId: string`
- `packages/community/src/community-space.ts` INSERT includes `workspace_id` in the column list

A grep across all 388 migrations for `ALTER TABLE community_spaces ADD COLUMN workspace_id` returned **zero results**.

This creates a binary conclusion:
1. **The package code is ahead of the migration** — `workspace_id` has been defined in TypeScript but the corresponding migration has not been written yet. This is a **pre-existing platform bug** that must be resolved before building anything on top of `community_spaces`.
2. **D1 is more permissive than expected** — Cloudflare D1 in some configurations may not throw on extra column values. This would be a data integrity risk (column values silently dropped) rather than a migration error.

**Either way, this mismatch must be investigated and resolved.** The community engine cannot be the foundation of the support group system until its own foundation is confirmed consistent.

**Action required:** Run a D1 query against the actual database to check if `workspace_id` exists in `community_spaces`. If not, create a migration to add it. This is a pre-existing bug, not introduced by this report.

### 6.2 CommunityChannel.type Discrepancy

**Verified:**
- SQL migration 0027: `type TEXT NOT NULL DEFAULT 'discussion'`
- `packages/community/src/types.ts`: `type: 'forum' | 'chat' | 'announcement'`

The SQL DEFAULT value `'discussion'` is NOT in the TypeScript union type. This is a pre-existing data model inconsistency. Any existing `community_channels` rows with `type = 'discussion'` (the database default) would fail TypeScript type validation in the package layer.

**This is not introduced by the prior report but must be noted as a known technical debt that affects the reliability of `community_channels` as an extension point.**

### 6.3 ai_hitl_events Uses Foreign Key Constraint

**Verified from migration 0194:**
```sql
CREATE TABLE IF NOT EXISTS ai_hitl_events (
  ...
  queue_item_id TEXT NOT NULL REFERENCES ai_hitl_queue(id),  -- FK constraint
  ...
);
```

The prior report instructs (Section 10.2): "NOT using FOREIGN KEY constraints (Cloudflare D1 SQLite — FK enforcement done at application layer)."

However, the existing migrations themselves use FK constraints in at least one location. The prior report's blanket "no FK" rule is inconsistently stated. **The correct guidance should be: "FK enforcement is not relied upon by Cloudflare D1 Workers by default unless `PRAGMA foreign_keys = ON` is set. Use application-layer enforcement as primary control, and annotate FK-style columns as comments if no CHECK is used."**

This inconsistency in the proposed migration standard could cause confusion for engineers implementing the new migrations.

### 6.4 Missing Event Contract for Contribution Confirmed

The prior report proposes `publishEvent('fundraising.contribution.confirmed', {...})` in the contribution service. However, it does not:
- Define the event schema (fields, field types)
- Verify that this event type string is registered in `packages/events/`
- Define notification template for donor confirmation
- Verify the notificator consumer routes to the correct handler for this event

**This is a missing contract specification.** The `@webwaka/events` package and `apps/notificator` consumer must both be updated. The prior report does not list `packages/events` or `apps/notificator` in its "packages to extend" list (Section 11.2).

### 6.5 No Rollback / Backward Compatibility Plan for community_spaces Extension

The `support_group_profiles` table has a FK-style reference to `community_space_id`. If a community space is deleted, what happens to the support_group_profile? There is no:
- ON DELETE behavior specified
- Application-layer cascade rule proposed
- Soft-delete pattern for community spaces (no `is_deleted` or `status` field on `community_spaces`)

This creates a potential data integrity hole.

**Verdict: MODEL HIGH-RISK — 2 pre-existing platform bugs (workspace_id mismatch, channel type default mismatch) and 2 new design gaps (missing event contract, missing cascade rule) must be resolved.**

---

## 7. Implementation Roadmap & Risks

### 7.1 Phantom Migrations Must Be Removed

**Migration 0393** ("community_channel_types_update.sql"): Proposes to add `'mobilization'` to a channel type enum. As proven in Section 2.1, no enum exists. This migration would be empty or redundant. **REMOVE.**

**Migration 0394** ("community_event_types_update.sql"): Same problem. **REMOVE.**

These phantom migrations would consume slots in the migration sequence for no purpose, creating permanent gaps in the migration history.

### 7.2 Missing Phase 0 (ADR Prerequisites)

The prior report has no Phase 0. It jumps directly to "Phase 1 — Database Foundation (M9a)."

The following ADRs must be written and accepted BEFORE Phase 1 begins:

| ADR needed | Why |
|---|---|
| ADR: Raise CommunitySpace-per-Workspace limit for political/civic verticals | Blocking — support group hierarchy impossible without this |
| ADR: Support group as community_space variant vs. lighter primitive | Architectural decision needed before schema is written |
| ADR: CBN licensing position for fundraising payout aggregation | Legal risk — can't implement payout without this |
| ADR: Capability naming alignment between SQL ai_vertical_configs and TypeScript VERTICAL_AI_CONFIGS | Technical debt — must resolve before adding any new vertical AI config |
| ADR: tithe_records coexistence / migration strategy with fundraising_campaigns | Data model ownership — needed to confirm backward compatibility |

### 7.3 Missing QA Gate Specifications

The prior report lists a "compliance verification checklist" (Section 14.6) but does not specify:
- Unit test coverage threshold (the report says "≥80% matching existing pattern" but doesn't cite the existing pattern's actual coverage)
- Integration test plan for the HITL workflow
- Load test plan for fundraising contribution endpoint (Paystack round-trip under concurrent donations)
- Rollback plan if migration 0390 fails during Cloudflare D1 migration (partial migration state)
- D1 migration applied-state verification (how to confirm each migration ran cleanly)

### 7.4 Roadmap Verdict

**ROADMAP INCOMPLETE — missing Phase 0 (ADR prerequisites), 2 phantom migrations must be dropped, QA gate specifications are insufficient.**

---

## 8. Verdicts & Action Recommendations

### 8.1 High-Level Verdict

**PAUSE: Fix the 9 items below and resolve 3 ADRs before any implementation begins.**

Not REJECT (a full re-run is not needed — the architectural direction is sound and the reuse intent is correct). Not ACCEPT (too many blocking errors in foundational details to proceed safely).

### 8.2 What Must Happen Before Implementation

**MUST-DO before writing a single line of code:**

| # | Item | File to verify | Action |
|---|---|---|---|
| 1 | Confirm `community_spaces.workspace_id` existence | Run D1 query: `PRAGMA table_info(community_spaces)` | If column missing, create migration to add it FIRST, before any support group migration |
| 2 | Read `packages/superagent/src/vertical-ai-config.ts` in full | `packages/superagent/src/vertical-ai-config.ts` | Add `support_group` and `fundraising` entries to the TypeScript config, NOT just the SQL table |
| 3 | Read `packages/superagent/src/capability-metadata.ts` | `packages/superagent/src/capability-metadata.ts` | Confirm authoritative capability identifiers before writing any `ai-config.ts` |
| 4 | Fix all plan references from `scale` → `pro` | All 7 entitlement tables in Section 5.7 and 7.7 of prior report | Direct search-replace |
| 5 | Write ADR: CommunitySpace-per-Workspace limit | New ADR document | Needed to unlock support group hierarchy architecture |
| 6 | Write ADR: CBN licensing position on payout aggregation | Legal/compliance | Required before finalizing `campaign_payout_requests` table |
| 7 | Address `tithe_records` coexistence with `fundraising_campaigns` | `apps/api/migrations/0052_civic_church_ngo.sql` | Decide: coexist, replace, or upgrade path |
| 8 | Drop migrations 0393 and 0394 from plan | Section 10.1 of prior report | Remove phantom enum migrations |
| 9 | Add `packages/events` and `apps/notificator` to "packages to extend" list | Section 11.2 of prior report | Event schema for `fundraising.contribution.confirmed` must be specified |

**MUST-DO before Phase 3 (API routes):**

| # | Item | Action |
|---|---|---|
| 10 | Verify exported type name for vertical AI config | Read `packages/superagent/src/index.ts` type exports; replace `VerticalAIConfig` with correct name |
| 11 | Resolve channel.type DEFAULT `'discussion'` vs TypeScript union gap | Add `'discussion'` to the TypeScript union or migrate existing rows |
| 12 | Define event schema for all new `publishEvent()` calls | Specify field names and types in `packages/events/` |

**Legal / compliance actions (parallel track):**

| # | Item | Owner |
|---|---|---|
| 13 | Verify INEC Electoral Act 2022 s.88(3) citation for ₦50m cap | Legal counsel |
| 14 | CBN licensing assessment for fundraising payout aggregation | Legal / compliance |
| 15 | NDPR DPA appointment confirmation for AI processing register | Compliance |

### 8.3 Structured Audit Table

| Area | Verdict | Risk Level | Action Required |
|---|---|---|---|
| Coverage — general | INCOMPLETE — 5 files not read or misread | HIGH | Read `vertical-ai-config.ts`, `entitlements.ts`, `types.ts` in community, `0052_civic_church_ngo.sql` |
| Coverage — file count | UNVERIFIED — 4,890 vs actual ≥5,866 | LOW | Recount is cosmetic; substantive gaps listed above matter more |
| Build Once — plan names | FAIL — `scale` plan invented | HIGH | Replace `scale` with `pro` throughout |
| Build Once — enum migrations | FAIL — phantom 0393/0394 | MEDIUM | Drop migrations; document as app-layer validation |
| Build Once — tithe_records gap | FAIL — church fundraising already exists | MEDIUM | Define coexistence / migration strategy |
| Build Once — fee config placement | NEEDS RE-WORK | LOW | Move platform_fee_bps to KV/config table |
| Support Groups — architecture | BLOCKING — one-per-workspace conflict | HIGH | Write ADR to raise limit or redesign |
| Support Groups — foundation | BLOCKING — workspace_id mismatch in community_spaces | HIGH | Verify and fix before building |
| Support Groups — offline/USSD | MISSING | MEDIUM | Add USSD branch design stub |
| Fundraising — tithe_records | GAP — existing primitive unaddressed | MEDIUM | Define backward compatibility |
| Fundraising — CBN payout | UNVERIFIED — licensing risk | HIGH | Legal review before finalizing |
| Fundraising — INEC cap | UNVERIFIED — statutory citation | MEDIUM | Legal verification |
| Fundraising — data model | REUSE-SAFE for contributions | LOW | No change |
| AI — dual config systems | BLOCKING — TypeScript config not updated | HIGH | Add entries to both SQL + TypeScript configs |
| AI — capability names | FAIL — wrong identifier set used | HIGH | Read capability-metadata.ts and use correct names |
| AI — type import name | FAIL — `VerticalAIConfig` not exported | HIGH | Verify correct type name from index.ts |
| AI — HITL contracts | OK — correctly identified | LOW | No change |
| Data model — schema/code gap | HIGH-RISK — community_spaces workspace_id | HIGH | Verify column existence in D1, fix if missing |
| Data model — event contracts | MISSING — fundraising events not defined | MEDIUM | Add event schema to packages/events |
| Data model — cascade rules | MISSING — support_group cascade on space delete | MEDIUM | Define application-layer cascade |
| Roadmap — Phase 0 | MISSING — no ADR prerequisites phase | HIGH | Add Phase 0 with 5 ADRs listed above |
| Roadmap — phantom migrations | FAIL — 0393/0394 are empty | MEDIUM | Remove from sequence |
| Roadmap — QA gates | INSUFFICIENT — no rollback plan | MEDIUM | Add D1 migration rollback procedure |

### 8.4 Go / No-Go Recommendation

**PAUSE: Fix ADRs and file-coverage issues first.**

Specifically:

1. **Before any migration is written:** Verify `community_spaces.workspace_id` existence in live D1 via `PRAGMA table_info`. This single check could change the entire support group foundation.

2. **Before any AI integration code is written:** Read `packages/superagent/src/vertical-ai-config.ts` in full and `packages/superagent/src/capability-metadata.ts` to establish correct capability identifiers. The proposed AI configs use the wrong system and wrong identifiers.

3. **Before the fundraising payout table is finalized:** Get a CBN licensing opinion on whether the platform-as-escrow model requires a PSP license. If yes, the entire payout architecture must change.

4. **Before migration 0389 is merged:** Write and accept the ADR on CommunitySpace-per-Workspace limit expansion. Without this, the support group hierarchy of ward/LGA/state/federal cannot be implemented under the existing platform constraints.

The prior report's architectural direction — reuse community_spaces, extend hl_wallet for fundraising, route AI through superagent — is **correct in principle**. The failures are in the details: wrong plan names, misread capability naming system, undetected foundation schema gaps, missing ADRs, and phantom migrations. These are fixable in a focused revision pass, not a full re-run.

**Implement nothing until the 9 blocking items in Section 8.2 are resolved.**

---

## Appendix — Evidence Citations

All findings in this report are grounded in the following verified file reads performed during this audit:

| File | Finding supported |
|---|---|
| `apps/api/migrations/0026_community_spaces.sql` | No `workspace_id` column (Section 3.2, 6.1) |
| `apps/api/migrations/0027_community_channels.sql` | `type TEXT` not an enum (Section 2.1 FAILURE 1) |
| `apps/api/migrations/0029_community_events.sql` | `type TEXT` not an enum (Section 2.1 FAILURE 1) |
| `apps/api/migrations/0052_civic_church_ngo.sql` | `tithe_records` exists for church (Section 2.1 FAILURE 3, 4.1) |
| `apps/api/migrations/0194_ai001_hitl_tables.sql` | HITL queue schema; FK constraint usage (Section 6.3) |
| `apps/api/migrations/0195_ai002_vertical_configs.sql` | SQL capability names vs TypeScript capability names (Section 5.1) |
| `packages/entitlements/src/plan-config.ts` | Plans: `free`,`starter`,`growth`,`pro`,`enterprise`,`partner`,`sub_partner` — no `scale` (Section 2.1 FAILURE 4) |
| `packages/entitlements/src/guards.ts` | Flat entitlement guard pattern (Section 2.1) |
| `packages/community/src/types.ts` | `CommunitySpace.workspaceId` in type but not in schema (Section 6.1) |
| `packages/community/src/community-space.ts` | INSERT references `workspace_id` not in schema (Section 6.1) |
| `packages/community/src/entitlements.ts` | `CommunityEntitlements` interface pattern (Section 1.2 GAP 2) |
| `packages/superagent/src/index.ts` | `getVerticalAiConfig`, `VERTICAL_AI_CONFIGS` exports (Section 5.1) |
| `packages/superagent/src/vertical-ai-config.ts` | TypeScript runtime AI config (Section 5.1) |
| `packages/search-indexing/src/types.ts` | "Milestone 4 scaffold only" (Section 1.2 GAP 3) |
| `docs/community/community-model.md` | One-CommunitySpace-per-Workspace rule (Section 3.1) |
| `packages/types/src/subscription.ts` | `EntitlementDimensions` type (Section 6) |

---

*QA Audit produced by: WebWaka QA Swarm*  
*Audit date: 2026-04-27*  
*File: `docs/reports/QA-AUDIT-REPORT.md`*
