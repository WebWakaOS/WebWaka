/**
 * Contact channel OTP preference resolver (M7a)
 * (docs/contact/otp-routing.md, docs/governance/security-baseline.md R8/R10)
 *
 * Determines the preferred OTP channel from a user's verified contact channels.
 */

import { type ContactChannelRecord, type OTPPreference, type OTPContactTarget } from './types.js';

/**
 * Get the preferred OTP channel identifier from a list of contact channel records.
 * Returns the user's preference if that channel is verified; falls back to SMS.
 *
 * R10: Only verified channels are returned.
 */
export function getPreferredOTPChannel(
  channels: readonly ContactChannelRecord[],
  preference: OTPPreference = 'sms',
): OTPContactTarget | null {
  const verified = channels.filter((c) => c.verified && c.channel_type !== 'email');

  const preferred = verified.find((c) => c.channel_type === preference);
  if (preferred) {
    return { channel: preferred.channel_type as 'sms' | 'whatsapp' | 'telegram', identifier: preferred.value, is_verified: true };
  }

  const sms = verified.find((c) => c.channel_type === 'sms');
  if (sms) {
    return { channel: 'sms', identifier: sms.value, is_verified: true };
  }

  const whatsapp = verified.find((c) => c.channel_type === 'whatsapp');
  if (whatsapp) {
    return { channel: 'whatsapp', identifier: whatsapp.value, is_verified: true };
  }

  return null;
}

/**
 * Resolve all contact channels for OTP delivery (ordered by preference).
 * Returns unverified channels too (for initial verification flow).
 */
export function resolveContactForOTP(
  channels: readonly ContactChannelRecord[],
  preference: OTPPreference = 'sms',
): OTPContactTarget[] {
  const targets: OTPContactTarget[] = [];
  const seen = new Set<string>();

  const orderedTypes: Array<'sms' | 'whatsapp' | 'telegram'> =
    preference === 'whatsapp' ? ['whatsapp', 'sms', 'telegram']
    : preference === 'telegram' ? ['telegram', 'sms', 'whatsapp']
    : ['sms', 'whatsapp', 'telegram'];

  for (const type of orderedTypes) {
    const ch = channels.find((c) => c.channel_type === type);
    if (ch && !seen.has(ch.value)) {
      seen.add(ch.value);
      targets.push({ channel: type, identifier: ch.value, is_verified: ch.verified });
    }
  }

  return targets;
}
