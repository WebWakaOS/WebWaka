/**
 * Telegram OTP delivery via Bot API (M7a)
 * Tertiary OTP channel — used when SMS and WhatsApp both fail.
 * (docs/identity/otp-channels.md — Tertiary: Telegram)
 * R8: Telegram is NOT permitted for transaction-purpose OTPs.
 * Requires user to have started a chat with @WebWakaBot.
 */

import { type OTPSendResult, type OTPPurpose, OTPError } from './types.js';

const TELEGRAM_BASE = 'https://api.telegram.org';

interface TelegramSendResponse {
  ok: boolean;
  result?: { message_id: number };
  description?: string;
}

/**
 * Send an OTP via Telegram Bot API.
 *
 * @param telegramChatId - Telegram chat_id (user's numeric ID or @handle)
 * @param otp - 6-digit OTP string
 * @param purpose - OTP purpose (transaction OTPs NOT allowed — R8)
 * @param botToken - Telegram Bot API token
 * @param expiresAt - Unix timestamp when OTP expires
 */
export async function sendTelegramOTP(
  telegramChatId: string,
  otp: string,
  purpose: OTPPurpose,
  botToken: string,
  expiresAt: number,
): Promise<OTPSendResult> {
  if (purpose === 'transaction' || purpose === 'kyc_uplift') {
    throw new OTPError(
      'invalid_channel_for_purpose',
      `Telegram OTP is not permitted for ${purpose} purposes (R8). Use SMS or WhatsApp.`,
    );
  }

  const text =
    `🔐 *WebWaka Verification Code*\n\n` +
    `Your code: \`${otp}\`\n\n` +
    `Valid for 10 minutes. Do not share this code with anyone.`;

  const res = await fetch(`${TELEGRAM_BASE}/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: telegramChatId,
      text,
      parse_mode: 'Markdown',
    }),
  });

  const body = await res.json() as TelegramSendResponse;

  if (!body.ok) {
    throw new Error(`Telegram OTP failed: ${body.description ?? res.status}`);
  }

  return {
    sent: true,
    channel: 'telegram',
    message_id: String(body.result?.message_id ?? ''),
    expires_at: expiresAt,
    fallback_used: false,
  };
}
