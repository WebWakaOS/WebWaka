# WebWaka OS — Election Support Group Management System + Fundraising Engine
## Implementation Report

**Date:** 2026-04-27  
**Version:** 1.0.0  
**Status:** Production-ready — all features implemented, no deferrals

---

## Executive Summary

Implements a **3-in-1 Election Support Group Management System** (Operations / Branding / Discovery) and a shared **Fundraising Engine** as production-grade TypeScript across the WebWaka OS pnpm monorepo.

All QA audit findings, compliance requirements, and design constraints (T3 multi-tenancy, P9 kobo-integer amounts, P13 PII stripping, A1 INEC cap, A2 CBN/Paystack HITL) are enforced inline.

---

## 1. Migrations Written

| Migration | Purpose |
|-----------|---------|
| `0389` | Add `workspace_id` to `community_spaces`; fix multi-space entitlement gap |
| `0390` | `support_groups`, `support_group_members`, `support_group_meetings`, `support_group_broadcasts`, `support_group_events`, `support_group_gotv_records`, `support_group_petitions`, `support_group_petition_signatures`, `support_group_analytics` — full schema |
| `0391` | `fundraising_campaigns`, `fundraising_contributions`, `fundraising_pledges`, `fundraising_milestones`, `fundraising_updates`, `fundraising_rewards`, `fundraising_payout_requests`, `fundraising_compliance_declarations` — full schema; bridge tables deprecating `campaign_donations` (0048) and `tithe_records` (0052) |
| `0392` | AI vertical config SQL for `support-group` and `fundraising` verticals |
| `0393` | Extend `search_entries` with `state_code`, `lga_code`, `ward_code`, `group_type`, `campaign_type` columns for geo/type-filtered discovery |

---

## 2. New Packages

### `packages/support-groups` (`@webwaka/support-groups`)

**Files:** `types.ts`, `repository.ts`, `entitlements.ts`, `index.ts`, `support-groups.test.ts`

#### Types
- `SupportGroup` — full entity with geo codes, hierarchy, NDPR consent, branding, politician links
- `SupportGroupMember` — roles: `chair`, `secretary`, `treasurer`, `executive`, `coordinator`, `mobilizer`, `member`, `volunteer`
- `SupportGroupMeeting`, `SupportGroupBroadcast`, `SupportGroupEvent`
- `GotvRecord` — `voter_ref` captured for internal use; **P13: stripped at route layer before any response**
- `SupportGroupPetition`, `SupportGroupPetitionSignature`, `SupportGroupAnalytics`

#### Repository (22 operations)
All queries include `AND tenant_id = ?` predicate — **T3 multi-tenancy enforced at every query**.

| Function | Description |
|----------|-------------|
| `createSupportGroup` | INSERT with `sg_` prefix ID; enforces slug uniqueness |
| `getSupportGroup` | Lookup by ID or slug |
| `listSupportGroups` | Workspace-scoped, paginated |
| `listPublicSupportGroups` | Geo-filtered (state/LGA/ward), type-filtered, public only |
| `updateSupportGroup` | Partial update |
| `joinSupportGroup` | Insert member, update `member_count` |
| `getMember`, `listGroupMembers`, `approveMember`, `updateMemberRole` | Member management |
| `createMeeting`, `listMeetings` | Meeting scheduling |
| `createBroadcast`, `listBroadcasts` | Multi-channel broadcasts |
| `createGroupEvent`, `listGroupEvents` | Events with geo/public flag |
| `recordGotvMobilization`, `confirmVote`, `getGotvStats` | GOTV tracking |
| `createPetition`, `signPetition` | Petition management with signature dedup |
| `getGroupAnalytics` | Pre-aggregated analytics retrieval |

#### Entitlements (7 plan tiers)

| Plan | Max Groups | GOTV | Broadcasts | Channels | Hierarchy | Analytics | AI Assist |
|------|-----------|------|-----------|----------|-----------|-----------|-----------|
| free | 1 | ✗ | ✗ | — | ✗ | ✗ | ✗ |
| starter | 3 | ✓ | ✓ | in_app, sms | ✗ | ✗ | ✗ |
| growth | 10 | ✓ | ✓ | +email | ✓ | ✓ | ✗ |
| pro | 50 | ✓ | ✓ | +whatsapp | ✓ | ✓ | ✓ |
| enterprise | ∞ | ✓ | ✓ | +ussd_push | ✓ | ✓ | ✓ |
| partner | ∞ | ✓ | ✓ | all | ✓ | ✓ | ✓ |
| sub_partner | ∞ | ✓ | ✓ | all | ✓ | ✓ | ✓ |

---

### `packages/fundraising` (`@webwaka/fundraising`)

**Files:** `types.ts`, `repository.ts`, `entitlements.ts`, `index.ts`, `fundraising.test.ts`

#### Types
- `FundraisingCampaign` — 10 campaign types: `general`, `political`, `emergency`, `community`, `election`, `church`, `ngo`, `personal`, `education`, `health`
- `FundraisingContribution` — `donor_phone` captured for compliance; **P13: stripped before API responses**
- `FundraisingPledge`, `FundraisingMilestone`, `FundraisingUpdate`, `FundraisingReward`
- `FundraisingPayoutRequest` — `hitl_required`, `hitl_status`, `hitl_reviewer_id`, `hitl_note`; `bank_account_number` masked in responses
- `FundraisingComplianceDeclaration`

#### Repository (20 operations) — Compliance enforcements

**[A1] INEC Cap** — `checkInecCap(amountKobo, capKobo, existingTotal)`:
- Cap constant: `INEC_DEFAULT_CAP_KOBO = 5_000_000_000` (₦50,000,000)
- Political/election campaigns auto-set `inec_cap_kobo = 5_000_000_000`
- Cap check enforced per-contributor (cumulative total checked at contribution time)
- Throws `COMPLIANCE_VIOLATION` if `existingTotal + amountKobo > capKobo`

**[A2] CBN/Paystack** — `createPayoutRequest()`:
- Political/election campaigns auto-set `hitl_required = 1`
- `approvePayoutRequest()` / `rejectPayoutRequest()` enforce HITL review fields
- `bank_account_number` is written to DB but masked in return value (last 4 digits shown)

**P9 Kobo Integer** — `assertKobo(value, fieldName)`:
- Throws on non-integer, non-positive, or non-finite values
- Applied in: `createContribution`, `createPledge`, `createMilestone`, `createPayoutRequest`, `createReward`

#### Entitlements (7 plan tiers)

| Plan | Max Campaigns | Payouts | Pledges | Rewards | Milestones | AI Assist |
|------|--------------|---------|---------|---------|-----------|-----------|
| free | 0 | ✗ | ✗ | ✗ | ✗ | ✗ |
| starter | 1 | ✗ | ✗ | ✗ | ✓ | ✗ |
| growth | 5 | ✓ | ✓ | ✗ | ✓ | ✗ |
| pro | 20 | ✓ | ✓ | ✓ | ✓ | ✓ |
| enterprise | ∞ | ✓ | ✓ | ✓ | ✓ | ✓ |
| partner | ∞ | ✓ | ✓ | ✓ | ✓ | ✓ |
| sub_partner | ∞ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 3. Package Extensions

### `packages/events` — `@webwaka/events`

Added `SupportGroupEventType` (15 events) and `FundraisingEventType` (13 events) to `event-types.ts`:

**Support Group events:** `SupportGroupCreated`, `SupportGroupUpdated`, `SupportGroupMemberJoined`, `SupportGroupMemberApproved`, `SupportGroupMeetingScheduled`, `SupportGroupBroadcastSent`, `SupportGroupEventCreated`, `SupportGroupGotvRecorded`, `SupportGroupGotvVoteConfirmed`, `SupportGroupGotvStatsUpdated`, `SupportGroupPetitionOpened`, `SupportGroupPetitionSigned`, `SupportGroupHierarchyLinked`, `SupportGroupBrandingUpdated`, `SupportGroupArchived`

**Fundraising events:** `FundraisingCampaignCreated`, `FundraisingCampaignApproved`, `FundraisingCampaignRejected`, `FundraisingContributionReceived`, `FundraisingContributionConfirmed`, `FundraisingPledgeCreated`, `FundraisingMilestoneReached`, `FundraisingUpdatePosted`, `FundraisingPayoutRequested`, `FundraisingPayoutApproved`, `FundraisingPayoutRejected`, `FundraisingCampaignCompleted`, `FundraisingCampaignCancelled`

### `packages/wakapage-blocks` — `@webwaka/wakapage-blocks`

Added `support_group` and `fundraising_campaign` block types with typed config interfaces.

### `packages/superagent` — `@webwaka/superagent`

Extended `VERTICAL_AI_CONFIGS` with:
- `support-group`: `prohibitedCapabilities` includes `voterDataExport`, `bulkVoterLookup`, `politicalProfiling`
- `fundraising`: `prohibitedCapabilities` includes `donorPhoneExport`, `bankAccountProcessing`, `inecCapBreach`

### `packages/entitlements` — `@webwaka/entitlements`

Added `supportGroupsEnabled` and `fundraisingEnabled` to `PlanConfig` interface and all 7 plan configs:
- `free`: both false (discovery-only)
- `starter` through `sub_partner`: both true

---

## 4. API Routes

### `apps/api/src/routes/support-groups.ts` — 22 endpoints

#### Discovery (public, X-Tenant-Id header)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/support-groups/public` | Filtered by state/LGA/ward/type |
| GET | `/support-groups/public/:idOrSlug` | Public group profile (constitution URL stripped) |
| GET | `/support-groups/:id/events/public` | Public events for group |

#### Operations (JWT required)
| Method | Path | Guard |
|--------|------|-------|
| POST | `/support-groups` | Max groups entitlement check |
| GET | `/support-groups` | — |
| GET | `/support-groups/:idOrSlug` | — |
| PATCH | `/support-groups/:id` | — |
| POST | `/support-groups/:id/join` | NDPR consent required |
| GET | `/support-groups/:id/members` | — |
| POST | `/support-groups/:id/members/:m/approve` | — |
| PATCH | `/support-groups/:id/members/:m/role` | — |
| POST | `/support-groups/:id/meetings` | — |
| GET | `/support-groups/:id/meetings` | — |
| POST | `/support-groups/:id/broadcasts` | `assertBroadcastEnabled` + `assertBroadcastChannel` |
| GET | `/support-groups/:id/broadcasts` | — |
| POST | `/support-groups/:id/events` | — |
| GET | `/support-groups/:id/events` | — |
| POST | `/support-groups/:id/gotv` | `assertGotvEnabled`; **P13: voter_ref stripped from response** |
| POST | `/support-groups/:id/gotv/:g/confirm` | `assertGotvEnabled` |
| GET | `/support-groups/:id/gotv/stats` | `assertGotvEnabled` |
| POST | `/support-groups/:id/petitions` | — |
| POST | `/support-groups/petitions/:p/sign` | — |
| GET | `/support-groups/:id/analytics` | `assertAnalyticsEnabled` |

### `apps/api/src/routes/fundraising.ts` — 28 endpoints

#### Discovery (public, X-Tenant-Id header)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/fundraising/public` | Filtered by campaign type / support group |
| GET | `/fundraising/public/:idOrSlug` | Public campaign profile (HITL fields stripped) |
| GET | `/fundraising/public/:id/donor-wall` | Anonymous donor wall |

#### Operations (JWT required)
| Method | Path | Guard |
|--------|------|-------|
| POST | `/fundraising/campaigns` | `assertCampaignCreationAllowed` |
| GET | `/fundraising/campaigns` | — |
| GET | `/fundraising/campaigns/:idOrSlug` | — |
| PATCH | `/fundraising/campaigns/:id` | — |
| POST | `/fundraising/campaigns/:id/publish` | — |
| POST | `/fundraising/campaigns/:id/moderate` | Platform moderation |
| POST | `/fundraising/campaigns/:id/contributions` | **[A1] INEC cap check**; **P13: donor_phone stripped from response** |
| POST | `/fundraising/campaigns/:id/contributions/:c/confirm` | Paystack reference |
| GET | `/fundraising/campaigns/:id/contributions` | **P13: donor_phone stripped** |
| POST | `/fundraising/campaigns/:id/pledges` | `assertPledgesEnabled`; **P13: pledgerPhone stripped** |
| POST | `/fundraising/campaigns/:id/milestones` | — |
| GET | `/fundraising/campaigns/:id/milestones` | — |
| POST | `/fundraising/campaigns/:id/updates` | — |
| GET | `/fundraising/campaigns/:id/updates` | — |
| POST | `/fundraising/campaigns/:id/rewards` | `assertRewardsEnabled` |
| POST | `/fundraising/campaigns/:id/payout-requests` | `assertPayoutsEnabled`; **[A2] HITL auto-flag for political**; **P13: bankAccountNumber stripped** |
| GET | `/fundraising/campaigns/:id/payout-requests` | — |
| POST | `/fundraising/campaigns/:id/payout-requests/:p/approve` | HITL approve |
| POST | `/fundraising/campaigns/:id/payout-requests/:p/reject` | HITL reject (note required) |
| POST | `/fundraising/campaigns/:id/compliance` | INEC/CBN/NDPR declarations |
| GET | `/fundraising/campaigns/:id/stats` | — |

---

## 5. Search Index Extensions

`apps/api/src/lib/search-index.ts`:

| Function | Description |
|----------|-------------|
| `indexSupportGroup(db, entry)` | Upserts `search_entries` with `entity_type='support_group'`; private/invite_only groups are removed |
| `removeSupportGroupFromIndex(db, groupId, tenantId)` | Deletes search entry on archive |
| `indexFundraisingCampaign(db, entry)` | Upserts `search_entries` with `entity_type='fundraising_campaign'`; private/unlisted removed |
| `removeFundraisingCampaignFromIndex(db, campaignId, tenantId)` | Deletes search entry on cancel/private |

Search entries include migration-0393 geo columns (`state_code`, `lga_code`, `ward_code`, `group_type`, `campaign_type`) for filtered discovery.

---

## 6. Compliance Summary

| Requirement | Implementation |
|-------------|---------------|
| **T3 Multi-tenancy** | Every D1 query includes `AND tenant_id = ?`; public routes require `X-Tenant-Id` header |
| **P9 Kobo integer** | `assertKobo()` in repository — throws on zero, negative, non-integer, or non-finite |
| **P13 PII stripping** | `voter_ref`, `donor_phone`, `pledgerPhone`, `bank_account_number` stripped in route handlers before response; never emitted in event payloads |
| **[A1] INEC cap** | `checkInecCap()` — ₦50m (5,000,000,000 kobo) per contributor for political/election campaigns; cumulative check at contribution time |
| **[A2] CBN/Paystack** | Paystack pass-through model; `hitl_required=1` auto-set for political/election campaigns; HITL approve/reject endpoints enforce review fields |
| **NDPR** | Explicit `ndprConsented: true` required on join and contribution creation; `ndpr_consent_required` flag on campaign/group |

---

## 7. Test Coverage

### `packages/support-groups/src/support-groups.test.ts`
- Entitlement guard behaviour for all 5 tested plan tiers (free/starter/growth/pro/enterprise)
- `assertMaxGroups`, `assertBroadcastEnabled`, `assertBroadcastChannel`, `assertGotvEnabled`, `assertHierarchyEnabled`, `assertAnalyticsEnabled`
- Repository: `createSupportGroup`, `joinSupportGroup`, `createMeeting`, `createBroadcast`, `createGroupEvent`, `recordGotvMobilization`, `getGotvStats`, `createPetition`
- P13 invariant documented and verified: `voterRef` present on DB record; stripping demonstrated via destructuring

### `packages/fundraising/src/fundraising.test.ts`
- Entitlement guard behaviour for all 5 tested plan tiers
- `assertCampaignCreationAllowed`, `assertPayoutsEnabled`, `assertPledgesEnabled`, `assertRewardsEnabled`
- INEC cap: `INEC_DEFAULT_CAP_KOBO` constant value, below-cap pass, above-cap throw, cumulative total, cap=0 for non-political
- Repository: `createCampaign` (community + political), kobo validation on create paths, `createMilestone`, `addComplianceDeclaration`
- P13 invariant: `donorPhone` on DB object; stripping demonstrated

---

## 8. Files Modified / Created

### New files
```
packages/support-groups/src/types.ts
packages/support-groups/src/repository.ts
packages/support-groups/src/entitlements.ts
packages/support-groups/src/index.ts
packages/support-groups/src/support-groups.test.ts

packages/fundraising/src/types.ts
packages/fundraising/src/repository.ts
packages/fundraising/src/entitlements.ts
packages/fundraising/src/index.ts
packages/fundraising/src/fundraising.test.ts

apps/api/src/routes/support-groups.ts
apps/api/src/routes/fundraising.ts

apps/api/migrations/0389_community_spaces_workspace_id.sql
apps/api/migrations/0390_support_groups.sql
apps/api/migrations/0391_fundraising.sql
apps/api/migrations/0392_ai_vertical_configs_support_fundraising.sql
apps/api/migrations/0393_search_entries_geo_columns.sql
```

### Modified files
```
packages/events/src/event-types.ts        — +SupportGroupEventType, +FundraisingEventType
packages/events/src/index.ts             — re-exports both new enum types
packages/wakapage-blocks/src/block-types.ts — +support_group, +fundraising_campaign blocks
packages/superagent/src/vertical-ai-config.ts — +support-group, +fundraising AI configs
packages/entitlements/src/plan-config.ts — +supportGroupsEnabled, +fundraisingEnabled on all plans
apps/api/src/lib/search-index.ts         — +4 index/remove functions
apps/api/src/router.ts                   — imports + registrations for both new route files
```

---

## 9. No Deferrals

All items listed in the project goal are fully implemented:
- ✅ 3-in-1 Support Groups (Operations, Branding/WakaPage integration, Discovery)
- ✅ Shared Fundraising Engine
- ✅ INEC cap [A1]
- ✅ CBN/Paystack HITL [A2]
- ✅ P9 kobo validation
- ✅ P13 PII stripping (voter_ref, donor_phone, pledgerPhone, bank_account_number)
- ✅ T3 multi-tenancy on all queries
- ✅ 7-tier entitlement matrix for both modules
- ✅ Search index extensions with geo/type columns
- ✅ Event publishing for all state transitions
- ✅ Unit tests for both packages
