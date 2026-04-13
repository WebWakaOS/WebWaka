#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');
const CSV_PATH = path.join(ROOT, 'infra/db/seeds/0004_verticals-master.csv');
const PACKAGES_DIR = path.join(ROOT, 'packages');

function parseCSV(content: string): Array<Record<string, string>> {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]!);
  const rows: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]!);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i]!;
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

function main(): void {
  if (!fs.existsSync(CSV_PATH)) {
    console.error('FAIL: Vertical registry CSV not found at', CSV_PATH);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parseCSV(csvContent);

  const actualPackages = new Set<string>();
  for (const entry of fs.readdirSync(PACKAGES_DIR)) {
    if (entry.startsWith('verticals-')) {
      actualPackages.add(entry.replace('verticals-', ''));
    }
  }

  const violations: string[] = [];

  const slugSet = new Set<string>();
  for (const row of rows) {
    const slug = row['slug'] ?? '';
    if (slugSet.has(slug)) {
      violations.push(`DUPLICATE slug in registry: "${slug}"`);
    }
    slugSet.add(slug);
  }

  let matchedCount = 0;
  const orphanPackages = new Set(actualPackages);

  for (const row of rows) {
    const pkgName = (row['package_name'] ?? '').replace('packages/verticals-', '');
    if (pkgName && actualPackages.has(pkgName)) {
      matchedCount++;
      orphanPackages.delete(pkgName);
    }
  }

  if (orphanPackages.size > 0) {
    for (const pkg of orphanPackages) {
      violations.push(`Orphan package: verticals-${pkg} — exists but not referenced in registry`);
    }
  }

  if (violations.length > 0) {
    console.error(`FAIL: Vertical registry/package consistency check — ${violations.length} issue(s):`);
    violations.forEach(v => console.error(`  ${v}`));
    process.exit(1);
  }

  console.log(`PASS: Vertical registry consistent — ${rows.length} entries, ${matchedCount} matched packages, ${actualPackages.size} total packages, 0 orphans, 0 duplicates.`);
}

main();
