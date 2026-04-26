# Pillar 3 Niche Registry — Schema Reference

**Document type:** Canonical schema specification  
**Status:** ACTIVE — governs all entries in `pillar3-niche-registry.json`  
**Date:** 2026-04-26  
**Authority:** `docs/reports/pillar3-niche-identity-system-2026-04-26.md`  
**Do not modify this schema without updating the identity system report.**

---

## Field Definitions

Every record in `pillar3-niche-registry.json` must contain all of the following fields.
No field may be omitted. Use `null` for optional fields that have no value yet.

---

### Identity Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nicheId` | string | REQUIRED | Globally unique niche identifier. Format: `P3-{vertical-slug}-{niche-slug}`. Immutable once assigned. Example: `P3-mosque-mosque-community-platform` |
| `verticalSlug` | string | REQUIRED | Exact canonical slug from the `verticals` D1 table. Must match `infra/db/seeds/0004_verticals-master.csv`. Example: `mosque` |
| `verticalName` | string | REQUIRED | Display name for the vertical. Example: `Mosque / Islamic Centre` |
| `nicheSlug` | string | REQUIRED | Lowercase-hyphenated identifier for this specific niche within the vertical. Example: `mosque-community-platform` |
| `nicheName` | string | REQUIRED | Human-readable name for this niche. Example: `Mosque / Islamic Centre Community Platform` |
| `verticalCategory` | string | REQUIRED | Category from the verticals master plan. One of: `politics`, `transport`, `civic`, `commerce`, `health`, `education`, `professional`, `creator`, `financial`, `place`, `media`, `institutional`, `social`, `agricultural` |
| `verticalPriority` | integer | REQUIRED | Priority tier from the verticals CSV. Must be `3` for all records in this registry. |

---

### Pillar Classification Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `canonicalPillars` | string[] | REQUIRED | Which pillars this vertical serves. Array containing some of: `"ops"`, `"branding"`, `"marketplace"`. From `primary_pillars` column in D1. |
| `pillar3Eligible` | boolean | REQUIRED | Must be `true` for all records in this registry. Records with `false` should not be in this registry. |
| `pillar3EligibilitySource` | string | REQUIRED | Where the Pillar 3 eligibility was confirmed. For all current records: `"infra/db/seeds/0004_verticals-master.csv priority=3"` |

---

### Nigeria-First Context Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nigeriaFirstPriority` | string | REQUIRED | Importance of Nigeria-first localization. One of: `"critical"`, `"high"`, `"medium"`, `"low"`. |
| `africaFirstNotes` | string\|null | REQUIRED | Notes on broader African context where relevant. `null` if Nigeria-only. |
| `audienceSummary` | string | REQUIRED | Brief description of the primary audience for this niche's website. 1-3 sentences. Grounded in Nigerian reality. |
| `businessContextSummary` | string | REQUIRED | Brief description of the typical Nigerian business in this niche. 2-4 sentences. |
| `contentLocalizationNotes` | string | REQUIRED | Specific content tone, language, and framing guidance. |
| `imageArtDirectionNotes` | string | REQUIRED | Direction for imagery. Must specify Nigerian/African subjects. |
| `regulatoryOrTrustNotes` | string\|null | REQUIRED | Nigerian regulatory or trust requirements. `null` if none apply. |

---

### Template Status Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `templateStatus` | string | REQUIRED | Current status. Must be one of the values in `pillar3-template-status-codes.md`. |
| `templateVariantCount` | integer | REQUIRED | Number of template variants currently built. `0` if none built yet. |
| `primaryTemplatePath` | string\|null | REQUIRED | Path to the primary template file relative to repo root. `null` if not yet implemented. Example: `"apps/brand-runtime/src/templates/niches/mosque/mosque-community-platform.ts"` |
| `templateSlug` | string | REQUIRED | The `template_registry.slug` value. Derived as `{vertical-slug}-{niche-slug}`. Example: `"mosque-mosque-community-platform"` |
| `marketplaceManifestSlug` | string\|null | REQUIRED | The slug in the `template_registry` D1 table. Same as `templateSlug` once registered. `null` if not yet registered. |
| `runtimeIntegrationStatus` | string | REQUIRED | Whether this template is wired in `BUILT_IN_TEMPLATES`. One of: `"NOT_REGISTERED"`, `"REGISTERED_IN_BUILT_IN_TEMPLATES"`, `"LIVE_IN_PRODUCTION"` |

---

### Process Tracking Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `researchStatus` | string | REQUIRED | Status of pre-implementation research. One of: `"NOT_STARTED"`, `"IN_PROGRESS"`, `"SYNTHESIZED"` |
| `researchBriefPath` | string\|null | REQUIRED | Path to the research brief document. `null` if research not yet done. |
| `lastReviewedAt` | string\|null | REQUIRED | ISO-8601 date of the last review. `null` if never reviewed. |
| `implementedAt` | string\|null | REQUIRED | ISO-8601 date when `templateStatus` was set to `IMPLEMENTED`. `null` if not yet implemented. |
| `dependencies` | string[] | REQUIRED | List of repo dependencies that must exist before implementation. Empty array `[]` if no dependencies. |
| `blockers` | string[] | REQUIRED | Current blockers. Empty array `[]` if unblocked. |
| `nextAction` | string | REQUIRED | The single most immediate action needed. Specific and actionable. |
| `owner` | string\|null | REQUIRED | The agent or human currently responsible. `null` if unassigned. |
| `notes` | string | REQUIRED | Free-text notes. Use empty string `""` if no notes. |

---

## Validation Rules

1. `nicheId` format must match regex: `^P3-[a-z0-9-]+-[a-z0-9-]+$`
2. `nicheId` must be globally unique within the registry
3. `verticalSlug` must match a row in `infra/db/seeds/0004_verticals-master.csv` with `priority=3` and `status=planned`
4. `pillar3Eligible` must be `true` for all records
5. `verticalPriority` must be `3` for all records
6. `templateStatus` must be one of the exact values listed in `pillar3-template-status-codes.md`
7. `runtimeIntegrationStatus` must be one of: `NOT_REGISTERED`, `REGISTERED_IN_BUILT_IN_TEMPLATES`, `LIVE_IN_PRODUCTION`
8. `researchStatus` must be one of: `NOT_STARTED`, `IN_PROGRESS`, `SYNTHESIZED`
9. `nigeriaFirstPriority` must be one of: `critical`, `high`, `medium`, `low`
10. `templateVariantCount` must be a non-negative integer
11. When `templateStatus` is `IMPLEMENTED` or beyond, `primaryTemplatePath` must not be `null`
12. When `templateStatus` is `SHIPPED`, `runtimeIntegrationStatus` must be `LIVE_IN_PRODUCTION`
13. When `owner` is set, `templateStatus` should be `IMPLEMENTATION_IN_PROGRESS` or `RESEARCH_IN_PROGRESS`
14. No record with `verticalSlug` = `gym-fitness`, `petrol-station`, or `nurtw` (these are deprecated and must not appear)

---

## Differences from Pillar 2 Schema

The Pillar 3 schema is structurally identical to `pillar2-niche-registry.schema.md` with
the following changes:

| Field | Pillar 2 | Pillar 3 |
|-------|----------|----------|
| `pillar2Eligible` | Required (boolean) | **Removed** |
| `pillar2EligibilitySource` | Required (string) | **Removed** |
| `pillar3Eligible` | Not present | **Added** (required, boolean) |
| `pillar3EligibilitySource` | Not present | **Added** (required, string) |
| `nicheId` prefix | `P2-` | `P3-` |
| `verticalPriority` | 1 or 2 | must be 3 |

All other fields, types, and validation rules are identical.

---

## Schema Version

**Schema version:** 1.0.0  
**Compatible registry format:** JSON array of objects, each matching this schema  
**Authority:** `docs/reports/pillar3-niche-identity-system-2026-04-26.md`  
*Last updated: 2026-04-26*
