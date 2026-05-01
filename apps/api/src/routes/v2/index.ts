/**
 * API v2 Router (L-5 / ADR-0018)
 *
 * This router handles all /v2/* routes. It will receive breaking changes
 * that cannot be made backward-compatible in v1.
 *
 * Convention:
 *   - Mount breaking-change routes here (e.g. /v2/auth/login)
 *   - Keep v1 routes alive with Sunset headers for ≥90 days
 *   - See docs/adr/ADR-0018-api-versioning.md for full policy
 *
 * Currently empty — no breaking changes have been introduced yet.
 * The router is registered in router.ts so the /v2/ prefix is reserved.
 */

import { Hono } from 'hono';
import type { AppEnv } from '../../types/env.js';

export const v2Router = new Hono<AppEnv>();

// ── Placeholder ───────────────────────────────────────────────────────────────

v2Router.get('/', (c) => {
  return c.json({
    version: 2,
    status: 'reserved',
    message: 'API v2 is reserved for future breaking changes. Current stable version is v1.',
    v1_base: 'https://api.webwaka.com',
    documentation: 'https://api.webwaka.com/openapi',
    versioning_policy: 'https://api.webwaka.com/changelog',
  });
});

// Future v2 routes will be added here:
// v2Router.post('/auth/login', ...)
// v2Router.get('/workspaces', ...)
