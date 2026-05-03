#!/usr/bin/env node
/**
 * WebWaka OS — Pilot Zero-Transaction Alert
 * Release Gate P5 / Monitoring & Observability
 *
 * Queries the production D1 (via Cloudflare API) for pilot operators who:
 *   - Have status = 'active'
 *   - Were activated (status changed to active) more than 7 days ago
 *   - Have first_txn_at IS NULL (no transactions recorded yet)
 *
 * On finding any, sends a Slack notification to the #pilot-ops channel.
 * Designed to run daily via GitHub Actions scheduled workflow.
 *
 * Usage:
 *   CLOUDFLARE_ACCOUNT_ID=<id> \
 *   CLOUDFLARE_API_TOKEN=<token> \
 *   D1_DATABASE_ID=<d1_id> \
 *   SLACK_WEBHOOK_URL=<url> \
 *   node scripts/pilot-zero-txn-alert.mjs
 *
 * Optional:
 *   DRY_RUN=1   — print alerts but don't send to Slack
 *   THRESHOLD_DAYS=7 — days since activation before flagging (default: 7)
 */

const ACCOUNT_ID     = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN      = process.env.CLOUDFLARE_API_TOKEN;
const D1_DATABASE_ID = process.env.D1_DATABASE_ID;
const SLACK_WEBHOOK  = process.env.SLACK_WEBHOOK_URL;
const DRY_RUN        = process.env.DRY_RUN === '1';
const THRESHOLD_DAYS = Number(process.env.THRESHOLD_DAYS ?? '7');

if (!ACCOUNT_ID || !API_TOKEN || !D1_DATABASE_ID) {
  console.error('ERROR: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and D1_DATABASE_ID are required.');
  process.exit(1);
}

if (!SLACK_WEBHOOK && !DRY_RUN) {
  console.error('ERROR: SLACK_WEBHOOK_URL is required (or set DRY_RUN=1).');
  process.exit(1);
}

// ─── D1 Query ─────────────────────────────────────────────────────────────────

async function queryD1(sql) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`D1 query failed: ${res.status} ${body}`);
  }
  const json = await res.json();
  if (!json.success) throw new Error(`D1 error: ${JSON.stringify(json.errors)}`);
  return json.result?.[0]?.results ?? [];
}

// ─── Slack Notification ────────────────────────────────────────────────────────

async function sendSlack(operators) {
  const lines = operators.map(op =>
    `• *${op.operator_name || op.tenant_id}* (${op.cohort}) — active since <!date^${Math.floor(new Date(op.activated_at || op.created_at).getTime() / 1000)}^{date_short}|${op.activated_at || op.created_at}>`
  );

  const payload = {
    text: `🚨 *Pilot Alert: Zero-Transaction Operators (${operators.length})*`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `🚨 Pilot Alert: ${operators.length} operator(s) with no transactions` },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `The following pilot operators have been *active for >${THRESHOLD_DAYS} days* but have *no transactions recorded* yet:\n\n${lines.join('\n')}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Recommended action:* Reach out to these operators to understand blockers. Check platform admin → Pilot → Operators for details.`,
        },
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `WebWaka OS · Pilot Ops Alert · ${new Date().toISOString()}` },
        ],
      },
    ],
  };

  if (DRY_RUN) {
    console.log('\n[DRY_RUN] Would send to Slack:');
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const res = await fetch(SLACK_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Slack webhook failed: ${res.status} ${await res.text()}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n🔍  Pilot Zero-Transaction Check`);
  console.log(`    Threshold: ${THRESHOLD_DAYS} days`);
  console.log(`    Dry run:   ${DRY_RUN ? 'YES' : 'no'}`);
  console.log(`    Time:      ${new Date().toISOString()}\n`);

  const sql = `
    SELECT
      po.tenant_id,
      po.operator_name,
      po.cohort,
      po.status,
      po.first_txn_at,
      po.created_at,
      po.updated_at AS activated_at
    FROM pilot_operators po
    WHERE po.status = 'active'
      AND po.first_txn_at IS NULL
      AND julianday('now') - julianday(po.created_at) > ${THRESHOLD_DAYS}
    ORDER BY po.created_at ASC
    LIMIT 50;
  `;

  let operators;
  try {
    operators = await queryD1(sql);
  } catch (err) {
    console.error(`D1 query error: ${err.message}`);
    process.exit(1);
  }

  console.log(`  Found ${operators.length} operator(s) with 0 transactions after ${THRESHOLD_DAYS}+ days active.`);

  if (operators.length === 0) {
    console.log('  ✅  All active pilot operators have at least one transaction. No alert needed.');
    process.exit(0);
  }

  for (const op of operators) {
    console.log(`  ⚠️  ${op.operator_name || op.tenant_id} (${op.cohort}) — active since ${op.created_at}`);
  }

  try {
    await sendSlack(operators);
    console.log(`\n  ✅  Slack alert sent for ${operators.length} operator(s).`);
  } catch (err) {
    console.error(`  ❌  Slack alert failed: ${err.message}`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
