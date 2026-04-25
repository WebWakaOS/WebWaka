# Streaming SSE — Real-Time AI Response Delivery (SA-3.x)

## What & Why
The OpenAI-compat adapter already implements a `stream()` method that returns an
`AsyncIterable<string>`. The `/superagent/chat` route has never exposed it. Every
AI response — including long-form bio_generator, brand_copywriter, and
listing_enhancer outputs — currently blocks until the full completion arrives
before returning anything to the caller. For responses that take 5-30 seconds,
this creates a terrible UX and inflated time-to-first-token metrics.

This task exposes streaming via Server-Sent Events (SSE) on a dedicated route.
Cloudflare Workers have native `ReadableStream` support; the adapter's
`AsyncIterable` is bridged into an SSE-formatted `ReadableStream` using the
TransformStream API. Tool calls are NOT supported on the streaming route (the
multi-turn function_call loop requires synchronous round-trips); the streaming
route targets text-completion capabilities only.

## Done looks like
- `POST /superagent/chat/stream` accepts the same body as `/superagent/chat`
  (minus `tools` / `tool_choice`) and responds with `Content-Type: text/event-stream`
- SSE event format: `data: {"delta":"...","done":false}\n\n` per chunk; final
  event: `data: {"done":true,"usage":{...},"session_id":"...","waku_cu_charged":N}\n\n`
- An error event is sent if the adapter throws: `event: error\ndata: {"code":"...","message":"..."}\n\n`
- All the same guardrails apply as `/chat`: aiConsentGate, budget check, HITL gate,
  pre/post compliance checks — all evaluated before the stream begins
- WakaCU is charged optimistically at stream-start based on estimated input tokens;
  a correction event is sent at stream-end with the actual token count (and the D1
  spend event is written with the corrected amount)
- The `session_id` handling is identical to `/chat`: auto-create or resume; the full
  assistant message is appended to the session after the stream closes
- Capability guard: if `capability` is `function_call`, respond 400 with
  `STREAMING_NOT_SUPPORTED_FOR_TOOL_CALLS`
- CORS: the SSE route must include `Cache-Control: no-cache` and `X-Accel-Buffering: no`
  headers so proxies don't buffer the stream
- TypeScript: 0 errors; the `AIAdapter.stream()` optional method contract is
  satisfied by the existing openai-compat implementation
- Governance checks pass (P9 kobo integers, P13 no PII in events)
- Push to staging + CI green + merge to main

## Out of scope
- WebSocket transport (SSE is sufficient for unidirectional streaming)
- Streaming for `function_call` / tool-call rounds
- Client-side SDK or browser library (this task is server-only)
- Streaming for the HITL resume route

## Steps
1. **Capability guard and adapter check** — At the top of the stream handler, reject
   `function_call` with 400. Check `typeof adapter.stream === 'function'`; if the
   resolved adapter does not implement streaming (e.g. a future custom adapter),
   respond 501 `STREAMING_NOT_SUPPORTED_BY_PROVIDER`.

2. **Pre-flight guardrails** — Run the full pre-flight sequence synchronously before
   opening the stream: aiConsentGate, wallet load, resolveAdapter, budget check,
   HITL gate, compliance pre-check, PII strip. If any gate fails, return a normal
   JSON error response (not a stream).

3. **SSE ReadableStream bridge** — Create a `ReadableStream` whose `start()` pulls
   from the adapter's `stream()` AsyncIterable. Each string chunk is encoded as
   `data: {"delta":"<chunk>","done":false}\n\n`. On completion, write the terminal
   event with usage, session_id, and waku_cu_charged. On error, write an error event
   then close the stream.

4. **Post-stream accounting** — After the stream closes (all bytes flushed), fire-and-
   forget: append the accumulated assistant message to the session (if session_id
   present), write the spend event to `ai_spend_events` (with retry wrapper — same
   pattern as /chat), publish `AiResponseGenerated` event.

5. **Route registration** — Register `POST /superagent/chat/stream` in
   `superagent.ts` under the same auth + consent middleware as `/chat`. Return
   `c.body(stream, 200, { 'Content-Type': 'text/event-stream', 'Cache-Control':
   'no-cache', 'X-Accel-Buffering': 'no' })`.

6. **AIAdapter type update** — The `stream()` method is already declared optional on
   `AIAdapter` in `packages/ai-abstraction/src/types.ts`. No change needed.
   Verify the openai-compat implementation streams tools correctly by reading chunk
   JSON and skipping `tool_calls` delta objects (stream route doesn't process them).

7. **OpenAPI spec** — Document `POST /superagent/chat/stream` in `docs/openapi/v1.yaml`
   with `text/event-stream` response media type and the SSE event schema.

8. **Unit test** — Add a test in `apps/api/src/routes/superagent.test.ts` (or a new
   `superagent-stream.test.ts`) that mocks the adapter's `stream()` to yield three
   chunks, then verifies the SSE frame format, the terminal event structure, and that
   the spend write was called with the correct token count.

9. **Push to staging, CI green, merge to main.**

## Relevant files
- `apps/api/src/routes/superagent.ts:214-667`
- `packages/ai-adapters/src/openai-compat.ts:147-200`
- `packages/ai-abstraction/src/types.ts:140-220`
- `packages/superagent/src/credit-burn.ts`
- `packages/superagent/src/spend-controls.ts`
- `docs/openapi/v1.yaml:1425-1570`
