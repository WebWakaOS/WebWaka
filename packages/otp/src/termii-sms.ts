/**
 * Termii SMS OTP delivery provider (M7a)
 * Primary OTP channel for Nigerian numbers (MTN/GLO/Airtel/9mobile).
 * (docs/identity/otp-channels.md — Primary: Termii)
 * API docs: https://developers.termii.com/messaging
 */

import { type OTPSendResult } from './types.js';

const TERMII_BASE = 'https://api.ng.termii.com/api';

interface TermiiSendResponse {
  message_id: string;
  message: string;
  balance: number;
  user: string;
}

interface TermiiErrorResponse {
  code: string;
  message: string;
}

/**
 * Send an OTP via Termii SMS.
 *
 * @param phone - E.164 normalized Nigerian phone (+234XXXXXXXXXX)
 * @param otp - 6-digit OTP string (not stored after send)
 * @param apiKey - Termii API key (from env.TERMII_API_KEY)
 * @param expiresAt - Unix timestamp when OTP expires
 * @param senderId - Optional SMS sender ID (default: 'WebWaka')
 */
export async function sendSMSOTP(
  phone: string,
  otp: string,
  apiKey: string,
  expiresAt: number,
  senderId = 'WebWaka',
): Promise<OTPSendResult> {
  const message = `Your WebWaka verification code is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;

  const res = await fetch(`${TERMII_BASE}/sms/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: phone,
      from: senderId,
      sms: message,
      type: 'plain',
      api_key: apiKey,
      channel: 'dnd',  // DND route: best delivery on Nigerian networks
    }),
  });

  if (!res.ok) {
    const err = await res.json() as TermiiErrorResponse;
    throw new Error(`Termii SMS failed: ${err.message ?? res.status}`);
  }

  const body = await res.json() as TermiiSendResponse;

  return {
    sent: true,
    channel: 'sms',
    message_id: body.message_id,
    expires_at: expiresAt,
    fallback_used: false,
  };
}
