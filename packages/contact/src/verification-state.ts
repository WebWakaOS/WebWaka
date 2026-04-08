/**
 * Contact channel verification state helpers (M7a)
 * R10: Each channel verified independently.
 */

import { type ContactChannelRecord } from './types.js';

/**
 * Check if a specific channel type is verified for a user.
 */
export function isChannelVerified(
  channels: readonly ContactChannelRecord[],
  channelType: 'sms' | 'whatsapp' | 'telegram' | 'email',
): boolean {
  return channels.some((c) => c.channel_type === channelType && c.verified);
}

/**
 * Get all verified channels for a user.
 */
export function getVerifiedChannels(
  channels: readonly ContactChannelRecord[],
): ContactChannelRecord[] {
  return channels.filter((c) => c.verified);
}
