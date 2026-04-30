/**
 * Parity Testing Framework
 * 
 * Phase B: Validates that vertical-engine routes produce identical results
 * to legacy vertical routes for gradual migration confidence.
 * 
 * Usage:
 *   import { runParityTest } from '@/test/parity-framework';
 *   
 *   await runParityTest({
 *     vertical: 'bakery',
 *     endpoint: '/profiles',
 *     method: 'GET',
 *     legacyPath: '/v1/verticals/bakery/profiles',
 *     enginePath: '/bakery/profiles',
 *   });
 */

import { describe, it, expect } from 'vitest';

export interface ParityTestConfig {
  vertical: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  legacyPath: string;
  enginePath: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  testName?: string;
}

export interface ParityTestResult {
  vertical: string;
  endpoint: string;
  passed: boolean;
  legacy: {
    status: number;
    body: unknown;
    headers: Record<string, string>;
    responseTime: number;
  };
  engine: {
    status: number;
    body: unknown;
    headers: Record<string, string>;
    responseTime: number;
  };
  differences: string[];
  timestamp: string;
}

/**
 * Run a single parity test comparing legacy vs engine routes
 */
export async function runParityTest(
  config: ParityTestConfig,
  baseUrl: string = 'http://localhost:3000'
): Promise<ParityTestResult> {
  const startLegacy = Date.now();
  const legacyResponse = await fetch(`${baseUrl}${config.legacyPath}`, {
    method: config.method,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    ...(config.body && { body: JSON.stringify(config.body) }),
  });
  const legacyTime = Date.now() - startLegacy;
  const legacyBody = await legacyResponse.json();

  const startEngine = Date.now();
  const engineResponse = await fetch(`${baseUrl}${config.enginePath}`, {
    method: config.method,
    headers: {
      'Content-Type': 'application/json',
      'X-Use-Engine': '1', // Feature flag to route to engine
      ...config.headers,
    },
    ...(config.body && { body: JSON.stringify(config.body) }),
  });
  const engineTime = Date.now() - startEngine;
  const engineBody = await engineResponse.json();

  const differences: string[] = [];

  // Compare status codes
  if (legacyResponse.status !== engineResponse.status) {
    differences.push(
      `Status mismatch: legacy=${legacyResponse.status}, engine=${engineResponse.status}`
    );
  }

  // Compare response bodies (deep comparison)
  const bodyDiffs = compareObjects(legacyBody, engineBody, '');
  differences.push(...bodyDiffs);

  // Compare critical headers (excluding volatile ones like etag with timestamps)
  const criticalHeaders = ['content-type'];
  for (const header of criticalHeaders) {
    const legacyVal = legacyResponse.headers.get(header);
    const engineVal = engineResponse.headers.get(header);
    if (legacyVal !== engineVal) {
      differences.push(`Header ${header}: legacy="${legacyVal}", engine="${engineVal}"`);
    }
  }

  return {
    vertical: config.vertical,
    endpoint: config.endpoint,
    passed: differences.length === 0,
    legacy: {
      status: legacyResponse.status,
      body: legacyBody,
      headers: Object.fromEntries(legacyResponse.headers.entries()),
      responseTime: legacyTime,
    },
    engine: {
      status: engineResponse.status,
      body: engineBody,
      headers: Object.fromEntries(engineResponse.headers.entries()),
      responseTime: engineTime,
    },
    differences,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Deep comparison of objects to find differences
 */
function compareObjects(
  obj1: unknown,
  obj2: unknown,
  path: string
): string[] {
  const diffs: string[] = [];

  if (typeof obj1 !== typeof obj2) {
    diffs.push(`${path}: type mismatch (${typeof obj1} vs ${typeof obj2})`);
    return diffs;
  }

  if (obj1 === null || obj2 === null) {
    if (obj1 !== obj2) {
      diffs.push(`${path}: value mismatch (${obj1} vs ${obj2})`);
    }
    return diffs;
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      diffs.push(`${path}: array length mismatch (${obj1.length} vs ${obj2.length})`);
      return diffs;
    }

    for (let i = 0; i < obj1.length; i++) {
      const itemPath = `${path}[${i}]`;
      diffs.push(...compareObjects(obj1[i], obj2[i], itemPath));
    }
    return diffs;
  }

  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const keys1 = Object.keys(obj1 as object);
    const keys2 = Object.keys(obj2 as object);

    const allKeys = new Set([...keys1, ...keys2]);

    for (const key of allKeys) {
      const keyPath = path ? `${path}.${key}` : key;
      const val1 = (obj1 as Record<string, unknown>)[key];
      const val2 = (obj2 as Record<string, unknown>)[key];

      if (!(key in (obj1 as object))) {
        diffs.push(`${keyPath}: missing in legacy`);
      } else if (!(key in (obj2 as object))) {
        diffs.push(`${keyPath}: missing in engine`);
      } else {
        diffs.push(...compareObjects(val1, val2, keyPath));
      }
    }
    return diffs;
  }

  if (obj1 !== obj2) {
    diffs.push(`${path}: value mismatch ("${obj1}" vs "${obj2}")`);
  }

  return diffs;
}

/**
 * Run multiple parity tests in batch
 */
export async function runParityTestSuite(
  configs: ParityTestConfig[],
  baseUrl?: string
): Promise<ParityTestResult[]> {
  const results: ParityTestResult[] = [];

  for (const config of configs) {
    const result = await runParityTest(config, baseUrl);
    results.push(result);
  }

  return results;
}

/**
 * Generate parity test report
 */
export function generateParityReport(results: ParityTestResult[]): string {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  let report = '# Parity Test Report\n\n';
  report += `**Total Tests:** ${results.length}\n`;
  report += `**Passed:** ✅ ${passed}\n`;
  report += `**Failed:** ❌ ${failed}\n`;
  report += `**Success Rate:** ${((passed / results.length) * 100).toFixed(1)}%\n\n`;

  if (failed > 0) {
    report += '## Failed Tests\n\n';
    for (const result of results.filter((r) => !r.passed)) {
      report += `### ${result.vertical} - ${result.endpoint}\n`;
      report += `**Differences:**\n`;
      for (const diff of result.differences) {
        report += `- ${diff}\n`;
      }
      report += '\n';
    }
  }

  report += '## Performance Comparison\n\n';
  report += '| Vertical | Endpoint | Legacy (ms) | Engine (ms) | Difference |\n';
  report += '|----------|----------|-------------|-------------|------------|\n';

  for (const result of results) {
    const diff = result.engine.responseTime - result.legacy.responseTime;
    const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
    report += `| ${result.vertical} | ${result.endpoint} | ${result.legacy.responseTime} | ${result.engine.responseTime} | ${diffStr} |\n`;
  }

  return report;
}

/**
 * Vitest helper for creating parity tests
 */
export function createParityTest(config: ParityTestConfig, baseUrl?: string) {
  const testName = config.testName || `${config.vertical} ${config.endpoint} parity`;

  it(testName, async () => {
    const result = await runParityTest(config, baseUrl);

    if (!result.passed) {
      console.error(`Parity test failed for ${config.vertical} ${config.endpoint}:`);
      console.error('Differences:', result.differences);
    }

    expect(result.passed).toBe(true);
    expect(result.differences).toHaveLength(0);
  });
}
