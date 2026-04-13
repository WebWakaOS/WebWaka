# Community Platform Model

**Status:** Draft — M7 Governance Baseline
**Author:** Base44 Super Agent (Milestone 7)
**Milestone:** M7 — Full Platform + Community/Social
**Date:** 2026-04-08

---

## 3-in-1 Platform Classification

> **3-in-1 classification:** Community and Social features are **cross-cutting infrastructure** that enhance all three pillars but are particularly integral to **Pillar 3 (Listing / Multi-Vendor Marketplace)** as the community engagement layer for marketplace participants. Community is NOT a standalone product pillar — it is an entitlement-gated capability mounted on top of the three pillars.
>
> | Pillar relationship | Role |
> |---|---|
> | Pillar 1 — Ops | Staff community spaces, internal learning, operational knowledge-sharing |
> | Pillar 2 — Branding | Branded community portal embedded in a business's white-label site |
> | Pillar 3 — Marketplace (primary) | Public engagement layer for marketplace participants, brand communities, creator audiences |
>
> See `docs/governance/3in1-platform-architecture.md` for the canonical module-to-pillar map.

---

## Overview

WebWaka Community is a Skool-style community platform built on WebWaka OS primitives. It enables any Organisation, Individual, or Place to spin up a structured learning and engagement community as a branded, entitlement-gated vertical module.

Communities are first-class citizens in the WebWaka entity model — they compose Workspaces, Brand Surfaces, and Offerings, not replace them.

---

## Community Entity Model

### CommunitySpace
The root entity. Owned by an Organisation or Individual. Backed by a Workspace.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `workspace_id` | FK → Workspaces | Owner workspace |
| `name` | TEXT | Display name |
| `slug` | TEXT UNIQUE | URL path identifier |
| `visibility` | ENUM | `public` \| `private` \| `invite_only` |
| `tenant_id` | TEXT | Multi-tenancy key |
| `created_at` | INTEGER | Unixepoch |

### CommunityMembership
Relationship between a User/Individual and a CommunitySpace.

| Field | Type | Notes |
|---|---|---|
| `community_id` | FK | CommunitySpace |
| `user_id` | FK | User or Individual |
| `role` | ENUM | `owner` \| `admin` \| `moderator` \| `member` \| `guest` |
| `tier` | TEXT | Maps to subscription or one-time access |
| `joined_at` | INTEGER | Unixepoch |
| `kyc_tier` | INTEGER | CBN KYC tier at join time (for paid tiers) |

### CommunityChannel
Discussion channels within a CommunitySpace (forum threads, chat rooms).

| Field | Type | Notes |
|---|---|---|
| `community_id` | FK | Parent space |
| `name` | TEXT | e.g. "General", "Introductions" |
| `type` | ENUM | `forum` \| `chat` \| `announcement` |
| `access_tier` | TEXT | Minimum membership tier required |

### CourseModule
Structured learning content within a CommunitySpace.

| Field | Type | Notes |
|---|---|---|
| `community_id` | FK | Parent space |
| `title` | TEXT | Module title |
| `status` | ENUM | `draft` \| `published` |
| `access_tier` | TEXT | Minimum membership tier to view |
| `sequence` | INTEGER | Display order |

### CommunityEvent
Live or recorded events within a CommunitySpace.

| Field | Type | Notes |
|---|---|---|
| `community_id` | FK | Parent space |
| `title` | TEXT | Event name |
| `type` | ENUM | `live` \| `recorded` \| `in_person` |
| `starts_at` | INTEGER | Unixepoch |
| `location` | TEXT | Physical or URL |
| `access_tier` | TEXT | Minimum membership tier |

---

## Membership Tiers

Community membership tiers are Offerings in the WebWaka entity model.

```
Free       → read-only access to public channels and course previews
Basic      → full channel access, no courses
Pro        → full channels + courses + events
VIP        → all above + 1-on-1 sessions + direct messaging with owner
```

Tier upgrades flow through `@packages/payments` (Paystack / Flutterwave).  
CBN KYC tier gating applies for paid tiers above Basic (≥ ₦5,000/month).

---

## Architecture Rules

1. **One CommunitySpace per Workspace** — a Workspace may manage multiple Brand Surfaces but only one CommunitySpace root.
2. **Moderation-first** — all user-generated content passes through `@packages/moderation` before publication.
3. **Offline support** — course content must be readable offline (cached via Service Worker). Forum posts are queued offline and synced on reconnect via `@packages/offline-sync`.
4. **NIN/BVN for paid tiers** — paid community memberships above ₦50,000/year require at minimum CBN KYC Tier 2 (BVN verified).
5. **Geography-scoped discovery** — public CommunitySpaces are indexed in the search layer with LGA/State/Zone scope for geo-discovery.

---

## Invariant Extensions

This module extends the following platform invariants:
- **P1 (Build Once):** Community primitives (channels, memberships, events) must be reusable across all verticals, not rebuilt per sector.
- **P2 (Nigeria First):** Naira-denominated tiers, Paystack-primary payment, NDPR consent before data collection.
- **T5 (Subscription-Gated):** All tier gates use `@packages/entitlements` + `requireKYCTier()`.
