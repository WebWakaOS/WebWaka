# Agent Execution Rules

**Status:** ACTIVE
**Owner:** Perplexity (initial) + Base44 (refinement) → Founder (approval)
**Last updated:** 2026-04-11

---

## Purpose

This document defines how Replit Agent 4, Base44 Super Agent, and Perplexity must coordinate, hand off work, and operate within WebWaka OS. All agents must follow these rules.

---

## Pre-Implementation Rules (apply to all agents)

1. **Read `docs/governance/platform-invariants.md` before starting any task.**
2. **Read all relevant TDRs** in `docs/architecture/decisions/` before implementing a feature.
3. **No implementation begins before the governance doc skeleton exists** (Milestone 1 must be complete before Milestone 2 starts).
4. **No vertical-specific code before the shared packages it depends on** are implemented.
5. **No undocumented infrastructure changes.** Every Cloudflare resource, GitHub secret, and environment variable must be documented in `infra/`.

---

## Replit Agent 4 Rules

- Is the primary implementation engine for all `packages/*` and `apps/*` code.
- Must produce typed, tested, governance-compliant code.
- Must follow the build order in the master build prompt exactly (Phase 1 → Phase 7).
- For every task, must report:
  - Files added or changed
  - Package boundaries respected
  - Tests added
  - Unresolved blockers
- Must not commit directly to `staging` or `main`. All code goes through PRs.
- Must not create new Cloudflare resources or GitHub secrets — that is Base44's responsibility.
- Must not invent architecture not present in governance docs — open an issue instead.

---

## Base44 Super Agent Rules

- Owns all infrastructure: GitHub repo, branches, protections, labels, workflows, Cloudflare Workers, D1, KV, R2, secrets.
- Owns the milestone tracker and continuity notes.
- Reviews all Replit outputs for governance compliance before marking milestones done.
- Must record every infrastructure resource it creates in `infra/cloudflare/` or `infra/github-actions/` — never assumes another agent knows the state.
- Must not implement business logic in `packages/` or `apps/` — that is Replit's responsibility.
- For every infrastructure change, must commit a record to the repo so the state is auditable.
- Leads staging hardening (Milestone 10) and production deployment control (Milestone 12).

---

## Perplexity Rules

- Drafts governance documents, TDRs, architecture specs, and implementation prompts.
- Does not push code or configure infrastructure directly.
- All drafts are submitted as files in the appropriate `docs/` subfolder.
- Must flag ambiguities or contradictions in governance docs as GitHub issues before Replit implements.

---

## Handoff Protocol

### Base44 → Replit handoff
Before Replit starts a milestone:
1. Base44 confirms the repo structure is in place.
2. Base44 confirms the relevant governance docs and TDRs are in `docs/`.
3. Base44 opens a GitHub issue for the milestone with the master build prompt as a comment.
4. Replit picks up the issue and begins implementation.

### Replit → Base44 handoff
After Replit completes implementation for a milestone:
1. Replit opens a PR to `staging` with full description.
2. Base44 reviews for governance compliance.
3. If compliant: Base44 approves and merges, then runs staging verification.
4. If not compliant: Base44 requests changes with specific governance references.

### Staging → Production handoff
1. Base44 runs full milestone release checklist (see `docs/governance/release-governance.md`).
2. Base44 notifies Founder with staging URL and checklist results.
3. Founder reviews and gives explicit go/no-go.
4. On go: Base44 merges staging → main.
5. On no-go: issues are filed and Replit fixes before re-verification.

---

## Blocking Rule

If any agent encounters a situation where proceeding would require:
- Violating a platform invariant
- Making an undocumented architecture decision
- Skipping a required governance document

**The agent must stop, open a GitHub issue with the `blocked` + `founder-approval` labels, and wait for resolution.**

---

## Continuity Rule

Everything must be written so another agent can resume seamlessly if interrupted:
- Code: typed, testable, commented
- Decisions: recorded in TDRs
- Infrastructure: documented in `infra/`
- Progress: updated in `docs/governance/milestone-tracker.md`
- Blockers: filed as GitHub issues

---

## Governance Enforcement

### CI Governance Checks (10 automated checks)
The following automated checks run on every PR via `.github/workflows/ci.yml`:

| # | Script | Invariant | What It Checks |
|---|--------|-----------|---------------|
| 1 | `check-cors.ts` | Security §8 | CORS non-wildcard, no localhost in production |
| 2 | `check-tenant-isolation.ts` | T3 | No tenant_id from user input (must come from auth context) |
| 3 | `check-ai-direct-calls.ts` | P7 | No direct OpenAI/Anthropic SDK usage outside @webwaka/ai-adapters |
| 4 | `check-monetary-integrity.ts` | T4/P9 | No parseFloat/toFixed on monetary field names (integer kobo only) |
| 5 | `check-dependency-sources.ts` | Security §9 | No file:/github: dependency references in package.json |
| 6 | `check-rollback-scripts.ts` | Release Gov. | Every migration has a rollback script (.rollback.sql or .rollback.md) |
| 7 | `check-pillar-prefix.ts` | 3-in-1 §7 | Every package.json description starts with [Pillar N], [AI], or [Infra] |
| 8 | `check-pwa-manifest.ts` | P5 | All client-facing apps (except api/ussd-gateway) have PWA manifest |
| 9 | `check-ndpr-before-ai.ts` | G5/P10 | NDPR consent gate, USSD exclusion, and AI entitlement on SuperAgent routes |
| 10 | `check-geography-integrity.ts` | T6 | Geography seed integrity — zones, states, LGAs, wards, priority states, hierarchy |

All 10 checks are located in `scripts/governance-checks/` and must pass before any merge to staging or main.

### Pillar Awareness
All agents must classify their work by pillar before implementing:
- Identify the primary pillar(s) affected by the task
- New packages must have `[Pillar N]` prefix in `package.json` description
- New routes or features must be placed in the correct pillar's app
- Cross-pillar features must be documented as such

### Release Changelog
Every PR must update `CHANGELOG.md` at the repo root. See `docs/governance/release-governance.md` for full release flow.

### Secret Rotation
All secrets must be rotated every 90 days. See `infra/cloudflare/secrets-rotation-log.md` for the rotation schedule and procedures.

### Current Workflow (Practical)
The current development workflow uses Replit Agent with direct pushes to `staging` via GitHub API, followed by retrospective audit. This differs from the ideal PR-based flow described above. Both workflows are acceptable provided:
1. Every batch of changes has an associated audit trail (commit messages, session logs)
2. CI governance checks pass on all code before promotion to main
3. Founder has visibility into all changes via GitHub notifications
4. CHANGELOG.md is maintained after each batch of work
