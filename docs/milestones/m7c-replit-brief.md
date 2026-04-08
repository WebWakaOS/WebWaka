# WebWaka OS — M7c Replit Brief

  **Prepared by:** Replit QA Agent
  **Date:** 2026-04-08
  **Phase:** M7c — Community Platform + Social Network
  **Estimated timeline:** 7 days
  **Status:** ACTIVE — M7b merged 2026-04-08, QA 178/178, PR #24 SHA ef76fdc

  ---

  ## Context

  M7b delivered the full offline and agent network stack:
  - D1 migrations 0022–0025 — agents, POS terminals, float ledger (append-only double-entry), agent sessions + sync log
  - `@webwaka/offline-sync` — Dexie.js runtime (db.ts, adapter.ts, sync-engine.ts, service-worker.ts, offline-indicator.ts)
  - `apps/ussd-gateway` — Hono Worker serving `*384#` via Africa's Talking, KV-backed session FSM, 5-branch USSD menu
  - `@webwaka/pos` — float-ledger.ts (double-entry, P9), terminal.ts, wallet.ts
  - 6 POS API routes + `POST /sync/apply` (idempotent P11)
  - 178 tests, all P6/P9/P11/T3/T4 invariants enforced

  M7c now builds the **Community Platform** (Skool-style: spaces, channels, forums, courses, events, paid tiers)
  and the **Social Network** (Twitter+IG+FB-style: posts, feed, follows, groups, DMs, stories).

  ---

  ## Repo State You Are Starting From

  **Branch:** create `feat/m7c-community-social` from current `main`
  **Main HEAD:** `41e11d8` (post-M7b merge + admin commit)

  **Do NOT push directly to `main`.** Open PR: `feat/m7c-community-social` → `main`.

  ---

  ## M7c Non-Negotiable Platform Invariants

  | Invariant | Enforcement Point |
  |---|---|
  | P1 — Build Once | Community + Social primitives must be in packages; zero duplication in API routes |
  | P2 — Nigeria First | Naira-denominated tiers (kobo), Paystack-primary, NDPR consent at every data collection |
  | P4 — Mobile First | All new UI surfaces verified at 360px |
  | P5 — PWA First | Course offline cache via Service Worker; last 50 feed posts in IndexedDB |
  | P6 — Offline First | Course content readable offline; forum posts queued in Dexie.js on disconnect |
  | P7 — Vendor Neutral AI | AI moderation classifier routed through `@packages/ai-abstraction` — no direct OpenAI/Anthropic SDK calls |
  | P10 — NDPR Consent | consent_records row required before any member data collection at community join |
  | P11 — Sync FIFO | Offline community posts use existing sync engine; no new queue mechanism |
  | T2 — TypeScript First | Strict mode throughout. No `any` without comment |
  | T3 — Tenant Isolation | Every query includes `tenant_id` predicate. Every KV key prefixed `tenant:{id}:` |
  | T4 — Monetary Integrity | All membership prices stored as integer kobo. `price_kobo` everywhere — never floats |
  | T5 — Subscription-Gated | All community + social feature access via `@packages/entitlements` guards |
  | T8 — Step-by-Step Commits | Small coherent commits per feature. No mega-commits |

  ---

  ## Deliverable 1 — D1 Migrations (0026–0034)

  > Migration files live in `infra/db/migrations/`. Run in numeric order. Each is idempotent (`IF NOT EXISTS`).

  ### Migration 0026 — Community Spaces + Memberships

  ```sql
  -- infra/db/migrations/0026_community_spaces.sql

  CREATE TABLE IF NOT EXISTS community_spaces (
    id              TEXT NOT NULL PRIMARY KEY,
    workspace_id    TEXT NOT NULL,
    name            TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    description     TEXT,
    visibility      TEXT NOT NULL DEFAULT 'public'
                    CHECK (visibility IN ('public', 'private', 'invite_only')),
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_community_workspace ON community_spaces(workspace_id);
  CREATE INDEX IF NOT EXISTS idx_community_tenant ON community_spaces(tenant_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_community_slug ON community_spaces(slug, tenant_id);

  CREATE TABLE IF NOT EXISTS membership_tiers (
    id              TEXT NOT NULL PRIMARY KEY,
    community_id    TEXT NOT NULL REFERENCES community_spaces(id),
    name            TEXT NOT NULL,
    price_kobo      INTEGER NOT NULL DEFAULT 0 CHECK (price_kobo >= 0),
    billing_cycle   TEXT NOT NULL DEFAULT 'monthly'
                    CHECK (billing_cycle IN ('monthly', 'annual', 'one_time')),
    kyc_tier_min    INTEGER NOT NULL DEFAULT 0 CHECK (kyc_tier_min IN (0, 1, 2, 3)),
    access_channels TEXT NOT NULL DEFAULT '[]',   -- JSON array of channel IDs
    access_courses  TEXT NOT NULL DEFAULT '[]',   -- JSON array of course IDs
    is_default      INTEGER NOT NULL DEFAULT 0,   -- 0/1 — the free/base tier
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_tiers_community ON membership_tiers(community_id);

  CREATE TABLE IF NOT EXISTS community_memberships (
    id              TEXT NOT NULL PRIMARY KEY,
    community_id    TEXT NOT NULL REFERENCES community_spaces(id),
    user_id         TEXT NOT NULL,
    tier_id         TEXT NOT NULL REFERENCES membership_tiers(id),
    role            TEXT NOT NULL DEFAULT 'member'
                    CHECK (role IN ('owner', 'admin', 'moderator', 'member', 'guest')),
    kyc_tier        INTEGER NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'suspended', 'banned', 'expired')),
    joined_at       INTEGER NOT NULL DEFAULT (unixepoch()),
    expires_at      INTEGER,
    tenant_id       TEXT NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_membership_unique ON community_memberships(community_id, user_id);
  CREATE INDEX IF NOT EXISTS idx_membership_community ON community_memberships(community_id, status);
  CREATE INDEX IF NOT EXISTS idx_membership_tenant ON community_memberships(tenant_id);
  ```

  ### Migration 0027 — Community Channels + Posts

  ```sql
  -- infra/db/migrations/0027_community_channels.sql

  CREATE TABLE IF NOT EXISTS community_channels (
    id              TEXT NOT NULL PRIMARY KEY,
    community_id    TEXT NOT NULL REFERENCES community_spaces(id),
    name            TEXT NOT NULL,
    type            TEXT NOT NULL DEFAULT 'forum'
                    CHECK (type IN ('forum', 'chat', 'announcement')),
    access_tier_id  TEXT REFERENCES membership_tiers(id),  -- NULL = all members
    position        INTEGER NOT NULL DEFAULT 0,
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_channel_community ON community_channels(community_id, position);

  CREATE TABLE IF NOT EXISTS channel_posts (
    id              TEXT NOT NULL PRIMARY KEY,
    channel_id      TEXT NOT NULL REFERENCES community_channels(id),
    author_id       TEXT NOT NULL,
    parent_id       TEXT REFERENCES channel_posts(id),     -- Threading (up to 5 levels)
    depth           INTEGER NOT NULL DEFAULT 0 CHECK (depth BETWEEN 0 AND 4),
    title           TEXT,                                   -- Only on root posts (depth=0)
    content         TEXT NOT NULL,
    is_pinned       INTEGER NOT NULL DEFAULT 0,
    is_flagged      INTEGER NOT NULL DEFAULT 0,
    moderation_status TEXT NOT NULL DEFAULT 'published'
                    CHECK (moderation_status IN ('published', 'under_review', 'removed')),
    reply_count     INTEGER NOT NULL DEFAULT 0,
    reaction_count  INTEGER NOT NULL DEFAULT 0,
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_post_channel ON channel_posts(channel_id, is_pinned DESC, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_post_parent ON channel_posts(parent_id);
  CREATE INDEX IF NOT EXISTS idx_post_author ON channel_posts(author_id);
  CREATE INDEX IF NOT EXISTS idx_post_tenant ON channel_posts(tenant_id);
  ```

  ### Migration 0028 — Course Modules + Lessons + Progress

  ```sql
  -- infra/db/migrations/0028_courses.sql

  CREATE TABLE IF NOT EXISTS course_modules (
    id              TEXT NOT NULL PRIMARY KEY,
    community_id    TEXT NOT NULL REFERENCES community_spaces(id),
    title           TEXT NOT NULL,
    description     TEXT,
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'published')),
    access_tier_id  TEXT REFERENCES membership_tiers(id),
    sequence        INTEGER NOT NULL DEFAULT 0,
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_course_community ON course_modules(community_id, sequence);

  CREATE TABLE IF NOT EXISTS course_lessons (
    id              TEXT NOT NULL PRIMARY KEY,
    module_id       TEXT NOT NULL REFERENCES course_modules(id),
    title           TEXT NOT NULL,
    content_type    TEXT NOT NULL DEFAULT 'text'
                    CHECK (content_type IN ('text', 'video', 'audio', 'pdf')),
    content_url     TEXT,             -- R2 CDN URL (for media lessons)
    body            TEXT,             -- Markdown content (for text lessons)
    duration_secs   INTEGER,
    sequence        INTEGER NOT NULL DEFAULT 0,
    is_free_preview INTEGER NOT NULL DEFAULT 0,
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_lesson_module ON course_lessons(module_id, sequence);

  CREATE TABLE IF NOT EXISTS lesson_progress (
    id              TEXT NOT NULL PRIMARY KEY,
    lesson_id       TEXT NOT NULL REFERENCES course_lessons(id),
    user_id         TEXT NOT NULL,
    completed_at    INTEGER,
    progress_pct    INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
    tenant_id       TEXT NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_progress_unique ON lesson_progress(lesson_id, user_id);
  CREATE INDEX IF NOT EXISTS idx_progress_user ON lesson_progress(user_id, tenant_id);
  ```

  ### Migration 0029 — Community Events + RSVPs

  ```sql
  -- infra/db/migrations/0029_community_events.sql

  CREATE TABLE IF NOT EXISTS community_events (
    id              TEXT NOT NULL PRIMARY KEY,
    community_id    TEXT NOT NULL REFERENCES community_spaces(id),
    title           TEXT NOT NULL,
    description     TEXT,
    type            TEXT NOT NULL DEFAULT 'live'
                    CHECK (type IN ('live', 'recorded', 'in_person')),
    starts_at       INTEGER NOT NULL,
    ends_at         INTEGER,
    location        TEXT,                     -- URL or physical address
    ticket_price_kobo INTEGER NOT NULL DEFAULT 0 CHECK (ticket_price_kobo >= 0),
    max_attendees   INTEGER,
    rsvp_count      INTEGER NOT NULL DEFAULT 0,
    access_tier_id  TEXT REFERENCES membership_tiers(id),
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_event_community ON community_events(community_id, starts_at DESC);
  CREATE INDEX IF NOT EXISTS idx_event_tenant ON community_events(tenant_id);

  CREATE TABLE IF NOT EXISTS event_rsvps (
    id              TEXT NOT NULL PRIMARY KEY,
    event_id        TEXT NOT NULL REFERENCES community_events(id),
    user_id         TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'going'
                    CHECK (status IN ('going', 'maybe', 'not_going')),
    payment_ref     TEXT,                     -- Paystack reference for paid events
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_rsvp_unique ON event_rsvps(event_id, user_id);
  ```

  ### Migration 0030 — Moderation Log (Shared: Community + Social)

  ```sql
  -- infra/db/migrations/0030_moderation_log.sql

  CREATE TABLE IF NOT EXISTS moderation_log (
    id              TEXT NOT NULL PRIMARY KEY,
    moderator_id    TEXT NOT NULL,
    content_type    TEXT NOT NULL
                    CHECK (content_type IN ('channel_post', 'social_post', 'dm_message', 'comment')),
    content_id      TEXT NOT NULL,
    action          TEXT NOT NULL
                    CHECK (action IN ('hide', 'restore', 'warn', 'mute', 'ban_temp', 'ban_perm', 'dismiss')),
    reason          TEXT NOT NULL,
    flag_category   TEXT
                    CHECK (flag_category IN ('spam', 'profanity', 'harassment', 'nsfw', 'misinformation', 'illegal')),
    duration_hours  INTEGER,                  -- For temporary bans/mutes
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_modlog_content ON moderation_log(content_type, content_id);
  CREATE INDEX IF NOT EXISTS idx_modlog_moderator ON moderation_log(moderator_id);
  CREATE INDEX IF NOT EXISTS idx_modlog_tenant ON moderation_log(tenant_id);

  CREATE TABLE IF NOT EXISTS content_flags (
    id              TEXT NOT NULL PRIMARY KEY,
    reporter_id     TEXT NOT NULL,
    content_type    TEXT NOT NULL
                    CHECK (content_type IN ('channel_post', 'social_post', 'dm_message')),
    content_id      TEXT NOT NULL,
    category        TEXT NOT NULL
                    CHECK (category IN ('spam', 'profanity', 'harassment', 'nsfw', 'misinformation', 'illegal')),
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_flags_content ON content_flags(content_type, content_id);
  ```

  ### Migration 0031 — Social Profiles + Follow Graph

  ```sql
  -- infra/db/migrations/0031_social_profiles.sql

  CREATE TABLE IF NOT EXISTS social_profiles (
    id              TEXT NOT NULL PRIMARY KEY,
    profile_id      TEXT NOT NULL UNIQUE,     -- FK → profiles.id (M3 scaffold)
    handle          TEXT NOT NULL UNIQUE,     -- @username
    bio             TEXT,
    avatar_url      TEXT,
    follower_count  INTEGER NOT NULL DEFAULT 0,
    following_count INTEGER NOT NULL DEFAULT 0,
    is_verified     INTEGER NOT NULL DEFAULT 0,   -- 0/1 — blue tick: NIN or BVN verified
    visibility      TEXT NOT NULL DEFAULT 'public'
                    CHECK (visibility IN ('public', 'private')),
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_social_handle ON social_profiles(handle);
  CREATE INDEX IF NOT EXISTS idx_social_tenant ON social_profiles(tenant_id);

  CREATE TABLE IF NOT EXISTS social_follows (
    id              TEXT NOT NULL PRIMARY KEY,
    follower_id     TEXT NOT NULL,            -- social_profiles.id
    followee_id     TEXT NOT NULL,            -- social_profiles.id
    status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'pending')),
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_follow_unique ON social_follows(follower_id, followee_id);
  CREATE INDEX IF NOT EXISTS idx_follow_follower ON social_follows(follower_id);
  CREATE INDEX IF NOT EXISTS idx_follow_followee ON social_follows(followee_id);

  CREATE TABLE IF NOT EXISTS social_blocks (
    id              TEXT NOT NULL PRIMARY KEY,
    blocker_id      TEXT NOT NULL,
    blocked_id      TEXT NOT NULL,
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_block_unique ON social_blocks(blocker_id, blocked_id);
  ```

  ### Migration 0032 — Social Posts + Groups + Reactions

  ```sql
  -- infra/db/migrations/0032_social_posts.sql

  CREATE TABLE IF NOT EXISTS social_posts (
    id              TEXT NOT NULL PRIMARY KEY,
    author_id       TEXT NOT NULL,            -- social_profiles.id
    content         TEXT NOT NULL CHECK (length(content) <= 2000),
    media_urls      TEXT NOT NULL DEFAULT '[]',   -- JSON array of R2 CDN URLs
    post_type       TEXT NOT NULL DEFAULT 'post'
                    CHECK (post_type IN ('post', 'repost', 'quote', 'story')),
    parent_id       TEXT REFERENCES social_posts(id),  -- For reposts/quotes
    group_id        TEXT,                     -- FK → social_groups.id (nullable)
    visibility      TEXT NOT NULL DEFAULT 'public'
                    CHECK (visibility IN ('public', 'followers', 'group', 'private')),
    language        TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'pcm', 'yo', 'ig', 'ha')),
    like_count      INTEGER NOT NULL DEFAULT 0,
    comment_count   INTEGER NOT NULL DEFAULT 0,
    repost_count    INTEGER NOT NULL DEFAULT 0,
    is_flagged      INTEGER NOT NULL DEFAULT 0,
    moderation_status TEXT NOT NULL DEFAULT 'published'
                    CHECK (moderation_status IN ('published', 'under_review', 'removed')),
    is_boosted      INTEGER NOT NULL DEFAULT 0,   -- Paid placement
    expires_at      INTEGER,                  -- For stories (NOW + 86400s)
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_post_author ON social_posts(author_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_post_group ON social_posts(group_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_post_visibility ON social_posts(visibility, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_post_tenant ON social_posts(tenant_id);
  CREATE INDEX IF NOT EXISTS idx_post_expires ON social_posts(expires_at) WHERE expires_at IS NOT NULL;

  CREATE TABLE IF NOT EXISTS social_groups (
    id              TEXT NOT NULL PRIMARY KEY,
    owner_id        TEXT NOT NULL,            -- social_profiles.id
    name            TEXT NOT NULL,
    slug            TEXT NOT NULL,
    description     TEXT,
    visibility      TEXT NOT NULL DEFAULT 'public'
                    CHECK (visibility IN ('public', 'private', 'secret')),
    member_count    INTEGER NOT NULL DEFAULT 0,
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_group_slug ON social_groups(slug, tenant_id);
  CREATE INDEX IF NOT EXISTS idx_group_tenant ON social_groups(tenant_id);

  CREATE TABLE IF NOT EXISTS social_group_members (
    id              TEXT NOT NULL PRIMARY KEY,
    group_id        TEXT NOT NULL REFERENCES social_groups(id),
    member_id       TEXT NOT NULL,            -- social_profiles.id
    role            TEXT NOT NULL DEFAULT 'member'
                    CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    joined_at       INTEGER NOT NULL DEFAULT (unixepoch()),
    tenant_id       TEXT NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_group_member_unique ON social_group_members(group_id, member_id);

  CREATE TABLE IF NOT EXISTS social_reactions (
    id              TEXT NOT NULL PRIMARY KEY,
    post_id         TEXT NOT NULL REFERENCES social_posts(id),
    reactor_id      TEXT NOT NULL,            -- social_profiles.id
    type            TEXT NOT NULL DEFAULT 'like'
                    CHECK (type IN ('like', 'heart', 'fire', 'celebrate')),
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_reaction_unique ON social_reactions(post_id, reactor_id);
  CREATE INDEX IF NOT EXISTS idx_reaction_post ON social_reactions(post_id, type);
  ```

  ### Migration 0033 — Direct Messages

  ```sql
  -- infra/db/migrations/0033_dm.sql
  -- Encryption contract: AES-256-GCM at rest. See docs/social/dm-privacy.md.

  CREATE TABLE IF NOT EXISTS dm_threads (
    id              TEXT NOT NULL PRIMARY KEY,
    type            TEXT NOT NULL DEFAULT 'direct'
                    CHECK (type IN ('direct', 'group')),
    participant_ids TEXT NOT NULL,            -- JSON array of social_profiles.id
    last_message_at INTEGER,
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_dm_thread_tenant ON dm_threads(tenant_id);

  CREATE TABLE IF NOT EXISTS dm_messages (
    id              TEXT NOT NULL PRIMARY KEY,
    thread_id       TEXT NOT NULL REFERENCES dm_threads(id),
    sender_id       TEXT NOT NULL,            -- social_profiles.id
    content         TEXT NOT NULL,            -- AES-256-GCM encrypted ciphertext
    media_urls      TEXT NOT NULL DEFAULT '[]',   -- Encrypted CDN references (JSON)
    is_deleted      INTEGER NOT NULL DEFAULT 0,
    read_by         TEXT NOT NULL DEFAULT '{}',   -- JSON: { profileId: readAtUnix }
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_dm_thread ON dm_messages(thread_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_dm_sender ON dm_messages(sender_id);
  ```

  ### Migration 0034 — Feed Impressions + USSD Trending Cache

  ```sql
  -- infra/db/migrations/0034_feed_meta.sql

  CREATE TABLE IF NOT EXISTS feed_impressions (
    id              TEXT NOT NULL PRIMARY KEY,
    post_id         TEXT NOT NULL REFERENCES social_posts(id),
    viewer_id       TEXT,                     -- NULL = unauthenticated
    placement       TEXT NOT NULL DEFAULT 'organic'
                    CHECK (placement IN ('organic', 'boosted', 'explore', 'trending')),
    tenant_id       TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_impressions_post ON feed_impressions(post_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_impressions_tenant ON feed_impressions(tenant_id);
  ```

  ---

  ## Deliverable 2 — `packages/community` — @webwaka/community

  > **New package.** Location: `packages/community/`

  ### Directory structure

  ```
  packages/community/
    src/
      community-space.ts       — CRUD for CommunitySpace
      membership.ts            — join, leave, tier management, KYC gating
      channel.ts               — create channel, post to channel, thread reply
      course.ts                — module + lesson management, progress tracking
      event.ts                 — event RSVP, ticket, SMS reminder stub
      moderation.ts            — flag, review queue, AI classifier bridge
      entitlements.ts          — community-specific entitlement dimension helpers
      moderation-config.ts     — default thresholds (profanity 0.85, nsfw 0.7, spam 0.8)
      types.ts                 — CommunitySpace, Membership, Channel, Post, Course, Event types
      index.ts                 — re-exports all
    vitest.config.ts
    tsconfig.json
    package.json
  ```

  ### Key function signatures

  ```typescript
  // community-space.ts
  export async function createCommunitySpace(
    db: D1Database, kv: KVNamespace,
    input: { workspaceId: string; name: string; slug: string; visibility: string; tenantId: string }
  ): Promise<CommunitySpace>

  export async function getCommunitySpace(db: D1Database, slugOrId: string, tenantId: string): Promise<CommunitySpace | null>

  // membership.ts
  export async function joinCommunity(
    db: D1Database,
    input: { communityId: string; userId: string; tierId: string; kycTier: number; tenantId: string }
  ): Promise<CommunityMembership>
  // Must: (1) verify NDPR consent record exists, (2) enforce KYC tier via requireKYCTier(), (3) enforce max_members entitlement

  export async function upgradeMemberTier(
    db: D1Database, communityId: string, userId: string, newTierId: string, tenantId: string
  ): Promise<void>

  // channel.ts
  export async function createChannelPost(
    db: D1Database,
    input: { channelId: string; authorId: string; content: string; parentId?: string; title?: string; tenantId: string }
  ): Promise<ChannelPost>
  // Must: run AI moderation check before inserting

  export async function getChannelThreads(
    db: D1Database, channelId: string, tenantId: string, cursor?: string
  ): Promise<{ posts: ChannelPost[]; nextCursor: string | null }>

  // course.ts
  export async function getCourseWithProgress(
    db: D1Database, moduleId: string, userId: string, tenantId: string
  ): Promise<{ module: CourseModule; lessons: (CourseLesson & { progress: number })[] }>

  export async function markLessonComplete(
    db: D1Database, lessonId: string, userId: string, tenantId: string
  ): Promise<void>

  // event.ts
  export async function rsvpEvent(
    db: D1Database,
    input: { eventId: string; userId: string; status: 'going' | 'maybe' | 'not_going'; tenantId: string }
  ): Promise<EventRsvp>

  // moderation.ts
  export async function scoreContent(content: string): Promise<ModerationScore>
  // Routes through @packages/ai-abstraction — no direct AI SDK calls (P7)

  export async function flagContent(
    db: D1Database,
    input: { reporterId: string; contentType: string; contentId: string; category: string; tenantId: string }
  ): Promise<void>
  // Auto-hides if 3+ same-category flags on non-harassment content
  ```

  ### Package.json

  ```json
  {
    "name": "@webwaka/community",
    "version": "0.1.0",
    "private": true,
    "exports": { ".": "./src/index.ts" },
    "scripts": {
      "typecheck": "tsc --noEmit",
      "test": "vitest run"
    },
    "dependencies": {
      "@webwaka/types": "workspace:*",
      "@webwaka/auth": "workspace:*",
      "@webwaka/entitlements": "workspace:*"
    },
    "devDependencies": {
      "@cloudflare/workers-types": "^4.20240620.0",
      "typescript": "^5.4.5",
      "vitest": "^1.6.0"
    }
  }
  ```

  ### Required Tests (≥40)

  ```
  packages/community/src/community-space.test.ts
    ✓ creates a community space with correct defaults
    ✓ rejects duplicate slugs within same tenant (tenant-scoped UNIQUE)
    ✓ allows same slug across different tenants (T3 isolation)
    ✓ returns null for non-existent community

  packages/community/src/membership.test.ts
    ✓ allows member to join free tier without KYC
    ✓ blocks paid tier join without NDPR consent record (P10)
    ✓ blocks paid tier join if KYC tier insufficient
    ✓ enforces max_members entitlement limit
    ✓ upgrades member tier correctly
    ✓ prevents joining already-joined community (UNIQUE constraint)

  packages/community/src/channel.test.ts
    ✓ creates root post in forum channel
    ✓ creates threaded reply up to depth 4
    ✓ rejects reply at depth 5 (max threading depth)
    ✓ auto-hides post when AI score exceeds threshold
    ✓ auto-hides post on 3+ same-category flags

  packages/community/src/course.test.ts
    ✓ returns course with per-lesson progress for authenticated user
    ✓ marks lesson complete and updates progress_pct to 100
    ✓ free_preview lessons visible to non-members
    ✓ paid lessons blocked for wrong tier

  packages/community/src/event.test.ts
    ✓ creates RSVP going
    ✓ updates existing RSVP to not_going
    ✓ rejects RSVP if max_attendees reached

  packages/community/src/moderation.test.ts
    ✓ scoreContent returns ModerationScore shape
    ✓ flagContent auto-hides on 3rd spam flag
    ✓ flagContent queues moderator review on harassment flag (1st flag)
    ✓ does not insert duplicate flags from same reporter
  ```

  ---

  ## Deliverable 3 — `packages/social` — @webwaka/social

  > **New package.** Location: `packages/social/`

  ### Directory structure

  ```
  packages/social/
    src/
      social-profile.ts       — profile creation, handle lookup, verification badge
      follow.ts               — follow, unfollow, block, mute, pendng approve (private accounts)
      social-post.ts          — create post, repost, quote, react
      social-group.ts         — group CRUD, membership
      feed.ts                 — FeedScore calculation, home/explore/trending generation
      dm.ts                   — DM thread + message send + read receipts
      stories.ts              — create story (post_type=story, expires_at=+24h)
      moderation.ts           — flag post/DM, AI classifier bridge, moderator review
      encryption.ts           — AES-256-GCM encrypt/decrypt for DM content at rest
      types.ts                — SocialProfile, SocialPost, SocialGroup, DMThread, etc.
      index.ts                — re-exports all
    vitest.config.ts
    tsconfig.json
    package.json
  ```

  ### Key function signatures

  ```typescript
  // social-profile.ts
  export async function createSocialProfile(
    db: D1Database,
    input: { profileId: string; handle: string; bio?: string; tenantId: string }
  ): Promise<SocialProfile>

  export async function getProfileByHandle(db: D1Database, handle: string): Promise<SocialProfile | null>

  export async function grantVerificationBadge(
    db: D1Database, profileId: string, tenantId: string
  ): Promise<void>
  // Requires: nin_verified OR bvn_verified on linked individual record

  // follow.ts
  export async function followProfile(
    db: D1Database, followerId: string, followeeId: string, tenantId: string
  ): Promise<{ status: 'active' | 'pending' }>
  // Pending if followee.visibility = 'private'

  export async function blockProfile(db: D1Database, blockerId: string, blockedId: string, tenantId: string): Promise<void>

  // social-post.ts
  export async function createPost(
    db: D1Database,
    input: { authorId: string; content: string; postType: 'post' | 'repost' | 'quote'; visibility: string; language: string; mediaUrls?: string[]; tenantId: string }
  ): Promise<SocialPost>
  // Must: run AI moderation check before inserting

  export async function reactToPost(
    db: D1Database, postId: string, reactorId: string, type: 'like' | 'heart' | 'fire' | 'celebrate', tenantId: string
  ): Promise<void>

  // feed.ts
  export interface FeedScore {
    postId: string;
    recencyScore: number;
    engagementScore: number;
    relevanceScore: number;
    trustScore: number;
    total: number;
  }

  export function computeFeedScore(post: SocialPost, viewer: FeedContext): FeedScore

  export async function getHomeFeed(
    db: D1Database, kv: KVNamespace, viewerId: string, tenantId: string, cursor?: string
  ): Promise<{ posts: ScoredPost[]; nextCursor: string | null }>
  // Cache: KV key = tenant:{tenantId}:feed:{viewerId}:home, TTL = 300s

  export async function getExploreFeed(
    db: D1Database, kv: KVNamespace, viewerLga: string, tenantId: string, cursor?: string
  ): Promise<{ posts: ScoredPost[]; nextCursor: string | null }>

  export async function getTrendingFeed(
    db: D1Database, kv: KVNamespace, viewerLga: string, tenantId: string
  ): Promise<ScoredPost[]>

  // dm.ts
  export async function sendDM(
    db: D1Database, env: { DM_MASTER_KEY: string },
    input: { threadId?: string; senderId: string; recipientId: string; content: string; tenantId: string }
  ): Promise<{ threadId: string; messageId: string }>
  // Must: encrypt content with AES-256-GCM before D1 insert
  // Must: check block list — silently 200 if blocked (do not reveal block to sender)
  // Must: rate limit to 10 new-recipient DMs/hour per account (KV sliding window)

  export async function getDMThread(
    db: D1Database, env: { DM_MASTER_KEY: string }, threadId: string, viewerId: string, tenantId: string
  ): Promise<{ thread: DMThread; messages: DecryptedDMMessage[] }>

  // stories.ts
  export async function createStory(
    db: D1Database, authorId: string, content: string, mediaUrls: string[], tenantId: string
  ): Promise<SocialPost>
  // Sets post_type='story', expires_at = unixepoch() + 86400

  export async function getActiveStories(
    db: D1Database, profileId: string, tenantId: string
  ): Promise<SocialPost[]>
  // WHERE post_type='story' AND expires_at > unixepoch()

  // encryption.ts
  export async function encryptDMContent(plaintext: string, masterKey: string, threadId: string): Promise<string>
  export async function decryptDMContent(ciphertext: string, masterKey: string, threadId: string): Promise<string>
  // AES-256-GCM, per-thread IV derived from threadId + masterKey
  ```

  ### Package.json

  ```json
  {
    "name": "@webwaka/social",
    "version": "0.1.0",
    "private": true,
    "exports": { ".": "./src/index.ts" },
    "scripts": {
      "typecheck": "tsc --noEmit",
      "test": "vitest run"
    },
    "dependencies": {
      "@webwaka/types": "workspace:*",
      "@webwaka/auth": "workspace:*",
      "@webwaka/entitlements": "workspace:*"
    },
    "devDependencies": {
      "@cloudflare/workers-types": "^4.20240620.0",
      "typescript": "^5.4.5",
      "vitest": "^1.6.0"
    }
  }
  ```

  ### Required Tests (≥40)

  ```
  packages/social/src/social-profile.test.ts
    ✓ creates profile with unique handle
    ✓ rejects duplicate handle globally
    ✓ allows same handle on different tenants? → NO — handle is GLOBALLY unique (platform-wide)
    ✓ grants verification badge only when nin_verified OR bvn_verified

  packages/social/src/follow.test.ts
    ✓ follow public profile → status = 'active' immediately
    ✓ follow private profile → status = 'pending'
    ✓ unfollow decrements follower_count + following_count
    ✓ block prevents follow (returns 403)
    ✓ block removes existing follow relationship

  packages/social/src/social-post.test.ts
    ✓ creates post with correct defaults
    ✓ repost links parent_id correctly
    ✓ quote post requires content (not empty)
    ✓ auto-hides post when AI nsfw score ≥ 0.7
    ✓ reacts to post increments like_count
    ✓ duplicate reaction from same user is idempotent (UNIQUE index)

  packages/social/src/feed.test.ts
    ✓ computeFeedScore returns non-negative total
    ✓ RecencyScore is 0 for post older than 72h
    ✓ EngagementScore uses log-scale (not raw count)
    ✓ TrustScore boosts verified author
    ✓ getHomeFeed excludes removed/flagged posts
    ✓ getHomeFeed injects boosted posts at positions 5, 15, 30
    ✓ getExploreFeed filters by geography match
    ✓ feed is cached in KV (second call hits cache)

  packages/social/src/dm.test.ts
    ✓ sendDM encrypts content before storage (stored value != plaintext)
    ✓ getDMThread decrypts content on retrieval (returns plaintext)
    ✓ sendDM to blocked user silently returns 200 (not delivered)
    ✓ sendDM rate-limits to 10 new recipients per hour (11th returns 429)
    ✓ soft-delete marks is_deleted = 1 (tombstone preserved)

  packages/social/src/stories.test.ts
    ✓ createStory sets expires_at = now + 86400s
    ✓ getActiveStories excludes expired stories
    ✓ story post_type = 'story' (not 'post')
  ```

  ---

  ## Deliverable 4 — `apps/api` Extensions — Community + Social Routes

  Add to `apps/api/src/routes/`:

  ### `src/routes/community.ts` — 14 community routes

  ```typescript
  // POST   /community/spaces            → createCommunitySpace
  // GET    /community/spaces/:id        → getCommunitySpace (by id or slug)
  // POST   /community/spaces/:id/join   → joinCommunity (NDPR consent + KYC gate)
  // DELETE /community/spaces/:id/leave  → leaveCommunity
  // GET    /community/spaces/:id/members → listMembers (paginated, tenant-scoped)
  // POST   /community/spaces/:id/channels → createChannel (admin/owner only)
  // POST   /community/channels/:id/posts  → createChannelPost (mod check before insert)
  // GET    /community/channels/:id/posts  → listChannelPosts (paginated, threaded)
  // POST   /community/spaces/:id/courses  → createCourseModule (admin/owner only)
  // GET    /community/spaces/:id/courses  → listCourses (with user progress)
  // GET    /community/courses/:id/lessons → getCourseWithProgress
  // POST   /community/lessons/:id/complete → markLessonComplete
  // POST   /community/events             → createEvent (admin/owner only)
  // POST   /community/events/:id/rsvp   → rsvpEvent
  // POST   /community/broadcast         → broadcastDM (entitlement: community.broadcast)
  // POST   /community/moderation/flag   → flagContent
  // POST   /community/moderation/review → reviewFlaggedContent (moderator role required)
  ```

  **All community routes must:**
  - Require `jwtAuthMiddleware`
  - Scope all queries with `tenantId` from JWT
  - Validate with Zod (price_kobo: z.number().int().min(0))
  - Check entitlement via `@packages/entitlements` before creating spaces, courses, or sending broadcasts

  ### `src/routes/social.ts` — 20 social routes

  ```typescript
  // POST   /social/profiles              → createSocialProfile
  // GET    /social/profiles/:handle      → getProfileByHandle
  // POST   /social/profiles/:id/verify  → grantVerificationBadge (platform admin only)
  // POST   /social/follow/:id           → followProfile
  // DELETE /social/follow/:id           → unfollowProfile
  // POST   /social/block/:id            → blockProfile
  // DELETE /social/block/:id            → unblockProfile
  // POST   /social/posts                → createPost (mod check before insert)
  // GET    /social/feed/home            → getHomeFeed (cached in KV)
  // GET    /social/feed/explore         → getExploreFeed (geography-filtered)
  // GET    /social/feed/trending        → getTrendingFeed (top-scored last 24h)
  // POST   /social/posts/:id/react      → reactToPost
  // POST   /social/posts/:id/repost     → repostPost
  // POST   /social/posts/:id/report     → flagContent
  // POST   /social/groups               → createGroup
  // POST   /social/groups/:id/join      → joinGroup
  // GET    /social/groups/:id/feed      → getGroupFeed
  // POST   /social/dm/threads           → createDMThread (or get-or-create by participants)
  // POST   /social/dm/threads/:id/messages → sendDMMessage (AES-GCM encrypted)
  // GET    /social/dm/threads           → listDMThreads (inbox, sorted by last_message_at)
  // POST   /social/stories              → createStory (expires_at auto-set)
  // GET    /social/stories/:handle      → getActiveStories (filters expired)
  ```

  **All social routes must:**
  - Require `jwtAuthMiddleware`
  - Scope all queries with `tenantId` from JWT
  - For DM send: pass `DM_MASTER_KEY` env var to encrypt/decrypt helpers
  - For feed: pass `WEBWAKA_KV` binding for feed caching
  - Validate content length (≤ 2000 chars for posts, ≤ 280 chars for bio)

  ### `src/routes/community.test.ts` + `src/routes/social.test.ts` — 40 API tests

  ```
  community.test.ts (20 tests)
    ✓ POST /community/spaces → 201 with space record
    ✓ POST /community/spaces → 409 duplicate slug same tenant
    ✓ POST /community/spaces/:id/join → 201 free tier, no KYC required
    ✓ POST /community/spaces/:id/join → 403 paid tier, no consent record
    ✓ POST /community/spaces/:id/join → 403 paid tier, insufficient KYC
    ✓ POST /community/channels/:id/posts → 201 published
    ✓ POST /community/channels/:id/posts → 200 auto-hidden (nsfw > 0.7)
    ✓ GET  /community/channels/:id/posts → paginated correctly
    ✓ POST /community/events → 201
    ✓ POST /community/events/:id/rsvp → 200 going
    ✓ POST /community/moderation/flag → 200
    ✓ POST /community/broadcast → 403 without community.broadcast entitlement
    ✓ POST /community/broadcast → 200 with entitlement
    ✓ All community routes return 401 without JWT
    ✓ All community queries are tenant-scoped (T3 — cross-tenant query returns 0 rows)

  social.test.ts (25 tests)
    ✓ POST /social/profiles → 201
    ✓ POST /social/profiles → 409 duplicate handle
    ✓ POST /social/follow/:id → 200 active (public profile)
    ✓ POST /social/follow/:id → 200 pending (private profile)
    ✓ POST /social/block/:id → 200, removes follow
    ✓ POST /social/posts → 201 visible in home feed
    ✓ POST /social/posts → 200 nsfw auto-hidden (not in feed)
    ✓ GET  /social/feed/home → 200 with paginated posts
    ✓ GET  /social/feed/home → boosted posts at correct positions (5, 15, 30)
    ✓ GET  /social/feed/explore → filters by viewer geography
    ✓ GET  /social/feed/trending → top-scored posts in last 24h
    ✓ POST /social/posts/:id/react → 200 like, increments like_count
    ✓ POST /social/groups → 201
    ✓ POST /social/groups/:id/join → 200
    ✓ POST /social/dm/threads/:id/messages → 201 encrypted stored
    ✓ GET  /social/dm/threads → decrypted content returned
    ✓ POST /social/dm/threads/:id/messages → 200 to blocked user (silent)
    ✓ POST /social/stories → 201 with expires_at set
    ✓ GET  /social/stories/:handle → excludes expired stories
    ✓ All social routes return 401 without JWT
    ✓ All social queries are tenant-scoped (T3)
  ```

  ---

  ## Deliverable 5 — USSD Integration (apps/ussd-gateway extension)

  M7b built the USSD gateway with 5 menu branches. M7c adds **branch 3 (Trending/Social)** and **branch 5 (Community)** which were stubs in M7b.

  ### USSD Menu Branch 3 — Trending Feed

  ```
  *384# → 3 → Explore
  ─────────────────────────────────
  TOP POSTS IN YOUR AREA (LGA)
  1. [Title of post 1 - 60 chars max]
  2. [Title of post 2]
  3. [Title of post 3]
  4. [Title of post 4]
  5. [Title of post 5]
  ─────────────────────────────────
  0. Back
  ```

  Implementation: `apps/ussd-gateway/src/menus/trending.ts`
  - Calls `getTrendingFeed()` from `@webwaka/social`
  - Truncates post content to 60 chars, strips media_urls
  - USSD response must be ≤ 182 chars per AT spec

  ### USSD Menu Branch 5 — Community

  ```
  *384# → 5 → Community
  ─────────────────────────────────
  MY COMMUNITIES
  1. [Community Name 1]
  2. [Community Name 2]
  3. Browse Public
  ─────────────────────────────────
  0. Back
  ```

  Implementation: `apps/ussd-gateway/src/menus/community.ts`
  - Lists user's active CommunityMemberships (up to 2, by most recent activity)
  - Option 3 returns top 3 public community_spaces in viewer's geography

  ---

  ## Deliverable 6 — Offline Cache (PWA extension)

  ### Service Worker extension (`packages/offline-sync/src/service-worker.ts`)

  Add to the existing service worker cache routes:

  ```typescript
  // Cache community course lesson content (text + audio only — no video offline)
  CACHE_ROUTES.push('/community/courses/*/lessons/*');

  // Cache last 50 home feed posts in IndexedDB (not Cache API — too dynamic)
  // Triggered on successful feed load — store in Dexie.js table 'feedCache'
  ```

  ### New Dexie.js table: feedCache

  Add to `packages/offline-sync/src/db.ts`:

  ```typescript
  export interface FeedCacheItem {
    id?: number;
    postId: string;
    feedType: 'home' | 'explore';
    payload: string;      // JSON serialised SocialPost
    cachedAt: number;
  }

  // Add to WebWakaOfflineDB.version(2).stores():
  feedCache: '++id, postId, feedType, cachedAt'
  ```

  Note: Bumping the Dexie version requires a migration. Use `.version(2).stores(...).upgrade()` correctly — do not break the existing `syncQueue` table.

  ---

  ## Repo & Package Configuration

  ### vitest.config.ts for BOTH new packages

  ```typescript
  // packages/community/vitest.config.ts  (same pattern for packages/social)
  import { defineConfig } from 'vitest/config';
  import { resolve } from 'path';

  export default defineConfig({
    test: {
      environment: 'node',
      globals: true,
    },
    resolve: {
      alias: {
        '@webwaka/types': resolve(__dirname, '../../packages/types/src/index.ts'),
        '@webwaka/auth': resolve(__dirname, '../../packages/auth/src/index.ts'),
        '@webwaka/entitlements': resolve(__dirname, '../../packages/entitlements/src/index.ts'),
        '@webwaka/community': resolve(__dirname, '../../packages/community/src/index.ts'),
        '@webwaka/social': resolve(__dirname, '../../packages/social/src/index.ts'),
      },
    },
  });
  ```

  ### apps/api/vitest.config.ts additions

  Extend the existing alias map (from M7b fix) with:

  ```typescript
  '@webwaka/community': resolve(__dirname, '../../packages/community/src/index.ts'),
  '@webwaka/social': resolve(__dirname, '../../packages/social/src/index.ts'),
  ```

  ### apps/api/tsconfig.json additions

  Extend the `paths` map (from M7b fix) with:

  ```json
  "@webwaka/community": ["../../packages/community/src/index.ts"],
  "@webwaka/social": ["../../packages/social/src/index.ts"]
  ```

  ### pnpm-workspace.yaml

  Already includes `packages/*`. No change needed — new packages auto-discovered.

  ---

  ## New Platform Invariants to Enforce (M7c)

  These extend the existing invariants in `docs/governance/platform-invariants.md`:

  ### P14 — DM Content Encrypted at Rest
  All DM message content MUST be encrypted with AES-256-GCM before D1 storage. Plaintext DM content must never appear in D1. The `DM_MASTER_KEY` Cloudflare secret must be present in the ussd-gateway and API workers. Absence of this key must throw at startup, not silently store plaintext.

  **Enforcement:** `packages/social/src/encryption.ts` — called unconditionally in `dm.ts` before every insert.

  ### P15 — Moderation-First Content
  All user-generated content (channel posts, social posts, DMs flagged for review) must pass through the AI moderation classifier before publication. Auto-hide thresholds (profanity ≥ 0.85, nsfw ≥ 0.7, spam ≥ 0.8) apply globally. Thresholds are configurable per-tenant but cannot be set above the platform maximum.

  **Enforcement:** `packages/community/src/moderation.ts` and `packages/social/src/moderation.ts` — called unconditionally in createChannelPost and createPost.

  ---

  ## M7b Advisory Items — Status in M7c

  These advisories were logged in the M7a QA report and resolved in M7b. Confirm they remain intact:

  | Advisory | M7b Resolution | M7c Verification |
  |---|---|---|
  | CORS wildcard | Fixed — `ALLOWED_ORIGINS` env var driven | Confirm no new wildcard `origin: '*'` added |
  | X-User-Id from JWT | Confirmed — extracted from JWT `sub` claim | Confirm community/social routes use same pattern |
  | users vs individuals TDR | Filed as GitHub issue in M7b | Reference issue number in PR description |

  ---

  ## CI Requirements

  Both new packages must have:
  1. `package.json` with `test` and `typecheck` scripts
  2. `tsconfig.json` extending `../../tsconfig.base.json`
  3. `vitest.config.ts` with `resolve.alias` for all `@webwaka/*` workspace packages used
  4. `.eslintrc.json` extending `../../.eslintrc.base.json`

  The extended `apps/api` must:
  1. Pass `pnpm typecheck` at workspace root with 0 errors
  2. Pass `pnpm test` across all 6 packages: `@webwaka/offline-sync`, `@webwaka/ussd-gateway`, `@webwaka/pos`, `@webwaka/community`, `@webwaka/social`, `@webwaka/api`

  ---

  ## Test Count Summary

  | Package | Minimum Tests |
  |---|---|
  | `@webwaka/community` (unit) | ≥ 40 |
  | `@webwaka/social` (unit) | ≥ 40 |
  | `apps/api` (integration) | ≥ 40 new (35 community + social routes) |
  | **M7c Total New** | **≥ 120** |
  | **Cumulative total (M7a 116 + M7b 178 baseline + M7c 120)** | **≥ 298** |

  ---

  ## M7c Non-Deliverables (Do NOT Implement)

  - No E2EE (Signal Protocol) — platform-side AES-256-GCM is correct for M7c; E2EE is M8+
  - No real-time WebSocket/SSE feed — polling + KV cache is correct for M7c
  - No app-store push notifications — browser Web Push is acceptable but optional
  - No Paystack payment integration for community tiers — model the data, stub the payment call (Paystack integration exists in `packages/payments` from M6; use it but do not add new Paystack products)
  - No video lesson upload — content_type='video' models the data; actual upload to R2 is M8
  - No `packages/ai-abstraction` implementation — it already exists from M6; call it, do not rebuild it
  - No changes to `docs/governance/platform-invariants.md` directly — add P14/P15 and submit for Founder review via PR

  ---

  ## PR Instructions

  **Branch:** `feat/m7c-community-social`
  **Base:** `main`
  **Title:** `feat(m7c): Community Platform (Skool-style) + Social Network (posts, feed, DMs, stories)`
  **PR Description must include:**
  - Summary of all 6 deliverables
  - D1 migrations added (0026–0034)
  - Test count breakdown per package
  - New invariants P14 (DM encryption) and P15 (moderation-first) noted
  - USSD branches 3 + 5 implemented
  - CI status (link to passing run)

  **PR Labels:** `milestone-7`, `m7c`, `review-needed`, `base44`

  ---

  ## M7c Summary Checklist

  ```
  [ ] Branch: feat/m7c-community-social from main (HEAD 41e11d8)
  [ ] Migrations 0026–0034 (community_spaces, channels, courses, events, moderation_log,
      social_profiles, social_posts+groups, dm_threads+messages, feed_meta)
  [ ] packages/community — community-space.ts, membership.ts, channel.ts, course.ts, event.ts,
      moderation.ts, entitlements.ts, moderation-config.ts, types.ts, index.ts
  [ ] packages/social — social-profile.ts, follow.ts, social-post.ts, social-group.ts,
      feed.ts, dm.ts, stories.ts, moderation.ts, encryption.ts, types.ts, index.ts
  [ ] apps/api — community.ts (17 routes) + social.ts (22 routes)
  [ ] apps/api vitest.config.ts + tsconfig.json — add @webwaka/community + @webwaka/social aliases
  [ ] apps/ussd-gateway — trending.ts menu (branch 3) + community.ts menu (branch 5) implemented
  [ ] packages/offline-sync — feedCache Dexie table (version bump) + SW cache routes for lessons
  [ ] All packages: package.json, tsconfig.json, vitest.config.ts, .eslintrc.json
  [ ] New invariants P14 + P15 drafted in PR description (pending Founder approval)
  [ ] Advisory: confirm CORS fix + X-User-Id pattern + users/individuals TDR issue reference
  [ ] ≥ 120 new tests (≥ 40 community + ≥ 40 social + ≥ 40 API)
  [ ] pnpm typecheck passes at workspace root (0 errors)
  [ ] CI green (all test suites)
  [ ] PR opened: feat/m7c-community-social → main
  ```

  ---

  ## Source Documents

  All referenced specs are available on the `main` branch:

  | Document | Path |
  |---|---|
  | Community Model | `docs/community/community-model.md` |
  | Community Entitlements | `docs/community/community-entitlements.md` |
  | Community Moderation | `docs/community/community-moderation.md` |
  | Community Monetization | `docs/community/community-monetization.md` |
  | Skool Features Reference | `docs/community/skool-features.md` |
  | Social Graph Model | `docs/social/social-graph.md` |
  | Feed Algorithm | `docs/social/feed-algorithm.md` |
  | DM Privacy | `docs/social/dm-privacy.md` |
  | Social Moderation | `docs/social/social-moderation.md` |
  | Stories Spec | `docs/social/stories-spec.md` |
  | Platform Invariants | `docs/governance/platform-invariants.md` |
  | Entitlement Model | `docs/governance/entitlement-model.md` |
  | M7b Brief (format reference) | `docs/milestones/m7b-replit-brief.md` |
  | M7b QA Report | `docs/qa/m7b-qa-report.md` |
  | Milestone Tracker | `docs/governance/milestone-tracker.md` |

  ---

  *Brief prepared by Replit QA Agent*
  *2026-04-08 — WebWaka OS M7c*
  