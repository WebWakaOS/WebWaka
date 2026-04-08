-- Migration: 0014_kyc_fields
-- Description: Add NIN/BVN fields to individuals and KYC tier to profiles.
-- (M7a: docs/governance/entitlement-model.md#cbn-kyc-tiers, docs/identity/bvn-nin-guide.md)
-- Rule R7: BVN/NIN values NEVER stored in plain text.
-- These columns store SHA-256(PLATFORM_SALT + value) for deduplication only.

ALTER TABLE individuals ADD COLUMN nin_hash TEXT;
ALTER TABLE individuals ADD COLUMN bvn_hash TEXT;
ALTER TABLE individuals ADD COLUMN nin_verified INTEGER NOT NULL DEFAULT 0;
ALTER TABLE individuals ADD COLUMN bvn_verified INTEGER NOT NULL DEFAULT 0;

-- kyc_tier: 0=unverified, 1=phone+name, 2=BVN+address, 3=BVN+NIN+proof
ALTER TABLE profiles ADD COLUMN kyc_tier INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN bvn_verified_at INTEGER;
ALTER TABLE profiles ADD COLUMN nin_verified_at INTEGER;

-- Sparse indexes — only populated when verified
CREATE INDEX IF NOT EXISTS idx_individuals_bvn_verified
  ON individuals(bvn_verified) WHERE bvn_verified = 1;

CREATE INDEX IF NOT EXISTS idx_individuals_nin_verified
  ON individuals(nin_verified) WHERE nin_verified = 1;

CREATE INDEX IF NOT EXISTS idx_profiles_kyc_tier
  ON profiles(kyc_tier);
