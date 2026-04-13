# Social Graph Model

**Status:** Draft — M7 Governance Baseline
**Author:** Base44 Super Agent (Milestone 7)
**Milestone:** M7 — Full Platform + Community/Social
**Date:** 2026-04-08

---

## 3-in-1 Platform Classification

> **3-in-1 classification:** Social features are **cross-cutting infrastructure** that enhance all three pillars but are particularly integral to **Pillar 3 (Listing / Multi-Vendor Marketplace)** as the community and social engagement layer for marketplace participants. Social is NOT a standalone product pillar. See `docs/governance/3in1-platform-architecture.md`.

---

## Overview

WebWaka Social is a multi-modal social network built on top of the WebWaka relationship graph. It supports Twitter-style follows, Instagram-style stories, Facebook-style groups, and LinkedIn-style professional connections — all unified through the platform's entity model (Individuals, Organisations, Places).

Social features are a **workspace module**, not a standalone product. Every social actor is a claimed, verified entity on WebWaka OS.

---

## Social Entity Model

### SocialProfile
Extension of the core `profiles` entity with social-specific fields.

| Field | Type | Notes |
|---|---|---|
| `profile_id` | FK → Profiles | One-to-one extension |
| `handle` | TEXT UNIQUE | @username |
| `bio` | TEXT | Short bio (280 chars max) |
| `follower_count` | INTEGER | Denormalised counter |
| `following_count` | INTEGER | Denormalised counter |
| `is_verified` | INTEGER | 0/1 — blue tick (NIN/BVN verified) |
| `visibility` | ENUM | `public` \| `private` |

### SocialFollow
Directed follow graph between any two entities.

| Field | Type | Notes |
|---|---|---|
| `follower_id` | FK | Follower entity (Individual or Org) |
| `followee_id` | FK | Followed entity |
| `status` | ENUM | `active` \| `pending` (for private accounts) |
| `created_at` | INTEGER | Unixepoch |

### SocialPost
Core content unit. Used for posts, tweets, updates.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `author_id` | FK → Profiles | Posting entity |
| `content` | TEXT | Post body (2,000 chars max) |
| `media_urls` | JSON | Array of R2 CDN URLs |
| `post_type` | ENUM | `post` \| `repost` \| `quote` \| `story` |
| `parent_id` | FK (nullable) | For reposts / quote posts |
| `group_id` | FK (nullable) | If posted in a group |
| `visibility` | ENUM | `public` \| `followers` \| `group` \| `private` |
| `is_flagged` | INTEGER | Moderation flag |
| `tenant_id` | TEXT | Tenant scope |
| `created_at` | INTEGER | Unixepoch |
| `expires_at` | INTEGER (nullable) | For stories (24hr TTL) |

### SocialGroup
Facebook-style groups. Owned by an Organisation or Individual.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `owner_id` | FK → Profiles | Group owner |
| `name` | TEXT | Group name |
| `slug` | TEXT UNIQUE | URL identifier |
| `visibility` | ENUM | `public` \| `private` \| `secret` |
| `member_count` | INTEGER | Denormalised |
| `tenant_id` | TEXT | Tenant scope |

### SocialGroupMembership
| Field | Type | Notes |
|---|---|---|
| `group_id` | FK | Parent group |
| `member_id` | FK → Profiles | Member entity |
| `role` | ENUM | `owner` \| `admin` \| `moderator` \| `member` |
| `joined_at` | INTEGER | Unixepoch |

### DirectMessage
Private messaging between any two social actors.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `from_id` | FK → Profiles | Sender |
| `to_id` | FK → Profiles | Recipient |
| `content` | TEXT | Message body |
| `media_url` | TEXT (nullable) | Optional attachment |
| `read_at` | INTEGER (nullable) | Read receipt timestamp |
| `created_at` | INTEGER | Unixepoch |

### SocialReaction
Likes, hearts, etc. on posts and comments.

| Field | Type | Notes |
|---|---|---|
| `post_id` | FK → SocialPost | Target post |
| `reactor_id` | FK → Profiles | Reacting entity |
| `type` | ENUM | `like` \| `heart` \| `fire` \| `celebrate` |

---

## Relationship to Core Graph

The social follow graph **extends** the core relationship schema:

| Social Relationship | Core Relationship Equivalent |
|---|---|
| Follow (public entity) | `listed_in` (discovery visibility) |
| Group membership | `belongs_to` |
| Organisation page follow | `affiliated_with` |
| Verified entity follow | `serves` (for professional profiles) |

Social graph edges are stored in `SocialFollow`, not in the core `relationships` table, to allow higher write volume and graph-specific indexing.

---

## Indexes Required

```sql
CREATE INDEX idx_social_follow_follower ON social_follows(follower_id);
CREATE INDEX idx_social_follow_followee ON social_follows(followee_id);
CREATE INDEX idx_social_posts_author ON social_posts(author_id, created_at DESC);
CREATE INDEX idx_social_posts_group ON social_posts(group_id, created_at DESC);
CREATE UNIQUE INDEX idx_social_handle ON social_profiles(handle);
CREATE INDEX idx_dm_conversation ON direct_messages(from_id, to_id, created_at DESC);
```

---

## Verification Badge (Blue Tick)

`SocialProfile.is_verified = 1` when:
- The linked Individual has `nin_verified = 1` OR `bvn_verified = 1`, AND
- The workspace has an active subscription, AND
- The profile has been reviewed by platform moderation (no active flags)

This prevents badge farming without identity verification — a Nigeria-specific fraud vector.
