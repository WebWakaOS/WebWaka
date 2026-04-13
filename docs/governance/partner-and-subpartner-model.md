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

---

## Partner AI Credit Resale

> **Added 2026-04-13 (SuperAgent alignment — ADL-010)**

### Rule 7

Partners on the `partner` tier may purchase AI credit bundles wholesale and allocate WakaCreditUnits (WC) to their tenant workspaces. Credits are scoped per-tenant — no cross-tenant sharing (T3 invariant).

### Wholesale Rate

| Credit Bundle | Retail Rate | Partner Wholesale Rate | Minimum Purchase |
|--------------|-------------|----------------------|-----------------|
| 10,000 WC | ₦10,000 | ₦6,000 (40% discount) | 10,000 WC |
| 100,000 WC | ₦100,000 | ₦55,000 (45% discount) | 100,000 WC |
| 1,000,000 WC | ₦1,000,000 | ₦490,000 (51% discount) | 1,000,000 WC |

### Allocation Flow

1. Partner purchases WC bundle via Paystack → `partner_credit_pools` record created
2. Partner allocates WC to workspace via `POST /partner/credits/allocate`
3. `wc_wallets.balance_wc` for target workspace is incremented
4. `partner_tenant_allocations` record created for audit trail
5. Workspace uses WC normally; deductions logged in `wc_transactions`

### Partner Console

Partners manage allocations via the Partner Admin dashboard (`apps/partner-admin`). Route: `GET /partner/credits` (pool balance) and `POST /partner/credits/allocate` (allocation). See Phase 3 of the Implementation Roadmap above.
