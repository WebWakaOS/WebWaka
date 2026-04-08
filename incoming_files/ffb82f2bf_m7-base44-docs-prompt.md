# Base44 Super Agent — M7 FULL DOCS UPDATE EXECUTION PROMPT

**Repo:** https://github.com/WebWakaDOS/webwaka-os  
**Status:** Milestones 0-6 ✅ LIVE | M7: Nigeria Hardening + Community + Social Platform  
**Branch:** Create `feat/m7-docs-update` from current `main` (237d9e7)  
**Deadline:** Complete structure by 2026-04-08 14:00 WAT

## 🎯 MANDATORY DOCS INVENTORY & UPDATE

### STEP 1: CATALOG ALL EXISTING DOCS (30 minutes)
```
docs/governance/ (16 files) → Audit ALL for:
├── universal-entity-model.md → Add CommunityMember, SocialPost, ForumThread
├── entitlement-model.md → Add KYC tiers (CBN T1-T3), Community tiers
├── relationship-schema.md → Add follows, community_membership, forum_reply
├── platform-invariants.md → Add NDPR consent, agent float double-entry
├── security-baseline.md → Add BVN/NIN, rate limiting, webhook idempotency
└── ALL 16 files → Flag for KYC/offline/agent review

docs/architecture/decisions/ (12 TDRs) → Audit ALL:
├── TDR-0009-ai-provider-abstraction.md → Extend pattern to payments/otp/identity
├── TDR-0010-offline-pwa-standard.md → Add Dexie.js, USSD fallback requirements
└── ALL 12 → Cross-reference new packages

docs/milestones/ (6 briefs) → Update milestone-tracker.md:
M7: Platform Hardening + Community/Social (5 phases, 84 deliverables)
```

### STEP 2: CREATE NEW DOCS STRUCTURE (60 minutes)

```
📁 docs/community/ ← NEW FOLDER
├── community-model.md
├── skool-features.md (forums/courses/memberships/events)
├── community-entitlements.md (free/paid tiers → access)
├── community-moderation.md (roles, content flags, bans)
└── community-monetization.md (memberships → payments sync)

📁 docs/social/ ← NEW FOLDER  
├── social-graph.md (follows/blocks/mutes/groups)
├── feed-algorithm.md (chronological + engagement ranking)
├── content-moderation.md (spam/profanity/NSFW)
├── dm-privacy.md (E2E encryption contracts)
└── stories-spec.md (24h ephemeral content)

📁 docs/enhancements/m7/ ← NEW FOLDER
├── kyc-compliance.md (CBN tiers + BVN/NIN/CAC/FRSC)
├── agent-network.md (POS terminals + float ledger)
├── offline-sync.md (Dexie.js + USSD fallback)
├── ndpr-consent.md (legal requirements)
└── cbn-kyc-tiers.md (transaction limits table)

📁 docs/identity/ ← NEW FOLDER
├── bvn-nin-guide.md (Prembly/Paystack APIs)
├── otp-channels.md (SMS/USSD/WhatsApp/Telegram priority)
└── frsc-cac-integration.md (transport compliance)

📁 docs/contact/ ← NEW FOLDER  
├── multi-channel-model.md (primary_phone + whatsapp + telegram)
├── contact-verification.md (independent channel verification)
└── otp-routing.md (preference + fallback chain)
```

### STEP 3: SPECIFIC GOVERNANCE UPDATES

```
1. universal-entity-model.md → ADD:
```
ContactChannels { primary_phone, whatsapp_phone, telegram_handle, email, verification, preferences }
CommunityMember { id, community_id, user_id, role, joined_at }
SocialPost { id, author_id, content, reactions, created_at }
ForumThread { id, community_id, title, author_id, posts_count }
```

2. entitlement-model.md → ADD CBN KYC TIERS + MULTI-CHANNEL:
```
KYC Tier 1: Phone verified → ₦50k/day
KYC Tier 2: BVN verified → ₦200k/day  
KYC Tier 3: NIN+BVN → Unlimited
Channel verification → KYC tier uplift
```

3. platform-invariants.md → ADD:
```
P12: Multi-channel consent (NDPR)
P13: Primary phone mandatory, WhatsApp/Telegram optional
P14: Agent float → double-entry ledger
P15: Offline writes → Dexie.js queue → deterministic sync
```

4. security-baseline.md → ADD:
```
R8: Multi-channel OTP (SMS → WhatsApp → Telegram fallback)
R9: Rate limiting per channel (phone + IP)
R10: Contact verification independent per channel
```

5. claim-first-onboarding.md → UPDATE FORM FLOW:
```
1. Primary phone (SMS-capable) → Verify SMS OTP
2. "WhatsApp same as primary?" → Checkbox → If no: WhatsApp number → Verify WhatsApp OTP
3. "Add Telegram?" → Optional @handle → Verify Telegram Bot
4. Email → Optional → Verify email link
```

### STEP 4: MILESTONE TRACKER UPDATE
```
milestone-tracker.md → M7 FULL SCOPE:
```
## M7: Nigeria Hardening + Community/Social + Multi-Channel Contact (22 days)

**M7a: Regulatory Survival** (3d) — BVN/NIN/CAC/FRSC + NDPR + CBN + Multi-channel contact
**M7b: Offline/Agents** (3d) — Dexie.js + USSD + POS + float ledger
**M7c: Community Platform** (4d) — Skool: forums/courses/memberships/events
**M7d: Social Platform** (4d) — Posts/feeds/DMs/groups/stories
**M7e: Nigeria UX** (2d) — Airtime + LGA selector + Pidgin + dark mode
**M7f: Integration** (3d) — Cross-vertical testing + docs finalization

**Total:** 91 deliverables (57 enhancements + 27 verticals + 7 multi-channel)
**Tests:** 360+ target
```
```

### STEP 5: PACKAGE SCAFFOLDS
```
packages/identity/package.json
packages/otp/package.json  
packages/contact/package.json
packages/community/package.json
packages/social/package.json
apps/ussd-gateway/wrangler.toml
```

## 📋 DELIVERABLES CHECKLIST
```
[ ] feat/m7-docs-update branch created
[ ] Updated: 28 docs (governance + TDRs + milestones)
[ ] NEW: docs/community/ (5 files), docs/social/ (5), docs/enhancements/m7/ (5)
[ ] NEW: docs/identity/ (3), docs/contact/ (3)
[ ] NEW: 5 package.json + 1 wrangler.toml stubs
[ ] PR → main with Labels: milestone-7, docs, governance, base44
```

**Copy-paste to Base44 Super Agent IMMEDIATELY.** 

This creates the **complete governance foundation** for **91 deliverables** (57 enhancements + 27 verticals + 7 multi-channel contact) across **6 M7 phases**. Multi-channel contact (SMS/WhatsApp/Telegram) is fully integrated into the core identity/claims flow with proper docs, schema, and verification.

**Docs complete → code execution begins.** 🚀 [file:288][file:289]