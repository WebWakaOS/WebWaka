/**
 * Platform-admin settings routes.
 *
 *   GET  /platform-admin/settings/payment  — read platform receiving bank account
 *   PATCH /platform-admin/settings/payment  — update platform receiving bank account
 *
 * All routes require super_admin role (enforced in router.ts).
 *
 * The platform bank account is stored in WALLET_KV under the key
 * `platform:payment:bank_account` (JSON string). This is the account
 * WebWaka uses to receive subscription/upgrade payments from workspace
 * owners when operating in bank_transfer (manual) mode.
 *
 * It is distinct from workspace-level bank accounts
 * (workspaces.payment_bank_account_json) which are the accounts workspace
 * owners use to collect payments from their own customers.
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

export const platformAdminSettingsRoutes = new Hono<AppEnv>();

const PLATFORM_BANK_KV_KEY = 'platform:payment:bank_account';

interface PlatformBankAccount {
  bank_name:      string;
  account_number: string;
  account_name:   string;
  bank_code?:     string;
  sort_code?:     string;
}

// ---------------------------------------------------------------------------
// GET /platform-admin/settings/payment
// ---------------------------------------------------------------------------

platformAdminSettingsRoutes.get('/payment', async (c) => {
  const kv = c.env.WALLET_KV;

  let bankAccount: PlatformBankAccount | null = null;

  if (kv) {
    const raw = await kv.get(PLATFORM_BANK_KV_KEY);
    if (raw) {
      try {
        bankAccount = JSON.parse(raw) as PlatformBankAccount;
      } catch {
        bankAccount = null;
      }
    }
  }

  if (!bankAccount && c.env.PLATFORM_BANK_ACCOUNT_JSON) {
    try {
      bankAccount = JSON.parse(c.env.PLATFORM_BANK_ACCOUNT_JSON) as PlatformBankAccount;
    } catch {
      bankAccount = null;
    }
  }

  return c.json({
    bank_account:  bankAccount,
    source:        bankAccount ? (kv ? 'kv' : 'env') : 'none',
    kv_available:  !!(kv),
    instructions:  'Set bank_name, account_number, account_name, bank_code (optional), sort_code (optional). This account is shown to workspace owners when they upgrade their plan via bank transfer.',
  });
});

// ---------------------------------------------------------------------------
// PATCH /platform-admin/settings/payment
// ---------------------------------------------------------------------------

platformAdminSettingsRoutes.patch('/payment', async (c) => {
  const kv = c.env.WALLET_KV;
  if (!kv) {
    return c.json({ error: 'WALLET_KV binding not available in this environment' }, 503);
  }

  let body: Partial<PlatformBankAccount> = {};
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.bank_name || !body.account_number || !body.account_name) {
    return c.json({ error: 'bank_name, account_number, and account_name are required' }, 400);
  }

  if (!/^\d{10}$/.test(body.account_number)) {
    return c.json({ error: 'account_number must be exactly 10 digits (Nigerian NUBAN format)' }, 400);
  }

  const bankAccount: PlatformBankAccount = {
    bank_name:      body.bank_name.trim(),
    account_number: body.account_number.trim(),
    account_name:   body.account_name.trim(),
    ...(body.bank_code  ? { bank_code:  body.bank_code.trim()  } : {}),
    ...(body.sort_code  ? { sort_code:  body.sort_code.trim()  } : {}),
  };

  await kv.put(PLATFORM_BANK_KV_KEY, JSON.stringify(bankAccount));

  return c.json({
    message:      'Platform payment bank account updated successfully.',
    bank_account: bankAccount,
  });
});
