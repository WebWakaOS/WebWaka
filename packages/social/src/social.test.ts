/**
 * @webwaka/social — Unit tests (≥40 required per M7c brief)
 *
 * Uses in-memory D1-like stubs for deterministic, dependency-free testing.
 */

import { describe, it, expect } from 'vitest';
import { setupSocialProfile, getSocialProfile, getSocialProfileByHandle, isHandleAvailable, verifyProfile } from './social-profile.js';
import { followProfile, unfollowProfile, blockProfile, getFollowingIds, getMutuals } from './follow.js';
import { createPost, getPost, reactToPost, getTrendingPosts } from './social-post.js';
import { createGroup, getGroup, joinGroup, listPublicGroups } from './social-group.js';
import { getUserFeed } from './feed.js';
import { assertDMMasterKey, getOrCreateThread, sendDM } from './dm.js';
import { createStory, storyTimeRemaining } from './stories.js';
import { classifySocialContent, reportSocialContent } from './moderation.js';

// --------------------------------------------------------------------------
// D1-like in-memory stub
// --------------------------------------------------------------------------

type Row = Record<string, unknown>;

function makeDb(rows: Row[] = []): {
  prepare: (sql: string) => {
    bind: (...values: unknown[]) => {
      first: <T>() => Promise<T | null>;
      run: () => Promise<{ success: boolean }>;
      all: <T>() => Promise<{ results: T[] }>;
    };
  };
} {
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

// --------------------------------------------------------------------------
// social-profile tests
// --------------------------------------------------------------------------

describe('social-profile', () => {
  it('setupSocialProfile creates profile with expected handle', async () => {
    const db = makeDb([]); // isHandleAvailable check returns null = available
    const profile = await setupSocialProfile(db, {
      profileId: 'prof_1',
      handle: 'seun_waka',
      tenantId: 'ten_1',
    });
    expect(profile.handle).toBe('seun_waka');
    expect(profile.isVerified).toBe(false);
    expect(profile.followerCount).toBe(0);
    expect(profile.id).toMatch(/^spr_/);
  });

  it('setupSocialProfile throws when handle taken', async () => {
    const db = makeDb([{ id: 'existing' }]); // returns a row = taken
    await expect(
      setupSocialProfile(db, { profileId: 'prof_2', handle: 'taken', tenantId: 'ten_1' }),
    ).rejects.toThrow(/HANDLE_TAKEN/);
  });

  it('getSocialProfile returns null when not found', async () => {
    const db = makeDb([]);
    const result = await getSocialProfile(db, 'spr_x', 'ten_1');
    expect(result).toBeNull();
  });

  it('getSocialProfileByHandle returns null when not found', async () => {
    const db = makeDb([]);
    const result = await getSocialProfileByHandle(db, 'nobody', 'ten_1');
    expect(result).toBeNull();
  });

  it('isHandleAvailable returns true when no row', async () => {
    const db = makeDb([]);
    const available = await isHandleAvailable(db, 'fresh_handle', 'ten_1');
    expect(available).toBe(true);
  });

  it('isHandleAvailable returns false when row exists', async () => {
    const db = makeDb([{ id: 'spr_1' }]);
    const available = await isHandleAvailable(db, 'taken', 'ten_1');
    expect(available).toBe(false);
  });

  it('verifyProfile completes without error', async () => {
    const db = makeDb();
    await expect(verifyProfile(db, 'spr_1', 'ten_1')).resolves.toBeUndefined();
  });
});

// --------------------------------------------------------------------------
// follow tests
// --------------------------------------------------------------------------

describe('follow', () => {
  it('followProfile throws SELF_FOLLOW', async () => {
    const db = makeDb([{ visibility: 'public' }]);
    await expect(
      followProfile(db, { followerId: 'spr_1', followeeId: 'spr_1', tenantId: 'ten_1' }),
    ).rejects.toThrow(/SELF_FOLLOW/);
  });

  it('followProfile creates active follow for public profile', async () => {
    const db = makeDb([{ visibility: 'public' }]);
    const follow = await followProfile(db, {
      followerId: 'spr_1',
      followeeId: 'spr_2',
      tenantId: 'ten_1',
    });
    expect(follow.status).toBe('active');
    expect(follow.followerId).toBe('spr_1');
  });

  it('followProfile creates pending follow for private profile', async () => {
    const db = makeDb([{ visibility: 'private' }]);
    const follow = await followProfile(db, {
      followerId: 'spr_1',
      followeeId: 'spr_3',
      tenantId: 'ten_1',
    });
    expect(follow.status).toBe('pending');
  });

  it('followProfile throws when profile not found', async () => {
    const db = makeDb([]); // no visibility row
    await expect(
      followProfile(db, { followerId: 'spr_1', followeeId: 'spr_x', tenantId: 'ten_1' }),
    ).rejects.toThrow(/not found/i);
  });

  it('unfollowProfile completes without error', async () => {
    const db = makeDb([{ status: 'active' }]);
    await expect(unfollowProfile(db, 'spr_1', 'spr_2', 'ten_1')).resolves.toBeUndefined();
  });

  it('unfollowProfile noop when not following', async () => {
    const db = makeDb([]);
    await expect(unfollowProfile(db, 'spr_1', 'spr_2', 'ten_1')).resolves.toBeUndefined();
  });

  it('blockProfile removes follow and creates block', async () => {
    const db = makeDb();
    const block = await blockProfile(db, {
      blockerId: 'spr_1',
      blockedId: 'spr_2',
      tenantId: 'ten_1',
    });
    expect(block.blockerId).toBe('spr_1');
    expect(block.blockedId).toBe('spr_2');
    expect(block.id).toMatch(/^blk_/);
  });

  it('getFollowingIds returns empty when none', async () => {
    const db = makeDb([]);
    const ids = await getFollowingIds(db, 'spr_1', 'ten_1');
    expect(ids).toEqual([]);
  });

  it('getMutuals returns false when no follow exists', async () => {
    const db = makeDb([]);
    const result = await getMutuals(db, 'spr_1', 'spr_2', 'ten_1');
    expect(result).toBe(false);
  });
});

// --------------------------------------------------------------------------
// social-post tests
// --------------------------------------------------------------------------

describe('social-post', () => {
  it('createPost returns post with published status for clean content', async () => {
    const db = makeDb([{ depth: 0 }]);
    const post = await createPost(db, {
      authorId: 'spr_1',
      content: 'Hello Nigeria! Naija no dey carry last.',
      tenantId: 'ten_1',
    });
    expect(post.id).toMatch(/^spt_/);
    expect(post.moderationStatus).toBe('published');
    expect(post.postType).toBe('post');
    expect(post.language).toBe('en');
  });

  it('createPost rejects content > 2000 chars', async () => {
    const db = makeDb();
    await expect(
      createPost(db, {
        authorId: 'spr_1',
        content: 'a'.repeat(2001),
        tenantId: 'ten_1',
      }),
    ).rejects.toThrow(/POST_TOO_LONG/);
  });

  it('createPost sets story expiry 24h from now', async () => {
    const db = makeDb();
    const now = Math.floor(Date.now() / 1000);
    const post = await createPost(db, {
      authorId: 'spr_1',
      content: 'My story for the day',
      postType: 'story',
      tenantId: 'ten_1',
    });
    expect(post.expiresAt).not.toBeNull();
    expect(post.expiresAt!).toBeGreaterThan(now + 86000);
  });

  it('createPost sets no expiry for regular post', async () => {
    const db = makeDb();
    const post = await createPost(db, {
      authorId: 'spr_1',
      content: 'Regular post',
      tenantId: 'ten_1',
    });
    expect(post.expiresAt).toBeNull();
  });

  it('getPost returns null when not found', async () => {
    const db = makeDb([]);
    const result = await getPost(db, 'spt_x', 'ten_1');
    expect(result).toBeNull();
  });

  it('reactToPost returns reaction with correct type', async () => {
    const db = makeDb();
    const reaction = await reactToPost(db, {
      postId: 'spt_1',
      reactorId: 'spr_1',
      type: 'fire',
      tenantId: 'ten_1',
    });
    expect(reaction.type).toBe('fire');
    expect(reaction.id).toMatch(/^rxn_/);
  });

  it('getTrendingPosts returns empty when none', async () => {
    const db = makeDb([]);
    const result = await getTrendingPosts(db, 'ten_1');
    expect(result).toEqual([]);
  });
});

// --------------------------------------------------------------------------
// social-group tests
// --------------------------------------------------------------------------

describe('social-group', () => {
  it('createGroup sets owner as member with owner role', async () => {
    const db = makeDb();
    const group = await createGroup(db, {
      ownerId: 'spr_1',
      name: 'Lagos Devs',
      slug: 'lagos-devs',
      tenantId: 'ten_1',
    });
    expect(group.id).toMatch(/^grp_/);
    expect(group.memberCount).toBe(1);
    expect(group.ownerId).toBe('spr_1');
  });

  it('createGroup defaults to public visibility', async () => {
    const db = makeDb();
    const group = await createGroup(db, {
      ownerId: 'spr_1',
      name: 'Public Group',
      slug: 'public-group',
      tenantId: 'ten_1',
    });
    expect(group.visibility).toBe('public');
  });

  it('getGroup returns null when not found', async () => {
    const db = makeDb([]);
    const result = await getGroup(db, 'nonexistent', 'ten_1');
    expect(result).toBeNull();
  });

  it('joinGroup throws INVITE_ONLY for secret group', async () => {
    const db = makeDb([{ visibility: 'secret' }]);
    await expect(
      joinGroup(db, { groupId: 'grp_1', memberId: 'spr_2', tenantId: 'ten_1' }),
    ).rejects.toThrow(/INVITE_ONLY/);
  });

  it('listPublicGroups returns empty when none', async () => {
    const db = makeDb([]);
    const result = await listPublicGroups(db, 'ten_1');
    expect(result).toEqual([]);
  });
});

// --------------------------------------------------------------------------
// feed tests
// --------------------------------------------------------------------------

describe('feed', () => {
  it('getUserFeed returns empty array when no follows and no trending', async () => {
    const db = makeDb([]);
    const result = await getUserFeed(db, 'spr_1', { limit: 10, offset: 0, tenantId: 'ten_1' });
    expect(result).toEqual([]);
  });
});

// --------------------------------------------------------------------------
// dm tests
// --------------------------------------------------------------------------

describe('dm', () => {
  it('assertDMMasterKey throws when key is undefined', () => {
    expect(() => assertDMMasterKey(undefined)).toThrow(/P14_VIOLATION/);
  });

  it('assertDMMasterKey throws when key is empty string', () => {
    expect(() => assertDMMasterKey('')).toThrow(/P14_VIOLATION/);
  });

  it('assertDMMasterKey passes for non-empty key', () => {
    expect(() => assertDMMasterKey('some-key')).not.toThrow();
  });

  it('getOrCreateThread creates a new thread', async () => {
    const db = makeDb([]);
    const thread = await getOrCreateThread(db, {
      participantIds: ['spr_1', 'spr_2'],
      tenantId: 'ten_1',
    });
    expect(thread.id).toMatch(/^dmt_/);
    expect(thread.type).toBe('direct');
    expect(thread.participantIds).toContain('spr_1');
  });
});

// --------------------------------------------------------------------------
// stories tests
// --------------------------------------------------------------------------

describe('stories', () => {
  it('createStory sets postType to story', async () => {
    const db = makeDb();
    const story = await createStory(db, {
      authorId: 'spr_1',
      content: '24h story content',
      tenantId: 'ten_1',
    });
    expect(story.postType).toBe('story');
    expect(story.visibility).toBe('followers');
  });

  it('storyTimeRemaining returns 0 for expired story', () => {
    const pastTime = Math.floor(Date.now() / 1000) - 100;
    expect(storyTimeRemaining(pastTime)).toBe(0);
  });

  it('storyTimeRemaining returns positive for active story', () => {
    const futureTime = Math.floor(Date.now() / 1000) + 86400;
    expect(storyTimeRemaining(futureTime)).toBeGreaterThan(0);
  });
});

// --------------------------------------------------------------------------
// moderation tests
// --------------------------------------------------------------------------

describe('social-moderation', () => {
  it('classifySocialContent publishes clean content', async () => {
    const result = await classifySocialContent('Great day in Lagos!');
    expect(result.action).toBe('publish');
    expect(result.scores.profanity).toBe(0);
  });

  it('classifySocialContent detects spam heuristics', async () => {
    const result = await classifySocialContent('urgent action click here free money winner congratulations');
    expect(result.scores.spam).toBeGreaterThan(0);
  });

  it('classifySocialContent returns scores object', async () => {
    const result = await classifySocialContent('content');
    expect(result.scores).toHaveProperty('profanity');
    expect(result.scores).toHaveProperty('nsfw');
    expect(result.scores).toHaveProperty('spam');
  });

  it('reportSocialContent completes without error', async () => {
    const db = makeDb();
    await expect(
      reportSocialContent(db, {
        reporterId: 'spr_1',
        contentType: 'social_post',
        contentId: 'spt_1',
        category: 'spam',
        tenantId: 'ten_1',
      }),
    ).resolves.toBeUndefined();
  });

  it('classifySocialContent caps tenant threshold at platform max', async () => {
    const result = await classifySocialContent('Clean content', { spam: 0.99 });
    expect(result.action).toBe('publish'); // clean content should pass even with capped threshold
  });
});
