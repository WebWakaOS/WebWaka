# DSAR Processor — Data Subject Access Request Fulfilment (NDPR COMP-002)

## What & Why
The DSAR request routes already exist (`POST /compliance/dsar/request`,
`GET /compliance/dsar/status/:id`, `POST /compliance/dsar/download/:id`). The
`dsar_requests` D1 table (migration 0383) stores requests. But nothing actually
processes them: no background job reads pending requests, compiles the user's data,
or writes the export anywhere. The download endpoint would return "not ready yet"
forever — the DSAR workflow is incomplete end-to-end.

Under NDPR (Nigeria Data Protection Regulation), a data controller must respond to
a valid Data Subject Access Request within 30 days. This task implements the
processor job that fulfils that obligation by compiling a complete JSON export of
everything the platform holds about the requesting user, storing it in Cloudflare R2
(or KV for small payloads), and marking the DSAR as `completed`.

The export is comprehensive: identity, consent records, AI usage history, wallet
transactions, notifications sent, audit events, profile data, entity claims,
relationships, and any vertical-specific data rows.

## Done looks like
- A Cloudflare Cron-triggered scheduled job (`apps/schedulers`) runs every 15 minutes
  and processes up to 10 pending DSAR requests per invocation
- For each pending request:
  - Gathers data from at least: `users`, `consent_history`, `ai_usage_events`,
    `ai_spend_events`, `wallet_ledger`, `notifications`, `audit_log`,
    `entity_profiles`, `dsar_requests` itself
  - Assembles a JSON structure with top-level keys per data category
  - Writes the JSON blob to Cloudflare R2 under a tenant-scoped path with a signed
    expiry of 7 days
  - Updates `dsar_requests.status` → `completed`, stores the R2 object key in
    `dsar_requests.export_key`, and sets `completed_at`
- `GET /compliance/dsar/status/:id` already returns `status`; after this task it
  also returns `expires_at` when status is `completed`
- `POST /compliance/dsar/download/:id` returns a pre-signed R2 URL valid for 1 hour
  (replacing the current KV lookup)
- Failed processing (e.g. D1 query error) sets `dsar_requests.status` → `failed`
  with an `error_message` column; the job retries failed requests up to 3 times
  (tracked in a `retry_count` column) before marking `permanently_failed`
- All data in the export is scoped strictly to the requesting `user_id` + `tenant_id`
  (T3) — cross-tenant data is structurally impossible
- The export JSON never logs to console or any external system (it may contain PII)
- D1 migration 0391 adds `export_key`, `retry_count`, `error_message`, `completed_at`
  columns to `dsar_requests` (ALTER TABLE — safe for SQLite D1 as additive changes)
- TypeScript: 0 errors; push to staging, CI green, merge to main

## Out of scope
- DSAR deletion requests (right to erasure — separate COMP-003 task, future work)
- Non-JSON export formats (CSV, PDF)
- Admin review/approval step before fulfilment (auto-fulfil for now)
- Vertical-specific data beyond the common tables listed above

## Steps
1. **D1 migration 0391** — ALTER TABLE `dsar_requests` ADD COLUMN `export_key TEXT`,
   ADD COLUMN `retry_count INTEGER NOT NULL DEFAULT 0`, ADD COLUMN `error_message
   TEXT`, ADD COLUMN `completed_at TEXT`. Include rollback file. Also ensure the
   `dsar_requests` table has an index on `(status, requested_at)` for efficient
   pending-queue polling.

2. **`DsarProcessorService` class** — Create
   `apps/schedulers/src/dsar-processor.ts`. Method `processNextBatch(env, limit=10)`:
   selects up to `limit` rows where `status = 'pending' AND retry_count < 3` ordered
   by `requested_at ASC`. For each row, calls `compileDsarExport()` then
   `storeExport()` then updates the row status.

3. **`compileDsarExport()` function** — Issues parallel D1 queries (using
   `Promise.all`) for each data category. Each query is `SELECT ... WHERE user_id=?
   AND tenant_id=?` (T3). Categories:
   - `identity`: users row (exclude password_hash, mfa_secret)
   - `consent`: consent_history rows
   - `ai_usage`: ai_usage_events rows (last 12 months, anonymised content)
   - `ai_spend`: ai_spend_events rows (amounts only, no message content)
   - `wallet`: wallet_ledger rows (last 12 months)
   - `notifications`: notifications rows (last 6 months)
   - `sessions`: auth_sessions rows (metadata only, no tokens)
   - `dsar_history`: prior dsar_requests rows for the user
   Returns a typed `DsarExportPayload` object.

4. **`storeExport()` function** — Serialises the `DsarExportPayload` to JSON. If
   payload is under 25 MB, stores in Cloudflare R2 under key
   `dsar/{tenant_id}/{request_id}.json`. Returns the R2 object key and an expiry
   timestamp (7 days from now). Handles R2 PUT errors with one retry.

5. **Cron trigger** — Register a `scheduled` handler in `apps/schedulers/src/index.ts`
   on cron pattern `*/15 * * * *` that calls `processNextBatch(env)`. Ensure the
   schedulers `wrangler.toml` lists both `DB` (D1) and the R2 bucket binding.

6. **Update `/compliance/dsar/download/:id`** — Replace the current KV lookup with
   an R2 pre-signed URL generation using the stored `export_key`. Return `{ url,
   expires_at }`. If R2 object not found (expired), return 410 Gone.

7. **Update `/compliance/dsar/status/:id`** — Add `completed_at` and `expires_at`
   (derived from completed_at + 7 days) to the response when status is `completed`.

8. **Unit tests** — Test `compileDsarExport` with a mocked D1 `D1Like` that verifies
   every query is tenant-scoped. Test `storeExport` with a mocked R2 binding.
   Test the retry logic: first call fails → retry_count incremented; third failure →
   permanently_failed.

9. **Push to staging, CI green, merge to main.**

## Relevant files
- `apps/api/src/routes/compliance.ts`
- `apps/schedulers/src/index.ts`
- `infra/db/migrations/0383_dsar_requests.sql`
- `infra/db/migrations/0383_dsar_requests.rollback.sql`
- `packages/superagent/src/consent-service.ts`
