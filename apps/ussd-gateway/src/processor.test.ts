/**
 * Tests for USSD input processor — multi-step flow validation.
 *
 * UX-08: Send Money flow flattened from 4 to 3 levels.
 * Old: main → enter_recipient → enter_amount → confirm (4 interactions)
 * New: main → enter_phone_amount (PHONE*AMOUNT) → confirm (3 interactions)
 */

import { describe, it, expect } from 'vitest';
import { processUSSDInput } from './processor.js';
import type { USSDSession } from './session.js';

function makeSession(state: USSDSession['state'] = 'main_menu', data: Record<string, unknown> = {}): USSDSession {
  return {
    sessionId: 'sess_test',
    phone: '+2348012345678',
    state,
    data,
    createdAt: Date.now(),
  };
}

describe('processUSSDInput — main menu', () => {
  it('shows main menu on fresh session (empty text)', () => {
    const result = processUSSDInput(makeSession(), '');
    expect(result.text).toMatch(/^CON /);
    expect(result.ended).toBe(false);
  });

  it('routes "1" to wallet menu', () => {
    const result = processUSSDInput(makeSession(), '1');
    expect(result.session.state).toBe('wallet_menu');
    expect(result.text).toMatch(/^CON /);
    expect(result.ended).toBe(false);
  });

  it('routes "2" to send money (enter phone+amount)', () => {
    const result = processUSSDInput(makeSession(), '2');
    expect(result.session.state).toBe('send_money_enter_phone_amount');
    expect(result.ended).toBe(false);
  });

  it('routes "3" to trending feed', () => {
    const result = processUSSDInput(makeSession(), '3');
    expect(result.session.state).toBe('trending_feed');
    expect(result.ended).toBe(false);
  });

  it('routes "4" to transport menu', () => {
    const result = processUSSDInput(makeSession(), '4');
    expect(result.session.state).toBe('transport_menu');
    expect(result.ended).toBe(false);
  });

  it('routes "5" to community menu', () => {
    const result = processUSSDInput(makeSession(), '5');
    expect(result.session.state).toBe('community_menu');
    expect(result.ended).toBe(false);
  });

  it('ends session on invalid input', () => {
    const result = processUSSDInput(makeSession(), '9');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });
});

describe('processUSSDInput — wallet menu', () => {
  it('goes back to main menu on "0"', () => {
    const result = processUSSDInput(makeSession('wallet_menu'), '1*0');
    expect(result.session.state).toBe('main_menu');
    expect(result.text).toMatch(/^CON /);
    expect(result.ended).toBe(false);
  });

  it('ends on "1" (top up)', () => {
    const result = processUSSDInput(makeSession('wallet_menu'), '1*1');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });

  it('ends on "2" (history)', () => {
    const result = processUSSDInput(makeSession('wallet_menu'), '1*2');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });
});

describe('processUSSDInput — send money (UX-08 flattened)', () => {
  it('parses PHONE*AMOUNT from full text and goes to confirm', () => {
    const session = makeSession('send_money_enter_phone_amount');
    const result = processUSSDInput(session, '2*08012345678*500');
    expect(result.session.state).toBe('send_money_confirm');
    expect(result.session.data['recipient']).toBe('08012345678');
    expect(result.session.data['amount']).toBe('500');
    expect(result.ended).toBe(false);
  });

  it('parses international phone format', () => {
    const session = makeSession('send_money_enter_phone_amount');
    const result = processUSSDInput(session, '2*+2348099999999*1000');
    expect(result.session.state).toBe('send_money_confirm');
    expect(result.session.data['recipient']).toBe('+2348099999999');
    expect(result.session.data['amount']).toBe('1000');
  });

  it('rejects input without enough segments (no amount)', () => {
    const session = makeSession('send_money_enter_phone_amount');
    const result = processUSSDInput(session, '2*08012345678');
    expect(result.text).toMatch(/^END /);
    expect(result.text).toContain('PHONE*AMOUNT');
    expect(result.ended).toBe(true);
  });

  it('rejects short phone number', () => {
    const session = makeSession('send_money_enter_phone_amount');
    const result = processUSSDInput(session, '2*123*500');
    expect(result.text).toMatch(/^END /);
    expect(result.text).toContain('phone');
    expect(result.ended).toBe(true);
  });

  it('rejects non-numeric amount', () => {
    const session = makeSession('send_money_enter_phone_amount');
    const result = processUSSDInput(session, '2*08012345678*abc');
    expect(result.text).toMatch(/^END /);
    expect(result.text).toContain('amount');
    expect(result.ended).toBe(true);
  });

  it('rejects zero amount', () => {
    const session = makeSession('send_money_enter_phone_amount');
    const result = processUSSDInput(session, '2*08012345678*0');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });

  it('rejects negative amount', () => {
    const session = makeSession('send_money_enter_phone_amount');
    const result = processUSSDInput(session, '2*08012345678*-100');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });

  it('rejects amount with trailing letters (e.g. 500abc)', () => {
    const session = makeSession('send_money_enter_phone_amount');
    const result = processUSSDInput(session, '2*08012345678*500abc');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });

  it('accepts decimal amount like 1500.50', () => {
    const session = makeSession('send_money_enter_phone_amount');
    const result = processUSSDInput(session, '2*08012345678*1500.50');
    expect(result.session.state).toBe('send_money_confirm');
    expect(result.session.data['amount']).toBe('1500.50');
  });

  it('rejects non-numeric phone (alpha chars)', () => {
    const session = makeSession('send_money_enter_phone_amount');
    const result = processUSSDInput(session, '2*abcdefghij*500');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });

  it('confirms transfer on "1" in send_money_confirm', () => {
    const session = makeSession('send_money_confirm', { recipient: '08012345678', amount: '500' });
    const result = processUSSDInput(session, '2*08012345678*500*1');
    expect(result.text).toMatch(/^END /);
    expect(result.text).toContain('initiated');
    expect(result.ended).toBe(true);
  });

  it('cancels transfer on "2" in send_money_confirm', () => {
    const session = makeSession('send_money_confirm', { recipient: '08012345678', amount: '500' });
    const result = processUSSDInput(session, '2*08012345678*500*2');
    expect(result.text).toMatch(/^END /);
    expect(result.text).toContain('cancelled');
    expect(result.ended).toBe(true);
  });
});

// ============================================================================
// Branch 3 — Trending Feed FSM
// ============================================================================

const samplePosts = [
  { id: 'p1', snippet: 'Tech scene in Lagos is booming!', authorHandle: 'tunde_dev' },
  { id: 'p2', snippet: 'New fintech regulations announced.', authorHandle: 'naija_finance' },
  { id: 'p3', snippet: 'Champions League highlights!', authorHandle: 'sports_ng' },
];

describe('processUSSDInput — trending_feed (Branch 3)', () => {
  it('shows "0. Back" in trending feed menu', () => {
    const session = makeSession('trending_feed');
    const result = processUSSDInput(session, '3*0');
    expect(result.session.state).toBe('main_menu');
    expect(result.ended).toBe(false);
  });

  it('"0" from trending_feed returns to main_menu', () => {
    const result = processUSSDInput(makeSession('trending_feed'), '3*0');
    expect(result.session.state).toBe('main_menu');
    expect(result.text).toMatch(/^CON /);
  });

  it('"1" with posts → state trending_view_post', () => {
    const session = makeSession('trending_feed', { trendingPosts: samplePosts });
    const result = processUSSDInput(session, '3*1');
    expect(result.session.state).toBe('trending_view_post');
    expect(result.ended).toBe(false);
  });

  it('"2" with posts → state trending_view_post with correct index', () => {
    const session = makeSession('trending_feed', { trendingPosts: samplePosts });
    const result = processUSSDInput(session, '3*2');
    expect(result.session.state).toBe('trending_view_post');
    expect(result.session.data['viewingPostIndex']).toBe(1);
  });

  it('"6" (out of range) ends session with error', () => {
    const session = makeSession('trending_feed', { trendingPosts: samplePosts });
    const result = processUSSDInput(session, '3*6');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });

  it('invalid letter input ends session', () => {
    const session = makeSession('trending_feed', { trendingPosts: samplePosts });
    const result = processUSSDInput(session, '3*x');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });

  it('"1" with empty posts ends session', () => {
    const session = makeSession('trending_feed', { trendingPosts: [] });
    const result = processUSSDInput(session, '3*1');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });

  it('viewPost text contains author handle', () => {
    const session = makeSession('trending_feed', { trendingPosts: samplePosts });
    const result = processUSSDInput(session, '3*1');
    expect(result.text).toContain('tunde_dev');
  });

  it('viewPost text contains post snippet', () => {
    const session = makeSession('trending_feed', { trendingPosts: samplePosts });
    const result = processUSSDInput(session, '3*1');
    expect(result.text).toContain('Tech scene');
  });

  it('"0" from trending_view_post → back to trending_feed', () => {
    const session = makeSession('trending_view_post', { trendingPosts: samplePosts, viewingPostIndex: 0 });
    const result = processUSSDInput(session, '3*1*0');
    expect(result.session.state).toBe('trending_feed');
    expect(result.ended).toBe(false);
  });
});

// ============================================================================
// Branch 5 — Community Menu FSM
// ============================================================================

const sampleEvents = [
  { id: 'ev1', title: 'Lagos Dev Summit 2026' },
  { id: 'ev2', title: 'Women in Tech Abuja' },
];

const sampleGroups = [
  { id: 'g1', name: 'Lagos Developers' },
  { id: 'g2', name: 'Naija Fintech' },
];

describe('processUSSDInput — community_menu (Branch 5)', () => {
  it('"0" from community_menu → back to main_menu', () => {
    const result = processUSSDInput(makeSession('community_menu'), '5*0');
    expect(result.session.state).toBe('main_menu');
    expect(result.ended).toBe(false);
  });

  it('"1" → community_announcements state', () => {
    const result = processUSSDInput(makeSession('community_menu'), '5*1');
    expect(result.session.state).toBe('community_announcements');
    expect(result.ended).toBe(false);
    expect(result.text).toMatch(/^CON /);
  });

  it('"2" → community_events state', () => {
    const result = processUSSDInput(makeSession('community_menu'), '5*2');
    expect(result.session.state).toBe('community_events');
    expect(result.ended).toBe(false);
    expect(result.text).toMatch(/^CON /);
  });

  it('"3" → community_groups state', () => {
    const result = processUSSDInput(makeSession('community_menu'), '5*3');
    expect(result.session.state).toBe('community_groups');
    expect(result.ended).toBe(false);
    expect(result.text).toMatch(/^CON /);
  });

  it('invalid input ends session', () => {
    const result = processUSSDInput(makeSession('community_menu'), '5*9');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });

  it('"0" from community_announcements → back to community_menu', () => {
    const result = processUSSDInput(makeSession('community_announcements'), '5*1*0');
    expect(result.session.state).toBe('community_menu');
    expect(result.ended).toBe(false);
  });

  it('invalid input from community_announcements ends session', () => {
    const result = processUSSDInput(makeSession('community_announcements'), '5*1*9');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });

  it('"0" from community_events → back to community_menu', () => {
    const result = processUSSDInput(makeSession('community_events'), '5*2*0');
    expect(result.session.state).toBe('community_menu');
    expect(result.ended).toBe(false);
  });

  it('"1" from community_events with data → ends with event title', () => {
    const session = makeSession('community_events', { communityEvents: sampleEvents });
    const result = processUSSDInput(session, '5*2*1');
    expect(result.text).toMatch(/^END /);
    expect(result.text).toContain('Lagos Dev Summit');
    expect(result.ended).toBe(true);
  });

  it('"0" from community_groups → back to community_menu', () => {
    const result = processUSSDInput(makeSession('community_groups'), '5*3*0');
    expect(result.session.state).toBe('community_menu');
    expect(result.ended).toBe(false);
  });

  it('"1" from community_groups with data → ends with group name', () => {
    const session = makeSession('community_groups', { communityGroups: sampleGroups });
    const result = processUSSDInput(session, '5*3*1');
    expect(result.text).toMatch(/^END /);
    expect(result.text).toContain('Lagos Developers');
    expect(result.ended).toBe(true);
  });

  it('community_events menu shows numbered list when data populated', () => {
    const session = makeSession('community_menu', { communityEvents: sampleEvents });
    const result = processUSSDInput(session, '5*2');
    expect(result.text).toContain('Lagos Dev Summit');
    expect(result.text).toMatch(/^CON /);
  });

  it('community_groups menu shows numbered list when data populated', () => {
    const session = makeSession('community_menu', { communityGroups: sampleGroups });
    const result = processUSSDInput(session, '5*3');
    expect(result.text).toContain('Lagos Developers');
    expect(result.text).toMatch(/^CON /);
  });
});

// ── Phase 3 (E25) — Branch 6: My Groups processor tests ─────────────────────

const myGroupsData = [
  { id: 'grp_001', name: 'Lagos Volunteers' },
  { id: 'grp_002', name: 'Abuja Community' },
];
const broadcastsData = [
  { id: 'bc_001', subject: 'Monthly Meeting', body: 'Join us on Sunday at 3pm.', sentAt: 1700000000 },
  { id: 'bc_002', subject: 'Dues Reminder', body: 'Pay dues before month end.', sentAt: 1700001000 },
];

describe('processUSSDInput — branch 6 (My Groups, Phase 3 E25)', () => {
  it('routes "6" from main_menu to groups_list state', () => {
    const session = makeSession('main_menu', { myGroups: myGroupsData });
    const result = processUSSDInput(session, '6');
    expect(result.session.state).toBe('groups_list');
    expect(result.text).toMatch(/^CON /);
    expect(result.text).toContain('Lagos Volunteers');
    expect(result.ended).toBe(false);
  });

  it('selecting a group from groups_list goes to groups_broadcasts', () => {
    const session = makeSession('groups_list', {
      myGroups: myGroupsData,
      'groupBroadcasts_grp_001': broadcastsData,
    });
    const result = processUSSDInput(session, '1');
    expect(result.session.state).toBe('groups_broadcasts');
    expect(result.text).toContain('Monthly Meeting');
    expect(result.ended).toBe(false);
  });

  it('viewing a broadcast from groups_broadcasts goes to groups_view_broadcast', () => {
    const session = makeSession('groups_broadcasts', {
      myGroups: myGroupsData,
      selectedGroupIndex: 0,
      selectedGroupId: 'grp_001',
      'groupBroadcasts_grp_001': broadcastsData,
    });
    const result = processUSSDInput(session, '1');
    expect(result.session.state).toBe('groups_view_broadcast');
    expect(result.text).toContain('Join us on Sunday');
    expect(result.ended).toBe(false);
  });

  it('"0" from groups_view_broadcast returns to groups_broadcasts', () => {
    const session = makeSession('groups_view_broadcast', {
      myGroups: myGroupsData,
      selectedGroupIndex: 0,
      selectedGroupId: 'grp_001',
      'groupBroadcasts_grp_001': broadcastsData,
      viewingBroadcastIndex: 0,
    });
    const result = processUSSDInput(session, '0');
    expect(result.session.state).toBe('groups_broadcasts');
    expect(result.text).toMatch(/^CON /);
    expect(result.ended).toBe(false);
  });
});
