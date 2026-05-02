/**
 * @deprecated /support-groups — 308 Permanent Redirect → /groups
 *
 * Phase 0 rename (ADR-0042): /support-groups is superseded by /groups.
 * All HTTP clients MUST update to /groups. This redirect module will be
 * removed once all known consumers have migrated (target: Sprint 3 QA gate).
 *
 * Migration 0462 drops the shadow support_groups_* tables.
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';

export const supportGroupRoutes = new Hono<{ Bindings: Env }>();

supportGroupRoutes.all('/', (c) => {
  const url = new URL(c.req.url);
  return c.redirect('/groups' + url.search, 308);
});

supportGroupRoutes.all('/:path{.*}', (c) => {
  const url = new URL(c.req.url);
  const newPath = url.pathname.replace(/^\/support-groups/, '/groups');
  return c.redirect(newPath + url.search, 308);
});
