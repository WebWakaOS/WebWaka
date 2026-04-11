# Skool-Style Features Specification

**Status:** Draft — M7 Governance Baseline
**Author:** Base44 Super Agent (Milestone 7)
**Milestone:** M7 — Full Platform + Community/Social
**Date:** 2026-04-08

---

## Feature Parity Map

This document maps Skool's core feature set to WebWaka Community equivalents, noting what is adopted, adapted for Nigeria, or intentionally excluded.

---

## Core Features

### 1. Community Classroom (Courses)

| Skool Feature | WebWaka Equivalent | Status |
|---|---|---|
| Course modules with lessons | `CourseModule` + `CourseLesson` entities | Planned M7 |
| Video + PDF content per lesson | R2-backed media attachments | Planned M7 |
| Progress tracking per member | `LessonProgress` table | Planned M7 |
| Course completion certificates | PDF generation via `@packages/documents` | Planned M8 |
| Course drip scheduling | `release_at` field on `CourseLesson` | Planned M7 |

**Nigeria adaptation:** Offline-first lesson delivery. Lessons are cached via Service Worker for low-connectivity environments (rural Nigeria, agent networks). Video is optional — text + image content is the primary format.

### 2. Community Forum

| Skool Feature | WebWaka Equivalent | Status |
|---|---|---|
| Channels (categorised threads) | `CommunityChannel` entity | Planned M7 |
| Posts with rich text | `CommunityPost` entity | Planned M7 |
| Comments and replies | `CommunityComment` with `parent_id` | Planned M7 |
| Upvotes / likes | `CommunityReaction` entity | Planned M7 |
| Pinned posts | `is_pinned` boolean on posts | Planned M7 |
| Member leaderboard | Computed from reaction + post counts | Planned M7 |

**Nigeria adaptation:** Pidgin English (Naija Creole / `pcm` locale) supported as a first-class posting language alongside `en-NG`.

### 3. Events

| Skool Feature | WebWaka Equivalent | Status |
|---|---|---|
| Live events with RSVP | `CommunityEvent` entity + `EventRSVP` | Planned M7 |
| Recorded event replay | R2 video URL on `CommunityEvent` | Planned M7 |
| Calendar view | Frontend calendar component | Planned M7 |
| Event reminders | Scheduled automation → SMS via Termii | Planned M7 |

**Nigeria adaptation:** SMS reminders (AfricasTalking / Termii) for live events. WhatsApp notification support (Meta Cloud API) as secondary channel.

### 4. Membership + Payments

| Skool Feature | WebWaka Equivalent | Status |
|---|---|---|
| Free + paid tiers | Offerings with Paystack plans | Planned M7 |
| Recurring monthly billing | Paystack `charge_authorization` | Planned M7 |
| One-time lifetime access | Single Paystack charge + entitlement flag | Planned M7 |
| Member directory | CommunityMembership + Profile lookup | Planned M7 |
| Invite links with tier pre-selection | Signed invite token + `invite_tier` | Planned M7 |

**Nigeria adaptation:** Naira-denominated pricing only at launch. Bank transfer top-up as fallback to card payment. CBN KYC tier gating for tiers above ₦50,000/year (Tier 2 required).

### 5. Direct Messaging

| Skool Feature | WebWaka Equivalent | Status |
|---|---|---|
| Member-to-member DMs | `DirectMessage` entity (see social-graph.md) | Planned M7 |
| Owner broadcast messages | `CommunityBroadcast` entity | Planned M7 |
| SMS fallback for offline users | Termii SMS via `@packages/otp` gateway | Planned M7 |

---

## Intentional Exclusions (M7)

| Skool Feature | Decision | Reason |
|---|---|---|
| Zoom integration | Excluded from M7 | Deferred — use in-person or link-based events for M7 |
| Affiliate programme | Excluded from M7 | Deferred to M8 partner model extension |
| Community analytics dashboard | Excluded from M7 | Analytics (XCT-5 from webwaka-cross-cutting) covers this |
| White-label mobile app | Excluded from M7 | PWA first (Platform Invariant P5) |

---

## API Route Plan (apps/api)

```
POST   /community/spaces              → create CommunitySpace
GET    /community/spaces/:slug        → get public space
POST   /community/spaces/:id/join     → join (tier + KYC check)
GET    /community/spaces/:id/channels → list channels
POST   /community/channels/:id/posts  → create post
GET    /community/channels/:id/posts  → list posts
POST   /community/posts/:id/comments  → comment
POST   /community/posts/:id/react     → upvote/like
GET    /community/courses/:id         → course + lessons
POST   /community/courses/:id/progress → mark lesson complete
GET    /community/events              → list upcoming events
POST   /community/events/:id/rsvp    → RSVP
```

---

## Package Dependencies

```
@webwaka/community       → new package (M7)
@webwaka/payments        → Paystack billing
@webwaka/entitlements    → tier + KYC gating
@webwaka/offline-sync    → lesson offline cache
@webwaka/moderation      → post + comment moderation
@webwaka/otp             → SMS event reminders
@webwaka/profiles        → member profile resolution
```
