-- Migration: 0380_claim_requests_workspace_id
-- Description: Add workspace_id to claim_requests to track which workspace submitted the claim.
--
-- This column is needed to:
--   1. Link the profile to the workspace when a claim is approved (profiles.workspace_id update)
--   2. Allow workspace-scoped listing of claim requests (GET /workspaces/:id/claims)
--
-- Back-filled as NULL for existing rows (safe; no behavioral change for historic records).
-- New claims (via POST /claim/intent) will populate this from auth.workspaceId.

ALTER TABLE claim_requests ADD COLUMN workspace_id TEXT;

CREATE INDEX IF NOT EXISTS idx_claim_requests_workspace_id
  ON claim_requests(workspace_id) WHERE workspace_id IS NOT NULL;
