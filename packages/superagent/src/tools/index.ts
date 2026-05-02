/**
 * Built-in tools for the WebWaka OS tool registry.
 * SA-5.x — Exports all platform-provided tool definitions and handlers.
 *
 * Tool inventory:
 *
 * READ-ONLY TOOLS (6):
 *   inventory_check        — Pillar 1: Check stock levels for a product
 *   pos_recent_sales       — Pillar 1: Fetch recent POS transactions
 *   get_active_offerings   — Pillar 1/2: List active products/services
 *   schedule_availability  — Pillar 1: Check booking/appointment availability
 *   search_offerings       — Pillar 3: Keyword search across catalogue (Wave 3)
 *   get_analytics_summary  — Pillar 1: Aggregated revenue/order stats (Wave 3)
 *
 * WRITE-CAPABLE TOOLS (8) — HITL-gated:
 *   customer_lookup        — CRM read (no autonomy gating)
 *   get_customer_history   — CRM read: purchase history (Wave 3)
 *   create_booking         — HITL-gated at autonomy < 3
 *   create_invoice         — HITL-gated at autonomy < 3
 *   send_notification      — HITL-gated at autonomy < 2
 *   update_inventory       — HITL-gated at autonomy < 3
 *   log_payment            — HITL-gated at autonomy < 3 (Wave 3)
 *   create_support_ticket  — HITL-gated at autonomy < 2 (Wave 3)
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
import { searchOfferingsTool } from './search-offerings.js';
import { getCustomerHistoryTool } from './get-customer-history.js';
import { getAnalyticsSummaryTool } from './get-analytics-summary.js';
import { logPaymentTool } from './log-payment.js';
import { createSupportTicketTool } from './create-support-ticket.js';

export { inventoryCheckTool } from './inventory-check.js';
export { posRecentSalesTool } from './pos-recent-sales.js';
export { getActiveOfferingsTool } from './get-active-offerings.js';
export { scheduleAvailabilityTool } from './schedule-availability.js';
export { customerLookupTool } from './customer-lookup.js';
export { createBookingTool } from './create-booking.js';
export { createInvoiceTool } from './create-invoice.js';
export { sendNotificationTool } from './send-notification.js';
export { updateInventoryTool } from './update-inventory.js';
export { searchOfferingsTool } from './search-offerings.js';
export { getCustomerHistoryTool } from './get-customer-history.js';
export { getAnalyticsSummaryTool } from './get-analytics-summary.js';
export { logPaymentTool } from './log-payment.js';
export { createSupportTicketTool } from './create-support-ticket.js';

/**
 * Create a ToolRegistry pre-loaded with all 14 built-in platform tools.
 * Returns a fresh registry instance each time (not a singleton).
 */
export function createDefaultToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();
  // Pillar 1 — read-only
  registry.register(inventoryCheckTool);
  registry.register(posRecentSalesTool);
  registry.register(getActiveOfferingsTool);
  registry.register(scheduleAvailabilityTool);
  // Wave 3 — read-only
  registry.register(searchOfferingsTool);
  registry.register(getAnalyticsSummaryTool);
  // Write-capable (existing)
  registry.register(customerLookupTool);
  registry.register(createBookingTool);
  registry.register(createInvoiceTool);
  registry.register(sendNotificationTool);
  registry.register(updateInventoryTool);
  // Wave 3 — write-capable
  registry.register(getCustomerHistoryTool);
  registry.register(logPaymentTool);
  registry.register(createSupportTicketTool);
  return registry;
}
