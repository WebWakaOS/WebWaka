/**
 * @webwaka/analytics — Public API
 *
 * Phase 2: Unified analytics trackEvent + workspace/group/campaign metrics.
 */

export type {
  AnalyticsEvent,
  TrackEventInput,
  WorkspaceMetrics,
  GroupMetrics,
  CampaignMetrics,
} from './types.js';

export { PII_FIELD_BLOCKLIST } from './types.js';

export { trackEvent, assertNoPii } from './tracker.js';
export type { D1Like as TrackerD1Like } from './tracker.js';

export { getWorkspaceMetrics, getGroupMetrics, getCampaignMetrics } from './query.js';
export type { D1Like as QueryD1Like } from './query.js';
