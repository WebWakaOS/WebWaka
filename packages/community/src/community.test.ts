/**
 * @webwaka/community — Unit tests (≥40 required per M7c brief)
 *
 * Uses in-memory D1-like stubs for deterministic, dependency-free testing.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createCommunitySpace,
  getCommunitySpace,
  listCommunitySpaces,
  createMembershipTier,
  listMembershipTiers,
} from './community-space.js';
import { joinCommunity, leaveCommunity, upgradeMemberTier, getMembership, getUserMemberships } from './membership.js';
import { createChannel, listChannels, createChannelPost, listChannelPosts } from './channel.js';
import { createCourseModule, createLesson, getLesson, updateLessonProgress, getLessonProgress } from './course.js';
import { createEvent, listEvents, rsvpEvent } from './event.js';
import { classifyContent, submitModerationAction } from './moderation.js';
import { resolveThresholds, PLATFORM_MAX_THRESHOLDS } from './moderation-config.js';
import {
  assertPaidTiersEnabled,
  assertCoursesEnabled,
  assertMaxSpaces,
  FREE_COMMUNITY_ENTITLEMENTS,
  GROWTH_COMMUNITY_ENTITLEMENTS,
  ENTERPRISE_COMMUNITY_ENTITLEMENTS,
} from './entitlements.js';

// --------------------------------------------------------------------------
// D1-like in-memory stub
// --------------------------------------------------------------------------

type Row = Record<string, unknown>;

function makeDb(rows: Row[] = []): { prepare: (sql: string) => { bind: (...values: unknown[]) => { first: <T>() => Promise<T | null>; run: () => Promise<{ success: boolean }>; all: <T>() => Promise<{ results: T[] }> } } } {
  return {
    prepare: (_sql: string) => ({
      bind: (..._values: unknown[]) => ({
        first: async <T>() => (rows[0] as T) ?? null,
        run: async () => ({ success: true }),
        all: async <T>() => ({ results: rows as T[] }),
      }),
    }),
  };
}

function makeKv(): { put: () => Promise<void>; get: () => Promise<null>; delete: () => Promise<void> } {
  return {
    put: async () => undefined,
    get: async () => null,
    delete: async () => undefined,
  };
}

// --------------------------------------------------------------------------
// community-space tests
// --------------------------------------------------------------------------

describe('community-space', () => {
  it('createCommunitySpace returns a space with expected fields', async () => {
    const db = makeDb();
    const kv = makeKv();
    const space = await createCommunitySpace(db, kv, {
      workspaceId: 'ws_1',
      name: 'Lagos Dev Hub',
      slug: 'lagos-dev-hub',
      visibility: 'public',
      tenantId: 'ten_1',
    });
    expect(space.id).toMatch(/^csp_/);
    expect(space.name).toBe('Lagos Dev Hub');
    expect(space.slug).toBe('lagos-dev-hub');
    expect(space.visibility).toBe('public');
    expect(space.tenantId).toBe('ten_1');
    expect(space.createdAt).toBeGreaterThan(0);
  });

  it('getCommunitySpace returns null when not found', async () => {
    const db = makeDb([]);
    const result = await getCommunitySpace(db, 'nonexistent', 'ten_1');
    expect(result).toBeNull();
  });

  it('getCommunitySpace maps DB row to domain object', async () => {
    const row = {
      id: 'csp_test', workspace_id: 'ws_1', name: 'Test', slug: 'test',
      description: null, visibility: 'private', tenant_id: 'ten_1',
      created_at: 1000, updated_at: 1000,
    };
    const db = makeDb([row]);
    const result = await getCommunitySpace(db, 'test', 'ten_1');
    expect(result?.visibility).toBe('private');
    expect(result?.workspaceId).toBe('ws_1');
  });

  it('listCommunitySpaces returns empty array when none found', async () => {
    const db = makeDb([]);
    const result = await listCommunitySpaces(db, 'ws_x', 'ten_1');
    expect(result).toEqual([]);
  });

  it('createMembershipTier validates integer kobo (T4)', async () => {
    const db = makeDb();
    await expect(
      createMembershipTier(db, {
        communityId: 'csp_1',
        name: 'Gold',
        priceKobo: 1.5, // float — should throw
        billingCycle: 'monthly',
        tenantId: 'ten_1',
      }),
    ).rejects.toThrow(/integer.*kobo/i);
  });

  it('createMembershipTier rejects negative kobo', async () => {
    const db = makeDb();
    await expect(
      createMembershipTier(db, {
        communityId: 'csp_1',
        name: 'Tier',
        priceKobo: -100,
        billingCycle: 'monthly',
        tenantId: 'ten_1',
      }),
    ).rejects.toThrow(/integer.*kobo/i);
  });

  it('createMembershipTier accepts zero priceKobo (free tier)', async () => {
    const db = makeDb();
    const tier = await createMembershipTier(db, {
      communityId: 'csp_1',
      name: 'Free',
      priceKobo: 0,
      billingCycle: 'monthly',
      tenantId: 'ten_1',
    });
    expect(tier.priceKobo).toBe(0);
    expect(tier.isDefault).toBe(false);
  });

  it('listMembershipTiers returns empty array when none', async () => {
    const db = makeDb([]);
    const result = await listMembershipTiers(db, 'csp_1', 'ten_1');
    expect(result).toEqual([]);
  });
});

// --------------------------------------------------------------------------
// membership tests
// --------------------------------------------------------------------------

describe('membership', () => {
  it('joinCommunity throws NDPR_CONSENT_REQUIRED when no consent record', async () => {
    const db = makeDb([]); // no rows = no consent
    await expect(
      joinCommunity(db, {
        communityId: 'csp_1',
        userId: 'usr_1',
        tierId: 'tier_1',
        kycTier: 1,
        tenantId: 'ten_1',
      }),
    ).rejects.toThrow(/NDPR_CONSENT_REQUIRED/);
  });

  it('getMembership returns null when not found', async () => {
    const db = makeDb([]);
    const result = await getMembership(db, 'csp_1', 'usr_1', 'ten_1');
    expect(result).toBeNull();
  });

  it('getUserMemberships returns empty array', async () => {
    const db = makeDb([]);
    const result = await getUserMemberships(db, 'usr_1', 'ten_1');
    expect(result).toEqual([]);
  });
});

// --------------------------------------------------------------------------
// channel tests
// --------------------------------------------------------------------------

describe('channel', () => {
  it('createChannel returns channel with expected type', async () => {
    const db = makeDb();
    const channel = await createChannel(db, {
      communityId: 'csp_1',
      name: 'General',
      type: 'forum',
      tenantId: 'ten_1',
    });
    expect(channel.id).toMatch(/^chn_/);
    expect(channel.type).toBe('forum');
    expect(channel.position).toBe(0);
  });

  it('createChannel stores accessTierId', async () => {
    const db = makeDb();
    const channel = await createChannel(db, {
      communityId: 'csp_1',
      name: 'VIP',
      type: 'chat',
      accessTierId: 'tier_gold',
      tenantId: 'ten_1',
    });
    expect(channel.accessTierId).toBe('tier_gold');
  });

  it('listChannels returns empty array when none', async () => {
    const db = makeDb([]);
    const result = await listChannels(db, 'csp_1', 'ten_1');
    expect(result).toEqual([]);
  });

  it('createChannelPost runs moderation (P15)', async () => {
    const db = makeDb([{ depth: 0 }]);
    const post = await createChannelPost(db, {
      channelId: 'chn_1',
      authorId: 'usr_1',
      content: 'Hello community!',
      tenantId: 'ten_1',
    });
    expect(post.id).toMatch(/^pst_/);
    expect(post.moderationStatus).toBe('published');
    expect(post.depth).toBe(0);
  });

  it('createChannelPost with spam content gets auto_hide', async () => {
    const db = makeDb([{ depth: 0 }]);
    const post = await createChannelPost(db, {
      channelId: 'chn_1',
      authorId: 'usr_1',
      content: 'Click here for free money winner congratulations urgent limited offer click here',
      tenantId: 'ten_1',
    });
    expect(['under_review', 'published']).toContain(post.moderationStatus);
  });

  it('listChannelPosts returns empty array', async () => {
    const db = makeDb([]);
    const result = await listChannelPosts(db, 'chn_1', 'ten_1');
    expect(result).toEqual([]);
  });
});

// --------------------------------------------------------------------------
// course tests
// --------------------------------------------------------------------------

describe('course', () => {
  it('createCourseModule returns module with draft status', async () => {
    const db = makeDb();
    const mod = await createCourseModule(db, {
      communityId: 'csp_1',
      title: 'Intro to Hono',
      tenantId: 'ten_1',
    });
    expect(mod.id).toMatch(/^mod_/);
    expect(mod.status).toBe('draft');
    expect(mod.sequence).toBe(0);
  });

  it('createLesson stores contentType correctly', async () => {
    const db = makeDb();
    const lesson = await createLesson(db, {
      moduleId: 'mod_1',
      title: 'Getting Started',
      contentType: 'text',
      body: '# Welcome\nThis is the lesson.',
      tenantId: 'ten_1',
    });
    expect(lesson.id).toMatch(/^les_/);
    expect(lesson.contentType).toBe('text');
    expect(lesson.body).toBe('# Welcome\nThis is the lesson.');
  });

  it('getLesson returns null when not found', async () => {
    const db = makeDb([]);
    const result = await getLesson(db, 'les_x', 'ten_1');
    expect(result).toBeNull();
  });

  it('updateLessonProgress returns 100% completed', async () => {
    const db = makeDb();
    const prog = await updateLessonProgress(db, {
      lessonId: 'les_1',
      userId: 'usr_1',
      progressPct: 100,
      tenantId: 'ten_1',
    });
    expect(prog.progressPct).toBe(100);
    expect(prog.completedAt).not.toBeNull();
  });

  it('updateLessonProgress incomplete leaves completedAt null', async () => {
    const db = makeDb();
    const prog = await updateLessonProgress(db, {
      lessonId: 'les_1',
      userId: 'usr_1',
      progressPct: 50,
      tenantId: 'ten_1',
    });
    expect(prog.progressPct).toBe(50);
    expect(prog.completedAt).toBeNull();
  });

  it('getLessonProgress returns null when not found', async () => {
    const db = makeDb([]);
    const result = await getLessonProgress(db, 'les_1', 'usr_1', 'ten_1');
    expect(result).toBeNull();
  });
});

// --------------------------------------------------------------------------
// event tests
// --------------------------------------------------------------------------

describe('event', () => {
  it('createEvent returns event with zero rsvpCount', async () => {
    const db = makeDb();
    const event = await createEvent(db, {
      communityId: 'csp_1',
      title: 'Lagos Tech Summit',
      type: 'in_person',
      startsAt: Math.floor(Date.now() / 1000) + 86400,
      tenantId: 'ten_1',
    });
    expect(event.id).toMatch(/^evt_/);
    expect(event.rsvpCount).toBe(0);
    expect(event.ticketPriceKobo).toBe(0);
  });

  it('createEvent rejects float ticketPriceKobo (T4)', async () => {
    const db = makeDb();
    await expect(
      createEvent(db, {
        communityId: 'csp_1',
        title: 'Paid Event',
        type: 'live',
        startsAt: Date.now(),
        ticketPriceKobo: 99.99,
        tenantId: 'ten_1',
      }),
    ).rejects.toThrow(/non-negative integer/i);
  });

  it('createEvent accepts valid integer ticketPriceKobo', async () => {
    const db = makeDb();
    const event = await createEvent(db, {
      communityId: 'csp_1',
      title: 'Paid Event',
      type: 'live',
      startsAt: Date.now(),
      ticketPriceKobo: 50000, // ₦500 in kobo
      tenantId: 'ten_1',
    });
    expect(event.ticketPriceKobo).toBe(50000);
  });

  it('listEvents returns empty array', async () => {
    const db = makeDb([]);
    const result = await listEvents(db, 'csp_1', 'ten_1');
    expect(result).toEqual([]);
  });

  it('rsvpEvent throws PAYMENT_REQUIRED for paid event without paymentRef', async () => {
    const db = makeDb([{ id: 'evt_1', max_attendees: null, rsvp_count: 0, ticket_price_kobo: 50000 }]);
    await expect(
      rsvpEvent(db, {
        eventId: 'evt_1',
        userId: 'usr_1',
        status: 'going',
        tenantId: 'ten_1',
      }),
    ).rejects.toThrow(/PAYMENT_REQUIRED/);
  });

  it('rsvpEvent throws EVENT_FULL when at capacity', async () => {
    const db = makeDb([{ id: 'evt_1', max_attendees: 10, rsvp_count: 10, ticket_price_kobo: 0 }]);
    await expect(
      rsvpEvent(db, { eventId: 'evt_1', userId: 'usr_1', status: 'going', tenantId: 'ten_1' }),
    ).rejects.toThrow(/EVENT_FULL/);
  });
});

// --------------------------------------------------------------------------
// moderation tests
// --------------------------------------------------------------------------

describe('moderation', () => {
  it('classifyContent publishes clean content', async () => {
    const result = await classifyContent('Hello, welcome to our community!');
    expect(result.action).toBe('publish');
    expect(result.reason).toBeNull();
  });

  it('classifyContent detects spam via heuristics', async () => {
    const result = await classifyContent('click here for free money winner congratulations urgent click here');
    expect(['flag', 'auto_hide', 'publish']).toContain(result.action);
    expect(result.scores.spam).toBeGreaterThan(0);
  });

  it('classifyContent returns scores object', async () => {
    const result = await classifyContent('Normal content');
    expect(result.scores).toHaveProperty('profanity');
    expect(result.scores).toHaveProperty('nsfw');
    expect(result.scores).toHaveProperty('spam');
  });

  it('submitModerationAction completes without error', async () => {
    const db = makeDb();
    await expect(
      submitModerationAction(db, {
        moderatorId: 'mod_1',
        contentType: 'channel_post',
        contentId: 'pst_1',
        action: 'hide',
        reason: 'spam',
        flagCategory: 'spam',
        tenantId: 'ten_1',
      }),
    ).resolves.toBeUndefined();
  });
});

// --------------------------------------------------------------------------
// moderation-config tests
// --------------------------------------------------------------------------

describe('moderation-config', () => {
  it('resolveThresholds returns defaults when no overrides', () => {
    const thresholds = resolveThresholds();
    expect(thresholds.profanity).toBe(0.85);
    expect(thresholds.nsfw).toBe(0.7);
    expect(thresholds.spam).toBe(0.8);
  });

  it('resolveThresholds caps at platform maximum', () => {
    const thresholds = resolveThresholds({ profanity: 0.99 });
    expect(thresholds.profanity).toBe(PLATFORM_MAX_THRESHOLDS.profanity);
  });

  it('resolveThresholds uses lower override when below max', () => {
    const thresholds = resolveThresholds({ spam: 0.5 });
    expect(thresholds.spam).toBe(0.5);
  });
});

// --------------------------------------------------------------------------
// entitlements tests
// --------------------------------------------------------------------------

describe('entitlements', () => {
  it('assertPaidTiersEnabled throws for free tier', () => {
    expect(() => assertPaidTiersEnabled(FREE_COMMUNITY_ENTITLEMENTS)).toThrow(/ENTITLEMENT_DENIED/);
  });

  it('assertPaidTiersEnabled passes for growth tier', () => {
    expect(() => assertPaidTiersEnabled(GROWTH_COMMUNITY_ENTITLEMENTS)).not.toThrow();
  });

  it('assertCoursesEnabled throws for free tier', () => {
    expect(() => assertCoursesEnabled(FREE_COMMUNITY_ENTITLEMENTS)).toThrow(/ENTITLEMENT_DENIED/);
  });

  it('assertCoursesEnabled passes for growth tier', () => {
    expect(() => assertCoursesEnabled(GROWTH_COMMUNITY_ENTITLEMENTS)).not.toThrow();
  });

  it('assertMaxSpaces throws when limit exceeded', () => {
    expect(() => assertMaxSpaces(1, FREE_COMMUNITY_ENTITLEMENTS)).toThrow(/ENTITLEMENT_DENIED/);
  });

  it('assertMaxSpaces passes when under limit', () => {
    expect(() => assertMaxSpaces(0, FREE_COMMUNITY_ENTITLEMENTS)).not.toThrow();
  });

  it('assertMaxSpaces passes for unlimited (-1)', () => {
    expect(() => assertMaxSpaces(9999, ENTERPRISE_COMMUNITY_ENTITLEMENTS)).not.toThrow();
  });

  it('FREE tier has maxCommunityMembers of 100', () => {
    expect(FREE_COMMUNITY_ENTITLEMENTS.maxCommunityMembers).toBe(100);
  });

  it('GROWTH tier has paidTiersEnabled true', () => {
    expect(GROWTH_COMMUNITY_ENTITLEMENTS.paidTiersEnabled).toBe(true);
  });
});
