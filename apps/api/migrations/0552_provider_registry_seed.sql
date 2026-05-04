-- Provider Registry Initial Seed (Migration 0552)
-- Seeds platform-level provider registry rows matching existing CF Worker Secrets config.

-- AI Providers
INSERT OR IGNORE INTO provider_registry (id, category, provider_name, display_name, status, scope, priority, routing_policy, capabilities, config_json, created_at, updated_at)
VALUES
  ('pvd_groq_01', 'ai', 'groq', 'Groq', 'active', 'platform', 10, 'primary',
   '["superagent_chat","function_call","pos_receipt_ai","shift_summary_ai","bio_generator","brand_copywriter","listing_enhancer","inventory_ai","content_moderation"]',
   '{"baseUrl":"https://api.groq.com/openai/v1","defaultModel":"llama-3.1-8b-instant","freeModelFirst":true}',
   unixepoch(), unixepoch()),

  ('pvd_openrouter_01', 'ai', 'openrouter', 'OpenRouter', 'active', 'platform', 20, 'failover',
   '["superagent_chat","function_call","pos_receipt_ai","shift_summary_ai","fraud_flag_ai","bio_generator","brand_copywriter","seo_meta_ai","listing_enhancer","review_summary","search_rerank","price_suggest","embedding","content_moderation","inventory_ai"]',
   '{"baseUrl":"https://openrouter.ai/api/v1","defaultModel":"meta-llama/llama-3.1-8b-instruct:free","freeModelFirst":true}',
   unixepoch(), unixepoch()),

  ('pvd_together_01', 'ai', 'together', 'Together AI', 'inactive', 'platform', 30, 'failover',
   '["superagent_chat","embedding","bio_generator","brand_copywriter","listing_enhancer","inventory_ai"]',
   '{"baseUrl":"https://api.together.xyz/v1","defaultModel":"meta-llama/Llama-3.2-3B-Instruct-Turbo"}',
   unixepoch(), unixepoch()),

  ('pvd_deepinfra_01', 'ai', 'deepinfra', 'DeepInfra', 'inactive', 'platform', 40, 'failover',
   '["superagent_chat","embedding","bio_generator","listing_enhancer","content_moderation"]',
   '{"baseUrl":"https://api.deepinfra.com/v1/openai","defaultModel":"meta-llama/Meta-Llama-3.1-8B-Instruct"}',
   unixepoch(), unixepoch());

-- Email Providers
INSERT OR IGNORE INTO provider_registry (id, category, provider_name, display_name, status, scope, priority, routing_policy, capabilities, config_json, created_at, updated_at)
VALUES
  ('pvd_cloudflare_email_01', 'email', 'cloudflare_email', 'Cloudflare Email Service',
   'inactive', 'platform', 10, 'primary',
   '["email_transactional"]',
   '{"fromAddress":"WebWaka <noreply@webwaka.com>","domain":"webwaka.com","note":"Activate after domain verified in CF Email Service dashboard"}',
   unixepoch(), unixepoch()),

  ('pvd_resend_01', 'email', 'resend', 'Resend',
   'active', 'platform', 20, 'failover',
   '["email_transactional"]',
   '{"fromAddress":"WebWaka <noreply@webwaka.com>","apiEndpoint":"https://api.resend.com/emails"}',
   unixepoch(), unixepoch());

-- SMS/OTP Providers
INSERT OR IGNORE INTO provider_registry (id, category, provider_name, display_name, status, scope, priority, routing_policy, capabilities, config_json, created_at, updated_at)
VALUES
  ('pvd_termii_01', 'sms', 'termii', 'Termii',
   'active', 'platform', 10, 'primary',
   '["sms_otp","sms_transactional"]',
   '{"apiEndpoint":"https://api.ng.termii.com/api/sms/send","defaultSenderId":"WebWaka","channel":"generic","country":"NG"}',
   unixepoch(), unixepoch());

-- Payment Providers
INSERT OR IGNORE INTO provider_registry (id, category, provider_name, display_name, status, scope, priority, routing_policy, capabilities, config_json, created_at, updated_at)
VALUES
  ('pvd_paystack_01', 'payment', 'paystack', 'Paystack',
   'active', 'platform', 10, 'primary',
   '["payment_collection","subscription_billing","bank_transfer_verify"]',
   '{"apiEndpoint":"https://api.paystack.co","currency":"NGN","country":"NG"}',
   unixepoch(), unixepoch());

-- Identity Verification Providers
INSERT OR IGNORE INTO provider_registry (id, category, provider_name, display_name, status, scope, priority, routing_policy, capabilities, config_json, created_at, updated_at)
VALUES
  ('pvd_prembly_01', 'identity', 'prembly', 'Prembly',
   'active', 'platform', 10, 'primary',
   '["bvn_verify","nin_verify","cac_verify","frsc_verify"]',
   '{"apiEndpoint":"https://api.prembly.com","country":"NG"}',
   unixepoch(), unixepoch());
