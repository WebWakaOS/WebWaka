/**
 * Bundle Size Monitoring Script (L-7)
 *
 * Tracks Vite build output size for the workspace-app.
 * Alerts if total bundle size exceeds baseline by >10%.
 *
 * Usage:
 *   cd apps/workspace-app && pnpm build
 *   node ../../scripts/check-bundle-size.mjs apps/workspace-app/dist
 */

import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = join(__dirname, '..', 'infra', 'bundle-baseline.json');
const THRESHOLD = 0.10; // 10% increase = warning

const distDir = process.argv[2];
if (!distDir || !existsSync(distDir)) {
  console.log('Usage: node scripts/check-bundle-size.mjs <dist-directory>');
  process.exit(0);
}

function getDirectorySize(dir) {
  let total = 0;
  const entries = readdirSync(dir, { recursive: true, withFileTypes: false });
  // Fallback for Node < 20 recursive
  function walk(d) {
    for (const entry of readdirSync(d)) {
      const fullPath = join(d, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        total += stat.size;
      }
    }
  }
  walk(dir);
  return total;
}

function getFilesByExtension(dir) {
  const sizes = { js: 0, css: 0, html: 0, other: 0 };
  function walk(d) {
    for (const entry of readdirSync(d)) {
      const fullPath = join(d, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        const ext = entry.split('.').pop();
        if (ext === 'js' || ext === 'mjs') sizes.js += stat.size;
        else if (ext === 'css') sizes.css += stat.size;
        else if (ext === 'html') sizes.html += stat.size;
        else sizes.other += stat.size;
      }
    }
  }
  walk(dir);
  return sizes;
}

const totalSize = getDirectorySize(distDir);
const byType = getFilesByExtension(distDir);

console.log(`\n📦 Bundle Size Report:`);
console.log(`   Total: ${(totalSize / 1024).toFixed(1)} KB`);
console.log(`   JS:    ${(byType.js / 1024).toFixed(1)} KB`);
console.log(`   CSS:   ${(byType.css / 1024).toFixed(1)} KB`);
console.log(`   HTML:  ${(byType.html / 1024).toFixed(1)} KB`);
console.log(`   Other: ${(byType.other / 1024).toFixed(1)} KB`);

if (!existsSync(BASELINE_PATH)) {
  console.log('\n📁 No baseline exists. Saving current as baseline.');
  saveBaseline(totalSize, byType);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf-8'));
const increase = (totalSize - baseline.total) / baseline.total;

console.log(`\n📏 Baseline (${baseline.date}): ${(baseline.total / 1024).toFixed(1)} KB`);
console.log(`   Change: ${increase >= 0 ? '+' : ''}${(increase * 100).toFixed(1)}%`);

if (increase > THRESHOLD) {
  console.warn(`\n⚠️  Bundle size increased by ${(increase * 100).toFixed(1)}% (threshold: ${THRESHOLD * 100}%)`);
  console.warn(`   Consider code-splitting or removing unused dependencies.`);
  // Non-blocking — informational only
} else {
  console.log(`\n✅ Bundle size within threshold.`);
  if (totalSize < baseline.total) {
    console.log('   Updating baseline with smaller size.');
    saveBaseline(totalSize, byType);
  }
}

function saveBaseline(total, byType) {
  writeFileSync(BASELINE_PATH, JSON.stringify({
    date: new Date().toISOString().slice(0, 10),
    total,
    ...byType,
    commit: process.env.GITHUB_SHA || 'local',
  }, null, 2) + '\n');
}
