/**
 * event-publisher.ts — re-export shim.
 * cases.ts imports from '../lib/event-publisher.js'; this forwards to publish-event.ts.
 */
export { publishEvent } from './publish-event.js';
export type { PublishEventParams } from './publish-event.js';
