# Agent Sessions — Persistent Conversation State (SA-6.x)

## What & Why
Every `/superagent/chat` call is currently fully stateless: the client must resend
the entire message history on every request. This forces every integrator to maintain
conversation state externally, and makes multi-turn reasoning (the natural use-case for
`function_call`) needlessly expensive in tokens and fragile in client code.

Agent Sessions add a server-side conversation store backed by D1. A caller optionally
passes a `session_id`; if absent one is auto-created and returned. On each turn the
service appends the user message, AI response, and any tool call/result turns to the
session. Subsequent calls load the stored history and prepend it to the AIRequest
messages array, respecting the per-vertical context-window limit.

Sessions are tenant-scoped (T3), NDPR-aware (no PII stored beyond what the caller
sends — the consent gate already ran), TTL-capped (default 7 days, configurable per
vertical), and fully wipeable via a GDPR DELETE route.

## Done looks like
- `POST /superagent/chat` accepts optional `session_id` in body; response always
  includes `session_id` (new or echoed back)
- If `session_id` is new, a session row is created; all subsequent calls to the same
  session resume from stored history
- `GET /superagent/sessions/:id` returns the full ordered message history (role,
  content, tool_calls, timestamps) for the owning tenant/user
- `DELETE /superagent/sessions/:id` hard-deletes the session and all messages
  (GDPR compliance; 204 response)
- `GET /superagent/sessions` lists active sessions for the current user (paginated,
  cursor-based, `?limit` + `?cursor`)
- Context window enforcement: if accumulated token estimate exceeds the vertical's
  configured limit, oldest non-system messages are trimmed from the loaded history
  before being sent to the adapter (system prompt is always preserved)
- Sessions expire automatically after 7 days of inactivity (enforced at load time;
  expired sessions return 404)
- All D1 writes are tenant-scoped on `tenant_id` — no cross-tenant leakage (T3)
- TypeScript: 0 errors; governance checks pass (P9, P13)
- D1 migration 0390 staged and applied on staging

## Out of scope
- Session sharing across tenants or users
- Real-time session streaming (covered by the Streaming SSE task)
- Session branching or forking
- Vector-database semantic memory (long-term memory beyond the context window)

## Steps
1. **D1 migration 0390** — Create `ai_sessions` (id, tenant_id, user_id, workspace_id,
   vertical, title, created_at, last_active_at, expires_at, message_count) and
   `ai_session_messages` (id, session_id, tenant_id, role, content, tool_calls_json,
   tool_call_id, created_at, token_estimate) tables. Add index on
   (session_id, tenant_id) and TTL index on expires_at. Include rollback file.

2. **SessionService class** — Create `packages/superagent/src/session-service.ts`.
   Methods: `createSession()`, `getSession()`, `appendMessages()`, `loadHistory()`,
   `deleteSession()`, `listSessions()`, `pruneExpiredSessions()`. All methods are
   tenant-scoped. `loadHistory()` accepts a `maxTokens` param and trims oldest
   non-system messages when the estimate exceeds it (simple word-count heuristic:
   4 chars ≈ 1 token). Token estimates are stored per message row for cheap re-reads.

3. **Vertical context window config** — Add optional `contextWindowTokens` (default
   8192) to `VerticalAiConfig` in `vertical-ai-config.ts`. High-content verticals
   (brand_copywriter, listing_enhancer) can declare 16384; sensitive verticals stay
   at 4096.

4. **Wire SessionService into /chat** — In the `/superagent/chat` handler, check for
   `session_id` in the request body. If present, validate ownership (tenant + user).
   If absent, create a new session. Call `loadHistory()` to prepend stored messages
   to the `AIRequest.messages` array (after system prompt, before the new user
   message). After the AI response (and all tool rounds), call `appendMessages()` for
   the new user turn, all tool call/result turns, and the final assistant turn.
   Include `session_id` in the JSON response.

5. **Session CRUD routes** — Add to `superagent.ts`:
   `GET /superagent/sessions` (list, paginated),
   `GET /superagent/sessions/:id` (detail + messages),
   `DELETE /superagent/sessions/:id` (hard-delete, 204).
   All routes: authMiddleware + tenant isolation.

6. **Expiry pruning scheduler** — Add a Cloudflare Cron trigger in `wrangler.toml`
   (or the existing schedulers app) that calls `SessionService.pruneExpiredSessions()`
   once per hour. This hard-deletes rows where `expires_at < now()`.

7. **Export from @webwaka/superagent** — Add `SessionService` and related types to
   `packages/superagent/src/index.ts` exports.

8. **Unit tests** — Add `packages/superagent/src/session-service.test.ts` covering:
   create/load/append/trim/delete lifecycle; cross-tenant isolation; expiry logic;
   context window trimming correctness.

9. **Push to staging, verify CI green, merge to main** — Use GitHub REST API
   tree+commit method (GITHUB_PAT; regular `git push` times out). Repo:
   WebWakaOS/WebWaka. Push all changed files in one commit; include rollback SQL.

## Relevant files
- `apps/api/src/routes/superagent.ts:214-667`
- `packages/superagent/src/hitl-service.ts`
- `packages/superagent/src/index.ts`
- `packages/superagent/src/vertical-ai-config.ts:1-80`
- `packages/superagent/src/tool-registry.ts`
- `infra/db/migrations/0389_hitl_executed_status.sql`
- `infra/db/migrations/0389_hitl_executed_status.rollback.sql`
