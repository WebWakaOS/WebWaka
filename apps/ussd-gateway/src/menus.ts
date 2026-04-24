/**
 * USSD menu text builders.
 * All menus return either:
 *   CON <text>  — continue session (show menu, await input)
 *   END <text>  — terminate session
 *
 * Shortcode: *384#
 *
 * UX-08: All flows are max 3 levels deep from main menu.
 * Send Money uses a combined PHONE*AMOUNT format to keep depth at 2 levels.
 */

/**
 * Main menu — entry point for *384#
 */
export function mainMenu(): string {
  return `CON Welcome to WebWaka
1. My Wallet
2. Send Money
3. Trending Now
4. Book Transport
5. Community`;
}

/**
 * Wallet menu — shows current balance in Naira (converted from kobo).
 * Platform Invariant P9: balanceKobo is always an integer.
 */
export function walletMenu(balanceKobo: number): string {
  const nairaWhole = Math.floor(balanceKobo / 100);
  const koboPart = balanceKobo % 100;
  const balanceFormatted = `${nairaWhole}.${String(koboPart).padStart(2, '0')}`;
  return `CON My Wallet
Balance: \u20A6${balanceFormatted}
1. Top Up Float
2. Transaction History
0. Back`;
}

/**
 * Send money — combined phone and amount entry (UX-08).
 * User enters PHONE*AMOUNT in a single input to flatten from 4→2 levels.
 */
export function sendMoneyEnterPhoneAndAmount(): string {
  return `CON Send Money
Enter phone and amount:
Format: PHONE*AMOUNT
Example: 08012345678*500`;
}

/**
 * Send money — confirm transfer.
 * Level 2 from main menu (3rd interaction total).
 */
export function sendMoneyConfirm(recipient: string, amountDisplay: string): string {
  return `CON Confirm Transfer
To: ${recipient}
Amount: \u20A6${amountDisplay}
1. Confirm
2. Cancel
0. Back`;
}

export interface TrendingPostSnippet {
  id: string;
  snippet: string;
  authorHandle: string;
}

/**
 * Trending feed — top posts list.
 * If posts are provided, display numbered list; otherwise show placeholder.
 */
export function trendingFeed(posts?: TrendingPostSnippet[]): string {
  if (!posts || posts.length === 0) {
    return `CON Trending Now
No trending posts right now.
0. Back`;
  }
  const lines = posts
    .slice(0, 5)
    .map((p, i) => `${i + 1}. ${p.snippet.slice(0, 30)}`);
  return `CON Trending Now\n${lines.join('\n')}\n0. Back`;
}

/**
 * View a single trending post.
 */
export function viewTrendingPost(post: TrendingPostSnippet): string {
  return `CON @${post.authorHandle}:\n${post.snippet.slice(0, 100)}\n\n0. Back to Trending`;
}

/**
 * Transport menu
 */
export function transportMenu(): string {
  return `CON Book Transport
1. Find nearby buses
2. My bookings
0. Back`;
}

export interface CommunityItem {
  id: string;
  name: string;
}

export interface EventItem {
  id: string;
  title: string;
}

/**
 * Community main menu
 */
export function communityMenu(): string {
  return `CON Community
1. Announcements
2. Events
3. Groups
0. Back`;
}

/**
 * Community announcements
 */
export function communityAnnouncements(items?: string[]): string {
  if (!items || items.length === 0) {
    return `CON Announcements
No announcements right now.
0. Back`;
  }
  const lines = items.slice(0, 5).map((s, i) => `${i + 1}. ${s.slice(0, 35)}`);
  return `CON Announcements\n${lines.join('\n')}\n0. Back`;
}

/**
 * Community events list
 */
export function communityEvents(events?: EventItem[]): string {
  if (!events || events.length === 0) {
    return `CON Events
No upcoming events.
0. Back`;
  }
  const lines = events.slice(0, 5).map((e, i) => `${i + 1}. ${e.title.slice(0, 35)}`);
  return `CON Events\n${lines.join('\n')}\n0. Back`;
}

/**
 * Community groups / spaces list
 */
export function communityGroups(groups?: CommunityItem[]): string {
  if (!groups || groups.length === 0) {
    return `CON Groups
No groups available.
0. Back`;
  }
  const lines = groups.slice(0, 5).map((g, i) => `${i + 1}. ${g.name.slice(0, 35)}`);
  return `CON Groups\n${lines.join('\n')}\n0. Back`;
}

/**
 * End a session with a message.
 */
export function endSession(message: string): string {
  return `END ${message}`;
}
