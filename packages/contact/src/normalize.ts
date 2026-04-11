/**
 * Contact channel normalization utilities (M7a)
 * (docs/contact/multi-channel-model.md, docs/governance/otp-delivery-channels.md)
 *
 * Multi-channel UX model: Primary phone → "WhatsApp same?" checkbox → Telegram optional
 */

import { type ContactChannelInput, type ContactChannelUXModel } from './types.js';

const E164_RE = /^\+234\d{10}$/;
const TELEGRAM_RE = /^@?[A-Za-z0-9_]{5,32}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalize raw contact channel inputs into validated ContactChannelInput records.
 * Filters out invalid/empty channels silently.
 *
 * UX model: user provides primary_phone; optionally ticks "WhatsApp same as primary"
 * and/or provides a Telegram handle.
 */
export function normalizeContactChannels(model: ContactChannelUXModel): ContactChannelInput[] {
  const channels: ContactChannelInput[] = [];

  const phone = normalizePhone(model.primary_phone);
  if (phone) {
    channels.push({ channel_type: 'sms', value: phone, is_primary: true });

    if (model.whatsapp_same_as_primary) {
      channels.push({ channel_type: 'whatsapp', value: phone });
    } else if (model.whatsapp_phone) {
      const wa = normalizePhone(model.whatsapp_phone);
      if (wa) channels.push({ channel_type: 'whatsapp', value: wa });
    }
  }

  if (model.telegram_handle) {
    const handle = normalizeTelegramHandle(model.telegram_handle);
    if (handle) channels.push({ channel_type: 'telegram', value: handle });
  }

  return channels;
}

/**
 * Build a partial update object for contact_channels upsert.
 */
export function buildContactChannelUpdate(
  input: ContactChannelInput,
): { channel_type: string; value: string; is_primary: number; updated_at: number } {
  return {
    channel_type: input.channel_type,
    value: input.value,
    is_primary: input.is_primary ? 1 : 0,
    updated_at: Math.floor(Date.now() / 1000),
  };
}

function normalizePhone(raw: string): string | null {
  const stripped = raw.replace(/[\s\-().]/g, '');
  let e164: string;

  if (stripped.startsWith('+234') && stripped.length === 14) {
    e164 = stripped;
  } else if (stripped.startsWith('234') && stripped.length === 13) {
    e164 = '+' + stripped;
  } else if (stripped.startsWith('0') && stripped.length === 11) {
    e164 = '+234' + stripped.slice(1);
  } else {
    return null;
  }

  return E164_RE.test(e164) ? e164 : null;
}

function normalizeTelegramHandle(raw: string): string | null {
  const handle = raw.startsWith('@') ? raw : '@' + raw;
  return TELEGRAM_RE.test(handle) ? handle : null;
}

/** Validate an email address (basic format check) */
export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}
