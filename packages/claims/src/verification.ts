/**
 * Tenant verification helpers for the claim-first onboarding flow.
 * (claim-first-onboarding.md §5)
 *
 * Generates verification tokens and document checklists.
 * Token storage and dispatch is handled by the API layer (not here).
 *
 * Milestone 5 — Claim-First Onboarding
 */

// ---------------------------------------------------------------------------
// Token generation
// ---------------------------------------------------------------------------

const TOKEN_BYTES = 32;

function generateSecureToken(): string {
  const bytes = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export interface EmailVerificationToken {
  email: string;
  token: string;
  expiresAt: number;
}

/**
 * Generate a time-limited email verification token.
 * Expires after 24 hours by default.
 */
export function emailVerificationToken(
  email: string,
  ttlSeconds: number = 86400,
): EmailVerificationToken {
  return {
    email,
    token: generateSecureToken(),
    expiresAt: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
}

export interface PhoneVerificationToken {
  phone: string;
  otp: string;
  expiresAt: number;
}

/**
 * Generate a 6-digit OTP for phone verification.
 * Expires after 10 minutes by default.
 */
export function phoneVerificationToken(
  phone: string,
  ttlSeconds: number = 600,
): PhoneVerificationToken {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  const otp = String(arr[0]! % 1_000_000).padStart(6, '0');

  return {
    phone,
    otp,
    expiresAt: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
}

// ---------------------------------------------------------------------------
// Document checklist
// ---------------------------------------------------------------------------

export interface DocumentChecklistItem {
  id: string;
  label: string;
  required: boolean;
  description: string;
  acceptedFormats: string[];
}

export interface DocumentVerificationChecklist {
  items: DocumentChecklistItem[];
  minRequired: number;
}

/**
 * Return the standard document verification checklist for claim submissions.
 * Documents are uploaded to R2 and referenced by URL in verification_data.
 */
export function documentVerificationChecklist(): DocumentVerificationChecklist {
  return {
    minRequired: 1,
    items: [
      {
        id: 'cac_certificate',
        label: 'CAC Certificate of Incorporation',
        required: false,
        description: 'Corporate Affairs Commission registration document (for organisations)',
        acceptedFormats: ['pdf', 'jpg', 'png'],
      },
      {
        id: 'government_id',
        label: 'Government-Issued ID',
        required: false,
        description: "NIN slip, international passport, driver's licence, or voter card",
        acceptedFormats: ['pdf', 'jpg', 'png'],
      },
      {
        id: 'utility_bill',
        label: 'Proof of Address',
        required: false,
        description: 'Utility bill or bank statement not older than 3 months',
        acceptedFormats: ['pdf', 'jpg', 'png'],
      },
      {
        id: 'official_letter',
        label: 'Official Letter',
        required: false,
        description: 'Letter on official letterhead from the entity confirming the claim',
        acceptedFormats: ['pdf'],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Token validation helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if the token has not expired.
 */
export function isTokenValid(expiresAt: number): boolean {
  return Math.floor(Date.now() / 1000) < expiresAt;
}
