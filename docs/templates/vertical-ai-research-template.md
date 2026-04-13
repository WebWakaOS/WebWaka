# Vertical AI Research Template

**Usage:** Complete this document for EVERY vertical BEFORE implementing any AI feature code.  
**Location:** Save as `docs/verticals/{vertical-slug}-ai-brief.md`  
**Authority:** `docs/governance/ai-integration-framework.md` — all verticals must use this template  

---

# [Vertical Name] — AI Research Brief

**Vertical Slug:** `{slug}`  
**Priority:** P1 / P2 / P3  
**Milestone Target:** M8b / M8c / M8d / M8e / M9 / M10  
**Sensitive Sector:** Yes / No  
**Date Completed:** YYYY-MM-DD

---

## 1. Vertical Profile (from verticals-master-plan.md)

| Field | Value |
|---|---|
| Category | politics / transport / civic / commerce / health / education / professional / creator |
| Entity Type | individual / organization / place |
| Required KYC Tier | 0 / 1 / 2 / 3 |
| Requires CAC | Yes / No |
| Requires FRSC | Yes / No |
| Requires IT (Incorporated Trustees) | Yes / No |
| Requires Community Module | Yes / No |
| Requires Social Module | Yes / No |
| Sensitive Sector | Yes / No |

---

## 2. AI Use Case Inventory (50+ features target — list all plausible)

For each use case, document the following:

### [Use Case Name]

| Field | Value |
|---|---|
| Description | One sentence description of what the AI does |
| User Story | "As a [role], I want AI to [action] so that [outcome]" |
| Capability Required | text / summarize / classify / embed / stt / tts / image_gen / image_understand / research / agentic |
| Data Required (Input) | What data does AI read? Cite D1 table and column names |
| Output | What does AI produce? Where does it go? |
| Autonomy Level | L0 (read only) / L1 (draft) / L2 (supervised) / L3 (batch) / L4 (autonomous) / L5 (sensitive autonomous) |
| Write Boundary | If L2+: which tables, which fields, max rows per batch |
| HITL Required | Yes / No / Sometimes (when?) |
| Minimum Plan | growth / pro / enterprise |
| Credit Units Estimated | How many CU per invocation? |
| NDPR Compliance | Does this use PII? Consent required? Which consent type? |
| CBN KYC Requirement | Minimum KYC tier if financial context? |
| Nigeria-Specific Considerations | Language (PCM/Yoruba/Igbo/Hausa)? Regulatory constraint? Local context? |
| Priority | Must Have / Should Have / Nice to Have |

**Repeat this block for each use case.**

---

## 3. AI Capability Set Declaration

Based on all use cases above, declare the minimum required capability set:

```typescript
// packages/verticals-{slug}/src/ai-config.ts (to be created during implementation)
import type { AICapabilitySet } from '@webwaka/ai';

export const AI_CAPABILITY_SET: AICapabilitySet = [
  'text',         // if any use case uses text generation
  'summarize',    // if any use case uses summarization
  'classify',     // if any use case uses classification
  // ... add only what is actually needed
] as const;
```

---

## 4. Provider / Model Mapping

For each capability in the set above:

| Capability | Preferred Model | Fallback Model | Why This Model |
|---|---|---|---|
| text | gpt-4o-mini | claude-3-haiku | Cost-optimized for high-frequency |
| summarize | gpt-4o-mini | claude-3-haiku | Short context sufficient |
| ... | ... | ... | ... |

**Nigeria-specific model considerations:**
- Does any capability require Pidgin English (PCM) support? (Note: GPT-4o and Claude have better PCM support than Gemini as of 2026)
- Does any capability require Yoruba / Igbo / Hausa? (Google Gemini has stronger indigenous language support)
- Is low-latency more important than quality for this vertical? (Use 'cost' tier models)

---

## 5. Billing Mode

| Aspect | Decision |
|---|---|
| Minimum plan for any AI | Growth / Pro / Enterprise |
| BYOK encouraged | Yes / No (if vertical's users are technically sophisticated) |
| Estimated monthly CU usage per active workspace | N CU |
| Credit pack recommendation to customers | Starter / Growth / Pro / Enterprise pack |
| USSD path excluded | Yes (all verticals) — confirm no AI on USSD paths |

---

## 6. Autonomy Level Summary

| Use Case (short name) | Level | HITL | Write Boundary |
|---|---|---|---|
| [use case 1] | L0 | No | Read-only |
| [use case 2] | L1 | No (draft) | None |
| [use case 3] | L2 | Yes | `offerings.description` |
| ... | ... | ... | ... |

**Maximum autonomy level declared for this vertical:** L0 / L1 / L2 / L3 / L4 / L5

---

## 7. Fallback Chain

```
Primary capability path:
  → [user BYOK → workspace BYOK → platform: openai → platform: anthropic → platform: google]

For voice (if applicable):
  → [platform: openai whisper → platform: google chirp]

Degraded mode (no AI available):
  → [describe what the vertical does without AI — must still function]
```

---

## 8. Admin Controls

| Control | Who | Default | Rationale |
|---|---|---|---|
| AI enabled for this vertical type | Workspace admin | Off (must enable) | Opt-in |
| [Specific capability] enabled | Workspace admin | Off for L3+ | Safety |
| HITL required globally for this vertical | Super admin (sensitive sectors) | On | Regulatory |
| User BYOK allowed | Per plan | Per plan | |

---

## 9. Compliance Constraints

### NDPR
- [ ] Does any AI feature process personal data (name, phone, BVN, NIN, location)?
- [ ] If yes: which `consent_records.data_type` is required?
- [ ] Is data retained after AI processing? For how long?
- [ ] Is data shared with AI provider? (Yes — per ai-policy.md rule; must be disclosed to user)

### CBN KYC
- [ ] Does any AI feature provide financial analysis or advice?
- [ ] If yes: minimum KYC tier required before feature available?
- [ ] Does any AI feature trigger or suggest financial transactions?

### NCC / NITDA
- [ ] Does any AI feature use voice or SMS channels?
- [ ] Is AI-generated content published on Nigeria-registered domain?

### Vertical-Specific Regulation
- [ ] Are there sector-specific regulations that constrain AI behavior?
- [ ] Examples: NMA (medical), NBA (legal), INEC (political), APCON (advertising)

---

## 10. Feature Flags

| Feature | Flag Name | Default | Controlled By |
|---|---|---|---|
| [AI feature 1] | `ai_{slug}_{feature}` | false | Workspace admin |
| [AI feature 2] | `ai_{slug}_{feature}` | false | Super admin + Workspace admin |
| ... | | | |

---

## 11. Testing Requirements

For each AI feature that will be implemented:

| Feature | Mock Strategy | Test Count | Test Focus |
|---|---|---|---|
| [feature] | Mock `resolveAdapter()` return | 3 | Entitlement check, credit deduction, output format |
| [feature] | Mock `resolveAdapter()` return | 2 | HITL trigger, fallback |
| ... | | | |

**Total minimum tests for this vertical's AI features:** N tests

**Required mocks:**
- `resolveAdapter()` — always mock; never call live providers in tests
- `deductCredits()` — mock D1 transaction
- `logAIUsage()` — mock `ctx.waitUntil()`

---

## 12. Implementation Checklist

Before writing any AI feature code for this vertical:

- [ ] This document is complete (all 11 sections filled)
- [ ] Reviewed by: [Name / Agent]
- [ ] `AI_CAPABILITY_SET` declared
- [ ] Maximum autonomy level confirmed
- [ ] Write boundaries defined for all L2+ features
- [ ] HITL requirement confirmed for sensitive use cases
- [ ] NDPR compliance reviewed
- [ ] CBN KYC requirements noted
- [ ] No AI feature calls provider directly (routes through `resolveAdapter()`)
- [ ] `docs/verticals/{slug}-ai-brief.md` saved and committed to main before implementation starts

---

## Section 13: SuperAgent Integration Declaration

> **Added 2026-04-13 (SuperAgent alignment)** — Required for all verticals using AI.

Every vertical must complete this section before Phase 2 implementation begins.

| Declaration | Value |
|------------|-------|
| `capability_set[]` | List the `AICapability` values used (e.g., `text_generation`, `summarization`) |
| `autonomy_level` | L0–L5 per the autonomy policy in `docs/governance/ai-agent-autonomy.md` |
| `hitl_required` | `true` / `false` per use case — L3+ always requires `true` |
| `superagent_sdk_method` | The `packages/superagent-sdk` method called (e.g., `superagent.generate()`) |
| `sensitive_sector` | `true` if vertical handles medical, legal, financial, or political data |

**Example (POS Business vertical):**

```typescript
// packages/verticals-pos-business/src/ai.config.ts
export const AI_CONFIG = {
  capability_set: ['text_generation', 'summarization', 'analytics_insights'],
  use_cases: [
    {
      name: 'inventory_forecast',
      autonomy_level: 'L2',
      hitl_required: false,
      superagent_sdk_method: 'superagent.generate',
    },
    {
      name: 'anomaly_alert',
      autonomy_level: 'L1',
      hitl_required: false,
      superagent_sdk_method: 'superagent.analyze',
    },
  ],
  sensitive_sector: false,
} as const;
```

**Validation rule:** Any vertical with `autonomy_level >= L3` for any use case MUST set `hitl_required: true` for that use case and ensure `workspace_ai_settings.autonomy.batch` or `autonomy.autonomous` is enabled for the workspace.
