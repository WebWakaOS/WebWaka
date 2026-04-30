/**
 * k6 Performance Baseline Comparison (L-6)
 *
 * Compares current k6 run results against a stored baseline.
 * Alerts if P95 latency regresses by >20% or error rate increases.
 *
 * Usage (in CI after k6 run):
 *   K6_RESULTS_FILE=results.json node infra/k6/compare-baseline.mjs
 *
 * The baseline is stored in infra/k6/baseline.json and updated on success.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = join(__dirname, 'baseline.json');
const REGRESSION_THRESHOLD = 0.20; // 20% regression = alert
const ERROR_RATE_THRESHOLD = 0.01; // 1% error rate increase = alert

// Expected k6 JSON summary format
const resultsFile = process.env.K6_RESULTS_FILE;
if (!resultsFile || !existsSync(resultsFile)) {
  console.log('INFO: No k6 results file provided. Skipping comparison.');
  process.exit(0);
}

const results = JSON.parse(readFileSync(resultsFile, 'utf-8'));
const metrics = results.metrics || {};

const currentP95 = metrics.http_req_duration?.values?.['p(95)'] || 0;
const currentErrorRate = metrics.http_req_failed?.values?.rate || 0;
const currentMedian = metrics.http_req_duration?.values?.['p(50)'] || 0;

console.log(`\n📊 Current Run Performance:`);
console.log(`   P50 latency: ${currentMedian.toFixed(1)}ms`);
console.log(`   P95 latency: ${currentP95.toFixed(1)}ms`);
console.log(`   Error rate:  ${(currentErrorRate * 100).toFixed(2)}%`);

// Load baseline (if exists)
if (!existsSync(BASELINE_PATH)) {
  console.log('\n📁 No baseline exists. Saving current run as baseline.');
  saveBaseline(currentP95, currentMedian, currentErrorRate);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf-8'));
console.log(`\n📏 Baseline (from ${baseline.date}):`);
console.log(`   P50 latency: ${baseline.p50.toFixed(1)}ms`);
console.log(`   P95 latency: ${baseline.p95.toFixed(1)}ms`);
console.log(`   Error rate:  ${(baseline.errorRate * 100).toFixed(2)}%`);

// Compare
const p95Regression = baseline.p95 > 0
  ? (currentP95 - baseline.p95) / baseline.p95
  : 0;
const errorRateIncrease = currentErrorRate - baseline.errorRate;

console.log(`\n📈 Comparison:`);
console.log(`   P95 change: ${p95Regression >= 0 ? '+' : ''}${(p95Regression * 100).toFixed(1)}%`);
console.log(`   Error rate change: ${errorRateIncrease >= 0 ? '+' : ''}${(errorRateIncrease * 100).toFixed(2)}pp`);

let hasRegression = false;

if (p95Regression > REGRESSION_THRESHOLD) {
  console.error(`\n❌ REGRESSION: P95 latency increased by ${(p95Regression * 100).toFixed(1)}% (threshold: ${REGRESSION_THRESHOLD * 100}%)`);
  hasRegression = true;
}

if (errorRateIncrease > ERROR_RATE_THRESHOLD) {
  console.error(`\n❌ REGRESSION: Error rate increased by ${(errorRateIncrease * 100).toFixed(2)}pp (threshold: ${ERROR_RATE_THRESHOLD * 100}%)`);
  hasRegression = true;
}

if (!hasRegression) {
  console.log('\n✅ No performance regression detected.');
  // Update baseline with better results
  if (currentP95 < baseline.p95 || currentErrorRate < baseline.errorRate) {
    console.log('   Updating baseline with improved results.');
    saveBaseline(currentP95, currentMedian, currentErrorRate);
  }
} else {
  // Don't exit(1) — this is informational, not a gate
  console.warn('\n⚠️  Performance regression detected. Review before production deploy.');
}

function saveBaseline(p95, p50, errorRate) {
  const data = {
    date: new Date().toISOString().slice(0, 10),
    p95,
    p50,
    errorRate,
    commit: process.env.GITHUB_SHA || 'local',
  };
  writeFileSync(BASELINE_PATH, JSON.stringify(data, null, 2) + '\n');
}
