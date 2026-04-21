import * as fs from 'fs';
import * as path from 'path';

const SEED_DIR = path.resolve(__dirname, '../../infra/db/seed');
const EXPECTED_LGAS = 774;
const EXPECTED_ZONES = 6;
const EXPECTED_STATES = 37;
const PRIORITY_STATES = ['lagos', 'fct', 'rivers', 'kano'];

let exitCode = 0;

function extractPlaceIds(filePath: string): Set<string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ids = new Set<string>();
  const regex = /\(\s*'(place_[^']+)'\s*,/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    ids.add(match[1]);
  }
  return ids;
}

function extractParentRefs(filePath: string, parentPrefix: string): Set<string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parents = new Set<string>();
  const regex = new RegExp(`'(${parentPrefix}[^']+)'\\s*,\\s*'\\[`, 'g');
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    parents.add(match[1]);
  }
  return parents;
}

function checkFile(label: string, filePath: string, expectedMin: number): Set<string> {
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: ${label} seed file not found: ${filePath}`);
    exitCode = 1;
    return new Set();
  }
  const ids = extractPlaceIds(filePath);
  if (ids.size < expectedMin) {
    console.error(`FAIL: Expected at least ${expectedMin} ${label}, found ${ids.size}`);
    exitCode = 1;
  } else {
    console.log(`  ${label}: ${ids.size} (expected ${expectedMin}+) ✓`);
  }
  return ids;
}

function checkPriorityStates(): void {
  const wardFile = path.join(SEED_DIR, '0003_wards.sql');
  if (!fs.existsSync(wardFile)) return;
  const content = fs.readFileSync(wardFile, 'utf-8');
  for (const state of PRIORITY_STATES) {
    const pattern = new RegExp(`place_ward_${state}_`, 'gi');
    const matches = content.match(pattern);
    const count = matches ? matches.length : 0;
    if (count === 0) {
      console.error(`FAIL: Priority state '${state}' has no wards in seed data`);
      exitCode = 1;
    } else {
      console.log(`  Priority state '${state}': ${count} wards ✓`);
    }
  }
}

function checkHierarchyIntegrity(stateIds: Set<string>): void {
  const lgaFile = path.join(SEED_DIR, '0002_lgas.sql');
  if (!fs.existsSync(lgaFile) || stateIds.size === 0) return;

  const lgaParents = extractParentRefs(lgaFile, 'place_state_');
  let orphanCount = 0;
  const orphans: string[] = [];
  for (const parent of lgaParents) {
    if (!stateIds.has(parent)) {
      orphanCount++;
      orphans.push(parent);
    }
  }

  if (orphanCount > 0) {
    console.error(`FAIL: ${orphanCount} LGA parent references point to non-existent states: ${orphans.slice(0, 5).join(', ')}${orphans.length > 5 ? '...' : ''}`);
    exitCode = 1;
  } else {
    console.log(`  LGA→State parent integrity: all ${lgaParents.size} references valid ✓`);
  }
}

console.log('Checking geography seed integrity...');

const countryFile = path.join(SEED_DIR, 'nigeria_country.sql');
if (!fs.existsSync(countryFile)) {
  console.error(`FAIL: Country seed file not found`);
  exitCode = 1;
} else {
  console.log(`  Country seed: exists ✓`);
}

checkFile('Zones', path.join(SEED_DIR, 'nigeria_zones.sql'), EXPECTED_ZONES);
const stateIds = checkFile('States', path.join(SEED_DIR, 'nigeria_states.sql'), EXPECTED_STATES);
checkFile('LGAs', path.join(SEED_DIR, '0002_lgas.sql'), EXPECTED_LGAS);
checkFile('Wards', path.join(SEED_DIR, '0003_wards.sql'), 100);
checkPriorityStates();
checkHierarchyIntegrity(stateIds);

if (exitCode === 0) {
  console.log('PASS: Geography seed integrity verified (T6 — Geography Anchored to Real Administrative Divisions).');
} else {
  console.error('FAIL: Geography seed integrity issues found.');
}

process.exit(exitCode);
