import { Hono } from 'hono';
import { PharmacyChainRepository, isValidPharmacyChainTransition } from '@webwaka/verticals-pharmacy-chain';
import type { PharmacyChainFSMState } from '@webwaka/verticals-pharmacy-chain';
import type { Env } from '../../env.js';

export const pharmacyChainRoutes = new Hono<{ Bindings: Env }>();

pharmacyChainRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  const repo = new PharmacyChainRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, pcnLicence: b['pcn_licence'] as string | undefined, nafdacLicence: b['nafdac_licence'] as string | undefined, cacRc: b['cac_rc'] as string | undefined, category: b['category'] as unknown as import('@webwaka/verticals-pharmacy-chain').PharmacyCategory | undefined });
  return c.json({ pharmacy_chain: profile }, 201);
});
pharmacyChainRoutes.get('/workspace/:workspaceId', async (c) => {
  return c.json({ pharmacy_chain: await new PharmacyChainRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), (c.get('auth') as { tenantId: string }).tenantId) });
});
pharmacyChainRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const profile = await new PharmacyChainRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId);
  if (!profile) return c.json({ error: 'Not found' }, 404);
  return c.json({ pharmacy_chain: profile });
});
pharmacyChainRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new PharmacyChainRepository(c.env.DB);
  const profile = await repo.findProfileById(c.req.param('id'), auth.tenantId);
  if (!profile) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as PharmacyChainFSMState;
  if (!isValidPharmacyChainTransition(profile.status, to)) return c.json({ error: `Invalid FSM transition ${profile.status} → ${to}` }, 422);
  return c.json({ pharmacy_chain: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { pcnLicence: b['pcn_licence'] as string | undefined, nafdacLicence: b['nafdac_licence'] as string | undefined }) });
});
pharmacyChainRoutes.post('/:id/inventory', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new PharmacyChainRepository(c.env.DB);
  try {
    const item = await repo.addDrugInventory(c.req.param('id'), auth.tenantId, { drugName: b['drug_name'] as string, nafdacReg: b['nafdac_reg'] as string | undefined, quantityInStock: b['quantity_in_stock'] as number ?? 0, reorderLevel: b['reorder_level'] as number | undefined, unitPriceKobo: b['unit_price_kobo'] as number, wholesalePriceKobo: b['wholesale_price_kobo'] as number | undefined, expiryDate: b['expiry_date'] as number | undefined, prescriptionRequired: b['prescription_required'] as boolean | undefined });
    return c.json({ item }, 201);
  } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
pharmacyChainRoutes.get('/:id/inventory', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const items = await new PharmacyChainRepository(c.env.DB).listDrugInventory(c.req.param('id'), auth.tenantId);
  return c.json({ inventory: items, count: items.length });
});
pharmacyChainRoutes.post('/:id/sales', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new PharmacyChainRepository(c.env.DB);
  try {
    const sale = await repo.recordSale(c.req.param('id'), auth.tenantId, { drugId: b['drug_id'] as string, clientRefId: b['client_ref_id'] as string | undefined, quantity: b['quantity'] as number, unitPriceKobo: b['unit_price_kobo'] as number, totalKobo: b['total_kobo'] as number, saleDate: b['sale_date'] as number, isPrescription: b['is_prescription'] as boolean | undefined, isWholesale: b['is_wholesale'] as boolean | undefined });
    return c.json({ sale }, 201);
  } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
pharmacyChainRoutes.get('/:id/sales', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const sales = await new PharmacyChainRepository(c.env.DB).listSales(c.req.param('id'), auth.tenantId);
  return c.json({ sales, count: sales.length });
});
