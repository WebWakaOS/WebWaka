#!/usr/bin/env tsx
/**
 * M10-009: Secrets Provisioning Verification
 *
 * Cross-references three sources of truth:
 *   1. wrangler.toml "Required" comments across all Worker apps
 *   2. deploy-staging.yml secret references
 *   3. infra/cloudflare/secrets-rotation-log.md inventory
 *
 * Usage:  npx tsx scripts/verify-secrets.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

let exitCode = 0;

function pass(msg: string) {
  console.log(`  ✓ ${msg}`);
}

function fail(msg: string) {
  console.error(`  ✗ ${msg}`);
  exitCode = 1;
}

function warn(msg: string) {
  console.log(`  ⚠ ${msg}`);
}

// ── Source 1: Extract "Required" secrets from wrangler.toml files ─────────────
console.log('\n1. Scanning wrangler.toml files for required secrets...\n');

const appsDir = path.resolve('apps');
const workerApps = ['api', 'brand-runtime', 'public-discovery', 'ussd-gateway'];
const wranglerSecrets = new Map<string, Set<string>>();
const allWranglerSecrets = new Set<string>();

for (const app of workerApps) {
  const wranglerPath = path.join(appsDir, app, 'wrangler.toml');
  if (!fs.existsSync(wranglerPath)) {
    fail(`Missing wrangler.toml: ${wranglerPath}`);
    continue;
  }
  const content = fs.readFileSync(wranglerPath, 'utf-8');
  const secrets = new Set<string>();

  const lines = content.split('\n');
  let inRequired = false;
  for (const line of lines) {
    if (line.includes('Required')) {
      inRequired = true;
      continue;
    }
    if (inRequired) {
      const match = line.match(/^#\s+(\w+)/);
      if (match?.[1]) {
        secrets.add(match[1]);
        allWranglerSecrets.add(match[1]);
      } else {
        inRequired = false;
      }
    }
  }

  wranglerSecrets.set(app, secrets);
  if (secrets.size > 0) {
    pass(`${app}/wrangler.toml: ${secrets.size} required secrets — ${[...secrets].join(', ')}`);
  } else {
    warn(`${app}/wrangler.toml: No "Required" secrets section found`);
  }
}

// ── Source 2: Extract secrets from deploy-staging.yml ─────────────────────────
console.log('\n2. Scanning deploy-staging.yml for secret references...\n');

const deployPath = path.resolve('.github/workflows/deploy-staging.yml');
const deploySecrets = new Set<string>();

if (fs.existsSync(deployPath)) {
  const content = fs.readFileSync(deployPath, 'utf-8');
  const secretRe = /secrets\.(\w+)/g;
  let match: RegExpExecArray | null;
  while ((match = secretRe.exec(content)) !== null) {
    if (match[1]) {
      deploySecrets.add(match[1]);
    }
  }
  pass(`deploy-staging.yml: ${deploySecrets.size} secret references — ${[...deploySecrets].join(', ')}`);
} else {
  fail('deploy-staging.yml not found');
}

// ── Source 3: Extract secrets from rotation log ──────────────────────────────
console.log('\n3. Scanning secrets-rotation-log.md inventory...\n');

const rotationPath = path.resolve('infra/cloudflare/secrets-rotation-log.md');
const rotationSecrets = new Set<string>();

if (fs.existsSync(rotationPath)) {
  const content = fs.readFileSync(rotationPath, 'utf-8');
  const secretRe = /`(\w+)`\s*\|/g;
  let match: RegExpExecArray | null;
  while ((match = secretRe.exec(content)) !== null) {
    if (match[1] && match[1] !== 'Secret') {
      rotationSecrets.add(match[1]);
    }
  }
  pass(`secrets-rotation-log.md: ${rotationSecrets.size} secrets documented — ${[...rotationSecrets].join(', ')}`);
} else {
  fail('secrets-rotation-log.md not found');
}

// ── Source 4: Extract secrets from operator-runbook.md ────────────────────────
console.log('\n4. Scanning operator-runbook.md for provisioning commands...\n');

const runbookPath = path.resolve('docs/operator-runbook.md');
const runbookSecrets = new Set<string>();

if (fs.existsSync(runbookPath)) {
  const content = fs.readFileSync(runbookPath, 'utf-8');
  const secretRe = /wrangler secret put (\w+)/g;
  let match: RegExpExecArray | null;
  while ((match = secretRe.exec(content)) !== null) {
    if (match[1]) {
      runbookSecrets.add(match[1]);
    }
  }
  pass(`operator-runbook.md: ${runbookSecrets.size} provisioning commands — ${[...runbookSecrets].join(', ')}`);
} else {
  fail('operator-runbook.md not found');
}

// ── Cross-reference checks ───────────────────────────────────────────────────
console.log('\n5. Cross-referencing sources...\n');

for (const secret of allWranglerSecrets) {
  if (!rotationSecrets.has(secret)) {
    fail(`Secret "${secret}" is required in wrangler.toml but MISSING from rotation log`);
  } else {
    pass(`Secret "${secret}" — wrangler.toml ↔ rotation log ✓`);
  }
}

for (const secret of rotationSecrets) {
  if (secret === 'CLOUDFLARE_API_TOKEN' || secret === 'DIALOG360_API_KEY') continue;
  if (!allWranglerSecrets.has(secret) && !runbookSecrets.has(secret)) {
    warn(`Secret "${secret}" is in rotation log but not referenced in any wrangler.toml`);
  }
}

const infraSecrets = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'];
for (const secret of infraSecrets) {
  if (deploySecrets.has(secret)) {
    pass(`Infra secret "${secret}" — deploy workflow ✓`);
  } else {
    fail(`Infra secret "${secret}" — MISSING from deploy workflow`);
  }
}

for (const [app, secrets] of wranglerSecrets) {
  for (const secret of secrets) {
    if (runbookSecrets.has(secret) || deploySecrets.has(secret)) {
      pass(`${app}: "${secret}" has provisioning instructions`);
    } else {
      warn(`${app}: "${secret}" has no provisioning instructions in runbook or deploy workflow`);
    }
  }
}

// ── .env.example completeness ────────────────────────────────────────────────
console.log('\n6. Checking .env.example...\n');

const envExamplePath = path.resolve('.env.example');
if (fs.existsSync(envExamplePath)) {
  const content = fs.readFileSync(envExamplePath, 'utf-8');
  const envVars = new Set<string>();
  for (const line of content.split('\n')) {
    const match = line.match(/^(\w+)=/);
    if (match?.[1]) {
      envVars.add(match[1]);
    }
  }
  pass(`.env.example: ${envVars.size} variables documented`);

  const criticalEnvVars = ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN', 'JWT_SECRET'];
  for (const v of criticalEnvVars) {
    if (envVars.has(v)) {
      pass(`.env.example includes "${v}"`);
    } else {
      fail(`.env.example MISSING critical variable "${v}"`);
    }
  }
} else {
  fail('.env.example not found');
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
if (exitCode === 0) {
  console.log('All secrets provisioning checks PASSED ✓\n');
} else {
  console.error('Some secrets provisioning checks FAILED — see above ✗ marks\n');
}

process.exit(exitCode);
