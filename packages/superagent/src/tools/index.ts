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
import { customerLookupTool } from './customer-lookup.js';
import { createBookingTool } from './create-booking.js';
import { createInvoiceTool } from './create-invoice.js';
import { sendNotificationTool } from './send-notification.js';
import { updateInventoryTool } from './update-inventory.js';

export { inventoryCheckTool } from './inventory-check.js';
export { posRecentSalesTool } from './pos-recent-sales.js';
export { getActiveOfferingsTool } from './get-active-offerings.js';
export { scheduleAvailabilityTool } from './schedule-availability.js';
export { customerLookupTool } from './customer-lookup.js';
export { createBookingTool } from './create-booking.js';
export { createInvoiceTool } from './create-invoice.js';
export { sendNotificationTool } from './send-notification.js';
export { updateInventoryTool } from './update-inventory.js';

/**
 * Create a ToolRegistry pre-loaded with all 9 built-in platform tools.
 *
 * Read-only tools (4):
 *   inventory_check, pos_recent_sales, get_active_offerings, schedule_availability
 *
 * Write-capable tools — SA-5.x (5):
 *   customer_lookup  — read-only CRM search (no autonomy gating)
 *   create_booking   — HITL-gated at autonomy < 3
 *   create_invoice   — HITL-gated at autonomy < 3
 *   send_notification — HITL-gated at autonomy < 2 (most conservative)
 *   update_inventory — HITL-gated at autonomy < 3
 *
 * Returns a fresh registry instance each time (not a singleton).
 */
export function createDefaultToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();
  // Pillar 1 — read-only
  registry.register(inventoryCheckTool);
  registry.register(posRecentSalesTool);
  registry.register(getActiveOfferingsTool);
  registry.register(scheduleAvailabilityTool);
  // SA-5.x — write-capable
  registry.register(customerLookupTool);
  registry.register(createBookingTool);
  registry.register(createInvoiceTool);
  registry.register(sendNotificationTool);
  registry.register(updateInventoryTool);
  return registry;
}
