# Feed Algorithm Specification

**Status:** Draft — M7 Governance Baseline
**Author:** Base44 Super Agent (Milestone 7)
**Milestone:** M7 — Full Platform + Community/Social
**Date:** 2026-04-08

---

## 3-in-1 Platform Classification

> **3-in-1 classification:** Social features are **cross-cutting infrastructure** that enhance all three pillars but are particularly integral to **Pillar 3 (Listing / Multi-Vendor Marketplace)** as the community and social engagement layer for marketplace participants. Social is NOT a standalone product pillar. See `docs/governance/3in1-platform-architecture.md`.

---

## Overview

The WebWaka social feed is a ranked, reverse-chronological feed of `SocialPost` records filtered and scored per viewer. It runs on Cloudflare Workers with D1 for storage and KV for per-user feed caches.

The algorithm is intentionally simple at M7 launch and designed to be iteratively improved via AI capabilities (`@packages/ai-abstraction`).

---

## Feed Types

| Feed | Description |
|---|---|
| **Home Feed** | Posts from accounts the viewer follows + boosted content |
| **Explore Feed** | Public posts filtered by viewer's geography (LGA → State → Zone) |
| **Group Feed** | Posts within a specific SocialGroup |
| **Profile Feed** | All posts by a specific SocialProfile |
| **Trending Feed** | Top-scored public posts in viewer's geography (last 24h) |

---

## Ranking Signals

Each post receives a **FeedScore** calculated as:

```
FeedScore = RecencyScore + EngagementScore + RelevanceScore + TrustScore
```

### RecencyScore
```
RecencyScore = 1 / (1 + hours_since_posted)
```
Posts older than 72 hours receive RecencyScore = 0 for home feed (still visible on profile feed).

### EngagementScore
```
EngagementScore = (likes × 1.0) + (comments × 2.0) + (reposts × 3.0) + (saves × 2.5)
EngagementScore = log(1 + raw_score)   // log-scale to prevent viral dominance
```

### RelevanceScore
```
RelevanceScore = geography_match + topic_match + relationship_depth
```
- `geography_match`: +2 if post is from same LGA, +1 if same State, +0.5 if same Zone
- `topic_match`: +1 per matched interest tag (user interest model, M8)
- `relationship_depth`: +3 if author is a direct follow, +1 if mutual follow of a follow

### TrustScore
```
TrustScore = author_verified × 1.5 + author_kyc_tier × 0.5
```
Verified accounts (blue tick) and higher-KYC-tier accounts receive a mild trust boost. This reduces anonymous disinformation amplification — a specific Nigeria social media risk.

---

## Feed Generation

### Home Feed (per user, cached in KV)

```
1. Fetch followed account IDs from SocialFollow where follower_id = viewer_id
2. Query SocialPost where author_id IN (followed_ids) AND created_at > (now - 72h)
3. For each post: compute FeedScore
4. Sort DESC by FeedScore
5. Insert boosted_posts at positions 5, 15, 30 (paid placement)
6. Cache result in WEBWAKA_KV at key feed:{viewer_id}:home for 5 minutes
7. Return paginated slice (limit 20, cursor-based)
```

### Explore Feed (geography-driven)

```
1. Resolve viewer's LGA from workspace geography context
2. Query SocialPost WHERE visibility = 'public'
     AND author geography = viewer_LGA (fallback: State → Zone)
     AND created_at > (now - 24h)
3. Score and sort as above
4. Cache at feed:{viewer_id}:explore for 15 minutes
```

---

## Boosted Content (Paid Placement)

Organisations with an active subscription can boost posts. Boosted posts are:
- Inserted at fixed feed positions (5, 15, 30)
- Labelled `[Sponsored]` in the UI
- Charged per impression (integer kobo, stored in `feed_impressions` table)
- Capped at 3 boosted posts per 20-post page (15%)

Boost eligibility requires:
- Active workspace subscription
- CBN KYC Tier 2 minimum for financial/regulated category boosts

---

## Moderation Integration

Before any post enters the feed:

```
1. is_flagged = 0 → proceed
2. is_flagged = 1, severity = 'review' → show with [Under Review] label
3. is_flagged = 1, severity = 'removed' → exclude from feed entirely
4. Author has active strike (3+ flags in 30 days) → deprioritise (RelevanceScore × 0.1)
```

---

## Nigeria-Specific Adaptations

- **Low-bandwidth optimisation:** Feed payloads are capped at 10KB per post card. Media is lazy-loaded. Text-only mode available per user setting.
- **Offline feed:** Last 50 home feed posts cached in IndexedDB via `@packages/offline-sync`. Readable without network.
- **USSD preview:** Top 5 trending posts in viewer's LGA available as USSD pull via `*384#` → `3` → `Explore`.
- **Language filter:** Posts in `pcm` (Naija Pidgin) are labelled and filterable — not suppressed.

---

## API Endpoints

```
GET  /social/feed/home          → paginated home feed (cursor-based)
GET  /social/feed/explore       → geography-filtered explore
GET  /social/feed/trending      → top scored last 24h in viewer geography
GET  /social/groups/:id/feed    → group-scoped feed
GET  /social/profiles/:id/posts → profile post history
POST /social/posts              → create post
POST /social/posts/:id/react    → like/heart/fire
POST /social/posts/:id/repost   → repost or quote
POST /social/posts/:id/report   → flag for moderation
```
