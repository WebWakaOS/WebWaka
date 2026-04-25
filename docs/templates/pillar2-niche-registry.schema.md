# Pillar 2 Niche Registry — Schema Reference

**Document type:** Canonical schema specification  
**Status:** ACTIVE — governs all entries in `pillar2-niche-registry.json`  
**Date:** 2026-04-25  
**Authority:** `docs/reports/pillar2-niche-identity-system-2026-04-25.md`  
**Do not modify this schema without updating the identity system report.**

---

## Field Definitions

Every record in `pillar2-niche-registry.json` must contain all of the following fields. No field may be omitted. Use `null` for optional fields that have no value yet.

---

### Identity Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nicheId` | string | REQUIRED | Globally unique niche identifier. Format: `P2-{vertical-slug}-{niche-slug}`. Immutable once assigned. Example: `P2-restaurant-general-eatery` |
| `verticalSlug` | string | REQUIRED | Exact canonical slug from the `verticals` D1 table. Must match `infra/db/seeds/0004_verticals-master.csv`. Example: `restaurant` |
| `verticalName` | string | REQUIRED | Display name for the vertical. Example: `Restaurant / Eatery / Buka` |
| `nicheSlug` | string | REQUIRED | Lowercase-hyphenated identifier for this specific niche within the vertical. Example: `general-eatery` |
| `nicheName` | string | REQUIRED | Human-readable name for this niche. Example: `General Restaurant / Eatery / Buka Site` |
| `verticalCategory` | string | REQUIRED | Category from the verticals master plan. One of: `politics`, `transport`, `civic`, `commerce`, `health`, `education`, `professional`, `creator`, `financial`, `place`, `media`, `institutional`, `social`, `agricultural` |
| `verticalPriority` | integer | REQUIRED | Priority tier from the verticals CSV: `1` = P1-Original, `2` = P2-Top100 High-Fit, `3` = P3-Top100 Medium |

---

### Pillar Classification Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `canonicalPillars` | string[] | REQUIRED | Which pillars this vertical serves. Array containing some of: `"ops"`, `"branding"`, `"marketplace"`. From `primary_pillars` column in D1. Example: `["ops","marketplace","branding"]` |
| `pillar2Eligible` | boolean | REQUIRED | Must be `true` for all records in this registry. Records with `false` should not be in this registry. |
| `pillar2EligibilitySource` | string | REQUIRED | Where the Pillar 2 eligibility was confirmed. Example: `"migration 0037_verticals_primary_pillars.sql"` |

---

### Nigeria-First Context Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nigeriaFirstPriority` | string | REQUIRED | Importance of Nigeria-first localization for this niche. One of: `"critical"`, `"high"`, `"medium"`, `"low"`. `critical` = niche is deeply Nigeria-specific (e.g., ajo savings); `high` = strong Nigeria context needed; `medium` = standard Nigeria localization; `low` = global niche with some local context |
| `africaFirstNotes` | string\|null | REQUIRED | Notes on broader African context where relevant. `null` if Nigeria-only. Example: `"Ajo/esusu savings model common across West Africa"` |
| `audienceSummary` | string | REQUIRED | Brief description of the primary audience for this niche's website. Who visits it, what they want. 1-3 sentences. Must be grounded in Nigerian reality. |
| `businessContextSummary` | string | REQUIRED | Brief description of the typical Nigerian business in this niche. How they operate, what they need from their website. 2-4 sentences. |
| `contentLocalizationNotes` | string | REQUIRED | Specific content tone, language, and framing guidance for this niche. What words, phrases, and trust signals matter. |
| `imageArtDirectionNotes` | string | REQUIRED | Direction for imagery. What kinds of images should represent this niche. Must specify Nigerian/African subjects. Never generic western stock. |
| `regulatoryOrTrustNotes` | string\|null | REQUIRED | Nigerian regulatory or trust requirements that should appear on the site. E.g., NAFDAC numbers, CAC registration, NBA membership. `null` if none apply. |

---

### Template Status Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `templateStatus` | string | REQUIRED | Current status. Must be one of the values in `pillar2-template-status-codes.md`. |
| `templateVariantCount` | integer | REQUIRED | Number of template variants currently built. `0` if none built yet. |
| `primaryTemplatePath` | string\|null | REQUIRED | Path to the primary template file relative to repo root. `null` if not yet implemented. Example: `"apps/brand-runtime/src/templates/niches/restaurant/general-eatery.ts"` |
| `templateSlug` | string | REQUIRED | The `template_registry.slug` value for this niche template. Derived as `{vertical-slug}-{niche-slug}`. Example: `"restaurant-general-eatery"` |
| `marketplaceManifestSlug` | string\|null | REQUIRED | The slug in the `template_registry` D1 table. Same as `templateSlug` once registered. `null` if not yet registered. |
| `runtimeIntegrationStatus` | string | REQUIRED | Whether this template is wired in `BUILT_IN_TEMPLATES`. One of: `"NOT_REGISTERED"`, `"REGISTERED_IN_BUILT_IN_TEMPLATES"`, `"LIVE_IN_PRODUCTION"` |

---

### Process Tracking Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `researchStatus` | string | REQUIRED | Status of pre-implementation research. One of: `"NOT_STARTED"`, `"IN_PROGRESS"`, `"SYNTHESIZED"` |
| `researchBriefPath` | string\|null | REQUIRED | Path to the research brief document. `null` if research not yet done. Example: `"docs/templates/research/restaurant-general-eatery-brief.md"` |
| `lastReviewedAt` | string\|null | REQUIRED | ISO-8601 date of the last review of this record. Example: `"2026-04-25"`. `null` if never reviewed. |
| `implementedAt` | string\|null | REQUIRED | ISO-8601 date when `templateStatus` was set to `IMPLEMENTED`. `null` if not yet implemented. |
| `dependencies` | string[] | REQUIRED | List of repo dependencies that must exist before this template can be implemented. Example: `["packages/verticals-restaurant"]`. Empty array `[]` if no dependencies. |
| `blockers` | string[] | REQUIRED | Current blockers preventing progress. Empty array `[]` if unblocked. Each entry is a brief description. |
| `nextAction` | string | REQUIRED | The single most immediate action needed for this niche. Specific and actionable. Example: `"Research Nigerian restaurant web design patterns and competitor sites"` |
| `owner` | string\|null | REQUIRED | The agent or human currently responsible for this niche. `null` if unassigned. Example: `"replit-agent-session-2026-04-26"` |
| `notes` | string | REQUIRED | Free-text notes. Use empty string `""` if no notes. |

---

## Validation Rules

1. `nicheId` format must match regex: `^P2-[a-z0-9-]+-[a-z0-9-]+$`
2. `nicheId` must be globally unique within the registry
3. `verticalSlug` must match a row in `infra/db/seeds/0004_verticals-master.csv`
4. `pillar2Eligible` must be `true` — records where this is `false` do not belong in this registry
5. `templateStatus` must be one of the exact values listed in `pillar2-template-status-codes.md`
6. `runtimeIntegrationStatus` must be one of: `NOT_REGISTERED`, `REGISTERED_IN_BUILT_IN_TEMPLATES`, `LIVE_IN_PRODUCTION`
7. `researchStatus` must be one of: `NOT_STARTED`, `IN_PROGRESS`, `SYNTHESIZED`
8. `nigeriaFirstPriority` must be one of: `critical`, `high`, `medium`, `low`
9. `templateVariantCount` must be a non-negative integer
10. When `templateStatus` is `IMPLEMENTED` or beyond, `primaryTemplatePath` must not be `null`
11. When `templateStatus` is `SHIPPED`, `runtimeIntegrationStatus` must be `LIVE_IN_PRODUCTION`
12. When `owner` is set, `templateStatus` should be `IMPLEMENTATION_IN_PROGRESS` or `RESEARCH_IN_PROGRESS`

---

## Schema Version

**Schema version:** 1.0.0  
**Compatible registry format:** JSON array of objects, each matching this schema  
*Last updated: 2026-04-25*
