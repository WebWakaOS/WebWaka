/**
 * USSD menu text builders.
 * All menus return either:
 *   CON <text>  — continue session (show menu, await input)
 *   END <text>  — terminate session
 *
 * Shortcode: *384#
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
  // Integer division — no floating point (P9)
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
 * Send money — enter recipient phone
 */
export function sendMoneyEnterRecipient(): string {
  return `CON Send Money
Enter recipient phone number:`;
}

/**
 * Send money — enter amount
 */
export function sendMoneyEnterAmount(recipient: string): string {
  return `CON Send Money to ${recipient}
Enter amount in Naira:`;
}

/**
 * Send money — confirm
 */
export function sendMoneyConfirm(recipient: string, amountNaira: string): string {
  return `CON Confirm Transfer
To: ${recipient}
Amount: \u20A6${amountNaira}
1. Confirm
2. Cancel`;
}

/**
 * Trending feed — top 5 social posts from DB.
 * Branch 3: *384*3# (M7c)
 * Posts: [{ handle, content }] — content truncated to 40 chars.
 */
export interface TrendingPost {
  handle: string;
  content: string;
}

export function trendingFeed(posts?: TrendingPost[]): string {
  if (!posts || posts.length === 0) {
    return `CON Trending Now
No trending posts yet.
0. Back`;
  }
  const lines = posts
    .slice(0, 5)
    .map((p, i) => `${i + 1}. @${p.handle}: ${p.content.slice(0, 40)}`);
  return `CON Trending Now\n${lines.join('\n')}\n0. Back`;
}

/**
 * Trending post detail — shows full post and like option.
 */
export function trendingPostDetail(post: TrendingPost): string {
  return `CON @${post.handle}\n${post.content.slice(0, 160)}
1. Like
0. Back`;
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

/**
 * Community list — shows communities user is a member of.
 * Branch 5: *384*5# (M7c)
 */
export interface CommunityItem {
  id: string;
  name: string;
}

export function communityListMenu(communities?: CommunityItem[]): string {
  if (!communities || communities.length === 0) {
    return `CON My Communities
You have no communities yet.
0. Back`;
  }
  const lines = communities
    .slice(0, 5)
    .map((c, i) => `${i + 1}. ${c.name}`);
  return `CON My Communities\n${lines.join('\n')}\n0. Back`;
}

/**
 * Community detail — options for a selected community.
 */
export function communityDetailMenu(name: string): string {
  return `CON ${name.slice(0, 30)}
1. Announcements
2. Upcoming Events
3. Members
0. Back`;
}

/**
 * Community announcements — latest 3 posts.
 */
export interface AnnouncementPost {
  title: string | null;
  content: string;
}

export function communityAnnouncementsMenu(posts: AnnouncementPost[]): string {
  if (posts.length === 0) {
    return `CON Announcements
No announcements yet.
0. Back`;
  }
  const lines = posts
    .slice(0, 3)
    .map((p, i) => `${i + 1}. ${(p.title ?? p.content).slice(0, 50)}`);
  return `CON Announcements\n${lines.join('\n')}\n0. Back`;
}

/**
 * Legacy communityMenu — kept for backward compatibility.
 */
export function communityMenu(): string {
  return communityListMenu();
}

/**
 * End a session with a message.
 */
export function endSession(message: string): string {
  return `END ${message}`;
}
