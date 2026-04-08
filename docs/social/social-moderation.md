# Social Moderation Policy and Architecture

**Status:** Draft — M7 Governance Baseline
**Author:** Base44 Super Agent (Milestone 7)
**Milestone:** M7 — Full Platform + Community/Social
**Date:** 2026-04-08

---

## Overview

All user-generated content on WebWaka Social passes through a moderation pipeline before or immediately after publication. Moderation is implemented in `@packages/moderation` and is a mandatory middleware layer — no social feature may bypass it.

This policy is Nigeria-first, complying with Nigeria's:
- **NITDA Code of Practice for Interactive Computer Service Platforms/Internet Intermediaries (2022)**
- **Cybercrimes (Prohibition, Prevention, etc.) Act 2015** — Sections 24 (cyberstalking) and 25 (racist/xenophobic content)
- **NDPR 2019** — user data handling in moderation records

---

## Content Categories

### Prohibited Content (Auto-Remove, Zero Tolerance)

| Category | Basis |
|---|---|
| Child sexual abuse material (CSAM) | Cybercrimes Act §22 |
| Incitement to ethnic/religious violence | Cybercrimes Act §26 |
| Non-consensual intimate imagery | Cybercrimes Act §24 |
| Fraudulent solicitation (advance fee fraud, 419) | Cybercrimes Act §14 |
| Unauthorised financial services advertising | CBN Guidelines on Social Media |

Prohibited content is auto-removed within 60 seconds of detection and reported to NITDA where legally required.

### Restricted Content (Review Required)

| Category | Action |
|---|---|
| Political advertising | Label + require verified workspace |
| Health claims / medical advice | Label [Unverified Health Claim] |
| Cryptocurrency promotion | Label + require KYC Tier 2 |
| Graphic violence (news context) | Age gate + click-through warning |
| Satire / parody of public figures | Label [Satire] |

### Contextual Content (Geo-Sensitive)

| Category | Action |
|---|---|
| Tribal / ethnic references | Context-reviewed — cultural norm vs. hate |
| Religious commentary | Context-reviewed — discourse vs. incitement |
| Political opinion | Allowed — not restricted under NITDA guidelines |

---

## Moderation Pipeline

### Stage 1 — Pre-Publication (Automated)

```
POST /social/posts → moderation middleware intercept
  ↓
  1. Hash content → check against prohibited hash list (PhotoDNA equivalent for text)
  2. Run keyword filter (configurable list per tenant + global blocklist)
  3. Run AI classifier via @packages/ai-abstraction (text safety score 0-1)
     - score < 0.3  → auto-approve
     - score 0.3-0.7 → queue for human review, publish with [Under Review] label
     - score > 0.7  → auto-hold (not published until review)
  4. Check author strike count → if ≥5 strikes: all posts pre-moderated
  ↓
  Result: approved | review_queued | held
```

### Stage 2 — Human Review Queue

Moderation queue is processed by:
1. Platform-level moderators (WebWaka staff)
2. Community-level moderators (CommunitySpace admins with `moderator` role)
3. Group-level moderators (SocialGroup admins)

Priority order: Held content → Review-queued content → Reported content

Target SLA:
- Held content: reviewed within 2 hours
- Review-queued: reviewed within 24 hours
- Reports: reviewed within 48 hours

### Stage 3 — Reporting (User-Triggered)

```
POST /social/posts/:id/report
  → creates ModerationReport record
  → if report_count > 10 for same post: auto-escalate to held
  → notifies platform moderators via internal alert
```

---

## Strike System

| Strikes | Consequence |
|---|---|
| 1 | Warning DM |
| 2 | 24-hour posting restriction |
| 3 | 7-day posting restriction |
| 4 | Pre-moderation on all posts (indefinite) |
| 5+ | Account suspended pending review |

Strikes reset after 90 days with no new violations.

---

## Data Model

### ModerationRecord
| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `content_id` | FK → SocialPost | Moderated content |
| `content_type` | ENUM | `post` \| `comment` \| `dm` \| `profile` |
| `action` | ENUM | `approved` \| `flagged` \| `removed` \| `held` |
| `reason` | TEXT | Moderation reason code |
| `ai_score` | REAL | Classifier output (0-1) |
| `reviewed_by` | FK (nullable) | Human reviewer profile ID |
| `reviewed_at` | INTEGER (nullable) | Unixepoch |
| `tenant_id` | TEXT | Tenant scope |
| `created_at` | INTEGER | Unixepoch |

### ModerationReport
| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `reporter_id` | FK → Profiles | Reporting user |
| `content_id` | FK → SocialPost | Reported content |
| `reason_code` | ENUM | `spam` \| `harassment` \| `violence` \| `fraud` \| `misinformation` \| `other` |
| `details` | TEXT (nullable) | Reporter's explanation |
| `status` | ENUM | `pending` \| `reviewed` \| `actioned` \| `dismissed` |
| `created_at` | INTEGER | Unixepoch |

---

## NITDA Compliance

Under NITDA's Code of Practice (2022), platforms must:

1. **Designate a Nigeria-based contact** — registered with NITDA. *(Compliance: founder registration required pre-launch)*
2. **Respond to takedown notices within 24 hours** — automated via `ModerationRecord` + operator alert.
3. **Publish quarterly transparency reports** — generated from `ModerationRecord` aggregate query.
4. **Provide user appeal mechanism** — `POST /social/moderation/:id/appeal` endpoint (M7 scope).

---

## NDPR Compliance

- Moderation records containing user content are stored for maximum 12 months.
- After 12 months, `content` field is hashed (SHA-256) — full text purged.
- User has right to request moderation history under NDPR Article 3.1(7).
- All moderation staff access is logged in the audit trail.
