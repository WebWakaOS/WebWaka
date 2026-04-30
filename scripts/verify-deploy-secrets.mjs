/**
 * Pre-Deploy Secret Validation Script (C-3)
 *
 * Verifies that all required Cloudflare Worker secrets are provisioned
 * BEFORE deploying to production. Fails fast if any required secret is missing.
 *
 * Usage (in CI):
 *   node scripts/verify-deploy-secrets.mjs
 *
 * Environment:
 *   CLOUDFLARE_ACCOUNT_ID — CF account
 *   CLOUDFLARE_API_TOKEN — CF API token with Worker read permissions
 *   DEPLOY_ENV — 'staging' or 'production'
 *
 * Secrets are checked against the manifest in this file.
 * The check verifies secrets EXIST (not their values) using the Cloudflare API.
 */

const DEPLOY_ENV = process.env.DEPLOY_ENV || 'staging';
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
  console.error('ERROR: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required');
  process.exit(1);
}

// ── Required secrets per worker ──────────────────────────────────────────────
// Source: wrangler.toml comment blocks + deploy workflow analysis

const WORKER_SECRETS = {
  'webwaka-api': {
    required: [
      'JWT_SECRET',
      'INTER_SERVICE_SECRET',
      'PAYSTACK_SECRET_KEY',
      'PREMBLY_API_KEY',
      'TERMII_API_KEY',
      'WHATSAPP_ACCESS_TOKEN',
      'WHATSAPP_PHONE_NUMBER_ID',
      'TELEGRAM_BOT_TOKEN',
      'LOG_PII_SALT',
      'DM_MASTER_KEY',
      'PRICE_LOCK_SECRET',
    ],
    optional: [
      'SLACK_WEBHOOK_URL', // Alerting — non-blocking if missing
    ],
  },
  'webwaka-ussd-gateway': {
    required: [
      'INTER_SERVICE_SECRET',
    ],
    optional: [],
  },
  'webwaka-notificator': {
    required: [
      'INTER_SERVICE_SECRET',
      'TERMII_API_KEY',
    ],
    optional: [
      'SLACK_WEBHOOK_URL',
    ],
  },
};

// ── API call to list secrets for a worker ────────────────────────────────────

async function listWorkerSecrets(workerName) {
  const scriptName = DEPLOY_ENV === 'production' ? workerName : `${workerName}-staging`;
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/workers/scripts/${scriptName}/secrets`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    // Worker might not be deployed yet — treat as no secrets
    if (res.status === 404) {
      console.warn(`  ⚠ Worker '${scriptName}' not found (not deployed yet?)`);
      return [];
    }
    const text = await res.text();
    throw new Error(`CF API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(`CF API returned error: ${JSON.stringify(data.errors)}`);
  }

  return data.result.map((s) => s.name);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔐 Verifying secrets for ${DEPLOY_ENV} deployment...\n`);

  let totalRequired = 0;
  let totalMissing = 0;
  const failures = [];

  for (const [worker, config] of Object.entries(WORKER_SECRETS)) {
    console.log(`  📦 ${worker}:`);

    let existingSecrets;
    try {
      existingSecrets = await listWorkerSecrets(worker);
    } catch (err) {
      console.error(`    ❌ Failed to query secrets: ${err.message}`);
      failures.push(`${worker}: API query failed`);
      continue;
    }

    for (const secret of config.required) {
      totalRequired++;
      if (existingSecrets.includes(secret)) {
        console.log(`    ✅ ${secret}`);
      } else {
        totalMissing++;
        console.error(`    ❌ ${secret} — MISSING`);
        failures.push(`${worker}: ${secret}`);
      }
    }

    for (const secret of config.optional) {
      if (existingSecrets.includes(secret)) {
        console.log(`    ✅ ${secret} (optional)`);
      } else {
        console.log(`    ⚠️  ${secret} (optional, not set)`);
      }
    }
    console.log('');
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('─'.repeat(60));
  console.log(`Total required secrets: ${totalRequired}`);
  console.log(`Provisioned: ${totalRequired - totalMissing}`);
  console.log(`Missing: ${totalMissing}`);

  if (failures.length > 0) {
    console.error(`\n❌ FAIL: ${failures.length} required secret(s) not provisioned:`);
    for (const f of failures) {
      console.error(`   • ${f}`);
    }
    console.error('\nProvision missing secrets with:');
    console.error(`  echo "VALUE" | wrangler secret put SECRET_NAME --env ${DEPLOY_ENV}`);
    process.exit(1);
  } else {
    console.log('\n✅ PASS: All required secrets are provisioned.');
  }
}

main().catch((err) => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
