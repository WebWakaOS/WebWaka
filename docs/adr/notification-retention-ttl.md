# ADR: Notification Data Retention TTLs and NDPR Compliance

**Status**: Accepted  
**Date**: 2026-04-20  
**Authors**: Platform Engineering  
**Phase**: 8 — Data Retention and Compliance Hardening  
**Spec reference**: WebWaka Notification Engine Final Master Specification v2.1, Section 7 / OQ-006  
**Readiness gate**: Phase 8 (Section 15 of spec)

---

## Context

The WebWaka OS Notification Engine stores data across multiple D1 tables as it processes, delivers, and archives notification events. Nigeria's NDPR (National Data Protection Regulation, 2019) and GDPR-adjacent best practice require that:

1. Personal data is not retained beyond its operational necessity.
2. Data subjects may request erasure of their records (right to erasure / right to be forgotten).
3. Audit trails for regulatory accountability must be preserved, but PII within audit records must be anonymisable.

This ADR records the legally-reviewed decision on retention TTLs for each notification table, the mechanism for automated enforcement, and the NDPR erasure propagation pattern.

---

## Decision

### Retention TTLs per table

| Table | TTL | Rationale |
|---|---|---|
| `notification_delivery` | **90 days** | Delivery metadata (channel, status, provider) is operational; ops/debugging need ≤30d; 90d gives generous overlap for dispute resolution |
| `notification_inbox_item` | **365 days** | In-app notifications form part of a user's activity feed; one year aligns with standard digital-product retention norms |
| `notification_event` | **90 days** | Raw event records are the source of delivery work; once delivered and archived, the raw event is operational, not archival |
| `notification_digest_batch` + `_item` | **90 days** | Digest batches are ephemeral aggregation windows; once sent, operational value ends |
| `notification_audit_log` | **7 years** | Regulatory / financial audit requirement; rows are NEVER deleted — only PII fields (`actor_id`, `recipient_id`) are zeroed on erasure |
| `notification_preference` | **Lifetime** (deleted with account) | User preferences are active configuration, not time-limited data |
| `notification_subscription` | **Lifetime** (deleted with account) | Subscription records define delivery eligibility; deleted on account erasure |
| `notification_suppression_list` | **Indefinite** | Must survive account deletion (G23); suppression addresses are stored as SHA-256 hashes — no raw PII |

### Legal review sign-off

These TTLs were reviewed and accepted by the WebWaka legal and compliance team prior to Phase 8 implementation:

- **90 days** for delivery/event/digest: Consistent with NDPR Article 2.1(3) data minimisation principle. Operational necessity ends at 90 days for non-archival transactional records.
- **365 days** for inbox items: Justified by user-facing product continuity; one year is proportionate.
- **7 years** for audit log: Matches Nigerian FIRS e-transaction audit requirements and NDPR accountability obligations under Article 3.1(7).
- **Indefinite suppression**: Required by NDPR Article 3.1(9) and CAN-SPAM compliance — a user's opt-out instruction must persist past account deletion to prevent re-subscription on re-registration.

### Enforcement mechanisms

**N-115 — Automated daily retention sweep** (`apps/notificator`):

- CRON schedule: `0 2 * * *` (03:00 WAT / 02:00 UTC) — runs daily in the notificator Worker
- Function: `runRetentionSweep(env)` → `executeRetentionDeletes(db, nowUnix?)`
- Each delete statement uses `LIMIT 500` per run to stay within CF D1 budget
- Batch items deleted before parent batches (referential ordering)
- Errors are caught and logged; CRON does not throw — next day's run retries

**N-116 — NDPR erasure propagation** (`packages/notifications`):

- Function: `propagateErasure(db, userId, tenantId)`
- Triggered by: `DELETE /auth/me` after core user anonymisation
- Per table:
  - `notification_audit_log`: UPDATE to set `actor_id='ERASED'`, `recipient_id='ERASED'` — row preserved
  - All other tables: hard DELETE scoped to `tenant_id = ? AND user_id/actor_id/recipient_id = ?`
  - `notification_suppression_list`: NOT touched (G23 — suppression survives erasure)
- Returns `ErasureResult` with row counts logged for compliance ops

### Attribution enforcement

**N-117 — Plan-tier attribution gate** (`packages/notifications`):

- Function: `resolveEffectiveAttribution(planTier, dbFlag): boolean`
- `free | starter | growth | business`: attribution always required; DB flag ignored
- `enterprise`: DB flag respected; operator may suppress attribution if contractually agreed
- Applied in `wrapEmail()` via `planTier` option — overrides `TenantTheme.requiresWebwakaAttribution`

---

## Consequences

**Positive:**
- Platform is NDPR-compliant for both data minimisation (retention sweeps) and right to erasure (N-116).
- Audit trail preserved for 7 years per regulatory requirement; PII can be zeroed on demand.
- Attribution cannot be bypassed by free/starter/growth plan manipulation of the DB flag.
- Suppression lists survive account deletion, preventing re-notification of opted-out addresses.

**Negative / trade-offs:**
- Retention sweep uses `LIMIT 500` per run; very large backlogs may take multiple days to clear. Acceptable given daily cadence and the absence of a requirement for immediate purge.
- `DELETE /auth/me` now awaits N-116 propagation; latency increases by ≤ O(6 D1 statements). Non-blocking on error — core erasure is not rolled back if notification propagation fails.

**Risks:**
- If `NOTIFICATION_PIPELINE_ENABLED=0`, retention sweep is skipped. Manual sweep may be needed after a long pipeline outage. Ops runbook: set flag to `1` and trigger CRON manually.

---

## References

- NDPR 2019, Articles 2.1(3), 3.1(7), 3.1(9)
- WebWaka Notification Engine Specification v2.1, Section 7 (OQ-006), Section 15
- `apps/notificator/src/digest.ts` — `executeRetentionDeletes()`
- `packages/notifications/src/erasure-service.ts` — `propagateErasure()`
- `packages/notifications/src/attribution.ts` — `resolveEffectiveAttribution()`
