/**
 * Cryptographically secure OTP generation and hashing (M7a)
 * Uses crypto.getRandomValues (Web Crypto — available in Cloudflare Workers)
 * R7: OTP hash stored, never the raw value.
 */

export const OTP_LENGTH = 6;
export const OTP_TTL_SECONDS = 300;  // 5 minutes (CBN R14 maximum)

/**
 * Generate a cryptographically secure 6-digit OTP.
 * Uses rejection sampling to avoid modulo bias.
 */
export function generateOTP(): string {
  const arr = new Uint32Array(1);
  let otp: number;
  do {
    crypto.getRandomValues(arr);
    otp = arr[0]! % 1_000_000;
  } while (otp < 0);
  return String(otp).padStart(OTP_LENGTH, '0');
}

/**
 * Hash an OTP for safe storage in otp_log.
 * R7: SHA-256(PLATFORM_SALT + otp)
 */
export async function hashOTP(salt: string, otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + otp);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compute the Unix timestamp at which an OTP expires.
 */
export function otpExpiresAt(ttlSeconds: number = OTP_TTL_SECONDS): number {
  return Math.floor(Date.now() / 1000) + ttlSeconds;
}

/**
 * Check whether an OTP (by its expiry timestamp) has expired.
 */
export function isOTPExpired(expiresAt: number): boolean {
  return Math.floor(Date.now() / 1000) >= expiresAt;
}
