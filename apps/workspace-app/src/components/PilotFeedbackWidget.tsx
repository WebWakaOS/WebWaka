/**
 * PilotFeedbackWidget — FE-PILOT-01
 *
 * NPS-style feedback widget for pilot operator tenants.
 * Renders a floating prompt triggered by:
 *   1. `trigger="first_txn"` — shown once after first successful transaction
 *   2. `trigger="periodic"`  — shown every 30 days for active operators
 *
 * Architecture:
 *   - Stores dismissal/submission timestamps in localStorage per tenantId
 *   - Submits to POST /workspace/feedback (pilot-feedback-route.ts)
 *   - Respects user's "not now" — backs off for 7 days before re-prompting
 *   - Fully inline styles (no Tailwind dependency in workspace-app)
 *
 * Usage:
 *   import { PilotFeedbackWidget } from '@/components/PilotFeedbackWidget';
 *   <PilotFeedbackWidget trigger="first_txn" workspaceId={workspaceId} />
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export type FeedbackTrigger = 'first_txn' | 'periodic';

interface PilotFeedbackWidgetProps {
  trigger: FeedbackTrigger;
  workspaceId: string;
  /** Optional: called when user submits or permanently dismisses */
  onDone?: () => void;
}

interface SubmitPayload {
  workspace_id: string;
  nps_score: number;
  comments: string;
  trigger: FeedbackTrigger;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PERIODIC_INTERVAL_MS  = 30 * 24 * 60 * 60 * 1000;  // 30 days
const SNOOZE_INTERVAL_MS    =  7 * 24 * 60 * 60 * 1000;  //  7 days

function storageKey(workspaceId: string, suffix: string) {
  return `pilot_feedback_${workspaceId}_${suffix}`;
}

function shouldShow(trigger: FeedbackTrigger, workspaceId: string): boolean {
  const now = Date.now();
  const submitted = localStorage.getItem(storageKey(workspaceId, 'submitted_at'));
  const snoozed   = localStorage.getItem(storageKey(workspaceId, 'snoozed_at'));

  // Never re-show if already submitted in this trigger window
  if (trigger === 'first_txn') {
    return submitted === null;
  }

  // Periodic: show if not submitted in last 30 days and not snoozed in last 7 days
  if (submitted && now - Number(submitted) < PERIODIC_INTERVAL_MS) return false;
  if (snoozed   && now - Number(snoozed)   < SNOOZE_INTERVAL_MS)   return false;
  return true;
}

// ─── NPS Score Button ─────────────────────────────────────────────────────────

function ScoreButton({
  score,
  selected,
  onClick,
}: {
  score: number;
  selected: boolean;
  onClick: (n: number) => void;
}) {
  const color = score <= 6 ? '#ef4444' : score <= 8 ? '#f59e0b' : '#22c55e';
  return (
    <button
      onClick={() => onClick(score)}
      aria-label={`NPS score ${score}`}
      aria-pressed={selected}
      style={{
        width: 36,
        height: 36,
        borderRadius: 6,
        border: selected ? `2px solid ${color}` : '2px solid #374151',
        background: selected ? color : '#1f2937',
        color: selected ? '#fff' : '#9ca3af',
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {score}
    </button>
  );
}

// ─── Widget ───────────────────────────────────────────────────────────────────

export function PilotFeedbackWidget({ trigger, workspaceId, onDone }: PilotFeedbackWidgetProps) {
  const [visible, setVisible] = useState(false);
  const [score, setScore]     = useState<number | null>(null);
  const [comments, setComments] = useState('');
  const [status, setStatus]   = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    // Small delay so it doesn't flash on page load
    const t = setTimeout(() => {
      if (mountedRef.current && shouldShow(trigger, workspaceId)) {
        setVisible(true);
      }
    }, trigger === 'first_txn' ? 2000 : 5000);
    return () => {
      clearTimeout(t);
      mountedRef.current = false;
    };
  }, [trigger, workspaceId]);

  const handleSnooze = useCallback(() => {
    localStorage.setItem(storageKey(workspaceId, 'snoozed_at'), String(Date.now()));
    setVisible(false);
    onDone?.();
  }, [workspaceId, onDone]);

  const handleSubmit = useCallback(async () => {
    if (score === null) return;
    setStatus('submitting');
    try {
      const payload: SubmitPayload = {
        workspace_id: workspaceId,
        nps_score: score,
        comments: comments.trim(),
        trigger,
      };
      await api.post('/workspace/feedback', payload);
      localStorage.setItem(storageKey(workspaceId, 'submitted_at'), String(Date.now()));
      if (mountedRef.current) setStatus('success');
      setTimeout(() => {
        if (mountedRef.current) {
          setVisible(false);
          onDone?.();
        }
      }, 2200);
    } catch (err: unknown) {
      if (mountedRef.current) {
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'Submission failed — please try again');
      }
    }
  }, [score, comments, workspaceId, trigger, onDone]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share your feedback"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        width: 360,
        background: '#111827',
        border: '1px solid #1f2937',
        borderRadius: 12,
        padding: '20px 24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        color: '#e5e7eb',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f9fafb', lineHeight: 1.3 }}>
            How's WebWaka working for you?
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            Your feedback shapes what we build next.
          </div>
        </div>
        <button
          onClick={handleSnooze}
          aria-label="Not now"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: 18, lineHeight: 1, padding: '2px 4px',
          }}
        >
          ×
        </button>
      </div>

      {status === 'success' ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🙏</div>
          <div style={{ fontSize: 14, color: '#22c55e', fontWeight: 600 }}>Thank you! Your feedback helps us improve.</div>
        </div>
      ) : (
        <>
          {/* NPS prompt */}
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>
            On a scale of 0–10, how likely are you to recommend WebWaka to another business owner?
          </div>

          {/* Score buttons */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
            {Array.from({ length: 11 }, (_, i) => (
              <ScoreButton key={i} score={i} selected={score === i} onClick={setScore} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 14 }}>
            <span>Not likely at all</span>
            <span>Extremely likely</span>
          </div>

          {/* Comments */}
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder="Any specific feedback? (optional)"
            maxLength={500}
            rows={3}
            style={{
              width: '100%',
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: 6,
              color: '#e5e7eb',
              fontSize: 13,
              padding: '8px 10px',
              resize: 'vertical',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />

          {/* Error */}
          {status === 'error' && (
            <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>{errorMsg}</div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <button
              onClick={handleSnooze}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: '#6b7280', padding: 0,
              }}
            >
              Not now
            </button>
            <button
              onClick={handleSubmit}
              disabled={score === null || status === 'submitting'}
              style={{
                background: score === null ? '#374151' : '#0F4C81',
                color: score === null ? '#6b7280' : '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: score === null ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {status === 'submitting' ? 'Sending…' : 'Submit'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
