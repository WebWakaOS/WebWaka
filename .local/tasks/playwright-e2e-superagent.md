# Playwright E2E — SuperAgent Cycles + Visual Regression (Cycle 09)

## What & Why
The staging CI pipeline runs Playwright Cycles 01–08 but Cycle 09 (visual regression)
is explicitly excluded (`# excluded from CI: it requires snapshot baselines`). More
critically, there are zero E2E tests for any SuperAgent route: no coverage of
`/superagent/chat`, the HITL lifecycle, the tool-call round-trip, streaming, agent
sessions, the partner-pool report, or the vertical capability API. All of these were
tested only manually or by TypeScript compilation.

This task has two parts:
A. **SuperAgent Playwright Cycle 10** — A new E2E test cycle covering all SuperAgent
   routes end-to-end against the staging environment (API-level, not browser UI).
B. **Visual Regression Cycle 09** — Establish the snapshot baselines and wire Cycle
   09 into a separate non-blocking CI step that uploads the report as an artefact
   (failures produce a diff report but do not block the release gate).

Together these bring the platform to full automated coverage of both functional and
visual correctness.

## Done looks like
**Cycle 10 — SuperAgent (API-level):**
- `POST /superagent/consent` → grant consent; verify 201
- `POST /superagent/chat` with `superagent_chat` capability → verify provider,
  model, response.content, usage fields present
- `POST /superagent/chat` with `function_call` + `inventory-check` tool →
  verify tool is called (mock adapter response with `finish_reason: tool_calls`),
  verify `tool_rounds: 1`, `tool_calls_executed: 1` in response
- `POST /superagent/chat` with a session-enabled request → verify `session_id`
  returned; second call to same session → verify history is prepended (response
  length increases)
- `POST /superagent/chat/stream` → verify SSE frames arrive, terminal event has
  `done: true` and `waku_cu_charged`
- HITL lifecycle: submit via `/superagent/hitl/submit` → verify `queue_item_id`;
  approve via `/superagent/hitl/:id/review` with admin token → verify 200; resume
  via `/superagent/hitl/:id/resume` → verify final AI response
- `GET /superagent/partner-pool/report` → verify summary totals structure
- `GET /superagent/vertical/retail/capabilities` → verify `allowedCapabilities` array
- `GET /superagent/capabilities/check?capability=function_call` for a prohibited
  vertical → verify `allowed: false, prohibited: true`
- `GET /superagent/sessions` → verify list returns created session
- `DELETE /superagent/sessions/:id` → verify 204; subsequent GET → 404

**Cycle 09 — Visual Regression:**
- Baseline screenshots captured for: platform-admin index, wallet dashboard,
  partner-admin landing, workspace-app home (desktop + mobile viewports)
- CI step runs Cycle 09 in `continue-on-error: true` mode; uploads Playwright HTML
  report as a CI artefact named `playwright-report-visual-cycle09-{sha}`
- On diff, the artefact diff images are downloadable from the CI run; no release gate
  is blocked (this is a review step, not a hard gate)
- Snapshot baseline images committed to `e2e/snapshots/` (Git LFS if >5 MB each)

**Both cycles:**
- All tests pass on staging environment (non-mock — real Cloudflare Worker endpoints)
- TypeScript: 0 errors in test files
- Push to staging; new CI step `Cycle 10 — SuperAgent` appears green in the Deploy
  Staging workflow
- Push to main; merge

## Out of scope
- UI-level browser tests for the workspace-app React frontend (API-level only for
  SuperAgent tests)
- Load testing or performance benchmarks
- Visual regression for all 159 vertical admin UIs (baseline set limited to the
  4 core admin interfaces)

## Steps
1. **Test fixture setup** — Create `e2e/fixtures/superagent.ts` with reusable
   helpers: `grantConsent(apiBase, token)`, `chatRequest(body)`,
   `streamRequest(body)`, `adminToken()`. Use environment variables
   `E2E_TENANT_ID`, `E2E_API_KEY`, `E2E_ADMIN_API_KEY`, `E2E_WORKSPACE_ID`.

2. **Cycle 10 spec file** — Create `e2e/cycle10-superagent.spec.ts`. Structure
   tests as `test.describe` blocks per feature: consent, chat (text), chat
   (function_call), streaming, sessions, HITL lifecycle, analytics routes.
   Use `test.beforeAll` to grant consent once per suite.

3. **Mock adapter shim for function_call tests** — The staging worker must resolve
   a real adapter; use a minimal test vertical (`vertical: 'retail'`) and a BYOK key
   seeded via the QA seed script pointing to a cheap real provider (groq llama3)
   so tool call responses are real but low-cost. Document the required
   `E2E_BYOK_GROQ_KEY` secret in the CI workflow.

4. **HITL lifecycle test** — The HITL submit test needs a vertical with autonomy
   level 2 or 3 so the gate triggers. Use `vertical: 'health-clinic'` (autonomy L3).
   The test must carry two different JWTs: a regular user JWT and an admin JWT.
   Add `E2E_ADMIN_API_KEY` to the deploy-staging workflow env vars.

5. **Session continuity test** — Two sequential `POST /superagent/chat` calls with
   the same `session_id`. The second response's `usage.input_tokens` must be higher
   than the first's (proves history was prepended). Assert on the delta, not on
   absolute values (provider response size is variable).

6. **Streaming test** — Use `fetch` with `ReadableStream` reader. Accumulate SSE
   frames into an array. Assert at least one `done: false` frame exists, and
   exactly one `done: true` terminal frame exists with `waku_cu_charged > 0`.

7. **Visual regression spec** — Create `e2e/cycle09-visual.spec.ts`. Use
   `page.screenshot()` with `fullPage: true` at desktop (1280×800) and mobile
   (375×812) viewports for each of the 4 admin pages. Compare with
   `expect(screenshot).toMatchSnapshot()`. Add `--update-snapshots` to the baseline
   capture npm script.

8. **CI workflow updates** — In `.github/workflows/deploy-staging.yml`, add:
   - After Cycle 08: `Cycle 09 — Visual Regression` step with `continue-on-error: true`
     and artefact upload.
   - After Cycle 08: `Cycle 10 — SuperAgent` step as a hard gate (not
     `continue-on-error`).
   - Add required secrets: `E2E_ADMIN_API_KEY`, `E2E_BYOK_GROQ_KEY`.

9. **Baseline snapshot commit** — Run Cycle 09 once against staging with
   `--update-snapshots`, commit the resulting PNG files in `e2e/snapshots/` to
   the repo (use Git LFS if any snapshot exceeds 5 MB).

10. **Push to staging, all cycles green (Cycle 09 may show expected diff on first
    run since baseline is brand new), merge to main.**

## Relevant files
- `.github/workflows/deploy-staging.yml:289-335`
- `.github/workflows/deploy-main.yml`
- `apps/api/src/routes/superagent.ts`
- `apps/api/src/routes/compliance.ts`
