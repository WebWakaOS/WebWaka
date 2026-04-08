# Replit Agent 4: M7a Regulatory Survival + Multi-Channel Contact — FULL IMPLEMENTATION

**Repo:** https://github.com/WebWakaDOS/webwaka-os (main: b5f181e)

**MANDATORY FIRST STEP (90 minutes):** Review ALL 61 updated docs one by one thoroughly before any coding:

**Governance (28 files):**
- docs/governance/core-principles.md
- docs/governance/platform-invariants.md
- docs/governance/universal-entity-model.md
- docs/governance/relationship-schema.md
- docs/governance/entitlement-model.md
- docs/governance/geography-taxonomy.md
- docs/governance/political-taxonomy.md
- docs/governance/claim-first-onboarding.md
- docs/governance/partner-and-subpartner-model.md
- docs/governance/white-label-policy.md
- docs/governance/ai-policy.md
- docs/governance/security-baseline.md
- docs/governance/release-governance.md
- docs/governance/agent-execution-rules.md
- docs/governance/milestone-tracker.md
- docs/governance/data-residency-ndpr.md
- docs/governance/kyc-compliance-cbn.md
- docs/governance/multi-channel-contact.md
- docs/governance/otp-delivery-channels.md
- docs/governance/bvn-nin-integration.md

**Community (5 files):**
- docs/community/community-model.md
- docs/community/skool-features.md
- docs/community/community-entitlements.md
- docs/community/community-moderation.md
- docs/community/community-monetization.md

**Social (5 files):**
- docs/social/social-graph.md
- docs/social/feed-algorithm.md
- docs/social/content-moderation.md
- docs/social/dm-privacy.md
- docs/social/stories-spec.md

**Enhancements M7 (5 files):**
- docs/enhancements/m7/kyc-compliance.md
- docs/enhancements/m7/agent-network.md
- docs/enhancements/m7/offline-sync.md
- docs/enhancements/m7/ndpr-consent.md
- docs/enhancements/m7/cbn-kyc-tiers.md

**Identity (3 files):**
- docs/identity/bvn-nin-guide.md
- docs/identity/otp-channels.md
- docs/identity/frsc-cac-integration.md

**Contact (3 files):**
- docs/contact/multi-channel-model.md
- docs/contact/contact-verification.md
- docs/contact/otp-routing.md

**Milestones & Agents:**
- docs/milestones/milestone-tracker.md
- AGENTS.md

---

**Branch:** `feat/m7a-regulatory-survival-multi-channel` from main  
**Scope:** 25 deliverables (3 days)  
**Target:** 2026-04-09 12:00 WAT

## 🎯 DELIVERABLES BY DAY

### Day 1: Schema Foundation (8 migrations)
```
1. infra/db/migrations/0013_init_users.sql
```
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT,
  password_hash TEXT,
  full_name TEXT,
  contact_channels TEXT DEFAULT '{}', -- JSONB {sms:true,whatsapp:true}
  kyc_status TEXT DEFAULT 'unverified',
  kyc_tier TEXT DEFAULT 't0',
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_kyc ON users(kyc_status, kyc_tier);
```

```
2. 0014_kyc_fields.sql -- NIN/BVN on profiles
3. 0015_otp_log.sql -- replay protection (idempotency)
4. 0016_kyc_records.sql -- audit trail
5. 0017_consent_records.sql -- NDPR compliance
6. 0018_contact_channels.sql -- JSONB normalization
7. 0019_missing_indexes.sql -- phone/email/kyc
8. 0020_webhook_idempotency.sql -- duplicate protection
```

### Day 2: Packages (3 packages = 15 files)
**packages/identity/src/**
```
- bvn.ts -- Paystack /bank/resolve_bvn
- nin.ts -- Prembly /api/v2/nin/verify
- cac.ts -- Prembly /api/v2/cac/search
- frsc.ts -- Prembly /api/v2/frsc/verify
- types.ts -- KYCResult, VerificationStatus
```

**packages/otp/src/**
```
- termii-sms.ts -- Primary SMS (Termii)
- whatsapp-meta.ts -- Meta Cloud API v18.0
- telegram-bot.ts -- Telegram Bot API
- multi-channel.ts -- getPreferredChannel(contact)
```

**packages/contact/src/**
```
- normalizeContactChannels(raw: string[])
- getPreferredOTPChannel(contact: Contact)
- isVerified(channel: string, contact: Contact)
```

### Day 3: API + Middleware + Tests
**API Routes (apps/api/src/routes/):**
```
POST /contact/verify/:channel (sms/whatsapp/telegram/email)
POST /contact/preferences -- OTP priority order
POST /identity/verify-bvn
POST /identity/verify-nin  
POST /identity/verify-cac
```

**Middleware:**
```
- rate-limit.ts -- KV sliding window (10/min)
- audit-log.ts -- auto event_log insert
- cors.ts -- tenant-specific origins
```

**Entitlements:**
```
cbn-kyc-tiers.ts -- T1:₦50k, T2:₦5m, T3:unlimited
```

**Tests (60+ new):**
```
- identity.test.ts (25 tests)
- otp.test.ts (20 tests)  
- contact.test.ts (15 tests)
```

**Multi-channel UX:** Primary phone → "WhatsApp same?" checkbox → Telegram optional

---

**PR:** feat/m7a-regulatory-survival-multi-channel → main  
**Labels:** milestone-7, regulatory, identity, base44  
**Reviewer:** @WebWakaDOS