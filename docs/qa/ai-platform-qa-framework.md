# AI Platform QA Framework

**Status:** M8-AI Planning Baseline  
**Date:** 2026-04-08  
**Purpose:** Define how every AI feature will be validated  
**Applied at:** End of each M8-AI phase and for every vertical AI feature

---

## 1. Provider Failover Testing

### Test Cases

| ID | Scenario | Expected Behavior | How to Test |
|---|---|---|---|
| PFT-01 | Primary provider returns 429 (rate limit) | Router falls back to secondary provider within same request | Mock `fetch` to return 429 for primary; verify response from secondary |
| PFT-02 | Primary provider returns 500 | Router falls back after KV health cache set to 'failed' | Mock 500; verify secondary used; verify KV cache set |
| PFT-03 | Primary provider key is invalid (401) | Router marks key failed for 3600s; falls back | Mock 401; verify KV TTL = 3600; verify fallback used |
| PFT-04 | All providers unavailable | Returns `{ error: 'ai_unavailable', code: 503 }` | Mock all providers fail; verify 503 with retry_after |
| PFT-05 | User BYOK key valid | User BYOK used; no CU deducted; `funded_by = 'user_byok'` | Insert user key in D1 mock; verify adapter resolved from BYOK |
| PFT-06 | User BYOK key invalid, workspace BYOK valid | Falls back to workspace BYOK | Mock user key 401; verify workspace key used |
| PFT-07 | Both BYOK keys invalid | Falls back to platform key | Mock both BYOK 401; verify platform key used |
| PFT-08 | BYOK key fails mid-stream | Returns partial error; logs failure | Mock stream error mid-response |
| PFT-09 | Provider health cache hit (degraded) | Skips provider without calling it | Pre-set KV health cache to 'degraded'; verify no HTTP call to that provider |
| PFT-10 | Platform key pool rotation | Keys 1 and 2 share load | Mock key 1 as 429; verify key 2 used in same request |

**Minimum:** All 10 cases must pass before M8a-AI-2 is complete.

---

## 2. Billing Correctness Testing

| ID | Scenario | Expected Behavior | How to Test |
|---|---|---|---|
| BCT-01 | Text completion consumes correct CU | `credits_consumed = ceil(tokensIn/1000 + tokensOut/500)` | Mock AI response with known token counts; verify D1 deduction |
| BCT-02 | Subscription monthly CU consumed before credit pack | `trial_cu = 0` → deduct from `subscription_cu` first | Set trial to 0; verify `subscription_cu` decremented |
| BCT-03 | Credit pack CU consumed when subscription CU = 0 | Deduct from `purchased_cu` | Set subscription to 0; verify `purchased_cu` decremented |
| BCT-04 | BYOK funded — no CU deducted | `funded_by = 'user_byok'`; all credit balances unchanged | Mock BYOK key; verify no D1 balance change |
| BCT-05 | CU deduction is atomic (D1 transaction) | Concurrent requests cannot double-spend | Simulate concurrent requests; verify balance never goes below 0 |
| BCT-06 | Credit purchase updates balance correctly | `purchased_cu += pack_cu` | Mock Paystack webhook; verify `ai_credit_transactions` insert + balance update |
| BCT-07 | Trial credits expire | Trial CU unavailable after `trial_expires_at` | Set `trial_expires_at` in past; verify `trial_cu` = 0 effectively |
| BCT-08 | Admin CU grant recorded | `ai_credit_transactions` row with `type = 'admin_grant'`, `admin_user_id` set | Simulate admin grant API call |
| BCT-09 | `ai_usage_logs` written even on BYOK | `funded_by = 'user_byok'` logged | Mock BYOK; verify `ai_usage_logs` INSERT executed |
| BCT-10 | Billing record matches usage log | `ai_credit_transactions.cu_amount` = sum of `ai_usage_logs.credits_consumed` in period | Aggregate and cross-check |

---

## 3. Quota Exhaustion Testing

| ID | Scenario | Expected Behavior |
|---|---|---|
| QET-01 | All credit types = 0 | Returns `{ error: 'ai_quota_exhausted', topup_url: '/billing/ai-credits', code: 402 }` |
| QET-02 | Soft limit reached (90%) | Admin notification email triggered; AI requests continue |
| QET-03 | Hard limit exactly 0 | 402 returned; no AI call made; no provider contacted |
| QET-04 | BYOK active, credits = 0 | BYOK used; credits not checked (BYOK bypasses credit requirement) |
| QET-05 | Rate limit exceeded (60 req/min) | Returns `{ error: 'rate_limit_exceeded', retry_after_seconds: 60, code: 429 }` |
| QET-06 | Rate limit resets after window | Subsequent request succeeds | Advance KV TTL; verify next request succeeds |
| QET-07 | Image gen rate limit (5/min) | 6th image gen request in 60s returns 429 | |
| QET-08 | Per-workspace cap applied | Workspace with 1,000 CU monthly cap blocked at 1,001 CU | |

---

## 4. BYOK Behavior Testing

| ID | Scenario | Expected Behavior |
|---|---|---|
| BKT-01 | Register valid BYOK key | Key stored encrypted; `key_hash` computed; live validation succeeds |
| BKT-02 | Register invalid BYOK key | 400 returned with `{ error: 'byok_key_invalid' }`; not stored |
| BKT-03 | Revoke BYOK key | `is_active = 0`; subsequent requests fall back to next level |
| BKT-04 | User BYOK overrides workspace BYOK | User key used even when workspace key exists |
| BKT-05 | BYOK key for wrong capability | Falls through to platform key for unsupported capability |
| BKT-06 | Workspace admin cannot see raw key | GET `/ai/keys` returns masked key (`sk-***...***`) |
| BKT-07 | User key private from workspace admin | Workspace admin sees key volume metrics only, not masked key |
| BKT-08 | Duplicate key rejected | SHA-256 hash match → 409 Conflict |

---

## 5. Capability Routing Testing

| ID | Scenario | Expected Behavior |
|---|---|---|
| CRT-01 | Growth plan requests image gen | `requireAICapability(ctx, 'image_gen')` → 403 `EntitlementError` |
| CRT-02 | Enterprise plan requests image gen | Proceeds to provider resolution |
| CRT-03 | Free plan requests any AI | `requireAIAccess(ctx)` → 403 before any resolution |
| CRT-04 | Workspace AI disabled | 403 before resolution regardless of plan |
| CRT-05 | Embed request routed to embed-capable provider only | Anthropic skipped (no embed); OpenAI or Google used |
| CRT-06 | STT request routed to STT-capable provider | Anthropic skipped; OpenAI or Google used |
| CRT-07 | USSD session header detected | 503 `AI not available on USSD` returned immediately |
| CRT-08 | Sensitive sector + wrong plan | `sensitiveSectorRights` check → 403 |

---

## 6. Access Control Testing

| ID | Scenario | Expected Behavior |
|---|---|---|
| ACT-01 | Unauthenticated request to `/ai/complete` | 401 from JWT middleware |
| ACT-02 | Free plan user requests AI | 403 from `requireAIAccess()` |
| ACT-03 | Non-admin registers BYOK key | 403 from `requireRole('admin')` |
| ACT-04 | Non-super-admin calls `/admin/ai/*` | 403 from `requireRole('super_admin')` |
| ACT-05 | User reads another workspace's AI usage | 403 / 404 (T3 tenant isolation) |
| ACT-06 | Cross-tenant BYOK key reference | 404 (key exists but different tenant_id) |
| ACT-07 | Super-admin emergency disable | All AI requests return 503 within 60 seconds |

---

## 7. Logging and Audit Testing

| ID | Scenario | Expected Behavior |
|---|---|---|
| LAT-01 | Every AI completion logged | `ai_usage_logs` row created with all required fields |
| LAT-02 | BYOK usage logged | `funded_by = 'user_byok'` in log |
| LAT-03 | Failed AI request logged | `status = 'error'` in log |
| LAT-04 | Rate limited request logged | `status = 'rate_limited'` in log |
| LAT-05 | Quota exhausted logged | `status = 'quota_exhausted'` in log |
| LAT-06 | Log does not contain raw prompt | No `prompt` or `message_content` field in log |
| LAT-07 | Log does not contain raw BYOK key | No `api_key` field in log |
| LAT-08 | Admin CU grant creates audit record | `ai_credit_transactions` row with `type = 'admin_grant'` |
| LAT-09 | ai_usage_logs is append-only | No UPDATE or DELETE statements allowed on table |

---

## 8. Human Approval Boundary Testing

| ID | Scenario | Expected Behavior |
|---|---|---|
| HBT-01 | L2 action submitted without approval | HITL event created; action NOT executed until approval |
| HBT-02 | HITL event approved | Action executed; `ai_audit_logs` row created |
| HBT-03 | HITL event rejected | Action discarded; no D1 changes |
| HBT-04 | HITL event expires (72h) | Status → 'expired'; action not executed |
| HBT-05 | Political AI feature without HITL | Request blocked with `{ error: 'hitl_required' }` |
| HBT-06 | Medical AI feature without HITL | Same as HBT-05 |
| HBT-07 | L4 autonomous action exceeds row limit | Paused; anomaly alert triggered |
| HBT-08 | L4 autonomous action rolled back within 24h | Before state restored; `rolled_back_at` set |

---

## 9. Autonomy Restriction Testing

| ID | Scenario | Expected Behavior |
|---|---|---|
| ART-01 | L0 agent attempts D1 write | Blocked at boundary check — 403 |
| ART-02 | L1 agent attempts to send WhatsApp | Blocked — no send permission at L1 |
| ART-03 | L4 agent attempts to write `billing_history` | Blocked by absolute prohibition list |
| ART-04 | L4 agent attempts cross-tenant read | Blocked by T3 isolation in query |
| ART-05 | L4 agent attempts write outside declared boundary | Blocked — table not in `AIWriteBoundary[]` |
| ART-06 | L5 sensitive sector action without `sensitiveSectorRights` | 403 — plan does not allow sensitive sector |

---

## 10. Vertical Integration Testing

For each vertical AI feature (at vertical implementation time):

| Test | Assertion |
|---|---|
| Vertical AI config registered | `AI_CAPABILITY_SET` declared; no capability in set unsupported by plan |
| Prompt templates render correctly | No undefined variables in prompt output |
| Credit deduction uses correct CU rate | Capability CU rate matches `ai-billing-and-entitlements.md` |
| Write boundary enforced | L2+ features can only write to declared tables/fields |
| HITL triggers for declared sensitive features | HITL event created; action paused |
| USSD path excluded | `X-USSD-Session` header → 503 before AI call |
| No direct provider call in vertical code | grep `fetch('https://api.openai.com')` in vertical package = 0 results |

---

## QA Gate Definition (M8a-AI Complete)

All of the following must pass before M8a-AI is marked done:

- [ ] PFT-01 through PFT-10: Provider failover (10/10)
- [ ] BCT-01 through BCT-10: Billing correctness (10/10)
- [ ] QET-01 through QET-08: Quota exhaustion (8/8)
- [ ] BKT-01 through BKT-08: BYOK behavior (8/8)
- [ ] CRT-01 through CRT-08: Capability routing (8/8)
- [ ] ACT-01 through ACT-07: Access control (7/7)
- [ ] LAT-01 through LAT-09: Logging and audit (9/9)
- [ ] HBT-01 through HBT-08: Human approval (8/8)
- [ ] ART-01 through ART-06: Autonomy restrictions (6/6)
- [ ] `pnpm -r typecheck` passes (0 errors)
- [ ] Platform test total ≥ 812 (746 current + ≥66 new AI tests)
- [ ] Migrations 0037–0041 valid SQL
- [ ] No live AI provider calls in any test

**Total QA scenarios:** 74 + typecheck + test count gate + migration gate
