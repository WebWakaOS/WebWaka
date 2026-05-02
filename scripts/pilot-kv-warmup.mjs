#!/usr/bin/env node
/**
 * WebWaka OS — Pilot Cohort 1 KV Feature Flag Warm-Up
 * Release Gate G9-3
 *
 * Sets wallet feature flags in Cloudflare KV for all cohort_1 pilot tenants.
 * Must be run once after migration 0463 is applied to production D1.
 *
 * Usage:
 *   CLOUDFLARE_ACCOUNT_ID=<id> \
 *   CLOUDFLARE_API_TOKEN=<token> \
 *   KV_NAMESPACE_ID=<namespace_id> \
 *   node scripts/pilot-kv-warmup.mjs
 *
 * Optional overrides:
 *   DRY_RUN=1   — print what would be written but don't write to KV
 *   COHORT=cohort_1   — which cohort to warm up (default: cohort_1)
 *
 * KV key format: feature_flag:<tenant_id>:<flag_name>
 * KV value:      "1" (enabled) or "0" (disabled)
 *
 * Flags set per cohort_1 tenant:
 *   - ai_chat_beta          → "1"
 *   - superagent_proactive  → "1"
 *   - wallet_pilot          → "1"
 */

const ACCOUNT_ID  = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN   = process.env.CLOUDFLARE_API_TOKEN;
const NS_ID       = process.env.KV_NAMESPACE_ID;
const DRY_RUN     = process.env.DRY_RUN === '1';
const COHORT      = process.env.COHORT ?? 'cohort_1';

if (!ACCOUNT_ID || !API_TOKEN || !NS_ID) {
  console.error('ERROR: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and KV_NAMESPACE_ID are required.');
  process.exit(1);
}

// Cohort 1 pilot tenants — must match 0463_pilot_cohort1_seed.sql
const COHORT_1_TENANTS = [
  'tenant_pilot_c1_001',
  'tenant_pilot_c1_002',
  'tenant_pilot_c1_003',
  'tenant_pilot_c1_004',
  'tenant_pilot_c1_005',
];

const PILOT_FLAGS = [
  'ai_chat_beta',
  'superagent_proactive',
  'wallet_pilot',
];

const KV_BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NS_ID}`;

async function kvPut(key, value) {
  if (DRY_RUN) {
    console.log(`  [DRY_RUN] PUT ${key} = "${value}"`);
    return;
  }
  const res = await fetch(`${KV_BASE}/values/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'text/plain',
    },
    body: value,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`KV PUT failed for "${key}": ${res.status} ${body}`);
  }
}

async function run() {
  console.log(`\n🔥  Pilot KV Warm-Up — ${COHORT}`);
  console.log(`    Account:   ${ACCOUNT_ID}`);
  console.log(`    Namespace: ${NS_ID}`);
  console.log(`    Dry run:   ${DRY_RUN ? 'YES' : 'no'}\n`);

  let written = 0;
  let errors  = 0;

  const tenants = COHORT === 'cohort_1' ? COHORT_1_TENANTS : [];
  if (tenants.length === 0) {
    console.warn(`No tenants found for cohort "${COHORT}". Exiting.`);
    process.exit(0);
  }

  for (const tenantId of tenants) {
    for (const flag of PILOT_FLAGS) {
      const key = `feature_flag:${tenantId}:${flag}`;
      try {
        await kvPut(key, '1');
        console.log(`  ✅  ${key}`);
        written++;
      } catch (err) {
        console.error(`  ❌  ${key} — ${err.message}`);
        errors++;
      }
    }
  }

  console.log(`\n────────────────────────────────────────`);
  console.log(`  Keys written: ${written}`);
  if (errors > 0) {
    console.error(`  ❌  ${errors} write(s) failed — check errors above`);
    process.exit(1);
  } else if (DRY_RUN) {
    console.log(`  ✅  Dry run complete — no keys actually written`);
  } else {
    console.log(`  ✅  KV warm-up complete — pilot cohort flags active`);
  }
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
