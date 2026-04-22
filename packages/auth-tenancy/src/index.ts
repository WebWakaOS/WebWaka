/**
 * @webwaka/auth-tenancy
 *
 * This package is the declared home for auth, tenancy, JWT, RBAC, and session
 * middleware primitives.  The full implementation lives in @webwaka/auth and is
 * re-exported here so that any future consumer of @webwaka/auth-tenancy gets the
 * real surface without importing from two different package names.
 *
 * If the implementations are ever separated (auth vs tenancy) the exports below
 * should be split accordingly.  Until then this forwarding stub ensures the
 * package is never empty and any import resolves correctly.
 */

export * from '@webwaka/auth';
