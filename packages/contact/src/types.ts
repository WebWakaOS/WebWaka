/**
 * Contact channel types for @webwaka/contact (M7a)
 * (docs/contact/multi-channel-model.md)
 *
 * R10: Each channel is verified independently.
 */

export type OTPPreference = 'sms' | 'whatsapp' | 'telegram';
export type NotificationPreference = 'sms' | 'whatsapp' | 'telegram' | 'email';

/** A single contact channel row from contact_channels table */
export interface ContactChannelRecord {
  readonly id: string;
  readonly user_id: string;
  readonly channel_type: 'sms' | 'whatsapp' | 'telegram' | 'email';
  readonly value: string;  // E.164 phone / telegram handle / email
  readonly is_primary: boolean;
  readonly verified: boolean;
  readonly verified_at?: number;
  readonly created_at: number;
  readonly updated_at: number;
}

/** Input for creating or updating a contact channel */
export interface ContactChannelInput {
  readonly channel_type: 'sms' | 'whatsapp' | 'telegram' | 'email';
  readonly value: string;
  readonly is_primary?: boolean;
}

/** Target for OTP delivery after channel resolution */
export interface OTPContactTarget {
  readonly channel: 'sms' | 'whatsapp' | 'telegram';
  readonly identifier: string;
  readonly is_verified: boolean;
}

/** Multi-channel UX model: Primary phone → "WhatsApp same?" → Telegram optional */
export interface ContactChannelUXModel {
  readonly primary_phone: string;
  /** true = WhatsApp uses same number as primary_phone */
  readonly whatsapp_same_as_primary: boolean;
  readonly whatsapp_phone?: string;
  readonly telegram_handle?: string;
  readonly otp_preference: OTPPreference;
}
