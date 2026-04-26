# Political Role-Specific Niche Registry — Schema Reference

**Document type:** Canonical schema specification  
**Status:** ACTIVE — governs all entries in `political-niche-registry.json`  
**Date:** 2026-04-26  
**Authority:** `docs/templates/expansion/political/00-Political-Master-Blueprint.md`  
**Extends:** `docs/templates/pillar2-niche-registry.schema.md` — inherits all base field semantics; political schema adds 4 new fields  
**Do not modify this schema without updating the master blueprint and handoff documents.**

---

## Field Definitions

Every record in `political-niche-registry.json` must contain all of the following fields. No field may be omitted. Use `null` for optional fields that have no value yet.

---

### Identity Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nicheId` | string | REQUIRED | Globally unique niche identifier. Format: `POL-{vertical-slug}-{niche-slug}`. Immutable once assigned. Example: `POL-governor-official-site` |
| `verticalSlug` | string | REQUIRED | The proposed canonical slug for this political role vertical. Must match the slug intended for `infra/db/seeds/0004_verticals-master.csv` once the niche is activated. Example: `governor` |
| `verticalName` | string | REQUIRED | Display name for the vertical. Example: `State Governor` |
| `nicheSlug` | string | REQUIRED | Lowercase-hyphenated identifier for this specific niche within the vertical. Political expansion uses `official-site` as the standard niche slug — one primary niche per political role vertical. Example: `official-site` |
| `nicheName` | string | REQUIRED | Human-readable name for this niche. Example: `State Governor Official Site` |
| `verticalCategory` | string | REQUIRED | Always `politics` for all records in this registry. |
| `verticalPriority` | integer | REQUIRED | Priority tier from the candidate scoring: `1` = P1 (score ≥40), `2` = P2 (score 30–39). All political expansion niches are P1 or P2. |
| `proposedVnId` | string | REQUIRED | The proposed VN-ID from the candidate registry. Format: `VN-POL-NNN`. Becomes canonical when the niche is added to `docs/governance/canonical-niche-registry.md`. Example: `VN-POL-013` |
| `candidateScore` | integer | REQUIRED | The total 5-dimension score from `02-Political-Candidate-Registry.md`. Range 0–50. Used to determine priority tier and sprint assignment. Example: `42` |

---

### Pillar Classification Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `canonicalPillars` | string[] | REQUIRED | Which pillars this vertical serves. Political role templates are primarily `"branding"` (Pillar 2). Array may include `"ops"` where Pillar 1 extensions are planned (e.g., project management, constituent case management). Example: `["branding"]` or `["branding", "ops"]` |
| `pillar2Eligible` | boolean | REQUIRED | Must be `true` for all records in this registry. Political expansion is an explicit Pillar 2 branding scope initiative. |
| `pillar2EligibilitySource` | string | REQUIRED | Where Pillar 2 eligibility was confirmed. For political expansion: `"docs/templates/expansion/political/00-Political-Master-Blueprint.md — political role expansion sprint"` |

---

### Political Role Classification Fields

These fields are NEW — not present in the base Pillar 2/3 schema. Required for all political registry records.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `politicalFamily` | string | REQUIRED | The NF-POL family this niche belongs to. One of: `"NF-POL-ELC"` (elected officials), `"NF-POL-APT"` (appointed officials), `"NF-POL-PTY"` (party structure officers). |
| `familyRole` | string | REQUIRED | This niche's role within its family. One of: `"anchor"` (must be built first — establishes the family baseline), `"variant"` (inherits from anchor), `"standalone"` (not part of family inheritance — unique scope). |
| `governmentTier` | string | REQUIRED | The tier of Nigerian government this role operates within. One of: `"ward"`, `"lga"`, `"state"`, `"federal"`, `"party"`. |
| `regulatoryBody` | string | REQUIRED | The primary regulatory body whose documentation is required to verify this role. One of: `"INEC"` (federal), `"SIEC"` (state — for LGA/ward), `"party"` (party internal), `"executive"` (gubernatorial or presidential appointment). Example: `"INEC"` |
| `kycTierRequired` | string | REQUIRED | The minimum KYC tier required to unlock `incumbent` mode for this template. One of: `"Tier 1"`, `"Tier 2"`, `"Tier 2-3"`, `"Tier 3"`, `"Tier 2-4"`. See `political-template-status-codes.md` for KYC tier definitions. |
| `supportedModes` | string[] | REQUIRED | The `ctx.data.mode` values this template supports. Standard set: `["campaign", "incumbent", "post_office"]`. Presidential variant also requires additional handling. |
| `sprintAssignment` | string | REQUIRED | Which build sprint this niche is assigned to. One of: `"Sprint 1"`, `"Sprint 2"`, `"Sprint 3"`, `"Sprint 4"`. |
| `familyDependency` | string | null | REQUIRED | For `variant` family role: the `nicheId` of the family anchor that must be `IMPLEMENTED` before this variant may be claimed. `null` for `anchor` and `standalone` roles. Example: `"POL-governor-official-site"` |

---

### Nigeria-First Context Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nigeriaFirstPriority` | string | REQUIRED | Importance of Nigeria-first localization. All political expansion niches are `"critical"` — deeply Nigeria-specific (INEC, SIEC, 36-state structure, party affiliations). |
| `africaFirstNotes` | string\|null | REQUIRED | Notes on broader African political context. `null` if Nigeria-only scope. Most political niches are Nigeria-specific; some (senator, governor) have West African parallels. |
| `audienceSummary` | string | REQUIRED | Who visits this political role site and what they want. Must reference Nigerian political reality — ward, LGA, state, federal tier. 1–3 sentences. |
| `businessContextSummary` | string | REQUIRED | How this political role operates in Nigeria — office powers, accountability mechanisms, Nigerian constitutional basis. 2–4 sentences. |
| `contentLocalizationNotes` | string | REQUIRED | Content framing guidance — official titles, party naming conventions, INEC terminology, Nigerian political language norms. |
| `imageArtDirectionNotes` | string | REQUIRED | Direction for imagery. Nigerian political context: official settings, party colours, Nigerian flags, constituent engagement scenes. Must specify Nigerian subjects. |
| `regulatoryOrTrustNotes` | string\|null | REQUIRED | INEC/SIEC compliance requirements, certificate of return display, KYC gate description, campaign finance rules if applicable. |

---

### Template Status Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `templateStatus` | string | REQUIRED | Current status. Must be one of the values in `political-template-status-codes.md`. All 16 niches start at `READY_FOR_RESEARCH`. |
| `templateVariantCount` | integer | REQUIRED | Number of template variants currently built. `0` for all niches at launch. |
| `primaryTemplatePath` | string\|null | REQUIRED | Path to the primary template file relative to repo root. `null` if not yet implemented. Planned path: `"apps/brand-runtime/src/templates/niches/{vertical-slug}/official-site.ts"` |
| `templateSlug` | string | REQUIRED | The `template_registry.slug` value for this niche template. Derived as `{vertical-slug}-official-site`. Example: `"governor-official-site"` |
| `marketplaceManifestSlug` | string\|null | REQUIRED | The slug in the `template_registry` D1 table. Same as `templateSlug` once registered. `null` if not yet registered. |
| `runtimeIntegrationStatus` | string | REQUIRED | Whether this template is wired in `BUILT_IN_TEMPLATES`. One of: `"NOT_REGISTERED"`, `"REGISTERED_IN_BUILT_IN_TEMPLATES"`, `"LIVE_IN_PRODUCTION"` |

---

### Process Tracking Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `researchStatus` | string | REQUIRED | Status of pre-implementation research. One of: `"NOT_STARTED"`, `"IN_PROGRESS"`, `"SYNTHESIZED"` |
| `researchBriefPath` | string\|null | REQUIRED | Path to the research brief document. `null` if research not yet done. Planned path: `"docs/templates/research/political/{vertical-slug}-official-site-brief.md"` |
| `lastReviewedAt` | string\|null | REQUIRED | ISO-8601 date of the last review of this record. Example: `"2026-04-26"`. |
| `implementedAt` | string\|null | REQUIRED | ISO-8601 date when `templateStatus` was set to `IMPLEMENTED`. `null` if not yet implemented. |
| `dependencies` | string[] | REQUIRED | List of repo dependencies that must exist before this template can be implemented. Includes the vertical package that will be created. Example: `["packages/verticals-governor"]`. Empty array `[]` if no dependencies beyond standard infra. |
| `blockers` | string[] | REQUIRED | Current blockers preventing progress. Empty array `[]` if unblocked. Common political blockers: `"CSV row not yet added — niche not yet canonical"`, `"Family anchor not yet IMPLEMENTED"`, `"INEC regulatory requirement unresolved"`. |
| `nextAction` | string | REQUIRED | The single most immediate action needed for this niche. Example: `"Add to 0004_verticals-master.csv and confirm VN-ID before claiming for research"` |
| `owner` | string\|null | REQUIRED | The agent or human currently responsible for this niche. `null` if unassigned. |
| `notes` | string | REQUIRED | Free-text notes. Use empty string `""` if no notes. |

---

### File Reference Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `templateFilePath` | string\|null | REQUIRED | The target path for the template implementation file. Set even before implementation begins — used as the planned path. `null` if path not yet determined. |
| `sqlSeedPath` | string\|null | REQUIRED | Path to the marketplace SQL seed file. `null` if not yet created. Planned path: `"infra/db/seeds/templates/{vertical-slug}-official-site.sql"` |

---

## Validation Rules

1. `nicheId` format must match regex: `^POL-[a-z0-9-]+-[a-z0-9-]+$`
2. `nicheId` must be globally unique within this registry
3. `verticalSlug` must be a valid proposed slug (lowercase, hyphenated) that is either already in `infra/db/seeds/0004_verticals-master.csv` or documented in `02-Political-Candidate-Registry.md` as a proposed niche
4. `pillar2Eligible` must be `true` — records where this is `false` do not belong in this registry
5. `templateStatus` must be one of the exact values listed in `political-template-status-codes.md`
6. `runtimeIntegrationStatus` must be one of: `NOT_REGISTERED`, `REGISTERED_IN_BUILT_IN_TEMPLATES`, `LIVE_IN_PRODUCTION`
7. `researchStatus` must be one of: `NOT_STARTED`, `IN_PROGRESS`, `SYNTHESIZED`
8. `nigeriaFirstPriority` must be `critical` for all political records (political niches are always critical Nigeria-first)
9. `templateVariantCount` must be a non-negative integer
10. When `templateStatus` is `IMPLEMENTED` or beyond, `primaryTemplatePath` must not be `null`
11. When `templateStatus` is `SHIPPED`, `runtimeIntegrationStatus` must be `LIVE_IN_PRODUCTION`
12. When `owner` is set, `templateStatus` should be `IMPLEMENTATION_IN_PROGRESS` or `RESEARCH_IN_PROGRESS`
13. When `familyRole` is `variant`, `familyDependency` must not be `null`
14. When `familyRole` is `anchor` or `standalone`, `familyDependency` must be `null`
15. `politicalFamily` must be one of: `NF-POL-ELC`, `NF-POL-APT`, `NF-POL-PTY`
16. `familyRole` must be one of: `anchor`, `variant`, `standalone`
17. `governmentTier` must be one of: `ward`, `lga`, `state`, `federal`, `party`
18. `supportedModes` must contain at least one of: `campaign`, `incumbent`, `post_office`, `presiding_officer`

---

## Pre-Activation Requirement (Political-Specific)

Before any niche record may transition from `READY_FOR_RESEARCH` to `RESEARCH_IN_PROGRESS`, the following must be true:

```
[ ] Collision audit verdict is CLEAR or DIFFERENTIATE in 07-Political-Collision-Analysis.md
[ ] CSV row exists in infra/db/seeds/0004_verticals-master.csv with status=planned
[ ] VN-ID is confirmed in docs/governance/canonical-niche-registry.md
[ ] NF-POL family is registered in docs/governance/niche-family-variant-register.md
[ ] If variant: family anchor templateStatus is IMPLEMENTED or SHIPPED
```

Until these conditions are met, the niche remains in `READY_FOR_RESEARCH` and may not be claimed.

---

## Schema Version

**Schema version:** 1.0.0  
**Base schema version:** Pillar 2 schema v1.0.0 (2026-04-25)  
**Compatible registry format:** JSON array of objects, each matching this schema  
**New fields added over base:** `proposedVnId`, `candidateScore`, `politicalFamily`, `familyRole`, `governmentTier`, `regulatoryBody`, `kycTierRequired`, `supportedModes`, `sprintAssignment`, `familyDependency`, `templateFilePath`, `sqlSeedPath`  
*Last updated: 2026-04-26*
