-- infra/db/migrations/0029_community_events.sql

CREATE TABLE IF NOT EXISTS community_events (
  id              TEXT NOT NULL PRIMARY KEY,
  community_id    TEXT NOT NULL REFERENCES community_spaces(id),
  title           TEXT NOT NULL,
  description     TEXT,
  type            TEXT NOT NULL DEFAULT 'live'
                  CHECK (type IN ('live', 'recorded', 'in_person')),
  starts_at       INTEGER NOT NULL,
  ends_at         INTEGER,
  location        TEXT,                     -- URL or physical address
  ticket_price_kobo INTEGER NOT NULL DEFAULT 0 CHECK (ticket_price_kobo >= 0),
  max_attendees   INTEGER,
  rsvp_count      INTEGER NOT NULL DEFAULT 0,
  access_tier_id  TEXT REFERENCES membership_tiers(id),
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_event_community ON community_events(community_id, starts_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_tenant ON community_events(tenant_id);

CREATE TABLE IF NOT EXISTS event_rsvps (
  id              TEXT NOT NULL PRIMARY KEY,
  event_id        TEXT NOT NULL REFERENCES community_events(id),
  user_id         TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'going'
                  CHECK (status IN ('going', 'maybe', 'not_going')),
  payment_ref     TEXT,                     -- Paystack reference for paid events
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rsvp_unique ON event_rsvps(event_id, user_id);
