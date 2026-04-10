import { Hono } from 'hono';
import { MotivationalSpeakerRepository, isValidMotivationalSpeakerTransition } from '@webwaka/verticals-motivational-speaker';
import type { MotivationalSpeakerFSMState } from '@webwaka/verticals-motivational-speaker';
import type { Env } from '../../env.js';
export const motivationalSpeakerRoutes = new Hono<{ Bindings: Env }>();
motivationalSpeakerRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['speaker_name']) return c.json({ error: 'workspace_id, speaker_name required' }, 400);
  return c.json({ motivational_speaker: await new MotivationalSpeakerRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, speakerName: b['speaker_name'] as string, cacRc: b['cac_rc'] as string | undefined, associationMembership: b['association_membership'] as string | undefined, niche: b['niche'] as string | undefined }) }, 201);
});
motivationalSpeakerRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ motivational_speaker: await new MotivationalSpeakerRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
motivationalSpeakerRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new MotivationalSpeakerRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ motivational_speaker: p }); });
motivationalSpeakerRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new MotivationalSpeakerRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as MotivationalSpeakerFSMState; if (!isValidMotivationalSpeakerTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ motivational_speaker: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { cacRc: b['cac_rc'] as string | undefined }) });
});
motivationalSpeakerRoutes.post('/:id/engagements', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ engagement: await new MotivationalSpeakerRepository(c.env.DB).createEngagement(c.req.param('id'), auth.tenantId, { clientRefId: b['client_ref_id'] as string, eventType: b['event_type'] as string, eventDate: b['event_date'] as number, venue: b['venue'] as string | undefined, durationHours: b['duration_hours'] as number | undefined, speakingFeeKobo: b['speaking_fee_kobo'] as number, travelAllowanceKobo: b['travel_allowance_kobo'] as number | undefined, depositKobo: b['deposit_kobo'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
motivationalSpeakerRoutes.get('/:id/engagements', async (c) => { const auth = c.get('auth') as { tenantId: string }; const engagements = await new MotivationalSpeakerRepository(c.env.DB).listEngagements(c.req.param('id'), auth.tenantId); return c.json({ engagements, count: engagements.length }); });
motivationalSpeakerRoutes.post('/:id/testimonials', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ testimonial: await new MotivationalSpeakerRepository(c.env.DB).addTestimonial(c.req.param('id'), auth.tenantId, { clientRefId: b['client_ref_id'] as string | undefined, engagementId: b['engagement_id'] as string | undefined, ratingX10: b['rating_x10'] as number | undefined, testimonialText: b['testimonial_text'] as string | undefined, testimonialDate: b['testimonial_date'] as number }) }, 201);
});
motivationalSpeakerRoutes.get('/:id/testimonials', async (c) => { const auth = c.get('auth') as { tenantId: string }; const testimonials = await new MotivationalSpeakerRepository(c.env.DB).listTestimonials(c.req.param('id'), auth.tenantId); return c.json({ testimonials, count: testimonials.length }); });
motivationalSpeakerRoutes.post('/:id/media-products', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ product: await new MotivationalSpeakerRepository(c.env.DB).addMediaProduct(c.req.param('id'), auth.tenantId, { productName: b['product_name'] as string, productType: b['product_type'] as string, priceKobo: b['price_kobo'] as number, salesCount: b['sales_count'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
