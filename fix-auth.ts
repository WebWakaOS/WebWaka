import fs from 'fs';

let content = fs.readFileSync('packages/auth/src/ai-hooks.ts', 'utf8');

content = content.replace('db: any,', 'db: import("@cloudflare/workers-types").D1Database,');
content = content.replace('first() as any', 'first<{ granted: number }>()');

fs.writeFileSync('packages/auth/src/ai-hooks.ts', content);
