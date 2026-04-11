import { Hono } from 'hono';
import { MinistryMissionRepository, isValidMinistryMissionTransition } from '@webwaka/verticals-ministry-mission';
import type { MinistryMissionFSMState } from '@webwaka/verticals-ministry-mission';
import type { Env } from '../../env.js';
export const ministryMissionRoutes = new Hono<{ Bindings: Env }>();
ministryMissionRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['ministry_name']) return c.json({ error: 'workspace_id, ministry_name required' }, 400);
  return c.json({ ministry_mission: await new MinistryMissionRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, ministryName: b['ministry_name'] as string, cacScn: b['cac_scn'] as string | undefined, tinRef: b['tin_ref'] as string | undefined, denomination: b['denomination'] as string | undefined, state: b['state'] as string | undefined, lga: b['lga'] as string | undefined }) }, 201);
});
ministryMissionRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ ministry_mission: await new MinistryMissionRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
ministryMissionRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new MinistryMissionRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ ministry_mission: p }); });
ministryMissionRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new MinistryMissionRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as MinistryMissionFSMState; if (!isValidMinistryMissionTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ ministry_mission: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { cacScn: b['cac_scn'] as string | undefined }) });
});
ministryMissionRoutes.post('/:id/events', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ event: await new MinistryMissionRepository(c.env.DB).createEvent(c.req.param('id'), auth.tenantId, { eventName: b['event_name'] as string, eventDate: b['event_date'] as number, venue: b['venue'] as string | undefined, expectedAttendance: b['expected_attendance'] as number | undefined, budgetKobo: b['budget_kobo'] as number | undefined, offeringCollectedKobo: b['offering_collected_kobo'] as number | undefined }) }, 201);
});
ministryMissionRoutes.get('/:id/events', async (c) => { const auth = c.get('auth') as { tenantId: string }; const events = await new MinistryMissionRepository(c.env.DB).listEvents(c.req.param('id'), auth.tenantId); return c.json({ events, count: events.length }); });
ministryMissionRoutes.post('/:id/members', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ member: await new MinistryMissionRepository(c.env.DB).addMember(c.req.param('id'), auth.tenantId, { memberRefId: b['member_ref_id'] as string, role: b['role'] as string | undefined, joinDate: b['join_date'] as number | undefined }) }, 201);
});
ministryMissionRoutes.get('/:id/members', async (c) => { const auth = c.get('auth') as { tenantId: string }; const members = await new MinistryMissionRepository(c.env.DB).listMembers(c.req.param('id'), auth.tenantId); return c.json({ members, count: members.length }); });
ministryMissionRoutes.post('/:id/donations', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ donation: await new MinistryMissionRepository(c.env.DB).recordDonation(c.req.param('id'), auth.tenantId, { donorRefId: b['donor_ref_id'] as string | undefined, donationType: b['donation_type'] as string, amountKobo: b['amount_kobo'] as number, donationDate: b['donation_date'] as number, notes: b['notes'] as string | undefined }) }, 201);
});
ministryMissionRoutes.get('/:id/donations', async (c) => { const auth = c.get('auth') as { tenantId: string }; const donations = await new MinistryMissionRepository(c.env.DB).listDonations(c.req.param('id'), auth.tenantId); return c.json({ donations, count: donations.length }); });
