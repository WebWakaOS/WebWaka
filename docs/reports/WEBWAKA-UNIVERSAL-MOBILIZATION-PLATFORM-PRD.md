# WEBWAKA UNIVERSAL MOBILIZATION PLATFORM
## PRODUCT REQUIREMENTS DOCUMENT (PRD) v1.0

**Status:** Active — Pre-Launch Architecture Reset Window  
**Date:** April 28, 2026  
**Based on:** Verified architecture review + QA corrections (see blueprint + QA audit reports)  
**Repository state:** `staging` branch, HEAD `4daccfc`  
**Evidence standard:** All requirements are grounded in verified current-codebase reality. Where current code is the basis, file paths are cited. Where the requirement is aspirational, it is explicitly labeled as TARGET STATE.

---

## TABLE OF CONTENTS

- PART 1 — PRD Overview
- PART 2 — Product Vision
- PART 3 — Current-State Constraints
- PART 4 — Product Principles
- PART 5 — Universal Domain Model
- PART 6 — Product Architecture Model
- PART 7 — Preserve / Deprecate / Refactor / Build-New Matrix
- PART 8 — Module Requirements
- PART 9 — Template System Requirements
- PART 10 — Policy Engine Requirements
- PART 11 — Offline-First / Mobile-First / PWA-First Requirements
- PART 12 — AI / Superagent PRD
- PART 13 — Security / Trust / Compliance / Safety
- PART 14 — Local Context Requirements
- PART 15 — Phased Implementation Plan
- PART 16 — Backlog Structure
- PART 17 — Acceptance Criteria and Release Gates
- PART 18 — Risks, Assumptions, and Dependencies
- PART 19 — Launch Readiness Prerequisites
- PART 20 — Final Recommendation
- APPENDICES

---

## PART 1 — PRD OVERVIEW

### 1.1 Product Name

**WebWaka Universal Mobilization Platform**  
Codename: UMP  
Tenant-facing brand: WebWaka OS

### 1.2 PRD Purpose

This document specifies the product requirements for transforming the current WebWaka pre-launch codebase into a Universal Mobilization Platform. It serves as the binding authority for:
- architecture and engineering planning
- sprint and epic definition
- acceptance criteria
- release gate decisions
- QA strategy

It does not replace technical design documents (TDRs/ADRs) but supersedes any prior informal planning documents where they conflict with the verified code reality on which this PRD is based.

### 1.3 Background

WebWaka OS is a Nigeria-first multi-tenant white-label SaaS monorepo, currently pre-launch on Cloudflare Workers. As of the architecture review on April 28, 2026, the platform has:

- **12 deployable applications** (6 confirmed Workers + 3 frontends + 3 additional Workers)
- **199 packages** (40 functional + 159 industry verticals)
- **431 schema migrations** (392 in `apps/api/migrations/` through 0388; 43 additional in `infra/db/migrations/` from 0389-0431)
- **64 production API route files** covering operations, billing, identity, AI, civic, compliance, social, transport, POS, and more
- **7 subscription plans** (free / starter / growth / pro / enterprise / partner / sub_partner)
- **24 AI capabilities** across 3 pillars
- **168 AI vertical configurations**
- **159 industry vertical packages**

The most recently completed milestone (M9) delivered a Support Groups management system and a Fundraising engine. These were implemented as shared platform modules, but contain election-specific schema elements that must be generalized before public launch.

### 1.4 Why This Refactor Is Being Done Now

The pre-launch window is the last opportunity to make breaking changes without contractual or migration cost. Three classes of problems must be fixed now:

**Class 1 — Naming and scope debt (reversible now, expensive later)**
The `@webwaka/support-groups` package, its database tables, its API routes, and its event types use election-specific names and schema columns. Once external API consumers onboard, these become contractual obligations.

**Class 2 — Missing architectural layer (impossible to retrofit cleanly)**
There is no Policy Engine. Regulatory constraints (INEC campaign finance caps, CBN daily limits, NDPR retention periods) are hardcoded in package repositories. Every new regulated feature will repeat this pattern unless a Policy Engine is established now.

**Class 3 — Platform layer enum inconsistency**
`PlatformLayer` has 11 values in `packages/types/src/enums.ts` (`Civic`, `Political`, `Institutional`, `AI` exist) but only 7 of these are used in `plan-config.ts` layer arrays. The other 4 exist as dead code. This inconsistency creates both entitlement ambiguity and future engineering confusion.

### 1.5 Strategic Objective

Transform WebWaka from a vertically-oriented business management platform with organizing add-ons into a **Universal Mobilization Platform**: a composable system where any group — political, civic, faith, professional, cooperative, educational, or community — can organize people, manage shared resources, move value, and amplify their impact, using the same shared infrastructure, templated for their specific context.

The platform must be equally capable of supporting a ward councilor's constituency office, a church mothers' union, a youth cooperative in Kano, an NGO coordinating flood relief, a Borno state governor's support network, and a professional association in Lagos — without any bespoke code per use case.

---

## PART 2 — PRODUCT VISION

### 2.1 WebWaka Today

WebWaka is a 3-in-1 platform:
- **Pillar 1 (Operations):** Workspace management tools for 160+ industry verticals
- **Pillar 2 (Branding):** White-label public web presence (templates + WakaPage block builder)
- **Pillar 3 (Discovery):** Cross-tenant discovery marketplace with FTS5 search and geography filtering

**Current strength:** Deep infrastructure. The payment rails (Paystack), identity verification (BVN/NIN/CAC/FRSC via Prembly), multi-channel notifications, offline-first substrate, HITL AI governance, and NDPR consent architecture are production-grade.

**Current gap:** The organizing and mobilization capabilities (Support Groups, Fundraising) are named and partially structured for election use cases. The platform cannot yet express itself as a generic organizing tool without confusing election-specific terminology seeping through.

### 2.2 WebWaka Target State

A composable mobilization platform where:

1. **Any organizing entity** (political campaign, NGO, church, cooperative, alumni network) onboards as a workspace tenant
2. **A template** provides the vocabulary, workflows, and UI for their specific context
3. **Capability modules** (Groups, Value Movement, Events, Cases, Broadcasts, Petitions, Analytics) provide the shared functional primitives
4. **The Policy Engine** governs what each entity type can do based on jurisdiction, plan tier, and regulatory context
5. **AI capabilities** enhance every module — broadcast writing, member sentiment analysis, scheduling optimization, compliance monitoring — subject to NDPR consent and HITL governance
6. **Offline-first delivery** ensures field operators on 2G connections or intermittent power can still execute their work
7. **The discovery layer** connects beneficiaries and communities to the groups and services that serve them

### 2.3 Universal Mobilization Platform Definition

A **Universal Mobilization Platform** is a multi-tenant SaaS infrastructure that enables structured human organizing across any domain, at any scale, using composable shared primitives governed by configurable policies, delivered first on mobile, available offline.

**It is NOT:**
- A social network (no public feed, no viral content incentives)
- A single-purpose CRM (no lock-in to one organizing metaphor)
- An election-only tool (elections are one template among many)
- A US-centric organizing tool (built natively for Nigerian/African realities)

### 2.4 Target User Universe

| User type | Description | Primary device | Connectivity |
|-----------|-------------|---------------|-------------|
| Workspace owner/admin | Organization leader managing tenant | Android/desktop | Mixed |
| Group coordinator | Field organizer managing local chapter | Android, 2G/3G | Poor-to-moderate |
| Member/volunteer | Participant in groups and campaigns | Android | Mixed |
| Donor/contributor | Financial supporter of campaigns | Android/web | Moderate |
| Beneficiary/case subject | Person receiving services or aid | Android via proxy | Varies |
| Platform admin | WebWaka team managing tenants | Desktop | Good |
| Partner admin | Reseller managing branded instances | Desktop | Good |
| Public/discovery user | Anonymous visitor finding services | Android web | Mixed |

### 2.5 Target Use-Case Universe

Every use case below must be supportable without bespoke code — only template and configuration differences:

| Domain | Example workspace | Key modules used |
|--------|------------------|-----------------|
| Electoral organizing | Ward support group for senatorial candidate | Groups (electoral ext.), GOTV, Petitions, Broadcasts, Value Movement |
| Nonprofit | Youth empowerment NGO | Groups (civic ext.), Cases, Events, Value Movement (grants), Analytics |
| Mutual aid | Neighbourhood flood relief coordination | Groups, Cases (aid requests), Value Movement (mutual aid), Resources |
| Faith community | Lagos megachurch organizing structure | Groups (faith ext.), Events, Value Movement (tithe/dues), Knowledge |
| Professional association | Nigerian Bar Association chapter | Groups, Dues, Events, Knowledge, Cases (grievances) |
| Educational community | University alumni network | Groups, Events, Knowledge, Value Movement (scholarships) |
| Cooperative | Farmer savings and input cooperative | Groups (coop ext.), Value Movement (contributions/loans), Analytics |
| Constituency service | Local government councillor office | Cases, Groups, Events, Geography, Analytics |
| Advocacy campaign | Environmental petition organization | Petitions, Groups, Broadcasts, Events, Value Movement |
| Community health | Primary health outreach program | Cases, Groups, Resources, Events, Analytics |

---

## PART 3 — CURRENT-STATE CONSTRAINTS

### 3.1 What Exists in Code and Must Be Respected

**Non-negotiable infrastructure (must not be broken):**

| Capability | Location | Why non-negotiable |
|-----------|---------|-------------------|
| Multi-tenant JWT auth + T3 isolation | `packages/auth/src/jwt.ts` | Every API call depends on it; breaking it is catastrophic |
| Integer-kobo monetary invariant (P9) | `packages/payments/src/currency.ts` | Financial integrity; floats banned |
| NDPR consent gate (P10) | `packages/identity/src/consent.ts` | Legal requirement; removal is a compliance violation |
| PII stripping (P13) | Throughout, `publish-event.ts` | Data protection; NDPR |
| AI fetch-only (P7) | `packages/ai-adapters/` | No SDK lock-in; architecture invariant |
| USSD AI block (P12) | `apps/ussd-gateway/` middleware | CBN compliance |
| Paystack payment integration | `packages/payments/src/processor.ts` | Active payment rails |
| BVN/NIN/CAC/FRSC identity verification | `packages/identity/src/` | Active KYC flow |
| 431-migration schema | `infra/db/migrations/` | Active schema; breaking migrations is irreversible |
| Notification pipeline | `packages/notifications/src/` + `apps/notificator/` | Active event dispatch |
| Offline-sync substrate | `packages/offline-sync/src/` | PWA foundation |
| DSAR processor | `apps/schedulers/src/dsar-processor.ts` | Active NDPR COMP-002 compliance |
| Partner/sub-partner model | Migrations 0200-0203, 0273 | Channel architecture |

**Active schema tables (rename requires migration):**

All tables in migrations 0001-0431. Notable ones referenced throughout this PRD:
- `support_groups` (15 related tables) — to be renamed to `groups`
- `fundraising_campaigns` (11 related tables) — to be generalized
- `community_spaces` + LMS tables — to be kept, boundary clarified
- All financial tables (wallets, ledgers, contributions) — to be kept as-is
- All notification tables (templates, rules, events) — to be kept

### 3.2 Current Architecture That Can Be Leveraged

**Leverageable without modification:**
- Event bus (240+ event types; `packages/events`)
- Rule-driven notification engine (templates + routing rules = new event family in a migration)
- HITL system (usable for any human-approval workflow, not just AI)
- FSM engine (`packages/verticals/src/fsm.ts`) — `composeVerticalFSM` for any state machine
- Geography hierarchy (36 states, 774 LGAs, wards, polling units — seeded, usable by any module)
- Search index (FTS5, geography-aware, extensible — 0428/0429 added group/campaign facets)
- Policy-seeded D1 migration pattern — new policies are just rows in a `policy_rules` table
- Template registry + installation tracking — marketplace-ready

**Leverageable with minor extension:**
- Plan-config entitlement matrix — add new boolean flags per new module (established pattern)
- AI vertical config — add new slugs for new module types (established dual-update pattern)
- Offline-sync — register new module sync adapters (extension point exists)
- WakaPage block types — add new block types per new surface (established BlockType union)

### 3.3 What Current Architecture Creates Debt

| Debt | Location | Impact |
|------|---------|--------|
| Election terminology in shared modules | `support_groups` tables, events, routes | Every new non-political tenant sees electoral framing |
| INEC cap hardcoded in fundraising schema | `fundraising_campaigns.inec_cap_kobo` | Cannot model other compliance regimes |
| `PlatformLayer.Civic/Political/Institutional/AI` unused in plan-config | `packages/types/src/enums.ts` vs `plan-config.ts` | Dead enum values; entitlement gaps |
| No Policy Engine | Entire codebase | Regulatory constants scattered in 5+ packages |
| Dual AI config maintenance | `vertical-ai-config.ts` + SQL | Alignment risk per new vertical |
| No shared `@webwaka/ledger` | `packages/pos/` and `packages/hl-wallet/` both have their own CTE | Code duplication; next module will triplicate |
| Missing community/groups boundary doc | None | Engineers will continue adding to wrong package |
| `apps/partner-admin` is a stub | `apps/partner-admin/src/index.ts` has only /health + dashboard | Partner admin surface is incomplete |
| `PlatformLayer.AI` ungated | `packages/types/src/enums.ts` | AI access gated only by `aiRights: boolean`, not by a layer that can have geography/vertical policy |

---

## PART 4 — PRODUCT PRINCIPLES

These are engineering constraints, not slogans. Each has operational meaning.

### P1 — Build Once, Use Infinitely

**Meaning:** Every capability module is implemented once as a generic, configurable primitive. Vertical-specific behavior is achieved through extension tables (schema), template configuration (UI/vocabulary), and policy rules (constraints) — NOT through module forks or copy-paste.

**Operational rule:** Before writing a new module, check if an existing module can be extended. Before adding a column to a shared table, create an extension table. Before hardcoding a regulatory constant, add a row to `policy_rules`.

**Violation indicator:** A module that uses vertical-specific terminology as its primary naming convention (e.g., `gotv_records` in a generic `groups` table).

### P2 — Evidence Before Abstraction

**Meaning:** Abstract only when two or more concrete use cases share the same primitive. Don't pre-abstract for hypothetical future use cases.

**Operational rule:** The Cases module is built when constituency offices AND mutual aid coordinators both need it. The Workflow Engine is built when payout approval AND member onboarding workflows both need it.

### P3 — Policy Over Hardcoding

**Meaning:** Every regulatory constraint, compliance threshold, or business rule that may vary by jurisdiction, tenant type, or time must be externalized to the Policy Engine — not hardcoded in package code.

**Operational rule:** `INEC_DEFAULT_CAP_KOBO = 5_000_000_000` in a TypeScript file is a violation. `policyEngine.evaluate('financial_cap', { regime: 'inec', jurisdiction: 'NG' })` is correct.

### P4 — Core vs Module Separation

**Meaning:** Core Platform tables (tenant isolation, geography, identity, payments, auth, notifications) are shared infrastructure. Capability Module tables own their domain. No capability module may add columns to core tables; it must create extension tables.

**Operational rule:** `politician_id` in the `groups` table is a violation. `group_electoral_extensions.politician_id` FK-referencing `groups.id` is correct.

### P5 — Offline-First

**Meaning:** Every module that a field operator may use must define its offline behavior before its first deployment. Offline is not an afterthought.

**Operational rule:** Before merging a new API route, the owning module must have its sync adapter registered in `packages/offline-sync/src/module-registry.ts`.

### P6 — Mobile-First

**Meaning:** UI components, data payloads, and API responses are designed for a 4-inch Android screen on a 2G connection. Desktop is a secondary concern.

**Operational rule:** API list responses must support cursor-based pagination with a maximum default page size of 20. No response may exceed 50KB for list endpoints. All images served via R2 must have size-limited variants.

### P7 — PWA-First

**Meaning:** Every tenant-facing application installs as a PWA with an Add-to-Home-Screen flow, tenant-branded app icon, and at minimum read-only offline access.

**Operational rule:** Every new app must have a dynamic `manifest.json` endpoint that resolves tenant branding. Service worker registration is mandatory for all apps served to end users.

### P8 — Local-Context Suitability

**Meaning:** Features must work for users who have intermittent power, 2G connections, Android phones, multiple languages, informal organizational structures, and WhatsApp as their primary communication channel.

**Operational rule:** Any broadcast feature must support WhatsApp as a primary channel. Any notification must respect quiet hours. Any form must save drafts to IndexedDB before submission.

### P9 — Governance-Aware Architecture

**Meaning:** The platform must maintain its multi-agent governance model (Founder, Perplexity, Replit Agent 4, Base44). Every new capability must be accompanied by its TDR/ADR. Every new vertical must be listed in the canonical vertical register.

**Operational rule:** No feature is complete without its governance documentation. CI must reject merges that skip governance checks.

### P10 — Trust and Safety by Design

**Meaning:** Content moderation, consent gates, identity verification requirements, and HITL escalation paths are not optional add-ons. They are first-class design constraints for every module.

**Operational rule:** Every module that accepts user-generated content must invoke `content_moderation` before write. Every module that processes PII must invoke `assertConsentExists`. Every write-capable AI action in a sensitive vertical must queue for HITL.

---

## PART 5 — UNIVERSAL DOMAIN MODEL

### 5.1 Domain Object Definitions

The Universal Mobilization Platform operates on a unified domain model. Every template instance (electoral, civic, faith, etc.) uses these same objects with different vocabulary.

---

#### 5.1.1 Actor

**Purpose:** Any person who participates in platform activities.  
**Core fields:** `id`, `user_id` (platform auth identity), `workspace_id`, `tenant_id`, `display_name`, `verified_name` (from KYC), `kyc_tier` (0-3), `phone_hash`, `roles[]`, `channels` (phone/WhatsApp/Telegram/email — from `packages/contact`), `ndpr_consented`, `joined_at`  
**Relationships:** Member-of Groups, Creator-of Campaigns/Cases/Petitions, Contributor-to Value Movements, Assignee-of Tasks/Cases  
**Current WebWaka mapping:** `Individual` entity + `support_group_members` table + `workspace_memberships` table  
**Gap:** No unified "constituent" or "contact" record that spans modules (group membership, campaign donor, case subject) — addressed in Cases module

---

#### 5.1.2 Group / Network / Chapter

**Purpose:** A structured, persistent collection of people organized around a shared purpose.  
**Core fields:** `id`, `workspace_id`, `tenant_id`, `name`, `slug`, `description`, `category` (electoral/civic/faith/professional/educational/community/cooperative/interest), `visibility` (public/private/invite_only), `join_policy` (open/approval/invite_only), `parent_group_id` (hierarchy), `geography` (state/LGA/ward), `member_count`, `status`, `logo_url`, `constitution_url`, `ndpr_consent_required`  
**Relationships:** Has Members (Actors), Has Meetings, Has Broadcasts, Has Events, Has Petitions, Has Assets, Has an optional linked CommunitySpace, May have extension table per category  
**Current WebWaka mapping:** `support_groups` table (rename → `groups`)  
**Extension tables:** `group_electoral_extensions` (politician_id, campaign_office_id, inec_registration), `group_civic_extensions` (cac_registered, ngo_cert_number), `group_faith_extensions` (denomination, congregation_name), `group_cooperative_extensions` (registration_number, loan_fund_balance_kobo)

---

#### 5.1.3 Initiative / Campaign / Program

**Purpose:** A time-bounded, goal-oriented effort. May be financial (fundraising), advocacy (petition campaign), civic (outreach program), or organizational (membership drive).  
**Core fields:** `id`, `workspace_id`, `tenant_id`, `title`, `slug`, `description`, `initiative_type` (fundraising/advocacy/outreach/membership/awareness), `status`, `starts_at`, `ends_at`, `goal` (financial_kobo/signature_count/member_count depending on type), `current_progress`, `linked_group_id`, `visibility`, `compliance_regime` (null/inec/cbn/other), `ndpr_consent_required`, `cover_image_url`  
**Relationships:** Owned by Group or Workspace, Has Contributions (Value Movement), Has Actions, Has Updates, Has Milestones  
**Current WebWaka mapping:** `fundraising_campaigns` table (generalized) + petition sub-type in `support_group_petitions`

---

#### 5.1.4 Action

**Purpose:** A discrete, recordable activity performed by an Actor in service of an Initiative or Group.  
**Subtypes:** Vote confirmation (GOTV), Petition signature, Event attendance, Broadcast response, Case update, Pledge fulfillment, Training completion  
**Core fields:** `id`, `actor_id`, `action_type`, `entity_type` (group/initiative/case/event), `entity_id`, `recorded_at`, `coordinates` (optional), `verification_status`, `verified_by`  
**Current WebWaka mapping:** `support_group_gotv_records` + `support_group_petition_signatures` + `support_group_event_rsvps` (to be consolidated or clearly typed)

---

#### 5.1.5 Case / Request / Referral

**Purpose:** A request for service, assistance, or attention. Represents a specific need from a specific Actor, assigned to a handler, tracked to resolution.  
**Core fields:** `id`, `workspace_id`, `tenant_id`, `case_type` (constituency/referral/mutual_aid/issue/service/grievance), `status` (open/assigned/in_progress/resolved/closed/escalated), `priority`, `subject_actor_id`, `requestor_actor_id`, `assigned_to`, `title`, `description`, `linked_group_id`, `linked_campaign_id`, `place_id`, `ndpr_consented`, `created_at`, `due_date`, `resolved_at`  
**Relationships:** Has CaseNotes, Has CaseAssignments, Has CaseEscalations, May reference Group/Campaign/Place  
**Current WebWaka mapping:** Not yet built — new module

---

#### 5.1.6 Event / Meeting / Activity

**Purpose:** A scheduled gathering (physical, virtual, or hybrid) associated with a Group or Initiative.  
**Core fields:** `id`, `workspace_id`, `tenant_id`, `title`, `description`, `event_type` (rally/meeting/training/outreach/service/worship/general), `venue`, `place_id`, `starts_at`, `ends_at`, `is_virtual`, `join_url`, `status`, `expected_count`, `actual_count`, `rsvp_count`, `is_public`, `linked_group_id`  
**Relationships:** Has RSVPs (Actors), Has Attendance records, Has Resolutions (for formal meetings), May have agenda/minutes attachment  
**Current WebWaka mapping:** `support_group_events` + `support_group_meetings` (two tables for similar concepts — consolidate)

---

#### 5.1.7 Resource / Asset

**Purpose:** A physical or digital resource owned by a Group or Workspace and available for activities.  
**Core fields:** `id`, `workspace_id`, `tenant_id`, `linked_group_id`, `asset_name`, `asset_type` (material/vehicle/space/digital/financial), `quantity`, `quantity_unit`, `custodian_actor_id`, `status` (available/in_use/damaged/lost), `value_kobo`, `notes`  
**Current WebWaka mapping:** `support_group_assets` (rename → `group_assets`)

---

#### 5.1.8 Value Movement / Fund

**Purpose:** Any coordinated transfer of value (financial, material, or in-kind) within or across a community.  
**Subtypes:** Fundraising contribution, Dues payment, Mutual aid disbursement, Grant allocation, In-kind contribution, Tithe/offering  
**Core fields:** `id`, `campaign_id` or `group_id`, `workspace_id`, `tenant_id`, `movement_type`, `amount_kobo` (for financial), `material_description` (for in-kind), `status`, `contributor_actor_id`, `compliance_regime`, `ndpr_consented`  
**Current WebWaka mapping:** `fundraising_contributions` table (generalize to Value Movement)

---

#### 5.1.9 Broadcast / Communication

**Purpose:** A one-to-many message sent to Group members or Campaign supporters.  
**Core fields:** `id`, `linked_group_id` or `linked_campaign_id`, `workspace_id`, `tenant_id`, `sender_actor_id`, `title`, `body`, `channel` (in_app/sms/whatsapp/email/ussd_push), `audience_scope` (all/coordinators/ward/role_based), `status` (draft/queued/sent/failed), `sent_count`, `failed_count`, `scheduled_at`, `sent_at`  
**Current WebWaka mapping:** `support_group_broadcasts` (rename → `group_broadcasts`)

---

#### 5.1.10 Petition / Issue

**Purpose:** A public or private declaration of collective position, collecting signatures or endorsements.  
**Core fields:** `id`, `linked_group_id`, `workspace_id`, `tenant_id`, `title`, `body`, `target` (entity the petition addresses), `signature_count`, `status` (open/closed/delivered/archived), `visibility`, `created_by`  
**Relationships:** Has PetitionSignatures (Actors)  
**Current WebWaka mapping:** `support_group_petitions` + `support_group_petition_signatures` (rename → `group_petitions`)

---

#### 5.1.11 Territory / Geography

**Purpose:** A geographic unit at any level of the Nigerian (and future African) hierarchy.  
**Core fields:** `code`, `name`, `level` (nation/zone/state/lga/ward/polling_unit), `parent_code`, `coordinates`  
**Current WebWaka mapping:** Geography seed data (36 states, 774 LGAs, wards, polling units) — fully built  
**Note:** Ward and polling unit codes are legitimate geographic attributes for all organizing use cases, not just electoral. No renaming needed.

---

#### 5.1.12 Policy

**Purpose:** A runtime-evaluable rule governing what an Actor/Group/Campaign may or may not do, based on jurisdiction, plan tier, regulatory context, or tenant configuration.  
**Core fields:** `id`, `domain` (financial_cap/kyc_requirement/moderation/ai_governance/data_retention/access), `jurisdiction`, `tenant_id` (null=platform-wide), `vertical_slug`, `rule_key`, `rule_value` (JSON), `effective_from`, `effective_until`, `regulatory_reference`  
**Current WebWaka mapping:** Does not exist — new module (Policy Engine)

---

#### 5.1.13 Template

**Purpose:** A context package that configures the vocabulary, workflows, enabled modules, and visual identity for a specific organizing use case.  
**Core fields:** `id`, `template_key`, `display_name`, `category`, `enabled_modules[]`, `vocabulary_overrides` (JSON), `default_policies[]`, `default_workflows[]`, `icon`, `preview_image`  
**Current WebWaka mapping:** `template_registry` table (migration 0206) — extended for mobilization templates

---

#### 5.1.14 Document / Evidence

**Purpose:** A file attachment associated with any domain object (Case, Group, Campaign, Identity verification).  
**Core fields:** `id`, `entity_type`, `entity_id`, `workspace_id`, `tenant_id`, `document_type`, `file_url` (R2), `file_size_bytes`, `mime_type`, `uploaded_by`, `ndpr_classification` (public/private/sensitive), `uploaded_at`  
**Current WebWaka mapping:** Various `*_url` columns in tables — needs a unified `attachments` table

---

#### 5.1.15 Outcome / Resolution

**Purpose:** The recorded result of an Event/Meeting, Case resolution, or Campaign completion.  
**Core fields:** `id`, `entity_type`, `entity_id`, `workspace_id`, `tenant_id`, `outcome_type`, `description`, `recorded_by`, `recorded_at`, `attachments[]`  
**Current WebWaka mapping:** `support_group_resolutions` (rename → `group_resolutions`)

---

### 5.2 Domain Model Relationship Diagram

```
ACTOR ──────────────────┐
  │ member-of           │
  │ creates/owns        │ participates-in
  ▼                     ▼
GROUP ──────────── INITIATIVE/CAMPAIGN
  │ has                   │ receives
  │                       ▼
  ├── EVENTS          VALUE MOVEMENT
  ├── BROADCASTS      (contributions, dues,
  ├── PETITIONS        mutual aid, grants)
  ├── ASSETS
  ├── RESOLUTIONS     ──── POLICY (governs all)
  └── (ext tables)
                      CASE/REQUEST ◄── ACTOR (subject)
                        │ has             ACTOR (requestor)
                        ├── CASE NOTES
                        └── ESCALATIONS

All entities:
├── TERRITORY/GEOGRAPHY (place_id)
├── DOCUMENT/EVIDENCE (attachments)
└── TEMPLATE (configures vocabulary/modules)
```

---

## PART 6 — PRODUCT ARCHITECTURE MODEL

### 6.1 Layered Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                     DEPLOYMENT SURFACE (12 apps)                      │
│  api | brand-runtime | notificator | admin-dashboard | platform-admin │
│  ussd-gateway | public-discovery | projections | partner-admin         │
│  schedulers | tenant-public | workspace-app                            │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ calls
┌────────────────────────────▼─────────────────────────────────────────┐
│                       POLICY LAYER (new)                               │
│  PolicyEngine.evaluate(domain, context) → Decision                    │
│  Domains: financial_cap | kyc_requirement | moderation |              │
│           ai_governance | data_retention | access_control             │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ enforced by
┌────────────────────────────▼─────────────────────────────────────────┐
│                    CAPABILITY MODULES                                  │
│  Groups/Networks   │ Value Movement  │ Cases/Requests                 │
│  Events/Meetings   │ Broadcasts      │ Petitions                      │
│  Knowledge/LMS     │ Community/Social│ Analytics                      │
│  (each: generic core + vertical extension tables)                     │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ composed by
┌────────────────────────────▼─────────────────────────────────────────┐
│                      TEMPLATE LAYER                                    │
│  Electoral | Civic/Nonprofit | Mutual Aid | Faith | Professional      │
│  Cooperative | Constituency | Advocacy | Community Health             │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ runs on
┌────────────────────────────▼─────────────────────────────────────────┐
│                      CORE PLATFORM                                     │
│  Auth/JWT/RBAC  │ Geography      │ Multi-tenancy  │ Event Bus         │
│  Payments       │ Identity/KYC   │ Notifications  │ OTP               │
│  Offline-Sync   │ Search/FTS5    │ Ledger         │ AI/SuperAgent      │
│  Entitlements   │ DSAR/Schedulers│ Webhooks       │ Contact           │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Core Platform Components

**Mandatory shared infrastructure — not feature-gated:**

| Component | Package(s) | Role |
|-----------|-----------|------|
| Auth/JWT/RBAC | `@webwaka/auth`, `@webwaka/auth-tenancy` | Token lifecycle, tenant extraction, role enforcement |
| Multi-tenancy | `@webwaka/entities`, `@webwaka/types` | T3 invariant enforcement, entity CRUD |
| Geography | `packages/core/geography/` | Nigeria state/LGA/ward hierarchy, KV-cached |
| Payments | `@webwaka/payments` | Paystack integration, integer-kobo FSM |
| Identity/KYC | `@webwaka/identity`, `@webwaka/otp` | BVN/NIN/CAC/FRSC, OTP waterfall |
| Contact | `@webwaka/contact` | Multi-channel contact management, OTP routing (R8/R9/R10) |
| Notifications | `@webwaka/notifications`, `apps/notificator` | Rule-driven multi-channel dispatch |
| Event Bus | `@webwaka/events` | 240+ typed domain events, correlationId, source tagging |
| Offline-Sync | `@webwaka/offline-sync` | Dexie.js, Background Sync, SyncEngine |
| Ledger | `@webwaka/ledger` (new, extract from pos+hl-wallet) | Atomic CTE double-entry ledger |
| AI/SuperAgent | `@webwaka/ai-abstraction`, `@webwaka/ai-adapters`, `@webwaka/superagent` | Capability routing, HITL, WakaCU |
| Search | `@webwaka/search-indexing`, `apps/api/src/lib/search-index.ts` | FTS5, geography-aware |
| Entitlements | `@webwaka/entitlements` | Plan-config matrix, layer/feature guards |
| Logging | `@webwaka/logging` | PII-masked structured logging |
| DSAR | `apps/schedulers/src/dsar-processor.ts` | NDPR automated data export |

### 6.3 Capability Module Boundaries

Each capability module:
- Owns its tables (no other module may write to them directly)
- Publishes domain events to the Event Bus
- Defines its entitlement shape
- Registers its offline sync adapter
- Defines its AI config (if AI is used)
- Consults the Policy Engine before regulated actions
- Is accessible via the template layer (vocabulary, workflows)

**Module catalogue (current + planned):**

| Module | Status | Core package | Extension packages |
|--------|--------|-------------|-------------------|
| Groups/Networks | EXISTS — needs rename | `@webwaka/support-groups` → `@webwaka/groups` | groups-electoral, groups-civic, groups-faith, groups-cooperative |
| Value Movement | EXISTS — needs generalization | `@webwaka/fundraising` → `@webwaka/value-movement` | Electoral compliance ext. |
| Community/Learning | EXISTS | `@webwaka/community` | — |
| Social/Graph | EXISTS | `@webwaka/social` | — |
| Commerce/Offerings | EXISTS | `@webwaka/offerings` | — |
| Cases/Requests | NOT YET BUILT | `@webwaka/cases` (new) | cases-constituency, cases-mutual-aid |
| Workflows | NOT YET BUILT | `@webwaka/workflows` (new) | — |
| Analytics | PARTIAL | Fragmented — needs unification | — |
| White-label Branding | EXISTS | `@webwaka/white-label-theming` | — |
| Webhooks | EXISTS | `@webwaka/webhooks` | — |

### 6.4 Policy Engine Architecture

The Policy Engine is a new architectural layer between Capability Modules and Core Platform. It is not a feature module — it is infrastructure.

**Runtime evaluation model:**
```
PolicyEngine.evaluate(domain: string, context: PolicyContext): PolicyDecision
  → checks KV cache (TTL: 5 minutes)
  → on cache miss: queries policy_rules table with context selectors
  → returns: { decision: 'ALLOW' | 'REJECT' | 'REQUIRE_HITL', reason, cap?, requiresDisclosure? }
```

**Context selectors (priority order, most specific wins):**
1. tenant_id + vertical_slug + rule_key
2. tenant_id + rule_key
3. jurisdiction + vertical_slug + rule_key
4. jurisdiction + rule_key
5. global (tenant_id IS NULL, jurisdiction IS NULL)

### 6.5 AI/SuperAgent Cross-Cutting Layer

AI is not a pillar or a module — it is a cross-cutting capability that any module may invoke, subject to:
1. NDPR consent gate (P10) — enforced by `aiConsentGate` middleware
2. Capability whitelist per vertical slug — enforced by `getVerticalAiConfig`
3. PII strip (P13) — enforced by `compliance-filter.ts`
4. HITL queue for sensitive sectors — enforced by `hitl-service.ts`
5. Policy Engine — future enforcement of per-tenant AI policies
6. WakaCU billing — enforced by `CreditBurnEngine`

**24 AI Capabilities (verified):** `inventory_ai`, `pos_receipt_ai`, `shift_summary_ai`, `fraud_flag_ai`, `scheduling_assistant`, `demand_forecasting`, `route_optimizer` (Pillar 1); `bio_generator`, `brand_copywriter`, `brand_image_alt`, `seo_meta_ai`, `policy_summarizer` (Pillar 2); `listing_enhancer`, `review_summary`, `search_rerank`, `price_suggest`, `product_description_writer` (Pillar 3); `superagent_chat`, `function_call`, `embedding`, `content_moderation`, `sentiment_analysis`, `translation`, `document_extractor` (cross-pillar)

### 6.6 Search / Discovery / Public Surfaces

**Current:** FTS5 full-text search in D1, geography-filtered, cross-tenant discovery. Search entries support: individual, organization, group, fundraising_campaign, wakapage (as of migration 0422/0428).

**Target additions:** cases (public referral board), group events (public event discovery), dues/mutual-aid listings (community resource boards)

**Public surfaces:**
- `apps/public-discovery` — cross-tenant discovery Worker
- `apps/brand-runtime` — per-tenant branded public site (template-driven)
- `apps/tenant-public` — per-tenant white-label public discovery page

### 6.7 Event Bus / Audit / Analytics

**Current event bus:** 240+ typed events in `packages/events/src/event-types.ts`. Events flow: API → `publishEvent` → Cloudflare Queue → `apps/notificator` (consumer) → multi-channel dispatch.

**Audit:** `audit_logs` table with G23 invariant (no updates or deletes — append-only).

**Analytics:** Currently fragmented. Target: unified `analytics_events` table + nightly snapshot pipeline.

### 6.8 Integration Layer

**Current integrations:** Paystack (payments), Prembly/IdentityPass (KYC), Termii (SMS), Meta/360dialog (WhatsApp), Telegram Bot API, Google FCM (push), Resend (email), AWS4Fetch (R2 presigned URLs).

**Target additions:** Google Workspace (optional calendar sync for Events), WhatsApp Business API template management, webhook delivery to third-party systems (`@webwaka/webhooks` package exists).

---

## PART 7 — PRESERVE / DEPRECATE / REFACTOR / BUILD-NEW MATRIX

| Area | Current State | Action | Urgency | Rationale | Dependencies |
|------|-------------|--------|---------|-----------|-------------|
| Platform invariants (T3, P9, P10, P13, P14, P15, P7, P12) | Enforced in all reviewed code | **PRESERVE** | — | Core architectural discipline | None |
| Atomic CTE ledger pattern | Duplicated in pos + hl-wallet | **REFACTOR** — extract to `@webwaka/ledger` | P2 | DRY principle; next module will triplicate | None |
| Multi-channel notification engine | Production-ready | **PRESERVE** | — | Rule-driven, extensible, event-based | None |
| HITL system | Production-ready | **PRESERVE, extend** | — | Reuse for any human-approval workflow | None |
| Offline-sync substrate | Exists, gaps remain | **PRESERVE, extend** | P1 | New modules need sync adapters | Module scope definitions |
| DSAR processor (`apps/schedulers`) | Production-ready | **PRESERVE** | — | Active NDPR compliance (COMP-002) | None |
| `@webwaka/contact` | Production-ready (M7a/M7f) | **PRESERVE** | — | OTP routing, per-channel NDPR consent | None |
| `@webwaka/white-label-theming` | Production-ready | **PRESERVE** | — | Pillar 2 brand-walk mechanism | None |
| `@webwaka/webhooks` | Production-ready | **PRESERVE** | — | Integration delivery | None |
| `apps/partner-admin` | Stub only (health + dashboard) | **BUILD OUT** | P2 | Partner management surface needed | Partner model |
| Partner/sub-partner model | Production-ready | **PRESERVE** | — | Channel architecture | None |
| `@webwaka/support-groups` package | Complete but misnamed | **REFACTOR** — rename to `@webwaka/groups` | **P0** | Pre-launch API contract | None |
| `support_groups` DB tables (15) | Complete but misnamed | **REFACTOR** — rename to `groups_*` | **P0** | Migration before first tenant | None |
| `support_group.*` event types (15) | Complete but misnamed | **REFACTOR** — rename to `group.*` | **P0** | Same migration as DB rename | DB rename |
| `/support-groups` API routes | Complete but misnamed | **REFACTOR** — rename to `/groups` | **P0** | Same PR as package rename | Package rename |
| `SupportGroupBlock` WakaPage type | Complete but misnamed | **REFACTOR** — rename to `GroupBlock` | **P0** | Same PR | Package rename |
| `support_groups.politician_id` column | Vertical-specific in shared table | **DEPRECATE** — move to extension table | **P0** | P4 violation | Groups rename |
| `support_groups.campaign_office_id` column | Vertical-specific in shared table | **DEPRECATE** — move to extension table | **P0** | P4 violation | Groups rename |
| `support_group_gotv_records` table | Electoral-specific in shared schema | **DEPRECATE** — move to `political_gotv_records` | **P0** | P4 violation | Groups rename |
| `fundraising_campaigns.inec_cap_kobo` | Regulatory constant in shared table | **DEPRECATE** — move to Policy Engine | P1 | P3 violation | Policy Engine |
| `fundraising_campaigns.inec_disclosure_required` | Same | **DEPRECATE** | P1 | P3 violation | Policy Engine |
| `INEC_DEFAULT_CAP_KOBO` constant | Hardcoded in package | **DEPRECATE** — Policy Engine row | P1 | P3 violation | Policy Engine |
| `PlatformLayer.Civic/Political/Institutional/AI` unused | In enum, absent from plan-config | **REFACTOR** — wire into plan-config assignments | P1 | Dead code; entitlement gap | None |
| `sensitiveSectorRights` boolean in plan-config | Exists, gating political/clinic verticals | **PRESERVE, document** | P1 | Correct mechanism; must be documented | None |
| Policy Engine | Does not exist | **BUILD NEW** | P1 | P3 principle requires it | None |
| `@webwaka/cases` module | Does not exist | **BUILD NEW** | P1 | Domain model gap | Policy Engine |
| `@webwaka/workflows` module | Does not exist | **BUILD NEW** | P2 | Cross-module state machines | Cases, Groups |
| `@webwaka/ledger` (shared) | Duplicated in pos + hl-wallet | **BUILD NEW** | P2 | Extract + consolidate | None |
| `@webwaka/analytics` (unified) | Fragmented | **BUILD NEW** | P2 | Cross-module reporting | Event Bus |
| `group_electoral_extensions` table | Does not exist | **BUILD NEW** | **P0** | Extension table for GOTV/politician | Groups rename |
| `campaign_compliance_policies` table | Does not exist | **BUILD NEW** | P1 | Policy Engine storage for financial caps | Policy Engine |
| `cases` + `case_notes` tables | Do not exist | **BUILD NEW** | P1 | Cases module | None |
| Dual AI config maintenance | TS + SQL both required | **REFACTOR** — CI alignment check | P2 | Reduce drift risk | CI |
| Community/Groups boundary | Undefined | **DOCUMENT + enforce** | P1 | Prevents mis-use of wrong module | None |
| `apps/tenant-public` | Exists as Worker, minimal | **PRESERVE, enhance** | P2 | Tenant public discovery site | White-label-theming |
| `apps/workspace-app` | React app, minimal | **PRESERVE, enhance** | P2 | Workspace UI | None |
| Duplicate Event/Meeting tables | `sg_events` + `sg_meetings` both exist | **CONSOLIDATE** | P1 | Same concept, two tables | Groups rename |
| 19 ADRs | Present in decisions/ | **PRESERVE** | — | Authoritative decisions | None |
| `@webwaka/i18n` (6 locales) | Exists; completeness unverified | **AUDIT + complete** | P2 | Hausa/Igbo/Yoruba may be incomplete | None |

---

## PART 8 — MODULE REQUIREMENTS

### 8.1 Groups and Organizing Module

**Purpose:** Enable structured, persistent organizing of people around a shared goal — across electoral, civic, faith, professional, cooperative, educational, and community contexts.

**Users:** Workspace admin (group admin), Group coordinators, Members, Public (limited discovery)

**Key workflows:**
1. Create group → set category/visibility/join policy → share invite link
2. Member joins (open) or requests to join (approval) → coordinator approves → member gets welcome notification
3. Coordinator schedules meeting → sends broadcast → records attendance/resolutions
4. Coordinator sends broadcast to all/segment (in-app/SMS/WhatsApp/email) — plan-gated
5. Coordinator creates event → members RSVP → post-event: attendance recorded
6. Group creates petition → members sign → petition delivered
7. Electoral: GOTV coordinator records voter mobilization → vote confirmation recorded (extension module only)
8. Group asset registry: custodian assigned, status tracked

**Functional Requirements:**

| FR# | Requirement | Priority | Plan gate |
|-----|------------|---------|----------|
| FR-GRP-01 | Create/update/archive group with name, description, category, visibility, join_policy | P0 | Starter+ |
| FR-GRP-02 | Member join (open) and join request (approval) flows with notification triggers | P0 | Starter+ |
| FR-GRP-03 | Coordinator can approve/reject/suspend members | P0 | Starter+ |
| FR-GRP-04 | Role assignment within group (coordinator/secretary/treasurer/member/observer) | P0 | Starter+ |
| FR-GRP-05 | Parent-child group hierarchy (subgroups/chapters) | P0 | Growth+ |
| FR-GRP-06 | Broadcast creation + multi-channel dispatch (in_app always; SMS/WhatsApp/email plan-gated) | P0 | Starter+ (in_app); Growth+ (SMS+email); Pro+ (WhatsApp) |
| FR-GRP-07 | Scheduled broadcast (future datetime) | P1 | Growth+ |
| FR-GRP-08 | Meeting scheduling, agenda, attendance, minutes recording | P0 | Starter+ |
| FR-GRP-09 | Resolution recording linked to meeting | P0 | Growth+ |
| FR-GRP-10 | Group event creation + RSVP + attendance | P0 | Starter+ |
| FR-GRP-11 | Petition creation, signature collection, delivery | P0 | Starter+ |
| FR-GRP-12 | Group asset registry (add/update/transfer/dispose) | P1 | Growth+ |
| FR-GRP-13 | Group analytics snapshot (member growth, broadcast reach, event attendance) | P1 | Growth+ |
| FR-GRP-14 | Committee creation and member assignment | P1 | Growth+ |
| FR-GRP-15 | Constitution/charter document upload and versioning | P2 | Growth+ |
| FR-GRP-16 | Link group to community space (optional) | P2 | Growth+ |
| FR-GRP-17 | Public group discovery (if visibility=public) | P0 | All (free can discover) |
| FR-GRP-18 | WakaPage GroupBlock — embed group card on public page | P1 | Starter+ |
| FR-GRP-19 | Electoral extension: GOTV record, voter mobilization, vote confirmation | P0 (extension) | Starter+ with `sensitiveSectorRights` |
| FR-GRP-20 | Electoral extension: link to politician/campaign_office entity | P0 (extension) | Pro+ with `sensitiveSectorRights` |

**Non-Functional Requirements:**
- All group DB operations must include `tenant_id` and `workspace_id` (T3)
- Broadcasts must invoke `content_moderation` AI capability before dispatch
- GOTV records must include `polling_unit_code` (valid Nigerian electoral geography)
- Group visibility transitions must publish domain events (`group.updated`)
- Group list API: max 50 items per page, cursor-based pagination
- Broadcast delivery: WhatsApp message must be queued to Cloudflare Queue; not blocking

**Dependencies:** Policy Engine (for max-group-count enforcement), Notification Engine (for broadcasts), Geography (for place_id, state/LGA/ward), Events (GroupEventType), Entitlements (SupportGroupEntitlements)

**Data implications:** Groups table rename (0432 migration). New extension tables (`group_electoral_extensions`, `group_civic_extensions`). Consolidated event/meeting tables.

**Policy implications:** Max groups per plan enforced via Policy Engine (not hardcoded). Broadcast channel access policy (channel × plan tier matrix).

**AI implications:** `brand_copywriter` for broadcast drafting (pro+ plan gate). `content_moderation` mandatory pre-dispatch. `scheduling_assistant` for meeting time optimization.

**Offline implications:** Group member list: cache-first (last 200 members). Broadcast draft: offline-queued (write to IndexedDB; sync on reconnect). Meeting attendance: offline-queued (critical field operation).

**Success metrics:** Groups created per workspace per month; broadcast open rate (in-app); member retention rate (30-day); petition signature velocity.

---

### 8.2 Value Movement Module

**Purpose:** Enable coordinated transfer of value (financial, in-kind, dues) within or across communities, with compliance regime enforcement via Policy Engine.

**Users:** Campaign creator (workspace admin/coordinator), Contributors/Donors, Payout requestors, Compliance reviewers

**Key workflows:**
1. Create campaign (type: fundraising/dues/mutual_aid/awareness) → publish → share link
2. Contributor visits public campaign page → makes payment (Paystack) → confirmation notification
3. Campaign creator requests payout → HITL review → bank transfer (Paystack)
4. Compliance declaration submitted for regulated campaign types
5. Dues collection: group creates dues schedule → members pay via link → payment recorded
6. Mutual aid: member requests aid → group votes/coordinator approves → disbursement recorded

**Functional Requirements:**

| FR# | Requirement | Priority | Plan gate |
|-----|------------|---------|----------|
| FR-VM-01 | Create fundraising campaign with title, story, goal, visibility | P0 | Starter+ |
| FR-VM-02 | Public campaign page via brand-runtime (WakaPage FundraisingBlock) | P0 | Starter+ |
| FR-VM-03 | Paystack payment integration (card + NUBAN bank transfer) | P0 | Starter+ |
| FR-VM-04 | Contribution tracking: donor_user_id, amount_kobo (int), channel, status | P0 | Starter+ |
| FR-VM-05 | NDPR consent capture before contribution (P10) | P0 | All |
| FR-VM-06 | Anonymous contribution option | P0 | Starter+ |
| FR-VM-07 | Donor wall (public display of contributors, if not anonymous) | P0 | Starter+ |
| FR-VM-08 | Campaign milestones + updates | P1 | Growth+ |
| FR-VM-09 | Pledge creation and recurring pledge management | P1 | Growth+ |
| FR-VM-10 | Payout request → HITL approval → Paystack transfer | P0 | Growth+ |
| FR-VM-11 | Compliance declaration (for regulated campaign types) | P0 | All (auto-enforced by Policy Engine) |
| FR-VM-12 | Campaign finance cap enforcement (via Policy Engine, not hardcoded) | P0 | Policy Engine required |
| FR-VM-13 | INEC disclosure: auto-trigger when campaign_type=political AND regime=inec | P0 | Policy Engine |
| FR-VM-14 | Donor rewards (reward tiers, claim tracking) | P2 | Pro+ |
| FR-VM-15 | Dues collection (group-linked, recurring schedule, member dues status) | P1 | Growth+ |
| FR-VM-16 | Mutual aid request + group voting + disbursement tracking | P2 | Growth+ |
| FR-VM-17 | In-kind contribution tracking (material/service, no payment flow) | P2 | Growth+ |
| FR-VM-18 | Campaign analytics (raised_kobo, contributor_count, daily velocity) | P1 | Growth+ |
| FR-VM-19 | WakaPage FundraisingBlock — embed campaign widget on public page | P0 | Starter+ |
| FR-VM-20 | Tithe bridge migration (existing tithe records → value movement contributions) | P0 | Migration only |

**Non-Functional Requirements:**
- All contribution amounts INTEGER kobo (P9) — no float fields anywhere
- NDPR consent captured and verified before any PII processing (P10)
- Payout requests require HITL (level 1 minimum; level 2 for amounts > policy threshold)
- Campaign finance cap checked via Policy Engine before each contribution confirmation
- `donor_phone`, `pledger_phone`, `bank_account_number` excluded from AI context (P13)
- Contributions are append-only (no edits after confirmation)

**Dependencies:** Policy Engine (compliance caps), Payments (Paystack), Ledger (payout tracking), HITL (payout approval), Notifications (campaign events), Entitlements (FundraisingEntitlements)

**Policy implications:** INEC campaign cap (₦5bn/₦50m) is a Policy Engine row, not a schema column. CBN threshold for mandatory disclosure is a Policy Engine row.

**AI implications:** `brand_copywriter` for campaign story drafting. `content_moderation` for campaign body before publish. `sentiment_analysis` for donor feedback.

---

### 8.3 Cases / Requests / Referrals Module

**Purpose:** Track and resolve specific requests for assistance, services, or attention from individual actors. Primary use cases: constituency casework, NGO referrals, mutual aid requests, community issue reports, grievance handling.

**Users:** Requestor (any actor), Caseworker/Handler (coordinator/admin), Supervisor (admin), Subject of case

**Key workflows:**
1. Requestor submits case (constituency issue, aid request, referral, complaint)
2. Case assigned to caseworker → caseworker reviews → adds internal/external notes
3. Status updated at each stage → notifications triggered
4. Case escalated if unresolved by due date
5. Case resolved → outcome recorded → requestor notified
6. Analytics: case volume, resolution time, status distribution

**Functional Requirements:**

| FR# | Requirement | Priority | Plan gate |
|-----|------------|---------|----------|
| FR-CS-01 | Case creation (type, title, description, subject, linked group/geography) | P0 | Growth+ |
| FR-CS-02 | Case assignment to handler | P0 | Growth+ |
| FR-CS-03 | Case status machine (open→assigned→in_progress→resolved→closed/escalated) | P0 | Growth+ |
| FR-CS-04 | Case notes: internal (handler-only) and external (visible to requestor) | P0 | Growth+ |
| FR-CS-05 | NDPR consent before capturing sensitive case subject data | P0 | All |
| FR-CS-06 | Priority levels (low/normal/high/urgent) | P0 | Growth+ |
| FR-CS-07 | Due date tracking + automatic escalation notifications | P1 | Growth+ |
| FR-CS-08 | Attachment/document upload per case (R2) | P1 | Growth+ |
| FR-CS-09 | Link case to group, campaign, or geography | P1 | Growth+ |
| FR-CS-10 | Case analytics: volume, average resolution time, status breakdown | P1 | Pro+ |
| FR-CS-11 | Public referral board (if visibility=public): post and browse open requests | P2 | Pro+ |
| FR-CS-12 | Constituency extension: map case to LGA/ward, link to elected representative | P2 | Enterprise+ with `sensitiveSectorRights` |
| FR-CS-13 | AI case summary: `superagent_chat` for case note drafting | P2 | Pro+ |
| FR-CS-14 | Bulk case import (CSV for case migration) | P2 | Enterprise |

---

### 8.4 Events and Activities Module

**Purpose:** Schedule, promote, and record structured gatherings associated with groups or campaigns.

**Note:** Currently two parallel tables exist (`support_group_events` and `support_group_meetings`). These will be consolidated into a single `group_events` table with `event_type` distinguishing formal meetings (with agenda/resolutions/quorum) from public events (with RSVPs/ticket_count).

**Functional Requirements:**

| FR# | Requirement | Priority |
|-----|------------|---------|
| FR-EV-01 | Event creation (type: meeting/rally/training/outreach/service/worship/general) | P0 |
| FR-EV-02 | Physical/virtual/hybrid venue + join URL | P0 |
| FR-EV-03 | RSVP collection (internal members + public if is_public=true) | P0 |
| FR-EV-04 | Attendance recording (expected vs actual) | P0 |
| FR-EV-05 | Agenda and minutes recording (for formal meetings) | P0 |
| FR-EV-06 | Quorum tracking for formal meetings | P1 |
| FR-EV-07 | Resolution recording linked to meeting | P1 |
| FR-EV-08 | Event broadcast notification to group members | P0 |
| FR-EV-09 | Public event discovery (geography-filtered) | P1 |
| FR-EV-10 | Event analytics (RSVP count, attendance rate, no-show rate) | P1 |

---

### 8.5 Broadcasts / Communications Module

**Purpose:** Send targeted messages from group coordinators or campaign managers to their audience via multiple channels.

**Included in Groups module but called out separately for clarity.**

**Channel matrix (verified from `SupportGroupEntitlements`):**

| Channel | Plan availability | Notes |
|---------|-----------------|-------|
| in_app | All plans (free:1 group max) | Always available |
| sms | Starter+ | Termii; rate-limited |
| email | Growth+ | Resend; template-rendered |
| whatsapp | Pro+ | Meta/360dialog; pre-approved templates |
| ussd_push | Enterprise only | Termii USSD push |

**Functional Requirements:**
- FR-BC-01: Draft broadcast (subject to auto-save to IndexedDB offline)
- FR-BC-02: Channel selection (limited by plan entitlement)
- FR-BC-03: Audience targeting (all members / by role / by ward / by status)
- FR-BC-04: Content moderation check before queuing (P15)
- FR-BC-05: Scheduled delivery
- FR-BC-06: Delivery tracking (sent_count, failed_count, bounce handling)
- FR-BC-07: AI draft assistance (`brand_copywriter` capability, pro+)

---

### 8.6 Search / Discovery / Public Surfaces Module

**Purpose:** Enable cross-tenant and within-tenant discovery of groups, campaigns, events, cases (referral board), and entity profiles.

**Current state:** FTS5 search with geography filtering exists. Facets: group_type, campaign_type, state_code, lga_code, ward_code, discovery_score.

**Functional Requirements:**
- FR-DISC-01: Full-text search with geography filtering (state/LGA/ward)
- FR-DISC-02: Entity-type filtering (group/campaign/individual/organization/offering)
- FR-DISC-03: Discovery score weighting (verified entities rank higher)
- FR-DISC-04: Public group profile page (via brand-runtime template)
- FR-DISC-05: Public campaign page (via brand-runtime FundraisingBlock)
- FR-DISC-06: Claim-intent capture (unclaimed profiles)
- FR-DISC-07: Public referral board (cases with visibility=public)
- FR-DISC-08: Nearby entities (geography-driven, approximate distance)

---

### 8.7 Analytics / Reporting Module

**Purpose:** Provide workspace admins and group coordinators with actionable visibility into organizing effectiveness.

**Current state:** Fragmented. Per-module snapshot tables (`support_group_analytics`, `ai_usage_events`, `notification_event`, KV-based page views). No unified analytics interface.

**Target state:** Unified `analytics_events` table. Nightly snapshot job in `apps/projections`. Per-module dashboard API.

**Functional Requirements:**
- FR-AN-01: Group analytics (member growth, broadcast reach, event attendance, petition signatures)
- FR-AN-02: Campaign analytics (raised_kobo, contributor_count, daily velocity, payout status)
- FR-AN-03: Case analytics (volume, resolution time, status distribution)
- FR-AN-04: Workspace-level rollup (all groups, all campaigns, all cases)
- FR-AN-05: Partner-level analytics (cross-workspace aggregates for partner admin)
- FR-AN-06: Export to CSV (GDPR/NDPR compliant — no raw PII in exports)
- FR-AN-07: AI analytics summary (`shift_summary_ai` pattern extended to organizing domain)

---

### 8.8 Knowledge / Training Module

**Purpose:** Enable groups and workspaces to create learning content, training materials, and knowledge bases for members and coordinators.

**Current state:** `packages/community` includes LMS functionality (courses, lessons). Community spaces provide channel-based discussion.

**Requirements:** This module is largely built. Boundary clarification (Part 8.10) is the primary need.

---

### 8.9 Geography Engine

**Purpose:** Provide the geographic hierarchy (nation → zone → state → LGA → ward → polling unit) as a shared infrastructure service for all modules.

**Current state:** Fully built. 36 states, 774 LGAs, wards, and polling units seeded. KV-cached. Used by groups (place_id, state/LGA/ward_code), search, cases, GOTV.

**Requirements (target):**
- FR-GEO-01: Expose state/LGA/ward/polling-unit lookup via API
- FR-GEO-02: KV cache for geography data (TTL 24h)
- FR-GEO-03: Support geographic filtering in all list APIs (state_code, lga_code, ward_code parameters)
- FR-GEO-04: Future: Ghana, Kenya state/district hierarchy (Phase 6)

---

### 8.10 Community / Learning — Boundary Clarification

**Authoritative boundary decision:**

| Feature | Module | Rationale |
|---------|--------|---------|
| Discussion channels (text, voice) | Community | Social interaction, not organizing |
| LMS (courses, lessons, quizzes) | Community | Learning delivery |
| Group live events (rallies, meetings) | Groups | Organizing activity |
| Group broadcasts | Groups | Mobilization communication |
| Community announcements | Community | Ambient social content |
| Formal meeting resolutions | Groups | Governance record |

**Implementation rule:** A group MAY have a linked `community_space_id` (nullable FK) for its discussion/learning needs. The two entities are separate and independently manageable.

---

### 8.11 Entitlements / Permissions Module

**Purpose:** Gate feature access by subscription plan, platform layer, and sensitive-sector status.

**Current state:** `packages/entitlements/src/plan-config.ts` is the single source of truth. Plan-config has 7 plans with `layers[]`, `brandingRights`, `aiRights`, `sensitiveSectorRights`, `wakaPagePublicPage`, `wakaPageAnalytics`, `supportGroupsEnabled`, `fundraisingEnabled`.

**Required additions:**
- Rename `supportGroupsEnabled` → `groupsEnabled`
- Add `mobilizationGroupsEnabled` (alias or new)
- Add `casesEnabled: boolean` and `maxCases: number`
- Wire `PlatformLayer.Civic` into starter+ layers
- Wire `PlatformLayer.Political` into enterprise+ with `sensitiveSectorRights: true`
- Wire `PlatformLayer.Institutional` into enterprise+ layers
- Wire `PlatformLayer.AI` into growth+ layers (currently gated by `aiRights` boolean only)
- Add `valueMovementEnabled` (rename from fundraisingEnabled)

**Corrected plan-config layer assignments:**

| Plan | Layers | sensitiveSectorRights | aiRights |
|------|--------|--------------------|---------|
| free | Discovery | false | false |
| starter | Discovery, Operational, Civic | false | false |
| growth | Discovery, Operational, Commerce, Civic, AI | false | true |
| pro | Discovery, Operational, Commerce, Transport, Professional, Creator, Civic, AI | false | true |
| enterprise | All (including Political, Institutional, WhiteLabel) | true | true |
| partner | All | true | true |
| sub_partner | Discovery, Operational, Commerce, WhiteLabel, Civic, AI | false | true |

---

## PART 9 — TEMPLATE SYSTEM REQUIREMENTS

### 9.1 Template Architecture

Templates are configuration packages that compose capability modules into specific organizing experiences. A template does NOT change code — it changes:
- Module vocabulary (via translation/display-name overrides)
- Enabled/disabled capability modules
- Default policies applied on workspace creation
- Default workflows registered
- WakaPage starter blocks
- AI persona configuration
- Dashboard layout presets

**Template registry schema (existing, from migration 0206, to be extended):**
```sql
-- Existing: template_registry, template_installations
-- Add: template_module_config (JSON), template_policies (JSON), template_workflows (JSON)
ALTER TABLE template_registry ADD COLUMN module_config TEXT DEFAULT '{}'; -- JSON
ALTER TABLE template_registry ADD COLUMN default_policies TEXT DEFAULT '[]'; -- JSON array of policy rules
ALTER TABLE template_registry ADD COLUMN vocabulary TEXT DEFAULT '{}'; -- JSON term overrides
```

### 9.2 Starter Template Catalogue

---

#### T01 — Electoral / Political Mobilization

**Key modules:** Groups (electoral extension), Value Movement (INEC compliance), Events, Broadcasts, Petitions, Analytics  
**Vocabulary overrides:** Group→"Support Group", Member→"Supporter", Coordinator→"Campaign Coordinator", Event→"Rally", Petition→"Call-to-Action"  
**Special policies:** INEC campaign finance cap (₦50m for presidential equivalent; policy-configured per race type), mandatory INEC disclosure above ₦1m  
**Default workflows:** GOTV activation → voter mobilization → vote confirmation  
**Key dashboards:** Member count by ward, Broadcast reach by LGA, GOTV tracking map, Campaign finance summary  
**Data sensitivity:** HIGH (voter_ref, supporter_phone under P13; sensitiveSectorRights required)  
**Extension package required:** `@webwaka/groups-electoral`

---

#### T02 — Civic / Nonprofit / Volunteer

**Key modules:** Groups (civic extension), Cases, Events, Value Movement (grants/donations), Analytics  
**Vocabulary overrides:** Group→"Team" or "Chapter", Member→"Volunteer", Case→"Beneficiary Case", Contribution→"Donation"  
**Special policies:** Standard fundraising rules; no INEC constraint  
**Default workflows:** Beneficiary intake → case assignment → case resolution  
**Key dashboards:** Volunteer count, Beneficiary cases resolved, Donations received, Program impact  
**Data sensitivity:** MEDIUM (beneficiary data under NDPR P10)  
**Extension package:** `@webwaka/groups-civic`

---

#### T03 — Mutual Aid Network

**Key modules:** Groups, Cases (mutual aid requests), Value Movement (mutual aid disbursements), Events, Broadcasts  
**Vocabulary overrides:** Group→"Network", Member→"Neighbor", Case→"Aid Request", Contribution→"Gift", Coordinator→"Steward"  
**Special policies:** Mutual aid disbursement HITL (level 1 for amounts < policy threshold; level 2 above)  
**Default workflows:** Aid request submitted → network vote (or coordinator approval) → disbursement recorded  
**Key dashboards:** Open aid requests, Aid dispatched (kobo), Network members, Response time  
**Data sensitivity:** MEDIUM-HIGH (financial need data is sensitive)

---

#### T04 — Advocacy / Petition Campaign

**Key modules:** Groups, Petitions, Value Movement (campaign funding), Broadcasts, Events (marches/forums)  
**Vocabulary overrides:** Group→"Coalition", Member→"Advocate", Petition→"Demand", Coordinator→"Lead Organizer"  
**Special policies:** Standard; petition signature privacy (anonymous option)  
**Default workflows:** Petition launched → signature campaign → delivery to target  
**Key dashboards:** Signature count, Broadcast reach, Endorsing organizations, Petition status

---

#### T05 — Constituency Service / Public Office

**Key modules:** Cases (constituency casework), Groups (ward chapters), Events (town halls), Broadcasts (constituent updates), Analytics  
**Vocabulary overrides:** Group→"Ward Network", Case→"Constituency Case", Member→"Constituent"  
**Special policies:** Constituency cases: NDPR sensitivity high; case handler must be workspace member; no public case data without consent  
**Default workflows:** Case intake → assignment to ward coordinator → resolution → constituent notification  
**Key dashboards:** Cases by LGA/ward, Resolution time, Open cases by type, Constituent satisfaction  
**Data sensitivity:** HIGH (constituent personal data, medical referrals, family situations)  
**Extension:** `@webwaka/groups-electoral` + `@webwaka/cases-constituency`

---

#### T06 — Faith Community

**Key modules:** Groups (faith extension), Value Movement (tithe/dues/offerings), Events (services/programs), Knowledge/LMS (sermons/studies), Broadcasts  
**Vocabulary overrides:** Group→"Ministry" or "Unit", Member→"Member", Contribution→"Tithe" or "Offering", Coordinator→"Unit Leader"  
**Special policies:** Tithe records are personal financial data (P13); requires NDPR consent for individual tithe tracking  
**Default workflows:** Member enrolment → unit assignment → tithe schedule → event attendance  
**Key dashboards:** Total offerings, Attendance trends, Ministry growth, Programme calendar  
**Data sensitivity:** MEDIUM (individual giving amounts are sensitive)  
**Extension:** `@webwaka/groups-faith`

---

#### T07 — Association / Cooperative

**Key modules:** Groups (cooperative extension), Value Movement (dues/savings/loans), Events (AGM/meetings), Cases (member disputes/grievances), Analytics  
**Vocabulary overrides:** Group→"Association" or "Cooperative", Member→"Member", Dues→"Levy" or "Contribution", Case→"Grievance"  
**Special policies:** Loan approval: HITL level 2; dues default: policy-configurable grace period  
**Default workflows:** Membership application → dues onboarding → savings cycle → loan request → loan approval  
**Key dashboards:** Dues collection rate, Loan portfolio, Member growth, Savings balance  
**Extension:** `@webwaka/groups-cooperative`

---

#### T08 — Personal / Community Assistance

**Key modules:** Cases (aid requests), Value Movement (personal fundraising), Groups (support network)  
**Vocabulary overrides:** Group→"Support Circle", Case→"Help Request", Contribution→"Support Gift"  
**Special policies:** Public campaign pages for personal fundraising; personal story is high-sensitivity PII  
**Default workflows:** Personal campaign created → family/friends share → contributions received → payout  
**Data sensitivity:** HIGH (personal circumstances)

---

#### T09 — Business / Member / Customer Community

**Key modules:** Groups, Events, Knowledge/LMS, Commerce/Offerings, Value Movement (membership fees)  
**Vocabulary overrides:** Group→"Community", Member→"Member", Coordinator→"Community Manager", Event→"Meetup" or "Workshop"  
**Special policies:** Standard business policies; commerce layer required (Growth+)  
**Default workflows:** Member signup → onboarding → engagement activities → renewal  
**Data sensitivity:** LOW-MEDIUM

---

### 9.3 Template Engine Technical Requirements

- TR-T-01: Template activation at workspace creation (select from template catalogue)
- TR-T-02: Template vocabulary stored in KV for fast resolution
- TR-T-03: Template vocabulary overrides applied in UI layer — not in DB layer (DB always uses canonical terms)
- TR-T-04: Multiple templates may be installed per workspace (e.g., an NGO using both civic and mutual-aid templates)
- TR-T-05: Template policies are seeded into `policy_rules` table on workspace creation with tenant_id = workspace.tenant_id
- TR-T-06: Template can be upgraded (new template version installs over old without data loss)
- TR-T-07: Partner can create custom templates scoped to their sub-workspaces

---

## PART 10 — POLICY ENGINE REQUIREMENTS

### 10.1 Policy Domains

| Domain | Description | Example rule_key | Example rule_value |
|--------|------------|-----------------|-------------------|
| `financial_cap` | Maximum amounts for financial transactions | `campaign_finance_cap` | `{"cap_kobo": 5000000000, "requires_disclosure_above_kobo": 100000000}` |
| `kyc_requirement` | Minimum KYC tier for an action | `payout_kyc_tier` | `{"min_tier": 2}` |
| `moderation` | Content moderation policy per content type | `broadcast_moderation_policy` | `{"auto_approve": false, "requires_hitl": true, "auto_remove_threshold": 0.95}` |
| `ai_governance` | Per-tenant AI autonomy and capability restrictions | `max_autonomy_level` | `{"max_autonomy": 2, "hitl_required": true}` |
| `data_retention` | NDPR data retention periods per data category | `contributor_phone_retention_days` | `{"days": 365, "action_on_expiry": "pseudonymize"}` |
| `access_control` | Join policies, visibility, role-based access | `group_join_requires_kyc_tier` | `{"min_tier": 1}` |
| `compliance_regime` | Regulatory compliance requirements per campaign type | `inec_cap_active` | `{"active": true, "cap_kobo": 5000000000}` |

### 10.2 Policy Storage Model

```sql
CREATE TABLE policy_rules (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  jurisdiction TEXT NOT NULL DEFAULT 'NG',
  tenant_id TEXT,          -- NULL = platform-wide; set = tenant-specific override
  vertical_slug TEXT,      -- NULL = all; set = specific vertical/template
  rule_key TEXT NOT NULL,
  rule_value TEXT NOT NULL, -- JSON
  effective_from TEXT NOT NULL DEFAULT (datetime('now')),
  effective_until TEXT,    -- NULL = permanent
  regulatory_reference TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX idx_policy_rules_lookup ON policy_rules(
  domain, rule_key, jurisdiction,
  COALESCE(tenant_id,''), COALESCE(vertical_slug,'')
);
```

### 10.3 Runtime Enforcement Model

```
PolicyEngine.evaluate({
  domain: 'financial_cap',
  context: {
    tenantId: 'wk_tenant_xxx',
    verticalSlug: 'fundraising',
    jurisdiction: 'NG',
    regime: 'inec'
  }
}) → PolicyDecision {
  decision: 'ALLOW' | 'REJECT' | 'REQUIRE_HITL',
  reason: string,
  cap?: number,           // for financial_cap domain
  requiresDisclosure?: boolean
}
```

**Cache:** Policy decisions are cached in KV with 5-minute TTL. Cache key: `policy:{domain}:{rule_key}:{tenant_id}:{vertical_slug}:{jurisdiction}`.

**Audit:** Every `REJECT` or `REQUIRE_HITL` decision is appended to `audit_logs` with `action='policy_enforcement'`.

### 10.4 Approval Logic (HITL Integration)

When `PolicyDecision.decision === 'REQUIRE_HITL'`, the requesting operation is paused and a HITL queue entry is created:
- Level 1: Workspace admin approves (for routine compliance checks)
- Level 2: Designated reviewer (for financial thresholds, sensitive sector AI)
- Level 3: Regulatory window — 72h mandatory hold (for political financial disclosures, large payouts)

### 10.5 AI Policy Controls

Policy Engine governs AI usage beyond the current capability whitelist:
- `ai_governance.max_autonomy_level`: Cap AI autonomy at tenant level (overrides vertical default)
- `ai_governance.prohibited_capabilities`: Additional capability blocks at tenant level
- `ai_governance.require_hitl_above_kobo`: Auto-queue AI-generated payment actions for HITL
- `ai_governance.data_exclusion_fields`: Additional PII fields to strip per tenant (extends P13)

### 10.6 Offline Policy Controls

Policies must be available offline for critical enforcement:
- Financial caps are cached to IndexedDB on last sync
- If offline and cap cannot be verified → `REQUIRE_HITL` (optimistically accept, flag for review on reconnect)
- `data_retention` policies run server-side only (scheduler job)

### 10.7 Visibility, Verification, and Consent Rules

| Policy key | Default | Who can override |
|-----------|---------|-----------------|
| `group.join_requires_phone_verified` | false | Workspace admin (policy_rules row) |
| `campaign.contribution_requires_consent` | true (P10) | Cannot be overridden — platform invariant |
| `group.public_member_list` | false | Workspace admin |
| `case.subject_ndpr_consent_required` | true | Cannot be overridden |
| `broadcast.content_moderation_required` | true (P15) | Cannot be overridden |

### 10.8 Safety and Moderation Rules

| Rule | Enforcement | Override allowed |
|------|------------|-----------------|
| `content_moderation` before all broadcasts | Platform-level (P15) | No |
| `content_moderation` before petition body publish | Platform-level (P15) | No |
| Auto-remove threshold (score > 0.95) | Policy Engine default | Admin can set lower; never higher |
| HITL for sensitive sector AI write actions | HITL service | No |
| Case handler must be workspace member | Access control policy | No |

---

## PART 11 — OFFLINE-FIRST / MOBILE-FIRST / PWA-FIRST REQUIREMENTS

### 11.1 Local Storage Model

**Technology:** Dexie.js (IndexedDB wrapper) — currently in `packages/offline-sync/src/db.ts`

**Per-module cache budgets:**

| Module | Cache budget | Sync scope |
|--------|-------------|-----------|
| Groups (member list) | 10 MB | Last 200 active members per group |
| Groups (broadcasts draft) | 2 MB | All unsent drafts |
| Value Movement | 5 MB | Active campaigns + recent contributions |
| Cases | 5 MB | Open cases assigned to current user |
| Events | 3 MB | Next 30 days events per workspace |
| Notifications (In-App) | 3 MB | Last 100 notifications |
| Geography | 5 MB | State/LGA/ward data (long TTL) |
| Policy rules (critical) | 1 MB | Financial caps + moderation policies |
| TOTAL system budget | 34 MB | Per-workspace per-user |

**Eviction policy:** LRU per module. On storage pressure, evict oldest non-queued items first. Never evict pending sync queue items.

### 11.2 Sync Model

**Incremental sync protocol (new, required):**
```
GET /sync/delta?module=groups&last_synced_at=<ISO8601>&workspace_id=<id>
→ {
    changes: [{ table, operation, id, data }],
    deletes: [{ table, id }],
    server_time: '<ISO8601>',
    has_more: boolean,
    next_cursor: string | null
  }
```

**Modules requiring sync support (with last_synced_at tracking):**
- groups (P1)
- group_members (P1)
- group_broadcasts_draft (P1 — offline-queued writes)
- group_events (P1)
- cases (P1)
- case_notes (P1 — append-only)
- notifications (existing)
- geography (long TTL, infrequent)

**Background sync tags (per-module, replacing single global tag):**
- `webwaka-groups-sync`
- `webwaka-cases-sync`
- `webwaka-notifications-sync`
- `webwaka-geography-sync`

### 11.3 Conflict Resolution Model

| Data type | Strategy | Rationale |
|-----------|---------|-----------|
| Group status (active/archived) | Server-Wins | Authoritative state machine |
| Member roles | Server-Wins | Coordinator makes the call |
| Broadcast draft body | Last-Write-Wins with timestamp | Creative content; user's work matters |
| Case notes | Append-only (no conflict possible) | All notes are additive |
| Financial amounts | Server-Wins | Never override server financial records |
| Event RSVP | Optimistic (accept locally) + verify on sync | Better UX; low-stakes if wrong |
| Petition signatures | Idempotent insert (clientId as dedup key) | Prevent double-counting |
| GOTV records | Server-Wins | Electoral integrity |

### 11.4 Installability Requirements

- PR-PWA-01: Every tenant-facing app (`apps/workspace-app`, `apps/tenant-public`, `apps/brand-runtime`) must serve a valid `manifest.json` via a dynamic endpoint resolving tenant branding
- PR-PWA-02: `manifest.json` must include tenant `name`, `short_name`, `theme_color` (from `primaryColor`), `background_color`, `icons` (from `logoUrl` at 192px and 512px)
- PR-PWA-03: Service worker registration is mandatory for all tenant-facing apps
- PR-PWA-04: "Add to Home Screen" flow must be triggered after the user completes their first successful action (not on first load)
- PR-PWA-05: Installed PWA must show the tenant's branding (not WebWaka branding) by default for partner deployments

### 11.5 Background Behavior

- PR-BG-01: Background Sync must retry on reconnect with exponential backoff (30s → 2m → 10m → 30m → 1h → give up after 5 attempts)
- PR-BG-02: Failed sync items are flagged in UI with count badge (`<ww-sync-pending-badge>` component)
- PR-BG-03: Power-cut recovery: broadcast draft auto-saved to IndexedDB every 5 seconds
- PR-BG-04: On logout: clear PII data from IndexedDB (voter_ref, donor phone, bank details, case subject data)

### 11.6 Low-Bandwidth Mode

- PR-LB-01: All API list responses must be ≤ 50KB with default page size ≤ 20
- PR-LB-02: Images served via R2 must have size variants: thumbnail (100px), card (400px), full (max 1200px)
- PR-LB-03: Broadcast bodies must be stored/served as compressed text; no base64-embedded images in API payloads
- PR-LB-04: Geography cache (state/LGA/ward) must be pre-loaded on first login and served from IndexedDB thereafter — zero API calls for geography lookups in normal operation
- PR-LB-05: Campaign page must be server-side rendered from brand-runtime with CDN caching (TTL 24h) — no JS required for public campaign visibility

### 11.7 Offline UX Requirements

**Design System components required (in `packages/design-system`):**
- `<ww-offline-indicator>` — persistent top-bar indicator showing sync status (online/offline/syncing)
- `<ww-sync-pending-badge count={n}>` — badge showing count of pending offline operations
- `<ww-draft-autosave-indicator>` — small in-form indicator showing last auto-save timestamp
- `<ww-conflict-notification message={msg}>` — toast shown when server-wins resolved a conflict

### 11.8 Device Realities

The target device profile:
- Android 9-13, 2-4GB RAM, 32-64GB storage (16-32GB usable)
- Tecno, Infinix, Itel, Samsung A-series
- 2G/3G connection with frequent drop-out; 4G in major cities
- 6-12 hours of power per day outside Lagos/Abuja; power bank standard
- Shared devices in field teams (coordinator may share phone with volunteers)
- WhatsApp as primary notification channel

**Engineering consequences:**
- Main thread must never be blocked by sync operations (service worker handles all sync)
- Batch DB writes within transactions to minimize disk I/O on low-spec storage
- No infinite scroll (causes memory pressure on 2GB RAM); use load-more pagination
- All forms must be safe to navigate away from (auto-draft prevents data loss)

### 11.9 Offline Acceptance Criteria

- AC-OFF-01: A coordinator with zero connectivity can draft a broadcast, save it, and send it within 30 seconds of reconnecting
- AC-OFF-02: Meeting attendance can be recorded offline for ≥ 200 attendees and synced without data loss on reconnect
- AC-OFF-03: Group member list displays within 2 seconds on a device with no connectivity (from IndexedDB)
- AC-OFF-04: GOTV recording operates fully offline and syncs with server-wins conflict resolution
- AC-OFF-05: Financial operations (contributions, pledges) are blocked when offline — no offline financial queue
- AC-OFF-06: PII data is cleared from IndexedDB on explicit logout within 500ms

---

## PART 12 — AI / SUPERAGENT PRD

### 12.1 Role of AI in the Universal Platform

AI is a cross-cutting advisory layer. It does not make decisions — it generates recommendations, drafts content, classifies signals, and produces summaries. Human action (or HITL approval) is always required before irreversible operations.

AI is NOT:
- A primary user interface (chatbot-first design is rejected)
- A replacement for human coordinators
- An autonomous actor with write access to production data (max autonomy = 2/L2 Advisory)
- A feature that runs before NDPR consent is granted

### 12.2 Allowed AI Use Cases

| Use case | Capability | Plan gate | HITL required |
|---------|-----------|----------|--------------|
| Broadcast message draft | `brand_copywriter` | Pro+ | No (content_moderation runs pre-publish) |
| Meeting agenda suggestion | `scheduling_assistant` | Growth+ | No |
| Campaign story draft | `brand_copywriter` | Pro+ | No |
| Member sentiment analysis | `sentiment_analysis` | Pro+ | No |
| Petition body moderation | `content_moderation` | Growth+ | No |
| Case note summary | `superagent_chat` | Pro+ | No |
| Group bio generation | `bio_generator` | Growth+ | No |
| Translation to Hausa/Igbo/Yoruba/Pidgin | `translation` | Growth+ | No |
| Document extraction (CAC cert, ID docs) | `document_extractor` | Enterprise | Yes (L2) |
| Fraud detection in contributions | `fraud_flag_ai` | Pro+ | Yes (L1) |

### 12.3 Governed AI Use Cases (HITL Required)

| Use case | HITL level | Reason |
|---------|-----------|--------|
| Any write-capable AI in political vertical | L2 | Sensitive sector |
| AI-assisted payout approval | L2 | Financial |
| AI-generated INEC compliance declaration | L3 | Regulatory |
| Document extraction for KYC | L2 | Identity verification |
| Automated case assignment by AI | L1 | Human oversight required |

### 12.4 Prohibited AI Use Cases

- Processing voter_ref, polling_unit data, BVN, NIN in AI context (P13 PII exclusion)
- AI on USSD channel (P12 invariant)
- AI for autonomous financial transactions (max autonomy = 2)
- AI-generated content published without content_moderation check
- AI processing before NDPR consent confirmed (P10)
- AI for automated account decisions affecting access or membership (NDPR Article 2.8)

### 12.5 Capability Routing

All AI calls follow the existing 5-level resolver chain:
1. User BYOK (Bring Your Own Key)
2. Workspace BYOK
3. Platform key (current default)
4. Aggregator (OpenRouter/Groq)
5. Fallback

No AI SDK imports — all calls are raw `fetch` (P7). Provider implementations in `packages/ai-adapters/`.

### 12.6 Template-Aware AI Behavior

Each organizing template may define a `superagent_persona` in its template configuration:
```json
{
  "superagent_persona": {
    "name": "Amaka",
    "tone": "professional and encouraging",
    "language_preference": "Nigerian English",
    "locality_hints": ["Anambra", "Southeast Nigeria"]
  }
}
```
This persona is injected as a system prompt prefix when AI capabilities are invoked from that workspace, without exposing any PII.

### 12.7 Evidence, Privacy, and Auditability

- All AI requests and responses are logged to `ai_hitl_queue` (when HITL) or `ai_usage_events` (all calls)
- Raw AI payloads are never logged (P13) — only metadata (capability, slug, tokens_used, decision)
- NDPR Article 22 compliance: users may opt out of AI processing of their data via consent management
- AI consent is separate from NDPR general consent — can be revoked independently

### 12.8 New Capabilities Roadmap

| Capability | Description | Phase |
|-----------|------------|-------|
| `mobilization_analytics` | Predict optimal broadcast time, member engagement drop-off, GOTV conversion rate | Phase 5 |
| `broadcast_scheduler` | AI-recommended broadcast schedule based on member activity patterns | Phase 5 |
| `member_segmentation` | Auto-segment members by activity, geography, engagement for targeted broadcast | Phase 5 |
| `petition_optimizer` | Suggest petition body improvements for higher signature conversion | Phase 5 |
| `case_classifier` | Auto-classify incoming cases by type, urgency, and optimal handler | Phase 5 |

---

## PART 13 — SECURITY / TRUST / COMPLIANCE / SAFETY

### 13.1 Identity and Verification Tiers

| Tier | Requirements | Platform gate |
|------|-------------|--------------|
| Tier 0 | Phone number captured | Account creation |
| Tier 1 | Phone OTP verified | Basic access |
| Tier 2 | BVN verified (Prembly/Paystack) | Financial operations (wallet, payouts) |
| Tier 3 | NIN + face match OR CAC verified | Sensitive sector access, high-value payouts |

**KYC gating in code:** `packages/identity/src/consent.ts` `assertConsentExists` + `packages/otp/src/channel-router.ts` R8/R9/R10 enforcement. Both enforced server-side; client cannot bypass.

### 13.2 Data Minimization

- Collect only data needed for the specific operation (NDPR Article 2.1(b))
- `SELECT *` is banned — all queries must list specific columns
- PII fields in API list responses must be excluded per P13 annotation
- Phone numbers stored as hashed values in search/logs; plaintext only in encrypted D1 column
- AI context excludes: voter_ref, donor_phone, pledger_phone, bank_account_number, BVN, NIN

### 13.3 Content Moderation Architecture

**Three-layer moderation stack:**
1. **Automated (P15):** `content_moderation` AI capability runs before any user-generated content is written. Score > configured threshold = auto-reject.
2. **HITL (for borderline):** Score between lower and upper thresholds = queue to moderation review.
3. **Community reporting (future, Phase 2):** Members can flag content; flags accumulate and trigger HITL.

**Covered surfaces:** Broadcast body, petition body, case description, community posts (existing), WakaPage content, group description, campaign story.

### 13.4 Abuse Prevention

- Rate limiting: 5 OTP/hr per phone (SMS/WhatsApp), 3/hr (Telegram) — enforced in `packages/otp/src/channel-router.ts`
- Identity lookup rate limiting: 2 BVN/NIN lookups per user per hour — KV-backed
- Campaign contribution rate limiting: 10 attempts per IP per minute (Paystack webhook handles duplicate detection)
- GOTV record deduplication: UNIQUE constraint on (voter_ref, group_id, tenant_id) — database-level
- Petition signature deduplication: UNIQUE on (user_id, petition_id, tenant_id)

### 13.5 Audit Logs

- G23 invariant: `audit_logs` is append-only (no UPDATE or DELETE ever)
- Every state transition for cases, groups, campaigns, HITL items, payout requests must create an audit_log entry
- DSAR export includes audit_logs for the requesting user
- Audit log retention: 7 years (policy_rules row: `data_retention.audit_log_retention_days = 2555`)

### 13.6 Consent and Privacy Controls

- NDPR consent: Required before PII capture (P10 invariant, `packages/identity/src/consent.ts`)
- Per-channel consent: `@webwaka/contact` enforces `assertChannelConsent` before each OTP channel
- AI consent: Separate from general NDPR consent; controlled by `ai_consent_records` table
- DSAR: `POST /compliance/dsar/request` submits; `apps/schedulers` processes automated export within 72h
- Right to erasure: Implemented via pseudonymization on retention expiry (NDPR Art. 2.8)

### 13.7 Sensitive Workflow Handling

**Sensitive verticals** (`sensitiveSectorRights: true` on enterprise/partner plans only):
- politician, political-party, campaign-office
- clinic, hospital, pharmacy
- legal (barrister, law-firm, notary)

For these verticals:
- All AI write actions require HITL L2+
- Data exports include NDPR notice that sensitive health/legal/political data requires additional processing agreement
- Group electoral extensions are only accessible with `sensitiveSectorRights: true`

### 13.8 Local-Context Trust Concerns

- **Impersonation:** A coordinator claiming to be an elected official must verify via the `politician` or `constituency-office` vertical (CAC/INEC registration required). Group naming policies must prevent impersonation of official bodies.
- **Voter bribery risk:** GOTV records track mobilization, not voting choices. `vote_confirmed` field records only confirmation that a registered voter accessed the polling unit, not how they voted.
- **Data export risk:** DSAR exports must be served via single-use signed URLs (R2 pre-signed, 1h TTL) — not kept as long-lived links.
- **Agent fraud:** POS agent wallets (float ledger) use atomic CTE to prevent race condition fraud.

---

## PART 14 — LOCAL CONTEXT REQUIREMENTS

### 14.1 Connectivity Requirements

- All API responses must include `ETag` headers and support conditional `If-None-Match` requests to reduce re-transfer on slow connections
- Brand-runtime public pages must be edge-cached with 24-hour TTL (Cloudflare Cache-Control)
- No mandatory file uploads > 5MB for field operations (compress images client-side before upload)
- USSD fallback must be available for critical one-way actions (broadcast receive, GOTV confirmation) on feature phones

### 14.2 Android-First Requirements

- Minimum supported Android version: Android 9 (API 28)
- Minimum Chrome for Android version: 80
- No Web Bluetooth, Web USB, or other bleeding-edge APIs
- IndexedDB storage must be tested on 8GB internal storage devices (available ~4GB)
- All animations must be off-able via `prefers-reduced-motion`
- Font sizes minimum 16px for body text (legibility on small screens)

### 14.3 Informal Structure Support

Nigerian organizing is structured around informal hierarchies that don't map cleanly to Western org charts. The platform must accommodate:

| Informal structure | How platform supports it |
|-------------------|------------------------|
| Ajo/Esusu (rotating savings) | Cooperative template + dues schedule |
| Age grades | Group with age-based entry criteria (coordinator approval) |
| Town unions | Civic template with executive committee |
| Market associations | Association template + dues + case (disputes) |
| Church mothers' union | Faith template + faith extension |
| PTA | Group + dues + events |
| Street/neighbourhood watch | Community template + cases (issue reports) |
| Academic levels (100L, 200L, etc.) | Subgroup hierarchy within parent alumni group |

### 14.4 Location Granularity

The Nigerian geography hierarchy (state → LGA → ward → polling unit) is already seeded. The platform must use this hierarchy for:
- Group location tagging (default: LGA level; can specify ward)
- GOTV records (polling unit level mandatory)
- Case geography (ward level for constituency casework)
- Broadcast audience targeting (ward_code filter in broadcasts, plan-gated)
- Discovery filtering (geography-aware search)

**Future:** Ghana (region/district), Kenya (county/constituency) hierarchy will follow the same seeding pattern.

### 14.5 Language / Accessibility

**Current:** 6 locales: en, fr, ha (Hausa), ig (Igbo), pcm (Pidgin), yo (Yoruba).

**Required:**
- FR-L10N-01: All user-facing strings must be in i18n files — no hardcoded English strings in components
- FR-L10N-02: i18n completeness audit before launch: flag any empty/placeholder keys in ha, ig, yo
- FR-L10N-03: SMS notifications must respect recipient's language preference (resolved from `contact.language_preference`)
- FR-L10N-04: WhatsApp template submissions must include Hausa, Yoruba, Igbo variants for approval (Meta policy requirement)

**Accessibility:**
- FR-A11Y-01: All interactive elements must have `aria-label` attributes
- FR-A11Y-02: Color contrast ratio ≥ 4.5:1 for all text
- FR-A11Y-03: All forms must work with keyboard navigation only

### 14.6 Low-Literacy Support

- FR-LL-01: All key actions (join group, confirm attendance, sign petition) must complete in ≤ 3 taps
- FR-LL-02: Status indicators must use color + icon + text (never color alone)
- FR-LL-03: Campaign donation flow must work without reading the campaign story (visual amount selector + big payment button)
- FR-LL-04 (future, Phase 4): Voice note attachment for case descriptions

### 14.7 Payment and Social Realities

- Paystack NUBAN (bank transfer) is the preferred payment method for most Nigerians; card is secondary. Both must be offered on every payment screen.
- WhatsApp shares must generate meaningful OpenGraph previews (og:title, og:image, og:description) from brand-runtime for campaigns, group pages, and events
- "Pay what you can" (zero minimum) contributions must be configurable per campaign — some mutual aid campaigns accept any amount
- Corporate giving (organization-to-campaign contribution) requires CAC verification of the contributing organization

---

## PART 15 — PHASED IMPLEMENTATION PLAN

### Phase 0 — Pre-Launch Architecture Reset (Weeks 1–4)

**Objective:** Fix all naming and structural problems before any external API consumer onboards. Non-negotiable.

**Scope:** No new features. Only renames, schema corrections, dead-code cleanup, and Policy Engine skeleton.

**In scope:**
1. Rename `packages/support-groups` → `packages/groups` (all TypeScript types, functions, exports)
2. New migration `0432_rename_support_groups_to_groups.sql`: rename all 15 `support_groups_*` tables to `groups_*`; rename indexes
3. New migration `0433_group_electoral_extensions.sql`: create `group_electoral_extensions` table; drop `politician_id` and `campaign_office_id` from `groups` table; create `political_gotv_records` table (moved from groups schema)
4. Move GOTV types/functions from `packages/groups` to new `packages/groups-electoral`
5. Rename all 15 `SupportGroupEventType` constants to `GroupEventType` in `packages/events`
6. New migration for notification template ID renames (55 templates: `tpl_sg_*` → `tpl_grp_*`)
7. New migration for notification routing rule renames (27 rules: `rule_sg_*` → `rule_grp_*`)
8. Rename API route prefix `/support-groups` → `/groups` in `apps/api/src/routes/`
9. Update `apps/api/src/index.ts` router registration
10. Rename WakaPage block type `'support_group'` → `'group'` in `packages/wakapage-blocks`
11. Rename plan-config keys: `supportGroupsEnabled` → `groupsEnabled`
12. New migration `0434_policy_engine_skeleton.sql`: create `policy_rules` table; seed INEC cap row, CBN OTP limits, NDPR retention periods
13. Create `packages/policy-engine/` skeleton: `types.ts`, `engine.ts` (stub evaluators), `loader.ts`
14. New migration `0435_fundraising_compliance_regime.sql`: add `compliance_regime TEXT` to `fundraising_campaigns`; add `campaign_compliance_policies` table; seed INEC regime; deprecate `inec_cap_kobo` column (keep with NULL default for migration path, remove in 0436)
15. Wire `PlatformLayer.Civic` into starter+ in plan-config; `PlatformLayer.Political` into enterprise+; `PlatformLayer.AI` into growth+ (correcting dead enum values)
16. Rename plan-config key `fundraisingEnabled` → `valueMovementEnabled`
17. Update all CI governance checks for new names
18. Add AI config alignment CI check (`scripts/governance-checks/ai-config-alignment-check.ts`)

**Out of scope:** Any new features, new modules, new AI capabilities.

**Dependencies:** All current tests (93 passing) must remain green throughout.

**Technical prerequisites:** None (pre-launch; no external API consumers).

**Product prerequisites:** Founder approval of rename decisions.

**QA requirements:** Full test suite must pass after each migration. Typecheck must pass (`pnpm -r typecheck`). All 48 module tests must pass with new names. E2E smoke test for groups + fundraising routes.

**Exit criteria:**
- All table names use `groups_*` prefix
- All package names use `@webwaka/groups` and `@webwaka/value-movement`
- All API routes use `/groups/` prefix
- `policy_rules` table exists with INEC cap seeded
- `PlatformLayer.Civic/Political/Institutional/AI` assigned to appropriate plans
- Zero failing tests
- Typecheck passes

**Risks:**
- Migration errors on table rename: use `ALTER TABLE ... RENAME` (SQLite supported); test on local D1 emulator
- Import graph breaks: automated find-replace + TSC compile to catch stragglers
- Notification template ID mismatch: validate against existing notification_events in staging

---

### Phase 1 — Core Platform Refactor Foundations (Weeks 5–14)

**Objective:** Build the missing foundational systems (Policy Engine, Cases module, Ledger extraction, offline scope extension) that unblock all later phases.

**In scope:**
1. **Policy Engine full MVP** (`packages/policy-engine`): Financial cap evaluator, KYC requirement evaluator, moderation policy evaluator, AI governance evaluator, data retention evaluator. KV cache (5-min TTL). Audit logging. Integration with fundraising campaign finance cap check.
2. **`packages/cases` module**: Schema (cases, case_notes tables), repository, entitlements (Growth+ plan gate), API routes (`/cases/*`), events (CaseEventType in events package), notification templates+rules for case lifecycle, AI config entry
3. **`@webwaka/ledger` extraction**: Create package, extract atomic CTE pattern from `packages/pos/src/float-ledger.ts` and `packages/hl-wallet/src/ledger.ts`, update both to import from shared package
4. **Offline scope for Groups + Cases**: Register sync adapters in module registry; implement per-module sync tags in service worker
5. **Optimistic UI components**: `<ww-offline-indicator>`, `<ww-sync-pending-badge>`, `<ww-draft-autosave-indicator>` in `packages/design-system`
6. **Tenant-branded dynamic PWA manifest**: Dynamic `manifest.json` endpoint in `apps/brand-runtime`, `apps/tenant-public`, `apps/workspace-app`
7. **Community/Groups boundary documentation**: Code comments, governance doc, lint rule
8. **PlatformLayer.Civic wiring in plan-config**: Already done in Phase 0; verify and test
9. **i18n audit**: Enumerate missing keys in ha, ig, yo; initiate translation process
10. **Incremental sync protocol**: `GET /sync/delta` endpoint in `apps/api`

**Out of scope:** New AI capabilities, partner-admin buildout, Value Movement sub-types beyond fundraising.

**Dependencies:** Phase 0 complete.

**QA requirements:** 
- Policy Engine: unit tests for each evaluator domain, boundary conditions (at-cap, above-cap, jurisdiction mismatch)
- Cases: 24 tests minimum (mirroring support-groups pattern)
- Ledger: regression tests on POS and hl-wallet post-extraction
- Offline: manual test on emulated 2G + power-cut simulation

**Exit criteria:**
- Policy Engine evaluates INEC cap correctly and is wired into fundraising payout flow
- Cases module: create → assign → note → resolve flow works end-to-end
- `@webwaka/ledger` tests pass; POS and hl-wallet tests still pass
- Offline indicator shows correct status in workspace-app
- i18n gap report produced

---

### Phase 2 — Universal Module Generalization (Weeks 15–26)

**Objective:** Generalize Value Movement, complete Group extensions, build Workflow Engine, unify analytics.

**In scope:**
1. **Value Movement sub-types**: Dues Collection (schema + API + events), Mutual Aid Requests (schema + API + events + voting)
2. **Groups extension packages**: `packages/groups-civic` (NGO governance, beneficiary tracking), `packages/groups-faith` (denomination, tithe integration bridge), `packages/groups-cooperative` (savings + loan fund integration)
3. **Workflow Engine MVP**: `packages/workflows` — WorkflowDefinition, WorkflowStep, WorkflowInstance. First workflow: payout-approval (replacing manual HITL). Second: case-resolution.
4. **Analytics unification**: `analytics_events` table, nightly snapshot job in `apps/projections`, per-module dashboard API (`GET /analytics/workspace`, `GET /analytics/groups/:id`, `GET /analytics/campaigns/:id`)
5. **`@webwaka/analytics` package**: `trackEvent(eventKey, entityId, properties)` interface
6. **Group Polls/Surveys**: Simple poll within a group (question + options + votes), used for mutual aid voting and general group decision-making
7. **Partner admin buildout**: `apps/partner-admin` — partner dashboard (workspace list, usage metrics, credit balance, sub-partner management)
8. **Community reporting**: Flag content button in broadcasts/posts → moderation queue

**Out of scope:** New AI capabilities, template engine V2, external integrations.

**Dependencies:** Phase 1 complete (Policy Engine, Cases, offline foundation).

**Exit criteria:**
- Dues collection flow works end-to-end
- Mutual aid request → group vote → disbursement flow works
- At least 2 group extension packages operational
- Payout approval workflow runs through Workflow Engine (not raw HITL queue)
- Analytics dashboard shows 3 key metrics per workspace
- Partner admin shows workspace list and usage

---

### Phase 3 — Offline / PWA / Mobile Hardening (Weeks 27–34)

**Objective:** Ensure the platform delivers a first-class offline and mobile experience for field operators.

**In scope:**
1. **Differential sync (incremental)**: All modules support `/sync/delta` with `last_synced_at` and cursor-based pages
2. **Cache budget enforcement**: Per-module eviction policies in Dexie.js; storage pressure alerts
3. **Conflict resolution UI**: `<ww-conflict-notification>` for broadcast draft server-wins events
4. **PII clear-on-logout**: IndexedDB clearing verified for all sensitive field types
5. **Low-bandwidth image pipeline**: R2 variants (100px/400px/1200px) for all group logos, campaign covers, event images
6. **WhatsApp Business API template management**: Register all broadcast templates with Meta; manage template status; handle template rejection fallback to in-app
7. **USSD integration with Groups**: Basic USSD flow for group broadcast receive (Termii USSD push)
8. **Battery/network optimization audit**: Profile service worker on target devices; optimize sync frequency

**Dependencies:** Phase 2 complete (all modules need offline scope before hardening).

**Exit criteria:**
- AC-OFF-01 through AC-OFF-06 all pass on emulated test devices
- Image pipeline serves < 100KB thumbnails for card views
- WhatsApp templates registered and approved for top 5 event types

---

### Phase 4 — Template System Rollout (Weeks 35–46)

**Objective:** Activate the template layer to enable rapid onboarding of new workspace types.

**In scope:**
1. **Template registry extension**: Add `module_config`, `vocabulary`, `default_policies`, `default_workflows` columns
2. **T01 Electoral template**: Full configuration + GOTV extension + INEC compliance policies
3. **T02 Civic/Nonprofit template**: Full configuration + groups-civic extension
4. **T03 Mutual Aid template**: Cases + Value Movement (mutual aid) + group polls
5. **T05 Constituency Service template**: Cases (constituency) + groups + geography mapping
6. **T06 Faith Community template**: Groups (faith) + Value Movement (tithe/dues) + events
7. **T07 Association/Cooperative template**: Groups (cooperative) + dues + cases (grievances)
8. **Template selection in workspace onboarding flow**: Step-by-step template selector with preview
9. **Template marketplace API**: `GET /templates` public catalogue, `POST /workspaces/:id/templates/:key/install`
10. **WakaPage new block types**: GroupBlock (extended), CasesBoardBlock, DuesStatusBlock, MutualAidWallBlock

**Out of scope:** External partner template authoring, T04/T08/T09 templates (Phase 5).

**Exit criteria:**
- 5 templates fully operational and installable
- Workspace onboarding flow includes template selection
- WakaPage has 4 new block types
- Template policies seed correctly into `policy_rules` on install

---

### Phase 5 — AI / Policy / Analytics Maturity (Weeks 47–58)

**Objective:** Mature the AI, Policy, and Analytics layers to production-grade depth.

**In scope:**
1. **New AI capabilities**: `mobilization_analytics`, `broadcast_scheduler`, `member_segmentation`, `petition_optimizer`, `case_classifier`
2. **AI config for all new modules**: cases, workflows, analytics — all registered in TS config + SQL
3. **Policy Engine full coverage**: All 7 domains live, KV-cached, HITL-integrated, tenant-configurable
4. **Tenant AI policy override**: Tenant-configurable AI restrictions via `policy_rules`
5. **Analytics Phase 2**: Cross-workspace benchmarks for partners, trend analysis, geographic heat maps
6. **Data retention automation**: Scheduler job to pseudonymize expired PII per `data_retention` policy rules
7. **Remaining templates**: T04 (Advocacy), T08 (Personal Assistance), T09 (Business Community)
8. **Appeal flow for moderation**: Content creator can appeal auto-rejected broadcast; admin reviews
9. **P2P texting capability**: Assign batch of contacts to volunteer texters (future feature scoping)
10. **Transparency reporting API**: Platform-level moderation statistics

**Exit criteria:**
- 3 new AI capabilities operational with tests
- Data retention scheduler running and verifiably pseudonymizing expired data
- All 9 templates operational
- Policy Engine covers all 7 domains

---

### Phase 6 — Ecosystem / Integrations / Public Launch Readiness (Weeks 59+)

**Objective:** Open the platform to external developers, extend to new geographies, and complete launch readiness.

**In scope:**
1. **Public API**: OpenAPI spec published, API versioning enforced (ADR-0018), developer documentation
2. **Webhook SDK**: Third-party systems subscribe to domain events
3. **Google Calendar sync**: Optional event sync for workspace admins with Google Workspace
4. **Multi-country expansion**: Ghana (region/district), Kenya (county/constituency) geography seeded
5. **DPA agreements**: Formal DPA with Prembly, Paystack, Termii, Meta/360dialog (compliance, not engineering)
6. **Penetration testing**: External security audit
7. **Load testing**: 1,000 concurrent API requests on production D1

**Exit criteria (See Part 19 for full launch prerequisites):**
- All Phase 0-5 exit criteria met
- Public API documented
- Security audit clean (no high-severity findings)
- Load test passes at 1,000 RPS
- DPA agreements in place

---

## PART 16 — BACKLOG STRUCTURE

### 16.1 Themes

| Theme | Description | Phases |
|-------|------------|--------|
| TH-01: Architecture Reset | Naming, schema corrections, Policy Engine skeleton | Phase 0 |
| TH-02: Foundation | Policy Engine, Cases, Ledger, Offline | Phase 1 |
| TH-03: Generalization | Value Movement extensions, Group extensions, Workflows, Analytics | Phase 2 |
| TH-04: Mobile Excellence | Offline hardening, PWA, low-bandwidth, WhatsApp | Phase 3 |
| TH-05: Templates | Template engine, template catalogue, onboarding | Phase 4 |
| TH-06: Intelligence | AI maturity, Policy completeness, Analytics depth | Phase 5 |
| TH-07: Ecosystem | Public API, integrations, geography expansion, launch | Phase 6 |

### 16.2 Epics

**Theme TH-01 — Architecture Reset:**
- E01: Groups module rename (tables, package, events, routes, entitlements)
- E02: Electoral extension extraction (GOTV table, extension package)
- E03: Policy Engine schema and skeleton
- E04: Fundraising generalization (compliance_regime column, policy-driven cap)
- E05: PlatformLayer enum wiring in plan-config

**Theme TH-02 — Foundation:**
- E06: Policy Engine full MVP
- E07: Cases module (schema, package, routes, events, notifications)
- E08: Shared ledger extraction
- E09: Offline scope for Groups + Cases
- E10: Optimistic UI components
- E11: Incremental sync protocol

**Theme TH-03 — Generalization:**
- E12: Dues Collection sub-type
- E13: Mutual Aid Request sub-type
- E14: Groups Civic extension package
- E15: Groups Faith extension package
- E16: Groups Cooperative extension package
- E17: Workflow Engine MVP
- E18: Analytics unification
- E19: Partner admin buildout

**Theme TH-04 — Mobile Excellence:**
- E20: Differential sync
- E21: Cache budget enforcement
- E22: Conflict resolution UI
- E23: Low-bandwidth image pipeline
- E24: WhatsApp Business API templates

**Theme TH-05 — Templates:**
- E25: Template registry extension
- E26: 5 starter templates (T01-T03, T05-T06)
- E27: Workspace onboarding template selection
- E28: WakaPage new block types

**Theme TH-06 — Intelligence:**
- E29: New AI capabilities (mobilization analytics, etc.)
- E30: Data retention automation
- E31: All 9 templates
- E32: Moderation appeal flow

**Theme TH-07 — Ecosystem:**
- E33: Public API + developer docs
- E34: Webhook SDK
- E35: Multi-country geography
- E36: Security audit + load test

### 16.3 Milestone Sequence

| Milestone | Epics | Target Week | Gate |
|----------|-------|-----------|------|
| M10: Architecture Reset | E01-E05 | Week 4 | Phase 0 exit criteria |
| M11: Foundation Complete | E06-E11 | Week 14 | Phase 1 exit criteria |
| M12: Universal Modules | E12-E19 | Week 26 | Phase 2 exit criteria |
| M13: Mobile Excellence | E20-E24 | Week 34 | Phase 3 exit criteria |
| M14: Template Launch | E25-E28 | Week 46 | Phase 4 exit criteria |
| M15: Intelligence Maturity | E29-E32 | Week 58 | Phase 5 exit criteria |
| M16: Public Launch | E33-E36 | Week 70+ | Phase 6 exit criteria + Part 19 |

---

## PART 17 — ACCEPTANCE CRITERIA AND RELEASE GATES

### 17.1 Platform-Wide Acceptance Criteria

**Functionality:**
- AC-FUNC-01: Every capability module has ≥ 90% unit test coverage for core business logic
- AC-FUNC-02: Every API endpoint has an integration test
- AC-FUNC-03: Every migration has a rollback file
- AC-FUNC-04: Every new module has its AI config registered (if AI is used)
- AC-FUNC-05: Every new domain event type is handled in the notification engine

**Usability:**
- AC-USE-01: Key flows (group create, broadcast send, campaign contribute, case submit) complete in ≤ 3 taps on Android
- AC-USE-02: All forms auto-save to IndexedDB on input change
- AC-USE-03: Offline indicator is visible at all times when connectivity is absent

**Reliability:**
- AC-REL-01: API P99 latency ≤ 300ms under normal load
- AC-REL-02: Notification delivery success rate ≥ 98% (in-app), ≥ 95% (SMS), ≥ 97% (WhatsApp)
- AC-REL-03: Database migration runs without timeout on D1 (splits if > 1,000 rows affected)

**Performance:**
- AC-PERF-01: Group member list loads in ≤ 2s on emulated 3G
- AC-PERF-02: Campaign public page loads in ≤ 3s on emulated 2G (edge-cached)
- AC-PERF-03: Broadcast send confirmation appears within 5s of submission

**Offline:**
- All AC-OFF-01 through AC-OFF-06 from Part 11.9

**Security:**
- AC-SEC-01: No high-severity findings in automated security scan (SAST, dependency audit)
- AC-SEC-02: All API endpoints return 401 without valid JWT (no authentication bypass)
- AC-SEC-03: Cross-tenant data read not possible via any API endpoint (T3 invariant)
- AC-SEC-04: PII fields not present in any list API response (P13 invariant)

**Supportability:**
- AC-SUP-01: Every error response uses canonical error code from `packages/shared-config`
- AC-SUP-02: Every API request is traceable via `correlationId` in logs
- AC-SUP-03: DSAR request processed within 72 hours by scheduler

### 17.2 Phase-Specific Release Gates

**Phase 0 Gate (M10):** Zero failing tests; typecheck passes; all `support_groups_*` references renamed; `policy_rules` table seeded; `PlatformLayer` assignments corrected.

**Phase 1 Gate (M11):** Policy Engine evaluates financial caps correctly; Cases module creates/assigns/resolves end-to-end; offline indicator shows correct status; incremental sync returns deltas.

**Phase 2 Gate (M12):** Dues collection end-to-end; mutual aid request → disbursement; payout approval via Workflow Engine; analytics dashboard shows 3 metrics.

**Phase 3 Gate (M13):** All AC-OFF acceptance criteria pass; WhatsApp templates approved by Meta for top 5 event types; image pipeline serving < 100KB thumbnails.

**Phase 4 Gate (M14):** 5 templates installable; template policies seed correctly; WakaPage has 4 new block types; workspace onboarding includes template selection.

**Phase 5 Gate (M15):** 3 new AI capabilities operational; data retention scheduler running; all 9 templates operational; policy engine covers all 7 domains.

**Phase 6 Gate (M16 — Public Launch):** See Part 19.

---

## PART 18 — RISKS, ASSUMPTIONS, AND DEPENDENCIES

### 18.1 Known Risks

| Risk | Probability | Impact | Mitigation |
|------|-----------|--------|-----------|
| D1 write throughput limits during migration | Medium | High | Split large migrations; run during off-peak |
| WhatsApp Business API template rejection | High | Medium | Pre-register all templates 8 weeks before Phase 3 target; prepare in-app fallback |
| Phase 0 rename breaks undiscovered integration | Low | High | Comprehensive grep for all `support_group` references; test all 64 route files |
| Policy Engine cache invalidation race | Medium | Medium | Use conservative TTL (5 min); invalidate on policy_rules INSERT |
| IndexedDB storage pressure on target devices | Medium | Medium | Enforce cache budget limits; eviction tested on 32GB device |
| i18n translation quality (ha/ig/yo) | High | Medium | Professional translation review before launch (community review insufficient) |
| Prembly/IdentityPass API rate limits | Low | High | Cache verified identities; respect 2/hr per user limit already enforced |
| INEC regulation changes post-implementation | Medium | Medium | Policy Engine abstraction allows cap/rule changes without code deploy |
| Partner admin stub remains incomplete | High | Low | Phase 2 includes partner admin buildout |
| `apps/tenant-public` and `apps/workspace-app` are minimal | High | Low | Phase 2/3 enhancement planned |

### 18.2 Unresolved Questions (Open Issues)

| Issue | Owner | Target resolution |
|-------|-------|-----------------|
| Should `@webwaka/fundraising` be renamed to `@webwaka/value-movement` or kept for backwards compat? | Founder + Base44 | Phase 0 Week 1 |
| What is the data migration path for existing `inec_cap_kobo` column values? | Replit Agent 4 | Phase 0 migration design |
| Full i18n audit — how many missing keys in ha/ig/yo? | Replit Agent 4 | Phase 1 Week 1 |
| DPA with Prembly — has this been initiated? | Founder | Phase 1 |
| What is the correct `ward_coordinators` replacement audience type in generic broadcasts? | Product | Phase 0 |
| Should the `support_group_analytics` table consolidate into unified `analytics_events`? | Engineering | Phase 1 |
| Is the `apps/workspace-app` a PWA replacement for `apps/admin-dashboard` or a separate surface? | Product | Phase 1 |

### 18.3 Assumptions

- The platform is pre-launch; no external API consumers have onboarded. Breaking renames in Phase 0 are safe.
- Cloudflare D1 will continue to support SQLite's `ALTER TABLE ... RENAME` syntax.
- Paystack's NUBAN bank transfer API remains available for payout flows.
- Meta/WhatsApp Business API template pre-approval is possible for all required broadcast types within 8 weeks.
- Phase 0 can be executed entirely by Replit Agent 4 + Base44 without Founder sign-off on each individual rename PR (only on the rename decision itself).
- The capability metadata `comment` says "all 23 AICapabilityType values" — the actual count is 24. All implementations should use the verified 24-capability list.

### 18.4 Dependencies

**External dependencies:**
- Paystack: Payment processing, bank transfers, webhook delivery
- Prembly (IdentityPass): BVN, NIN, CAC, FRSC verification
- Termii: SMS, OTP, USSD push delivery
- Meta / 360dialog: WhatsApp Business API
- Resend: Email delivery
- Cloudflare: D1, KV, R2, Queues, Workers

**Internal dependencies:**
- Phase 1 depends on Phase 0 (cannot build on unstable names)
- Phase 2 depends on Phase 1 (Policy Engine must be live before new value movement types use it)
- Phase 3 depends on Phase 2 (all modules need stable offline scope before hardening)
- Phase 4 depends on Phase 3 (templates need reliable offline behavior)
- Phase 5 depends on Phase 4 (AI must work within template context)
- Phase 6 depends on Phase 5 (must be feature-complete before opening to public)

### 18.5 Decisions Requiring Stakeholder Approval

| Decision | Status | Who approves |
|---------|--------|------------|
| Fundraising package rename to value-movement | OPEN | Founder |
| Electoral template included in starter plan | OPEN | Founder |
| Minimum plan for Cases module (Growth vs. Pro) | OPEN | Founder |
| INEC cap amount (₦50m vs. statutory per race) | OPEN | Founder + legal |
| Public referral board feature (visible to anonymous users) | OPEN | Founder |
| Partner custom template authoring (Phase 5 or 6) | OPEN | Founder |

---

## PART 19 — LAUNCH READINESS PREREQUISITES

All of the following must be true before accepting the first paying public tenant in production:

### Technical Prerequisites

**Architecture:**
- [ ] All Phase 0 exit criteria met (renaming complete, Policy Engine schema live)
- [ ] All platform invariants (T3, P9, P10, P13, P14, P15, P7, P12) verified via automated tests
- [ ] Zero high-severity SAST findings
- [ ] Zero known P0 or P1 bugs
- [ ] All 64 route files covered by integration tests
- [ ] Typecheck passes across all 199 packages

**Data:**
- [ ] DSAR processor operational and tested (COMP-002 complete)
- [ ] Data retention policy seeded in `policy_rules`
- [ ] All PII fields annotated with `// P13` or `// P10` comments for audit
- [ ] No `SELECT *` in production query paths

**Performance:**
- [ ] Load test passing: 1,000 concurrent requests, API P99 ≤ 300ms
- [ ] Brand-runtime public page: Lighthouse performance ≥ 85 on mobile
- [ ] IndexedDB tested on 32GB Android device (storage OK)

**Offline:**
- [ ] All AC-OFF-01 through AC-OFF-06 passing on emulated 2G

**Security:**
- [ ] External penetration test complete (no critical/high findings open)
- [ ] All secrets rotated on 90-day schedule (per `infra/cloudflare/secrets-rotation-log.md`)
- [ ] `DSAR_BUCKET` encryption at rest confirmed

### Compliance Prerequisites

- [ ] NDPR registration completed with NITDA
- [ ] Privacy policy published and linked from all onboarding flows
- [ ] DSAR request mechanism user-accessible and tested
- [ ] DPA agreements signed with: Prembly, Paystack, Termii, Resend, Meta/360dialog
- [ ] INEC campaign finance cap and disclosure rules implemented and auditable
- [ ] CBN KYC tiering compliance verified for wallet operations

### Product Prerequisites

- [ ] At minimum Templates T01, T02, T06 installable (Electoral, Civic, Faith)
- [ ] Workspace onboarding includes template selection
- [ ] i18n audit complete; Hausa and Yoruba translation ≥ 95% key coverage
- [ ] WhatsApp Business API templates approved for top 5 notification types
- [ ] Partner admin functional for partner-level workspace management
- [ ] Support ticketing integrated with tenant-facing error flows

### Operational Prerequisites

- [ ] Platform admin (`apps/platform-admin`) can provision, suspend, and deprovision tenants
- [ ] Runbook for each supported deployment scenario documented in `docs/runbooks/`
- [ ] Monitoring/alerting for D1 write latency, Queue DLQ items, notification failure rate
- [ ] Incident response plan documented
- [ ] Billing enforcement verified: plan downgrade blocks feature access within 24h
- [ ] Partner commission calculation verified against migration 0200

---

## PART 20 — FINAL RECOMMENDATION

### 20.1 Priority Order

**Immediate (this week):** Begin Phase 0 rename work. Open the tracking PR. All renames should be mechanical, testable, and reversible in the pre-launch window. Do not allow new features to be built on the wrong names.

**Short-term (Weeks 2-14):** Phase 0 completion + Phase 1 foundational work. Policy Engine and Cases module are the two most strategically important new capabilities — both must be production-ready before any template work begins.

**Medium-term (Weeks 15-46):** Module generalization (Phase 2) + Mobile hardening (Phase 3) + Template rollout (Phase 4). These phases build the "build once, use infinitely" product value.

**Long-term (Weeks 47+):** AI maturity and ecosystem openness. These phases monetize and extend the platform — they are not prerequisites for the initial launch.

### 20.2 What Must Not Happen

1. **Do not launch the public API with `support_groups` in any endpoint name.** Once a URL or type name becomes a public API contract, changing it requires API versioning, deprecation periods, and partner migration.

2. **Do not build a new module without first creating a Policy Engine row for its primary regulatory constraint.** The first module that ships without this will establish the wrong precedent.

3. **Do not add an election-specific concept to the generic Groups or Value Movement tables.** The extension table pattern established in Phase 0 must be enforced by code review.

4. **Do not skip the offline audit for any new module.** A module without a declared offline scope is a module that will fail field operators at the worst possible time.

5. **Do not generate Phase 4 templates before Phase 1-3 are stable.** Templates compose modules — if the modules change, templates break.

### 20.3 Next Actions (Week 1)

In priority order:

1. **Founder decision:** Approve the support-groups → groups rename (this unblocks all Phase 0 work)
2. **Founder decision:** Approve or reject fundraising → value-movement package rename
3. **Replit Agent 4:** Create migration `0432_rename_support_groups_to_groups.sql`
4. **Replit Agent 4:** Begin `packages/groups` package rename (3-5 day effort)
5. **Base44:** Update CI governance checks for new names
6. **Replit Agent 4:** Create migration `0434_policy_engine_skeleton.sql` with policy_rules table
7. **Replit Agent 4:** Create `packages/policy-engine/` skeleton
8. **Perplexity:** Draft TDR for Policy Engine architecture
9. **Base44:** Open GitHub issues for E01-E05 (Phase 0 epics)

---

## APPENDICES

### APPENDIX A — CURRENT-TO-TARGET ENTITY MAPPING

| Current entity | Target entity | Action | Phase |
|--------------|--------------|--------|-------|
| `support_groups` table | `groups` table | Rename (migration 0432) | 0 |
| `support_group_members` | `group_members` | Rename | 0 |
| `support_group_meetings` | `group_meetings` | Rename (then consider consolidating with group_events) | 0 |
| `support_group_events` | `group_events` | Rename | 0 |
| `support_group_broadcasts` | `group_broadcasts` | Rename | 0 |
| `support_group_petitions` | `group_petitions` | Rename | 0 |
| `support_group_petition_signatures` | `group_petition_signatures` | Rename | 0 |
| `support_group_assets` | `group_assets` | Rename | 0 |
| `support_group_analytics` | `group_analytics` | Rename (later consolidated into analytics_events) | 0 / 2 |
| `support_group_resolutions` | `group_resolutions` | Rename | 0 |
| `support_group_committees` | `group_committees` | Rename | 0 |
| `support_group_committee_members` | `group_committee_members` | Rename | 0 |
| `support_group_gotv_records` | `political_gotv_records` | Move to new table in groups-electoral migration | 0 |
| `support_group_executive_roles` | `group_executive_roles` | Rename | 0 |
| `fundraising_campaigns.inec_cap_kobo` | `policy_rules` row (regime=inec) | Deprecate column; add policy row | 1 |
| `fundraising_campaigns.inec_disclosure_required` | `policy_rules` row | Deprecate column | 1 |
| — | `cases` table | New (migration ~0440) | 1 |
| — | `case_notes` table | New | 1 |
| — | `policy_rules` table | New (migration 0434) | 0 |
| — | `campaign_compliance_policies` table | New (migration 0435) | 0 |
| — | `group_electoral_extensions` table | New (migration 0433) | 0 |

---

### APPENDIX B — CURRENT-TO-TARGET PACKAGE MAPPING

| Current package | Target package | Action | Phase |
|----------------|--------------|--------|-------|
| `@webwaka/support-groups` | `@webwaka/groups` | Rename | 0 |
| `@webwaka/fundraising` | `@webwaka/value-movement` OR keep as `@webwaka/fundraising` | **DECISION PENDING** | 0 |
| — | `@webwaka/groups-electoral` | New (extract GOTV) | 0 |
| — | `@webwaka/groups-civic` | New | 2 |
| — | `@webwaka/groups-faith` | New | 2 |
| — | `@webwaka/groups-cooperative` | New | 2 |
| — | `@webwaka/cases` | New | 1 |
| — | `@webwaka/ledger` | New (extract from pos+hl-wallet) | 1 |
| — | `@webwaka/policy-engine` | New | 0 (skeleton) / 1 (full) |
| — | `@webwaka/workflows` | New | 2 |
| — | `@webwaka/analytics` | New | 2 |
| `packages/pos` (float-ledger) | Import from `@webwaka/ledger` | Refactor | 1 |
| `packages/hl-wallet` (ledger) | Import from `@webwaka/ledger` | Refactor | 1 |
| `@webwaka/contact` | Preserve | — | — |
| `@webwaka/webhooks` | Preserve | — | — |
| `@webwaka/workspaces` | Preserve | — | — |
| `@webwaka/white-label-theming` | Preserve | — | — |

---

### APPENDIX C — DEPRECATED TERM MAPPING

| Deprecated term | Replacement term | Where |
|---------------|----------------|-------|
| `SupportGroup` | `Group` | TypeScript types |
| `support_group` (table prefix) | `group` | DB schema |
| `SupportGroupEventType` | `GroupEventType` | Event bus |
| `SupportGroupEntitlements` | `GroupEntitlements` | Entitlements package |
| `supportGroupsEnabled` | `groupsEnabled` | plan-config |
| `fundraisingEnabled` | `valueMovementEnabled` | plan-config |
| `INEC_DEFAULT_CAP_KOBO` | `policyEngine.evaluate('financial_cap', {regime:'inec'})` | Fundraising repo |
| `checkInecCap()` | `checkCampaignFinancingCap(regime, jurisdiction)` | Fundraising repo |
| `inec_cap_kobo` column | `policy_rules` row | DB schema |
| `inec_disclosure_required` column | `policy_rules` row | DB schema |
| `tpl_sg_*` (notification template IDs) | `tpl_grp_*` | notification_templates |
| `rule_sg_*` (routing rule IDs) | `rule_grp_*` | notification_rules |
| `support_group.*` (event prefixes) | `group.*` | Event bus |
| WakaPage block type `'support_group'` | `'group'` | wakapage-blocks |
| `ward_coordinators` audience | `coordinators` (generic role-based) | Broadcasts |
| `GotvRecord` (in groups package) | `GotvRecord` (in groups-electoral package) | TypeScript types |

---

### APPENDIX D — ROUTE MIGRATION MAPPING

| Current route | Target route | Phase |
|-------------|------------|-------|
| `POST /support-groups` | `POST /groups` | 0 |
| `GET /support-groups/:id` | `GET /groups/:id` | 0 |
| `POST /support-groups/:id/members` | `POST /groups/:id/members` | 0 |
| `POST /support-groups/:id/broadcasts` | `POST /groups/:id/broadcasts` | 0 |
| `POST /support-groups/:id/gotv-records` | `POST /groups/:id/electoral/gotv-records` | 0 |
| `GET /support-groups/:id/gotv-stats` | `GET /groups/:id/electoral/gotv-stats` | 0 |
| `POST /support-groups/:id/petitions` | `POST /groups/:id/petitions` | 0 |
| *(all 23 support-groups routes)* | `/groups/*` equivalents | 0 |
| — | `GET /sync/delta` | 1 |
| — | `POST /cases` | 1 |
| — | `GET /cases/:id` | 1 |
| — | `POST /policy/evaluate` (internal) | 1 |

---

### APPENDIX E — DOCUMENT AUTHORITY MATRIX

| Document | Authority | Used for |
|---------|-----------|---------|
| This PRD (WEBWAKA-UNIVERSAL-MOBILIZATION-PLATFORM-PRD.md) | **CURRENT AUTHORITATIVE** | All implementation planning |
| `WEBWAKA-UNIVERSAL-MOBILIZATION-PLATFORM-BLUEPRINT.md` | **AUTHORITATIVE WITH QA CORRECTIONS APPLIED** | Architecture context |
| `QA-AUDIT-OF-BLUEPRINT-v1.md` | **AUTHORITATIVE** | Verified corrections to apply |
| `RELEASE-READINESS-REPORT-v3.md` | AUTHORITATIVE for M9 scope | M9 feature verification |
| `FORENSIC-VERIFICATION-REPORT.md` | AUTHORITATIVE (methodology) | QA approach |
| Phase s00-s16 reports | AUTHORITATIVE for those phases | Historical infra |
| `AGENTS.md` | AUTHORITATIVE | Operating model |
| April 10-11 governance audits | SUPERSEDED | Historical context only |
| RELEASE-READINESS-REPORT v1/v2 | SUPERSEDED | — |
| FINAL-IMPLEMENTATION-AND-QA-REPORT.md | SUPERSEDED | — |

---

### APPENDIX F — SUGGESTED ENGINEERING STANDARDS

**Standard ES-01: New table checklist**
Every new table must have: `id TEXT PRIMARY KEY`, `workspace_id TEXT NOT NULL`, `tenant_id TEXT NOT NULL`, `created_at TEXT NOT NULL DEFAULT (datetime('now'))`, `updated_at TEXT NOT NULL DEFAULT (datetime('now'))`, and at minimum `CREATE INDEX idx_{table}_tenant ON {table}(tenant_id)`.

**Standard ES-02: New module checklist**
Before a new module PR is merged: (1) schema migration with rollback, (2) package with types + repository + entitlements + index.ts, (3) API routes with auth middleware, (4) event types in `packages/events`, (5) notification templates + routing rules in a migration, (6) offline sync adapter registered, (7) AI config in both TS + SQL (if AI is used), (8) plan-config update, (9) ≥ 20 unit tests passing, (10) at least 1 E2E test.

**Standard ES-03: Money handling**
All monetary values are INTEGER kobo. No REAL, FLOAT, NUMERIC columns for money. All TypeScript money fields typed as `number` with `// kobo (integer)` comment. The `@webwaka/ledger` `assertKoboInteger(value)` guard must be called before any financial write.

**Standard ES-04: PII annotation**
Every table column that contains PII must have a `// P13 — never return in list APIs` or `// P10 — requires NDPR consent before capture` comment in the TypeScript type definition. CI governance check enforces this for any column matching a known PII pattern (phone, email, bvn, nin, bank_account).

**Standard ES-05: Event publication**
Every state-changing operation (create, update, status transition, delete) must publish a domain event to the event bus after successful DB write. Failing to publish is an accepted failure mode (fire-and-forget); the operation itself does not retry.

**Standard ES-06: Test naming**
Every test file follows `{module}.test.ts` (unit) or `{module}.integration.test.ts`. Test descriptions must be assertions: "throws ENTITLEMENT_DENIED when max groups exceeded" not "max groups test".

---

### APPENDIX G — SUGGESTED QA STRATEGY

**Layer 1: Static Analysis (CI, every commit)**
- TypeScript compilation: `pnpm -r typecheck`
- ESLint: `pnpm -r lint`
- Governance checks: `scripts/governance-checks/*.ts` (AI config alignment, PII annotations, money types, etc.)

**Layer 2: Unit Tests (CI, every commit)**
- Vitest workspace: `pnpm -r test --run`
- Target: ≥ 90% coverage for all business logic in packages
- Module-specific: each new module must reach 24+ tests before merge (established pattern)

**Layer 3: Integration Tests (CI, every PR)**
- API routes: test every route with valid + invalid auth, plan gate enforcement, T3 isolation
- Policy Engine: test each evaluator domain with at-limit, over-limit, jurisdiction-miss cases
- Financial: test integer-kobo enforcement rejects any float input

**Layer 4: E2E Tests (CI, pre-merge to staging)**
- Playwright: key user flows per template
- Minimum: group create → member join → broadcast send; campaign create → contribute → payout request
- Offline: Playwright service worker test with simulated offline mode
- Performance: Lighthouse CLI run on public campaign page

**Layer 5: Production Canary (post-deploy)**
- 10% traffic to new build, health check for 15 minutes, then 100% rollout
- Rollback trigger: D1 error rate > 0.1%, P99 latency > 500ms

---

### APPENDIX H — SUGGESTED DATA MIGRATION STRATEGY

**For Phase 0 table renames:**
```sql
-- Example: support_groups → groups
ALTER TABLE support_groups RENAME TO groups;
ALTER TABLE support_group_members RENAME TO group_members;
-- (repeat for all 15 tables)
-- No data migration needed — rename only
```
SQLite's `ALTER TABLE ... RENAME` preserves data, indexes, and constraints.

**For inec_cap_kobo column deprecation (Phase 0/1):**
```sql
-- Step 1 (Phase 0 migration 0435): Add compliance_regime; add policy_rules row
ALTER TABLE fundraising_campaigns ADD COLUMN compliance_regime TEXT;
UPDATE fundraising_campaigns SET compliance_regime = 'inec' WHERE inec_cap_kobo > 0;
-- Step 2 (Phase 1 migration 0436): Drop deprecated columns
-- (in a separate migration after confirming all callers use Policy Engine)
```

**For gotv_records table move (Phase 0 migration 0433):**
```sql
-- Create new table in groups-electoral schema
CREATE TABLE political_gotv_records ( ... ); -- new table with full schema
INSERT INTO political_gotv_records SELECT * FROM support_group_gotv_records;
-- Drop old table after verification
DROP TABLE support_group_gotv_records;
```

**Data validation on migration:**
- Every migration that moves data must include a `SELECT COUNT(*)` verification step in the rollback plan
- Staging environment must run full migration suite before production deployment
- No migration that affects > 100,000 rows should be attempted without a batched approach in `apps/projections`

---

*PRD complete.*  
*Total parts: 20 + 8 appendices.*  
*Evidence basis: Verified codebase (25,544 files, 199 packages, 12 apps, 431 migrations, 64 route files).*  
*QA corrections applied: All 12 mandatory corrections from QA-AUDIT-OF-BLUEPRINT-v1.md incorporated.*  
*Generated: April 28, 2026.*
