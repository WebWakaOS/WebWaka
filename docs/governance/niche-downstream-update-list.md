# WebWaka OS — Niche Master List: Downstream Update List

**Status:** AUTHORITATIVE
**Date:** 2026-04-25
**Governance docs produced:** 2026-04-25 (all 5 documents in this Master Niche List package)
**Taxonomy state:** 157 active, 3 deprecated, 39 families, 160 CSV rows

This document lists every file, package, configuration, and system component that must be updated, checked, or consumed using the canonical niche data from this Master Niche List. Items are organized by priority (blocking vs. deferred).

---

## Section 1 — Immediate Blocking Fixes (Must complete before Pillar 2 work begins)

These are existing files with confirmed stale or incorrect data that must be corrected before any Pillar 2 vertical niche implementation begins.

### 1.1 Stale P2/P3 Counts in Governance Docs

**Issue:** Both files below state P2=62, P3=78. Correct values are P2=63, P3=77. Off by 1 because the `road-transport-union` priority upgrade from P3→P2 occurred during the taxonomy closure session but the count tables in these two documents were not updated to reflect it.

| File | Fix Required | Lines to Update |
|---|---|---|
| `docs/governance/verticals-master-plan.md` | P2 count: 62 → 63; P3 count: 78 → 77 | Summary table (Priority Tier section) |
| `docs/reports/vertical-taxonomy-reconciliation-closure-addendum-2026-04-25.md` | P2 count: 62 → 63; P3 count: 78 → 77 | Count verification table |

**Verification:** `infra/db/seeds/0004_verticals-master.csv` parsed — P2=63, P3=77 confirmed by code check 2026-04-25.

**Status:** ⚠️ MUST FIX — tracked in this session as part of the 5-document push.

---

### 1.2 AI Config — mass-transit / transit Key

**File:** `packages/superagent/src/vertical-ai-config.ts`
**Issue (pre-closure):** AI config used `'transit'` as an active key instead of canonical `'mass-transit'`.
**Fix applied:** 2026-04-25 as part of taxonomy closure (OD-5). `mass-transit` is now the active config key.
**Status:** ✓ FIXED in commit `68eae9a3`

---

### 1.3 Migration 0037a — Primary Pillars for 6 Verticals

**File:** `infra/db/migrations/0037a_fix_primary_pillars_slugs.sql`
**Issue:** Migration 0037 used wrong slugs for 6 verticals, silently failing `UPDATE` on non-existent slugs.
**Fix applied:** 2026-04-25 — migration 0037a correct slugs applied.
**Affected verticals:** dental-clinic, vet-clinic, training-institute, mobile-money-agent, bureau-de-change, photography
**Status:** ✓ FIXED in commit `68eae9a3`

---

### 1.4 Migration 0340 — Taxonomy Closure

**File:** `infra/db/migrations/0340_vertical_taxonomy_closure.sql`
**Changes applied:**
- Deprecate: gym-fitness, petrol-station, nurtw (status → deprecated)
- Priority upgrade: road-transport-union P3→P2
- Add synonym map entries: 8 new entries for package aliases + deprecated merges
- Add: bank-branch (INSERT OR IGNORE — idempotent)
**Status:** ✓ APPLIED in commit `68eae9a3`

---

## Section 2 — Required Before Each Vertical's Pillar 2 Build Begins

Each vertical's implementation team must verify these items are aligned with the niche master table before starting build work.

### 2.1 Per-Vertical Package Alias Check

For every vertical where the package directory name differs from the canonical CSV slug, ensure the synonym map contains the correct `package_alias` entry. Verify against `docs/governance/niche-alias-deprecation-registry.md` Section 2.

**Aliases confirmed in synonym map (post 0340):**
- `photography-studio` → `photography`
- `transit` → `mass-transit`
- `newspaper-dist` → `newspaper-distribution`
- `palm-oil` → `palm-oil-trader`
- `polling-unit` → `polling-unit-rep`

**Action per vertical team:** Run `SELECT * FROM vertical_synonyms WHERE alias_slug = '[your package alias]'` before starting Pillar 2 work to confirm entry exists.

---

### 2.2 `primary_pillars` Column Correctness

Every active vertical must have a non-null, valid `primary_pillars` JSON array in the `verticals` table. Before implementation, verify:

```sql
SELECT slug, primary_pillars FROM verticals WHERE slug = '[your slug]' AND status = 'planned';
```

Expected values per vertical are in `docs/governance/canonical-vertical-master-register.md`.

**High-risk verticals (were broken pre-0037a):** dental-clinic, vet-clinic, training-institute, mobile-money-agent, bureau-de-change, photography — all fixed by 0037a.

---

### 2.3 Niche Family Template Availability

Before building a variant vertical, confirm the anchor vertical's template is available. Do not build variants before the anchor:

| Anchor | Variants (should not start before anchor) |
|---|---|
| restaurant | restaurant-chain, food-vendor, catering, bakery |
| beauty-salon | hair-salon, spa |
| tailor | tailoring-fashion, shoemaker |
| laundry | laundry-service, cleaning-service, cleaning-company |
| auto-mechanic | car-wash, tyre-shop |
| used-car-dealer | spare-parts, motorcycle-accessories |
| fuel-station | gas-distributor |
| event-hall | events-centre, event-planner, wedding-planner |
| pharmacy | pharmacy-chain |
| sports-academy | gym |
| optician | dental-clinic, vet-clinic |
| school | private-school, govt-school |
| farm | poultry-farm, vegetable-garden |

---

## Section 3 — Niche Registry Integration Points

These platform systems must consume niche data from the canonical documents in this package.

### 3.1 Discovery & Search

**System:** `packages/marketplace/src/search/vertical-discovery.ts` (or equivalent)
**Required updates:**
- Import discovery tags from each vertical's entry in `docs/governance/canonical-niche-registry.md`
- Family-based result grouping: use `niche_family_code` field (to be added to `verticals` table in a future migration)
- Deprecated slugs must NOT appear in search results: filter by `status = 'planned'`

**Action:** Add `niche_family_code` column to `verticals` table in milestone M9 discovery sprint.

---

### 3.2 Vertical AI Config

**File:** `packages/superagent/src/vertical-ai-config.ts`
**Required updates per niche family launch:**
- For each new niche family, add a `[slug]: { useCases: [...], persona: '...', model: '...' }` entry
- Family variants should inherit anchor's `model` and `persona` unless explicitly overridden
- Package alias keys must match canonical slugs (not package directory alias)
- `mass-transit` (not `transit`) example: CONFIRMED FIXED

**Critical rule:** Keys in vertical-ai-config.ts must exactly match canonical slugs from `infra/db/seeds/0004_verticals-master.csv`. Do NOT use package directory aliases as AI config keys.

---

### 3.3 Seed Data (`0004_verticals-master.csv`)

**File:** `infra/db/seeds/0004_verticals-master.csv`
**Read-only after commit 68eae9a3.** This is the canonical source. No edits without a governance review.

**If a new vertical is needed:** Open a governance review issue, update this CSV with a new row, create a migration, update `canonical-vertical-master-register.md`, and update this downstream update list.

---

### 3.4 `verticals` DB Table

**Migrations affecting verticals table:**
- `0339_add_bank_branch_vertical.sql` — added bank-branch
- `0340_vertical_taxonomy_closure.sql` — deprecations, priority upgrade, synonym map entries
- Any future vertical migrations must follow the closure playbook pattern

**Columns to verify on each new vertical build:**
- `slug` — must exactly match CSV
- `status` — must be `planned` for active verticals
- `priority` — must match CSV field 6
- `primary_pillars` — must be set (not silently null from failed UPDATE)
- `entity_type` — organization / individual / place per master table

---

### 3.5 `vertical_synonyms` DB Table

**Reference:** `docs/governance/niche-alias-deprecation-registry.md` Section 4 (Routing Matrix)

**Verification query:**
```sql
SELECT alias_slug, canonical_slug, synonym_type FROM vertical_synonyms ORDER BY synonym_type, canonical_slug;
```

**Expected entries:** At minimum the 8 entries from migration 0340 plus pre-existing synonym entries from migrations 0302, 0037.

---

### 3.6 Canonical Vertical Master Register

**File:** `docs/governance/canonical-vertical-master-register.md`
**Status as of commit 68eae9a3:** Up to date with 157 active + 3 deprecated.
**Required updates when this file needs refreshing:**
- P2 count correction: 62 → 63, P3: 78 → 77 (if present in this file — check line by line)
- Include bank-branch entry if not already present
- Include road-transport-union P2 priority update

---

### 3.7 Multi-Tenant Tenant Seeding

**File(s):** `apps/platform-admin/src/seeds/` or equivalent tenant seeding scripts
**Required:** When a tenant registers as a vertical type, the system must:
1. Look up slug in `verticals` table (only `status = 'planned'`)
2. Resolve any alias slug via `vertical_synonyms` before assigning
3. Apply the correct `primary_pillars` from the verticals record
4. Apply the niche family code for feature template selection (once added)

---

## Section 4 — Future Migrations Required

These are not blocking Pillar 2 start but must be tracked for upcoming milestones.

| # | Action | File | Milestone | Notes |
|---|---|---|---|---|
| F1 | Add `niche_family_code` column to `verticals` table | New migration `0341_add_niche_family_code.sql` | M9 | Enables family-based discovery grouping |
| F2 | Populate `niche_family_code` for all 113 family members | Same migration or seed update | M9 | Use NF-[CODE] values from niche-family-variant-register.md |
| F3 | Add `niche_role` column to `verticals` table | New migration `0342_add_niche_role.sql` | M10 | Values: anchor, variant, standalone |
| F4 | Add `discovery_tags` JSONB column to `verticals` table | New migration `0343_add_discovery_tags.sql` | M9 | Import from canonical-niche-registry.md per vertical |
| F5 | Deprecate `gym-fitness` seed row in any remaining seed scripts | Check all seed scripts | Immediate | Ensure no seed script re-inserts deprecated verticals |

---

## Section 5 — Documentation Files to Update After Push

| File | Update Required | Priority |
|---|---|---|
| `docs/governance/verticals-master-plan.md` | P2: 62→63, P3: 78→77 count table | IMMEDIATE (blocking) |
| `docs/reports/vertical-taxonomy-reconciliation-closure-addendum-2026-04-25.md` | P2: 62→63, P3: 78→77 count table | IMMEDIATE (blocking) |
| `docs/governance/canonical-vertical-master-register.md` | Verify bank-branch is listed; verify road-transport-union priority is P2 | Pre-push check |
| `replit.md` | Update taxonomy section with final counts P2=63, P3=77 | Pre-push |

---

## Section 6 — Files Confirmed Not Needing Changes

| File | Reason |
|---|---|
| `docs/reports/vertical-taxonomy-reconciliation-report-2026-04-25.md` | Forensic audit report — historical; no data to update |
| `infra/db/migrations/0340_vertical_taxonomy_closure.sql` | Already applied; do not modify |
| `infra/db/migrations/0039_vertical_synonyms.sql` | Pre-closure synonym foundation; intact |
| `infra/db/seeds/0004_verticals-master.csv` | Canonical source; locked at commit 68eae9a3 |
| `packages/superagent/src/vertical-ai-config.ts` | mass-transit key corrected in 68eae9a3; only update per-vertical as they launch |

---

## Section 7 — Push Checklist for This Package

Before pushing the 5 governance documents to staging, verify all items below:

- [ ] `docs/governance/niche-master-table.md` written (157 active + 3 deprecated, 160 rows)
- [ ] `docs/governance/canonical-niche-registry.md` written (157 entries, 39 families)
- [ ] `docs/governance/niche-alias-deprecation-registry.md` written (3 deprecated + 5 package aliases + 5 0037a aliases)
- [ ] `docs/governance/niche-family-variant-register.md` written (39 families, 113 members, 44 standalone)
- [ ] `docs/governance/niche-downstream-update-list.md` written (this file)
- [ ] `docs/governance/verticals-master-plan.md` — P2=62→63, P3=78→77 corrected
- [ ] `docs/reports/vertical-taxonomy-reconciliation-closure-addendum-2026-04-25.md` — P2=62→63, P3=78→77 corrected
- [ ] All 7 files committed atomically to `staging` branch
- [ ] Pillar 2 implementation gate: DO NOT merge any Pillar 2 vertical package until this commit is on staging and verified

---

*Produced: 2026-04-25 — Master Niche List package (Documents 1–5)*
*Session context: STOP-AND-RECONCILE taxonomy closure; taxonomy base commit `68eae9a3`*
