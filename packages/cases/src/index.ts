/**
 * @webwaka/cases — Public API (Phase 1)
 *
 * Case management: open → assign → note → resolve → close lifecycle.
 *
 * Linked to DB migrations:
 *   0438 — cases + case_notes tables
 *   0439 — case_notification_rules table + platform defaults
 */

export * from './types.js';
export {
  createCase,
  getCase,
  listCases,
  assignCase,
  addNote,
  listNotes,
  resolveCase,
  closeCase,
  reopenCase,
  getCaseSummary,
} from './repository.js';
export {
  getCaseEntitlements,
  assertCasesEnabled,
  assertSlaEnabled,
  assertElectoralCasesEnabled,
} from './entitlements.js';

export const PACKAGE_VERSION = '0.1.0';
