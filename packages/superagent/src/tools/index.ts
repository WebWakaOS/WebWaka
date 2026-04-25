/**
 * Built-in tools for the WebWaka OS tool registry.
 * SA-5.x — Exports all platform-provided tool definitions and handlers.
 *
 * Usage:
 *   import { createDefaultToolRegistry } from '@webwaka/superagent/tools';
 *   const registry = createDefaultToolRegistry();
 *   // Optionally register additional tenant-specific tools:
 *   // registry.register({ definition: myTool, handler: myHandler });
 */

import { ToolRegistry } from '../tool-registry.js';
import { inventoryCheckTool } from './inventory-check.js';
import { posRecentSalesTool } from './pos-recent-sales.js';
import { getActiveOfferingsTool } from './get-active-offerings.js';
import { scheduleAvailabilityTool } from './schedule-availability.js';

export { inventoryCheckTool } from './inventory-check.js';
export { posRecentSalesTool } from './pos-recent-sales.js';
export { getActiveOfferingsTool } from './get-active-offerings.js';
export { scheduleAvailabilityTool } from './schedule-availability.js';

/**
 * Create a ToolRegistry pre-loaded with all 4 built-in platform tools.
 * Returns a fresh registry instance each time (not a singleton).
 */
export function createDefaultToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();
  registry.register(inventoryCheckTool);
  registry.register(posRecentSalesTool);
  registry.register(getActiveOfferingsTool);
  registry.register(scheduleAvailabilityTool);
  return registry;
}
