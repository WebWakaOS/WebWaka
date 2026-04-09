# AI Autonomy and Agent Policy

**Status:** M8-AI Planning Baseline  
**Date:** 2026-04-08  
**Governance basis:** `docs/governance/ai-policy.md` rule 4 (sensitive workflows require HITL)  
**Note:** "Agent" here = AI agent, NOT the POS field agents in `infra/db/migrations/0022_agents.sql`

---

## 1. Autonomy Level Definitions

### L0 — Read-Only Assist
AI reads workspace data and provides suggestions or analysis. No action taken.

**Characteristics:**
- No writes to D1, KV, or external systems
- AI output displayed to user; user decides what to do
- No approval required beyond workspace AI being enabled

**Examples:**
- "Summarize this week's sales from the float ledger"
- "What are the top-performing offerings in my catalog?"
- "Suggest a better description for this product"

**Required entitlements:** `aiRights: true` (Growth+)

---

### L1 — Draft Generation
AI generates draft content (text, email, product descriptions) for human review before use.

**Characteristics:**
- Output is a draft — not published, sent, or actioned automatically
- User must explicitly choose to use the output
- No external API calls beyond AI provider

**Examples:**
- "Draft an email to all community members about the upcoming event"
- "Generate 5 product descriptions for my catalog"
- "Write a campaign update for my political profile"

**Required entitlements:** `aiRights: true` (Growth+)  
**HITL:** User review implied by draft nature; no system-enforced approval gate

---

### L2 — Supervised Action
AI proposes a specific action and executes it only after explicit user approval via UI.

**Characteristics:**
- System presents a summary of proposed action with all parameters visible
- One-click approve/reject UI required
- If approved: action logged with `approved_by: user_id, approved_at: timestamp`
- If rejected: action discarded; no data changed

**Examples:**
- "Schedule this social post for 9am tomorrow" → [Approve] [Edit] [Reject]
- "Send this OTP notification to 45 workspace members" → [Approve] [Edit] [Reject]
- "Update product pricing for all items in this category" → [Approve] [Review individually] [Reject]

**Required entitlements:** `aiRights: true` + `autonomy.supervised` flag in workspace AI settings  
**HITL:** System-enforced — action cannot execute without explicit approval event in `ai_hitl_events` table

---

### L3 — Batch Automation
AI executes a multi-step batch workflow. Each step is reviewed before proceeding.

**Characteristics:**
- Multi-step workflow presented as a plan before start
- User approves the plan; AI executes step by step
- Each step result shown; user can abort at any step
- All steps logged; reversible where possible

**Examples:**
- "Import 200 products from CSV, generate descriptions for each, and publish to catalog"
- "Send personalized WhatsApp messages to all 340 community members"

**Required entitlements:** `aiRights: true` + `autonomy.batch` + Enterprise/Partner plan  
**HITL:** Plan approval required; step-level abort capability required

---

### L4 — Autonomous Within Boundaries
AI executes within a defined read/write scope without per-action approval. Write permissions are scoped and bounded.

**Characteristics:**
- Workspace admin explicitly configures allowed write scope (e.g., "can update product descriptions but not prices")
- Write boundary enforced at DB layer — AI cannot write to tables/fields outside declared scope
- Actions logged in `ai_audit_logs` in real-time
- Rollback available for AI-initiated writes within 24 hours (soft-delete pattern)
- Anomaly detection: if AI writes deviate significantly from baseline, auto-pause and alert

**Examples:**
- Auto-respond to support chat inquiries (write to `support_messages` only)
- Auto-update product descriptions overnight (write to `offerings.description` only)
- Auto-categorize incoming leads (write to `lead_tags` only)

**Required entitlements:** `aiRights: true` + `autonomy.autonomous` + Enterprise plan + explicit workspace admin configuration  
**HITL:** Not per-action; but anomaly detection and audit review required

---

### L5 — Sensitive Autonomous
L4 behavior in a regulated/sensitive sector vertical.

**Characteristics:**
- All L4 requirements apply
- Additionally: `sensitiveSectorRights: true` required (Enterprise/Partner only)
- Human oversight role must be assigned in workspace
- All AI writes in sensitive sectors trigger an async review task in `ai_hitl_queue`
- Review task must be actioned within 72 hours or AI writes auto-rolled-back

**Sectors:** Political (Politician, Political Party), Medical (Clinic), Legal (Professional/Law), Financial advice  
**Examples:**
- AI schedules political events — human reviewer verifies before events go public
- AI draft response to patient inquiry — doctor reviews before message is sent
- AI generates legal document — lawyer reviews and signs off before finalization

**Required entitlements:** All L4 + `sensitiveSectorRights: true` + designated human reviewer role

---

## 2. Write Permissions Matrix

| Write Target | L0 | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|---|
| AI draft buffer (temp) | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `offerings.description` | ❌ | ❌ | ✅ (if approved) | ✅ (if plan approved) | ✅ (if scoped) | ✅ (+ review) |
| `social_posts` | ❌ | ❌ | ✅ (if approved) | ✅ | ✅ (if scoped) | ✅ (+ review) |
| `community_spaces.events` | ❌ | ❌ | ✅ (if approved) | ✅ | ✅ (if scoped) | ✅ (+ review) |
| `workspaces.*` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `subscriptions.*` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `billing_history.*` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `consent_records.*` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `float_ledger.*` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `individuals.*` (PII) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Absolute write prohibitions (no autonomy level grants these):**
- Financial records (`billing_history`, `float_ledger`, `pos_transactions`)
- Identity/KYC records (`kyc_records`, `consent_records`, `individuals` PII fields)
- Subscription and plan changes
- Tenant or workspace configuration
- Other tenants' data (T3 hard boundary)

---

## 3. Tool Permissions by Level

| Tool | L0 | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|---|
| D1 SELECT (own tenant) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| D1 INSERT (scoped tables) | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| D1 UPDATE (scoped fields) | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| D1 DELETE | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| External HTTP (outbound) | ❌ | ❌ | ❌ | ❌ | ✅ (whitelist only) | ✅ (whitelist + review) |
| Send message (WA/SMS) | ❌ | ❌ | ✅ (if approved) | ✅ | ✅ (if scoped) | ✅ (+ review) |
| Trigger webhook | ❌ | ❌ | ❌ | ✅ (if plan approved) | ✅ (if scoped) | ✅ (+ review) |
| Cross-tenant read | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Database Mutation Boundaries

AI agents can only write to explicitly whitelisted tables and fields. The whitelist is declared in the vertical's AI config and validated by the router at request time:

```typescript
// packages/ai-abstraction/src/autonomy.ts (planned)
export interface AIWriteBoundary {
  table: string;
  fields: string[];          // specific columns allowed
  filter?: string;           // WHERE clause template (must include tenant_id)
  maxRowsPerBatch?: number;  // safety cap
}

// Example: product description updater for Commerce vertical
const COMMERCE_AI_WRITE_BOUNDARY: AIWriteBoundary[] = [
  { table: 'offerings', fields: ['description', 'tags'], filter: 'workspace_id = :wid AND tenant_id = :tid', maxRowsPerBatch: 50 }
];
```

---

## 5. Vertical-Specific Agent Roles

Each vertical that supports autonomous AI declares its agent roles:

| Vertical | Agent Role | Autonomy Level | Write Boundary |
|---|---|---|---|
| Politician | Campaign Assistant | L1/L2 | `social_posts` (draft/supervised) |
| Political Party | Comms AI | L2 (HITL mandatory) | `community_spaces.announcements` |
| Motor Park | Operations AI | L1/L2 | `offerings` (routes/schedules) |
| Clinic | Patient Comms AI | L2 (HITL mandatory) | `support_messages` (draft) |
| Creator | Content AI | L1/L2 | `social_posts`, `offerings.description` |
| Market | Catalog AI | L3 | `offerings.*` (product data) |
| School | Admin AI | L2 | `community_spaces.events` |
| POS Business | Inventory AI | L2/L3 | `offerings` (inventory counts, prices) |
| NGO | Outreach AI | L2 | `community_spaces.announcements` |
| Professional | Client AI | L1/L2 | `offerings.description` |

---

## 6. Human Approval Thresholds

Scenarios that always require HITL regardless of autonomy level configured:

| Scenario | Reason |
|---|---|
| Any write affecting >100 records | Risk of mass data corruption |
| Any external message to >50 recipients | Risk of mass spam/abuse |
| Any action in medical/legal/political vertical | Regulatory requirement |
| Any financial data read (CBN compliance) | KYC tier verification required first |
| Any PII field access | NDPR consent must be pre-confirmed |
| AI-generated content for external publication in sensitive sector | Reputational and regulatory risk |
| Autonomous agent requesting tool not in its declared whitelist | Security boundary violation |

---

## 7. Logging and Rollback Policy

### AI Action Audit Log (`ai_audit_logs` — planned D1 table)

```sql
CREATE TABLE ai_audit_logs (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL,
  workspace_id    TEXT NOT NULL,
  user_id         TEXT,
  autonomy_level  INTEGER NOT NULL CHECK (autonomy_level BETWEEN 0 AND 5),
  action_type     TEXT NOT NULL,
  table_name      TEXT,
  field_names     TEXT,                    -- JSON array
  rows_affected   INTEGER DEFAULT 0,
  before_hash     TEXT,                    -- SHA-256 of affected data before change
  after_hash      TEXT,                    -- SHA-256 of affected data after change
  hitl_event_id   TEXT,                    -- FK to ai_hitl_events if HITL required
  rolled_back_at  INTEGER,
  created_at      INTEGER DEFAULT (unixepoch())
);
```

### Rollback Policy

- L2/L3 HITL-approved actions: rollback available for 24 hours via `DELETE /ai/audit/:id/rollback`
- L4/L5 autonomous actions: rollback available for 24 hours; anomaly-triggered auto-rollback
- Rollback eligibility: only if `before_hash` exists and affected rows still match expected state
- Financial/PII writes: no AI rollback — manual compliance process only
