#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

const API_INDEX = path.resolve(__dirname, '../../apps/api/src/index.ts');

function main(): void {
  const content = fs.readFileSync(API_INDEX, 'utf8');

  const hasWildcardOrigin = /origin:\s*['"]?\*['"]?/.test(content);
  if (hasWildcardOrigin) {
    console.error('FAIL: CORS uses wildcard (*) origin. Must be explicit origin list.');
    process.exit(1);
  }

  const hasEnvCheck = content.includes('ENVIRONMENT') && content.includes('production');
  if (!hasEnvCheck) {
    console.error('FAIL: CORS fallback does not check ENVIRONMENT for production mode.');
    process.exit(1);
  }

  const prodFallbackMatch = content.match(/isProd[\s\S]*?\?\s*\[([^\]]*)\]/);
  if (prodFallbackMatch) {
    const prodList = prodFallbackMatch[1].trim();
    if (prodList.includes('localhost')) {
      console.error('FAIL: Production CORS fallback includes localhost.');
      process.exit(1);
    }
  }

  const devFallbackMatch = content.match(/:\s*\[([^\]]*localhost[^\]]*)\]/);
  if (devFallbackMatch) {
    const hasProdGuard = content.includes('isProd');
    if (!hasProdGuard) {
      console.error('FAIL: localhost in CORS but no production guard found.');
      process.exit(1);
    }
  }

  console.log('PASS: CORS configuration is production-safe.');
}

main();
