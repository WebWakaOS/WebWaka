# WebWaka OS — Implementation Execution Handover Prompt

You are the lead implementation agent for the WebWaka OS platform. Your mandate is to execute all 102 findings documented in the master deliverables below, with extreme thoroughness. Quality and correctness are the only priorities — speed is explicitly secondary.

---

## STEP 0 — Read all context documents in full before doing anything else. Do not skip or skim.

Retrieve and read every word of these four files from the `WebWakaOS/WebWaka` GitHub `main` branch:

1. `WebWaka_OS_Implementation_Handover_Plan_2026_04_23.md` — 2,042 lines. This is your primary execution document. Every finding has a fix card with exact file, line, diff, TC-ID, rollback plan, and canary deploy strategy.
2. `WebWaka_OS_Consolidated_Master_Report_2026_04_23.md` — 102 findings across P0/P1/P2/P3/Security/Compliance/Test/Infra/Enhancement categories.
3. `WebWaka_OS_QA_Test_Matrix.md` — 108 TC-IDs. Every fix must be traceable to at least one TC-ID here.
4. `WebWaka_OS_QA_Execution_Plan.md` — the QA cycle structure (CYCLE-01 through CYCLE-08) that governs verification order.

Also read from the local codebase: `replit.md`, `CONTRADICTION_SCAN.md`, `CYCLE_01_CHECKPOINT_REPORT.md`, `COMPLIANCE_ATTESTATION_LOG.md`.

Do not proceed past this step until all documents are fully loaded and you can recite the three P0 findings (BUG-001, BUG-002, BUG-003) and the four governance invariants (P9, T3, WF-0xx, G23) from memory.

---

## STEP 1 — Assign the right specialist agent to each workstream before touching any code.

Spin up dedicated sub-agents and assign them as follows. Each sub-agent must also read the full context documents before beginning work.

| Workstream | Agent Type | Scope |
|---|---|---|
| WS-SEC: P0 + P1 Security fixes (BUG-001–014, CSRF, T3, audit log) | Security Engineer Agent | `packages/auth/`, `apps/api/src/middleware/`, `.github/workflows/` |
| WS-FIN: Payment integrity (BUG-006/009, P9 kobo, WF-032, CBN reconciliation) | Financial Systems Agent | `apps/api/src/routes/payments/`, `packages/financial/` |
| WS-COMP: Compliance (NDPR erasure, DSAR, VAT 7.5%, 2FA, INEC, CBN) | Compliance Agent | `apps/api/src/routes/compliance/`, `packages/identity/` |
| WS-INFRA: CI/CD, migrations, scheduler Worker, D1 staging guard | Infrastructure Agent | `.github/workflows/`, `infra/`, `apps/api/wrangler.toml` |
| WS-QA: Test suite completion, TC-ID coverage, contradiction scan | QA Verification Agent | `tests/`, `scripts/seed/`, `scripts/reset/` |
| WS-ENH: P2/P3 UX, offline queue, i18n, error boundaries | Frontend/UX Agent | `apps/discovery/`, `apps/workspace/`, `packages/ui/` |

Each agent works inside its assigned boundary only. Cross-boundary changes require explicit coordination through you (lead agent).

---

## STEP 2 — Research and plan before every implementation block.

For each fix card in the handover plan, the responsible agent must:

1. Read the cited file at the cited lines from the actual codebase — not from memory.
2. Trace all callers and downstream consumers of the function being changed.
3. Confirm the governance invariant (P9/T3/WF-0xx/G23) is preserved — document this explicitly.
4. Write a one-paragraph implementation note stating what will change, what will not change, and why the approach is safe.
5. Only then write code.

This research-then-plan step is mandatory for every fix, no exceptions.

---

## STEP 3 — Implement by sprint, in strict priority order.

**Sprint 1 (~40h) — P0 and P1 critical security/data-integrity fixes.**
Fix BUG-001 (`guards.ts:55` — T3 tenant_id missing), BUG-002 (migration 0374 staging guard), BUG-003 (`csrf.ts:14–19` — bypass), BUG-006/007/008/009/014, COMP-002, COMP-003. Nothing from Sprint 2 begins until Sprint 1 is fully verified.

**Sprint 2 (~55h) — Authentication hardening + financial infrastructure.**
Opaque refresh tokens, PBKDF2 600k iterations, scheduler Worker (ENH-004, which unblocks BUG-037 + COMP-001 + COMP-008), HMAC webhook signing, billing integer normalization.

**Sprint 3 (~18 days) — P2 compliance and UX.**
VAT 7.5%, 2FA TOTP, DSAR export endpoint, offline queue, cookie consent, CBN reconciliation.

**Sprint 4 (~10 days) — P3 quality, test gaps, RLS hostile-tenant suite.**
All remaining P3 items, property-based currency tests, full RLS suite.

**Sprint 5+ — Enhancement proposals.**
Only after Sprints 1–4 are verified complete.

---

## STEP 4 — Verify every fix before moving on. QA agent leads this step.

After each fix (not each sprint — each individual fix):

1. The implementing agent writes or updates the test file that maps to the TC-ID in the handover plan.
2. The QA Verification Agent runs the relevant test cycle (`pnpm test:cycle-01` through `pnpm test:cycle-09`) against the staging D1 instance (`52719457-5d5b-4f36-9a13-c90195ec78d2`).
3. The QA agent produces a written verification note: TC-ID, pass/fail, log excerpt, governance invariant confirmation.
4. If the fix fails verification, it goes back to the implementing agent — Sprint advancement is blocked until all fixes in the current sprint pass.
5. Only the QA Verification Agent may declare a sprint complete.

---

## STEP 5 — Push all work to the `staging` branch. Never push directly to `main`.

All code changes, test files, seed scripts, and configuration updates go to the `staging` branch only. The branch naming convention per sprint is: `staging/sprint-1-p0-security`, `staging/sprint-2-auth-hardening`, `staging/sprint-3-compliance`, `staging/sprint-4-quality`. Each sprint branch is merged into `staging` (not `main`) once the QA agent declares it complete.

No changes reach `main` until all four sprints have passed full QA verification on `staging` and a separate promotion review is conducted by the lead agent.

Use the GitHub Contents API (the method established in prior sessions, using `?ref=staging` and `"branch": "staging"` in the PUT payload) if direct `git push` is unavailable in the environment. Ensure the `staging` branch exists before beginning — create it from `main` if it does not.

**Canary deploy sequence (staging environment only):** For Sprint 1, after the `staging` branch is updated: 1% traffic → monitor 30 min → 10% → monitor 2h → 50% → full staging traffic. Post-deploy smoke commands are in the fix cards — run them all. Roll back to the previous `staging` commit immediately if error rate exceeds baseline by more than 0.5%.

---

## GOVERNANCE INVARIANTS — never violate these under any circumstances.

- **P9**: All currency values stored and computed in integer kobo. No float arithmetic on money.
- **T3**: Every D1 query that touches user-scoped data must include `AND tenant_id = ?`. The QA agent must run the hostile-tenant RLS suite after every financial or identity fix.
- **WF-0xx**: All wallet state transitions are atomic D1 transactions. Never split a debit and credit across separate queries.
- **G23**: Audit log entries are append-only. No update or delete on `audit_logs` table, ever.

Any agent that detects a proposed change that would violate a governance invariant must halt and escalate to the lead agent immediately, before writing any code.

---

## Ready to Begin Checklist

You are ready to begin when you can confirm all of the following:

- [ ] All five context documents have been read in full
- [ ] All six agent workstreams are assigned with the correct agent type
- [ ] The `staging` branch exists on GitHub (create from `main` if not present)
- [ ] You can state BUG-001, BUG-002, BUG-003 verbatim from the documents
- [ ] You can state all four governance invariants (P9, T3, WF-0xx, G23) verbatim from the documents

Do not begin any implementation until every item on this checklist is confirmed.
