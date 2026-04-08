/**
 * OTP delivery types for @webwaka/otp (M7a)
 * (docs/governance/otp-delivery-channels.md, docs/governance/security-baseline.md R8/R9)
 */

/** Supported OTP delivery channels (waterfall: sms → whatsapp → telegram → voice) */
export type OTPChannel = 'sms' | 'whatsapp' | 'telegram' | 'email';

/** OTP purpose — governs which channels are allowed (R8) */
export type OTPPurpose =
  | 'login'
  | 'verification'
  | 'transaction'
  | 'kyc_uplift'
  | 'password_reset';

export interface OTPSendResult {
  readonly sent: boolean;
  readonly channel: OTPChannel;
  readonly message_id?: string;
  readonly expires_at: number;
  readonly fallback_used: boolean;
}

export interface PhoneValidationResult {
  readonly valid: boolean;
  readonly normalized: string;  // E.164: +234XXXXXXXXXX
  readonly carrier?: 'mtn' | 'airtel' | 'glo' | '9mobile' | 'unknown';
}

export interface OTPEnv {
  readonly TERMII_API_KEY: string;
  readonly WHATSAPP_ACCESS_TOKEN: string;
  readonly WHATSAPP_PHONE_NUMBER_ID: string;
  readonly TELEGRAM_BOT_TOKEN: string;
  readonly LOG_PII_SALT: string;
  readonly RATE_LIMIT_KV: KVNamespace;
}

export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export class OTPError extends Error {
  constructor(
    readonly code:
      | 'invalid_phone'
      | 'rate_limited'
      | 'channel_locked'
      | 'delivery_failed'
      | 'invalid_channel_for_purpose'
      | 'otp_expired'
      | 'otp_invalid',
    message: string,
  ) {
    super(message);
    this.name = 'OTPError';
  }
}
