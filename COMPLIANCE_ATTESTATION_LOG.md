# WebWaka OS — Compliance Attestation Log

**Purpose:** Sign-off record for the 12 TC-IDs requiring manual witness in addition to automated test execution.  
**Baseline:** `WebWaka_OS_QA_Execution_Plan.md` v1.0 §6 Compliance Sign-off  
**Frozen baseline:** `WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN`  
**Required before:** Production deployment gate (CYCLE-04 completion)

---

## Instructions for Compliance Witnesses

For each TC-ID below:
1. Run the automated test: `pnpm test:compliance` (or the per-cycle command listed)
2. Perform the manual DB/log inspection steps in the **Manual Action** column
3. Record your findings in the **Evidence** column
4. Sign and date the **Attestation** column
5. If any step FAILS, record the failure in **Notes** and raise a P0 blocker immediately

Do NOT sign off on a TC-ID until both the automated test passes AND the manual steps are completed.  
All sign-offs must be from a named individual with their role — anonymous sign-offs are invalid.

---

## Attestation Table

### TC-ID001 — BVN Hash-Only Storage (CBN R7)

| Field | Value |
|---|---|
| **TC-ID** | TC-ID001 |
| **Regulatory basis** | CBN R7 (no raw BVN stored) |
| **Automated test** | `tests/e2e/api/11-compliance-invariants.e2e.ts` — TC-ID001 suite |
| **Run command** | `pnpm test:compliance` |
| **Manual action** | After seeding + API call: run `SELECT bvn_hash, bvn FROM hl_users WHERE id = 'a0000000-0000-4000-a000-000000000002'` — `bvn` column must be NULL or absent; `bvn_hash` must be a 64-character hex string (SHA-256) |
| **Expected evidence** | `bvn` = NULL; `bvn_hash` = 64-char hex; no raw BVN in `wrangler tail` logs |
| **Automated result** | ☐ PASS ☐ FAIL — Date: ________ Tested by: ________ |
| **Manual DB query result** | |
| **Manual log inspection result** | |
| **Attestation** | ☐ SIGNED OFF — Name: ________ Role: ________ Date: ________ |
| **Notes** | |

---

### TC-INV004 — Raw BVN/NIN Never in Logs or DB (CBN R7 / NDPR P6)

| Field | Value |
|---|---|
| **TC-ID** | TC-INV004 |
| **Regulatory basis** | CBN R7 (no raw BVN/NIN stored), NDPR P6 (no PII in logs) |
| **Automated test** | `tests/e2e/api/11-compliance-invariants.e2e.ts` — TC-INV004 suite |
| **Run command** | `pnpm test:compliance` |
| **Manual action** | During BVN verification API call: run `wrangler tail --env staging --format json \| grep -i bvn` — output must contain ONLY hashes (64-char hex), never the raw 11-digit BVN. Check D1 table `hl_identity_verifications` — `raw_value` column must be NULL or absent |
| **Expected evidence** | Zero raw BVN/NIN values in logs; D1 stores hash only |
| **Automated result** | ☐ PASS ☐ FAIL — Date: ________ Tested by: ________ |
| **Manual log inspection result** | |
| **Manual DB query result** | |
| **Attestation** | ☐ SIGNED OFF — Name: ________ Role: ________ Date: ________ |
| **Notes** | |

---

### TC-N006 — NDPR Hard Delete (G23)

| Field | Value |
|---|---|
| **TC-ID** | TC-N006 |
| **Regulatory basis** | NDPR G23 (right to erasure — hard delete, no soft-delete fallback) |
| **Automated test** | `tests/e2e/api/11-compliance-invariants.e2e.ts` — TC-N006 suite |
| **Run command** | `pnpm test:compliance` |
| **Manual action** | After DELETE /users/:id/notifications: run `SELECT COUNT(*) FROM hl_notification_inbox WHERE user_id = '<deleted_user_id>'` — must return 0. Run `SELECT COUNT(*) FROM hl_notification_inbox WHERE user_id = '<deleted_user_id>' AND deleted_at IS NOT NULL` — must also return 0 (no soft-delete rows) |
| **Expected evidence** | Hard delete: 0 rows in notification_inbox (no soft-delete record either) |
| **Automated result** | ☐ PASS ☐ FAIL — Date: ________ Tested by: ________ |
| **Manual DB query result** | |
| **Attestation** | ☐ SIGNED OFF — Name: ________ Role: ________ Date: ________ |
| **Notes** | |

---

### TC-AU002 — Audit Log IP Masking (NDPR P6)

| Field | Value |
|---|---|
| **TC-ID** | TC-AU002 |
| **Regulatory basis** | NDPR P6 (IP address masking — last octet zeroed) |
| **Automated test** | `tests/e2e/api/11-compliance-invariants.e2e.ts` — TC-AU002 suite |
| **Run command** | `pnpm test:compliance` |
| **Manual action** | After any authenticated API request: run `SELECT ip_address FROM hl_audit_log ORDER BY created_at DESC LIMIT 5` — every `ip_address` must match format `X.X.X.0` (last octet = 0). No full IP address (e.g., `192.168.1.47`) may appear |
| **Expected evidence** | All IP addresses in audit_log are masked (last octet = 0) |
| **Automated result** | ☐ PASS ☐ FAIL — Date: ________ Tested by: ________ |
| **Manual DB query result** | |
| **Attestation** | ☐ SIGNED OFF — Name: ________ Role: ________ Date: ________ |
| **Notes** | |

---

### TC-N014 — NOTIFICATION_SANDBOX_MODE=true in Staging (G24)

| Field | Value |
|---|---|
| **TC-ID** | TC-N014 |
| **Regulatory basis** | G24 (staging sandbox: no live notifications sent) |
| **Automated test** | `tests/e2e/api/11-compliance-invariants.e2e.ts` — TC-N014 suite |
| **Run command** | `pnpm test:compliance` |
| **Manual action** | Inspect `apps/notifications-worker/wrangler.toml` (or the deployed `[env.staging]` section): confirm `NOTIFICATION_SANDBOX_MODE = "true"`. Run `wrangler secret list --env staging` and confirm no live SMS/email credentials are present |
| **Expected evidence** | `NOTIFICATION_SANDBOX_MODE=true` in wrangler.toml `[env.staging]` section |
| **Automated result** | ☐ PASS ☐ FAIL — Date: ________ Tested by: ________ |
| **Manual config inspection result** | |
| **Attestation** | ☐ SIGNED OFF — Name: ________ Role: ________ Date: ________ |
| **Notes** | |

---

### TC-HR001 — Law-Firm: L3 HITL for All AI Output (NBA)

| Field | Value |
|---|---|
| **TC-ID** | TC-HR001 |
| **Regulatory basis** | NBA (Nigerian Bar Association — AI must not deliver legal advice without human review) |
| **Automated test** | `tests/e2e/api/12-l3-hitl.e2e.ts` — TC-HR001 suite |
| **Run command** | `pnpm test:cycle-02` |
| **Manual action** | Submit an AI task for a law-firm workspace. Confirm the task response is `status: pending_hitl` or `pending_review` (NOT `completed`). Then inspect the HITL queue via platform-admin or `GET /admin/hitl/queue` — the task must appear. Confirm the AI-generated text is NOT visible to the end-user until a qualified human has reviewed and approved it |
| **Expected evidence** | Task status = `pending_hitl`; task appears in HITL queue; no AI output returned to client before human review |
| **Automated result** | ☐ PASS ☐ FAIL — Date: ________ Tested by: ________ |
| **Manual HITL queue inspection result** | |
| **Attestation** | ☐ SIGNED OFF — Name: ________ Role: ________ Date: ________ |
| **Notes** | NBA compliance lead sign-off required |

---

### TC-HR002 — Law-Firm: matter_ref_id Opaque (NBA)

| Field | Value |
|---|---|
| **TC-ID** | TC-HR002 |
| **Regulatory basis** | NBA (client matter identifiers must be opaque — no client name in AI payload) |
| **Automated test** | `tests/e2e/api/12-l3-hitl.e2e.ts` — TC-HR002 suite |
| **Run command** | `pnpm test:cycle-02` |
| **Manual action** | Submit a law-firm AI task with `matter_ref_id: "MATTER-QA-001"`. Inspect the AI request payload sent to the LLM provider (via `wrangler tail`): confirm the raw client name, NIN, or case details are NOT included — only the opaque `matter_ref_id` |
| **Expected evidence** | LLM prompt contains `matter_ref_id` only; no raw client PII in the AI input payload |
| **Automated result** | ☐ PASS ☐ FAIL — Date: ________ Tested by: ________ |
| **Manual log inspection result** | |
| **Attestation** | ☐ SIGNED OFF — Name: ________ Role: ________ Date: ________ |
| **Notes** | |

---

### TC-HR003 — Tax-Consultant: TIN Never in AI Payloads (FIRS)

| Field | Value |
|---|---|
| **TC-ID** | TC-HR003 |
| **Regulatory basis** | FIRS (Federal Inland Revenue Service — TIN must not be sent to external AI providers) |
| **Automated test** | `tests/e2e/api/12-l3-hitl.e2e.ts` — TC-HR003 suite |
| **Run command** | `pnpm test:cycle-02` |
| **Manual action** | Submit a tax-consultant AI task. In `wrangler tail`, search for any 10-digit TIN pattern (`\b\d{10}\b`) in outbound AI requests — zero matches required. Also verify the TIN is not echoed back in the task response |
| **Expected evidence** | Zero TIN occurrences in LLM request payloads or API responses |
| **Automated result** | ☐ PASS ☐ FAIL — Date: ________ Tested by: ________ |
| **Manual log inspection result** | |
| **Attestation** | ☐ SIGNED OFF — Name: ________ Role: ________ Date: ________ |
| **Notes** | FIRS compliance review required |

---

### TC-HR004 — Government-Agency: Tier 3 KYC Mandatory (BPP)

| Field | Value |
|---|---|
| **TC-ID** | TC-HR004 |
| **Regulatory basis** | BPP (Bureau of Public Procurement — government-agency vertical requires T3 KYC) |
| **Automated test** | `tests/e2e/api/12-l3-hitl.e2e.ts` — TC-HR004 suite |
| **Run command** | `pnpm test:cycle-02` |
| **Manual action** | Attempt a financial operation (payment/wallet debit) on a `government-agency` workspace with a user whose KYC is Tier 1 or 2. Confirm the operation returns 403 with a KYC-tier error. Then verify with a Tier-3 KYC user that the operation proceeds |
| **Expected evidence** | T1/T2 KYC → 403; T3 KYC → allowed |
| **Automated result** | ☐ PASS ☐ FAIL — Date: ________ Tested by: ________ |
| **Manual test result** | |
| **Attestation** | ☐ SIGNED OFF — Name: ________ Role: ________ Date: ________ |
| **Notes** | |

---

### TC-HR005 — Polling-Unit: No Voter PII in AI Payloads (INEC)

| Field | Value |
|---|---|
| **TC-ID** | TC-HR005 |
| **Regulatory basis** | INEC (Independent National Electoral Commission — voter PII must not be processed by AI) |
| **Automated test** | `tests/e2e/api/12-l3-hitl.e2e.ts` — TC-HR005 suite |
| **Run command** | `pnpm test:cycle-02` |
| **Manual action** | Submit a polling-unit AI task. In `wrangler tail`, confirm zero voter names, VINs (Voter Identification Numbers), phone numbers, or NINs appear in any outbound AI request. Search for patterns: `\b[A-Z]{2}\d{8}[A-Z]{2}\b` (VIN format) |
| **Expected evidence** | Zero voter PII in LLM request payloads |
| **Automated result** | ☐ PASS ☐ FAIL — Date: ________ Tested by: ________ |
| **Manual log inspection result** | |
| **Attestation** | ☐ SIGNED OFF — Name: ________ Role: ________ Date: ________ |
| **Notes** | INEC compliance review required. This TC requires ELECTORAL_DATA_SHARING_PROHIBITED env var = true |

---

### TC-HR006 — Funeral-Home: case_ref_id Opaque

| Field | Value |
|---|---|
| **TC-ID** | TC-HR006 |
| **Regulatory basis** | Data minimisation principle — deceased person details must not be sent to external AI |
| **Automated test** | `tests/e2e/api/12-l3-hitl.e2e.ts` — TC-HR006 suite |
| **Run command** | `pnpm test:cycle-02` |
| **Manual action** | Submit a funeral-home AI task with `case_ref_id: "CASE-QA-001"`. In `wrangler tail`, confirm the AI payload contains only the opaque `case_ref_id` — not the deceased's name, NIN, date of death, or next-of-kin details |
| **Expected evidence** | LLM prompt contains `case_ref_id` only; no deceased-person PII |
| **Automated result** | ☐ PASS ☐ FAIL — Date: ________ Tested by: ________ |
| **Manual log inspection result** | |
| **Attestation** | ☐ SIGNED OFF — Name: ________ Role: ________ Date: ________ |
| **Notes** | |

---

### TC-HR007 — Creche: All AI Output Under L3 HITL

| Field | Value |
|---|---|
| **TC-ID** | TC-HR007 |
| **Regulatory basis** | Child data protection (all AI output concerning minors requires human review before delivery) |
| **Automated test** | `tests/e2e/api/12-l3-hitl.e2e.ts` — TC-HR007 suite |
| **Run command** | `pnpm test:cycle-02` |
| **Manual action** | Submit an AI task for a creche workspace. Confirm the task response is `status: pending_hitl` or `pending_review`. Confirm the AI output is visible in the HITL review queue under platform-admin. Confirm no AI content about minors is delivered to the client application before human approval |
| **Expected evidence** | Task status = `pending_hitl`; AI output held in HITL queue; not delivered to client |
| **Automated result** | ☐ PASS ☐ FAIL — Date: ________ Tested by: ________ |
| **Manual HITL queue inspection result** | |
| **Attestation** | ☐ SIGNED OFF — Name: ________ Role: ________ Date: ________ |
| **Notes** | Child data protection officer sign-off required where applicable |

---

## Sign-off Summary

| TC-ID | Regulatory Basis | Automated | Manual | Signed Off | Signed By | Date |
|---|---|---|---|---|---|---|
| TC-ID001 | CBN R7 | ☐ | ☐ | ☐ | | |
| TC-INV004 | CBN R7 / NDPR P6 | ☐ | ☐ | ☐ | | |
| TC-N006 | NDPR G23 | ☐ | ☐ | ☐ | | |
| TC-AU002 | NDPR P6 | ☐ | ☐ | ☐ | | |
| TC-N014 | G24 | ☐ | ☐ | ☐ | | |
| TC-HR001 | NBA | ☐ | ☐ | ☐ | | |
| TC-HR002 | NBA | ☐ | ☐ | ☐ | | |
| TC-HR003 | FIRS | ☐ | ☐ | ☐ | | |
| TC-HR004 | BPP | ☐ | ☐ | ☐ | | |
| TC-HR005 | INEC | ☐ | ☐ | ☐ | | |
| TC-HR006 | Data minimisation | ☐ | ☐ | ☐ | | |
| TC-HR007 | Child data protection | ☐ | ☐ | ☐ | | |

**All 12 rows must be signed off before production deployment is permitted.**

---

## Escalation Path

| Failure type | Escalation target | SLA |
|---|---|---|
| CBN R7/R8 failure | Chief Compliance Officer + Legal | Immediate — deployment blocked |
| NDPR P6/G23 failure | DPO (Data Protection Officer) | Immediate — deployment blocked |
| NBA failure | Legal counsel + NBA liaison | Immediate — deployment blocked |
| FIRS failure | Tax compliance officer + Legal | Immediate — deployment blocked |
| INEC failure | Electoral compliance officer + Legal | Immediate — deployment blocked |
| BPP failure | Procurement compliance + Legal | 24h — deployment blocked |
| Child data protection failure | DPO + safeguarding officer | Immediate — deployment blocked |

---

*This document must be retained for a minimum of 5 years per NDPR retention obligations.*  
*Last updated: 2026-04-23*
