/**
 * Generate staging smoke test JWT tokens for k6 load testing.
 *
 * Usage:
 *   node infra/k6/generate-smoke-jwt.mjs
 *
 * Environment:
 *   JWT_SECRET — The JWT signing secret (from GitHub secrets in CI)
 *
 * Outputs:
 *   SMOKE_JWT — Standard user token (role: member)
 *   SMOKE_SUPER_ADMIN_JWT — Super admin token (role: super_admin)
 *
 * Tokens are short-lived (1 hour) and scoped to a test workspace/tenant.
 */

import { createHmac } from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is required');
  process.exit(1);
}

function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function signJwt(payload, secret) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;
  const signature = createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return `${signingInput}.${signature}`;
}

const now = Math.floor(Date.now() / 1000);
const expiresIn = 3600; // 1 hour — sufficient for a 30s k6 run

// Standard user token (smoke test workspace)
const userPayload = {
  sub: 'usr_smoke_test_001',
  workspace_id: 'ws_smoke_test_staging',
  tenant_id: 'tnt_smoke_test_staging',
  role: 'member',
  iat: now,
  exp: now + expiresIn,
};

// Super admin token
const superAdminPayload = {
  sub: 'usr_smoke_super_admin',
  workspace_id: 'ws_platform_admin',
  tenant_id: 'tnt_platform',
  role: 'super_admin',
  iat: now,
  exp: now + expiresIn,
};

const smokeJwt = signJwt(userPayload, JWT_SECRET);
const superAdminJwt = signJwt(superAdminPayload, JWT_SECRET);

// Output as environment-variable-compatible format for GitHub Actions
// Use >> $GITHUB_OUTPUT in the workflow step
console.log(`SMOKE_JWT=${smokeJwt}`);
console.log(`SMOKE_SUPER_ADMIN_JWT=${superAdminJwt}`);
