#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

const SUPERAGENT_ROUTES = path.resolve(__dirname, '../../apps/api/src/routes/superagent.ts');

function main(): void {
  if (!fs.existsSync(SUPERAGENT_ROUTES)) {
    console.error('FAIL: apps/api/src/routes/superagent.ts not found.');
    process.exit(1);
  }

  const content = fs.readFileSync(SUPERAGENT_ROUTES, 'utf8');

  const hasConsentGate = content.includes('aiConsentGate') || content.includes('consentGate');
  if (!hasConsentGate) {
    console.error('FAIL: SuperAgent routes do not reference aiConsentGate or consentGate middleware.');
    process.exit(1);
  }

  const hasResolveAdapter = content.includes('resolveAdapter');
  if (hasResolveAdapter) {
    const resolveIdx = content.indexOf('resolveAdapter');
    const consentIdx = content.indexOf('aiConsentGate');

    if (consentIdx < 0 || consentIdx > resolveIdx) {
      console.error('WARNING: aiConsentGate may not be applied before resolveAdapter call. Verify route ordering.');
    }
  }

  // ARC-07: Routes were split from index.ts into router.ts. Check router.ts first, fall back to index.ts.
  const routerPath = path.resolve(__dirname, '../../apps/api/src/router.ts');
  const indexPath = path.resolve(__dirname, '../../apps/api/src/index.ts');
  const routerSource = fs.existsSync(routerPath) ? fs.readFileSync(routerPath, 'utf8') : '';
  const indexContent = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';
  const combinedContent = routerSource + '\n' + indexContent;

  const hasUssdExclusion = combinedContent.includes('ussdExclusionMiddleware') && combinedContent.includes("'/superagent");
  if (!hasUssdExclusion) {
    console.error('FAIL: USSD exclusion middleware not applied to superagent routes in router.ts or index.ts.');
    process.exit(1);
  }

  const hasAiEntitlement = combinedContent.includes('aiEntitlementMiddleware') && combinedContent.includes("'/superagent");
  if (!hasAiEntitlement) {
    console.error('FAIL: AI entitlement middleware not applied to superagent routes in router.ts or index.ts.');
    process.exit(1);
  }

  console.log('PASS: NDPR consent gate, USSD exclusion, and AI entitlement are applied to SuperAgent routes.');
}

main();
