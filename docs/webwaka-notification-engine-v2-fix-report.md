# WebWaka Notification Engine — v2 Fix Report

**Document:** `docs/webwaka-notification-engine-v2-fix-report.md`
**Corrects:** `docs/webwaka-notification-engine-final-master-specification-v2.md` (v2.0 → v2.1)
**Date:** 2026-04-20
**Authority:** Strict QA verification audit of v2.0 against `docs/webwaka-notification-engine-section13-resolution.md`
**Result:** 4 defects identified; 4 defects fully corrected; 1 downstream consistency reference also corrected.

---

## Summary

| # | Defect | Severity | Sections Changed | Status |
|---|---|---|---|---|
| D1 | G12 missing digest engine tenant isolation clause | HIGH | Section 12 (G12) | FIXED |
| D2 | OQ-013 enterprise cap wrong (250 instead of unlimited); business tier omitted | HIGH | Section 13 (OQ-013 body) | FIXED |
| D3 | OQ-008 phase gate under wrong phase (Phase 5 instead of Phase 6) | MEDIUM | Section 15 | FIXED |
| D4 | N-012a ID reassigned without documentation; downstream ref incorrect | MEDIUM | Section 14 (Phase 1 backlog), Section 13 (OQ-001 rationale) | FIXED |

Additionally: **1 downstream consistency reference** identified and corrected during the consistency pass (OQ-001 rationale cited N-012a as the 2d scaffold cost; corrected to N-008).

---

## DEFECT 1 — G12: Missing Digest Engine Tenant Isolation Clause

### What the resolution pack required
Section 7 of the resolution pack (OQ-007 — Digest Engine Timing Model), Guardrails / Compliance Implications:

> Add to G12: "Digest engine must never process a batch belonging to tenant A while processing a message for tenant B. Each Queue message contains `tenant_id` and all DB queries within `processDigestBatch` must include `AND tenant_id = :tenantId`."

### What v2.0 contained (before fix)
```
### G12 — Critical Notifications Bypass Quiet Hours and Digest
`severity='critical'` notifications (account locked, data breach, payment critical failure, workspace
suspended) bypass quiet hours and digest windows. Delivered immediately on all configured channels.
```
The tenant isolation clause was completely absent.

### Fix applied — Section 12, G12
```
### G12 — Critical Notifications Bypass Quiet Hours and Digest
`severity='critical'` notifications (account locked, data breach, payment critical failure, workspace
suspended) bypass quiet hours and digest windows. Delivered immediately on all configured channels.
Additionally, the digest engine must never process a batch belonging to tenant A while processing a
message for tenant B: each Queue message dispatched by the CRON sweep must contain `tenant_id`, and
all DB queries within `processDigestBatch()` must include `AND tenant_id = :tenantId`. Cross-tenant
batch processing is a T3 isolation violation (G1).
```

### Downstream effects checked
- Layer 9 architecture diagram (Section 8.1): already contained "(100ms per batch, T3 safe)" — consistent with the fix; no change needed.
- G1 (tenant isolation absolute) is cross-referenced by the added clause; no change needed.
- N-064 (processDigestBatch implementation) is the enforcement point; no change needed — the guardrail governs the implementation requirement.

---

## DEFECT 2 — OQ-013 Section 13 Body: Wrong Enterprise Cap, Omitted Business Tier

### What the resolution pack required
Section 4 (OQ-013), Options Considered, Recommended Decision:
- Standard plan: max 25 active subscriptions per workspace
- Business plan: max 100 active subscriptions
- Enterprise plan: **unlimited** subscriptions + full 100+ event catalog access

### What v2.0 contained (before fix)
```
**Decision:** 30-event curated starter set available to standard-tier tenants (max 25 subscriptions).
Full 100+ event catalog available to enterprise-tier tenants (max 250 subscriptions). Inline webhook
retry must be migrated to CF Queues (N-131) before any expansion beyond current 4 events. New
`webhook_event_types` registry table tracks availability and plan tier.
```
Two errors: enterprise said "max 250" (should be unlimited); business tier was completely omitted.

Note: G25 was already correct in v2.0 — "Standard-tier: max 25; Business-tier: max 100; Enterprise: unlimited" — creating an internal contradiction within v2.0.

### Fix applied — Section 13, OQ-013 Decision text
```
**Decision:** 30-event curated starter set available to standard-tier tenants (max 25 active
subscriptions per workspace). Business-tier tenants receive the 30-event starter set with a higher
cap (max 100 active subscriptions). Full 100+ event catalog available to enterprise-tier tenants
(unlimited active subscriptions). Inline webhook retry must be migrated to CF Queues (N-131) before
any expansion beyond current 4 events. New `webhook_event_types` registry table tracks availability
and plan tier.
```

### Downstream effects checked
- **G25** (Section 12): already correct — "Standard: 25, Business: 100, Enterprise: unlimited." No change needed; now consistent with Section 13 body.
- **Section 7 `webhook_event_types`**: seeding description unchanged (30-event starter at 'standard'; remaining at 'enterprise'). No change needed.
- **N-131/N-132/N-133** backlog items: unaffected by cap correction. No change needed.
- **Section 11 Phase 4/6 roadmap**: unchanged. No change needed.

---

## DEFECT 3 — Section 15: OQ-008 Gate Under Wrong Phase

### What the resolution pack required
Resolution pack Section 8 (Implementation Readiness Gate), "Before Phase 6 Begins":
```
| OQ-008 (partner admin inbox surface) | ✅ Shared schema + `category='partner'`; N-091a added |
```
N-091a is a Phase 6 backlog task. The gate must be at Phase 6 entry, not Phase 5.

### What v2.0 contained (before fix)
```
### Before Phase 5 Begins
| OQ-007 Digest timing model | ✅ ...
| OQ-010 Real-time inbox push | ✅ ...
| OQ-009 USSD notification handling | ✅ ...
| OQ-008 Partner admin inbox surface | ✅ Shared schema + `category='partner'`; N-091a |
```
OQ-008 was one phase early. A Phase 5 entry gate for a Phase 6 task is logically inconsistent — it implies the implementing work (N-091a) must be done before Phase 5, which is impossible.

### Fix applied — Section 15

Removed OQ-008 from "Before Phase 5 Begins." Added to "Before Phase 6 Begins":
```
### Before Phase 5 Begins
| OQ-007 Digest timing model | ✅ Queue-continued CRON sweep; N-063/N-064/N-012a |
| OQ-010 Real-time inbox push | ✅ Short-poll 30s; GET /notifications/inbox/unread-count; N-067 |
| OQ-009 USSD notification handling | ✅ G21 added; `source` field in place; N-060 |

### Before Phase 6 Begins
| OQ-008 Partner admin inbox surface | ✅ Shared schema + `category='partner'`; N-091a
  (Phase 6 task — gate confirmed at Phase 6 entry) |
| OQ-002 kill-switch deployed to staging | Required: N-009 (config) + N-100a (validation) |
| NOTIFICATION_PIPELINE_ENABLED kill-switch implemented and tested | Required: N-020 |
| `NOTIFICATION_SANDBOX_MODE=true` deployed on staging | Must be live before Phase 6 vertical wiring |
| Duplicate-send audit tooling confirmed working | Audit log query: COUNT(*) = 1 per event_id |
```

### Downstream effects checked
- Section 13 decision matrix OQ-008 row: already says "N-091a (Phase 6)" — consistent. No change needed.
- Section 11 Phase 6 roadmap: N-091a listed under Phase 6 epic — consistent. No change needed.
- Section 10 apps/partner-admin section: unchanged and consistent. No change needed.

---

## DEFECT 4 — N-012a ID Reassigned Without Documentation

### What the resolution pack required
Resolution pack Section 6, "New Backlog Items":
```
| N-012a | Create apps/notificator Worker skeleton
  (wrangler.toml staging + production, env.ts, index.ts) | apps/notificator | 2d | P0 | Phase 0 |
```
Resolution pack Section 6, "Updated Backlog Items":
```
| N-008 | "Document and commit consumer Worker ownership decision"
  → "Scaffold apps/notificator Worker skeleton: wrangler.toml, env.ts, index.ts" |
```
Note: the resolution pack itself created a duplication — both the updated N-008 and the new N-012a described identical Worker scaffold content.

### What v2.0 contained (before fix)
v2.0 correctly merged both into the updated N-008 (the scaffold content). However, it silently repurposed N-012a for a different task (the CRON handler) without any explanation. Additionally, the OQ-001 rationale text in Section 13 still cited "N-012a" as the 2d setup cost — which was the old meaning (Worker scaffold), not the new meaning (CRON handler, 1d).

This created two problems:
1. Anyone cross-referencing the resolution pack's N-012a against v2's N-012a would find completely different tasks.
2. The OQ-001 rationale cited N-012a for 2d cost; v2's N-012a is only 1d and covers something else.

### Fix 4a applied — Section 14, Phase 1 epic, N-012a backlog entry

Added reconciliation note inline in the task description:
```
| N-012a | Add CRON digest sweep handler to apps/notificator (wrangler.toml CRON triggers +
  `digestSweepCron()` function). **Reconciliation note:** The resolution pack's Section 6 defined
  N-012a as the Worker skeleton scaffold and also updated N-008 with identical content. v2 merges
  both into the updated N-008; N-012a here covers the CRON handler that had no separate ID in the
  resolution pack. | apps/notificator | 1d | P0 | N-012 | Medium |
```

### Fix 4b applied — Section 13, OQ-001 Rationale (consistency pass finding)

Changed:
```
The ~2d additional setup cost (N-012a) is justified by operational safety at scale.
```
To:
```
The ~2d additional setup cost (N-008 Worker scaffold) is justified by operational safety at scale.
```
This was identified during the downstream consistency pass as a secondary reference that had the same incorrect N-012a citation.

### Downstream effects checked
- Section 15 "Before Phase 1 Begins" gate: "CRON triggers added to apps/notificator/wrangler.toml | Required: N-012a" — this remains correct; in v2's terms, N-012a is the CRON handler. Consistent.
- Section 13 decision matrix OQ-007 row: "N-063, N-064, N-012a (Phase 1/5)" — references N-012a in the context of the digest CRON. Consistent with v2's meaning of N-012a. No change needed.
- Effort estimate footnote (Section 11, ~180d note): lists N-012a as one of the new items adding to effort. Consistent — N-012a (1d) is still a net-new item. No change needed.

---

## CONSISTENCY PASS FINDINGS

After applying the 4 defect fixes, the following additional consistency checks were performed:

| Check | Result |
|---|---|
| All OQ-008 references in v2 spec | ✅ All reference Phase 6, shared inbox, category='partner'. No stale Phase 5 references remain. |
| G25 vs corrected OQ-013 body | ✅ Both now say: standard 25, business 100, enterprise unlimited. No contradiction. |
| N-012a across all Section 14 epics | ✅ Single occurrence in Phase 1 epic with reconciliation note. |
| G12 cross-references (G1, G11) | ✅ Added clause explicitly cites G1 for T3 isolation. G11 reference to G12 for critical bypass unchanged. |
| Section 15 gate completeness | ✅ Before Phase 5: 3 gates (OQ-007, OQ-010, OQ-009). Before Phase 6: 5 gates (OQ-008 + 4 original). No gates duplicated or missing. |
| OQ-001 rationale cross-reference | ✅ Now correctly cites N-008 (2d scaffold) not N-012a. |
| "What Changed in v2.1" section added to Executive Summary | ✅ Documents all 4 corrections for future readers. |
| No other "max 250" references in spec | ✅ Confirmed by grep — no residual incorrect enterprise cap. |
| No new contradictions introduced | ✅ All 4 fixes are additive corrections; no previously correct content was altered. |

---

## FILES CHANGED

| File | Change Type | Summary |
|---|---|---|
| `docs/webwaka-notification-engine-final-master-specification-v2.md` | Corrected | 6 targeted edits (4 defect fixes + 1 consistency fix + version header update + v2.1 Executive Summary section) |
| `docs/webwaka-notification-engine-v2-fix-report.md` | New | This document |

---

## FILES NOT CHANGED

| File | Reason |
|---|---|
| `docs/webwaka-notification-engine-section13-resolution.md` | Authoritative source — read-only |
| `docs/webwaka-notification-engine-v2-merge-report.md` | Prior audit trail — historical reference; not updated (its N-012a entries reflect v2.0 meaning, which is now documented in the reconciliation note) |
| `replit.md` | No change to spec authority or document structure |

---

## VERIFICATION CHECKLIST

| Item | Verified |
|---|---|
| G12 now contains digest engine tenant isolation clause | ✅ |
| G25 and Section 13 OQ-013 body now agree on all 3 tier caps | ✅ |
| Business tier (max 100) present in Section 13 OQ-013 body | ✅ |
| Enterprise tier says "unlimited" (not 250) in Section 13 OQ-013 body | ✅ |
| OQ-008 absent from "Before Phase 5 Begins" gate table | ✅ |
| OQ-008 present in "Before Phase 6 Begins" gate table | ✅ |
| N-012a reconciliation note present in Phase 1 backlog entry | ✅ |
| OQ-001 rationale cites N-008 (not N-012a) for 2d scaffold cost | ✅ |
| Version header updated to v2.1 | ✅ |
| "What Changed in v2.1" section added to Executive Summary | ✅ |
| No new inconsistencies introduced by any of the 4 fixes | ✅ |

---

*v2.1 is the corrected canonical implementation-ready document. All 4 QA-identified blocking defects are resolved. The document is ready for engineering handoff.*
