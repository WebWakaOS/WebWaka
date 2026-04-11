/**
 * apps/api/src/types.ts — Re-export of Env for vertical route files.
 *
 * Vertical route files import from '../../types.js' (relative to src/routes/verticals/).
 * This file resolves that import and re-exports the canonical Env from env.ts.
 *
 * Do NOT add types here — all domain types live in @webwaka/types.
 * Worker bindings live in env.ts.
 */

export type { Env } from './env.js';
