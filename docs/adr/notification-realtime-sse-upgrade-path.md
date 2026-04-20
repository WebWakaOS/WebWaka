# ADR N-067a — Notification Realtime: SSE Upgrade Path

**Status**: Proposed  
**Date**: 2026-04-20  
**Authors**: Platform Engineering  
**Spec**: WebWaka Notification Engine v2.1 §N-067a  

---

## Context

Phase 5 implements notification delivery to users' in-app inboxes via a **30-second polling** strategy (`useNotificationPoll`).  Polling is simple to implement, operationally predictable, and sufficient for Phase 5 scale (hundreds of concurrent sessions per tenant).

As usage scales — and particularly as the in-app inbox becomes a primary workspace interaction surface — the polling latency (up to 30 s) and unnecessary network requests will degrade user experience.

This ADR documents the agreed upgrade path to **Server-Sent Events (SSE)** and the considerations that informed this choice over WebSocket or long-poll alternatives.

---

## Options Considered

### Option A — Keep polling (Phase 5 baseline)

- Simple, stateless, easy to operate on Cloudflare Workers.
- Each browser tab polls `GET /notifications/inbox/unread-count` every 30 s.
- At 1,000 concurrent tabs: ~2,000 requests/min to D1/KV (mitigated by KV cache).
- Latency: up to 30 s for notification to appear.

**Verdict**: Acceptable for Phase 5. Not acceptable at Phase 8 scale.

### Option B — WebSocket (bidirectional)

- WebSocket requires a **persistent TCP connection**.
- Cloudflare Workers support WebSocket via **Durable Objects** (`WebSocketHibernationAPI`).
- Enables bidirectional messaging (useful for chat, collaborative editing).
- Operational complexity: Durable Object per tenant to broadcast events; requires `wrangler.toml` DO bindings.
- Cost: DO CPU billing per active connection.
- **Over-engineered** for unidirectional notification delivery.

**Verdict**: Not selected for notifications. Appropriate for Phase 9+ (chat).

### Option C — Server-Sent Events over Cloudflare Workers (selected)

- SSE is **unidirectional** (server → client) over a persistent HTTP/2 stream.
- Cloudflare Workers support SSE natively (streaming `Response` with `TransformStream`).
- **No Durable Objects required** for per-connection delivery.  A Durable Object (or Queue consumer) pushes to the SSE stream via a shared broadcast mechanism.
- Clients reconnect automatically (`EventSource` built-in retry).
- Firewall/proxy friendly (HTTP/1.1 compatible; standard `text/event-stream` MIME).
- Works in all browsers supporting `EventSource` (all modern browsers; Safari since 6).

**Verdict**: Selected for Phase 8 realtime upgrade.

---

## Decision

> **Phase 8 will replace polling with SSE for in-app notification delivery.**

Architecture:

```
CF Queue consumer (apps/notificator)
         │
         │  after processEvent writes notification_inbox_item
         │
         ▼
  Durable Object: NotificationBroadcast (1 per tenant)
         │  send event to all connected EventSource streams
         ▼
  GET /notifications/sse  (apps/api)
     Content-Type: text/event-stream
     Transfer-Encoding: chunked
         │
         ▼
  useNotificationSSE() hook (workspace-app)
     replaces useNotificationPoll()
```

### SSE event format

```
id: {deliveryId}
event: notification
data: {"type":"new_item","unreadCount":3,"item":{"id":"...","title":"...","severity":"info"}}

event: count_update
data: {"unreadCount":3}
```

### Cloudflare Workers implementation

SSE on CF Workers uses a `TransformStream`:

```typescript
// apps/api/src/routes/sse-routes.ts
app.get('/notifications/sse', authMiddleware, async (c) => {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Register writer with tenant's NotificationBroadcast Durable Object
  const id = c.env.NOTIFICATION_BROADCAST.idFromName(c.get('auth').tenantId);
  const stub = c.env.NOTIFICATION_BROADCAST.get(id);
  await stub.registerStream(writer, c.get('auth').userId);

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
});
```

### Durable Object: NotificationBroadcast

```typescript
// packages/notifications/src/broadcast-do.ts
export class NotificationBroadcastDO implements DurableObject {
  private streams = new Map<string, WritableStreamDefaultWriter>();

  async registerStream(writer: WritableStreamDefaultWriter, userId: string) {
    this.streams.set(userId, writer);
  }

  async broadcast(userId: string, event: string) {
    const writer = this.streams.get(userId);
    if (!writer) return;
    const encoder = new TextEncoder();
    await writer.write(encoder.encode(`event: notification\ndata: ${event}\n\n`));
  }
}
```

### Client hook

```typescript
// apps/workspace-app/src/hooks/useNotificationSSE.ts
export function useNotificationSSE() {
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    const es = new EventSource('/notifications/sse', { withCredentials: true });
    es.addEventListener('count_update', (e) => {
      const data = JSON.parse(e.data);
      setUnreadCount(data.unreadCount);
    });
    return () => es.close();
  }, []);
  return { unreadCount };
}
```

---

## Migration Plan (Phase 8)

| Step | Action |
|------|--------|
| 8.1 | Provision `NotificationBroadcast` Durable Object in `wrangler.toml` |
| 8.2 | Implement `apps/api/src/routes/sse-routes.ts` (streaming endpoint) |
| 8.3 | Implement `broadcast-do.ts` in packages/notifications |
| 8.4 | Wire `apps/notificator` consumer to call `stub.broadcast()` after `processEvent()` |
| 8.5 | Implement `useNotificationSSE()` in workspace-app |
| 8.6 | A/B roll-out: feature flag `NOTIFICATION_REALTIME=sse` in `NOTIFICATION_KV` |
| 8.7 | Deprecate `useNotificationPoll()` (keep for mobile low-data fallback) |

---

## Consequences

- **Positive**: Sub-second notification delivery; eliminates polling load on D1/KV.
- **Positive**: Native `EventSource` retry is free; no reconnect logic in application code.
- **Positive**: No additional CF pricing tier required (SSE runs on same Worker CPU budget as standard HTTP).
- **Negative**: Requires one Durable Object class + namespace binding; marginal operational overhead.
- **Negative**: SSE requires HTTP/2 for multiplexing; HTTP/1.1 connections are limited by browser per-host stream limits (6 on Chrome). Must verify CF Workers HTTP/2 support per environment.
- **Mitigated**: Low-data mode users stay on polling (`useNotificationPoll`, 120 s interval) — SSE is opt-in via feature flag.

---

## References

- Cloudflare Workers Streaming: https://developers.cloudflare.com/workers/runtime-apis/streams/
- Cloudflare Durable Objects WebSocket Hibernation: https://developers.cloudflare.com/durable-objects/api/hibernatable-websockets-api/
- MDN EventSource: https://developer.mozilla.org/en-US/docs/Web/API/EventSource
- Spec §N-067: Inbox SSE upgrade path
- Spec §G11: CF Queue delay for deferred delivery (quiet hours)
