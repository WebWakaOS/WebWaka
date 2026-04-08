/**
 * USSD input processor — routes input to correct handler based on session state.
 *
 * Africa's Talking encodes the full navigation path as pipe-separated values:
 *   text=""        → fresh session (empty string)
 *   text="1"       → selected option 1 from main menu
 *   text="1*2"     → from main menu → option 1 → option 2
 *
 * This processor uses session.state (not the full path) to drive the menu FSM.
 *
 * M7c additions:
 *   trending_feed        — shows top 5 posts from social_posts (Branch 3)
 *   trending_post_detail — shows a single post detail with like option
 *   community_list       — shows communities user is member of (Branch 5)
 *   community_detail     — shows selected community: announcements, events, members
 */

import type { USSDSession } from './session.js';
import {
  mainMenu,
  walletMenu,
  sendMoneyEnterRecipient,
  sendMoneyEnterAmount,
  sendMoneyConfirm,
  trendingFeed,
  trendingPostDetail,
  transportMenu,
  communityListMenu,
  communityDetailMenu,
  endSession,
  type TrendingPost,
  type CommunityItem,
} from './menus.js';

export interface ProcessResult {
  text: string;
  session: USSDSession;
  ended: boolean;
}

/**
 * Get the last user input from the full pipe-delimited text.
 * text="1*2*500" → lastInput="500"
 * text="" → lastInput=""
 */
function lastInput(text: string): string {
  if (!text) return '';
  const parts = text.split('*');
  return parts[parts.length - 1] ?? '';
}

/**
 * Process USSD input for the current session state.
 * Returns the response text and the updated session.
 *
 * Note: trending posts and community lists are pre-fetched by the route handler
 * and stored in session.data before this function is called.
 */
export function processUSSDInput(session: USSDSession, text: string): ProcessResult {
  const input = lastInput(text);
  const updatedSession: USSDSession = { ...session, data: { ...session.data } };

  switch (session.state) {
    case 'main_menu':
      return handleMainMenu(updatedSession, input);

    case 'wallet_menu':
      return handleWalletMenu(updatedSession, input);

    case 'send_money_enter_recipient':
      return handleEnterRecipient(updatedSession, input);

    case 'send_money_enter_amount':
      return handleEnterAmount(updatedSession, input);

    case 'send_money_confirm':
      return handleSendMoneyConfirm(updatedSession, input);

    case 'trending_feed':
      return handleTrendingFeed(updatedSession, input);

    case 'trending_post_detail':
      return handleTrendingPostDetail(updatedSession, input);

    case 'transport_menu':
      return handleTransportMenu(updatedSession, input);

    case 'community_list':
      return handleCommunityList(updatedSession, input);

    case 'community_detail':
      return handleCommunityDetail(updatedSession, input);

    // Legacy state — redirects to community_list
    case 'community_menu':
      return handleCommunityList(updatedSession, input);

    default:
      return {
        text: endSession('Invalid session state. Please dial *384# again.'),
        session: updatedSession,
        ended: true,
      };
  }
}

function handleMainMenu(session: USSDSession, input: string): ProcessResult {
  if (!input) {
    return { text: mainMenu(), session: { ...session, state: 'main_menu' }, ended: false };
  }
  switch (input) {
    case '1':
      return {
        text: walletMenu(0), // Balance fetched from DB in route handler
        session: { ...session, state: 'wallet_menu' },
        ended: false,
      };
    case '2':
      return {
        text: sendMoneyEnterRecipient(),
        session: { ...session, state: 'send_money_enter_recipient' },
        ended: false,
      };
    case '3':
      // Trending posts pre-fetched by route handler and stored in session.data.trendingPosts
      return {
        text: trendingFeed(session.data['trendingPosts'] as TrendingPost[] | undefined),
        session: { ...session, state: 'trending_feed' },
        ended: false,
      };
    case '4':
      return {
        text: transportMenu(),
        session: { ...session, state: 'transport_menu' },
        ended: false,
      };
    case '5':
      // Community list pre-fetched by route handler and stored in session.data.communities
      return {
        text: communityListMenu(session.data['communities'] as CommunityItem[] | undefined),
        session: { ...session, state: 'community_list' },
        ended: false,
      };
    default:
      return {
        text: endSession('Invalid selection. Dial *384# to try again.'),
        session,
        ended: true,
      };
  }
}

function handleWalletMenu(session: USSDSession, input: string): ProcessResult {
  switch (input) {
    case '1':
      return { text: endSession('Contact your supervisor to top up your float.'), session, ended: true };
    case '2':
      return { text: endSession('Transaction history not available on USSD. Use the app.'), session, ended: true };
    case '0':
      return { text: mainMenu(), session: { ...session, state: 'main_menu' }, ended: false };
    default:
      return { text: endSession('Invalid selection.'), session, ended: true };
  }
}

function handleEnterRecipient(session: USSDSession, input: string): ProcessResult {
  if (!input || input.length < 10) {
    return { text: endSession('Invalid phone number. Please try again.'), session, ended: true };
  }
  return {
    text: sendMoneyEnterAmount(input),
    session: { ...session, state: 'send_money_enter_amount', data: { ...session.data, recipient: input } },
    ended: false,
  };
}

function handleEnterAmount(session: USSDSession, input: string): ProcessResult {
  const amount = parseFloat(input);
  if (isNaN(amount) || amount <= 0) {
    return { text: endSession('Invalid amount. Please try again.'), session, ended: true };
  }
  const recipient = session.data['recipient'] ?? 'Unknown';
  return {
    text: sendMoneyConfirm(String(recipient), input),
    session: { ...session, state: 'send_money_confirm', data: { ...session.data, amount: input } },
    ended: false,
  };
}

function handleSendMoneyConfirm(session: USSDSession, input: string): ProcessResult {
  if (input === '1') {
    const recipient = session.data['recipient'] ?? 'Unknown';
    const amount = session.data['amount'] ?? '0';
    return {
      text: endSession(`Transfer of \u20A6${amount} to ${recipient} initiated. Check the app for status.`),
      session,
      ended: true,
    };
  }
  if (input === '2') {
    return { text: endSession('Transfer cancelled.'), session, ended: true };
  }
  return { text: endSession('Invalid selection.'), session, ended: true };
}

/**
 * Trending feed handler — Branch 3 (*384*3#).
 * User selects 1-5 to view a post, 0 to go back.
 */
function handleTrendingFeed(session: USSDSession, input: string): ProcessResult {
  if (input === '0') {
    return { text: mainMenu(), session: { ...session, state: 'main_menu' }, ended: false };
  }

  const posts = session.data['trendingPosts'] as TrendingPost[] | undefined;
  const index = parseInt(input, 10) - 1;

  if (!posts || index < 0 || index >= posts.length) {
    return { text: endSession('Invalid selection.'), session, ended: true };
  }

  const selected = posts[index];
  if (!selected) {
    return { text: endSession('Post not found.'), session, ended: true };
  }

  return {
    text: trendingPostDetail(selected),
    session: {
      ...session,
      state: 'trending_post_detail',
      data: { ...session.data, selectedPostIndex: index },
    },
    ended: false,
  };
}

/**
 * Trending post detail handler — like or go back.
 */
function handleTrendingPostDetail(session: USSDSession, input: string): ProcessResult {
  if (input === '0') {
    const posts = session.data['trendingPosts'] as TrendingPost[] | undefined;
    return {
      text: trendingFeed(posts),
      session: { ...session, state: 'trending_feed' },
      ended: false,
    };
  }
  if (input === '1') {
    return { text: endSession('Post liked! Open the WebWaka app to see your feed.'), session, ended: true };
  }
  return { text: endSession('Invalid selection.'), session, ended: true };
}

function handleTransportMenu(session: USSDSession, input: string): ProcessResult {
  if (input === '0') {
    return { text: mainMenu(), session: { ...session, state: 'main_menu' }, ended: false };
  }
  return { text: endSession('Transport booking coming soon.'), session, ended: true };
}

/**
 * Community list handler — Branch 5 (*384*5#).
 * Shows list of communities the user belongs to.
 * User selects 1-5 to view community detail, 0 to go back.
 */
function handleCommunityList(session: USSDSession, input: string): ProcessResult {
  if (input === '0') {
    return { text: mainMenu(), session: { ...session, state: 'main_menu' }, ended: false };
  }

  const communities = session.data['communities'] as CommunityItem[] | undefined;
  const index = parseInt(input, 10) - 1;

  if (!communities || index < 0 || index >= communities.length) {
    return { text: endSession('Invalid selection.'), session, ended: true };
  }

  const selected = communities[index];
  if (!selected) {
    return { text: endSession('Community not found.'), session, ended: true };
  }

  return {
    text: communityDetailMenu(selected.name),
    session: {
      ...session,
      state: 'community_detail',
      data: { ...session.data, selectedCommunityId: selected.id, selectedCommunityName: selected.name },
    },
    ended: false,
  };
}

/**
 * Community detail handler — show announcements, events, or members.
 */
function handleCommunityDetail(session: USSDSession, input: string): ProcessResult {
  if (input === '0') {
    const communities = session.data['communities'] as CommunityItem[] | undefined;
    return {
      text: communityListMenu(communities),
      session: { ...session, state: 'community_list' },
      ended: false,
    };
  }

  const communityName = String(session.data['selectedCommunityName'] ?? 'Community');
  const communityId = String(session.data['selectedCommunityId'] ?? '');

  switch (input) {
    case '1':
      return {
        text: endSession(`Latest announcements for ${communityName} are on the app. Open WebWaka to read.`),
        session,
        ended: true,
      };
    case '2':
      return {
        text: endSession(`Upcoming events for ${communityName} are on the app. Open WebWaka to RSVP. ID: ${communityId.slice(0, 8)}`),
        session,
        ended: true,
      };
    case '3':
      return {
        text: endSession(`View all members of ${communityName} in the WebWaka app.`),
        session,
        ended: true,
      };
    default:
      return { text: endSession('Invalid selection.'), session, ended: true };
  }
}
