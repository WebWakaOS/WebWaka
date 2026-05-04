-- Rollback: 0547_missing_political_parties
DELETE FROM organizations WHERE id = 'org_political_party_accord';
