# WebWaka Infra Scripts

## apply-migrations.sh — Interactive Migration Runner

Applies D1 SQL migrations to staging or production in order.

```bash
# Apply ALL migrations to staging (safe to re-run — D1 is idempotent on most DDL)
./infra/scripts/apply-migrations.sh staging

# Apply ALL migrations to production
./infra/scripts/apply-migrations.sh production

# Resume from a specific migration (e.g. after a failure at 0045)
./infra/scripts/apply-migrations.sh staging 45

# Apply ONLY negotiation migrations (0181–0185)
./infra/scripts/apply-migrations.sh staging 181
```

### Key migration checkpoints

| Range | What it covers |
|---|---|
| 0001–0006 | ✅ Already in new repo (places, entities, workspaces, subscriptions, profiles, political) |
| 0007–0025 | Relationships, search, discovery, claim, payments, event log, users, KYC, OTP, contact |
| 0026–0035 | Community (spaces, channels, courses, events, moderation), social profiles |
| 0036–0054 | Verticals core, POS, wallets, AI usage, superagent, politician, civic/church/NGO, cooperative |
| 0055–0180 | All 124 vertical-specific tables |
| 0181–0185 | **Negotiation** (vendor policies, listing overrides, sessions, offers, audit log) |
| 0186–0190 | Ministry members, schema fixes, billing, users auth columns |

---

## apply-migrations-ci.sh — Non-interactive (GitHub Actions)

Used in CI pipelines. Fails fast on any error.

```bash
ENV=staging ./infra/scripts/apply-migrations-ci.sh
ENV=production START_FROM=7 ./infra/scripts/apply-migrations-ci.sh
```

---

## Troubleshooting

**"Table already exists" error** — safe to ignore, D1 DDL is mostly idempotent. Script will ask to continue.

**Auth error** — run `npx wrangler login` first.

**Wrong database** — double-check `wrangler.toml` binding names match `--env` flag.
