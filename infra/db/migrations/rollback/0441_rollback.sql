-- Rollback 0441 — Mutual Aid Requests
DROP INDEX IF EXISTS idx_mutual_aid_votes_request;
DROP INDEX IF EXISTS idx_mutual_aid_votes_unique;
DROP TABLE IF EXISTS mutual_aid_votes;
DROP INDEX IF EXISTS idx_mutual_aid_requests_requester;
DROP INDEX IF EXISTS idx_mutual_aid_requests_tenant_group;
DROP TABLE IF EXISTS mutual_aid_requests;
