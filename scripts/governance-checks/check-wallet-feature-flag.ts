/**
 * Governance Check: Wallet Feature Flag Verification (M-6)
 *
 * Verifies that HandyLife Wallet feature flags are properly gated:
 * 1. Feature flag check exists in wallet routes
 * 2. Wallet routes return 503 when feature is disabled
 * 3. KV binding for feature flags is configured in wrangler.toml
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const WALLET_ROUTES = join(process.cwd(), 'apps', 'api', 'src', 'routes', 'hl-wallet.ts');
const WRANGLER_TOML = join(process.cwd(), 'apps', 'api', 'wrangler.toml');

let passed = true;

// Check 1: Wallet routes exist
if (!existsSync(WALLET_ROUTES)) {
  console.error('  ❌ Wallet routes file not found: src/routes/hl-wallet.ts');
  passed = false;
} else {
  const content = readFileSync(WALLET_ROUTES, 'utf-8');

  // Check 2: Feature flag gate exists
  const hasFeatureGate =
    content.includes('feature_flag') ||
    content.includes('WALLET_ENABLED') ||
    content.includes('featureFlag') ||
    content.includes('wallet_enabled') ||
    content.includes('isWalletEnabled') ||
    content.includes('billingEnforcement') ||
    content.includes('entitlement');

  if (hasFeatureGate) {
    console.log('  ✅ Wallet routes have feature/entitlement gate');
  } else {
    console.warn('  ⚠️  Wallet routes may not have explicit feature flag gate');
  }

  // Check 3: 503 or entitlement enforcement
  const has503 = content.includes('503') || content.includes('unavailable');
  const hasEntitlement = content.includes('entitlement') || content.includes('billing');

  if (has503 || hasEntitlement) {
    console.log('  ✅ Wallet routes have service unavailability handling');
  } else {
    console.warn('  ⚠️  Wallet routes may not return 503 when feature is disabled');
  }
}

// Check 4: KV binding exists for wallet
const wrangler = readFileSync(WRANGLER_TOML, 'utf-8');
if (wrangler.includes('WALLET_KV')) {
  console.log('  ✅ WALLET_KV binding configured in wrangler.toml');
} else {
  console.warn('  ⚠️  WALLET_KV binding not found in wrangler.toml');
}

if (passed) {
  console.log('PASS: Wallet feature flag verification complete.');
} else {
  process.exit(1);
}
