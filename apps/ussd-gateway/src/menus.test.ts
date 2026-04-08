/**
 * Tests for USSD menu text builders.
 * Validates CON/END prefixes, balance formatting (P9 — integer kobo), and menu text.
 * M7c additions: trendingFeed with posts, trendingPostDetail, communityListMenu,
 *                communityDetailMenu (Branch 3 + Branch 5).
 */

import { describe, it, expect } from 'vitest';
import {
  mainMenu,
  walletMenu,
  sendMoneyEnterRecipient,
  sendMoneyEnterAmount,
  sendMoneyConfirm,
  trendingFeed,
  trendingPostDetail,
  transportMenu,
  communityMenu,
  communityListMenu,
  communityDetailMenu,
  communityAnnouncementsMenu,
  endSession,
  type TrendingPost,
  type CommunityItem,
} from './menus.js';

describe('mainMenu', () => {
  it('starts with CON prefix', () => {
    expect(mainMenu()).toMatch(/^CON /);
  });

  it('lists all 5 options', () => {
    const menu = mainMenu();
    expect(menu).toContain('1. My Wallet');
    expect(menu).toContain('2. Send Money');
    expect(menu).toContain('3. Trending Now');
    expect(menu).toContain('4. Book Transport');
    expect(menu).toContain('5. Community');
  });
});

describe('walletMenu', () => {
  it('starts with CON prefix', () => {
    expect(walletMenu(1000)).toMatch(/^CON /);
  });

  it('formats balance correctly (P9 — integer kobo)', () => {
    // 50000 kobo = ₦500.00
    expect(walletMenu(50_000)).toContain('500.00');
    // 100 kobo = ₦1.00
    expect(walletMenu(100)).toContain('1.00');
    // 0 kobo = ₦0.00
    expect(walletMenu(0)).toContain('0.00');
    // 9999 kobo = ₦99.99
    expect(walletMenu(9_999)).toContain('99.99');
  });

  it('includes Back option 0', () => {
    expect(walletMenu(0)).toContain('0. Back');
  });

  it('does not use floating point division', () => {
    // 1 kobo = ₦0.01 — exact, no float rounding issues
    const menu = walletMenu(1);
    expect(menu).toContain('0.01');
  });
});

describe('sendMoneyEnterRecipient', () => {
  it('starts with CON prefix', () => {
    expect(sendMoneyEnterRecipient()).toMatch(/^CON /);
  });
});

describe('sendMoneyEnterAmount', () => {
  it('includes recipient phone in text', () => {
    expect(sendMoneyEnterAmount('+2348012345678')).toContain('+2348012345678');
  });

  it('starts with CON prefix', () => {
    expect(sendMoneyEnterAmount('+2348012345678')).toMatch(/^CON /);
  });
});

describe('sendMoneyConfirm', () => {
  it('includes recipient and amount', () => {
    const text = sendMoneyConfirm('+2348012345678', '500');
    expect(text).toContain('+2348012345678');
    expect(text).toContain('500');
  });

  it('starts with CON prefix', () => {
    expect(sendMoneyConfirm('+2348012345678', '500')).toMatch(/^CON /);
  });

  it('includes Confirm and Cancel options', () => {
    const text = sendMoneyConfirm('+2348012345678', '500');
    expect(text).toContain('1. Confirm');
    expect(text).toContain('2. Cancel');
  });
});

// ---------------------------------------------------------------------------
// M7c: trendingFeed with real post data (Branch 3)
// ---------------------------------------------------------------------------

describe('trendingFeed', () => {
  it('starts with CON prefix (no posts)', () => {
    expect(trendingFeed()).toMatch(/^CON /);
  });

  it('includes back option (no posts)', () => {
    expect(trendingFeed()).toContain('0. Back');
  });

  it('shows "No trending posts" when empty array passed', () => {
    expect(trendingFeed([])).toContain('No trending posts');
  });

  it('lists numbered posts when posts provided', () => {
    const posts: TrendingPost[] = [
      { handle: 'amaka', content: 'Hello Lagos! This is a test post.' },
      { handle: 'chidi', content: 'Good morning Nigeria, how are you all doing today?' },
    ];
    const menu = trendingFeed(posts);
    expect(menu).toContain('1. @amaka:');
    expect(menu).toContain('2. @chidi:');
    expect(menu).toContain('0. Back');
  });

  it('truncates post content to 40 chars', () => {
    const longContent = 'A'.repeat(100);
    const posts: TrendingPost[] = [{ handle: 'user1', content: longContent }];
    const menu = trendingFeed(posts);
    const line = menu.split('\n').find((l) => l.startsWith('1.'));
    expect(line).toBeDefined();
    // after "@user1: " + 40 chars of content
    const contentPart = line!.split(': ')[1] ?? '';
    expect(contentPart.length).toBeLessThanOrEqual(40);
  });

  it('shows at most 5 posts', () => {
    const posts: TrendingPost[] = Array.from({ length: 10 }, (_, i) => ({
      handle: `user${i}`,
      content: `Post number ${i}`,
    }));
    const menu = trendingFeed(posts);
    expect(menu).toContain('5.');
    expect(menu).not.toContain('6.');
  });
});

describe('trendingPostDetail', () => {
  it('starts with CON prefix', () => {
    expect(trendingPostDetail({ handle: 'amaka', content: 'Hello' })).toMatch(/^CON /);
  });

  it('shows handle in output', () => {
    const detail = trendingPostDetail({ handle: 'chidi', content: 'Great post!' });
    expect(detail).toContain('@chidi');
  });

  it('includes like and back options', () => {
    const detail = trendingPostDetail({ handle: 'user1', content: 'Content here' });
    expect(detail).toContain('1. Like');
    expect(detail).toContain('0. Back');
  });
});

// ---------------------------------------------------------------------------
// M7c: communityListMenu (Branch 5)
// ---------------------------------------------------------------------------

describe('communityListMenu', () => {
  it('starts with CON prefix (no communities)', () => {
    expect(communityListMenu()).toMatch(/^CON /);
  });

  it('shows "no communities" when empty', () => {
    expect(communityListMenu([])).toContain('no communities');
  });

  it('lists numbered communities', () => {
    const communities: CommunityItem[] = [
      { id: 'c1', name: 'Lagos Devs' },
      { id: 'c2', name: 'Abuja Entrepreneurs' },
    ];
    const menu = communityListMenu(communities);
    expect(menu).toContain('1. Lagos Devs');
    expect(menu).toContain('2. Abuja Entrepreneurs');
    expect(menu).toContain('0. Back');
  });

  it('shows at most 5 communities', () => {
    const communities: CommunityItem[] = Array.from({ length: 8 }, (_, i) => ({
      id: `c${i}`,
      name: `Community ${i + 1}`,
    }));
    const menu = communityListMenu(communities);
    expect(menu).toContain('5.');
    expect(menu).not.toContain('6.');
  });
});

describe('communityDetailMenu', () => {
  it('starts with CON prefix', () => {
    expect(communityDetailMenu('Lagos Devs')).toMatch(/^CON /);
  });

  it('includes community name in header', () => {
    expect(communityDetailMenu('Abuja Entrepreneurs')).toContain('Abuja Entrepreneurs');
  });

  it('includes Announcements, Events, Members and Back', () => {
    const menu = communityDetailMenu('Test Community');
    expect(menu).toContain('1. Announcements');
    expect(menu).toContain('2. Upcoming Events');
    expect(menu).toContain('3. Members');
    expect(menu).toContain('0. Back');
  });

  it('truncates very long community names to 30 chars', () => {
    const longName = 'A'.repeat(50);
    const menu = communityDetailMenu(longName);
    const header = menu.split('\n')[0] ?? '';
    expect(header.length).toBeLessThanOrEqual(35); // "CON " + 30 chars
  });
});

describe('communityAnnouncementsMenu', () => {
  it('starts with CON prefix (empty)', () => {
    expect(communityAnnouncementsMenu([])).toMatch(/^CON /);
  });

  it('shows no announcements message', () => {
    expect(communityAnnouncementsMenu([])).toContain('No announcements');
  });

  it('lists numbered announcements', () => {
    const posts = [
      { title: 'Welcome to the group', content: 'Welcome everyone!' },
      { title: null, content: 'Big news coming this week, stay tuned for updates.' },
    ];
    const menu = communityAnnouncementsMenu(posts);
    expect(menu).toContain('1. Welcome to the group');
    expect(menu).toContain('2. Big news coming');
  });
});

// ---------------------------------------------------------------------------
// Legacy communityMenu (backward compatibility)
// ---------------------------------------------------------------------------

describe('communityMenu', () => {
  it('starts with CON prefix', () => {
    expect(communityMenu()).toMatch(/^CON /);
  });
});

describe('transportMenu', () => {
  it('starts with CON prefix', () => {
    expect(transportMenu()).toMatch(/^CON /);
  });
});

describe('endSession', () => {
  it('starts with END prefix', () => {
    expect(endSession('Thank you')).toMatch(/^END /);
  });

  it('includes the message', () => {
    expect(endSession('Transfer complete')).toContain('Transfer complete');
  });
});
