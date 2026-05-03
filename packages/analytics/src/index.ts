/**
 * @webwaka/analytics — Analytics event taxonomy and emission utilities.
 * Wave 3 C6-5
 */
export { ANALYTICS_EVENTS, VALID_EVENT_NAMES, emitEvent } from './event-taxonomy.js';
export type { EventName } from './event-taxonomy.js';

// Phase 2 analytics query functions
export { getWorkspaceMetrics, getGroupMetrics, getCampaignMetrics } from './query.js';
export type { D1Like as QueryD1Like } from './query.js';
export type { WorkspaceMetrics, GroupMetrics, CampaignMetrics } from './types.js';
