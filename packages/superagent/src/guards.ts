const PROHIBITED_FINANCIAL_TABLES = [
  'billing_history',
  'wc_wallets',
  'wc_transactions',
  'partner_credit_pools',
  'float_ledger',
  'agent_wallets',
  'negotiation_offers',
  'vendor_pricing_policies',
  'listing_price_overrides',
  'subscription_payments',
  'airtime_transactions',
  'pos_transactions',
  'subscriptions',
] as const;

export class AIFinancialWriteError extends Error {
  readonly statusCode = 403;
  readonly code = 'AI_FINANCIAL_WRITE_BLOCKED';

  constructor(table: string) {
    super(`AI-initiated write to financial table '${table}' is prohibited. Human approval required.`);
    this.name = 'AIFinancialWriteError';
  }
}

export function guardAIFinancialWrite(sql: string): void {
  const normalized = sql.toUpperCase().replace(/\s+/g, ' ').trim();

  const isWrite =
    normalized.startsWith('INSERT') ||
    normalized.startsWith('UPDATE') ||
    normalized.startsWith('DELETE') ||
    normalized.startsWith('REPLACE');

  if (!isWrite) return;

  const sqlLower = sql.toLowerCase().replace(/\s+/g, ' ');
  for (const table of PROHIBITED_FINANCIAL_TABLES) {
    if (sqlLower.includes(table)) {
      throw new AIFinancialWriteError(table);
    }
  }
}

export function getProhibitedFinancialTables(): readonly string[] {
  return PROHIBITED_FINANCIAL_TABLES;
}
