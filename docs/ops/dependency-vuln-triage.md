# Dependency Vulnerability Triage (H-3)

Last reviewed: 2026-04-30
Next review: 2026-05-14 (SLA: 30 days for moderate, 7 days for high/critical)

## Active Vulnerabilities

### 1. Vite — Path Traversal in Optimized Deps `.map` Handling
| Field | Value |
|-------|-------|
| Advisory ID | 1116229 |
| Package | `vite` |
| Severity | **Moderate** |
| Vulnerable versions | `<=6.4.1` |
| Patched version | `>=6.4.2` |
| Affected apps | `workspace-app` (dev dependency) |
| Exploitability | Low — requires local dev server access; production builds not affected |
| Fix plan | Update `vite` to `>=6.4.2` in next scheduled dependency update |
| Fix deadline | 2026-05-30 (30-day SLA for moderate) |
| Risk acceptance | ✅ Accepted: dev-only dependency, not deployed to production |

### 2. PostCSS — XSS via Unescaped `</style>` in CSS Stringify Output
| Field | Value |
|-------|-------|
| Advisory ID | 1117015 |
| Package | `postcss` |
| Severity | **Moderate** |
| Vulnerable versions | `<8.5.10` |
| Patched version | `>=8.5.10` |
| Affected apps | `workspace-app` (transitive via `vite`) |
| Exploitability | Low — requires untrusted CSS input to be stringified and injected into HTML without sanitization |
| Fix plan | Update `postcss` to `>=8.5.10` (dependency of `vite` — update vite to pull new version) |
| Fix deadline | 2026-05-30 (30-day SLA for moderate) |
| Risk acceptance | ✅ Accepted: build-time dependency only, production CSS is pre-compiled |

## Severity SLA Policy

| Severity | Response Time | Fix Deadline |
|----------|---------------|--------------|
| Critical | 24 hours | 3 days |
| High | 3 days | 7 days |
| Moderate | 7 days | 30 days |
| Low | 14 days | 90 days |

## Process

1. Run `pnpm audit` weekly (automated via Dependabot)
2. Triage new advisories within response time above
3. Document each in this file with risk assessment
4. Track fix PRs in GitHub issues
5. If fix requires major version bump, schedule for next sprint planning

## Dependabot Configuration

Dependabot is configured at the repository level (GitHub UI). It will:
- Open PRs for security updates automatically
- Target the `staging` branch for testing before production
- Group patch updates to reduce PR noise
