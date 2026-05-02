#!/usr/bin/env node
/**
 * Pre-flight: JWT_SECRET_STAGING provisioned? (Wave 3 C5-1)
 *
 * Called by the k6-smoke CI job BEFORE generating JWTs.
 * Exits 0 with a warning if secret is missing (non-blocking — k6 is continue-on-error).
 * Exits 1 only if the secret is present but malformed (< 32 chars).
 *
 * Ops action: provision JWT_SECRET_STAGING in GitHub Actions secrets.
 * See PRODUCTION_READINESS_BACKLOG.md § C-1 for step-by-step instructions.
 */

const secret = process.env.JWT_SECRET;

if (!secret) {
  console.warn('WARN: JWT_SECRET_STAGING is not provisioned in GitHub Actions secrets.');
  console.warn('      k6 authenticated endpoint checks will be skipped.');
  console.warn('      See PRODUCTION_READINESS_BACKLOG.md § C-1 for provisioning steps.');
  console.warn('      This is non-blocking — provision the secret to enable full k6 coverage.');
  process.exit(0); // Non-blocking — k6 job is continue-on-error
}

if (secret.length < 32) {
  console.error('ERROR: JWT_SECRET_STAGING is too short (< 32 chars). Possible misconfiguration.');
  process.exit(1);
}

console.log('OK: JWT_SECRET_STAGING is provisioned and looks valid.');
process.exit(0);
