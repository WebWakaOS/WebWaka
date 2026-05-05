#!/usr/bin/env tsx
/**
 * Governance Check: Analytics Projection Freshness (Wave 3 C6-3)
 *
 * The apps/projections worker writes a `last_projected_at` metadata entry
 * to KV. This check reads it and fails if projections are > 6 hours stale.
 *
 * Requires: KV_NAMESPACE_ID and CF_API_TOKEN env vars.
 *
 * Usage:
 *   KV_NAMESPACE_ID=xxx CF_API_TOKEN=yyy CF_ACCOUNT_ID=zzz \
 *     pnpm exec tsx scripts/governance-checks/check-analytics-freshness.ts
 *
 * In CI (no secrets): exits 0 with a warning (check is advisory in dev).
 */

const STALE_THRESHOLD_HOURS = 6;
const KV_NAMESPACE_ID  = process.env['KV_NAMESPACE_ID'];
const CF_API_TOKEN     = process.env['CF_API_TOKEN'];
const CF_ACCOUNT_ID    = process.env['CF_ACCOUNT_ID'];
const KV_KEY           = 'projections:last_projected_at';

const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${encodeURIComponent(KV_KEY)}`;

async function main(): Promise<void> {
  // If env vars are absent (local dev / CI without secrets), skip gracefully
  if (!KV_NAMESPACE_ID || !CF_API_TOKEN || !CF_ACCOUNT_ID) {
    console.warn('SKIP: KV_NAMESPACE_ID / CF_API_TOKEN / CF_ACCOUNT_ID not set — analytics freshness check skipped.');
    process.exit(0);
  }

  let lastProjectedAt: Date;
  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${CF_API_TOKEN}` },
    });

    if (res.status === 404) {
      console.error(`FAIL: KV key '${KV_KEY}' not found. The projections worker has never run.`);
      process.exit(1);
    }

    if (!res.ok) {
      console.error(`FAIL: Cloudflare KV API error ${res.status}: ${await res.text()}`);
      process.exit(1);
    }

    const value = await res.text();
    lastProjectedAt = new Date(value);

    if (isNaN(lastProjectedAt.getTime())) {
      console.error(`FAIL: KV value '${value}' is not a valid ISO-8601 timestamp.`);
      process.exit(1);
    }
  } catch (e) {
    console.error(`FAIL: Could not read KV: ${e}`);
    process.exit(1);
  }

  const ageHours = (Date.now() - lastProjectedAt.getTime()) / (1000 * 3600);

  if (ageHours > STALE_THRESHOLD_HOURS) {
    console.error(`\nFAIL: Projections are STALE.`);
    console.error(`  Last projected: ${lastProjectedAt.toISOString()}`);
    console.error(`  Age: ${ageHours.toFixed(1)} hours (threshold: ${STALE_THRESHOLD_HOURS}h)`);
    console.error(`\nCheck apps/projections worker — it may have crashed or not deployed.`);
    process.exit(1);
  }

  console.log(`PASS: Projections are fresh (${ageHours.toFixed(1)}h old, threshold: ${STALE_THRESHOLD_HOURS}h).`);
}

main();
