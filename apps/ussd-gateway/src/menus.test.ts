/**
 * Tests for USSD menu text builders.
 * Validates CON/END prefixes, balance formatting (P9 — integer kobo), and menu text.
 *
 * UX-08: sendMoneyEnterRecipient / sendMoneyEnterAmount replaced by
 * sendMoneyEnterPhoneAndAmount (combined PHONE*AMOUNT format).
 */

import { describe, it, expect } from 'vitest';
import {
  mainMenu,
  walletMenu,
  sendMoneyEnterPhoneAndAmount,
  sendMoneyConfirm,
  trendingFeed,
  viewTrendingPost,
  transportMenu,
  communityMenu,
  communityAnnouncements,
  communityEvents,
  communityGroups,
  groupsMenu,
  groupBroadcastMenu,
  viewBroadcast,
  endSession,
} from './menus.js';
import type { GroupBroadcastItem, BroadcastSnippet } from './menus.js';

describe('mainMenu', () => {
  it('starts with CON prefix', () => {
    expect(mainMenu()).toMatch(/^CON /);
  });

  it('lists all 5 original options', () => {
    const menu = mainMenu();
    expect(menu).toContain('1. My Wallet');
    expect(menu).toContain('2. Send Money');
    expect(menu).toContain('3. Trending Now');
    expect(menu).toContain('4. Book Transport');
    expect(menu).toContain('5. Community');
  });

  it('Phase 3 (E25): includes option 6 My Groups', () => {
    expect(mainMenu()).toContain('6. My Groups');
  });
});

describe('walletMenu', () => {
  it('starts with CON prefix', () => {
    expect(walletMenu(1000)).toMatch(/^CON /);
  });

  it('formats balance correctly (P9 — integer kobo)', () => {
    expect(walletMenu(50_000)).toContain('500.00');
    expect(walletMenu(100)).toContain('1.00');
    expect(walletMenu(0)).toContain('0.00');
    expect(walletMenu(9_999)).toContain('99.99');
  });

  it('includes Back option 0', () => {
    expect(walletMenu(0)).toContain('0. Back');
  });

  it('does not use floating point division', () => {
    const menu = walletMenu(1);
    expect(menu).toContain('0.01');
  });
});

describe('sendMoneyEnterPhoneAndAmount (UX-08)', () => {
  it('starts with CON prefix', () => {
    expect(sendMoneyEnterPhoneAndAmount()).toMatch(/^CON /);
  });

  it('includes PHONE*AMOUNT format hint', () => {
    const text = sendMoneyEnterPhoneAndAmount();
    expect(text).toContain('PHONE*AMOUNT');
  });

  it('includes an example', () => {
    const text = sendMoneyEnterPhoneAndAmount();
    expect(text).toContain('08012345678*500');
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

describe('trendingFeed', () => {
  it('starts with CON prefix', () => {
    expect(trendingFeed()).toMatch(/^CON /);
  });

  it('includes back option', () => {
    expect(trendingFeed()).toContain('0. Back');
  });

  it('shows "No trending posts" when called with empty array', () => {
    expect(trendingFeed([])).toContain('No trending posts');
  });

  it('shows numbered list when posts provided', () => {
    const posts = [
      { id: 'p1', snippet: 'Tech scene in Lagos is booming!', authorHandle: 'tunde_dev' },
      { id: 'p2', snippet: 'Naija fintech growing fast.', authorHandle: 'ada_fin' },
    ];
    const text = trendingFeed(posts);
    expect(text).toContain('1. Tech scene');
    expect(text).toContain('2. Naija fintech');
  });

  it('shows at most 5 posts', () => {
    const posts = Array.from({ length: 8 }, (_, i) => ({
      id: `p${i}`,
      snippet: `Post ${i} content here`,
      authorHandle: `user${i}`,
    }));
    const text = trendingFeed(posts);
    expect(text).toContain('1.');
    expect(text).toContain('5.');
    expect(text).not.toContain('6.');
  });

  it('truncates long snippet to 30 chars', () => {
    const posts = [{ id: 'p1', snippet: 'A'.repeat(50), authorHandle: 'user1' }];
    const text = trendingFeed(posts);
    expect(text).toContain('1. ' + 'A'.repeat(30));
    expect(text).not.toContain('A'.repeat(31));
  });
});

describe('viewTrendingPost', () => {
  const post = { id: 'p1', snippet: 'Tech scene in Lagos is growing fast!', authorHandle: 'tunde_dev' };

  it('starts with CON prefix', () => {
    expect(viewTrendingPost(post)).toMatch(/^CON /);
  });

  it('includes author handle with @ prefix', () => {
    expect(viewTrendingPost(post)).toContain('@tunde_dev');
  });

  it('includes post snippet content', () => {
    expect(viewTrendingPost(post)).toContain('Tech scene in Lagos');
  });

  it('includes back to trending option', () => {
    expect(viewTrendingPost(post)).toContain('0. Back to Trending');
  });
});

describe('transportMenu', () => {
  it('starts with CON prefix', () => {
    expect(transportMenu()).toMatch(/^CON /);
  });
});

describe('communityMenu', () => {
  it('starts with CON prefix', () => {
    expect(communityMenu()).toMatch(/^CON /);
  });

  it('lists all 3 options plus back', () => {
    const menu = communityMenu();
    expect(menu).toContain('1. Announcements');
    expect(menu).toContain('2. Events');
    expect(menu).toContain('3. Groups');
    expect(menu).toContain('0. Back');
  });
});

describe('communityAnnouncements', () => {
  it('starts with CON prefix', () => {
    expect(communityAnnouncements()).toMatch(/^CON /);
  });

  it('shows "No announcements" when empty', () => {
    expect(communityAnnouncements([])).toContain('No announcements');
  });

  it('shows numbered list when items provided', () => {
    const items = ['DevFest tickets on sale now', 'New API guidelines published'];
    const text = communityAnnouncements(items);
    expect(text).toContain('1. DevFest tickets');
    expect(text).toContain('2. New API guidelines');
  });

  it('includes back option 0', () => {
    expect(communityAnnouncements()).toContain('0. Back');
  });
});

describe('communityEvents', () => {
  it('starts with CON prefix', () => {
    expect(communityEvents()).toMatch(/^CON /);
  });

  it('shows "No upcoming events" when empty', () => {
    expect(communityEvents([])).toContain('No upcoming events');
  });

  it('shows numbered list when events provided', () => {
    const events = [
      { id: 'ev1', title: 'Lagos Dev Summit 2026' },
      { id: 'ev2', title: 'Naija AI Workshop' },
    ];
    const text = communityEvents(events);
    expect(text).toContain('1. Lagos Dev Summit');
    expect(text).toContain('2. Naija AI Workshop');
  });

  it('includes back option 0', () => {
    expect(communityEvents()).toContain('0. Back');
  });
});

describe('communityGroups', () => {
  it('starts with CON prefix', () => {
    expect(communityGroups()).toMatch(/^CON /);
  });

  it('shows "No groups available" when empty', () => {
    expect(communityGroups([])).toContain('No groups available');
  });

  it('shows numbered list when groups provided', () => {
    const groups = [
      { id: 'g1', name: 'Lagos Developers' },
      { id: 'g2', name: 'Naija Fintech Hub' },
    ];
    const text = communityGroups(groups);
    expect(text).toContain('1. Lagos Developers');
    expect(text).toContain('2. Naija Fintech Hub');
  });

  it('includes back option 0', () => {
    expect(communityGroups()).toContain('0. Back');
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

// ── Phase 3 (E25) — Branch 6: My Groups ─────────────────────────────────────

const sampleGroups: GroupBroadcastItem[] = [
  { id: 'grp_001', name: 'Lagos Volunteers' },
  { id: 'grp_002', name: 'Abuja Community' },
];

const sampleBroadcasts: BroadcastSnippet[] = [
  { id: 'bc_001', subject: 'Monthly Meeting', body: 'Join us on Sunday at 3pm for our monthly meeting.', sentAt: 1700000000 },
  { id: 'bc_002', subject: 'Dues Reminder', body: 'Please pay your dues before end of month.', sentAt: 1700001000 },
];

describe('groupsMenu (Phase 3 E25)', () => {
  it('starts with CON prefix', () => {
    expect(groupsMenu(sampleGroups)).toMatch(/^CON /);
  });

  it('shows "no groups" message when empty', () => {
    expect(groupsMenu([])).toContain('no groups');
  });

  it('shows numbered list of groups with back option', () => {
    const text = groupsMenu(sampleGroups);
    expect(text).toContain('1. Lagos Volunteers');
    expect(text).toContain('2. Abuja Community');
    expect(text).toContain('0. Back');
  });
});

describe('groupBroadcastMenu (Phase 3 E25)', () => {
  it('starts with CON prefix and shows group name', () => {
    const text = groupBroadcastMenu('Lagos Volunteers', sampleBroadcasts);
    expect(text).toMatch(/^CON /);
    expect(text).toContain('Lagos Volunteers');
  });

  it('shows "No broadcasts yet" when empty', () => {
    expect(groupBroadcastMenu('Test Group', [])).toContain('No broadcasts yet');
  });

  it('shows numbered list of up to 3 broadcasts', () => {
    const text = groupBroadcastMenu('Lagos Volunteers', sampleBroadcasts);
    expect(text).toContain('1. Monthly Meeting');
    expect(text).toContain('2. Dues Reminder');
    expect(text).toContain('0. Back');
  });
});

describe('viewBroadcast (Phase 3 E25)', () => {
  it('starts with CON prefix and shows subject + body', () => {
    const text = viewBroadcast('Lagos Volunteers', sampleBroadcasts[0]!);
    expect(text).toMatch(/^CON /);
    expect(text).toContain('Monthly Meeting');
    expect(text).toContain('Join us on Sunday');
    expect(text).toContain('0. Back');
  });

  it('truncates body to 120 chars with ellipsis', () => {
    const longBody = 'A'.repeat(200);
    const text = viewBroadcast('G', { id: 'x', subject: 'Long', body: longBody, sentAt: 0 });
    const bodyPart = text.split('\n').slice(1, -1).join('\n');
    expect(bodyPart.length).toBeLessThanOrEqual(130);
    expect(text).toContain('...');
  });
});
