/**
 * FX Rates Routes — P24 Multi-Currency Foundation
 *
 * Provides platform-wide FX rate lookup for currency conversion display.
 * Rates are stored as integers scaled by 1,000,000 to avoid floats (P9 invariant extended).
 * actual_rate = rate / 1_000_000
 *
 * Routes:
 *   GET /fx-rates                              — list all active rates (public)
 *   GET /fx-rates/:base/:quote                 — get specific rate (public)
 *   POST /fx-rates                             — upsert rate (super_admin only)
 *   GET /fx-rates/convert                      — convert amount between currencies
 *
 * Platform Invariants:
 *   P9  — All amounts integer kobo/smallest unit; rates integer × 1,000,000
 *   T3  — FX rates are platform-wide (not tenant-scoped)
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

export const fxRatesRoutes = new Hono<AppEnv>();

// Supported currencies (D11 — USDT precision blocked pending founder decision)
const SUPPORTED_CURRENCIES = ['NGN', 'GHS', 'KES', 'ZAR', 'USD', 'CFA'] as const;

// ---------------------------------------------------------------------------
// GET /fx-rates — List all active rates
// ---------------------------------------------------------------------------

fxRatesRoutes.get('/', async (c) => {
  const db = c.env.DB as unknown as D1Like;
  const now = Math.floor(Date.now() / 1000);

  const rates = await db
    .prepare(
      `SELECT id, base_currency, quote_currency, rate, rate_inverse, source, effective_at, expires_at
       FROM fx_rates
       WHERE (expires_at IS NULL OR expires_at > ?)
       ORDER BY base_currency, quote_currency, effective_at DESC`,
    )
    .bind(now)
    .all<{
      id: string;
      base_currency: string;
      quote_currency: string;
      rate: number;
      rate_inverse: number;
      source: string;
      effective_at: number;
      expires_at: number | null;
    }>();

  return c.json({
    rates: rates.results.map((r) => ({
      ...r,
      rate_actual: r.rate / 1_000_000,
      rate_inverse_actual: r.rate_inverse / 1_000_000,
    })),
    total: rates.results.length,
  });
});

// ---------------------------------------------------------------------------
// GET /fx-rates/:base/:quote — Get specific rate
// ---------------------------------------------------------------------------

fxRatesRoutes.get('/:base/:quote', async (c) => {
  const base = c.req.param('base').toUpperCase();
  const quote = c.req.param('quote').toUpperCase();
  const db = c.env.DB as unknown as D1Like;
  const now = Math.floor(Date.now() / 1000);

  const rate = await db
    .prepare(
      `SELECT id, base_currency, quote_currency, rate, rate_inverse, source, effective_at, expires_at
       FROM fx_rates
       WHERE base_currency = ? AND quote_currency = ?
         AND (expires_at IS NULL OR expires_at > ?)
       ORDER BY effective_at DESC LIMIT 1`,
    )
    .bind(base, quote, now)
    .first<{
      id: string;
      base_currency: string;
      quote_currency: string;
      rate: number;
      rate_inverse: number;
      source: string;
      effective_at: number;
      expires_at: number | null;
    }>();

  if (!rate) {
    return c.json({ error: `No active rate found for ${base}/${quote}` }, 404);
  }

  return c.json({
    ...rate,
    rate_actual: rate.rate / 1_000_000,
    rate_inverse_actual: rate.rate_inverse / 1_000_000,
  });
});

// ---------------------------------------------------------------------------
// GET /fx-rates/convert — Convert amount between currencies
// Query params: from, to, amount (integer smallest unit)
// ---------------------------------------------------------------------------

fxRatesRoutes.get('/convert', async (c) => {
  const from = (c.req.query('from') ?? '').toUpperCase();
  const to = (c.req.query('to') ?? '').toUpperCase();
  const amountRaw = c.req.query('amount');

  if (!from || !to || !amountRaw) {
    return c.json({ error: 'from, to, and amount query parameters are required' }, 400);
  }

  const inputUnits = parseInt(amountRaw);
  if (!Number.isInteger(inputUnits) || inputUnits <= 0) {
    return c.json({ error: 'amount must be a positive integer (P9 invariant)' }, 422);
  }

  if (from === to) {
    return c.json({ from, to, input_amount: inputUnits, converted_amount: inputUnits, rate: 1_000_000 });
  }

  const db = c.env.DB as unknown as D1Like;
  const now = Math.floor(Date.now() / 1000);

  const rateRow = await db
    .prepare(
      `SELECT rate FROM fx_rates
       WHERE base_currency = ? AND quote_currency = ?
         AND (expires_at IS NULL OR expires_at > ?)
       ORDER BY effective_at DESC LIMIT 1`,
    )
    .bind(from, to, now)
    .first<{ rate: number }>();

  if (!rateRow) {
    return c.json({ error: `No active rate found for ${from}/${to}` }, 404);
  }

  // Multiply by rate (integer × 1_000_000 scaled) then integer-divide back.
  // Both inputUnits and rateRow.rate are integers — result is integer kobo (P9).
  const scaledProduct = inputUnits * rateRow.rate;
  const convertedUnits = Math.trunc(scaledProduct / 1_000_000);

  return c.json({
    from,
    to,
    input_amount: inputUnits,
    converted_amount: convertedUnits,
    rate: rateRow.rate,
    rate_actual: rateRow.rate / 1_000_000,
    note: 'Displayed amounts are approximate. Settlement is always in NGN.',
  });
});

// ---------------------------------------------------------------------------
// POST /fx-rates — Upsert a rate (super_admin only)
// ---------------------------------------------------------------------------

fxRatesRoutes.post('/', async (c) => {
  const auth = c.get('auth') as AuthContext | undefined;
  if (!auth) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  if ((auth as { role?: string }).role !== 'super_admin') {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  let body: {
    base_currency?: string;
    quote_currency?: string;
    rate?: number;
    rate_inverse?: number;
    source?: string;
    expires_in_hours?: number;
  } = {};

  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const base = (body.base_currency ?? '').toUpperCase();
  const quote = (body.quote_currency ?? '').toUpperCase();

  if (!base || !quote || !body.rate || !body.rate_inverse) {
    return c.json({ error: 'base_currency, quote_currency, rate, and rate_inverse are required' }, 400);
  }

  if (!Number.isInteger(body.rate) || body.rate <= 0) {
    return c.json({ error: 'rate must be a positive integer × 1,000,000 (e.g. 1 NGN/USD = 650 for 0.00065)' }, 422);
  }

  if (!SUPPORTED_CURRENCIES.includes(base as typeof SUPPORTED_CURRENCIES[number]) &&
      !SUPPORTED_CURRENCIES.includes(quote as typeof SUPPORTED_CURRENCIES[number])) {
    return c.json({ error: `Unsupported currency pair. Supported: ${SUPPORTED_CURRENCIES.join(', ')}` }, 422);
  }

  const db = c.env.DB as unknown as D1Like;
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = body.expires_in_hours ? now + body.expires_in_hours * 3600 : null;

  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO fx_rates (id, base_currency, quote_currency, rate, rate_inverse, source, effective_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, base, quote, body.rate, body.rate_inverse, body.source ?? 'manual', now, expiresAt)
    .run();

  return c.json({
    id,
    base_currency: base,
    quote_currency: quote,
    rate: body.rate,
    rate_inverse: body.rate_inverse,
    rate_actual: body.rate / 1_000_000,
    source: body.source ?? 'manual',
    effective_at: now,
    expires_at: expiresAt,
  }, 201);
});
