# Branch Protection Rules — WebWaka OS

**Last updated:** 2026-04-12

Configure these rules in **GitHub → Settings → Branches → Branch protection rules**.

---

## `staging` branch (primary development target)

| Setting | Value |
|---|---|
| Require pull request reviews | Yes — 1 approval minimum |
| Dismiss stale reviews on push | Yes |
| Require status checks to pass | Yes |
| Required status checks | `CI / TypeScript Check`, `CI / Tests`, `CI / Lint`, `CI / Security Audit`, `CI / Governance Checks` |
| Require branches to be up to date | Yes |
| Require conversation resolution | Yes |
| Restrict who can push | Maintainers only |
| Allow force pushes | No |
| Allow deletions | No |

---

## `main` branch (production release)

| Setting | Value |
|---|---|
| Require pull request reviews | Yes — 2 approvals minimum |
| Dismiss stale reviews on push | Yes |
| Require status checks to pass | Yes |
| Required status checks | `CI / TypeScript Check`, `CI / Tests`, `CI / Lint`, `CI / Security Audit`, `CI / Governance Checks` |
| Require branches to be up to date | Yes |
| Require signed commits | Recommended |
| Restrict who can push | Admins only |
| Allow force pushes | No |
| Allow deletions | No |
| Lock branch | No (allow merges) |

---

## Enforcement Checklist

- [ ] Enable `staging` branch protection with settings above
- [ ] Enable `main` branch protection with settings above
- [ ] Verify CI workflow names match the required status checks
- [ ] Test by creating a PR and confirming checks are enforced
- [ ] Confirm force push is blocked on both branches
