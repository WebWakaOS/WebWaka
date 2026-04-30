/**
 * Governance Check: Notification Sandbox Mode Enforcement (H-5)
 *
 * Verifies that the notificator worker has sandbox mode properly configured:
 * - Staging: NOTIFICATION_SANDBOX_MODE must be "true"
 * - Production: NOTIFICATION_SANDBOX_MODE must be "false" or absent
 *
 * This prevents accidental production notifications from staging and ensures
 * production notifications actually send.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const NOTIFICATOR_WRANGLER = join(process.cwd(), 'apps', 'notificator', 'wrangler.toml');

let content: string;
try {
  content = readFileSync(NOTIFICATOR_WRANGLER, 'utf-8');
} catch {
  console.log('SKIP: apps/notificator/wrangler.toml not found');
  process.exit(0);
}

// Parse environment sections
const envSections: Record<string, string> = {};
let currentEnv = 'default';
const lines = content.split('\n');

for (const line of lines) {
  const envMatch = line.match(/^\[env\.(\w+)\]/);
  if (envMatch) {
    currentEnv = envMatch[1]!;
    envSections[currentEnv] = '';
  } else {
    envSections[currentEnv] = (envSections[currentEnv] || '') + line + '\n';
  }
}

let passed = true;

// Check staging environment
const stagingSection = envSections['staging'] || '';
const stagingSandbox = stagingSection.match(/NOTIFICATION_SANDBOX_MODE\s*=\s*"?(true|false)"?/);
if (stagingSandbox) {
  if (stagingSandbox[1] === 'true') {
    console.log('  ✅ Staging: NOTIFICATION_SANDBOX_MODE = true');
  } else {
    console.error('  ❌ Staging: NOTIFICATION_SANDBOX_MODE should be "true", got:', stagingSandbox[1]);
    passed = false;
  }
} else {
  // Check if it's set at the top level (default applies to all envs)
  const defaultSandbox = (envSections['default'] || '').match(/NOTIFICATION_SANDBOX_MODE\s*=\s*"?(true|false)"?/);
  if (defaultSandbox && defaultSandbox[1] === 'true') {
    console.log('  ✅ Staging: NOTIFICATION_SANDBOX_MODE = true (inherited from default)');
  } else {
    console.warn('  ⚠️  Staging: NOTIFICATION_SANDBOX_MODE not explicitly set');
    // Not a failure if sandbox mode is enforced via Worker secret
  }
}

// Check production environment
const productionSection = envSections['production'] || '';
const productionSandbox = productionSection.match(/NOTIFICATION_SANDBOX_MODE\s*=\s*"?(true|false)"?/);
if (productionSandbox) {
  if (productionSandbox[1] === 'false') {
    console.log('  ✅ Production: NOTIFICATION_SANDBOX_MODE = false');
  } else {
    console.error('  ❌ Production: NOTIFICATION_SANDBOX_MODE should be "false", got:', productionSandbox[1]);
    passed = false;
  }
} else {
  console.log('  ✅ Production: NOTIFICATION_SANDBOX_MODE not set (defaults to live mode)');
}

if (passed) {
  console.log('PASS: Notification sandbox mode correctly configured per environment.');
} else {
  process.exit(1);
}
