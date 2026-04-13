# Contributing to WebWaka OS

WebWaka OS is a governance-driven, multi-tenant, multi-vertical SaaS platform for Africa (Nigeria-first). Read `docs/governance/` before implementing anything — the platform invariants and core principles are non-negotiable.

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 20 | Runtime |
| pnpm | ≥ 9 | Package manager (monorepo) |
| Wrangler CLI | ≥ 3 | Cloudflare Workers dev/deploy |
| TypeScript | ≥ 5.4 | Language (strict mode) |

Install Wrangler globally:
```bash
npm i -g wrangler
wrangler login
```

---

## Setup

```bash
git clone https://github.com/WebWakaDOS/webwaka-os.git
cd webwaka-os
pnpm install
```

Copy env vars for local dev:
```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars    # add JWT_SECRET, RESEND_API_KEY etc.
```

Start local API (Miniflare):
```bash
cd apps/api && npx wrangler dev
```

---

## Architecture Overview

WebWaka OS is a monorepo with three top-level categories:

### Apps (Cloudflare Workers)

| App | Purpose | Port |
|-----|---------|------|
| `apps/api` | Main API — all business logic, 50+ route files | 8787 |
| `apps/admin-dashboard` | Tenant admin UI (SSR HTML) | 8788 |
| `apps/public-discovery` | Public search + SEO (SSR HTML + sitemaps) | 8789 |
| `apps/partner-admin` | Partner management dashboard | 8790 |
| `apps/platform-admin` | Super-admin platform controls | 8791 |

### Packages (shared libraries)

| Package | Purpose |
|---------|---------|
| `packages/auth` | JWT auth, `resolveAuthContext()`, `requireRole()` |
| `packages/types` | Platform types — `AuthContext`, `Env`, branded IDs |
| `packages/payments` | Paystack integration |
| `packages/entitlements` | Plan-based feature gates |
| `packages/frontend` | Shared HTML layout builders |
| `packages/superagent` | AI spend controls, credit engine, NDPR register |
| `packages/ai-abstraction` | AI type contracts and router |
| `packages/ai-adapters` | Provider adapters (OpenAI-compat, Anthropic, Eden AI) |
| `packages/i18n` | i18n framework (en, ha, yo, ig, pcm) |

### 3-in-1 Platform Model

| Pillar | Purpose | Worker |
|--------|---------|--------|
| Pillar 1 — Operations | Tenant workspace management, POS, sync | `apps/api` |
| Pillar 2 — Branding | Public discovery, SEO, listing pages | `apps/public-discovery` |
| Pillar 3 — Marketplace | Template registry, install, purchase | `apps/api` + `apps/admin-dashboard` |

SuperAgent is the **cross-cutting intelligence layer** — not a fourth pillar. See `docs/governance/superagent/`.

---

## Running Tests

```bash
pnpm test               # all tests across all packages/apps
pnpm typecheck          # TypeScript checks (0 errors required)
pnpm lint               # ESLint

# Single app
cd apps/api && npx vitest run
cd apps/public-discovery && npx vitest run

# Coverage
cd apps/api && npx vitest run --coverage
```

**Test baseline:** 396 tests (383 API + 13 public-discovery). New PRs must not reduce this count.

### Test patterns

All API tests use:
```typescript
const res = await app.fetch(new Request('http://localhost/path', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ...' },
  body: JSON.stringify({ ... }),
}), mockEnv);
```

Do NOT use `app.request()` — it does not pass `Bindings` env. See ADR-0015.

---

## Governance Checks

Before implementing AI features, run:
```bash
# Check governance baseline
cat docs/governance/superagent/05-document-update-plan.md | grep "🔲 TODO"
# All items should show ✅ DONE before Phase N AI work
```

---

## PR Guide

### Branch naming

```
feat/short-description      # new feature
fix/short-description        # bug fix
docs/short-description       # documentation only
chore/short-description      # tooling, deps, config
```

### Conventional commits

```
type(scope): short description

Types: feat, fix, chore, docs, refactor, test, ci, perf
Scopes: auth, api, marketplace, superagent, payments, templates, i18n, etc.

Examples:
  feat(marketplace): add template install flow with Paystack purchase
  fix(auth): use app.fetch not app.request in test helpers (B1)
  docs(governance): mark all DOC-001–013 as done
  chore(changesets): add @changesets/cli for changelog automation
```

### PR checklist

Before opening a PR:

- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm test` — baseline (396) tests pass + new tests for your feature
- [ ] T3 invariant: every new D1 table has `tenant_id NOT NULL` and every query filters by `tenant_id`
- [ ] P9 invariant: all money stored as integer kobo — no floats, no strings
- [ ] P13 invariant: no PII sent to AI — all AI paths go through SuperAgent SDK
- [ ] P10 invariant: NDPR consent checked before any personal data collection
- [ ] New routes have at least 3 tests: happy path, 401 (auth), 422 (validation)
- [ ] No new `any` types without a `// eslint-disable` justification comment
- [ ] Changeset added: `pnpm changeset:add`

---

## Platform Invariants Quick Reference

These are non-negotiable. PRs violating invariants will not be merged.

| Code | Invariant | Enforcement |
|------|-----------|-------------|
| **T3** | Every D1 query filters by `tenant_id` | Code review + test coverage |
| **P9** | All money in integer kobo; WakaCU in integer WC | TypeScript types + CHECK constraints |
| **P10** | NDPR consent checked before personal data collection | `consent_records` table gate |
| **P13** | No PII in AI requests | SuperAgent SDK PII filter |
| **P1** | Build once, use infinitely — shared packages, not vertical reimplementation | Package boundary rule |
| **P6** | Offline-first: critical reads work without network | Sync queue + local-first design |
| **P11** | Coordinates stored as integer × 1,000,000 (µdegrees) | No floats in geography fields |

Full invariant list: `docs/governance/3in1-platform-architecture.md`

---

## Package Boundaries

- Never import from a sibling app directly — use shared packages
- Never import `apps/*` from `packages/*`
- Vertical-specific code lives in `apps/` — shared code in `packages/`
- AI code in verticals MUST use `packages/superagent-sdk` — never `packages/ai-abstraction` directly

---

## Changesets (Changelog Automation)

```bash
# After a significant change, record it for the changelog
pnpm changeset:add

# When releasing, bump versions and generate CHANGELOG.md
pnpm changeset:version
```

See `.changeset/config.json` for configuration.

---

## Security

- All secrets via Wrangler Secrets (`wrangler secret put SECRET_NAME`) — never committed to repo
- BYOK keys AES-GCM encrypted in D1 before storage; decrypted only at request time; never returned in API responses
- JWT_SECRET must be ≥ 32 random bytes
- Report security issues to security@webwaka.com — do NOT open a public GitHub issue

---

## Questions

Open an issue using the appropriate template, or consult the agent coordination model in [AGENTS.md](./AGENTS.md).
