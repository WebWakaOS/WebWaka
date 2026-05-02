/**
 * WebWaka Log Tail Worker (L-1) — Cloudflare Workers entry point
 *
 * The tail handler logic lives in ./handler.ts.
 * Tests should import from './handler.js' to avoid the Vitest SSR interop issue
 * (`__vite_ssr_exportName__ is not defined`) caused by `export default {}` literals.
 */

import { tailHandler } from './handler.js';

export default tailHandler;
