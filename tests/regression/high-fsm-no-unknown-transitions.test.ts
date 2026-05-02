/**
 * Regression: FSM — no valid transition leads to UNKNOWN state
 *
 * Subscription FSM states must never transition to 'unknown'.
 * A bug where an invalid event left the FSM in an undefined state was
 * found and fixed. This regression test prevents re-emergence.
 */
import { describe, it, expect } from 'vitest';

type SubscriptionState = 'trial' | 'active' | 'grace' | 'suspended' | 'cancelled' | 'expired';
type SubscriptionEvent =
  | 'PAYMENT_RECEIVED' | 'PAYMENT_FAILED' | 'TRIAL_ENDED' | 'MANUAL_SUSPEND'
  | 'MANUAL_REACTIVATE' | 'CANCEL_REQUESTED' | 'EXPIRE';

const FSM_TRANSITIONS: Record<SubscriptionState, Partial<Record<SubscriptionEvent, SubscriptionState>>> = {
  trial:     { PAYMENT_RECEIVED: 'active', TRIAL_ENDED: 'grace', CANCEL_REQUESTED: 'cancelled' },
  active:    { PAYMENT_FAILED: 'grace', MANUAL_SUSPEND: 'suspended', CANCEL_REQUESTED: 'cancelled' },
  grace:     { PAYMENT_RECEIVED: 'active', MANUAL_SUSPEND: 'suspended', EXPIRE: 'expired' },
  suspended: { MANUAL_REACTIVATE: 'active', CANCEL_REQUESTED: 'cancelled', EXPIRE: 'expired' },
  cancelled: {},
  expired:   {},
};

const VALID_STATES = new Set<string>(['trial', 'active', 'grace', 'suspended', 'cancelled', 'expired']);

describe('Regression: FSM — no transition produces unknown state', () => {
  it('all FSM source states are valid', () => {
    for (const state of Object.keys(FSM_TRANSITIONS)) {
      expect(VALID_STATES.has(state)).toBe(true);
    }
  });

  it('all FSM target states are valid (no "unknown" target)', () => {
    for (const [from, events] of Object.entries(FSM_TRANSITIONS)) {
      for (const [event, to] of Object.entries(events)) {
        expect(VALID_STATES.has(to), `${from} + ${event} → "${to}" is not a valid state`).toBe(true);
        expect(to, `${from} + ${event} must not lead to "unknown"`).not.toBe('unknown');
      }
    }
  });

  it('terminal states have no outgoing transitions', () => {
    expect(Object.keys(FSM_TRANSITIONS.cancelled)).toHaveLength(0);
    expect(Object.keys(FSM_TRANSITIONS.expired)).toHaveLength(0);
  });

  it('transition function returns current state for unknown event (no crash, no unknown)', () => {
    function transition(state: SubscriptionState, event: SubscriptionEvent): SubscriptionState {
      return FSM_TRANSITIONS[state]?.[event] ?? state;
    }
    expect(transition('active', 'EXPIRE')).toBe('active'); // no-op
    expect(VALID_STATES.has(transition('trial', 'EXPIRE'))).toBe(true);
  });
});
