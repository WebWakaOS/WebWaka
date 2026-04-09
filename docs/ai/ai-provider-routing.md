# WebWaka AI Provider Routing

**Status:** LIVE — Updated after ADL-010 (SuperAgent Aggregator-Only Architecture)
**Date:** 2026-04-09
**Supersedes:** Original M8-AI planning draft (provider keys table)
**Authority:** Governed by `docs/governance/superagent/06-governance-rules.md` (Rules G1–G10)

---

## 1. Platform Key Hierarchy (ADL-010)

Per ADL-010, WebWaka platform-level AI traffic routes exclusively through AI aggregators.
No direct OpenAI / Anthropic / Google contracts are maintained for **platform keys**.

| Key Level | Type | Source | Consumed By |
|---|---|---|---|
| Level 1 — User BYOK | User-supplied | `ai_provider_keys WHERE scope = 'user'` | User's own API calls |
| Level 2 — Workspace BYOK | Workspace-supplied | `ai_provider_keys WHERE scope = 'workspace'` | Workspace-wide AI features |
| Level 3 — SuperAgent managed | Platform-issued | `superagent_keys` (KV encrypted) | WakaCU-billed calls |
| Level 4 — Platform aggregator | Platform-funded | `env.ts` aggregator keys | Free tier / trial only |

**Resolution order:** Level 1 → Level 2 → Level 3 → Level 4. First non-null, non-revoked key wins.

### 1.1 Platform Aggregator Keys (Level 4)

```
OPENROUTER_API_KEY_1   — Primary aggregator (200+ models, automatic failover)
OPENROUTER_API_KEY_2   — Secondary OpenRouter key (load split / rotation)
TOGETHER_API_KEY_1     — Open-source model access (Llama, Mistral, FLUX)
GROQ_API_KEY_1         — Latency-critical paths (Groq Llama: ~300 tok/s)
EDEN_AI_KEY_1          — Multimodal: STT, TTS, translation (Nigerian languages)
```

**Not present in `env.ts`:** `OPENAI_API_KEY_*`, `ANTHROPIC_API_KEY_*`, `GOOGLE_AI_API_KEY_*`
These are user/workspace BYOK only — never platform keys (ADL-010).

---

## 2. Aggregator Selection Logic

```typescript
// Simplified from packages/ai-abstraction/src/openai-compat.ts
// Aggregator selection based on: capability, model tier, health, cost
const AGGREGATOR_ROUTING: Record<string, string[]> = {
  text:          ['openrouter', 'groq', 'together'],
  embedding:     ['openrouter', 'together'],
  stt:           ['groq', 'openrouter', 'edenai'],
  tts:           ['edenai', 'openrouter'],
  translation:   ['edenai', 'openrouter'],
  vision:        ['openrouter', 'edenai'],
  image_gen:     ['together', 'openrouter'],
};
```

Routing engine (`resolveAdapter()`) selects the first healthy aggregator for the requested capability. Health is checked via periodic probe (Cloudflare Cron Trigger, every 5 minutes).

---

## 3. BYOK Provider Support

Users and workspaces may supply their own keys for direct providers:

| Provider | Adapter File | Key Column | BYOK Scope |
|---|---|---|---|
| OpenAI | `openai-compat.ts` | `openai_api_key` | user, workspace |
| Anthropic | `anthropic.ts` | `anthropic_api_key` | user, workspace |
| Google | `google.ts` | `google_api_key` | user, workspace |
| OpenRouter | `openai-compat.ts` | `openrouter_api_key` | workspace |
| Groq | `openai-compat.ts` | `groq_api_key` | workspace |

BYOK keys are stored in `ai_provider_keys` table (migration 0036), encrypted at rest in Cloudflare KV. They are **never** stored in D1 plaintext.

---

## 4. NDPR Consent Gate — P10 (Critical)

**Rule G6 (binding):** No AI-generated content may be delivered via an outbound contact channel without an active consent record.

This applies to any AI feature that sends output through a contact channel, including:
- AI-drafted OTP messages (if AI is used to personalise OTP copy)
- AI-generated notifications or marketing messages
- AI support chat responses sent via WhatsApp / SMS / Telegram

### 4.1 Consent Check Before AI-Generated Outbound

```typescript
// Required before ANY AI-generated content is sent via contact channels
await assertChannelConsent(db, {
  userId,
  tenantId,
  dataType: 'ai_generated_message', // or 'marketing', 'otp', etc.
  purpose: 'AI-assisted communication',
});
// Uses consent_records table — same P12 enforcement as non-AI outbound
```

The `consent_records` table (migration 0017) enforces this at the database level:

```sql
SELECT id FROM consent_records
WHERE user_id = ? AND data_type = ? AND tenant_id = ?
  AND withdrawn_at IS NULL
LIMIT 1;
```

If no consent record exists, `ContactError { code: 'CONSENT_REQUIRED' }` is thrown (HTTP 403). **The AI call must not be made.** Generate the response first only if consent is confirmed.

### 4.2 NDPR Article Cross-References

| NDPR Article | AI Routing Implication |
|---|---|
| Art. 2.1(a) — Lawful processing | All AI processing requires at least implied consent from the user initiating the request |
| Art. 2.1(c) — Data minimisation | AI routing must not log user prompt content unless `ai_usage_logs.log_prompt = true` and user consented |
| Art. 2.1(d) — Purpose limitation | AI usage logged in `ai_usage_logs` must specify `purpose`; repurposing for training prohibited without explicit consent |
| Art. 2.3 — Data subject rights | Users may withdraw AI processing consent via `DELETE /consent/ai` — routing engine must re-check on every request |

---

## 5. USSD Exception (ADL-006, Rule G7)

AI routing does NOT apply to USSD sessions (`apps/ussd-gateway`).

USSD is a synchronous, latency-constrained protocol. AI inference (typical P50: 800ms–3s) exceeds USSD session timeout (typically 180s total, but each exchange must complete in <3s for USSD GW compatibility).

**Rule G7 is absolute:** No AI calls from any USSD FSM branch. USSD responses are deterministic, pre-computed text only.

---

## 6. Failover and Error Handling

When an aggregator returns a 5xx or times out:
1. Routing engine marks the aggregator as degraded (KV key: `health:{aggregator}:degraded = 1`, TTL 300s)
2. Next aggregator in capability list is tried (max 2 retries)
3. If all aggregators fail: return HTTP 503 with `{ error: 'AI_UNAVAILABLE', retryAfter: 30 }`
4. WakaCU is **not deducted** on failed requests

---

## 7. Related Documents

- `docs/governance/superagent/02-product-spec.md` — WakaCU pricing and tiers
- `docs/governance/superagent/03-system-architecture.md` — ADL-010, full routing engine architecture
- `docs/governance/superagent/06-governance-rules.md` — Binding governance rules G1–G10
- `docs/governance/ai-architecture-decision-log.md` — ADL-001 through ADL-010
- `docs/governance/platform-invariants.md` — P10, P12, P13 (consent and identity)
