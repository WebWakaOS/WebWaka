/**
 * @webwaka/contact — Multi-channel contact management (M7a)
 * (docs/contact/multi-channel-model.md, docs/contact/contact-verification.md)
 *
 * Manages: phone (SMS), WhatsApp, Telegram, email — each verified independently (R10).
 * Provides: channel normalization, OTP routing preference, verification state.
 *
 * Usage:
 *   import { normalizeContactChannels, getPreferredOTPChannel, isChannelVerified } from '@webwaka/contact';
 */

export { normalizeContactChannels, buildContactChannelUpdate } from './normalize.js';
export { getPreferredOTPChannel, resolveContactForOTP } from './channel-resolver.js';
export { isChannelVerified, getVerifiedChannels } from './verification-state.js';

export type {
  OTPPreference,
  NotificationPreference,
  ContactChannelRecord,
  ContactChannelInput,
  OTPContactTarget,
} from './types.js';
