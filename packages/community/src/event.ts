/**
 * Community event management + RSVP.
 * (Platform Invariants T3 — tenant isolation, T4 — integer kobo)
 */

import type { CommunityEvent, EventRSVP } from './types.js';
import type { D1Like } from './community-space.js';

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
}

interface EventRow {
  id: string;
  community_id: string;
  title: string;
  description: string | null;
  type: string;
  starts_at: number;
  ends_at: number | null;
  location: string | null;
  ticket_price_kobo: number;
  max_attendees: number | null;
  rsvp_count: number;
  access_tier_id: string | null;
  tenant_id: string;
  created_at: number;
}

interface RSVPRow {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  payment_ref: string | null;
  tenant_id: string;
  created_at: number;
}

function rowToEvent(row: EventRow): CommunityEvent {
  return {
    id: row.id,
    communityId: row.community_id,
    title: row.title,
    description: row.description,
    type: row.type as CommunityEvent['type'],
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location,
    ticketPriceKobo: row.ticket_price_kobo,
    maxAttendees: row.max_attendees,
    rsvpCount: row.rsvp_count,
    accessTierId: row.access_tier_id,
    tenantId: row.tenant_id,
    createdAt: row.created_at,
  };
}

function rowToRSVP(row: RSVPRow): EventRSVP {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    status: row.status as EventRSVP['status'],
    paymentRef: row.payment_ref,
    tenantId: row.tenant_id,
    createdAt: row.created_at,
  };
}

/**
 * Create a community event.
 * T4 — ticketPriceKobo must be a non-negative integer.
 */
export async function createEvent(
  db: D1Like,
  input: {
    communityId: string;
    title: string;
    description?: string;
    type: 'live' | 'recorded' | 'in_person';
    startsAt: number;
    endsAt?: number;
    location?: string;
    ticketPriceKobo?: number;
    maxAttendees?: number;
    accessTierId?: string;
    tenantId: string;
  },
): Promise<CommunityEvent> {
  const priceKobo = input.ticketPriceKobo ?? 0;
  if (!Number.isInteger(priceKobo) || priceKobo < 0) {
    throw new TypeError('ticketPriceKobo must be a non-negative integer (T4)');
  }

  const id = generateId('evt');
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `INSERT INTO community_events (id, community_id, title, description, type, starts_at, ends_at, location, ticket_price_kobo, max_attendees, rsvp_count, access_tier_id, tenant_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    )
    .bind(
      id, input.communityId, input.title, input.description ?? null,
      input.type, input.startsAt, input.endsAt ?? null,
      input.location ?? null, priceKobo,
      input.maxAttendees ?? null, input.accessTierId ?? null,
      input.tenantId, now,
    )
    .run();

  return {
    id,
    communityId: input.communityId,
    title: input.title,
    description: input.description ?? null,
    type: input.type,
    startsAt: input.startsAt,
    endsAt: input.endsAt ?? null,
    location: input.location ?? null,
    ticketPriceKobo: priceKobo,
    maxAttendees: input.maxAttendees ?? null,
    rsvpCount: 0,
    accessTierId: input.accessTierId ?? null,
    tenantId: input.tenantId,
    createdAt: now,
  };
}

/**
 * List upcoming events for a community.
 */
export async function listEvents(
  db: D1Like,
  communityId: string,
  tenantId: string,
  limit = 20,
): Promise<CommunityEvent[]> {
  const now = Math.floor(Date.now() / 1000);
  const { results } = await db
    .prepare(
      `SELECT * FROM community_events WHERE community_id = ? AND tenant_id = ? AND starts_at >= ?
       ORDER BY starts_at ASC LIMIT ?`,
    )
    .bind(communityId, tenantId, now, limit)
    .all<EventRow>();
  return results.map(rowToEvent);
}

/**
 * Get a single event.
 */
export async function getEvent(
  db: D1Like,
  eventId: string,
  tenantId: string,
): Promise<CommunityEvent | null> {
  const row = await db
    .prepare(`SELECT * FROM community_events WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(eventId, tenantId)
    .first<EventRow>();
  return row ? rowToEvent(row) : null;
}

/**
 * RSVP to an event.
 * Stubs Paystack payment call for paid events (payment integration exists in @webwaka/payments).
 */
export async function rsvpEvent(
  db: D1Like,
  input: {
    eventId: string;
    userId: string;
    status: 'going' | 'maybe' | 'not_going';
    paymentRef?: string;
    tenantId: string;
  },
): Promise<EventRSVP> {
  const event = await db
    .prepare(`SELECT id, max_attendees, rsvp_count, ticket_price_kobo FROM community_events WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(input.eventId, input.tenantId)
    .first<{ id: string; max_attendees: number | null; rsvp_count: number; ticket_price_kobo: number }>();

  if (!event) throw new Error(`Event not found: ${input.eventId}`);

  if (event.max_attendees !== null && event.rsvp_count >= event.max_attendees && input.status === 'going') {
    throw new Error('EVENT_FULL: Maximum attendees reached');
  }

  if (event.ticket_price_kobo > 0 && !input.paymentRef && input.status === 'going') {
    throw new Error('PAYMENT_REQUIRED: Paid event requires a payment reference (use @webwaka/payments)');
  }

  const id = generateId('rsvp');
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT INTO event_rsvps (id, event_id, user_id, status, payment_ref, tenant_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(event_id, user_id) DO UPDATE SET status = excluded.status`,
    )
    .bind(id, input.eventId, input.userId, input.status, input.paymentRef ?? null, input.tenantId, now)
    .run();

  if (input.status === 'going') {
    await db
      .prepare(`UPDATE community_events SET rsvp_count = rsvp_count + 1 WHERE id = ? AND tenant_id = ?`)
      .bind(input.eventId, input.tenantId)
      .run();
  }

  return {
    id,
    eventId: input.eventId,
    userId: input.userId,
    status: input.status,
    paymentRef: input.paymentRef ?? null,
    tenantId: input.tenantId,
    createdAt: now,
  };
}
