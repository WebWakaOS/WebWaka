/**
 * Governance Check: publishEvent correlationId Propagation (H-7)
 *
 * Every publishEvent() call inside apps/api/src/routes/ must include a
 * correlationId field so the X-Request-ID from the incoming HTTP request is
 * propagated through to the notification queue message. This enables
 * distributed tracing across the API worker → notificator consumer boundary.
 *
 * Usage:
 *   correlationId: c.get('requestId') ?? undefined,
 *
 * The requestId is set by the ARC-19 middleware in apps/api/src/middleware/index.ts.
 *
 * EXEMPTIONS:
 *   - apps/api/src/jobs/ — jobs run outside a request context; they use their
 *     own eventId as the correlation anchor (no `c` context available).
 *
 * Exits 1 if any route file has a publishEvent call missing correlationId.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROUTES_DIR = join(process.cwd(), 'apps', 'api', 'src', 'routes');

let files: string[];
try {
  files = readdirSync(ROUTES_DIR)
    .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))
    .map((f) => join(ROUTES_DIR, f));
} catch {
  console.log('SKIP: apps/api/src/routes/ not found');
  process.exit(0);
}

interface Violation {
  file: string;
  line: number;
  snippet: string;
}

const violations: Violation[] = [];

for (const filePath of files) {
  const content = readFileSync(filePath, 'utf-8');

  if (!content.includes('publishEvent')) continue;

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    // Match publishEvent calls that pass c.env (route context — not job context)
    if (!line.includes('publishEvent(c.env,') && !line.includes('publishEvent(c.env ,')) continue;

    // Collect the full call block (up to matching closing brace)
    let block = '';
    let depth = 0;
    let started = false;

    for (let j = i; j < Math.min(i + 50, lines.length); j++) {
      const l = lines[j]!;
      block += l + '\n';
      for (const ch of l) {
        if (ch === '{') { depth++; started = true; }
        if (ch === '}') { depth--; }
      }
      if (started && depth === 0) break;
    }

    if (!block.includes('correlationId')) {
      violations.push({
        file: filePath.replace(process.cwd() + '/', ''),
        line: i + 1,
        snippet: lines[i]!.trim(),
      });
    }
  }
}

if (violations.length === 0) {
  console.log(
    '✅ check-publish-event-correlation: all publishEvent calls in routes include correlationId',
  );
  process.exit(0);
} else {
  console.error(
    `❌ check-publish-event-correlation: ${violations.length} publishEvent call(s) missing correlationId`,
  );
  console.error('');
  console.error('Every publishEvent() call in apps/api/src/routes/ must include:');
  console.error("  correlationId: c.get('requestId') ?? undefined,");
  console.error('');
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  →  ${v.snippet}`);
  }
  console.error('');
  console.error(
    'Exemption: apps/api/src/jobs/ (no request context — use eventId as correlation anchor)',
  );
  process.exit(1);
}
