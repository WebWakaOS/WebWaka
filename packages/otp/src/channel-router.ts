/**
 * OTP channel router — governs waterfall delivery (M7a)
 * (docs/governance/security-baseline.md R8, docs/governance/otp-delivery-channels.md)
 *
 * Waterfall: SMS (primary) → WhatsApp (secondary) → Telegram (tertiary) → Voice (accessibility)
 *
 * R8: Transaction OTPs MUST start with SMS. Telegram NEVER for transactions.
 * R9: Channel-level rate limiting enforced before delivery attempt.
 * R10: Each channel is verified independently.
 */

import { type OTPChannel, type OTPPurpose } from './types.js';

interface ContactInfo {
  readonly phone?: string;
  readonly whatsapp?: string;
  readonly telegram?: string;
  readonly email?: string;
  readonly otp_preference?: OTPChannel;
}

interface ChannelConfig {
  readonly channel: OTPChannel;
  readonly identifier: string;
}

/**
 * Determine the ordered list of channels to attempt for OTP delivery.
 * Returns channels in priority order (first = primary attempt).
 *
 * R8: transaction purpose forces SMS first, blocks Telegram.
 * R8: kyc_uplift forces SMS first, blocks Telegram.
 */
export function resolveOTPChannels(
  contact: ContactInfo,
  purpose: OTPPurpose,
): ChannelConfig[] {
  const channels: ChannelConfig[] = [];

  const isTransactionLike = purpose === 'transaction' || purpose === 'kyc_uplift';

  if (isTransactionLike) {
    if (contact.phone) channels.push({ channel: 'sms', identifier: contact.phone });
    if (contact.whatsapp) channels.push({ channel: 'whatsapp', identifier: contact.whatsapp });
    return channels;
  }

  const preference = contact.otp_preference ?? 'sms';

  if (preference === 'whatsapp' && contact.whatsapp) {
    channels.push({ channel: 'whatsapp', identifier: contact.whatsapp });
    if (contact.phone) channels.push({ channel: 'sms', identifier: contact.phone });
  } else if (preference === 'telegram' && contact.telegram) {
    // CBN compliance (CBN-10): Telegram must NEVER be the first/primary channel for any purpose.
    // Even when user preference is telegram, attempt SMS and WhatsApp first.
    if (contact.phone) channels.push({ channel: 'sms', identifier: contact.phone });
    if (contact.whatsapp) channels.push({ channel: 'whatsapp', identifier: contact.whatsapp });
    channels.push({ channel: 'telegram', identifier: contact.telegram });
  } else {
    if (contact.phone) channels.push({ channel: 'sms', identifier: contact.phone });
    if (contact.whatsapp) channels.push({ channel: 'whatsapp', identifier: contact.whatsapp });
    if (contact.telegram) channels.push({ channel: 'telegram', identifier: contact.telegram });
  }

  return channels;
}

/**
 * Rate limit key for a given channel + identifier pair.
 * Pattern: rate:otp:{channel}:{identifier}
 */
export function rateLimitKey(channel: OTPChannel, identifier: string): string {
  return `rate:otp:${channel}:${identifier}`;
}

/**
 * Lock key for a channel that has exceeded failed attempt threshold.
 * Pattern: lock:otp:{channel}:{identifier}
 */
export function lockKey(channel: OTPChannel, identifier: string): string {
  return `lock:otp:${channel}:${identifier}`;
}

/** Max OTP sends per hour per channel identifier (R9) */
export const CHANNEL_RATE_LIMITS: Record<OTPChannel, number> = {
  sms: 5,
  whatsapp: 5,
  telegram: 3,
  email: 3,
};

/** Lock duration after 3 failed OTP attempts (seconds) (R9) */
export function lockDurationSeconds(purpose: OTPPurpose): number {
  return purpose === 'transaction' ? 3600 : 1800;
}
