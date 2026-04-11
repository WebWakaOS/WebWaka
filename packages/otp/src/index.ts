/**
 * @webwaka/otp — Multi-channel OTP delivery (M7a)
 *
 * Implements the OTP delivery waterfall:
 *   SMS (Termii) → WhatsApp (Meta v18) → Telegram Bot → [Voice]
 *
 * R8: Transaction OTPs MUST use SMS. Telegram NOT allowed for transactions.
 * R9: Channel-level rate limiting (KV-backed sliding window).
 * R10: Each channel is verified independently.
 *
 * Usage:
 *   import { sendMultiChannelOTP, verifyOTPHash, validateNigerianPhone } from '@webwaka/otp';
 */

export { sendMultiChannelOTP, verifyOTPHash, lockChannelAfterFailures } from './multi-channel.js';
export { sendSMSOTP } from './termii-sms.js';
export { sendWhatsAppOTP } from './whatsapp-meta.js';
export { sendTelegramOTP } from './telegram-bot.js';
export { resolveOTPChannels, rateLimitKey, lockKey, CHANNEL_RATE_LIMITS, lockDurationSeconds } from './channel-router.js';
export { validateNigerianPhone } from './phone-validator.js';
export { generateOTP, hashOTP, otpExpiresAt, isOTPExpired, OTP_TTL_SECONDS } from './otp-generator.js';

export type {
  OTPChannel,
  OTPPurpose,
  OTPSendResult,
  PhoneValidationResult,
  OTPEnv,
  KVNamespace,
} from './types.js';

export { OTPError } from './types.js';
