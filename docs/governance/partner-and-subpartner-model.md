# Partner and Sub-Partner Model

**Status:** Approved — Milestone 1 Governance Baseline
**Author:** Perplexity (Milestone 1)
**Reviewed by:** Base44 Super Agent
**Founder approved:** ✅ 7 April 2026

---

## Purpose

WebWaka supports multi-level partner expansion where authorized Partners can onboard and manage downstream entities under approved branding and entitlement rules.

## Hierarchy

| Level | Role |
|---|---|
| 0 | Platform Owner (WebWaka) |
| 1 | Partner |
| 2 | Sub-Partner |
| 3 | Downstream Entity Manager |

## Rules

1. Delegation is entitlement-controlled — a Partner cannot delegate what it does not hold.
2. Partner branding depth (white-label capability) depends on subscription tier.
3. Sub-Partner creation must be auditable with a clear parent record.
4. Downstream management must preserve full tenant isolation at every level.
5. Parent partners must not gain undocumented access to child tenant data.
6. The platform retains override capability at all levels for compliance purposes.

---

## Implementation Status

**Status:** ✅ PHASE 1 + PHASE 2 IMPLEMENTED — M11 Partner & White-Label complete (2026-04-11)

The following components are now live:
- ✅ Partner registration API (`POST /partners`) — super_admin-gated
- ✅ Partner status management (`PATCH /partners/:id/status`) — FSM: pending → active → suspended → deactivated (terminal)
- ✅ Partner entitlements (`GET/POST /partners/:id/entitlements`) — dimension/value model with `white_label_depth` and `delegation_rights`
- ✅ Sub-partner creation (`POST /partners/:id/sub-partners`) — requires `delegation_rights = '1'` entitlement + count < `max_sub_partners`
- ✅ D1 tables: `partner_entitlements` (migration 0202), `partner_audit_log` (migration 0203)
- ✅ `apps/partner-admin` Hono Worker — full management dashboard
- ✅ `partner_audit_log` — all mutations logged with actor, action, and payload
- ✅ 72 partner route tests passing (T3 isolation, auth guards, delegation limits, status FSM)

---

## Implementation Roadmap

| Phase | Scope | Target Milestone | Status |
|-------|-------|-----------------|--------|
| **Phase 1** | Partner registration API, partner workspace creation, `partners` D1 table, partner-specific RBAC roles | M11 | ✅ DONE |
| **Phase 2** | Sub-partner creation, delegation rights enforcement, `sub_partners` table, delegation agreement workflow | M11 | ✅ DONE |
| **Phase 3** | Partner billing, revenue share (WakaCU wholesale allocation), white-label depth control per subscription tier | M11–M12 | NOT STARTED |
| **Phase 4** | Partner analytics dashboard, partner-level audit logs, partner→sub-partner cascading entitlements | M12 | NOT STARTED |

**Dependencies:**
- Phase 1 depends on: completed entitlement model (T5 — done), RBAC middleware (done), tenant isolation (T3 — done)
- Phase 2 depends on: Phase 1 partner infrastructure
- Phase 3 depends on: WakaCU wallet system (ADL-008 — tables defined, implementation pending)
