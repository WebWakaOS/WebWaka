# Write-Capable Built-in Tools — SA-5.x Expansion

## What & Why
The four built-in tools shipped in SA-5 are all read-only D1 queries. The AI agent
can look up inventory, sales, offerings, and schedules but cannot take any action.
The value of `function_call` is highest when the AI can act on what it discovers —
create a booking, draft an invoice, look up a customer — not just report data back.

This task adds five new built-in tools that perform writes or cross-entity lookups.
Critically, every write tool is HITL-aware: if the vertical's autonomy level is below
the threshold for autonomous writes (level < 3), the tool queues a HITL item instead
of writing directly and returns `{ deferred: true, queue_item_id: "..." }` to the
model. The model is instructed (via its system prompt) to inform the user that the
action is pending approval.

All monetary values in tool inputs and outputs use integer kobo (P9). All writes are
tenant-scoped (T3). Tool outputs never include raw PII beyond identifiers (P13).

## Done looks like
- **`customer-lookup`** — Given a name, phone fragment, or email fragment, returns
  matching contact/organisation records from the tenant's CRM tables (name, id,
  account_status, last_transaction_date). Read-only. No PII beyond what the caller
  already has.
- **`create-booking`** — Given `schedule_id`, `slot_id`, `contact_id`, and optional
  `notes`, creates a booking row and marks the slot as reserved. If autonomy level
  < 3, creates a HITL item instead and returns deferred status.
- **`create-invoice`** — Given `contact_id`, an array of line items
  (`{description, qty, unit_price_kobo}`), and optional `due_date`, creates a draft
  invoice row. P9: all prices are integer kobo. HITL-gated below autonomy level 3.
- **`send-notification`** — Given `contact_id`, `channel` (inapp | sms | email),
  and `message` (max 500 chars, PII-stripped before dispatch), queues a notification
  row. HITL-gated below autonomy level 2 (more conservative — notifications sent to
  external parties are high-risk).
- **`update-inventory`** — Given `product_id` and `delta` (positive = restock,
  negative = sale adjustment), updates `products.stock_qty`. Rejects if the result
  would be negative. HITL-gated below autonomy level 3.
- All 5 tools registered in `createDefaultToolRegistry()` in
  `packages/superagent/src/tools/index.ts`.
- `ToolExecutionContext` extended with `hitlService` and `autonomyLevel` so write
  tools can queue HITL items instead of writing directly.
- TypeScript: 0 errors. P9 monetary, P13 PII, and T3 tenant isolation governance
  checks all pass.
- Push to staging, CI green, merge to main.

## Out of scope
- Tools that send bulk messages or mass-modify inventory (single-item writes only)
- Payment-processing tools (handled by the dedicated payments package)
- Tools that delete records (irreversible destructive actions are out of scope for
  autonomous AI)

## Steps
1. **Extend `ToolExecutionContext`** — Add `hitlService: HitlService`,
   `autonomyLevel: 1 | 2 | 3`, and `userId: string` to the context interface in
   `tool-registry.ts`. Update the context construction in the `/chat` route to pass
   these. The HITL service and autonomy level are already resolved earlier in the
   request flow and just need to be threaded through.

2. **`customer-lookup` tool** — Query `contacts` and `organizations` by name/phone/
   email fragment (LIKE search, max 10 results). Strip raw PII from results: return
   `id`, `display_name`, `account_type`, `last_active_at` only. Read-only; no
   autonomy gating needed.

3. **`create-booking` tool** — Validate `schedule_id` and `slot_id` exist and belong
   to the tenant. If autonomy level ≥ 3, insert a booking row and mark the slot
   reserved in a D1 batch. Otherwise, call `hitlService.submit()` with a serialized
   payload and return `{ deferred: true, queue_item_id }`.

4. **`create-invoice` tool** — Validate `contact_id` belongs to tenant. Validate all
   `unit_price_kobo` are positive integers (P9). Compute `total_kobo` (sum of qty ×
   unit_price_kobo). If autonomy ≥ 3, insert into `invoices` with status `draft`.
   Otherwise queue HITL.

5. **`send-notification` tool** — Strip any PII from the `message` field using the
   existing `stripPii()` utility from `@webwaka/superagent`. Validate `channel` enum.
   If autonomy ≥ 2, insert into `notification_queue`. Otherwise queue HITL. This tool
   is more conservative (threshold 2 not 3) because notifications leave the platform.

6. **`update-inventory` tool** — Validate `product_id` belongs to tenant. Compute
   new stock: if negative after delta, return error `WOULD_MAKE_STOCK_NEGATIVE`.
   If autonomy ≥ 3, update `products.stock_qty` with a single D1 statement. Otherwise
   queue HITL.

7. **Register all 5 in `createDefaultToolRegistry()`** — Add all 5 new tool files to
   `packages/superagent/src/tools/index.ts`.

8. **Tool descriptions and parameter schemas** — Each tool's `parameters` JSON Schema
   must be precise enough for the model to call them correctly. Include `required`
   arrays, `enum` for `channel`, and `minimum: 1` for kobo fields. Descriptions must
   mention kobo units explicitly.

9. **Unit tests** — Add tests for each tool in a new
   `packages/superagent/src/tools/*.test.ts` covering: happy path, autonomy gating
   (mock level 2 → expect HITL submit called), P9 rejection for float inputs,
   T3 cross-tenant rejection.

10. **Push to staging, CI + governance checks green, merge to main.**

## Relevant files
- `packages/superagent/src/tool-registry.ts`
- `packages/superagent/src/tools/index.ts`
- `packages/superagent/src/tools/inventory-check.ts`
- `packages/superagent/src/tools/get-active-offerings.ts`
- `packages/superagent/src/hitl-service.ts`
- `packages/superagent/src/middleware.ts`
- `apps/api/src/routes/superagent.ts:368-480`
