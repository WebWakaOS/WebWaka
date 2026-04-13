/**
 * SEC-09: Password complexity validation.
 *
 * Enforces minimum security requirements for user passwords:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 digit
 * - At least 1 special character
 *
 * Used at registration and password-change endpoints.
 */

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePasswordComplexity(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter.');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one digit.');
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    errors.push('Password must contain at least one special character.');
  }

  return { valid: errors.length === 0, errors };
}
