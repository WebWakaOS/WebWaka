-- Rollback: 0552_provider_registry_seed
-- Removes the initial platform provider registry seed rows.
-- Safe to run multiple times (DELETE WHERE id = ... has no effect if already gone).

DELETE FROM provider_registry WHERE id IN (
  'pvd_groq_01',
  'pvd_openrouter_01',
  'pvd_together_01',
  'pvd_deepinfra_01',
  'pvd_cloudflare_email_01',
  'pvd_resend_01',
  'pvd_termii_01',
  'pvd_paystack_01',
  'pvd_prembly_01'
);
