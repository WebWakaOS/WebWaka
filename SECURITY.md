# Security Policy

## Reporting a Vulnerability

Do **not** open a public GitHub issue for security vulnerabilities.

Report privately to the WebWaka security team at: **security@webwaka.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested mitigations

We will respond within 72 hours and coordinate a fix before public disclosure.

## Security Baseline

WebWaka OS follows the rules defined in `docs/governance/security-baseline.md`.

Key rules:
- All secrets are stored in GitHub Actions secrets or Cloudflare secrets — never in code
- All API routes require tenant-scoped JWT authentication except explicitly public endpoints
- All DB queries are tenant-scoped — cross-tenant data access is a critical bug
- RBAC is enforced at the middleware layer using `@webwaka/core`
- Audit logs are required for all destructive and financial operations
- Rate limiting is applied to all public and authenticated endpoints

## Dependency Security

Dependabot is enabled on this repository. Security advisories are triaged within 48 hours.

## Supported Versions

| Version | Supported |
|---|---|
| main (latest) | ✅ |
| staging | ✅ (pre-release) |
| older branches | ❌ |
