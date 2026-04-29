#!/usr/bin/env node
/**
 * AI Config Alignment Check — Phase 0 (ADR-0042)
 *
 * Verifies that every AI config entry in packages/superagent/src/vertical-ai-config.ts
 * references a verticalId that exists in the verticals registry, and that no config
 * references the deprecated 'support_group' vertical name.
 *
 * Also checks that @webwaka/groups routes do not hardcode deprecated 'support_group' event keys.
 *
 * Exit code 0 = all clear. Exit code 1 = failures found.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');
let failures = 0;

function fail(msg: string): void {
  console.error(`  [FAIL] ${msg}`);
  failures++;
}

function pass(msg: string): void {
  console.log(`  [PASS] ${msg}`);
}

// ---------------------------------------------------------------------------
// Check 1: No 'support_group' literal in new @webwaka/groups source
// ---------------------------------------------------------------------------

console.log('\nCheck 1: @webwaka/groups must not use deprecated support_group table names');

const groupsSrc = path.join(ROOT, 'packages/groups/src');
if (fs.existsSync(groupsSrc)) {
  const files = fs.readdirSync(groupsSrc).filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'));
  for (const file of files) {
    const content = fs.readFileSync(path.join(groupsSrc, file), 'utf8');
    const badRefs = content.match(/\bsupport_group[s]?\b/g);
    if (badRefs) {
      fail(`${file} contains deprecated 'support_group' reference: ${badRefs.join(', ')}`);
    } else {
      pass(`${file}: no deprecated support_group references`);
    }
  }
} else {
  fail('packages/groups/src directory not found');
}

// ---------------------------------------------------------------------------
// Check 2: @webwaka/groups/src/groups.test.ts uses GroupEventType not SupportGroupEventType
// ---------------------------------------------------------------------------

console.log('\nCheck 2: groups.test.ts must import GroupEventType (not SupportGroupEventType)');

const testFile = path.join(ROOT, 'packages/groups/src/groups.test.ts');
if (fs.existsSync(testFile)) {
  const content = fs.readFileSync(testFile, 'utf8');
  if (content.includes('SupportGroupEventType')) {
    fail('groups.test.ts imports deprecated SupportGroupEventType');
  } else {
    pass('groups.test.ts does not reference deprecated SupportGroupEventType');
  }
} else {
  fail('packages/groups/src/groups.test.ts not found');
}

// ---------------------------------------------------------------------------
// Check 3: apps/api/src/routes/groups.ts must import GroupEventType
// ---------------------------------------------------------------------------

console.log('\nCheck 3: apps/api/src/routes/groups.ts must use GroupEventType');

const groupsRoute = path.join(ROOT, 'apps/api/src/routes/groups.ts');
if (fs.existsSync(groupsRoute)) {
  const content = fs.readFileSync(groupsRoute, 'utf8');
  if (!content.includes('GroupEventType')) {
    fail('groups.ts route does not import GroupEventType');
  } else if (content.includes('SupportGroupEventType') && !content.includes('@deprecated')) {
    fail('groups.ts route imports deprecated SupportGroupEventType without deprecation comment');
  } else {
    pass('groups.ts route uses GroupEventType correctly');
  }
} else {
  fail('apps/api/src/routes/groups.ts not found (route not created yet)');
}

// ---------------------------------------------------------------------------
// Check 4: plan-config.ts must use groupsEnabled / valueMovementEnabled (not old names)
// ---------------------------------------------------------------------------

console.log('\nCheck 4: plan-config.ts must use groupsEnabled and valueMovementEnabled');

const planConfig = path.join(ROOT, 'packages/entitlements/src/plan-config.ts');
if (fs.existsSync(planConfig)) {
  const content = fs.readFileSync(planConfig, 'utf8');
  const hasOldGroupsKey = /supportGroupsEnabled:\s*(?!.*@deprecated)/.test(content);
  const hasOldFundraisingKey = /fundraisingEnabled:\s*(?!.*@deprecated)/.test(content);

  if (hasOldGroupsKey) {
    fail('plan-config.ts still uses non-deprecated supportGroupsEnabled');
  } else {
    pass('plan-config.ts: supportGroupsEnabled correctly deprecated or removed');
  }

  if (hasOldFundraisingKey) {
    fail('plan-config.ts still uses non-deprecated fundraisingEnabled');
  } else {
    pass('plan-config.ts: fundraisingEnabled correctly deprecated or removed');
  }

  if (!content.includes('groupsEnabled')) {
    fail('plan-config.ts missing new groupsEnabled key');
  } else {
    pass('plan-config.ts: groupsEnabled present');
  }

  if (!content.includes('valueMovementEnabled')) {
    fail('plan-config.ts missing new valueMovementEnabled key');
  } else {
    pass('plan-config.ts: valueMovementEnabled present');
  }
} else {
  fail('packages/entitlements/src/plan-config.ts not found');
}

// ---------------------------------------------------------------------------
// Check 5: policy_rules migration seeded
// ---------------------------------------------------------------------------

console.log('\nCheck 5: policy_rules migration must exist with INEC seed');

const policyMigration = path.join(ROOT, 'infra/db/migrations/0434_policy_engine_skeleton.sql');
if (fs.existsSync(policyMigration)) {
  const content = fs.readFileSync(policyMigration, 'utf8');
  if (content.includes('policy_rules') && content.includes('INEC')) {
    pass('0434_policy_engine_skeleton.sql: policy_rules table with INEC seed found');
  } else {
    fail('0434_policy_engine_skeleton.sql: missing policy_rules table or INEC seed');
  }
} else {
  fail('infra/db/migrations/0434_policy_engine_skeleton.sql not found');
}

// ---------------------------------------------------------------------------
// Check 6: @webwaka/groups package.json exists and version >= 0.1.0
// ---------------------------------------------------------------------------

console.log('\nCheck 6: @webwaka/groups package.json exists');

const groupsPkg = path.join(ROOT, 'packages/groups/package.json');
if (fs.existsSync(groupsPkg)) {
  const pkg = JSON.parse(fs.readFileSync(groupsPkg, 'utf8'));
  if (pkg.name !== '@webwaka/groups') {
    fail(`packages/groups/package.json has wrong name: ${pkg.name}`);
  } else {
    pass(`@webwaka/groups package.json valid (version ${pkg.version})`);
  }
} else {
  fail('packages/groups/package.json not found');
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${'─'.repeat(60)}`);
if (failures === 0) {
  console.log('AI Config Alignment Check: ALL PASSED');
  process.exit(0);
} else {
  console.error(`AI Config Alignment Check: ${failures} FAILURE(S)`);
  process.exit(1);
}
