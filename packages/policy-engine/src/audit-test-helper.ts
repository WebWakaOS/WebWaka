/**
 * Test-only helper — exposes the context redaction function for unit tests.
 * NOT exported from the main package index.
 */
import type { PolicyContext } from './types.js';

const PII_FIELDS = new Set([
  'donorPhone',
  'phoneNumber',
  'nin',
  'bvn',
  'voterRef',
  'voter_ref',
  'email',
]);

export function redactContextForTest(ctx: PolicyContext): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(ctx)) {
    out[k] = PII_FIELDS.has(k) ? '[REDACTED]' : v;
  }
  return out;
}
