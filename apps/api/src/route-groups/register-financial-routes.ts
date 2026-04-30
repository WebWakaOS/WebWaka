/**
 * Route Group: Financial Routes (POS, Payments, Billing, Wallet, B2B)
 * ARC-07 router split — Phase 0.5
 */
import type { Hono } from 'hono';
import type { Env } from '../env.js';
import { authMiddleware } from '../middleware/auth.js';
import { auditLogMiddleware } from '../middleware/audit-log.js';
import { requireEntitlement } from '../middleware/entitlement.js';
import { emailVerificationEnforcement } from '../middleware/email-verification.js';
import { PlatformLayer } from '@webwaka/types';
import { posRoutes } from '../routes/pos.js';
import {
  paymentsVerifyRoute,
  paymentsMethodRoute,
} from '../routes/payments.js';
import { billingRoutes } from '../routes/billing.js';
import { bankTransferRoutes } from '../routes/bank-transfer.js';
import { walletRoutes } from '../routes/hl-wallet.js';
import { b2bMarketplaceRoutes } from '../routes/b2b-marketplace.js';
import { airtimeRoutes } from '../routes/airtime.js';

export function registerFinancialRoutes(app: Hono<{ Bindings: Env }>): void {
  // -------------------------------------------------------------------------
  // M7b: POS terminal + float ledger routes — auth required (P9/T3/T4)
  // F-001 fix: POS float + terminal routes require Operational plan (starter+).
  // -------------------------------------------------------------------------

  app.use('/pos/*', authMiddleware);
  app.use('/pos/*', requireEntitlement(PlatformLayer.Operational));
  app.use('/pos/*', auditLogMiddleware);
  app.route('/pos', posRoutes);

  // -------------------------------------------------------------------------
  // M6: Payment verification route — auth required
  // -------------------------------------------------------------------------

  app.use('/payments/*', authMiddleware);
  app.use('/payments/*', auditLogMiddleware);
  app.route('/payments', paymentsVerifyRoute);
  app.route('/payments', paymentsMethodRoute);

  // -------------------------------------------------------------------------
  // M7e: Airtime top-up routes — auth required (P2/P9/T3/T4)
  // -------------------------------------------------------------------------

  app.use('/airtime/*', authMiddleware);
  app.use('/airtime/*', auditLogMiddleware);
  app.route('/airtime', airtimeRoutes);

  // -------------------------------------------------------------------------
  // PROD-09: Billing enforcement routes — auth required
  // -------------------------------------------------------------------------

  app.use('/billing/*', authMiddleware);
  app.use('/billing/*', auditLogMiddleware);
  app.route('/billing', billingRoutes);

  // -------------------------------------------------------------------------
  // P21: Bank Transfer Payment — auth + email verification required
  // -------------------------------------------------------------------------

  app.use('/bank-transfer/*', authMiddleware);
  app.use('/bank-transfer/*', emailVerificationEnforcement);
  app.use('/bank-transfer/*', auditLogMiddleware);
  app.route('/bank-transfer', bankTransferRoutes);

  // -------------------------------------------------------------------------
  // HandyLife Wallet — user-level NGN wallet (WF-001 – WF-056)
  // -------------------------------------------------------------------------

  app.use('/wallet/*', authMiddleware);
  app.use('/wallet/*', auditLogMiddleware);
  app.route('/wallet', walletRoutes);

  // -------------------------------------------------------------------------
  // P25: B2B Marketplace — auth + email verification required
  // -------------------------------------------------------------------------

  app.use('/b2b/*', authMiddleware);
  app.use('/b2b/*', emailVerificationEnforcement);
  app.use('/b2b/*', auditLogMiddleware);
  app.route('/b2b', b2bMarketplaceRoutes);
}
