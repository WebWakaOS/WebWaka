/**
 * Tests for USSD input processor — multi-step flow validation.
 * M7c additions: trending feed FSM (Branch 3), community list FSM (Branch 5).
 */

import { describe, it, expect } from 'vitest';
import { processUSSDInput } from './processor.js';
import type { USSDSession } from './session.js';
import type { TrendingPost, CommunityItem } from './menus.js';

function makeSession(
  state: USSDSession['state'] = 'main_menu',
  data: Record<string, unknown> = {},
): USSDSession {
  return {
    sessionId: 'sess_test',
    phone: '+2348012345678',
    state,
    data: data as Record<string, string>,
    createdAt: Date.now(),
  };
}

const TRENDING_POSTS: TrendingPost[] = [
  { handle: 'amaka', content: 'Lagos tech scene is booming!' },
  { handle: 'chidi', content: 'Nigeria fintech leads Africa.' },
  { handle: 'emeka', content: 'Abuja dev meetup this weekend.' },
];

const COMMUNITIES: CommunityItem[] = [
  { id: 'c-1', name: 'Lagos Devs' },
  { id: 'c-2', name: 'Abuja Entrepreneurs' },
];

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

  it('routes "2" to send money (enter recipient)', () => {
    const result = processUSSDInput(makeSession(), '2');
    expect(result.session.state).toBe('send_money_enter_recipient');
    expect(result.ended).toBe(false);
  });

  it('routes "3" to trending_feed state', () => {
    const result = processUSSDInput(makeSession(), '3');
    expect(result.session.state).toBe('trending_feed');
    expect(result.ended).toBe(false);
  });

  it('routes "3" and shows pre-fetched posts from session data', () => {
    const session = makeSession('main_menu', { trendingPosts: TRENDING_POSTS });
    const result = processUSSDInput(session, '3');
    expect(result.text).toContain('@amaka');
    expect(result.ended).toBe(false);
  });

  it('routes "4" to transport menu', () => {
    const result = processUSSDInput(makeSession(), '4');
    expect(result.session.state).toBe('transport_menu');
    expect(result.ended).toBe(false);
  });

  it('routes "5" to community_list state', () => {
    const result = processUSSDInput(makeSession(), '5');
    expect(result.session.state).toBe('community_list');
    expect(result.ended).toBe(false);
  });

  it('routes "5" and shows pre-fetched communities from session data', () => {
    const session = makeSession('main_menu', { communities: COMMUNITIES });
    const result = processUSSDInput(session, '5');
    expect(result.text).toContain('Lagos Devs');
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

describe('processUSSDInput — send money multi-step flow', () => {
  it('stores recipient in session data on enter_recipient step', () => {
    const session = makeSession('send_money_enter_recipient');
    const result = processUSSDInput(session, '2*+2348099999999');
    expect(result.session.state).toBe('send_money_enter_amount');
    expect(result.session.data['recipient']).toBe('+2348099999999');
    expect(result.ended).toBe(false);
  });

  it('rejects short phone number on enter_recipient', () => {
    const session = makeSession('send_money_enter_recipient');
    const result = processUSSDInput(session, '2*123');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });

  it('stores amount in session data on enter_amount step', () => {
    const session = makeSession('send_money_enter_amount', { recipient: '+2348099999999' });
    const result = processUSSDInput(session, '2*+2348099999999*500');
    expect(result.session.state).toBe('send_money_confirm');
    expect(result.session.data['amount']).toBe('500');
    expect(result.ended).toBe(false);
  });

  it('rejects invalid amount', () => {
    const session = makeSession('send_money_enter_amount', { recipient: '+2348099999999' });
    const result = processUSSDInput(session, '2*+2348099999999*abc');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });

  it('confirms transfer on "1" in send_money_confirm', () => {
    const session = makeSession('send_money_confirm', { recipient: '+2348099999999', amount: '500' });
    const result = processUSSDInput(session, '2*+2348099999999*500*1');
    expect(result.text).toMatch(/^END /);
    expect(result.text).toContain('initiated');
    expect(result.ended).toBe(true);
  });

  it('cancels transfer on "2" in send_money_confirm', () => {
    const session = makeSession('send_money_confirm', { recipient: '+2348099999999', amount: '500' });
    const result = processUSSDInput(session, '2*+2348099999999*500*2');
    expect(result.text).toMatch(/^END /);
    expect(result.text).toContain('cancelled');
    expect(result.ended).toBe(true);
  });
});

describe('processUSSDInput — trailing-input extraction', () => {
  it('extracts last pipe-segment as input', () => {
    const session = makeSession('send_money_enter_amount', { recipient: '+2348099999999' });
    const result = processUSSDInput(session, '2*+2348099999999*500');
    expect(result.session.data['amount']).toBe('500');
  });
});

// ---------------------------------------------------------------------------
// M7c: Branch 3 — Trending feed FSM
// ---------------------------------------------------------------------------

describe('processUSSDInput — trending_feed (M7c Branch 3)', () => {
  function makeTrendingSession(): USSDSession {
    return makeSession('trending_feed', { trendingPosts: TRENDING_POSTS });
  }

  it('goes back to main menu on "0"', () => {
    const result = processUSSDInput(makeTrendingSession(), '3*0');
    expect(result.session.state).toBe('main_menu');
    expect(result.ended).toBe(false);
  });

  it('selecting "1" transitions to trending_post_detail with index 0', () => {
    const result = processUSSDInput(makeTrendingSession(), '3*1');
    expect(result.session.state).toBe('trending_post_detail');
    expect(result.session.data['selectedPostIndex']).toBe(0);
    expect(result.ended).toBe(false);
  });

  it('selecting "2" transitions to trending_post_detail with index 1', () => {
    const result = processUSSDInput(makeTrendingSession(), '3*2');
    expect(result.session.state).toBe('trending_post_detail');
    expect(result.session.data['selectedPostIndex']).toBe(1);
    expect(result.ended).toBe(false);
  });

  it('shows post detail text with handle', () => {
    const result = processUSSDInput(makeTrendingSession(), '3*1');
    expect(result.text).toContain('@amaka');
  });

  it('ends session on out-of-range selection', () => {
    const result = processUSSDInput(makeTrendingSession(), '3*9');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });

  it('ends session when no posts in session data', () => {
    const session = makeSession('trending_feed');
    const result = processUSSDInput(session, '3*1');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });
});

describe('processUSSDInput — trending_post_detail (M7c)', () => {
  function makeDetailSession(): USSDSession {
    return makeSession('trending_post_detail', {
      trendingPosts: TRENDING_POSTS,
      selectedPostIndex: 0,
    });
  }

  it('returns to trending feed on "0"', () => {
    const result = processUSSDInput(makeDetailSession(), '3*1*0');
    expect(result.session.state).toBe('trending_feed');
    expect(result.text).toMatch(/^CON /);
    expect(result.ended).toBe(false);
  });

  it('ends with liked message on "1"', () => {
    const result = processUSSDInput(makeDetailSession(), '3*1*1');
    expect(result.text).toMatch(/^END /);
    expect(result.text).toContain('liked');
    expect(result.ended).toBe(true);
  });

  it('ends on invalid input', () => {
    const result = processUSSDInput(makeDetailSession(), '3*1*9');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// M7c: Branch 5 — Community list + detail FSM
// ---------------------------------------------------------------------------

describe('processUSSDInput — community_list (M7c Branch 5)', () => {
  function makeCommunitySession(): USSDSession {
    return makeSession('community_list', { communities: COMMUNITIES });
  }

  it('goes back to main menu on "0"', () => {
    const result = processUSSDInput(makeCommunitySession(), '5*0');
    expect(result.session.state).toBe('main_menu');
    expect(result.ended).toBe(false);
  });

  it('selecting "1" transitions to community_detail with first community', () => {
    const result = processUSSDInput(makeCommunitySession(), '5*1');
    expect(result.session.state).toBe('community_detail');
    expect(result.session.data['selectedCommunityName']).toBe('Lagos Devs');
    expect(result.session.data['selectedCommunityId']).toBe('c-1');
    expect(result.ended).toBe(false);
  });

  it('selecting "2" transitions to community_detail with second community', () => {
    const result = processUSSDInput(makeCommunitySession(), '5*2');
    expect(result.session.state).toBe('community_detail');
    expect(result.session.data['selectedCommunityName']).toBe('Abuja Entrepreneurs');
    expect(result.ended).toBe(false);
  });

  it('shows community detail menu text with name', () => {
    const result = processUSSDInput(makeCommunitySession(), '5*1');
    expect(result.text).toContain('Lagos Devs');
  });

  it('ends on out-of-range selection', () => {
    const result = processUSSDInput(makeCommunitySession(), '5*9');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });

  it('ends on selection with no communities in session', () => {
    const session = makeSession('community_list');
    const result = processUSSDInput(session, '5*1');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });
});

describe('processUSSDInput — community_detail (M7c)', () => {
  function makeDetailSession(): USSDSession {
    return makeSession('community_detail', {
      communities: COMMUNITIES,
      selectedCommunityId: 'c-1',
      selectedCommunityName: 'Lagos Devs',
    });
  }

  it('returns to community list on "0"', () => {
    const result = processUSSDInput(makeDetailSession(), '5*1*0');
    expect(result.session.state).toBe('community_list');
    expect(result.ended).toBe(false);
  });

  it('ends with announcements message on "1"', () => {
    const result = processUSSDInput(makeDetailSession(), '5*1*1');
    expect(result.text).toMatch(/^END /);
    expect(result.text).toContain('Lagos Devs');
    expect(result.ended).toBe(true);
  });

  it('ends with events message on "2"', () => {
    const result = processUSSDInput(makeDetailSession(), '5*1*2');
    expect(result.text).toMatch(/^END /);
    expect(result.text).toContain('events');
    expect(result.ended).toBe(true);
  });

  it('ends with members message on "3"', () => {
    const result = processUSSDInput(makeDetailSession(), '5*1*3');
    expect(result.text).toMatch(/^END /);
    expect(result.text).toContain('members');
    expect(result.ended).toBe(true);
  });

  it('ends on invalid input', () => {
    const result = processUSSDInput(makeDetailSession(), '5*1*9');
    expect(result.text).toMatch(/^END /);
    expect(result.ended).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// M7c: Legacy community_menu state (backward compatibility)
// ---------------------------------------------------------------------------

describe('processUSSDInput — legacy community_menu state', () => {
  it('handles legacy community_menu state as community_list', () => {
    const session = makeSession('community_menu' as USSDSession['state'], { communities: COMMUNITIES });
    const result = processUSSDInput(session, '5*0');
    expect(result.session.state).toBe('main_menu');
    expect(result.ended).toBe(false);
  });
});
