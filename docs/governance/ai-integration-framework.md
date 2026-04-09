# AI Integration Framework

**Status:** M8-AI Planning Baseline  
**Date:** 2026-04-08  
**Purpose:** Define how AI integrates into each platform domain and all 17 P1 verticals  
**Dependency:** All vertical AI features must use this framework; no vertical reimplements AI primitives

---

## Architectural Principle

Platform Invariant P1 (Build Once Use Infinitely) governs AI integration:

```
Every vertical AI feature = 
  shared AI routing engine (packages/ai-abstraction/src/router.ts)
  + shared credit deduction (packages/ai-abstraction/src/billing.ts)
  + shared audit logging (packages/ai-abstraction/src/audit.ts)
  + vertical-specific prompt templates (packages/verticals-*/src/ai-prompts.ts)
  + vertical-specific write boundary declaration (packages/verticals-*/src/ai-config.ts)
```

No vertical package calls an AI provider directly. All calls route through `resolveAdapter()`.

---

## 1. Commerce Domain

### POS Business Management (`packages/verticals-pos-business/` — planned M8b)
| AI Feature | Capability | Autonomy | Billing | Vertical Config |
|---|---|---|---|---|
| Product description generator | Text generation | L1 | Credits | `autonomy: L1, hitl: false` |
| Inventory anomaly alert | Analytics + Classification | L0 | Credits | Read-only |
| Sales trend summary | Summarization | L0 | Credits | Read-only |
| Customer communication draft | Text generation | L1 | Credits | Draft only |
| Reorder suggestion | Analytics | L2 (supervised) | Credits | Supervised write to `offerings.stock_alert` |

### Market (`packages/verticals-market/` — planned M8e)
| AI Feature | Capability | Autonomy |
|---|---|---|
| Vendor catalog enrichment | Text generation | L3 (batch) |
| Price comparison insight | Analytics | L0 |
| Market report generation | Summarization + Research | L0 |

### Restaurant, Supermarket, Fashion Brand, Pharmacy Chain (P2 verticals)
Inherit POS Business AI config as base; extend per-vertical.

---

## 2. Transport Domain

### Motor Park (`packages/verticals-motor-park/` — planned M8c)
| AI Feature | Capability | Autonomy |
|---|---|---|
| Route demand prediction | Analytics | L0 |
| Vehicle capacity optimization | Analytics + Text | L0 |
| Incident report draft | Text generation | L1 |
| Passenger announcement | TTS (L4 if enabled) | L4 scoped |

### Mass Transit, Rideshare, Haulage
Inherit Motor Park AI config; extend with route-specific features.

---

## 3. Civic / Community Domain

### Church (`packages/verticals-church/` — planned M8d)
| AI Feature | Capability | Autonomy | HITL |
|---|---|---|---|
| Sermon outline generator | Text generation | L1 | No |
| Event announcement draft | Text generation | L1 | No |
| Member communication | Text + TTS | L2 (supervised) | Yes |
| Devotional content | Text generation | L1 | No |

### NGO (`packages/verticals-ngo/` — planned M8d)
| AI Feature | Capability | Autonomy | HITL |
|---|---|---|---|
| Donor communication draft | Text generation | L1 | No |
| Impact report generation | Summarization | L1 | No |
| Beneficiary eligibility triage | Classification | L2 | Yes |
| Grant application assistance | Text generation | L1 | No |

### Cooperative Society
Inherits NGO civic AI config; adds financial summary (read-only, no financial writes).

---

## 4. Social / Networking Domain

Uses `packages/social/` existing infrastructure.

| AI Feature | Surface | Capability | Autonomy |
|---|---|---|---|
| Post caption generator | Social post creation | Text generation | L1 |
| Hashtag suggestions | Social post creation | Classification | L1 |
| Pidgin/Yoruba/Igbo translation | Post/message | Text generation | L1 |
| Feed personalization | Discovery feed | Embeddings + Classification | L0 (platform-side) |
| Content moderation | Post/comment | Moderation/Classification | L4 (platform auto-mod) |
| DM smart reply | Direct messages | Text generation | L1 |

**Moderation AI note:** Community moderation (`packages/community/src/community.ts`) can use classification-based AI moderation. This is L4 but scoped exclusively to `moderation_actions` table. No user content is modified — only moderation flags.

---

## 5. Identity / KYC Support Flows

**Critical restriction:** AI must NEVER process raw BVN/NIN (Platform Invariant R7 — SHA-256 only).

| AI Feature | Use Case | Capability | Restriction |
|---|---|---|---|
| Document quality check | Pre-upload OCR assist | Image understanding | Cannot extract or store ID number |
| Verification guidance | Walk user through KYC | Text generation (L0) | No financial advice |
| Address verification assist | NDPR-compliant address check | Classification | Consent required first |

All KYC-adjacent AI requires prior `consent_records` entry (`data_type = 'AI_PROCESSING'`).

---

## 6. Customer Support Domain

| AI Feature | Provider | Capability | Autonomy | HITL |
|---|---|---|---|---|
| Support chat (FAQ) | All | Text generation | L0 (read-only responses) | No |
| Support ticket triage | All | Classification | L2 | No |
| Auto-response (common queries) | All | Text generation | L4 (scoped to support_messages) | No (anomaly detection only) |
| Escalation detection | All | Classification | L0 → triggers human | Auto-escalate to human |

---

## 7. Analytics and Reporting

| AI Feature | Data Source | Capability | Autonomy |
|---|---|---|---|
| Workspace performance summary | D1 workspace analytics | Summarization | L0 |
| Revenue trend insight | billing_history | Analytics + Text | L0 |
| Audience growth analysis | community + social | Analytics | L0 |
| Competitive positioning | Research (Enterprise) | Research | L0 |
| Predictive churn | Subscription status history | Analytics | L0 (alert only) |

All analytics AI is L0 — read, summarize, alert. No autonomous writes.

---

## 8. Content Generation

| AI Feature | Vertical | Capability | Autonomy |
|---|---|---|---|
| Product descriptions | Commerce | Text generation | L1/L3 |
| Political campaign content | Politician/Party | Text generation | L2 + HITL mandatory |
| Event descriptions | All verticals | Text generation | L1 |
| Course content outlines | School/Creator | Text generation | L1 |
| Church sermon outlines | Church | Text generation | L1 |
| Grant proposals | NGO | Text generation | L1 |
| Bio/profile descriptions | Professional/Creator | Text generation | L1 |
| Offering descriptions | All verticals | Text generation | L1/L3 |

---

## 9. Email and Messaging

| AI Feature | Channel | Capability | Autonomy |
|---|---|---|---|
| Email draft | All | Text generation | L1 |
| WhatsApp message draft | All | Text generation | L1 |
| Bulk announcement | Community | Text generation | L2 (supervised — >50 recipients = HITL) |
| SMS template | USSD/Termii | Text (short) | L1 (140 char output cap enforced) |
| TTS voice announcement | Motor Park, Church | TTS | L2 |

---

## 10. Research and Data Enrichment

| AI Feature | Use Case | Capability | Plan |
|---|---|---|---|
| Competitor analysis | Professional, Tech Hub | Research | Enterprise |
| Market size estimation | Commerce | Research | Enterprise |
| Regulatory update digest | All regulated sectors | Research | Enterprise |
| Entity data enrichment | Discovery seeding | Research + Classification | Enterprise (platform-side batch) |
| Social listening | Creator, Political | Research | Enterprise |

---

## 11. Upload-to-Database Workflows

AI-assisted bulk data import. Requires L3 minimum.

| Workflow | Input | AI Role | Write Boundary |
|---|---|---|---|
| Product catalog import (CSV) | CSV file | Classification + enrichment | `offerings.*` |
| Member list import | Excel/CSV | Classification + deduplication | `workspace_memberships` |
| Event import | CSV | Text normalization | `community_spaces.events` |
| Route/schedule import | Excel | Validation + normalization | `transport_routes` (planned) |

Upload workflows require:
1. User uploads file
2. AI shows preview of mapped data and any issues
3. User approves mapping (L2 HITL)
4. AI writes to D1 in batch (L3, up to `maxRowsPerBatch` per write boundary)

---

## 12. Background Agent and Workflow Engine

Planned for M9+ when HITL infrastructure is stable.

| Agent | Vertical | Trigger | Autonomy | Status |
|---|---|---|---|---|
| Daily inventory checker | POS Business | CRON | L0 (alert only) | M9 |
| Weekly community digest | Church/NGO | CRON | L1 (draft, manual send) | M9 |
| Auto-moderator | Community/Social | Event-driven | L4 (scoped) | M10 |
| Sales pipeline nudge | Commerce | Event-driven | L2 | M10 |
| Campaign scheduler | Politician | Event-driven | L2 + HITL | M10 |

Background agents run via Cloudflare Workers CRON triggers (not USSD path).

---

## Integration Checklist (per vertical, pre-implementation)

Before implementing AI for any vertical:

- [ ] Complete `docs/templates/vertical-ai-research-template.md`
- [ ] Declare `AI_CAPABILITY_SET` in vertical package config
- [ ] Declare `AUTONOMY_LEVEL` per AI feature
- [ ] Declare `HITL_REQUIRED: boolean` per AI feature
- [ ] Declare write boundary (`AIWriteBoundary[]`) for any L2+ feature
- [ ] Declare `SENSITIVE_SECTOR: boolean` for the vertical
- [ ] Confirm no AI feature touches PII without consent check
- [ ] Confirm no AI feature touches financial tables
- [ ] Register vertical AI config in `ai_vertical_configs` D1 table
